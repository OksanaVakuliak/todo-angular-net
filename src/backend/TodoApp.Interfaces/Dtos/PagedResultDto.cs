namespace TodoApp.Interfaces.Dtos;

public sealed record PagedResultDto<T>(
    IReadOnlyCollection<T> Items,
    int Page,
    int Limit,
    int TotalItems,
    int TotalPages);
