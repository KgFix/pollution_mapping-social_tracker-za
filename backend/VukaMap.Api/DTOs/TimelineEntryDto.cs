namespace VukaMap.Api.DTOs;

/// <summary>
/// Response shape for timeline entries — matches the frontend TimelineEntry interface.
/// </summary>
public class TimelineEntryDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // "report" | "cleanup" | "event" | "badge"
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public int EcoCredits { get; set; }
}
