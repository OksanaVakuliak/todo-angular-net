namespace TodoApp.Interfaces.Dtos;

public sealed record CategoryDto(
    Guid Id,
    Guid UserId,
    string Name,
    string? Color,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
