using Microsoft.EntityFrameworkCore;
using VukaMap.Api.Models;

namespace VukaMap.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Hotspot> Hotspots => Set<Hotspot>();
    public DbSet<User> Users => Set<User>();
    public DbSet<CleanupEvent> CleanupEvents => Set<CleanupEvent>();
    public DbSet<TimelineEntry> TimelineEntries => Set<TimelineEntry>();
    public DbSet<EventRegistration> EventRegistrations => Set<EventRegistration>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Hotspot — index on City for filtered queries
        modelBuilder.Entity<Hotspot>(entity =>
        {
            entity.HasIndex(h => h.City);
            entity.HasIndex(h => h.Resolved);
        });

        // User — index on EcoCredits for leaderboard sorting
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.EcoCredits);
            entity.HasIndex(u => u.City);
        });

        // TimelineEntry — FK to User
        modelBuilder.Entity<TimelineEntry>(entity =>
        {
            entity.HasOne(t => t.User)
                  .WithMany(u => u.TimelineEntries)
                  .HasForeignKey(t => t.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(t => t.UserId);
            entity.HasIndex(t => t.Date);
        });

        // EventRegistration — composite unique index (one registration per user per event)
        modelBuilder.Entity<EventRegistration>(entity =>
        {
            entity.HasOne(er => er.User)
                  .WithMany(u => u.EventRegistrations)
                  .HasForeignKey(er => er.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(er => er.CleanupEvent)
                  .WithMany(e => e.Registrations)
                  .HasForeignKey(er => er.CleanupEventId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(er => new { er.UserId, er.CleanupEventId }).IsUnique();
        });
    }
}
