using TodoApp.Interfaces.Dtos;
using TodoApp.Interfaces.Repositories;
using TodoApp.Interfaces.Services;
using TodoApp.Services.Auth;

namespace TodoApp.Services;

public sealed class AuthService(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService) : IAuthService
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

        return AuthOperationResult.Success(CreateAuthResponse(user));
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

        return AuthOperationResult.Success(CreateAuthResponse(user));
    }

    public async Task<UserDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken);

        return user is null ? null : ToUserDto(user);
    }

    private AuthResponseDto CreateAuthResponse(AuthUserRecord user)
    {
        var token = jwtTokenService.CreateToken(user);

        return new AuthResponseDto(
            token.Token,
            "Bearer",
            token.ExpiresAt,
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
