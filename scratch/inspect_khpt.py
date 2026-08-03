with open("/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/scratch/appendix_texts/Phụ lục_Ban KHPT_ver1.txt", 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Lines matching 'quy trình' or 'phê duyệt' in KHPT:")
for idx, line in enumerate(lines):
    if any(w in line.lower() for w in ["quy trình", "phê duyệt", "phê duyệt", "danh mục yêu cầu"]):
        print(f"Line {idx+1}: {line.strip()}")
