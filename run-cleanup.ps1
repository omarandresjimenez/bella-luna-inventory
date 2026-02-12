# Windows cleanup script
Write-Host "🧹 Running cleanup script..." -ForegroundColor Cyan

npx ts-node cleanup-duplicates.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Cleanup completed!" -ForegroundColor Green
} else {
    Write-Host "❌ Cleanup failed!" -ForegroundColor Red
    exit 1
}
