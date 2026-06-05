using TodoApp.Interfaces.Dtos;

namespace TodoApp.Interfaces.Services;

public interface ICategoryService
{
    Task<IReadOnlyCollection<CategoryDto>> ListAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<CategoryDto?> GetAsync(
        Guid userId,
        Guid categoryId,
        CancellationToken cancellationToken);

    Task<CategoryOperationResult> CreateAsync(
        Guid userId,
        CreateCategoryDto request,
        CancellationToken cancellationToken);

    Task<CategoryOperationResult> UpdateAsync(
        Guid userId,
        Guid categoryId,
        UpdateCategoryDto request,
        CancellationToken cancellationToken);

    Task<CategoryOperationResult> DeleteAsync(
        Guid userId,
        Guid categoryId,
        CancellationToken cancellationToken);
}
