namespace TodoApp.Interfaces.Services;

public sealed record ApplicationHealthResult(
    string Status,
    string Service,
    string Database);
