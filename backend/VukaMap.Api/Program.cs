using Microsoft.EntityFrameworkCore;
using VukaMap.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// ─── Services ────────────────────────────────────────────────

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// EF Core — SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS — allow the Next.js dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",  // Next.js dev
                "http://localhost:5173"   // Vite dev (if switched later)
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// ─── Middleware Pipeline ─────────────────────────────────────

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Serve static files from wwwroot/ (uploaded images live here)
app.UseStaticFiles();

app.UseCors("Frontend");

app.UseAuthorization();

app.MapControllers();

// ─── Database: auto-migrate + seed ──────────────────────────

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();          // applies pending migrations
    await DbSeeder.SeedAsync(db);   // idempotent seed
}

app.Run();
