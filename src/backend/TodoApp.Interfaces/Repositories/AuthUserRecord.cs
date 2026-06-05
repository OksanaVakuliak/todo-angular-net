namespace TodoApp.Interfaces.Repositories;

public sealed record AuthUserRecord(
    Guid Id,
    string Email,
    string PasswordHash,
    string DisplayName,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
