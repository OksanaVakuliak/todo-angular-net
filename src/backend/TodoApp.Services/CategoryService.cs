using TodoApp.Interfaces.Dtos;
using TodoApp.Interfaces.Repositories;
using TodoApp.Interfaces.Services;

namespace TodoApp.Services;

public sealed class CategoryService(ICategoryRepository categoryRepository) : ICategoryService
{
    public async Task<IReadOnlyCollection<CategoryDto>> ListAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var categories = await categoryRepository.ListByUserAsync(userId, cancellationToken);

        return categories.Select(ToCategoryDto).ToArray();
    }

    public async Task<CategoryDto?> GetAsync(
        Guid userId,
        Guid categoryId,
        CancellationToken cancellationToken)
    {
        var category = await categoryRepository.GetByIdAsync(
            userId,
            categoryId,
            cancellationToken);

        return category is null ? null : ToCategoryDto(category);
    }

    public async Task<CategoryOperationResult> CreateAsync(
        Guid userId,
        CreateCategoryDto request,
        CancellationToken cancellationToken)
    {
        var normalizedName = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return CategoryOperationResult.Failure(
                "category_name_required",
                "Category name is required.");
        }

        if (await categoryRepository.NameExistsAsync(userId, normalizedName, null, cancellationToken))
        {
            return CategoryOperationResult.Failure(
                "category_name_already_exists",
                "A category with this name already exists.");
        }

        var category = await categoryRepository.CreateAsync(
            new CreateCategoryRecord(userId, normalizedName, request.Color),
            cancellationToken);

        return CategoryOperationResult.Success(ToCategoryDto(category));
    }

    public async Task<CategoryOperationResult> UpdateAsync(
        Guid userId,
        Guid categoryId,
        UpdateCategoryDto request,
        CancellationToken cancellationToken)
    {
        var existingCategory = await categoryRepository.GetByIdAsync(
            userId,
            categoryId,
            cancellationToken);

        if (existingCategory is null)
        {
            return CategoryOperationResult.Failure(
                "category_not_found",
                "Category was not found.");
        }

        var normalizedName = request.HasName
            ? request.Name?.Trim()
            : existingCategory.Name;

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return CategoryOperationResult.Failure(
                "category_name_required",
                "Category name is required.");
        }

        if (await categoryRepository.NameExistsAsync(userId, normalizedName, categoryId, cancellationToken))
        {
            return CategoryOperationResult.Failure(
                "category_name_already_exists",
                "A category with this name already exists.");
        }

        var category = await categoryRepository.UpdateAsync(
            userId,
            categoryId,
            new UpdateCategoryRecord(
                normalizedName,
                request.HasColor ? request.Color : existingCategory.Color),
            cancellationToken);

        return category is null
            ? CategoryOperationResult.Failure("category_not_found", "Category was not found.")
            : CategoryOperationResult.Success(ToCategoryDto(category));
    }

    public async Task<CategoryOperationResult> DeleteAsync(
        Guid userId,
        Guid categoryId,
        CancellationToken cancellationToken)
    {
        var deleted = await categoryRepository.DeleteAsync(
            userId,
            categoryId,
            cancellationToken);

        return deleted
            ? CategoryOperationResult.Success()
            : CategoryOperationResult.Failure(
                "category_not_found",
                "Category was not found.");
    }

    private static CategoryDto ToCategoryDto(CategoryRecord category)
    {
        return new CategoryDto(
            category.Id,
            category.UserId,
            category.Name,
            category.Color,
            category.CreatedAt,
            category.UpdatedAt);
    }
}
