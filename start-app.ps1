Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MedicCare - Starting All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Kill any existing processes on app ports
Write-Host "`n[1/6] Clearing ports..." -ForegroundColor Yellow
@(8761,8888,8080,8081,8082,8000,3000) | ForEach-Object {
    $port = $_
    $proc = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
            Where-Object State -eq 'Listen' |
            Select-Object -ExpandProperty OwningProcess -First 1
    if ($proc) { Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue; Write-Host "  Cleared port $port (PID $proc)" }
}

# Start Eureka
Write-Host "`n[2/6] Starting Eureka Server (port 8761)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\mehdi\Desktop\medicCare\MedicCare_backend; mvn spring-boot:run -pl eureka-server -q" -WindowStyle Minimized

Write-Host "  Waiting for Eureka..." -ForegroundColor Gray
$maxWait = 90; $elapsed = 0
while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds 3; $elapsed += 3
    try { $null = [System.Net.Sockets.TcpClient]::new("localhost", 8761); Write-Host "  Eureka UP ($elapsed s)" -ForegroundColor Green; break }
    catch { Write-Host "  Waiting... ($elapsed s)" -ForegroundColor Gray }
}

# Start Auth, Doctor, Patient in parallel
Write-Host "`n[3/6] Starting Auth (8080), Doctor (8082), Patient (8081)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\mehdi\Desktop\medicCare\MedicCare_backend; mvn spring-boot:run -pl auth-service -q" -WindowStyle Minimized
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\mehdi\Desktop\medicCare\MedicCare_backend; mvn spring-boot:run -pl doctor-service -q" -WindowStyle Minimized
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\mehdi\Desktop\medicCare\MedicCare_backend; mvn spring-boot:run -pl patient-service -q" -WindowStyle Minimized

Write-Host "  Waiting for Auth, Doctor, Patient..." -ForegroundColor Gray
$services = @(@{Name="Auth";Port=8080}, @{Name="Doctor";Port=8082}, @{Name="Patient";Port=8081})
$maxWait = 90; $elapsed = 0
while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds 5; $elapsed += 5; $allUp = $true
    foreach ($svc in $services) {
        try { $null = [System.Net.Sockets.TcpClient]::new("localhost", $svc.Port); Write-Host "  $($svc.Name) UP" -ForegroundColor Green }
        catch { Write-Host "  $($svc.Name) waiting... ($elapsed s)" -ForegroundColor Gray; $allUp = $false }
    }
    if ($allUp) { break }
}

# Start Gateway
Write-Host "`n[4/6] Starting Gateway (port 8888)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\mehdi\Desktop\medicCare\MedicCare_backend; mvn spring-boot:run -pl gateway-service -q" -WindowStyle Minimized

$maxWait = 60; $elapsed = 0
while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds 3; $elapsed += 3
    try { $null = [System.Net.Sockets.TcpClient]::new("localhost", 8888); Write-Host "  Gateway UP ($elapsed s)" -ForegroundColor Green; break }
    catch { Write-Host "  Waiting... ($elapsed s)" -ForegroundColor Gray }
}

# Start Python AI API
Write-Host "`n[5/6] Starting AI API (port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\mehdi\Desktop\medicCare\AI-PART-DISEASE STUDY\api'; python main.py" -WindowStyle Minimized

$maxWait = 60; $elapsed = 0
while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds 5; $elapsed += 5
    try { $null = Invoke-WebRequest -Uri "http://localhost:8000/docs" -TimeoutSec 3 -ErrorAction Stop; Write-Host "  AI API UP ($elapsed s)" -ForegroundColor Green; break }
    catch { Write-Host "  Waiting... ($elapsed s)" -ForegroundColor Gray }
}

# Start React Frontend
Write-Host "`n[6/6] Starting React Frontend (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\mehdi\Desktop\medicCare\MedicCare_frontend; npm start" -WindowStyle Minimized

$maxWait = 60; $elapsed = 0
while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds 5; $elapsed += 5
    try { $null = [System.Net.Sockets.TcpClient]::new("localhost", 3000); Write-Host "  React Frontend UP ($elapsed s)" -ForegroundColor Green; break }
    catch { Write-Host "  Waiting... ($elapsed s)" -ForegroundColor Gray }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   All services running!" -ForegroundColor Green
Write-Host "   Open: http://localhost:3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Start-Process "http://localhost:3000"
