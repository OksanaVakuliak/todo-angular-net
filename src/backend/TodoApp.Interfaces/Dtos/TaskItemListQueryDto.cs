using System.ComponentModel.DataAnnotations;

namespace TodoApp.Interfaces.Dtos;

public sealed class TaskItemListQueryDto
{
    [Range(1, 1_000_000, ErrorMessage = "Page must be between 1 and 1000000.")]
    public int Page { get; init; } = 1;

    [Range(1, 100, ErrorMessage = "Limit must be between 1 and 100.")]
    public int Limit { get; init; } = 20;

    [StringLength(200, ErrorMessage = "Search must be 200 characters or fewer.")]
    public string? Search { get; init; }

    public Guid? CategoryId { get; init; }
}
