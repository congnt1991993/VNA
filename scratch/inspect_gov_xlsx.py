import os
import openpyxl
import pandas as pd

file_path = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/Document/Chỉ tiêu Governance_v3_Edited.xlsx"

print("Checking if file exists:", os.path.exists(file_path))

try:
    xl = pd.ExcelFile(file_path)
    df = xl.parse('Chi tiết chỉ tiêu')
    with open('/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/scratch/inspect_xlsx_output.txt', 'w', encoding='utf-8') as f:
        f.write(f"Columns: {df.columns.tolist()}\n\n")
        for i, row in df.iterrows():
            f.write(f"=== Row {i} ===\n")
            for col in df.columns:
                f.write(f"  {col}: {row[col]}\n")
            f.write("\n")
    print("Done writing to inspect_xlsx_output.txt")
except Exception as e:
    print("Error:", e)


