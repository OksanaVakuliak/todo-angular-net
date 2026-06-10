namespace TodoApp.Api.Responses;

public sealed record ApiValidationErrorResponse(
    string ErrorCode,
    string ErrorMessage,
    IDictionary<string, string[]> Errors);
