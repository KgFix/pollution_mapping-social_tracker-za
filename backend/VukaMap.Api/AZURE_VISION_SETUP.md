# Azure Computer Vision Setup Guide

## Overview

VukaMap uses Azure Computer Vision API for intelligent image analysis:
- **Dirty Upload**: AI-powered dirtiness percentage calculation
- **Cleanup Verification**: Same-spot validation and cleanliness scoring
- **EXIF Metadata**: GPS, timestamp, and device info extraction

## Fallback Mode

The system works **without Azure credentials** using random severity generation. To enable AI analysis, follow the setup below.

---

## Setup Instructions

### 1. Create Azure Account
- Sign up at [https://portal.azure.com](https://portal.azure.com)
- **Free Tier**: 5,000 API calls per month (perfect for MVP/testing)
- No credit card required for free tier

### 2. Create Computer Vision Resource

1. In Azure Portal, click **"Create a resource"**
2. Search for **"Computer Vision"**
3. Click **Create**
4. Fill in the form:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new (e.g., "VukaMap-Resources")
   - **Region**: Choose closest to you (e.g., "South Africa North")
   - **Name**: Give it a unique name (e.g., "vukamap-vision")
   - **Pricing Tier**: Select **"Free F0"** (5,000 calls/month)
5. Click **"Review + Create"** → **Create**
6. Wait for deployment (takes ~1 minute)

### 3. Get Your API Key and Endpoint

1. Go to your Computer Vision resource
2. In the left sidebar, click **"Keys and Endpoint"**
3. You'll see:
   - **KEY 1** (copy this)
   - **KEY 2** (backup)
   - **Endpoint** (copy this URL)

### 4. Configure VukaMap

Open `appsettings.Development.json` and add your credentials:

```json
{
  "AzureVision": {
    "Key": "YOUR_KEY_1_HERE",
    "Endpoint": "https://vukamap-vision.cognitiveservices.azure.com/"
  }
}
```

**Important**: 
- Never commit credentials to Git
- Add `appsettings.Development.json` to `.gitignore` if not already there
- For production, use Azure Key Vault or environment variables

---

## How It Works

### Dirty Upload Analysis

When a user reports pollution with an image:

1. **EXIF Extraction** (instant)
   - GPS coordinates → validates against user-submitted location
   - Timestamp → detects if image was taken recently
   - Device info → logged for analytics
   - Software tags → flags if image was edited

2. **Azure Vision API Call** (~2 seconds)
   - Analyzes image for objects and tags
   - Counts waste-related items: "trash", "garbage", "litter", "plastic", etc.
   - Calculates dirtiness: `min(wasteCount × 15 + confidenceScore × 10, 95)`
   - Returns 30-95% severity (higher = more pollution)

3. **Eco-Credits Calculation**
   - Credits = `dirtiness × 0.6 + random(0-15)`
   - Harder cleanups = more rewards

### Cleanup Verification

When a user uploads an "after" photo:

1. **GPS Location Match**
   - Extracts EXIF GPS from after-image
   - Compares with original hotspot GPS (Haversine formula)
   - Must be within **50 meters** to verify

2. **Cleanliness Analysis**
   - Scans for remaining waste objects
   - Calculates cleanliness: `95 - (wasteCount × 15)`
   - Must be ≥60% clean to pass

3. **Verification Result**
   - Both checks must pass
   - Returns cleanliness score and verification status

---

## Testing Without Azure

The system has **intelligent fallbacks**:

- No Azure configured → random severity (30-90%)
- No image uploaded → random severity
- EXIF missing → uses user-submitted GPS
- API fails → fallback to random with logged warning

**All existing functionality still works!**

---

## API Usage Monitoring

- **Free Tier Limit**: 5,000 calls/month
- **Expected Usage**: 
  - 500 test reports = **500 calls**
  - 500 test cleanups = **500 calls**
  - Total = **1,000 calls/month** (well within free tier)

Check usage in Azure Portal:
1. Go to your Computer Vision resource
2. Click **"Metrics"** in left sidebar
3. View **"Total Calls"** graph

---

## Interview Talking Points

✅ "Integrated Azure Cognitive Services for AI-powered pollution severity analysis"  
✅ "Implemented EXIF metadata extraction for GPS verification and fraud detection"  
✅ "Designed fallback strategies for API failures to maintain system resilience"  
✅ "Optimized API calls to stay within free tier limits (5,000/month)"  
✅ "Used Computer Vision tags and object detection to calculate dirtiness percentage"  
✅ "Implemented location verification with Haversine distance formula"

---

## Troubleshooting

### "Azure Vision API failed, using fallback"

**Cause**: Incorrect Key or Endpoint in config

**Fix**:
1. Double-check `appsettings.Development.json`
2. Ensure no extra spaces in Key or Endpoint
3. Verify Endpoint includes `https://` and trailing domain
4. Test Key by visiting: `{Endpoint}/vision/v3.2/analyze?visualFeatures=Tags` in browser

### "GPS mismatch" warnings in logs

**Normal behavior**: Many phones strip EXIF GPS for privacy. System falls back to user-submitted GPS.

### Build error: "ApiKeyServiceClientCredentials not found"

**Fix**: Ensure `Microsoft.Azure.CognitiveServices.Vision.ComputerVision` NuGet package is installed:
```bash
dotnet add package Microsoft.Azure.CognitiveServices.Vision.ComputerVision --version 7.0.1
```

---

## Production Deployment

For production, use **secure credential management**:

### Option 1: Environment Variables
```bash
export AzureVision__Key="your-key"
export AzureVision__Endpoint="your-endpoint"
```

### Option 2: Azure Key Vault
```csharp
builder.Configuration.AddAzureKeyVault(
    new Uri(keyVaultUrl),
    new DefaultAzureCredential());
```

### Option 3: User Secrets (Development)
```bash
dotnet user-secrets init
dotnet user-secrets set "AzureVision:Key" "your-key"
dotnet user-secrets set "AzureVision:Endpoint" "your-endpoint"
```

---

## Next Steps

1. **Test without Azure** (verify fallback mode works)
2. **Sign up for Azure** (free tier, no credit card)
3. **Create Computer Vision resource**
4. **Copy Key + Endpoint to config**
5. **Test with real image uploads**
6. **Monitor usage in Azure Portal**

---

## Resources

- [Azure Computer Vision Docs](https://docs.microsoft.com/en-us/azure/cognitive-services/computer-vision/)
- [Free Tier Limits](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/computer-vision/)
- [MetadataExtractor Docs](https://github.com/drewnoakes/metadata-extractor-dotnet)
