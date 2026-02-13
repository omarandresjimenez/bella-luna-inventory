# PowerShell script to create test customer account

$body = @{
    email = "customer@example.com"
    password = "password123"
    name = "Test Customer"
} | ConvertTo-Json

Write-Host "Creating test customer account..." -ForegroundColor Cyan
Write-Host "Email: customer@example.com" -ForegroundColor Yellow
Write-Host "Password: password123" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:3000/api/auth/register" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body `
        -ErrorAction SilentlyContinue

    if ($response) {
        Write-Host "✅ Account created successfully!" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:"
    Write-Host "1. Backend is running on http://localhost:3000"
    Write-Host "2. Database is connected"
    Write-Host "3. The register endpoint exists"
}

Write-Host ""
Write-Host "You can now login with these credentials:" -ForegroundColor Green
Write-Host "Email: customer@example.com" -ForegroundColor Cyan
Write-Host "Password: password123" -ForegroundColor Cyan
