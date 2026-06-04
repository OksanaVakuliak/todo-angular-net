namespace TodoApp.Interfaces.Dtos;

public sealed record UpdateTaskItemDto(
    Guid? CategoryId,
    string Title,
    string? Description,
    bool IsCompleted,
    DateTimeOffset? DueAt);
