using VukaMap.Api.Models;

namespace VukaMap.Api.Data;

/// <summary>
/// Seeds the SQLite database with the same mock data that the frontend uses in data.ts.
/// This ensures API responses match the existing UI out of the box.
/// Only seeds when tables are empty (safe to call on every startup).
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
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
    //  Hotspots — mirrors INITIAL_HOTSPOTS from data.ts
    // ──────────────────────────────────────────────
    private static List<Hotspot> GetHotspots() =>
    [
        // Johannesburg
        new() { Latitude = -26.2041, Longitude = 28.0473, Severity = 78, Resolved = false, ReportedBy = "Thabo M.",   ReportedAt = DateTime.Parse("2026-01-28"), Description = "Illegal dump site near Braamfontein",        City = "Johannesburg",    EcoCredits = 45 },
        new() { Latitude = -26.1929, Longitude = 28.0305, Severity = 65, Resolved = true,  ReportedBy = "Naledi K.",  ReportedAt = DateTime.Parse("2026-01-15"), Description = "Plastic waste along Jukskei River",           City = "Johannesburg",    EcoCredits = 38 },
        new() { Latitude = -26.2309, Longitude = 28.0583, Severity = 89, Resolved = false, ReportedBy = "Sipho N.",   ReportedAt = DateTime.Parse("2026-02-01"), Description = "Construction debris on vacant lot",           City = "Johannesburg",    EcoCredits = 52 },
        new() { Latitude = -26.1496, Longitude = 28.0080, Severity = 42, Resolved = true,  ReportedBy = "Zanele D.",  ReportedAt = DateTime.Parse("2026-01-20"), Description = "Overflowing bins at Randburg market",         City = "Johannesburg",    EcoCredits = 25 },
        new() { Latitude = -26.2615, Longitude = 28.0195, Severity = 71, Resolved = false, ReportedBy = "Bongani S.", ReportedAt = DateTime.Parse("2026-02-03"), Description = "Tyre dumping near Soweto",                    City = "Johannesburg",    EcoCredits = 42 },
        new() { Latitude = -26.1076, Longitude = 28.0567, Severity = 55, Resolved = true,  ReportedBy = "Lerato P.",  ReportedAt = DateTime.Parse("2026-01-10"), Description = "Littering along Sandton streets",             City = "Johannesburg",    EcoCredits = 30 },
        new() { Latitude = -26.1825, Longitude = 28.0127, Severity = 83, Resolved = false, ReportedBy = "Mandla Z.",  ReportedAt = DateTime.Parse("2026-02-04"), Description = "Hazardous waste near Auckland Park",          City = "Johannesburg",    EcoCredits = 50 },

        // Cape Town
        new() { Latitude = -33.9249, Longitude = 18.4241, Severity = 35, Resolved = true,  ReportedBy = "Ayanda M.",  ReportedAt = DateTime.Parse("2026-01-25"), Description = "Beach litter at Sea Point",                  City = "Cape Town",       EcoCredits = 20 },
        new() { Latitude = -33.9608, Longitude = 18.4745, Severity = 62, Resolved = false, ReportedBy = "Pieter V.",  ReportedAt = DateTime.Parse("2026-01-30"), Description = "Waste overflow near Woodstock",               City = "Cape Town",       EcoCredits = 36 },
        new() { Latitude = -33.8900, Longitude = 18.5108, Severity = 48, Resolved = true,  ReportedBy = "Fatima A.",  ReportedAt = DateTime.Parse("2026-01-18"), Description = "Dumping near Table Bay",                      City = "Cape Town",       EcoCredits = 28 },
        new() { Latitude = -33.9400, Longitude = 18.3800, Severity = 72, Resolved = false, ReportedBy = "Johan B.",   ReportedAt = DateTime.Parse("2026-02-02"), Description = "Plastic pollution at Camps Bay",              City = "Cape Town",       EcoCredits = 43 },
        new() { Latitude = -34.0000, Longitude = 18.4600, Severity = 30, Resolved = true,  ReportedBy = "Nomsa T.",   ReportedAt = DateTime.Parse("2026-01-08"), Description = "Street litter near Observatory",              City = "Cape Town",       EcoCredits = 18 },
        new() { Latitude = -33.9550, Longitude = 18.5300, Severity = 57, Resolved = true,  ReportedBy = "David L.",   ReportedAt = DateTime.Parse("2026-01-22"), Description = "Industrial waste near Salt River",            City = "Cape Town",       EcoCredits = 33 },

        // Durban
        new() { Latitude = -29.8587, Longitude = 31.0218, Severity = 91, Resolved = false, ReportedBy = "Themba G.",  ReportedAt = DateTime.Parse("2026-02-01"), Description = "Severe pollution at Umgeni River",            City = "Durban",          EcoCredits = 55 },
        new() { Latitude = -29.8833, Longitude = 31.0500, Severity = 67, Resolved = false, ReportedBy = "Priya N.",   ReportedAt = DateTime.Parse("2026-01-29"), Description = "Beach waste at North Beach",                  City = "Durban",          EcoCredits = 39 },
        new() { Latitude = -29.8200, Longitude = 31.0050, Severity = 45, Resolved = true,  ReportedBy = "Siyanda W.", ReportedAt = DateTime.Parse("2026-01-12"), Description = "Littering near Umhlanga",                    City = "Durban",          EcoCredits = 26 },
        new() { Latitude = -29.9000, Longitude = 30.9800, Severity = 78, Resolved = false, ReportedBy = "Ahmed R.",   ReportedAt = DateTime.Parse("2026-02-03"), Description = "Toxic dump near Pinetown",                   City = "Durban",          EcoCredits = 47 },
        new() { Latitude = -29.8700, Longitude = 31.0400, Severity = 53, Resolved = true,  ReportedBy = "Grace M.",   ReportedAt = DateTime.Parse("2026-01-16"), Description = "Harbour area waste accumulation",             City = "Durban",          EcoCredits = 31 },

        // Pretoria
        new() { Latitude = -25.7479, Longitude = 28.2293, Severity = 60, Resolved = false, ReportedBy = "Kofi A.",    ReportedAt = DateTime.Parse("2026-01-31"), Description = "Street waste in Hatfield",                   City = "Pretoria",        EcoCredits = 35 },
        new() { Latitude = -25.7300, Longitude = 28.2100, Severity = 40, Resolved = true,  ReportedBy = "Linda F.",   ReportedAt = DateTime.Parse("2026-01-14"), Description = "Park littering at Pretoria Botanical Gardens",City = "Pretoria",        EcoCredits = 24 },
        new() { Latitude = -25.7700, Longitude = 28.2500, Severity = 74, Resolved = false, ReportedBy = "Tshepo M.",  ReportedAt = DateTime.Parse("2026-02-02"), Description = "Construction waste in Mamelodi",              City = "Pretoria",        EcoCredits = 44 },

        // Port Elizabeth
        new() { Latitude = -33.9180, Longitude = 25.5701, Severity = 56, Resolved = false, ReportedBy = "Anele K.",   ReportedAt = DateTime.Parse("2026-01-27"), Description = "Beach pollution near Summerstrand",           City = "Port Elizabeth",  EcoCredits = 33 },
        new() { Latitude = -33.9600, Longitude = 25.6000, Severity = 38, Resolved = true,  ReportedBy = "Megan S.",   ReportedAt = DateTime.Parse("2026-01-11"), Description = "Littering at Central area",                  City = "Port Elizabeth",  EcoCredits = 22 },

        // Bloemfontein
        new() { Latitude = -29.0852, Longitude = 26.1596, Severity = 49, Resolved = false, ReportedBy = "Kagiso B.",  ReportedAt = DateTime.Parse("2026-01-26"), Description = "Illegal dump off N1 highway",                City = "Bloemfontein",    EcoCredits = 29 },
        new() { Latitude = -29.1000, Longitude = 26.1800, Severity = 33, Resolved = true,  ReportedBy = "Refilwe N.", ReportedAt = DateTime.Parse("2026-01-09"), Description = "Park waste in Naval Hill area",               City = "Bloemfontein",    EcoCredits = 20 },

        // East London
        new() { Latitude = -33.0153, Longitude = 27.9116, Severity = 64, Resolved = false, ReportedBy = "Vusi M.",    ReportedAt = DateTime.Parse("2026-02-01"), Description = "River pollution near Buffalo River",          City = "East London",     EcoCredits = 37 },

        // Polokwane
        new() { Latitude = -23.9045, Longitude = 29.4689, Severity = 51, Resolved = false, ReportedBy = "Mpho L.",    ReportedAt = DateTime.Parse("2026-01-28"), Description = "Market waste overflow",                      City = "Polokwane",       EcoCredits = 30 },

        // Nelspruit
        new() { Latitude = -25.4753, Longitude = 30.9694, Severity = 47, Resolved = true,  ReportedBy = "Thandeka S.",ReportedAt = DateTime.Parse("2026-01-17"), Description = "Riverside dumping near Crocodile River",     City = "Nelspruit",       EcoCredits = 27 },
    ];

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
