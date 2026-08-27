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
  Calendar,
  Settings,
  Sliders,
  Check,
  X
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
  monthlyPlans?: Record<string, string>;
  monthlyActuals?: Record<string, string>;
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

interface KPIAuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  department: string;
  scope: 'year' | 'month';
  actionType: 'CREATE' | 'UPDATE_PLAN' | 'CONFIG' | 'DELETE';
  actionLabel: string;
  indicatorCode: string;
  kpiName: string;
  deptName: string;
  changeDetails: string;
}

const INITIAL_KPI_AUDIT_LOGS: KPIAuditLogItem[] = [
  // --- Tab Năm ---
  {
    id: 'log-y-1',
    timestamp: '2026-08-26 14:15:30',
    userName: 'Trần Văn Nam (Chuyên viên)',
    department: 'Ban An toàn chất lượng (Ban ATCL)',
    scope: 'year',
    actionType: 'UPDATE_PLAN',
    actionLabel: 'Chỉnh sửa kế hoạch',
    indicatorCode: 'Airline E-1',
    kpiName: 'Sự cố bắt buộc phải báo cáo',
    deptName: 'Ban An toàn chất lượng (Ban ATCL)',
    changeDetails: 'Điều chỉnh Số kế hoạch năm 2026: 1.80 -> 1.84 Số vụ việc/1,000 chuyến bay'
  },
  {
    id: 'log-y-2',
    timestamp: '2026-08-25 10:40:12',
    userName: 'Nguyễn Văn Hùng (Chuyên viên)',
    department: 'Tổ Khai thác (TTĐHKT)',
    scope: 'year',
    actionType: 'CREATE',
    actionLabel: 'Thiết lập mới',
    indicatorCode: 'GRI 302-1',
    kpiName: 'Tiêu thụ năng lượng khai thác bay',
    deptName: 'Tổ Khai thác (TTĐHKT)',
    changeDetails: 'Thiết lập mới chỉ tiêu kế hoạch năm 2026: 15,350 TJ'
  },
  {
    id: 'log-y-3',
    timestamp: '2026-08-24 09:20:05',
    userName: 'Quản trị viên ESG (Hệ thống)',
    department: 'Ban ESG & PTBV',
    scope: 'year',
    actionType: 'CONFIG',
    actionLabel: 'Cấu hình chỉ tiêu',
    indicatorCode: '4',
    kpiName: 'Cường độ phát thải CO2',
    deptName: 'Tổ Kỹ thuật (Ban QLVT)',
    changeDetails: 'Cập nhật cấu hình: Chiều đánh giá = Đạt khi giảm (≤), Tần suất = Năm'
  },
  {
    id: 'log-y-4',
    timestamp: '2026-08-22 16:05:44',
    userName: 'Lê Minh Tuấn (Chuyên viên)',
    department: 'Ban Tổ chức Nhân lực',
    scope: 'year',
    actionType: 'UPDATE_PLAN',
    actionLabel: 'Chỉnh sửa kế hoạch',
    indicatorCode: 'GRI 401-1',
    kpiName: 'Mức độ hài lòng của nhân viên',
    deptName: 'Ban Tổ chức Nhân lực',
    changeDetails: 'Điều chỉnh Số kế hoạch năm: 4.0 -> 4.2 Điểm (1-5)'
  },
  {
    id: 'log-y-5',
    timestamp: '2026-08-20 08:30:19',
    userName: 'Quản trị viên ESG (Hệ thống)',
    department: 'Ban ESG & PTBV',
    scope: 'year',
    actionType: 'CONFIG',
    actionLabel: 'Cấu hình chỉ tiêu',
    indicatorCode: 'Airline B-2',
    kpiName: 'Tương tác khách hàng',
    deptName: 'Trung tâm Bông Sen Vàng (TTBSV)',
    changeDetails: 'Cấu hình danh mục: Tần suất báo cáo = Năm, Chiều đánh giá = Đạt khi tăng (≥)'
  },

  // --- Tab Tháng ---
  {
    id: 'log-m-1',
    timestamp: '2026-08-26 15:20:00',
    userName: 'Trần Văn Nam (Chuyên viên)',
    department: 'Ban An toàn chất lượng (Ban ATCL)',
    scope: 'month',
    actionType: 'UPDATE_PLAN',
    actionLabel: 'Chỉnh sửa kế hoạch tháng',
    indicatorCode: 'Airline E-1',
    kpiName: 'Sự cố bắt buộc phải báo cáo',
    deptName: 'Ban An toàn chất lượng (Ban ATCL)',
    changeDetails: 'Cập nhật kế hoạch phân bổ: Tháng 5 (0.15 -> 0.16), Tháng 6 (0.15 -> 0.16). Tổng năm = 1.84'
  },
  {
    id: 'log-m-2',
    timestamp: '2026-08-25 11:15:22',
    userName: 'Nguyễn Văn Hùng (Chuyên viên)',
    department: 'Tổ Khai thác (TTĐHKT)',
    scope: 'month',
    actionType: 'UPDATE_PLAN',
    actionLabel: 'Chỉnh sửa kế hoạch tháng',
    indicatorCode: 'GRI 302-1',
    kpiName: 'Tiêu thụ năng lượng khai thác bay',
    deptName: 'Tổ Khai thác (TTĐHKT)',
    changeDetails: 'Điều chỉnh kế hoạch Tháng 12: 1,250 -> 1,200 TJ. Tổng kế hoạch 12 tháng = 15,350 TJ'
  },
  {
    id: 'log-m-3',
    timestamp: '2026-08-24 14:00:10',
    userName: 'Quản trị viên ESG (Hệ thống)',
    department: 'Ban ESG & PTBV',
    scope: 'month',
    actionType: 'CONFIG',
    actionLabel: 'Cấu hình chỉ tiêu',
    indicatorCode: 'GRI 305-1',
    kpiName: 'Phát thải khí nhà kính trực tiếp (Phạm vi 1)',
    deptName: 'Tổ Khai thác (TTĐHKT)',
    changeDetails: 'Chuyển đổi Tần suất báo cáo = Tháng, Chiều đánh giá = Đạt khi giảm (≤)'
  },
  {
    id: 'log-m-4',
    timestamp: '2026-08-23 09:45:33',
    userName: 'Trần Văn Nam (Chuyên viên)',
    department: 'Ban An toàn chất lượng (Ban ATCL)',
    scope: 'month',
    actionType: 'CREATE',
    actionLabel: 'Thiết lập mới KPI tháng',
    indicatorCode: '9',
    kpiName: 'Tai nạn mức A /10,000 chuyến bay',
    deptName: 'Ban An toàn chất lượng (Ban ATCL)',
    changeDetails: 'Thiết lập mới chỉ tiêu tháng & phân bổ 12 tháng cho năm 2026 (Tổng K.H: 3.62 Số vụ việc/10,000 cb)'
  },
  {
    id: 'log-m-5',
    timestamp: '2026-08-22 15:30:18',
    userName: 'Quản trị viên ESG (Hệ thống)',
    department: 'Ban ESG & PTBV',
    scope: 'month',
    actionType: 'CONFIG',
    actionLabel: 'Cấu hình chỉ tiêu',
    indicatorCode: 'Airline B-1',
    kpiName: 'NPS (DOM / INT)',
    deptName: 'Tổ Dịch vụ',
    changeDetails: 'Thiết lập Tần suất báo cáo = Tháng, Chiều đánh giá = Đạt khi tăng (≥)'
  }
];

