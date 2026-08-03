import os
import glob

app_dir = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/scratch/appendix_texts"
files = sorted(glob.glob(os.path.join(app_dir, "*.txt")))

for path in files:
    basename = os.path.basename(path)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"File: {basename}")
    # Search for indicator names
    found_indicators = []
    for ind in ["GRI 302-1", "GRI 305-1", "GRI 303-3", "GRI 401-1", "GRI 418-1", "Airline E-1", "Airline B-1", "Airline B-2", "Airline F-1", "GRI 403-2"]:
        if ind in content:
            found_indicators.append(ind)
    print(f"  Found indicators: {found_indicators}")
