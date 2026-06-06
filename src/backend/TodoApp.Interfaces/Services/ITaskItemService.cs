using TodoApp.Interfaces.Dtos;

namespace TodoApp.Interfaces.Services;

public interface ITaskItemService
{
    Task<PagedResultDto<TaskItemDto>> ListAsync(
        Guid userId,
        TaskItemListQueryDto query,
        CancellationToken cancellationToken);

    Task<TaskItemDto?> GetAsync(
        Guid userId,
        Guid taskId,
        CancellationToken cancellationToken);

    Task<TaskItemOperationResult> CreateAsync(
        Guid userId,
        CreateTaskItemDto request,
        CancellationToken cancellationToken);

    Task<TaskItemOperationResult> UpdateAsync(
        Guid userId,
        Guid taskId,
        UpdateTaskItemDto request,
        CancellationToken cancellationToken);

    Task<TaskItemOperationResult> DeleteAsync(
        Guid userId,
        Guid taskId,
        CancellationToken cancellationToken);
}
