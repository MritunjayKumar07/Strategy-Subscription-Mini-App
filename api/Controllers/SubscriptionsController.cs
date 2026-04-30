using api.DTOs;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/subscriptions")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;

    public SubscriptionsController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    [HttpPatch("{id}")]
    public ActionResult UpdateSubscriptionStatus(int id, [FromBody] UpdateSubscriptionDto dto)
    {
        var result = _subscriptionService.UpdateSubscriptionStatus(id, dto);
        
        if (!result.IsSuccess)
        {
            return StatusCode(result.ErrorCode, new { Error = result.ErrorMessage });
        }

        return Ok(new { Message = "Subscription status updated successfully." });
    }
}
