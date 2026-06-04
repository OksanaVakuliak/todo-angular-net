namespace TodoApp.Interfaces.Dtos;

public sealed record UpdateCategoryDto(
    string Name,
    string? Color);
