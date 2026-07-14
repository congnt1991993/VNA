import React, { useState } from 'react';
import { Button, Input, Select } from '../components/UI';
import { Plus, ArrowLeft, Save, Edit2, Upload, FileSpreadsheet, AlertTriangle, CheckCircle, Trash2, Calendar, Activity, FileWarning, Bell, X, Search, Zap, UploadCloud } from 'lucide-react';
import { OpsKPIConfig } from '../components/OpsKPIConfig';
import { ApprovalStatusBadge, QuickApprovalActions, useApprovalWorkflow, ApprovalStatus, ApprovalLogTable, ApprovalLog } from '../components/ApprovalWorkflow';
import { UnifiedDataEntryForm } from '../components/UnifiedDataEntryForm';

// --- DATA STRUCTURES ---
interface SatisfactionScore {
  overall: string;
  jobCharacteristics: string;
  workingConditions: string;
  trainingPromotion: string;
  leadership: string;
  officeRelations: string;
  income: string;
  benefits: string;
}

interface DepartmentMatrixScore {
  name: string;
  isOverall: boolean;
  scores: SatisfactionScore;
}

interface LocalLeaderRate {
  month: string;
  vnRate: string;
  foreignRate: string;
}

interface AlertCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  message: string;
  priority: string;
}

interface OpsHRRecord {
  logs?: ApprovalLog[];
  id: string;
  year: string;
  status: ApprovalStatus;
  creator?: string;
  editor?: string;
  editTime?: string;

  // Area 1: Block 1.1 Matrix
  matrixScores: DepartmentMatrixScore[];

  // Area 1: Block 1.2
  localLeaderRates: LocalLeaderRate[];

  // Area 2: Block 2.1
  accidentReportPeriod: string;
  accidentFileUploaded: boolean;

  // Area 2: Block 2.2
  hasStrike: boolean;
  strikeCount: string;
  strikeDescription: string;

  // Area 3: Alerts
  alertConditions: AlertCondition[];
  assignees: string[];
}

const DEPARTMENTS = [
  { name: 'Toàn Tổng công ty (Overall)', isOverall: true },
  { name: 'Khối Thương mại', isOverall: false },
  { name: 'Khối Dịch vụ', isOverall: false },
  { name: 'Khối Khai thác bay', isOverall: false },
  { name: 'Khối Kỹ thuật', isOverall: false },
  { name: 'Tham mưu tổng hợp', isOverall: false },
  { name: 'Trực thuộc khác', isOverall: false }
];

const AVAILABLE_ASSIGNEES = [
  'Ban Giám đốc (BOD)',
  'Trưởng ban TCNL - Nguyễn Song Trường',
  'Chuyên viên TCNL - Nguyễn Thị Minh Huyền',
  'Chuyên viên TCNL - Trần Quang Anh'
];

const INITIAL_SCORES: SatisfactionScore = {
  overall: '',
  jobCharacteristics: '',
  workingConditions: '',
  trainingPromotion: '',
  leadership: '',
  officeRelations: '',
  income: '',
  benefits: ''
};

const DEFAULT_MONTHLY = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  withdrawal: '',
  consumption: ''
}));

const MOCK_RECORDS: OpsHRRecord[] = [
  {
    id: 'HR-2026',
    year: '2026',
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
    matrixScores: DEPARTMENTS.map(d => ({ name: d.name, isOverall: d.isOverall, scores: { ...INITIAL_SCORES, overall: '4.0' } })),
    localLeaderRates: Array.from({ length: 12 }, (_, i) => ({ month: String(i + 1).padStart(2, '0'), vnRate: '95', foreignRate: '5' })),
    accidentReportPeriod: 'H1',
    accidentFileUploaded: true,
    hasStrike: false,
    strikeCount: '',
    strikeDescription: '',
    alertConditions: [
      { id: '1', field: 'satisfaction', operator: '<', value: '3.5', priority: 'High', message: 'Cảnh báo: Điểm hài lòng dưới mức quy định!' }
    ],
    assignees: ['Ban Giám đốc (BOD)', 'Trưởng ban TCNL - Nguyễn Song Trường']
  }
];

