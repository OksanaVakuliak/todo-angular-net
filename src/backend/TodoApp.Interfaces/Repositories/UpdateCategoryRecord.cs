namespace TodoApp.Interfaces.Repositories;

public sealed record UpdateCategoryRecord(
    string Name,
    string? Color);
