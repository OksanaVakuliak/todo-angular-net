namespace TodoApp.Interfaces.Repositories;

public sealed record UpdateTaskItemRecord(
    Guid? CategoryId,
    string Title,
    string? Description,
    bool IsCompleted,
    DateTimeOffset? DueAt);
