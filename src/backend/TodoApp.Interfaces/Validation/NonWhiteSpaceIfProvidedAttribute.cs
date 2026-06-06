using System.ComponentModel.DataAnnotations;

namespace TodoApp.Interfaces.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter)]
public sealed class NonWhiteSpaceIfProvidedAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        return value is null || value is string text && !string.IsNullOrWhiteSpace(text);
    }
}
