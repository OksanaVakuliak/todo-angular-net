namespace TodoApp.Interfaces.Repositories;

public sealed record TaskItemListResultRecord(
    IReadOnlyCollection<TaskItemRecord> Items,
    int TotalItems);
