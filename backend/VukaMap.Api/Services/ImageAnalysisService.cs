using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision.Models;

namespace VukaMap.Api.Services;

public class ImageAnalysisService
{
    private readonly ComputerVisionClient? _visionClient;
    private readonly ILogger<ImageAnalysisService> _logger;
    private readonly bool _isAzureEnabled;

    public ImageAnalysisService(IConfiguration configuration, ILogger<ImageAnalysisService> logger)
    {
        _logger = logger;
        var azureKey = configuration["AzureVision:Key"];
        var azureEndpoint = configuration["AzureVision:Endpoint"];

        _isAzureEnabled = !string.IsNullOrEmpty(azureKey) && !string.IsNullOrEmpty(azureEndpoint);

        if (_isAzureEnabled)
        {
            _visionClient = new ComputerVisionClient(new ApiKeyServiceClientCredentials(azureKey))
            {
                Endpoint = azureEndpoint
            };
            _logger.LogInformation("Azure Computer Vision initialized successfully");
        }
        else
        {
            _logger.LogWarning("Azure Computer Vision not configured. Using fallback analysis.");
        }
    }

    public async Task<ImageAnalysisResult> AnalyzeDirtyImageAsync(IFormFile image, double? userLat, double? userLng)
    {
        var result = new ImageAnalysisResult();

        // Step 1: Extract EXIF metadata
        result.Metadata = await ExtractMetadataAsync(image);
        
        // Validate GPS if available
        if (result.Metadata.HasGps)
        {
            result.GpsValidated = true;
            result.ActualLatitude = result.Metadata.Latitude;
            result.ActualLongitude = result.Metadata.Longitude;

            // Check if EXIF GPS matches user-submitted GPS (within 200m)
            if (userLat.HasValue && userLng.HasValue)
            {
                var distance = CalculateDistance(
                    result.Metadata.Latitude!.Value,
                    result.Metadata.Longitude!.Value,
                    userLat.Value,
                    userLng.Value);

                if (distance > 0.2) // 200 meters
                {
                    _logger.LogWarning("GPS mismatch: EXIF={ExifLat},{ExifLng} vs User={UserLat},{UserLng} (distance={Distance}km)",
                        result.Metadata.Latitude, result.Metadata.Longitude, userLat, userLng, distance);
                    result.GpsValidated = false;
                }
            }
        }
        else
        {
            // Use user-submitted GPS as fallback
            result.ActualLatitude = userLat;
            result.ActualLongitude = userLng;
            result.GpsValidated = false;
        }

        // Step 2: Analyze image with Azure Vision or fallback
        if (_isAzureEnabled && _visionClient != null)
        {
            try
            {
                result.DirtinessPercentage = await AnalyzeDirtinessWithAzureAsync(image);
                result.AnalysisMethod = "Azure Computer Vision";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Azure Vision API failed, using fallback");
                result.DirtinessPercentage = GenerateFallbackDirtiness();
                result.AnalysisMethod = "Fallback (Azure unavailable)";
            }
        }
        else
        {
            result.DirtinessPercentage = GenerateFallbackDirtiness();
            result.AnalysisMethod = "Fallback (Azure not configured)";
        }

        // Calculate eco-credits based on dirtiness
        result.EcoCredits = CalculateEcoCredits(result.DirtinessPercentage);

        return result;
    }

    public async Task<CleanupVerificationResult> VerifyCleanupImageAsync(
        IFormFile afterImage,
        double originalLat,
        double originalLng,
        string? originalImagePath)
    {
        var result = new CleanupVerificationResult();

        // Step 1: Extract EXIF from after image
        result.Metadata = await ExtractMetadataAsync(afterImage);

        // Step 2: GPS verification - ensure same spot
        if (result.Metadata.HasGps)
        {
            var distance = CalculateDistance(
                result.Metadata.Latitude!.Value,
                result.Metadata.Longitude!.Value,
                originalLat,
                originalLng);

            result.DistanceFromOriginal = distance;
            result.IsSameLocation = distance <= 0.05; // 50 meters threshold

            if (!result.IsSameLocation)
            {
                result.VerificationMessage = $"Location mismatch: {distance:F3}km from original spot";
                return result;
            }
        }
        else
        {
            // No GPS in cleanup image - can't verify location strictly
            result.IsSameLocation = false;
            result.VerificationMessage = "No GPS data in cleanup image";
            _logger.LogWarning("Cleanup image missing GPS metadata");
        }

        // Step 3: Analyze cleanliness
        if (_isAzureEnabled && _visionClient != null)
        {
            try
            {
                result.CleanlinessScore = await AnalyzeCleanlinessWithAzureAsync(afterImage);
                result.AnalysisMethod = "Azure Computer Vision";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Azure Vision API failed during cleanup verification");
                result.CleanlinessScore = GenerateFallbackCleanliness();
                result.AnalysisMethod = "Fallback (Azure unavailable)";
            }
        }
        else
        {
            result.CleanlinessScore = GenerateFallbackCleanliness();
            result.AnalysisMethod = "Fallback (Azure not configured)";
        }

        result.IsVerified = result.IsSameLocation && result.CleanlinessScore >= 60;
        result.VerificationMessage = result.IsVerified
            ? $"Cleanup verified! Location match + {result.CleanlinessScore}% clean"
            : "Verification failed - spot may not be fully cleaned";

        return result;
    }

