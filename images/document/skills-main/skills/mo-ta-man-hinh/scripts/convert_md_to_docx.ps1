param (
    [string]$SourcePath,
    [string]$DestPath
)

# Function to convert simple Markdown to HTML
function Convert-MarkdownToHtml {
    param ([string]$MdContent)

    $lines = $MdContent -split "`r`n" -split "`n"
    $html = New-Object System.Text.StringBuilder
    
    $html.Append("<html><head><meta charset='utf-8'>") | Out-Null
    $html.Append("<style>") | Out-Null
    $html.Append("body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; font-size: 11pt; }") | Out-Null
    $html.Append("h1 { color: #2C3E50; border-bottom: 2px solid #3498DB; padding-bottom: 5px; margin-top: 20px; font-size: 20pt; }") | Out-Null
    $html.Append("h2 { color: #2C3E50; border-bottom: 1px solid #ECF0F1; padding-bottom: 3px; margin-top: 15px; font-size: 14pt; }") | Out-Null
    $html.Append("table { border-collapse: collapse; width: 100%; margin-top: 15px; margin-bottom: 15px; font-size: 10pt; }") | Out-Null
    $html.Append("th, td { border: 1px solid #BDC3C7; padding: 6px 8px; text-align: left; vertical-align: top; }") | Out-Null
    $html.Append("th { background-color: #ECF0F1; font-weight: bold; color: #2C3E50; }") | Out-Null
    $html.Append("tr:nth-child(even) td { background-color: #F9F9F9; }") | Out-Null
    $html.Append("p { margin-bottom: 10px; }") | Out-Null
    $html.Append("ul { margin-top: 5px; margin-bottom: 10px; padding-left: 20px; }") | Out-Null
    $html.Append("li { margin-bottom: 5px; }") | Out-Null
    $html.Append("strong, b { font-weight: bold; color: #111; }") | Out-Null
    $html.Append("</style></head><body>") | Out-Null

    $inTable = $false
    $inList = $false
    $headerDone = $false

    foreach ($line in $lines) {
        $trimmed = $line.Trim()

        # Handle lists
        if ($trimmed -like "* *") {
            $prefix = $trimmed.Substring(0, $trimmed.IndexOf(" "))
            if ($prefix -eq "*" -or $prefix -eq "-") {
                if ($inTable) { $html.Append("</table>`n") | Out-Null; $inTable = $false }
                if (-not $inList) {
                    $html.Append("<ul>`n") | Out-Null
                    $inList = $true
                }
                $itemText = $trimmed.Substring($trimmed.IndexOf(" ") + 1)
                $itemText = Parse-Formatting $itemText
                $html.Append("<li>$itemText</li>`n") | Out-Null
                continue
            }
        }
        
        if ($inList -and -not ($trimmed -like "* *")) {
            $html.Append("</ul>`n") | Out-Null
            $inList = $false
        }

        # Handle tables
        if ($trimmed.StartsWith("|")) {
            if ($inList) { $html.Append("</ul>`n") | Out-Null; $inList = $false }
            if (-not $inTable) {
                $html.Append("<table>`n") | Out-Null
                $inTable = $true
                $headerDone = $false
            }
            
            if ($trimmed -match "^\|[\s:-|]+$") {
                continue
            }
            
            $cells = $trimmed.Split("|")
            $realCells = @()
            for ($i = 1; $i -lt ($cells.Length - 1); $i++) {
                $realCells += $cells[$i].Trim()
            }
            
            if (-not $headerDone) {
                $html.Append("<thead><tr>") | Out-Null
                foreach ($cell in $realCells) {
                    $parsedCell = Parse-Formatting $cell
                    $html.Append("<th>$parsedCell</th>") | Out-Null
                }
                $html.Append("</tr></thead><tbody>`n") | Out-Null
                $headerDone = $true
            } else {
                $html.Append("<tr>") | Out-Null
                foreach ($cell in $realCells) {
                    $parsedCell = Parse-Formatting $cell
                    $html.Append("<td>$parsedCell</td>") | Out-Null
                }
                $html.Append("</tr>`n") | Out-Null
            }
            continue
        }

        if ($inTable -and -not $trimmed.StartsWith("|")) {
            $html.Append("</tbody></table>`n") | Out-Null
            $inTable = $false
        }

        # Handle headings
        if ($trimmed.StartsWith("#")) {
            $level = 0
            while ($trimmed.StartsWith("#")) {
                $level++
                $trimmed = $trimmed.Substring(1)
            }
            $trimmed = $trimmed.Trim()
            $parsedText = Parse-Formatting $trimmed
            $html.Append("<h$level>$parsedText</h$level>`n") | Out-Null
            continue
        }

        if ($trimmed -eq "") {
            continue
        }

        $parsedText = Parse-Formatting $trimmed
        $html.Append("<p>$parsedText</p>`n") | Out-Null
    }

    if ($inTable) {
        $html.Append("</tbody></table>`n") | Out-Null
    }
    if ($inList) {
        $html.Append("</ul>`n") | Out-Null
    }

    $html.Append("</body></html>") | Out-Null
    return $html.ToString()
}

# Helper to convert **bold** and <br> tags
function Parse-Formatting {
    param ([string]$text)
    while ($text -match "\*\*([^*]+)\*\*") {
        $text = $text -replace "\*\*([^*]+)\*\*", "<b>`$1</b>"
    }
    $text = $text -replace "<br\s*/?>", "<br>"
    return $text
}

# Main Execution Flow
Write-Output "Source file: $SourcePath"
Write-Output "Destination file: $DestPath"

if (-not (Test-Path $SourcePath)) {
    Write-Error "Source file does not exist!"
    exit 1
}

$mdContent = Get-Content -Path $SourcePath -Raw -Encoding UTF8

$htmlContent = Convert-MarkdownToHtml -MdContent $mdContent
$tempHtmlPath = Join-Path $env:TEMP "temp_doc_convert.html"
[System.IO.File]::WriteAllText($tempHtmlPath, $htmlContent, [System.Text.Encoding]::UTF8)

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0

    $doc = $word.Documents.Open($tempHtmlPath)
    $doc.SaveAs2($DestPath, 16)
    $doc.Close()
    $word.Quit()
    
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    
    if (Test-Path $tempHtmlPath) {
        Remove-Item $tempHtmlPath
    }
    
    Write-Output "Conversion completed successfully!"
    exit 0
} catch {
    Write-Error "Error during Word conversion: $_"
    if ($null -ne $word) {
        try { $word.Quit() } catch {}
    }
    exit 1
}
