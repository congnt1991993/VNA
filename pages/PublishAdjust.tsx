import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Select, Badge, PillarBadge, Toast } from '../components/UI';
import {
  Search, Sliders, Database, Leaf, Users, ShieldCheck,
  Clock, ArrowLeft, FileText, CheckCircle, Save, Filter,
  RotateCcw, Info, Globe, Activity, ShieldAlert, ChevronDown, ChevronRight
} from 'lucide-react';
import MOCK_INDICATORS_JSON from '../data/indicators_main_list.json';
import { Pillar } from '../types';

// --- TYPES ---
interface AdjustmentItem {
  indicatorCode: string;
  period: string;
  isOverride: boolean;
  overrideValue: string;
  reason: string;
  updatedAt: string;
  updatedBy: string;
}

// Helper to determine the dynamic periods based on indicator frequency and selected year
const getIndicatorPeriods = (indicator: any, year: string): string[] => {
  if (!indicator) return [];
  const freq = indicator.frequency || 'Hàng tháng';

  if (freq.includes('quý') || freq.includes('Quý')) {
    return [`Quý 1/${year}`, `Quý 2/${year}`, `Quý 3/${year}`, `Quý 4/${year}`];
  }
  if (freq.includes('năm') || freq.includes('Năm')) {
    return [`Năm ${year}`];
  }
  if (freq.includes('bán niên') || freq.includes('Bán niên') || freq.includes('Bán Niên')) {
    return [`Bán niên 1/${year}`, `Bán niên 2/${year}`];
  }
  return Array.from({ length: 12 }).map((_, i) => {
    const m = String(i + 1).padStart(2, '0');
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
      { code: 'GRI 302-1-JETA1', name: 'Biểu đồ 1: Tiêu thụ Jet A-1 Đội bay', unit: 'Tấn', source: 'Form Nhập liệu (Ban Kỹ thuật)', frequency: freq },
      { code: 'GRI 302-1-SAF', name: 'Biểu đồ 2: Tiêu thụ Nhiên liệu SAF pha trộn', unit: 'Tấn', source: 'Form Nhập liệu (Ban Kỹ thuật)', frequency: freq }
    ];
  }
  
  if (code === 'GRI 305-4') {
    return [
      { code: 'GRI 305-4-ACTUAL', name: 'Biểu đồ 1: Cường độ phát thải CO2 thực tế', unit: 'Tấn CO2/100 RTK', source: 'Form Nhập liệu (Ban Kỹ thuật)', frequency: 'Hàng năm' }
    ];
  }
  
  if (code === 'GRI 404-2') {
    return [
      { code: 'GRI 404-2-HQ', name: 'Biểu đồ 1: Giờ đào tạo trung bình Khối Cơ quan', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 404-2-OPS', name: 'Biểu đồ 2: Giờ đào tạo trung bình Khối Khai thác', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 404-2-TECH', name: 'Biểu đồ 3: Giờ đào tạo trung bình Khối Kỹ thuật', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 404-2-SERVICE', name: 'Biểu đồ 4: Giờ đào tạo trung bình Khối Dịch vụ', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 404-2-COMMERCE', name: 'Biểu đồ 5: Giờ đào tạo trung bình Khối Thương mại', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq }
    ];
  }
  
  if (code === 'Airline B-1') {
    return [
      { code: 'AIRLINE-B1-NPS', name: 'Biểu đồ 1: Biến động chỉ số Net Promoter Score', unit: 'Điểm', source: 'Hệ thống đối ngoại (Qualtrics API)', frequency: 'Hàng quý' }
    ];
  }
  
  if (code === 'GRI 2-7') {
    return [
      { code: 'GRI 2-7-PILOTS', name: 'Biểu đồ 1: Cơ cấu - Đội ngũ Phi công', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 2-7-CABIN', name: 'Biểu đồ 2: Cơ cấu - Đội ngũ Tiếp viên', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 2-7-TECH', name: 'Biểu đồ 3: Cơ cấu - Kỹ sư Kỹ thuật', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 2-7-GROUND', name: 'Biểu đồ 4: Cơ cấu - Nhân viên Mặt đất & CQ', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq }
    ];
  }
  
  if (code === 'GRI 2-9') {
    return [
      { code: 'GRI 2-9-IND', name: 'Biểu đồ 1: Thành phần Hội đồng Độc lập', unit: 'Thành viên', source: 'Nhập thủ công (Tổ Thư ký)', frequency: 'Hàng năm' },
      { code: 'GRI 2-9-EXEC', name: 'Biểu đồ 2: Thành phần Hội đồng Điều hành', unit: 'Thành viên', source: 'Nhập thủ công (Tổ Thư ký)', frequency: 'Hàng năm' },
      { code: 'GRI 2-9-NONEXEC', name: 'Biểu đồ 3: Thành phần Hội đồng Không điều hành', unit: 'Thành viên', source: 'Nhập thủ công (Tổ Thư ký)', frequency: 'Hàng năm' }
    ];
  }

  // Default sub-chart for other indicators
  return [
    { code: `${code}-SUB1`, name: `Biểu đồ 1: Thống kê số liệu ${indicator.name}`, unit: unit, source: getIndicatorSource(code, unit), frequency: freq }
  ];
};

export const PublishAdjustPage: React.FC = () => {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<any | null>(null);
  const [selectedSubChart, setSelectedSubChart] = useState<any | null>(null);
  const [expandedIndicators, setExpandedIndicators] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPillar, setFilterPillar] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Adjustments state (flat array stored in localStorage)
  const [adjustments, setAdjustments] = useState<AdjustmentItem[]>([]);

  // Detail form edit state (for the selected indicator)
  const [editStates, setEditStates] = useState<Record<string, { isOverride: boolean; overrideValue: string; reason: string }>>({});

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

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

  const currentPeriods = useMemo(() => getIndicatorPeriods(selectedIndicator, selectedYear), [selectedIndicator, selectedYear]);

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

      if (existing) {
        states[p] = {
          isOverride: existing.isOverride,
          overrideValue: existing.overrideValue,
          reason: existing.reason
        };
      } else {
        states[p] = {
          isOverride: false,
          overrideValue: '',
          reason: ''
        };
      }
    });

    setEditStates(states);
  }, [selectedSubChart, adjustments, currentPeriods]);

  // Handle query & filters
  const filteredIndicators = useMemo(() => {
    return indicators.filter(ind => {
      const matchesSearch =
        ind.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ind.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPillar =
        !filterPillar ||
        ind.pillar.toLowerCase() === filterPillar.toLowerCase();

      return matchesSearch && matchesPillar;
    });
  }, [indicators, searchQuery, filterPillar]);

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
      if (state.isOverride) {
        newEntries.push({
          indicatorCode: selectedSubChart.code,
          period,
          isOverride: true,
          overrideValue: state.overrideValue,
          reason: state.reason,
          updatedAt: nowStr,
          updatedBy: 'Nguyễn Văn Hải (Admin)'
        });
      }
    });

    const finalAdjustments = [...filteredAdjustments, ...newEntries];

    // Save to localStorage
    localStorage.setItem('vna_publish_adjustments', JSON.stringify(finalAdjustments));
    setAdjustments(finalAdjustments);

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
    if (!selectedIndicator) return;

    const clearedStates: Record<string, { isOverride: boolean; overrideValue: string; reason: string }> = {};
    currentPeriods.forEach(p => {
      clearedStates[p] = {
        isOverride: false,
        overrideValue: '',
        reason: ''
      };
    });
    setEditStates(clearedStates);
    setToast({
      message: 'Đã hoàn tác các thay đổi trên giao diện. Bấm Lưu để xác nhận.',
      type: 'info'
    });
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <div className="bg-white border border-gray-200 px-6 py-4 rounded-xl shadow-xs flex justify-between items-center">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: INDICATOR LIST (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="p-5 border border-gray-250 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gray-150 pb-2">
              <h3 className="text-sm font-bold text-vna-blue uppercase tracking-wider flex items-center gap-2">
                <Sliders size={16} />
                <span>Chọn chỉ tiêu ESG</span>
              </h3>
              <Badge variant="secondary" className="font-mono text-xs">
                {filteredIndicators.length} Chỉ tiêu
              </Badge>
            </div>

            {/* SEARCH & FILTER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Mã hoặc tên chỉ tiêu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs bg-white py-1.5"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>

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
            </div>

            {/* LIST */}
            <div className="max-h-[620px] overflow-y-auto divide-y divide-gray-150 pr-1">
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
                      className={`p-3 cursor-pointer transition-all flex items-center justify-between group border-b border-gray-100 ${
                        isSelected 
                          ? 'bg-slate-50 border-l-4 border-vna-blue' 
                          : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-400">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </span>
                          <span className="text-[10px] font-black px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded font-mono">
                            {ind.code}
                          </span>
                          <PillarBadge pillar={ind.pillar} />
                        </div>
                        <div className="text-xs font-bold text-gray-800 leading-snug">
                          {ind.name}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {status === 'adjusted' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-250">
                            Đã sửa
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 font-bold bg-gray-150/70 px-1.5 py-0.5 rounded-full">
                          {subCharts.length}
                        </span>
                      </div>
                    </div>

                    {/* SUB-CHARTS EXPANDED LIST */}
                    {isExpanded && (
                      <div className="bg-slate-50/30 border-l-2 border-slate-300 divide-y divide-gray-100/50">
                        {subCharts.map(sub => {
                          const isSubSelected = selectedSubChart?.code === sub.code;
                          const subStatus = getSubChartStatus(sub.code);

                          return (
                            <div
                              key={sub.code}
                              onClick={(e) => {
                                e.stopPropagation(); // Avoid toggling collapse
                                setSelectedIndicator(ind);
                                setSelectedSubChart(sub);
                              }}
                              className={`pl-8 pr-3 py-2.5 cursor-pointer transition-all flex items-center justify-between ${
                                isSubSelected
                                  ? 'bg-blue-50/80 border-r-4 border-vna-blue'
                                  : 'hover:bg-slate-100/50'
                              }`}
                            >
                              <div className="flex-1 pr-3">
                                <div className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                  <span>{sub.name}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-400 font-medium">
                                  <span className="font-mono bg-gray-100 px-1 rounded">{sub.code}</span>
                                  <span>ĐVT: {sub.unit}</span>
                                  <span>Tần suất: {sub.frequency}</span>
                                </div>
                              </div>

                              <div>
                                {subStatus === 'adjusted' ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    Đã sửa
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-gray-100 text-gray-455 border border-gray-150">
                                    Gốc
                                  </span>
                                )}
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
          </Card>
        </div>

        {/* RIGHT COLUMN: OVERRIDE CONFIG (col-span-7) */}
        <div className="lg:col-span-7">
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
              <Card className="p-5 border border-gray-250 bg-gradient-to-r from-slate-50 to-white flex flex-col gap-4">
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
              </Card>

              {/* OVERRIDES LIST CONTAINER */}
              <Card className="p-5 border border-gray-250 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-150 pb-2.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-sm font-bold text-vna-blue uppercase tracking-wider flex items-center gap-2">
                      <Clock size={16} />
                      <span>Cấu hình kỳ báo cáo ({selectedSubChart.frequency || 'Hàng tháng'})</span>
                    </h3>
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleResetCurrent}
                      className="text-xs py-1.5 px-3 border border-gray-300 text-gray-700 bg-white cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw size={13} />
                      <span>Đặt lại</span>
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      className="text-xs py-1.5 px-4 bg-vna-blue text-white cursor-pointer flex items-center gap-1.5 font-bold"
                    >
                      <Save size={14} />
                      <span>Lưu cấu hình</span>
                    </Button>
                  </div>
                </div>

                {/* SCROLLABLE LIST OF PERIODS */}
                <div className="max-h-[500px] overflow-y-auto space-y-4 pr-1">
                  {currentPeriods.map(p => {
                    const state = editStates[p] || { isOverride: false, overrideValue: '', reason: '' };
                    const realValue = getSystemRealValue(selectedSubChart.code, p, selectedSubChart.unit);
                    const sourceText = selectedSubChart.source;
                    const isText = selectedSubChart.unit === 'Văn bản' || selectedSubChart.unit === 'Báo cáo' || !selectedSubChart.unit;

                    return (
                      <div
                        key={p}
                        className={`p-4 rounded-xl border transition-all ${state.isOverride
                          ? 'bg-amber-50/20 border-amber-300/70 shadow-2xs'
                          : 'bg-white border-gray-200'
                          }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-2.5 mb-3">
                          <span className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                            <Activity size={14} className="text-vna-blue" />
                            {p}
                          </span>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                            <input
                              type="checkbox"
                              checked={state.isOverride}
                              onChange={() => handleToggleOverride(p)}
                              className="w-4 h-4 text-vna-blue rounded border-gray-300 focus:ring-vna-blue cursor-pointer"
                            />
                            <span className="text-amber-800 font-black">Thay đổi dữ liệu công bố</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          {/* SYSTEM REAL VALUE DATA (col-span-5) */}
                          <div className="md:col-span-5 space-y-1.5 bg-gray-50/70 p-3 rounded-lg border border-gray-150">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                              Số liệu thật của hệ thống
                            </span>
                            <div className={`font-mono text-sm font-bold truncate ${isText ? 'text-gray-600 italic' : 'text-gray-850'}`}>
                              {realValue}
                            </div>
                            <div className="text-[9px] text-gray-400 font-semibold truncate" title={sourceText}>
                              Nguồn: {sourceText}
                            </div>
                          </div>

                          {/* OVERRIDE CONTROLS (col-span-7) */}
                          <div className="md:col-span-7 flex flex-col gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                              <span className="text-xs font-bold text-gray-500 sm:text-right">Số công bố mới:</span>
                              <div className="sm:col-span-2">
                                <Input
                                  type="text"
                                  value={state.isOverride ? state.overrideValue : realValue}
                                  onChange={(e) => handleValueChange(p, e.target.value)}
                                  disabled={!state.isOverride}
                                  placeholder="Nhập số mới..."
                                  className={`text-xs font-bold font-mono py-1.5 ${state.isOverride ? 'bg-white border-amber-300 focus:ring-amber-500' : 'bg-gray-100 text-gray-450 border-gray-300'
                                    }`}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-2">
                              <span className="text-xs font-bold text-gray-500 sm:text-right pt-1.5">Lý do điều chỉnh:</span>
                              <div className="sm:col-span-2">
                                <textarea
                                  value={state.reason}
                                  onChange={(e) => handleReasonChange(p, e.target.value)}
                                  disabled={!state.isOverride}
                                  rows={1.5}
                                  placeholder="VD: Điều chỉnh sai số đo đạc / Theo kết quả kiểm toán đối ngoại..."
                                  className={`w-full text-xs p-2 rounded-lg border focus:outline-none focus:ring-1 ${state.isOverride
                                    ? 'bg-white border-amber-300 focus:ring-amber-500/30 focus:border-amber-400 text-gray-800'
                                    : 'bg-gray-100 border-gray-300 text-gray-400 resize-none'
                                    }`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
