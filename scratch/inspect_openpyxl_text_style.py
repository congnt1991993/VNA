import openpyxl

file_path = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/Document/Chỉ tiêu Governance_v3_Edited.xlsx"

wb = openpyxl.load_workbook(file_path)
sheet = wb['Chi tiết chỉ tiêu']

# Inspect styles of column F (Index 6) and Row 4
row = 4
cell_f = sheet.cell(row, 6)
print(f"Row {row} Col F font: {cell_f.font.name if cell_f.font else None}, size: {cell_f.font.size if cell_f.font else None}, bold: {cell_f.font.bold if cell_f.font else None}, color: {cell_f.font.color.rgb if cell_f.font and cell_f.font.color else None}")
print(f"Row {row} Col F fill: {cell_f.fill.fill_type if cell_f.fill else None}, fgColor: {cell_f.fill.fgColor.rgb if cell_f.fill and cell_f.fill.fgColor else None}")
print(f"Row {row} Col F alignment: horizontal={cell_f.alignment.horizontal if cell_f.alignment else None}, vertical={cell_f.alignment.vertical if cell_f.alignment else None}, wrap_text={cell_f.alignment.wrap_text if cell_f.alignment else None}")
print(f"Row {row} Col F border: {cell_f.border}")
