using Microsoft.AspNetCore.Mvc;
using TodoApp.Interfaces.Services;

namespace TodoApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController(IHealthService healthService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var response = await healthService.GetHealthAsync(cancellationToken);

        return response.Status == ApplicationHealthStatuses.Ok
            ? Ok(response)
            : StatusCode(StatusCodes.Status503ServiceUnavailable, response);
    }
}
