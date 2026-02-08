using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VukaMap.Api.Data;
using VukaMap.Api.DTOs;
using VukaMap.Api.Models;

namespace VukaMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly AppDbContext _context;

    public EventsController(AppDbContext context)
    {
        _context = context;
    }

    // ─── GET /api/events ─────────────────────────────────────

    /// <summary>
    /// Returns all cleanup events.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<EventResponseDto>>> GetAll()
    {
        var events = await _context.CleanupEvents
            .OrderBy(e => e.Date)
            .Select(e => MapToDto(e))
            .ToListAsync();

        return Ok(events);
    }

    // ─── GET /api/events/{id} ────────────────────────────────

    /// <summary>
    /// Returns a single cleanup event by ID.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<EventResponseDto>> GetById(int id)
    {
        var ev = await _context.CleanupEvents.FindAsync(id);

        if (ev is null)
            return NotFound(new { message = $"Event {id} not found." });

        return Ok(MapToDto(ev));
    }

    // ─── POST /api/events/{id}/join ──────────────────────────

    /// <summary>
    /// Register a user for a cleanup event.
    /// Checks capacity and duplicate registration.
    /// </summary>
    [HttpPost("{id:int}/join")]
    public async Task<IActionResult> Join(int id, [FromBody] JoinEventRequest request)
    {
        var ev = await _context.CleanupEvents.FindAsync(id);
        if (ev is null)
            return NotFound(new { message = $"Event {id} not found." });

        if (ev.Attendees >= ev.MaxAttendees)
            return BadRequest(new { message = "This event is full." });

        var user = await _context.Users.FindAsync(request.UserId);
        if (user is null)
            return NotFound(new { message = $"User {request.UserId} not found." });

        // Check for duplicate registration
        var alreadyRegistered = await _context.EventRegistrations
            .AnyAsync(er => er.UserId == request.UserId && er.CleanupEventId == id);

        if (alreadyRegistered)
            return BadRequest(new { message = "You are already registered for this event." });

        // Create registration
        _context.EventRegistrations.Add(new EventRegistration
        {
            UserId = request.UserId,
            CleanupEventId = id,
            RegisteredAt = DateTime.UtcNow,
        });

        // Increment attendee count
        ev.Attendees++;

        // Create timeline entry for joining the event
        _context.TimelineEntries.Add(new TimelineEntry
        {
            UserId = request.UserId,
            Type = TimelineType.Event,
            Title = "Joined Cleanup Event",
            Description = $"Registered for: {ev.Title}",
            Date = DateTime.UtcNow,
            EcoCredits = 0,
        });

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Successfully joined!",
            attendees = ev.Attendees,
        });
    }

    // ─── Helpers ─────────────────────────────────────────────

    private static EventResponseDto MapToDto(CleanupEvent e) => new()
    {
        Id = e.Id,
        Title = e.Title,
        Date = e.Date.ToString("yyyy-MM-dd"),
        Time = e.Time,
        Location = e.Location,
        City = e.City,
        Lat = e.Latitude,
        Lng = e.Longitude,
        ExpectedImpact = e.ExpectedImpact,
        Attendees = e.Attendees,
        MaxAttendees = e.MaxAttendees,
        Description = e.Description,
    };
}

/// <summary>
/// Request body for joining an event.
/// </summary>
public class JoinEventRequest
{
    public int UserId { get; set; }
}
