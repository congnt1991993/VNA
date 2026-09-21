$xlsxPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document\23. Danh_sach_UseCase_Netzero_v1.xlsx"
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    $wb = $excel.Workbooks.Open($xlsxPath)
    $sheet = $wb.Sheets.Item(2)
    
    $categories = @{}
    for ($r = 6; $r -le 200; $r++) {
        $stt = $sheet.Cells.Item($r, 1).Text
        $phanh_he = $sheet.Cells.Item($r, 3).Text
        if ($stt) {
            if ($categories.ContainsKey($phanh_he)) {
                $categories[$phanh_he]++
            } else {
                $categories[$phanh_he] = 1
            }
        }
    }
    
    Write-Output "--- Categories in Sheet 2 ---"
    foreach ($key in $categories.Keys) {
        Write-Output "Phân hệ: '$key' - Count: $($categories[$key])"
    }
    
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
} catch {
    Write-Error "Error: $_"
    if ($null -ne $excel) { $excel.Quit() }
}
