using Microsoft.Extensions.DependencyInjection;
using TodoApp.Interfaces.Services;

namespace TodoApp.Services.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IHealthService, HealthService>();

        return services;
    }
}
