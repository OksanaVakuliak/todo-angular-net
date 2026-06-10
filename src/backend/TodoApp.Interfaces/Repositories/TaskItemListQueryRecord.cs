namespace TodoApp.Interfaces.Repositories;

public sealed record TaskItemListQueryRecord(
    int Page,
    int Limit,
    string? Search,
    Guid? CategoryId);
