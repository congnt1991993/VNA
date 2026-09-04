import React, { useState, useEffect, useMemo } from 'react';
import {
  Maximize2,
  Minimize2,
  Leaf,
  Users,
  ShieldAlert,
  ArrowLeft,
  FileText,
  Search,
  Globe,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Award,
  Target,
  Sparkles
} from 'lucide-react';
import { Card, Table, Badge, PillarBadge, Button, Select, Input } from '../components/UI';
import MOCK_INDICATORS_JSON from '../data/indicators_main_list.json';

export interface KPIItem {
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
    endDate: "2026-12-31"
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

// Helper function to extract VI/EN name from bilingual indicator strings
const getLocalizedIndicatorName = (name?: string, lang: 'vi' | 'en' = 'vi'): string => {
  if (!name) return '';
  if (name.includes(' / ')) {
    const parts = name.split(' / ');
    return lang === 'vi' ? (parts[1]?.trim() || parts[0]?.trim()) : parts[0]?.trim();
  }
  if (name.includes('/')) {
    const parts = name.split('/').map(p => p.trim());
    if (parts.length >= 2) {
      return lang === 'vi' ? (parts[1] || parts[0]) : (parts[0] || parts[1]);
    }
  }
  const match = name.match(/^(.*?)s*\((.*?)\)$/);
  if (match) {
    const enPart = match[1].trim();
    const viPart = match[2].trim();
    return lang === 'vi' ? (viPart || enPart) : (enPart || viPart);
  }
  return name;
};

// Helper function to get KPI name according to selected system language
const getKpiDisplayName = (kpi: KPIItem, lang: 'vi' | 'en' = 'vi'): string => {
  if (lang === 'vi') {
    if (kpi.name) {
      if (kpi.name.includes('/')) {
        return getLocalizedIndicatorName(kpi.name, 'vi');
      }
      return kpi.name;
    }
    return kpi.subName ? getLocalizedIndicatorName(kpi.subName, 'vi') : '';
  } else {
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

// Calculate previous period comparison (Cùng kỳ YoY)
const getYoYComparison = (
  kpisList: KPIItem[],
  currentYear: string,
  deptName: string,
  indicatorCode: string,
  currentActualStr: string,
  direction: 'asc' | 'desc' = 'asc'
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

  const prevActualStr = String(prevKpi.actual);
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

export const ExecutiveDashboard: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>(
    () => (localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi'
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'E' | 'S' | 'G'>('ALL');
  const [selectedYear] = useState<string>('2026');
  const [indicators, setIndicators] = useState<any[]>([]);
  const [kpis, setKpis] = useState<KPIItem[]>([]);
  const [viewMode, setViewMode] = useState<'LIST' | 'DASHBOARD'>('LIST');
  const [selectedIndicator, setSelectedIndicator] = useState<any | null>(null);
  const [adjustments, setAdjustments] = useState<any[]>([]);

  // Sorting & Column-level filter states for KPI table
  const [sortField, setSortField] = useState<'indicatorCode' | 'dept' | 'name' | 'none'>('none');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchIndicatorCode, setSearchIndicatorCode] = useState('');
  const [searchDept, setSearchDept] = useState('');
  const [searchKpiName, setSearchKpiName] = useState('');
  const [searchEvaluation, setSearchEvaluation] = useState<string>('');

  // Load adjustments
  const loadAdjustments = () => {
    const saved = localStorage.getItem('vna_publish_adjustments');
    if (saved) {
      try {
        setAdjustments(JSON.parse(saved));
      } catch (e) { }
    }
  };

  // Load indicators
  const loadIndicators = () => {
    const saved = localStorage.getItem('vna_esg_indicators');
    if (saved) {
      try {
        setIndicators(JSON.parse(saved));
      } catch (e) {
        setIndicators(MOCK_INDICATORS_JSON);
      }
    } else {
      setIndicators(MOCK_INDICATORS_JSON);
    }
  };

  // Load KPIs
  const loadKpis = () => {
    const saved = localStorage.getItem('vna_esg_kpis');
    if (saved) {
      try {
        setKpis(JSON.parse(saved));
      } catch (e) {
        setKpis(INITIAL_KPIS);
      }
    } else {
      setKpis(INITIAL_KPIS);
    }
  };

  useEffect(() => {
    loadIndicators();
    loadKpis();
    loadAdjustments();

    const handleSyncInd = () => {
      loadIndicators();
    };

    const handleSyncKpis = () => {
      loadKpis();
    };

    const handleAdjSync = () => {
      loadAdjustments();
    };

    const handleLangChange = () => {
      setCurrentLang((localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('vna_indicators_updated', handleSyncInd);
    window.addEventListener('vna_kpis_updated', handleSyncKpis);
    window.addEventListener('vna_publish_adjustments_updated', handleAdjSync);
    window.addEventListener('vna_language_changed', handleLangChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('vna_indicators_updated', handleSyncInd);
      window.removeEventListener('vna_kpis_updated', handleSyncKpis);
      window.removeEventListener('vna_publish_adjustments_updated', handleAdjSync);
      window.removeEventListener('vna_language_changed', handleLangChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const tabs = [
    { id: 'ALL', label: currentLang === 'vi' ? 'Tổng quan' : 'Overview', icon: <FileText size={16} /> },
    { id: 'E', label: currentLang === 'vi' ? 'Môi trường' : 'Environment', icon: <Leaf size={16} /> },
    { id: 'S', label: currentLang === 'vi' ? 'Xã hội' : 'Social', icon: <Users size={16} /> },
    { id: 'G', label: currentLang === 'vi' ? 'Quản trị' : 'Governance', icon: <ShieldAlert size={16} /> },
  ] as const;

  const indicatorMap = useMemo(() => {
    const map = new Map<string, any>();
    indicators.forEach(ind => {
      map.set(ind.code, ind);
      if (ind.id) map.set(String(ind.id), ind);
    });
    return map;
  }, [indicators]);

  const isKpiActive = (start?: string, end?: string, year: string = selectedYear) => {
    if (!start || !end) return true;
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    return start <= yearEnd && end >= yearStart;
  };

  // Build configured KPI items with pillar and adjustments applied
  const configuredKpiRows = useMemo(() => {
    // Only configured KPIs for the active year (2026)
    const activeKpis = kpis.filter(k => isKpiActive(k.startDate, k.endDate, selectedYear));

    return activeKpis.map(k => {
      const indObj = indicatorMap.get(k.indicatorCode || '');

      // Determine Pillar for this KPI
      let pillar = 'Environment';
      if (indObj && indObj.pillar) {
        pillar = indObj.pillar;
      } else {
        // Fallback pillar inference based on code
        const code = k.indicatorCode || '';
        if (code.startsWith('GRI 4') || code.startsWith('Airline F') || code.startsWith('Airline D') || code.startsWith('GRI 2-7') || code.startsWith('GRI 2-30')) {
          pillar = 'Social';
        } else if (code.startsWith('GRI 2') || code.startsWith('GRI 3') || code.startsWith('GRI 20')) {
          pillar = 'Governance';
        } else {
          pillar = 'Environment';
        }
      }

      // Check for adjustments
      let planVal = String(k.plan || '--');
      let actualVal = String(k.actual || '--');
      let isOverridden = false;
      let overrideReasons: string[] = [];

      const parseNum = (v: string) => {
        if (!v) return 0;
        const clean = v.replace(/[^0-9.-]/g, '');
        return clean ? Number(clean) : 0;
      };

      const targetPeriod = 'Năm 2026';
      if (k.indicatorCode === 'GRI 302-1') {
        const jOverride = adjustments.find(a => a.indicatorCode === 'GRI 302-1-JETA1' && a.period === targetPeriod && a.isOverride);
        const sOverride = adjustments.find(a => a.indicatorCode === 'GRI 302-1-SAF' && a.period === targetPeriod && a.isOverride);
        if (jOverride || sOverride) {
          isOverridden = true;
          const jVal = jOverride ? parseNum(jOverride.overrideValue) : 108000;
          const sVal = sOverride ? parseNum(sOverride.overrideValue) : 5100;
          actualVal = String(Math.round(jVal + sVal));
          if (jOverride) overrideReasons.push(`Jet A-1: ${jOverride.reason || 'Không lý do'}`);
          if (sOverride) overrideReasons.push(`SAF: ${sOverride.reason || 'Không lý do'}`);
        }
      } else if (k.indicatorCode === 'Airline B-1') {
        const override = adjustments.find(a => a.indicatorCode === 'AIRLINE-B1-NPS' && a.period === targetPeriod && a.isOverride);
        if (override) {
          actualVal = override.overrideValue;
          isOverridden = true;
          overrideReasons.push(override.reason || 'Không ghi chú');
        }
      } else if (k.indicatorCode) {
        const override = adjustments.find(a => a.indicatorCode === `${k.indicatorCode}-ACTUAL` || a.indicatorCode === `${k.indicatorCode}-SUB1`);
        if (override && override.isOverride) {
          actualVal = override.overrideValue;
          isOverridden = true;
          overrideReasons.push(override.reason || 'Không ghi chú');
        }
      }

      // Compute progress & evaluation
      const planNum = parseFloat(planVal);
      const actualNum = parseFloat(actualVal);
      let isPass = k.isPass;
      let progress = k.progress || 0;
      let progressText = k.progressText || '0%';

      if (!isNaN(planNum) && !isNaN(actualNum) && planNum > 0) {
        const direction = k.direction || 'asc';
        if (direction === 'asc') {
          isPass = actualNum >= planNum;
          const pct = Math.round((actualNum / planNum) * 100);
          progress = Math.min(Math.max(pct, 0), 100);
          const diffPct = ((actualNum - planNum) / planNum) * 100;
          progressText = `${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(1)}%`;
        } else {
          isPass = actualNum <= planNum;
          const pct = Math.round(((2 * planNum - actualNum) / planNum) * 100);
          progress = Math.min(Math.max(pct, 0), 100);
          const diffPct = ((actualNum - planNum) / planNum) * 100;
          progressText = `${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(1)}%`;
        }
      }

      return {
        ...k,
        plan: planVal,
        actual: actualVal,
        isPass,
        progress,
        progressText,
        pillar,
        isOverridden,
        overrideReasons,
        indObj,
        displayName: getKpiDisplayName(k, currentLang)
      };
    });
  }, [kpis, indicators, adjustments, selectedYear, indicatorMap, currentLang]);

  // Filter and sort KPI rows according to activeTab and user filters
  const filteredKpiRows = useMemo(() => {
    let rows = configuredKpiRows.filter(row => {
      // 1. Tab Pillar Filtering
      if (activeTab === 'E') {
        const isE = row.pillar === 'Environment' || row.pillar === 'E' || row.pillar === 'Môi trường';
        if (!isE) return false;
      } else if (activeTab === 'S') {
        const isS = row.pillar === 'Social' || row.pillar === 'S' || row.pillar === 'Xã hội';
        if (!isS) return false;
      } else if (activeTab === 'G') {
        const isG = row.pillar === 'Governance' || row.pillar === 'G' || row.pillar === 'Quản trị';
        if (!isG) return false;
      }

      // 2. Search Code
      if (searchIndicatorCode.trim() !== '') {
        const q = searchIndicatorCode.trim().toLowerCase();
        const code = (row.indicatorCode || row.code || '').toLowerCase();
        if (!code.includes(q)) return false;
      }

      // 3. Search Dept
      if (searchDept.trim() !== '') {
        const q = searchDept.trim().toLowerCase();
        if (!row.dept.toLowerCase().includes(q)) return false;
      }

      // 4. Search Name
      if (searchKpiName.trim() !== '') {
        const q = searchKpiName.trim().toLowerCase();
        const name = (row.displayName || row.name || '').toLowerCase();
        const code = (row.indicatorCode || row.code || '').toLowerCase();
        if (!name.includes(q) && !code.includes(q)) return false;
      }

      // 5. Search Evaluation
      if (searchEvaluation === 'PASS' && !row.isPass) return false;
      if (searchEvaluation === 'FAIL' && row.isPass) return false;

      return true;
    });

    // Apply sorting
    if (sortField === 'indicatorCode') {
      rows = [...rows].sort((a, b) => {
        const codeA = a.indicatorCode || a.code || '';
        const codeB = b.indicatorCode || b.code || '';
        return sortOrder === 'asc' ? codeA.localeCompare(codeB, undefined, { numeric: true }) : codeB.localeCompare(codeA, undefined, { numeric: true });
      });
    } else if (sortField === 'dept') {
      rows = [...rows].sort((a, b) => {
        const deptA = a.dept || '';
        const deptB = b.dept || '';
        return sortOrder === 'asc' ? deptA.localeCompare(deptB) : deptB.localeCompare(deptA);
      });
    } else if (sortField === 'name') {
      rows = [...rows].sort((a, b) => {
        const nameA = a.displayName || a.name || '';
        const nameB = b.displayName || b.name || '';
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    }

    return rows;
  }, [configuredKpiRows, activeTab, searchIndicatorCode, searchDept, searchKpiName, searchEvaluation, sortField, sortOrder]);

  const handleToggleSort = (field: 'indicatorCode' | 'dept' | 'name') => {
    if (sortField === field) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortField('none');
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleBack = () => {
    setViewMode('LIST');
    setSelectedIndicator(null);
  };

  const handleOpenIndicatorDetail = (row: any) => {
    const ind = row.indObj || indicators.find(i => i.code === row.indicatorCode);
    if (ind) {
      setSelectedIndicator(ind);
      setViewMode('DASHBOARD');
    }
  };

  if (viewMode === 'DASHBOARD' && selectedIndicator) {
    const hasMetabaseLink = !!selectedIndicator.metabaseLink;
    const hasReportText = !!selectedIndicator.reportText;

    if (hasMetabaseLink) {
      return (
        <div className="bg-white p-6 rounded-lg border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <Button variant="ghost" onClick={handleBack} className="p-2 cursor-pointer border border-gray-200 hover:bg-gray-100 flex items-center gap-1 text-xs bg-white">
              <ArrowLeft size={16} /> {currentLang === 'vi' ? 'Quay lại danh sách chỉ tiêu KPI' : 'Back to KPI list'}
            </Button>
            <a
              href={selectedIndicator.metabaseLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-vna-blue hover:bg-[#00556e] rounded-md transition-all shadow-sm"
            >
              {currentLang === 'vi' ? 'Xem chi tiết trên Metabase ↗' : 'View on Metabase ↗'}
            </a>
          </div>

          <div className="flex-1 w-full bg-white rounded-lg overflow-hidden min-h-[750px] flex flex-col">
            <iframe
              src={selectedIndicator.metabaseLink}
              frameBorder="0"
              width="100%"
              height="100%"
              className="flex-1 min-h-[750px] w-full border-none"
              allowtransparency
            ></iframe>
          </div>
        </div>
      );
    }

    if (hasReportText) {
      const report = selectedIndicator.reportText;
      return (
        <div className="bg-white p-6 rounded-lg border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4 justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack} className="p-2 cursor-pointer border border-gray-200 hover:bg-gray-100 bg-white">
                <ArrowLeft size={18} />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-vna-blue border border-blue-200 rounded">
                    {selectedIndicator.code}
                  </span>
                  <PillarBadge pillar={selectedIndicator.pillar} />
                </div>
                <h2 className="text-lg font-bold text-vna-blue">{selectedIndicator.name}</h2>
              </div>
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(report.content || '');
                alert('Đã sao chép nội dung báo cáo tĩnh vào bộ nhớ tạm!');
              }}
              variant="outline"
              className="flex items-center gap-2 text-xs py-1.5 px-3 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 bg-white cursor-pointer"
            >
              <FileText size={16} /> Sao chép văn bản
            </Button>
          </div>

          <div className="flex-1 bg-slate-50 p-6 rounded-xl border border-gray-200 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <FileText size={16} className="text-vna-blue" /> Văn bản hiển thị trên Dashboard
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                Chính thức
              </span>
            </div>

            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md flex-1 prose max-w-none relative overflow-y-auto leading-relaxed text-gray-800">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                <div className="text-9xl font-extrabold text-vna-blue rotate-12">VNA</div>
              </div>

              {report.title && (
                <h3 className="text-xl font-bold text-center text-vna-blue mb-8 border-b-2 border-vna-blue pb-2 uppercase tracking-wide">
                  {report.title}
                </h3>
              )}

              <div className="whitespace-pre-line text-[15px] text-justify text-gray-700 leading-relaxed">
                {report.content}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div
      className={`flex flex-col bg-slate-50 transition-all duration-300 ease-in-out relative ${isFullscreen
        ? 'fixed inset-0 z-[99999] w-screen h-screen overflow-y-auto'
        : '-m-4 sm:-m-8 h-[calc(100vh-64px)] overflow-y-auto'
        }`}
    >
      {/* Controls & Tab Bar */}
      <div className="flex justify-between items-center bg-white border-b border-gray-200 px-6 py-3 shadow-xs shrink-0">
        {/* Dynamic Tab Bar */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${isTabActive
                  ? 'bg-white text-vna-blue shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Fullscreen controller */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-250 rounded-md shadow-xs transition-all duration-200 hover:scale-105 cursor-pointer"
          title={isFullscreen ? (currentLang === 'vi' ? "Thoát toàn màn hình" : "Exit Fullscreen") : (currentLang === 'vi' ? "Xem toàn màn hình" : "View Fullscreen")}
        >
          {isFullscreen ? (
            <>
              <Minimize2 size={14} />
              <span>{currentLang === 'vi' ? 'Thu nhỏ' : 'Minimize'}</span>
            </>
          ) : (
            <>
              <Maximize2 size={14} />
              <span>{currentLang === 'vi' ? 'Toàn màn hình' : 'Fullscreen'}</span>
            </>
          )}
        </button>
      </div>

      {/* Main dashboard content area (iframe) with Metabase link button */}
      <div className="w-full shrink-0 border-b border-gray-200 bg-white flex flex-col">
        <div className="bg-gray-50 px-6 py-3 flex justify-end border-b border-gray-100 items-center">
          <a
            href={
              activeTab === 'ALL'
                ? "https://metabase-dev.aequitas.dev/public/dashboard/2a2b9fc1-4b4b-4f8b-826f-849454d4cb4f"
                : activeTab === 'E'
                  ? "https://metabase-dev.aequitas.dev/public/dashboard/4a607d49-be70-4076-ac19-b1b3e23b62fc"
                  : activeTab === 'S'
                    ? "https://metabase-dev.aequitas.dev/public/dashboard/2b3d4ca2-9f29-4654-a004-a9495a3f4490"
                    : "https://metabase-dev.aequitas.dev/public/dashboard/c957b987-cb19-418d-8d28-be840864b522"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#005f6e] hover:bg-[#004b57] rounded-md transition-all shadow-md hover:shadow-lg active:scale-98 duration-200"
          >
            <span>Metabase</span>
            <span>↗</span>
          </a>
        </div>
        <div className="h-[1350px] w-full bg-white">
          <iframe
            src={
              activeTab === 'ALL'
                ? "https://metabase-dev.aequitas.dev/public/dashboard/2a2b9fc1-4b4b-4f8b-826f-849454d4cb4f"
                : activeTab === 'E'
                  ? "https://metabase-dev.aequitas.dev/public/dashboard/4a607d49-be70-4076-ac19-b1b3e23b62fc"
                  : activeTab === 'S'
                    ? "https://metabase-dev.aequitas.dev/public/dashboard/2b3d4ca2-9f29-4654-a004-a9495a3f4490"
                    : "https://metabase-dev.aequitas.dev/public/dashboard/c957b987-cb19-418d-8d28-be840864b522"
            }
            frameBorder="0"
            width="100%"
            height="100%"
            className="w-full h-full border-none"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Bảng Danh sách KPI theo từng trụ cột (Chỉ hiển thị các KPI đã thiết lập, ẩn riêng ở tab Quản trị G) */}
      {activeTab !== 'G' && (
        <div className="p-6 bg-slate-50 space-y-4">
          <Card className="p-0 overflow-hidden border border-gray-250 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                    {/* STT */}
                    <th className="py-3 px-3 text-center w-12">#</th>

                    {/* Mã chỉ tiêu - Có Sắp xếp Sort */}
                    <th
                      onClick={() => handleToggleSort('indicatorCode')}
                      className="py-3 px-4 w-[12%] cursor-pointer select-none hover:bg-gray-100 transition-colors"
                      title={currentLang === 'vi' ? 'Nhấn để sắp xếp theo Mã chỉ tiêu' : 'Click to sort by Code'}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>{currentLang === 'vi' ? 'MÃ CHỈ TIÊU' : 'CODE'}</span>
                        <span className="text-gray-400">
                          {sortField === 'indicatorCode' && sortOrder === 'asc' ? <ArrowUp size={13} className="text-vna-blue font-bold" /> :
                            sortField === 'indicatorCode' && sortOrder === 'desc' ? <ArrowDown size={13} className="text-vna-blue font-bold" /> :
                              <ArrowUpDown size={13} className="opacity-40" />}
                        </span>
                      </div>
                    </th>

                    {/* Tổ ban (CQĐV) - Có Sắp xếp Sort */}
                    <th
                      onClick={() => handleToggleSort('dept')}
                      className="py-3 px-4 w-[18%] cursor-pointer select-none hover:bg-gray-100 transition-colors"
                      title={currentLang === 'vi' ? 'Nhấn để sắp xếp theo CQĐV' : 'Click to sort by Department'}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>{currentLang === 'vi' ? 'CQĐV PHỤ TRÁCH' : 'DEPARTMENT'}</span>
                        <span className="text-gray-400">
                          {sortField === 'dept' && sortOrder === 'asc' ? <ArrowUp size={13} className="text-vna-blue font-bold" /> :
                            sortField === 'dept' && sortOrder === 'desc' ? <ArrowDown size={13} className="text-vna-blue font-bold" /> :
                              <ArrowUpDown size={13} className="opacity-40" />}
                        </span>
                      </div>
                    </th>

                    {/* Tên KPI - Có Sắp xếp Sort */}
                    <th
                      onClick={() => handleToggleSort('name')}
                      className="py-3 px-4 min-w-[200px] cursor-pointer select-none hover:bg-gray-100 transition-colors"
                      title={currentLang === 'vi' ? 'Nhấn để sắp xếp theo Tên KPI' : 'Click to sort by KPI Name'}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>{currentLang === 'vi' ? 'TÊN KPI' : 'KPI NAME'}</span>
                        <span className="text-gray-400">
                          {sortField === 'name' && sortOrder === 'asc' ? <ArrowUp size={13} className="text-vna-blue font-bold" /> :
                            sortField === 'name' && sortOrder === 'desc' ? <ArrowDown size={13} className="text-vna-blue font-bold" /> :
                              <ArrowUpDown size={13} className="opacity-40" />}
                        </span>
                      </div>
                    </th>

                    <th className="py-3 px-3 w-[7%] text-center">{currentLang === 'vi' ? 'ĐVT' : 'UNIT'}</th>
                    <th className="py-3 px-3 text-center w-[10%]">{currentLang === 'vi' ? 'KẾ HOẠCH' : 'TARGET'}</th>
                    <th className="py-3 px-3 text-center w-[10%]">{currentLang === 'vi' ? 'THỰC HIỆN' : 'ACTUAL'}</th>
                    <th className="py-3 px-3 w-[15%]">{currentLang === 'vi' ? 'ĐÁNH GIÁ' : 'EVALUATION'}</th>
                    <th className="py-3 px-3 text-center w-[10%]">{currentLang === 'vi' ? 'CÙNG KỲ' : 'YoY'}</th>
                    <th className="py-3 px-3 text-center w-[6%]">{currentLang === 'vi' ? 'XEM' : 'ACTION'}</th>
                  </tr>

                  {/* COLUMN FILTER ROW */}
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
                          placeholder={currentLang === 'vi' ? 'Lọc CQĐV...' : 'Filter dept...'}
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

                    {/* 5-7 Spacers */}
                    <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>
                    <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>
                    <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

                    {/* 8. Lọc Đánh giá */}
                    <th className="py-2 px-2 text-left">
                      <select
                        value={searchEvaluation}
                        onChange={(e) => setSearchEvaluation(e.target.value)}
                        className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-1.5 py-1 text-gray-800 outline-none focus:border-vna-blue shadow-2xs"
                      >
                        <option value="">{currentLang === 'vi' ? 'Tất cả đánh giá' : 'All status'}</option>
                        <option value="PASS">{currentLang === 'vi' ? 'ĐẠT' : 'PASS'}</option>
                        <option value="FAIL">{currentLang === 'vi' ? 'CHƯA ĐẠT' : 'FAIL'}</option>
                      </select>
                    </th>

                    {/* 9. Cùng kỳ Spacer */}
                    <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

                    {/* 10. Xóa lọc */}
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
                          className="text-[11px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded transition-colors whitespace-nowrap"
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
                      <td colSpan={10} className="py-8 text-center text-gray-400 text-xs font-medium">
                        {currentLang === 'vi'
                          ? 'Không tìm thấy chỉ tiêu KPI nào phù hợp với bộ lọc.'
                          : 'No KPI items match the current filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredKpiRows.map((row, idx) => {
                      const yoy = getYoYComparison(
                        kpis,
                        selectedYear,
                        row.dept,
                        row.indicatorCode || '',
                        row.actual,
                        row.direction || 'asc'
                      );
                      const isPositive = yoy.percent !== null && yoy.percent >= 0;

                      return (
                        <tr
                          key={row.id || `kpi-${idx}`}
                          className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                          onClick={() => handleOpenIndicatorDetail(row)}
                        >
                          {/* 1. STT */}
                          <td className="py-3.5 px-3 text-center text-gray-500 font-medium">
                            {idx + 1}
                          </td>

                          {/* 2. Mã chỉ tiêu */}
                          <td className="py-3.5 px-4">
                            {row.indicatorCode ? (
                              <span className="font-mono text-xs font-bold text-vna-blue bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200">
                                {row.indicatorCode}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </td>

                          {/* 3. Tổ ban (CQĐV) */}
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold text-gray-800">
                              {row.dept}
                            </span>
                          </td>

                          {/* 4. Tên KPI */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-900 leading-snug">
                              {row.displayName}
                            </div>
                            {/* {row.subName && row.subName !== row.displayName && (
                              <div className="text-[11px] text-gray-400 mt-0.5 font-normal">
                                {row.subName}
                              </div>
                            )} */}
                          </td>

                          {/* 5. ĐVT */}
                          <td className="py-3.5 px-3 text-center text-gray-600 font-medium text-xs">
                            {row.unit || '—'}
                          </td>

                          {/* 6. Kế hoạch */}
                          <td className="py-3.5 px-3 text-center font-bold text-vna-blue text-sm font-mono">
                            {row.plan}
                          </td>

                          {/* 7. Thực hiện */}
                          <td className="py-3.5 px-3 text-center font-bold text-gray-900 text-sm font-mono">
                            <div className="flex items-center justify-center gap-1.5">
                              {row.isOverridden && (
                                <span
                                  className="inline-flex items-center gap-0.5 text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-250 px-1 py-0.5 rounded"
                                  title={`Đã điều chỉnh đối ngoại. Chi tiết: ${row.overrideReasons.join(', ') || 'Không ghi chú'}`}
                                >
                                  <Globe size={9} /> ADJ
                                </span>
                              )}
                              <span>{row.actual}</span>
                            </div>
                          </td>

                          {/* 8. Đánh giá */}
                          <td className="py-3.5 px-3 min-w-[140px]">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${row.isPass
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                                  }`}
                              >
                                {row.isPass ? 'ĐẠT' : 'CHƯA ĐẠT'}
                              </span>
                              <span className={`text-xs font-bold font-mono ${row.isPass ? 'text-emerald-600' : 'text-red-600'}`}>
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

                          {/* 9. Cùng kỳ */}
                          <td className="py-3.5 px-3 text-center">
                            {yoy.text === '--' ? (
                              <span className="text-gray-300 text-xs">—</span>
                            ) : (
                              <div className="flex flex-col items-center justify-center">
                                <span
                                  className={`inline-flex items-center gap-0.5 font-bold text-[11px] px-1.5 py-0.5 rounded shadow-2xs ${isPositive
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
                            )}
                          </td>

                          {/* 10. Thao tác / Xem */}
                          <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenIndicatorDetail(row)}
                              className="p-1.5 text-gray-400 hover:text-vna-blue hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title={currentLang === 'vi' ? 'Xem chi tiết chỉ tiêu' : 'View indicator details'}
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
