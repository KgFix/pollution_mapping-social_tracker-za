using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VukaMap.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddImageAnalysisMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AiDirtiness",
                table: "Hotspots",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AnalysisMethod",
                table: "Hotspots",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CameraInfo",
                table: "Hotspots",
                type: "TEXT",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CleanlinessScore",
                table: "Hotspots",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CleanupLocationVerified",
                table: "Hotspots",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExifDateTaken",
                table: "Hotspots",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "ExifLatitude",
                table: "Hotspots",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "ExifLongitude",
                table: "Hotspots",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "GpsValidated",
                table: "Hotspots",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasExifGps",
                table: "Hotspots",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<double>(
                name: "LocationMatchDistance",
                table: "Hotspots",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Software",
                table: "Hotspots",
                type: "TEXT",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiDirtiness",
                table: "Hotspots");

            migrationBuilder.DropColumn(
                name: "AnalysisMethod",
                table: "Hotspots");

            migrationBuilder.DropColumn(
                name: "CameraInfo",
                table: "Hotspots");

            migrationBuilder.DropColumn(
                name: "CleanlinessScore",
                table: "Hotspots");

            migrationBuilder.DropColumn(
                name: "CleanupLocationVerified",
                table: "Hotspots");

            migrationBuilder.DropColumn(
                name: "ExifDateTaken",
                table: "Hotspots");

            migrationBuilder.DropColumn(
                name: "ExifLatitude",
                table: "Hotspots");

            migrationBuilder.DropColumn(
                name: "ExifLongitude",
                table: "Hotspots");

            migrationBuilder.DropColumn(
                name: "GpsValidated",
                table: "Hotspots");

            migrationBuilder.DropColumn(
                name: "HasExifGps",
                table: "Hotspots");

            migrationBuilder.DropColumn(
                name: "LocationMatchDistance",
                table: "Hotspots");

            migrationBuilder.DropColumn(
                name: "Software",
                table: "Hotspots");
        }
    }
}
