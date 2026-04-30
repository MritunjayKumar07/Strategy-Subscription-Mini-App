using api.Models;

namespace api.DTOs;

public class StrategyDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Category { get; set; }
    public string RiskLevel { get; set; }
    public decimal ReturnPercentage { get; set; }
    public decimal MinCapital { get; set; }
}

public class SubscriptionDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public StrategyDto Strategy { get; set; }
    public decimal AllocatedCapital { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSubscriptionDto
{
    public int StrategyId { get; set; }
    public decimal AllocatedCapital { get; set; }
}

public class UpdateSubscriptionDto
{
    public SubscriptionStatus Status { get; set; }
}
