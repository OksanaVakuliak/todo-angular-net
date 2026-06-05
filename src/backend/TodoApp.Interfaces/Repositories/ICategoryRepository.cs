namespace TodoApp.Interfaces.Repositories;

public interface ICategoryRepository
{
    Task<IReadOnlyCollection<CategoryRecord>> ListByUserAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<CategoryRecord?> GetByIdAsync(
        Guid userId,
        Guid categoryId,
        CancellationToken cancellationToken);

    Task<bool> NameExistsAsync(
        Guid userId,
        string name,
        Guid? exceptCategoryId,
        CancellationToken cancellationToken);

    Task<CategoryRecord> CreateAsync(
        CreateCategoryRecord category,
        CancellationToken cancellationToken);

    Task<CategoryRecord?> UpdateAsync(
        Guid userId,
        Guid categoryId,
        UpdateCategoryRecord category,
        CancellationToken cancellationToken);

    Task<bool> DeleteAsync(
        Guid userId,
        Guid categoryId,
        CancellationToken cancellationToken);
}
