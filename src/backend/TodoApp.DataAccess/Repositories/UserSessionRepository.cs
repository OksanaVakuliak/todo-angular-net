using Microsoft.EntityFrameworkCore;
using TodoApp.DataAccess.Entities;
using TodoApp.DataAccess.Persistence;
using TodoApp.Interfaces.Repositories;

namespace TodoApp.DataAccess.Repositories;

public class UserSessionRepository(TodoAppDbContext dbContext) : IUserSessionRepository
{
    public async Task<UserSessionRecord> CreateAsync(
        CreateUserSessionRecord session,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var entity = new UserSession
        {
            UserId = session.UserId,
            RefreshTokenHash = session.RefreshTokenHash,
            CreatedAt = now,
            ExpiresAt = session.ExpiresAt
        };

        dbContext.UserSessions.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToRecord(entity);
    }

    public async Task<UserSessionRecord?> GetByRefreshTokenHashAsync(
        string refreshTokenHash,
        CancellationToken cancellationToken)
    {
        return await dbContext.UserSessions
            .AsNoTracking()
            .Where(session => session.RefreshTokenHash == refreshTokenHash)
            .Select(session => ToRecord(session))
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task RevokeAsync(
        Guid sessionId,
        Guid? replacedBySessionId,
        DateTimeOffset revokedAt,
        CancellationToken cancellationToken)
    {
        var session = await dbContext.UserSessions
            .SingleOrDefaultAsync(session => session.Id == sessionId, cancellationToken);

        if (session is null)
        {
            return;
        }

        session.RevokedAt = revokedAt;
        session.ReplacedBySessionId = replacedBySessionId;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static UserSessionRecord ToRecord(UserSession session)
    {
        return new UserSessionRecord(
            session.Id,
            session.UserId,
            session.RefreshTokenHash,
            session.CreatedAt,
            session.ExpiresAt,
            session.RevokedAt,
            session.ReplacedBySessionId);
    }
}
