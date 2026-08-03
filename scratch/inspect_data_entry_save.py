with open("/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/components/UnifiedDataEntryForm.tsx", 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
print("Lines matching save/submit in UnifiedDataEntryForm.tsx:")
for idx, line in enumerate(lines):
    if any(w in line.lower() for w in ["handle", "save", "submit", "draft", "state", "status"]):
        # Print if it has code logic
        if len(line.strip()) < 150:
            print(f"Line {idx+1}: {line.strip()}")
