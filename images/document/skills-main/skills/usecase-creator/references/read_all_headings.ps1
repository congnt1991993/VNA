try {
    $parentDir = "c:\Users\congnt\OneDrive - Synodus.com\GOV\skills-main\skills\usecase-creator\references"
    $files = Get-ChildItem -Path $parentDir -Filter "*_BBKS*.txt"
    
    foreach ($file in $files) {
        Write-Output "=================================================="
        Write-Output "FILE: $($file.Name)"
        Write-Output "=================================================="
        
        $lines = Get-Content -Path $file.FullName -Encoding UTF8
        
        # Print first 15 lines of the file to see metadata/purpose
        Write-Output "--- Preview (First 15 lines) ---"
        $lines[0..14] | Where-Object { $_.Trim() -ne "" } | ForEach-Object { Write-Output $_.Trim() }
        
        # Search for headings or bullet points of interest
        Write-Output "`n--- Key Headings & Sections ---"
        foreach ($line in $lines) {
            $trimmed = $line.Trim()
            if ($trimmed -match "^(I\.|II\.|III\.|IV\.|V\.)" -or 
                $trimmed -match "^[1-9]\.\s" -or 
                $trimmed -match "^STT\s" -or
                $trimmed -like "*Yêu cầu chức năng*" -or
                $trimmed -like "*Quy trình*") {
                if ($trimmed.Length -lt 200) {
                    Write-Output "   $trimmed"
                }
            }
        }
        Write-Output "`n"
    }
} catch {
    Write-Error "Error: $_"
}
