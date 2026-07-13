import React, { useState, useMemo } from 'react';
import { Button, Modal } from '../components/UI';
import {
  Plus,
  ArrowLeft,
  Edit2,
  Send,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Bell,
  User,
  Clock,
  AlertTriangle, UploadCloud
} from 'lucide-react';
import { OpsKPIConfig } from '../components/OpsKPIConfig';
import { ApprovalStatusBadge, QuickApprovalActions, useApprovalWorkflow, ApprovalStatus, ApprovalLogTable, ApprovalLog } from '../components/ApprovalWorkflow';
import { UnifiedDataEntryForm } from '../components/UnifiedDataEntryForm';

interface KPIItem {
  id: number;
  code: string;
  name: string;
  subName?: string;
  unit: string;
  plan: number | string;
  actual: number | string;
  progress: number;
  progressText: string;
  isPass: boolean;
  dept: string;
  creator: string;
  approver: string;
  approvalTime: string;
  status: ApprovalStatus;
}

const INITIAL_KPIS: KPIItem[] = [
  {
    id: 12,
    code: "KPI-SAF-01",
    name: "Sự cố bắt buộc phải báo cáo",
    subName: "Mandatory occurrence reporting (MOR)",
    unit: "Số vụ việc/1,000 chuyến bay",
    plan: "1.84",
    actual: "1.82",
    progress: 85,
    progressText: "-1.1%",
    isPass: true,
    dept: "ATCL",
    creator: "Trần Văn Nam (Chuyên viên)",
    approver: "Lê Minh Trí (Trưởng ban)",
    approvalTime: "09:15 - 12/04/2026",
    status: "Active"
  },
  {
    id: 13,
    code: "KPI-SAF-02",
    name: "Tai nạn mức A /10,000 chuyến bay",
    subName: "Level A accidents per 10k flights",
    unit: "Số vụ việc/10,000 cb",
    plan: "3.62",
    actual: "2.14",
    progress: 60,
    progressText: "-29.0%",
    isPass: true,
    dept: "ATCL",
    creator: "Trần Văn Nam (Chuyên viên)",
    approver: "Lê Minh Trí (Trưởng ban)",
    approvalTime: "09:20 - 12/04/2026",
    status: "Active"
  },
  {
    id: 14,
    code: "KPI-SAF-03",
    name: "Sự cố mức B/10,000 chuyến bay",
    subName: "Level B incidents per 10k flights",
    unit: "Số vụ việc/10,000 cb",
    plan: "5.40",
    actual: "5.37",
    progress: 99,
    progressText: "-0.5%",
    isPass: true,
    dept: "ATCL",
    creator: "Trần Văn Nam (Chuyên viên)",
    approver: "Lê Minh Trí (Trưởng ban)",
    approvalTime: "09:22 - 12/04/2026",
    status: "Active"
  },
  {
    id: 15,
    code: "KPI-ENV-01",
    name: "Cường độ phát thải CO2",
    subName: "CO2 Emission Intensity",
    unit: "gCO2/RTK",
    plan: "765",
    actual: "770",
    progress: 100,
    progressText: "+0.6%",
    isPass: false,
    dept: "Ban KT/KT",
    creator: "Phạm Hoàng Nam (Chuyên viên)",
    approver: "Trần Thị B (Trưởng ban)",
    approvalTime: "14:45 - 14/05/2026",
    status: "Active"
  },
  {
    id: 16,
    code: "KPI-ENV-02",
    name: "Tỷ lệ pha trộn SAF thực tế",
    subName: "Actual SAF blending ratio",
    unit: "%",
    plan: "5.0",
    actual: "2.5",
    progress: 50,
    progressText: "-50.0%",
    isPass: false,
    dept: "Kỹ thuật",
    creator: "Nguyễn Hoàng Anh (Chuyên viên)",
    approver: "Trần Thị B (Trưởng ban)",
    approvalTime: "10:30 - 15/05/2026",
    status: "Active"
  },
  {
    id: 17,
    code: "KPI-HR-01",
    name: "Mức độ hài lòng của nhân viên",
    subName: "Employee satisfaction score",
    unit: "Điểm (1-5)",
    plan: "4.2",
    actual: "4.0",
    progress: 95,
    progressText: "-4.8%",
    isPass: true,
    dept: "TCNL",
    creator: "Lê Minh Tuấn (Chuyên viên)",
    approver: "",
    approvalTime: "",
    status: "Pending"
  },
  {
    id: 18,
    code: "KPI-DIG-01",
    name: "Tiến độ xây dựng kho dữ liệu ESG",
    subName: "ESG Data Warehouse construction progress",
    unit: "%",
    plan: "100",
    actual: "--",
    progress: 0,
    progressText: "Chưa nộp",
    isPass: false,
    dept: "CĐSCN",
    creator: "Đặng Quang Huy (Chuyên viên)",
    approver: "",
    approvalTime: "",
    status: "Inactive"
  },
  {
    id: 19,
    code: "KPI-COM-01",
    name: "Số tiền quyên góp từ thiện",
    subName: "Charity donation amount",
    unit: "Triệu VNĐ",
    plan: "500",
    actual: "520",
    progress: 100,
    progressText: "+4.0%",
    isPass: true,
    dept: "Truyền thông",
    creator: "Mai Thu Trang (Chuyên viên)",
    approver: "Trần Thị B (Trưởng ban)",
    approvalTime: "11:20 - 18/05/2026",
    status: "Active"
  },
  {
    id: 20,
    code: "KPI-SVC-01",
    name: "Chỉ số hài lòng NPS hành khách",
    subName: "Passenger Net Promoter Score",
    unit: "Điểm",
    plan: "45",
    actual: "42.5",
    progress: 94,
    progressText: "-5.5%",
    isPass: false,
    dept: "Dịch vụ",
    creator: "Nguyễn Thị Mai (Chuyên viên)",
    approver: "",
    approvalTime: "",
    status: "Pending"
  },
  {
    id: 21,
    code: "KPI-PLAN-01",
    name: "Tỷ lệ KPI hoàn thành",
    subName: "Completed KPI ratio",
    unit: "%",
    plan: "70",
    actual: "--",
    progress: 0,
    progressText: "Chưa nộp",
    isPass: false,
    dept: "KHPT",
    creator: "Vũ Minh Triết (Chuyên viên)",
    approver: "",
    approvalTime: "",
    status: "Inactive"
  }
];

