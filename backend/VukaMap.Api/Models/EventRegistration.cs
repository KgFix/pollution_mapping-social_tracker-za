namespace VukaMap.Api.Models;

/// <summary>
/// Join table: tracks which users have registered for which cleanup events.
/// </summary>
public class EventRegistration
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int CleanupEventId { get; set; }
    public CleanupEvent CleanupEvent { get; set; } = null!;

    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
}
