using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TodoApp.DataAccess.Persistence;
using TodoApp.DataAccess.Repositories;
using TodoApp.Interfaces.Repositories;

namespace TodoApp.DataAccess.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDataAccessServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Connection string 'DefaultConnection' is missing from configuration. " +
                "Set it with the ConnectionStrings__DefaultConnection environment variable.");
        }

        services.AddDbContext<TodoAppDbContext>(options =>
            options.UseSqlServer(
                connectionString,
                sqlServerOptions => sqlServerOptions.EnableRetryOnFailure()));
        services.AddScoped<IDatabaseHealthRepository, DatabaseHealthRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        return services;
    }
}
