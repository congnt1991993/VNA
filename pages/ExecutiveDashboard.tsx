import React, { useState, useEffect, useMemo } from 'react';
import { Maximize2, Minimize2, Leaf, Users, ShieldAlert, ArrowLeft, FileText, Search } from 'lucide-react';
import { Card, Table, Badge, PillarBadge, Button, Select, Input } from '../components/UI';
import MOCK_INDICATORS_JSON from '../data/indicators_main_list.json';

export const ExecutiveDashboard: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'E' | 'S' | 'G'>('ALL');
  const [indicators, setIndicators] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'LIST' | 'DASHBOARD'>('LIST');
  const [selectedIndicator, setSelectedIndicator] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

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
    
    const handleSync = () => {
      const saved = localStorage.getItem('vna_esg_indicators');
      if (saved) {
        try {
          setIndicators(JSON.parse(saved));
        } catch (e) {}
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('vna_indicators_updated', handleSync);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('vna_indicators_updated', handleSync);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const tabs = [
    { id: 'ALL', label: 'Tổng quan', icon: <FileText size={16} /> },
    { id: 'E', label: 'Environmental (Môi trường)', icon: <Leaf size={16} /> },
    { id: 'S', label: 'Social (Xã hội)', icon: <Users size={16} /> },
    { id: 'G', label: 'Governance (Quản trị)', icon: <ShieldAlert size={16} /> },
  ] as const;

  const getPillarEnum = (tab: 'E' | 'S' | 'G') => {
    if (tab === 'E') return 'Environment';
    if (tab === 'S') return 'Social';
    return 'Governance';
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
      { label: 'Tất cả đơn vị chủ trì', value: '' },
      ...departmentsList.map(dept => ({ label: dept, value: dept }))
    ];
  }, [departmentsList]);

  const filteredIndicators = indicators.filter(ind => {
    // 1. Tab pillar filter
    if (activeTab !== 'ALL') {
      const targetPillar = getPillarEnum(activeTab);
      const matchesPillar = ind.pillar === targetPillar || ind.pillar?.toLowerCase() === targetPillar.toLowerCase();
      if (!matchesPillar) return false;
    }
    
    // 2. Search query filter (Mã chỉ tiêu or Tên chỉ tiêu)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchesCode = ind.code?.toLowerCase().includes(query);
      const matchesName = ind.name?.toLowerCase().includes(query);
      if (!matchesCode && !matchesName) return false;
    }
    
    // 3. Responsible department filter
    if (selectedDept !== '') {
      if (ind.department !== selectedDept) return false;
    }
    
    return true;
  });

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
              <ArrowLeft size={16} /> Quay lại danh sách chỉ tiêu
            </Button>
            <a 
              href={selectedIndicator.metabaseLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-vna-blue hover:bg-[#00556e] rounded-md transition-all shadow-sm"
            >
              Xem chi tiết trên Metabase ↗
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
      className={`flex flex-col bg-slate-50 transition-all duration-300 ease-in-out relative ${
        isFullscreen 
          ? 'fixed inset-0 z-[99999] w-screen h-screen overflow-y-auto' 
          : '-m-4 sm:-m-8 h-[calc(100vh-64px)] overflow-y-auto'
      }`}
    >
      {/* Header bar containing Heading, Tabs & Controls */}
      <div className="flex flex-col bg-white border-b border-gray-200 px-6 py-4 gap-4 shadow-xs shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-vna-blue">Tổng quan điều hành</h1>
            <p className="text-black/45 text-sm mt-0.5">Báo cáo trực quan và phân tích dữ liệu các trụ cột ESG của Vietnam Airlines</p>
          </div>
          
          {/* Fullscreen controller */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-250 rounded-md shadow-xs transition-all duration-200 hover:scale-105 cursor-pointer"
            title={isFullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 size={14} />
                <span>Thu nhỏ</span>
              </>
            ) : (
              <>
                <Maximize2 size={14} />
                <span>Toàn màn hình</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Tab Bar */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg self-start">
          {tabs.map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                  isTabActive
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
            <span>Xem chi tiết biểu đồ tổng trên Metabase</span>
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              {activeTab === 'ALL' ? <FileText className="text-vna-blue" size={18} /> :
               activeTab === 'E' ? <Leaf className="text-emerald-600" size={18} /> : 
               activeTab === 'S' ? <Users className="text-blue-600" size={18} /> : 
               <ShieldAlert className="text-amber-500" size={18} />}
              <span>
                {activeTab === 'ALL' ? 'Danh mục Chỉ tiêu - Tổng quan tất cả trụ cột' :
                 `Danh mục Chỉ tiêu - Trụ cột ${activeTab === 'E' ? 'Môi trường (Environmental)' : 
                                                 activeTab === 'S' ? 'Xã hội (Social)' : 
                                                 'Quản trị (Governance)'}`}
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Danh sách các chỉ tiêu số hóa đang được giám sát trên hệ thống</p>
          </div>
          <Badge variant="secondary">
            Tổng cộng: {filteredIndicators.length} chỉ tiêu
          </Badge>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-lg border border-gray-200 items-end shadow-xs">
          <div className="md:col-span-7 relative">
            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Tìm kiếm chỉ tiêu</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Nhập mã chỉ tiêu hoặc tên chỉ tiêu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Đơn vị chủ trì</label>
            <Select
              value={selectedDept}
              onChange={setSelectedDept}
              options={departmentOptions}
              placeholder="Tất cả đơn vị chủ trì"
            />
          </div>
        </div>

        <Card className="p-0 overflow-hidden border border-gray-250">
          <Table>
            <thead>
              <tr>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm w-28 text-left rounded-tl-lg">Mã chỉ tiêu</th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm text-left">Tên chỉ tiêu</th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm w-36 text-left">Chủ đề</th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm w-20 text-center">ĐVT</th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm w-24 text-right">Kế hoạch</th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm w-24 text-right">Thực hiện</th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm w-24 text-center">Tiến độ</th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm w-24 text-center">Đánh giá</th>
                <th className="bg-vna-blue text-white py-3 px-4 font-semibold text-sm text-left rounded-tr-lg">Đơn vị chủ trì</th>
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
                    <td className="font-semibold text-gray-800 text-left py-3 px-4">{ind.name}</td>
                    <td className="text-xs text-gray-600 text-left font-medium py-3 px-4">{ind.topic || '—'}</td>
                    <td className="text-xs text-gray-650 text-center font-semibold py-3 px-4">{ind.unit || '—'}</td>
                    <td className="text-sm font-semibold text-gray-900 text-right font-mono py-3 px-4">{planVal}</td>
                    <td className="text-sm font-semibold text-gray-900 text-right font-mono py-3 px-4">{actualVal}</td>
                    <td className="text-xs font-bold text-gray-700 text-center font-mono py-3 px-4">{progressVal}</td>
                    <td className="text-xs text-center py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isTextType ? 'bg-gray-100 text-gray-700' :
                        evaluation === 'Đạt' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isTextType ? '—' : evaluation}
                      </span>
                    </td>
                    <td className="text-xs text-gray-750 font-medium text-left py-3 px-4">{ind.department || '—'}</td>
                  </tr>
                );
              })}
              {filteredIndicators.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400 italic">
                    Chưa có chỉ tiêu nào trong trụ cột này.
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
