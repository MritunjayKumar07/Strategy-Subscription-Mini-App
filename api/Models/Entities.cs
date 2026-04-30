using System.ComponentModel.DataAnnotations.Schema;
namespace api.Models;

public enum RiskLevel
{
    Low,
    Medium,
    High
}

public enum SubscriptionStatus
{
    Active,
    Paused,
    Cancelled
}

public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal AvailableCapital { get; set; }
}

public class Strategy
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Category { get; set; }

    [Column("risk_level")]
    public string RiskLevel { get; set; }

    [Column("return_percentage")]
    public decimal ReturnPercentage { get; set; }

    [Column("min_capital")]
    public decimal MinCapital { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; }
}

public class Subscription
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int StrategyId { get; set; }
    public decimal AllocatedCapital { get; set; }
    public SubscriptionStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User? User { get; set; }
    public Strategy? Strategy { get; set; }
}
