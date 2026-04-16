param(
    [string]$RepoRoot = "."
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-PageFamily([string]$path) {
    $norm = $path.Replace("\", "/")
    if ($norm -eq "index.html") { return "home" }
    if ($norm -eq "login.html") { return "login" }
    if ($norm -like "ia_explained/*") { return "ia_explained" }
    if ($norm -like "signal_report/*") { return "signal_report" }
    if ($norm -like "signal_monitor/*") { return "signal_monitor" }
    if ($norm -like "historic_reports/*") { return "historic_reports" }
    if ($norm -like "methodology/*") { return "methodology" }
    if ($norm -like "investment-strategy/*") { return "investment_strategy" }
    if ($norm -like "portfolio_characteristics/*") { return "portfolio" }
    if ($norm -like "thesis/*") { return "thesis" }
    if ($norm -like "Podcast_*") { return "podcast" }
    if ($norm -eq "document_library.html") { return "document_library" }
    if ($norm -eq "signal_catalogue.html") { return "signal_catalogue" }
    if ($norm -eq "signal_map.html") { return "signal_map" }
    if ($norm -eq "rss_feed.html") { return "rss_feed" }
    if ($norm -eq "insights.html") { return "insights" }
    if ($norm -eq "insights_redirect.html") { return "insights_redirect" }
    if ($norm -eq "feature_development.html") { return "feature_development" }
    return "page"
}

function Get-GeneratorSource([string]$path, [string]$family) {
    $norm = $path.Replace("\", "/")
    if (@(
        "signal_report",
        "signal_monitor",
        "historic_reports",
        "podcast",
        "document_library",
        "signal_catalogue",
        "rss_feed",
        "feature_development"
    ) -contains $family) {
        return "investor_anatomy_code"
    }

    if ($norm -like "ia_explained/archive/*") { return "website_archive" }
    return "website_authored"
}

function To-Title([string]$value) {
    $text = ($value -replace "[_-]+", " ").Trim()
    if (-not $text) { return "" }

    $words = $text.Split(" ", [System.StringSplitOptions]::RemoveEmptyEntries)
    return ($words | ForEach-Object {
        if ($_.Length -eq 0) {
            $_
        } else {
            $_.Substring(0, 1).ToUpper() + $_.Substring(1)
        }
    }) -join " "
}

function Get-Commodity([string]$path) {
    $norm = $path.Replace("\", "/").ToLowerInvariant()
    if ($norm -match "natural[_ -]?gas") { return "natural_gas" }
    if ($norm -match "crude[_ -]?oil|wti") { return "crude_oil" }
    if ($norm -match "palladium") { return "palladium" }
    if ($norm -match "platinum") { return "platinum" }
    if ($norm -match "lithium") { return "lithium" }
    if ($norm -match "copper") { return "copper" }
    if ($norm -match "silver") { return "silver" }
    if ($norm -match "gold") { return "gold" }
    return ""
}

function Escape-Attr([string]$value) {
    return $value.Replace("&", "&amp;").Replace('"', "&quot;")
}

function Build-ScriptBlock([bool]$isPublic) {
    $block = @'
  <!-- Netlify Identity Widget for Authentication -->
  <script defer src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>

  <!-- Authentication System -->
  <script defer src="/js/auth-config.js"></script>
  <script defer src="/js/monitoring.js"></script>
  <script>
    window.IA_MONITORING_CONFIG = {
      ga4MeasurementId: {{ site.ga4MeasurementId | jsonify }}
    };
  </script>
{AUTH_GUARD}
'@

    $guard = ""
    if (-not $isPublic) {
        $guard = '  <script defer src="/js/auth-guard.js"></script>'
    }

    return ($block -replace "\{AUTH_GUARD\}", $guard).TrimEnd() + "`r`n"
}

$repo = (Resolve-Path $RepoRoot).Path
$htmlFiles = Get-ChildItem -Path $repo -Recurse -File -Filter *.html | Where-Object {
    $_.FullName -notmatch "\\(_site|_site_ga4_test|node_modules)\\" -and
    $_.FullName -notmatch "\\(components|_includes)\\"
}

foreach ($file in $htmlFiles) {
    $relativePath = $file.FullName.Substring($repo.Length).TrimStart("\", "/").Replace("\", "/")
    $text = Get-Content -Path $file.FullName -Raw
    if ($text -notmatch "<body[^>]*>") { continue }

    $family = Get-PageFamily $relativePath
    $generator = Get-GeneratorSource $relativePath $family
    $modelName = [System.IO.Path]::GetFileNameWithoutExtension($relativePath.Split("/")[-1])
    $contentName = if ($relativePath -eq "index.html") {
        "Investor Anatomy"
    } elseif ($relativePath -eq "login.html") {
        "Login"
    } else {
        To-Title $modelName
    }
    $commodity = Get-Commodity $relativePath
    $isPublic = @("index.html", "login.html") -contains $relativePath
    $scriptBlock = Build-ScriptBlock -isPublic:$isPublic

    $text = [regex]::Replace($text, '(?is)\s*<script\s+defer\s+src="https://identity\.netlify\.com/v1/netlify-identity-widget\.js"></script>\s*', "`r`n")
    $text = [regex]::Replace($text, '(?is)\s*<script\s+src="https://identity\.netlify\.com/v1/netlify-identity-widget\.js"></script>\s*', "`r`n")
    $text = [regex]::Replace($text, '(?is)\s*<script\s+defer\s+src="/js/auth-config\.js"></script>\s*', "`r`n")
    $text = [regex]::Replace($text, '(?is)\s*<script\s+defer\s+src="/js/auth-guard\.js"></script>\s*', "`r`n")
    $text = [regex]::Replace($text, '(?is)\s*<script\s+src="/js/monitoring\.js"></script>\s*', "`r`n")
    $text = [regex]::Replace($text, '(?is)\s*<script>\s*window\.IA_MONITORING_CONFIG\s*=\s*\{.*?\};\s*</script>\s*', "`r`n")

    $text = [regex]::Replace(
        $text,
        "(?is)<head>\s*",
        [System.Text.RegularExpressions.MatchEvaluator]{
            param($m)
            return "<head>`r`n$scriptBlock"
        },
        1
    )

    $bodyMatch = [regex]::Match($text, "(?is)<body([^>]*)>")
    if ($bodyMatch.Success) {
        $existingAttrs = $bodyMatch.Groups[1].Value
        $existingAttrs = [regex]::Replace($existingAttrs, '\sdata-ia-[a-z-]+="[^"]*"', "")
        $existingAttrs = $existingAttrs.Trim()

        $metaAttrs = New-Object System.Collections.Generic.List[string]
        $metaAttrs.Add('data-ia-page-family="' + (Escape-Attr $family) + '"')
        $metaAttrs.Add('data-ia-generator-source="' + (Escape-Attr $generator) + '"')
        $metaAttrs.Add('data-ia-content-name="' + (Escape-Attr $contentName) + '"')
        $metaAttrs.Add('data-ia-model-name="' + (Escape-Attr $modelName) + '"')
        if ($commodity) {
            $metaAttrs.Add('data-ia-commodity="' + (Escape-Attr $commodity) + '"')
        }

        $newBody = "<body"
        if ($existingAttrs) {
            $newBody += " " + $existingAttrs
        }
        $newBody += " " + ($metaAttrs -join " ") + ">"

        $text = [regex]::Replace(
            $text,
            "(?is)<body([^>]*)>",
            [System.Text.RegularExpressions.MatchEvaluator]{
                param($m)
                return $newBody
            },
            1
        )
    }

    Set-Content -Path $file.FullName -Value $text -Encoding UTF8
}
