using System.ComponentModel.DataAnnotations;

namespace VukaMap.Api.DTOs;

/// <summary>
/// DTO for creating a new hotspot report. Accepts multipart form data (image + metadata).
/// </summary>
public class CreateHotspotDto
{
    [Required]
    public double Latitude { get; set; }

    [Required]
    public double Longitude { get; set; }

    [Required, MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string ReportedBy { get; set; } = string.Empty;

    /// <summary>The "before" photo of the pollution spot</summary>
    public IFormFile? Image { get; set; }
}
