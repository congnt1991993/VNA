import React, { useState, useMemo, useEffect } from 'react';
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
  AlertTriangle,
  Building2,
  ChevronDown,
  ChevronRight,
  Lock,
  ShieldCheck,
  Target,
  Sparkles,
  Award,
  ArrowUpDown,
  Calendar
} from 'lucide-react';
import { useAccess } from '../components/AccessContext';
import MOCK_INDICATORS_JSON from '../data/indicators_main_list.json';

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
  deptId?: string;
  indicatorCode?: string;
  creator: string;
  weight?: number;
  frequency?: string;
  direction?: 'asc' | 'desc'; // asc: Càng lớn càng tốt (Thực hiện >= Mục tiêu), desc: Càng nhỏ càng tốt (Thực hiện <= Mục tiêu)
  startDate?: string; // Định dạng YYYY-MM-DD
  endDate?: string; // Định dạng YYYY-MM-DD
}

interface Department {
  id: string;
  name: string;
  indicatorIds: string[];
  isActive: boolean;
}

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'DEPT-001', name: 'Tổ Khai thác (TTĐHKT)', indicatorIds: ["GRI 302-1", "GRI 302-4", "GRI 305-1", "GRI 305-4", "GRI 305-5", "GRI 305-7"], isActive: true },
  { id: 'DEPT-002', name: 'Ban An toàn chất lượng (Ban ATCL)', indicatorIds: ["Airline E-1", "9", "GRI 403-2"], isActive: true },
  { id: 'DEPT-003', name: 'Tổ Kỹ thuật (Ban QLVT)', indicatorIds: ["4", "5", "13"], isActive: true },
  { id: 'DEPT-004', name: 'Trung tâm Bông Sen Vàng (TTBSV)', indicatorIds: ["Airline B-2"], isActive: true },
  { id: 'DEPT-005', name: 'Ban Chuyển đổi số & CNTT', indicatorIds: ["GRI 418-1"], isActive: true },
  { id: 'DEPT-006', name: 'Tổ Dịch vụ', indicatorIds: ["GRI 303-3", "GRI 303-5", "Airline B-1", "GRI 204-1", "GRI 406-1", "GRI 416-1", "GRI 416-2", "GRI 417-2"], isActive: true },
  { id: 'DEPT-007', name: 'Ban Tổ chức Nhân lực', indicatorIds: ["Airline D-1", "Airline F-2", "GRI 202-1", "GRI 401-1", "GRI 401-2", "GRI 403-4", "GRI 403-9", "GRI 403-10", "GRI 405-1", "GRI 406-1", "GRI 2-7", "GRI 2-30", "GRI 404-2", "GRI 404-3", "GRI 201-3", "GRI 202-2"], isActive: true },
  { id: 'DEPT-008', name: 'Ban Kế hoạch Phát triển', indicatorIds: ["GRI 2-9", "GRI 2-10", "GRI 2-11", "GRI 2-12", "GRI 2-13", "GRI 2-15", "GRI 2-23", "GRI 2-26", "GRI 2-29", "GRI 3-3", "GRI 201-4", "GRI 205-2", "GRI 205-3", "GRI 206-1", "GRI 415-1"], isActive: true },
  { id: 'DEPT-009', name: 'Ban Truyền thông', indicatorIds: ["Airline F-1", "GRI 417-3"], isActive: true },
];

