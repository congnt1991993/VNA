$txtPath = "C:\Users\congnt\OneDrive - Synodus.com\GOV\skills-main\skills\usecase-creator\references\new_ucs.txt"
$xlsxPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document\23. Danh_sach_UseCase_Netzero_v1.xlsx"

try {
    $lines = Get-Content -Path $txtPath -Encoding UTF8
    $firstLine = $lines[0]
    Write-Output "First Line: $firstLine"
    
    $parts = $firstLine.Split("|")
    Write-Output "Parts Count: $($parts.Length)"
    Write-Output "Part 0: '$($parts[0].Trim())'"
    Write-Output "Part 1: '$($parts[1].Trim())'"
    
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    $wb = $excel.Workbooks.Open($xlsxPath)
    $sheet = $wb.Sheets.Item(2)
    
    Write-Output "Writing to cells..."
    $sheet.Cells.Item(130, 1).Value = "125"
    $sheet.Cells.Item(130, 2).Value = "UC-125"
    $sheet.Cells.Item(130, 3).Value = $parts[0].Trim()
    $sheet.Cells.Item(130, 4).Value = $parts[1].Trim()
    $sheet.Cells.Item(130, 5).Value = $parts[2].Trim()
    $sheet.Cells.Item(130, 6).Value = $parts[3].Trim()
    $sheet.Cells.Item(130, 7).Value = $parts[4].Trim()
    
    Write-Output "Cell (130, 3) immediately after write: '$($sheet.Cells.Item(130, 3).Text)'"
    Write-Output "Cell (130, 4) immediately after write: '$($sheet.Cells.Item(130, 4).Text)'"
    
    $wb.Save()
    $wb.Close($true)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    
    Write-Output "Reopening to verify..."
    $excel2 = New-Object -ComObject Excel.Application
    $excel2.Visible = $false
    $excel2.DisplayAlerts = 0
    $wb2 = $excel2.Workbooks.Open($xlsxPath)
    $sheet2 = $wb2.Sheets.Item(2)
    Write-Output "Verified Cell (130, 3): '$($sheet2.Cells.Item(130, 3).Text)'"
    Write-Output "Verified Cell (130, 4): '$($sheet2.Cells.Item(130, 4).Text)'"
    $wb2.Close($false)
    $excel2.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel2) | Out-Null
    
} catch {
    Write-Error "Error: $_"
    if ($null -ne $excel) { $excel.Quit() }
}
