$xlsxPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document\23. Danh_sach_UseCase_Netzero_v1.xlsx"

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    $wb = $excel.Workbooks.Open($xlsxPath)
    $sheet = $wb.Sheets.Item(2)
    
    Write-Output "Checking Sheet: $($sheet.Name)"
    for ($r = 128; $r -le 135; $r++) {
        $vals = @()
        for ($c = 1; $c -le 7; $c++) {
            $txt = $sheet.Cells.Item($r, $c).Text
            $val2 = $sheet.Cells.Item($r, $c).Value2
            $vals += "[$c]: '$txt' (V2: '$val2')"
        }
        $rowStr = "Row " + $r + ":"
        Write-Output "$rowStr $($vals -join ' | ')"
    }
    
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    exit 0
} catch {
    Write-Error "Error: $_"
    if ($null -ne $excel) { $excel.Quit() }
    exit 1
}
