import React, { useState, useMemo } from 'react';
import { Button, Input, Select } from '../components/UI';
import { Plus, ArrowLeft, Save, Edit2, Copy, AlertTriangle, CheckCircle, Trash2, Calendar, Target, Activity, FileWarning, Bell, X, Search, UploadCloud } from 'lucide-react';
import { OpsKPIConfig } from '../components/OpsKPIConfig';
import { ApprovalStatusBadge, QuickApprovalActions, useApprovalWorkflow, ApprovalStatus, ApprovalLogTable, ApprovalLog } from '../components/ApprovalWorkflow';
import { UnifiedDataEntryForm } from '../components/UnifiedDataEntryForm';

// --- DATA STRUCTURES ---
interface MonthlyTarget {
  month: number;
  withdrawal: string;
  consumption: string;
}

interface Incident {
  id: string;
  month: string;
  description: string;
}

interface AlertCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  message: string;
  priority: string;
}

interface OpsServiceRecord {
  logs?: ApprovalLog[];
  id: string;
  year: string;
  status: ApprovalStatus;
  creator?: string;
  editor?: string;
  editTime?: string;

  // Area 1: Annual Targets
  waterWithdrawalTarget: string;
  waterConsumptionTarget: string;
  totalSuppliers: string;
  localSuppliers: string;
  npsTarget: string;

  // Area 2: Monthly Targets
  monthlyTargets: MonthlyTarget[];

  // Area 3: Incidents
  incidents416: Incident[];
  incidents417: Incident[];

  // Area 4: Alerts
  alertConditions: AlertCondition[];
  assignees: string[];
}

const DEFAULT_MONTHLY = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  withdrawal: '',
  consumption: ''
}));

const AVAILABLE_ASSIGNEES = [
  'Quản lý Nước - Anh Đông Hải',
  'Quản lý NPS - Chị Thái Hương',
  'Quản lý NCC - Chị Hồng Vân',
  'Quản lý NCC - Chị Quỳnh Trang',
  'Quản lý Sự cố - Chị Thu Hiền',
  'Quản lý Sự cố - Chị Anh Trà'
];

const MOCK_RECORDS: OpsServiceRecord[] = [
  {
    id: 'SVC-2026',
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
    waterWithdrawalTarget: '120000',
    waterConsumptionTarget: '115000',
    totalSuppliers: '500',
    localSuppliers: '150',
    npsTarget: '45',
    monthlyTargets: DEFAULT_MONTHLY.map(m => ({ ...m, withdrawal: '10000', consumption: '9500' })),
    incidents416: [],
    incidents417: [
      { id: '1', month: '03', description: 'Ghi nhận lỗi in nhãn trên 500 suất ăn tại ga đi quốc nội.' }
    ],
    alertConditions: [
      { id: '1', field: 'nps', operator: '<', value: '40', priority: 'High', message: 'Cảnh báo: Điểm NPS thực tế thấp hơn mục tiêu. Yêu cầu kiểm tra!' },
      { id: '2', field: 'incident', operator: '>', value: '0', priority: 'High', message: 'Cảnh báo: Có vụ việc phân biệt đối xử chưa được xử lý xong trong tháng.' }
    ],
    assignees: ['Quản lý Nước - Anh Đông Hải', 'Quản lý NPS - Chị Thái Hương']
  }
];

