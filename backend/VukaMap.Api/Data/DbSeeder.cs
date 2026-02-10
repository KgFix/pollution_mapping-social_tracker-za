using Microsoft.AspNetCore.Hosting;
using VukaMap.Api.Models;

namespace VukaMap.Api.Data;

/// <summary>
/// Seeds the SQLite database with 150 hotspots spread across South Africa.
/// Uses images from wwwroot/uploads/dirty and wwwroot/uploads/clean folders.
/// - 120 dirty (unresolved) hotspots with 1 dirty image each
/// - 30 clean (resolved) hotspots with 1 dirty (before) and 1 clean (after) image each
/// Only seeds when tables are empty (safe to call on every startup).
/// </summary>
public static class DbSeeder
{
    // South African cities and towns with coordinates (lat, lng, radius for distribution)
    // Expanded to cover all regions and provinces, keeping all hotspots on land within SA borders
    private static readonly (string Name, double Lat, double Lng, double Radius)[] SouthAfricanCities =
    [
        // Gauteng (major urban centers)
        ("Johannesburg", -26.2041, 28.0473, 0.12),
        ("Pretoria", -25.7479, 28.2293, 0.10),
        ("Vereeniging", -26.6496, 27.9269, 0.05),
        
        // Western Cape
        ("Cape Town", -33.9249, 18.4241, 0.12),
        ("George", -33.9608, 22.4617, 0.05),
        ("Paarl", -33.7341, 18.9645, 0.04),
        ("Worcester", -33.6464, 19.4483, 0.04),
        
        // KwaZulu-Natal
        ("Durban", -29.8587, 31.0218, 0.10),
        ("Pietermaritzburg", -29.6009, 30.3794, 0.06),
        ("Richards Bay", -28.7831, 32.0378, 0.05),
        
        // Eastern Cape
        ("Port Elizabeth", -33.9180, 25.5701, 0.08),
        ("East London", -33.0153, 27.9116, 0.06),
        ("Mthatha", -31.5887, 28.7842, 0.05),
        ("Grahamstown", -33.3042, 26.5328, 0.04),
        
        // Free State
        ("Bloemfontein", -29.0852, 26.1596, 0.08),
        ("Welkom", -27.9772, 26.7050, 0.05),
        
        // Northern Cape
        ("Kimberley", -28.7320, 24.7499, 0.06),
        ("Upington", -28.4478, 21.2561, 0.05),
        
        // North West
        ("Rustenburg", -25.6672, 27.2423, 0.05),
        ("Mahikeng", -25.8631, 25.6437, 0.05),
        
        // Mpumalanga
        ("Nelspruit", -25.4753, 30.9694, 0.06),
        ("Witbank", -25.8738, 29.2333, 0.05),
        
        // Limpopo
        ("Polokwane", -23.9045, 29.4689, 0.06),
        ("Tzaneen", -23.8329, 30.1630, 0.05)
    ];

    private static readonly string[] DirtyImageFiles =
    [
        "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg",
        "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg", "19.jpg", "20.jpg",
        "21.jpg", "22.jpg", "23.jpg", "24.jpg", "25.jpg", "26.jpg", "27.jpg", "28.jpg", "29.jpg", "30.jpg",
        "31.jpg", "Untitled.jpg"
    ];

    private static readonly string[] CleanImageFiles =
    [
        "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg"
    ];

