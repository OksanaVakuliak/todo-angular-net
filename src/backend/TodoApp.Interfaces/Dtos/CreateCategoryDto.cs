using System.ComponentModel.DataAnnotations;

namespace TodoApp.Interfaces.Dtos;

public sealed record CreateCategoryDto(
    [Required]
    [MaxLength(100)]
    string Name,
    [MaxLength(32)]
    string? Color);
