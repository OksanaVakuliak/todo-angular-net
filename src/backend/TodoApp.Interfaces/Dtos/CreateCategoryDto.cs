using System.ComponentModel.DataAnnotations;

namespace TodoApp.Interfaces.Dtos;

public sealed record CreateCategoryDto(
    [property: Required]
    [property: MaxLength(100)]
    string Name,
    [property: MaxLength(32)]
    string? Color);
