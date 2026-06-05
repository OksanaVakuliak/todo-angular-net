namespace TodoApp.Interfaces.Dtos;

public sealed record AuthResponseDto(
    string AccessToken,
    string TokenType,
    DateTimeOffset ExpiresAt,
    UserDto User);
