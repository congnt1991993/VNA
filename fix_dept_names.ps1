$pagesDir = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\netzero-vietnamairlines-com\pages"

# Mapping: file -> correct department name (using Unicode literals to be safe, but we'll write actual UTF-8)
$config = @(
    @{ file = "OpsFlight.tsx";  escapedDept = "T\\u1ed5 Khai th\\u00e1c (TT\\u0110HKT)";  realDept = "T" + [char]0x1ED5 + " Khai th" + [char]0xE1 + "c (TT" + [char]0x110 + "HKT)" }
    @{ file = "OpsATCL.tsx";    escapedDept = "Ban An to\\u00e0n ch\\u1ea5t l\\u01b0\\u1ee3ng (Ban ATCL)"; realDept = "Ban An to" + [char]0xE0 + "n ch" + [char]0x1EA5 + "t l" + [char]0x1B0 + [char]0x1EE3 + "ng (Ban ATCL)" }
    @{ file = "OpsTTBSV.tsx";   escapedDept = "Trung t\\u00e2m B\\u00f4ng Sen V\\u00e0ng (TTBSV)";      realDept = "Trung t" + [char]0xE2 + "m B" + [char]0xF4 + "ng Sen V" + [char]0xE0 + "ng (TTBSV)" }
    @{ file = "OpsDigital.tsx"; escapedDept = "Ban Chuy\\u1ec3n \\u0111\\u1ed5i s\\u1ed1 & CNTT";       realDept = "Ban Chuy" + [char]0x1EC3 + "n " + [char]0x111 + [char]0x1ED5 + "i s" + [char]0x1ED1 + " & CNTT" }
    @{ file = "OpsService.tsx"; escapedDept = "T\\u1ed5 D\\u1ecbch v\\u1ee5";                           realDept = "T" + [char]0x1ED5 + " D" + [char]0x1ECB + "ch v" + [char]0x1EE5 }
    @{ file = "OpsHR.tsx";      escapedDept = "Ban T\\u1ed5 ch\\u1ee9c Nh\\u00e2n l\\u1ef1c";          realDept = "Ban T" + [char]0x1ED5 + " ch" + [char]0x1EE9 + "c Nh" + [char]0xE2 + "n l" + [char]0x1EF1 + "c" }
    @{ file = "OpsPlanning.tsx";escapedDept = "Ban K\\u1ebf ho\\u1ea1ch Ph\\u00e1t tri\\u1ec3n";        realDept = "Ban K" + [char]0x1EBF + " ho" + [char]0x1EA1 + "ch Ph" + [char]0xE1 + "t tri" + [char]0x1EC3 + "n" }
)

foreach ($item in $config) {
    $filePath = Join-Path $pagesDir $item.file
    Write-Host "Processing $($item.file)..."
    Write-Host "  Replacing escaped dept name with: $($item.realDept)"
    
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    $escapedPattern = 'department="' + $item.escapedDept + '"'
    $realReplacement = 'department="' + $item.realDept + '"'
    
    if ($content -match [regex]::Escape($escapedPattern)) {
        $newContent = $content.Replace($escapedPattern, $realReplacement)
        [System.IO.File]::WriteAllText($filePath, $newContent, (New-Object System.Text.UTF8Encoding($false)))
        Write-Host "  -> Fixed!"
    } else {
        Write-Host "  -> Pattern not found exactly. Trying regex search..."
        # Try to find the line and show it
        $lines = $content -split "`n"
        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match 'department=') {
                Write-Host "  Line $($i+1): $($lines[$i].Trim())"
            }
        }
    }
}
Write-Host "Done!"
