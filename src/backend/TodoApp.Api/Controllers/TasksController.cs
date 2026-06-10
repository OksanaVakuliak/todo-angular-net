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
[Route("api/tasks")]
[Produces("application/json")]
public sealed class TasksController(ITaskItemService taskItemService) : ControllerBase
{
    [HttpGet]
    [SwaggerOperation(
        Summary = "List tasks",
        Description = "Returns paged tasks owned by the authenticated user, with optional search and category filtering.")]
    [ProducesResponseType(typeof(PagedResultDto<TaskItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiValidationErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> List(
        [FromQuery] TaskItemListQueryDto query,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId, out var errorResponse))
        {
            return Unauthorized(errorResponse);
        }

        var taskItems = await taskItemService.ListAsync(
            userId,
            query,
            cancellationToken);

        return Ok(taskItems);
    }

    [HttpGet("{taskId:guid}")]
    [SwaggerOperation(
        Summary = "Get a task",
        Description = "Returns a single task owned by the authenticated user.")]
    [ProducesResponseType(typeof(TaskItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(
        Guid taskId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId, out var errorResponse))
        {
            return Unauthorized(errorResponse);
        }

        var taskItem = await taskItemService.GetAsync(
            userId,
            taskId,
            cancellationToken);

        return taskItem is null
            ? NotFound(CreateNotFoundResponse())
            : Ok(taskItem);
    }

    [HttpPost]
    [SwaggerOperation(
        Summary = "Create a task",
        Description = "Creates a task owned by the authenticated user with an optional category assignment.")]
    [ProducesResponseType(typeof(TaskItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiValidationErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create(
        CreateTaskItemDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId, out var errorResponse))
        {
            return Unauthorized(errorResponse);
        }

        var result = await taskItemService.CreateAsync(
            userId,
            request,
            cancellationToken);

        if (!result.Succeeded || result.TaskItem is null)
        {
            return ToFailureResponse(result);
        }

        return CreatedAtAction(
            nameof(Get),
            new { taskId = result.TaskItem.Id },
            result.TaskItem);
    }

    [HttpPatch("{taskId:guid}")]
    [SwaggerOperation(
        Summary = "Patch a task",
        Description = "Partially updates a task owned by the authenticated user, including category assignment.")]
    [ProducesResponseType(typeof(TaskItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiValidationErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Patch(
        Guid taskId,
        UpdateTaskItemDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId, out var errorResponse))
        {
            return Unauthorized(errorResponse);
        }

        var result = await taskItemService.UpdateAsync(
            userId,
            taskId,
            request,
            cancellationToken);

        return result.Succeeded && result.TaskItem is not null
            ? Ok(result.TaskItem)
            : ToFailureResponse(result);
    }

    [HttpDelete("{taskId:guid}")]
    [SwaggerOperation(
        Summary = "Delete a task",
        Description = "Deletes a task owned by the authenticated user.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(
        Guid taskId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId, out var errorResponse))
        {
            return Unauthorized(errorResponse);
        }

        var result = await taskItemService.DeleteAsync(
            userId,
            taskId,
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

    private static IActionResult ToFailureResponse(TaskItemOperationResult result)
    {
        var response = new ApiErrorResponse(
            result.ErrorCode ?? "task_operation_failed",
            result.ErrorMessage ?? "Task operation failed.");

        return result.ErrorCode switch
        {
            "task_not_found" => new NotFoundObjectResult(response),
            "task_title_required" => new BadRequestObjectResult(response),
            "task_category_not_found" => new BadRequestObjectResult(response),
            "task_patch_empty" => new BadRequestObjectResult(response),
            _ => new BadRequestObjectResult(response)
        };
    }

    private static ApiErrorResponse CreateNotFoundResponse()
    {
        return new ApiErrorResponse(
            "task_not_found",
            "Task was not found.");
    }
}
