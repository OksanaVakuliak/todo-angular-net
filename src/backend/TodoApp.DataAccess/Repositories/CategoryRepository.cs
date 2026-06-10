using Microsoft.EntityFrameworkCore;
using TodoApp.DataAccess.Entities;
using TodoApp.DataAccess.Persistence;
using TodoApp.Interfaces.Repositories;

namespace TodoApp.DataAccess.Repositories;

public sealed class CategoryRepository(TodoAppDbContext dbContext) : ICategoryRepository
{
    public async Task<IReadOnlyCollection<CategoryRecord>> ListByUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Categories
            .AsNoTracking()
            .Where(category => category.UserId == userId)
            .OrderBy(category => category.Name)
            .Select(category => ToCategoryRecord(category))
            .ToListAsync(cancellationToken);
    }

    public async Task<CategoryRecord?> GetByIdAsync(
        Guid userId,
        Guid categoryId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Categories
            .AsNoTracking()
            .Where(category => category.UserId == userId && category.Id == categoryId)
            .Select(category => ToCategoryRecord(category))
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> NameExistsAsync(
        Guid userId,
        string name,
        Guid? exceptCategoryId,
        CancellationToken cancellationToken)
    {
        var normalizedName = NormalizeName(name);

        return await dbContext.Categories
            .AsNoTracking()
            .AnyAsync(
                category =>
                    category.UserId == userId &&
                    category.Name == normalizedName &&
                    (!exceptCategoryId.HasValue || category.Id != exceptCategoryId.Value),
                cancellationToken);
    }

    public async Task<CategoryRecord> CreateAsync(
        CreateCategoryRecord category,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var entity = new Category
        {
            UserId = category.UserId,
            Name = NormalizeName(category.Name),
            Color = NormalizeOptionalText(category.Color),
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.Categories.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToCategoryRecord(entity);
    }

    public async Task<CategoryRecord?> UpdateAsync(
        Guid userId,
        Guid categoryId,
        UpdateCategoryRecord category,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.Categories
            .SingleOrDefaultAsync(
                category => category.UserId == userId && category.Id == categoryId,
                cancellationToken);

        if (entity is null)
        {
            return null;
        }

        entity.Name = NormalizeName(category.Name);
        entity.Color = NormalizeOptionalText(category.Color);
        entity.UpdatedAt = DateTimeOffset.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return ToCategoryRecord(entity);
    }

    public async Task<bool> DeleteAsync(
        Guid userId,
        Guid categoryId,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.Categories
            .SingleOrDefaultAsync(
                category => category.UserId == userId && category.Id == categoryId,
                cancellationToken);

        if (entity is null)
        {
            return false;
        }

        await dbContext.TaskItems
            .Where(taskItem => taskItem.UserId == userId && taskItem.CategoryId == categoryId)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(taskItem => taskItem.CategoryId, (Guid?)null)
                    .SetProperty(taskItem => taskItem.UpdatedAt, DateTimeOffset.UtcNow),
                cancellationToken);

        dbContext.Categories.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static string NormalizeName(string name)
    {
        return name.Trim();
    }

    private static string? NormalizeOptionalText(string? value)
    {
        var trimmed = value?.Trim();

        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }

    private static CategoryRecord ToCategoryRecord(Category category)
    {
        return new CategoryRecord(
            category.Id,
            category.UserId,
            category.Name,
            category.Color,
            category.CreatedAt,
            category.UpdatedAt);
    }
}
