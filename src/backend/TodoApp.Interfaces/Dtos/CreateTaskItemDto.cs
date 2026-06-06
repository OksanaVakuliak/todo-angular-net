using System.ComponentModel.DataAnnotations;
using TodoApp.Interfaces.Validation;

namespace TodoApp.Interfaces.Dtos;

public sealed record CreateTaskItemDto(
    Guid? CategoryId,

    [RequiredNonWhiteSpace(ErrorMessage = "Task title is required.")]
    [MaxLength(200, ErrorMessage = "Task title must be 200 characters or fewer.")]
    string Title,

    [MaxLength(2000, ErrorMessage = "Task description must be 2000 characters or fewer.")]
    string? Description,

    DateTimeOffset? DueAt);