export const OpsHRPage: React.FC<{ onImportExcel?: () => void }> = ({ onImportExcel }) => {
  const [mainTab, setMainTab] = useState<'INFO' | 'INDICATORS'>('INFO');
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [records, setRecords] = useState<OpsHRRecord[]>(MOCK_RECORDS);
  const [formRecord, setFormRecord] = useState<OpsHRRecord | null>(null);

  const { openApprove, openReject, submitForApproval, ApprovalModalComponent } = useApprovalWorkflow(
    records,
    setRecords
  );

  // Local UI state for inline month selection
  const [selectedMonth, setSelectedMonth] = useState<string>('01');

  // Assignee dropdown state
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');

  const handleAddNew = () => {
    const today = new Date();
    setFormRecord({
      id: `HR-${today.getFullYear()}`,
      year: today.getFullYear().toString(),
      status: 'Inactive',
      creator: 'Nguyễn Văn A',
      editor: 'Nguyễn Văn A',
      editTime: '',
      matrixScores: DEPARTMENTS.map(d => ({ name: d.name, isOverall: d.isOverall, scores: { ...INITIAL_SCORES } })),
      localLeaderRates: Array.from({ length: 12 }, (_, i) => ({ month: String(i + 1).padStart(2, '0'), vnRate: '', foreignRate: '' })),
      accidentReportPeriod: 'H1',
      accidentFileUploaded: false,
      hasStrike: false,
      strikeCount: '',
      strikeDescription: '',
      alertConditions: [{ id: Date.now().toString(), field: 'strike', operator: '>', value: '0', priority: 'High', message: '' }],
      assignees: []
    });
    setSelectedMonth(String(today.getMonth() + 1).padStart(2, '0'));
    setViewMode('DETAIL');
  };

  const handleEdit = (item: OpsHRRecord) => {
    setFormRecord({ ...item });
    setSelectedMonth('01');
    setViewMode('DETAIL');
  };

  const handleSave = () => {
    if (!formRecord) return;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const recordToSave: OpsHRRecord = {
      ...formRecord,
      creator: formRecord.creator || 'Nguyễn Văn A',
      editor: 'Nguyễn Văn A',
      editTime: formattedDate
    };

    let updatedRecords = [...records];
    const exists = records.some(r => r.id === formRecord.id);
    if (exists) {
      updatedRecords = updatedRecords.map(r => r.id === formRecord.id ? recordToSave : r);
    } else {
      updatedRecords.push(recordToSave);
    }
    setRecords(updatedRecords);
    setViewMode('LIST');
    setFormRecord(null);
    alert("Đã lưu Cập nhật thành công!");
  };

  const handleFileUpload = () => {
    if (!formRecord) return;
    // Simulate upload delay
    setTimeout(() => {
      setFormRecord({ ...formRecord, accidentFileUploaded: true });
    }, 500);
  };

  const handleRemoveFile = () => {
    if (!formRecord) return;
    setFormRecord({ ...formRecord, accidentFileUploaded: false });
  };

  const updateMatrixScore = (index: number, key: keyof SatisfactionScore, val: string) => {
    if (!formRecord) return;
    const newScores = [...formRecord.matrixScores];
    newScores[index].scores[key] = val;
    setFormRecord({ ...formRecord, matrixScores: newScores });
  };

  const validateScore = (val: string) => {
    if (val === '') return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 1.0 && num <= 5.0;
  };

  // --- FAST ENTRY HANDLERS ---
  const applyOverallToAllDepartments = () => {
    if (!formRecord) return;
    const overallScores = formRecord.matrixScores[0].scores;
    const newMatrix = formRecord.matrixScores.map((dept, idx) => {
      if (idx === 0) return dept;
      return { ...dept, scores: { ...overallScores } };
    });
    setFormRecord({ ...formRecord, matrixScores: newMatrix });
  };

  const updateCurrentMonthRate = (field: 'vnRate' | 'foreignRate', val: string) => {
    if (!formRecord) return;
    const newRates = formRecord.localLeaderRates.map(r =>
      r.month === selectedMonth ? { ...r, [field]: val } : r
    );
    setFormRecord({ ...formRecord, localLeaderRates: newRates });
  };

  const applyCurrentMonthToAll = () => {
    if (!formRecord) return;
    const currentData = formRecord.localLeaderRates.find(r => r.month === selectedMonth);
    if (!currentData) return;
    const newRates = formRecord.localLeaderRates.map(r => ({
      ...r,
      vnRate: currentData.vnRate,
      foreignRate: currentData.foreignRate
    }));
    setFormRecord({ ...formRecord, localLeaderRates: newRates });
    alert(`Đã áp dụng số liệu Tháng ${selectedMonth} cho toàn bộ 12 tháng!`);
  };
  // ---------------------------

  const handleAddAlertCondition = () => {
    if (!formRecord) return;
    setFormRecord({
      ...formRecord,
      alertConditions: [...formRecord.alertConditions, { id: Date.now().toString(), field: 'strike', operator: '>', value: '', priority: 'Medium', message: '' }]
    });
  };

  const handleUpdateAlertCondition = (id: string, key: keyof AlertCondition, val: string) => {
    if (!formRecord) return;
    setFormRecord({
      ...formRecord,
      alertConditions: formRecord.alertConditions.map(cond => cond.id === id ? { ...cond, [key]: val } : cond)
    });
  };

  const handleRemoveAlertCondition = (id: string) => {
    if (!formRecord) return;
    setFormRecord({
      ...formRecord,
      alertConditions: formRecord.alertConditions.filter(cond => cond.id !== id)
    });
  };

  const handleToggleAssignee = (assignee: string) => {
    if (!formRecord) return;
    let newAssignees = [...formRecord.assignees];
    if (newAssignees.includes(assignee)) {
      newAssignees = newAssignees.filter(a => a !== assignee);
    } else {
      newAssignees.push(assignee);
    }
    setFormRecord({ ...formRecord, assignees: newAssignees });
    setAssigneeSearch('');
  };

  const handleRemoveAssignee = (assignee: string) => {
    if (!formRecord) return;
    setFormRecord({ ...formRecord, assignees: formRecord.assignees.filter(a => a !== assignee) });
  };

  const filteredAssignees = AVAILABLE_ASSIGNEES.filter(a => a.toLowerCase().includes(assigneeSearch.toLowerCase()));

  const getTagColor = (tag: string) => {
    if (tag.includes('BOD')) return 'bg-red-100 text-red-700 border-red-200';
    if (tag.includes('Trưởng ban')) return 'bg-blue-100 text-vna-blue border-blue-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue tracking-tight">Nghiệp vụ Ban Tổ chức Nhân lực</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý nhân sự, đào tạo, an toàn lao động và đa dạng hóa</p>
        </div>
        {mainTab === 'INFO' && viewMode === 'LIST' && (
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
        )}
      </div>

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

      {mainTab === 'INDICATORS' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
          <OpsKPIConfig department="Ban Tổ chức nhân lực" />
        </div>
      )}

      {mainTab === 'INFO' && viewMode === 'LIST' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Mã kỳ báo cáo</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Năm báo cáo</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Hài lòng chung</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Có đình công</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Chứng từ tai nạn</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Người lập</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Người chỉnh sửa</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Thời gian chỉnh sửa</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {records.map(record => {
                  const overallScore = record.matrixScores.find(m => m.isOverall)?.scores.overall || '-';
                  return (
                    <tr key={record.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="py-3 px-4 font-bold text-vna-blue">{record.id}</td>
                      <td className="py-3 px-4">Năm {record.year}</td>
                      <td className="py-3 px-4 font-semibold font-mono">{overallScore} / 5.0</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${record.hasStrike ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-50 text-gray-650'}`}>
                          {record.hasStrike ? 'Có' : 'Không'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${record.accidentFileUploaded ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                          {record.accidentFileUploaded ? 'Đã tải lên' : 'Chưa tải lên'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{record.creator || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{record.editor || '—'}</td>
                      <td className="py-3 px-4 text-gray-600 font-mono">{record.editTime || '—'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="outline" className="px-2.5 py-1.5 h-8 text-xs font-semibold" onClick={() => handleEdit(record)}>
                            <Edit2 size={14} className="mr-1" /> Chi tiết
                          </Button>
                          <QuickApprovalActions
                            status={record.status}
                            recordId={record.id}
                            onApprove={openApprove}
                            onReject={openReject}
                            onSubmit={submitForApproval}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {records.length === 0 && (
                  <tr><td colSpan={9} className="py-8 text-center text-gray-500">Chưa có dữ liệu.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mainTab === 'INFO' && viewMode === 'DETAIL' && formRecord && (
        <UnifiedDataEntryForm
          department="Ban Tổ chức Nhân lực"
          effectivePeriod={formRecord.effectivePeriod}
          onBack={() => setViewMode('LIST')}
          onSave={handleSave}
          isNewPeriod={formRecord.editTime === ''}
        />
      )}
      {false && mainTab === 'INFO' && viewMode === 'DETAIL' && formRecord && (
        <div className="bg-gray-50 flex flex-col h-[calc(100vh-120px)] -m-6 animate-in slide-in-from-right-4 duration-300 relative">
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 8px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          `}</style>

          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-40 shadow-sm shrink-0">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setViewMode('LIST')} className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h2 className="text-xl font-bold text-vna-blue">Chi tiết báo cáo TCNL: Năm {formRecord.year}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <ApprovalStatusBadge status={formRecord.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Body Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32">

            {/* THAM SỐ ĐỊNH DANH (GLOBAL FILTER) */}
            <section className="bg-white p-6 rounded-xl border-l-4 border-l-vna-blue border-y border-r border-gray-200 shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-vna-blue" size={24} />
                <h3 className="text-lg font-black text-vna-blue uppercase tracking-wide">Năm báo cáo (Reporting Year)</h3>
              </div>
              <div className="w-full md:w-1/3">
                <Select
                  options={[
                    { label: '2024', value: '2024' },
                    { label: '2025', value: '2025' },
                    { label: '2026', value: '2026' },
                    { label: '2027', value: '2027' }
                  ]}
                  value={formRecord.year}
                  onChange={(val) => setFormRecord({ ...formRecord, year: val, id: `HR-${val}` })}
                />
              </div>
              <p className="text-xs text-gray-500 mt-3 font-medium italic">* Mọi dữ liệu thao tác bên dưới đều sẽ được hệ thống ngầm hiểu là thuộc về Năm báo cáo này.</p>
            </section>

            {/* KHU VỰC 1: DỮ LIỆU KHẢO SÁT & QUẢN TRỊ */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
              <div className="flex items-center mb-6 border-b border-gray-100 pb-3">
                <Activity className="text-vna-blue mr-2" size={20} />
                <h3 className="text-lg font-bold text-vna-blue uppercase tracking-wide">1. Dữ liệu Khảo sát & Quản trị (Periodic Data Entry)</h3>
              </div>

              <div className="space-y-8">
                {/* Block 1.1: Bảng Ma trận */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h4 className="font-bold text-gray-800">Block 1.1: Khảo sát Mức độ hài lòng (GRI F-2) - Định kỳ Tháng 11</h4>
                      <p className="text-xs text-gray-500 mt-1">Đánh giá thang điểm từ 1.0 đến 5.0. Ô nhập liệu sai sẽ báo đỏ.</p>
                    </div>
                    <Button variant="outline" className="h-8 text-xs px-3 py-0 font-medium border-vna-blue text-vna-blue hover:bg-blue-50" onClick={applyOverallToAllDepartments} title="Nhập xong dòng 'Toàn Tổng công ty', bấm nút này để copy xuống toàn bộ các khối bên dưới.">
                      <Zap size={14} className="mr-1.5 fill-vna-blue" /> Điền nhanh các khối
                    </Button>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1200px]">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200 text-xs text-gray-700">
                          <th className="py-3 px-4 font-bold border-r border-gray-200 sticky left-0 z-10 bg-gray-100 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.05)] w-48">Đối tượng đánh giá</th>
                          <th className="py-3 px-4 font-bold border-r border-gray-200 text-center w-32">Hài lòng tổng thể</th>
                          <th className="py-3 px-4 font-bold border-r border-gray-200 text-center w-32">Đặc điểm công việc</th>
                          <th className="py-3 px-4 font-bold border-r border-gray-200 text-center w-32">Điều kiện làm việc</th>
                          <th className="py-3 px-4 font-bold border-r border-gray-200 text-center w-32">Đào tạo thăng tiến</th>
                          <th className="py-3 px-4 font-bold border-r border-gray-200 text-center w-32">Lãnh đạo</th>
                          <th className="py-3 px-4 font-bold border-r border-gray-200 text-center w-32">Quan hệ công sở</th>
                          <th className="py-3 px-4 font-bold border-r border-gray-200 text-center w-32">Thu nhập</th>
                          <th className="py-3 px-4 font-bold text-center w-32">Phúc lợi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {formRecord.matrixScores.map((row, idx) => (
                          <tr key={row.name} className={row.isOverall ? 'bg-blue-50/50 hover:bg-blue-100/50' : 'hover:bg-gray-50'}>
                            <td className={`py-3 px-4 border-r border-gray-200 sticky left-0 z-10 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.05)] ${row.isOverall ? 'bg-blue-50/90 font-bold text-vna-blue' : 'bg-white font-medium text-gray-700'}`}>
                              {row.name}
                            </td>

                            {[
                              { key: 'overall', val: row.scores.overall },
                              { key: 'jobCharacteristics', val: row.scores.jobCharacteristics },
                              { key: 'workingConditions', val: row.scores.workingConditions },
                              { key: 'trainingPromotion', val: row.scores.trainingPromotion },
                              { key: 'leadership', val: row.scores.leadership },
                              { key: 'officeRelations', val: row.scores.officeRelations },
                              { key: 'income', val: row.scores.income },
                              { key: 'benefits', val: row.scores.benefits }
                            ].map((col, cIdx) => (
                              <td key={cIdx} className={`py-2 px-2 border-r border-gray-200 ${cIdx === 7 ? 'border-r-0' : ''}`}>
                                <input
                                  type="number"
                                  min="1" max="5" step="0.1"
                                  placeholder="-"
                                  className={`w-full border rounded px-2 py-1.5 text-sm outline-none text-center focus:ring-1 focus:ring-vna-blue ${!validateScore(col.val) ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300'}`}
                                  value={col.val}
                                  onChange={(e) => updateMatrixScore(idx, col.key as keyof SatisfactionScore, e.target.value)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Block 1.2: Lãnh đạo bản địa (Thanh ngang Inline form) */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h4 className="font-bold text-gray-800">Block 1.2: Tỷ lệ lãnh đạo bản địa (GRI 202-2) - Cập nhật hàng tháng</h4>
                    <Button variant="outline" className="h-8 text-xs px-3 py-0 font-medium border-vna-blue text-vna-blue hover:bg-blue-50" onClick={applyCurrentMonthToAll} title="Lấy số liệu của tháng đang chọn và lưu cho toàn bộ 12 tháng">
                      <Zap size={14} className="mr-1.5 fill-vna-blue" /> Áp dụng cho cả năm
                    </Button>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-end gap-4 bg-white p-4 rounded border border-gray-200 shadow-sm relative">
                    {/* Indicator to show it's saved to the 12 month array */}
                    <div className="absolute -top-3 -right-2 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 shadow-sm">
                      Đang sửa: Tháng {selectedMonth}
                    </div>

                    <div className="flex-1">
                      <Select
                        label="Tháng báo cáo (Month)"
                        options={Array.from({ length: 12 }, (_, i) => ({ label: `Tháng ${i + 1}`, value: String(i + 1).padStart(2, '0') }))}
                        value={selectedMonth}
                        onChange={(val) => setSelectedMonth(val)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ Quản lý người VN tại Việt Nam</label>
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-md p-2 pr-8 text-sm focus:ring-1 focus:ring-vna-blue outline-none"
                          value={formRecord.localLeaderRates.find(r => r.month === selectedMonth)?.vnRate || ''}
                          onChange={(e) => updateCurrentMonthRate('vnRate', e.target.value)}
                          placeholder="Nhập %"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 font-bold">%</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ Quản lý người Nước ngoài tại nước ngoài</label>
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-md p-2 pr-8 text-sm focus:ring-1 focus:ring-vna-blue outline-none"
                          value={formRecord.localLeaderRates.find(r => r.month === selectedMonth)?.foreignRate || ''}
                          onChange={(e) => updateCurrentMonthRate('foreignRate', e.target.value)}
                          placeholder="Nhập %"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 font-bold">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* KHU VỰC 2: QUẢN LÝ SỰ CỐ & TAI NẠN */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
              <div className="flex items-center mb-6 border-b border-gray-100 pb-3">
                <FileWarning className="text-vna-blue mr-2" size={20} />
                <h3 className="text-lg font-bold text-vna-blue uppercase tracking-wide">2. Quản lý sự cố & Tai nạn (Incidents & Accidents)</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Block 2.1 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm flex flex-col">
                  <div className="bg-white p-4 border-b border-gray-200">
                    <h4 className="font-bold text-gray-800">Block 2.1: Nhập liệu Tai nạn lao động (GRI 403-9) - Định kỳ 6 tháng</h4>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="w-full mb-4">
                      <Select
                        label="Kỳ báo cáo"
                        options={[
                          { label: '6 tháng đầu năm (H1)', value: 'H1' },
                          { label: '6 tháng cuối năm (H2)', value: 'H2' }
                        ]}
                        value={formRecord.accidentReportPeriod}
                        onChange={(val) => setFormRecord({ ...formRecord, accidentReportPeriod: val })}
                      />
                    </div>

                    {formRecord.accidentFileUploaded ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 flex flex-col items-center justify-center text-emerald-700 animate-in zoom-in-95 flex-1 shadow-inner min-h-[140px]">
                        <CheckCircle size={32} className="mb-2" />
                        <span className="font-bold text-center">Đã trích xuất thành công dữ liệu tai nạn lao động</span>
                        <Button variant="outline" className="mt-4 bg-white h-8 text-xs text-gray-600 hover:text-red-600 hover:border-red-300 transition-colors" onClick={handleRemoveFile}>Xóa và Tải lại</Button>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-gray-300 bg-white rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-vna-blue hover:bg-blue-50 transition-colors flex-1 min-h-[140px]"
                        onClick={handleFileUpload}
                      >
                        <FileSpreadsheet size={36} className="text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium text-center">Drag & Drop file Excel vào đây, hoặc click để chọn file</p>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" className="h-8 text-xs font-semibold shadow-sm text-vna-blue border-vna-blue hover:bg-vna-blue hover:text-white transition-colors">
                        <Upload size={14} className="mr-1.5" /> Download Excel Template
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Block 2.2 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm flex flex-col">
                  <div className="bg-white p-4 border-b border-gray-200">
                    <h4 className="font-bold text-gray-800">Block 2.2: Khai báo Sự cố Đình công (Airline D-1)</h4>
                  </div>
                  <div className="p-5 flex-1">
                    <div className="flex items-center gap-3 mb-5">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formRecord.hasStrike}
                          onChange={(e) => setFormRecord({ ...formRecord, hasStrike: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                      </label>
                      <span className="text-sm font-bold text-gray-700">Phát sinh sự cố đình công/ngừng việc trong năm?</span>
                    </div>

                    {formRecord.hasStrike && (
                      <div className="bg-white p-5 border border-red-200 rounded-md shadow-sm animate-in slide-in-from-top-4 space-y-4">
                        <div className="w-full">
                          <Input
                            label="Số vụ đình công"
                            type="number"
                            value={formRecord.strikeCount}
                            onChange={(e) => setFormRecord({ ...formRecord, strikeCount: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                          <textarea
                            className="w-full border border-gray-300 rounded-md p-3 text-sm min-h-[100px] focus:ring-1 focus:ring-vna-blue outline-none"
                            placeholder="Mô tả nguyên nhân, phòng ban liên quan và số ngày công bị mất..."
                            value={formRecord.strikeDescription}
                            onChange={(e) => setFormRecord({ ...formRecord, strikeDescription: e.target.value })}
                          ></textarea>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* KHU VỰC 3: THIẾT LẬP CẢNH BÁO */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
                <div className="flex items-center">
                  <Bell className="text-vna-blue mr-2" size={20} />
                  <h3 className="text-lg font-bold text-vna-blue uppercase tracking-wide">3. Thiết lập cảnh báo rủi ro (Alert Configuration)</h3>
                </div>
                <Button variant="outline" className="h-9 font-semibold text-sm py-0 px-4 flex items-center shadow-sm" onClick={handleAddAlertCondition}>
                  <Plus size={16} className="mr-1.5" /> Thêm điều kiện
                </Button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Left Column: Conditions */}
                <div className="xl:col-span-8 space-y-4">
                  {formRecord.alertConditions.map((cond, index) => (
                    <div key={cond.id} className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm relative group animate-in slide-in-from-top-2">
                      {formRecord.alertConditions.length > 1 && (
                        <button onClick={() => handleRemoveAlertCondition(cond.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-white p-1.5 rounded-md border border-gray-200 shadow-sm transition-colors z-10" title="Xóa điều kiện này">
                          <Trash2 size={16} />
                        </button>
                      )}
                      <h4 className="text-sm font-bold text-vna-blue mb-4">Điều kiện {index + 1}</h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Select
                          label="Trường dữ liệu"
                          options={[
                            { label: 'Số vụ Đình công', value: 'strike' },
                            { label: 'Số ca tử vong lao động', value: 'fatalities' },
                            { label: 'Điểm hài lòng chung', value: 'satisfaction' }
                          ]}
                          value={cond.field}
                          onChange={(val) => handleUpdateAlertCondition(cond.id, 'field', val)}
                        />
                        <Select
                          label="Toán tử"
                          options={[{ label: 'Lớn hơn (>)', value: '>' }, { label: 'Nhỏ hơn (<)', value: '<' }, { label: 'Bằng (=)', value: '=' }, { label: 'Trống', value: 'empty' }]}
                          value={cond.operator}
                          onChange={(val) => handleUpdateAlertCondition(cond.id, 'operator', val)}
                        />
                        <Input
                          label="Giá trị ngưỡng"
                          placeholder="VD: 0 hoặc < 3.0"
                          value={cond.value}
                          onChange={(e) => handleUpdateAlertCondition(cond.id, 'value', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">Nội dung cảnh báo</label>
                          <Input
                            placeholder='VD: "Cảnh báo: Phát hiện sự cố đình công..."'
                            value={cond.message}
                            onChange={(e) => handleUpdateAlertCondition(cond.id, 'message', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">Mức độ ưu tiên</label>
                          <div className="flex flex-col gap-2 p-2 bg-white rounded border border-gray-200 shadow-sm mt-1">
                            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name={`priority-${cond.id}`} checked={cond.priority === 'High'} onChange={() => handleUpdateAlertCondition(cond.id, 'priority', 'High')} className="text-red-500 focus:ring-red-500" /> <span className="text-red-600 font-bold text-xs">Cao (Đỏ)</span></label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name={`priority-${cond.id}`} checked={cond.priority === 'Medium'} onChange={() => handleUpdateAlertCondition(cond.id, 'priority', 'Medium')} className="text-amber-500 focus:ring-amber-500" /> <span className="text-amber-600 font-bold text-xs">Trung bình (Cam)</span></label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name={`priority-${cond.id}`} checked={cond.priority === 'Low'} onChange={() => handleUpdateAlertCondition(cond.id, 'priority', 'Low')} className="text-yellow-500 focus:ring-yellow-500" /> <span className="text-yellow-600 font-bold text-xs">Thấp (Vàng)</span></label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column: Global Alert Config (Channels & Assignees) */}
                <div className="xl:col-span-4 bg-blue-50/50 p-5 rounded-lg border border-blue-100 h-full shadow-inner">
                  <h4 className="text-sm font-bold text-gray-800 mb-4">Cấu hình gửi thông báo chung</h4>

                  <div className="flex flex-col gap-3 mb-6 bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                    <label className="flex items-center gap-3 text-sm cursor-pointer font-medium"><input type="checkbox" className="w-4 h-4 rounded text-vna-blue focus:ring-vna-blue" defaultChecked /> In-app Notification</label>
                    <label className="flex items-center gap-3 text-sm cursor-pointer font-medium"><input type="checkbox" className="w-4 h-4 rounded text-vna-blue focus:ring-vna-blue" defaultChecked /> Email Alert (Gửi khẩn cấp)</label>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-800">Người nhận (Assignees)</label>

                    {/* Multi-select search */}
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-vna-blue focus:ring-1 focus:ring-vna-blue"
                        placeholder="Tìm kiếm người nhận..."
                        value={assigneeSearch}
                        onChange={(e) => { setAssigneeSearch(e.target.value); setShowAssigneeDropdown(true); }}
                        onFocus={() => setShowAssigneeDropdown(true)}
                      />
                      {showAssigneeDropdown && assigneeSearch && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                          {filteredAssignees.length > 0 ? filteredAssignees.map(a => (
                            <div key={a} className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer" onClick={() => handleToggleAssignee(a)}>
                              {a}
                            </div>
                          )) : (
                            <div className="px-3 py-2 text-sm text-gray-500">Không tìm thấy kết quả.</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Chips / Tags display */}
                    <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-md bg-white min-h-[100px] shadow-sm">
                      {formRecord.assignees.map(a => (
                        <div key={a} className={`text-xs px-2.5 py-1.5 rounded-full flex justify-between items-center font-bold shadow-sm animate-in zoom-in-95 border ${getTagColor(a)}`}>
                          {a}
                          <X size={14} className="cursor-pointer opacity-70 hover:opacity-100 ml-2" onClick={() => handleRemoveAssignee(a)} />
                        </div>
                      ))}
                      {formRecord.assignees.length === 0 && (
                        <p className="text-xs text-gray-400 italic w-full text-center mt-6">Chưa có người nhận nào được chọn.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <div className="mt-8">
              <ApprovalLogTable logs={formRecord.logs} />
            </div>
          </div>

          {/* KHU VỰC 4: HÀNH ĐỘNG (FIXED BOTTOM ACTIONS) */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-6 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
            <Button variant="outline" onClick={() => setViewMode('LIST')} className="h-10 font-semibold min-w-[120px]">Hủy bỏ</Button>
            <QuickApprovalActions
              status={formRecord.status}
              recordId={formRecord.id}
              onApprove={(id) => openApprove(id, () => setViewMode('LIST'))}
              onReject={(id) => openReject(id, () => setViewMode('LIST'))}
              onSubmit={(id) => submitForApproval(id, () => setViewMode('LIST'))}
            />
            <Button variant="primary" onClick={handleSave} className="h-10 font-semibold shadow-md min-w-[180px] text-base"><Save size={18} className="mr-2" /> Lưu Cập nhật</Button>
          </div>

        </div>
      )}

      <ApprovalModalComponent />
    </div>
  );
};
