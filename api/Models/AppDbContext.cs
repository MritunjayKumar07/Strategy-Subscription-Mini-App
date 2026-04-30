using Microsoft.EntityFrameworkCore;

namespace api.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Strategy> Strategies { get; set; }
    public DbSet<Subscription> Subscriptions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Subscriptions constraints
        modelBuilder.Entity<Subscription>()
            .Property(s => s.Status)
            .HasConversion<string>();

        // Strategies constraints
        modelBuilder.Entity<Strategy>()
            .Property(s => s.RiskLevel)
            .HasConversion<string>();
    }
}
