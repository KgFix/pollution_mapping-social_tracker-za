using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VukaMap.Api.Data;
using VukaMap.Api.DTOs;
using VukaMap.Api.Utilities;

namespace VukaMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public LeaderboardController(AppDbContext context)
    {
        _context = context;
    }

    // ─── GET /api/leaderboard/users?timeFilter= ─────────────

    /// <summary>
    /// Ranked list of users by eco-credits. Supports optional time filter.
    /// </summary>
    [HttpGet("users")]
    public async Task<ActionResult<List<UserResponseDto>>> GetUsers([FromQuery] string? timeFilter)
    {
        var users = await _context.Users
            .OrderByDescending(u => u.EcoCredits)
            .Take(20)
            .ToListAsync();

        // Apply time-based credit multiplier as temporary approximation
        // (until we have proper activity date tracking)
        double multiplier = timeFilter?.ToLower() switch
        {
            "24h"    => 0.05,
            "weekly" => 0.2,
            _        => 1.0,
        };

        var ranked = users.Select((u, i) => new UserResponseDto
        {
            Id = u.Id,
            Name = u.Name,
            Avatar = u.Avatar,
            EcoCredits = (int)Math.Round(u.EcoCredits * multiplier),
            WasteRemoved = (int)Math.Round(u.WasteRemoved * multiplier),
            Rank = i + 1,
            City = u.City,
            JoinedAt = u.JoinedAt.ToString("yyyy-MM-dd"),
        }).ToList();

        return Ok(ranked);
    }

    // ─── GET /api/leaderboard/cities ─────────────────────────

    /// <summary>
    /// City purity scores computed from hotspot data.
    /// LINQ: group hotspots by city, calculate resolvedCount / totalCount * 100.
    /// </summary>
    [HttpGet("cities")]
    public async Task<ActionResult<List<CityScoreDto>>> GetCities()
    {
        var cities = await _context.Hotspots
            .GroupBy(h => h.City)
            .Select(g => new CityScoreDto
            {
                City = g.Key,
                TotalSpots = g.Count(),
                Resolved = g.Count(h => h.Resolved),
                Score = (int)Math.Round(g.Count(h => h.Resolved) * 100.0 / g.Count()),
            })
            .OrderByDescending(c => c.Score)
            .ToListAsync();

        // Calculate a pseudo-trend (positive for high scores, slight random variation)
        var random = new Random(42); // deterministic seed for consistency
        foreach (var city in cities)
        {
            var trendValue = Math.Round((city.Score - 50) * 0.05 + random.NextDouble() * 2, 1);
            city.Trend = trendValue >= 0 ? $"+{trendValue}%" : $"{trendValue}%";
        }

        return Ok(cities);
    }

    // ─── GET /api/leaderboard/nearby?lat=&lng= ───────────────

    /// <summary>
    /// Users near a given GPS location, filtered by city proximity.
    /// </summary>
    [HttpGet("nearby")]
    public async Task<ActionResult<List<UserResponseDto>>> GetNearby(
        [FromQuery] double lat,
        [FromQuery] double lng)
    {
        // Map of city center coordinates for proximity matching
        var cityCenters = new Dictionary<string, (double lat, double lng)>
        {
            ["Johannesburg"] = (-26.2041, 28.0473),
            ["Cape Town"]    = (-33.9249, 18.4241),
            ["Durban"]       = (-29.8587, 31.0218),
            ["Pretoria"]     = (-25.7479, 28.2293),
            ["Port Elizabeth"] = (-33.9180, 25.5701),
            ["Bloemfontein"] = (-29.0852, 26.1596),
            ["East London"]  = (-33.0153, 27.9116),
            ["Polokwane"]    = (-23.9045, 29.4689),
            ["Nelspruit"]    = (-25.4753, 30.9694),
        };

        // Find the nearest city to the given coordinates
        var nearestCity = cityCenters
            .OrderBy(c => DistanceCalculator.GetDistanceKm(lat, lng, c.Value.lat, c.Value.lng))
            .First();

        var users = await _context.Users
            .Where(u => u.City == nearestCity.Key)
            .OrderByDescending(u => u.EcoCredits)
            .Take(10)
            .ToListAsync();

        // Compute rank relative to all users
        var allUserCredits = await _context.Users
            .OrderByDescending(u => u.EcoCredits)
            .Select(u => u.Id)
            .ToListAsync();

        var ranked = users.Select(u => new UserResponseDto
        {
            Id = u.Id,
            Name = u.Name,
            Avatar = u.Avatar,
            EcoCredits = u.EcoCredits,
            WasteRemoved = u.WasteRemoved,
            Rank = allUserCredits.IndexOf(u.Id) + 1,
            City = u.City,
            JoinedAt = u.JoinedAt.ToString("yyyy-MM-dd"),
        }).ToList();

        return Ok(ranked);
    }
}