const DEFAULT_KPI_CONFIGS: Record<string, { frequency: 'Tháng' | 'Năm'; direction: 'asc' | 'desc' }> = {
  // Monthly KPIs (Cả đã lập kế hoạch và chưa lập kế hoạch)
  'Airline E-1': { frequency: 'Tháng', direction: 'desc' }, // Ban ATCL - Đã lập
  '9': { frequency: 'Tháng', direction: 'desc' },           // Ban ATCL - Đã lập
  'GRI 302-1': { frequency: 'Tháng', direction: 'desc' },    // TTĐHKT - Đã lập
  'GRI 305-1': { frequency: 'Tháng', direction: 'desc' },   // TTĐHKT - Chưa lập
  'Airline B-1': { frequency: 'Tháng', direction: 'asc' },   // Tổ Dịch vụ - Chưa lập
  'GRI 303-3': { frequency: 'Tháng', direction: 'desc' },   // Tổ Dịch vụ - Chưa lập
  'GRI 403-9': { frequency: 'Tháng', direction: 'desc' },   // Ban TCNL - Chưa lập
  'GRI 418-1': { frequency: 'Tháng', direction: 'desc' },   // Ban CĐS & CNTT - Chưa lập
  // Annual KPIs
  'Airline F-1': { frequency: 'Năm', direction: 'asc' },
  'GRI 417-3': { frequency: 'Năm', direction: 'desc' },
  'Airline B-2': { frequency: 'Năm', direction: 'asc' },
  'GRI 204-1': { frequency: 'Năm', direction: 'asc' },
  'GRI 302-4': { frequency: 'Năm', direction: 'desc' },
  'GRI 305-4': { frequency: 'Năm', direction: 'desc' },
  'GRI 305-5': { frequency: 'Năm', direction: 'desc' },
  'GRI 305-7': { frequency: 'Năm', direction: 'desc' },
  'Airline D-1': { frequency: 'Năm', direction: 'asc' },
  'GRI 401-1': { frequency: 'Năm', direction: 'asc' },
  'GRI 401-2': { frequency: 'Năm', direction: 'asc' },
  'GRI 403-4': { frequency: 'Năm', direction: 'asc' },
  'GRI 403-10': { frequency: 'Năm', direction: 'desc' },
  'GRI 405-1': { frequency: 'Năm', direction: 'asc' },
  'GRI 406-1': { frequency: 'Năm', direction: 'desc' },
  'GRI 2-7': { frequency: 'Năm', direction: 'asc' },
  'GRI 2-30': { frequency: 'Năm', direction: 'asc' },
  'GRI 404-2': { frequency: 'Năm', direction: 'asc' },
  'GRI 404-3': { frequency: 'Năm', direction: 'asc' },
  'GRI 201-3': { frequency: 'Năm', direction: 'asc' },
  'GRI 202-2': { frequency: 'Năm', direction: 'asc' },
  'GRI 2-9': { frequency: 'Năm', direction: 'asc' },
  'GRI 2-10': { frequency: 'Năm', direction: 'asc' },
  'GRI 2-11': { frequency: 'Năm', direction: 'asc' },
  'GRI 2-12': { frequency: 'Năm', direction: 'asc' },
  'GRI 2-13': { frequency: 'Năm', direction: 'asc' },
  'GRI 2-15': { frequency: 'Năm', direction: 'asc' },
  'GRI 2-23': { frequency: 'Năm', direction: 'asc' },
  'GRI 2-26': { frequency: 'Năm', direction: 'asc' },
  'GRI 2-29': { frequency: 'Năm', direction: 'asc' },
  'GRI 3-3': { frequency: 'Năm', direction: 'asc' },
  'GRI 201-4': { frequency: 'Năm', direction: 'asc' },
  'GRI 205-2': { frequency: 'Năm', direction: 'asc' },
  'GRI 205-3': { frequency: 'Năm', direction: 'desc' },
  'GRI 206-1': { frequency: 'Năm', direction: 'desc' },
  'GRI 415-1': { frequency: 'Năm', direction: 'desc' }
};

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
    endDate: "2026-12-31",
    monthlyPlans: {
      "1": "0.15", "2": "0.15", "3": "0.15", "4": "0.15", "5": "0.16", "6": "0.16",
      "7": "0.16", "8": "0.15", "9": "0.15", "10": "0.15", "11": "0.15", "12": "0.16"
    },
    monthlyActuals: {
      "1": "0.14", "2": "0.15", "3": "0.13", "4": "0.14", "5": "0.16", "6": "0.15",
      "7": "0.17", "8": "0.16", "9": "0.15", "10": "0.14", "11": "0.15", "12": "0.14"
    }
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
    name: "Tiêu thụ năng lượng khai thác bay",
    subName: "Energy consumption within organization",
    unit: "TJ",
    plan: "15350",
    actual: "15090",
    progress: 98,
    progressText: "-1.7%",
    isPass: true,
    dept: "Tổ Khai thác (TTĐHKT)",
    deptId: "DEPT-001",
    creator: "Nguyễn Văn Hùng (Chuyên viên)",
    frequency: "Tháng",
    direction: "desc",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    monthlyPlans: {
      "1": "1280", "2": "1250", "3": "1290", "4": "1270", "5": "1300", "6": "1310",
      "7": "1320", "8": "1300", "9": "1280", "10": "1290", "11": "1260", "12": "1200"
    },
    monthlyActuals: {
      "1": "1260", "2": "1240", "3": "1270", "4": "1250", "5": "1280", "6": "1290",
      "7": "1300", "8": "1280", "9": "1270", "10": "1260", "11": "1250", "12": "1190"
    }
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
    id: 117,
    code: "KPI-HR-01-2025",
    indicatorCode: "GRI 401-1",
    name: "Mức độ hài lòng của nhân viên (2025)",
    subName: "Employee satisfaction score 2025",
    unit: "Điểm (1-5)",
    plan: "4.0",
    actual: "3.8",
    progress: 95,
    progressText: "-5.0%",
    isPass: true,
    dept: "Ban Tổ chức Nhân lực",
    deptId: "DEPT-007",
    creator: "Lê Minh Tuấn (Chuyên viên)",
    frequency: "Năm",
    direction: "asc",
    startDate: "2025-01-01",
    endDate: "2025-12-31"
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
    progressText: "0%",
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
    progressText: "0%",
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

// Calculate previous period comparison (Cùng kỳ YoY)
const getYoYComparison = (
  kpisList: KPIItem[],
  currentYear: string,
  deptName: string,
  indicatorCode: string,
  currentActualStr: string,
  direction: 'asc' | 'desc' = 'asc',
  month?: number
): { text: string; percent: number | null; isBetter: boolean; prevActual: string } => {
  if (!currentActualStr || currentActualStr === '--') {
    return { text: '--', percent: null, isBetter: false, prevActual: '--' };
  }
  const currentActual = parseFloat(currentActualStr);
  if (isNaN(currentActual)) {
    return { text: '--', percent: null, isBetter: false, prevActual: '--' };
  }

  const prevYear = (parseInt(currentYear, 10) - 1).toString();

  // Find previous year KPI item
  const prevKpi = kpisList.find(k => {
    const isDept = k.dept === deptName;
    const isInd = k.indicatorCode === indicatorCode;
    const isPrevYear = (k.startDate && k.startDate.startsWith(prevYear)) || (k.endDate && k.endDate.startsWith(prevYear));
    return isDept && isInd && isPrevYear;
  });

  if (!prevKpi) {
    return { text: '--', percent: null, isBetter: false, prevActual: '--' };
  }

  let prevActualStr = prevKpi.actual;
  if (month && prevKpi.monthlyActuals && prevKpi.monthlyActuals[month.toString()]) {
    prevActualStr = prevKpi.monthlyActuals[month.toString()];
  }

  if (!prevActualStr || prevActualStr === '--') {
    return { text: '--', percent: null, isBetter: false, prevActual: '--' };
  }

  const prevActual = parseFloat(prevActualStr);
  if (isNaN(prevActual) || prevActual === 0) {
    return { text: '--', percent: null, isBetter: false, prevActual: prevActualStr };
  }

  const diff = currentActual - prevActual;
  const pct = (diff / prevActual) * 100;
  const formattedPct = `${diff >= 0 ? '+' : ''}${pct.toFixed(1)}%`;

  const isBetter = direction === 'asc' ? diff >= 0 : diff <= 0;

  return {
    text: formattedPct,
    percent: pct,
    isBetter,
    prevActual: prevActualStr
  };
};

const getMonthlyActual = (kpi: KPIItem, month: number): string => {
  if (kpi.monthlyActuals && kpi.monthlyActuals[month.toString()] !== undefined) {
    return kpi.monthlyActuals[month.toString()];
  }
  const planVal = parseFloat(kpi.monthlyPlans?.[month.toString()] || '');
  const actualNum = parseFloat(String(kpi.actual));
  const planNum = parseFloat(String(kpi.plan));

  if (!planVal || isNaN(planVal)) {
    if (!isNaN(actualNum) && !isNaN(planNum) && planNum > 0) {
      return (actualNum / 12).toFixed(2).replace(/\.?0+$/, '');
    }
    return '--';
  }

  if (!isNaN(actualNum) && !isNaN(planNum) && planNum > 0) {
    const ratio = actualNum / planNum;
    return (planVal * ratio).toFixed(2).replace(/\.?0+$/, '');
  }
  return '--';
};

