using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using TodoApp.Api.Authentication;
using TodoApp.Api.Responses;
using TodoApp.Interfaces.Dtos;
using TodoApp.Interfaces.Services;

namespace TodoApp.Api.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController(
    IAuthService authService,
    IAuthCookieService authCookieService) : ControllerBase
{
    [HttpPost("register")]
    [SwaggerOperation(
        Summary = "Register a new user",
        Description = "Creates a user account, creates an auth session, and sets HttpOnly access and refresh token cookies. The response body contains only the authenticated user.")]
    [ProducesResponseType(typeof(AuthUserResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiValidationErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register(
        RegisterRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await authService.RegisterAsync(request, cancellationToken);

        if (!result.Succeeded || result.Response is null)
        {
            return Conflict(CreateErrorResponse(result));
        }

        authCookieService.AppendAuthCookies(HttpContext, result.Response);

        return CreatedAtAction(nameof(Me), new AuthUserResponseDto(result.Response.User));
    }

    [HttpPost("login")]
    [SwaggerOperation(
        Summary = "Sign in",
        Description = "Validates the user credentials, creates an auth session, and sets HttpOnly access and refresh token cookies. The response body contains only the authenticated user.")]
    [ProducesResponseType(typeof(AuthUserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiValidationErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        LoginRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);

        if (!result.Succeeded || result.Response is null)
        {
            return Unauthorized(CreateErrorResponse(result));
        }

        authCookieService.AppendAuthCookies(HttpContext, result.Response);

        return Ok(new AuthUserResponseDto(result.Response.User));
    }

    [HttpPost("refresh")]
    [SwaggerOperation(
        Summary = "Refresh the auth session",
        Description = "Reads the refresh token from the HttpOnly cookie, validates the current session, rotates the refresh token, and sets new HttpOnly access and refresh token cookies.")]
    [ProducesResponseType(typeof(AuthUserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        var refreshToken = authCookieService.GetRefreshToken(HttpContext);
        var result = await authService.RefreshAsync(refreshToken ?? string.Empty, cancellationToken);

        if (!result.Succeeded || result.Response is null)
        {
            authCookieService.ClearAuthCookies(HttpContext);

            return Unauthorized(CreateErrorResponse(result));
        }

        authCookieService.AppendAuthCookies(HttpContext, result.Response);

        return Ok(new AuthUserResponseDto(result.Response.User));
    }

    [HttpPost("logout")]
    [SwaggerOperation(
        Summary = "Sign out",
        Description = "Revokes the current refresh token session when available and clears the auth cookies.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
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
    [SwaggerOperation(
        Summary = "Get the current user",
        Description = "Reads the access token from the HttpOnly cookie and returns the authenticated user.")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized(new ApiErrorResponse(
                "invalid_access_token",
                "Access token is missing a valid user identifier. Sign in again."));
        }

        var user = await authService.GetCurrentUserAsync(userId, cancellationToken);

        return user is null
            ? NotFound(new ApiErrorResponse(
                "user_not_found",
                "The authenticated user no longer exists. Sign in again."))
            : Ok(user);
    }

    private static ApiErrorResponse CreateErrorResponse(AuthOperationResult result)
    {
        return new ApiErrorResponse(
            result.ErrorCode ?? "auth_failed",
            result.ErrorMessage ?? "Authentication request failed.");
    }
}
