namespace TodoApp.Interfaces.Repositories;

public interface IUserSessionRepository
{
    Task<UserSessionRecord> CreateAsync(
        CreateUserSessionRecord session,
        CancellationToken cancellationToken);

    Task<UserSessionRecord?> GetByRefreshTokenHashAsync(
        string refreshTokenHash,
        CancellationToken cancellationToken);

    Task RevokeAsync(
        Guid sessionId,
        Guid? replacedBySessionId,
        DateTimeOffset revokedAt,
        CancellationToken cancellationToken);
}
