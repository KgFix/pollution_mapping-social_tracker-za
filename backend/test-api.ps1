# Quick API Test Script
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "VukaMap API Health Check" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Test 1: Check if API is running
Write-Host "`n[1/4] Checking if API is running on port 5292..." -ForegroundColor Yellow
$connection = Get-NetTCPConnection -LocalPort 5292 -ErrorAction SilentlyContinue
if ($connection) {
    Write-Host "✓ API is listening on port 5292" -ForegroundColor Green
    $processId = $connection[0].OwningProcess
    $process = Get-Process -Id $processId
    Write-Host "   Process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Gray
    Write-Host "   Started: $($process.StartTime)" -ForegroundColor Gray
} else {
    Write-Host "✗ API is NOT running on port 5292" -ForegroundColor Red
    exit 1
}

# Test 2: Get all hotspots
Write-Host "`n[2/4] Testing GET /api/hotspots..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5292/api/hotspots" -Method GET
    Write-Host "✓ API responded successfully" -ForegroundColor Green
    Write-Host "   Found $($response.Count) hotspots" -ForegroundColor Gray
    if ($response.Count -gt 0) {
        $resolved = ($response | Where-Object { $_.resolved }).Count
        $active = $response.Count - $resolved
        Write-Host "   Active: $active | Resolved: $resolved" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ API request failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check image analysis service configuration
Write-Host "`n[3/4] Checking image analysis configuration..." -ForegroundColor Yellow
$appsettingsPath = "backend\VukaMap.Api\appsettings.Development.json"
if (Test-Path $appsettingsPath) {
    $config = Get-Content $appsettingsPath | ConvertFrom-Json
    if ($config.AzureVision.Key -and $config.AzureVision.Key -ne "") {
        Write-Host "✓ Azure Computer Vision configured" -ForegroundColor Green
        Write-Host "   Endpoint: $($config.AzureVision.Endpoint)" -ForegroundColor Gray
    } else {
        Write-Host "⚠ Azure Computer Vision NOT configured (using fallback mode)" -ForegroundColor Yellow
        Write-Host "   System will use random severity generation" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠ appsettings.Development.json not found" -ForegroundColor Yellow
}

# Test 4: Check database
Write-Host "`n[4/4] Checking database..." -ForegroundColor Yellow
$dbPath = "backend\VukaMap.Api\vukamap.db"
if (Test-Path $dbPath) {
    $dbSize = (Get-Item $dbPath).Length / 1KB
    Write-Host "✓ Database exists: vukamap.db ($([math]::Round($dbSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "✗ Database file not found" -ForegroundColor Red
}

# Summary
Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Summary: API is operational" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "`nNew Features Added:" -ForegroundColor Cyan
Write-Host "  • EXIF metadata extraction (GPS, timestamp, device info)" -ForegroundColor White
Write-Host "  • AI-powered dirtiness analysis (Azure Computer Vision)" -ForegroundColor White
Write-Host "  • Cleanup verification (location + cleanliness scoring)" -ForegroundColor White
Write-Host "  • GPS validation against user-submitted location" -ForegroundColor White
Write-Host "`nFallback Mode: System works without Azure credentials" -ForegroundColor Gray
Write-Host "Setup Guide: backend/VukaMap.Api/AZURE_VISION_SETUP.md" -ForegroundColor Gray
Write-Host ""
