import React, { useState, useMemo } from 'react';
import { Button } from '../components/UI';
import { Plus, ArrowLeft, Edit2, AlertTriangle, CheckCircle, FileText, UploadCloud, Database, Inbox, Send, X } from 'lucide-react';
import { OpsKPIConfig } from '../components/OpsKPIConfig';
import { ApprovalStatusBadge, QuickApprovalActions, useApprovalWorkflow, ApprovalStatus, ApprovalLogTable, ApprovalLog } from '../components/ApprovalWorkflow';
import { UnifiedDataEntryForm } from '../components/UnifiedDataEntryForm';

interface OpsTTBSVRecord {
  logs?: ApprovalLog[];
  id: string;
  year: string;
  status: ApprovalStatus;
  creator?: string;
  editor?: string;
  editTime?: string;
  npsTarget: string;
  npsActual: string;
  customerSurveys: string;
}

const MOCK_RECORDS: OpsTTBSVRecord[] = [
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
    npsTarget: '45',
    npsActual: '42',
    customerSurveys: '12000',
  }
];

export const OpsTTBSVPage: React.FC<{ onImportExcel?: () => void }> = ({ onImportExcel }) => {
  const [mainTab, setMainTab] = useState<'INFO' | 'INDICATORS' | 'INBOX'>('INFO');
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [records, setRecords] = useState<OpsTTBSVRecord[]>(MOCK_RECORDS);
  const [formRecord, setFormRecord] = useState<OpsTTBSVRecord | null>(null);
  const [showInboxModal, setShowInboxModal] = useState<'REPORT' | 'PLAN' | 'VOLUNTEER' | null>(null);

  const { openApprove, openReject, submitForApproval, ApprovalModalComponent } = useApprovalWorkflow(
    records,
    setRecords
  );

  const handleSave = () => {
    if (!formRecord) return;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const recordToSave: OpsTTBSVRecord = {
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
    alert("Đã lưu dữ liệu thành công!");
  };

  const handleAddNew = () => {
    const today = new Date();
    setFormRecord({
      id: `SVC-${today.getFullYear()}`,
      year: today.getFullYear().toString(),
      status: 'Inactive',
      creator: 'Nguyễn Văn A',
      editor: 'Nguyễn Văn A',
      editTime: '',
      npsTarget: '',
      npsActual: '',
      customerSurveys: ''
    });
    setViewMode('DETAIL');
  };

  const handleEdit = (item: OpsTTBSVRecord) => {
    setFormRecord({ ...item });
    setViewMode('DETAIL');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue tracking-tight">Nghiệp vụ Trung tâm Bông sen vàng & Dịch vụ</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý trải nghiệm khách hàng và đánh giá chất lượng dịch vụ (Airline B-2)</p>
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
        {/* <button
          onClick={() => setMainTab('INBOX')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${mainTab === 'INBOX' ? 'text-vna-blue border-vna-blue' : 'text-gray-500 hover:text-vna-blue border-transparent'} flex items-center`}
        >
          <Inbox size={16} className="mr-2" /> Hộp thư Yêu cầu
          <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">2</span>
        </button> */}
      </div>

      {mainTab === 'INDICATORS' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
          <OpsKPIConfig department="Trung tâm Bông sen vàng" />
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
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Mục tiêu NPS</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Thực tế NPS</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Lượt khảo sát KH</th>
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
                    <td className="py-3 px-4">{record.year}</td>
                    <td className="py-3 px-4 font-semibold font-mono">{record.npsTarget || '-'}</td>
                    <td className="py-3 px-4 font-semibold font-mono">{record.npsActual || '-'}</td>
                    <td className="py-3 px-4 font-semibold font-mono">{Number(record.customerSurveys || 0).toLocaleString()} lượt</td>
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
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mainTab === 'INFO' && viewMode === 'DETAIL' && formRecord && (
        <UnifiedDataEntryForm
          department="Trung tâm Bông Sen Vàng (TTBSV)"
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
                <div className="flex items-center gap-3 mt-1">
                  <ApprovalStatusBadge status={formRecord.status} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="font-bold text-lg text-gray-800 mb-4 border-b border-gray-200 pb-2">Tương tác Khách hàng & NPS (Airline B-2)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Điểm NPS Mục tiêu (Plan)</label>
                  <input type="number" value={formRecord.npsTarget} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 outline-none" placeholder="Ví dụ: 45" onChange={(e) => setFormRecord({ ...formRecord, npsTarget: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Điểm NPS Thực tế (Actual)</label>
                  <input type="number" value={formRecord.npsActual} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 outline-none" placeholder="Ví dụ: 42" onChange={(e) => setFormRecord({ ...formRecord, npsActual: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Số lượng Survey thu về</label>
                  <input type="number" value={formRecord.customerSurveys} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 outline-none" placeholder="Ví dụ: 15000" onChange={(e) => setFormRecord({ ...formRecord, customerSurveys: e.target.value })} />
                </div>
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
              <Button variant="primary" onClick={handleSave}>Lưu dữ liệu</Button>
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
                    <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Khẩn cấp</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Người gửi: <span className="font-semibold text-gray-800">Ban Truyền thông</span> • Hạn nộp: <span className="font-semibold text-red-600">15/05/2026</span></p>
                  <p className="text-xs text-gray-500">Yêu cầu TTBSV tổng hợp các số liệu về chăm sóc khách hàng, chương trình hội viên để đưa vào Báo cáo Phát triển bền vững chung của TCT.</p>
                </div>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                <Button variant="primary" className="w-full md:w-auto shadow-sm" onClick={() => setShowInboxModal('REPORT')}>
                  <UploadCloud size={16} className="mr-2" /> Tải lên Báo Cáo
                </Button>
              </div>
            </div>

            {/* Task from Ban KHPT */}
            <div className="p-5 hover:bg-indigo-50/30 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex gap-4 items-start">
                <div className="bg-indigo-100 text-indigo-700 p-3 rounded-full flex-shrink-0">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-800 text-base">Yêu cầu nộp Kế hoạch KPI ESG 2027</h4>
                    <span className="bg-amber-100 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Đến hạn</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Người gửi: <span className="font-semibold text-gray-800">Ban KHPT</span> • Hạn nộp: <span className="font-semibold text-amber-600">30/06/2026</span></p>
                  <p className="text-xs text-gray-500">Vui lòng lập kế hoạch KPI cho năm tiếp theo đối với chỉ tiêu Airline B-2 (Customer Engagement).</p>
                </div>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                <Button variant="outline" className="w-full md:w-auto shadow-sm text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => setShowInboxModal('PLAN')}>
                  <Send size={16} className="mr-2" /> Điền Kế Hoạch
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

      {showInboxModal === 'PLAN' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold">Lập Kế Hoạch KPI ESG Năm 2027</h3>
              <button onClick={() => setShowInboxModal(null)} className="text-white/70 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-indigo-50 text-indigo-800 p-3 rounded-lg text-sm border border-indigo-100 flex items-start">
                <CheckCircle size={16} className="mt-0.5 mr-2 shrink-0" />
                <p>Bạn đang lập kế hoạch KPI theo yêu cầu từ <strong>Ban KHPT</strong>. Hạn nộp: <strong>30/06/2026</strong>.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Điểm NPS Mục tiêu (2027)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Ví dụ: 48" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Số lượng Khảo sát kỳ vọng</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Ví dụ: 20000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Kế hoạch hành động / Sáng kiến cải thiện (Action Plan)</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" rows={5} placeholder="- Cải thiện hệ thống phản hồi tự động
- Tăng cường đào tạo nhân viên mặt đất..."></textarea>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowInboxModal(null)}>Hủy bỏ</Button>
              <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 border-none" onClick={() => { alert('Đã nộp kế hoạch KPI thành công!'); setShowInboxModal(null); }}>Trình Phê Duyệt</Button>
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
