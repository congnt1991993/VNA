try {
    $parentDir = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document"
    # Resolve directory using ASCII-only filters
    $gocDir = Get-ChildItem -Path $parentDir -Directory | Where-Object { 
        $_.Name -notlike "*Template*" -and 
        $_.Name -notlike "*Bi*" -and 
        $_.Name -notlike "*khao*"
    } | Select-Object -First 1
    
    $xlsxFile = Get-ChildItem -Path $gocDir.FullName -Filter "*Netzero*.xlsx" | Select-Object -First 1
    $xlsxPath = $xlsxFile.FullName
    
    $tempPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\temp_all_ucs.xlsx"
    Copy-Item -LiteralPath $xlsxPath -Destination $tempPath -Force
    
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    $wb = $excel.Workbooks.Open($tempPath)
    $sheet2 = $wb.Sheets.Item(2)
    
    $outputFile = "c:\Users\congnt\OneDrive - Synodus.com\GOV\skills-main\skills\usecase-creator\references\all_ucs_dump.txt"
    $outLines = @()
    
    for ($r = 6; $r -le 200; $r++) {
        $stt = $sheet2.Cells.Item($r, 1).Text
        if ($stt) {
            $code = $sheet2.Cells.Item($r, 2).Text
            $phanh_he = $sheet2.Cells.Item($r, 3).Text
            $name = $sheet2.Cells.Item($r, 4).Text
            $actor = $sheet2.Cells.Item($r, 5).Text
            $desc = $sheet2.Cells.Item($r, 6).Text
            $priority = $sheet2.Cells.Item($r, 7).Text
            $outLines += "Row $r | STT: $stt | Code: $code | Phân hệ: $phanh_he | Tên: $name | Tác nhân: $actor | Mô tả: $desc | Ưu tiên: $priority"
        }
    }
    
    $outLines | Out-File -FilePath $outputFile -Encoding UTF8
    Write-Output "Dumped $($outLines.Count) Use Cases to $outputFile"
    
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    Remove-Item -Path $tempPath -Force
} catch {
    Write-Error "Error: $_"
    if ($null -ne $excel) { $excel.Quit() }
    if (Test-Path $tempPath) { Remove-Item -Path $tempPath -Force }
}
