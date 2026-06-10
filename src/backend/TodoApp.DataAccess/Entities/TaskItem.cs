namespace TodoApp.DataAccess.Entities;

public class TaskItem
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid? CategoryId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsCompleted { get; set; }

    public DateTimeOffset? DueAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public User User { get; set; } = null!;

    public Category? Category { get; set; }
}