    public static async Task SeedAsync(AppDbContext db, IWebHostEnvironment env)
    {
        // Users must be saved first so their auto-generated IDs exist for FK references
        if (!db.Users.Any())
        {
            db.Users.AddRange(GetUsers());
            await db.SaveChangesAsync();
        }

        bool changed = false;

        if (!db.Hotspots.Any())
        {
            db.Hotspots.AddRange(GetHotspots());
            changed = true;
        }

        if (!db.CleanupEvents.Any())
        {
            db.CleanupEvents.AddRange(GetCleanupEvents());
            changed = true;
        }

        if (changed)
        {
            await db.SaveChangesAsync();
        }

        // Timeline entries reference UserId — seed after users are committed
        if (!db.TimelineEntries.Any())
        {
            var firstUser = db.Users.OrderBy(u => u.Id).First();
            var entries = GetTimelineEntries(firstUser.Id);
            db.TimelineEntries.AddRange(entries);
            await db.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Generates a random coordinate near a city center with the specified radius.
    /// Uses normal distribution for more natural clustering.
    /// </summary>
    private static (double Lat, double Lng) GenerateRandomCoordinate(Random rng, double centerLat, double centerLng, double radius)
    {
        // Use Box-Muller transform for normal distribution
        var u1 = 1.0 - rng.NextDouble();
        var u2 = 1.0 - rng.NextDouble();
        var randStdNormal = Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);
        
        var angle = rng.NextDouble() * 2 * Math.PI;
        var distance = Math.Abs(randStdNormal) * radius * 0.5; // 0.5 to keep most within radius
        
        var lat = centerLat + (distance * Math.Cos(angle));
        var lng = centerLng + (distance * Math.Sin(angle));
        
        return (lat, lng);
    }

    /// <summary>
    /// Generates a random severity between 30 and 95.
    /// </summary>
    private static int GenerateRandomSeverity(Random rng) => rng.Next(30, 96);

    private static readonly string[] PollutionDescriptions =
    [
        "Illegal dumping site", "Plastic waste accumulation", "Construction debris", 
        "Overflowing waste bins", "Littering on sidewalks", "Industrial waste dumping",
        "Hazardous materials", "Tyre dumping area", "Food waste accumulation", 
        "Electronic waste pile", "Medical waste concern", "Oil spill residue",
        "Broken glass scattered", "Metal scrap dumping", "Textile waste", 
        "Packaging materials littered", "Garden waste dumping", "Paint containers dumped",
        "Chemical containers", "Building rubble", "Furniture dumping", "Appliance waste",
        "Vehicle parts scattered", "Mattress dumping", "Shopping trolleys abandoned"
    ];

    private static readonly string[] ReporterNames =
    [
        "Thabo M.", "Ayanda K.", "Sipho N.", "Naledi T.", "Pieter V.", "Fatima A.",
        "Bongani S.", "Priya N.", "Themba G.", "Zanele D.", "Johan B.", "Lerato P.",
        "Ahmed R.", "Nomsa T.", "Kofi A.", "Linda F.", "Tshepo M.", "Anele K.",
        "Megan S.", "Kagiso B.", "Refilwe N.", "Vusi M.", "Mpho L.", "Thandeka S."
    ];

    // ──────────────────────────────────────────────
    //  Users — mirrors MOCK_USERS from data.ts
    // ──────────────────────────────────────────────
    private static List<User> GetUsers() =>
    [
        new() { Name = "Thabo Molefe",      Avatar = "TM", EcoCredits = 2450, WasteRemoved = 156, City = "Johannesburg",  JoinedAt = DateTime.Parse("2025-06-15") },
        new() { Name = "Ayanda Mthembu",    Avatar = "AM", EcoCredits = 2180, WasteRemoved = 134, City = "Cape Town",     JoinedAt = DateTime.Parse("2025-07-22") },
        new() { Name = "Sipho Nkosi",       Avatar = "SN", EcoCredits = 1920, WasteRemoved = 118, City = "Durban",        JoinedAt = DateTime.Parse("2025-08-10") },
        new() { Name = "Naledi Khumalo",    Avatar = "NK", EcoCredits = 1750, WasteRemoved = 105, City = "Johannesburg",  JoinedAt = DateTime.Parse("2025-09-01") },
        new() { Name = "Pieter van Wyk",    Avatar = "PV", EcoCredits = 1680, WasteRemoved = 98,  City = "Cape Town",     JoinedAt = DateTime.Parse("2025-07-30") },
        new() { Name = "Fatima Adams",      Avatar = "FA", EcoCredits = 1520, WasteRemoved = 89,  City = "Cape Town",     JoinedAt = DateTime.Parse("2025-08-15") },
        new() { Name = "Bongani Sithole",   Avatar = "BS", EcoCredits = 1410, WasteRemoved = 82,  City = "Johannesburg",  JoinedAt = DateTime.Parse("2025-10-05") },
        new() { Name = "Priya Naidoo",      Avatar = "PN", EcoCredits = 1350, WasteRemoved = 76,  City = "Durban",        JoinedAt = DateTime.Parse("2025-09-20") },
        new() { Name = "Themba Gumede",     Avatar = "TG", EcoCredits = 1280, WasteRemoved = 71,  City = "Durban",        JoinedAt = DateTime.Parse("2025-11-01") },
        new() { Name = "Zanele Dlamini",    Avatar = "ZD", EcoCredits = 1200, WasteRemoved = 65,  City = "Pretoria",      JoinedAt = DateTime.Parse("2025-08-25") },
        new() { Name = "Johan Botha",       Avatar = "JB", EcoCredits = 1150, WasteRemoved = 60,  City = "Cape Town",     JoinedAt = DateTime.Parse("2025-10-15") },
        new() { Name = "Lerato Phiri",      Avatar = "LP", EcoCredits = 1080, WasteRemoved = 55,  City = "Johannesburg",  JoinedAt = DateTime.Parse("2025-11-20") },
        new() { Name = "Ahmed Rashid",      Avatar = "AR", EcoCredits = 1020, WasteRemoved = 50,  City = "Durban",        JoinedAt = DateTime.Parse("2025-12-01") },
        new() { Name = "Nomsa Tshabalala",  Avatar = "NT", EcoCredits = 960,  WasteRemoved = 46,  City = "Cape Town",     JoinedAt = DateTime.Parse("2025-09-10") },
        new() { Name = "Kofi Asante",       Avatar = "KA", EcoCredits = 890,  WasteRemoved = 41,  City = "Pretoria",      JoinedAt = DateTime.Parse("2025-12-15") },
    ];

    // ──────────────────────────────────────────────
    //  Hotspots — 150 hotspots across South Africa
    //  120 dirty (unresolved) with 1 dirty image
    //  30 clean (resolved) with 1 dirty + 1 clean image
    //  All clustered around cities/towns to keep within SA borders
    // ──────────────────────────────────────────────
    private static List<Hotspot> GetHotspots()
    {
        var rng = new Random(43); // changed seed for new distribution
        var hotspots = new List<Hotspot>();
        var baseDate = DateTime.Parse("2026-01-01");

        // Track which images we've used for variety
        var dirtyImageIndex = 0;
        var cleanImageIndex = 0;

        // Generate all 150 hotspots around cities/towns (safer than random rural coordinates)
        for (int i = 0; i < 150; i++)
        {
            var city = SouthAfricanCities[rng.Next(SouthAfricanCities.Length)];
            var (lat, lng) = GenerateRandomCoordinate(rng, city.Lat, city.Lng, city.Radius);
            
            bool isResolved = i >= 120; // Last 30 hotspots are resolved (120-149)
            var severity = GenerateRandomSeverity(rng);
            var reportedAt = baseDate.AddDays(rng.Next(0, 40));
            
            var hotspot = new Hotspot
            {
                Latitude = lat,
                Longitude = lng,
                Severity = severity,
                Resolved = isResolved,
                ReportedBy = ReporterNames[rng.Next(ReporterNames.Length)],
                ReportedAt = reportedAt,
                Description = PollutionDescriptions[rng.Next(PollutionDescriptions.Length)],
                City = city.Name,
                EcoCredits = (int)(severity * 0.6) + rng.Next(10, 25),
                ImageBeforeUrl = $"/uploads/dirty/{DirtyImageFiles[dirtyImageIndex % DirtyImageFiles.Length]}",
            };

            if (isResolved)
            {
                hotspot.ImageAfterUrl = $"/uploads/clean/{CleanImageFiles[cleanImageIndex % CleanImageFiles.Length]}";
                hotspot.ClaimedBy = ReporterNames[rng.Next(ReporterNames.Length)];
                cleanImageIndex++;
            }

            dirtyImageIndex++;
            hotspots.Add(hotspot);
        }

        return hotspots;
    }

    // ──────────────────────────────────────────────
    //  Cleanup Events — mirrors CLEANUP_EVENTS from data.ts
    // ──────────────────────────────────────────────
    private static List<CleanupEvent> GetCleanupEvents() =>
    [
        new()
        {
            Title = "Jukskei River Cleanup",    Date = DateTime.Parse("2026-02-15"), Time = "08:00",
            Location = "Jukskei River Bridge, Braamfontein", City = "Johannesburg",
            Latitude = -26.1929, Longitude = 28.0305, ExpectedImpact = "~200kg waste removal",
            Attendees = 34, MaxAttendees = 50,
            Description = "Join us for a major river cleanup along the Jukskei. Gloves and bags provided."
        },
        new()
        {
            Title = "Sea Point Beach Day",      Date = DateTime.Parse("2026-02-22"), Time = "07:00",
            Location = "Sea Point Promenade", City = "Cape Town",
            Latitude = -33.9249, Longitude = 18.4241, ExpectedImpact = "~150kg plastic removed",
            Attendees = 48, MaxAttendees = 60,
            Description = "Morning beach cleanup followed by a community breakfast. All ages welcome!"
        },
        new()
        {
            Title = "Umgeni River Rescue",      Date = DateTime.Parse("2026-03-01"), Time = "09:00",
            Location = "Umgeni River Mouth, Durban North", City = "Durban",
            Latitude = -29.8087, Longitude = 31.0418, ExpectedImpact = "~350kg waste removal",
            Attendees = 22, MaxAttendees = 40,
            Description = "Critical cleanup of one of Durban's most polluted waterways. Safety gear provided."
        },
        new()
        {
            Title = "Soweto Green Initiative",  Date = DateTime.Parse("2026-03-08"), Time = "08:30",
            Location = "Walter Sisulu Square, Kliptown", City = "Johannesburg",
            Latitude = -26.2715, Longitude = 27.9995, ExpectedImpact = "~180kg waste + 50 trees planted",
            Attendees = 56, MaxAttendees = 80,
            Description = "Combined cleanup and tree planting event. Refreshments and eco-credits for all participants."
        },
        new()
        {
            Title = "Table Mountain Trail Clean",Date = DateTime.Parse("2026-03-15"), Time = "06:30",
            Location = "Kirstenbosch Entrance", City = "Cape Town",
            Latitude = -33.9875, Longitude = 18.4325, ExpectedImpact = "~100kg trail waste removed",
            Attendees = 18, MaxAttendees = 30,
            Description = "Hike and clean! We'll tackle litter along popular hiking trails. Bring sturdy shoes."
        },
        new()
        {
            Title = "Mamelodi Community Clean", Date = DateTime.Parse("2026-03-22"), Time = "09:00",
            Location = "Mamelodi Community Centre", City = "Pretoria",
            Latitude = -25.7200, Longitude = 28.3600, ExpectedImpact = "~250kg waste removal",
            Attendees = 41, MaxAttendees = 60,
            Description = "Neighborhood cleanup with music, food stalls, and prizes for top collectors."
        },
    ];

    // ──────────────────────────────────────────────
    //  Timeline — mirrors USER_TIMELINE from data.ts
    //  All assigned to the first user (Thabo Molefe, the "current user")
    // ──────────────────────────────────────────────
    private static List<TimelineEntry> GetTimelineEntries(int userId) =>
    [
        new() { UserId = userId, Type = TimelineType.Report,  Title = "Reported Hotspot",           Description = "Illegal dump near Braamfontein identified",       Date = DateTime.Parse("2026-02-04"), EcoCredits = 45 },
        new() { UserId = userId, Type = TimelineType.Cleanup, Title = "Cleanup Completed",          Description = "Cleared plastic waste at Sandton park",           Date = DateTime.Parse("2026-02-02"), EcoCredits = 120 },
        new() { UserId = userId, Type = TimelineType.Event,   Title = "Joined Cleanup Event",       Description = "Participated in Jukskei River cleanup",           Date = DateTime.Parse("2026-01-28"), EcoCredits = 85 },
        new() { UserId = userId, Type = TimelineType.Badge,   Title = "Badge Earned: First Reporter",Description = "Submitted your first pollution report",           Date = DateTime.Parse("2026-01-25"), EcoCredits = 50 },
        new() { UserId = userId, Type = TimelineType.Cleanup, Title = "Cleanup Completed",          Description = "Removed tyre dump near Soweto",                   Date = DateTime.Parse("2026-01-20"), EcoCredits = 95 },
        new() { UserId = userId, Type = TimelineType.Report,  Title = "Reported Hotspot",           Description = "Construction debris on vacant lot flagged",        Date = DateTime.Parse("2026-01-18"), EcoCredits = 52 },
        new() { UserId = userId, Type = TimelineType.Event,   Title = "Joined Cleanup Event",       Description = "Sea Point Beach community event",                 Date = DateTime.Parse("2026-01-15"), EcoCredits = 70 },
        new() { UserId = userId, Type = TimelineType.Badge,   Title = "Badge Earned: Eco Warrior",  Description = "Reached 500 eco-credits milestone",               Date = DateTime.Parse("2026-01-10"), EcoCredits = 100 },
    ];
}
