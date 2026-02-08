using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VukaMap.Api.Data;
using VukaMap.Api.DTOs;
using VukaMap.Api.Models;

namespace VukaMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfileController(AppDbContext context)
    {
        _context = context;
    }

    // ─── GET /api/profile/{userId} ───────────────────────────

    /// <summary>
    /// Returns a user profile with dynamically computed rank.
    /// Rank = count of users with higher credits + 1.
    /// </summary>
    [HttpGet("{userId:int}")]
    public async Task<ActionResult<UserResponseDto>> GetProfile(int userId)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user is null)
            return NotFound(new { message = $"User {userId} not found." });

        // Compute rank: how many users have more credits than this user + 1
        var rank = await _context.Users.CountAsync(u => u.EcoCredits > user.EcoCredits) + 1;

        return Ok(new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Avatar = user.Avatar,
            EcoCredits = user.EcoCredits,
            WasteRemoved = user.WasteRemoved,
            Rank = rank,
            City = user.City,
            JoinedAt = user.JoinedAt.ToString("yyyy-MM-dd"),
        });
    }

    // ─── GET /api/profile/{userId}/timeline ──────────────────

    /// <summary>
    /// Returns a user's activity timeline, sorted by most recent.
    /// </summary>
    [HttpGet("{userId:int}/timeline")]
    public async Task<ActionResult<List<TimelineEntryDto>>> GetTimeline(int userId)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            return NotFound(new { message = $"User {userId} not found." });

        var timeline = await _context.TimelineEntries
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .Select(t => new TimelineEntryDto
            {
                Id = t.Id,
                Type = t.Type.ToString().ToLower(),
                Title = t.Title,
                Description = t.Description,
                Date = t.Date.ToString("yyyy-MM-dd"),
                EcoCredits = t.EcoCredits,
            })
            .ToListAsync();

        return Ok(timeline);
    }
}
