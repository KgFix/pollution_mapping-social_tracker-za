# Test image upload to VukaMap API
$imagePath = "frontend\public\seed-images\trash-01.jpg"
$uri = "http://localhost:5292/api/hotspots"

Write-Host "`n=== Testing Image Upload to API ===" -ForegroundColor Cyan

# Create the multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$bodyLines = @(
    "--$boundary",
    'Content-Disposition: form-data; name="latitude"',
    '',
    '-26.2041',
    "--$boundary",
    'Content-Disposition: form-data; name="longitude"',
    '',
    '28.0473',
    "--$boundary",
    'Content-Disposition: form-data; name="description"',
    '',
    'Test dirty image from PowerShell',
    "--$boundary",
    'Content-Disposition: form-data; name="city"',
    '',
    'Johannesburg',
    "--$boundary",
    'Content-Disposition: form-data; name="reportedBy"',
    '',
    'TestUser',
    "--$boundary",
    'Content-Disposition: form-data; name="image"; filename="trash-01.jpg"',
    'Content-Type: image/jpeg',
    ''
)

# Read image bytes
$imageBytes = [System.IO.File]::ReadAllBytes($imagePath)

# Build the request body
$encoding = [System.Text.Encoding]::UTF8
$bodyParts = @()
foreach ($line in $bodyLines) {
    $bodyParts += $encoding.GetBytes($line + "`r`n")
}
$bodyParts += $imageBytes
$bodyParts += $encoding.GetBytes("`r`n--$boundary--`r`n")

# Combine all parts
$body = [byte[]]::new(0)
foreach ($part in $bodyParts) {
    $temp = $body
    $body = [byte[]]::new($temp.Length + $part.Length)
    [Array]::Copy($temp, 0, $body, 0, $temp.Length)
    [Array]::Copy($part, 0, $body, $temp.Length, $part.Length)
}

Write-Host "Request size: $($body.Length) bytes" -ForegroundColor White
Write-Host "Sending to: $uri" -ForegroundColor White
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "multipart/form-data; boundary=$boundary"
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    $response | Format-List
    
    Write-Host ""
    Write-Host "AI Analysis Results:" -ForegroundColor Cyan
    Write-Host "  AI Dirtiness: $($response.aiDirtiness)%" -ForegroundColor White
    Write-Host "  Analysis Method: $($response.analysisMethod)" -ForegroundColor White
    Write-Host "  Has EXIF GPS: $($response.hasExifGps)" -ForegroundColor White
    Write-Host "  EXIF Latitude: $($response.exifLatitude)" -ForegroundColor White
    Write-Host "  EXIF Longitude: $($response.exifLongitude)" -ForegroundColor White
    Write-Host "  GPS Validated: $($response.gpsValidated)" -ForegroundColor White
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}
