import os
import glob
import re

pages_dir = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/pages"
files = glob.glob(os.path.join(pages_dir, "Ops*.tsx")) + [os.path.join(pages_dir, "TechOps.tsx")]

out_path = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/scratch/inspect_pages_details.txt"

with open(out_path, 'w', encoding='utf-8') as out:
    for fpath in files:
        basename = os.path.basename(fpath)
        out.write("=" * 80 + "\n")
        out.write(f"PAGE FILE: {basename}\n")
        out.write("=" * 80 + "\n")
        
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for interface definitions
        interfaces = re.findall(r'interface\s+\w+\s*\{[^}]+\}', content)
        for itf in interfaces:
            out.write(f"Interface found:\n{itf}\n\n")
            
        # Look for indicator arrays or variables
        lines = content.split('\n')
        for idx, line in enumerate(lines):
            line_strip = line.strip()
            # If line contains indicators array or mock lists
            if any(k in line_strip.lower() for k in ["indicatorids", "indicators =", "mock_records =", "mock_indicators"]):
                out.write(f"Line {idx+1}: {line_strip}\n")
                # Print next 5 lines
                for j in range(idx+1, min(idx+10, len(lines))):
                    out.write(f"  > {lines[j]}\n")
                out.write("\n")
                
print("Pages inspection details written to:", out_path)
