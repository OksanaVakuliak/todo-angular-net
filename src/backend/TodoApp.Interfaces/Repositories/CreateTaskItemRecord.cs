namespace TodoApp.Interfaces.Repositories;

public sealed record CreateTaskItemRecord(
    Guid UserId,
    Guid? CategoryId,
    string Title,
    string? Description,
    DateTimeOffset? DueAt);
