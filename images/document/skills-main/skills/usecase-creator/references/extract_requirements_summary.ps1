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
        
        # 1. Extract Phụ lục 01 (indicators list)
        $inAppendix = $false
        $appendixLines = @()
        
        # 2. Extract functional requirements / workflows
        $functionalLines = @()
        $captureFunctional = $false
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i].Trim()
            
            # Identify Appendix 01 start
            if ($line -like "*PHỤ LỤC 01*" -or $line -like "*PHU LUC 01*") {
                $inAppendix = $true
                $appendixLines += "--- PHỤ LỤC 01 ---"
                continue
            }
            
            # Identify Appendix 01 end (usually when a new Roman numeral section starts, e.g., "I. Định nghĩa")
            if ($inAppendix -and ($line -match "^I\.\s" -or $line -match "^II\.\s")) {
                $inAppendix = $false
            }
            
            if ($inAppendix) {
                if ($line -ne "") {
                    $appendixLines += $line
                }
            }
            
            # Capture functional requirements or workflows
            if ($line -like "*Yêu cầu chức năng*" -or $line -like "*Quy trình*") {
                $captureFunctional = $true
                $functionalLines += "--- FUNCTIONAL / WORKFLOW DETAILS ---"
            }
            
            # Stop capturing when a new indicator definition starts
            if ($captureFunctional -and ($line -match "^I\.\s" -or $line -match "^II\.\s" -or $line -like "*CHI TIẾT CHỈ TIÊU*")) {
                $captureFunctional = $false
            }
            
            if ($captureFunctional) {
                if ($line -ne "") {
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
    
    # Print the first 200 lines of the summary so we can see it
    $preview = Get-Content -Path $outputFile -TotalCount 200
    Write-Output "--- SUMMARY PREVIEW ---"
    Write-Output ($preview -join "`n")
    
} catch {
    Write-Error "Error: $_"
}
