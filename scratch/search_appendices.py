import os
import glob
import re

app_texts_dir = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/scratch/appendix_texts"
files = sorted(glob.glob(os.path.join(app_texts_dir, "*.txt")))

out_path = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/scratch/appendix_keywords_match.txt"

with open(out_path, 'w', encoding='utf-8') as out:
    for fpath in files:
        basename = os.path.basename(fpath)
        out.write("=" * 80 + "\n")
        out.write(f"FILE: {basename}\n")
        out.write("=" * 80 + "\n")
        
        with open(fpath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Search for headings and check if there are sections about system requirements or processes
        for idx, line in enumerate(lines):
            line_strip = line.strip()
            if not line_strip:
                continue
            
            # Check for headings that look like "Yêu cầu hệ thống" or "Quy trình" or "Yêu cầu chức năng" or "Phê duyệt"
            is_relevant = False
            for kw in ["yêu cầu chức năng", "yêu cầu hệ thống", "quy trình", "phê duyệt", "giao diện", "website", "dashboard"]:
                if kw in line_strip.lower():
                    is_relevant = True
                    break
            
            if is_relevant:
                out.write(f"Line {idx+1}: {line_strip}\n")
                # Print next 3 lines for context
                for j in range(idx+1, min(idx+5, len(lines))):
                    if lines[j].strip():
                        out.write(f"   > {lines[j].strip()}\n")
        out.write("\n")

print("Keywords match output written to:", out_path)
