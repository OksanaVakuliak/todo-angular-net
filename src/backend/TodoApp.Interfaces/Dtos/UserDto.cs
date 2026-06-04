namespace TodoApp.Interfaces.Dtos;

public sealed record UserDto(
    Guid Id,
    string Email,
    string DisplayName,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
