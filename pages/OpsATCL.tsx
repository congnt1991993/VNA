import React, { useState, useMemo } from 'react';
import { Button } from '../components/UI';
import { Plus, ArrowLeft, Edit2, AlertTriangle, FileText, UploadCloud, Database, Inbox, Send, X, Activity, ShieldAlert } from 'lucide-react';
import { OpsKPIConfig } from '../components/OpsKPIConfig';
import { ApprovalStatusBadge, QuickApprovalActions, useApprovalWorkflow, ApprovalStatus, ApprovalLogTable, ApprovalLog } from '../components/ApprovalWorkflow';
import { UnifiedDataEntryForm } from '../components/UnifiedDataEntryForm';

interface Incident {
  id: string;
  date: string;
  title: string;
  status: 'Open' | 'Investigating' | 'Closed';
}

interface OpsATCLRecord {
  logs?: ApprovalLog[];
  id: string;
  year: string;
  status: ApprovalStatus;
  creator?: string;
  editor?: string;
  editTime?: string;
  noiseLevel: string;
  ghgEmissions: string;
  incidents: Incident[];
}

const MOCK_RECORDS: OpsATCLRecord[] = [
  {
    id: 'FLT-2026',
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
    noiseLevel: '85',
    ghgEmissions: '1250000',
    incidents: [
      { id: '1', date: '15/03/2026', title: 'Phát hiện rò rỉ dầu thủy lực tại bãi đỗ', status: 'Closed' }
    ]
  }
];

