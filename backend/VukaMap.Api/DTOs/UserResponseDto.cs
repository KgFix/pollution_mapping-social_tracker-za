namespace VukaMap.Api.DTOs;

/// <summary>
/// Response shape for user data — matches the frontend UserProfile interface.
/// </summary>
public class UserResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public int EcoCredits { get; set; }
    public int WasteRemoved { get; set; }
    public int Rank { get; set; }
    public string City { get; set; } = string.Empty;
    public string JoinedAt { get; set; } = string.Empty;
}
