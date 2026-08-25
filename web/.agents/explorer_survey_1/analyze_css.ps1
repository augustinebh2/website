$cssPath = "C:\Users\Augustine Jr\OneDrive\website\int\styles.css"
$lines = Get-Content $cssPath

Write-Host "Total Lines:" $lines.Count

Write-Host "`n--- MAJOR SECTIONS ---"
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "^\s*/\*\s*={3,}") {
        Write-Host "Line $($i+1): $($lines[$i+1])"
    } elseif ($lines[$i] -match "^\s*/\*\s*-{3,}") {
        Write-Host "  Line $($i+1): $($lines[$i+1])"
    }
}

Write-Host "`n--- MEDIA QUERIES ---"
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "@media") {
        Write-Host "Line $($i+1): $($lines[$i].Trim())"
    }
}

Write-Host "`n--- HARDCODED COLORS COUNT ---"
$hexMatches = [regex]::Matches(($lines -join "`n"), "#[0-9a-fA-F]{3,6}")
Write-Host "Hardcoded #hex instances:" $hexMatches.Count
$varMatches = [regex]::Matches(($lines -join "`n"), "var\(--")
Write-Host "CSS var() usage count:" $varMatches.Count

Write-Host "`n--- DUPLICATE SELECTOR CHECKS ---"
# Extract selectors before {
$cssText = $lines -join "`n"
$selectorRegex = [regex]"(?ms)(?:^|\})\s*([^{@]+)\{"
$selectors = @{}
foreach ($m in $selectorRegex.Matches($cssText)) {
    $sel = $m.Groups[1].Value.Trim()
    if ($sel -and -not $sel.StartsWith("/*") -and -not $sel.StartsWith("@")) {
        $selectors[$sel] = $selectors[$sel] + 1
    }
}
$duplicates = $selectors.GetEnumerator() | Where-Object { $_.Value -gt 1 } | Sort-Object Value -Descending
Write-Host "Total duplicate selector blocks found:" ($duplicates | Measure-Object).Count
$duplicates | Select-Object -First 20 | ForEach-Object { Write-Host "$($_.Key) -> $($_.Value) times" }
