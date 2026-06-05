using System.ComponentModel.DataAnnotations;

namespace TodoApp.Interfaces.Dtos;

public sealed record CreateTaskItemDto(
    Guid? CategoryId,
    [property: Required]
    [property: MaxLength(200)]
    string Title,
    [property: MaxLength(2000)]
    string? Description,
    DateTimeOffset? DueAt);