export const OpsATCLPage: React.FC<{ onImportExcel?: () => void }> = ({ onImportExcel }) => {
  const [mainTab, setMainTab] = useState<'INFO' | 'INDICATORS' | 'INBOX'>('INFO');
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [records, setRecords] = useState<OpsATCLRecord[]>(MOCK_RECORDS);
  const [formRecord, setFormRecord] = useState<OpsATCLRecord | null>(null);
  const [showInboxModal, setShowInboxModal] = useState<'REPORT' | 'PLAN' | 'VOLUNTEER' | null>(null);

  const { openApprove, openReject, submitForApproval, ApprovalModalComponent } = useApprovalWorkflow(
    records,
    setRecords
  );

  const handleSave = () => {
    if (formRecord) {
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const recordToSave: OpsATCLRecord = {
        ...formRecord,
        creator: formRecord.creator || 'Nguyễn Văn A',
        editor: 'Nguyễn Văn A',
        editTime: formattedDate
      };

      setRecords(records.map(r => r.id === formRecord.id ? recordToSave : r));
      alert('Đã lưu dữ liệu thành công!');
      setViewMode('LIST');
    }
  };

  const handleAddNew = () => {
    const today = new Date();
    setFormRecord({
      id: `FLT-${today.getFullYear()}`,
      year: today.getFullYear().toString(),
      status: 'Inactive',
      creator: 'Nguyễn Văn A',
      editor: 'Nguyễn Văn A',
      editTime: '',
      noiseLevel: '',
      ghgEmissions: '',
      incidents: []
    });
    setViewMode('DETAIL');
  };

  const handleEdit = (item: OpsATCLRecord) => {
    setFormRecord({ ...item });
    setViewMode('DETAIL');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue tracking-tight">Nghiệp vụ Ban An toàn Chất lượng (ATCL)</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý an toàn khai thác (SMS) và đánh giá sự cố hàng không</p>
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
        {/* <button
          onClick={() => setMainTab('INBOX')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${mainTab === 'INBOX' ? 'text-vna-blue border-vna-blue' : 'text-gray-500 hover:text-vna-blue border-transparent'} flex items-center`}
        >
          <Inbox size={16} className="mr-2" /> Hộp thư Yêu cầu
          <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">1</span>
        </button> */}
      </div>

      {mainTab === 'INDICATORS' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
          <OpsKPIConfig department="Ban ATCL" />
        </div>
      )}

      {mainTab === 'INFO' && viewMode === 'LIST' && (
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
              {records.map((record, index) => (
                <tr key={record.id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer" onClick={() => handleEdit(record)}>
                  <td className="py-3 px-4 text-sm text-black/45 text-center">{index + 1}</td>
                  <td className="py-3 px-4 text-sm text-vna-blue font-mono font-bold">{record.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 font-semibold">{record.year || record.effectivePeriod?.split('/').pop() || '—'}</td>
                  <td className="py-3 px-4 text-gray-600">{record.creator || '—'}</td>
                  <td className="py-3 px-4 text-gray-600">{record.editor || '—'}</td>
                  <td className="py-3 px-4 text-gray-600 font-mono">{record.editTime || '—'}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center items-center gap-2">
                      <Button variant="outline" className="px-2.5 py-1.5 h-8 text-xs font-semibold whitespace-nowrap" onClick={() => handleEdit(record)}>
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
      )}

      {mainTab === 'INFO' && viewMode === 'DETAIL' && formRecord && (
        <UnifiedDataEntryForm
          department="Ban An toàn chất lượng (Ban ATCL)"
          effectivePeriod={formRecord.effectivePeriod}
          onBack={() => setViewMode('LIST')}
          onSave={handleSave}
          isNewPeriod={formRecord.editTime === ''}
        />
      )}
      {false && mainTab === 'INFO' && viewMode === 'DETAIL' && formRecord && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[50vh] animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setViewMode('LIST')} className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h2 className="text-xl font-bold text-vna-blue">Kỳ Báo Cáo: {formRecord.year}</h2>
              </div>
            </div>
          </div>

          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Form Tieng On & Phat thai KNK */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="font-bold text-lg text-gray-800 mb-4 border-b border-gray-200 pb-2">Tiếng ồn & Phát thải KNK (Airline E-1 & Scope 1)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mức độ Tiếng ồn trung bình (dB)</label>
                  <div className="relative">
                    <input type="number" value={formRecord.noiseLevel} className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 outline-none" placeholder="Ví dụ: 85" onChange={() => { }} />
                    <Activity size={16} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phát thải KNK Scope 1 (tCO2e)</label>
                  <div className="relative">
                    <input type="number" value={formRecord.ghgEmissions} className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 outline-none" placeholder="Ví dụ: 1250000" onChange={() => { }} />
                    <UploadCloud size={16} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Form GRI 403-2 */}
            <div className="bg-red-50 p-5 rounded-xl border border-red-100">
              <div className="flex justify-between items-center mb-4 border-b border-red-200 pb-2">
                <h3 className="font-bold text-lg text-red-800 flex items-center">
                  <ShieldAlert size={20} className="mr-2" /> Nhận diện mối nguy & Điều tra sự cố (GRI 403-2)
                </h3>
                <Button variant="outline" className="h-8 text-xs border-red-300 text-red-700 hover:bg-red-100 bg-white">
                  <Plus size={14} className="mr-1" /> Thêm Báo Cáo Sự Cố
                </Button>
              </div>

              <div className="space-y-3">
                {formRecord.incidents.length > 0 ? formRecord.incidents.map((inc, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-red-200 flex justify-between items-center shadow-sm">
                    <div>
                      <h4 className="font-bold text-gray-800">{inc.title}</h4>
                      <p className="text-xs text-gray-500">Ngày phát sinh: {inc.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${inc.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{inc.status}</span>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 italic">Chưa có sự cố nào được ghi nhận trong kỳ.</p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <ApprovalLogTable logs={formRecord.logs} />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setViewMode('LIST')}>Hủy</Button>
              <QuickApprovalActions
                status={formRecord.status}
                recordId={formRecord.id}
                onApprove={(id) => openApprove(id, () => setViewMode('LIST'))}
                onReject={(id) => openReject(id, () => setViewMode('LIST'))}
                onSubmit={(id) => submitForApproval(id, () => setViewMode('LIST'))}
              />
              <Button variant="primary" onClick={handleSave}>Lưu bản nháp</Button>
            </div>
          </div>
        </div>
      )}

      {mainTab === 'INBOX' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
            <h3 className="font-bold text-lg text-gray-800">Hộp thư Yêu cầu (Tasks & Requests)</h3>
            <p className="text-sm text-gray-500 mt-1">Tiếp nhận yêu cầu nộp báo cáo và kế hoạch KPI từ Ban điều hành.</p>
          </div>
          <div className="divide-y divide-gray-100">
            {/* Task from Ban Truyen Thong */}
            <div className="p-5 hover:bg-blue-50/30 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex gap-4 items-start">
                <div className="bg-blue-100 text-vna-blue p-3 rounded-full flex-shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-800 text-base">Yêu cầu nộp Báo cáo Thường niên ESG 2026</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Người gửi: <span className="font-semibold text-gray-800">Ban Truyền thông</span> • Hạn nộp: <span className="font-semibold text-vna-blue">15/05/2026</span></p>
                  <p className="text-xs text-gray-500">Yêu cầu Ban ATCL tổng hợp các số liệu về Tiếng ồn, Phát thải và An toàn để đưa vào Báo cáo PTBV.</p>
                </div>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                <Button variant="primary" className="w-full md:w-auto shadow-sm" onClick={() => setShowInboxModal('REPORT')}>
                  <UploadCloud size={16} className="mr-2" /> Tải lên Báo Cáo
                </Button>
              </div>
            </div>

            {/* Task from Ban Truyen Thong - Volunteer */}
            <div className="p-5 hover:bg-emerald-50/30 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex gap-4 items-start">
                <div className="bg-emerald-100 text-emerald-700 p-3 rounded-full flex-shrink-0">
                  <Database size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-800 text-base">Yêu cầu Nhập số liệu Tình nguyện (Airline F-1)</h4>
                    <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Mới</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Người gửi: <span className="font-semibold text-gray-800">Ban Truyền thông</span> • Hạn nộp: <span className="font-semibold text-red-600">10/05/2026</span></p>
                  <p className="text-xs text-gray-500">Đề nghị đơn vị tổng hợp và báo cáo Số giờ Tình nguyện & Số người tham gia các hoạt động cộng đồng trong Quý 1/2026.</p>
                </div>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                <Button variant="outline" className="w-full md:w-auto shadow-sm text-emerald-700 border-emerald-200 hover:bg-emerald-50" onClick={() => setShowInboxModal('VOLUNTEER')}>
                  <Database size={16} className="mr-2" /> Nhập Số liệu Tình nguyện
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showInboxModal === 'REPORT' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-vna-blue text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold">Nộp Báo Cáo Thường Niên ESG</h3>
              <button onClick={() => setShowInboxModal(null)} className="text-white/70 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-blue-50 text-vna-blue p-3 rounded-lg text-sm border border-blue-100 flex items-start">
                <FileText size={16} className="mt-0.5 mr-2 shrink-0" />
                <p>Bạn đang nộp báo cáo theo yêu cầu từ <strong>Ban Truyền thông</strong>. Hạn nộp: <strong>15/05/2026</strong>.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Đính kèm File Báo Cáo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <UploadCloud size={32} className="text-gray-400 mb-2" />
                  <p className="text-sm font-semibold text-vna-blue">Kéo thả file vào đây hoặc click để chọn file</p>
                  <p className="text-xs text-gray-500 mt-1">Hỗ trợ PDF, DOCX, XLSX (Tối đa 10MB)</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ghi chú (Tùy chọn)</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 outline-none" rows={3} placeholder="Nhập ghi chú gửi đến Ban Truyền thông..."></textarea>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowInboxModal(null)}>Hủy bỏ</Button>
              <Button variant="primary" onClick={() => { alert('Đã nộp báo cáo thành công!'); setShowInboxModal(null); }}>Xác nhận Nộp</Button>
            </div>
          </div>
        </div>
      )}


      {showInboxModal === 'VOLUNTEER' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-600 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold">Nhập Số liệu Tình nguyện</h3>
              <button onClick={() => setShowInboxModal(null)} className="text-white/70 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-sm border border-emerald-100 flex items-start">
                <Database size={16} className="mt-0.5 mr-2 shrink-0" />
                <p>Kỳ báo cáo: <strong>Quý 1/2026</strong>. Yêu cầu từ <strong>Ban Truyền thông</strong>.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tổng Số giờ Tình nguyện</label>
                  <div className="relative">
                    <input type="number" className="w-full pl-3 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="VD: 45" />
                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">Giờ</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tổng Số người tham gia</label>
                  <div className="relative">
                    <input type="number" className="w-full pl-3 pr-16 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="VD: 5" />
                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">Người</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Chi tiết các hoạt động chính</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none" rows={3} placeholder="Mô tả tóm tắt các hoạt động đã tham gia..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Đính kèm Danh sách/Minh chứng</label>
                <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <UploadCloud size={24} className="text-gray-400 mb-1" />
                  <p className="text-xs font-semibold text-vna-blue">Kéo thả file vào đây</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowInboxModal(null)}>Hủy bỏ</Button>
              <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 border-none" onClick={() => { alert('Đã nộp số liệu tình nguyện thành công!'); setShowInboxModal(null); }}>Gửi Số liệu</Button>
            </div>
          </div>
        </div>
      )}

      <ApprovalModalComponent />
    </div>
  );
};
