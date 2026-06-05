namespace TodoApp.Interfaces.Repositories;

public sealed record TaskItemRecord(
    Guid Id,
    Guid UserId,
    Guid? CategoryId,
    string? CategoryName,
    string Title,
    string? Description,
    bool IsCompleted,
    DateTimeOffset? DueAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
