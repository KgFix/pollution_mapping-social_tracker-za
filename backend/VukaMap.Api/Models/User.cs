using System.ComponentModel.DataAnnotations;

namespace VukaMap.Api.Models;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>2-letter avatar initials (e.g. "TM")</summary>
    [Required, MaxLength(5)]
    public string Avatar { get; set; } = string.Empty;

    public int EcoCredits { get; set; }

    /// <summary>Total kg of waste removed</summary>
    public int WasteRemoved { get; set; }

    [Required, MaxLength(100)]
    public string City { get; set; } = string.Empty;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<TimelineEntry> TimelineEntries { get; set; } = new List<TimelineEntry>();
    public ICollection<EventRegistration> EventRegistrations { get; set; } = new List<EventRegistration>();
}
