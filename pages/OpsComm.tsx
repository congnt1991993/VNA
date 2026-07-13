import React, { useState } from 'react';
import { Button } from '../components/UI';
import { Plus, ArrowLeft, Edit2, Send, FileText, CheckCircle, AlertTriangle, UploadCloud } from 'lucide-react';
import { OpsKPIConfig } from '../components/OpsKPIConfig';
import { ApprovalStatusBadge, QuickApprovalActions, useApprovalWorkflow, ApprovalStatus, ApprovalLogTable, ApprovalLog } from '../components/ApprovalWorkflow';
import { UnifiedDataEntryForm } from '../components/UnifiedDataEntryForm';

interface OpsRecord {
  logs?: ApprovalLog[];
  id: string;
  effectivePeriod: string;
  status: ApprovalStatus;
  creator?: string;
  editor?: string;
  editTime?: string;
  violations: number;
}

const MOCK_RECORDS: OpsRecord[] = [
  {
    id: 'PR-OPS-2026-03', effectivePeriod: 'Tháng 03/2026', status: 'Active',
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
    ], violations: 0
  },
  { id: 'PR-OPS-2026-04', effectivePeriod: 'Tháng 04/2026', status: 'Inactive', violations: 1, creator: 'Nguyễn Văn A', editor: 'Nguyễn Văn A', editTime: '18/05/2026 10:20' }
];

