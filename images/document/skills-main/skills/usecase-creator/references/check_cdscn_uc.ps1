try {
    $parentDir = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document"
    $gocDir = Get-ChildItem -Path $parentDir -Directory | Where-Object { 
        $_.Name -notlike "*Template*" -and 
        $_.Name -notlike "*Bi*" -and 
        $_.Name -notlike "*khao*"
    } | Select-Object -First 1
    
    $xlsxFile = Get-ChildItem -Path $gocDir.FullName -Filter "*Netzero*.xlsx" | Select-Object -First 1
    $xlsxPath = $xlsxFile.FullName
    
    $tempPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\temp_verify_cdscn.xlsx"
    Copy-Item -LiteralPath $xlsxPath -Destination $tempPath -Force
    
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    $wb = $excel.Workbooks.Open($tempPath)
    $sheet2 = $wb.Sheets.Item(2)
    
    Write-Output "--- Existing Digital Transformation/CĐSCN Use Cases ---"
    for ($r = 6; $r -le 200; $r++) {
        $stt = $sheet2.Cells.Item($r, 1).Text
        if ($stt) {
            $phanh_he = $sheet2.Cells.Item($r, 3).Text
            if ($phanh_he -like "*Chuyển đổi số*" -or $phanh_he -like "*CĐSCN*" -or $phanh_he -like "*CĐS*") {
                $code = $sheet2.Cells.Item($r, 2).Text
                $name = $sheet2.Cells.Item($r, 4).Text
                $actor = $sheet2.Cells.Item($r, 5).Text
                $desc = $sheet2.Cells.Item($r, 6).Text
                Write-Output "Row $r : STT=$stt | Code=$code | Phân hệ='$phanh_he' | Name='$name' | Actor='$actor'"
            }
        }
    }
    
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    Remove-Item -Path $tempPath -Force
} catch {
    Write-Error "Error: $_"
    if ($null -ne $excel) { $excel.Quit() }
    if (Test-Path $tempPath) { Remove-Item -Path $tempPath -Force }
}
