using api.DTOs;
using api.Models;

namespace api.Services;

public interface IStrategyService
{
    IEnumerable<StrategyDto> GetStrategies(string? category, string? riskLevel);
    StrategyDto? GetStrategy(int id);
}

public class StrategyService : IStrategyService
{
    private readonly AppDbContext _context;

    public StrategyService(AppDbContext context)
    {
        _context = context;
    }

    public IEnumerable<StrategyDto> GetStrategies(string? category, string? riskLevel)
    {
        var query = _context.Strategies.Where(s => s.IsActive);

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(s => s.Category == category);
        }

        if (!string.IsNullOrEmpty(riskLevel) && Enum.TryParse<RiskLevel>(riskLevel, true, out var parsedRisk))
        {
            query = query.Where(s => s.RiskLevel == parsedRisk.ToString());
        }

        return query.Select(s => new StrategyDto
        {
            Id = s.Id,
            Name = s.Name,
            Category = s.Category,
            RiskLevel = s.RiskLevel.ToString(),
            ReturnPercentage = s.ReturnPercentage,
            MinCapital = s.MinCapital
        }).ToList();
    }

    public StrategyDto? GetStrategy(int id)
    {
        var s = _context.Strategies.FirstOrDefault(s => s.Id == id && s.IsActive);
        if (s != null)
        {
            return new StrategyDto
            {
                Id = s.Id,
                Name = s.Name,
                Category = s.Category,
                RiskLevel = s.RiskLevel.ToString(),
                ReturnPercentage = s.ReturnPercentage,
                MinCapital = s.MinCapital
            };
        }
        return null;
    }

    private StrategyDto MapToDto(Strategy s) => new StrategyDto
    {
        Id = s.Id,
        Name = s.Name,
        Category = s.Category,
        RiskLevel = s.RiskLevel.ToString(),
        ReturnPercentage = s.ReturnPercentage,
        MinCapital = s.MinCapital
    };
}
