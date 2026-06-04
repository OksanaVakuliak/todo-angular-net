using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApp.DataAccess.Persistence;

namespace TodoApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController(TodoAppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var databaseAvailable = await dbContext.Database.CanConnectAsync(cancellationToken);

        var response = new
        {
            status = databaseAvailable ? "ok" : "degraded",
            service = "TodoApp.Api",
            database = databaseAvailable ? "available" : "unavailable"
        };

        return databaseAvailable
            ? Ok(response)
            : StatusCode(StatusCodes.Status503ServiceUnavailable, response);
    }
}
