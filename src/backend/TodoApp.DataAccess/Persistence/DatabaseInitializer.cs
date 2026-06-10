using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace TodoApp.DataAccess.Persistence;

public static class DatabaseInitializer
{
    public static async Task InitializeDatabaseAsync(
        this IServiceProvider serviceProvider,
        CancellationToken cancellationToken = default)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<TodoAppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<TodoAppDbContext>>();

        try
        {
            await dbContext.Database.MigrateAsync(cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Database initialization failed while applying EF Core migrations.");

            throw;
        }
    }
}
