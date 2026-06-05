namespace TodoApp.Interfaces.Repositories;

public interface ITaskItemRepository
{
    Task<IReadOnlyCollection<TaskItemRecord>> ListByUserAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<TaskItemRecord?> GetByIdAsync(
        Guid userId,
        Guid taskId,
        CancellationToken cancellationToken);

    Task<TaskItemRecord> CreateAsync(
        CreateTaskItemRecord taskItem,
        CancellationToken cancellationToken);

    Task<TaskItemRecord?> UpdateAsync(
        Guid userId,
        Guid taskId,
        UpdateTaskItemRecord taskItem,
        CancellationToken cancellationToken);

    Task<bool> DeleteAsync(
        Guid userId,
        Guid taskId,
        CancellationToken cancellationToken);
}
