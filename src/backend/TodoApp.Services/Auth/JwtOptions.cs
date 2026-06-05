using System.Text;
using Microsoft.Extensions.Configuration;

namespace TodoApp.Services.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = string.Empty;

    public string Audience { get; init; } = string.Empty;

    public string SigningKey { get; init; } = string.Empty;

    public int AccessTokenMinutes { get; init; } = 15;

    public int RefreshTokenDays { get; init; } = 14;

    public static JwtOptions Bind(IConfiguration configuration)
    {
        var options = configuration
            .GetSection(SectionName)
            .Get<JwtOptions>() ?? new JwtOptions();

        options.Validate();

        return options;
    }

    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(Issuer))
        {
            throw new InvalidOperationException("JWT issuer is missing from configuration.");
        }

        if (string.IsNullOrWhiteSpace(Audience))
        {
            throw new InvalidOperationException("JWT audience is missing from configuration.");
        }

        if (string.IsNullOrWhiteSpace(SigningKey))
        {
            throw new InvalidOperationException(
                "JWT signing key is missing from configuration. " +
                "Set it with the Jwt__SigningKey environment variable.");
        }

        if (Encoding.UTF8.GetByteCount(SigningKey) < 32)
        {
            throw new InvalidOperationException(
                "JWT signing key must be at least 32 bytes (256 bits) for HMAC-SHA256 security. " +
                "Generate a secure key using a cryptographic random generator.");
        }

        if (AccessTokenMinutes <= 0)
        {
            throw new InvalidOperationException("JWT access token lifetime must be greater than zero minutes.");
        }

        if (RefreshTokenDays <= 0)
        {
            throw new InvalidOperationException("JWT refresh token lifetime must be greater than zero days.");
        }
    }
}
