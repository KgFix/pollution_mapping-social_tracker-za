using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VukaMap.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CleanupEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Time = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    Location = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    City = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Latitude = table.Column<double>(type: "REAL", nullable: false),
                    Longitude = table.Column<double>(type: "REAL", nullable: false),
                    ExpectedImpact = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Attendees = table.Column<int>(type: "INTEGER", nullable: false),
                    MaxAttendees = table.Column<int>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CleanupEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Hotspots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Latitude = table.Column<double>(type: "REAL", nullable: false),
                    Longitude = table.Column<double>(type: "REAL", nullable: false),
                    Severity = table.Column<int>(type: "INTEGER", nullable: false),
                    Resolved = table.Column<bool>(type: "INTEGER", nullable: false),
                    ReportedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    ReportedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    City = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    EcoCredits = table.Column<int>(type: "INTEGER", nullable: false),
                    ClaimedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ImageBeforeUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    ImageAfterUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hotspots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Avatar = table.Column<string>(type: "TEXT", maxLength: 5, nullable: false),
                    EcoCredits = table.Column<int>(type: "INTEGER", nullable: false),
                    WasteRemoved = table.Column<int>(type: "INTEGER", nullable: false),
                    City = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EventRegistrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    CleanupEventId = table.Column<int>(type: "INTEGER", nullable: false),
                    RegisteredAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventRegistrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventRegistrations_CleanupEvents_CleanupEventId",
                        column: x => x.CleanupEventId,
                        principalTable: "CleanupEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventRegistrations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TimelineEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EcoCredits = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimelineEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimelineEntries_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventRegistrations_CleanupEventId",
                table: "EventRegistrations",
                column: "CleanupEventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventRegistrations_UserId_CleanupEventId",
                table: "EventRegistrations",
                columns: new[] { "UserId", "CleanupEventId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Hotspots_City",
                table: "Hotspots",
                column: "City");

            migrationBuilder.CreateIndex(
                name: "IX_Hotspots_Resolved",
                table: "Hotspots",
                column: "Resolved");

            migrationBuilder.CreateIndex(
                name: "IX_TimelineEntries_Date",
                table: "TimelineEntries",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_TimelineEntries_UserId",
                table: "TimelineEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_City",
                table: "Users",
                column: "City");

            migrationBuilder.CreateIndex(
                name: "IX_Users_EcoCredits",
                table: "Users",
                column: "EcoCredits");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventRegistrations");

            migrationBuilder.DropTable(
                name: "Hotspots");

            migrationBuilder.DropTable(
                name: "TimelineEntries");

            migrationBuilder.DropTable(
                name: "CleanupEvents");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
