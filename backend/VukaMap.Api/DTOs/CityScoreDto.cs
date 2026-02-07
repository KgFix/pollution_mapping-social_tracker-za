namespace VukaMap.Api.DTOs;

/// <summary>
/// City purity score for the leaderboard — matches the frontend CITY_SCORES shape.
/// </summary>
public class CityScoreDto
{
    public string City { get; set; } = string.Empty;
    public int Score { get; set; }
    public string Trend { get; set; } = string.Empty;
    public int TotalSpots { get; set; }
    public int Resolved { get; set; }
}
