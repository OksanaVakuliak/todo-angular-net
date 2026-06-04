namespace TodoApp.Interfaces.Services;

public static class ApplicationHealthStatuses
{
    public const string Ok = "ok";
    public const string Degraded = "degraded";
}

public sealed record ApplicationHealthResult(
    string Status,
    string Service,
    string Database);
