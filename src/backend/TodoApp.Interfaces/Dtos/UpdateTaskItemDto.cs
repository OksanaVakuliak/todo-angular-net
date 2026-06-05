using System.ComponentModel.DataAnnotations;

namespace TodoApp.Interfaces.Dtos;

public sealed record UpdateTaskItemDto(
    Guid? CategoryId,
    [Required]
    [MaxLength(200)]
    string Title,
    [MaxLength(2000)]
    string? Description,
    bool IsCompleted,
    DateTimeOffset? DueAt);
