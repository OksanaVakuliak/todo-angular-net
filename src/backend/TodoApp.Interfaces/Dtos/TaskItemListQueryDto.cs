using System.ComponentModel.DataAnnotations;

namespace TodoApp.Interfaces.Dtos;

public sealed class TaskItemListQueryDto
{
    [Range(1, 1_000_000)]
    public int Page { get; init; } = 1;

    [Range(1, 100)]
    public int Limit { get; init; } = 20;

    [StringLength(200)]
    public string? Search { get; init; }

    public Guid? CategoryId { get; init; }
}
