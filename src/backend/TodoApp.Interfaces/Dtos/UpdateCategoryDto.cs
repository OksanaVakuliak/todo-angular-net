using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TodoApp.Interfaces.Dtos;

public sealed class UpdateCategoryDto
{
    private string? name;
    private string? color;

    [MaxLength(100)]
    public string? Name
    {
        get => name;
        init
        {
            name = value;
            HasName = true;
        }
    }

    [MaxLength(32)]
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
}
