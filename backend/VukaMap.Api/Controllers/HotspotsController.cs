using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VukaMap.Api.Data;
using VukaMap.Api.DTOs;
using VukaMap.Api.Models;

namespace VukaMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotspotsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public HotspotsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // ─── GET /api/hotspots?city= ─────────────────────────────

    /// <summary>
    /// Returns all pollution hotspots. Optionally filterable by city name.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<HotspotResponseDto>>> GetAll([FromQuery] string? city)
    {
        var query = _context.Hotspots.AsQueryable();

        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(h => h.City.ToLower() == city.ToLower());

        var hotspots = await query
            .OrderByDescending(h => h.ReportedAt)
            .Select(h => MapToDto(h))
            .ToListAsync();

        return Ok(hotspots);
    }

    // ─── GET /api/hotspots/{id} ──────────────────────────────

    /// <summary>
    /// Returns a single hotspot by ID.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<HotspotResponseDto>> GetById(int id)
    {
        var hotspot = await _context.Hotspots.FindAsync(id);

        if (hotspot is null)
            return NotFound(new { message = $"Hotspot {id} not found." });

        return Ok(MapToDto(hotspot));
    }

    // ─── POST /api/hotspots ──────────────────────────────────

    /// <summary>
    /// Creates a new pollution report. Accepts multipart/form-data with optional image.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<HotspotResponseDto>> Create([FromForm] CreateHotspotDto dto)
    {
        // Save uploaded image if provided
        string? imageUrl = null;
        if (dto.Image is not null && dto.Image.Length > 0)
        {
            imageUrl = await SaveImageAsync(dto.Image);
        }

        // Auto-generate severity (30-90 range, matching the frontend AI simulation)
        var random = new Random();
        var severity = random.Next(30, 91);

        // Calculate eco-credits based on severity (matching frontend formula)
        var ecoCredits = (int)Math.Round(severity * 0.6 + random.Next(0, 16));

        var hotspot = new Hotspot
        {
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Description = dto.Description,
            City = dto.City,
            ReportedBy = dto.ReportedBy,
            ReportedAt = DateTime.UtcNow,
            Severity = severity,
            EcoCredits = ecoCredits,
            Resolved = false,
            ImageBeforeUrl = imageUrl,
        };

        _context.Hotspots.Add(hotspot);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = hotspot.Id },
            MapToDto(hotspot)
        );
    }

    // ─── POST /api/hotspots/resolve/{id} ─────────────────────

    /// <summary>
    /// Marks a hotspot as cleaned/resolved.
    /// Saves after-image, awards eco-credits.
    /// </summary>
    [HttpPost("resolve/{id:int}")]
    public async Task<IActionResult> Resolve(int id, [FromForm] ResolveHotspotDto dto)
    {
        var hotspot = await _context.Hotspots.FindAsync(id);

        if (hotspot is null)
            return NotFound(new { message = $"Hotspot {id} not found." });

        if (hotspot.Resolved)
            return BadRequest(new { message = "This hotspot has already been resolved." });

        // Simulated "AI processing" delay (the flagship fudge)
        await Task.Delay(3000);

        // Save after-image if provided
        if (dto.AfterImage is not null && dto.AfterImage.Length > 0)
        {
            hotspot.ImageAfterUrl = await SaveImageAsync(dto.AfterImage);
        }

        // Resolve the hotspot
        hotspot.Resolved = true;
        hotspot.ClaimedBy = "Anonymous";  // TODO: replace with authenticated user

        // Award eco-credits to the first user (temporary until auth is added)
        var firstUser = await _context.Users.FirstOrDefaultAsync();
        if (firstUser is not null)
        {
            firstUser.EcoCredits += hotspot.EcoCredits;
            firstUser.WasteRemoved += (int)Math.Round(hotspot.EcoCredits * 0.5);

            // Create a timeline entry for the cleanup
            _context.TimelineEntries.Add(new TimelineEntry
            {
                UserId = firstUser.Id,
                Type = TimelineType.Cleanup,
                Title = "Cleaned Hotspot",
                Description = $"Resolved: {hotspot.Description}",
                Date = DateTime.UtcNow,
                EcoCredits = hotspot.EcoCredits,
            });
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Area Cleaned! +{hotspot.EcoCredits} Credits",
            ecoCredits = hotspot.EcoCredits,
        });
    }

    // ─── Helpers ─────────────────────────────────────────────

    /// <summary>
    /// Saves an uploaded image to wwwroot/images/ and returns the relative URL.
    /// </summary>
    private async Task<string> SaveImageAsync(IFormFile file)
    {
        var uploadsDir = Path.Combine(_env.WebRootPath, "images");
        Directory.CreateDirectory(uploadsDir);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var filename = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, filename);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/images/{filename}";
    }

    /// <summary>
    /// Maps a Hotspot entity to the frontend-friendly DTO (lat/lng naming convention).
    /// </summary>
    private static HotspotResponseDto MapToDto(Hotspot h) => new()
    {
        Id = h.Id,
        Lat = h.Latitude,
        Lng = h.Longitude,
        Severity = h.Severity,
        Resolved = h.Resolved,
        ReportedBy = h.ReportedBy,
        ReportedAt = h.ReportedAt.ToString("yyyy-MM-dd"),
        Description = h.Description,
        City = h.City,
        EcoCredits = h.EcoCredits,
        ClaimedBy = h.ClaimedBy,
        ImageBeforeUrl = h.ImageBeforeUrl,
        ImageAfterUrl = h.ImageAfterUrl,
    };
}
