using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VukaMap.Api.Data;
using VukaMap.Api.DTOs;
using VukaMap.Api.Models;
using VukaMap.Api.Services;

namespace VukaMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotspotsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;
    private readonly ImageAnalysisService _analysisService;
    private readonly ILogger<HotspotsController> _logger;

    public HotspotsController(
        AppDbContext context,
        IWebHostEnvironment env,
        ImageAnalysisService analysisService,
        ILogger<HotspotsController> logger)
    {
        _context = context;
        _env = env;
        _analysisService = analysisService;
        _logger = logger;
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
    /// Analyzes image with AI to determine dirtiness and extract metadata.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<HotspotResponseDto>> Create([FromForm] CreateHotspotDto dto)
    {
        // Step 1: AI Analysis with EXIF extraction (if image provided)
        ImageAnalysisResult? analysisResult = null;
        string? imageUrl = null;

        if (dto.Image is not null && dto.Image.Length > 0)
        {
            // Analyze image before saving
            analysisResult = await _analysisService.AnalyzeDirtyImageAsync(
                dto.Image,
                dto.Latitude,
                dto.Longitude);

            // Save image after analysis
            imageUrl = await SaveImageAsync(dto.Image);

            _logger.LogInformation(
                "Image analyzed: Dirtiness={Dirtiness}%, Method={Method}, GPS={HasGps}",
                analysisResult.DirtinessPercentage,
                analysisResult.AnalysisMethod,
                analysisResult.GpsValidated);
        }

        // Step 2: Use AI dirtiness or fallback to random
        var severity = analysisResult?.DirtinessPercentage ?? Random.Shared.Next(30, 91);
        var ecoCredits = analysisResult?.EcoCredits ?? (int)Math.Round(severity * 0.6 + Random.Shared.Next(0, 16));

        // Step 3: Create hotspot with all metadata
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

            // Store AI analysis metadata
            AiDirtiness = analysisResult?.DirtinessPercentage,
            AnalysisMethod = analysisResult?.AnalysisMethod ?? "No image provided",
            GpsValidated = analysisResult?.GpsValidated,
            ExifLatitude = analysisResult?.Metadata?.Latitude,
            ExifLongitude = analysisResult?.Metadata?.Longitude,
            HasExifGps = analysisResult?.Metadata?.HasGps ?? false,
            ExifDateTaken = analysisResult?.Metadata?.DateTaken,
            CameraInfo = analysisResult?.Metadata != null
                ? $"{analysisResult.Metadata.CameraMake} {analysisResult.Metadata.CameraModel}".Trim()
                : null,
            Software = analysisResult?.Metadata?.Software,
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
    /// Verifies cleanup with AI: checks same location and cleanliness.
    /// </summary>
    [HttpPost("resolve/{id:int}")]
    public async Task<IActionResult> Resolve(int id, [FromForm] ResolveHotspotDto dto)
    {
        var hotspot = await _context.Hotspots.FindAsync(id);

        if (hotspot is null)
            return NotFound(new { message = $"Hotspot {id} not found." });

        if (hotspot.Resolved)
            return BadRequest(new { message = "This hotspot has already been resolved." });

        // Step 1: AI Cleanup Verification (if image provided)
        CleanupVerificationResult? verificationResult = null;
        string? afterImageUrl = null;

        if (dto.AfterImage is not null && dto.AfterImage.Length > 0)
        {
            // Verify cleanup with AI during the "processing" delay
            verificationResult = await _analysisService.VerifyCleanupImageAsync(
                dto.AfterImage,
                hotspot.Latitude,
                hotspot.Longitude,
                hotspot.ImageBeforeUrl);

            // Save after-image
            afterImageUrl = await SaveImageAsync(dto.AfterImage);

            _logger.LogInformation(
                "Cleanup verified for hotspot {Id}: SameLocation={SameLocation}, Clean={Cleanliness}%, Method={Method}",
                id,
                verificationResult.IsSameLocation,
                verificationResult.CleanlinessScore,
                verificationResult.AnalysisMethod);

            // Optional: Reject if verification failed (uncomment to enforce strict verification)
            // if (!verificationResult.IsVerified)
            // {
            //     return BadRequest(new { message = verificationResult.VerificationMessage });
            // }
        }
        else
        {
            // No image provided - still allow but log warning
            _logger.LogWarning("Cleanup for hotspot {Id} submitted without after-image", id);
        }

        // Simulated "AI processing" delay (maintains UX consistency)
        await Task.Delay(3000);

        // Step 2: Update hotspot with verification data
        hotspot.ImageAfterUrl = afterImageUrl;
        hotspot.Resolved = true;
        hotspot.ClaimedBy = "Anonymous"; // TODO: replace with authenticated user

        // Store verification results
        if (verificationResult != null)
        {
            hotspot.CleanlinessScore = verificationResult.CleanlinessScore;
            hotspot.LocationMatchDistance = verificationResult.DistanceFromOriginal;
            hotspot.CleanupLocationVerified = verificationResult.IsSameLocation;
        }

        // Step 3: Award eco-credits to the first user (temporary until auth is added)
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
            verified = verificationResult?.IsVerified ?? false,
            cleanliness = verificationResult?.CleanlinessScore,
            verificationMessage = verificationResult?.VerificationMessage,
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
