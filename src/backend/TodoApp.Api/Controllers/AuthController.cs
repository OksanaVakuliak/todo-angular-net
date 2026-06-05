using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApp.Api.Authentication;
using TodoApp.Interfaces.Dtos;
using TodoApp.Interfaces.Services;

namespace TodoApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    IAuthService authService,
    IAuthCookieService authCookieService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await authService.RegisterAsync(request, cancellationToken);

        if (!result.Succeeded || result.Response is null)
        {
            return Conflict(new { result.ErrorCode, result.ErrorMessage });
        }

        authCookieService.AppendAuthCookies(HttpContext, result.Response);

        return CreatedAtAction(nameof(Me), new { result.Response.User });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        LoginRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);

        if (!result.Succeeded || result.Response is null)
        {
            return Unauthorized(new { result.ErrorCode, result.ErrorMessage });
        }

        authCookieService.AppendAuthCookies(HttpContext, result.Response);

        return Ok(new { result.Response.User });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        var refreshToken = authCookieService.GetRefreshToken(HttpContext);
        var result = await authService.RefreshAsync(refreshToken ?? string.Empty, cancellationToken);

        if (!result.Succeeded || result.Response is null)
        {
            authCookieService.ClearAuthCookies(HttpContext);

            return Unauthorized(new { result.ErrorCode, result.ErrorMessage });
        }

        authCookieService.AppendAuthCookies(HttpContext, result.Response);

        return Ok(new { result.Response.User });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        await authService.LogoutAsync(
            authCookieService.GetRefreshToken(HttpContext),
            cancellationToken);
        authCookieService.ClearAuthCookies(HttpContext);

        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var user = await authService.GetCurrentUserAsync(userId, cancellationToken);

        return user is null ? NotFound() : Ok(user);
    }
}
