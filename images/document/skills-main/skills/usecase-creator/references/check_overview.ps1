$xlsxPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document\23. Danh_sach_UseCase_Netzero_v1.xlsx"
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    $wb = $excel.Workbooks.Open($xlsxPath)
    $sheet = $wb.Sheets.Item(1)
    Write-Output "Sheet 1 Name: $($sheet.Name)"
    for ($r = 1; $r -le 10; $r++) {
        $val1 = $sheet.Cells.Item($r, 1).Text
        $val2 = $sheet.Cells.Item($r, 2).Text
        Write-Output "Row $r : C1='$val1' | C2='$val2'"
    }
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
} catch {
    Write-Error "Error: $_"
    if ($null -ne $excel) { $excel.Quit() }
}
