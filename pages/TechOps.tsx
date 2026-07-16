import React, { useState, useMemo } from 'react';
import { Button, Input, Select } from '../components/UI';
import { Plus, ArrowLeft, Download, Bell, Save, Info, FileSpreadsheet, AlertTriangle, CheckCircle2, RefreshCw, Upload, Lock, ShieldAlert, Edit2, Trash2, X, DollarSign, Sliders, UploadCloud } from 'lucide-react';
import { ApprovalStatusBadge, QuickApprovalActions, useApprovalWorkflow, ApprovalStatus, ApprovalLogTable, ApprovalLog } from '../components/ApprovalWorkflow';
import { UnifiedDataEntryForm } from '../components/UnifiedDataEntryForm';

// Định nghĩa cấu trúc dữ liệu cho mỗi lần nhập thông tin của nghiệp vụ
interface TechnicalOpsRecord {
  logs?: ApprovalLog[];
  id: string;
  effectivePeriod: string; // Thời gian áp dụng, ví dụ: Tháng 03/2026
  status: ApprovalStatus;
  creator?: string;
  editor?: string;
  editTime?: string;
  // Nhóm Cấu hình Định mức
  safPlannedRatio: number; // Tỷ lệ SAF quy định (%)
  quotaEts: number; // Hạn ngạch EU/UK ETS (Tấn CO2)
  baselineCorsia: number; // Mức Baseline (CORSIA) (Tấn CO2)
  // Nhóm Cập nhật SAF thực tế & Chi phí
  actualSaf: number; // Lượng SAF nạp thực tế (Tấn)
  neatSaf: number; // Lượng Neat SAF (Tấn)
  priceEua: number; // Đơn giá tín chỉ EUA/UKA (USD)
  surchargeSaf: number; // Phụ phí mua SAF (USD)
  // Bảng chi tiết mua SAF import
  importedRows: ReFuelEURow[];
}

// 16 Cột dữ liệu Excel chuẩn ReFuelEU Aviation
interface ReFuelEURow {
  airportIcao: string; // 1. ICAO Code of Union Airport
  supplier: string; // 2. Fuel Supplier
  supplierVat: string; // 3. VAT Number of Aviation Fuel Supplier
  batchNumber: string; // 4. Batch Number
  amountPurchased: number; // 5. Amount Purchased (tonnes)
  category: string; // 6. Category
  process: string; // 7. Process
  feedstock: string; // 8. Feedstock
  origin: string; // 9. Origin
  lifecycleEmissions: number; // 10. Lifecycle emissions (gCO2eq/MJ)
  // 11-16. Lượng kê khai bù trừ dưới các MBMs
  claimedEu: number; // 11. Eligible Fuel claimed under EU
  claimedCh: number; // 12. Eligible Fuel claimed under CH
  claimedUk: number; // 13. Eligible Fuel claimed under UK
  claimedCorsia: number; // 14. Eligible Fuel claimed under CORSIA
  claimedOtherMbm1: number; // 15. Eligible Fuel claimed under other MBMs 1
  claimedOtherMbm2: number; // 16. Eligible Fuel claimed under other MBMs 2
}

