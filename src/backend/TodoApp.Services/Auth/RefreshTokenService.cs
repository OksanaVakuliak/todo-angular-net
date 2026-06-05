using System.Security.Cryptography;
using System.Text;

namespace TodoApp.Services.Auth;

public interface IRefreshTokenService
{
    string CreateToken();

    string Hash(string refreshToken);
}

public sealed class RefreshTokenService : IRefreshTokenService
{
    public string CreateToken()
    {
        var tokenBytes = RandomNumberGenerator.GetBytes(64);

        return Base64UrlEncode(tokenBytes);
    }

    public string Hash(string refreshToken)
    {
        var tokenBytes = Encoding.UTF8.GetBytes(refreshToken);
        var hashBytes = SHA256.HashData(tokenBytes);

        return Convert.ToHexString(hashBytes);
    }

    private static string Base64UrlEncode(byte[] bytes)
    {
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }
}
