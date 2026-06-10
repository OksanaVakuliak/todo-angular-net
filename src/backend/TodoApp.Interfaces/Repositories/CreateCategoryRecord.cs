namespace TodoApp.Interfaces.Repositories;

public sealed record CreateCategoryRecord(
    Guid UserId,
    string Name,
    string? Color);
