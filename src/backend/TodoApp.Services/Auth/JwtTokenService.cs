using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TodoApp.Interfaces.Repositories;

namespace TodoApp.Services.Auth;

public interface IJwtTokenService
{
    (string Token, DateTimeOffset ExpiresAt) CreateToken(AuthUserRecord user);

    int GetRefreshTokenDays();
}

public sealed class JwtTokenService(IConfiguration configuration) : IJwtTokenService
{
    public (string Token, DateTimeOffset ExpiresAt) CreateToken(AuthUserRecord user)
    {
        var options = GetOptions();
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(options.AccessTokenMinutes);
        var signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.SigningKey)),
            SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name, user.DisplayName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        var token = new JwtSecurityToken(
            options.Issuer,
            options.Audience,
            claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: signingCredentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    public int GetRefreshTokenDays()
    {
        return GetOptions().RefreshTokenDays;
    }

    private JwtOptions GetOptions()
    {
        return JwtOptions.Bind(configuration);
    }
}
