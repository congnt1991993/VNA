import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  UploadCloud,
  X,
  AlertTriangle,
  CheckCircle,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Button } from './UI';

export interface ValidationError {
  rowIndex: number; // 1-indexed for data row
  excelRow: number; // Dòng thực tế trong file Excel (bắt đầu từ 2)
  colKey: string;
  colIndex: number; // 0-indexed
  colLetter: string; // 'A', 'B', etc.
  colLabel: string;
  cellRef: string; // Tọa độ ô Excel (VD: 'D3', 'B2')
  value: any;
  message: string;
}

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedRows: any[]) => void;
  indicatorCode: string;
  indicatorName: string;
  subTabName?: string;
  expectedColumns: string[]; // List of field keys expected in the form
  getColumnLabel: (key: string, indCode: string) => string;
  currentRows?: any[];
  period?: string;
}

// Convert 0-indexed column number to Excel column letter (0 -> 'A', 25 -> 'Z', 26 -> 'AA', etc.)
export const getExcelColLetter = (colIndex: number): string => {
  let letter = '';
  let temp = colIndex + 1;
  while (temp > 0) {
    const rem = (temp - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
};

// Known numeric field keys
const NUMERIC_FIELDS = new Set([
  'value', 'saved', 'target', 'co2', 'intensity', 'reduced', 'weight',
  'emissions', 'actual', 'ltifr', 'plan', 'mandated', 'total', 'jeta1',
  'amount', 'reduction', 'allowance', 'purchase', 'price', 'cost',
  'satisfaction', 'count', 'complaints', 'leaks', 'npsDom', 'npsInt',
  'cases', 'deadCases', 'victims', 'deaths', 'heavyInjures', 'wage',
  'minRegion', 'ratio', 'hours', 'participants', 'workers', 'daysLost',
  'overall', 'work', 'training', 'manager', 'income'
]);

// Known date field keys
const DATE_FIELDS = new Set([
  'date', 'start', 'end', 'contractFrom', 'contractTo', 'sustEffectiveDate'
]);

// Known enum field keys and their valid options
const ENUM_OPTIONS: Record<string, { values: string[]; normalizedMap: Record<string, string> }> = {
  countryType: {
    values: ['VN', 'Foreign', 'NCC Việt Nam', 'NCC nước ngoài'],
    normalizedMap: {
      'vn': 'VN',
      'ncc việt nam': 'VN',
      'việt nam': 'VN',
      'foreign': 'Foreign',
      'ncc nước ngoài': 'Foreign',
      'nước ngoài': 'Foreign'
    }
  },
  hasSustCommitment: {
    values: ['Có', 'Không', 'Yes', 'No'],
    normalizedMap: {
      'có': 'Có',
      'co': 'Có',
      'yes': 'Có',
      'không': 'Không',
      'khong': 'Không',
      'no': 'Không'
    }
  },
  noise: {
    values: ['Đạt', 'Không đạt', 'Pass', 'Fail'],
    normalizedMap: {
      'đạt': 'Đạt',
      'dat': 'Đạt',
      'pass': 'Đạt',
      'không đạt': 'Không đạt',
      'khong dat': 'Không đạt',
      'fail': 'Không đạt'
    }
  }
};

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  indicatorCode,
  indicatorName,
  subTabName,
  expectedColumns,
  getColumnLabel,
  currentRows = [],
  period = 'Năm 2026'
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [detectedColumns, setDetectedColumns] = useState<{ key: string; label: string; colLetter: string }[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [hasValidated, setHasValidated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  // Handle file selection and parse
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setHasValidated(false);
    setValidationErrors([]);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        if (!ws) {
          setErrorMessage('File Excel không có sheet dữ liệu nào.');
          return;
        }

        // Parse to 2D array: [ [Header1, Header2, ...], [Val1, Val2, ...], ... ]
        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (!data || data.length === 0) {
          setErrorMessage('File Excel rỗng. Không tìm thấy dữ liệu.');
          return;
        }

        // Row 0 is the header
        const rawHeaders = (data[0] || []).map((h: any) => String(h || '').trim());
        const dataRows = data.slice(1).filter((r: any[]) => r.some((c: any) => String(c || '').trim().length > 0));

        if (dataRows.length === 0) {
          setErrorMessage('File Excel có tiêu đề nhưng không chứa dòng dữ liệu nào.');
          return;
        }

        // Map raw headers to expected keys
        const colMapping: { key: string; label: string; colLetter: string; originalIndex: number }[] = [];

        rawHeaders.forEach((rawH: string, idx: number) => {
          if (!rawH) return;
          const cleanH = rawH.toLowerCase().trim();

          // Try to find matching expected column
          let matchedKey = expectedColumns.find(key => key.toLowerCase() === cleanH);

          if (!matchedKey) {
            matchedKey = expectedColumns.find(key => {
              const label = getColumnLabel(key, indicatorCode).toLowerCase().trim();
              return label === cleanH || cleanH.includes(label) || label.includes(cleanH);
            });
          }

          // If still not matched, check if rawH contains key
          if (!matchedKey) {
            matchedKey = expectedColumns.find(key => cleanH.includes(key.toLowerCase()));
          }

          const resolvedKey = matchedKey || `col_${idx}`;
          const resolvedLabel = matchedKey ? getColumnLabel(matchedKey, indicatorCode) : rawH;

          colMapping.push({
            key: resolvedKey,
            label: resolvedLabel,
            colLetter: getExcelColLetter(idx),
            originalIndex: idx
          });
        });

        setDetectedColumns(colMapping.map(c => ({ key: c.key, label: c.label, colLetter: c.colLetter })));

        // Transform data rows into object rows
        const formattedRows = dataRows.map((r: any[]) => {
          const rowObj: Record<string, any> = {};
          colMapping.forEach(col => {
            const rawVal = r[col.originalIndex];
            rowObj[col.key] = rawVal !== undefined && rawVal !== null ? String(rawVal).trim() : '';
          });
          return rowObj;
        });

        setParsedRows(formattedRows);
      } catch (err: any) {
        console.error('Error parsing excel file:', err);
        setErrorMessage('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file (.xlsx, .xls, .csv).');
      }
    };

    reader.readAsBinaryString(file);
  };

  // Run validation against schema
  const validateData = (rows: any[], cols: { key: string; label: string; colLetter: string }[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Check if at least one expected column is present
    const matchedExpected = cols.filter(c => expectedColumns.includes(c.key));
    if (matchedExpected.length === 0 && expectedColumns.length > 0) {
      errors.push({
        rowIndex: 0,
        excelRow: 1,
        colKey: 'STRUCTURE',
        colIndex: 0,
        colLetter: '-',
        colLabel: 'Cấu trúc biểu mẫu',
        cellRef: 'Tiêu đề',
        value: '',
        message: 'File không khớp với cấu trúc cột của biểu mẫu hiện tại. Vui lòng kiểm tra tiêu đề các cột.'
      });
      return errors;
    }

    rows.forEach((row, rowIdx) => {
      const displayRowNum = rowIdx + 1;
      const excelRow = rowIdx + 2; // Dòng 1 trong Excel là tiêu đề

      cols.forEach((col, colIdx) => {
        const cellRef = `${col.colLetter}${excelRow}`;
        const val = row[col.key];
        const strVal = String(val ?? '').trim();

        // 1. Required Check for primary identifier fields
        const isIdentifier = ['energy', 'name', 'source', 'co2_source', 'flightType', 'tier', 'service', 'metric', 'icao', 'code', 'category', 'role'].includes(col.key);
        if (isIdentifier && !strVal) {
          errors.push({
            rowIndex: displayRowNum,
            excelRow: excelRow,
            colKey: col.key,
            colIndex: colIdx,
            colLetter: col.colLetter,
            colLabel: col.label,
            cellRef: cellRef,
            value: strVal,
            message: `Trường bắt buộc không được để trống.`
          });
          return;
        }

        // 2. Numeric Check
        if (NUMERIC_FIELDS.has(col.key) && strVal) {
          const cleanNumStr = strVal.replace(/,/g, '').replace(/%/g, '').trim();
          const parsedNum = Number(cleanNumStr);

          if (isNaN(parsedNum)) {
            errors.push({
              rowIndex: displayRowNum,
              excelRow: excelRow,
              colKey: col.key,
              colIndex: colIdx,
              colLetter: col.colLetter,
              colLabel: col.label,
              cellRef: cellRef,
              value: strVal,
              message: `Giá trị phải là số hợp lệ (phát hiện ký tự không hợp lệ).`
            });
          } else if (['value', 'saved', 'co2', 'intensity', 'reduced', 'weight', 'emissions', 'total', 'amount', 'allowance', 'purchase', 'price', 'cost', 'hours', 'participants', 'wage'].includes(col.key) && parsedNum < 0) {
            errors.push({
              rowIndex: displayRowNum,
              excelRow: excelRow,
              colKey: col.key,
              colIndex: colIdx,
              colLetter: col.colLetter,
              colLabel: col.label,
              cellRef: cellRef,
              value: strVal,
              message: `Giá trị số lượng/chỉ tiêu không được là số âm (< 0).`
            });
          }
        }

        // 3. Enum Check (Select options)
        if (ENUM_OPTIONS[col.key] && strVal) {
          const enumConfig = ENUM_OPTIONS[col.key];
          const normalized = enumConfig.normalizedMap[strVal.toLowerCase()];
          if (!normalized) {
            errors.push({
              rowIndex: displayRowNum,
              excelRow: excelRow,
              colKey: col.key,
              colIndex: colIdx,
              colLetter: col.colLetter,
              colLabel: col.label,
              cellRef: cellRef,
              value: strVal,
              message: `Giá trị không thuộc danh mục hợp lệ. Cho phép: ${enumConfig.values.join(', ')}.`
            });
          }
        }

        // 4. Date Check
        if (DATE_FIELDS.has(col.key) && strVal) {
          const isValidDate = !isNaN(Date.parse(strVal)) || /^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(strVal) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(strVal);
          if (!isValidDate) {
            errors.push({
              rowIndex: displayRowNum,
              excelRow: excelRow,
              colKey: col.key,
              colIndex: colIdx,
              colLetter: col.colLetter,
              colLabel: col.label,
              cellRef: cellRef,
              value: strVal,
              message: `Định dạng ngày không hợp lệ. Vui lòng dùng YYYY-MM-DD hoặc DD/MM/YYYY.`
            });
          }
        }
      });
    });

    return errors;
  };

  // Trigger import check
  const handleProceedImport = () => {
    if (parsedRows.length === 0) {
      setErrorMessage('Không có dữ liệu để import.');
      return;
    }

    // Run validation
    const errors = validateData(parsedRows, detectedColumns);
    setValidationErrors(errors);
    setHasValidated(true);

    if (errors.length > 0) {
      // Validation FAILED: Stop import and show errors
      return;
    }

    // Validation PASSED: Normalize enum values if any, and commit import
    const sanitizedRows = parsedRows.map(row => {
      const cleaned: Record<string, any> = { ...row };
      Object.keys(cleaned).forEach(key => {
        if (ENUM_OPTIONS[key] && cleaned[key]) {
          const normalized = ENUM_OPTIONS[key].normalizedMap[String(cleaned[key]).toLowerCase()];
          if (normalized) cleaned[key] = normalized;
        }
      });
      return cleaned;
    });

    onImportSuccess(sanitizedRows);
    onClose();
  };

  // Export current template or data
  const handleExportTemplate = () => {
    const cols = expectedColumns.length > 0 ? expectedColumns : Object.keys(currentRows[0] || {});
    const headers = cols.map(c => getColumnLabel(c, indicatorCode));

    const exportData = currentRows.length > 0
      ? currentRows.map(row => {
        const rowData: Record<string, any> = {};
        cols.forEach(c => {
          const colLabel = getColumnLabel(c, indicatorCode);
          rowData[colLabel] = row[c] ?? '';
        });
        return rowData;
      })
      : [
        cols.reduce((acc, c) => {
          const colLabel = getColumnLabel(c, indicatorCode);
          acc[colLabel] = '';
          return acc;
        }, {} as Record<string, any>)
      ];

    const ws = XLSX.utils.json_to_sheet(exportData, { header: headers });
    const wb = XLSX.utils.book_new();
    const sheetName = (subTabName || indicatorCode).substring(0, 31).replace(/[\/\\?*[\]]/g, '_');
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const filename = `VNA_BieuMau_${indicatorCode.replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, filename);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-800">
                  Import Dữ Liệu - {indicatorCode} - {subTabName}
                </h3>
              </div>

            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportTemplate}
              className="text-xs font-bold text-gray-600 hover:text-vna-blue bg-white hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Tải file mẫu Excel chuẩn cho biểu mẫu này"
            >
              <Download size={14} className="text-emerald-600" />
              Tải file mẫu
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">

          {/* File Picker Bar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs py-2 px-4 font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <UploadCloud size={16} />
                {selectedFile ? 'Chọn file khác' : 'Chọn file Excel từ máy'}
              </Button>

              {selectedFile ? (
                <div className="text-xs">
                  <span className="font-bold text-gray-800">{selectedFile.name}</span>
                  <span className="text-gray-400 ml-2">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">
                  Chưa chọn file. Hỗ trợ định dạng .xlsx, .xls, .csv
                </span>
              )}
            </div>

            {parsedRows.length > 0 && (
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                <span className="bg-white px-2.5 py-1 rounded border border-gray-200">
                  Tổng số dòng: <strong className="text-vna-blue">{parsedRows.length}</strong>
                </span>
                <span className="bg-white px-2.5 py-1 rounded border border-gray-200">
                  Số cột nhận diện: <strong className="text-vna-blue">{detectedColumns.length}</strong>
                </span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-700 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Validation Summary Banner */}
          {hasValidated && (
            <div className="animate-in fade-in duration-200">
              {validationErrors.length > 0 ? (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-red-900 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-red-100 text-red-700 rounded-lg shrink-0 mt-0.5">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-red-800">
                        Phát hiện {validationErrors.length} lỗi dữ liệu so với biểu mẫu! Tiến trình import đã tạm dừng.
                      </h4>
                      <p className="text-xs text-red-700 mt-1 font-medium">
                        Vui lòng xem danh sách chi tiết các dòng và cột bị lỗi sau để chỉnh sửa lại file Excel:
                      </p>

                      {/* Detailed Error List Box */}
                      <div className="mt-3 max-h-40 overflow-y-auto bg-white/90 rounded-lg border border-red-200 p-2.5 divide-y divide-red-100 text-xs">
                        {validationErrors.map((err, i) => (
                          <div key={i} className="py-2 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] hover:bg-red-50/60 rounded-lg transition-colors border-b border-red-100/60 last:border-b-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-black px-2 py-0.5 bg-red-600 text-white rounded text-[11px] shadow-2xs">
                                {err.cellRef}
                              </span>
                              <span className="text-red-800 font-bold text-xs">
                                {err.cellRef} - {err.message}
                              </span>
                              <span className="text-gray-500 text-[10px] font-medium">
                                (Cột {err.colLetter}: {err.colLabel} - Dòng Excel {err.excelRow})
                              </span>
                            </div>
                            {err.value !== undefined && err.value !== '' && (
                              <span className="text-gray-500 italic shrink-0 text-[10px] font-mono bg-white border border-gray-200 px-2 py-0.5 rounded shadow-2xs">
                                Giá trị lỗi: &quot;{String(err.value)}&quot;
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-900 shadow-xs flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-800">
                      Dữ liệu hợp lệ! Toàn bộ {parsedRows.length} dòng dữ liệu đều thỏa mãn quy tắc của biểu mẫu.
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                      Không phát hiện lỗi nào. Đang nạp dữ liệu vào biểu mẫu...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File Selected Status & Instructions */}
          {selectedFile && !hasValidated && (
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5">
                <FileSpreadsheet size={16} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-blue-900">
                  File đã sẵn sàng để kiểm tra và nạp vào biểu mẫu
                </p>
                <p className="text-blue-700">
                  Hệ thống đã nhận diện <strong>{parsedRows.length}</strong> dòng dữ liệu và <strong>{detectedColumns.length}</strong> cột tương ứng. Vui lòng nhấn nút <strong>"Tiến hành Import"</strong> bên dưới để thực hiện đối soát dữ liệu và nạp vào hệ thống.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-500 font-medium">
            {validationErrors.length > 0 ? (
              <span className="text-red-700 font-bold flex items-center gap-1.5">
                <AlertCircle size={15} /> Có {validationErrors.length} ô dữ liệu không đạt điều kiện validate.
              </span>
            ) : parsedRows.length > 0 ? (
              <span className="text-gray-600">
                Nhấn <strong>&quot;Tiến hành Import&quot;</strong> để hệ thống kiểm tra và nạp vào biểu mẫu.
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-xs font-bold py-2 px-4 border-gray-300 hover:bg-gray-100 cursor-pointer"
            >
              Hủy bỏ
            </Button>

            <Button
              variant="primary"
              disabled={parsedRows.length === 0}
              onClick={handleProceedImport}
              className={`text-xs font-bold py-2 px-5 flex items-center gap-2 shadow-sm transition-all cursor-pointer ${parsedRows.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : validationErrors.length > 0
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
            >
              <FileSpreadsheet size={16} />
              {validationErrors.length > 0 ? 'Kiểm tra lại & Thử import' : 'Tiến hành Import'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
