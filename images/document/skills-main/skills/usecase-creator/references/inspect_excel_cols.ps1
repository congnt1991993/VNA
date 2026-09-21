$xlsxPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document\23. Danh_sach_UseCase_Netzero_v1.xlsx"
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    $wb = $excel.Workbooks.Open($xlsxPath)
    $sheet1 = $wb.Sheets.Item(1)
    Write-Output "--- SHEET 1 Columns 1-15 ---"
    for ($r = 1; $r -le 25; $r++) {
        $cols = @()
        for ($c = 1; $c -le 15; $c++) {
            $txt = $sheet1.Cells.Item($r, $c).Text
            if ($txt) {
                $cols += "C$($c):'$txt'"
            }
        }
        if ($cols.Count -gt 0) {
            Write-Output "Row $r : $($cols -join ' | ')"
        }
    }
    
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
} catch {
    Write-Error "Error: $_"
    if ($null -ne $excel) { $excel.Quit() }
}
