using api.DTOs;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public interface ISubscriptionService
{
    (bool IsSuccess, string ErrorMessage, int ErrorCode) CreateSubscription(int userId, CreateSubscriptionDto dto);
    IEnumerable<SubscriptionDto> GetSubscriptions(int userId);
    (bool IsSuccess, string ErrorMessage, int ErrorCode) UpdateSubscriptionStatus(int id, UpdateSubscriptionDto dto);
}

public class SubscriptionService : ISubscriptionService
{
    private readonly AppDbContext _context;

    public SubscriptionService(AppDbContext context)
    {
        _context = context;
    }

    public (bool IsSuccess, string ErrorMessage, int ErrorCode) CreateSubscription(int userId, CreateSubscriptionDto dto)
    {
        var user = _context.Users.FirstOrDefault(u => u.Id == userId);
        if (user == null)
        {
            return (false, "User not found", 404);
        }

        var strategy = _context.Strategies.FirstOrDefault(s => s.Id == dto.StrategyId);
        if (strategy == null || !strategy.IsActive)
        {
            return (false, "Strategy not found or inactive", 404);
        }

        if (dto.AllocatedCapital < strategy.MinCapital)
        {
            return (false, "Allocated capital is less than the strategy minimum capital", 422);
        }

        var activeOrPausedSubscriptions = _context.Subscriptions
            .Where(s => s.UserId == userId && s.Status != SubscriptionStatus.Cancelled)
            .ToList();

        var currentAllocated = activeOrPausedSubscriptions.Sum(s => s.AllocatedCapital);

        if (currentAllocated + dto.AllocatedCapital > user.AvailableCapital)
        {
            return (false, "Total allocated capital exceeds user available capital", 422);
        }

        var hasActiveSubscriptionForStrategy = activeOrPausedSubscriptions
            .Any(s => s.StrategyId == dto.StrategyId && s.Status == SubscriptionStatus.Active);

        if (hasActiveSubscriptionForStrategy)
        {
            return (false, "Duplicate active subscription not allowed for the same strategy", 409);
        }

        var newSub = new Subscription
        {
            UserId = userId,
            StrategyId = dto.StrategyId,
            AllocatedCapital = dto.AllocatedCapital,
            Status = SubscriptionStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Subscriptions.Add(newSub);
        _context.SaveChanges();

        return (true, string.Empty, 201);
    }

    public IEnumerable<SubscriptionDto> GetSubscriptions(int userId)
    {
        return _context.Subscriptions
            .Include(s => s.Strategy)
            .Where(s => s.UserId == userId)
            .Select(s => new SubscriptionDto
            {
                Id = s.Id,
                UserId = s.UserId,
                AllocatedCapital = s.AllocatedCapital,
                Status = s.Status.ToString(),
                CreatedAt = s.CreatedAt,
                Strategy = new StrategyDto
                {
                    Id = s.StrategyId,
                    Name = s.Strategy!.Name,
                    Category = s.Strategy.Category,
                    RiskLevel = s.Strategy.RiskLevel.ToString(),
                    ReturnPercentage = s.Strategy.ReturnPercentage,
                    MinCapital = s.Strategy.MinCapital
                }
            }).ToList();
    }

    public (bool IsSuccess, string ErrorMessage, int ErrorCode) UpdateSubscriptionStatus(int id, UpdateSubscriptionDto dto)
    {
        var sub = _context.Subscriptions.FirstOrDefault(s => s.Id == id);
        if (sub == null)
        {
            return (false, "Subscription not found", 404);
        }

        if (dto.Status == SubscriptionStatus.Active && sub.Status != SubscriptionStatus.Active)
        {
            var hasActiveSubscriptionForStrategy = _context.Subscriptions
                .Any(s => s.UserId == sub.UserId && s.StrategyId == sub.StrategyId && s.Status == SubscriptionStatus.Active && s.Id != sub.Id);

            if (hasActiveSubscriptionForStrategy)
            {
                return (false, "Duplicate active subscription not allowed for the same strategy", 409);
            }
        }

        sub.Status = dto.Status;
        sub.UpdatedAt = DateTime.UtcNow;

        _context.SaveChanges();

        return (true, string.Empty, 200);
    }
}
