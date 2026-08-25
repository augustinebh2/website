$workDir = "C:\Users\Augustine Jr\OneDrive\website\int"
$proc = Start-Process node -ArgumentList "server.js" -WorkingDirectory $workDir -PassThru
Start-Sleep -Seconds 2

try {
    $endpoints = @("/", "/index.html", "/company.html", "/discover.html", "/industries.html", "/solutions.html", "/styles.css", "/app.js")
    foreach ($ep in $endpoints) {
        $url = "http://localhost:3000$ep"
        try {
            $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
            Write-Host "$url -> Status: $($resp.StatusCode), ContentType: $($resp.Headers['Content-Type']), Length: $($resp.Content.Length)"
        } catch {
            Write-Host "$url -> ERROR: $($_.Exception.Message)"
        }
    }
} finally {
    if ($proc -and -not $proc.HasExited) {
        Stop-Process -Id $proc.Id -Force
        Write-Host "Server stopped."
    }
}
