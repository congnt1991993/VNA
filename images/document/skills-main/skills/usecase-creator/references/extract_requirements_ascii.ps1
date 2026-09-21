try {
    $parentDir = "c:\Users\congnt\OneDrive - Synodus.com\GOV\skills-main\skills\usecase-creator\references"
    $files = Get-ChildItem -Path $parentDir -Filter "*_BBKS*.txt"
    
    $outputFile = Join-Path $parentDir "survey_requirements_summary.txt"
    $report = @()
    
    foreach ($file in $files) {
        $report += "=================================================="
        $report += "FILE: $($file.Name)"
        $report += "=================================================="
        
        $lines = Get-Content -Path $file.FullName -Encoding UTF8
        
        $inAppendix = $false
        $appendixLines = @()
        
        $captureFunctional = $false
        $functionalLines = @()
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i].Trim()
            $lowerLine = $line.ToLower()
            
            # Match "PHỤ LỤC 01" or "PHU LUC 01"
            if ($line -like "*PH*01*" -and $line -like "*L*C*") {
                $inAppendix = $true
                $appendixLines += "--- PHU LUC 01 (Indicators List) ---"
                continue
            }
            
            # End of appendix when a section starts (e.g., "I. Định nghĩa" or "I. Dinh nghia")
            if ($inAppendix -and ($line -match "^I\.\s" -or $line -match "^II\.\s")) {
                $inAppendix = $false
            }
            
            if ($inAppendix) {
                if ($line -ne "") {
                    $appendixLines += $line
                }
            }
            
            # Match "Yêu cầu chức năng" or "Quy trình"
            if ($lowerLine -like "*ch*c*n*ng*" -or $lowerLine -like "*quy*tr*nh*" -or $lowerLine -like "*y*u*c*u*") {
                # Only capture if it looks like a heading or section start
                if ($line.Length -lt 100 -and ($line -match "^[a-zA-Z\d\-\s\.]" -or $line.StartsWith("-") -or $line.StartsWith("+"))) {
                    $captureFunctional = $true
                    $functionalLines += "--- FUNCTIONAL / PROCESS REQUIREMENT DETECTED: '$line' ---"
                }
            }
            
            # Stop capturing when next major section or indicator starts
            if ($captureFunctional -and ($line -match "^I\.\s" -or $line -match "^II\.\s" -or $line -like "*CHI TIẾT CHỈ TIÊU*" -or $line -like "*CHI TIET*")) {
                $captureFunctional = $false
            }
            
            if ($captureFunctional) {
                if ($line -ne "" -and $line -notlike "*FUNCTIONAL / PROCESS*") {
                    $functionalLines += $line
                }
            }
        }
        
        if ($appendixLines.Count -gt 0) {
            $report += $appendixLines
            $report += ""
        }
        if ($functionalLines.Count -gt 0) {
            $report += $functionalLines
            $report += ""
        }
        
        $report += "`n"
    }
    
    $report | Out-File -FilePath $outputFile -Encoding UTF8
    Write-Output "Written survey requirements summary to $outputFile"
    
    # Read the summary and output it
    $preview = Get-Content -Path $outputFile -Encoding UTF8
    Write-Output "--- SUMMARY CONTENT ---"
    Write-Output ($preview -join "`n")
    
} catch {
    Write-Error "Error: $_"
}
