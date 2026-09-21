$txtPath = "C:\Users\congnt\OneDrive - Synodus.com\GOV\skills-main\skills\usecase-creator\references\new_ucs.txt"
$xlsxPath = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document\23. Danh_sach_UseCase_Netzero_v1.xlsx"

try {
    if (-not (Test-Path $txtPath)) {
        throw "Could not find $txtPath"
    }
    if (-not (Test-Path $xlsxPath)) {
        throw "Could not find $xlsxPath"
    }

    Write-Output "Reading UCs from: $txtPath"
    $lines = Get-Content -Path $txtPath -Encoding UTF8
    Write-Output "Loaded $($lines.Count) Use Cases to insert."

    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = 0

    Write-Output "Opening Excel workbook: $xlsxPath"
    $wb = $excel.Workbooks.Open($xlsxPath)
    
    $sheet = $wb.Sheets.Item(2)
    Write-Output "Accessed sheet: $($sheet.Name)"
    
    # Clear rows 130 to 200 to start fresh
    Write-Output "Clearing rows 130 to 200 to start fresh..."
    for ($r = 130; $r -le 200; $r++) {
        for ($c = 1; $c -le 7; $c++) {
            $sheet.Cells.Item($r, $c).Value2 = $null
            $sheet.Cells.Item($r, $c).Interior.ColorIndex = -4142 # None
            $sheet.Cells.Item($r, $c).Borders.LineStyle = -4142 # None
        }
    }
    
    # Start writing at row 130 (STT 125)
    $row = 130
    $lastStt = 124
    
    $addedCount = 0
    foreach ($line in $lines) {
        if ($line.Trim() -eq "") { continue }
        $parts = $line.Split("|")
        if ($parts.Length -lt 5) {
            Write-Warning "Skipping invalid line: $line"
            continue
        }
        
        $lastStt++
        $ucCode = "UC-" + $lastStt.ToString("D3")
        
        $sheet.Cells.Item($row, 1).Value2 = $lastStt.ToString()
        $sheet.Cells.Item($row, 2).Value2 = $ucCode
        $sheet.Cells.Item($row, 3).Value2 = $parts[0].Trim()
        $sheet.Cells.Item($row, 4).Value2 = $parts[1].Trim()
        $sheet.Cells.Item($row, 5).Value2 = $parts[2].Trim()
        $sheet.Cells.Item($row, 6).Value2 = $parts[3].Trim()
        $sheet.Cells.Item($row, 7).Value2 = $parts[4].Trim()
        
        # Color cells yellow and set borders
        for ($c = 1; $c -le 7; $c++) {
            $cell = $sheet.Cells.Item($row, $c)
            $cell.Interior.Color = 65535 # Yellow
            $cell.Borders.LineStyle = 1  # Continuous
        }
        
        Write-Output "Appended $ucCode ($($parts[1].Trim())) at row $row"
        $row++
        $addedCount++
    }
    
    # Update sheet "Tổng quan"
    Write-Output "Updating Tổng quan counts..."
    $overview = $wb.Sheets.Item(1)
    Write-Output "Accessed overview sheet: $($overview.Name)"
    
    # Get current value of admin UCs safely
    $currentAdminText = $overview.Cells.Item(6, 2).Text
    $currentAdminUCs = [int]$currentAdminText
    
    $overview.Cells.Item(4, 2).Value2 = $lastStt.ToString() # Total
    $overview.Cells.Item(6, 2).Value2 = ($currentAdminUCs + $addedCount).ToString() # Admin
    
    $wb.Save()
    $wb.Close($true)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    Write-Output "Excel workbook successfully updated with $addedCount Use Cases."
    exit 0
} catch {
    Write-Error "Error: $_"
    if ($null -ne $excel) {
        try { $excel.Quit() } catch {}
    }
    exit 1
}
