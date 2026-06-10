namespace TodoApp.Interfaces.Repositories;

public sealed record CategoryRecord(
    Guid Id,
    Guid UserId,
    string Name,
    string? Color,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
