import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, Button, Input, Select, Badge, PillarBadge, Toast, Modal } from '../components/UI';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Search, Sliders, Database, Leaf, Users, ShieldCheck,
  Clock, ArrowLeft, FileText, CheckCircle, Save, Filter,
  RotateCcw, Info, Globe, Activity, ShieldAlert, ChevronDown, ChevronRight,
  History, Calendar, User
} from 'lucide-react';
import MOCK_INDICATORS_JSON from '../data/indicators_main_list.json';
import { Pillar } from '../types';

// --- TYPES ---
interface AdjustmentHistoryItem {
  id: string;
  indicatorCode: string;
  chartCode: string;
  chartName: string;
  period: string;
  originalValue: string;
  adjustedValue: string;
  adjustedBy: string;
  adjustedAt: string;
  reason?: string;
}

interface AdjustmentItem {
  indicatorCode: string;
  period: string;
  isOverride: boolean;
  overrideValue: string;
  reason: string;
  updatedAt: string;
  updatedBy: string;
}

// Helper to extract localized name from "English / Vietnamese" or "English (Vietnamese)"
const getLocalizedIndicatorName = (name: string, lang: 'vi' | 'en' = 'vi'): string => {
  if (!name) return '';

  // Format with slash: "English / Vietnamese" or "English/Vietnamese"
  if (name.includes('/')) {
    const parts = name.split('/').map(p => p.trim());
    if (parts.length >= 2) {
      return lang === 'vi' ? (parts[1] || parts[0]) : (parts[0] || parts[1]);
    }
  }

  // Format with parentheses: "English (Vietnamese)"
  const parenMatch = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const enPart = parenMatch[1].trim();
    const viPart = parenMatch[2].trim();
    return lang === 'vi' ? (viPart || enPart) : (enPart || viPart);
  }

  return name;
};

// Helper to determine the dynamic periods based on indicator frequency and selected year (Newest to Oldest)
const getIndicatorPeriods = (indicator: any, year: string): string[] => {
  if (!indicator) return [];
  const freq = indicator.frequency || 'Hàng tháng';

  if (freq.includes('quý') || freq.includes('Quý')) {
    return [`Quý 4/${year}`, `Quý 3/${year}`, `Quý 2/${year}`, `Quý 1/${year}`];
  }
  if (freq.includes('năm') || freq.includes('Năm')) {
    return [`Năm ${year}`];
  }
  if (freq.includes('bán niên') || freq.includes('Bán niên') || freq.includes('Bán Niên')) {
    return [`Bán niên 2/${year}`, `Bán niên 1/${year}`];
  }
  return Array.from({ length: 12 }).map((_, i) => {
    const m = String(12 - i).padStart(2, '0');
    return `Tháng ${m}/${year}`;
  });
};

// Helper to determine the origin source of indicators
const getIndicatorSource = (code: string, unit: string): string => {
  if (code.includes('GRI 302-1') || code.includes('GRI 302-4') || code.includes('GRI 305-1')) {
    return 'Form Nhập liệu (Chuyên viên Ban Kỹ thuật)';
  }
  if (code.includes('GRI 2-7') || code.includes('GRI 401-1') || code.includes('GRI 404-2')) {
    return 'Form Nhập liệu (Ban Tổ chức nhân lực)';
  }
  if (code.includes('Airline B-1')) {
    return 'Hệ thống tích hợp đối ngoại (Qualtrics API)';
  }
  if (code.includes('Airline B-2')) {
    return 'Hệ thống tích hợp CLM (BI-CLM DB Connect)';
  }
  if (code.includes('GRI 303-3') || code.includes('GRI 303-5')) {
    return 'Form Nhập liệu (Tổ Dịch vụ)';
  }
  return 'Hệ thống tích hợp TCT (SAP/ERP Integration)';
};

// Helper to generate deterministic actual values for indicators (simulate real database numbers)
const getSystemRealValue = (code: string, period: string, unit: string): string => {
  const isPercentage = unit === '%';
  const isQualitative = unit === 'Văn bản' || unit === 'Báo cáo' || unit === 'Đặc tả' || !unit;

  if (isQualitative) {
    return 'Đạt tiêu chuẩn công bố thuyết minh năm 2026.';
  }

  // Parse month number
  let mVal = 1;
  const mMatch = period.match(/Tháng (\d+)/);
  const qMatch = period.match(/Quý (\d+)/);
  const hMatch = period.match(/bán niên (\d+)/i);

  if (mMatch) {
    mVal = Number(mMatch[1]);
  } else if (qMatch) {
    mVal = Number(qMatch[1]) * 3;
  } else if (hMatch) {
    mVal = Number(hMatch[1]) === 1 ? 6 : 12;
  } else {
    mVal = 12; // Year
  }

  const codeHash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  if (isPercentage) {
    // Return a percentage like 92.4% with some month variation
    const base = 90 + (codeHash % 8);
    const val = base + ((mVal * 7) % 3) + ((mVal * 3) % 2) / 10;
    return `${Math.min(val, 100).toFixed(1)}%`;
  } else {
    // Return a absolute number
    const base = 1000 + (codeHash % 12) * 500;
    const val = base + (mVal * 120) - (mVal * mVal * 5);
    return Math.round(val).toLocaleString();
  }
};

interface SubChart {
  code: string;
  name: string;
  unit: string;
  source: string;
  frequency: string;
}