const INITIAL_KPIS: KPIItem[] = [
  {
    id: 12,
    code: "KPI-SAF-01",
    indicatorCode: "Airline E-1",
    name: "Sự cố bắt buộc phải báo cáo",
    subName: "Mandatory occurrence reporting (MOR)",
    unit: "Số vụ việc/1,000 chuyến bay",
    plan: "1.84",
    actual: "1.82",
    progress: 85,
    progressText: "-1.1%",
    isPass: true,
    dept: "Ban An toàn chất lượng (Ban ATCL)",
    deptId: "DEPT-002",
    creator: "Trần Văn Nam (Chuyên viên)",
    frequency: "Tháng",
    direction: "desc",
    startDate: "2026-01-01",
    endDate: "2026-12-31"
  },
  {
    id: 13,
    code: "KPI-SAF-02",
    indicatorCode: "9",
    name: "Tai nạn mức A /10,000 chuyến bay",
    subName: "Level A accidents per 10k flights",
    unit: "Số vụ việc/10,000 cb",
    plan: "3.62",
    actual: "2.14",
    progress: 60,
    progressText: "-29.0%",
    isPass: true,
    dept: "Ban An toàn chất lượng (Ban ATCL)",
    deptId: "DEPT-002",
    creator: "Trần Văn Nam (Chuyên viên)",
    frequency: "Tháng",
    direction: "desc",
    startDate: "2026-01-01",
    endDate: "2026-12-31"
  },
  {
    id: 14,
    code: "KPI-OPS-01",
    indicatorCode: "GRI 302-1",
    name: "Tiêu thụ năng lượng khai thác bay",
    subName: "Energy consumption within organization",
    unit: "TJ",
    plan: "15400",
    actual: "14950",
    progress: 97,
    progressText: "-2.9%",
    isPass: true,
    dept: "Tổ Khai thác (TTĐHKT)",
    deptId: "DEPT-001",
    creator: "Nguyễn Văn Hùng (Chuyên viên)",
    frequency: "Quý",
    direction: "desc",
    startDate: "2026-01-01",
    endDate: "2026-06-30"
  },
  {
    id: 15,
    code: "KPI-ENV-01",
    indicatorCode: "4",
    name: "Cường độ phát thải CO2",
    subName: "CO2 Emission Intensity",
    unit: "gCO2/RTK",
    plan: "765",
    actual: "770",
    progress: 100,
    progressText: "+0.6%",
    isPass: false,
    dept: "Tổ Kỹ thuật (Ban QLVT)",
    deptId: "DEPT-003",
    creator: "Phạm Hoàng Nam (Chuyên viên)",
    frequency: "Năm",
    direction: "desc",
    startDate: "2026-01-01",
    endDate: "2026-12-31"
  },
  {
    id: 16,
    code: "KPI-ENV-02",
    indicatorCode: "5",
    name: "Tỷ lệ pha trộn SAF thực tế",
    subName: "Actual SAF blending ratio",
    unit: "%",
    plan: "5.0",
    actual: "2.5",
    progress: 50,
    progressText: "-50.0%",
    isPass: false,
    dept: "Tổ Kỹ thuật (Ban QLVT)",
    deptId: "DEPT-003",
    creator: "Nguyễn Hoàng Anh (Chuyên viên)",
    frequency: "Quý",
    direction: "asc",
    startDate: "2026-01-01",
    endDate: "2026-12-31"
  },
  {
    id: 17,
    code: "KPI-HR-01",
    indicatorCode: "GRI 401-1",
    name: "Mức độ hài lòng của nhân viên",
    subName: "Employee satisfaction score",
    unit: "Điểm (1-5)",
    plan: "4.2",
    actual: "4.0",
    progress: 95,
    progressText: "-4.8%",
    isPass: true,
    dept: "Ban Tổ chức Nhân lực",
    deptId: "DEPT-007",
    creator: "Lê Minh Tuấn (Chuyên viên)",
    frequency: "Năm",
    direction: "asc",
    startDate: "2026-01-01",
    endDate: "2026-12-31"
  },
  {
    id: 18,
    code: "KPI-DIG-01",
    indicatorCode: "GRI 418-1",
    name: "Tiến độ xây dựng kho dữ liệu ESG",
    subName: "ESG Data Warehouse construction progress",
    unit: "%",
    plan: "100",
    actual: "--",
    progress: 0,
    progressText: "Chưa nộp",
    isPass: false,
    dept: "Ban Chuyển đổi số & CNTT",
    deptId: "DEPT-005",
    creator: "Đặng Quang Huy (Chuyên viên)",
    frequency: "Quý",
    direction: "asc",
    startDate: "2026-01-01",
    endDate: "2026-12-31"
  },
  {
    id: 19,
    code: "KPI-COM-01",
    indicatorCode: "Airline F-1",
    name: "Số tiền quyên góp từ thiện & cộng đồng",
    subName: "Charity donation amount",
    unit: "Triệu VNĐ",
    plan: "500",
    actual: "520",
    progress: 100,
    progressText: "+4.0%",
    isPass: true,
    dept: "Ban Truyền thông",
    deptId: "DEPT-009",
    creator: "Mai Thu Trang (Chuyên viên)",
    frequency: "Năm",
    direction: "asc",
    startDate: "2026-01-01",
    endDate: "2026-12-31"
  },
  {
    id: 20,
    code: "KPI-SVC-01",
    indicatorCode: "GRI 303-3",
    name: "Chỉ số hài lòng NPS hành khách",
    subName: "Passenger Net Promoter Score",
    unit: "Điểm",
    plan: "45",
    actual: "42.5",
    progress: 94,
    progressText: "-5.5%",
    isPass: false,
    dept: "Tổ Dịch vụ",
    deptId: "DEPT-006",
    creator: "Nguyễn Thị Mai (Chuyên viên)",
    frequency: "Quý",
    direction: "asc",
    startDate: "2026-03-01",
    endDate: "2026-09-30"
  },
  {
    id: 21,
    code: "KPI-PLAN-01",
    indicatorCode: "GRI 2-9",
    name: "Tỷ lệ KPI hoàn thành",
    subName: "Completed KPI ratio",
    unit: "%",
    plan: "70",
    actual: "--",
    progress: 0,
    progressText: "Chưa nộp",
    isPass: false,
    dept: "Ban Kế hoạch Phát triển",
    deptId: "DEPT-008",
    creator: "Vũ Minh Triết (Chuyên viên)",
    frequency: "Năm",
    direction: "asc",
    startDate: "2026-01-01",
    endDate: "2026-12-31"
  }
];

