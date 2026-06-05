using TodoApp.Interfaces.Dtos;

namespace TodoApp.Interfaces.Services;

public sealed record AuthOperationResult(
    bool Succeeded,
    AuthResponseDto? Response,
    string? ErrorCode,
    string? ErrorMessage)
{
    public static AuthOperationResult Success(AuthResponseDto response)
    {
        return new AuthOperationResult(true, response, null, null);
    }

    public static AuthOperationResult Failure(string errorCode, string errorMessage)
    {
        return new AuthOperationResult(false, null, errorCode, errorMessage);
    }
}
