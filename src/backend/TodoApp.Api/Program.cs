using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using TodoApp.Api.Authentication;
using TodoApp.Api.Responses;
using TodoApp.DataAccess.DependencyInjection;
using TodoApp.DataAccess.Persistence;
using TodoApp.Services.Auth;
using TodoApp.Services.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);
var jwtOptions = JwtOptions.Bind(builder.Configuration);
var jsonSerializerOptions = new JsonSerializerOptions
{
    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};

builder.Services
    .AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(entry => entry.Value?.Errors.Count > 0)
                .ToDictionary(
                    entry => string.IsNullOrWhiteSpace(entry.Key) ? "request" : entry.Key,
                    entry => entry.Value!.Errors
                        .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage)
                            ? "The value is invalid."
                            : error.ErrorMessage)
                        .ToArray());

            return new BadRequestObjectResult(new ApiValidationErrorResponse(
                "validation_failed",
                "Request validation failed. Check the errors object for field-level details.",
                errors));
        };
    });
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowTodoUi", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue(
                    AuthCookieNames.AccessToken,
                    out var accessToken))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            },
            OnChallenge = async context =>
            {
                context.HandleResponse();

                if (context.Response.HasStarted)
                {
                    return;
                }

                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";

                var message = context.AuthenticateFailure is null
                    ? "Authentication cookie is missing. Sign in first."
                    : "Authentication cookie is invalid or expired. Refresh the session or sign in again.";

                var response = new ApiErrorResponse("unauthorized", message);
                await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonSerializerOptions));
            },
            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";

                var response = new ApiErrorResponse(
                    "forbidden",
                    "You are authenticated, but you do not have permission to access this resource.");
                await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonSerializerOptions));
            }
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TodoApp API",
        Version = "v1",
        Description = "Authentication uses HttpOnly cookies. Register and login set short-lived access and long-lived refresh cookies. Refresh rotates the refresh session and sets new cookies. Protected endpoints read the access token from the cookie; clients should not send JWTs in the response body or local storage."
    });
    options.EnableAnnotations();
});
builder.Services.AddSingleton<IAuthCookieService, AuthCookieService>();
builder.Services.AddApplicationServices();
builder.Services.AddDataAccessServices(builder.Configuration);

var app = builder.Build();

await app.Services.InitializeDatabaseAsync();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowTodoUi");

app.UseAuthentication();
app.UseAuthorization();
app.UseStatusCodePages(async statusCodeContext =>
{
    var httpContext = statusCodeContext.HttpContext;

    if (httpContext.Response.HasStarted ||
        httpContext.Response.StatusCode != StatusCodes.Status404NotFound)
    {
        return;
    }

    httpContext.Response.ContentType = "application/json";

    var response = new ApiErrorResponse(
        "not_found",
        $"No API endpoint was found for '{httpContext.Request.Method} {httpContext.Request.Path}'. Check the URL and HTTP method.");
    await httpContext.Response.WriteAsync(JsonSerializer.Serialize(response, jsonSerializerOptions));
});

app.MapControllers();

app.Run();
