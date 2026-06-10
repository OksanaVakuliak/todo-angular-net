using TodoApp.Interfaces.Dtos;

namespace TodoApp.Api.Authentication;

public interface IAuthCookieService
{
    void AppendAuthCookies(HttpContext httpContext, AuthResponseDto authResponse);

    void ClearAuthCookies(HttpContext httpContext);

    string? GetRefreshToken(HttpContext httpContext);
}

public sealed class AuthCookieService : IAuthCookieService
{
    public void AppendAuthCookies(HttpContext httpContext, AuthResponseDto authResponse)
    {
        httpContext.Response.Cookies.Append(
            AuthCookieNames.AccessToken,
            authResponse.AccessToken,
            CreateCookieOptions(httpContext, authResponse.AccessTokenExpiresAt, "/"));

        httpContext.Response.Cookies.Append(
            AuthCookieNames.RefreshToken,
            authResponse.RefreshToken,
            CreateCookieOptions(httpContext, authResponse.RefreshTokenExpiresAt, "/api/auth"));
    }

    public void ClearAuthCookies(HttpContext httpContext)
    {
        httpContext.Response.Cookies.Delete(
            AuthCookieNames.AccessToken,
            CreateDeleteCookieOptions(httpContext, "/"));

        httpContext.Response.Cookies.Delete(
            AuthCookieNames.RefreshToken,
            CreateDeleteCookieOptions(httpContext, "/api/auth"));
    }

    public string? GetRefreshToken(HttpContext httpContext)
    {
        return httpContext.Request.Cookies.TryGetValue(
            AuthCookieNames.RefreshToken,
            out var refreshToken)
            ? refreshToken
            : null;
    }

    private static CookieOptions CreateCookieOptions(
        HttpContext httpContext,
        DateTimeOffset expiresAt,
        string path)
    {
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = httpContext.Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = expiresAt,
            Path = path
        };
    }

    private static CookieOptions CreateDeleteCookieOptions(HttpContext httpContext, string path)
    {
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = httpContext.Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = path
        };
    }
}
