// Helper function to extract VI/EN name from bilingual indicator strings
const getLocalizedIndicatorName = (name?: string, lang: 'vi' | 'en' = 'vi'): string => {
  if (!name) return '';
  if (name.includes('/')) {
    const parts = name.split('/').map(p => p.trim());
    if (parts.length >= 2) {
      // In data/indicators_main_list.json: parts[0] is English, parts[1] is Vietnamese
      return lang === 'vi' ? (parts[1] || parts[0]) : (parts[0] || parts[1]);
    }
  }
  const parenMatch = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const enPart = parenMatch[1].trim();
    const viPart = parenMatch[2].trim();
    return lang === 'vi' ? (viPart || enPart) : (enPart || viPart);
  }
  return name;
};

// Helper function to get KPI name according to selected system language
const getKpiDisplayName = (kpi: KPIItem, lang: 'vi' | 'en' = 'vi'): string => {
  if (lang === 'vi') {
    // When Vietnamese is selected:
    if (kpi.name) {
      if (kpi.name.includes('/')) {
        return getLocalizedIndicatorName(kpi.name, 'vi');
      }
      return kpi.name;
    }
    return kpi.subName ? getLocalizedIndicatorName(kpi.subName, 'vi') : '';
  } else {
    // When English is selected:
    if (kpi.subName && kpi.subName.trim()) {
      return kpi.subName.trim();
    }
    if (kpi.name) {
      if (kpi.name.includes('/')) {
        return getLocalizedIndicatorName(kpi.name, 'en');
      }
      return kpi.name;
    }
    return '';
  }
};

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
  History,
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
  ArrowUp,
  ArrowDown,
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
    id: 112,
    code: "KPI-SAF-01",
    indicatorCode: "Airline E-1",
    name: "Sự cố bắt buộc phải báo cáo",
    subName: "Mandatory occurrence reporting (MOR)",
    unit: "Số vụ việc/1,000 chuyến bay",
    plan: "2.00",
    actual: "1.95",
    progress: 90,
    progressText: "-2.5%",
    isPass: true,
    dept: "Ban An toàn chất lượng (Ban ATCL)",
    deptId: "DEPT-002",
    creator: "Trần Văn Nam (Chuyên viên)",
    frequency: "Năm",
    direction: "desc",
    startDate: "2025-01-01",
    endDate: "2025-12-31"
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
    id: 113,
    code: "KPI-SAF-02",
    indicatorCode: "9",
    name: "Tai nạn mức A /10,000 chuyến bay",
    subName: "Level A accidents per 10k flights",
    unit: "Số vụ việc/10,000 cb",
    plan: "4.00",
    actual: "3.10",
    progress: 75,
    progressText: "-22.5%",
    isPass: true,
    dept: "Ban An toàn chất lượng (Ban ATCL)",
    deptId: "DEPT-002",
    creator: "Trần Văn Nam (Chuyên viên)",
    frequency: "Năm",
    direction: "desc",
    startDate: "2025-01-01",
    endDate: "2025-12-31"
  },
  {
    id: 14,
    code: "KPI-OPS-01",
    indicatorCode: "GRI 302-1",
    name: "Tiêu thụ năng lượng khai thác bay (Kỳ 2)",
    subName: "Energy consumption within organization (H2)",
    unit: "TJ",
    plan: "15500",
    actual: "15100",
    progress: 98,
    progressText: "-2.6%",
    isPass: true,
    dept: "Tổ Khai thác (TTĐHKT)",
    deptId: "DEPT-001",
    creator: "Nguyễn Văn Hùng (Chuyên viên)",
    frequency: "Quý",
    direction: "desc",
    startDate: "2026-07-01",
    endDate: "2026-12-31"
  },
  {
    id: 114,
    code: "KPI-OPS-01",
    indicatorCode: "GRI 302-1",
    name: "Tiêu thụ năng lượng khai thác bay (Kỳ 1)",
    subName: "Energy consumption within organization (H1)",
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
    id: 214,
    code: "KPI-OPS-01",
    indicatorCode: "GRI 302-1",
    name: "Tiêu thụ năng lượng khai thác bay 2025",
    subName: "Energy consumption within organization 2025",
    unit: "TJ",
    plan: "16000",
    actual: "15800",
    progress: 95,
    progressText: "-1.25%",
    isPass: true,
    dept: "Tổ Khai thác (TTĐHKT)",
    deptId: "DEPT-001",
    creator: "Nguyễn Văn Hùng (Chuyên viên)",
    frequency: "Năm",
    direction: "desc",
    startDate: "2025-01-01",
    endDate: "2025-12-31"
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
    id: 115,
    code: "KPI-ENV-01",
    indicatorCode: "4",
    name: "Cường độ phát thải CO2 (2025)",
    subName: "CO2 Emission Intensity (2025)",
    unit: "gCO2/RTK",
    plan: "780",
    actual: "775",
    progress: 100,
    progressText: "-0.6%",
    isPass: true,
    dept: "Tổ Kỹ thuật (Ban QLVT)",
    deptId: "DEPT-003",
    creator: "Phạm Hoàng Nam (Chuyên viên)",
    frequency: "Năm",
    direction: "desc",
    startDate: "2025-01-01",
    endDate: "2025-12-31"
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
    id: 116,
    code: "KPI-ENV-02",
    indicatorCode: "5",
    name: "Tỷ lệ pha trộn SAF thực tế (2025)",
    subName: "Actual SAF blending ratio (2025)",
    unit: "%",
    plan: "3.0",
    actual: "3.2",
    progress: 106,
    progressText: "+6.7%",
    isPass: true,
    dept: "Tổ Kỹ thuật (Ban QLVT)",
    deptId: "DEPT-003",
    creator: "Nguyễn Hoàng Anh (Chuyên viên)",
    frequency: "Năm",
    direction: "asc",
    startDate: "2025-01-01",
    endDate: "2025-12-31"
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

const KPI_MAPPINGS: Record<string, { kpiCode: string; kpiName: string }[]> = {
  "Airline E-1": [
    { kpiCode: "Airline E-1", kpiName: "Noise Compliance/ Tiếng ồn" }
  ],
  "GRI 418-1": [
    { kpiCode: "GRI 418-1", kpiName: "Các sự cố liên quan đến dữ liệu cá nhân/ Substantiated complaints concerning breaches of customer privacy and losses of customer data" }
  ],
  "GRI 2-7": [
    { kpiCode: "GRI 2-7", kpiName: "Quy mô tổ chức/Scale of organization" }
  ],
  "GRI 401-1": [
    { kpiCode: "GRI 401-1", kpiName: "Tuyển mới và nghỉ việc/New employee hires and employee turnover" }
  ],
  "GRI 405-1": [
    { kpiCode: "GRI 405-1", kpiName: "Diversity of governance bodies and employees/Đa dạng trong cơ quan quản trị" }
  ],
  "GRI 406-1": [
    { kpiCode: "GRI 406-1", kpiName: "Incidents of discrimination and corrective actions taken/Số sự cố phân biệt đối xử và biện pháp xử lý" }
  ],
  "GRI 416-2": [
    { kpiCode: "GRI 416-2", kpiName: "Các sự cố vi phạm liên quan đến tác động sức khỏe và an toàn của sản phẩm/dịch vụ / Incidents of non-compliance concerning the health and safety impacts of products and services" }
  ],
  "GRI 417-2": [
    { kpiCode: "GRI 417-2", kpiName: "Các sự cố vi phạm về thông tin và nhãn sản phẩm/dịch vụ / Incidents of non-compliance concerning product and service information and labeling" }
  ],
  "Airline B-1": [
    { kpiCode: "Airline B-1_01", kpiName: "NPS (DOM)" },
    { kpiCode: "Airline B-1_02", kpiName: "NPS (INT)" }
  ],
  "GRI 303-3": [
    { kpiCode: "GRI 303-3", kpiName: "Water withdrawal/Lượng nước cấp lên" }
  ],
  "GRI 303-5": [
    { kpiCode: "GRI 303-5", kpiName: "Water consumption/Lượng nước tiêu thụ" }
  ],
  "GRI 302-1": [
    { kpiCode: "GRI 302-1", kpiName: "Energy consumption within the organization/Năng lượng tiêu thụ trong tổ chức" }
  ],
  "GRI 302-4": [
    { kpiCode: "GRI 302-4", kpiName: "Reduction of energy consumption/Giảm tiêu thụ năng lượng" }
  ],
  "GRI 305-1": [
    { kpiCode: "GRI 305-1", kpiName: "Direct (Scope 1) GHG emissions/Phát thải khí nhà kính trực tiếp (Phạm vi 1)" }
  ],
  "GRI 305-4": [
    { kpiCode: "GRI 305-4", kpiName: "GHG emissions intensity/Cường độ phát thải khí nhà kính" }
  ],
  "GRI 305-5": [
    { kpiCode: "GRI 305-5", kpiName: "Reduction of GHG emissions/Giảm phát thải khí nhà kính" }
  ],
  "Không thuộc GRI": [
    { kpiCode: "SAF", kpiName: "SAF report/Báo cáo sử dụng SAF" }
  ],
  "4": [
    { kpiCode: "SAF", kpiName: "SAF report/Báo cáo sử dụng SAF" }
  ],
  "GRI 417-3": [
    { kpiCode: "GRI 417-3", kpiName: "Incidents of non-compliance concerning marketing communications/Các vụ việc không tuân thủ liên quan đến truyền thông marketing" }
  ],
  "Airline F-1": [
    { kpiCode: "Airline F-1", kpiName: "Volunteering during working hours/Tham gia hoạt động tình nguyện" }
  ],
  "Airline B-2": [
    { kpiCode: "Airline B-2", kpiName: "Customer engagement/Tương tác khách hàng" }
  ]
};

const isVietnamese = (text: string) => {
  const vnRegex = /[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/i;
  return vnRegex.test(text);
};

export const KPIManagePage: React.FC = () => {
  const { currentUser, isAdmin } = useAccess();
  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>(
    () => (localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi'
  );

  useEffect(() => {
    const handleLangChange = () => {
      setCurrentLang((localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi');
    };
    window.addEventListener('vna_language_changed', handleLangChange);
    return () => window.removeEventListener('vna_language_changed', handleLangChange);
  }, []);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [kpis, setKpis] = useState<KPIItem[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [collapsedDepts, setCollapsedDepts] = useState<Record<string, boolean>>({});

  // Column Filters for KPI Table
  const [searchIndicatorCode, setSearchIndicatorCode] = useState('');
  const [searchKpiName, setSearchKpiName] = useState('');
  const [searchDeadline, setSearchDeadline] = useState('');
  const [searchEvaluation, setSearchEvaluation] = useState('');

  // Column Sorting
  const [sortField, setSortField] = useState<'indicatorCode' | 'name' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const handleToggleSort = (field: 'indicatorCode' | 'name') => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortField(null);
      setSortOrder(null);
    }
  };

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
  const [historyModalTarget, setHistoryModalTarget] = useState<{ kpi?: KPIItem; indicatorCode?: string; indObj?: any; deptItem: Department } | null>(null);

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
        const parsed = JSON.parse(savedKpis);
        if (!Array.isArray(parsed) || parsed.length < INITIAL_KPIS.length) {
          localStorage.setItem('vna_esg_kpis', JSON.stringify(INITIAL_KPIS));
          setKpis(INITIAL_KPIS);
        } else {
          setKpis(parsed);
        }
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
    setCode(''); // reset KPI Code
    const mappedKpis = KPI_MAPPINGS[indCode];
    if (mappedKpis && mappedKpis.length > 0) {
      setName('');
      setSubName('');
      const ind = indicatorMap.get(indCode);
      if (ind) {
        setUnit(ind.unit || unit);
      }
    } else {
      const ind = indicatorMap.get(indCode);
      if (ind) {
        setName(ind.name || name);
        setSubName(ind.nameEn || subName);
        setUnit(ind.unit || unit);
      }
    }
  };

  const handleSelectKpiCode = (kpiCode: string) => {
    setCode(kpiCode);
    const mappedKpis = KPI_MAPPINGS[indicatorCode];
    if (mappedKpis) {
      const matched = mappedKpis.find(item => item.kpiCode === kpiCode);
      if (matched) {
        const fullName = matched.kpiName;
        if (fullName.includes('/')) {
          const parts = fullName.split('/');
          const part1 = parts[0].trim();
          const part2 = parts[1].trim();
          if (isVietnamese(part1)) {
            setName(part1);
            setSubName(part2);
          } else if (isVietnamese(part2)) {
            setName(part2);
            setSubName(part1);
          } else {
            setName(part1);
            setSubName(part2);
          }
        } else {
          setName(fullName);
          setSubName('');
        }
      }
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

  // Filtered departments based on search term and column filters
  const displayDepartments = useMemo(() => {
    return departments.filter(d => {
      const matchesDeptFilter = !selectedDeptFilter || d.id === selectedDeptFilter || d.name === selectedDeptFilter;

      const hasMatchingKpi = kpis.some(k => {
        const isDeptMatch = k.dept === d.name || k.deptId === d.id;
        const isActive = isKpiActive(k.startDate, k.endDate);
        if (!isActive) return false;

        const matchesCode = !searchIndicatorCode || (k.indicatorCode || '').toLowerCase().includes(searchIndicatorCode.toLowerCase());
        const kpiDisplayName = getKpiDisplayName(k, currentLang).toLowerCase();
        const matchesName = !searchKpiName || kpiDisplayName.includes(searchKpiName.toLowerCase()) || (k.name || '').toLowerCase().includes(searchKpiName.toLowerCase());
        const matchesDeadline = !searchDeadline || (k.startDate || '').includes(searchDeadline) || (k.endDate || '').includes(searchDeadline) || formatDate(k.startDate).includes(searchDeadline) || formatDate(k.endDate).includes(searchDeadline);
        const matchesEval = !searchEvaluation || (searchEvaluation === 'PASS' && k.isPass) || (searchEvaluation === 'FAIL' && !k.isPass);

        return isDeptMatch && matchesCode && matchesName && matchesDeadline && matchesEval;
      });

      const hasMatchingUnconfigured = (d.indicatorIds || []).some(codeId => {
        const ind = indicatorMap.get(codeId);
        const matchesCode = !searchIndicatorCode || codeId.toLowerCase().includes(searchIndicatorCode.toLowerCase());
        const indName = ind ? getLocalizedIndicatorName(ind.name, currentLang).toLowerCase() : '';
        const matchesName = !searchKpiName || indName.includes(searchKpiName.toLowerCase()) || codeId.toLowerCase().includes(searchKpiName.toLowerCase());
        const matchesDeadline = !searchDeadline;
        const matchesEval = !searchEvaluation || searchEvaluation === 'UNCONFIGURED';

        return matchesCode && matchesName && matchesDeadline && matchesEval;
      });

      const hasAnyFilter = Boolean(searchIndicatorCode || searchKpiName || searchDeadline || searchEvaluation);

      return matchesDeptFilter && (!hasAnyFilter || hasMatchingKpi || hasMatchingUnconfigured);
    });
  }, [departments, selectedDeptFilter, kpis, searchIndicatorCode, searchKpiName, searchDeadline, searchEvaluation, currentLang, indicatorMap]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Edit/Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? `Thiết lập KPI` : "Cập nhật KPI"}
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSave}>Lưu</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-1 text-sm">
          {/* Target Department Badge */}
          {/* <div className="md:col-span-2 bg-blue-50/70 p-3 rounded-lg border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-vna-blue" />
              <span className="font-bold text-vna-navy">Tổ Ban thiết lập: {dept}</span>
            </div>
            <Badge variant="blue">Gán theo Quản lý Ban</Badge>
          </div> */}

          {/* Indicator selector from assigned list */}
          {activeTargetDept && activeTargetDept.indicatorIds.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Chỉ tiêu:
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

          {/* {KPI_MAPPINGS[indicatorCode] && KPI_MAPPINGS[indicatorCode].length > 0 ? (
            <div className="w-full text-left">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mã KPI <span className="text-red-500">*</span>
              </label>
              <select
                value={code}
                onChange={(e) => handleSelectKpiCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue text-sm font-medium bg-white text-gray-700"
                required
              >
                <option value="">-- Chọn Mã KPI --</option>
                {KPI_MAPPINGS[indicatorCode].map(opt => (
                  <option key={opt.kpiCode} value={opt.kpiCode}>
                    {opt.kpiCode}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <Input label="Mã KPI" value={code} onChange={(e) => setCode(e.target.value)} placeholder="VD: KPI-ENV-01" required />
          )} */}
          {/* <Select
            label="Kỳ báo cáo"
            value={frequency}
            onChange={(val) => setFrequency(val)}
            options={[
              { label: 'Tháng', value: 'Tháng' },
              { label: 'Quý', value: 'Quý' },
              { label: 'Năm', value: 'Năm' },
            ]}
          /> */}
          <div className="md:col-span-2">
            <Input label="Tên KPI" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên KPI chỉ tiêu..." required />
          </div>
          {/* <div className="md:col-span-2">
            <Input label="Tên Tiếng Anh (nếu có)" value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="English name..." />
          </div> */}





          <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <ArrowUpDown size={16} className="text-vna-blue" />
              Chiều đánh giá KPI:
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
                  <span className="font-bold text-vna-blue">ĐẠT khi số thực hiện &ge; Số kế hoạch.</span>
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
                  <span className="font-bold text-amber-600">ĐẠT khi số thực hiện &le; Số kế hoạch.</span>
                </div>
              </label>
            </div>
          </div>
          <Input label="Số kế hoạch" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="VD: 100" />
          <Input label="Số thực hiện (Tự động từ hệ thống)" value={actual} disabled placeholder="VD: 95" className="bg-gray-100/70 opacity-80 cursor-not-allowed font-semibold text-gray-650" />
          <Input label="Đơn vị tính" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="VD: %, tấn, gCO2/RTK" required />
          <Input label="Tiến độ hoàn thành (%)" type="number" min="0" max="100" value={progress} disabled className="bg-gray-100/70 opacity-80 cursor-not-allowed font-semibold text-gray-650" />
          <Input label="Ngày áp dụng" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <Input label="Ngày kết thúc" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          <div className="flex items-center gap-4 pt-6 pl-2">
            <label className="text-sm font-bold text-gray-700">Đánh giá:</label>
            <label className="flex items-center gap-1.5 text-sm font-medium opacity-80 cursor-not-allowed">
              <input type="radio" checked={isPass} disabled className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-not-allowed" /> ĐẠT
            </label>
            <label className="flex items-center gap-1.5 text-sm font-medium opacity-80 cursor-not-allowed">
              <input type="radio" checked={!isPass} disabled className="w-4 h-4 text-red-600 focus:ring-red-500 cursor-not-allowed" /> KHÔNG ĐẠT
            </label>
          </div>

          {/* <div className="md:col-span-2">
            <Input label="Người soạn thảo" value={creator} onChange={(e) => setCreator(e.target.value)} />
          </div> */}
        </div>
      </Modal>


      {/* KPI HISTORY MODAL */}
      {historyModalTarget && (
        <Modal
          isOpen={!!historyModalTarget}
          onClose={() => setHistoryModalTarget(null)}
          title="Lịch sử KPI"
          size="lg"
        // footer={
        //   <div className="flex justify-between items-center w-full">
        //     <span className="text-xs text-gray-500 italic">
        //       * Bao gồm tất cả các kỳ báo cáo đang có hiệu lực và đã hết hiệu lực của mã KPI này.
        //     </span>
        //     <Button variant="primary" onClick={() => setHistoryModalTarget(null)}>
        //       Đóng
        //     </Button>
        //   </div>
        // }
        >
          {(() => {
            const { kpi, indicatorCode, indObj, deptItem } = historyModalTarget;
            const targetCode = indicatorCode || kpi?.indicatorCode;
            const targetDept = deptItem.name;
            const indInfo = indObj || (targetCode ? indicatorMap.get(targetCode) : null);
            const indicatorName = kpi?.name || indInfo?.name || targetCode;

            // Fetch all records belonging to this department and indicator / KPI
            const allMatchingRecords = kpis.filter(k => {
              const isDept = k.dept === targetDept || k.deptId === deptItem.id;
              const isInd = targetCode && (k.indicatorCode === targetCode || k.code === kpi?.code);
              return isDept && isInd;
            }).sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));

            return (
              <div className="space-y-4 text-left">
                {/* Header Summary Card */}
                <div className="p-3.5 bg-blue-50/50 border border-blue-150 rounded-xl flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-vna-blue bg-white px-2 py-0.5 rounded border border-blue-200">
                        {targetCode || kpi?.code || '--'}
                      </span>
                      <h4 className="font-bold text-gray-800 text-sm">{indicatorName}</h4>
                    </div>
                    {/* <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span>Đơn vị: <strong>{targetDept}</strong></span>
                      <span>•</span>
                      <span>ĐVT: <strong>{kpi?.unit || indInfo?.unit || '%'}</strong></span>
                    </p> */}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-600 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs">
                      Tổng {allMatchingRecords.length} kỳ
                    </span>
                  </div>
                </div>

                {/* History Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100/80 border-b border-gray-200 font-bold text-gray-600 uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-3 text-center w-[6%]">STT</th>
                        <th className="py-2.5 px-3 w-[22%]">THỜI GIAN ÁP DỤNG</th>
                        <th className="py-2.5 px-3 text-center w-[12%]">KẾ HOẠCH</th>
                        <th className="py-2.5 px-3 text-center w-[12%]">THỰC HIỆN</th>
                        <th className="py-2.5 px-3 w-[22%]">ĐÁNH GIÁ</th>
                        <th className="py-2.5 px-3 w-[14%]">NGƯỜI LẬP</th>
                        <th className="py-2.5 px-3 text-center w-[12%]">TRẠNG THÁI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {allMatchingRecords.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400 italic">
                            Chưa có dữ liệu kỳ lịch sử nào được ghi nhận cho mã KPI này.
                          </td>
                        </tr>
                      ) : (
                        allMatchingRecords.map((rec, rIdx) => {
                          const active = isKpiActive(rec.startDate, rec.endDate);
                          return (
                            <tr key={rec.id} className={active ? 'bg-blue-50/20 font-medium' : 'hover:bg-gray-50'}>
                              <td className="py-2.5 px-3 text-center text-gray-500 font-bold">{rIdx + 1}</td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-gray-800 flex items-center gap-1">
                                  <Calendar size={12} className="text-gray-400" />
                                  <span>{formatDate(rec.startDate)} - {formatDate(rec.endDate)}</span>
                                </div>
                                {/* <div className="text-[10px] text-gray-400 font-mono mt-0.5">Tần suất: {rec.frequency || 'Năm'}</div> */}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-gray-700">
                                {rec.plan || '--'} {rec.unit}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-gray-900">
                                {rec.actual || '--'} {rec.unit}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rec.isPass ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    {rec.isPass ? 'ĐẠT' : 'CHƯA ĐẠT'}
                                  </span>
                                  <span className={`text-[11px] font-bold ${rec.isPass ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {rec.progressText}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-1.5 rounded-full ${rec.isPass ? 'bg-emerald-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(Math.max(rec.progress, 0), 100)}%` }}
                                  ></div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-gray-600">
                                <span className="truncate block max-w-[120px]" title={rec.creator}>{rec.creator || '--'}</span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {active ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                                    <CheckCircle size={10} /> Đang hiệu lực
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded border border-gray-200">
                                    <Clock size={10} /> Hết hiệu lực
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

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

      {/* 3 Clickable KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setPopupType('all')}
          className="bg-white p-5 rounded-xl border border-gray-200 border-l-4 border-l-blue-500 hover:shadow-md cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng số KPI</span>
            {/* <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><Award size={18} /></div> */}
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-gray-700 leading-none">{totalCount}</span>
            {/* <span className="text-sm font-semibold text-gray-400">chỉ tiêu</span> */}
          </div>
          {/* <p className="text-xs text-gray-400 mt-2">Xem danh sách toàn bộ chỉ tiêu KPI đã thiết lập</p> */}
        </div>

        <div
          onClick={() => setPopupType('inactive')}
          className="bg-white p-5 rounded-xl border border-gray-200 border-l-4 border-l-amber-500 hover:shadow-md cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chưa có KPI</span>
            {/* <div className="bg-amber-50 p-2 rounded-lg text-amber-500"><FileText size={18} /></div> */}
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-amber-600 leading-none">{inactiveCount}</span>
          </div>
          {/* <p className="text-xs text-gray-400 mt-4">Xem danh sách chỉ tiêu chưa hoàn thành cập nhật thực hiện</p> */}
        </div>

        <div
          onClick={() => setPopupType('failed')}
          className="bg-white p-5 rounded-xl border border-gray-200 border-l-4 border-l-red-500 hover:shadow-md cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">KPI chưa đạt</span>
            {/* <div className="bg-red-50 p-2 rounded-lg text-red-500"><AlertTriangle size={18} /></div> */}
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-red-650 leading-none">{failedCount}</span>
          </div>
          {/* <p className="text-xs text-gray-400 mt-4">Xem danh sách thực hiện dưới chỉ tiêu kế hoạch</p> */}
        </div>
      </div>

      {/* Main List Grouped By Departments */}
      <div className="space-y-6">
        {displayDepartments.map(deptItem => {
          const isUserDept = canUserManageDept(deptItem.name);
          const isCollapsed = !!collapsedDepts[deptItem.id];

          // Get assigned indicators list from department config
          const assignedIndicatorCodes = deptItem.indicatorIds || [];

          // Filter KPIs assigned to this department and matching search criteria
          // Chỉ hiển thị các KPI đang có hiệu lực trong bảng chính của từng Ban
          let deptKpis = kpis.filter(k => {
            const isDeptMatch = k.dept === deptItem.name || k.deptId === deptItem.id;
            const isActive = isKpiActive(k.startDate, k.endDate);
            if (!isActive || !isDeptMatch) return false;

            const matchesCode = !searchIndicatorCode || (k.indicatorCode || '').toLowerCase().includes(searchIndicatorCode.toLowerCase());
            const kpiDisplayName = getKpiDisplayName(k, currentLang).toLowerCase();
            const matchesName = !searchKpiName || kpiDisplayName.includes(searchKpiName.toLowerCase()) || (k.name || '').toLowerCase().includes(searchKpiName.toLowerCase());
            const matchesDeadline = !searchDeadline || (k.startDate || '').includes(searchDeadline) || (k.endDate || '').includes(searchDeadline) || formatDate(k.startDate).includes(searchDeadline) || formatDate(k.endDate).includes(searchDeadline);
            const matchesEval = !searchEvaluation || (searchEvaluation === 'PASS' && k.isPass) || (searchEvaluation === 'FAIL' && !k.isPass);

            return matchesCode && matchesName && matchesDeadline && matchesEval;
          });

          // Apply Sorting to deptKpis
          if (sortField === 'indicatorCode') {
            deptKpis = [...deptKpis].sort((a, b) => {
              const codeA = a.indicatorCode || '';
              const codeB = b.indicatorCode || '';
              return sortOrder === 'asc' ? codeA.localeCompare(codeB) : codeB.localeCompare(codeA);
            });
          } else if (sortField === 'name') {
            deptKpis = [...deptKpis].sort((a, b) => {
              const nameA = getKpiDisplayName(a, currentLang) || '';
              const nameB = getKpiDisplayName(b, currentLang) || '';
              return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            });
          }

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
                  {/* <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-xs text-vna-blue">
                    <Building2 size={20} />
                  </div> */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-vna-navy">{deptItem.name}</h2>
                    </div>
                  </div>
                </div>

                {/* Đã lập KPI chuyển sang cuối thẻ */}
                <div className="text-xs font-semibold text-gray-500 flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-2xs">
                  {/* <span>Đã lập</span> */}
                  <span className="font-bold text-vna-blue">{deptKpis.length}</span>/
                  <span className="font-bold text-gray-700">{assignedIndicatorCodes.length}</span>
                  <span>KPI</span>
                </div>

                {/* <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
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
                </div> */}
              </div>

              {/* Department Table Body */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1250px] text-sm">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-3 px-4 text-center w-[4%]">STT</th>

                        {/* Cột Mã chỉ tiêu gốc - Có Sắp xếp Sort */}
                        <th
                          onClick={() => handleToggleSort('indicatorCode')}
                          className="py-3 px-4 w-[12%] cursor-pointer select-none hover:bg-gray-100 transition-colors"
                          title={currentLang === 'vi' ? 'Nhấn để sắp xếp theo Mã chỉ tiêu' : 'Click to sort by Indicator Code'}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span>{currentLang === 'vi' ? 'MÃ CHỈ TIÊU' : 'INDICATOR CODE'}</span>
                            <span className="text-gray-400">
                              {sortField === 'indicatorCode' && sortOrder === 'asc' ? <ArrowUp size={14} className="text-vna-blue font-bold" /> :
                                sortField === 'indicatorCode' && sortOrder === 'desc' ? <ArrowDown size={14} className="text-vna-blue font-bold" /> :
                                  <ArrowUpDown size={14} className="opacity-40" />}
                            </span>
                          </div>
                        </th>

                        {/* Cột Tên KPI - Có Sắp xếp Sort */}
                        <th
                          onClick={() => handleToggleSort('name')}
                          className="py-3 px-4 w-[22%] cursor-pointer select-none hover:bg-gray-100 transition-colors"
                          title={currentLang === 'vi' ? 'Nhấn để sắp xếp theo Tên KPI' : 'Click to sort by KPI Name'}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span>{currentLang === 'vi' ? 'TÊN KPI' : 'KPI NAME BY CODE'}</span>
                            <span className="text-gray-400">
                              {sortField === 'name' && sortOrder === 'asc' ? <ArrowUp size={14} className="text-vna-blue font-bold" /> :
                                sortField === 'name' && sortOrder === 'desc' ? <ArrowDown size={14} className="text-vna-blue font-bold" /> :
                                  <ArrowUpDown size={14} className="opacity-40" />}
                            </span>
                          </div>
                        </th>

                        <th className="py-3 px-4 w-[13%]">{currentLang === 'vi' ? 'THỜI HẠN' : 'PERIOD'}</th>
                        <th className="py-3 px-4 w-[8%]">{currentLang === 'vi' ? 'ĐVT' : 'UNIT'}</th>
                        <th className="py-3 px-4 text-center w-[9%]">{currentLang === 'vi' ? 'KẾ HOẠCH' : 'TARGET'}</th>
                        <th className="py-3 px-4 text-center w-[9%]">{currentLang === 'vi' ? 'THỰC HIỆN' : 'ACTUAL'}</th>
                        <th className="py-3 px-4 w-[16%]">{currentLang === 'vi' ? 'ĐÁNH GIÁ' : 'EVALUATION'}</th>
                        <th className="py-3 px-4 text-center w-[7%]">{currentLang === 'vi' ? 'THAO TÁC' : 'ACTIONS'}</th>
                      </tr>

                      {/* HÀNG BỘ LỌC CỘT (COLUMN FILTER ROW) */}
                      <tr className="bg-blue-50/70 border-b border-gray-200">
                        {/* 1. STT Spacer */}
                        <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

                        {/* 2. Lọc Mã chỉ tiêu */}
                        <th className="py-2 px-2 text-left">
                          <div className="relative">
                            <input
                              type="text"
                              value={searchIndicatorCode}
                              onChange={(e) => setSearchIndicatorCode(e.target.value)}
                              placeholder={currentLang === 'vi' ? 'Lọc mã...' : 'Filter code...'}
                              className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue"
                            />
                            {searchIndicatorCode && (
                              <button onClick={() => setSearchIndicatorCode('')} className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                            )}
                          </div>
                        </th>

                        {/* 3. Lọc Tên KPI */}
                        <th className="py-2 px-2 text-left">
                          <div className="relative">
                            <input
                              type="text"
                              value={searchKpiName}
                              onChange={(e) => setSearchKpiName(e.target.value)}
                              placeholder={currentLang === 'vi' ? 'Lọc tên KPI...' : 'Filter name...'}
                              className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue"
                            />
                            {searchKpiName && (
                              <button onClick={() => setSearchKpiName('')} className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                            )}
                          </div>
                        </th>

                        {/* 4. Lọc Thời hạn */}
                        <th className="py-2 px-2 text-left">
                          <div className="relative">
                            <input
                              type="text"
                              value={searchDeadline}
                              onChange={(e) => setSearchDeadline(e.target.value)}
                              placeholder={currentLang === 'vi' ? 'Lọc ngày/năm...' : 'Filter date...'}
                              className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue"
                            />
                            {searchDeadline && (
                              <button onClick={() => setSearchDeadline('')} className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                            )}
                          </div>
                        </th>

                        {/* 5. Đơn vị tính Spacer */}
                        <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

                        {/* 6. Kế hoạch Spacer */}
                        <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

                        {/* 7. Thực hiện Spacer */}
                        <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

                        {/* 8. Lọc Đánh giá */}
                        <th className="py-2 px-2 text-center">
                          <select
                            value={searchEvaluation}
                            onChange={(e) => setSearchEvaluation(e.target.value)}
                            className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-1.5 py-1 text-gray-800 outline-none focus:border-vna-blue"
                          >
                            <option value="">{currentLang === 'vi' ? 'Tất cả' : 'All'}</option>
                            <option value="PASS">{currentLang === 'vi' ? 'ĐẠT' : 'PASS'}</option>
                            <option value="FAIL">{currentLang === 'vi' ? 'CHƯA ĐẠT' : 'FAIL'}</option>
                            <option value="UNCONFIGURED">{currentLang === 'vi' ? 'Chưa thiết lập' : 'Unconfigured'}</option>
                          </select>
                        </th>

                        {/* 9. Nút Xóa Lọc */}
                        <th className="py-2 px-2 text-center">
                          {(searchIndicatorCode || searchKpiName || searchDeadline || searchEvaluation) && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchIndicatorCode('');
                                setSearchKpiName('');
                                setSearchDeadline('');
                                setSearchEvaluation('');
                              }}
                              className="text-[11px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded transition-colors"
                              title="Xóa tất cả bộ lọc"
                            >
                              {currentLang === 'vi' ? 'Xóa lọc' : 'Clear'}
                            </button>
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {/* Render set of KPIs assigned to this department */}
                      {deptKpis.map((kpi, idx) => (
                        <tr key={kpi.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                          <td className="py-3.5 px-4">
                            {kpi.indicatorCode ? (
                              <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                {kpi.indicatorCode}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {/* <div className="flex items-center gap-1.5 flex-wrap">
                              {kpi.direction === 'desc' ? (
                                <span className="bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0.5 rounded font-medium border border-amber-100">
                                  {currentLang === 'vi' ? 'Càng nhỏ càng tốt' : 'Smaller is better'}
                                </span>
                              ) : (
                                <span className="bg-blue-50 text-vna-blue text-[10px] px-1.5 py-0.5 rounded font-medium border border-blue-100">
                                  {currentLang === 'vi' ? 'Càng lớn càng tốt' : 'Higher is better'}
                                </span>
                              )}
                            </div> */}
                            <div className="font-semibold text-gray-900 mt-1">
                              {getKpiDisplayName(kpi, currentLang)}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-xs text-gray-600 font-medium flex items-center gap-1.5 whitespace-nowrap">
                              <Calendar size={13} className="text-vna-blue shrink-0" />
                              <span>{formatDate(kpi.startDate)} - {formatDate(kpi.endDate)}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 font-medium text-xs">{kpi.unit}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-gray-800">{kpi.plan || '--'}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-gray-900">{kpi.actual || '--'}</td>
                          <td className="py-3.5 px-4 min-w-[150px]">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${kpi.isPass ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {kpi.isPass ? 'ĐẠT' : 'CHƯA ĐẠT'}
                              </span>
                              <span className={`text-xs font-bold ${kpi.isPass ? 'text-emerald-600' : 'text-red-600'}`}>
                                {kpi.progressText}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${kpi.isPass ? 'bg-emerald-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(Math.max(kpi.progress, 0), 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Nút Xem lịch sử theo mã KPI */}
                              <button
                                type="button"
                                onClick={() => setHistoryModalTarget({ kpi, indicatorCode: kpi.indicatorCode, deptItem })}
                                className="p-1.5 text-gray-500 hover:text-vna-blue hover:bg-blue-50 rounded-md transition-colors"
                                title="Xem lịch sử theo mã KPI"
                              >
                                <Clock size={16} />
                              </button>

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

                      {/* Display unconfigured indicators assigned to this department */}
                      {assignedIndicatorCodes
                        .filter(codeId => !deptKpis.some(k => k.indicatorCode === codeId))
                        .filter(codeId => {
                          const indObj = indicatorMap.get(codeId);
                          const matchesCode = !searchIndicatorCode || codeId.toLowerCase().includes(searchIndicatorCode.toLowerCase());
                          const indName = indObj ? getLocalizedIndicatorName(indObj.name, currentLang).toLowerCase() : '';
                          const matchesName = !searchKpiName || indName.includes(searchKpiName.toLowerCase()) || codeId.toLowerCase().includes(searchKpiName.toLowerCase());
                          const matchesDeadline = !searchDeadline;
                          const matchesEval = !searchEvaluation || searchEvaluation === 'UNCONFIGURED';
                          return matchesCode && matchesName && matchesDeadline && matchesEval;
                        })
                        .map((codeId, idx) => {
                          const indObj = indicatorMap.get(codeId);
                          return (
                            <tr key={codeId} className="bg-amber-50/20 hover:bg-amber-50/40 transition-colors border-dashed">
                              <td className="py-3.5 px-4 text-center text-gray-400 font-medium">
                                {deptKpis.length + idx + 1}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  {codeId}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                {/* <div className="font-semibold text-gray-600 text-xs italic">
                                  {currentLang === 'vi' ? 'Chưa thiết lập KPI' : 'KPI Not Configured'}
                                </div> */}
                                <div className="font-medium text-gray-800 mt-0.5">
                                  {indObj ? getLocalizedIndicatorName(indObj.name, currentLang) : codeId}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-xs text-gray-400 italic">
                                --
                              </td>
                              <td className="py-3.5 px-4 text-gray-500 text-xs">{indObj?.unit || '%'}</td>
                              <td className="py-3.5 px-4 text-center text-gray-400 italic">Chưa lập</td>
                              <td className="py-3.5 px-4 text-center text-gray-400 italic">--</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="text-xs text-gray-400 italic">Chưa có dữ liệu</span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {/* Nút xem lịch sử theo mã KPI */}
                                  <button
                                    type="button"
                                    onClick={() => setHistoryModalTarget({ indicatorCode: codeId, indObj, deptItem })}
                                    className="p-1.5 text-gray-500 hover:text-vna-blue hover:bg-blue-50 rounded-md transition-colors"
                                    title="Xem lịch sử theo mã KPI"
                                  >
                                    <Clock size={16} />
                                  </button>

                                  {/* Nút thiết lập KPI mới bằng icon Plus */}
                                  {isUserDept ? (
                                    <button
                                      type="button"
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
                                      className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                                      title="Thiết lập KPI mới cho chỉ tiêu này"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                      <Lock size={12} />
                                    </span>
                                  )}
                                </div>
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
