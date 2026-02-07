namespace VukaMap.Api.DTOs;

/// <summary>
/// Response shape for a cleanup event — matches the frontend CleanupEvent interface.
/// </summary>
public class EventResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public double Lat { get; set; }
    public double Lng { get; set; }
    public string ExpectedImpact { get; set; } = string.Empty;
    public int Attendees { get; set; }
    public int MaxAttendees { get; set; }
    public string Description { get; set; } = string.Empty;
}
