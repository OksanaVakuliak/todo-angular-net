using System.Text.Json;
using TodoApp.Api.Responses;

namespace TodoApp.Api.Middleware;

public sealed class ApiExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ApiExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Unhandled exception while processing {Method} {Path}.",
                context.Request.Method,
                context.Request.Path);

            if (context.Response.HasStarted)
            {
                throw;
            }

            context.Response.Clear();
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            var response = new ApiErrorResponse(
                "internal_server_error",
                "An unexpected error occurred. Try again later.");

            await context.Response.WriteAsync(JsonSerializer.Serialize(response, ApiJsonSerializerOptions.Default));
        }
    }
}
