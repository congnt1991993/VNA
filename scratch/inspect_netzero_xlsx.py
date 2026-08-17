import os
import openpyxl
import pandas as pd

file_path = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/Document/Netzero_GRI Summary.xlsx"

print("Checking if file exists:", os.path.exists(file_path))

try:
    xl = pd.ExcelFile(file_path)
    print("Sheets in excel file:", xl.sheet_names)
    if '95 Chỉ tiêu' in xl.sheet_names:
        df = xl.parse('95 Chỉ tiêu')
        print("Columns:", df.columns.tolist())
        print("Shape:", df.shape)
        print("First 5 rows:")
        print(df.head(5))
except Exception as e:
    print("Error reading excel file with pandas:", e)
