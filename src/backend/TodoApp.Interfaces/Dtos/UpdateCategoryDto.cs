using System.ComponentModel.DataAnnotations;

namespace TodoApp.Interfaces.Dtos;

public sealed record UpdateCategoryDto(
    [property: Required]
    [property: MaxLength(100)]
    string Name,
    [property: MaxLength(32)]
    string? Color);
