try {
    $parentDir = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document"
    $gocDir = Get-ChildItem -Path $parentDir -Directory | Where-Object { 
        $_.Name -notlike "*Template*" -and 
        $_.Name -notlike "*Bi*" -and 
        $_.Name -notlike "*khao*"
    } | Select-Object -First 1
    
    $xlsxFile = Get-ChildItem -Path $gocDir.FullName -Filter "*Netzero*.xlsx" | Select-Object -First 1
    $xlsxPath = $xlsxFile.FullName
    
    $tempPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\temp_verify.xlsx"
    Copy-Item -LiteralPath $xlsxPath -Destination $tempPath -Force
    
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    $wb = $excel.Workbooks.Open($tempPath)
    $sheet2 = $wb.Sheets.Item(2)
    
    Write-Output "--- Verified Sheet 2 Cell Colors and Values ---"
    for ($r = 129; $r -le 153; $r++) {
        $ucCode = $sheet2.Cells.Item($r, 2).Text
        $ucName = $sheet2.Cells.Item($r, 4).Text
        $color = $sheet2.Cells.Item($r, 2).Interior.Color
        
        $colorDesc = "Unknown"
        if ($color -eq 65535) { $colorDesc = "Yellow (Keep)" }
        elseif ($color -eq 9868953) { $colorDesc = "Light Red (Survey - To Delete)" }
        elseif ($color -eq 16777215) { $colorDesc = "White (None)" }
        
        Write-Output "Row $r : Code='$ucCode' | ColorCode=$color ($colorDesc) | Name='$ucName'"
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
