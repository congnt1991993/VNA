import React, { useState, useMemo } from 'react';
import { Button, Input, Select } from '../components/UI';
import { Plus, ArrowLeft, Save, Edit2, ShieldAlert, AlertTriangle, Info, Bell, X, Search, Lock, Shield, AlertOctagon, Calendar, Activity, UploadCloud } from 'lucide-react';
import { OpsKPIConfig } from '../components/OpsKPIConfig';
import { ApprovalStatusBadge, QuickApprovalActions, useApprovalWorkflow, ApprovalStatus, ApprovalLogTable, ApprovalLog } from '../components/ApprovalWorkflow';
import { UnifiedDataEntryForm } from '../components/UnifiedDataEntryForm';

// --- DATA STRUCTURES ---
interface OpsDigitalRecord {
  logs?: ApprovalLog[];
  id: string;
  year: string;
  status: ApprovalStatus;
  creator?: string;
  editor?: string;
  editTime?: string;

  // Data Entry
  privacyBreaches: string;
  dataLosses: string;

  // Alerts (Since it's zero tolerance, we just need one critical alert config per record)
  alertField: string;
  alertOperator: string;
  alertValue: string;
  alertInApp: boolean;
  alertEmail: boolean;
  alertAssignees: string[];
  alertMessage: string;
}

const AVAILABLE_ASSIGNEES = [
  'Ban Giám đốc (BOD)',
  'Trưởng ban CĐSCN - Lê Khắc Trung',
  'Chuyên viên Bảo mật - Phạm Hoàng Nam',
  'Ban Truyền thông (PR) - Lê Tố Loan'
];

const MOCK_RECORDS: OpsDigitalRecord[] = [
  {
    id: 'DIGITAL-2026',
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
    privacyBreaches: '0',
    dataLosses: '0',
    alertField: 'total_complaints',
    alertOperator: '>',
    alertValue: '0',
    alertInApp: true,
    alertEmail: true,
    alertAssignees: ['Ban Giám đốc (BOD)', 'Trưởng ban CĐSCN - Lê Khắc Trung', 'Ban Truyền thông (PR) - Lê Tố Loan'],
    alertMessage: 'Cảnh báo khẩn cấp: Hệ thống ghi nhận phát sinh rò rỉ dữ liệu hoặc vi phạm quyền riêng tư của khách hàng. Yêu cầu Ban CĐSCN và các đơn vị rà soát, kích hoạt quy trình ứng phó ngay lập tức!'
  }
];

