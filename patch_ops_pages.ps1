# Script to patch all Ops pages to use UnifiedDataEntryForm in their DETAIL view

$pagesDir = "pages"

# Mapping: file -> department name
$deptMap = @{
  "OpsComm.tsx"     = "Ban Truyen thong"
  "OpsFlight.tsx"   = "To Khai thac (TTDHKT)"
  "OpsATCL.tsx"     = "Ban An toan chat luong (Ban ATCL)"
  "OpsTTBSV.tsx"    = "Trung tam Bong Sen Vang (TTBSV)"
  "OpsDigital.tsx"  = "Ban Chuyen doi so & CNTT"
  "OpsService.tsx"  = "To Dich vu"
  "OpsHR.tsx"       = "Ban To chuc Nhan luc"
  "OpsPlanning.tsx" = "Ban Ke hoach Phat trien"
}

# Vietnamese dept names
$deptViMap = @{
  "OpsComm.tsx"     = "Ban Truy\u1ec1n th\u00f4ng"
  "OpsFlight.tsx"   = "T\u1ed5 Khai th\u00e1c (TT\u0110HKT)"
  "OpsATCL.tsx"     = "Ban An to\u00e0n ch\u1ea5t l\u01b0\u1ee3ng (Ban ATCL)"
  "OpsTTBSV.tsx"    = "Trung t\u00e2m B\u00f4ng Sen V\u00e0ng (TTBSV)"
  "OpsDigital.tsx"  = "Ban Chuy\u1ec3n \u0111\u1ed5i s\u1ed1 & CNTT"
  "OpsService.tsx"  = "T\u1ed5 D\u1ecbch v\u1ee5"
  "OpsHR.tsx"       = "Ban T\u1ed5 ch\u1ee9c Nh\u00e2n l\u1ef1c"
  "OpsPlanning.tsx" = "Ban K\u1ebf ho\u1ea1ch Ph\u00e1t tri\u1ec3n"
}

foreach ($file in $deptMap.Keys) {
    $filePath = Join-Path $pagesDir $file
    if (!(Test-Path $filePath)) {
        Write-Host "SKIP (not found): $filePath"
        continue
    }

    $content = Get-Content $filePath -Raw -Encoding UTF8
    $deptName = $deptViMap[$file]

    # Step 1: Add import if not present
    if ($content -notmatch "UnifiedDataEntryForm") {
        $importLine = "import { UnifiedDataEntryForm } from '../components/UnifiedDataEntryForm';"
        # Insert after first import line
        $content = $content -replace "(import.*?from.*?;\r?\n)", "`$1$importLine`n", 1
        Write-Host "ADDED IMPORT: $file"
    }

    Write-Host "PROCESSED: $file (dept: $deptName)"
    Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline
}

Write-Host "`nDone!"
