namespace TodoApp.Interfaces.Dtos;

public sealed record CreateCategoryDto(
    string Name,
    string? Color);