    private async Task<ImageMetadata> ExtractMetadataAsync(IFormFile image)
    {
        var metadata = new ImageMetadata();

        try
        {
            using var stream = image.OpenReadStream();
            var directories = ImageMetadataReader.ReadMetadata(stream);

            // Extract GPS data
            var gpsDirectory = directories.OfType<GpsDirectory>().FirstOrDefault();
            if (gpsDirectory != null)
            {
                var location = gpsDirectory.GetGeoLocation();
                if (location != null)
                {
                    metadata.Latitude = location.Latitude;
                    metadata.Longitude = location.Longitude;
                    metadata.HasGps = true;
                }
            }

            // Extract timestamp
            var exifSubIfd = directories.OfType<ExifSubIfdDirectory>().FirstOrDefault();
            if (exifSubIfd != null && exifSubIfd.TryGetDateTime(ExifDirectoryBase.TagDateTimeOriginal, out var dateTime))
            {
                metadata.DateTaken = dateTime;
            }

            // Extract device info
            var exifIfd0 = directories.OfType<ExifIfd0Directory>().FirstOrDefault();
            if (exifIfd0 != null)
            {
                metadata.CameraMake = exifIfd0.GetDescription(ExifDirectoryBase.TagMake);
                metadata.CameraModel = exifIfd0.GetDescription(ExifDirectoryBase.TagModel);
            }

            // Extract software (to detect editing)
            if (exifIfd0 != null)
            {
                metadata.Software = exifIfd0.GetDescription(ExifDirectoryBase.TagSoftware);
            }

            _logger.LogInformation("EXIF extracted: GPS={HasGps}, Device={Device}, Software={Software}",
                metadata.HasGps,
                metadata.CameraMake + " " + metadata.CameraModel,
                metadata.Software);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract EXIF metadata from image");
        }

        return metadata;
    }

    private async Task<int> AnalyzeDirtinessWithAzureAsync(IFormFile image)
    {
        using var stream = image.OpenReadStream();

        var features = new List<VisualFeatureTypes?>
        {
            VisualFeatureTypes.Tags,
            VisualFeatureTypes.Objects,
            VisualFeatureTypes.Description
        };

        var analysis = await _visionClient!.AnalyzeImageInStreamAsync(stream, visualFeatures: features);

        // Count pollution-related objects and tags
        var wasteKeywords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "trash", "garbage", "litter", "waste", "plastic", "debris", "rubbish",
            "bottle", "can", "bag", "pollution", "dump", "dirty", "filth"
        };

        int wasteCount = 0;
        double confidence = 0;

