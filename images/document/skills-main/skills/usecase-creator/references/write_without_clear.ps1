$txtPath = "C:\Users\congnt\OneDrive - Synodus.com\GOV\skills-main\skills\usecase-creator\references\new_ucs.txt"
$xlsxPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document\23. Danh_sach_UseCase_Netzero_v1.xlsx"

try {
    Write-Output "Reading Use Cases..."
    $lines = Get-Content -Path $txtPath -Encoding UTF8
    $validLines = @()
    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $parts = $line.Split("|")
        if ($parts.Length -lt 5) { continue }
        $validLines += ,$parts
    }
    Write-Output "Loaded $($validLines.Count) Use Cases."

    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    $wb = $excel.Workbooks.Open($xlsxPath)
    $sheet2 = $wb.Sheets.Item(2)
    
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
        
        # Color yellow and set borders
        for ($c = 1; $c -le 7; $c++) {
            $cell = $sheet2.Cells.Item($row, $c)
            $cell.Interior.Color = 65535 # Yellow
            $cell.Borders.LineStyle = 1
            $cell.Borders.Weight = 2
        }
        $row++
        $stt++
    }
    
    # Update sheet 1 formulas
    $sheet1 = $wb.Sheets.Item(1)
    $sheet2Name = $sheet2.Name
    $sheet1.Cells.Item(4, 2).Formula = "=COUNTA('$sheet2Name'!`$A`$6:`$A`$5000)"
    $sheet1.Cells.Item(6, 2).Formula = "=B4-B5"
    
    Write-Output "Value at 130, 4 immediately before Save: '$($sheet2.Cells.Item(130, 4).Text)'"
    
    Write-Output "Saving..."
    $wb.Save()
    
    Write-Output "Value at 130, 4 immediately after Save: '$($sheet2.Cells.Item(130, 4).Text)'"
    
    $wb.Close($true)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    
    # Reopen and verify
    Write-Output "Reopening..."
    $excel2 = New-Object -ComObject Excel.Application
    $excel2.Visible = $false
    $excel2.DisplayAlerts = 0
    $wb2 = $excel2.Workbooks.Open($xlsxPath)
    $sheet2_reopened = $wb2.Sheets.Item(2)
    
    Write-Output "Verified Value at 130, 4 after reopen: '$($sheet2_reopened.Cells.Item(130, 4).Text)'"
    Write-Output "Verified Value at 152, 4 after reopen: '$($sheet2_reopened.Cells.Item(152, 4).Text)'"
    
    $wb2.Close($false)
    $excel2.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel2) | Out-Null
    
} catch {
    Write-Error "Error: $_"
    if ($null -ne $excel) { $excel.Quit() }
}
