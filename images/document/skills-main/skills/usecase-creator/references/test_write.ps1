$xlsxPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document\23. Danh_sach_UseCase_Netzero_v1.xlsx"

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    $wb = $excel.Workbooks.Open($xlsxPath)
    $sheet = $wb.Sheets.Item(2)
    
    Write-Output "Before writing: Cell (130, 2) = '$($sheet.Cells.Item(130, 2).Text)'"
    
    # Try writing using .Value
    $sheet.Cells.Item(130, 1).Value = "125"
    $sheet.Cells.Item(130, 2).Value = "UC-125-TestValue"
    
    Write-Output "After writing .Value: Cell (130, 2) = '$($sheet.Cells.Item(130, 2).Text)'"
    
    # Try writing using .Value2
    $sheet.Cells.Item(130, 2).Value2 = "UC-125-TestValue2"
    Write-Output "After writing .Value2: Cell (130, 2) = '$($sheet.Cells.Item(130, 2).Text)'"

    $wb.Save()
    $wb.Close($true)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    exit 0
} catch {
    Write-Error "Error: $_"
    if ($null -ne $excel) { $excel.Quit() }
    exit 1
}
