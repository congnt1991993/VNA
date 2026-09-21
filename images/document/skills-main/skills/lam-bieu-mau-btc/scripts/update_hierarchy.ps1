<#
.SYNOPSIS
    Populate hierarchy data (columns J-M) in DM_BieuTieuChi template.

.DESCRIPTION
    This script parses hierarchical STT codes and populates: SoThuTu (J), SoThuTuHienThi (K), CapChaId (L), GocId (M).
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$TemplateFile,

    [string]$SheetName = "Sheet1",
    [int]$DataStartRow = 3,
    [bool]$CreateBackup = $true
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Validate input
if (-not (Test-Path $TemplateFile)) {
    Write-Error "File does not exist: $TemplateFile"
    exit 1
}

# Backup handling
$backupPath = $TemplateFile + ".backup"
if ($CreateBackup) {
    if (Test-Path $backupPath) {
        Write-Host "Restoring original file from backup: $backupPath"
        Copy-Item -Path $backupPath -Destination $TemplateFile -Force
    } else {
        Write-Host "Creating first-time backup at: $backupPath"
        Copy-Item -Path $TemplateFile -Destination $backupPath -Force
    }
}

# Kill existing Excel processes to avoid file lock
Stop-Process -Name excel -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# ===== FUNCTIONS =====

function Get-STT-Type($s) {
    if ($null -eq $s -or $s.ToString().Trim() -eq "") { return "EMPTY" }
    $s = $s.ToString().Trim()
    if ($s -eq "-") { return "DASH" }
    if ($s -cmatch '^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.\d+$') { return "ROMAN_DOTTED" }
    if ($s -cmatch '^(I|II|III|IV|V|VI|VII|VIII|IX|X)$') { return "ROMAN" }
    if ($s -cmatch '^[A-Z]\.\d+$' -or $s -cmatch '^[A-Z]\d+$') { return "ALPHABET_DOTTED" }
    if ($s -cmatch '^[A-Z]$') { return "ALPHABET_ROOT" }
    if ($s -cmatch '^[a-z]$') { return "LOWERCASE" }
    if ($s -cmatch '^\d+(\.\d+)+$') { return "NUMERIC_DOTTED" }
    if ($s -cmatch '^\d+$') { return "NUMERIC_SINGLE" }
    return "UNKNOWN"
}

function Get-STT-Level($type, $s) {
    if ($type -eq "ALPHABET_ROOT") { return 0 }
    if ($type -eq "ALPHABET_DOTTED") { return 1 }
    if ($type -eq "ROMAN") { return 2 }
    if ($type -eq "ROMAN_DOTTED") { return 3 }
    if ($type -eq "NUMERIC_SINGLE") { return 4 }
    if ($type -eq "NUMERIC_DOTTED") {
        if ($null -eq $s) { return 5 }
        $dotCount = ($s.ToCharArray() | Where-Object { $_ -eq '.' }).Count
        return 4 + $dotCount
    }
    if ($type -eq "LOWERCASE") { return 7 }
    if ($type -eq "DASH") { return 8 }
    return 99
}

