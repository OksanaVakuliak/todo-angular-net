namespace TodoApp.Interfaces.Dtos;

public sealed record CreateTaskItemDto(
    Guid? CategoryId,
    string Title,
    string? Description,
    DateTimeOffset? DueAt);
