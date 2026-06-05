using TodoApp.Interfaces.Dtos;

namespace TodoApp.Interfaces.Services;

public interface IAuthService
{
    Task<AuthOperationResult> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken);

    Task<AuthOperationResult> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken);

    Task<UserDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken);
}
