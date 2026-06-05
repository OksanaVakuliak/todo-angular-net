using System.ComponentModel.DataAnnotations;

namespace TodoApp.Interfaces.Dtos;

public sealed record RegisterRequestDto(
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email must be a valid email address.")]
    [MaxLength(256, ErrorMessage = "Email must be 256 characters or fewer.")]
    string Email,

    [Required(ErrorMessage = "Password is required.")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
    [MaxLength(100, ErrorMessage = "Password must be 100 characters or fewer.")]
    string Password,

    [Required(ErrorMessage = "Display name is required.")]
    [MaxLength(100, ErrorMessage = "Display name must be 100 characters or fewer.")]
    string DisplayName);
