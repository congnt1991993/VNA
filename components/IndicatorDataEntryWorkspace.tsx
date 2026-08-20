import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Eye,
  Layers,
  FolderOpen
} from 'lucide-react';
import { Button, PillarBadge } from './UI';
import { useAccess } from './AccessContext';
import { UnifiedDataEntryForm } from './UnifiedDataEntryForm';
import rawIndicatorsList from '../data/indicators_main_list.json';

// Helper to extract localized name
const getLocalizedIndicatorName = (name: string, lang: 'vi' | 'en' = 'vi'): string => {
  if (!name) return '';
  if (name.includes('/')) {
    const parts = name.split('/').map(p => p.trim());
    if (parts.length >= 2) {
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

export const IndicatorDataEntryWorkspace: React.FC = () => {
  const { currentUser, isAdmin, selectedDepartment } = useAccess();

  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>(() => {
    return (localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi';
  });

  useEffect(() => {
    const handleLangChange = () => {
      setCurrentLang((localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi');
    };
    window.addEventListener('vna_language_changed', handleLangChange);
    return () => window.removeEventListener('vna_language_changed', handleLangChange);
  }, []);

  // View state: 'LIST' or 'ENTRY'
  const [viewMode, setViewMode] = useState<'LIST' | 'ENTRY'>('LIST');
  const [selectedIndicator, setSelectedIndicator] = useState<any | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Năm 2026');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [pillarFilter, setPillarFilter] = useState<'ALL' | 'Environment' | 'Social' | 'Governance'>('ALL');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('ALL');

  // Load all indicators
  const allIndicators = useMemo(() => {
    const saved = localStorage.getItem('vna_esg_indicators');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { }
    }
    return rawIndicatorsList;
  }, []);

  // Filter indicators assigned to current user / department
  const userAssignedIndicators = useMemo(() => {
    let assignedCodes: string[] = [];

    const savedDeptsStr = localStorage.getItem('vna_esg_departments');
    if (savedDeptsStr) {
      try {
        const depts = JSON.parse(savedDeptsStr);
        if (Array.isArray(depts)) {
          const matched = depts.find((d: any) => d && d.name && d.name.toLowerCase().trim() === selectedDepartment.toLowerCase().trim());
          if (matched && matched.indicatorIds && matched.indicatorIds.length > 0) {
            assignedCodes = matched.indicatorIds;
          }
        }
      } catch (e) { }
    }

    if (assignedCodes.length === 0) {
      const fallbackDeptMap: Record<string, string[]> = {
        'Tổ Khai thác (TTĐHKT)': ["GRI 302-1", "GRI 302-4", "GRI 305-1", "GRI 305-4", "GRI 305-5", "GRI 305-7"],
        'Ban An toàn chất lượng (Ban ATCL)': ["Airline E-1", "9", "GRI 403-2"],
        'Tổ Kỹ thuật (Ban QLVT)': ["4", "5", "13", "SAF"],
        'Trung tâm Bông Sen Vàng (TTBSV)': ["Airline B-2"],
        'Ban Chuyển đổi số & CNTT': ["GRI 418-1"],
        'Tổ Dịch vụ': ["GRI 303-3", "GRI 303-5", "Airline B-1", "GRI 204-1", "GRI 406-1", "GRI 416-1", "GRI 416-2", "GRI 417-2"],
        'Ban Tổ chức Nhân lực': ["Airline D-1", "Airline F-2", "GRI 202-1", "GRI 202-2", "GRI 403-9", "GRI 401-1", "GRI 401-2"],
        'Ban Kế hoạch Phát triển': ["GRI 2-9", "GRI 2-15", "GRI 2-23", "GRI 205-2", "GRI 205-3", "GRI 206-1", "GRI 415-1"],
        'Ban Truyền thông': ["Airline F-1", "GRI 417-3"],
      };
      assignedCodes = fallbackDeptMap[selectedDepartment] || [];
    }

    let list = allIndicators;
    if (!isAdmin || selectedDepartment) {
      list = allIndicators.filter((ind: any) => {
        if (assignedCodes.includes(ind.code) || assignedCodes.includes(ind.id)) return true;
        if (ind.department && ind.department.toLowerCase().includes(selectedDepartment.toLowerCase())) return true;
        if (ind.inputDept && ind.inputDept.toLowerCase().includes(selectedDepartment.toLowerCase())) return true;
        return false;
      });
      if (list.length === 0 && assignedCodes.length > 0) {
        list = allIndicators.filter((ind: any) => assignedCodes.includes(ind.code) || assignedCodes.includes(ind.id));
      }
      if (list.length === 0) {
        list = allIndicators.slice(0, 10);
      }
    }

    return list;
  }, [allIndicators, selectedDepartment, isAdmin]);

  // Filtered indicators based on search and UI filters
  const filteredIndicators = useMemo(() => {
    return userAssignedIndicators.filter((ind: any) => {
      const codeMatch = ind.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const nameMatch = ind.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchText = !searchTerm || codeMatch || nameMatch;

      const matchPillar = pillarFilter === 'ALL' || ind.pillar === pillarFilter;
      const matchFreq = frequencyFilter === 'ALL' || ind.frequency === frequencyFilter;

      return matchText && matchPillar && matchFreq;
    });
  }, [userAssignedIndicators, searchTerm, pillarFilter, frequencyFilter]);

  const handleOpenEntry = (indicator: any) => {
    setSelectedIndicator(indicator);
    const defaultPeriod = indicator.frequency === 'Hàng năm' ? 'Năm 2026' : 'Tháng 02/2026';
    setSelectedPeriod(defaultPeriod);
    setViewMode('ENTRY');
  };

  const handleSaveEntry = (_period?: string) => {
    alert(currentLang === 'vi' ? 'Đã lưu dữ liệu chỉ tiêu thành công!' : 'Indicator data saved successfully!');
    setViewMode('LIST');
  };

  if (viewMode === 'ENTRY' && selectedIndicator) {
    return (
      <div className="animate-in fade-in duration-200">
        <UnifiedDataEntryForm
          department={selectedIndicator.department || selectedDepartment}
          targetIndicatorCode={selectedIndicator.code}
          hideSidebar={true}
          effectivePeriod={selectedPeriod}
          onBack={() => setViewMode('LIST')}
          onSave={handleSaveEntry}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-12">
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={currentLang === 'vi' ? "Tìm theo mã chỉ tiêu, tên chỉ tiêu..." : "Search by indicator code, name..."}
              className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-vna-blue focus:bg-white transition-colors"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={pillarFilter}
              onChange={e => setPillarFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-50/50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-vna-blue focus:bg-white cursor-pointer"
            >
              <option value="ALL">{currentLang === 'vi' ? 'Tất cả trụ cột ESG' : 'All ESG Pillars'}</option>
              <option value="Environment">Môi trường (Environment)</option>
              <option value="Social">Xã hội (Social)</option>
              <option value="Governance">Quản trị (Governance)</option>
            </select>
          </div>

          {/* <div className="sm:col-span-3">
            <select
              value={frequencyFilter}
              onChange={e => setFrequencyFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50/50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-vna-blue focus:bg-white cursor-pointer"
            >
              <option value="ALL">{currentLang === 'vi' ? 'Tất cả tần suất' : 'All Frequencies'}</option>
              <option value="Hàng tháng">{currentLang === 'vi' ? 'Hàng tháng' : 'Monthly'}</option>
              <option value="Hàng quý">{currentLang === 'vi' ? 'Hàng quý' : 'Quarterly'}</option>
              <option value="Hàng năm">{currentLang === 'vi' ? 'Hàng năm' : 'Annual'}</option>
            </select>
          </div> */}
        </div>
      </div>

      {/* Indicator Card List */}
      <div className="space-y-3">
        {filteredIndicators.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
            <FolderOpen className="mx-auto text-gray-300 mb-3" size={48} />
            <h3 className="text-sm font-bold text-gray-700">
              {currentLang === 'vi' ? 'Không tìm thấy chỉ tiêu phù hợp' : 'No indicators found'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {currentLang === 'vi' ? 'Vui lòng thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Please adjust your search keywords or filter criteria'}
            </p>
          </div>
        ) : (
          filteredIndicators.map((ind: any) => {
            return (
              <div
                key={ind.code || ind.id}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              >
                {/* Left: Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-black bg-slate-100 text-slate-800 border border-slate-200 rounded">
                      {ind.code}
                    </span>
                    <PillarBadge pillar={ind.pillar} />
                    {/* <span className="text-[11px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {ind.frequency || 'Hàng tháng'}
                    </span> */}
                    {/* {ind.unit && (
                      <span className="text-[11px] font-medium text-gray-500">
                        {currentLang === 'vi' ? `ĐVT: ${ind.unit}` : `Unit: ${ind.unit}`}
                      </span>
                    )} */}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 leading-snug">
                    {getLocalizedIndicatorName(ind.name, currentLang)}
                  </h3>
                </div>

                {/* Right: Action */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <Button
                    variant="primary"
                    onClick={() => handleOpenEntry(ind)}
                    className="px-4 py-2 text-xs font-bold h-9 shadow-sm hover:shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={15} />
                    {currentLang === 'vi' ? 'Chi tiết' : 'Details'}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
