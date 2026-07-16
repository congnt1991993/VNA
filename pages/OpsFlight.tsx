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

interface OpsFlightRecord {
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

const MOCK_RECORDS: OpsFlightRecord[] = [
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

export const OpsFlightPage: React.FC<{ onImportExcel?: () => void }> = ({ onImportExcel }) => {
  const [mainTab, setMainTab] = useState<'INFO' | 'INDICATORS' | 'INBOX'>('INFO');
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [records, setRecords] = useState<OpsFlightRecord[]>(MOCK_RECORDS);
  const [formRecord, setFormRecord] = useState<OpsFlightRecord | null>(null);
  const [showInboxModal, setShowInboxModal] = useState<'REPORT' | 'PLAN' | 'VOLUNTEER' | null>(null);

  const { openApprove, openReject, submitForApproval, ApprovalModalComponent } = useApprovalWorkflow(
    records,
    setRecords
  );

  const handleSave = () => {
    if (formRecord) {
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const recordToSave: OpsFlightRecord = {
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

  const [dynamicIndicator, setDynamicIndicator] = useState<'ETS' | 'CO2' | 'CORSIA'>('ETS');
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
      incidents: [],
      effectivePeriod: 'Tháng 05/2026'
    } as any);
    setViewMode('DETAIL');
  };

  const handleEdit = (item: OpsFlightRecord) => {
    setFormRecord({ ...item });
    setViewMode('DETAIL');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue tracking-tight">Nghiệp vụ Ban Khai thác</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý phát thải khí nhà kính, nhiên liệu SAF và tiếng ồn</p>
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
        </button>
        <button 
          onClick={() => setMainTab('INBOX')} 
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${mainTab === 'INBOX' ? 'text-vna-blue border-vna-blue' : 'text-gray-500 hover:text-vna-blue border-transparent'} flex items-center`}
        >
          <Inbox size={16} className="mr-2" /> Hộp thư Yêu cầu
          <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">1</span>
        </button> */}
      </div>

      {mainTab === 'INDICATORS' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
          <OpsKPIConfig department="Ban Khai thác" />
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
          department="Tổ Khai thác (TTĐHKT)"
          effectivePeriod={formRecord.effectivePeriod || 'Tháng 05/2026'}
          onBack={() => setViewMode('LIST')}
          onSave={handleSave}
          isNewPeriod={formRecord.editTime === ''}
        />
      )}
      {false && mainTab === 'INFO' && viewMode === 'DETAIL' && formRecord && (
        <div className="bg-gray-50/50 rounded-xl border border-gray-200 shadow-sm min-h-[70vh] animate-in slide-in-from-right-4 duration-300 relative pb-24">
          <div className="bg-white p-6 rounded-t-xl border-b border-gray-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setViewMode('LIST')} className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-vna-blue">Năm Báo Cáo:</h2>
                  <input
                    type="number"
                    defaultValue={formRecord.year}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-base font-bold text-vna-blue bg-white focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none w-32 shadow-sm"
                    placeholder="Nhập năm..."
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Cập nhật tham số nghiệp vụ khai thác</p>
              </div>
            </div>
            {/* Removed dynamic indicator select as per user request */}
          </div>

          <div className="px-6 space-y-6">
            {/* KHU VỰC 1: BIỂU MẪU NHẬP THAM SỐ CHI TIẾT */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-vna-blue mb-6 flex items-center border-b border-gray-100 pb-3">
                <FileText className="mr-2 text-[#D4AF37]" size={20} /> Biểu Mẫu Nhập Tham Số Chi Tiết
              </h3>

              <div className="space-y-8 animate-in fade-in duration-300">
                {/* ETS Block */}
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">1. Nhóm Hạn ngạch ETS (CT 2.22 / 2.29)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Chương trình (Scheme)</label>
                      <input type="text" readOnly value="EU ETS" className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 font-semibold cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Hạn ngạch ETS (Tấn) <span className="text-red-500">*</span></label>
                      <input type="number" placeholder="Nhập hạn ngạch..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none bg-white font-semibold text-vna-blue" />
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                {/* CO2 Block */}
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">2. Nhóm Lượng CO2 cần đền bù (CT 2.21 / 2.28)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Đơn giá tín chỉ CO2 <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        <input type="number" placeholder="Nhập đơn giá..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none bg-white font-semibold text-vna-blue" />
                        <select className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none bg-gray-50 font-bold text-gray-700">
                          <option>USD</option>
                          <option>EUR</option>
                          <option>GBP</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                {/* CORSIA Block */}
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">3. Tổng số chuyến bay áp dụng CORSIA (CT 2.33)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Tổng số chuyến bay trong kỳ</label>
                      <input type="number" defaultValue="1452" className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 font-semibold cursor-not-allowed" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Tổng chuyến bay tính phí CORSIA thực tế</label>
                      <input type="number" defaultValue="1420" className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-bold cursor-not-allowed" readOnly />
                    </div>
                  </div>

                  <div className="mt-4 bg-orange-50/50 p-4 rounded-lg border border-orange-100">
                    <p className="text-sm text-gray-700 font-semibold mb-3">Chọn các tính chất chuyến bay muốn loại trừ (Hệ thống sẽ tự động tính toán):</p>
                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer accent-[#D4AF37]" />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-[#D4AF37] transition-colors">Chuyến bay Nhân đạo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer accent-[#D4AF37]" />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-[#D4AF37] transition-colors">Chuyến bay Y tế</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer accent-[#D4AF37]" />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-[#D4AF37] transition-colors">Chuyến bay Chữa cháy</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 italic">* Số liệu "Tổng chuyến bay tính phí CORSIA thực tế" sẽ tự động được cập nhật dựa trên các tùy chọn trên.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* KHU VỰC 2: THIẾT LẬP CẢNH BÁO MỤC TIÊU */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg text-vna-blue mb-6 flex items-center border-b border-gray-100 pb-3">
                <AlertTriangle className="mr-2 text-orange-500" size={20} /> Thiết Lập Cảnh Báo Mục Tiêu (Alert Configuration)
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Điều kiện kích hoạt (Trigger Rule)</label>
                  <div className="flex flex-col md:flex-row gap-3">
                    <select className="md:w-1/3 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 outline-none bg-white font-medium text-sm">
                      <option>Hạn ngạch ETS</option>
                      <option>Đơn giá tín chỉ CO2</option>
                      <option>Tổng lượng phát thải</option>
                    </select>
                    <select className="md:w-1/4 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 outline-none bg-gray-50 font-bold text-gray-700 text-center text-sm">
                      <option>&gt; (Lớn hơn)</option>
                      <option>&lt; (Nhỏ hơn)</option>
                      <option>= (Bằng)</option>
                    </select>
                    <input type="text" placeholder="Nhập giá trị ngưỡng..." className="md:w-5/12 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 outline-none bg-white font-medium text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Người nhận cảnh báo (Assignees)</label>
                    <div className="relative">
                      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg min-h-[46px] bg-white">
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-vna-blue text-xs font-semibold px-2 py-1.5 rounded border border-blue-100">
                          Tổ Khai thác - Chị Lê <X size={12} className="cursor-pointer hover:text-red-500" />
                        </span>
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-vna-blue text-xs font-semibold px-2 py-1.5 rounded border border-blue-100">
                          TTĐHKT - Chị Thanh <X size={12} className="cursor-pointer hover:text-red-500" />
                        </span>
                        <input type="text" placeholder="Thêm..." className="outline-none text-sm bg-transparent flex-1 min-w-[80px]" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mức độ ưu tiên</label>
                    <div className="flex gap-4 p-2 bg-gray-50 border border-gray-200 rounded-lg h-[46px] items-center px-4">
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-red-600">
                        <input type="radio" name="priority" className="w-4 h-4 text-red-500 focus:ring-red-500 accent-red-600" /> Cao
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-orange-500">
                        <input type="radio" name="priority" defaultChecked className="w-4 h-4 text-orange-500 focus:ring-orange-500 accent-orange-500" /> Trung bình
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-yellow-600">
                        <input type="radio" name="priority" className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 accent-yellow-500" /> Thấp
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-gray-700">Nội dung cảnh báo</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-600 font-medium cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-vna-blue focus:ring-vna-blue accent-vna-blue" /> In-app
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-600 font-medium cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-vna-blue focus:ring-vna-blue accent-vna-blue" /> Email
                      </label>
                    </div>
                  </div>
                  <textarea className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 outline-none bg-white text-sm" rows={3} placeholder="Ví dụ: Cảnh báo Hạn ngạch ETS đã vượt quá ngưỡng an toàn. Vui lòng rà soát lại phương án khai thác..."></textarea>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <ApprovalLogTable logs={formRecord.logs} />
            </div>
          </div>

          {/* KHU VỰC 3: HÀNH ĐỘNG FIXED */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 z-10 rounded-b-xl shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
            <Button variant="outline" onClick={() => setViewMode('LIST')} className="px-6 font-semibold border-gray-300 text-gray-600 hover:bg-gray-50 h-10">Hủy bỏ</Button>
            <QuickApprovalActions
              status={formRecord.status}
              recordId={formRecord.id}
              onApprove={(id) => openApprove(id, () => setViewMode('LIST'))}
              onReject={(id) => openReject(id, () => setViewMode('LIST'))}
              onSubmit={(id) => submitForApproval(id, () => setViewMode('LIST'))}
            />
            <Button variant="primary" onClick={handleSave} className="px-6 font-bold bg-vna-blue hover:bg-[#112d60] shadow-md border-none relative overflow-hidden group h-10">
              <span className="relative z-10 text-[#D4AF37] flex items-center gap-2"><Send size={16} /> Lưu Hệ thống</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Button>
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
