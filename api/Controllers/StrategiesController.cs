using api.DTOs;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StrategiesController : ControllerBase
{
    private readonly IStrategyService _strategyService;

    public StrategiesController(IStrategyService strategyService)
    {
        _strategyService = strategyService;
    }

    [HttpGet]
    public ActionResult<IEnumerable<StrategyDto>> GetStrategies([FromQuery] string? category, [FromQuery] string? riskLevel)
    {
        return Ok(_strategyService.GetStrategies(category, riskLevel));
    }

    [HttpGet("{id}")]
    public ActionResult<StrategyDto> GetStrategy(int id)
    {
        var strategy = _strategyService.GetStrategy(id);
        if (strategy == null)
        {
            return NotFound(new { Error = "Strategy not found" });
        }
        return Ok(strategy);
    }
}