const getIndicatorSubCharts = (indicator: any): SubChart[] => {
  if (!indicator) return [];
  const code = indicator.code;
  const unit = indicator.unit || 'Tấn';
  const freq = indicator.frequency || 'Hàng tháng';

  if (code === 'GRI 302-1') {
    return [
      { code: 'GRI 302-1-JETA1', name: 'Tiêu thụ Jet A-1 Đội bay', unit: 'Tấn', source: 'Form Nhập liệu (Ban Kỹ thuật)', frequency: freq },
      { code: 'GRI 302-1-SAF', name: 'Tiêu thụ Nhiên liệu SAF pha trộn', unit: 'Tấn', source: 'Form Nhập liệu (Ban Kỹ thuật)', frequency: freq }
    ];
  }

  if (code === 'GRI 305-4') {
    return [
      { code: 'GRI 305-4-ACTUAL', name: 'Cường độ phát thải CO2 thực tế', unit: 'Tấn CO2/100 RTK', source: 'Form Nhập liệu (Ban Kỹ thuật)', frequency: 'Hàng năm' }
    ];
  }

  if (code === 'GRI 404-2') {
    return [
      { code: 'GRI 404-2-HQ', name: 'Giờ đào tạo trung bình Khối Cơ quan', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 404-2-OPS', name: 'Giờ đào tạo trung bình Khối Khai thác', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 404-2-TECH', name: 'Giờ đào tạo trung bình Khối Kỹ thuật', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 404-2-SERVICE', name: 'Giờ đào tạo trung bình Khối Dịch vụ', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 404-2-COMMERCE', name: 'Giờ đào tạo trung bình Khối Thương mại', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq }
    ];
  }

  if (code === 'Airline B-1') {
    return [
      { code: 'AIRLINE-B1-NPS', name: 'Biến động chỉ số Net Promoter Score', unit: 'Điểm', source: 'Hệ thống đối ngoại (Qualtrics API)', frequency: 'Hàng quý' }
    ];
  }

  if (code === 'GRI 2-7') {
    return [
      { code: 'GRI 2-7-PILOTS', name: 'Cơ cấu - Đội ngũ Phi công', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 2-7-CABIN', name: 'Cơ cấu - Đội ngũ Tiếp viên', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 2-7-TECH', name: 'Cơ cấu - Kỹ sư Kỹ thuật', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 2-7-GROUND', name: 'Cơ cấu - Nhân viên Mặt đất & CQ', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq }
    ];
  }

  if (code === 'GRI 2-9') {
    return [
      { code: 'GRI 2-9-IND', name: 'Thành phần Hội đồng Độc lập', unit: 'Thành viên', source: 'Nhập thủ công (Tổ Thư ký)', frequency: 'Hàng năm' },
      { code: 'GRI 2-9-EXEC', name: 'Thành phần Hội đồng Điều hành', unit: 'Thành viên', source: 'Nhập thủ công (Tổ Thư ký)', frequency: 'Hàng năm' },
      { code: 'GRI 2-9-NONEXEC', name: 'Thành phần Hội đồng Không điều hành', unit: 'Thành viên', source: 'Nhập thủ công (Tổ Thư ký)', frequency: 'Hàng năm' }
    ];
  }

  // Default sub-chart for other indicators
  return [
    { code: `${code}-SUB1`, name: `Thống kê số liệu ${indicator.name}`, unit: unit, source: getIndicatorSource(code, unit), frequency: freq }
  ];
};

export const PublishAdjustPage: React.FC = () => {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<any | null>(null);
  const [selectedSubChart, setSelectedSubChart] = useState<any | null>(null);
  const [expandedIndicators, setExpandedIndicators] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPillar, setFilterPillar] = useState('');
  const [filterPublish, setFilterPublish] = useState(''); // '' (Tất cả), 'published' (Công bố), 'unpublished' (Không công bố)
  const [selectedYear, setSelectedYear] = useState('2026');
  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>(
    () => (localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi'
  );

  useEffect(() => {
    const handleLangChange = () => {
      const savedLang = (localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi';
      setCurrentLang(savedLang);
    };
    window.addEventListener('vna_language_changed', handleLangChange);
    return () => window.removeEventListener('vna_language_changed', handleLangChange);
  }, []);

  // Global publish statuses map
  const [publishedChartStatuses, setPublishedChartStatuses] = useState<Record<string, boolean>>({});

  // Adjustment History state
  const INITIAL_MOCK_HISTORY: AdjustmentHistoryItem[] = useMemo(() => [
    {
      id: 'HIST-VNA001',
      indicatorCode: 'Airline E-1',
      chartCode: 'Airline E-1-SUB1',
      chartName: 'Tiếng ồn',
      period: 'Tháng 12/2026',
      originalValue: '4,615',
      adjustedValue: '4,615',
      adjustedBy: 'Nguyễn Văn Hải (Admin)',
      adjustedAt: '18/08/2026 16:30',
      reason: 'Đối soát số liệu theo biên bản kiểm toán IATA ASRH'
    },
    {
      id: 'HIST-VNA002',
      indicatorCode: 'GRI 302-1',
      chartCode: 'GRI 302-1-JETA1',
      chartName: 'Tiêu thụ Jet A-1 Đội bay',
      period: 'Tháng 11/2026',
      originalValue: '4,720',
      adjustedValue: '4,710',
      adjustedBy: 'Trần Thu Trang (Ban Kỹ thuật)',
      adjustedAt: '15/08/2026 14:15',
      reason: 'Chuẩn hóa định mức tiêu hao sau kiểm định tàu bay A350'
    },
    {
      id: 'HIST-VNA003',
      indicatorCode: 'GRI 302-1',
      chartCode: 'GRI 302-1-SAF',
      chartName: 'Tiêu thụ Nhiên liệu SAF pha trộn',
      period: 'Quý 4/2026',
      originalValue: '120',
      adjustedValue: '125',
      adjustedBy: 'Nguyễn Minh Hải (Admin)',
      adjustedAt: '12/08/2026 09:45',
      reason: 'Bổ sung khối lượng nạp thử nghiệm đường bay quốc tế'
    },
    {
      id: 'HIST-VNA004',
      indicatorCode: 'GRI 305-4',
      chartCode: 'GRI 305-4-REAL',
      chartName: 'Cường độ phát thải CO2 thực tế',
      period: 'Tháng 10/2026',
      originalValue: '785.4',
      adjustedValue: '772.0',
      adjustedBy: 'Nguyễn Văn Hải (Admin)',
      adjustedAt: '05/08/2026 10:20',
      reason: 'Áp dụng hệ số chuyển đổi ICAO mới nhất'
    }
  ], []);

  const [adjustHistory, setAdjustHistory] = useState<AdjustmentHistoryItem[]>(() => {
    const saved = localStorage.getItem('vna_publish_adjust_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MOCK_HISTORY;
      }
    }
    return INITIAL_MOCK_HISTORY;
  });
  // Chart-level publish status & description state
  const [isChartPublished, setIsChartPublished] = useState(true);
  const [chartDescription, setChartDescription] = useState('');

  useEffect(() => {
    const handleSync = () => {
      const savedStatus = localStorage.getItem('vna_publish_chart_status');
      if (savedStatus) {
        try {
          setPublishedChartStatuses(JSON.parse(savedStatus));
        } catch (e) { }
      }
    };
    handleSync();
    window.addEventListener('vna_publish_adjustments_updated', handleSync);
    return () => window.removeEventListener('vna_publish_adjustments_updated', handleSync);
  }, []);

  // Adjustments state (flat array stored in localStorage)
  const [adjustments, setAdjustments] = useState<AdjustmentItem[]>([]);

  // Detail form edit state (for the selected indicator)
  const [editStates, setEditStates] = useState<Record<string, { isOverride: boolean; overrideValue: string; reason: string }>>({});

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Measure right column height to sync left card height pixel-perfectly
  const rightColRef = useRef<HTMLDivElement>(null);
  const [rightColHeight, setRightColHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!rightColRef.current) return;
    const updateHeight = () => {
      if (rightColRef.current) {
        const h = rightColRef.current.getBoundingClientRect().height || rightColRef.current.offsetHeight;
        if (h > 100) {
          setRightColHeight(Math.round(h));
        }
      }
    };
    updateHeight();
    const rafId = requestAnimationFrame(updateHeight);
    const timeoutId = setTimeout(updateHeight, 150);

    const observer = new ResizeObserver(updateHeight);
    observer.observe(rightColRef.current);
    window.addEventListener('resize', updateHeight);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [selectedIndicator, selectedSubChart, selectedYear, isChartPublished, adjustments]);

  const currentPeriods = useMemo(() => getIndicatorPeriods(selectedIndicator, selectedYear), [selectedIndicator, selectedYear]);

  const previewChartData = useMemo(() => {
    if (!selectedSubChart) return [];

    const chronologicalPeriods = [...currentPeriods].reverse();
    return chronologicalPeriods.map(p => {
      const state = editStates[p] || { isOverride: false, overrideValue: '', reason: '' };
      const realValueStr = getSystemRealValue(selectedSubChart.code, p, selectedSubChart.unit);

      const parseNum = (str: string) => {
        if (!str) return 0;
        const cleaned = str.replace(/[^0-9.-]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
      };

      const originalVal = parseNum(realValueStr);
      const adjustedVal = parseNum(state.overrideValue || realValueStr);

      let label = p;
      if (p.includes('Tháng ')) {
        label = 'T' + parseInt(p.replace('Tháng ', ''));
      } else if (p.includes('Quý ')) {
        label = 'Q' + p.replace('Quý ', '').split('/')[0];
      } else if (p.includes('Bán niên ')) {
        label = 'BN' + p.replace('Bán niên ', '').split('/')[0];
      }

      return {
        periodLabel: label,
        fullName: p,
        'Số liệu gốc': originalVal,
        'Số liệu điều chỉnh': adjustedVal
      };
    });
  }, [selectedSubChart, currentPeriods, editStates]);

  // Load data
  useEffect(() => {
    // Load indicators
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

    // Load adjustments
    const savedAdjs = localStorage.getItem('vna_publish_adjustments');
    if (savedAdjs) {
      try {
        setAdjustments(JSON.parse(savedAdjs));
      } catch (e) { }
    }
  }, []);

  // Update editStates when selectedSubChart changes
  useEffect(() => {
    if (!selectedSubChart) {
      setEditStates({});
      return;
    }

    const states: Record<string, { isOverride: boolean; overrideValue: string; reason: string }> = {};

    currentPeriods.forEach(p => {
      const existing = adjustments.find(
        a => a.indicatorCode === selectedSubChart.code && a.period === p
      );

      if (existing && existing.isOverride) {
        states[p] = {
          isOverride: true,
          overrideValue: existing.overrideValue,
          reason: existing.reason
        };
      } else {
        const realValue = getSystemRealValue(selectedSubChart.code, p, selectedSubChart.unit);
        states[p] = {
          isOverride: false,
          overrideValue: realValue,
          reason: ''
        };
      }
    });

    setEditStates(states);
  }, [selectedSubChart, adjustments, currentPeriods]);

  const handleToggleSubChartPublish = (subCode: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentStatus = publishedChartStatuses[subCode] !== false;
    const newStatus = !currentStatus;
    const savedStatus = localStorage.getItem('vna_publish_chart_status');
    const statuses = savedStatus ? JSON.parse(savedStatus) : {};
    statuses[subCode] = newStatus;
    localStorage.setItem('vna_publish_chart_status', JSON.stringify(statuses));
    setPublishedChartStatuses(statuses);

    if (selectedSubChart?.code === subCode) {
      setIsChartPublished(newStatus);
    }
  };

  useEffect(() => {
    if (!selectedSubChart) {
      setChartDescription('');
      return;
    }
    const savedStatus = localStorage.getItem('vna_publish_chart_status');
    if (savedStatus) {
      try {
        const statuses = JSON.parse(savedStatus);
        setIsChartPublished(statuses[selectedSubChart.code] !== false);
      } catch (e) {
        setIsChartPublished(true);
      }
    } else {
      setIsChartPublished(true);
    }

    // Load chart description
    const key = `${selectedSubChart.code}_${selectedYear}`;
    const savedDescriptions = localStorage.getItem('vna_chart_publish_descriptions');
    if (savedDescriptions) {
      try {
        const descMap = JSON.parse(savedDescriptions);
        setChartDescription(descMap[key] || descMap[selectedSubChart.code] || '');
      } catch (e) {
        setChartDescription('');
      }
    } else {
      setChartDescription('');
    }
  }, [selectedSubChart, selectedYear]);

  // Handle query & filters
  const filteredIndicators = useMemo(() => {
    return indicators.filter(ind => {
      const localizedName = getLocalizedIndicatorName(ind.name, currentLang);
      const matchesSearch =
        ind.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        localizedName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPillar =
        !filterPillar ||
        ind.pillar.toLowerCase() === filterPillar.toLowerCase();

      let matchesPublish = true;
      if (filterPublish) {
        const subCharts = getIndicatorSubCharts(ind);
        if (filterPublish === 'published') {
          // Keep if at least one sub-chart is published (default is true if not false)
          matchesPublish = subCharts.some(sc => publishedChartStatuses[sc.code] !== false);
        } else if (filterPublish === 'unpublished') {
          // Keep if at least one sub-chart is NOT published
          matchesPublish = subCharts.some(sc => publishedChartStatuses[sc.code] === false);
        }
      }

      return matchesSearch && matchesPillar && matchesPublish;
    });
  }, [indicators, searchQuery, filterPillar, filterPublish, publishedChartStatuses]);

  // Check if an indicator has any active overrides under any of its sub-charts
  const getIndicatorStatus = (ind: any) => {
    const subCharts = getIndicatorSubCharts(ind);
    const subCodes = subCharts.map(sc => sc.code);
    const hasActive = adjustments.some(
      a => subCodes.includes(a.indicatorCode) && a.isOverride
    );
    return hasActive ? 'adjusted' : 'default';
  };

  // Check if a specific sub-chart has any active overrides
  const getSubChartStatus = (subCode: string) => {
    const hasActive = adjustments.some(
      a => a.indicatorCode === subCode && a.isOverride
    );
    return hasActive ? 'adjusted' : 'default';
  };

  // Toggle override state for a period
  const handleToggleOverride = (period: string) => {
    if (!selectedSubChart) return;
    setEditStates(prev => {
      const current = prev[period];
      return {
        ...prev,
        [period]: {
          ...current,
          isOverride: !current.isOverride,
          // Prefill with system real value if empty
          overrideValue: current.overrideValue || getSystemRealValue(selectedSubChart.code, period, selectedSubChart.unit)
        }
      };
    });
  };

  // Update value for a period
  const handleValueChange = (period: string, val: string) => {
    setEditStates(prev => ({
      ...prev,
      [period]: {
        ...prev[period],
        overrideValue: val
      }
    }));
  };

  // Update reason for a period
  const handleReasonChange = (period: string, val: string) => {
    setEditStates(prev => ({
      ...prev,
      [period]: {
        ...prev[period],
        reason: val
      }
    }));
  };



  // Save changes
  const handleSave = () => {
    if (!selectedSubChart || !selectedIndicator) return;

    // Filter out old entries for this sub-chart AND selected year to avoid wiping out other years
    const filteredAdjustments = adjustments.filter(
      a => !(a.indicatorCode === selectedSubChart.code && a.period.endsWith(selectedYear))
    );

    const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const newEntries: AdjustmentItem[] = [];

    // Construct new entries
    Object.keys(editStates).forEach(period => {
      const state = editStates[period];
      const realValue = getSystemRealValue(selectedSubChart.code, period, selectedSubChart.unit);

      const isValueDifferent = state.overrideValue && state.overrideValue.trim() !== realValue.trim();
      if (isValueDifferent) {
        newEntries.push({
          indicatorCode: selectedSubChart.code,
          period,
          isOverride: true,
          overrideValue: state.overrideValue.trim(),
          reason: state.reason,
          updatedAt: nowStr,
          updatedBy: 'Nguyễn Văn Hải (Admin)'
        });
      }
    });

    // Save chart-level publish status
    const savedStatus = localStorage.getItem('vna_publish_chart_status');
    const statuses = savedStatus ? JSON.parse(savedStatus) : {};
    statuses[selectedSubChart.code] = isChartPublished;
    localStorage.setItem('vna_publish_chart_status', JSON.stringify(statuses));
    setPublishedChartStatuses(statuses);

    // Save chart description
    const key = `${selectedSubChart.code}_${selectedYear}`;
    const savedDescriptions = localStorage.getItem('vna_chart_publish_descriptions');
    const descMap = savedDescriptions ? JSON.parse(savedDescriptions) : {};
    descMap[key] = chartDescription;
    descMap[selectedSubChart.code] = chartDescription;
    localStorage.setItem('vna_chart_publish_descriptions', JSON.stringify(descMap));

    const finalAdjustments = [...filteredAdjustments, ...newEntries];

    // Save to localStorage
    localStorage.setItem('vna_publish_adjustments', JSON.stringify(finalAdjustments));
    setAdjustments(finalAdjustments);

    // Save adjustment history entries
    if (newEntries.length > 0) {
      const newHistoryItems: AdjustmentHistoryItem[] = newEntries.map(ent => ({
        id: `HIST-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        indicatorCode: selectedIndicator.code,
        chartCode: selectedSubChart.code,
        chartName: selectedSubChart.name,
        period: ent.period,
        originalValue: getSystemRealValue(selectedSubChart.code, ent.period, selectedSubChart.unit),
        adjustedValue: ent.overrideValue,
        adjustedBy: 'Nguyễn Văn Hải (Admin)',
        adjustedAt: nowStr,
        reason: ent.reason
      }));

      setAdjustHistory(prev => {
        const updated = [...newHistoryItems, ...prev];
        localStorage.setItem('vna_publish_adjust_history', JSON.stringify(updated.slice(0, 200)));
        return updated;
      });
    }

    // Save audit log to system logs
    const savedLogs = localStorage.getItem('vna_system_logs');
    let logsList = savedLogs ? JSON.parse(savedLogs) : [];

    newEntries.forEach(ent => {
      logsList.unshift({
        id: `LOG-ADJ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: nowStr,
        user: 'hai.nm@vietnamairlines.com',
        userName: 'Nguyễn Minh Hải',
        role: 'Quản trị viên',
        featureName: 'Dữ liệu công bố đối ngoại',
        actionDetails: `Ghi đè số liệu biểu đồ [${selectedSubChart.name}] (Chỉ tiêu [${selectedIndicator.code}]) kỳ ${ent.period} thành "${ent.overrideValue}". Lý do: ${ent.reason || 'Không ghi chú'}`
      });
    });

    localStorage.setItem('vna_system_logs', JSON.stringify(logsList.slice(0, 100))); // Keep last 100 logs

    // Dispatch HMR custom event to alert other listening components
    window.dispatchEvent(new Event('vna_publish_adjustments_updated'));

    setToast({
      message: `Đã lưu cấu hình dữ liệu công bố cho chỉ tiêu ${selectedIndicator.code} thành công!`,
      type: 'success'
    });
  };

  // Reset current selections
  const handleResetCurrent = () => {
    if (!selectedSubChart) return;

    const clearedStates: Record<string, { isOverride: boolean; overrideValue: string; reason: string }> = {};
    currentPeriods.forEach(p => {
      const realValue = getSystemRealValue(selectedSubChart.code, p, selectedSubChart.unit);
      clearedStates[p] = {
        isOverride: false,
        overrideValue: realValue,
        reason: ''
      };
    });
    setEditStates(clearedStates);
    setIsChartPublished(true);
    setToast({
      message: 'Đã hoàn tác các thay đổi trên giao diện. Bấm Lưu để xác nhận.',
      type: 'info'
    });
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* HEADER */}
      {/* <div className="bg-white border border-gray-200 px-6 py-4 rounded-xl shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue">Điều chỉnh dữ liệu công bố</h1>
          <p className="text-black/45 text-sm mt-0.5">
            Thiết lập và kiểm soát số liệu đối ngoại phục vụ xuất bản báo cáo thường niên ESG và hiển thị biểu đồ tổng
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-vna-blue text-xs font-bold">
          <Globe size={14} />
          <span>VNA Disclosure Control</span>
        </div>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: INDICATOR LIST (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col">
          <div
            style={rightColHeight ? { height: `${rightColHeight}px` } : { minHeight: '820px' }}
            className="bg-white rounded-lg border border-gray-250 p-5 flex flex-col gap-4 overflow-hidden shadow-2xs hover:shadow-md transition-shadow duration-300"
          >
            {/* SEARCH & FILTER */}
            <div className="flex flex-col gap-2.5 shrink-0">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Tìm mã hoặc tên chỉ tiêu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs bg-white py-1.5"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={filterPillar}
                  onChange={setFilterPillar}
                  options={[
                    { label: 'Tất cả trụ cột', value: '' },
                    { label: 'Môi trường (E)', value: 'Environment' },
                    { label: 'Xã hội (S)', value: 'Social' },
                    { label: 'Quản trị (G)', value: 'Governance' },
                  ]}
                  className="text-xs"
                />

                <Select
                  value={filterPublish}
                  onChange={setFilterPublish}
                  options={[
                    { label: 'Tất cả trạng thái', value: '' },
                    { label: 'Đang công bố', value: 'published' },
                    { label: 'Không công bố', value: 'unpublished' },
                  ]}
                  className="text-xs font-semibold"
                />
              </div>
            </div>

            {/* UNIFIED TABLE CONTAINER (HEADER + LIST) */}
            <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col flex-1 min-h-0 -mt-1 shadow-2xs">
              {/* TABLE HEADER */}
              <div className="flex items-center justify-between bg-slate-50 border-b border-gray-200 px-3.5 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider select-none shrink-0">
                <span className="pl-1">Chỉ tiêu</span>
                <span className="w-16 text-center pr-1">Công bố</span>
              </div>

              {/* LIST */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-150 min-h-0">
                {filteredIndicators.map(ind => {
                  const isSelected = selectedIndicator?.code === ind.code;
                  const isExpanded = !!expandedIndicators[ind.code];
                  const status = getIndicatorStatus(ind);
                  const subCharts = getIndicatorSubCharts(ind);

                  return (
                    <div key={ind.code} className="flex flex-col">
                      {/* INDICATOR ROW */}
                      <div
                        onClick={() => {
                          setSelectedIndicator(ind);
                          setExpandedIndicators(prev => ({
                            ...prev,
                            [ind.code]: !prev[ind.code]
                          }));
                          if (subCharts.length > 0) {
                            setSelectedSubChart(subCharts[0]);
                          }
                        }}
                        className={`px-3 py-2.5 cursor-pointer transition-all flex items-center justify-between group border-b border-gray-100 ${isSelected
                          ? 'bg-slate-50 border-l-4 border-vna-blue'
                          : 'hover:bg-slate-50/70'
                          }`}
                      >
                        <div className="flex-1 pr-2 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-gray-400">
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded font-mono">
                              {ind.code}
                            </span>
                            <span className="text-[9px] text-gray-500 font-medium bg-gray-150/70 px-1.5 py-0.5 rounded">
                              {subCharts.length} biểu đồ
                            </span>
                          </div>
                          <div className="text-xs font-bold text-gray-800 leading-snug">
                            {getLocalizedIndicatorName(ind.name, currentLang)}
                          </div>
                        </div>

                        <div className="w-16 flex justify-center items-center shrink-0 pr-1">
                          {status === 'adjusted' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-250">
                              Đã sửa
                            </span>
                          )}
                        </div>
                      </div>

                      {/* SUB-CHARTS EXPANDED LIST */}
                      {isExpanded && (
                        <div className="bg-slate-50/40 border-l-2 border-slate-300 divide-y divide-gray-100">
                          {subCharts
                            .filter(sub => {
                              if (!filterPublish) return true;
                              const isPub = publishedChartStatuses[sub.code] !== false;
                              return filterPublish === 'published' ? isPub : !isPub;
                            })
                            .map(sub => {
                              const isSubSelected = selectedSubChart?.code === sub.code;
                              const subStatus = getSubChartStatus(sub.code);
                              const isPub = publishedChartStatuses[sub.code] !== false;

                              return (
                                <div
                                  key={sub.code}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Avoid toggling collapse
                                    setSelectedIndicator(ind);
                                    setSelectedSubChart(sub);
                                  }}
                                  className={`pl-7 pr-3 py-2 cursor-pointer transition-all flex items-center justify-between ${isSubSelected
                                    ? 'bg-blue-50/80 border-r-3 border-vna-blue'
                                    : 'hover:bg-slate-100/60'
                                    }`}
                                >
                                  <div className="flex-1 pr-2 min-w-0 flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-xs font-semibold ${!isPub ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                      {sub.name.replace(/^Biểu đồ\s*\d+\s*:\s*/i, '')}
                                    </span>
                                    {subStatus === 'adjusted' && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                                        Đã sửa
                                      </span>
                                    )}
                                  </div>

                                  <div className="w-16 flex justify-center items-center shrink-0 pr-1">
                                    {/* Switch Button Công bố */}
                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={isPub}
                                      onClick={(e) => handleToggleSubChartPublish(sub.code, e)}
                                      className={`relative inline-flex h-5 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isPub ? 'bg-emerald-500 hover:bg-emerald-600 shadow-2xs' : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                      title={isPub ? "Đang công bố (Click để tắt)" : "Không công bố (Click để bật)"}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isPub ? 'translate-x-6' : 'translate-x-0'
                                          }`}
                                      />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredIndicators.length === 0 && (
                  <div className="py-8 text-center text-gray-400 italic text-xs">
                    Không tìm thấy chỉ tiêu phù hợp.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OVERRIDE CONFIG (col-span-8) */}
        <div ref={rightColRef} className="lg:col-span-8">
          {!selectedIndicator || !selectedSubChart ? (
            <Card className="p-12 border border-gray-250 text-center flex flex-col items-center justify-center min-h-[450px]">
              <Database size={48} className="text-gray-300 mb-4 stroke-1 animate-pulse" />
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                Chưa chọn biểu đồ cấu hình
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Vui lòng chọn một biểu đồ thành phần ở danh sách bên trái để thiết lập các số liệu ghi đè phục vụ công bố đối ngoại.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              {/* INDICATOR HEADER CARD */}
              {/* <Card className="p-5 border border-gray-250 bg-gradient-to-r from-slate-50 to-white flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-vna-blue border border-blue-200 rounded font-mono">
                        {selectedSubChart.code}
                      </span>
                      <PillarBadge pillar={selectedIndicator.pillar} />
                      <Badge variant="secondary" className="font-semibold text-[10px]">
                        Nguồn: {selectedSubChart.source}
                      </Badge>
                    </div>
                    <h2 className="text-lg font-bold text-vna-blue">{selectedSubChart.name}</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-gray-200 pt-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium">Đơn vị chủ trì:</span>
                    <div className="font-bold text-gray-800 mt-0.5">{selectedIndicator.department || '—'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Đơn vị tính:</span>
                    <div className="font-bold text-gray-800 mt-0.5">{selectedSubChart.unit || '—'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Tần suất báo cáo:</span>
                    <div className="font-bold text-vna-blue mt-0.5">{selectedSubChart.frequency || 'Hàng tháng'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Chỉ tiêu tổng:</span>
                    <div className="font-bold text-gray-850 mt-0.5 truncate" title={selectedIndicator.name}>
                      {selectedIndicator.code}
                    </div>
                  </div>
                </div>
              </Card> */}

              {/* OVERRIDES LIST CONTAINER */}
              <Card className="p-5 border border-gray-250 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-150 pb-2.5">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* <h3 className="text-sm font-bold text-vna-blue uppercase tracking-wider flex items-center gap-2">
                      <Clock size={16} />
                      <span>Cấu hình kỳ báo cáo ({selectedSubChart.frequency || 'Hàng tháng'})</span>
                    </h3> */}
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      <span className="text-xs text-gray-500 font-bold">Năm công bố:</span>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="text-xs font-black border border-gray-300 rounded-md px-2 py-0.5 bg-white text-vna-blue focus:outline-none focus:ring-1 focus:ring-vna-blue cursor-pointer"
                      >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsPreviewOpen(true)}
                      className="text-xs py-1.5 px-3 border border-gray-300 text-gray-700 bg-white cursor-pointer flex items-center gap-1.5"
                    >
                      <Activity size={13} className="text-vna-blue" />
                      <span>Xem trước</span>
                    </Button>
                    {/* <Button
                      variant="outline"
                      onClick={handleResetCurrent}
                      className="text-xs py-1.5 px-3 border border-gray-300 text-gray-700 bg-white cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw size={13} />
                      <span>Đặt lại</span>
                    </Button> */}
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      className="text-xs py-1.5 px-4 bg-vna-blue text-white cursor-pointer flex items-center gap-1.5 font-bold"
                    >
                      <Save size={14} />
                      <span>Lưu</span>
                    </Button>
                  </div>
                </div>

                {/* WARNING BANNER FOR UNPUBLISHED CHART */}
                {!isChartPublished && (
                  <div className="bg-amber-50 border border-amber-250 text-amber-800 p-3.5 rounded-xl flex items-start gap-3 text-xs font-bold shadow-2xs mb-3">
                    <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span>Toàn bộ số liệu của biểu đồ thành phần này đang được thiết lập là </span>
                      <span className="text-red-700 uppercase font-black bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">Không công bố</span>
                      <span>. Dữ liệu sẽ tạm thời ẩn khỏi Executive Dashboard và BI Reports.</span>
                    </div>
                  </div>
                )}

                {/* SCROLLABLE TABLE OF PERIODS */}
                <div className={`overflow-x-auto border rounded-xl max-h-[520px] transition-all duration-300 ${isChartPublished
                  ? 'border-gray-200'
                  : 'border-amber-200 bg-gray-50/30 opacity-85'
                  }`}>
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-600 uppercase tracking-wider sticky top-0 z-10 shadow-xs">
                        <th className="p-3.5 pl-4">Kỳ</th>
                        <th className="p-3.5 w-44">Số liệu gốc</th>
                        <th className="p-3.5 w-44">Điều chỉnh</th>
                        <th className="p-3.5 pr-4">Lý do</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 text-xs">
                      {currentPeriods.map(p => {
                        const state = editStates[p] || { isOverride: false, overrideValue: '', reason: '' };
                        const realValue = getSystemRealValue(selectedSubChart.code, p, selectedSubChart.unit);
                        const sourceText = selectedSubChart.source;
                        const isText = selectedSubChart.unit === 'Văn bản' || selectedSubChart.unit === 'Báo cáo' || !selectedSubChart.unit;
                        const isOverridden = state.overrideValue && state.overrideValue.trim() !== realValue.trim();

                        return (
                          <tr
                            key={p}
                            className={`transition-colors hover:bg-slate-50/50 ${isOverridden ? 'bg-amber-50/15' : ''
                              }`}
                          >
                            {/* Period name */}
                            <td className="p-3 pl-4 font-bold text-gray-800 text-sm whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Activity size={14} className="text-vna-blue shrink-0" />
                                <span className={!isChartPublished ? 'text-gray-400 line-through decoration-gray-400/50' : ''}>
                                  {p}
                                </span>
                              </div>
                            </td>

                            {/* System real value */}
                            <td className="p-3">
                              <div className="flex flex-col gap-0.5">
                                <span className={`font-mono text-sm font-bold truncate ${isText ? 'text-gray-500 italic font-sans' : 'text-gray-850'}`}>
                                  {realValue}
                                </span>
                                {/* <span className="text-[9px] text-gray-400 truncate max-w-[170px]" title={sourceText}>
                                  Nguồn: {sourceText}
                                </span> */}
                              </div>
                            </td>

                            {/* New override value input */}
                            <td className="p-3">
                              <input
                                type="text"
                                value={state.overrideValue}
                                onChange={(e) => handleValueChange(p, e.target.value)}
                                placeholder="Số mới..."
                                className={`w-full text-xs font-bold font-mono px-2.5 py-1.5 border rounded-md focus:outline-none focus:ring-1 ${isOverridden
                                  ? 'bg-amber-50/10 border-amber-300 text-gray-850 shadow-xs focus:ring-amber-500'
                                  : 'bg-white border-gray-200 text-gray-800 focus:ring-vna-blue'
                                  }`}
                              />
                            </td>

                            {/* Adjustment reason input */}
                            <td className="p-3 pr-4">
                              <input
                                type="text"
                                value={state.reason}
                                onChange={(e) => handleReasonChange(p, e.target.value)}
                                placeholder="Nhập lý do điều chỉnh..."
                                className={`w-full text-xs px-2.5 py-1.5 border rounded-md focus:outline-none focus:ring-1 ${isOverridden
                                  ? 'bg-amber-50/10 border-amber-300 text-gray-850 shadow-xs focus:ring-amber-500'
                                  : 'bg-white border-gray-200 text-gray-800 focus:ring-vna-blue'
                                  }`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* CHART DESCRIPTION CARD */}
              <Card className="p-5 border border-gray-250 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-gray-150 pb-2.5">
                  <h3 className="text-xs font-bold text-vna-blue uppercase tracking-wider flex items-center gap-2">
                    <FileText size={15} />
                    <span>Mô tả / Thuyết minh biểu đồ</span>
                  </h3>
                  {/* <span className="text-[11px] text-gray-400 font-medium">
                    {selectedSubChart.name}
                  </span> */}
                </div>
                <div className="flex flex-col gap-2">
                  <textarea
                    rows={4}
                    value={chartDescription}
                    onChange={(e) => setChartDescription(e.target.value)}
                    placeholder="Nhập phần mô tả, bối cảnh số liệu, phân tích xu hướng hoặc ghi chú thuyết minh cho toàn bộ biểu đồ này..."
                    className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-vna-blue bg-white text-gray-800 resize-y leading-relaxed shadow-2xs"
                  />
                  <div className="flex justify-between items-center text-[11px] text-gray-400 pt-0.5">
                    {/* <span>Thuyết minh này sẽ được đồng bộ và xuất bản cùng biểu đồ trên Executive Dashboard và Báo cáo ESG.</span> */}
                    {/* <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {chartDescription.length} ký tự
                    </span> */}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* KHỐI LỊCH SỬ ĐIỀU CHỈNH SỐ LIỆU (DƯỚI CÙNG MÀN HÌNH) */}
      <Card className="p-5 border border-gray-250 flex flex-col gap-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-150 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-vna-blue rounded-lg border border-blue-200/50">
              <History size={17} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-vna-blue uppercase tracking-wider">
                Lịch sử điều chỉnh số liệu
              </h3>
              <p className="text-[11px] text-gray-500">
                {selectedSubChart ? (
                  <span>
                    <strong className="text-gray-800">{selectedSubChart.name}</strong> ({selectedIndicator?.code})
                  </span>
                ) : (
                  <span>Chọn một biểu đồ ở danh sách phía trên để xem lịch sử điều chỉnh chi tiết.</span>
                )}
              </p>
            </div>
          </div>
          {selectedSubChart && (
            <Badge variant="secondary" className="font-mono text-[10px] w-fit">
              {adjustHistory.filter(h => h.chartCode === selectedSubChart.code).length} bản ghi
            </Badge>
          )}
        </div>

        {/* BẢNG DANH SÁCH LỊCH SỬ */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-2.5 px-4 w-44">Kỳ</th>
                <th className="py-2.5 px-4 w-40">Số liệu gốc</th>
                <th className="py-2.5 px-4 w-40">Điều chỉnh</th>
                <th className="py-2.5 px-4">Người điều chỉnh</th>
                <th className="py-2.5 px-4 w-48 text-right pr-6">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {(() => {
                const chartHistory = selectedSubChart
                  ? adjustHistory.filter(h => h.chartCode === selectedSubChart.code)
                  : adjustHistory;

                if (chartHistory.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                        Chưa có lịch sử điều chỉnh số liệu nào được ghi nhận cho biểu đồ này.
                      </td>
                    </tr>
                  );
                }

                return chartHistory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-800 flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400 shrink-0" />
                      <span>{item.period}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500">
                      {item.originalValue} {selectedSubChart?.unit || ''}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-vna-blue bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/70">
                        {item.adjustedValue} {selectedSubChart?.unit || ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-gray-400 shrink-0" />
                        <span className="font-medium">{item.adjustedBy}</span>
                      </div>
                      {/* {item.reason && (
                        <div className="text-[10px] text-gray-400 italic mt-0.5 truncate max-w-md">
                          {item.reason}
                        </div>
                      )} */}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-500 text-right pr-6">
                      <div className="inline-flex items-center gap-1.5">
                        <Clock size={13} className="text-gray-400 shrink-0" />
                        <span>{item.adjustedAt}</span>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CHART PREVIEW MODAL */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`${selectedSubChart?.name}`}
        size="lg"
      >
        <div className="p-4 space-y-4 text-left">
          <div className="h-[350px] bg-slate-50 p-4 rounded-xl border border-gray-200">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={previewChartData} margin={{ top: 15, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="periodLabel" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} unit={selectedSubChart?.unit === '%' ? '%' : ''} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  labelFormatter={(label, items) => items[0]?.payload?.fullName || label}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Số liệu gốc" fill="#9ca3af" opacity={0.35} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="Số liệu điều chỉnh" stroke="#005f73" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {chartDescription && (
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 text-xs text-gray-700">
              <div className="font-bold text-vna-blue mb-1 flex items-center gap-1.5">
                <FileText size={14} />
                <span>Mô tả / Thuyết minh biểu đồ:</span>
              </div>
              <p className="whitespace-pre-line leading-relaxed text-gray-800">{chartDescription}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