export const OpsDigitalPage: React.FC<{ onImportExcel?: () => void }> = ({ onImportExcel }) => {
  const [mainTab, setMainTab] = useState<'INFO' | 'INDICATORS'>('INFO');
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [records, setRecords] = useState<OpsDigitalRecord[]>(MOCK_RECORDS);
  const [formRecord, setFormRecord] = useState<OpsDigitalRecord | null>(null);

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
      id: `DIGITAL-${today.getFullYear()}`,
      year: today.getFullYear().toString(),
      status: 'Inactive',
      creator: 'Nguyễn Văn A',
      editor: 'Nguyễn Văn A',
      editTime: '',
      privacyBreaches: '0',
      dataLosses: '0',
      alertField: 'total_complaints',
      alertOperator: '>',
      alertValue: '0',
      alertInApp: true,
      alertEmail: true,
      alertAssignees: ['Ban Giám đốc (BOD)', 'Trưởng ban CĐSCN - Lê Khắc Trung'],
      alertMessage: 'Cảnh báo khẩn cấp: Hệ thống ghi nhận phát sinh rò rỉ dữ liệu hoặc vi phạm quyền riêng tư của khách hàng. Yêu cầu Ban CĐSCN và các đơn vị rà soát, kích hoạt quy trình ứng phó ngay lập tức!'
    });
    setViewMode('DETAIL');
  };

  const handleEdit = (item: OpsDigitalRecord) => {
    setFormRecord({ ...item });
    setViewMode('DETAIL');
  };

  const handleSave = () => {
    if (!formRecord) return;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const recordToSave: OpsDigitalRecord = {
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

  const handleToggleAssignee = (assignee: string) => {
    if (!formRecord) return;
    let newAssignees = [...formRecord.alertAssignees];
    if (newAssignees.includes(assignee)) {
      newAssignees = newAssignees.filter(a => a !== assignee);
    } else {
      newAssignees.push(assignee);
    }
    setFormRecord({ ...formRecord, alertAssignees: newAssignees });
    setAssigneeSearch('');
  };

  const handleRemoveAssignee = (assignee: string) => {
    if (!formRecord) return;
    setFormRecord({ ...formRecord, alertAssignees: formRecord.alertAssignees.filter(a => a !== assignee) });
  };

  const filteredAssignees = AVAILABLE_ASSIGNEES.filter(a => a.toLowerCase().includes(assigneeSearch.toLowerCase()));

  const getTagColor = (tag: string) => {
    if (tag.includes('BOD')) return 'bg-red-100 text-red-800 border-red-300 font-bold';
    if (tag.includes('PR')) return 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
    return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
  };

  // Calculations for read-only inputs
  const pBreachesNum = parseInt(formRecord?.privacyBreaches || '0') || 0;
  const dLossesNum = parseInt(formRecord?.dataLosses || '0') || 0;
  const totalComplaints = pBreachesNum + dLossesNum;

  const isRedAlert = totalComplaints > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue tracking-tight">Nghiệp vụ Ban CNTT & CĐS</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý bảo mật thông tin, bảo vệ dữ liệu và chuyển đổi số</p>
        </div>
        {mainTab === 'INFO' && viewMode === 'LIST' && (
          <div className="flex gap-2">
            {onImportExcel && (
              <Button variant="outline" onClick={onImportExcel} className="cursor-pointer flex items-center gap-1.5 border-vna-blue text-vna-blue hover:bg-blue-50/50">
                <UploadCloud size={16} /> Import Excel
              </Button>
            )}
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
          <OpsKPIConfig department="Ban CNTT" />
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
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700 text-center">Khiếu nại riêng tư</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700 text-center">Sự cố mất dữ liệu</th>
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
                    <td className="py-3 px-4 text-center font-medium">{record.privacyBreaches}</td>
                    <td className="py-3 px-4 text-center font-medium">{record.dataLosses}</td>
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
                  <tr><td colSpan={6} className="py-8 text-center text-gray-500">Chưa có dữ liệu.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mainTab === 'INFO' && viewMode === 'DETAIL' && formRecord && (
        <UnifiedDataEntryForm
          department="Ban Chuyển đổi số & CNTT"
          effectivePeriod={formRecord.year}
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
                <h2 className="text-xl font-bold text-vna-blue">Chi tiết báo cáo Bảo mật: Năm {formRecord.year}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${formRecord.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {formRecord.status === 'Active' ? 'Hiệu lực' : 'Bản Nháp'}
                  </span>
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
                  onChange={(val) => setFormRecord({ ...formRecord, year: val, id: `DIGITAL-${val}` })}
                />
              </div>
            </section>

            {/* KHU VỰC 1: KHAI BÁO SỰ CỐ */}
            <section className={`p-6 rounded-xl border shadow-sm transition-all duration-500 ${isRedAlert ? 'bg-red-50/30 border-red-200' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center mb-6 border-b border-gray-100 pb-3">
                <ShieldAlert className={`${isRedAlert ? 'text-red-600 animate-pulse' : 'text-vna-blue'} mr-2`} size={24} />
                <h3 className={`text-lg font-bold uppercase tracking-wide ${isRedAlert ? 'text-red-700' : 'text-vna-blue'}`}>
                  1. Khai báo sự cố & Theo dõi rủi ro
                </h3>
              </div>

              <div className="max-w-3xl mx-auto">
                {/* Block 1.1: Khai báo sự cố */}
                <div className="w-full flex flex-col gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                    {/* Red Warning Overlay if > 0 */}
                    {isRedAlert && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}

                    <h4 className="font-bold text-gray-800 mb-5 flex items-center border-b border-gray-100 pb-3">
                      <Lock size={18} className="mr-2 text-gray-500" />
                      Khai báo sự cố bảo mật (GRI 418-1)
                    </h4>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Số vụ vi phạm quyền riêng tư (Privacy breaches)</label>
                        <input
                          type="number" min="0" step="1"
                          className={`w-full border rounded-md p-3 text-lg font-bold transition-colors outline-none focus:ring-2 ${pBreachesNum > 0 ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-200' : 'border-gray-300 focus:ring-vna-blue/20 focus:border-vna-blue'}`}
                          value={formRecord.privacyBreaches}
                          onChange={(e) => setFormRecord({ ...formRecord, privacyBreaches: e.target.value.replace(/\D/g, '') })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Số vụ mất dữ liệu (Data losses)</label>
                        <input
                          type="number" min="0" step="1"
                          className={`w-full border rounded-md p-3 text-lg font-bold transition-colors outline-none focus:ring-2 ${dLossesNum > 0 ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-200' : 'border-gray-300 focus:ring-vna-blue/20 focus:border-vna-blue'}`}
                          value={formRecord.dataLosses}
                          onChange={(e) => setFormRecord({ ...formRecord, dataLosses: e.target.value.replace(/\D/g, '') })}
                        />
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center mb-1">
                          <label className="text-sm font-bold text-gray-800 mr-1">Tổng số khiếu nại / sự cố</label>
                          <div className="group relative cursor-help">
                            <Info size={14} className="text-gray-400" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                              Hệ thống tự động cộng tổng: Số vụ vi phạm + Số vụ mất dữ liệu
                            </div>
                          </div>
                        </div>
                        <input
                          type="text"
                          readOnly
                          className={`w-full border rounded-md p-3 text-xl font-black text-center cursor-not-allowed ${totalComplaints > 0 ? 'bg-red-600 text-white border-red-700 shadow-inner' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                          value={totalComplaints.toString()}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* KHU VỰC 2: THIẾT LẬP CẢNH BÁO KHẨN CẤP */}
            <section className="bg-white p-6 rounded-xl border border-red-200 shadow-[0_4px_15px_-3px_rgba(239,68,68,0.1)] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-0"></div>

              <div className="flex items-center mb-6 border-b border-gray-100 pb-3 relative z-10">
                <AlertOctagon className="text-red-600 mr-2" size={24} />
                <h3 className="text-lg font-bold text-red-700 uppercase tracking-wide">2. Thiết lập cảnh báo khẩn cấp (Critical Alert Config)</h3>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative z-10">
                {/* Left Column: Conditions */}
                <div className="xl:col-span-7 bg-red-50/50 p-5 rounded-lg border border-red-100 shadow-sm">
                  <p className="text-xs text-red-600 mb-4 font-medium flex items-center"><AlertTriangle size={14} className="mr-1" /> Kích hoạt khi có rò rỉ dữ liệu (Zero Tolerance Policy)</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Select
                      label="Trường dữ liệu"
                      options={[
                        { label: 'Tổng số khiếu nại', value: 'total_complaints' },
                        { label: 'Số vụ vi phạm', value: 'privacy_breaches' }
                      ]}
                      value={formRecord.alertField}
                      onChange={(val) => setFormRecord({ ...formRecord, alertField: val })}
                    />
                    <Select
                      label="Toán tử"
                      options={[{ label: 'Lớn hơn (>)', value: '>' }]}
                      value={formRecord.alertOperator}
                      onChange={(val) => setFormRecord({ ...formRecord, alertOperator: val })}
                    />
                    <Input
                      label="Giá trị ngưỡng"
                      value={formRecord.alertValue}
                      onChange={(e) => setFormRecord({ ...formRecord, alertValue: e.target.value })}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Nội dung cảnh báo</label>
                    <textarea
                      className="w-full border border-red-300 rounded-md p-3 text-sm focus:ring-1 focus:ring-red-500 outline-none text-red-900 bg-white"
                      rows={3}
                      value={formRecord.alertMessage}
                      onChange={(e) => setFormRecord({ ...formRecord, alertMessage: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                {/* Right Column: Global Alert Config (Channels & Assignees) */}
                <div className="xl:col-span-5 h-full flex flex-col gap-5">

                  <div className="flex flex-col gap-3 bg-white p-4 rounded-lg border border-red-200 shadow-sm">
                    <label className="text-sm font-bold text-gray-800">Kênh thông báo & Mức độ</label>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center gap-2 text-sm cursor-pointer font-bold text-red-600"><input type="checkbox" className="w-4 h-4 rounded text-red-600 focus:ring-red-600 border-red-300 bg-red-50" checked={formRecord.alertInApp} onChange={(e) => setFormRecord({ ...formRecord, alertInApp: e.target.checked })} /> In-app</label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer font-bold text-red-600"><input type="checkbox" className="w-4 h-4 rounded text-red-600 focus:ring-red-600 border-red-300 bg-red-50" checked={formRecord.alertEmail} onChange={(e) => setFormRecord({ ...formRecord, alertEmail: e.target.checked })} /> Email Khẩn cấp</label>
                    </div>

                    <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded flex items-center">
                      <input type="radio" checked readOnly className="text-red-600 w-4 h-4 mr-2" />
                      <span className="font-black text-red-700 text-sm uppercase tracking-wider">Cao nhất / Critical</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1">
                    <label className="block text-sm font-bold text-gray-800 mb-2">Người nhận (Assignees)</label>

                    <div className="relative mb-3">
                      <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                        placeholder="Tìm kiếm người nhận khẩn cấp..."
                        value={assigneeSearch}
                        onChange={(e) => { setAssigneeSearch(e.target.value); setShowAssigneeDropdown(true); }}
                        onFocus={() => setShowAssigneeDropdown(true)}
                      />
                      {showAssigneeDropdown && assigneeSearch && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-40 overflow-y-auto">
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

                    <div className="flex flex-wrap gap-2">
                      {formRecord.alertAssignees.map(a => (
                        <div key={a} className={`text-[11px] px-2.5 py-1.5 rounded-full flex justify-between items-center shadow-sm animate-in zoom-in-95 border ${getTagColor(a)}`}>
                          {a}
                          <X size={14} className="cursor-pointer opacity-70 hover:opacity-100 ml-1.5" onClick={() => handleRemoveAssignee(a)} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <div className="mt-8">
              <ApprovalLogTable logs={formRecord.logs} />
            </div>
          </div>

          {/* KHU VỰC 3: HÀNH ĐỘNG (FIXED BOTTOM ACTIONS) */}
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
