$txtPath = "C:\Users\congnt\OneDrive - Synodus.com\GOV\skills-main\skills\usecase-creator\references\new_ucs.txt"
$xlsxPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document\23. Danh_sach_UseCase_Netzero_v1.xlsx"

try {
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

    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    Write-Output "Opening Excel workbook: $xlsxPath"
    $wb = $excel.Workbooks.Open($xlsxPath)
    
    $sheet2 = $wb.Sheets.Item(2)
    $sheet2Name = $sheet2.Name
    Write-Output "Sheet 2 accessed: $sheet2Name"
    
    # 1. Clear rows 130 to 200 first
    Write-Output "Clearing rows 130 to 200 on Sheet 2..."
    for ($r = 130; $r -le 200; $r++) {
        for ($c = 1; $c -le 7; $c++) {
            $cell = $sheet2.Cells.Item($r, $c)
            $cell.Value = $null
            $cell.Interior.ColorIndex = -4142 # xlNone
            $cell.Borders.LineStyle = -4142 # xlNone
        }
    }
    
    # 2. Write the new Use Cases
    $row = 130
    $stt = 125
    foreach ($parts in $validLines) {
        $ucCode = "UC-$stt"
        
        $sheet2.Cells.Item($row, 1).Value = $stt.ToString()
        $sheet2.Cells.Item($row, 2).Value = $ucCode
        $sheet2.Cells.Item($row, 3).Value = $parts[0].Trim()
        $sheet2.Cells.Item($row, 4).Value = $parts[1].Trim()
        $sheet2.Cells.Item($row, 5).Value = $parts[2].Trim()
        $sheet2.Cells.Item($row, 6).Value = $parts[3].Trim()
        $sheet2.Cells.Item($row, 7).Value = $parts[4].Trim()
        
        # Color yellow and set borders for columns 1-7
        for ($c = 1; $c -le 7; $c++) {
            $cell = $sheet2.Cells.Item($row, $c)
            $cell.Interior.Color = 65535 # Yellow
            $cell.Borders.LineStyle = 1 # xlContinuous
            $cell.Borders.Weight = 2 # xlThin
        }
        
        Write-Output "Written row $row : STT=$stt, Code=$ucCode, Name=$($parts[1].Trim())"
        $row++
        $stt++
    }
    
    # 3. Update Sheet 1 (Tổng quan) formulas
    $sheet1 = $wb.Sheets.Item(1)
    Write-Output "Sheet 1 accessed: $($sheet1.Name)"
    
    # Setting formulas using dynamic sheet name and escaping $ using backticks (no backslashes)
    $sheet1.Cells.Item(4, 2).Formula = "=COUNTA('$sheet2Name'!`$A`$6:`$A`$5000)"
    $sheet1.Cells.Item(6, 2).Formula = "=B4-B5"
    
    Write-Output "Saving workbook..."
    $wb.Save()
    $wb.Close($true)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    Write-Output "Workbook saved and closed successfully."
    
    # 4. Reopen and verify
    Write-Output "Reopening to perform verification..."
    $excel2 = New-Object -ComObject Excel.Application
    $excel2.Visible = $false
    $excel2.DisplayAlerts = 0
    $wb2 = $excel2.Workbooks.Open($xlsxPath)
    
    $vSheet2 = $wb2.Sheets.Item(2)
    Write-Output "--- Verified Sheet 2 (Rows 128 to 155) ---"
    for ($r = 128; $r -le 155; $r++) {
        $cols = @()
        for ($c = 1; $c -le 7; $c++) {
            $cell = $vSheet2.Cells.Item($r, $c)
            $cols += "[$c]:'$($cell.Text)'"
        }
        Write-Output "Row $r : $($cols -join ' | ')"
    }
    
    $vSheet1 = $wb2.Sheets.Item(1)
    Write-Output "--- Verified Sheet 1 Formulas & Values ---"
    Write-Output "B4 (Total UCs) - Text='$($vSheet1.Cells.Item(4, 2).Text)', Formula='$($vSheet1.Cells.Item(4, 2).Formula)'"
    Write-Output "B5 (Web Public) - Text='$($vSheet1.Cells.Item(5, 2).Text)', Formula='$($vSheet1.Cells.Item(5, 2).Formula)'"
    Write-Output "B6 (Trang quản trị) - Text='$($vSheet1.Cells.Item(6, 2).Text)', Formula='$($vSheet1.Cells.Item(6, 2).Formula)'"
    
    $wb2.Close($false)
    $excel2.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel2) | Out-Null
    Write-Output "Verification completed successfully."
    
} catch {
    Write-Error "Error occurred: $_"
    if ($null -ne $excel) {
        $excel.Quit()
    }
}
