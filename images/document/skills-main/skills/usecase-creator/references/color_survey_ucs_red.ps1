try {
    $parentDir = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document"
    # Find the target directory dynamically using ASCII-only filters
    $gocDir = Get-ChildItem -Path $parentDir -Directory | Where-Object { 
        $_.Name -notlike "*Template*" -and 
        $_.Name -notlike "*Bi*" -and 
        $_.Name -notlike "*khao*"
    } | Select-Object -First 1
    
    if (-not $gocDir) {
        throw "Could not find target directory in $parentDir"
    }
    
    $xlsxFile = Get-ChildItem -Path $gocDir.FullName -Filter "*Netzero*.xlsx" | Select-Object -First 1
    if (-not $xlsxFile) {
        throw "Could not find Netzero excel file in $($gocDir.FullName)"
    }
    
    $xlsxPath = $xlsxFile.FullName
    Write-Output "Resolved Excel Path: $xlsxPath"
    
    # Copy to temporary ASCII path
    $tempPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\temp_color.xlsx"
    Write-Output "Copying to temp path: $tempPath"
    Copy-Item -LiteralPath $xlsxPath -Destination $tempPath -Force
    
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    $wb = $excel.Workbooks.Open($tempPath)
    $sheet2 = $wb.Sheets.Item(2)
    
    Write-Output "Changing fill color of rows 147 to 152 to light red..."
    # Rose-red: RGB(255, 150, 150) = 9868953
    $redColor = 9868953
    
    for ($r = 147; $r -le 152; $r++) {
        for ($c = 1; $c -le 7; $c++) {
            $cell = $sheet2.Cells.Item($r, $c)
            $cell.Interior.Color = $redColor
        }
        $ucCode = $sheet2.Cells.Item($r, 2).Text
        $ucName = $sheet2.Cells.Item($r, 4).Text
        Write-Output "Colored Row $r : Code=$ucCode, Name=$ucName"
    }
    
    Write-Output "Saving workbook..."
    $wb.Save()
    $wb.Close($true)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    
    # Copy back to the Unicode destination
    Write-Output "Copying edited file back to destination..."
    Copy-Item -LiteralPath $tempPath -Destination $xlsxPath -Force
    
    # Clean up temp file
    Remove-Item -Path $tempPath -Force
    Write-Output "Cleaned up temp file. Update complete."
    
} catch {
    Write-Error "Error occurred: $_"
    if ($null -ne $excel) { $excel.Quit() }
    if (Test-Path $tempPath) { Remove-Item -Path $tempPath -Force }
}
