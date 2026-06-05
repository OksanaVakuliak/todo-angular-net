namespace TodoApp.Interfaces.Repositories;

public sealed record CreateUserRecord(
    string Email,
    string PasswordHash,
    string DisplayName);
