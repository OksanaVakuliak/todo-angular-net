using TodoApp.Interfaces.Dtos;
using TodoApp.Interfaces.Repositories;
using TodoApp.Interfaces.Services;

namespace TodoApp.Services;

public sealed class TaskItemService(
    ITaskItemRepository taskItemRepository,
    ICategoryRepository categoryRepository) : ITaskItemService
{
    public async Task<IReadOnlyCollection<TaskItemDto>> ListAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var taskItems = await taskItemRepository.ListByUserAsync(userId, cancellationToken);

        return taskItems.Select(ToTaskItemDto).ToArray();
    }

    public async Task<TaskItemDto?> GetAsync(
        Guid userId,
        Guid taskId,
        CancellationToken cancellationToken)
    {
        var taskItem = await taskItemRepository.GetByIdAsync(
            userId,
            taskId,
            cancellationToken);

        return taskItem is null ? null : ToTaskItemDto(taskItem);
    }

    public async Task<TaskItemOperationResult> CreateAsync(
        Guid userId,
        CreateTaskItemDto request,
        CancellationToken cancellationToken)
    {
        var normalizedTitle = request.Title.Trim();

        if (string.IsNullOrWhiteSpace(normalizedTitle))
        {
            return TaskItemOperationResult.Failure(
                "task_title_required",
                "Task title is required.");
        }

        if (!await CategoryBelongsToUserAsync(userId, request.CategoryId, cancellationToken))
        {
            return TaskItemOperationResult.Failure(
                "task_category_not_found",
                "Category was not found.");
        }

        var taskItem = await taskItemRepository.CreateAsync(
            new CreateTaskItemRecord(
                userId,
                request.CategoryId,
                normalizedTitle,
                request.Description,
                request.DueAt),
            cancellationToken);

        return TaskItemOperationResult.Success(ToTaskItemDto(taskItem));
    }

    public async Task<TaskItemOperationResult> UpdateAsync(
        Guid userId,
        Guid taskId,
        UpdateTaskItemDto request,
        CancellationToken cancellationToken)
    {
        var existingTaskItem = await taskItemRepository.GetByIdAsync(
            userId,
            taskId,
            cancellationToken);

        if (existingTaskItem is null)
        {
            return TaskItemOperationResult.Failure(
                "task_not_found",
                "Task was not found.");
        }

        if (!request.HasCategoryId &&
            !request.HasTitle &&
            !request.HasDescription &&
            !request.HasIsCompleted &&
            !request.HasDueAt)
        {
            return TaskItemOperationResult.Failure(
                "task_patch_empty",
                "Provide at least one task field to update.");
        }

        var categoryId = request.HasCategoryId
            ? request.CategoryId
            : existingTaskItem.CategoryId;

        var normalizedTitle = request.HasTitle
            ? request.Title?.Trim()
            : existingTaskItem.Title;

        if (string.IsNullOrWhiteSpace(normalizedTitle))
        {
            return TaskItemOperationResult.Failure(
                "task_title_required",
                "Task title is required.");
        }

        if (!await CategoryBelongsToUserAsync(userId, categoryId, cancellationToken))
        {
            return TaskItemOperationResult.Failure(
                "task_category_not_found",
                "Category was not found.");
        }

        var taskItem = await taskItemRepository.UpdateAsync(
            userId,
            taskId,
            new UpdateTaskItemRecord(
                categoryId,
                normalizedTitle,
                request.HasDescription ? request.Description : existingTaskItem.Description,
                request.HasIsCompleted ? request.IsCompleted : existingTaskItem.IsCompleted,
                request.HasDueAt ? request.DueAt : existingTaskItem.DueAt),
            cancellationToken);

        return taskItem is null
            ? TaskItemOperationResult.Failure("task_not_found", "Task was not found.")
            : TaskItemOperationResult.Success(ToTaskItemDto(taskItem));
    }

    public async Task<TaskItemOperationResult> DeleteAsync(
        Guid userId,
        Guid taskId,
        CancellationToken cancellationToken)
    {
        var deleted = await taskItemRepository.DeleteAsync(
            userId,
            taskId,
            cancellationToken);

        return deleted
            ? TaskItemOperationResult.Success()
            : TaskItemOperationResult.Failure(
                "task_not_found",
                "Task was not found.");
    }

    private async Task<bool> CategoryBelongsToUserAsync(
        Guid userId,
        Guid? categoryId,
        CancellationToken cancellationToken)
    {
        if (!categoryId.HasValue)
        {
            return true;
        }

        var category = await categoryRepository.GetByIdAsync(
            userId,
            categoryId.Value,
            cancellationToken);

        return category is not null;
    }

    private static TaskItemDto ToTaskItemDto(TaskItemRecord taskItem)
    {
        return new TaskItemDto(
            taskItem.Id,
            taskItem.UserId,
            taskItem.CategoryId,
            taskItem.CategoryName,
            taskItem.Title,
            taskItem.Description,
            taskItem.IsCompleted,
            taskItem.DueAt,
            taskItem.CreatedAt,
            taskItem.UpdatedAt);
    }
}
