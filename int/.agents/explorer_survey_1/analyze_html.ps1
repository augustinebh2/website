$baseDir = "C:\Users\Augustine Jr\OneDrive\website\int"
$pages = @("index.html", "company.html", "discover.html", "industries.html", "solutions.html")

foreach ($p in $pages) {
    $filePath = Join-Path $baseDir $p
    $content = Get-Content $filePath -Raw
    Write-Host "`n========================================================"
    Write-Host "PAGE: $p (Size: $([System.IO.FileInfo]::new($filePath).Length) bytes)"
    Write-Host "========================================================"
    
    # Title & Meta
    $titleMatch = [regex]::Match($content, "<title>(.*?)</title>")
    Write-Host "Title: $($titleMatch.Groups[1].Value)"
    
    $descMatch = [regex]::Match($content, '<meta\s+name="description"\s+content="([^"]*)"')
    Write-Host "Description: $($descMatch.Groups[1].Value)"

    # Favicon
    $favMatch = [regex]::Match($content, '<link\s+rel=".*?icon".*?>')
    Write-Host "Favicon: $(if ($favMatch.Success) { $favMatch.Value } else { 'NONE' })"

    # Head Links & Fonts
    $links = [regex]::Matches($content, '<link\s+[^>]+>')
    Write-Host "Head Links ($($links.Count)): "
    foreach ($l in $links) {
        Write-Host "  - $($l.Value)"
    }

    # Scripts
    $scripts = [regex]::Matches($content, '<script\s+[^>]*>.*?</script>|<script\s+[^>]*/>')
    Write-Host "Scripts ($($scripts.Count)): "
    foreach ($s in $scripts) {
        Write-Host "  - $($s.Value)"
    }

    # Navigation active link
    $navActive = [regex]::Matches($content, '<a\s+[^>]*class="[^"]*active[^"]*"[^>]*>(.*?)</a>')
    Write-Host "Active Nav Link(s):"
    foreach ($na in $navActive) {
        Write-Host "  - $($na.Value)"
    }

    # Nav links in header
    $navMenuMatch = [regex]::Match($content, '(?s)<nav[^>]*>.*?</nav>')
    if ($navMenuMatch.Success) {
        $navLinks = [regex]::Matches($navMenuMatch.Value, '<a\s+href="([^"]+)"[^>]*>(.*?)</a>')
        Write-Host "Header Nav Items:"
        foreach ($nl in $navLinks) {
            Write-Host "    $($nl.Groups[2].Value.Trim()) -> $($nl.Groups[1].Value)"
        }
    }

    # Main Sections
    $sections = [regex]::Matches($content, '<section\s+[^>]*class="([^"]*)"[^>]*>')
    Write-Host "Sections ($($sections.Count)): "
    foreach ($sec in $sections) {
        Write-Host "  - $($sec.Value)"
    }

    # Forms
    $forms = [regex]::Matches($content, '<form\s+[^>]*>')
    Write-Host "Forms ($($forms.Count)): "
    foreach ($f in $forms) {
        Write-Host "  - $($f.Value)"
    }

    # Images and Videos
    $media = [regex]::Matches($content, '<img\s+[^>]+>|<video\s+[^>]+>')
    Write-Host "Media Elements ($($media.Count)): "
    foreach ($m in $media) {
        Write-Host "  - $($m.Value)"
    }
}
