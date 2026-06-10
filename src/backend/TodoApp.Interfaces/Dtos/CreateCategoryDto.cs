using System.ComponentModel.DataAnnotations;
using TodoApp.Interfaces.Validation;

namespace TodoApp.Interfaces.Dtos;

public sealed record CreateCategoryDto(
    [RequiredNonWhiteSpace(ErrorMessage = "Category name is required.")]
    [MaxLength(100, ErrorMessage = "Category name must be 100 characters or fewer.")]
    string Name,

    [MaxLength(32, ErrorMessage = "Category color must be 32 characters or fewer.")]
    string? Color);
