$xlsxPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document\23. Danh_sach_UseCase_Netzero_v1.xlsx"

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    Write-Output "Opening workbook: $xlsxPath"
    $wb = $excel.Workbooks.Open($xlsxPath)
    $sheet2 = $wb.Sheets.Item(2)
    
    Write-Output "Highlighting survey-generated UCs (rows 147 to 152) in Light Red..."
    # Light Red/Pink: RGB(255, 192, 192) = 12632319
    $lightRed = 12632319
    
    for ($r = 147; $r -le 152; $r++) {
        for ($c = 1; $c -le 7; $c++) {
            $cell = $sheet2.Cells.Item($r, $c)
            $cell.Interior.Color = $lightRed
        }
        $ucCode = $sheet2.Cells.Item($r, 2).Text
        $ucName = $sheet2.Cells.Item($r, 4).Text
        Write-Output "Highlighted Row $r : Code=$ucCode, Name=$ucName in Red."
    }
    
    Write-Output "Saving workbook..."
    $wb.Save()
    $wb.Close($true)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    Write-Output "Successfully updated cell highlights."
    
} catch {
    Write-Error "Error: $_"
    if ($null -ne $excel) { $excel.Quit() }
}
