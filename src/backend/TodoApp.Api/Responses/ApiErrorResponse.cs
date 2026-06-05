namespace TodoApp.Api.Responses;

public sealed record ApiErrorResponse(
    string ErrorCode,
    string ErrorMessage);
