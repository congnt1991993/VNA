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
import { Pillar } from '../types';

export interface IndicatorValidationError {
  rowIndex: number;       // 1-indexed (dòng dữ liệu)
  excelRow: number;       // Tọa độ dòng thực tế trong file Excel (bắt đầu từ 2 hoặc 4)
  colKey: string;
  colIndex: number;       // 0-indexed
  colLetter: string;      // 'A', 'B', etc.
  colLabel: string;
  cellRef: string;        // 'A4', 'C4', 'E5', ...
  value: any;
  message: string;
}

interface IndicatorImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedIndicators: any[]) => void;
  existingCodes?: string[];
}

// Chuyển đổi số thứ tự cột sang chữ cái Excel (0 -> 'A', 1 -> 'B', 25 -> 'Z', 26 -> 'AA', ...)
const getExcelColLetter = (colIndex: number): string => {
  let letter = '';
  let temp = colIndex + 1;
  while (temp > 0) {
    const rem = (temp - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
};

// Chuẩn hóa tên cột để mapping linh hoạt
const normalizeHeader = (header: string): string => {
  return (header || '')
    .toLowerCase()
    .replace(/[\(\*\)\_]/g, '')
    .trim();
};

export const IndicatorImportModal: React.FC<IndicatorImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  existingCodes = []
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [detectedColumns, setDetectedColumns] = useState<{ key: string; label: string; colLetter: string }[]>([]);
  const [validationErrors, setValidationErrors] = useState<IndicatorValidationError[]>([]);
  const [hasValidated, setHasValidated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  // Xử lý đọc file và phân tích dữ liệu
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

        // Ưu tiên sheet "Danh Mục Chỉ Tiêu", nếu không lấy sheet đầu tiên
        const sheetName = wb.SheetNames.find(s => s.toLowerCase().includes('chỉ tiêu') || s.toLowerCase().includes('indicator')) || wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        if (!ws) {
          setErrorMessage('File Excel không có sheet dữ liệu nào.');
          return;
        }

        const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (!rawData || rawData.length === 0) {
          setErrorMessage('File Excel rỗng. Không tìm thấy dữ liệu.');
          return;
        }

        // Tìm dòng tiêu đề (Header row): quét qua 6 dòng đầu tiên
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(6, rawData.length); i++) {
          const rowStr = (rawData[i] || []).map((c: any) => String(c || '').toLowerCase()).join(' ');
          if (
            (rowStr.includes('mã chỉ tiêu') || rowStr.includes('code')) &&
            (rowStr.includes('tên chỉ tiêu') || rowStr.includes('name'))
          ) {
            headerRowIdx = i;
            break;
          }
        }

        // Nếu không tìm thấy bằng từ khóa kết hợp, tìm dòng có nhiều hơn 3 ô không rỗng
        if (headerRowIdx === -1) {
          for (let i = 0; i < Math.min(6, rawData.length); i++) {
            const nonEmpty = (rawData[i] || []).filter((c: any) => String(c || '').trim().length > 0);
            if (nonEmpty.length >= 4) {
              headerRowIdx = i;
              break;
            }
          }
        }

        if (headerRowIdx === -1) {
          setErrorMessage('Không nhận diện được dòng tiêu đề các cột trong file Excel.');
          return;
        }

        const rawHeaders = (rawData[headerRowIdx] || []).map((h: any) => String(h || '').trim());
        const dataRows = rawData.slice(headerRowIdx + 1).filter((r: any[]) =>
          r.some((c: any) => String(c || '').trim().length > 0)
        );

        if (dataRows.length === 0) {
          setErrorMessage('File Excel có tiêu đề nhưng không chứa dòng dữ liệu nào.');
          return;
        }

        // Ánh xạ các cột nhận diện
        const colMap: { key: string; label: string; colLetter: string; originalIndex: number }[] = [];

        rawHeaders.forEach((rawH: string, idx: number) => {
          if (!rawH) return;
          const normH = normalizeHeader(rawH);
          let key = `col_${idx}`;

          if (normH.includes('mã chỉ tiêu') || normH === 'mã' || normH === 'code') {
            key = 'code';
          } else if (normH.includes('tên chỉ tiêu') || normH === 'tên' || normH === 'name') {
            key = 'name';
          } else if (normH.includes('trụ cột') || normH === 'pillar') {
            key = 'pillar';
          } else if (normH.includes('chủ đề') || normH.includes('topic')) {
            key = 'topic';
          } else if (normH.includes('cqđv') || normH.includes('phụ trách') || normH.includes('đơn vị') || normH.includes('ban') || normH === 'department') {
            key = 'department';
          } else if (normH.includes('hình thức') || normH.includes('loại báo cáo') || normH === 'reporttype') {
            key = 'reportType';
          } else if (normH.includes('đơn vị tính') || normH === 'đvt' || normH === 'unit') {
            key = 'unit';
          } else if (normH.includes('tần suất') || normH === 'frequency') {
            key = 'frequency';
          } else if (normH.includes('chương trình') || normH.includes('nhãn') || normH === 'programs') {
            key = 'programs';
          } else if (normH.includes('trạng thái') || normH === 'status' || normH === 'isactive') {
            key = 'isActive';
          } else if (normH.includes('câu hỏi') || normH === 'question') {
            key = 'question';
          } else if (normH.includes('gri') || normH.includes('công bố') || normH === 'maindisclosurepoints') {
            key = 'mainDisclosurePoints';
          } else if (normH.includes('mô tả') || normH.includes('phương pháp') || normH === 'introduction') {
            key = 'introduction';
          }

          colMap.push({
            key,
            label: rawH,
            colLetter: getExcelColLetter(idx),
            originalIndex: idx
          });
        });

        setDetectedColumns(colMap.map(c => ({ key: c.key, label: c.label, colLetter: c.colLetter })));

        // Chuyển đổi các dòng thành objects kèm thông tin tọa độ Excel
        const mappedRows = dataRows.map((rowArr: any[], rIdx: number) => {
          const rowObj: Record<string, any> = {
            _rowIndex: rIdx + 1,
            _excelRow: headerRowIdx + 1 + (rIdx + 1) // 1-indexed Excel row
          };

          colMap.forEach(col => {
            rowObj[col.key] = rowArr[col.originalIndex] !== undefined ? rowArr[col.originalIndex] : '';
          });

          return rowObj;
        });

        setParsedRows(mappedRows);
      } catch (err: any) {
        console.error('Lỗi khi đọc file Excel:', err);
        setErrorMessage(`Lỗi đọc file Excel: ${err.message || 'Định dạng file không tương thích.'}`);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Tiến hành Validate dữ liệu theo từng cell
  const handleProceedImport = () => {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    const errors: IndicatorValidationError[] = [];
    const seenCodesInFile = new Map<string, number>();

    const getColInfo = (key: string) => {
      const found = detectedColumns.find(c => c.key === key);
      return found || { colLetter: '?', label: key, key };
    };

    parsedRows.forEach((row) => {
      const excelRow = row._excelRow;
      const rowIndex = row._rowIndex;

      // 1. Mã chỉ tiêu (Bắt buộc, không trùng lặp)
      const codeVal = String(row.code || '').trim();
      const codeCol = getColInfo('code');
      const codeCellRef = `${codeCol.colLetter}${excelRow}`;

      if (!codeVal) {
        errors.push({
          rowIndex,
          excelRow,
          colKey: 'code',
          colIndex: 0,
          colLetter: codeCol.colLetter,
          colLabel: codeCol.label,
          cellRef: codeCellRef,
          value: '',
          message: 'Trường bắt buộc không được để trống'
        });
      } else {
        if (seenCodesInFile.has(codeVal.toLowerCase())) {
          errors.push({
            rowIndex,
            excelRow,
            colKey: 'code',
            colIndex: 0,
            colLetter: codeCol.colLetter,
            colLabel: codeCol.label,
            cellRef: codeCellRef,
            value: codeVal,
            message: `Mã chỉ tiêu bị trùng lặp trong file import (trùng với dòng ${seenCodesInFile.get(codeVal.toLowerCase())})`
          });
        } else {
          seenCodesInFile.set(codeVal.toLowerCase(), excelRow);
        }
      }

      // 2. Tên chỉ tiêu (Bắt buộc)
      const nameVal = String(row.name || '').trim();
      const nameCol = getColInfo('name');
      const nameCellRef = `${nameCol.colLetter}${excelRow}`;

      if (!nameVal) {
        errors.push({
          rowIndex,
          excelRow,
          colKey: 'name',
          colIndex: 1,
          colLetter: nameCol.colLetter,
          colLabel: nameCol.label,
          cellRef: nameCellRef,
          value: '',
          message: 'Trường bắt buộc không được để trống'
        });
      }

      // 3. Trụ cột ESG (Bắt buộc: E, S, G)
      const pillarVal = String(row.pillar || '').trim();
      const pillarCol = getColInfo('pillar');
      const pillarCellRef = `${pillarCol.colLetter}${excelRow}`;

      if (!pillarVal) {
        errors.push({
          rowIndex,
          excelRow,
          colKey: 'pillar',
          colIndex: 2,
          colLetter: pillarCol.colLetter,
          colLabel: pillarCol.label,
          cellRef: pillarCellRef,
          value: '',
          message: 'Trường bắt buộc không được để trống'
        });
      } else {
        const normPillar = pillarVal.toLowerCase();
        const isValidPillar =
          normPillar.includes('môi trường') || normPillar.includes('environment') || normPillar === 'e' ||
          normPillar.includes('xã hội') || normPillar.includes('social') || normPillar === 's' ||
          normPillar.includes('quản trị') || normPillar.includes('governance') || normPillar === 'g';

        if (!isValidPillar) {
          errors.push({
            rowIndex,
            excelRow,
            colKey: 'pillar',
            colIndex: 2,
            colLetter: pillarCol.colLetter,
            colLabel: pillarCol.label,
            cellRef: pillarCellRef,
            value: pillarVal,
            message: 'Trụ cột không hợp lệ (Chỉ chấp nhận: Môi trường (E), Xã hội (S), Quản trị (G))'
          });
        }
      }

      // 4. CQĐV Phụ trách (Bắt buộc)
      const deptVal = String(row.department || '').trim();
      const deptCol = getColInfo('department');
      const deptCellRef = `${deptCol.colLetter}${excelRow}`;

      if (!deptVal) {
        errors.push({
          rowIndex,
          excelRow,
          colKey: 'department',
          colIndex: 4,
          colLetter: deptCol.colLetter,
          colLabel: deptCol.label,
          cellRef: deptCellRef,
          value: '',
          message: 'Trường bắt buộc không được để trống'
        });
      }

      // 5. Hình thức báo cáo (Nếu có thì phải là Số liệu hoặc Văn bản)
      const reportTypeVal = String(row.reportType || '').trim();
      const reportCol = getColInfo('reportType');
      const reportCellRef = `${reportCol.colLetter}${excelRow}`;

      if (reportTypeVal) {
        const normReport = reportTypeVal.toLowerCase();
        const isNumeric = normReport.includes('số liệu') || normReport.includes('numeric') || normReport === 'số';
        const isText = normReport.includes('văn bản') || normReport.includes('text') || normReport.includes('nội dung');

        if (!isNumeric && !isText) {
          errors.push({
            rowIndex,
            excelRow,
            colKey: 'reportType',
            colIndex: 5,
            colLetter: reportCol.colLetter,
            colLabel: reportCol.label,
            cellRef: reportCellRef,
            value: reportTypeVal,
            message: 'Hình thức báo cáo không hợp lệ (Chỉ chấp nhận: Số liệu hoặc Nội dung văn bản)'
          });
        }
      }

      // 6. Tần suất báo cáo (Nếu có: Hàng tháng, Hàng quý, Hàng năm)
      const freqVal = String(row.frequency || '').trim();
      const freqCol = getColInfo('frequency');
      const freqCellRef = `${freqCol.colLetter}${excelRow}`;

      if (freqVal) {
        const normFreq = freqVal.toLowerCase();
        const isValidFreq =
          normFreq.includes('tháng') || normFreq.includes('quý') || normFreq.includes('năm') ||
          normFreq.includes('month') || normFreq.includes('quarter') || normFreq.includes('year');

        if (!isValidFreq) {
          errors.push({
            rowIndex,
            excelRow,
            colKey: 'frequency',
            colIndex: 7,
            colLetter: freqCol.colLetter,
            colLabel: freqCol.label,
            cellRef: freqCellRef,
            value: freqVal,
            message: 'Tần suất báo cáo không hợp lệ (Chỉ chấp nhận: Hàng tháng, Hàng quý, Hàng năm)'
          });
        }
      }

      // 7. Trạng thái (Nếu có: Hoạt động hoặc Ngừng hoạt động)
      const statusVal = String(row.isActive || '').trim();
      const statusCol = getColInfo('isActive');
      const statusCellRef = `${statusCol.colLetter}${excelRow}`;

      if (statusVal) {
        const normStatus = statusVal.toLowerCase();
        const isValidStatus =
          normStatus.includes('hoạt động') || normStatus === 'active' || normStatus === 'true' || normStatus === '1' ||
          normStatus.includes('ngừng') || normStatus === 'inactive' || normStatus === 'false' || normStatus === '0';

        if (!isValidStatus) {
          errors.push({
            rowIndex,
            excelRow,
            colKey: 'isActive',
            colIndex: 9,
            colLetter: statusCol.colLetter,
            colLabel: statusCol.label,
            cellRef: statusCellRef,
            value: statusVal,
            message: 'Trạng thái không hợp lệ (Chỉ chấp nhận: Hoạt động hoặc Ngừng hoạt động)'
          });
        }
      }
    });

    setValidationErrors(errors);
    setHasValidated(true);
    setIsProcessing(false);

    // Nếu không có lỗi nào, thực hiện nạp dữ liệu vào danh mục
    if (errors.length === 0) {
      const formattedIndicators = parsedRows.map((row, idx) => {
        // Parse pillar
        const normPillar = String(row.pillar || '').toLowerCase();
        let pillar = Pillar.ENVIRONMENT;
        if (normPillar.includes('xã hội') || normPillar.includes('social') || normPillar === 's') {
          pillar = Pillar.SOCIAL;
        } else if (normPillar.includes('quản trị') || normPillar.includes('governance') || normPillar === 'g') {
          pillar = Pillar.GOVERNANCE;
        }

        // Parse report type
        const normReport = String(row.reportType || '').toLowerCase();
        const isStatic = normReport.includes('văn bản') || normReport.includes('text') || normReport.includes('nội dung');
        const reportType = isStatic ? 'TEXT' : 'NUMERIC';

        // Parse status
        const normStatus = String(row.isActive || '').toLowerCase();
        let isActive = true;
        if (normStatus.includes('ngừng') || normStatus === 'inactive' || normStatus === 'false' || normStatus === '0') {
          isActive = false;
        }

        // Parse programs
        const rawProgs = String(row.programs || '');
        const programs = rawProgs ? rawProgs.split(',').map((p: string) => p.trim()).filter(Boolean) : [];

        // Parse frequency
        let frequency = 'Hàng tháng';
        const normFreq = String(row.frequency || '').toLowerCase();
        if (normFreq.includes('quý') || normFreq.includes('quarter')) {
          frequency = 'Hàng quý';
        } else if (normFreq.includes('năm') || normFreq.includes('year')) {
          frequency = 'Hàng năm';
        }

        const dept = String(row.department || 'Ban Kỹ thuật').trim();

        return {
          id: String(Date.now() + idx),
          code: String(row.code || '').trim(),
          name: String(row.name || '').trim(),
          pillar,
          topic: String(row.topic || '').trim(),
          department: dept,
          reportType,
          isStatic,
          unit: isStatic ? 'Văn bản' : String(row.unit || '').trim(),
          frequency,
          programs,
          isActive,
          question: isStatic ? String(row.question || '').trim() : '',
          mainDisclosurePoints: isStatic ? String(row.mainDisclosurePoints || '').trim() : '',
          introduction: String(row.introduction || '').trim(),
          weight: 10,
          inputDept: dept,
          approveDept: `Lãnh đạo ${dept}`,
          monitorDept: 'Ban Chỉ đạo ESG'
        };
      });

      onImportSuccess(formattedIndicators);
    }
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
                  Import Dữ Liệu - Danh Mục Chỉ Tiêu ESG
                </h3>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/Template_Import_Chi_Tieu_ESG_VNA.xlsx"
              download="Template_Import_Chi_Tieu_ESG_VNA.xlsx"
              className="text-xs font-bold text-gray-600 hover:text-vna-blue bg-white hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Tải file mẫu Excel chuẩn"
            >
              <Download size={14} className="text-emerald-600" />
              Tải file mẫu
            </a>
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
                className="text-xs py-2 px-4 font-bold bg-[#006885] hover:bg-[#005570] text-white flex items-center gap-2 cursor-pointer shadow-sm rounded-lg"
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
                  Tổng số chỉ tiêu: <strong className="text-vna-blue">{parsedRows.length}</strong>
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
                        Phát hiện {validationErrors.length} lỗi dữ liệu! Tiến trình import đã tạm dừng.
                      </h4>
                      <p className="text-xs text-red-700 mt-1 font-medium">
                        Vui lòng xem danh sách chi tiết các dòng và cột bị lỗi sau để chỉnh sửa lại file Excel:
                      </p>

                      {/* Detailed Error List Box */}
                      <div className="mt-3 max-h-40 overflow-y-auto bg-white/90 rounded-lg border border-red-200 p-2.5 divide-y divide-red-100 text-xs">
                        {validationErrors.map((err, i) => (
                          <div
                            key={i}
                            className="py-2 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] hover:bg-red-50/60 rounded-lg transition-colors border-b border-red-100/60 last:border-b-0"
                          >
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
                      Dữ liệu hợp lệ! Toàn bộ {parsedRows.length} chỉ tiêu đều thỏa mãn quy tắc của hệ thống.
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                      Không phát hiện lỗi nào. Đang nạp dữ liệu vào danh mục...
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
                  File đã sẵn sàng để kiểm tra và nạp vào danh mục chỉ tiêu
                </p>
                <p className="text-blue-700">
                  Hệ thống đã nhận diện <strong>{parsedRows.length}</strong> chỉ tiêu và <strong>{detectedColumns.length}</strong> cột tương ứng. Vui lòng nhấn nút <strong>"Tiến hành Import"</strong> bên dưới để thực hiện đối soát dữ liệu và nạp vào hệ thống.
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
                Nhấn <strong>&quot;Tiến hành Import&quot;</strong> để hệ thống kiểm tra và nạp vào danh mục.
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-xs font-bold py-2 px-4 border-gray-300 hover:bg-gray-100 cursor-pointer rounded-lg bg-white"
            >
              Hủy bỏ
            </Button>

            <Button
              variant="primary"
              disabled={parsedRows.length === 0 || isProcessing}
              onClick={handleProceedImport}
              className={`text-xs font-bold py-2 px-5 flex items-center gap-2 shadow-sm transition-all cursor-pointer rounded-lg ${
                parsedRows.length === 0 || isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : validationErrors.length > 0
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-[#006885] hover:bg-[#005570] text-white'
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
