$baseDir = "C:\Users\Augustine Jr\OneDrive\website\int"
$cssPath = Join-Path $baseDir "styles.css"
$htmlFiles = @("index.html", "company.html", "discover.html", "industries.html", "solutions.html")

# Extract CSS classes
$cssText = Get-Content $cssPath -Raw
$cssClassMatches = [regex]::Matches($cssText, "\.([a-zA-Z0-9_-]+)(?=[^\{]*\{)")
$cssClasses = [System.Collections.Generic.HashSet[string]]::new()
foreach ($m in $cssClassMatches) {
    $cssClasses.Add($m.Groups[1].Value) | Out-Null
}
Write-Host "Unique CSS Classes defined in styles.css:" $cssClasses.Count

# Extract HTML classes
$htmlClasses = [System.Collections.Generic.HashSet[string]]::new()
$pageClasses = @{}
foreach ($h in $htmlFiles) {
    $content = Get-Content (Join-Path $baseDir $h) -Raw
    $matches = [regex]::Matches($content, 'class="([^"]+)"')
    $thisPageSet = [System.Collections.Generic.HashSet[string]]::new()
    foreach ($m in $matches) {
        $cList = $m.Groups[1].Value.Split(" `t`r`n", [System.StringSplitOptions]::RemoveEmptyEntries)
        foreach ($c in $cList) {
            $htmlClasses.Add($c) | Out-Null
            $thisPageSet.Add($c) | Out-Null
        }
    }
    $pageClasses[$h] = $thisPageSet
    Write-Host "$h : $($thisPageSet.Count) unique classes used"
}

Write-Host "Total unique classes across all HTML files:" $htmlClasses.Count

# Classes in HTML but NOT in CSS
$missingInCss = [System.Collections.Generic.List[string]]::new()
foreach ($c in $htmlClasses) {
    if (-not $cssClasses.Contains($c) -and -not $c.StartsWith("fa-") -and -not $c.StartsWith("fa") -and -not $c.StartsWith("fas") -and -not $c.StartsWith("fab")) {
        $missingInCss.Add($c)
    }
}
Write-Host "`nClasses used in HTML but not defined in styles.css (excluding FontAwesome):" $missingInCss.Count
$missingInCss | Sort-Object | Select-Object -First 30 | ForEach-Object { Write-Host "  - $_" }

# Classes in CSS but NOT in any HTML
$unusedCss = [System.Collections.Generic.List[string]]::new()
foreach ($c in $cssClasses) {
    if (-not $htmlClasses.Contains($c)) {
        $unusedCss.Add($c)
    }
}
Write-Host "`nClasses defined in styles.css but NOT used in any static HTML (might be dynamically added in JS or unused):" $unusedCss.Count
$unusedCss | Sort-Object | Select-Object -First 30 | ForEach-Object { Write-Host "  - $_" }
