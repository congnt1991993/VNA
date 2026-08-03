import os
import glob

app_texts_dir = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/scratch/appendix_texts"
files = sorted(glob.glob(os.path.join(app_texts_dir, "*.txt")))

for fpath in files:
    basename = os.path.basename(fpath)
    print("=" * 60)
    print(f"APPENDIX: {basename}")
    print("=" * 60)
    with open(fpath, 'r', encoding='utf-8') as f:
        for idx in range(15):
            line = f.readline()
            if not line:
                break
            print(f"{idx+1}: {line.strip()}")
    print()
