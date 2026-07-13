import React, { useState, useMemo } from 'react';
import { Card, Button, Input, Select, Badge, Toast, Modal } from '../components/UI';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  User, 
  Clock, 
  Filter,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { ApprovalStatusBadge, ApprovalStatus } from '../components/ApprovalWorkflow';

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

export const KPIManagePage: React.FC = () => {
  const [kpis, setKpis] = useState<KPIItem[]>(INITIAL_KPIS);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedKpi, setSelectedKpi] = useState<KPIItem | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [subName, setSubName] = useState('');
  const [unit, setUnit] = useState('');
  const [plan, setPlan] = useState('');
  const [actual, setActual] = useState('');
  const [progress, setProgress] = useState(100);
  const [progressText, setProgressText] = useState('');
  const [isPass, setIsPass] = useState(true);
  const [dept, setDept] = useState('ATCL');
  const [creator, setCreator] = useState('');
  const [approver, setApprover] = useState('');
  const [approvalTime, setApprovalTime] = useState('');
  const [status, setStatus] = useState<ApprovalStatus>('Active');

  // Popup detail states
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

  const handleAddNew = () => {
    setCode('');
    setName('');
    setSubName('');
    setUnit('');
    setPlan('');
    setActual('');
    setProgress(100);
    setProgressText('');
    setIsPass(true);
    setDept('ATCL');
    setCreator('Nguyễn Văn A (Chuyên viên)');
    setApprover('Trần Thị B (Trưởng ban)');
    setStatus('Inactive');
    
    const now = new Date();
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} - ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    setApprovalTime(formattedTime);
    
    setSelectedKpi(null);
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleEdit = (kpi: KPIItem) => {
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
  };

  const handleSave = () => {
    if (!code || !name || !unit) {
      setToast({ message: "Vui lòng nhập đầy đủ Mã, Tên và Đơn vị tính!", type: 'error' });
      return;
    }
    
    if (modalType === 'add') {
      const newItem: KPIItem = {
        id: Date.now(),
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
      };
      setKpis([...kpis, newItem]);
      setToast({ message: "Đã thêm KPI mới thành công!", type: 'success' });
    } else if (selectedKpi) {
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
      setToast({ message: "Đã cập nhật thông tin KPI thành công!", type: 'success' });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa KPI này không?")) {
      setKpis(kpis.filter(item => item.id !== id));
      setToast({ message: "Đã xóa KPI thành công!", type: 'info' });
    }
  };

  const filteredKpis = useMemo(() => {
    return kpis.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.subName && item.subName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDept = !deptFilter || item.dept === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [kpis, searchTerm, deptFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Edit/Add Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalType === 'add' ? "Thêm KPI mới" : "Sửa KPI"}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
            <Button variant="primary" onClick={handleSave}>Lưu thông tin</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-1">
          <Input label="Mã KPI" value={code} onChange={(e) => setCode(e.target.value)} placeholder="VD: KPI-ENV-01" required />
          <Input label="CQ Liên quan" value={dept} onChange={(e) => setDept(e.target.value)} placeholder="VD: ATCL, Ban KT/KT" />
          <div className="md:col-span-2">
            <Input label="Tên KPI (Tiếng Việt)" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên KPI tiếng Việt..." required />
          </div>
          <div className="md:col-span-2">
            <Input label="Tên KPI (Tiếng Anh)" value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="Nhập tên KPI tiếng Anh..." />
          </div>
          <Input label="Đơn vị tính" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="VD: %, tấn, gCO2/RTK" required />
          <div className="flex items-center gap-4 pt-6 pl-2">
            <label className="text-sm font-bold text-gray-700">Đánh giá:</label>
            <label className="flex items-center gap-1.5 text-sm font-medium cursor-pointer">
              <input type="radio" checked={isPass} onChange={() => setIsPass(true)} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" /> ĐẠT
            </label>
            <label className="flex items-center gap-1.5 text-sm font-medium cursor-pointer">
              <input type="radio" checked={!isPass} onChange={() => setIsPass(false)} className="w-4 h-4 text-red-600 focus:ring-red-500" /> KHÔNG ĐẠT
            </label>
          </div>
          <Input label="Chỉ tiêu Kế hoạch" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="VD: 1.84" />
          <Input label="Giá trị Thực hiện" value={actual} onChange={(e) => setActual(e.target.value)} placeholder="VD: 1.82" />
          <Input label="Tiến độ (%)" type="number" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
          <Input label="Tỷ lệ So sánh" value={progressText} onChange={(e) => setProgressText(e.target.value)} placeholder="VD: -1.1%" />
          <div className="md:col-span-2">
            <Select 
              label="Trạng thái phê duyệt" 
              value={status} 
              onChange={(val) => setStatus(val as ApprovalStatus)}
              options={[
                { label: 'Đã duyệt (Active)', value: 'Active' },
                { label: 'Chờ duyệt (Pending)', value: 'Pending' },
                { label: 'Bản nháp (Inactive)', value: 'Inactive' },
                { label: 'Bị từ chối (Rejected)', value: 'Rejected' },
              ]}
            />
          </div>
          <Input label="Người soạn thảo" value={creator} onChange={(e) => setCreator(e.target.value)} />
          <Input label="Người phê duyệt" value={approver} onChange={(e) => setApprover(e.target.value)} />
          <div className="md:col-span-2">
            <Input label="Thời gian phê duyệt" value={approvalTime} onChange={(e) => setApprovalTime(e.target.value)} />
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
          <div className="overflow-x-auto">
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

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue tracking-tight">Theo dõi & Quản lý KPI ESG</h1>
          <p className="text-black/45 text-sm mt-1">Quản trị các mục tiêu chiến lược và kết quả thực hiện thực tế từ các đơn vị</p>
        </div>
        <Button variant="primary" onClick={handleAddNew} className="shadow-md hover:shadow-lg transition-all">
          <Plus size={16} className="mr-2" />
          Thêm KPI mới
        </Button>
      </div>

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

      {/* Filter header block */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Loại báo cáo:</span>
            <select className="text-sm font-bold text-gray-800 border-none bg-transparent cursor-pointer focus:ring-0 outline-none">
              <option>Quý - Q1 / 2026</option>
              <option>Quý - Q2 / 2026</option>
              <option>Năm - 2026</option>
            </select>
          </div>
          <div className="hidden md:block w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">CQ Liên quan:</span>
            <select 
              value={deptFilter} 
              onChange={(e) => setDeptFilter(e.target.value)} 
              className="text-sm font-bold text-gray-800 border-none bg-transparent cursor-pointer focus:ring-0 outline-none"
            >
              <option value="">Tất cả cơ quan</option>
              <option value="ATCL">ATCL</option>
              <option value="Ban KT/KT">Ban KT/KT</option>
              <option value="Kỹ thuật">Kỹ thuật</option>
              <option value="TCNL">TCNL</option>
              <option value="CĐSCN">CĐSCN</option>
              <option value="Truyền thông">Truyền thông</option>
              <option value="Dịch vụ">Dịch vụ</option>
              <option value="KHPT">KHPT</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-400">Cập nhật lần cuối: 08:14 - 19/11/2026</div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-gray-200 bg-white shadow-sm">
        {/* Search bar section */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm kiếm mã hoặc tên KPI..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue bg-white text-sm"
            />
          </div>
        </div>

        {/* Table section */}
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
              {filteredKpis.map((kpi, idx) => (
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
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => handleEdit(kpi)}
                        className="p-1.5 text-vna-blue hover:bg-blue-50 rounded-md transition-colors" 
                        title="Sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(kpi.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" 
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredKpis.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-gray-500 font-medium bg-gray-50/50">
                    Không tìm thấy KPI nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
