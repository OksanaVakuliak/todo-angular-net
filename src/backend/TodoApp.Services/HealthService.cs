using TodoApp.Interfaces.Repositories;
using TodoApp.Interfaces.Services;

namespace TodoApp.Services;

public class HealthService(IDatabaseHealthRepository databaseHealthRepository) : IHealthService
{
    public async Task<ApplicationHealthResult> GetHealthAsync(CancellationToken cancellationToken)
    {
        var databaseAvailable = await databaseHealthRepository.CanConnectAsync(cancellationToken);

        return new ApplicationHealthResult(
            databaseAvailable ? "ok" : "degraded",
            "TodoApp.Api",
            databaseAvailable ? "available" : "unavailable");
    }
}
