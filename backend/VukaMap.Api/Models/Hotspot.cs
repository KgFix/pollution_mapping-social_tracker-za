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

    // ===== Image Metadata & AI Analysis Fields =====

    /// <summary>Latitude extracted from image EXIF data (may differ from user-submitted)</summary>
    public double? ExifLatitude { get; set; }

    /// <summary>Longitude extracted from image EXIF data (may differ from user-submitted)</summary>
    public double? ExifLongitude { get; set; }

    /// <summary>Whether GPS coordinates were found in image EXIF</summary>
    public bool HasExifGps { get; set; }

    /// <summary>Timestamp from image EXIF (when photo was actually taken)</summary>
    public DateTime? ExifDateTaken { get; set; }

    /// <summary>Camera/device make and model from EXIF</summary>
    [MaxLength(200)]
    public string? CameraInfo { get; set; }

    /// <summary>Software used (detects if image was edited)</summary>
    [MaxLength(100)]
    public string? Software { get; set; }

    /// <summary>AI-calculated dirtiness percentage (0-100)</summary>
    public int? AiDirtiness { get; set; }

    /// <summary>Method used for analysis (e.g., "Azure Computer Vision", "Fallback")</summary>
    [MaxLength(100)]
    public string? AnalysisMethod { get; set; }

    /// <summary>Whether EXIF GPS matched user-submitted GPS (within threshold)</summary>
    public bool? GpsValidated { get; set; }

    // ===== Cleanup Verification Fields =====

    /// <summary>AI-calculated cleanliness score after cleanup (0-100)</summary>
    public int? CleanlinessScore { get; set; }

    /// <summary>Distance in km between before and after image GPS</summary>
    public double? LocationMatchDistance { get; set; }

    /// <summary>Whether cleanup was verified as same location</summary>
    public bool? CleanupLocationVerified { get; set; }
}
