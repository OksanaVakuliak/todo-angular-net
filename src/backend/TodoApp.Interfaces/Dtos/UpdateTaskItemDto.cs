using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using TodoApp.Interfaces.Validation;

namespace TodoApp.Interfaces.Dtos;

public sealed class UpdateTaskItemDto : IValidatableObject
{
    private Guid? categoryId;
    private string? title;
    private string? description;
    private bool isCompleted;
    private DateTimeOffset? dueAt;

    public Guid? CategoryId
    {
        get => categoryId;
        init
        {
            categoryId = value;
            HasCategoryId = true;
        }
    }

    [NonWhiteSpaceIfProvided(ErrorMessage = "Task title cannot be empty.")]
    [MaxLength(200, ErrorMessage = "Task title must be 200 characters or fewer.")]
    public string? Title
    {
        get => title;
        init
        {
            title = value;
            HasTitle = true;
        }
    }

    [MaxLength(2000, ErrorMessage = "Task description must be 2000 characters or fewer.")]
    public string? Description
    {
        get => description;
        init
        {
            description = value;
            HasDescription = true;
        }
    }

    public bool IsCompleted
    {
        get => isCompleted;
        init
        {
            isCompleted = value;
            HasIsCompleted = true;
        }
    }

    public DateTimeOffset? DueAt
    {
        get => dueAt;
        init
        {
            dueAt = value;
            HasDueAt = true;
        }
    }

    [JsonIgnore]
    public bool HasCategoryId { get; private init; }

    [JsonIgnore]
    public bool HasTitle { get; private init; }

    [JsonIgnore]
    public bool HasDescription { get; private init; }

    [JsonIgnore]
    public bool HasIsCompleted { get; private init; }

    [JsonIgnore]
    public bool HasDueAt { get; private init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!HasCategoryId &&
            !HasTitle &&
            !HasDescription &&
            !HasIsCompleted &&
            !HasDueAt)
        {
            yield return new ValidationResult(
                "Provide at least one task field to update.",
                [
                    nameof(CategoryId),
                    nameof(Title),
                    nameof(Description),
                    nameof(IsCompleted),
                    nameof(DueAt)
                ]);
        }
    }
}
