<#
.SYNOPSIS
    Calculate and write recursive depth values for DM_BieuTieuChi template.

.DESCRIPTION
    Calculates depth recursively based on parent-child relationships,
    optionally matching with a source file.
#>

param(
    [string]$SourceFile = "",

    [Parameter(Mandatory=$true)]
    [string]$TemplateFile,

    [string]$SourceSheet = "Sheet1",
    [string]$TargetSheet = "Sheet1",
    [int]$DataStartRow = 3,
    [int]$DepthColumn = 14,
    [int]$TargetDepthColumn = 14,
    [int]$ParentIdColumn = 12
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Validate input
if ($SourceFile -ne "" -and -not (Test-Path $SourceFile)) {
    Write-Error "Source file does not exist: $SourceFile"
    exit 1
}
if (-not (Test-Path $TemplateFile)) {
    Write-Error "Template file does not exist: $TemplateFile"
    exit 1
}

# Kill existing Excel processes
Stop-Process -Name excel -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# ===== FUNCTIONS =====

function Get-Row-Key($tccdId, $refId, $tcCode, $refCode, $tcName) {
    if ($tccdId -ne $null -and $tccdId.ToString().Trim() -ne "" -and [double]$tccdId -gt 0) {
        return "TCCD_" + $tccdId.ToString().Trim()
    }
    if ($refId -ne $null -and $refId.ToString().Trim() -ne "" -and [double]$refId -gt 0) {
        return "REF_" + $refId.ToString().Trim()
    }
    if ($tcCode -ne $null -and $tcCode.ToString().Trim() -ne "") {
        return "CODE_" + $tcCode.ToString().Trim()
    }
    if ($refCode -ne $null -and $refCode.ToString().Trim() -ne "") {
        return "REFCODE_" + $refCode.ToString().Trim()
    }
    $nameStr = if ($tcName -ne $null) { $tcName.ToString().Trim() } else { "" }
    return "NAME_" + $nameStr
}

# ===== MAIN LOGIC =====

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    $wb1 = $null
    $sourceDepths = @{}

    if ($SourceFile -ne "") {
        Write-Host "Opening source file: $SourceFile"
        $wb1 = $excel.Workbooks.Open($SourceFile)
        $sh1 = $wb1.Sheets.Item($SourceSheet)
        $vals1 = $sh1.UsedRange.Value2
        $r1Count = $sh1.UsedRange.Rows.Count

        # Find last non-empty row in source
        $lastRow1 = 0
        for ($r = $r1Count; $r -ge 1; $r--) {
            $isEmpty = $true
            for ($c = 1; $c -le 20; $c++) {
                $val = $vals1[$r, $c]
                if ($val -ne $null -and $val.ToString().Trim() -ne "") {
                    $isEmpty = $false
                    break
                }
            }
            if (-not $isEmpty) {
                $lastRow1 = $r
                break
            }
        }

        Write-Host "Source last non-empty row: $lastRow1"

        # Build depth table from source
        for ($r = $DataStartRow; $r -le $lastRow1; $r++) {
            $name = $vals1[$r, 4]
            $refCode = $vals1[$r, 8]
            $depth = $vals1[$r, $DepthColumn]

            $key = Get-Row-Key $null $null $null $refCode $name

            if (-not $sourceDepths.ContainsKey($key)) {
                $sourceDepths[$key] = @()
            }
            $sourceDepths[$key] += if ($depth -ne $null) { [int]$depth } else { 0 }
        }

        Write-Host "Read $($sourceDepths.Count) groups from source."
    } else {
        Write-Host "No source file provided. Will calculate depth recursively."
    }

    Write-Host "Opening template file: $TemplateFile"
    $wb2 = $excel.Workbooks.Open($TemplateFile)
    $sh2 = $wb2.Sheets.Item($TargetSheet)
    $vals2 = $sh2.UsedRange.Value2
    $r2Count = $sh2.UsedRange.Rows.Count

    # Find last non-empty row in template
    $lastRow2 = 0
    for ($r = $r2Count; $r -ge 1; $r--) {
        $isEmpty = $true
        for ($c = 1; $c -le 20; $c++) {
            $val = $vals2[$r, $c]
            if ($val -ne $null -and $val.ToString().Trim() -ne "") {
                $isEmpty = $false
                break
            }
        }
        if (-not $isEmpty) {
            $lastRow2 = $r
            break
        }
    }

    Write-Host "Template last non-empty row: $lastRow2"

    # Read template rows
    $tempRows = @()
    for ($r = $DataStartRow; $r -le $lastRow2; $r++) {
        $id = $vals2[$r, 1]
        $name = $vals2[$r, 4]
        $refCode = $vals2[$r, 8]
        $parentVal = $vals2[$r, $ParentIdColumn]

        $parentId = if ($parentVal) { $parentVal.ToString().Trim() } else { "" }
        $nameStr = if ($name -ne $null) { $name.ToString().Trim() } else { "" }
        $refCodeStr = if ($refCode -ne $null) { $refCode.ToString().Trim() } else { "" }

        $key = Get-Row-Key $null $null $null $refCodeStr $nameStr

        $tempRows += [PSCustomObject]@{
            ExcelRowIndex = $r
            Id = if ($id) { $id.ToString().Trim() } else { "" }
            Name = $nameStr
            RefCode = $refCodeStr
            ParentId = $parentId
            Key = $key
            Depth = $null
            IsMapped = $false
        }
    }

    Write-Host "Read $($tempRows.Count) rows from template."

    # Direct mapping
    $tempCounters = @{}
    $mappedCount = 0
    if ($SourceFile -ne "") {
        for ($i = 0; $i -lt $tempRows.Count; $i++) {
            $curr = $tempRows[$i]
            $key = $curr.Key

            if (-not $tempCounters.ContainsKey($key)) {
                $tempCounters[$key] = 0
            }
            $occurIndex = $tempCounters[$key]
            $tempCounters[$key] = $occurIndex + 1

            if ($sourceDepths.ContainsKey($key) -and $occurIndex -lt $sourceDepths[$key].Count) {
                $curr.Depth = $sourceDepths[$key][$occurIndex]
                $curr.IsMapped = $true
                $mappedCount++
            }
        }
    }

    Write-Host "Directly matched: $mappedCount / $($tempRows.Count) rows."

    # Recursive depth solver function
    function Get-Resolved-Depth($rowIdx) {
        $r = $tempRows[$rowIdx]
        if ($r.Depth -ne $null) {
            return $r.Depth
        }

        if ($r.ParentId -eq "") {
            $r.Depth = 0
            return 0
        }

        $parentIdx = -1
        for ($j = 0; $j -lt $tempRows.Count; $j++) {
            if ($tempRows[$j].Id -eq $r.ParentId) {
                $parentIdx = $j
                break
            }
        }

        if ($parentIdx -eq -1) {
            $r.Depth = 0
            return 0
        }

        $parentDepth = Get-Resolved-Depth $parentIdx
        $r.Depth = $parentDepth + 1
        return $r.Depth
    }

    # Resolve remaining unmapped rows
    $resolvedCount = 0
    for ($i = 0; $i -lt $tempRows.Count; $i++) {
        if ($tempRows[$i].Depth -eq $null) {
            $depth = Get-Resolved-Depth $i
            $resolvedCount++
        }
    }
    Write-Host "Resolved $resolvedCount unmapped rows recursively."

    # Bulk write to Excel
    Write-Host "Preparing 2D array for bulk write..."
    $numRowsToWrite = $tempRows.Count
    $dataArray = New-Object 'System.Object[,]' $numRowsToWrite, 1

    for ($i = 0; $i -lt $numRowsToWrite; $i++) {
        $dataArray[$i, 0] = $tempRows[$i].Depth
    }

    Write-Host "Writing recursive depths to Target Column $TargetDepthColumn..."
    $targetRange = $sh2.Range($sh2.Cells.Item($DataStartRow, $TargetDepthColumn), $sh2.Cells.Item($lastRow2, $TargetDepthColumn))
    $targetRange.Value2 = $dataArray

    Write-Host "Saving template..."
    $wb2.Save()
    Write-Host "=== COMPLETE: Populated depth for $numRowsToWrite rows ==="

    if ($wb1 -ne $null) {
        $wb1.Close($false)
    }
    $wb2.Close($true)
} catch {
    Write-Host "ERROR:"
    Write-Host $_.Exception.Message
    Write-Host $_.ScriptStackTrace
    exit 1
} finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