export const OpsCommPage: React.FC<{ onImportExcel?: () => void }> = ({ onImportExcel }) => {
  const [mainTab, setMainTab] = useState<'INFO' | 'INDICATORS'>('INFO');
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [records, setRecords] = useState<OpsRecord[]>(MOCK_RECORDS);
  const [formRecord, setFormRecord] = useState<OpsRecord | null>(null);

  const { openApprove, openReject, submitForApproval, ApprovalModalComponent } = useApprovalWorkflow(
    records,
    setRecords
  );

  // Detail tabs
  const [detailTab, setDetailTab] = useState<'DATA_ENTRY' | 'ESG_REPORT_MGT'>('DATA_ENTRY');
  const [showDispatchModal, setShowDispatchModal] = useState<string | null>(null);

  // Form states
  const [violations, setViolations] = useState<number>(0);

  const handleAddNew = () => {
    const today = new Date();
    setFormRecord({
      id: `PR-OPS-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
      effectivePeriod: `Tháng ${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`,
      status: 'Inactive',
      creator: 'Nguyễn Văn A',
      editor: 'Nguyễn Văn A',
      editTime: '',
      violations: 0
    });
    setViolations(0);
    setViewMode('DETAIL');
    setDetailTab('DATA_ENTRY');
  };

  const handleEdit = (item: OpsRecord) => {
    setFormRecord({ ...item });
    setViolations(item.violations);
    setViewMode('DETAIL');
    setDetailTab('DATA_ENTRY');
  };

  const handleSave = () => {
    if (formRecord) {
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const recordToSave: OpsRecord = {
        ...formRecord,
        creator: formRecord.creator || 'Nguyễn Văn A',
        editor: 'Nguyễn Văn A',
        editTime: formattedDate,
        violations
      };

      setRecords(records.map(r => r.id === formRecord.id ? recordToSave : r));
      alert('Đã lưu dữ liệu thành công!');
      setViewMode('LIST');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue tracking-tight">Nghiệp vụ Ban Truyền thông</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông cáo, báo cáo ESG và truyền thông phát triển bền vững</p>
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
          <OpsKPIConfig department="Ban Truyền thông" />
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
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700 text-center">Số vụ vi phạm</th>
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
                    <td className="py-3 px-4">{record.effectivePeriod}</td>
                    <td className="py-3 px-4 text-center font-medium">{record.violations}</td>
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
          department="Ban Truyền thông"
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
                <h2 className="text-xl font-bold text-vna-blue">Kỳ báo cáo: {formRecord.effectivePeriod}</h2>
              </div>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setDetailTab('DATA_ENTRY')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${detailTab === 'DATA_ENTRY' ? 'bg-white shadow-sm text-vna-blue' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Nhập liệu Chỉ tiêu
              </button>
              <button
                onClick={() => setDetailTab('ESG_REPORT_MGT')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${detailTab === 'ESG_REPORT_MGT' ? 'bg-white shadow-sm text-vna-blue' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Quản lý Báo cáo ESG
              </button>
            </div>
          </div>

          {detailTab === 'DATA_ENTRY' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Form Airline F-1 */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4 border-b border-gray-200 pb-2">Tham gia hoạt động tình nguyện (Airline F-1)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số giờ tình nguyện thực tế (Giờ)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 focus:border-vna-blue outline-none" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng nhân viên tham gia (Người)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 focus:border-vna-blue outline-none" placeholder="0" />
                  </div>
                </div>
              </div>

              {/* Form GRI 417-3 */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                  <h3 className="font-bold text-lg text-gray-800">Sự cố vi phạm truyền thông marketing (GRI 417-3)</h3>
                  {violations > 0 && (
                    <span className="flex items-center text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                      <AlertTriangle size={12} className="mr-1" /> Alert: Phát sinh vi phạm
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số vụ vi phạm phát sinh (Vụ)</label>
                    <input
                      type="number"
                      min="0"
                      value={violations}
                      onChange={(e) => setViolations(parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${violations > 0 ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-300 focus:ring-vna-blue/20 focus:border-vna-blue'}`}
                    />
                  </div>

                  {/* Logic auto-fill text */}
                  {violations === 0 ? (
                    <div className="bg-green-50 text-green-800 p-3 rounded-lg text-sm border border-green-200 flex items-start">
                      <CheckCircle size={16} className="mt-0.5 mr-2 text-green-600 flex-shrink-0" />
                      <p><strong>Tuyên bố tự động:</strong> "Vietnam Airlines không có vụ việc nào liên quan đến tuân thủ truyền thông marketing."</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Diễn giải / Nguyên nhân vi phạm</label>
                      <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 focus:border-vna-blue outline-none" rows={3} placeholder="Nhập chi tiết sự cố vi phạm..." />
                    </div>
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
                <Button variant="primary" onClick={handleSave}>Lưu dữ liệu</Button>
              </div>
            </div>
          )}

          {detailTab === 'ESG_REPORT_MGT' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div>
                    <h3 className="font-bold text-vna-blue">Yêu cầu thu thập Báo cáo ESG Thường niên</h3>
                    <p className="text-sm text-blue-800 mt-1">Gửi yêu cầu tự động xuống tất cả các Tổ/Ban</p>
                  </div>
                  <Button variant="primary" className="shadow-md shrink-0 ml-4" onClick={() => setShowDispatchModal('Báo cáo ESG Thường niên')}>
                    <Send size={16} className="mr-2" /> Gửi Yêu Cầu
                  </Button>
                </div>

                <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <div>
                    <h3 className="font-bold text-indigo-900">Yêu cầu thu thập Số liệu Tình nguyện</h3>
                    <p className="text-sm text-indigo-700 mt-1">Thu thập số giờ/người tình nguyện (Airline F-1)</p>
                  </div>
                  <Button variant="primary" className="shadow-md bg-indigo-600 hover:bg-indigo-700 border-none shrink-0 ml-4" onClick={() => setShowDispatchModal('Số liệu Tình nguyện')}>
                    <Send size={16} className="mr-2" /> Gửi Yêu Cầu
                  </Button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Dashboard Gộp Báo Cáo Từ Các Tổ</h3>
                  <Button variant="outline" className="h-8 text-xs">
                    <FileText size={14} className="mr-1.5" /> Xuất File Tổng Hợp (.zip)
                  </Button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase">
                      <th className="py-3 px-4 font-semibold">Tổ/Ban</th>
                      <th className="py-3 px-4 font-semibold">Trạng thái nộp</th>
                      <th className="py-3 px-4 font-semibold">Thời gian nộp</th>
                      <th className="py-3 px-4 font-semibold">File đính kèm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm bg-white">
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold">Ban Quản lý vật tư</td>
                      <td className="py-3 px-4"><span className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-1 rounded">Đã nộp</span></td>
                      <td className="py-3 px-4">15/03/2026 14:30</td>
                      <td className="py-3 px-4"><a href="#" className="text-vna-blue hover:underline flex items-center"><FileText size={14} className="mr-1" /> ESG_Tech_2026.pdf</a></td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold">Ban TCNL</td>
                      <td className="py-3 px-4"><span className="text-amber-600 font-semibold text-xs bg-amber-50 px-2 py-1 rounded">Đang soạn thảo</span></td>
                      <td className="py-3 px-4">-</td>
                      <td className="py-3 px-4 text-gray-400">Chưa có file</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold">Trung tâm Điều hành khai thác</td>
                      <td className="py-3 px-4"><span className="text-red-600 font-semibold text-xs bg-red-50 px-2 py-1 rounded">Quá hạn nộp</span></td>
                      <td className="py-3 px-4">-</td>
                      <td className="py-3 px-4"><Button variant="outline" className="h-6 text-[10px] px-2 text-red-600 border-red-200 hover:bg-red-50">Nhắc nhở</Button></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Dashboard Tong hop So lieu Tinh nguyen */}
              <div className="border border-indigo-200 rounded-xl overflow-hidden mt-6">
                <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200 flex justify-between items-center">
                  <h3 className="font-bold text-indigo-900">Quản lý Số liệu Tình nguyện từ các đơn vị</h3>
                  <Button variant="primary" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 border-none">
                    <CheckCircle size={14} className="mr-1.5" /> Gộp số liệu vào hệ thống
                  </Button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-indigo-100 text-xs text-gray-500 uppercase">
                      <th className="py-3 px-4 font-semibold">Tổ/Ban</th>
                      <th className="py-3 px-4 font-semibold">Trạng thái nộp</th>
                      <th className="py-3 px-4 font-semibold text-right">Số giờ (Giờ)</th>
                      <th className="py-3 px-4 font-semibold text-right">Số người</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm bg-white">
                    <tr className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3 px-4 font-bold">Ban Quản lý vật tư</td>
                      <td className="py-3 px-4"><span className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-1 rounded">Đã nộp</span></td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-700">120</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-700">15</td>
                    </tr>
                    <tr className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3 px-4 font-bold">Trung tâm Bông sen vàng</td>
                      <td className="py-3 px-4"><span className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-1 rounded">Đã nộp</span></td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-700">45</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-700">5</td>
                    </tr>
                    <tr className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3 px-4 font-bold">Ban TCNL</td>
                      <td className="py-3 px-4"><span className="text-amber-600 font-semibold text-xs bg-amber-50 px-2 py-1 rounded">Chưa nộp</span></td>
                      <td className="py-3 px-4 text-right text-gray-400">-</td>
                      <td className="py-3 px-4 text-right text-gray-400">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}


      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-vna-blue text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold">Gửi Yêu Cầu Thu Thập: {showDispatchModal}</h3>
              <button onClick={() => setShowDispatchModal(null)} className="text-white/70 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Chọn Tổ/Ban nhận yêu cầu</label>
                <div className="space-y-2 border border-gray-200 p-3 rounded-lg max-h-48 overflow-y-auto bg-gray-50">
                  <label className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 rounded">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-vna-blue rounded focus:ring-vna-blue" />
                    <span className="text-sm font-medium">Ban Quản lý vật tư</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 rounded">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-vna-blue rounded focus:ring-vna-blue" />
                    <span className="text-sm font-medium">Trung tâm Điều hành khai thác & ATCL</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 rounded">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-vna-blue rounded focus:ring-vna-blue" />
                    <span className="text-sm font-medium">Trung tâm Bông sen vàng</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 rounded">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-vna-blue rounded focus:ring-vna-blue" />
                    <span className="text-sm font-medium">Ban Tổ chức Nguồn nhân lực (TCNL)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 rounded">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-vna-blue rounded focus:ring-vna-blue" />
                    <span className="text-sm font-medium">Ban Chuyển đổi số và Công nghệ (CĐSCN)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Thời hạn nộp (Deadline)</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 outline-none" defaultValue="2026-05-15" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ghi chú kèm theo</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 outline-none" rows={2} placeholder="Nhập ghi chú hoặc hướng dẫn..."></textarea>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDispatchModal(null)}>Hủy bỏ</Button>
              <Button variant="primary" onClick={() => { alert('Đã gửi yêu cầu thành công!'); setShowDispatchModal(null); }}>Xác nhận Gửi</Button>
            </div>
          </div>
        </div>
      )}
      <ApprovalModalComponent />
    </div>
  );
};