const getMonthlyProgress = (kpi: KPIItem, month: number): { text: string; isPass: boolean } => {
  const planStr = kpi.monthlyPlans?.[month.toString()] || (parseFloat(String(kpi.plan)) > 0 ? (parseFloat(String(kpi.plan)) / 12).toFixed(2) : '');
  const planVal = parseFloat(planStr);
  const actualStr = getMonthlyActual(kpi, month);
  const actualVal = parseFloat(actualStr);

  if (!planVal || isNaN(planVal) || isNaN(actualVal) || actualStr === '--' || actualStr === '') {
    return { text: '0%', isPass: false };
  }

  let percent = 0;
  let isPass = false;
  if (kpi.direction === 'desc') {
    isPass = actualVal <= planVal;
    percent = Math.round((planVal / actualVal) * 100);
  } else {
    isPass = actualVal >= planVal;
    percent = Math.round((actualVal / planVal) * 100);
  }

  return {
    text: `${percent}%`,
    isPass
  };
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

  const [selectedYear, setSelectedYear] = useState('2026');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [collapsedDepts, setCollapsedDepts] = useState<Record<string, boolean>>({});
  const [collapsedKpiMonths, setCollapsedKpiMonths] = useState<Record<number, boolean>>({});

  // Column Filters for KPI Table
  const [activeTab, setActiveTab] = useState<'year' | 'month'>('year');
  const [kpiConfigs, setKpiConfigs] = useState<Record<string, { frequency: 'Tháng' | 'Năm'; direction: 'asc' | 'desc' }>>(() => {
    try {
      const saved = localStorage.getItem('vna_esg_kpi_configs');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_KPI_CONFIGS, ...parsed };
      }
    } catch (e) { }
    return DEFAULT_KPI_CONFIGS;
  });

  const saveKpiConfigs = (configs: Record<string, { frequency: 'Tháng' | 'Năm'; direction: 'asc' | 'desc' }>) => {
    setKpiConfigs(configs);
    localStorage.setItem('vna_esg_kpi_configs', JSON.stringify(configs));
  };
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditTab, setAuditTab] = useState<'year' | 'month'>('year');
  const [auditSearchText, setAuditSearchText] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');

  const [kpiAuditLogs, setKpiAuditLogs] = useState<KPIAuditLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('vna_esg_kpi_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return INITIAL_KPI_AUDIT_LOGS;
  });

  const saveAuditLogs = (logs: KPIAuditLogItem[]) => {
    setKpiAuditLogs(logs);
    localStorage.setItem('vna_esg_kpi_audit_logs', JSON.stringify(logs));
  };

  const addAuditLog = (logItem: Omit<KPIAuditLogItem, 'id' | 'timestamp'>) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newLog: KPIAuditLogItem = {
      ...logItem,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timestampStr
    };
    const updated = [newLog, ...kpiAuditLogs];
    saveAuditLogs(updated);
  };
  const [isInlineEditMode, setIsInlineEditMode] = useState(false);
  const [inlineOriginalKpis, setInlineOriginalKpis] = useState<KPIItem[]>([]);

  const handleStartInlineEdit = () => {
    setInlineOriginalKpis(JSON.parse(JSON.stringify(kpis)));
    setIsInlineEditMode(true);
    setToast({ message: 'Đã bật chế độ chỉnh sửa kế hoạch trực tiếp trên bảng!', type: 'info' });
  };

  const handleCancelInlineEdit = () => {
    if (inlineOriginalKpis.length > 0) {
      setKpis(inlineOriginalKpis);
    }
    setIsInlineEditMode(false);
    setToast({ message: 'Đã hủy thay đổi kế hoạch.', type: 'info' });
  };

  const handleSaveInlineEdit = () => {
    saveKpis(kpis);
    setIsInlineEditMode(false);
    addAuditLog({
      userName: `${currentUser.name} (${currentUser.department || 'Chuyên viên'})`,
      department: currentUser.department || 'Ban ESG',
      scope: activeTab,
      actionType: 'UPDATE_PLAN',
      actionLabel: activeTab === 'month' ? 'Chỉnh sửa kế hoạch tháng' : 'Chỉnh sửa kế hoạch năm',
      indicatorCode: 'ALL_MODIFIED',
      kpiName: activeTab === 'month' ? 'Cập nhật phân bổ 12 tháng KPI' : 'Cập nhật chỉ tiêu kế hoạch năm',
      deptName: currentUser.department || 'Tất cả Tổ Ban',
      changeDetails: `Lưu thay đổi kế hoạch trực tiếp trên bảng tại Tab ${activeTab === 'month' ? 'Tháng' : 'Năm'} (Năm ${selectedYear})`
    });
    setToast({ message: 'Đã lưu toàn bộ kế hoạch KPI thành công!', type: 'success' });
  };

  const handleInlineChangePlan = (row: any, newPlanValue: string) => {
    if (row.type === 'configured' && row.kpi) {
      const updated = kpis.map(k => {
        if (k.id === row.kpi.id) {
          return { ...k, plan: newPlanValue };
        }
        return k;
      });
      setKpis(updated);
    } else {
      const codeId = row.indicatorCode;
      const cfg = kpiConfigs[codeId] || kpiConfigs[`${row.deptName}_${codeId}`];
      const targetFreq = activeTab === 'month' ? 'Tháng' : (row.frequency || cfg?.frequency || 'Năm');
      const targetDir = cfg?.direction || 'asc';

      const newKpi: KPIItem = {
        id: Date.now() + Math.floor(Math.random() * 100000),
        code: `KPI-${row.deptItem.id.replace('DEPT-', '')}-${Math.floor(10 + Math.random() * 90)}`,
        indicatorCode: codeId,
        name: row.name,
        subName: '',
        unit: row.unit || '%',
        plan: newPlanValue,
        actual: '--',
        progress: 0,
        progressText: '0%',
        isPass: true,
        dept: row.deptName,
        deptId: row.deptItem.id,
        creator: `${currentUser.name} (${currentUser.department || 'Chuyên viên'})`,
        frequency: targetFreq,
        direction: targetDir,
        startDate: `${selectedYear}-01-01`,
        endDate: `${selectedYear}-12-31`,
        monthlyPlans: {}
      };
      setKpis([...kpis, newKpi]);
    }
  };

  const handleInlineChangeMonthPlan = (row: any, month: number, newMonthVal: string) => {
    if (row.type === 'configured' && row.kpi) {
      const kpi = row.kpi;
      const updatedMonthly = { ...(kpi.monthlyPlans || {}), [month.toString()]: newMonthVal };
      const total = (Object.values(updatedMonthly) as string[]).reduce((acc: number, val: string) => acc + (parseFloat(val) || 0), 0);

      const updated = kpis.map(k => {
        if (k.id === kpi.id) {
          return {
            ...k,
            plan: total > 0 ? total.toString() : '0',
            monthlyPlans: updatedMonthly
          };
        }
        return k;
      });
      setKpis(updated);
    } else {
      const codeId = row.indicatorCode;
      const cfg = kpiConfigs[codeId] || kpiConfigs[`${row.deptName}_${codeId}`];
      const updatedMonthly: Record<string, string> = { [month.toString()]: newMonthVal };
      const total = parseFloat(newMonthVal) || 0;

      const newKpi: KPIItem = {
        id: Date.now() + Math.floor(Math.random() * 100000),
        code: `KPI-${row.deptItem.id.replace('DEPT-', '')}-${Math.floor(10 + Math.random() * 90)}`,
        indicatorCode: codeId,
        name: row.name,
        subName: '',
        unit: row.unit || '%',
        plan: total > 0 ? total.toString() : '0',
        actual: '--',
        progress: 0,
        progressText: '0%',
        isPass: true,
        dept: row.deptName,
        deptId: row.deptItem.id,
        creator: `${currentUser.name} (${currentUser.department || 'Chuyên viên'})`,
        frequency: 'Tháng',
        direction: cfg?.direction || 'asc',
        startDate: `${selectedYear}-01-01`,
        endDate: `${selectedYear}-12-31`,
        monthlyPlans: updatedMonthly
      };
      setKpis([...kpis, newKpi]);
    }
  };
  const [configSearchCode, setConfigSearchCode] = useState('');
  const [configSearchDept, setConfigSearchDept] = useState('');
  const [configSearchName, setConfigSearchName] = useState('');
  const [configSearchFreq, setConfigSearchFreq] = useState('ALL');
  const [configSearchDir, setConfigSearchDir] = useState('ALL');
  const [searchIndicatorCode, setSearchIndicatorCode] = useState('');
  const [searchDept, setSearchDept] = useState('');
  const [searchKpiName, setSearchKpiName] = useState('');
  const [searchDeadline, setSearchDeadline] = useState('');
  const [searchFrequency, setSearchFrequency] = useState('');
  const [searchEvaluation, setSearchEvaluation] = useState('');

  // Column Sorting
  const [sortField, setSortField] = useState<'indicatorCode' | 'dept' | 'name' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Handler to update config for ANY row (configured or unconfigured)
  const handleUpdateRowConfig = (
    row: {
      rowKey: string;
      type: 'configured' | 'unconfigured';
      kpi?: KPIItem;
      deptItem: Department;
      deptName: string;
      indicatorCode: string;
      name: string;
      unit: string;
      frequency: string;
    },
    field: 'frequency' | 'direction',
    value: any
  ) => {
    // 1. Update config registry
    const currentConfig = kpiConfigs[row.indicatorCode] || kpiConfigs[`${row.deptName}_${row.indicatorCode}`] || { frequency: (row.frequency as any) || 'Năm', direction: 'asc' };
    const updatedConfigs = {
      ...kpiConfigs,
      [row.indicatorCode]: { ...currentConfig, [field]: value },
      [`${row.deptName}_${row.indicatorCode}`]: { ...currentConfig, [field]: value }
    };
    saveKpiConfigs(updatedConfigs);

    // 2. If already a configured KPI in current year, update it
    if (row.type === 'configured' && row.kpi) {
      const updated = kpis.map(k => {
        if (k.id === row.kpi!.id) {
          const updatedItem = { ...k, [field]: value };
          if (field === 'frequency' && value !== 'Tháng') {
            updatedItem.monthlyPlans = {};
          }
          return updatedItem;
        }
        return k;
      });
      saveKpis(updated);
    }
    setToast({ message: `Đã lưu cấu hình cho chỉ tiêu "${row.indicatorCode}"!`, type: 'success' });
  };

  // Bulk / Batch update helper for all filtered config rows
  const handleBulkUpdateConfig = (field: 'frequency' | 'direction', value: any, targetRows: any[]) => {
    const updatedConfigs = { ...kpiConfigs };
    let updatedList = [...kpis];

    targetRows.forEach(row => {
      const currentConfig = updatedConfigs[row.indicatorCode] || { frequency: (row.frequency as any) || 'Năm', direction: 'asc' };
      updatedConfigs[row.indicatorCode] = { ...currentConfig, [field]: value };
      updatedConfigs[`${row.deptName}_${row.indicatorCode}`] = { ...currentConfig, [field]: value };

      if (row.type === 'configured' && row.kpi) {
        updatedList = updatedList.map(k => {
          if (k.id === row.kpi.id) {
            const updatedItem = { ...k, [field]: value };
            if (field === 'frequency' && value !== 'Tháng') {
              updatedItem.monthlyPlans = {};
            }
            return updatedItem;
          }
          return k;
        });
      }
    });

    saveKpiConfigs(updatedConfigs);
    saveKpis(updatedList);
    setToast({ message: 'Đã cập nhật đồng loạt cấu hình cho tất cả KPI thành công!', type: 'success' });
  };

  const handleToggleSort = (field: 'indicatorCode' | 'dept' | 'name') => {
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
  const [monthlyPlans, setMonthlyPlans] = useState<Record<string, string>>({});

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
          const sanitized = parsed.map((item: any) => ({
            ...item,
            progressText: (!item.actual || item.actual === '--' || item.progressText === 'Chưa nộp') ? '0%' : (item.progressText || '0%')
          }));
          localStorage.setItem('vna_esg_kpis', JSON.stringify(sanitized));
          setKpis(sanitized);
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

  // Helper function to check if KPI belongs to selectedYear
  const isKpiActive = (start?: string, end?: string, year: string = selectedYear) => {
    if (!start || !end) return true;
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    return start <= yearEnd && end >= yearStart;
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
        setProgressText('0%');
        setIsPass(false);
      }
    }
  }, [plan, actual, direction]);





  const toggleDeptCollapse = (deptId: string) => {
    setCollapsedDepts(prev => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  const handleAddNewForDept = (targetDept: Department) => {
    setActiveTargetDept(targetDept);
    setDept(targetDept.name);

    const firstIndCode = targetDept.indicatorIds?.[0] || '';
    const firstInd = indicatorMap.get(firstIndCode);
    const cfg = kpiConfigs[firstIndCode] || kpiConfigs[`${targetDept.name}_${firstIndCode}`];
    const targetFreq = activeTab === 'month' ? 'Tháng' : (cfg?.frequency || 'Năm');

    setIndicatorCode(firstIndCode);
    setCode(`KPI-${targetDept.id.replace('DEPT-', '')}-${Math.floor(10 + Math.random() * 90)}`);
    setName(firstInd ? getLocalizedIndicatorName(firstInd.name, currentLang) : firstIndCode);
    setSubName(firstInd?.nameEn || '');
    setUnit(firstInd?.unit || '%');
    setPlan(targetFreq === 'Tháng' ? '0' : '100');
    setActual('--');
    setProgress(0);
    setProgressText('0%');
    setIsPass(true);
    setCreator(`${currentUser.name} (${currentUser.department || 'Chuyên viên'})`);
    setFrequency(targetFreq);
    setDirection(cfg?.direction || 'asc');
    setStartDate(`${selectedYear}-01-01`);
    setEndDate(`${selectedYear}-12-31`);
    setMonthlyPlans({});

    setSelectedKpi(null);
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleSelectIndicator = (indCode: string) => {
    setIndicatorCode(indCode);
    setCode(''); // reset KPI Code
    const ind = indicatorMap.get(indCode);
    const indName = ind ? getLocalizedIndicatorName(ind.name, currentLang) : indCode;
    setName(indName);
    setSubName(ind?.nameEn || '');
    if (ind?.unit) {
      setUnit(ind.unit);
    }
    const cfg = kpiConfigs[indCode] || (activeTargetDept ? kpiConfigs[`${activeTargetDept.name}_${indCode}`] : undefined);
    const targetFreq = activeTab === 'month' ? 'Tháng' : (cfg?.frequency || 'Năm');
    setFrequency(targetFreq);
    if (cfg?.direction) {
      setDirection(cfg.direction);
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
    setMonthlyPlans(kpi.monthlyPlans || {});

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
        endDate,
        monthlyPlans
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
        endDate,
        monthlyPlans
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

  // Build all KPI rows across all departments for the single table
  const allKpiRows = useMemo(() => {
    const list: Array<{
      rowKey: string;
      type: 'configured' | 'unconfigured';
      kpi?: KPIItem;
      deptItem: Department;
      deptName: string;
      isUserDept: boolean;
      indicatorCode: string;
      name: string;
      unit: string;
      plan: string;
      actual: string;
      isPass: boolean;
      progress: number;
      progressText: string;
      frequency: string;
    }> = [];

    departments.forEach(deptItem => {
      const isUserDept = canUserManageDept(deptItem.name);
      const assignedIndicatorCodes = deptItem.indicatorIds || [];

      // 1. Configured KPIs for this dept in selectedYear
      const deptConfiguredKpis = kpis.filter(k => {
        const isDeptMatch = k.dept === deptItem.name || k.deptId === deptItem.id;
        const isActive = isKpiActive(k.startDate, k.endDate, selectedYear);
        return isDeptMatch && isActive;
      });

      deptConfiguredKpis.forEach(k => {
        const cfg = kpiConfigs[k.indicatorCode || ''] || kpiConfigs[`${deptItem.name}_${k.indicatorCode || ''}`];
        const effFreq = k.frequency || cfg?.frequency || 'Năm';
        const effDir = k.direction || cfg?.direction || 'asc';

        list.push({
          rowKey: `kpi-${k.id}`,
          type: 'configured',
          kpi: { ...k, frequency: effFreq, direction: effDir },
          deptItem,
          deptName: deptItem.name,
          isUserDept,
          indicatorCode: k.indicatorCode || '',
          name: getKpiDisplayName(k, currentLang),
          unit: k.unit || '',
          plan: k.plan || '--',
          actual: k.actual || '--',
          isPass: !!k.isPass,
          progress: k.progress || 0,
          progressText: (!k.actual || k.actual === '--' || k.progressText === 'Chưa nộp') ? '0%' : (k.progressText || '0%'),
          frequency: effFreq
        });
      });

      // 2. Unconfigured indicators assigned to this dept (inheriting frequency & direction from KPI config matrix)
      const unconfiguredCodes = assignedIndicatorCodes.filter(codeId =>
        !deptConfiguredKpis.some(k => k.indicatorCode === codeId)
      );

      unconfiguredCodes.forEach(codeId => {
        const indObj = indicatorMap.get(codeId);
        const cfg = kpiConfigs[codeId] || kpiConfigs[`${deptItem.name}_${codeId}`];
        const effFreq = cfg?.frequency || (codeId === 'Airline E-1' || codeId === 'GRI 302-1' || codeId === 'GRI 305-1' ? 'Tháng' : 'Năm');
        const effDir = cfg?.direction || (codeId === 'Airline E-1' || codeId === 'GRI 305-1' ? 'desc' : 'asc');

        list.push({
          rowKey: `unconf-${deptItem.id}-${codeId}`,
          type: 'unconfigured',
          deptItem,
          deptName: deptItem.name,
          isUserDept,
          indicatorCode: codeId,
          name: indObj ? getLocalizedIndicatorName(indObj.name, currentLang) : codeId,
          unit: indObj?.unit || '%',
          plan: 'Chưa lập',
          actual: '--',
          isPass: false,
          progress: 0,
          progressText: 'Chưa có dữ liệu',
          frequency: effFreq
        });
      });
    });

    return list;
  }, [departments, kpis, kpiConfigs, selectedYear, currentLang, indicatorMap, currentUser, isAdmin]);

  // Scope rows according to activeTab (year: all KPIs, month: only monthly KPIs)
  const currentTabScopeRows = useMemo(() => {
    if (activeTab === 'month') {
      return allKpiRows.filter(r => r.frequency === 'Tháng');
    }
    return allKpiRows;
  }, [allKpiRows, activeTab]);

  // Filtered and Sorted KPI rows for the unified table
  const filteredKpiRows = useMemo(() => {
    let rows = currentTabScopeRows.filter(row => {
      const matchesCode = !searchIndicatorCode || row.indicatorCode.toLowerCase().includes(searchIndicatorCode.toLowerCase());
      const matchesDept = !searchDept || row.deptName.toLowerCase().includes(searchDept.toLowerCase());
      const matchesName = !searchKpiName || row.name.toLowerCase().includes(searchKpiName.toLowerCase()) || row.indicatorCode.toLowerCase().includes(searchKpiName.toLowerCase());

      let matchesEval = true;
      if (searchEvaluation === 'PASS') {
        matchesEval = row.type === 'configured' && row.isPass;
      } else if (searchEvaluation === 'FAIL') {
        matchesEval = row.type === 'configured' && !row.isPass;
      } else if (searchEvaluation === 'UNCONFIGURED') {
        matchesEval = row.type === 'unconfigured';
      }

      return matchesCode && matchesDept && matchesName && matchesEval;
    });

    // Apply sort
    if (sortField === 'indicatorCode') {
      rows = [...rows].sort((a, b) => {
        const codeA = a.indicatorCode || '';
        const codeB = b.indicatorCode || '';
        return sortOrder === 'asc' ? codeA.localeCompare(codeB) : codeB.localeCompare(codeA);
      });
    } else if (sortField === 'dept') {
      rows = [...rows].sort((a, b) => {
        const deptA = a.deptName || '';
        const deptB = b.deptName || '';
        return sortOrder === 'asc' ? deptA.localeCompare(deptB) : deptB.localeCompare(deptA);
      });
    } else if (sortField === 'name') {
      rows = [...rows].sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    }

    return rows;
  }, [currentTabScopeRows, searchIndicatorCode, searchDept, searchKpiName, searchEvaluation, sortField, sortOrder]);

  // Calculations for KPI Cards based on currentTabScopeRows
  const totalCount = useMemo(() => currentTabScopeRows.filter(r => r.type === 'configured').length, [currentTabScopeRows]);
  const inactiveCount = useMemo(() => currentTabScopeRows.filter(r => r.type === 'unconfigured').length, [currentTabScopeRows]);
  const failedCount = useMemo(() => currentTabScopeRows.filter(r => r.type === 'configured' && !r.isPass).length, [currentTabScopeRows]);

  const popupItems = useMemo(() => {
    if (!popupType) return [];
    if (popupType === 'inactive') {
      return currentTabScopeRows.filter(r => r.type === 'unconfigured').map(r => ({
        id: r.rowKey,
        code: r.indicatorCode,
        name: r.name,
        unit: r.unit,
        dept: r.deptName
      }));
    }
    if (popupType === 'all') {
      return currentTabScopeRows.filter(r => r.type === 'configured').map(r => ({
        id: r.rowKey,
        code: r.kpi?.code || r.indicatorCode,
        name: r.name,
        subName: r.kpi?.subName,
        unit: r.unit,
        dept: r.deptName
      }));
    }
    return currentTabScopeRows.filter(r => r.type === 'configured' && !r.isPass).map(r => ({
      id: r.rowKey,
      code: r.kpi?.code || r.indicatorCode,
      name: r.name,
      subName: r.kpi?.subName,
      unit: r.unit,
      dept: r.deptName
    }));
  }, [currentTabScopeRows, popupType]);

  const popupTitle = useMemo(() => {
    if (popupType === 'inactive') return 'Danh sách chỉ tiêu chưa thiết lập KPI';
    if (popupType === 'all') return 'Danh sách tất cả các KPI chỉ tiêu';
    if (popupType === 'failed') return 'Danh sách chỉ tiêu KPI chưa đạt';
    return '';
  }, [popupType]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Modal Cấu hình KPI */}
      {isConfigModalOpen && (
        <Modal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          title={currentLang === 'vi' ? 'Cấu hình danh mục KPI' : 'KPI Configuration Matrix'}
          size="xl"
          footer={
            <div className="flex justify-between items-center w-full">
              <span className="text-xs text-gray-500 font-medium">
                * Có thể chỉnh sửa trực tiếp Tần suất báo cáo và Chiều đánh giá cho tất cả các KPI trong bảng.
              </span>
              <Button variant="primary" onClick={() => setIsConfigModalOpen(false)}>
                {currentLang === 'vi' ? 'Hoàn tất & Đóng' : 'Done & Close'}
              </Button>
            </div>
          }
        >
          {(() => {
            const configRows = allKpiRows.filter(r => {
              const matchesCode = !configSearchCode || r.indicatorCode.toLowerCase().includes(configSearchCode.toLowerCase());
              const matchesDept = !configSearchDept || r.deptName.toLowerCase().includes(configSearchDept.toLowerCase());
              const matchesName = !configSearchName || r.name.toLowerCase().includes(configSearchName.toLowerCase()) || r.indicatorCode.toLowerCase().includes(configSearchName.toLowerCase());
              const matchesFreq = configSearchFreq === 'ALL' || r.frequency === configSearchFreq;
              const matchesDir = configSearchDir === 'ALL' || (r.kpi?.direction || 'asc') === configSearchDir;

              return matchesCode && matchesDept && matchesName && matchesFreq && matchesDir;
            });

            const hasAnyConfigFilter = Boolean(
              configSearchCode || configSearchDept || configSearchName || configSearchFreq !== 'ALL' || configSearchDir !== 'ALL'
            );

            return (
              <div className="space-y-4 max-h-[75vh] flex flex-col text-left">


                {/* Config Table with Column Filters */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[55vh] custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs min-w-[900px]">
                    <thead className="sticky top-0 z-10">
                      {/* 1. Header Titles */}
                      <tr className="bg-gray-100/90 border-b border-gray-200 font-bold text-gray-600 uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-3 text-center w-[4%] bg-gray-100">STT</th>
                        <th className="py-2.5 px-3 w-[14%] bg-gray-100">MÃ CHỈ TIÊU</th>
                        <th className="py-2.5 px-3 w-[18%] bg-gray-100">TỔ BAN (CQĐV)</th>
                        <th className="py-2.5 px-3 w-[26%] bg-gray-100">TÊN KPI</th>
                        <th className="py-2.5 px-3 w-[16%] bg-gray-100">TẦN SUẤT BÁO CÁO</th>
                        <th className="py-2.5 px-3 w-[22%] bg-gray-100">CHIỀU ĐÁNH GIÁ KPI</th>
                      </tr>

                      {/* 2. Column Filter Row */}
                      <tr className="bg-blue-50/70 border-b border-gray-200">
                        {/* 1. STT Spacer / Clear Filters */}
                        <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs bg-blue-50/70">
                          {hasAnyConfigFilter ? (
                            <button
                              type="button"
                              onClick={() => {
                                setConfigSearchCode('');
                                setConfigSearchDept('');
                                setConfigSearchName('');
                                setConfigSearchFreq('ALL');
                                setConfigSearchDir('ALL');
                              }}
                              className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded transition-colors"
                              title="Xóa tất cả bộ lọc cột"
                            >
                              Xóa
                            </button>
                          ) : (
                            '—'
                          )}
                        </th>

                        {/* 2. Filter Mã chỉ tiêu */}
                        <th className="py-2 px-2 text-left bg-blue-50/70">
                          <div className="relative">
                            <input
                              type="text"
                              value={configSearchCode}
                              onChange={(e) => setConfigSearchCode(e.target.value)}
                              placeholder="Lọc mã..."
                              className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue shadow-2xs"
                            />
                            {configSearchCode && (
                              <button onClick={() => setConfigSearchCode('')} className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                            )}
                          </div>
                        </th>

                        {/* 3. Filter Tổ ban */}
                        <th className="py-2 px-2 text-left bg-blue-50/70">
                          <div className="relative">
                            <input
                              type="text"
                              value={configSearchDept}
                              onChange={(e) => setConfigSearchDept(e.target.value)}
                              placeholder="Lọc tổ ban..."
                              className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue shadow-2xs"
                            />
                            {configSearchDept && (
                              <button onClick={() => setConfigSearchDept('')} className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                            )}
                          </div>
                        </th>

                        {/* 4. Filter Tên KPI */}
                        <th className="py-2 px-2 text-left bg-blue-50/70">
                          <div className="relative">
                            <input
                              type="text"
                              value={configSearchName}
                              onChange={(e) => setConfigSearchName(e.target.value)}
                              placeholder="Lọc tên KPI..."
                              className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue shadow-2xs"
                            />
                            {configSearchName && (
                              <button onClick={() => setConfigSearchName('')} className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                            )}
                          </div>
                        </th>

                        {/* 5. Filter Tần suất */}
                        <th className="py-2 px-2 text-left bg-blue-50/70">
                          <select
                            value={configSearchFreq}
                            onChange={(e) => setConfigSearchFreq(e.target.value)}
                            className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-1.5 py-1 text-gray-800 outline-none focus:border-vna-blue shadow-2xs"
                          >
                            <option value="ALL">Tất cả</option>
                            <option value="Năm">Năm</option>
                            <option value="Tháng">Tháng</option>
                          </select>
                        </th>

                        {/* 6. Filter Chiều đánh giá */}
                        <th className="py-2 px-2 text-left bg-blue-50/70">
                          <select
                            value={configSearchDir}
                            onChange={(e) => setConfigSearchDir(e.target.value)}
                            className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-1.5 py-1 text-gray-800 outline-none focus:border-vna-blue shadow-2xs"
                          >
                            <option value="ALL">Tất cả</option>
                            <option value="asc">Tăng (≥)</option>
                            <option value="desc">Giảm (≤)</option>
                          </select>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {configRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400 italic">
                            Không tìm thấy KPI nào phù hợp với bộ lọc cột cấu hình.
                          </td>
                        </tr>
                      ) : (
                        configRows.map((row, idx) => {
                          const currentFreq = row.frequency || 'Năm';
                          const currentDir = row.kpi?.direction || 'asc';

                          return (
                            <tr key={row.rowKey} className="hover:bg-blue-50/20 transition-colors">
                              <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-mono text-xs font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                  {row.indicatorCode}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-semibold text-gray-700">
                                  {row.deptName}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-gray-900 leading-tight">
                                  {row.name}
                                </div>
                              </td>

                              {/* 1. Cột Tần suất báo cáo - Cấu hình được cho TẤT CẢ các dòng */}
                              <td className="py-2.5 px-3">
                                <select
                                  value={currentFreq}
                                  onChange={(e) => handleUpdateRowConfig(row, 'frequency', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 hover:border-vna-blue rounded font-semibold text-xs text-gray-800 outline-none focus:border-vna-blue cursor-pointer shadow-2xs transition-colors"
                                >
                                  <option value="Năm">Năm</option>
                                  <option value="Tháng">Tháng</option>
                                </select>
                              </td>

                              {/* 2. Cột Chiều đánh giá KPI - Cấu hình được cho TẤT CẢ các dòng */}
                              <td className="py-2.5 px-3">
                                <select
                                  value={currentDir}
                                  onChange={(e) => handleUpdateRowConfig(row, 'direction', e.target.value as 'asc' | 'desc')}
                                  className={`w-full px-2.5 py-1.5 bg-white border rounded font-semibold text-xs outline-none focus:border-vna-blue cursor-pointer shadow-2xs transition-colors ${currentDir === 'asc'
                                    ? 'border-emerald-300 text-emerald-700 bg-emerald-50/20 hover:border-emerald-500'
                                    : 'border-amber-300 text-amber-700 bg-amber-50/20 hover:border-amber-500'
                                    }`}
                                >
                                  <option value="asc">Thực hiện &ge; Kế hoạch (Đạt khi tăng)</option>
                                  <option value="desc">Thực hiện &le; Kế hoạch (Đạt khi giảm)</option>
                                </select>
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

      {/* Modal Lịch sử thay đổi & Thiết lập KPI (Audit Log) */}
      {isAuditModalOpen && (
        <Modal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          title={currentLang === 'vi' ? 'Lịch sử thay đổi & Thiết lập KPI (Audit Log)' : 'KPI Audit Log & History'}
          size="xl"
          footer={
            <div className="flex justify-between items-center w-full">
              <span className="text-xs text-gray-500 font-medium">
                {/* * Ghi lại toàn bộ lịch sử thiết lập mới, chỉnh sửa kế hoạch và cấu hình chỉ tiêu KPI. */}
              </span>
              <Button variant="primary" onClick={() => setIsAuditModalOpen(false)}>
                {currentLang === 'vi' ? 'Đóng' : 'Close'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 max-h-[75vh] flex flex-col text-left">
            {/* Header Switch Tabs: Tab Năm & Tab Tháng */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
              <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setAuditTab('year')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-bold text-xs transition-all cursor-pointer ${auditTab === 'year'
                    ? 'bg-white text-vna-blue shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                >
                  <span>{currentLang === 'vi' ? 'Lịch sử KPI Năm' : 'Annual Audit Log'}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${auditTab === 'year' ? 'bg-blue-50 text-vna-blue border border-blue-200' : 'bg-gray-200 text-gray-700'
                    }`}>
                    {kpiAuditLogs.filter(l => l.scope === 'year').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuditTab('month')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-bold text-xs transition-all cursor-pointer ${auditTab === 'month'
                    ? 'bg-white text-vna-blue shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                >
                  <span>{currentLang === 'vi' ? 'Lịch sử KPI Tháng' : 'Monthly Audit Log'}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${auditTab === 'month' ? 'bg-blue-50 text-vna-blue border border-blue-200' : 'bg-gray-200 text-gray-700'
                    }`}>
                    {kpiAuditLogs.filter(l => l.scope === 'month').length}
                  </span>
                </button>
              </div>

              {/* Filter controls inside audit modal */}
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={auditSearchText}
                    onChange={(e) => setAuditSearchText(e.target.value)}
                    placeholder={currentLang === 'vi' ? 'Tìm mã, người sửa, nội dung...' : 'Search code, actor, diff...'}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold outline-none focus:border-vna-blue shadow-2xs"
                  />
                  {auditSearchText && (
                    <button onClick={() => setAuditSearchText('')} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                  )}
                </div>

                {/* <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold outline-none focus:border-vna-blue cursor-pointer shadow-2xs"
                >
                  <option value="ALL">-- Tất cả hành động --</option>
                  <option value="UPDATE_PLAN">Chỉnh sửa kế hoạch</option>
                  <option value="CREATE">Thiết lập mới</option>
                  <option value="CONFIG">Cấu hình chỉ tiêu</option>
                  <option value="DELETE">Xóa</option>
                </select> */}
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[55vh] custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs min-w-[950px]">
                <thead className="bg-gray-100/90 sticky top-0 z-10 border-b border-gray-200 font-bold text-gray-600 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-[4%] bg-gray-100">STT</th>
                    <th className="py-2.5 px-3 w-[13%] bg-gray-100">THỜI GIAN</th>
                    <th className="py-2.5 px-3 w-[16%] bg-gray-100">NGƯỜI THỰC HIỆN</th>
                    {/* <th className="py-2.5 px-3 w-[13%] bg-gray-100">HÀNH ĐỘNG</th> */}
                    <th className="py-2.5 px-3 w-[10%] bg-gray-100">MÃ CHỈ TIÊU</th>
                    <th className="py-2.5 px-3 w-[16%] bg-gray-100">TÊN KPI</th>
                    <th className="py-2.5 px-3 w-[28%] bg-gray-100">MÔ TẢ THAY ĐỔI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {(() => {
                    const logsToDisplay = kpiAuditLogs.filter(log => {
                      const matchesScope = log.scope === auditTab;
                      const matchesAction = auditActionFilter === 'ALL' || log.actionType === auditActionFilter;
                      const matchesSearch = !auditSearchText ||
                        log.indicatorCode.toLowerCase().includes(auditSearchText.toLowerCase()) ||
                        log.kpiName.toLowerCase().includes(auditSearchText.toLowerCase()) ||
                        log.userName.toLowerCase().includes(auditSearchText.toLowerCase()) ||
                        log.deptName.toLowerCase().includes(auditSearchText.toLowerCase()) ||
                        log.changeDetails.toLowerCase().includes(auditSearchText.toLowerCase());

                      return matchesScope && matchesAction && matchesSearch;
                    });

                    if (logsToDisplay.length === 0) {
                      return (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                            Chưa có bản ghi lịch sử nào cho danh mục này.
                          </td>
                        </tr>
                      );
                    }

                    return logsToDisplay.map((log, idx) => {
                      return (
                        <tr key={log.id} className="hover:bg-blue-50/20 transition-colors">
                          {/* 1. STT */}
                          <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                            {idx + 1}
                          </td>

                          {/* 2. Thời gian */}
                          <td className="py-2.5 px-3 font-mono text-[11px] text-gray-700 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock size={12} className="text-gray-400" />
                              <span>{log.timestamp}</span>
                            </div>
                          </td>

                          {/* 3. Người thực hiện */}
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-gray-900 leading-tight">
                              {log.userName}
                            </div>
                            {/* <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                              {log.department}
                            </div> */}
                          </td>

                          {/* 4. Hành động */}
                          {/* <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${log.actionType === 'CREATE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : log.actionType === 'UPDATE_PLAN'
                                ? 'bg-blue-50 text-vna-blue border-blue-200'
                                : log.actionType === 'CONFIG'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                              {log.actionLabel}
                            </span>
                          </td> */}

                          {/* 5. Mã chỉ tiêu */}
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-xs font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                              {log.indicatorCode}
                            </span>
                          </td>

                          {/* 6. Tổ ban & Tên KPI */}
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-gray-800 leading-tight">
                              {log.kpiName}
                            </div>
                            {/* <div className="text-[10px] text-gray-500 font-medium">
                              {log.deptName}
                            </div> */}
                          </td>

                          {/* 7. Mô tả thay đổi */}
                          <td className="py-2.5 px-3">
                            <div className="text-gray-800 bg-gray-50/90 p-2 rounded border border-gray-200/80 font-mono text-[11px] leading-relaxed">
                              {log.changeDetails}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit/Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? `Thiết lập KPI năm ${selectedYear}` : "Cập nhật KPI"}
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
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tên KPI:
            </label>
            <div className="px-3.5 py-2.5 bg-gray-100/80 border border-gray-300 rounded-md text-sm font-bold text-vna-navy shadow-2xs flex items-center justify-between">
              <span>{name || 'Chưa chọn chỉ tiêu'}</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                Tự động từ danh mục
              </span>
            </div>
          </div>
          {/* <div className="md:col-span-2">
            <Input label="Tên Tiếng Anh (nếu có)" value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="English name..." />
          </div> */}









          {(activeTab === 'month' || frequency === 'Tháng') && (
            <div className="md:col-span-2 bg-blue-50/20 p-3.5 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-vna-navy flex items-center gap-2">
                  <Calendar size={16} className="text-vna-blue" />
                  Bảng kế hoạch chi tiết 12 tháng
                </label>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 shadow-2xs">
                  Tổng: <strong className="text-vna-blue ml-0.5">{(Object.values(monthlyPlans) as string[]).reduce((acc: number, val: string) => acc + (parseFloat(val) || 0), 0)}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Nửa đầu năm: Tháng 1 - Tháng 6 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                      <tr>
                        <th className="py-2 px-3 text-left w-[110px] bg-gray-100/60 border-r border-gray-200">Kỳ báo cáo</th>
                        <th className="py-2 px-3 text-left">Số kế hoạch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[1, 2, 3, 4, 5, 6].map(month => (
                        <tr key={month} className="hover:bg-blue-50/20 transition-colors">
                          <td className="py-2 px-3 font-semibold text-gray-700 bg-gray-50/40 border-r border-gray-100 whitespace-nowrap">
                            Tháng {month}
                          </td>
                          <td className="py-1 px-2">
                            <input
                              type="number"
                              min="0"
                              value={monthlyPlans[month.toString()] || ''}
                              onChange={(e) => {
                                const newMonthly = { ...monthlyPlans, [month.toString()]: e.target.value };
                                setMonthlyPlans(newMonthly);
                                const total = (Object.values(newMonthly) as string[]).reduce((acc: number, val: string) => acc + (parseFloat(val) || 0), 0);
                                setPlan(total.toString());
                              }}
                              className="w-full px-2.5 py-1.5 border border-gray-200 hover:border-gray-300 focus:border-vna-blue focus:ring-1 focus:ring-vna-blue rounded text-xs font-semibold focus:outline-none bg-white transition-all"
                              placeholder="Nhập số K.H..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Nửa cuối năm: Tháng 7 - Tháng 12 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                      <tr>
                        <th className="py-2 px-3 text-left w-[110px] bg-gray-100/60 border-r border-gray-200">Kỳ báo cáo</th>
                        <th className="py-2 px-3 text-left">Số kế hoạch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[7, 8, 9, 10, 11, 12].map(month => (
                        <tr key={month} className="hover:bg-blue-50/20 transition-colors">
                          <td className="py-2 px-3 font-semibold text-gray-700 bg-gray-50/40 border-r border-gray-100 whitespace-nowrap">
                            Tháng {month}
                          </td>
                          <td className="py-1 px-2">
                            <input
                              type="number"
                              min="0"
                              value={monthlyPlans[month.toString()] || ''}
                              onChange={(e) => {
                                const newMonthly = { ...monthlyPlans, [month.toString()]: e.target.value };
                                setMonthlyPlans(newMonthly);
                                const total = (Object.values(newMonthly) as string[]).reduce((acc: number, val: string) => acc + (parseFloat(val) || 0), 0);
                                setPlan(total.toString());
                              }}
                              className="w-full px-2.5 py-1.5 border border-gray-200 hover:border-gray-300 focus:border-vna-blue focus:ring-1 focus:ring-vna-blue rounded text-xs font-semibold focus:outline-none bg-white transition-all"
                              placeholder="Nhập số K.H..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* <div className="mt-2.5 text-[11px] text-blue-600 italic bg-blue-50/70 p-2 rounded border border-blue-100/50">
                *Hệ thống tự động cộng dồn các tháng vào ô <strong>"Số kế hoạch"</strong> bên dưới. Bạn vẫn có thể chỉnh sửa thủ công số kế hoạch tổng (bất đồng bộ với tổng tháng).
              </div> */}
            </div>
          )}

          <Input
            label={activeTab === 'month' || frequency === 'Tháng' ? "Tổng số kế hoạch năm (Tự động tính từ 12 tháng)" : "Số kế hoạch năm"}
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            disabled={activeTab === 'month' || frequency === 'Tháng'}
            className={activeTab === 'month' || frequency === 'Tháng' ? "bg-gray-100/80 font-bold text-vna-blue cursor-not-allowed" : ""}
            placeholder="VD: 100"
          />
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

      {/* Top Year Selection Toolbar with Cấu hình Button */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* <div className="p-2.5 bg-blue-50 text-vna-blue rounded-lg border border-blue-100 flex items-center justify-center shadow-2xs">
            <Calendar size={20} />
          </div> */}
          <div>
            {/* <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              {currentLang === 'vi' ? 'Năm kế hoạch' : 'KPI Planning Year'}
            </label> */}
            <div className="flex items-center gap-2.5 mt-0.5">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-white border border-gray-300 rounded-lg text-sm font-bold text-vna-navy focus:outline-none focus:ring-2 focus:ring-vna-blue focus:border-vna-blue cursor-pointer shadow-2xs transition-colors"
              >
                <option value="2027">Năm 2027</option>
                <option value="2026">Năm 2026</option>
                <option value="2025">Năm 2025</option>
                <option value="2024">Năm 2024</option>
              </select>
            </div>
          </div>
        </div>

        {/* Nút Cấu hình, Lịch sử & Chỉnh sửa Kế hoạch */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-2 text-xs font-bold py-2 px-3.5 border-gray-300 hover:border-vna-blue hover:text-vna-blue hover:bg-blue-50/50 transition-colors shadow-2xs"
          >
            <Settings size={15} className="text-vna-blue" />
            <span>{currentLang === 'vi' ? 'Cấu hình' : 'Configuration'}</span>
          </Button>

          {/* Nút Lịch sử Audit Log */}
          <Button
            variant="outline"
            onClick={() => {
              setAuditTab(activeTab);
              setIsAuditModalOpen(true);
            }}
            className="flex items-center gap-2 text-xs font-bold py-2 px-3.5 border-gray-300 hover:border-vna-blue hover:text-vna-blue hover:bg-blue-50/50 transition-colors shadow-2xs"
          >
            <History size={15} className="text-vna-blue" />
            <span>{currentLang === 'vi' ? 'Lịch sử' : 'Audit Log'}</span>
          </Button>

          {isInlineEditMode ? (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <Button
                variant="outline"
                onClick={handleCancelInlineEdit}
                className="flex items-center gap-1.5 text-xs font-bold py-2 px-3 border-gray-300 hover:bg-gray-100 text-gray-700 shadow-2xs"
              >
                <X size={15} />
                <span>{currentLang === 'vi' ? 'Hủy' : 'Cancel'}</span>
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveInlineEdit}
                className="flex items-center gap-1.5 text-xs font-bold py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
              >
                <Check size={15} />
                <span>{currentLang === 'vi' ? 'Lưu kế hoạch' : 'Save Plan'}</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleStartInlineEdit}
              className="flex items-center gap-2 text-xs font-bold py-2 px-3.5 border-gray-300 hover:border-vna-blue hover:text-vna-blue hover:bg-blue-50/50 transition-colors shadow-2xs"
            >
              <Edit2 size={15} className="text-vna-blue" />
              <span>{currentLang === 'vi' ? 'Chỉnh sửa' : 'Edit Plan'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2 Tabs & Dòng thống kê KPI phía trên bảng */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* 2 Tabs: Năm & Tháng */}
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('year')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs transition-all cursor-pointer ${activeTab === 'year'
              ? 'bg-white text-vna-blue shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
          >
            <span>{currentLang === 'vi' ? 'Năm' : 'Annual View (All)'}</span>
            {/* <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'year' ? 'bg-blue-50 text-vna-blue border border-blue-200' : 'bg-gray-200 text-gray-700'
              }`}>
              {allKpiRows.length}
            </span> */}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('month')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs transition-all cursor-pointer ${activeTab === 'month'
              ? 'bg-white text-vna-blue shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
          >
            <span>{currentLang === 'vi' ? 'Tháng' : 'Monthly View'}</span>
            {/* <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'month' ? 'bg-blue-50 text-vna-blue border border-blue-200' : 'bg-gray-200 text-gray-700'
              }`}>
              {allKpiRows.filter(r => r.frequency === 'Tháng').length}
            </span> */}
          </button>
        </div>

        {/* Dòng text thống kê trực tiếp phía trên bảng */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs pr-2">
          <button
            type="button"
            onClick={() => setPopupType('all')}
            className="group flex items-center gap-1.5 text-gray-600 hover:text-vna-blue transition-colors cursor-pointer"
            title="Nhấn để xem danh sách tổng số KPI"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 group-hover:scale-110 transition-transform"></span>
            <span className="font-medium text-gray-500">Tổng số KPI:</span>
            <span className="font-bold text-gray-900 group-hover:text-vna-blue text-sm">{totalCount}</span>
          </button>

          <span className="text-gray-300 font-light">|</span>

          <button
            type="button"
            onClick={() => setPopupType('inactive')}
            className="group flex items-center gap-1.5 text-gray-600 hover:text-amber-600 transition-colors cursor-pointer"
            title="Nhấn để xem danh sách chỉ tiêu chưa có KPI"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 group-hover:scale-110 transition-transform"></span>
            <span className="font-medium text-gray-500">Chưa có KPI:</span>
            <span className="font-bold text-amber-600 text-sm">{inactiveCount}</span>
          </button>

          <span className="text-gray-300 font-light">|</span>

          <button
            type="button"
            onClick={() => setPopupType('failed')}
            className="group flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
            title="Nhấn để xem danh sách KPI chưa đạt"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 group-hover:scale-110 transition-transform"></span>
            <span className="font-medium text-gray-500">KPI chưa đạt:</span>
            <span className="font-bold text-red-600 text-sm">{failedCount}</span>
          </button>
        </div>
      </div>

      {/* Main Unified KPI Table */}
      <Card className="p-0 overflow-hidden border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1250px] text-sm">
            <thead>
              {/* HEADER ROW */}
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4 text-center w-[4%]">STT</th>

                {/* Cột Mã chỉ tiêu gốc - Có Sắp xếp Sort */}
                <th
                  onClick={() => handleToggleSort('indicatorCode')}
                  className="py-3 px-4 w-[11%] cursor-pointer select-none hover:bg-gray-100 transition-colors"
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

                {/* Cột Tổ ban (CQĐV) - Có Sắp xếp Sort */}
                <th
                  onClick={() => handleToggleSort('dept')}
                  className="py-3 px-4 w-[18%] cursor-pointer select-none hover:bg-gray-100 transition-colors"
                  title={currentLang === 'vi' ? 'Nhấn để sắp xếp theo Tổ ban (CQĐV)' : 'Click to sort by Department'}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>{currentLang === 'vi' ? 'TỔ BAN (CQĐV)' : 'DEPARTMENT'}</span>
                    <span className="text-gray-400">
                      {sortField === 'dept' && sortOrder === 'asc' ? <ArrowUp size={14} className="text-vna-blue font-bold" /> :
                        sortField === 'dept' && sortOrder === 'desc' ? <ArrowDown size={14} className="text-vna-blue font-bold" /> :
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

                <th className="py-3 px-3 w-[5%]">{currentLang === 'vi' ? 'ĐVT' : 'UNIT'}</th>
                <th className="py-3 px-3 text-center w-[8%]">{currentLang === 'vi' ? 'KẾ HOẠCH' : 'TARGET'}</th>
                <th className="py-3 px-3 text-center w-[8%]">{currentLang === 'vi' ? 'THỰC HIỆN' : 'ACTUAL'}</th>

                {/* 1. Đánh giá đứng trước */}
                <th className="py-3 px-3 w-[12%]">{currentLang === 'vi' ? 'ĐÁNH GIÁ' : 'EVALUATION'}</th>

                {/* 2. Cùng kỳ chỉ hiển thị ở Tab Năm và đứng sau Đánh giá */}
                {activeTab === 'year' && (
                  <th className="py-3 px-3 text-center w-[9%]">{currentLang === 'vi' ? 'CÙNG KỲ' : 'YoY'}</th>
                )}

                <th className="py-3 px-3 text-center w-[5%]">{currentLang === 'vi' ? 'THAO TÁC' : 'ACTIONS'}</th>
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
                      className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue shadow-2xs"
                    />
                    {searchIndicatorCode && (
                      <button onClick={() => setSearchIndicatorCode('')} className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                    )}
                  </div>
                </th>

                {/* 3. Lọc Tổ ban (CQĐV) */}
                <th className="py-2 px-2 text-left">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchDept}
                      onChange={(e) => setSearchDept(e.target.value)}
                      placeholder={currentLang === 'vi' ? 'Lọc tổ ban...' : 'Filter dept...'}
                      className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue shadow-2xs"
                    />
                    {searchDept && (
                      <button onClick={() => setSearchDept('')} className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                    )}
                  </div>
                </th>

                {/* 4. Lọc Tên KPI */}
                <th className="py-2 px-2 text-left">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchKpiName}
                      onChange={(e) => setSearchKpiName(e.target.value)}
                      placeholder={currentLang === 'vi' ? 'Lọc tên KPI...' : 'Filter name...'}
                      className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue shadow-2xs"
                    />
                    {searchKpiName && (
                      <button onClick={() => setSearchKpiName('')} className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
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
                    className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-1.5 py-1 text-gray-800 outline-none focus:border-vna-blue shadow-2xs"
                  >
                    <option value="">{currentLang === 'vi' ? 'Tất cả' : 'All'}</option>
                    <option value="PASS">{currentLang === 'vi' ? 'ĐẠT' : 'PASS'}</option>
                    <option value="FAIL">{currentLang === 'vi' ? 'CHƯA ĐẠT' : 'FAIL'}</option>
                    <option value="UNCONFIGURED">{currentLang === 'vi' ? 'Chưa thiết lập' : 'Unconfigured'}</option>
                  </select>
                </th>

                {/* 9. Cùng kỳ Spacer (Chỉ ở Tab Năm) */}
                {activeTab === 'year' && (
                  <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>
                )}

                {/* 10. Nút Xóa Lọc */}
                <th className="py-2 px-2 text-center">
                  {(searchIndicatorCode || searchDept || searchKpiName || searchEvaluation) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchIndicatorCode('');
                        setSearchDept('');
                        setSearchKpiName('');
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
              {filteredKpiRows.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'year' ? 10 : 9} className="py-8 text-center text-gray-400 text-xs font-medium">
                    Không tìm thấy chỉ tiêu KPI nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredKpiRows.map((row, idx) => {
                  const isMonthlyTab = activeTab === 'month';
                  const isMonthlyKpi = row.frequency === 'Tháng';
                  const canExpandMonths = isMonthlyTab && isMonthlyKpi;

                  if (row.type === 'configured' && row.kpi) {
                    const kpi = row.kpi;
                    const isCollapsed = Boolean(collapsedKpiMonths[kpi.id]);

                    return (
                      <React.Fragment key={row.rowKey}>
                        <tr
                          onClick={() => {
                            if (canExpandMonths) {
                              setCollapsedKpiMonths(prev => ({ ...prev, [kpi.id]: !prev[kpi.id] }));
                            }
                          }}
                          className={`transition-all ${canExpandMonths
                            ? 'cursor-pointer hover:bg-blue-50/50 group select-none ' + (isCollapsed ? 'bg-white' : 'bg-blue-50/15')
                            : 'hover:bg-gray-50/70'
                            }`}
                          title={canExpandMonths ? (isCollapsed ? 'Nhấn vào dòng để mở rộng 12 tháng chi tiết' : 'Nhấn vào dòng để thu gọn 12 tháng') : undefined}
                        >
                          {/* 1. STT & Chevron */}
                          <td className="py-3.5 px-4 text-center text-gray-500 font-medium">
                            <div className="flex items-center justify-center gap-1.5">
                              {canExpandMonths && (
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 border shadow-2xs ${isCollapsed
                                  ? 'text-vna-blue bg-blue-50 border-blue-200 group-hover:bg-blue-100 group-hover:scale-110'
                                  : 'text-white bg-vna-blue border-vna-blue rotate-90 scale-105'
                                  }`}>
                                  <ChevronRight size={12} />
                                </span>
                              )}
                              <span>{idx + 1}</span>
                            </div>
                          </td>

                          {/* 2. Mã chỉ tiêu */}
                          <td className="py-3.5 px-4">
                            {row.indicatorCode ? (
                              <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                {row.indicatorCode}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </td>

                          {/* 3. Tổ ban */}
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold text-gray-800">
                              {row.deptName}
                            </span>
                          </td>

                          {/* 4. Tên KPI */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-900">
                              {row.name}
                            </div>
                          </td>

                          {/* 5. ĐVT */}
                          <td className="py-3.5 px-4 text-gray-600 font-medium text-xs">{row.unit}</td>

                          {/* 6. Kế hoạch */}
                          <td className="py-3.5 px-4 text-center font-bold text-vna-blue text-sm">
                            {isInlineEditMode && row.isUserDept && !isMonthlyTab ? (
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={row.plan === 'Chưa lập' || row.plan === '--' ? '' : row.plan}
                                onChange={(e) => handleInlineChangePlan(row, e.target.value)}
                                className="w-24 px-2 py-1 bg-white border border-vna-blue/80 focus:border-vna-blue focus:ring-2 focus:ring-vna-blue/20 rounded text-center text-xs font-bold text-vna-blue shadow-2xs outline-none transition-all"
                                placeholder="Nhập K.H..."
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <div>
                                <span>{row.plan}</span>
                                {isMonthlyTab && (
                                  <div className="text-[9px] font-normal text-gray-400">Tổng 12 tháng</div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* 7. Thực hiện */}
                          <td className="py-3.5 px-3 text-center font-bold text-gray-900">
                            <div>{row.actual}</div>
                            {isMonthlyTab && (
                              <div className="text-[9px] font-normal text-gray-400">Tổng năm</div>
                            )}
                          </td>

                          {/* 8. Đánh giá (Đứng trước Cùng kỳ) */}
                          <td className="py-3.5 px-3 min-w-[140px]">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${row.isPass ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {row.isPass ? 'ĐẠT' : 'CHƯA ĐẠT'}
                              </span>
                              <span className={`text-xs font-bold ${row.isPass ? 'text-emerald-600' : 'text-red-600'}`}>
                                {row.progressText}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${row.isPass ? 'bg-emerald-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(Math.max(row.progress, 0), 100)}%` }}
                              ></div>
                            </div>
                          </td>

                          {/* 9. Cùng kỳ (Chỉ hiển thị ở Tab Năm, đứng sau Đánh giá) */}
                          {activeTab === 'year' && (
                            <td className="py-3.5 px-3 text-center">
                              {(() => {
                                const yoy = getYoYComparison(
                                  kpis,
                                  selectedYear,
                                  row.deptName,
                                  row.indicatorCode,
                                  row.actual,
                                  row.kpi?.direction || 'asc'
                                );

                                if (yoy.text === '--') {
                                  return <span className="text-gray-300 text-xs">—</span>;
                                }

                                const isPositive = yoy.percent !== null && yoy.percent >= 0;

                                return (
                                  <div className="flex flex-col items-center justify-center">
                                    <span
                                      className={`inline-flex items-center gap-0.5 font-bold text-xs px-1.5 py-0.5 rounded shadow-2xs ${isPositive
                                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                        : 'text-amber-700 bg-amber-50 border border-amber-200'
                                        }`}
                                      title={`Cùng kỳ năm ${parseInt(selectedYear, 10) - 1}: ${yoy.prevActual}`}
                                    >
                                      {isPositive ? <ArrowUp size={11} className="shrink-0" /> : <ArrowDown size={11} className="shrink-0" />}
                                      <span>{yoy.text}</span>
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-medium mt-0.5">
                                      {parseInt(selectedYear, 10) - 1}: {yoy.prevActual}
                                    </span>
                                  </div>
                                );
                              })()}
                            </td>
                          )}

                          {/* 10. Thao tác */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              {row.isUserDept ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(kpi.id, row.deptName);
                                  }}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                  title="Xóa KPI"
                                >
                                  <Trash2 size={16} />
                                </button>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Chỉ trải ra 12 tháng khi ở Tab Tháng (Không có cột Cùng kỳ) */}
                        {canExpandMonths && !isCollapsed && Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                          const mPlan = kpi.monthlyPlans?.[month.toString()] || (kpi.plan && !isNaN(Number(kpi.plan)) ? (Number(kpi.plan) / 12).toFixed(1).replace(/\.?0+$/, '') : '--');
                          const mActual = getMonthlyActual(kpi, month);
                          const prog = getMonthlyProgress(kpi, month);

                          return (
                            <tr key={`month-${kpi.id}-${month}`} className="bg-slate-50/40 hover:bg-blue-50/40 transition-colors border-t border-gray-100 text-xs">
                              <td className="py-2.5 px-4 text-center text-gray-400 font-mono text-[11px]">
                                {idx + 1}.{month}
                              </td>
                              <td className="py-2.5 px-4"></td>
                              <td className="py-2.5 px-4 text-gray-500 font-medium text-xs">
                                {row.deptName}
                              </td>
                              <td className="py-2.5 px-4">
                                <div className="text-xs text-gray-700 font-semibold flex items-center gap-1.5">
                                  <Calendar size={12} className="text-vna-blue" />
                                  Tháng {month}
                                </div>
                              </td>
                              <td className="py-2.5 px-4 text-gray-500 text-xs">{row.unit}</td>

                              {/* Kế hoạch tháng: Cho phép sửa trực tiếp khi ở chế độ Chỉnh sửa */}
                              <td className="py-2.5 px-4 text-center font-bold text-vna-blue text-xs">
                                {isInlineEditMode && row.isUserDept ? (
                                  <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={kpi.monthlyPlans?.[month.toString()] || ''}
                                    onChange={(e) => handleInlineChangeMonthPlan(row, month, e.target.value)}
                                    className="w-24 px-2 py-1 bg-white border border-vna-blue/80 focus:border-vna-blue focus:ring-2 focus:ring-vna-blue/20 rounded text-center text-xs font-bold text-vna-blue shadow-2xs outline-none transition-all"
                                    placeholder="K.H tháng..."
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  mPlan
                                )}
                              </td>

                              <td className="py-2.5 px-3 text-center font-bold text-gray-800 text-xs">
                                {mActual}
                              </td>

                              <td className="py-2.5 px-3 min-w-[140px]">
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${prog.isPass ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                      }`}>
                                      {prog.isPass ? 'ĐẠT' : 'CHƯA ĐẠT'}
                                    </span>
                                    <span className={`text-xs font-bold ${prog.isPass ? 'text-emerald-600' : 'text-red-600'}`}>
                                      {prog.text}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200/80 rounded-full h-1 overflow-hidden">
                                    <div
                                      className={`h-1 rounded-full transition-all duration-300 ${prog.isPass ? 'bg-emerald-500' : 'bg-red-500'}`}
                                      style={{ width: `${Math.min(Math.max(parseInt(prog.text) || 0, 0), 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-2.5 px-4 text-center text-gray-300 text-xs">
                                —
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  }

                  // Unconfigured Indicator row (Chưa lập)
                  const codeId = row.indicatorCode;
                  const indObj = indicatorMap.get(codeId);

                  return (
                    <React.Fragment key={row.rowKey}>
                      <tr className="bg-amber-50/20 hover:bg-amber-50/40 transition-colors border-dashed">
                        <td className="py-3.5 px-4 text-center text-gray-400 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {codeId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-semibold text-gray-800">
                            {row.deptName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-gray-800">
                            {row.name}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 text-xs">{row.unit}</td>

                        {/* Kế hoạch */}
                        <td className="py-3.5 px-4 text-center text-gray-400 italic">
                          {isInlineEditMode && row.isUserDept && !isMonthlyTab ? (
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value=""
                              onChange={(e) => handleInlineChangePlan(row, e.target.value)}
                              className="w-24 px-2 py-1 bg-white border-2 border-dashed border-amber-400 focus:border-vna-blue focus:ring-2 focus:ring-vna-blue/20 rounded text-center text-xs font-bold text-gray-800 shadow-2xs outline-none transition-all"
                              placeholder="Thiết lập..."
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            'Chưa lập'
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center text-gray-400 italic">--</td>

                        {/* Đánh giá */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-xs text-gray-400 italic">Chưa có dữ liệu</span>
                        </td>

                        {/* Cùng kỳ (Chỉ hiển thị ở Tab Năm, đứng sau Đánh giá) */}
                        {activeTab === 'year' && (
                          <td className="py-3.5 px-4 text-center text-gray-300 text-xs">—</td>
                        )}

                        <td className="py-3.5 px-4 text-center">
                          <span className="text-gray-300 text-xs">—</span>
                        </td>
                      </tr>

                      {/* Ở Tab Tháng khi bật chế độ Chỉnh sửa: Hiển thị 12 dòng tháng để nhập kế hoạch */}
                      {isMonthlyTab && isInlineEditMode && Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <tr key={`unconf-month-${row.rowKey}-${month}`} className="bg-amber-50/10 hover:bg-blue-50/30 transition-colors border-t border-amber-100 text-xs">
                          <td className="py-2.5 px-4 text-center text-gray-400 font-mono text-[11px]">
                            {idx + 1}.{month}
                          </td>
                          <td className="py-2.5 px-4"></td>
                          <td className="py-2.5 px-4 text-gray-500 font-medium text-xs">
                            {row.deptName}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="text-xs text-amber-800 font-semibold flex items-center gap-1.5">
                              <Calendar size={12} className="text-amber-600" />
                              Tháng {month} (Thiết lập mới)
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-gray-500 text-xs">{row.unit}</td>

                          {/* Ô nhập kế hoạch từng tháng */}
                          <td className="py-2.5 px-4 text-center font-bold text-vna-blue text-xs">
                            {row.isUserDept ? (
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value=""
                                onChange={(e) => handleInlineChangeMonthPlan(row, month, e.target.value)}
                                className="w-24 px-2 py-1 bg-white border-2 border-dashed border-amber-400 hover:border-vna-blue focus:border-vna-blue focus:ring-2 focus:ring-vna-blue/20 rounded text-center text-xs font-bold text-vna-blue shadow-2xs outline-none transition-all"
                                placeholder="K.H tháng..."
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              '--'
                            )}
                          </td>

                          <td className="py-2.5 px-4 text-center text-gray-400 italic">--</td>
                          <td className="py-2.5 px-4 text-center text-gray-400 italic">Chưa có dữ liệu</td>
                          <td className="py-2.5 px-4 text-center text-gray-300 text-xs">—</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
