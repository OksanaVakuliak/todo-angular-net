using Microsoft.Extensions.DependencyInjection;

namespace TodoApp.DataAccess.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDataAccessServices(
        this IServiceCollection services)
    {
        return services;
    }
}
