namespace VukaMap.Api.DTOs;

/// <summary>
/// Response shape for a hotspot — matches the frontend Hotspot interface in data.ts.
/// </summary>
public class HotspotResponseDto
{
    public int Id { get; set; }
    public double Lat { get; set; }
    public double Lng { get; set; }
    public int Severity { get; set; }
    public bool Resolved { get; set; }
    public string ReportedBy { get; set; } = string.Empty;
    public string ReportedAt { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public int EcoCredits { get; set; }
    public string? ClaimedBy { get; set; }
    public string? ImageBeforeUrl { get; set; }
    public string? ImageAfterUrl { get; set; }
}
