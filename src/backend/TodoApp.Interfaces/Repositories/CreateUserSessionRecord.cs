namespace TodoApp.Interfaces.Repositories;

public sealed record CreateUserSessionRecord(
    Guid UserId,
    string RefreshTokenHash,
    DateTimeOffset ExpiresAt);
