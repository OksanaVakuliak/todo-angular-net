namespace TodoApp.Interfaces.Services;

public interface IHealthService
{
    Task<ApplicationHealthResult> GetHealthAsync(CancellationToken cancellationToken);
}