# ===== MAIN LOGIC =====

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    Write-Host "Opening workbook: $TemplateFile"
    $workbook = $excel.Workbooks.Open($TemplateFile)
    $sheet = $workbook.Sheets.Item($SheetName)

    $usedRange = $sheet.UsedRange
    $rowsCount = $usedRange.Rows.Count
    $values = $usedRange.Value2

    # Find last non-empty row
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

    Write-Host "Last non-empty data row: $lastRow"

    if ($lastRow -lt $DataStartRow) {
        Write-Error "No data found starting from row $DataStartRow!"
        exit 1
    }

    # Scan Column K (11) for any values to determine if we should fall back to Column J (10)
    $hasColKValues = $false
    for ($r = $DataStartRow; $r -le $lastRow; $r++) {
        $valK = $values[$r, 11]
        if ($null -ne $valK -and $valK.ToString().Trim() -ne "") {
            $hasColKValues = $true
            break
        }
    }
    Write-Host "Column K has non-empty values: $hasColKValues"

    # Build row objects array
    $rows = @()
    $needsSTTWrite = $false
    for ($r = $DataStartRow; $r -le $lastRow; $r++) {
        $id = $values[$r, 1]         # Col A: Id
        if ($null -eq $id -or $id.ToString().Trim() -eq "") {
            $id = $r - $DataStartRow + 1
            $needsSTTWrite = $true
        }
        $name = $values[$r, 4]       # Col D: TenTieuChiCoDinh
        $refCode = $values[$r, 8]    # Col H: MaThamChieu
        $refName = $values[$r, 9]    # Col I: TenThamChieu
        $dispStt = $values[$r, 11]   # Col K: SoThuTuHienThi
        if (-not $hasColKValues -and ($null -eq $dispStt -or $dispStt.ToString().Trim() -eq "")) {
            $dispStt = $values[$r, 10] # Col J: SoThuTu
        }

        $hasName = $null -ne $name -and $name.ToString().Trim() -ne ""
        $displayName = if ($name) { $name } else { "Ref: " + $refCode + " (" + $refName + ")" }
        $sttStr = if ($dispStt -ne $null) { $dispStt.ToString().Trim() } else { "" }
        $sttType = Get-STT-Type $sttStr
        $sttLevel = Get-STT-Level $sttType $sttStr

        $rowObj = [PSCustomObject]@{
            ExcelRowIndex = $r
            Id = $id
            DisplayName = $displayName
            HasName = $hasName
            STT_HienThi = $sttStr
            STT_Type = $sttType
            STT_Level = $sttLevel
            ParentId = $null
            ParentRow = $null
            GocId = $null
            SoThuTu = 0
        }
        $rows += $rowObj
    }

    Write-Host "Read $($rows.Count) rows of data."

    if ($needsSTTWrite) {
        Write-Host "STT column (Col A) is empty. Populating with sequential IDs..."
        $sttArray = New-Object 'System.Object[,]' $rows.Count, 1
        for ($i = 0; $i -lt $rows.Count; $i++) {
            $sttArray[$i, 0] = $rows[$i].Id
        }
        $sttRange = $sheet.Range($sheet.Cells.Item($DataStartRow, 1), $sheet.Cells.Item($lastRow, 1))
        $sttRange.Value2 = $sttArray
    }

    # ===== PARSE RELATIONSHIPS =====
    for ($i = 0; $i -lt $rows.Count; $i++) {
        $curr = $rows[$i]
        $type = $curr.STT_Type
        $s = $curr.STT_HienThi

        $lvl = $curr.STT_Level

        if ($type -eq "EMPTY") {
            if ($curr.HasName) {
                # Category header EMPTY row: parent is nearest preceding ROMAN or ALPHABET row (Level <= 3)
                for ($j = $i - 1; $j -ge 0; $j--) {
                    $pLvl = $rows[$j].STT_Level
                    if ($pLvl -ne 99 -and $pLvl -le 3) {
                        $curr.ParentRow = $rows[$j]
                        $curr.ParentId = $rows[$j].Id
                        break
                    }
                }
            } else {
                # Detail/lookup EMPTY row: parent and GocId stay empty
                $curr.ParentId = ""
                $curr.GocId = ""
            }
        }
        else {
            # Dotted, Roman, Numeric, Lowercase, Alphabet, or Dash:
            # Parent is the nearest preceding row with Level < current row's level
            for ($j = $i - 1; $j -ge 0; $j--) {
                $pLvl = $rows[$j].STT_Level
                # Skip EMPTY rows that have no parent (Detail/lookup rows)
                if ($pLvl -eq 99 -and -not $rows[$j].HasName) {
                    continue
                }
                
                # Check level constraint: parent level must be strictly less than current level
                if ($pLvl -ne 99 -and $pLvl -lt $lvl) {
                    $curr.ParentRow = $rows[$j]
                    $curr.ParentId = $rows[$j].Id
                    break
                }
            }
        }

        # Calculate GocId recursively
        if ($null -eq $curr.GocId) {
            if ($curr.ParentRow -ne $null) {
                $curr.GocId = $curr.ParentRow.GocId
            } else {
                $curr.GocId = $curr.Id
            }
        }
    }

    # ===== CALCULATE SIBLING ORDER =====
    $siblingCounts = @{}
    for ($i = 0; $i -lt $rows.Count; $i++) {
        $curr = $rows[$i]
        
        # Detail/lookup EMPTY row should not get a sibling index and not increment sibling counts
        if ($curr.STT_Type -eq "EMPTY" -and -not $curr.HasName) {
            $curr.SoThuTu = ""
            continue
        }
        
        $pKey = if ($curr.ParentId -ne $null -and $curr.ParentId.ToString() -ne "") { $curr.ParentId.ToString() } else { "ROOT" }
        if (-not $siblingCounts.ContainsKey($pKey)) {
            $siblingCounts[$pKey] = 0
        }
        $siblingCounts[$pKey] = $siblingCounts[$pKey] + 1
        $curr.SoThuTu = $siblingCounts[$pKey]
    }

    # ===== BULK WRITE =====
    Write-Host "Preparing 2D array for bulk write..."
    $numRowsToWrite = $rows.Count
    $dataArray = New-Object 'System.Object[,]' $numRowsToWrite, 4

    for ($i = 0; $i -lt $numRowsToWrite; $i++) {
        $r = $rows[$i]
        $dataArray[$i, 0] = $r.SoThuTu
        $dataArray[$i, 1] = $r.STT_HienThi
        $dataArray[$i, 2] = if ($r.ParentId -ne $null -and $r.ParentId.ToString() -ne "") { $r.ParentId } else { "" }
        $dataArray[$i, 3] = if ($r.GocId -ne $null -and $r.GocId.ToString() -ne "") { $r.GocId } else { "" }
    }

    Write-Host "Writing data to J-M ($DataStartRow to $lastRow)..."
    $targetRange = $sheet.Range($sheet.Cells.Item($DataStartRow, 10), $sheet.Cells.Item($lastRow, 13))
    $targetRange.Value2 = $dataArray

    Write-Host "Saving workbook..."
    $workbook.Save()
    Write-Host "=== COMPLETE: Populated hierarchy for $numRowsToWrite rows ==="
    $workbook.Close($true)
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