export const OpsServicePage: React.FC<{ onImportExcel?: () => void }> = ({ onImportExcel }) => {
  const [mainTab, setMainTab] = useState<'INFO' | 'INDICATORS'>('INFO');
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [records, setRecords] = useState<OpsServiceRecord[]>(MOCK_RECORDS);
  const [formRecord, setFormRecord] = useState<OpsServiceRecord | null>(null);

  const { openApprove, openReject, submitForApproval, ApprovalModalComponent } = useApprovalWorkflow(
    records,
    setRecords
  );

  // Assignee dropdown state
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');

  const handleAddNew = () => {
    const today = new Date();
    setFormRecord({
      id: `SVC-${today.getFullYear()}`,
      year: today.getFullYear().toString(),
      status: 'Inactive',
      creator: 'Nguyễn Văn A',
      editor: 'Nguyễn Văn A',
      editTime: '',
      waterWithdrawalTarget: '',
      waterConsumptionTarget: '',
      totalSuppliers: '',
      localSuppliers: '',
      npsTarget: '',
      monthlyTargets: JSON.parse(JSON.stringify(DEFAULT_MONTHLY)),
      incidents416: [],
      incidents417: [],
      alertConditions: [{ id: Date.now().toString(), field: 'incident', operator: '>', value: '0', priority: 'Medium', message: '' }],
      assignees: []
    });
    setViewMode('DETAIL');
  };

  const handleEdit = (item: OpsServiceRecord) => {
    setFormRecord({ ...item });
    setViewMode('DETAIL');
  };

  const handleSave = () => {
    if (!formRecord) return;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const recordToSave: OpsServiceRecord = {
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
    alert("Đã lưu Kế hoạch Năm thành công!");
  };

  // Calculate local supplier ratio
  const supplierRatio = useMemo(() => {
    if (!formRecord || !formRecord.totalSuppliers || !formRecord.localSuppliers) return '0%';
    const total = parseFloat(formRecord.totalSuppliers);
    const local = parseFloat(formRecord.localSuppliers);
    if (total === 0) return '0%';
    return ((local / total) * 100).toFixed(1) + '%';
  }, [formRecord?.totalSuppliers, formRecord?.localSuppliers]);

  const updateMonthly = (index: number, field: 'withdrawal' | 'consumption', value: string) => {
    if (!formRecord) return;
    const newMonthly = [...formRecord.monthlyTargets];
    newMonthly[index][field] = value;
    setFormRecord({ ...formRecord, monthlyTargets: newMonthly });
  };

  const copyToConsumption = (index: number) => {
    if (!formRecord) return;
    const newMonthly = [...formRecord.monthlyTargets];
    newMonthly[index].consumption = newMonthly[index].withdrawal;
    setFormRecord({ ...formRecord, monthlyTargets: newMonthly });
  };

  const addIncident = (type: '416' | '417') => {
    if (!formRecord) return;
    const newIncident = { id: Date.now().toString(), month: '01', description: '' };
    if (type === '416') {
      setFormRecord({ ...formRecord, incidents416: [...formRecord.incidents416, newIncident] });
    } else {
      setFormRecord({ ...formRecord, incidents417: [...formRecord.incidents417, newIncident] });
    }
  };

  const removeIncident = (type: '416' | '417', id: string) => {
    if (!formRecord) return;
    if (type === '416') {
      setFormRecord({ ...formRecord, incidents416: formRecord.incidents416.filter(i => i.id !== id) });
    } else {
      setFormRecord({ ...formRecord, incidents417: formRecord.incidents417.filter(i => i.id !== id) });
    }
  };

  const updateIncident = (type: '416' | '417', id: string, field: 'month' | 'description', value: string) => {
    if (!formRecord) return;
    if (type === '416') {
      setFormRecord({ ...formRecord, incidents416: formRecord.incidents416.map(i => i.id === id ? { ...i, [field]: value } : i) });
    } else {
      setFormRecord({ ...formRecord, incidents417: formRecord.incidents417.map(i => i.id === id ? { ...i, [field]: value } : i) });
    }
  };

  const handleAddAlertCondition = () => {
    if (!formRecord) return;
    setFormRecord({
      ...formRecord,
      alertConditions: [...formRecord.alertConditions, { id: Date.now().toString(), field: 'incident', operator: '>', value: '', priority: 'Medium', message: '' }]
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue tracking-tight">Nghiệp vụ Ban Dịch vụ Hành khách</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý an toàn sản phẩm, trải nghiệm khách hàng và chuỗi cung ứng</p>
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
          <OpsKPIConfig department="Ban Dịch vụ Hành khách" />
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
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">KH Cấp nước (ML)</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">KH Tiêu thụ (ML)</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Mục tiêu NPS</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Người lập</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Người chỉnh sửa</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Thời gian chỉnh sửa</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="py-3 px-4 font-bold text-vna-blue">{record.id}</td>
                    <td className="py-3 px-4">Năm {record.year}</td>
                    <td className="py-3 px-4 font-semibold font-mono">{record.waterWithdrawalTarget || '-'} ML</td>
                    <td className="py-3 px-4 font-semibold font-mono">{record.waterConsumptionTarget || '-'} ML</td>
                    <td className="py-3 px-4 font-semibold font-mono">{record.npsTarget || '-'}</td>
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
                ))}
                {records.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-500">Chưa có dữ liệu.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mainTab === 'INFO' && viewMode === 'DETAIL' && formRecord && (
        <UnifiedDataEntryForm
          department="Tổ Dịch vụ"
          effectivePeriod={formRecord.effectivePeriod}
          onBack={() => setViewMode('LIST')}
          onSave={handleSave}
          isNewPeriod={formRecord.editTime === ''}
        />
      )}
      {false && mainTab === 'INFO' && viewMode === 'DETAIL' && formRecord && (
        <div className="bg-gray-50 flex flex-col h-[calc(100vh-120px)] -m-6 animate-in slide-in-from-right-4 duration-300 relative">
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { height: 10px; width: 10px; }
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
                <h2 className="text-xl font-bold text-vna-blue">Chi tiết báo cáo DVHK: Năm {formRecord.year}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <ApprovalStatusBadge status={formRecord.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Body Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32">

            {/* THAM SỐ ĐỊNH DANH (GLOBAL FILTER) */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-vna-blue" size={20} />
                <h3 className="text-base font-bold text-vna-blue uppercase tracking-wide">Tham số định danh (Global Filter)</h3>
              </div>
              <div className="w-full md:w-1/3">
                <Select
                  label="Năm thiết lập (Reporting Year)"
                  options={[
                    { label: '2024', value: '2024' },
                    { label: '2025', value: '2025' },
                    { label: '2026', value: '2026' },
                    { label: '2027', value: '2027' }
                  ]}
                  value={formRecord.year}
                  onChange={(val) => setFormRecord({ ...formRecord, year: val, id: `SVC-${val}` })}
                />
              </div>
            </section>

            {/* KHU VỰC 1: THIẾT LẬP MỤC TIÊU NĂM */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
              <div className="flex items-center mb-6 border-b border-gray-100 pb-3">
                <Target className="text-vna-blue mr-2" size={20} />
                <h3 className="text-lg font-bold text-vna-blue uppercase tracking-wide">1. Thiết lập Mục tiêu Năm (Annual Targets)</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột 1 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <h4 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center"><Activity size={16} className="mr-2 text-vna-blue" /> Mục tiêu Nước (GRI 303)</h4>
                  <div className="space-y-4">
                    <Input
                      label="Tổng Nước cấp lên cả năm (ML)"
                      type="number"
                      value={formRecord.waterWithdrawalTarget}
                      onChange={(e) => setFormRecord({ ...formRecord, waterWithdrawalTarget: e.target.value })}
                    />
                    <Input
                      label="Tổng Nước tiêu thụ cả năm (ML)"
                      type="number"
                      value={formRecord.waterConsumptionTarget}
                      onChange={(e) => setFormRecord({ ...formRecord, waterConsumptionTarget: e.target.value })}
                    />
                  </div>
                </div>
                {/* Cột 2 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <h4 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center"><Activity size={16} className="mr-2 text-vna-blue" /> Chuỗi cung ứng (GRI 204-1)</h4>
                  <div className="space-y-4">
                    <Input
                      label="Tổng số Nhà cung cấp mục tiêu"
                      type="number"
                      value={formRecord.totalSuppliers}
                      onChange={(e) => setFormRecord({ ...formRecord, totalSuppliers: e.target.value })}
                    />
                    <Input
                      label="Số lượng NCC địa phương mục tiêu"
                      type="number"
                      value={formRecord.localSuppliers}
                      onChange={(e) => setFormRecord({ ...formRecord, localSuppliers: e.target.value })}
                    />
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Tỷ lệ NCC địa phương mục tiêu (%)</label>
                      <input type="text" readOnly value={supplierRatio} className="w-full border border-gray-300 rounded-md p-2 bg-blue-50 text-vna-blue font-bold text-center" />
                    </div>
                  </div>
                </div>
                {/* Cột 3 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <h4 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center"><Activity size={16} className="mr-2 text-vna-blue" /> Trải nghiệm Khách hàng (B-1)</h4>
                  <div className="space-y-4">
                    <Input
                      label="Mục tiêu điểm NPS Năm"
                      type="number"
                      value={formRecord.npsTarget}
                      onChange={(e) => setFormRecord({ ...formRecord, npsTarget: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* KHU VỰC 2: THIẾT LẬP MỤC TIÊU THEO THÁNG */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
              <div className="flex items-center mb-6 border-b border-gray-100 pb-3">
                <Calendar className="text-vna-blue mr-2" size={20} />
                <h3 className="text-lg font-bold text-vna-blue uppercase tracking-wide">2. Thiết lập Mục tiêu Nước theo tháng (Monthly Targets)</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4 italic">Phân bổ hạn mức nước theo từng tháng trong Năm để theo dõi hiệu suất định kỳ.</p>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="py-3 px-4 font-bold text-sm text-gray-700 w-1/4">Tháng</th>
                      <th className="py-3 px-4 font-bold text-sm text-gray-700 w-1/3">Mục tiêu Nước cấp lên (ML)</th>
                      <th className="py-3 px-4 font-bold text-sm text-gray-700 w-1/3">Mục tiêu Nước tiêu thụ (ML)</th>
                      <th className="py-3 px-4 font-bold text-sm text-gray-700 text-center w-[100px]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {formRecord.monthlyTargets.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-2.5 px-4 font-semibold text-gray-700 border-r border-gray-100">Tháng {row.month}</td>
                        <td className="py-2.5 px-4 border-r border-gray-100">
                          <input type="number" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-vna-blue focus:border-vna-blue outline-none" placeholder="Nhập số..." value={row.withdrawal} onChange={(e) => updateMonthly(index, 'withdrawal', e.target.value)} />
                        </td>
                        <td className="py-2.5 px-4 border-r border-gray-100">
                          <input type="number" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-vna-blue focus:border-vna-blue outline-none" placeholder="Nhập số..." value={row.consumption} onChange={(e) => updateMonthly(index, 'consumption', e.target.value)} />
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            title="Sao chép từ Nước cấp lên sang Nước tiêu thụ"
                            onClick={() => copyToConsumption(index)}
                            className="p-1.5 text-gray-500 hover:text-vna-blue hover:bg-blue-50 rounded transition-colors border border-transparent hover:border-blue-200"
                          >
                            <Copy size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* KHU VỰC 3: GHI NHẬN SỰ CỐ TRONG NĂM */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
              <div className="flex items-center mb-6 border-b border-gray-100 pb-3">
                <FileWarning className="text-vna-blue mr-2" size={20} />
                <h3 className="text-lg font-bold text-vna-blue uppercase tracking-wide">3. Ghi nhận sự cố trong năm (Incident Reporting)</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Khối 416-2 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm">
                  <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                    <h4 className="font-bold text-gray-800">GRI 416-2: Sự cố An toàn Sức khỏe</h4>
                    <Button variant="outline" className="h-8 text-xs py-0" onClick={() => addIncident('416')}>+ Thêm sự cố</Button>
                  </div>
                  <div className="p-4">
                    {formRecord.incidents416.length === 0 ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 flex items-center text-emerald-700 shadow-sm">
                        <CheckCircle size={20} className="mr-3 shrink-0" />
                        <span className="font-semibold text-sm">Không có sự cố nào trong năm</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 flex items-center text-orange-700 mb-4 shadow-sm">
                          <AlertTriangle size={20} className="mr-3 shrink-0" />
                          <span className="font-bold text-sm">Phát hiện {formRecord.incidents416.length} sự cố</span>
                        </div>
                        {formRecord.incidents416.map((inc, i) => (
                          <div key={inc.id} className="bg-white p-4 rounded border border-gray-200 relative shadow-sm hover:border-vna-blue transition-colors">
                            <button onClick={() => removeIncident('416', inc.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded p-1"><Trash2 size={16} /></button>
                            <div className="mb-3 w-1/2">
                              <Select
                                label={`Sự cố ${i + 1}: Tháng xảy ra`}
                                options={DEFAULT_MONTHLY.map(m => ({ label: `Tháng ${m.month}`, value: String(m.month).padStart(2, '0') }))}
                                value={inc.month}
                                onChange={(val) => updateIncident('416', inc.id, 'month', val)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung chi tiết & Biện pháp khắc phục</label>
                              <textarea
                                className="w-full border border-gray-300 rounded-md p-2 text-sm min-h-[80px] focus:ring-1 focus:ring-vna-blue outline-none"
                                placeholder="Mô tả sự cố..."
                                value={inc.description}
                                onChange={(e) => updateIncident('416', inc.id, 'description', e.target.value)}
                              ></textarea>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Khối 417-2 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm">
                  <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                    <h4 className="font-bold text-gray-800">GRI 417-2: Sự cố Thông tin Nhãn mác</h4>
                    <Button variant="outline" className="h-8 text-xs py-0" onClick={() => addIncident('417')}>+ Thêm sự cố</Button>
                  </div>
                  <div className="p-4">
                    {formRecord.incidents417.length === 0 ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 flex items-center text-emerald-700 shadow-sm">
                        <CheckCircle size={20} className="mr-3 shrink-0" />
                        <span className="font-semibold text-sm">Không có sự cố nào trong năm</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 flex items-center text-orange-700 mb-4 shadow-sm">
                          <AlertTriangle size={20} className="mr-3 shrink-0" />
                          <span className="font-bold text-sm">Phát hiện {formRecord.incidents417.length} sự cố</span>
                        </div>
                        {formRecord.incidents417.map((inc, i) => (
                          <div key={inc.id} className="bg-white p-4 rounded border border-gray-200 relative shadow-sm hover:border-vna-blue transition-colors">
                            <button onClick={() => removeIncident('417', inc.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded p-1"><Trash2 size={16} /></button>
                            <div className="mb-3 w-1/2">
                              <Select
                                label={`Sự cố ${i + 1}: Tháng xảy ra`}
                                options={DEFAULT_MONTHLY.map(m => ({ label: `Tháng ${m.month}`, value: String(m.month).padStart(2, '0') }))}
                                value={inc.month}
                                onChange={(val) => updateIncident('417', inc.id, 'month', val)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung chi tiết & Biện pháp khắc phục</label>
                              <textarea
                                className="w-full border border-gray-300 rounded-md p-2 text-sm min-h-[80px] focus:ring-1 focus:ring-vna-blue outline-none"
                                placeholder="Mô tả sự cố..."
                                value={inc.description}
                                onChange={(e) => updateIncident('417', inc.id, 'description', e.target.value)}
                              ></textarea>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* KHU VỰC 4: THIẾT LẬP CẢNH BÁO */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
                <div className="flex items-center">
                  <Bell className="text-vna-blue mr-2" size={20} />
                  <h3 className="text-lg font-bold text-vna-blue uppercase tracking-wide">4. Thiết lập cảnh báo (Alert Configuration)</h3>
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
                            { label: 'Số vụ việc chưa xử lý xong', value: 'incident' },
                            { label: 'Nước tiêu thụ thực tế (ML)', value: 'water_consumption' },
                            { label: 'Điểm NPS thực tế', value: 'nps' }
                          ]}
                          value={cond.field}
                          onChange={(val) => handleUpdateAlertCondition(cond.id, 'field', val)}
                        />
                        <Select
                          label="Toán tử"
                          options={[{ label: 'Lớn hơn (>)', value: '>' }, { label: 'Nhỏ hơn (<)', value: '<' }, { label: 'Bằng (=)', value: '=' }]}
                          value={cond.operator}
                          onChange={(val) => handleUpdateAlertCondition(cond.id, 'operator', val)}
                        />
                        <Input
                          label="Giá trị ngưỡng"
                          placeholder="VD: 0 hoặc < Mục tiêu"
                          value={cond.value}
                          onChange={(e) => handleUpdateAlertCondition(cond.id, 'value', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">Nội dung cảnh báo</label>
                          <Input
                            placeholder='VD: "Cảnh báo: Có vụ việc phân biệt đối xử..."'
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
                    <label className="flex items-center gap-3 text-sm cursor-pointer font-medium"><input type="checkbox" className="w-4 h-4 rounded text-vna-blue focus:ring-vna-blue" defaultChecked /> Email Alert</label>
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
                        <div key={a} className="bg-blue-100 text-vna-blue border border-blue-200 text-xs px-2.5 py-1.5 rounded-full flex justify-between items-center font-bold shadow-sm animate-in zoom-in-95">
                          {a}
                          <X size={14} className="cursor-pointer hover:text-red-500 ml-2" onClick={() => handleRemoveAssignee(a)} />
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

          {/* KHU VỰC 5: HÀNH ĐỘNG (FIXED BOTTOM ACTIONS) */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-6 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
            <Button variant="outline" onClick={() => setViewMode('LIST')} className="h-10 font-semibold min-w-[120px]">Hủy bỏ</Button>
            <QuickApprovalActions
              status={formRecord.status}
              recordId={formRecord.id}
              onApprove={(id) => openApprove(id, () => setViewMode('LIST'))}
              onReject={(id) => openReject(id, () => setViewMode('LIST'))}
              onSubmit={(id) => submitForApproval(id, () => setViewMode('LIST'))}
            />
            <Button variant="primary" onClick={handleSave} className="h-10 font-semibold shadow-md min-w-[180px] text-base"><Save size={18} className="mr-2" /> Lưu Kế hoạch Năm</Button>
          </div>

        </div>
      )}

      <ApprovalModalComponent />
    </div>
  );
};
