using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace TodoApp.Api.Responses;

public static class ApiValidationErrorResponseFactory
{
    public static BadRequestObjectResult Create(ActionContext context)
    {
        return new BadRequestObjectResult(Create(context.ModelState));
    }

    private static ApiValidationErrorResponse Create(ModelStateDictionary modelState)
    {
        var errors = modelState
            .Where(entry => entry.Value?.Errors.Count > 0)
            .ToDictionary(
                entry => NormalizeFieldName(entry.Key),
                entry => entry.Value!.Errors
                    .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage)
                        ? "The value is invalid."
                        : error.ErrorMessage)
                    .Distinct()
                    .ToArray());

        return new ApiValidationErrorResponse(
            "validation_failed",
            "Request validation failed. Check the errors object for field-level details.",
            errors);
    }

    private static string NormalizeFieldName(string fieldName)
    {
        return string.IsNullOrWhiteSpace(fieldName)
            ? "request"
            : char.ToLowerInvariant(fieldName[0]) + fieldName[1..];
    }
}
