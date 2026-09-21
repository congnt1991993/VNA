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
    $tempPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\temp_check.xlsx"
    Write-Output "Copying to temp path: $tempPath"
    Copy-Item -LiteralPath $xlsxPath -Destination $tempPath -Force
    
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    $wb = $excel.Workbooks.Open($tempPath)
    
    $sheet1 = $wb.Sheets.Item(1)
    Write-Output "=== SHEET 1: TONG QUAN ==="
    for ($r = 1; $r -le 10; $r++) {
        $val1 = $sheet1.Cells.Item($r, 1).Text
        $val2 = $sheet1.Cells.Item($r, 2).Text
        Write-Output "Row $($r) : C1='$val1' | C2='$val2'"
    }
    
    $sheet2 = $wb.Sheets.Item(2)
    Write-Output "`n=== SHEET 2: DANH SACH USE CASE (ROWS 129 TO 155) ==="
    for ($r = 129; $r -le 155; $r++) {
        $cols = @()
        for ($c = 1; $c -le 7; $c++) {
            $cols += "C$c='$($sheet2.Cells.Item($r, $c).Text)'"
        }
        Write-Output "Row $($r) : $($cols -join ' | ')"
    }
    
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    
    # Clean up temp file
    Remove-Item -Path $tempPath -Force
    Write-Output "Cleaned up temp file."
} catch {
    Write-Error "Error: $_"
    if ($null -ne $excel) { $excel.Quit() }
    if (Test-Path $tempPath) { Remove-Item -Path $tempPath -Force }
}
