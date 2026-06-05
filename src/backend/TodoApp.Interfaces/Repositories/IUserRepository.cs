namespace TodoApp.Interfaces.Repositories;

public interface IUserRepository
{
    Task<AuthUserRecord?> GetByEmailAsync(string email, CancellationToken cancellationToken);

    Task<AuthUserRecord?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<AuthUserRecord> CreateAsync(CreateUserRecord user, CancellationToken cancellationToken);
}