const MOCK_RECORDS: TechnicalOpsRecord[] = [
  {
    id: 'OPS-2026-03',
    effectivePeriod: 'Tháng 03/2026',
    status: 'Active',
    creator: 'Nguyễn Văn A',
    editor: 'Nguyễn Văn A',
    editTime: '16/05/2026 14:15',
    logs: [
      {
        timestamp: '15/05/2026 09:30:00',
        action: 'Gửi duyệt',
        recorder: 'Nguyễn Văn A',
        approver: '—',
        comment: 'Gửi duyệt dữ liệu kỳ báo cáo'
      },
      {
        timestamp: '16/05/2026 14:15:22',
        action: 'Phê duyệt',
        recorder: 'Nguyễn Văn A',
        approver: 'Trần Thị B',
        comment: 'Số liệu khớp và hợp lệ'
      }
    ],
    safPlannedRatio: 2.0,
    quotaEts: 15000,
    baselineCorsia: 85000,
    actualSaf: 450,
    neatSaf: 180,
    priceEua: 65,
    surchargeSaf: 5000,
    importedRows: [
      {
        airportIcao: 'LFPG',
        supplier: 'TotalEnergies',
        supplierVat: 'FR88123456789',
        batchNumber: 'BAT-2026-03A',
        amountPurchased: 250,
        category: 'Bio-SAF',
        process: 'HEFA-SPK',
        feedstock: 'UCO',
        origin: 'EU',
        lifecycleEmissions: 18.5,
        claimedEu: 250,
        claimedCh: 0,
        claimedUk: 0,
        claimedCorsia: 0,
        claimedOtherMbm1: 0,
        claimedOtherMbm2: 0
      },
      {
        airportIcao: 'EGLL',
        supplier: 'BP Aviation',
        supplierVat: 'GB44987654321',
        batchNumber: 'BAT-2026-03B',
        amountPurchased: 200,
        category: 'Bio-SAF',
        process: 'HEFA-SPK',
        feedstock: 'Agricultural Waste',
        origin: 'Asia',
        lifecycleEmissions: 22.0,
        claimedEu: 0,
        claimedCh: 0,
        claimedUk: 200,
        claimedCorsia: 0,
        claimedOtherMbm1: 0,
        claimedOtherMbm2: 0
      }
    ]
  },
  {
    id: 'OPS-2026-04',
    effectivePeriod: 'Tháng 04/2026',
    status: 'Inactive',
    creator: 'Nguyễn Văn A',
    editor: 'Nguyễn Văn A',
    editTime: '18/05/2026 10:20',
    safPlannedRatio: 2.5,
    quotaEts: 16200,
    baselineCorsia: 85000,
    actualSaf: 0,
    neatSaf: 0,
    priceEua: 72,
    surchargeSaf: 0,
    importedRows: []
  }
];

const MOCK_IMPORT_TEMPLATES: ReFuelEURow[] = [
  {
    airportIcao: 'LFPG',
    supplier: 'TotalEnergies',
    supplierVat: 'FR88123456789',
    batchNumber: 'LOT-SAF-001',
    amountPurchased: 300,
    category: 'Sustainable Aviation Fuel',
    process: 'HEFA-SPK',
    feedstock: 'UCO (Dầu ăn thải)',
    origin: 'Pháp',
    lifecycleEmissions: 19.2,
    claimedEu: 300, // Hợp lệ: Chỉ khai báo 1 scheme duy nhất
    claimedCh: 0,
    claimedUk: 0,
    claimedCorsia: 0,
    claimedOtherMbm1: 0,
    claimedOtherMbm2: 0
  },
  {
    airportIcao: 'EGLL',
    supplier: 'Shell Aviation',
    supplierVat: 'GB44987654321',
    batchNumber: 'LOT-SAF-002',
    amountPurchased: 150,
    category: 'Sustainable Aviation Fuel',
    process: 'FT-SPK',
    feedstock: 'Agricultural Waste',
    origin: 'Anh',
    lifecycleEmissions: 24.5,
    claimedEu: 0,
    claimedCh: 0,
    claimedUk: 150, // Hợp lệ: Chỉ khai báo 1 scheme
    claimedCorsia: 0,
    claimedOtherMbm1: 0,
    claimedOtherMbm2: 0
  },
  {
    airportIcao: 'VVTS',
    supplier: 'Neste Aviation',
    supplierVat: 'SG2026NET091',
    batchNumber: 'LOT-SAF-ERR99',
    amountPurchased: 200,
    category: 'Sustainable Aviation Fuel',
    process: 'HEFA-SPK',
    feedstock: 'Animal Fat',
    origin: 'Singapore',
    lifecycleEmissions: 20.1,
    claimedEu: 120, // VI PHẠM: Khai báo cả EU-ETS và CORSIA cùng một lô hàng!
    claimedCh: 0,
    claimedUk: 0,
    claimedCorsia: 80,
    claimedOtherMbm1: 0,
    claimedOtherMbm2: 0
  }
];

import { OpsKPIConfig } from '../components/OpsKPIConfig';

