$xlsxPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document\23. Danh_sach_UseCase_Netzero_v1.xlsx"

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    $wb = $excel.Workbooks.Open($xlsxPath)
    $sheet2 = $wb.Sheets.Item(2)
    
    # Write a test value to row 130
    Write-Output "Writing UC-125 to row 130..."
    $sheet2.Cells.Item(130, 1).Value = "125"
    $sheet2.Cells.Item(130, 2).Value = "UC-125"
    $sheet2.Cells.Item(130, 3).Value = "Test Phân Hệ"
    
    Write-Output "Value immediately after write: '$($sheet2.Cells.Item(130, 3).Value)'"
    Write-Output "Text immediately after write: '$($sheet2.Cells.Item(130, 3).Text)'"
    
    Write-Output "Saving workbook..."
    $wb.Save()
    
    Write-Output "Value immediately after Save: '$($sheet2.Cells.Item(130, 3).Value)'"
    Write-Output "Text immediately after Save: '$($sheet2.Cells.Item(130, 3).Text)'"
    
    Write-Output "Closing workbook..."
    $wb.Close($true)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    
    Write-Output "Reopening workbook..."
    $excel2 = New-Object -ComObject Excel.Application
    $excel2.Visible = $false
    $excel2.DisplayAlerts = 0
    $wb2 = $excel2.Workbooks.Open($xlsxPath)
    $sheet2_reopened = $wb2.Sheets.Item(2)
    
    Write-Output "Value after Reopen: '$($sheet2_reopened.Cells.Item(130, 3).Value)'"
    Write-Output "Text after Reopen: '$($sheet2_reopened.Cells.Item(130, 3).Text)'"
    
    $wb2.Close($false)
    $excel2.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel2) | Out-Null
    
} catch {
    Write-Error "Error: $_"
    if ($null -ne $excel) { $excel.Quit() }
}
