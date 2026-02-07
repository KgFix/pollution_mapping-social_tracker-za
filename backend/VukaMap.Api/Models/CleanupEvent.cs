using System.ComponentModel.DataAnnotations;

namespace VukaMap.Api.Models;

public class CleanupEvent
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public DateTime Date { get; set; }

    /// <summary>Time string like "08:00"</summary>
    [Required, MaxLength(10)]
    public string Time { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string Location { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string City { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    [MaxLength(200)]
    public string ExpectedImpact { get; set; } = string.Empty;

    public int Attendees { get; set; }
    public int MaxAttendees { get; set; }

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    // Navigation
    public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
}
