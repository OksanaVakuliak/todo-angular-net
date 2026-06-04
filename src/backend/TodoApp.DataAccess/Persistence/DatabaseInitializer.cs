using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace TodoApp.DataAccess.Persistence;

public static class DatabaseInitializer
{
    public static async Task InitializeDatabaseAsync(
        this IServiceProvider serviceProvider,
        CancellationToken cancellationToken = default)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<TodoAppDbContext>();

        await dbContext.Database.MigrateAsync(cancellationToken);
    }
}
