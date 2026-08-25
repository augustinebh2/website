$baseDir = "C:\Users\Augustine Jr\OneDrive\website\int"
$pages = @("index.html", "company.html", "discover.html", "industries.html", "solutions.html")

foreach ($p in $pages) {
    $filePath = Join-Path $baseDir $p
    $content = Get-Content $filePath -Raw
    Write-Host "`n========================================================"
    Write-Host "FOOTER & MODAL AUDIT: $p"
    Write-Host "========================================================"

    # Footer
    $footerMatch = [regex]::Match($content, '(?s)<footer[^>]*>.*?</footer>')
    if ($footerMatch.Success) {
        Write-Host "Footer tag found, length: $($footerMatch.Length) chars"
        $footerLinks = [regex]::Matches($footerMatch.Value, '<a\s+href="([^"]+)"[^>]*>(.*?)</a>')
        Write-Host "Footer links count: $($footerLinks.Count)"
        foreach ($fl in $footerLinks) {
            Write-Host "  - $($fl.Groups[2].Value.Trim()) -> $($fl.Groups[1].Value)"
        }
    } else {
        Write-Host "NO <footer> tag found!"
    }

    # Modal
    $modalMatch = [regex]::Match($content, '(?s)<div[^>]*id="demo-modal"[^>]*>.*?</div>\s*</div>\s*</div>')
    if ($modalMatch.Success) {
        Write-Host "Demo modal found!"
    } else {
        $anyModal = [regex]::Match($content, '(?s)<div[^>]*modal-overlay[^>]*>')
        Write-Host "Modal overlay tag found? $($anyModal.Success)"
    }

    # Toast
    $toastMatch = [regex]::Match($content, '(?s)<div[^>]*id="toast"[^>]*>')
    Write-Host "Toast container found? $($toastMatch.Success)"
}
