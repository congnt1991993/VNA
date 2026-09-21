$txtPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\skills-main\skills\usecase-creator\references\new_survey_ucs.txt"
$parentDir = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document"
$tempPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\temp_update.xlsx"

try {
    # 1. Resolve original path dynamically
    $gocDir = Get-ChildItem -Path $parentDir -Directory | Where-Object { 
        $_.Name -notlike "*Template*" -and 
        $_.Name -notlike "*Bi*" -and 
        $_.Name -notlike "*khao*"
    } | Select-Object -First 1
    
    if (-not $gocDir) {
        throw "Could not find target directory in $parentDir"
    }
    
    $xlsxFile = Get-ChildItem -Path $gocDir.FullName -Filter "*Netzero*.xlsx" | Select-Object -First 1
    if (-not $xlsxFile) {
        throw "Could not find Netzero excel file in $($gocDir.FullName)"
    }
    
    $xlsxPath = $xlsxFile.FullName
    Write-Output "Resolved Excel Path: $xlsxPath"
    
    # 2. Copy to temp path
    Write-Output "Copying to temp path: $tempPath"
    Copy-Item -LiteralPath $xlsxPath -Destination $tempPath -Force
    
    # 3. Read Use Cases
    Write-Output "Reading Use Cases from $txtPath..."
    $lines = Get-Content -Path $txtPath -Encoding UTF8
    $validLines = @()
    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $parts = $line.Split("|")
        if ($parts.Length -lt 5) {
            Write-Warning "Skipping invalid line: $line"
            continue
        }
        $validLines += ,$parts
    }
    Write-Output "Loaded $($validLines.Count) valid Use Cases."
    
    # 4. Open Excel and update
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0
    
    Write-Output "Opening temp workbook..."
    $wb = $excel.Workbooks.Open($tempPath)
    
    $sheet2 = $wb.Sheets.Item(2)
    $sheet2Name = $sheet2.Name
    Write-Output "Sheet 2 accessed: $sheet2Name"
    
    # Find next empty row
    $row = 6
    while ($sheet2.Cells.Item($row, 2).Text -ne "") {
        $row++
    }
    Write-Output "First empty row found at row $row"
    
    # Get starting STT
    $prevSttText = $sheet2.Cells.Item($row - 1, 1).Text
    $stt = [int]$prevSttText + 1
    Write-Output "Starting STT will be $stt"
    
    foreach ($parts in $validLines) {
        $ucCode = "UC-$stt"
        
        $sheet2.Cells.Item($row, 1).Value = $stt.ToString()
        $sheet2.Cells.Item($row, 2).Value = $ucCode
        $sheet2.Cells.Item($row, 3).Value = $parts[0].Trim()
        $sheet2.Cells.Item($row, 4).Value = $parts[1].Trim()
        $sheet2.Cells.Item($row, 5).Value = $parts[2].Trim()
        $sheet2.Cells.Item($row, 6).Value = $parts[3].Trim()
        $sheet2.Cells.Item($row, 7).Value = $parts[4].Trim()
        
        # Color yellow (65535) and set thin borders
        for ($c = 1; $c -le 7; $c++) {
            $cell = $sheet2.Cells.Item($row, $c)
            $cell.Interior.Color = 65535 # Yellow
            $cell.Borders.LineStyle = 1 # xlContinuous
            $cell.Borders.Weight = 2 # xlThin
        }
        
        Write-Output "Written Row $row : STT=$stt | Code=$ucCode | Phân hệ=$($parts[0].Trim()) | Tên=$($parts[1].Trim())"
        $row++
        $stt++
    }
    
    # Update Sheet 1 Formulas
    $sheet1 = $wb.Sheets.Item(1)
    Write-Output "Updating formulas on Sheet 1 (Tổng quan)..."
    $sheet1.Cells.Item(4, 2).Formula = "=COUNTA('$sheet2Name'!`$A`$6:`$A`$5000)"
    $sheet1.Cells.Item(6, 2).Formula = "=B4-B5"
    
    Write-Output "Saving temp workbook..."
    $wb.Save()
    $wb.Close($true)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    Write-Output "Workbook closed and COM object released."
    
    # 5. Copy back to original path
    Write-Output "Copying temp file back to original location..."
    Copy-Item -LiteralPath $tempPath -Destination $xlsxPath -Force
    Remove-Item -Path $tempPath -Force
    Write-Output "Excel updated successfully and temp file cleaned up."
    
} catch {
    Write-Error "Error occurred: $_"
    if ($null -ne $excel) { $excel.Quit() }
    if (Test-Path $tempPath) { Remove-Item -Path $tempPath -Force }
}
