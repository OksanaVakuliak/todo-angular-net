using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using TodoApp.Api.Responses;
using TodoApp.Interfaces.Dtos;
using TodoApp.Interfaces.Services;

namespace TodoApp.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/categories")]
[Produces("application/json")]
public sealed class CategoriesController(ICategoryService categoryService) : ControllerBase
{
    [HttpGet]
    [SwaggerOperation(
        Summary = "List categories",
        Description = "Returns categories owned by the authenticated user.")]
    [ProducesResponseType(typeof(IReadOnlyCollection<CategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId, out var errorResponse))
        {
            return Unauthorized(errorResponse);
        }

        var categories = await categoryService.ListAsync(userId, cancellationToken);

        return Ok(categories);
    }

    [HttpGet("{categoryId:guid}")]
    [SwaggerOperation(
        Summary = "Get a category",
        Description = "Returns a single category owned by the authenticated user.")]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(
        Guid categoryId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId, out var errorResponse))
        {
            return Unauthorized(errorResponse);
        }

        var category = await categoryService.GetAsync(
            userId,
            categoryId,
            cancellationToken);

        return category is null
            ? NotFound(CreateNotFoundResponse())
            : Ok(category);
    }

    [HttpPost]
    [SwaggerOperation(
        Summary = "Create a category",
        Description = "Creates a category owned by the authenticated user.")]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiValidationErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        CreateCategoryDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId, out var errorResponse))
        {
            return Unauthorized(errorResponse);
        }

        var result = await categoryService.CreateAsync(
            userId,
            request,
            cancellationToken);

        if (!result.Succeeded || result.Category is null)
        {
            return ToFailureResponse(result);
        }

        return CreatedAtAction(
            nameof(Get),
            new { categoryId = result.Category.Id },
            result.Category);
    }

    [HttpPatch("{categoryId:guid}")]
    [SwaggerOperation(
        Summary = "Patch a category",
        Description = "Partially updates a category owned by the authenticated user.")]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiValidationErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Patch(
        Guid categoryId,
        UpdateCategoryDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId, out var errorResponse))
        {
            return Unauthorized(errorResponse);
        }

        var result = await categoryService.UpdateAsync(
            userId,
            categoryId,
            request,
            cancellationToken);

        return result.Succeeded && result.Category is not null
            ? Ok(result.Category)
            : ToFailureResponse(result);
    }

    [HttpDelete("{categoryId:guid}")]
    [SwaggerOperation(
        Summary = "Delete a category",
        Description = "Deletes a category owned by the authenticated user and removes it from the user's tasks.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(
        Guid categoryId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId, out var errorResponse))
        {
            return Unauthorized(errorResponse);
        }

        var result = await categoryService.DeleteAsync(
            userId,
            categoryId,
            cancellationToken);

        return result.Succeeded
            ? NoContent()
            : ToFailureResponse(result);
    }

    private bool TryGetCurrentUserId(
        out Guid userId,
        out ApiErrorResponse errorResponse)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (Guid.TryParse(userIdValue, out userId))
        {
            errorResponse = null!;
            return true;
        }

        errorResponse = new ApiErrorResponse(
            "invalid_access_token",
            "Access token is missing a valid user identifier. Sign in again.");

        return false;
    }

    private static IActionResult ToFailureResponse(CategoryOperationResult result)
    {
        var response = new ApiErrorResponse(
            result.ErrorCode ?? "category_operation_failed",
            result.ErrorMessage ?? "Category operation failed.");

        return result.ErrorCode switch
        {
            "category_not_found" => new NotFoundObjectResult(response),
            "category_name_already_exists" => new ConflictObjectResult(response),
            "category_name_required" => new BadRequestObjectResult(response),
            _ => new BadRequestObjectResult(response)
        };
    }

    private static ApiErrorResponse CreateNotFoundResponse()
    {
        return new ApiErrorResponse(
            "category_not_found",
            "Category was not found.");
    }
}
