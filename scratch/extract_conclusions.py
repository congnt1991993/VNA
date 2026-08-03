import os
import glob
import re

survey_dir = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/scratch/survey_texts"
txt_files = sorted(glob.glob(os.path.join(survey_dir, "*.txt")))

out_path = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/scratch/survey_conclusions_details.txt"

with open(out_path, 'w', encoding='utf-8') as out:
    for path in txt_files:
        basename = os.path.basename(path)
        out.write("=" * 80 + "\n")
        out.write(f"KHẢO SÁT CHUYÊN SÂU: {basename}\n")
        out.write("=" * 80 + "\n")
        
        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Find sections like "Nội dung cuộc họp", "Kết luận chính", "Xác nhận số hóa"
        # We will extract 30 lines after "Nội dung cuộc họp" or "Kết luận chính"
        found = False
        for idx, line in enumerate(lines):
            line_strip = line.strip()
            if "nội dung cuộc họp" in line_strip.lower() or "kết luận chính" in line_strip.lower() or "xác nhận số hóa" in line_strip.lower():
                out.write(f"--- Bắt đầu phần thảo luận & kết luận (dòng {idx+1}): ---\n")
                # Print from here to next major section or 40 lines
                count = 0
                for j in range(idx, min(idx + 50, len(lines))):
                    curr_line = lines[j].strip()
                    if curr_line:
                        # If we see a new Roman numeral or "PHỤ LỤC", stop unless it's the current header
                        if count > 3 and (re.match(r'^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.\s', curr_line) or "PHỤ LỤC" in curr_line):
                            break
                        out.write(f"  {curr_line}\n")
                        count += 1
                found = True
        if not found:
            out.write("  (Không tìm thấy từ khóa phần thảo luận chính, hiển thị 30 dòng đầu tiên:)\n")
            for j in range(min(30, len(lines))):
                out.write(f"  {lines[j].strip()}\n")
        out.write("\n\n")

print("Done! Detailed conclusions written to:", out_path)
