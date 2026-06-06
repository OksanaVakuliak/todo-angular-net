using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using TodoApp.Interfaces.Validation;

namespace TodoApp.Interfaces.Dtos;

public sealed class UpdateCategoryDto : IValidatableObject
{
    private string? name;
    private string? color;

    [NonWhiteSpaceIfProvided(ErrorMessage = "Category name cannot be empty.")]
    [MaxLength(100, ErrorMessage = "Category name must be 100 characters or fewer.")]
    public string? Name
    {
        get => name;
        init
        {
            name = value;
            HasName = true;
        }
    }

    [MaxLength(32, ErrorMessage = "Category color must be 32 characters or fewer.")]
    public string? Color
    {
        get => color;
        init
        {
            color = value;
            HasColor = true;
        }
    }

    [JsonIgnore]
    public bool HasName { get; private init; }

    [JsonIgnore]
    public bool HasColor { get; private init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (HasName && string.IsNullOrWhiteSpace(Name))
        {
            yield return new ValidationResult(
                "Category name cannot be empty.",
                [nameof(Name)]);
        }

        if (!HasName && !HasColor)
        {
            yield return new ValidationResult(
                "Provide at least one category field to update.",
                [nameof(Name), nameof(Color)]);
        }
    }
}
