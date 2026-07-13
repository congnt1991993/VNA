$pagesDir = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\netzero-vietnamairlines-com\pages"

$config = @(
    @{ file = "OpsFlight.tsx";  dept = "T\u1ed5 Khai th\u00e1c (TT\u0110HKT)";          line = 187 }
    @{ file = "OpsATCL.tsx";    dept = "Ban An to\u00e0n ch\u1ea5t l\u01b0\u1ee3ng (Ban ATCL)"; line = 186 }
    @{ file = "OpsTTBSV.tsx";   dept = "Trung t\u00e2m B\u00f4ng Sen V\u00e0ng (TTBSV)";   line = 186 }
    @{ file = "OpsDigital.tsx"; dept = "Ban Chuy\u1ec3n \u0111\u1ed5i s\u1ed1 & CNTT";          line = 245 }
    @{ file = "OpsService.tsx"; dept = "T\u1ed5 D\u1ecbch v\u1ee5";                      line = 350 }
    @{ file = "OpsHR.tsx";      dept = "Ban T\u1ed5 ch\u1ee9c Nh\u00e2n l\u1ef1c";           line = 400 }
    @{ file = "OpsPlanning.tsx";dept = "Ban K\u1ebf ho\u1ea1ch Ph\u00e1t tri\u1ec3n";        line = 454 }
)

$importLine = "import { UnifiedDataEntryForm } from '../components/UnifiedDataEntryForm';"

foreach ($item in $config) {
    $filePath = Join-Path $pagesDir $item.file
    Write-Host "Processing $($item.file)..."
    
    $lines = [System.IO.File]::ReadAllLines($filePath, [System.Text.Encoding]::UTF8)
    $lineIdx = $item.line - 1  # Convert to 0-based
    
    # Step 1: Add import if not present
    if (-not ($lines -join "`n" | Select-String "UnifiedDataEntryForm")) {
        # Find last import line
        $lastImportIdx = -1
        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match "^import ") { $lastImportIdx = $i }
        }
        if ($lastImportIdx -ge 0) {
            $linesList = [System.Collections.Generic.List[string]]$lines
            $linesList.Insert($lastImportIdx + 1, $importLine)
            $lines = $linesList.ToArray()
            $lineIdx++  # Adjust for inserted line
            Write-Host "  -> Added import"
        }
    }
    
    # Step 2: Find the exact condition line (search near expected line)
    $detailLineIdx = -1
    for ($i = [Math]::Max(0, $lineIdx - 5); $i -lt [Math]::Min($lines.Length, $lineIdx + 5); $i++) {
        if ($lines[$i] -match "mainTab.*INFO.*viewMode.*DETAIL.*formRecord") {
            $detailLineIdx = $i
            break
        }
    }
    
    if ($detailLineIdx -lt 0) {
        Write-Host "  -> WARNING: Could not find DETAIL line near $($item.line), searching whole file..."
        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match "mainTab.*INFO.*viewMode.*DETAIL.*formRecord") {
                $detailLineIdx = $i
                Write-Host "  -> Found at line $($i + 1)"
                break
            }
        }
    }
    
    if ($detailLineIdx -lt 0) {
        Write-Host "  -> ERROR: No DETAIL line found, skipping!"
        continue
    }
    
    Write-Host "  -> Found DETAIL condition at line $($detailLineIdx + 1)"
    
    # Step 3: Insert the UnifiedDataEntryForm block right after the condition line
    # Replace the condition line: add the form after it (before the existing content, which we'll disable with `false &&`)
    $existingLine = $lines[$detailLineIdx]
    $dept = $item.dept
    
    $newBlock = "      {mainTab === 'INFO' && viewMode === 'DETAIL' && formRecord && (
        <UnifiedDataEntryForm
          department=""$dept""
          effectivePeriod={formRecord.effectivePeriod}
          onBack={() => setViewMode('LIST')}
          onSave={handleSave}
        />
      )}
      {false && $($existingLine.Trim())"
    
    $linesList = [System.Collections.Generic.List[string]]$lines
    $linesList[$detailLineIdx] = $newBlock
    $lines = $linesList.ToArray()
    
    [System.IO.File]::WriteAllLines($filePath, $lines, [System.Text.Encoding]::UTF8)
    Write-Host "  -> Done!"
}

Write-Host "`nAll files processed!"
