using System.ComponentModel.DataAnnotations;

namespace VukaMap.Api.Models;

public class Hotspot
{
    public int Id { get; set; }

    [Required]
    public double Latitude { get; set; }

    [Required]
    public double Longitude { get; set; }

    /// <summary>Pollution severity from 0-100</summary>
    [Range(0, 100)]
    public int Severity { get; set; }

    public bool Resolved { get; set; } = false;

    [Required, MaxLength(100)]
    public string ReportedBy { get; set; } = string.Empty;

    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;

    [Required, MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string City { get; set; } = string.Empty;

    /// <summary>Eco-credits awarded for reporting/resolving this spot</summary>
    public int EcoCredits { get; set; }

    /// <summary>User who claimed/resolved this hotspot</summary>
    [MaxLength(100)]
    public string? ClaimedBy { get; set; }

    /// <summary>Path to the "before" image in wwwroot/images/</summary>
    [MaxLength(500)]
    public string? ImageBeforeUrl { get; set; }

    /// <summary>Path to the "after" image uploaded on resolution</summary>
    [MaxLength(500)]
    public string? ImageAfterUrl { get; set; }
}
