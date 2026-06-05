using TodoApp.Interfaces.Dtos;
using TodoApp.Interfaces.Repositories;
using TodoApp.Interfaces.Services;
using TodoApp.Services.Auth;

namespace TodoApp.Services;

public sealed class AuthService(
    IUserRepository userRepository,
    IUserSessionRepository userSessionRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService,
    IRefreshTokenService refreshTokenService) : IAuthService
{
    public async Task<AuthOperationResult> RegisterAsync(
        RegisterRequestDto request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existingUser = await userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (existingUser is not null)
        {
            return AuthOperationResult.Failure("email_already_registered", "Email is already registered.");
        }

        var user = await userRepository.CreateAsync(
            new CreateUserRecord(
                normalizedEmail,
                passwordHasher.Hash(request.Password),
                request.DisplayName),
            cancellationToken);

        var authSession = await CreateAuthSessionAsync(user, cancellationToken);

        return AuthOperationResult.Success(authSession.Response);
    }

    public async Task<AuthOperationResult> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return AuthOperationResult.Failure("invalid_credentials", "Email or password is invalid.");
        }

        var authSession = await CreateAuthSessionAsync(user, cancellationToken);

        return AuthOperationResult.Success(authSession.Response);
    }

    public async Task<AuthOperationResult> RefreshAsync(
        string refreshToken,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return AuthOperationResult.Failure("refresh_token_missing", "Refresh token is missing.");
        }

        var refreshTokenHash = refreshTokenService.Hash(refreshToken);
        var session = await userSessionRepository.GetByRefreshTokenHashAsync(
            refreshTokenHash,
            cancellationToken);

        if (session is null || session.RevokedAt is not null || session.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            return AuthOperationResult.Failure("refresh_token_invalid", "Refresh token is invalid.");
        }

        var user = await userRepository.GetByIdAsync(session.UserId, cancellationToken);

        if (user is null)
        {
            return AuthOperationResult.Failure("user_not_found", "User was not found.");
        }

        var authSession = CreateAuthResponse(user);
        var replacementSession = await userSessionRepository.RotateAsync(
            session.Id,
            new CreateUserSessionRecord(
                user.Id,
                refreshTokenService.Hash(authSession.RefreshToken),
                authSession.RefreshTokenExpiresAt),
            DateTimeOffset.UtcNow,
            cancellationToken);

        if (replacementSession is null)
        {
            return AuthOperationResult.Failure("refresh_token_invalid", "Refresh token is invalid.");
        }

        return AuthOperationResult.Success(authSession);
    }

    public async Task LogoutAsync(string? refreshToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        var session = await userSessionRepository.GetByRefreshTokenHashAsync(
            refreshTokenService.Hash(refreshToken),
            cancellationToken);

        if (session is null || session.RevokedAt is not null)
        {
            return;
        }

        await userSessionRepository.RevokeAsync(
            session.Id,
            null,
            DateTimeOffset.UtcNow,
            cancellationToken);
    }

    public async Task<UserDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken);

        return user is null ? null : ToUserDto(user);
    }

    private async Task<(AuthResponseDto Response, UserSessionRecord Session)> CreateAuthSessionAsync(
        AuthUserRecord user,
        CancellationToken cancellationToken)
    {
        var response = CreateAuthResponse(user);

        var session = await userSessionRepository.CreateAsync(
            new CreateUserSessionRecord(
                user.Id,
                refreshTokenService.Hash(response.RefreshToken),
                response.RefreshTokenExpiresAt),
            cancellationToken);

        return (response, session);
    }

    private AuthResponseDto CreateAuthResponse(AuthUserRecord user)
    {
        var accessToken = jwtTokenService.CreateToken(user);
        var refreshToken = refreshTokenService.CreateToken();
        var refreshTokenExpiresAt = DateTimeOffset.UtcNow.AddDays(jwtTokenService.GetRefreshTokenDays());

        return new AuthResponseDto(
            accessToken.Token,
            refreshToken,
            accessToken.ExpiresAt,
            refreshTokenExpiresAt,
            ToUserDto(user));
    }

    private static UserDto ToUserDto(AuthUserRecord user)
    {
        return new UserDto(
            user.Id,
            user.Email,
            user.DisplayName,
            user.CreatedAt,
            user.UpdatedAt);
    }
}
