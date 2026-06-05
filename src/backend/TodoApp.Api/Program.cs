using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using TodoApp.Api.Authentication;
using TodoApp.DataAccess.DependencyInjection;
using TodoApp.DataAccess.Persistence;
using TodoApp.Services.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var jwtSigningKey = builder.Configuration["Jwt:SigningKey"];

if (string.IsNullOrWhiteSpace(jwtSigningKey))
{
    throw new InvalidOperationException(
        "JWT signing key is missing from configuration. " +
        "Set it with the Jwt__SigningKey environment variable.");
}

builder.Services.AddControllers();
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
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
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
            }
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
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

app.MapControllers();

app.Run();
