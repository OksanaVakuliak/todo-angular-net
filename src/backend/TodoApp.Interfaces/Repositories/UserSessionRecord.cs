namespace TodoApp.Interfaces.Repositories;

public sealed record UserSessionRecord(
    Guid Id,
    Guid UserId,
    string RefreshTokenHash,
    DateTimeOffset CreatedAt,
    DateTimeOffset ExpiresAt,
    DateTimeOffset? RevokedAt,
    Guid? ReplacedBySessionId);
