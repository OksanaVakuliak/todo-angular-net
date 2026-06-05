using System.ComponentModel.DataAnnotations;

namespace TodoApp.Interfaces.Dtos;

public sealed record RegisterRequestDto(
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    string Email,

    [Required]
    [MinLength(8)]
    [MaxLength(100)]
    string Password,

    [Required]
    [MaxLength(100)]
    string DisplayName);
