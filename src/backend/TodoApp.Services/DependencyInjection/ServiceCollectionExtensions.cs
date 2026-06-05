using Microsoft.Extensions.DependencyInjection;
using TodoApp.Interfaces.Services;
using TodoApp.Services.Auth;

namespace TodoApp.Services.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IHealthService, HealthService>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IRefreshTokenService, RefreshTokenService>();

        return services;
    }
}
