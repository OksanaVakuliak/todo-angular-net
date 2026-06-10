using TodoApp.Interfaces.Dtos;

namespace TodoApp.Interfaces.Services;

public sealed record CategoryOperationResult(
    bool Succeeded,
    CategoryDto? Category,
    string? ErrorCode,
    string? ErrorMessage)
{
    public static CategoryOperationResult Success()
    {
        return new CategoryOperationResult(true, null, null, null);
    }

    public static CategoryOperationResult Success(CategoryDto category)
    {
        return new CategoryOperationResult(true, category, null, null);
    }

    public static CategoryOperationResult Failure(string errorCode, string errorMessage)
    {
        return new CategoryOperationResult(false, null, errorCode, errorMessage);
    }
}
