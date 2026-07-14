const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = 'c:\\Users\\congnt\\OneDrive - Synodus.com\\GOV\\03.VNA\\netzero-vietnamairlines-com\\images\\document\\Netzero_GRI Summary.xlsx';
const workbook = xlsx.readFile(filePath);

const sheetName = '95 Chỉ tiêu';
if (workbook.SheetNames.includes(sheetName)) {
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  const mapping = {};
  
  // Duyệt từ dòng thứ 2 (chỉ số 2)
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;
    
    // Tìm GRI Code ở cột C (index 2)
    const griCode = String(row[2] || '').trim();
    if (!griCode || griCode === 'GRI Code' || griCode === 'Không thuộc GRI') continue;
    
    // Cột J (index 9) - 'Có KPI (Yes/No)'
    const hasKpiRaw = String(row[9] || '').trim();
    // Cột L (index 11) - 'Nguồn lấy dữ liệu KH/mục tiêu (KPI)'
    const kpiSourceRaw = String(row[11] || '').trim();
    
    mapping[griCode] = {
      hasKpi: hasKpiRaw, // "Yes" hoặc "No"
      kpiSource: kpiSourceRaw // "Nhập thủ công" hoặc blank/hệ thống
    };
  }
  
  console.log('Total mapped codes:', Object.keys(mapping).length);
  console.log('Sample map (Airline E-1):', mapping['Airline E-1']);
  console.log('Sample map (GRI 305-1):', mapping['GRI 305-1'] || mapping['GRI 305-1 ']);
  
  // Lưu thành file JSON để web load tĩnh
  const outPath = path.join(__dirname, '../components/NetzeroGRI_KPI_Rules.json');
  fs.writeFileSync(outPath, JSON.stringify(mapping, null, 2));
  console.log('Saved mapping JSON to:', outPath);
} else {
  console.log('Sheet not found!');
}
