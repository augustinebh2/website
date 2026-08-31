$f1 = "C:\Users\Augustine Jr\OneDrive\website\int"
$f2 = "C:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web"
$files = @("app.js", "company.html", "index.html", "industries.html", "styles.css")
foreach ($f in $files) {
    $p1 = Join-Path $f1 $f
    $p2 = Join-Path $f2 $f
    $h1 = (Get-FileHash $p1).Hash
    $h2 = (Get-FileHash $p2).Hash
    Write-Host "$f : Match? ($($h1 -eq $h2))"
}
