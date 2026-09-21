<#
.SYNOPSIS
    Verify result after hierarchy and depth populate.

.DESCRIPTION
    Reads target template file and prints first N rows to check correctness.
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$TemplateFile,

    [string]$SheetName = "Sheet1",
    [int]$ShowRows = 30,
    [int]$DataStartRow = 3
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

if (-not (Test-Path $TemplateFile)) {
    Write-Error "File does not exist: $TemplateFile"
    exit 1
}

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    $workbook = $excel.Workbooks.Open($TemplateFile)
    $sheet = $workbook.Sheets.Item($SheetName)

    $usedRange = $sheet.UsedRange
    $rowsCount = $usedRange.Rows.Count
    $values = $usedRange.Value2

    # Find last row
    $lastRow = 0
    for ($r = $rowsCount; $r -ge 1; $r--) {
        $isEmpty = $true
        for ($c = 1; $c -le 20; $c++) {
            $val = $values[$r, $c]
            if ($val -ne $null -and $val.ToString().Trim() -ne "") {
                $isEmpty = $false
                break
            }
        }
        if (-not $isEmpty) {
            $lastRow = $r
            break
        }
    }

    $maxRow = if ($ShowRows -gt 0) { [Math]::Min($DataStartRow + $ShowRows - 1, $lastRow) } else { $lastRow }

    Write-Host ""
    Write-Host "=== VERIFY RESULT ==="
    Write-Host "File: $TemplateFile"
    Write-Host "Sheet: $SheetName"
    Write-Host "Total rows: $($lastRow - $DataStartRow + 1)"
    Write-Host "Showing row $DataStartRow to $maxRow"
    Write-Host ""

    # Header
    $headerFormat = "{0,-6} {1,-30} {2,-8} {3,-10} {4,-10} {5,-8} {6,-6}"
    Write-Host ($headerFormat -f "ID", "Indicator Name", "Sibling", "STT_HT", "ParentId", "GocId", "Depth")
    Write-Host ("-" * 90)

    $errorCount = 0
    for ($r = $DataStartRow; $r -le $maxRow; $r++) {
        $id = $values[$r, 1]
        $name = $values[$r, 4]
        $stt = $values[$r, 10]        # Col J (10)
        $sttHT = $values[$r, 11]      # Col K (11)
        $capCha = $values[$r, 12]     # Col L (12)
        $gocId = $values[$r, 13]      # Col M (13)
        $depth = $values[$r, 14]      # Col N (14)

        $nameStr = if ($name) { $name.ToString().Trim() } else { "(empty)" }
        if ($nameStr.Length -gt 28) { $nameStr = $nameStr.Substring(0, 28) + ".." }

        $idStr = if ($id) { $id.ToString() } else { "" }
        $sttStr = if ($stt) { $stt.ToString() } else { "" }
        $sttHTStr = if ($sttHT) { $sttHT.ToString() } else { "" }
        $capChaStr = if ($capCha) { $capCha.ToString() } else { "" }
        $gocIdStr = if ($gocId) { $gocId.ToString() } else { "" }
        $depthStr = if ($depth -ne $null) { $depth.ToString() } else { "N/A" }

        # Check for errors
        $hasError = $false
        if ($sttStr -eq "" -and $sttHTStr -eq "" -and $capChaStr -eq "" -and $gocIdStr -eq "" -and $depthStr -eq "N/A") {
            $hasError = $true
            $errorCount++
        }

        $line = $headerFormat -f $idStr, $nameStr, $sttStr, $sttHTStr, $capChaStr, $gocIdStr, $depthStr
        if ($hasError) {
            Write-Host $line -ForegroundColor Red
        } else {
            Write-Host $line
        }
    }

    Write-Host ""
    Write-Host "=== SUMMARY ==="
    Write-Host "Total rows: $($lastRow - $DataStartRow + 1)"
    if ($errorCount -gt 0) {
        Write-Host "Rows with missing data: $errorCount" -ForegroundColor Yellow
    } else {
        Write-Host "All rows populated correctly." -ForegroundColor Green
    }

    $workbook.Close($false)
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
