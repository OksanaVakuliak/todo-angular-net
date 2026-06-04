namespace TodoApp.Interfaces.Dtos;

public sealed record TaskItemDto(
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
