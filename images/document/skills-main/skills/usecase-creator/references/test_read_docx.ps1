try {
    $parentDir = "c:\Users\congnt\OneDrive - Synodus.com\GOV\03.VNA\Document"
    # Locate "Biên bản khảo sát" using ASCII-only filters
    $surveyParent = Get-ChildItem -Path $parentDir -Directory | Where-Object { $_.Name -like "*Bi*" -and $_.Name -like "*kh*" } | Select-Object -First 1
    if (-not $surveyParent) {
        throw "Could not find survey parent folder"
    }
    
    # Inside survey parent, find OneDrive subfolder
    $odDir = Get-ChildItem -Path $surveyParent.FullName -Directory | Where-Object { $_.Name -like "*OneDrive*" } | Select-Object -First 1
    if (-not $odDir) {
        throw "Could not find OneDrive subfolder"
    }
    
    # Inside OneDrive, find "Biên bản khảo sát EU đã xác nhận" subfolder
    $euDir = Get-ChildItem -Path $odDir.FullName -Directory | Where-Object { $_.Name -like "*EU*" } | Select-Object -First 1
    if (-not $euDir) {
        throw "Could not find EU subfolder"
    }
    
    Write-Output "Resolved EU Survey Folder: $($euDir.FullName)"
    
    # Find a test file (e.g. TTBSV)
    $testFile = Get-ChildItem -Path $euDir.FullName -Filter "*.docx" | Select-Object -First 1
    if (-not $testFile) {
        throw "No docx files found in EU folder"
    }
    
    Write-Output "Found test file: $($testFile.FullName)"
    
    $tempDocx = "c:\Users\congnt\OneDrive - Synodus.com\GOV\temp_read.docx"
    $tempTxt = "c:\Users\congnt\OneDrive - Synodus.com\GOV\temp_read.txt"
    Copy-Item -LiteralPath $testFile.FullName -Destination $tempDocx -Force
    
    Write-Output "Opening Word COM application..."
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    
    Write-Output "Opening document: $tempDocx"
    $doc = $word.Documents.Open($tempDocx)
    
    Write-Output "Extracting text..."
    $text = $doc.Range().Text
    
    Write-Output "Saving text to file..."
    $text | Out-File -FilePath $tempTxt -Encoding UTF8
    
    $doc.Close($false)
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    
    Write-Output "Word COM closed. Reading first 500 chars of extracted text:"
    $content = Get-Content -Path $tempTxt -TotalCount 20
    Write-Output ($content -join "`n")
    
    # Clean up
    Remove-Item -Path $tempDocx -Force
    Remove-Item -Path $tempTxt -Force
    Write-Output "Cleaned up temp files."
    
} catch {
    Write-Error "Error: $_"
    if ($null -ne $word) {
        try { $word.Quit() } catch {}
    }
    if (Test-Path $tempDocx) { Remove-Item -Path $tempDocx -Force }
    if (Test-Path $tempTxt) { Remove-Item -Path $tempTxt -Force }
}
