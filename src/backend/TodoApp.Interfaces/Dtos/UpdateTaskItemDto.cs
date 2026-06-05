using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TodoApp.Interfaces.Dtos;

public sealed class UpdateTaskItemDto
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

    [MaxLength(200)]
    public string? Title
    {
        get => title;
        init
        {
            title = value;
            HasTitle = true;
        }
    }

    [MaxLength(2000)]
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
}
