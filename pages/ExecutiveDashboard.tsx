import React, { useState, useEffect, useMemo } from 'react';
import { Maximize2, Minimize2, Leaf, Users, ShieldAlert, ArrowLeft, FileText, Search, Globe, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { Card, Table, Badge, PillarBadge, Button, Select, Input } from '../components/UI';
import MOCK_INDICATORS_JSON from '../data/indicators_main_list.json';

const getLocalizedIndicatorName = (name: string | undefined, lang: 'vi' | 'en'): string => {
  if (!name) return '';
  if (name.includes(' / ')) {
    const parts = name.split(' / ');
    return lang === 'vi' ? (parts[1]?.trim() || parts[0]?.trim()) : parts[0]?.trim();
  }
  const match = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    const enPart = match[1].trim();
    const viPart = match[2].trim();
    return lang === 'vi' ? viPart : enPart;
  }
  return name;
};

export const ExecutiveDashboard: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>(
    () => (localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi'
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'E' | 'S' | 'G'>('ALL');
  const [indicators, setIndicators] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'LIST' | 'DASHBOARD'>('LIST');
  const [selectedIndicator, setSelectedIndicator] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [adjustments, setAdjustments] = useState<any[]>([]);

  // Sorting & Column-level filter states
  const [sortCodeOrder, setSortCodeOrder] = useState<'asc' | 'desc' | 'none'>('asc');
  const [filterCode, setFilterCode] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterEvaluation, setFilterEvaluation] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // Load and sync adjustments
  const loadAdjustments = () => {
    const saved = localStorage.getItem('vna_publish_adjustments');
    if (saved) {
      try {
        setAdjustments(JSON.parse(saved));
      } catch (e) { }
    }
  };

  // Load and sync indicators from localStorage
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

  useEffect(() => {
    loadIndicators();
    loadAdjustments();

    const handleSync = () => {
      const saved = localStorage.getItem('vna_esg_indicators');
      if (saved) {
        try {
          setIndicators(JSON.parse(saved));
        } catch (e) { }
      }
    };

    const handleAdjSync = () => {
      loadAdjustments();
    };

    const handleLangChange = () => {
      setCurrentLang((localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi');
    };
    window.addEventListener('vna_language_changed', handleLangChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('vna_indicators_updated', handleSync);
    window.addEventListener('vna_publish_adjustments_updated', handleAdjSync);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('vna_indicators_updated', handleSync);
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

  const getPillarEnum = (tab: 'E' | 'S' | 'G') => {
    if (tab === 'E') return 'Environment';
    if (tab === 'S') return 'Social';
    return 'Governance';
  };

  // Get unique topics list
  const topicsList = useMemo(() => {
    const set = new Set<string>();
    indicators.forEach(ind => {
      if (ind.topic) set.add(ind.topic);
    });
    return Array.from(set).sort();
  }, [indicators]);

  const getIndicatorEvaluation = (ind: any): 'Đạt' | 'Không đạt' | '—' => {
    const isTextType = ind.unit === "Văn bản" || ind.unit === "Báo cáo" || ind.unit === "Đặc tả" || !ind.unit;
    if (isTextType) return '—';

    const freq = ind.frequency || 'Hàng tháng';
    let targetPeriod = 'Tháng 05/2026';
    if (freq.includes('quý') || freq.includes('Quý')) {
      targetPeriod = 'Quý 2/2026';
    } else if (freq.includes('năm') || freq.includes('Năm')) {
      targetPeriod = 'Năm 2026';
    } else if (freq.includes('bán niên') || freq.includes('Bán niên') || freq.includes('Bán Niên')) {
      targetPeriod = 'Bán niên 1/2026';
    }

    const parseNum = (v: string) => {
      if (!v) return 0;
      const clean = v.replace(/[^0-9.-]/g, '');
      return clean ? Number(clean) : 0;
    };

    const codeHash = ind.code.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const isPercentage = ind.unit === "%";

    let planNum = isPercentage ? 100 : (1000 + (codeHash % 9) * 500);
    let actualNum = isPercentage ? (90 + (codeHash % 11)) : (planNum - (codeHash % 7) * 200 + (codeHash % 3) * 100);

    if (ind.code === 'GRI 302-1') {
      const jOverride = adjustments.find(a => a.indicatorCode === 'GRI 302-1-JETA1' && a.period === targetPeriod && a.isOverride);
      const sOverride = adjustments.find(a => a.indicatorCode === 'GRI 302-1-SAF' && a.period === targetPeriod && a.isOverride);
      if (jOverride || sOverride) {
        const jVal = jOverride ? parseNum(jOverride.overrideValue) : 625000;
        const sVal = sOverride ? parseNum(sOverride.overrideValue) : 2800;
        actualNum = jVal + sVal;
      }
    } else if (ind.code === 'GRI 404-2') {
      const overrides = ['HQ', 'OPS', 'TECH', 'SERVICE', 'COMMERCE'].map(d => adjustments.find(a => a.indicatorCode === `GRI 404-2-${d}` && a.period === targetPeriod && a.isOverride));
      if (overrides.some(Boolean)) {
        const hqVal = overrides[0] ? parseNum(overrides[0].overrideValue) : 48;
        const opsVal = overrides[1] ? parseNum(overrides[1].overrideValue) : 85;
        const techVal = overrides[2] ? parseNum(overrides[2].overrideValue) : 120;
        const srvVal = overrides[3] ? parseNum(overrides[3].overrideValue) : 90;
        const comVal = overrides[4] ? parseNum(overrides[4].overrideValue) : 65;
        actualNum = Math.round((hqVal + opsVal + techVal + srvVal + comVal) / 5);
      }
    } else if (ind.code === 'GRI 2-7') {
      const overrides = ['PILOTS', 'CABIN', 'TECH', 'GROUND'].map(s => adjustments.find(a => a.indicatorCode === `GRI 2-7-${s}` && a.period === targetPeriod && a.isOverride));
      if (overrides.some(Boolean)) {
        const pilVal = overrides[0] ? parseNum(overrides[0].overrideValue) : 12;
        const cabVal = overrides[1] ? parseNum(overrides[1].overrideValue) : 45;
        const tecVal = overrides[2] ? parseNum(overrides[2].overrideValue) : 28;
        const grdVal = overrides[3] ? parseNum(overrides[3].overrideValue) : 15;
        actualNum = Math.min(pilVal + cabVal + tecVal + grdVal, 100);
      }
    } else if (ind.code === 'GRI 2-9') {
      const overrides = ['IND', 'EXEC', 'NONEXEC'].map(m => adjustments.find(a => a.indicatorCode === `GRI 2-9-${m}` && a.period === targetPeriod && a.isOverride));
      if (overrides.some(Boolean)) {
        const indVal = overrides[0] ? parseNum(overrides[0].overrideValue) : 3;
        const exeVal = overrides[1] ? parseNum(overrides[1].overrideValue) : 4;
        const nexVal = overrides[2] ? parseNum(overrides[2].overrideValue) : 2;
        actualNum = indVal + exeVal + nexVal;
      }
    } else if (ind.code === 'GRI 305-4') {
      const override = adjustments.find(a => a.indicatorCode === 'GRI 305-4-ACTUAL' && a.period === targetPeriod && a.isOverride);
      if (override) actualNum = parseNum(override.overrideValue);
    } else if (ind.code === 'Airline B-1') {
      const override = adjustments.find(a => a.indicatorCode === 'AIRLINE-B1-NPS' && a.period === targetPeriod && a.isOverride);
      if (override) actualNum = parseNum(override.overrideValue);
    } else {
      const override = adjustments.find(a => a.indicatorCode === `${ind.code}-SUB1` && a.period === targetPeriod && a.isOverride);
      if (override) actualNum = parseNum(override.overrideValue);
    }

    return actualNum >= planNum ? 'Đạt' : 'Không đạt';
  };

  const departmentsList = useMemo(() => {
    const depts = new Set<string>();
    indicators.forEach(ind => {
      if (ind.department) {
        depts.add(ind.department);
      }
    });
    return Array.from(depts).sort();
  }, [indicators]);

  const departmentOptions = useMemo(() => {
    return [
      { label: currentLang === 'vi' ? 'Tất cả đơn vị chủ trì' : 'All Departments', value: '' },
      ...departmentsList.map(dept => ({ label: dept, value: dept }))
    ];
  }, [departmentsList]);

  const filteredIndicators = useMemo(() => {
    let result = indicators.filter(ind => {
      // 1. Tab pillar filter
      if (activeTab !== 'ALL') {
        const targetPillar = getPillarEnum(activeTab);
        const matchesPillar = ind.pillar === targetPillar || ind.pillar?.toLowerCase() === targetPillar.toLowerCase();
        if (!matchesPillar) return false;
      }

      // 2. Column Filter: Code
      if (filterCode.trim() !== '') {
        const q = filterCode.trim().toLowerCase();
        if (!ind.code?.toLowerCase().includes(q)) return false;
      }

      // 3. Column Filter: Indicator Name (check Vietnamese and English localized name)
      if (filterName.trim() !== '') {
        const q = filterName.trim().toLowerCase();
        const localizedName = getLocalizedIndicatorName(ind.name, currentLang).toLowerCase();
        const rawName = (ind.name || '').toLowerCase();
        if (!localizedName.includes(q) && !rawName.includes(q)) return false;
      }

      // 4. Column Filter: Topic
      if (filterTopic !== '') {
        if (ind.topic !== filterTopic) return false;
      }

      // 5. Column Filter: Evaluation
      if (filterEvaluation !== '') {
        const evalResult = getIndicatorEvaluation(ind);
        if (evalResult !== filterEvaluation) return false;
      }

      // 6. Column Filter: Department
      if (filterDept !== '') {
        if (ind.department !== filterDept) return false;
      }

      return true;
    });

    // Sort by Mã chỉ tiêu (Code)
    if (sortCodeOrder !== 'none') {
      result = [...result].sort((a, b) => {
        const codeA = a.code || '';
        const codeB = b.code || '';
        return sortCodeOrder === 'asc'
          ? codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' })
          : codeB.localeCompare(codeA, undefined, { numeric: true, sensitivity: 'base' });
      });
    }

    return result;
  }, [indicators, activeTab, filterCode, filterName, filterTopic, filterEvaluation, filterDept, sortCodeOrder, currentLang, adjustments]);

  const handleBack = () => {
    setViewMode('LIST');
    setSelectedIndicator(null);
  };

  if (viewMode === 'DASHBOARD' && selectedIndicator) {
    const hasMetabaseLink = !!selectedIndicator.metabaseLink;
    const hasReportText = !!selectedIndicator.reportText;

    if (hasMetabaseLink) {
      return (
        <div className="bg-white p-6 rounded-lg border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <Button variant="ghost" onClick={handleBack} className="p-2 cursor-pointer border border-gray-200 hover:bg-gray-100 flex items-center gap-1 text-xs bg-white">
              <ArrowLeft size={16} /> {currentLang === 'vi' ? 'Quay lại danh sách chỉ tiêu' : 'Back to indicators list'}
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
            <span>{currentLang === 'vi' ? 'Metabase' : 'Metabase'}</span>
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

      {/* Indicators List Section */}
      <div className="p-6 bg-slate-50 space-y-4">
        <Card className="p-0 overflow-hidden border border-gray-250">
          <Table>
            <thead>
              <tr>
                <th
                  onClick={() => {
                    setSortCodeOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? 'none' : 'asc');
                  }}
                  className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm w-36 text-left rounded-tl-lg cursor-pointer select-none hover:bg-[#00556e] transition-colors"
                  title={currentLang === 'vi' ? 'Nhấn để sắp xếp theo Mã chỉ tiêu' : 'Click to sort by Code'}
                >
                  <div className="flex items-center gap-1.5 justify-between">
                    <span>{currentLang === 'vi' ? 'Mã chỉ tiêu' : 'Code'}</span>
                    <span className="text-white/80">
                      {sortCodeOrder === 'asc' ? <ArrowUp size={14} className="text-amber-300 font-bold" /> :
                        sortCodeOrder === 'desc' ? <ArrowDown size={14} className="text-amber-300 font-bold" /> :
                          <ArrowUpDown size={14} className="opacity-60" />}
                    </span>
                  </div>
                </th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm text-left min-w-[220px]">{currentLang === 'vi' ? 'Tên chỉ tiêu' : 'Indicator Name'}</th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm w-44 text-left">{currentLang === 'vi' ? 'Chủ đề' : 'Topic'}</th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm w-20 text-center">{currentLang === 'vi' ? 'ĐVT' : 'Unit'}</th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm w-24 text-right">{currentLang === 'vi' ? 'Kế hoạch' : 'Target'}</th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm w-24 text-right">{currentLang === 'vi' ? 'Thực hiện' : 'Actual'}</th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm min-w-[170px] w-48 text-center">{currentLang === 'vi' ? 'Tiến độ & Đánh giá' : 'Progress & Status'}</th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm text-left rounded-tr-lg min-w-[150px]">{currentLang === 'vi' ? 'CQĐV' : 'Department'}</th>
              </tr>

              {/* COLUMN FILTER ROW */}
              <tr className="bg-blue-50/70 border-b border-gray-200">
                {/* 1. Filter Code */}
                <th className="py-2 px-3 text-left">
                  <div className="relative">
                    <input
                      type="text"
                      value={filterCode}
                      onChange={(e) => setFilterCode(e.target.value)}
                      placeholder={currentLang === 'vi' ? 'Lọc mã...' : 'Filter code...'}
                      className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue"
                    />
                    {filterCode && (
                      <button onClick={() => setFilterCode('')} className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                    )}
                  </div>
                </th>

                {/* 2. Filter Name */}
                <th className="py-2 px-3 text-left">
                  <div className="relative">
                    <input
                      type="text"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      placeholder={currentLang === 'vi' ? 'Lọc tên chỉ tiêu...' : 'Filter name...'}
                      className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue"
                    />
                    {filterName && (
                      <button onClick={() => setFilterName('')} className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                    )}
                  </div>
                </th>

                {/* 3. Filter Topic */}
                <th className="py-2 px-3 text-left">
                  <select
                    value={filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value)}
                    className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue"
                  >
                    <option value="">{currentLang === 'vi' ? 'Tất cả chủ đề' : 'All Topics'}</option>
                    {topicsList.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </th>

                {/* 4-6 Spacers for ĐVT, Kế hoạch, Thực hiện */}
                <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>
                <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>
                <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

                {/* 7. Filter Evaluation */}
                <th className="py-2 px-3 text-center">
                  <select
                    value={filterEvaluation}
                    onChange={(e) => setFilterEvaluation(e.target.value)}
                    className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue"
                  >
                    <option value="">{currentLang === 'vi' ? 'Tất cả đánh giá' : 'All Status'}</option>
                    <option value="Đạt">{currentLang === 'vi' ? 'Đạt' : 'Achieved'}</option>
                    <option value="Không đạt">{currentLang === 'vi' ? 'Không đạt' : 'Not Achieved'}</option>
                  </select>
                </th>

                {/* 8. Filter Department */}
                <th className="py-2 px-3 text-left min-w-[170px]">
                  <div className="flex items-center gap-1.5">
                    <select
                      value={filterDept}
                      onChange={(e) => setFilterDept(e.target.value)}
                      className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue"
                    >
                      <option value="">{currentLang === 'vi' ? 'Tất cả đơn vị' : 'All Departments'}</option>
                      {departmentsList.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {(filterCode || filterName || filterTopic || filterEvaluation || filterDept) && (
                      <button
                        onClick={() => {
                          setFilterCode('');
                          setFilterName('');
                          setFilterTopic('');
                          setFilterEvaluation('');
                          setFilterDept('');
                        }}
                        className="text-[11px] font-bold text-red-600 hover:text-red-800 underline whitespace-nowrap cursor-pointer px-1 py-0.5 rounded hover:bg-red-50"
                        title={currentLang === 'vi' ? 'Xóa tất cả bộ lọc' : 'Clear all filters'}
                      >
                        {currentLang === 'vi' ? 'Xóa lọc' : 'Clear'}
                      </button>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredIndicators.map((ind) => {
                // Determine values based on whether the indicator is a numeric metric or a text form indicator
                // Indicators that typically use text entry (or descriptive forms) will have value = 0.
                const isTextType = ind.unit === "Văn bản" || ind.unit === "Báo cáo" || ind.unit === "Đặc tả" || !ind.unit;

                let planVal = "0";
                let actualVal = "0";
                let progressVal = "0%";
                let evaluation: "Đạt" | "Không đạt" = "Không đạt";

                if (!isTextType) {
                  // Generate realistic mock numbers for numeric indicators
                  const codeHash = ind.code.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                  const isPercentage = ind.unit === "%";

                  if (isPercentage) {
                    const planNum = 100;
                    const actualNum = 90 + (codeHash % 11); // 90% to 100%
                    planVal = `${planNum}%`;
                    actualVal = `${actualNum}%`;
                    progressVal = `${Math.min(Math.round((actualNum / planNum) * 100), 100)}%`;
                    evaluation = actualNum >= planNum ? "Đạt" : "Không đạt";
                  } else {
                    const basePlan = 1000 + (codeHash % 9) * 500;
                    const baseActual = basePlan - (codeHash % 7) * 200 + (codeHash % 3) * 100;
                    planVal = basePlan.toLocaleString();
                    actualVal = baseActual.toLocaleString();
                    progressVal = `${Math.min(Math.round((baseActual / basePlan) * 100), 100)}%`;
                    evaluation = baseActual >= basePlan ? "Đạt" : "Không đạt";
                  }
                }

                // Determine target period name based on indicator frequency
                const freq = ind.frequency || 'Hàng tháng';
                let targetPeriod = 'Tháng 05/2026';
                if (freq.includes('quý') || freq.includes('Quý')) {
                  targetPeriod = 'Quý 2/2026'; // May falls in Q2
                } else if (freq.includes('năm') || freq.includes('Năm')) {
                  targetPeriod = 'Năm 2026';
                } else if (freq.includes('bán niên') || freq.includes('Bán niên') || freq.includes('Bán Niên')) {
                  targetPeriod = 'Bán niên 1/2026'; // May falls in H1
                }

                // Check for override/adjustment for the matched period on sub-charts
                let isOverridden = false;
                let overrideReasons: string[] = [];
                const parseNum = (v: string) => {
                  if (!v) return 0;
                  const clean = v.replace(/[^0-9.-]/g, '');
                  return clean ? Number(clean) : 0;
                };

                if (ind.code === 'GRI 302-1') {
                  const jOverride = adjustments.find(a => a.indicatorCode === 'GRI 302-1-JETA1' && a.period === targetPeriod && a.isOverride);
                  const sOverride = adjustments.find(a => a.indicatorCode === 'GRI 302-1-SAF' && a.period === targetPeriod && a.isOverride);

                  if (jOverride || sOverride) {
                    isOverridden = true;
                    const jVal = jOverride ? parseNum(jOverride.overrideValue) : 108000;
                    const sVal = sOverride ? parseNum(sOverride.overrideValue) : 5100;
                    actualVal = Math.round(jVal + sVal).toLocaleString();
                    if (jOverride) overrideReasons.push(`Jet A-1: ${jOverride.reason || 'Không lý do'}`);
                    if (sOverride) overrideReasons.push(`SAF: ${sOverride.reason || 'Không lý do'}`);
                  }
                } else if (ind.code === 'GRI 404-2') {
                  const depts = [
                    { key: 'HQ', label: 'CQ' },
                    { key: 'OPS', label: 'Khai thác' },
                    { key: 'TECH', label: 'Kỹ thuật' },
                    { key: 'SERVICE', label: 'Dịch vụ' },
                    { key: 'COMMERCE', label: 'Thương mại' }
                  ];
                  const overrides = depts.map(d => ({
                    override: adjustments.find(a => a.indicatorCode === `GRI 404-2-${d.key}` && a.period === targetPeriod && a.isOverride),
                    label: d.label
                  }));

                  if (overrides.some(o => o.override)) {
                    isOverridden = true;
                    const hqVal = overrides[0].override ? parseNum(overrides[0].override.overrideValue) : 48;
                    const opsVal = overrides[1].override ? parseNum(overrides[1].override.overrideValue) : 85;
                    const techVal = overrides[2].override ? parseNum(overrides[2].override.overrideValue) : 120;
                    const srvVal = overrides[3].override ? parseNum(overrides[3].override.overrideValue) : 90;
                    const comVal = overrides[4].override ? parseNum(overrides[4].override.overrideValue) : 65;
                    actualVal = Math.round((hqVal + opsVal + techVal + srvVal + comVal) / 5).toLocaleString();
                    overrides.forEach(o => {
                      if (o.override) overrideReasons.push(`${o.label}: ${o.override.reason || 'Không lý do'}`);
                    });
                  }
                } else if (ind.code === 'GRI 2-7') {
                  const staff = [
                    { key: 'PILOTS', label: 'Phi công' },
                    { key: 'CABIN', label: 'Tiếp viên' },
                    { key: 'TECH', label: 'Kỹ thuật' },
                    { key: 'GROUND', label: 'Mặt đất' }
                  ];
                  const overrides = staff.map(s => ({
                    override: adjustments.find(a => a.indicatorCode === `GRI 2-7-${s.key}` && a.period === targetPeriod && a.isOverride),
                    label: s.label
                  }));

                  if (overrides.some(o => o.override)) {
                    isOverridden = true;
                    const pilVal = overrides[0].override ? parseNum(overrides[0].override.overrideValue) : 12;
                    const cabVal = overrides[1].override ? parseNum(overrides[1].override.overrideValue) : 45;
                    const tecVal = overrides[2].override ? parseNum(overrides[2].override.overrideValue) : 28;
                    const grdVal = overrides[3].override ? parseNum(overrides[3].override.overrideValue) : 15;
                    actualVal = `${Math.min(pilVal + cabVal + tecVal + grdVal, 100)}%`;
                    overrides.forEach(o => {
                      if (o.override) overrideReasons.push(`${o.label}: ${o.override.reason || 'Không lý do'}`);
                    });
                  }
                } else if (ind.code === 'GRI 2-9') {
                  const members = [
                    { key: 'IND', label: 'Độc lập' },
                    { key: 'EXEC', label: 'Điều hành' },
                    { key: 'NONEXEC', label: 'Không điều hành' }
                  ];
                  const overrides = members.map(m => ({
                    override: adjustments.find(a => a.indicatorCode === `GRI 2-9-${m.key}` && a.period === targetPeriod && a.isOverride),
                    label: m.label
                  }));

                  if (overrides.some(o => o.override)) {
                    isOverridden = true;
                    const indVal = overrides[0].override ? parseNum(overrides[0].override.overrideValue) : 3;
                    const exeVal = overrides[1].override ? parseNum(overrides[1].override.overrideValue) : 4;
                    const nexVal = overrides[2].override ? parseNum(overrides[2].override.overrideValue) : 2;
                    actualVal = (indVal + exeVal + nexVal).toLocaleString();
                    overrides.forEach(o => {
                      if (o.override) overrideReasons.push(`${o.label}: ${o.override.reason || 'Không lý do'}`);
                    });
                  }
                } else if (ind.code === 'GRI 305-4') {
                  const override = adjustments.find(a => a.indicatorCode === 'GRI 305-4-ACTUAL' && a.period === targetPeriod && a.isOverride);
                  if (override) {
                    actualVal = override.overrideValue;
                    isOverridden = true;
                    overrideReasons.push(override.reason || 'Không ghi chú');
                  }
                } else if (ind.code === 'Airline B-1') {
                  const override = adjustments.find(a => a.indicatorCode === 'AIRLINE-B1-NPS' && a.period === targetPeriod && a.isOverride);
                  if (override) {
                    actualVal = override.overrideValue;
                    isOverridden = true;
                    overrideReasons.push(override.reason || 'Không ghi chú');
                  }
                } else {
                  const override = adjustments.find(a => a.indicatorCode === `${ind.code}-SUB1` && a.period === targetPeriod && a.isOverride);
                  if (override) {
                    actualVal = override.overrideValue;
                    isOverridden = true;
                    overrideReasons.push(override.reason || 'Không ghi chú');
                  }
                }

                if (isOverridden) {
                  const actualNum = parseNum(actualVal);
                  const planNum = parseNum(planVal);

                  if (planNum > 0) {
                    progressVal = `${Math.min(Math.round((actualNum / planNum) * 100), 100)}%`;
                    evaluation = actualNum >= planNum ? "Đạt" : "Không đạt";
                  }
                }

                return (
                  <tr
                    key={ind.id || ind.code}
                    className="hover:bg-blue-50/45 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedIndicator(ind);
                      setViewMode('DASHBOARD');
                    }}
                  >
                    <td className="font-bold text-vna-blue text-left py-3 px-4">{ind.code}</td>
                    <td className="font-semibold text-gray-800 text-left py-3 px-4">{getLocalizedIndicatorName(ind.name, currentLang)}</td>
                    <td className="text-xs text-gray-600 text-left font-medium py-3 px-4">{ind.topic || '—'}</td>
                    <td className="text-xs text-gray-650 text-center font-semibold py-3 px-4">{ind.unit || '—'}</td>
                    <td className="text-sm font-semibold text-gray-900 text-right font-mono py-3 px-4">{planVal}</td>
                    <td className="text-sm font-semibold text-gray-900 text-right font-mono py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {isOverridden && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-250 px-1 py-0.5 rounded" title={`Đã điều chỉnh đối ngoại. Chi tiết: ${overrideReasons.join(', ') || 'Không ghi chú'}`}>
                            <Globe size={9} /> ADJ
                          </span>
                        )}
                        <span>{actualVal}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isTextType ? (
                        <span className="text-xs text-gray-400 font-medium italic">—</span>
                      ) : (
                        <div className="flex flex-col gap-1 w-full max-w-[150px] mx-auto">
                          {/* Top: Percentage & Evaluation Badge */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold font-mono text-gray-800 text-[11px]">{progressVal}</span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${evaluation === 'Đạt' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                              {currentLang === 'vi' ? evaluation : (evaluation === 'Đạt' ? 'Achieved' : 'Not Achieved')}
                            </span>
                          </div>
                          {/* Bottom: Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${evaluation === 'Đạt'
                                  ? 'bg-emerald-500'
                                  : parseFloat(progressVal) >= 70
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              style={{ width: `${Math.min(Math.max(parseFloat(progressVal) || 0, 0), 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="text-xs text-gray-750 font-medium text-left py-3 px-4">{ind.department || '—'}</td>
                  </tr>
                );
              })}
              {filteredIndicators.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400 italic">
                    {currentLang === 'vi' ? 'Chưa có chỉ tiêu nào phù hợp điều kiện lọc.' : 'No indicators match the selected filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
};
