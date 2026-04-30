using api.DTOs;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;

    public UsersController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    [HttpPost("{userId}/subscriptions")]
    public ActionResult CreateSubscription(int userId, [FromBody] CreateSubscriptionDto dto)
    {
        if (dto.AllocatedCapital <= 0)
        {
            return BadRequest(new { Error = "Allocated capital must be greater than zero." });
        }

        var result = _subscriptionService.CreateSubscription(userId, dto);
        
        if (!result.IsSuccess)
        {
            return StatusCode(result.ErrorCode, new { Error = result.ErrorMessage });
        }

        return StatusCode(201, new { Message = "Subscription created successfully." });
    }

    [HttpGet("{userId}/subscriptions")]
    public ActionResult<IEnumerable<SubscriptionDto>> GetSubscriptions(int userId)
    {
        return Ok(_subscriptionService.GetSubscriptions(userId));
    }
}
