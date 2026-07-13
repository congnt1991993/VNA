$pagesDir = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\netzero-vietnamairlines-com\pages"

$files = @("OpsATCL.tsx", "OpsFlight.tsx", "OpsTTBSV.tsx", "OpsDigital.tsx", "OpsHR.tsx", "OpsPlanning.tsx")

foreach ($file in $files) {
    $filePath = Join-Path $pagesDir $file
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    $newContent = $content -replace '\{false && \{mainTab', '{false && mainTab'
    if ($content -ne $newContent) {
        [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Fixed: $file"
    } else {
        Write-Host "No change: $file"
    }
}
Write-Host "Done!"
