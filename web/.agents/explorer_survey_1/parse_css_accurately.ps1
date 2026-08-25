$baseDir = "C:\Users\Augustine Jr\OneDrive\website\int"
$cssPath = Join-Path $baseDir "styles.css"
$cssRaw = Get-Content $cssPath -Raw

# Remove comments
$noComments = [regex]::Replace($cssRaw, "/\*.*?\*/", "", [System.Text.RegularExpressions.RegexOptions]::Singleline)

# Match CSS rule blocks: selector { body }
$ruleRegex = [regex]"(?ms)([^{}]+)\{([^{}]+)\}"
$selectors = @()
foreach ($m in $ruleRegex.Matches($noComments)) {
    $selGroup = $m.Groups[1].Value.Trim()
    if ($selGroup -notmatch "@keyframes" -and $selGroup -notmatch "@media" -and $selGroup -notmatch "^from$|^to$|^\d+%$") {
        $sels = $selGroup.Split(",")
        foreach ($s in $sels) {
            $sClean = $s.Trim()
            if ($sClean) { $selectors += $sClean }
        }
    }
}

Write-Host "Total extracted CSS selectors:" $selectors.Count

# Extract classes from selectors
$cssClassList = [System.Collections.Generic.HashSet[string]]::new()
foreach ($s in $selectors) {
    $matches = [regex]::Matches($s, "\.([a-zA-Z_-][a-zA-Z0-9_-]*)")
    foreach ($m in $matches) {
        $cssClassList.Add($m.Groups[1].Value) | Out-Null
    }
}
Write-Host "Real unique CSS classes in styles.css:" $cssClassList.Count

# Let's inspect HTML files for classes
$htmlFiles = @("index.html", "company.html", "discover.html", "industries.html", "solutions.html")
$htmlClasses = [System.Collections.Generic.HashSet[string]]::new()
$htmlFileClassMap = @{}
foreach ($h in $htmlFiles) {
    $content = Get-Content (Join-Path $baseDir $h) -Raw
    $matches = [regex]::Matches($content, 'class="([^"]+)"')
    $thisSet = [System.Collections.Generic.HashSet[string]]::new()
    foreach ($m in $matches) {
        $cList = $m.Groups[1].Value.Split(" `t`r`n", [System.StringSplitOptions]::RemoveEmptyEntries)
        foreach ($c in $cList) {
            $htmlClasses.Add($c) | Out-Null
            $thisSet.Add($c) | Out-Null
        }
    }
    $htmlFileClassMap[$h] = $thisSet
}

Write-Host "Real unique HTML classes across 5 pages:" $htmlClasses.Count

# Check missing in CSS (HTML classes not found in styles.css)
$missing = [System.Collections.Generic.List[string]]::new()
foreach ($c in $htmlClasses) {
    if (-not $cssClassList.Contains($c) -and -not $c.StartsWith("fa-") -and -not $c.StartsWith("fa") -and -not $c.StartsWith("fas") -and -not $c.StartsWith("fab") -and -not $c.StartsWith("far")) {
        $missing.Add($c)
    }
}
Write-Host "`nHTML Classes without corresponding CSS rule ($($missing.Count)):`n"
$missing | Sort-Object | ForEach-Object { Write-Host "  - $_" }

# Check unused CSS classes (classes in CSS not found in any static HTML)
$unused = [System.Collections.Generic.List[string]]::new()
foreach ($c in $cssClassList) {
    if (-not $htmlClasses.Contains($c)) {
        $unused.Add($c)
    }
}
Write-Host "`nCSS Classes not found in static HTML ($($unused.Count)):`n"
$unused | Sort-Object | ForEach-Object { Write-Host "  - $_" }
