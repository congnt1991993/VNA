import os
import glob

survey_dir = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/scratch/survey_texts"
txt_files = glob.glob(os.path.join(survey_dir, "*.txt"))

for path in sorted(txt_files):
    basename = os.path.basename(path)
    print("=" * 60)
    print(f"FILE: {basename}")
    print("=" * 60)
    with open(path, 'r', encoding='utf-8') as f:
        lines = [f.readline().strip() for _ in range(25)]
        for i, line in enumerate(lines):
            if line:
                print(f"{i+1}: {line}")
    print("\n")
