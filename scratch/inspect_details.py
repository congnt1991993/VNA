import os
import glob
import re

survey_dir = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/scratch/survey_texts"
txt_files = glob.glob(os.path.join(survey_dir, "*.txt"))

out_file = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/scratch/survey_summary.txt"

with open(out_file, 'w', encoding='utf-8') as out:
    for path in sorted(txt_files):
        basename = os.path.basename(path)
        out.write("=" * 80 + "\n")
        out.write(f"BÁO CÁO KHẢO SÁT: {basename}\n")
        out.write("=" * 80 + "\n")
        
        with open(path, 'r', encoding='utf-8') as f:
            paragraphs = f.readlines()
        
        # We want to print headings (e.g., Roman numerals, lines starting with numbers, or specific keywords)
        # Also lines that discuss indicators (e.g. GRI, Airline, v.v.)
        for i, p in enumerate(paragraphs):
            p_strip = p.strip()
            if not p_strip:
                continue
            
            # Match headings
            is_heading = False
            if re.match(r'^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.\s', p_strip):
                is_heading = True
            elif re.match(r'^\d+(\.\d+)*\.\s', p_strip) and len(p_strip) < 150:
                is_heading = True
            elif p_strip.isupper() and len(p_strip) < 100:
                is_heading = True
            elif any(kw in p_strip for kw in ["Xác nhận số hóa", "Thống nhất", "Đề xuất", "Khó khăn", "Hệ thống nguồn", "Phương thức"]):
                is_heading = True
                
            if is_heading:
                out.write(f"Paragraph {i+1}: {p_strip}\n")
        out.write("\n\n")

print("Done! Summary written to:", out_file)
