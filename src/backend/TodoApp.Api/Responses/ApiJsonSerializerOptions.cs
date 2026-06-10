using System.Text.Encodings.Web;
using System.Text.Json;

namespace TodoApp.Api.Responses;

public static class ApiJsonSerializerOptions
{
    public static readonly JsonSerializerOptions Default = new()
    {
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
}
