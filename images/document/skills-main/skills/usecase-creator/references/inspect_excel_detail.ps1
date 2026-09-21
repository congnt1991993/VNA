$xlsxPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document\23. Danh_sach_UseCase_Netzero_v1.xlsx"
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    $wb = $excel.Workbooks.Open($xlsxPath)
    Write-Output "Total Sheets: $($wb.Sheets.Count)"
    for ($i = 1; $i -le $wb.Sheets.Count; $i++) {
        $name = $wb.Sheets.Item($i).Name
        Write-Output "Sheet $i : $name"
    }
    
    $sheet1 = $wb.Sheets.Item(1)
    Write-Output "--- SHEET 1 (Tổng quan) FORMULAS AND VALUES ---"
    for ($r = 1; $r -le 25; $r++) {
        $cols = @()
        for ($c = 1; $c -le 5; $c++) {
            $cell = $sheet1.Cells.Item($r, $c)
            $txt = $cell.Text
            $formula = $cell.Formula
            $cols += "C$($c) - Text='$txt', Formula='$formula'"
        }
        Write-Output "Row $r : $($cols -join ' | ')"
    }
    
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
} catch {
    Write-Error "Error: $_"
    if ($null -ne $excel) { $excel.Quit() }
}
