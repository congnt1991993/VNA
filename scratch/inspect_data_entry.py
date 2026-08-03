with open("/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/components/UnifiedDataEntryForm.tsx", 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
print("Lines matching approval keywords in UnifiedDataEntryForm.tsx:")
for idx, line in enumerate(lines):
    if any(w in line.lower() for w in ["phê duyệt", "chờ duyệt", "nộp", "nháp", "approve", "reject", "pending"]):
        print(f"Line {idx+1}: {line.strip()}")