export const KPIManagePage: React.FC = () => {
  const { currentUser, isAdmin } = useAccess();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [kpis, setKpis] = useState<KPIItem[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [collapsedDepts, setCollapsedDepts] = useState<Record<string, boolean>>({});
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedKpi, setSelectedKpi] = useState<KPIItem | null>(null);
  const [activeTargetDept, setActiveTargetDept] = useState<Department | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [indicatorCode, setIndicatorCode] = useState('');
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
  const [frequency, setFrequency] = useState('Năm');
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');

  // Popup detail states
  const [popupType, setPopupType] = useState<'all' | 'inactive' | 'failed' | null>(null);

  // Load Departments & Indicators from LocalStorage
  useEffect(() => {
    // 1. Departments
    const savedDepts = localStorage.getItem('vna_esg_departments');
    if (savedDepts) {
      try {
        setDepartments(JSON.parse(savedDepts));
      } catch (e) {
        setDepartments(DEFAULT_DEPARTMENTS);
      }
    } else {
      localStorage.setItem('vna_esg_departments', JSON.stringify(DEFAULT_DEPARTMENTS));
      setDepartments(DEFAULT_DEPARTMENTS);
    }

    // 2. Indicators
    const savedInds = localStorage.getItem('vna_esg_indicators');
    if (savedInds) {
      try {
        setIndicators(JSON.parse(savedInds));
      } catch (e) {
        setIndicators(MOCK_INDICATORS_JSON);
      }
    } else {
      setIndicators(MOCK_INDICATORS_JSON);
    }

    // 3. KPIs
    const savedKpis = localStorage.getItem('vna_esg_kpis');
    if (savedKpis) {
      try {
        setKpis(JSON.parse(savedKpis));
      } catch (e) {
        setKpis(INITIAL_KPIS);
      }
    } else {
      localStorage.setItem('vna_esg_kpis', JSON.stringify(INITIAL_KPIS));
      setKpis(INITIAL_KPIS);
    }
  }, []);

  const saveKpis = (list: KPIItem[]) => {
    localStorage.setItem('vna_esg_kpis', JSON.stringify(list));
    setKpis(list);
  };

  // Check if current logged-in user can edit/setup KPI for a specific department
  const canUserManageDept = (deptName: string) => {
    if (isAdmin) return true;
    if (!currentUser.department) return false;
    const normUserDept = currentUser.department.toLowerCase().trim();
    const normTargetDept = deptName.toLowerCase().trim();
    return normTargetDept.includes(normUserDept) || normUserDept.includes(normTargetDept);
  };

  // Helper map for fast indicator lookup by ID/Code
  const indicatorMap = useMemo(() => {
    const map = new Map<string, any>();
    indicators.forEach(ind => {
      map.set(String(ind.code || ind.id), ind);
    });
    return map;
  }, [indicators]);

  // Helper function to check if KPI is currently active
  const isKpiActive = (start?: string, end?: string) => {
    if (!start || !end) return true;
    const today = '2026-07-23';
    return today >= start && today <= end;
  };

  // Helper function to format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  // Auto calculate progress and isPass when plan, actual or direction changes
  useEffect(() => {
    const pVal = parseFloat(plan);
    const aVal = parseFloat(actual);
    if (!isNaN(pVal) && !isNaN(aVal)) {
      let computedProgress = 0;
      let diffText = '';
      if (direction === 'asc') {
        computedProgress = pVal > 0 ? Math.round((aVal / pVal) * 100) : 0;
        const diff = aVal - pVal;
        const pct = pVal > 0 ? (diff / pVal) * 100 : 0;
        diffText = `${diff >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
      } else {
        computedProgress = aVal <= pVal ? 100 : Math.max(0, Math.round((pVal / aVal) * 100));
        const diff = pVal - aVal;
        const pct = pVal > 0 ? (diff / pVal) * 100 : 0;
        diffText = `${diff >= 0 ? '-' : '+'}${Math.abs(pct).toFixed(1)}%`;
      }
      setProgress(computedProgress);
      setProgressText(diffText);

      if (direction === 'asc') {
        setIsPass(aVal >= pVal);
      } else {
        setIsPass(aVal <= pVal);
      }
    } else {
      if (actual === '--' || actual === '') {
        setProgress(0);
        setProgressText('Chưa nộp');
        setIsPass(false);
      }
    }
  }, [plan, actual, direction]);

  // Filtered KPIs for overview stats card
  const filteredKpisForStats = useMemo(() => {
    return kpis.filter(k => {
      const matchesStartDate = !filterStartDate || !k.endDate || k.endDate >= filterStartDate;
      const matchesEndDate = !filterEndDate || !k.startDate || k.startDate <= filterEndDate;
      return matchesStartDate && matchesEndDate;
    });
  }, [kpis, filterStartDate, filterEndDate]);

  // Calculations for KPI Cards based on filtered dates
  const totalCount = filteredKpisForStats.length;
  const inactiveCount = useMemo(() => filteredKpisForStats.filter(item => item.actual === '--' || item.actual === '').length, [filteredKpisForStats]);
  const failedCount = useMemo(() => filteredKpisForStats.filter(item => !item.isPass).length, [filteredKpisForStats]);

  const popupItems = useMemo(() => {
    if (!popupType) return [];
    if (popupType === 'inactive') return filteredKpisForStats.filter(item => item.actual === '--' || item.actual === '');
    if (popupType === 'all') return filteredKpisForStats;
    return filteredKpisForStats.filter(item => !item.isPass);
  }, [filteredKpisForStats, popupType]);

  const popupTitle = useMemo(() => {
    if (popupType === 'inactive') return 'Danh sách KPI chưa cập nhật dữ liệu thực tế (Bộ lọc)';
    if (popupType === 'all') return 'Danh sách tất cả các KPI chỉ tiêu (Bộ lọc)';
    if (popupType === 'failed') return 'Danh sách chỉ tiêu KPI chưa đạt (Bộ lọc)';
    return '';
  }, [popupType]);

  const toggleDeptCollapse = (deptId: string) => {
    setCollapsedDepts(prev => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  const handleAddNewForDept = (targetDept: Department) => {
    setActiveTargetDept(targetDept);
    setDept(targetDept.name);

    const firstIndCode = targetDept.indicatorIds?.[0] || '';
    const firstInd = indicatorMap.get(firstIndCode);

    setIndicatorCode(firstIndCode);
    setCode(`KPI-${targetDept.id.replace('DEPT-', '')}-${Math.floor(10 + Math.random() * 90)}`);
    setName(firstInd?.name || '');
    setSubName(firstInd?.nameEn || '');
    setUnit(firstInd?.unit || '%');
    setPlan('100');
    setActual('--');
    setProgress(0);
    setProgressText('Chưa nộp');
    setIsPass(true);
    setCreator(`${currentUser.name} (${currentUser.department || 'Chuyên viên'})`);
    setFrequency('Năm');
    setDirection('asc');
    setStartDate('2026-01-01');
    setEndDate('2026-12-31');

    setSelectedKpi(null);
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleSelectIndicator = (indCode: string) => {
    setIndicatorCode(indCode);
    const ind = indicatorMap.get(indCode);
    if (ind) {
      setName(ind.name || name);
      setSubName(ind.nameEn || subName);
      setUnit(ind.unit || unit);
    }
  };

  const handleEdit = (kpi: KPIItem) => {
    setSelectedKpi(kpi);
    setCode(kpi.code);
    setIndicatorCode(kpi.indicatorCode || '');
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
    setFrequency(kpi.frequency || 'Năm');
    setDirection(kpi.direction || 'asc');
    setStartDate(kpi.startDate || '2026-01-01');
    setEndDate(kpi.endDate || '2026-12-31');

    const matchedDept = departments.find(d => d.name === kpi.dept);
    setActiveTargetDept(matchedDept || null);

    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!code || !name || !unit) {
      setToast({ message: "Vui lòng nhập đầy đủ Mã KPI, Tên và Đơn vị tính!", type: 'error' });
      return;
    }

    if (modalType === 'add') {
      const newItem: KPIItem = {
        id: Date.now(),
        code,
        indicatorCode,
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
        frequency,
        direction,
        startDate,
        endDate
      };
      const updated = [...kpis, newItem];
      saveKpis(updated);
      setToast({ message: `Đã thiết lập KPI mới cho Ban "${dept}" thành công!`, type: 'success' });
    } else if (selectedKpi) {
      const updated = kpis.map(item => item.id === selectedKpi.id ? {
        ...item,
        code,
        indicatorCode,
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
        frequency,
        direction,
        startDate,
        endDate
      } : item);
      saveKpis(updated);
      setToast({ message: "Đã cập nhật chỉ tiêu KPI thành công!", type: 'success' });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number, deptName: string) => {
    if (!canUserManageDept(deptName)) {
      setToast({ message: "Bạn chỉ được quyền xóa chỉ tiêu KPI thuộc Ban của mình!", type: 'error' });
      return;
    }
    if (confirm("Bạn có chắc chắn muốn xóa thiết lập KPI chỉ tiêu này không?")) {
      const updated = kpis.filter(item => item.id !== id);
      saveKpis(updated);
      setToast({ message: "Đã xóa KPI chỉ tiêu thành công!", type: 'info' });
    }
  };

  // Filtered departments based on search term
  const displayDepartments = useMemo(() => {
    return departments.filter(d => {
      const matchesDeptFilter = !selectedDeptFilter || d.id === selectedDeptFilter || d.name === selectedDeptFilter;
      
      const hasMatchingKpi = kpis.some(k => {
        const isDeptMatch = k.dept === d.name || k.deptId === d.id;
        const matchesSearch = !searchTerm || 
          k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          k.code.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStartDate = !filterStartDate || !k.endDate || k.endDate >= filterStartDate;
        const matchesEndDate = !filterEndDate || !k.startDate || k.startDate <= filterEndDate;
        
        return isDeptMatch && matchesSearch && matchesStartDate && matchesEndDate;
      });

      const matchesSearchName = !searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesDeptFilter && (matchesSearchName || hasMatchingKpi);
    });
  }, [departments, searchTerm, selectedDeptFilter, kpis, filterStartDate, filterEndDate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Edit/Add Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalType === 'add' ? `Thiết lập KPI Chỉ tiêu mới (${dept})` : "Cập nhật KPI chỉ tiêu"}
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
            <Button variant="primary" onClick={handleSave}>Lưu thông tin KPI</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-1 text-sm">
          {/* Target Department Badge */}
          <div className="md:col-span-2 bg-blue-50/70 p-3 rounded-lg border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-vna-blue" />
              <span className="font-bold text-vna-navy">Tổ Ban thiết lập: {dept}</span>
            </div>
            <Badge variant="blue">Gán theo Quản lý Ban</Badge>
          </div>

          {/* Indicator selector from assigned list */}
          {activeTargetDept && activeTargetDept.indicatorIds.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Chọn Chỉ tiêu được gán vào Ban này:
              </label>
              <select 
                value={indicatorCode}
                onChange={(e) => handleSelectIndicator(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue text-sm font-medium bg-white"
              >
                <option value="">-- Chọn chỉ tiêu gốc (GRI / Airline) --</option>
                {activeTargetDept.indicatorIds.map(codeId => {
                  const indObj = indicatorMap.get(codeId);
                  return (
                    <option key={codeId} value={codeId}>
                      [{codeId}] {indObj?.name || codeId} ({indObj?.unit || '%'})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <Input label="Mã KPI" value={code} onChange={(e) => setCode(e.target.value)} placeholder="VD: KPI-ENV-01" required />
          <Select 
            label="Kỳ báo cáo" 
            value={frequency} 
            onChange={(val) => setFrequency(val)}
            options={[
              { label: 'Tháng', value: 'Tháng' },
              { label: 'Quý', value: 'Quý' },
              { label: 'Năm', value: 'Năm' },
            ]}
          />
          <div className="md:col-span-2">
            <Input label="Tên Chỉ tiêu / KPI (Tiếng Việt)" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên KPI chỉ tiêu..." required />
          </div>
          <div className="md:col-span-2">
            <Input label="Tên Tiếng Anh (nếu có)" value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="English name..." />
          </div>
          <Input label="Đơn vị tính" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="VD: %, tấn, gCO2/RTK" required />
          <Input label="Chỉ tiêu Kế hoạch (Target)" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="VD: 100" />
          
          <Input label="Ngày bắt đầu áp dụng" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <Input label="Ngày kết thúc áp dụng" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />

          <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <ArrowUpDown size={16} className="text-vna-blue" />
              Cách đánh giá & chiều hướng mục tiêu:
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex items-start gap-2 text-xs font-medium cursor-pointer text-gray-700">
                <input 
                  type="radio" 
                  name="direction" 
                  checked={direction === 'asc'} 
                  onChange={() => setDirection('asc')} 
                  className="mt-0.5 w-4 h-4 text-vna-blue focus:ring-vna-blue" 
                />
                <div>
                  <span className="font-bold text-vna-blue">Càng lớn càng tốt (Chiều Thuận):</span> ĐẠT khi Giá trị thực hiện &ge; Chỉ tiêu mục tiêu. (Ví dụ: Doanh thu, Tỷ lệ pha trộn SAF, NPS, Quy trình đào tạo...)
                </div>
              </label>
              <label className="flex items-start gap-2 text-xs font-medium cursor-pointer text-gray-700 mt-1">
                <input 
                  type="radio" 
                  name="direction" 
                  checked={direction === 'desc'} 
                  onChange={() => setDirection('desc')} 
                  className="mt-0.5 w-4 h-4 text-vna-blue focus:ring-vna-blue" 
                />
                <div>
                  <span className="font-bold text-amber-600">Càng nhỏ càng tốt (Chiều Nghịch):</span> ĐẠT khi Giá trị thực hiện &le; Chỉ tiêu mục tiêu. (Ví dụ: Phát thải CO2, Số vụ việc tai nạn, Sự cố an toàn...)
                </div>
              </label>
            </div>
          </div>

          <Input label="Giá trị Thực hiện (Nhập từ hệ thống)" value={actual} disabled placeholder="VD: 95" className="bg-gray-100/70 opacity-80 cursor-not-allowed font-semibold text-gray-650" />
          <Input label="Tiến độ hoàn thành (%) (Tự động)" type="number" min="0" max="100" value={progress} disabled className="bg-gray-100/70 opacity-80 cursor-not-allowed font-semibold text-gray-650" />
          
          <div className="flex items-center gap-4 pt-6 pl-2">
            <label className="text-sm font-bold text-gray-700">Đánh giá (Tự động):</label>
            <label className="flex items-center gap-1.5 text-sm font-medium opacity-80 cursor-not-allowed">
              <input type="radio" checked={isPass} disabled className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-not-allowed" /> ĐẠT
            </label>
            <label className="flex items-center gap-1.5 text-sm font-medium opacity-80 cursor-not-allowed">
              <input type="radio" checked={!isPass} disabled className="w-4 h-4 text-red-600 focus:ring-red-500 cursor-not-allowed" /> KHÔNG ĐẠT
            </label>
          </div>

          <div className="md:col-span-2">
            <Input label="Người soạn thảo" value={creator} onChange={(e) => setCreator(e.target.value)} />
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
                  <th className="py-3 px-4 w-[22%] whitespace-nowrap">Mã KPI</th>
                  <th className="py-3 px-4 w-[35%] whitespace-nowrap">Tên chỉ tiêu</th>
                  <th className="py-3 px-4 w-[15%] whitespace-nowrap">Đơn vị</th>
                  <th className="py-3 px-4 w-[20%] whitespace-nowrap">Tổ Ban quản lý</th>
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
                      <span className="text-xs font-medium text-gray-600">{item.unit}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-vna-blue bg-blue-50 px-2 py-1 rounded border border-blue-100">
                        {item.dept}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-vna-blue tracking-tight">Quản lý KPI & Chỉ tiêu Tổ Ban</h1>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold border border-amber-200">
                <ShieldCheck size={14} /> Quyền Quản trị viên (Toàn hệ thống)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-vna-blue text-xs px-2.5 py-1 rounded-full font-bold border border-blue-200">
                <User size={14} /> Ban: {currentUser.department || 'Nhân viên'}
              </span>
            )}
          </div>
          <p className="text-black/50 text-sm mt-1">
            Thiết lập chỉ tiêu Kế hoạch và phân quyền quản lý KPI theo từng Tổ ban / Phòng ban chuyên trách
          </p>
        </div>
      </div>

      {/* 3 Clickable KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setPopupType('all')}
          className="bg-white p-5 rounded-xl border border-gray-200 border-l-4 border-l-blue-500 hover:shadow-md cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng số KPI đã thiết lập</span>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><Award size={18} /></div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-gray-700 leading-none">{totalCount}</span>
            <span className="text-sm font-semibold text-gray-400">chỉ tiêu</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Xem danh sách toàn bộ chỉ tiêu KPI đã thiết lập</p>
        </div>

        <div 
          onClick={() => setPopupType('inactive')}
          className="bg-white p-5 rounded-xl border border-gray-200 border-l-4 border-l-amber-500 hover:shadow-md cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">KPI chưa nộp thực tế</span>
            <div className="bg-amber-50 p-2 rounded-lg text-amber-500"><FileText size={18} /></div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-amber-600 leading-none">{inactiveCount}</span>
          </div>
          <p className="text-xs text-gray-400 mt-4">Xem danh sách chỉ tiêu chưa hoàn thành cập nhật thực hiện</p>
        </div>

        <div 
          onClick={() => setPopupType('failed')}
          className="bg-white p-5 rounded-xl border border-gray-200 border-l-4 border-l-red-500 hover:shadow-md cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">KPI chưa đạt mục tiêu</span>
            <div className="bg-red-50 p-2 rounded-lg text-red-500"><AlertTriangle size={18} /></div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-red-650 leading-none">{failedCount}</span>
          </div>
          <p className="text-xs text-gray-400 mt-4">Xem danh sách thực hiện dưới chỉ tiêu kế hoạch</p>
        </div>
      </div>

      {/* Control & Filter Header */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Tìm kiếm Tổ ban hoặc Mã / Tên KPI..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue bg-white text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Lọc Tổ ban:</span>
            <select 
              value={selectedDeptFilter} 
              onChange={(e) => setSelectedDeptFilter(e.target.value)} 
              className="text-sm font-bold text-vna-navy border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer focus:ring-1 focus:ring-vna-blue outline-none"
            >
              <option value="">-- Tất cả các Tổ Ban ({departments.length}) --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.indicatorIds.length} chỉ tiêu gán)
                </option>
              ))}
            </select>
          </div>

          {/* Date range filters */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <span className="text-sm font-medium text-gray-500">Từ ngày:</span>
            <input 
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm outline-none focus:ring-1 focus:ring-vna-blue"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Đến ngày:</span>
            <input 
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm outline-none focus:ring-1 focus:ring-vna-blue"
            />
          </div>

          {(filterStartDate || filterEndDate) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterStartDate('');
                setFilterEndDate('');
              }}
              className="text-xs py-1.5 px-3"
            >
              Xóa lọc ngày
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span>* Các chỉ tiêu được gán động từ chức năng **Quản lý Ban / Đơn vị**</span>
        </div>
      </div>

      {/* Main List Grouped By Departments */}
      <div className="space-y-6">
        {displayDepartments.map(deptItem => {
          const isUserDept = canUserManageDept(deptItem.name);
          const isCollapsed = !!collapsedDepts[deptItem.id];

          // Filter KPIs assigned to this department and matching search + date criteria
          const deptKpis = kpis.filter(k => {
            const isDeptMatch = k.dept === deptItem.name || k.deptId === deptItem.id;
            const matchesSearch = !searchTerm || 
              k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              k.code.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStartDate = !filterStartDate || !k.endDate || k.endDate >= filterStartDate;
            const matchesEndDate = !filterEndDate || !k.startDate || k.startDate <= filterEndDate;
            
            return isDeptMatch && matchesSearch && matchesStartDate && matchesEndDate;
          });

          // Get assigned indicators list from department config
          const assignedIndicatorCodes = deptItem.indicatorIds || [];

          return (
            <Card key={deptItem.id} className="p-0 overflow-hidden border border-gray-200 bg-white shadow-sm transition-all">
              {/* Department Group Header */}
              <div 
                className={`p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 cursor-pointer ${isUserDept ? 'bg-blue-50/50' : 'bg-gray-50/70'
                  }`}
                onClick={() => toggleDeptCollapse(deptItem.id)}
              >
                <div className="flex items-center gap-3">
                  <button className="text-gray-400 hover:text-gray-600">
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-xs text-vna-blue">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-vna-navy">{deptItem.name}</h2>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                        {assignedIndicatorCodes.length} chỉ tiêu gán
                      </span>
                      {isUserDept ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <CheckCircle size={12} /> Được phép thiết lập KPI
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-[11px] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                          <Lock size={12} /> Chỉ đọc (Khác Ban)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Mã đơn vị: <span className="font-mono font-semibold">{deptItem.id}</span> • Đã lập {deptKpis.length}/{assignedIndicatorCodes.length} chỉ tiêu KPI
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  {isUserDept ? (
                    <Button 
                      variant="primary" 
                      onClick={() => handleAddNewForDept(deptItem)}
                      className="text-xs py-1.5 shadow-sm"
                    >
                      <Plus size={14} className="mr-1" /> Thiết lập KPI mới
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      disabled 
                      className="text-xs py-1.5 opacity-60 cursor-not-allowed"
                      title="Chỉ thành viên phòng ban hoặc Admin mới được phép thêm KPI cho Ban này"
                    >
                      <Lock size={12} className="mr-1" /> Khóa thao tác
                    </Button>
                  )}
                </div>
              </div>

              {/* Department Table Body */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1250px] text-sm">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-3 px-4 text-center w-[4%]">STT</th>
                        <th className="py-3 px-4 w-[28%]">MÃ KPI, TÊN CHỈ TIÊU & THỜI HẠN</th>
                        <th className="py-3 px-4 w-[12%]">MÃ CHỈ TIÊU GỐC</th>
                        <th className="py-3 px-4 w-[10%]">ĐƠN VỊ TÍNH</th>
                        <th className="py-3 px-4 text-center w-[10%]">KẾ HOẠCH (TARGET)</th>
                        <th className="py-3 px-4 text-center w-[10%]">THỰC HIỆN</th>
                        <th className="py-3 px-4 w-[15%]">TIẾN ĐỘ THỰC HIỆN</th>
                        <th className="py-3 px-4 text-center w-[10%]">ĐÁNH GIÁ</th>
                        <th className="py-3 px-4 text-center w-[10%]">THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {/* Render set of KPIs assigned to this department */}
                      {deptKpis.map((kpi, idx) => (
                        <tr key={kpi.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-vna-blue text-xs flex items-center gap-1.5 flex-wrap">
                              {kpi.code}
                              {kpi.direction === 'desc' ? (
                                <span className="bg-amber-50 text-amber-700 text-[10px] px-1 rounded font-normal border border-amber-100">
                                  Càng nhỏ càng tốt
                                </span>
                              ) : (
                                <span className="bg-blue-50 text-vna-blue text-[10px] px-1 rounded font-normal border border-blue-100">
                                  Càng lớn càng tốt
                                </span>
                              )}
                              {isKpiActive(kpi.startDate, kpi.endDate) ? (
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1 rounded font-medium border border-emerald-100 animate-pulse">
                                  Đang hiệu lực
                                </span>
                              ) : (
                                <span className="bg-red-50 text-red-700 text-[10px] px-1 rounded font-medium border border-red-100">
                                  Hết hiệu lực
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-gray-900 mt-0.5">{kpi.name}</div>
                            {kpi.subName && <div className="text-[11px] text-gray-400 mt-0.5">{kpi.subName}</div>}
                            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                              <Calendar size={12} className="text-gray-400 shrink-0" />
                              <span>Áp dụng: {formatDate(kpi.startDate)} - {formatDate(kpi.endDate)}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {kpi.indicatorCode ? (
                              <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                {kpi.indicatorCode}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 font-medium text-xs">{kpi.unit}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-gray-800">{kpi.plan || '--'}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-gray-900">{kpi.actual || '--'}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex justify-between items-center mb-1 text-xs">
                              <span className="text-gray-500 text-[11px]">
                                {kpi.isPass ? 'Đạt tiến độ' : 'Chậm tiến độ'}
                              </span>
                              <span className={`font-bold ${kpi.isPass ? 'text-emerald-600' : 'text-red-650'}`}>
                                {kpi.progressText}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${kpi.isPass ? 'bg-emerald-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold ${kpi.isPass ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                              }`}>
                              {kpi.isPass ? 'ĐẠT' : 'CHƯA ĐẠT'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {isUserDept ? (
                                <>
                                  <button 
                                    onClick={() => handleEdit(kpi)}
                                    className="p-1.5 text-vna-blue hover:bg-blue-50 rounded-md transition-colors" 
                                    title="Chỉnh sửa KPI chỉ tiêu"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(kpi.id, deptItem.name)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" 
                                    title="Xóa KPI"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Lock size={12} /> Xem
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Display unconfigured indicators assigned to this department - only if date filters are empty */}
                      {!filterStartDate && !filterEndDate && assignedIndicatorCodes
                        .filter(codeId => !deptKpis.some(k => k.indicatorCode === codeId))
                        .map((codeId, idx) => {
                          const indObj = indicatorMap.get(codeId);
                          return (
                            <tr key={codeId} className="bg-amber-50/20 hover:bg-amber-50/40 transition-colors border-dashed">
                              <td className="py-3.5 px-4 text-center text-gray-400 font-medium">
                                {deptKpis.length + idx + 1}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-gray-600 text-xs italic">Chưa thiết lập KPI</div>
                                <div className="font-medium text-gray-800 mt-0.5">{indObj?.name || codeId}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  {codeId}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-gray-500 text-xs">{indObj?.unit || '%'}</td>
                              <td className="py-3.5 px-4 text-center text-gray-400 italic">Chưa lập</td>
                              <td className="py-3.5 px-4 text-center text-gray-400 italic">--</td>
                              <td className="py-3.5 px-4 text-gray-400 text-xs italic">Chưa nộp</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="text-xs text-gray-400 font-medium">Chưa có</span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {isUserDept ? (
                                  <Button 
                                    variant="secondary" 
                                    onClick={() => {
                                      setActiveTargetDept(deptItem);
                                      setDept(deptItem.name);
                                      handleSelectIndicator(codeId);
                                      setCode(`KPI-${deptItem.id.replace('DEPT-', '')}-${Math.floor(10 + Math.random() * 90)}`);
                                      setPlan('100');
                                      setActual('--');
                                      setProgress(0);
                                      setProgressText('Chưa nộp');
                                      setIsPass(true);
                                      setCreator(`${currentUser.name} (${currentUser.department || 'Chuyên viên'})`);
                                      setFrequency('Năm');
                                      setDirection('asc');
                                      setStartDate('2026-01-01');
                                      setEndDate('2026-12-31');
                                      setSelectedKpi(null);
                                      setModalType('add');
                                      setIsModalOpen(true);
                                    }}
                                    className="text-[11px] py-1 px-2 h.7 shadow-2xs"
                                  >
                                    + Thiết lập KPI
                                  </Button>
                                ) : (
                                  <span className="text-xs text-gray-400 italic">Khóa</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                      {deptKpis.length === 0 && (assignedIndicatorCodes.length === 0 || filterStartDate || filterEndDate) && (
                        <tr>
                          <td colSpan={9} className="py-6 text-center text-gray-400 text-xs font-medium">
                            {filterStartDate || filterEndDate 
                              ? "Không tìm thấy KPI nào hoạt động trong khoảng thời gian đã chọn."
                              : "Ban này chưa có chỉ tiêu nào được gán trong chức năng Quản lý Ban / Đơn vị."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })}

        {displayDepartments.length === 0 && (
          <Card className="p-8 text-center text-gray-500">
            Không tìm thấy Tổ ban hoặc KPI nào phù hợp với bộ lọc tìm kiếm.
          </Card>
        )}
      </div>
    </div>
  );
};
