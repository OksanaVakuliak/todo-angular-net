using Microsoft.EntityFrameworkCore;
using TodoApp.DataAccess.Entities;
using TodoApp.DataAccess.Persistence;
using TodoApp.Interfaces.Repositories;

namespace TodoApp.DataAccess.Repositories;

public sealed class TaskItemRepository(TodoAppDbContext dbContext) : ITaskItemRepository
{
    public async Task<TaskItemListResultRecord> ListByUserAsync(
        Guid userId,
        TaskItemListQueryRecord query,
        CancellationToken cancellationToken)
    {
        var taskItemsQuery = dbContext.TaskItems
            .AsNoTracking()
            .Where(taskItem => taskItem.UserId == userId);

        if (query.CategoryId.HasValue)
        {
            taskItemsQuery = taskItemsQuery
                .Where(taskItem => taskItem.CategoryId == query.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            taskItemsQuery = taskItemsQuery
                .Where(taskItem =>
                    taskItem.Title.Contains(query.Search) ||
                    (taskItem.Description != null && taskItem.Description.Contains(query.Search)));
        }

        var totalItems = await taskItemsQuery.CountAsync(cancellationToken);
        var items = await taskItemsQuery
            .OrderBy(taskItem => taskItem.IsCompleted)
            .ThenBy(taskItem => taskItem.DueAt)
            .ThenByDescending(taskItem => taskItem.CreatedAt)
            .Skip((query.Page - 1) * query.Limit)
            .Take(query.Limit)
            .Select(taskItem => new TaskItemRecord(
                taskItem.Id,
                taskItem.UserId,
                taskItem.CategoryId,
                taskItem.Category == null ? null : taskItem.Category.Name,
                taskItem.Category == null ? null : taskItem.Category.Color,
                taskItem.Title,
                taskItem.Description,
                taskItem.IsCompleted,
                taskItem.DueAt,
                taskItem.CreatedAt,
                taskItem.UpdatedAt))
            .ToListAsync(cancellationToken);

        return new TaskItemListResultRecord(items, totalItems);
    }

    public async Task<TaskItemRecord?> GetByIdAsync(
        Guid userId,
        Guid taskId,
        CancellationToken cancellationToken)
    {
        return await dbContext.TaskItems
            .AsNoTracking()
            .Where(taskItem => taskItem.UserId == userId && taskItem.Id == taskId)
            .Select(taskItem => new TaskItemRecord(
                taskItem.Id,
                taskItem.UserId,
                taskItem.CategoryId,
                taskItem.Category == null ? null : taskItem.Category.Name,
                taskItem.Category == null ? null : taskItem.Category.Color,
                taskItem.Title,
                taskItem.Description,
                taskItem.IsCompleted,
                taskItem.DueAt,
                taskItem.CreatedAt,
                taskItem.UpdatedAt))
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<TaskItemRecord> CreateAsync(
        CreateTaskItemRecord taskItem,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var entity = new TaskItem
        {
            UserId = taskItem.UserId,
            CategoryId = taskItem.CategoryId,
            Title = NormalizeTitle(taskItem.Title),
            Description = NormalizeOptionalText(taskItem.Description),
            DueAt = taskItem.DueAt,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.TaskItems.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(entity.UserId, entity.Id, cancellationToken)
            ?? ToTaskItemRecord(entity);
    }

    public async Task<TaskItemRecord?> UpdateAsync(
        Guid userId,
        Guid taskId,
        UpdateTaskItemRecord taskItem,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.TaskItems
            .SingleOrDefaultAsync(
                taskItem => taskItem.UserId == userId && taskItem.Id == taskId,
                cancellationToken);

        if (entity is null)
        {
            return null;
        }

        entity.CategoryId = taskItem.CategoryId;
        entity.Title = NormalizeTitle(taskItem.Title);
        entity.Description = NormalizeOptionalText(taskItem.Description);
        entity.IsCompleted = taskItem.IsCompleted;
        entity.DueAt = taskItem.DueAt;
        entity.UpdatedAt = DateTimeOffset.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(userId, taskId, cancellationToken);
    }

    public async Task<bool> DeleteAsync(
        Guid userId,
        Guid taskId,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.TaskItems
            .SingleOrDefaultAsync(
                taskItem => taskItem.UserId == userId && taskItem.Id == taskId,
                cancellationToken);

        if (entity is null)
        {
            return false;
        }

        dbContext.TaskItems.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static string NormalizeTitle(string title)
    {
        return title.Trim();
    }

    private static string? NormalizeOptionalText(string? value)
    {
        var trimmed = value?.Trim();

        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }

    private static TaskItemRecord ToTaskItemRecord(TaskItem taskItem)
    {
        return new TaskItemRecord(
            taskItem.Id,
            taskItem.UserId,
            taskItem.CategoryId,
            taskItem.Category == null ? null : taskItem.Category.Name,
            taskItem.Category == null ? null : taskItem.Category.Color,
            taskItem.Title,
            taskItem.Description,
            taskItem.IsCompleted,
            taskItem.DueAt,
            taskItem.CreatedAt,
            taskItem.UpdatedAt);
    }
}
