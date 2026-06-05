using Microsoft.EntityFrameworkCore;
using TodoApp.DataAccess.Entities;
using TodoApp.DataAccess.Persistence;
using TodoApp.Interfaces.Repositories;

namespace TodoApp.DataAccess.Repositories;

public class UserRepository(TodoAppDbContext dbContext) : IUserRepository
{
    public async Task<AuthUserRecord?> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(email);

        return await dbContext.Users
            .AsNoTracking()
            .Where(user => user.Email == normalizedEmail)
            .Select(user => ToAuthUserRecord(user))
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<AuthUserRecord?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == id)
            .Select(user => ToAuthUserRecord(user))
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<AuthUserRecord> CreateAsync(
        CreateUserRecord user,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(user.Email);
        var now = DateTimeOffset.UtcNow;
        var entity = new User
        {
            Email = normalizedEmail,
            PasswordHash = user.PasswordHash,
            DisplayName = user.DisplayName.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.Users.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToAuthUserRecord(entity);
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }

    private static AuthUserRecord ToAuthUserRecord(User user)
    {
        return new AuthUserRecord(
            user.Id,
            user.Email,
            user.PasswordHash,
            user.DisplayName,
            user.CreatedAt,
            user.UpdatedAt);
    }
}