interface OpsRecord {
  logs?: ApprovalLog[];
  id: string;
  effectivePeriod: string;
  status: ApprovalStatus;
  creator?: string;
  editor?: string;
  editTime?: string;
}

const MOCK_RECORDS: OpsRecord[] = [
  {
    id: 'PLN-OPS-2026',
    effectivePeriod: 'Năm 2026',
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
    ]
  },
  { id: 'PLN-OPS-2027', effectivePeriod: 'Năm 2027', status: 'Inactive', creator: 'Nguyễn Văn A', editor: 'Nguyễn Văn A', editTime: '18/05/2027 10:20' }
];

export const OpsPlanningPage: React.FC<{ onImportExcel?: () => void; onNewPeriodChange?: (isNew: boolean) => void }> = ({ onImportExcel, onNewPeriodChange }) => {
  const [mainTab, setMainTab] = useState<'INFO' | 'INDICATORS'>('INFO');
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [records, setRecords] = useState<OpsRecord[]>(MOCK_RECORDS);
  const [formRecord, setFormRecord] = useState<OpsRecord | null>(null);

  const [kpis, setKpis] = useState<KPIItem[]>(INITIAL_KPIS);
  const [popupType, setPopupType] = useState<'inactive' | 'pending' | 'failed' | null>(null);

  // Card calculations
  const totalCount = kpis.length;
  const inactiveCount = useMemo(() => kpis.filter(item => item.status === 'Inactive').length, [kpis]);
  const pendingCount = useMemo(() => kpis.filter(item => item.status === 'Pending').length, [kpis]);
  const failedCount = useMemo(() => kpis.filter(item => !item.isPass).length, [kpis]);

  const popupItems = useMemo(() => {
    if (!popupType) return [];
    if (popupType === 'inactive') {
      return kpis.filter(item => item.status === 'Inactive');
    }
    if (popupType === 'pending') {
      return kpis.filter(item => item.status === 'Pending');
    }
    return kpis.filter(item => !item.isPass);
  }, [kpis, popupType]);

  const popupTitle = useMemo(() => {
    if (popupType === 'inactive') return 'Danh sách chỉ tiêu chưa nộp';
    if (popupType === 'pending') return 'Danh sách chỉ tiêu chưa duyệt';
    if (popupType === 'failed') return 'Danh sách chỉ tiêu chưa đạt';
    return '';
  }, [popupType]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('edit');
  const [selectedKpi, setSelectedKpi] = useState<KPIItem | null>(null);

  // Form states for KPI edit
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [subName, setSubName] = useState('');
  const [unit, setUnit] = useState('');
  const [plan, setPlan] = useState('');
  const [actual, setActual] = useState('');
  const [progress, setProgress] = useState(100);
  const [progressText, setProgressText] = useState('');
  const [isPass, setIsPass] = useState(true);
  const [dept, setDept] = useState('');
  const [creator, setCreator] = useState('');
  const [approver, setApprover] = useState('');
  const [approvalTime, setApprovalTime] = useState('');
  const [status, setStatus] = useState<ApprovalStatus>('Active');

  const handleSaveKpi = () => {
    if (selectedKpi) {
      const updatedList = kpis.map(item => item.id === selectedKpi.id ? {
        ...item,
        code,
        name,
        subName,
        unit,
        plan,
        actual,
        progress,
        progressText,
        isPass,
        dept,
        creator,
        approver,
        approvalTime,
        status
      } : item);
      setKpis(updatedList);
      alert("Đã cập nhật thông tin KPI thành công!");
    }
    setIsModalOpen(false);
  };

  const { openApprove, openReject, submitForApproval, ApprovalModalComponent } = useApprovalWorkflow(
    records,
    setRecords
  );

  const handleSave = () => {
    if (!formRecord) return;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const recordToSave: OpsRecord = {
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
    if (onNewPeriodChange) onNewPeriodChange(false);
    alert("Đã lưu dữ liệu thành công!");
  };

  React.useEffect(() => {
    const handleSaveEvent = () => {
      handleSave();
    };
    window.addEventListener('vna-save-new-period', handleSaveEvent);
    return () => {
      window.removeEventListener('vna-save-new-period', handleSaveEvent);
    };
  }, [formRecord, records]);

  // Detail tabs
  const [detailTab, setDetailTab] = useState<'ESG_GOVERNANCE' | 'KPI_MANAGEMENT' | 'KPI_TRACKING'>('ESG_GOVERNANCE');
  const [showDispatchModal, setShowDispatchModal] = useState<string | null>(null);

  const handleAddNew = () => {
    const today = new Date();
    setFormRecord({
      id: `PLN-OPS-${today.getFullYear()}`,
      effectivePeriod: `Năm ${today.getFullYear()}`,
      status: 'Inactive',
      creator: 'Nguyễn Văn A',
      editor: 'Nguyễn Văn A',
      editTime: ''
    });
    setViewMode('DETAIL');
    setDetailTab('ESG_GOVERNANCE');
    if (onNewPeriodChange) onNewPeriodChange(true);
  };

  const handleEdit = (item: OpsRecord) => {
    setFormRecord({ ...item });
    setViewMode('DETAIL');
    setDetailTab('ESG_GOVERNANCE');
    if (onNewPeriodChange) onNewPeriodChange(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue tracking-tight">Nghiệp vụ Ban Kế hoạch Phát triển & TT</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý chiến lược, quản trị (Governance) và giao mục tiêu KPI ESG</p>
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
          <OpsKPIConfig department="Ban Kế hoạch Phát triển" />

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
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">HĐQT độc lập</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Tuân thủ ESG</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-700">Audit tồn đọng</th>
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
                    <td className="py-3 px-4 font-semibold font-mono">{record.status === 'Active' ? '33.3%' : '30.0%'}</td>
                    <td className="py-3 px-4 font-semibold font-mono">{record.status === 'Active' ? '100%' : '95%'}</td>
                    <td className="py-3 px-4 font-semibold font-mono text-red-650">{record.status === 'Active' ? '3 việc' : '0 việc'}</td>
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
          department="Ban Kế hoạch Phát triển"
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
                <h2 className="text-xl font-bold text-vna-blue">Kỳ Kế Hoạch: {formRecord.effectivePeriod}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <ApprovalStatusBadge status={formRecord.status} />
                </div>
              </div>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setDetailTab('ESG_GOVERNANCE')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${detailTab === 'ESG_GOVERNANCE' ? 'bg-white shadow-sm text-vna-blue' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Nhập liệu Quản trị ESG
              </button>
              <button
                onClick={() => setDetailTab('KPI_MANAGEMENT')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${detailTab === 'KPI_MANAGEMENT' ? 'bg-white shadow-sm text-vna-blue' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Phê duyệt Kế hoạch
              </button>
              <button
                onClick={() => setDetailTab('KPI_TRACKING')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${detailTab === 'KPI_TRACKING' ? 'bg-white shadow-sm text-vna-blue' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Theo dõi Thực tế
              </button>
            </div>
          </div>

          {detailTab === 'ESG_GOVERNANCE' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4 border-b border-gray-200 pb-2">Chỉ tiêu Định tính Quản trị (Governance & Public Web)</h3>
                <p className="text-sm text-gray-500 mb-4">Nhập liệu giải trình và thuyết minh cho 15 chỉ tiêu quản trị cốt lõi.</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">GRI 2-9: Cơ cấu quản trị và thành phần</label>
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 focus:border-vna-blue outline-none" rows={4} placeholder="Nhập văn bản thuyết minh về cơ cấu HĐQT, Ban Giám đốc... (hỗ trợ Rich Text)" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">GRI 2-15: Xung đột lợi ích</label>
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 focus:border-vna-blue outline-none" rows={4} placeholder="Nhập quy trình công bố, quản lý và phòng ngừa xung đột lợi ích..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">GRI 415-1: Đóng góp chính trị</label>
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 focus:border-vna-blue outline-none" rows={2} placeholder="Khai báo các khoản đóng góp tài chính hoặc hiện vật cho các tổ chức chính trị..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Thông điệp Tầm nhìn ESG (Public Website)</label>
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vna-blue/20 focus:border-vna-blue outline-none" rows={3} placeholder="Nội dung bài viết thông điệp, tầm nhìn..." />
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
                <Button variant="primary" onClick={handleSave}>Lưu bản nháp</Button>
                <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { alert('Đã xuất bản lên Web!'); }}>Xuất bản lên Web</Button>
              </div>
            </div>
          )}

          {detailTab === 'KPI_MANAGEMENT' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div>
                  <h3 className="font-bold text-indigo-900">Giao Kế Hoạch KPI ESG Năm {formRecord.effectivePeriod.replace('Năm ', '')}</h3>
                  <p className="text-sm text-indigo-700 mt-1">Yêu cầu các Tổ/Ban thiết lập số liệu kế hoạch cho các chỉ tiêu được giao</p>
                </div>
                <Button variant="primary" className="shadow-md bg-indigo-600 hover:bg-indigo-700 border-none" onClick={() => setShowDispatchModal('Lập Kế hoạch KPI ESG')}>
                  <Send size={16} className="mr-2" /> Gửi Lệnh Yêu Cầu
                </Button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Dashboard Giám Sát & Phê Duyệt Kế Hoạch</h3>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-4 font-semibold w-[22%]">Tổ/Ban</th>
                      <th className="py-4 px-4 font-semibold w-[35%]">Chỉ tiêu trọng yếu</th>
                      <th className="py-4 px-4 font-semibold text-right w-[15%]">Kế hoạch</th>
                      <th className="py-4 px-4 font-semibold text-center w-[15%]">Trạng thái</th>
                      <th className="py-4 px-4 font-semibold text-center w-[13%]">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm bg-white">
                    <tr className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-gray-800">Ban Quản lý vật tư / Điều hành khai thác</div>
                        <div className="text-xs text-gray-500 mt-1">Tổng: 12 chỉ tiêu</div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-2.5">
                          <div className="text-gray-700 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-gray-400 shrink-0"></div>
                            Giảm cường độ phát thải CO2
                          </div>
                          <div className="text-gray-700 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-gray-400 shrink-0"></div>
                            Giảm rác thải nhựa 1 lần
                          </div>
                          <div className="text-xs text-vna-blue cursor-pointer hover:underline mt-2 ml-3">+ Xem thêm 10 chỉ tiêu</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top text-right">
                        <div className="space-y-2.5">
                          <div><span className="font-semibold text-vna-blue bg-blue-50 px-2 py-0.5 rounded">5%</span></div>
                          <div><span className="font-semibold text-vna-blue bg-blue-50 px-2 py-0.5 rounded">100 tấn</span></div>
                          <div className="text-xs text-transparent select-none mt-2">-</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Chờ duyệt
                        </span>
                      </td>
                      <td className="py-4 px-4 align-top text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors" title="Phê duyệt">
                            <CheckCircle size={18} />
                          </button>
                          <button className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors" title="Từ chối">
                            <XCircle size={18} />
                          </button>
                          <button className="p-1.5 text-gray-500 hover:text-vna-blue hover:bg-blue-100 rounded-md transition-colors" title="Xem chi tiết">
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-gray-800">Ban Truyền thông</div>
                        <div className="text-xs text-gray-500 mt-1">Tổng: 4 chỉ tiêu</div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-2.5">
                          <div className="text-gray-700 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-gray-400 shrink-0"></div>
                            Số chiến dịch bảo vệ môi trường
                          </div>
                          <div className="text-gray-700 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-gray-400 shrink-0"></div>
                            Xuất bản báo cáo thường niên
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top text-right">
                        <div className="space-y-2.5">
                          <div><span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">5 chiến dịch</span></div>
                          <div><span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">1 báo cáo</span></div>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle size={12} /> Đã duyệt
                        </span>
                      </td>
                      <td className="py-4 px-4 align-top text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-gray-500 hover:text-vna-blue hover:bg-blue-100 rounded-md transition-colors" title="Xem chi tiết">
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-gray-800">Ban CĐSCN</div>
                        <div className="text-xs text-gray-500 mt-1">Tổng: 2 chỉ tiêu</div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="text-gray-400 italic">Chưa nộp số liệu kế hoạch</div>
                      </td>
                      <td className="py-4 px-4 align-top text-right">
                        <span className="text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100">--</span>
                      </td>
                      <td className="py-4 px-4 align-top text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                          <AlertCircle size={12} /> Chưa nộp
                        </span>
                      </td>
                      <td className="py-4 px-4 align-top text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-md transition-colors" title="Gửi nhắc nhở">
                            <Bell size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {detailTab === 'KPI_TRACKING' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* 3 Clickable KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setPopupType('inactive')}
                  className="bg-white p-5 rounded-xl border border-gray-200 border-l-4 border-l-blue-500 hover:shadow-md cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chỉ tiêu chưa nộp</span>
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><FileText size={18} /></div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-gray-700 leading-none">{inactiveCount}</span>
                    <span className="text-sm font-semibold text-gray-400">/ {totalCount} chỉ tiêu</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Nhấp để xem danh sách chưa hoàn thành nhập liệu</p>
                </div>

                <div
                  onClick={() => setPopupType('pending')}
                  className="bg-white p-5 rounded-xl border border-gray-200 border-l-4 border-l-amber-500 hover:shadow-md cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chỉ tiêu chưa duyệt</span>
                    <div className="bg-amber-50 p-2 rounded-lg text-amber-500"><Clock size={18} /></div>
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-amber-600 leading-none">{pendingCount}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">Nhấp để xem danh sách chờ Lãnh đạo phê duyệt</p>
                </div>

                <div
                  onClick={() => setPopupType('failed')}
                  className="bg-white p-5 rounded-xl border border-gray-200 border-l-4 border-l-red-500 hover:shadow-md cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chỉ tiêu chưa đạt</span>
                    <div className="bg-red-50 p-2 rounded-lg text-red-500"><AlertTriangle size={18} /></div>
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-red-650 leading-none">{failedCount}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">Nhấp để xem danh sách thực hiện dưới chỉ tiêu kế hoạch</p>
                </div>
              </div>

              {/* Header section similar to image */}
              <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Loại báo cáo:</span>
                    <select className="text-sm font-semibold text-gray-800 border-none bg-transparent cursor-pointer focus:ring-0">
                      <option>Quý - Q1 / 2026</option>
                      <option>Quý - Q2 / 2026</option>
                      <option>Năm - 2026</option>
                    </select>
                  </div>
                  <div className="hidden md:block w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Bộ lọc:</span>
                    <select className="text-sm font-semibold text-gray-800 border-none bg-transparent cursor-pointer focus:ring-0">
                      <option>Toàn mạng</option>
                      <option>Đội bay</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-400">Cập nhật lần cuối: 08:14 - 19/11/2026</div>
                </div>
              </div>

              {/* Table section matching the image layout */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1400px] text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="py-4 px-4 text-center w-[4%] whitespace-nowrap">STT</th>
                        <th className="py-4 px-4 w-[22%] whitespace-nowrap">MÃ & TÊN KPI</th>
                        <th className="py-4 px-4 w-[10%] whitespace-nowrap">ĐƠN VỊ TÍNH</th>
                        <th className="py-4 px-4 text-center w-[6%] whitespace-nowrap">KẾ HOẠCH</th>
                        <th className="py-4 px-4 text-center w-[6%] whitespace-nowrap">THỰC HIỆN</th>
                        <th className="py-4 px-4 w-[11%] whitespace-nowrap">TIẾN ĐỘ THỰC HIỆN</th>
                        <th className="py-4 px-4 text-center w-[8%] whitespace-nowrap">ĐÁNH GIÁ</th>
                        <th className="py-4 px-4 text-center w-[8%] whitespace-nowrap">CQ LIÊN QUAN</th>
                        <th className="py-4 px-4 w-[8%] whitespace-nowrap">NGƯỜI SOẠN THẢO</th>
                        <th className="py-4 px-4 w-[8%] whitespace-nowrap">NGƯỜI PHÊ DUYỆT</th>
                        <th className="py-4 px-4 w-[9%] whitespace-nowrap">THỜI GIAN DUYỆT</th>
                        <th className="py-4 px-4 text-center w-[5%] whitespace-nowrap">THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {kpis.map((kpi, idx) => (
                        <tr key={kpi.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-4 px-4 text-center text-gray-500 font-medium whitespace-nowrap">{idx + 1}</td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-vna-blue text-xs">{kpi.code}</div>
                              <ApprovalStatusBadge status={kpi.status} />
                            </div>
                            <div className="font-semibold text-gray-800 mt-0.5">{kpi.name}</div>
                            {kpi.subName && <div className="text-[11px] text-gray-400 mt-0.5 font-medium">{kpi.subName}</div>}
                          </td>
                          <td className="py-4 px-4 text-gray-600 font-medium text-xs whitespace-nowrap">{kpi.unit}</td>
                          <td className="py-4 px-4 text-center font-bold text-gray-700 whitespace-nowrap">{kpi.plan || '--'}</td>
                          <td className="py-4 px-4 text-center font-bold text-gray-900 whitespace-nowrap">{kpi.actual || '--'}</td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex justify-between items-center mb-1 text-xs">
                              <span className="text-gray-500 flex items-center gap-1">
                                {kpi.isPass ? <CheckCircle size={10} className="text-emerald-500" /> : <XCircle size={10} className="text-red-500" />}
                                {kpi.isPass ? 'Đạt tiến độ' : 'Chậm tiến độ'}
                              </span>
                              <span className={`font-semibold ${kpi.isPass ? 'text-emerald-600' : 'text-red-650'}`}>{kpi.progressText}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${kpi.isPass ? 'bg-emerald-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${kpi.isPass ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${kpi.isPass ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                              {kpi.isPass ? 'ĐẠT' : 'CHƯA ĐẠT'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                              {kpi.dept}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                              <User size={12} className="text-gray-400 shrink-0" />
                              <span className="truncate max-w-[120px]" title={kpi.creator}>{kpi.creator}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs text-emerald-850 font-bold">
                              {kpi.approver ? (
                                <>
                                  <User size={12} className="text-emerald-500 shrink-0" />
                                  <span className="truncate max-w-[120px]" title={kpi.approver}>{kpi.approver}</span>
                                </>
                              ) : (
                                <span className="text-gray-400 font-normal">--</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              {kpi.approvalTime ? (
                                <>
                                  <Clock size={12} className="text-gray-400 shrink-0" />
                                  <span className="truncate" title={kpi.approvalTime}>{kpi.approvalTime}</span>
                                </>
                              ) : (
                                <span className="text-gray-400">--</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedKpi(kpi);
                                setCode(kpi.code);
                                setName(kpi.name);
                                setSubName(kpi.subName || '');
                                setUnit(kpi.unit);
                                setPlan(String(kpi.plan));
                                setActual(String(kpi.actual));
                                setProgress(kpi.progress);
                                setProgressText(kpi.progressText);
                                setIsPass(kpi.isPass);
                                setDept(kpi.dept);
                                setCreator(kpi.creator);
                                setApprover(kpi.approver);
                                setApprovalTime(kpi.approvalTime);
                                setStatus(kpi.status);
                                setModalType('edit');
                                setIsModalOpen(true);
                              }}
                              className="text-xs font-semibold text-white bg-vna-blue hover:bg-vna-blue/90 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 mx-auto shadow-sm whitespace-nowrap"
                            >
                              <Eye size={12} /> Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
      {/* KPI edit modal inside OpsPlanning.tsx */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Chi tiết KPI"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>Đóng</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-1 text-left">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Mã KPI</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed" value={code} readOnly />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">CQ Liên quan</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed" value={dept} readOnly />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tên KPI (Tiếng Việt)</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed" value={name} readOnly />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tên KPI (Tiếng Anh)</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed" value={subName} readOnly />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Đơn vị tính</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed" value={unit} readOnly />
          </div>
          <div className="flex items-center gap-4 pt-6 pl-2">
            <label className="text-sm font-bold text-gray-700">Đánh giá:</label>
            <label className="flex items-center gap-1.5 text-sm font-medium cursor-not-allowed text-gray-500">
              <input type="radio" checked={isPass} disabled className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-not-allowed" /> ĐẠT
            </label>
            <label className="flex items-center gap-1.5 text-sm font-medium cursor-not-allowed text-gray-500">
              <input type="radio" checked={!isPass} disabled className="w-4 h-4 text-red-600 focus:ring-red-500 cursor-not-allowed" /> KHÔNG ĐẠT
            </label>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Chỉ tiêu Kế hoạch</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed" value={plan} readOnly />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Giá trị Thực hiện</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed" value={actual} readOnly />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tiến độ (%)</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed" type="number" min="0" max="100" value={progress} readOnly />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tỷ lệ So sánh</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed" value={progressText} readOnly />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Trạng thái phê duyệt</label>
            <select
              value={status}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
            >
              <option value="Active">Đã duyệt (Active)</option>
              <option value="Pending">Chờ duyệt (Pending)</option>
              <option value="Inactive">Bản nháp (Inactive)</option>
              <option value="Rejected">Bị từ chối (Rejected)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Người soạn thảo</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed" value={creator} readOnly />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Người phê duyệt</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed" value={approver} readOnly />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Thời gian phê duyệt</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 text-gray-500 cursor-not-allowed" value={approvalTime} readOnly />
          </div>
        </div>
      </Modal>

      {/* Drill-down Popup Modal */}
      {popupType && (
        <Modal
          isOpen={!!popupType}
          onClose={() => setPopupType(null)}
          title={popupTitle}
          size="lg"
          footer={
            <Button variant="outline" onClick={() => setPopupType(null)}>Đóng</Button>
          }
        >
          <div className="overflow-x-auto text-left">
            <table className="w-full text-left border-collapse text-sm min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-[8%] text-center whitespace-nowrap">STT</th>
                  <th className="py-3 px-4 w-[22%] whitespace-nowrap">Mã chỉ tiêu</th>
                  <th className="py-3 px-4 w-[35%] whitespace-nowrap">Tên chỉ tiêu</th>
                  <th className="py-3 px-4 w-[15%] whitespace-nowrap">Đơn vị</th>
                  {(popupType === 'pending' || popupType === 'failed') && (
                    <th className="py-3 px-4 w-[20%] whitespace-nowrap">Người nộp</th>
                  )}
                  {popupType === 'failed' && (
                    <th className="py-3 px-4 w-[20%] whitespace-nowrap">Người duyệt</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {popupItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-500 font-medium whitespace-nowrap">{index + 1}</td>
                    <td className="py-3 px-4 font-bold text-vna-blue whitespace-nowrap">{item.code}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">{item.name}</div>
                      {item.subName && <div className="text-[11px] text-gray-400 font-normal mt-0.5">{item.subName}</div>}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                        {item.dept}
                      </span>
                    </td>
                    {(popupType === 'pending' || popupType === 'failed') && (
                      <td className="py-3 px-4 text-xs text-gray-600 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <User size={12} className="text-gray-400 shrink-0" />
                          <span>{item.creator}</span>
                        </div>
                      </td>
                    )}
                    {popupType === 'failed' && (
                      <td className="py-3 px-4 text-xs text-emerald-850 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <User size={12} className="text-emerald-500 shrink-0" />
                          <span>{item.approver || '--'}</span>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {popupItems.length === 0 && (
                  <tr>
                    <td colSpan={popupType === 'failed' ? 6 : ((popupType === 'pending') ? 5 : 4)} className="py-8 text-center text-gray-400 font-medium bg-gray-50/20">
                      Không có chỉ tiêu nào thuộc nhóm này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      <ApprovalModalComponent />
    </div>
  );
};

