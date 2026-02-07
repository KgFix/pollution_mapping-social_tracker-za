using System.ComponentModel.DataAnnotations;

namespace VukaMap.Api.Models;

public enum TimelineType
{
    Report,
    Cleanup,
    Event,
    Badge
}

public class TimelineEntry
{
    public int Id { get; set; }

    /// <summary>Foreign key to the user who performed the action</summary>
    public int UserId { get; set; }

    public TimelineType Type { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public DateTime Date { get; set; } = DateTime.UtcNow;

    public int EcoCredits { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
