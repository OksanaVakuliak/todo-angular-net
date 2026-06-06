using System.ComponentModel.DataAnnotations;

namespace TodoApp.Interfaces.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter)]
public sealed class RequiredNonWhiteSpaceAttribute : RequiredAttribute
{
    public override bool IsValid(object? value)
    {
        return value is string text && !string.IsNullOrWhiteSpace(text);
    }
}
