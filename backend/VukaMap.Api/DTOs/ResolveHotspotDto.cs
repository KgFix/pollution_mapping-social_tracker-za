using System.ComponentModel.DataAnnotations;

namespace VukaMap.Api.DTOs;

/// <summary>
/// DTO for resolving (cleaning) a hotspot. Includes GPS for proximity check + after photo.
/// </summary>
public class ResolveHotspotDto
{
    [Required]
    public double Latitude { get; set; }

    [Required]
    public double Longitude { get; set; }

    /// <summary>The "after" photo proving the area was cleaned</summary>
    public IFormFile? AfterImage { get; set; }
}