        // Analyze tags
        foreach (var tag in analysis.Tags)
        {
            if (wasteKeywords.Any(keyword => tag.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase)))
            {
                wasteCount++;
                confidence += tag.Confidence;
                _logger.LogDebug("Found waste tag: {Tag} (confidence: {Confidence})", tag.Name, tag.Confidence);
            }
        }

        // Analyze objects
        foreach (var obj in analysis.Objects)
        {
            if (wasteKeywords.Any(keyword => obj.ObjectProperty.Contains(keyword, StringComparison.OrdinalIgnoreCase)))
            {
                wasteCount++;
                confidence += obj.Confidence;
                _logger.LogDebug("Found waste object: {Object} (confidence: {Confidence})", obj.ObjectProperty, obj.Confidence);
            }
        }

        // Calculate dirtiness: more waste objects = higher percentage
        // Formula: Base on count + confidence boost
        var baseDirtiness = Math.Min(wasteCount * 15, 70); // Max 70 from count
        var confidenceBoost = Math.Min(confidence * 10, 30); // Max 30 from confidence
        var dirtiness = (int)Math.Min(baseDirtiness + confidenceBoost, 95);

        // Ensure minimum of 30 if any waste detected
        if (wasteCount > 0 && dirtiness < 30)
        {
            dirtiness = 30;
        }

        _logger.LogInformation("Azure analysis: {WasteCount} waste items detected, dirtiness={Dirtiness}%",
            wasteCount, dirtiness);

        return Math.Max(dirtiness, 30); // Minimum 30%
    }

    private async Task<int> AnalyzeCleanlinessWithAzureAsync(IFormFile image)
    {
        using var stream = image.OpenReadStream();

        var features = new List<VisualFeatureTypes?>
        {
            VisualFeatureTypes.Tags,
            VisualFeatureTypes.Objects
        };

        var analysis = await _visionClient!.AnalyzeImageInStreamAsync(stream, visualFeatures: features);

        var wasteKeywords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "trash", "garbage", "litter", "waste", "plastic", "debris", "rubbish",
            "bottle", "can", "bag", "pollution", "dump", "dirty"
        };

        int wasteCount = 0;

        // Check for remaining waste
        foreach (var tag in analysis.Tags)
        {
            if (wasteKeywords.Any(keyword => tag.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase)))
            {
                wasteCount++;
            }
        }

        foreach (var obj in analysis.Objects)
        {
            if (wasteKeywords.Any(keyword => obj.ObjectProperty.Contains(keyword, StringComparison.OrdinalIgnoreCase)))
            {
                wasteCount++;
            }
        }

        // Inverse: fewer waste items = higher cleanliness
        var cleanliness = wasteCount == 0 ? 95 : Math.Max(60, 95 - (wasteCount * 15));

        _logger.LogInformation("Azure cleanup analysis: {WasteCount} waste items remaining, cleanliness={Cleanliness}%",
            wasteCount, cleanliness);

        return cleanliness;
    }

    private int GenerateFallbackDirtiness()
    {
        // Fallback to random severity (existing behavior)
        return Random.Shared.Next(30, 91);
    }

    private int GenerateFallbackCleanliness()
    {
        // Fallback to random cleanliness
        return Random.Shared.Next(60, 101);
    }

    private int CalculateEcoCredits(int dirtiness)
    {
        // Higher dirtiness = more credits (rewarding harder cleanups)
        var baseCredits = (int)(dirtiness * 0.6);
        var bonus = Random.Shared.Next(0, 16);
        return baseCredits + bonus;
    }

    private double CalculateDistance(double lat1, double lng1, double lat2, double lng2)
    {
        // Haversine formula
        const double earthRadius = 6371.0; // km

        var dLat = DegreesToRadians(lat2 - lat1);
        var dLng = DegreesToRadians(lng2 - lng1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                Math.Sin(dLng / 2) * Math.Sin(dLng / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return earthRadius * c;
    }

    private double DegreesToRadians(double degrees) => degrees * Math.PI / 180.0;
}

// Result classes
public class ImageAnalysisResult
{
    public ImageMetadata Metadata { get; set; } = new();
    public int DirtinessPercentage { get; set; }
    public int EcoCredits { get; set; }
    public string AnalysisMethod { get; set; } = "Unknown";
    public bool GpsValidated { get; set; }
    public double? ActualLatitude { get; set; }
    public double? ActualLongitude { get; set; }
}

public class CleanupVerificationResult
{
    public ImageMetadata Metadata { get; set; } = new();
    public bool IsSameLocation { get; set; }
    public bool IsVerified { get; set; }
    public int CleanlinessScore { get; set; }
    public double DistanceFromOriginal { get; set; }
    public string VerificationMessage { get; set; } = "";
    public string AnalysisMethod { get; set; } = "Unknown";
}

public class ImageMetadata
{
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool HasGps { get; set; }
    public DateTime? DateTaken { get; set; }
    public string? CameraMake { get; set; }
    public string? CameraModel { get; set; }
    public string? Software { get; set; }
}

// API Key credential class for Azure
internal class ApiKeyServiceClientCredentials : Microsoft.Rest.ServiceClientCredentials
{
    private readonly string _apiKey;

    public ApiKeyServiceClientCredentials(string? apiKey)
    {
        _apiKey = apiKey ?? throw new ArgumentNullException(nameof(apiKey));
    }

    public override Task ProcessHttpRequestAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        request.Headers.Add("Ocp-Apim-Subscription-Key", _apiKey);
        return Task.CompletedTask;
    }
}
