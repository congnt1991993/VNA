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
    $files = Get-ChildItem -Path $euDir.FullName -Filter "*.docx"
    Write-Output "Found $($files.Count) docx files to extract."
    
    $excelRefsDir = "c:\Users\congnt\OneDrive - Synodus.com\GOV\skills-main\skills\usecase-creator\references"
    
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    
    $tempDocx = "c:\Users\congnt\OneDrive - Synodus.com\GOV\temp_read.docx"
    
    foreach ($file in $files) {
        $basename = $file.BaseName
        # Clean up file name for output
        $cleanName = $basename -replace "[\s\.]", "_"
        $cleanName = $cleanName -replace "[^\w_]", ""
        $outputFile = Join-Path $excelRefsDir "$cleanName.txt"
        
        Write-Output "Extracting '$basename' to '$cleanName.txt'..."
        Copy-Item -LiteralPath $file.FullName -Destination $tempDocx -Force
        
        $doc = $word.Documents.Open($tempDocx)
        $text = $doc.Range().Text
        $text | Out-File -FilePath $outputFile -Encoding UTF8
        $doc.Close($false)
        Write-Output "Extracted successfully."
    }
    
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    
    if (Test-Path $tempDocx) { Remove-Item -Path $tempDocx -Force }
    Write-Output "All extractions completed successfully."
    
} catch {
    Write-Error "Error: $_"
    if ($null -ne $word) {
        try { $word.Quit() } catch {}
    }
    if (Test-Path $tempDocx) { Remove-Item -Path $tempDocx -Force }
}