export const TechOpsPage: React.FC<{ onImportExcel?: () => void }> = ({ onImportExcel }) => {
  const [mainTab, setMainTab] = useState<'INFO' | 'INDICATORS'>('INFO');
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [records, setRecords] = useState<TechnicalOpsRecord[]>(MOCK_RECORDS);
  const [formRecord, setFormRecord] = useState<TechnicalOpsRecord | null>(null);

  const { openApprove, openReject, submitForApproval, ApprovalModalComponent } = useApprovalWorkflow(
    records,
    setRecords
  );

  // States hỗ trợ Import giả lập
  const [importRows, setImportRows] = useState<ReFuelEURow[]>([]);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [validationDone, setValidationDone] = useState(false);

  // Cấu hình dòng trống và các states sửa/xóa lô hàng
  const emptyRow: ReFuelEURow = {
    airportIcao: '',
    supplier: '',
    supplierVat: '',
    batchNumber: '',
    amountPurchased: 0,
    category: 'Sustainable Aviation Fuel',
    process: 'HEFA-SPK',
    feedstock: '',
    origin: '',
    lifecycleEmissions: 0,
    claimedEu: 0,
    claimedCh: 0,
    claimedUk: 0,
    claimedCorsia: 0,
    claimedOtherMbm1: 0,
    claimedOtherMbm2: 0
  };
  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null);
  const [editRowForm, setEditRowForm] = useState<ReFuelEURow>(emptyRow);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddRow = () => {
    if (!editRowForm.airportIcao || !editRowForm.batchNumber || !editRowForm.supplier) {
      alert("Vui lòng điền các trường định danh cơ bản: Sân bay, Nhà cung cấp, Mã lô hàng!");
      return;
    }
    if (editRowForm.amountPurchased < 0 || editRowForm.lifecycleEmissions < 0) {
      alert("Khối lượng hoặc lượng phát thải không được âm!");
      return;
    }
    setImportRows([...importRows, editRowForm]);
    setEditRowForm(emptyRow);
    setFileLoaded(true);
    setIsModalOpen(false);
  };
  const handleUpdateRow = () => {
    if (editingRowIdx === null) return;
    if (!editRowForm.airportIcao || !editRowForm.batchNumber || !editRowForm.supplier) {
      alert("Vui lòng điền các trường định danh cơ bản: Sân bay, Nhà cung cấp, Mã lô hàng!");
      return;
    }
    if (editRowForm.amountPurchased < 0 || editRowForm.lifecycleEmissions < 0) {
      alert("Khối lượng hoặc lượng phát thải không được âm!");
      return;
    }
    const updated = [...importRows];
    updated[editingRowIdx] = editRowForm;
    setImportRows(updated);
    setEditingRowIdx(null);
    setEditRowForm(emptyRow);
    setIsModalOpen(false);
  };

  const handleDeleteRow = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa lô hàng SAF này khỏi báo cáo?")) {
      const updated = importRows.filter((_, i) => i !== idx);
      setImportRows(updated);
      if (updated.length === 0) {
        setFileLoaded(false);
        setValidationDone(false);
      }
      if (editingRowIdx === idx) {
        setEditingRowIdx(null);
        setEditRowForm(emptyRow);
      } else if (editingRowIdx !== null && editingRowIdx > idx) {
        setEditingRowIdx(editingRowIdx - 1);
      }
    }
  };

  const handleAddNew = () => {
    const today = new Date();
    setFormRecord({
      id: `OPS-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
      effectivePeriod: `Tháng ${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`,
      status: 'Inactive',
      creator: 'Nguyễn Văn A',
      editor: 'Nguyễn Văn A',
      editTime: '',
      safPlannedRatio: 0,
      quotaEts: 0,
      baselineCorsia: 0,
      actualSaf: 0,
      neatSaf: 0,
      priceEua: 0,
      surchargeSaf: 0,
      importedRows: []
    });
    setImportRows([]);
    setFileLoaded(false);
    setValidationDone(false);
    setEditingRowIdx(null);
    setEditRowForm(emptyRow);
    setIsModalOpen(false);
    setViewMode('DETAIL');
  };

  const handleEdit = (item: TechnicalOpsRecord) => {
    setFormRecord({ ...item });
    setImportRows([...item.importedRows]);
    setFileLoaded(item.importedRows.length > 0);
    setValidationDone(item.importedRows.length > 0);
    setEditingRowIdx(null);
    setEditRowForm(emptyRow);
    setIsModalOpen(false);
    setViewMode('DETAIL');
  };

  const handleSave = () => {
    if (!formRecord) return;

    // Validate dữ liệu số âm (Quy tắc Nghiệp vụ mục 3.3)
    if (formRecord.quotaEts < 0 || formRecord.baselineCorsia < 0) {
      alert("Lỗi: Giá trị Hạn ngạch EU/UK ETS và Baseline CORSIA không được phép nhập số âm!");
      return;
    }
    if (formRecord.safPlannedRatio < 0) {
      alert("Lỗi: Các thông số định mức không được nhập số âm!");
      return;
    }

    const totalActualSaf = importRows.reduce((sum, r) => sum + r.amountPurchased, 0);
    const totalNeatSaf = Number((totalActualSaf * 0.4).toFixed(1));

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Đóng gói dữ liệu kèm mảng import
    const savedRecord: TechnicalOpsRecord = {
      ...formRecord,
      creator: formRecord.creator || 'Nguyễn Văn A',
      editor: 'Nguyễn Văn A',
      editTime: formattedDate,
      actualSaf: totalActualSaf,
      neatSaf: totalNeatSaf,
      importedRows: importRows
    };

    let updatedRecords = [...records];
    if (savedRecord.status === 'Active') {
      updatedRecords = updatedRecords.map(r => r.id === formRecord.id ? savedRecord : { ...r, status: 'Inactive' });
      const exists = records.some(r => r.id === formRecord.id);
      if (!exists) {
        updatedRecords = updatedRecords.map(r => ({ ...r, status: 'Inactive' }));
        updatedRecords.push(savedRecord);
      }
    } else {
      const exists = records.some(r => r.id === formRecord.id);
      if (exists) {
        updatedRecords = updatedRecords.map(r => r.id === formRecord.id ? savedRecord : r);
      } else {
        updatedRecords.push(savedRecord);
      }
    }

    setRecords(updatedRecords);
    setViewMode('LIST');
    setFormRecord(null);
  };

  const handleBack = () => {
    setViewMode('LIST');
    setFormRecord(null);
  };

  const handleToggleActive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn kích hoạt kỳ nhập này thành 'Hiệu lực'? Toàn bộ các kỳ khác sẽ tự động chuyển sang 'Hết hiệu lực'.")) {
      setRecords(records.map(r => r.id === id ? { ...r, status: 'Active' as const } : { ...r, status: 'Inactive' as const }));
    }
  };

  const simulateExcelUpload = () => {
    setImportRows(MOCK_IMPORT_TEMPLATES);
    setFileLoaded(true);
    setValidationDone(false); // reset validate state
    alert("Giả lập thành công: Đã nạp 3 dòng dữ liệu chuẩn ReFuelEU từ file Excel của nhà cung cấp!");
  };

  // Quy tắc: 1 lô SAF chỉ được kê khai bù trừ cho 1 scheme duy nhất (chỉ 1 trong số 6 cột claimed > 0)
  const validationErrors = useMemo(() => {
    const errors: { rowIndex: number; batchNumber: string; message: string }[] = [];
    importRows.forEach((row, index) => {
      let activeSchemesCount = 0;
      const activeSchemes: string[] = [];

      if (row.claimedEu > 0) { activeSchemesCount++; activeSchemes.push('EU ETS'); }
      if (row.claimedCh > 0) { activeSchemesCount++; activeSchemes.push('CH MBM'); }
      if (row.claimedUk > 0) { activeSchemesCount++; activeSchemes.push('UK ETS'); }
      if (row.claimedCorsia > 0) { activeSchemesCount++; activeSchemes.push('CORSIA'); }
      if (row.claimedOtherMbm1 > 0) { activeSchemesCount++; activeSchemes.push('Other MBM 1'); }
      if (row.claimedOtherMbm2 > 0) { activeSchemesCount++; activeSchemes.push('Other MBM 2'); }

      if (activeSchemesCount > 1) {
        errors.push({
          rowIndex: index,
          batchNumber: row.batchNumber,
          message: `Lô hàng [${row.batchNumber}] bị khai báo trùng lặp cho nhiều cơ chế (${activeSchemes.join(', ')}). Một lô SAF chỉ được kê khai bù trừ cho duy nhất một cơ chế!`
        });
      }
    });
    return errors;
  }, [importRows]);

  const handleRunValidation = () => {
    setValidationDone(true);
    if (validationErrors.length > 0) {
      alert(`Phát hiện ${validationErrors.length} lỗi kê khai trùng lặp trên file import. Vui lòng kiểm tra lại GridView!`);
    } else {
      alert("Kiểm tra thành công! Không phát hiện lỗi kê khai trùng cơ chế nào trên file ReFuelEU.");
    }
  };

  const executeImport = () => {
    if (!validationDone) {
      alert("Vui lòng thực hiện 'Chạy kiểm tra logic' trước khi import vào hệ thống!");
      return;
    }
    if (validationErrors.length > 0) {
      alert("Lỗi: Vẫn tồn tại bản ghi kê khai trùng lặp cơ chế. Vui lòng điều chỉnh lại file Excel trước khi lưu hệ thống!");
      return;
    }
    alert("Thực thi thành công! Dữ liệu ReFuelEU sạch đã được map vào cấu hình tính toán cấn trừ phát thải.");
  };

  if (viewMode === 'DETAIL' && formRecord) {
    return (
      <UnifiedDataEntryForm
        department="Tổ Kỹ thuật (Ban QLVT)"
        effectivePeriod={formRecord.effectivePeriod}
        onBack={handleBack}
        onSave={handleSave}
        isNewPeriod={formRecord.editTime === ''}
      />
    );
  }
  if (mainTab === 'INDICATORS') {
    return (
      <div className="animate-in fade-in">
        <div className="flex border-b border-gray-200 mb-4 bg-white px-6 pt-4 rounded-t-lg shadow-sm">
          <button onClick={() => { setMainTab('INFO'); setViewMode('LIST'); }} className="px-6 py-3 font-semibold text-gray-500 hover:text-vna-blue border-b-2 border-transparent transition-colors">Thông tin chi tiết (Kỳ báo cáo)</button>
          <button onClick={() => setMainTab('INDICATORS')} className="px-6 py-3 font-bold text-vna-blue border-b-2 border-vna-blue transition-colors">Danh mục chỉ tiêu</button>
        </div>
        <div className="-mt-6">
          <OpsKPIConfig department="Ban Quản lý vật tư" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue tracking-tight">Nghiệp vụ Ban Quản lý vật tư</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý nhập liệu, theo dõi tiêu hao năng lượng và chứng từ ReFuelEU</p>
        </div>
        <div className="flex gap-2">
          {/* {onImportExcel && (
            <Button variant="outline" onClick={onImportExcel} className="cursor-pointer flex items-center gap-1.5 border-vna-blue text-vna-blue hover:bg-blue-50/50">
              <UploadCloud size={16} /> Import Excel
            </Button>
          )} */}
          <Button variant="primary" onClick={handleAddNew} className="shadow-md hover:shadow-lg transition-all">
            <Plus size={16} className="mr-2" /> Tạo kỳ báo cáo mới
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        <button
          onClick={() => { setMainTab('INFO'); setViewMode('LIST'); }}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${mainTab === 'INFO' ? 'text-vna-blue border-vna-blue' : 'text-gray-500 hover:text-vna-blue border-transparent'}`}
        >
          Thông tin chi tiết (Kỳ báo cáo)
        </button>
        {/* <button 
          onClick={() => setMainTab('INDICATORS')} 
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${mainTab === 'INDICATORS' ? 'text-vna-blue border-vna-blue' : 'text-gray-500 hover:text-vna-blue border-transparent'}`}
        >
          Danh mục chỉ tiêu
        </button> */}
      </div>

      {/* Grid danh sách bọc trong Card Frame đồng bộ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="py-3 px-4 font-semibold text-gray-700 w-12 text-center rounded-tl-lg">STT</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Mã kỳ báo cáo</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Năm báo cáo</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Người lập</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Người chỉnh sửa</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Thời gian chỉnh sửa</th>
                <th className="py-3 px-4 font-semibold text-gray-700 w-40 text-center rounded-tr-lg">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {records.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer" onClick={() => handleEdit(item)}>
                  <td className="py-3 px-4 text-sm text-black/45 text-center">{index + 1}</td>
                  <td className="py-3 px-4 text-sm text-vna-blue font-mono font-bold">{item.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 font-semibold">{item.year || item.effectivePeriod?.split('/').pop() || '—'}</td>
                  <td className="py-3 px-4 text-gray-600">{item.creator || '—'}</td>
                  <td className="py-3 px-4 text-gray-600">{item.editor || '—'}</td>
                  <td className="py-3 px-4 text-gray-600 font-mono">{item.editTime || '—'}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center items-center gap-2">
                      <Button variant="outline" className="px-2.5 py-1.5 h-8 text-xs font-semibold whitespace-nowrap" onClick={() => handleEdit(item)}>
                        <Edit2 size={14} className="mr-1" /> Chi tiết
                      </Button>
                      <QuickApprovalActions
                        status={item.status}
                        recordId={item.id}
                        onApprove={openApprove}
                        onReject={openReject}
                        onSubmit={submitForApproval}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Chưa ghi nhận kỳ nhập liệu nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ApprovalModalComponent />
    </div>
  );
};
