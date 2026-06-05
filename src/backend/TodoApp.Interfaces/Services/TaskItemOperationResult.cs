using TodoApp.Interfaces.Dtos;

namespace TodoApp.Interfaces.Services;

public sealed record TaskItemOperationResult(
    bool Succeeded,
    TaskItemDto? TaskItem,
    string? ErrorCode,
    string? ErrorMessage)
{
    public static TaskItemOperationResult Success()
    {
        return new TaskItemOperationResult(true, null, null, null);
    }

    public static TaskItemOperationResult Success(TaskItemDto taskItem)
    {
        return new TaskItemOperationResult(true, taskItem, null, null);
    }

    public static TaskItemOperationResult Failure(string errorCode, string errorMessage)
    {
        return new TaskItemOperationResult(false, null, errorCode, errorMessage);
    }
}
