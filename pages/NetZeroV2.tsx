import * as XLSX from 'xlsx';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button, Card, Input, Select, StatusChip } from '../components/UI';
import {
  TrendingUp, Leaf, Plane, DollarSign, RefreshCw, Download, Plus,
  Trash2, Edit3, Save, CheckCircle2, AlertTriangle, ShieldCheck,
  Sparkles, Layers, Sliders, BarChart3, HelpCircle, ArrowRight, X, Copy, Check,
  FileSpreadsheet, Award, Info, FileText, ArrowUpRight, Settings2, SlidersHorizontal,
  RotateCcw, TrendingDown, Database, Globe, Percent, BookmarkCheck, FolderOpen, List, History, CheckCheck,
  Calendar, ChevronLeft, ChevronRight, ChevronDown, ArrowUpDown, ArrowDown, Filter, Search
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// --- INTERFACES ---

export interface SafBatch {
  id: string;
  batchNo: string;
  deliveryDate: string;
  airportCode: string;
  airportName: string;
  destAirportCode?: string; // Sân bay đáp (Mã IATA, e.g. HAN, SGN)
  destAirportName?: string; // Tên sân bay đáp
  region: 'EU' | 'UK' | 'NON_EU';
  supplier: string;
  supplierVat: string;
  tonnes: number; // Khối lượng SAF nạp (tấn)
  lifecycleEmission: number; // gCO2eq/MJ
  co2SavedPerTonne: number; // tCO2 giảm trừ trên mỗi tấn SAF
  eligibleSchemes: ('EU_ETS' | 'UK_ETS' | 'CORSIA')[];
  assignedScheme: 'EU_ETS' | 'UK_ETS' | 'CORSIA' | 'UNASSIGNED';
  flightsCount?: number; // Số lượng chuyến bay nạp SAF
}

export const getBatchFlights = (b: SafBatch) => b.flightsCount || Math.max(1, Math.round(b.tonnes / 50));

/**
 * Tính toán CO2 giảm trừ tương ứng cho từng cơ chế:
 * - EU ETS: Giảm trừ theo hệ số phát thải ReFuelEU / EU ETS MRV (batch.co2SavedPerTonne)
 * - UK ETS: Giảm trừ theo quy chuẩn UK ETS MRV (batch.co2SavedPerTonne * 0.99)
 * - CORSIA: Giảm trừ theo tiêu chuẩn LCA ICAO CORSIA (batch.co2SavedPerTonne * 0.97)
 */
export const calculateCo2SavedByScheme = (
  tonnes: number,
  baseCo2SavedPerTonne: number,
  scheme: 'EU_ETS' | 'UK_ETS' | 'CORSIA'
) => {
  let rate = baseCo2SavedPerTonne;
  if (scheme === 'UK_ETS') {
    rate = Number((baseCo2SavedPerTonne * 0.99).toFixed(2));
  } else if (scheme === 'CORSIA') {
    rate = Number((baseCo2SavedPerTonne * 0.97).toFixed(2));
  }
  const totalSaved = Math.round(tonnes * rate);
  return {
    rate,
    totalSaved
  };
};

// Saved Scenario Interface
export interface SavedScenarioItem {
  id: string;
  name: string;
  savedAt: string;
  period: string;
  allocationMode: 'ledger' | 'manual';
  batches: SafBatch[];
  marketParams: MarketParams;
  manualConfig?: {
    totalSaf: number;
    allocEu: number;
    allocUk: number;
    allocCorsia: number;
  };
  metrics: {
    totalAllocatedSaf: number;
    co2Saved: number;
    totalCredits: number;
    totalCost: number;
    totalCostVnd?: number;
  };
}

export interface MarketParams {
  priceEuEts: number; // USD / tCO2 (Hạn ngạch EUA)
  priceUkEts: number; // USD / tCO2 (Hạn ngạch UKA quy đổi)
  priceCorsia: number; // USD / tCO2 (Tín chỉ CORSIA quy đổi)
  rateEuEts?: number; // Tỷ giá quy đổi VND (EU ETS): VND / USD
  rateUkEts?: number; // Tỷ giá quy đổi VND (UK ETS): VND / USD
  rateCorsia?: number; // Tỷ giá quy đổi VND (CORSIA): VND / USD
  obligationEuEts: number; // Phát thải CO2 năm hiện tại EU ETS (tCO2)
  obligationUkEts: number; // Phát thải CO2 năm hiện tại UK ETS (tCO2)
  obligationCorsia: number; // Phát thải CO2 năm hiện tại CORSIA (tCO2)
  freeAllowanceEuEts: number; // Hạn ngạch: Số tấn CO2 được miễn giảm (EU ETS)
  freeAllowanceUkEts: number; // Hạn ngạch: Số tấn CO2 được miễn giảm (UK ETS)
  corsiaGrowthRate: number; // Tỷ lệ tăng trưởng ngành (%): Tỷ lệ tăng phát thải so với năm baseline
  corsiaSectoralWeight: number; // Tỷ trọng Sectoral (%): Mặc định 100%
  corsiaIndividualWeight: number; // Tỷ trọng Individual (%): Mặc định 0%
  corsiaBaseline: number; // Phát thải Baseline (tCO2): Mặc định 2,254,192
}

/**
 * Hệ thống định dạng số đa ngôn ngữ:
 * - Tiếng Việt: Hàng nghìn dấu '.', số thập phân dấu ',' (vd: 1.000, 28.500, 76,5)
 * - Tiếng Anh: Hàng nghìn dấu ',', số thập phân dấu '.' (vd: 1,000, 28,500, 76.5)
 */
const getSystemLang = (): 'vi' | 'en' => {
  if (typeof window === 'undefined') return 'vi';
  return (localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi';
};

const formatNumber = (
  val: number | string | null | undefined,
  maxDecimals?: number,
  forcedLang?: 'vi' | 'en'
): string => {
  if (val === null || val === undefined || val === '') return '0';
  let num: number;
  if (typeof val === 'string') {
    const cleaned = val.replace(/\s/g, '').replace(/,/g, '.');
    num = parseFloat(cleaned);
  } else {
    num = val;
  }
  if (isNaN(num)) return '0';

  const lang = forcedLang || getSystemLang();
  const locale = lang === 'en' ? 'en-US' : 'vi-VN';

  return num.toLocaleString(locale, {
    maximumFractionDigits: maxDecimals !== undefined ? maxDecimals : 4,
  });
};

const FormattedNumberInput: React.FC<{
  value: number;
  onChange: (val: number) => void;
  className?: string;
  placeholder?: string;
  isDecimal?: boolean;
  min?: number;
  max?: number;
  lang?: 'vi' | 'en';
}> = ({ value, onChange, className = '', placeholder = '', isDecimal = false, min, max, lang }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [rawText, setRawText] = useState<string>('');
  const [activeLang, setActiveLang] = useState<'vi' | 'en'>(
    () => lang || getSystemLang()
  );

  useEffect(() => {
    if (lang) {
      setActiveLang(lang);
    } else {
      const handleLangChange = () => {
        setActiveLang(getSystemLang());
      };
      window.addEventListener('vna_language_changed', handleLangChange);
      return () => window.removeEventListener('vna_language_changed', handleLangChange);
    }
  }, [lang]);

  const displayString = useMemo(() => {
    if (value === undefined || value === null || isNaN(value)) return '';
    return formatNumber(value, isDecimal ? 4 : 0, activeLang);
  }, [value, isDecimal, activeLang]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (value !== undefined && value !== null && !isNaN(value)) {
      if (isDecimal) {
        setRawText(activeLang === 'vi' ? String(value).replace('.', ',') : String(value));
      } else {
        setRawText(String(value));
      }
    } else {
      setRawText('');
    }
    e.target.select();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    if (isDecimal) {
      if (activeLang === 'vi') {
        // Allow user to type dot from numpad, convert to comma
        val = val.replace(/\./g, ',');
        // Keep only digits and comma
        val = val.replace(/[^0-9,]/g, '');
        const parts = val.split(',');
        if (parts.length > 2) {
          val = parts[0] + ',' + parts.slice(1).join('');
        }
      } else {
        // In English mode, convert comma to dot
        val = val.replace(/,/g, '.');
        // Keep only digits and dot
        val = val.replace(/[^0-9.]/g, '');
        const parts = val.split('.');
        if (parts.length > 2) {
          val = parts[0] + '.' + parts.slice(1).join('');
        }
      }
    } else {
      val = val.replace(/\D/g, '');
    }

    setRawText(val);

    if (val === '' || val === '.' || val === ',') {
      onChange(0);
      return;
    }

    const normalizedVal = isDecimal ? val.replace(',', '.') : val;
    const num = isDecimal ? parseFloat(normalizedVal) : parseInt(normalizedVal, 10);
    if (!isNaN(num)) {
      if (min !== undefined && num < min) return;
      if (max !== undefined && num > max) return;
      onChange(num);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text');
    if (isDecimal) {
      if (activeLang === 'vi') {
        let cleaned = pasteData.trim();
        if (cleaned.includes(',') && cleaned.includes('.')) {
          cleaned = cleaned.replace(/\./g, '');
        } else if (cleaned.includes('.') && !cleaned.includes(',')) {
          cleaned = cleaned.replace(/\./g, ',');
        }
        cleaned = cleaned.replace(/[^0-9,]/g, '');
        const parts = cleaned.split(',');
        const formatted = parts.length > 2 ? parts[0] + ',' + parts.slice(1).join('') : cleaned;
        if (formatted) {
          e.preventDefault();
          setRawText(formatted);
          const num = parseFloat(formatted.replace(',', '.'));
          if (!isNaN(num)) onChange(num);
        }
      } else {
        let cleaned = pasteData.trim();
        if (cleaned.includes(',') && cleaned.includes('.')) {
          cleaned = cleaned.replace(/,/g, '');
        } else if (cleaned.includes(',') && !cleaned.includes('.')) {
          cleaned = cleaned.replace(/,/g, '.');
        }
        cleaned = cleaned.replace(/[^0-9.]/g, '');
        const parts = cleaned.split('.');
        const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
        if (formatted) {
          e.preventDefault();
          setRawText(formatted);
          const num = parseFloat(formatted);
          if (!isNaN(num)) onChange(num);
        }
      }
    } else {
      const cleaned = pasteData.replace(/\D/g, '');
      if (cleaned) {
        e.preventDefault();
        setRawText(cleaned);
        const num = parseInt(cleaned, 10);
        if (!isNaN(num)) onChange(num);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (rawText === '' || rawText === '.' || rawText === ',') {
      onChange(0);
    }
  };

  return (
    <input
      type="text"
      inputMode={isDecimal ? 'decimal' : 'numeric'}
      value={isFocused ? rawText : displayString}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onPaste={handlePaste}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
    />
  );
};

/**
 * Component YearPicker chọn năm trực quan cho Mô phỏng kịch bản
 */
const YearPicker: React.FC<{
  value: string;
  onChange: (val: string) => void;
  className?: string;
}> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trích xuất số năm từ chuỗi (vd: "Năm 2026" -> 2026)
  const numericYear = useMemo(() => {
    const match = value.match(/\d{4}/);
    return match ? parseInt(match[0], 10) : 2026;
  }, [value]);

  // Năm bắt đầu cho lưới 12 năm (chu kỳ thập kỷ)
  const [pageStartYear, setPageStartYear] = useState(() => {
    return Math.floor(numericYear / 12) * 12;
  });

  useEffect(() => {
    setPageStartYear(Math.floor(numericYear / 12) * 12);
  }, [numericYear]);

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const years = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => pageStartYear + i);
  }, [pageStartYear]);

  const handleSelectYear = (y: number) => {
    onChange(`Năm ${y}`);
    setIsOpen(false);
  };

  const handlePrevRange = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPageStartYear(prev => prev - 12);
  };

  const handleNextRange = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPageStartYear(prev => prev + 12);
  };

  const currentActualYear = 2026;

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Nút kích hoạt YearPicker */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 bg-white hover:border-vna-blue hover:text-vna-blue focus:ring-2 focus:ring-vna-blue/20 transition-all flex items-center gap-2 cursor-pointer shadow-2xs group"
      >
        <Calendar size={14} className="text-vna-blue shrink-0 group-hover:scale-110 transition-transform" />
        <span>{value || `Năm ${numericYear}`}</span>
        <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-vna-blue' : ''}`} />
      </button>

      {/* Popover chọn năm */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-50 bg-white rounded-2xl border border-gray-200 shadow-xl p-3.5 w-64 animate-in fade-in zoom-in-95 duration-150 font-sans">
          {/* Header điều hướng dải năm */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100">
            <button
              type="button"
              onClick={handlePrevRange}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="12 năm trước"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-black text-vna-navy tracking-wide">
              {pageStartYear} – {pageStartYear + 11}
            </span>
            <button
              type="button"
              onClick={handleNextRange}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="12 năm sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Lưới 12 năm */}
          <div className="grid grid-cols-3 gap-1.5">
            {years.map(y => {
              const isSelected = y === numericYear;
              const isCurrent = y === currentActualYear;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => handleSelectYear(y)}
                  className={`py-2 px-1 text-xs rounded-xl font-bold transition-all cursor-pointer text-center relative ${isSelected
                    ? 'bg-vna-blue text-white shadow-xs font-black'
                    : isCurrent
                      ? 'bg-blue-50/70 text-vna-blue border border-blue-200 hover:bg-blue-100'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-vna-navy'
                    }`}
                >
                  {y}
                  {isCurrent && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-vna-blue"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer phím tắt */}
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => handleSelectYear(currentActualYear)}
              className="text-vna-blue font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              Năm hiện tại ({currentActualYear})
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 font-semibold cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

    </div>
  );
};


// Initial Mock Batches
const INITIAL_BATCHES: SafBatch[] = [
  {
    id: 'b-1',
    batchNo: 'SAF-2026-EU-01',
    deliveryDate: '12/01/2026',
    flightsCount: 25,
    airportCode: 'CDG',
    airportName: 'Paris Charles de Gaulle (Pháp)',
    destAirportCode: 'HAN',
    destAirportName: 'Hà Nội (Nội Bài)',
    region: 'EU',
    supplier: 'TotalEnergies Aviation',
    supplierVat: 'FR84542051580',
    tonnes: 1250,
    lifecycleEmission: 16.2,
    co2SavedPerTonne: 2.62,
    eligibleSchemes: ['EU_ETS', 'CORSIA'],
    assignedScheme: 'EU_ETS'
  },
  {
    id: 'b-2',
    batchNo: 'SAF-2026-EU-02',
    deliveryDate: '28/01/2026',
    flightsCount: 20,
    airportCode: 'FRA',
    airportName: 'Frankfurt Airport (Đức)',
    destAirportCode: 'HAN',
    destAirportName: 'Hà Nội (Nội Bài)',
    region: 'EU',
    supplier: 'Neste Oil Netherlands B.V.',
    supplierVat: 'NL814125881B01',
    tonnes: 980,
    lifecycleEmission: 15.8,
    co2SavedPerTonne: 2.64,
    eligibleSchemes: ['EU_ETS', 'CORSIA'],
    assignedScheme: 'EU_ETS'
  },
  {
    id: 'b-3',
    batchNo: 'SAF-2026-UK-01',
    deliveryDate: '15/02/2026',
    flightsCount: 17,
    airportCode: 'LHR',
    airportName: 'London Heathrow (Anh)',
    destAirportCode: 'HAN',
    destAirportName: 'Hà Nội (Nội Bài)',
    region: 'UK',
    supplier: 'Shell Aviation UK',
    supplierVat: 'GB235763255',
    tonnes: 850,
    lifecycleEmission: 17.5,
    co2SavedPerTonne: 2.58,
    eligibleSchemes: ['UK_ETS', 'CORSIA'],
    assignedScheme: 'UK_ETS'
  },
  {
    id: 'b-4',
    batchNo: 'SAF-2026-ASIA-01',
    deliveryDate: '02/03/2026',
    flightsCount: 30,
    airportCode: 'SIN',
    airportName: 'Singapore Changi (Singapore)',
    destAirportCode: 'SGN',
    destAirportName: 'TP. Hồ Chí Minh (Tân Sơn Nhất)',
    region: 'NON_EU',
    supplier: 'Neste Singapore Pte Ltd',
    supplierVat: 'SG200718921R',
    tonnes: 1500,
    lifecycleEmission: 18.0,
    co2SavedPerTonne: 2.55,
    eligibleSchemes: ['CORSIA'],
    assignedScheme: 'CORSIA'
  },
  {
    id: 'b-5',
    batchNo: 'SAF-2026-ASIA-02',
    deliveryDate: '18/03/2026',
    flightsCount: 22,
    airportCode: 'NRT',
    airportName: 'Tokyo Narita (Nhật Bản)',
    destAirportCode: 'SGN',
    destAirportName: 'TP. Hồ Chí Minh (Tân Sơn Nhất)',
    region: 'NON_EU',
    supplier: 'Cosmo Oil Marketing Co.',
    supplierVat: 'JP9010001034458',
    tonnes: 1100,
    lifecycleEmission: 16.9,
    co2SavedPerTonne: 2.60,
    eligibleSchemes: ['CORSIA'],
    assignedScheme: 'CORSIA'
  },
  {
    id: 'b-6',
    batchNo: 'SAF-2026-EU-03',
    deliveryDate: '25/03/2026',
    flightsCount: 15,
    airportCode: 'CDG',
    airportName: 'Paris Charles de Gaulle (Pháp)',
    destAirportCode: 'SGN',
    destAirportName: 'TP. Hồ Chí Minh (Tân Sơn Nhất)',
    region: 'EU',
    supplier: 'Air BP France',
    supplierVat: 'FR32542034988',
    tonnes: 720,
    lifecycleEmission: 17.1,
    co2SavedPerTonne: 2.59,
    eligibleSchemes: ['EU_ETS', 'CORSIA'],
    assignedScheme: 'EU_ETS'
  },
  {
    id: 'b-7',
    batchNo: 'SAF-2026-EU-04',
    deliveryDate: '10/04/2026',
    flightsCount: 17,
    airportCode: 'FRA',
    airportName: 'Frankfurt Airport (Đức)',
    destAirportCode: 'SGN',
    destAirportName: 'TP. Hồ Chí Minh (Tân Sơn Nhất)',
    region: 'EU',
    supplier: 'TotalEnergies Aviation',
    supplierVat: 'FR84542051580',
    tonnes: 850,
    lifecycleEmission: 16.0,
    co2SavedPerTonne: 2.63,
    eligibleSchemes: ['EU_ETS', 'CORSIA'],
    assignedScheme: 'EU_ETS'
  },
  {
    id: 'b-8',
    batchNo: 'SAF-2026-UK-02',
    deliveryDate: '22/04/2026',
    flightsCount: 12,
    airportCode: 'LHR',
    airportName: 'London Heathrow (Anh)',
    destAirportCode: 'SGN',
    destAirportName: 'TP. Hồ Chí Minh (Tân Sơn Nhất)',
    region: 'UK',
    supplier: 'Shell Aviation UK',
    supplierVat: 'GB235763255',
    tonnes: 600,
    lifecycleEmission: 17.0,
    co2SavedPerTonne: 2.60,
    eligibleSchemes: ['UK_ETS', 'CORSIA'],
    assignedScheme: 'UK_ETS'
  }
];

// Kho dữ liệu lô SAF có sẵn (SAF Inventory Repository)
const SAF_WAREHOUSE_REPOSITORY = [
  {
    batchNo: 'SAF-2026-EU-01',
    deliveryDate: '2026-01-12',
    airportCode: 'CDG',
    airportName: 'Paris Charles de Gaulle (Pháp)',
    destAirportCode: 'HAN',
    destAirportName: 'Hà Nội (Nội Bài)',
    region: 'EU' as const,
    supplier: 'TotalEnergies Aviation',
    supplierVat: 'FR84542051580',
    tonnes: 1250,
    lifecycleEmission: 16.2,
    co2SavedPerTonne: 2.62,
    eligibleSchemes: ['EU_ETS', 'CORSIA'] as ('EU_ETS' | 'UK_ETS' | 'CORSIA')[],
    assignedScheme: 'EU_ETS' as const
  },
  {
    batchNo: 'SAF-2026-EU-02',
    deliveryDate: '2026-01-28',
    airportCode: 'FRA',
    airportName: 'Frankfurt Airport (Đức)',
    destAirportCode: 'HAN',
    destAirportName: 'Hà Nội (Nội Bài)',
    region: 'EU' as const,
    supplier: 'Neste Oil Netherlands B.V.',
    supplierVat: 'NL814125881B01',
    tonnes: 980,
    lifecycleEmission: 15.8,
    co2SavedPerTonne: 2.64,
    eligibleSchemes: ['EU_ETS', 'CORSIA'] as ('EU_ETS' | 'UK_ETS' | 'CORSIA')[],
    assignedScheme: 'EU_ETS' as const
  },
  {
    batchNo: 'SAF-2026-EU-03',
    deliveryDate: '2026-03-25',
    airportCode: 'CDG',
    airportName: 'Paris Charles de Gaulle (Pháp)',
    destAirportCode: 'SGN',
    destAirportName: 'TP. Hồ Chí Minh (Tân Sơn Nhất)',
    region: 'EU' as const,
    supplier: 'Air BP France',
    supplierVat: 'FR32542034988',
    tonnes: 720,
    lifecycleEmission: 17.1,
    co2SavedPerTonne: 2.59,
    eligibleSchemes: ['EU_ETS', 'CORSIA'] as ('EU_ETS' | 'UK_ETS' | 'CORSIA')[],
    assignedScheme: 'EU_ETS' as const
  },
  {
    batchNo: 'SAF-2026-EU-04',
    deliveryDate: '2026-04-10',
    airportCode: 'FRA',
    airportName: 'Frankfurt Airport (Đức)',
    destAirportCode: 'SGN',
    destAirportName: 'TP. Hồ Chí Minh (Tân Sơn Nhất)',
    region: 'EU' as const,
    supplier: 'TotalEnergies Aviation',
    supplierVat: 'FR84542051580',
    tonnes: 850,
    lifecycleEmission: 16.0,
    co2SavedPerTonne: 2.63,
    eligibleSchemes: ['EU_ETS', 'CORSIA'] as ('EU_ETS' | 'UK_ETS' | 'CORSIA')[],
    assignedScheme: 'EU_ETS' as const
  },
  {
    batchNo: 'SAF-2026-UK-01',
    deliveryDate: '2026-02-15',
    airportCode: 'LHR',
    airportName: 'London Heathrow (Anh)',
    destAirportCode: 'HAN',
    destAirportName: 'Hà Nội (Nội Bài)',
    region: 'UK' as const,
    supplier: 'Shell Aviation UK',
    supplierVat: 'GB235763255',
    tonnes: 850,
    lifecycleEmission: 17.5,
    co2SavedPerTonne: 2.58,
    eligibleSchemes: ['UK_ETS', 'CORSIA'] as ('EU_ETS' | 'UK_ETS' | 'CORSIA')[],
    assignedScheme: 'UK_ETS' as const
  },
  {
    batchNo: 'SAF-2026-UK-02',
    deliveryDate: '2026-05-18',
    airportCode: 'LHR',
    airportName: 'London Heathrow (Anh)',
    destAirportCode: 'SGN',
    destAirportName: 'TP. Hồ Chí Minh (Tân Sơn Nhất)',
    region: 'UK' as const,
    supplier: 'Shell Aviation UK',
    supplierVat: 'GB235763255',
    tonnes: 600,
    lifecycleEmission: 17.0,
    co2SavedPerTonne: 2.60,
    eligibleSchemes: ['UK_ETS', 'CORSIA'] as ('EU_ETS' | 'UK_ETS' | 'CORSIA')[],
    assignedScheme: 'UK_ETS' as const
  },
  {
    batchNo: 'SAF-2026-ASIA-01',
    deliveryDate: '2026-03-02',
    airportCode: 'SIN',
    airportName: 'Singapore Changi (Singapore)',
    destAirportCode: 'SGN',
    destAirportName: 'TP. Hồ Chí Minh (Tân Sơn Nhất)',
    region: 'NON_EU' as const,
    supplier: 'Neste Singapore Pte Ltd',
    supplierVat: 'SG200718921R',
    tonnes: 1500,
    lifecycleEmission: 18.0,
    co2SavedPerTonne: 2.55,
    eligibleSchemes: ['CORSIA'] as ('EU_ETS' | 'UK_ETS' | 'CORSIA')[],
    assignedScheme: 'CORSIA' as const
  },
  {
    batchNo: 'SAF-2026-ASIA-02',
    deliveryDate: '2026-03-18',
    airportCode: 'NRT',
    airportName: 'Tokyo Narita (Nhật Bản)',
    destAirportCode: 'SGN',
    destAirportName: 'TP. Hồ Chí Minh (Tân Sơn Nhất)',
    region: 'NON_EU' as const,
    supplier: 'Cosmo Oil Marketing Co.',
    supplierVat: 'JP9010001034458',
    tonnes: 1100,
    lifecycleEmission: 16.9,
    co2SavedPerTonne: 2.60,
    eligibleSchemes: ['CORSIA'] as ('EU_ETS' | 'UK_ETS' | 'CORSIA')[],
    assignedScheme: 'CORSIA' as const
  },
  {
    batchNo: 'SAF-2026-ASIA-03',
    deliveryDate: '2026-06-22',
    airportCode: 'SIN',
    airportName: 'Singapore Changi (Singapore)',
    destAirportCode: 'HAN',
    destAirportName: 'Hà Nội (Nội Bài)',
    region: 'NON_EU' as const,
    supplier: 'Neste Singapore Pte Ltd',
    supplierVat: 'SG200718921R',
    tonnes: 900,
    lifecycleEmission: 17.8,
    co2SavedPerTonne: 2.56,
    eligibleSchemes: ['CORSIA'] as ('EU_ETS' | 'UK_ETS' | 'CORSIA')[],
    assignedScheme: 'CORSIA' as const
  }
];

const DEFAULT_MARKET_PARAMS: MarketParams = {
  priceEuEts: 76.5, // 76.5 USD / tCO2
  priceUkEts: 58.0, // 58.0 USD / tCO2
  priceCorsia: 22.5, // 22.5 USD / tCO2
  rateEuEts: 25450, // 25,450 VND / USD
  rateUkEts: 25450, // 25,450 VND / USD
  rateCorsia: 25450, // 25,450 VND / USD
  obligationEuEts: 28500, // Phát thải năm hiện tại EU ETS (tCO2)
  obligationUkEts: 9200,  // Phát thải năm hiện tại UK ETS (tCO2)
  obligationCorsia: 48000, // Phát thải năm hiện tại CORSIA (tCO2)
  freeAllowanceEuEts: 5200, // Hạn ngạch miễn giảm EU ETS: 5,200 tCO2
  freeAllowanceUkEts: 1100, // Hạn ngạch miễn giảm UK ETS: 1,100 tCO2
  corsiaGrowthRate: 20.0, // Tỷ lệ tăng trưởng ngành CORSIA: 20.0%
  corsiaSectoralWeight: 100.0, // Tỷ trọng Sectoral: Mặc định 100%
  corsiaIndividualWeight: 0.0, // Tỷ trọng Individual: Mặc định 0%
  corsiaBaseline: 2254192 // Phát thải Baseline: Mặc định 2,254,192 tCO2
};

export const NetZeroV2Page: React.FC = () => {
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

  const locale = currentLang === 'en' ? 'en-US' : 'vi-VN';

  // Main state
  const [reportPeriod, setReportPeriod] = useState<string>('Năm 2026');
  const [marketParams, setMarketParams] = useState<MarketParams>(() => {
    const saved = localStorage.getItem('vna_netzero_v2_market');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_MARKET_PARAMS,
          ...parsed,
          rateEuEts: parsed.rateEuEts ?? DEFAULT_MARKET_PARAMS.rateEuEts,
          rateUkEts: parsed.rateUkEts ?? DEFAULT_MARKET_PARAMS.rateUkEts,
          rateCorsia: parsed.rateCorsia ?? DEFAULT_MARKET_PARAMS.rateCorsia
        };
      } catch (e) { }
    }
    return DEFAULT_MARKET_PARAMS;
  });

  // Filters & Sorting for SAF Batch table
  const [batchFilterCode, setBatchFilterCode] = useState<string>('');
  const [batchFilterOrigin, setBatchFilterOrigin] = useState<string>('ALL');
  const [batchFilterDest, setBatchFilterDest] = useState<string>('ALL');
  const [batchSortField, setBatchSortField] = useState<'batchNo' | 'airportCode' | 'destAirportCode' | null>(null);
  const [batchSortOrder, setBatchSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleToggleSort = (field: 'batchNo' | 'airportCode' | 'destAirportCode') => {
    if (batchSortField === field) {
      if (batchSortOrder === 'asc') {
        setBatchSortOrder('desc');
      } else {
        setBatchSortField(null);
        setBatchSortOrder('asc');
      }
    } else {
      setBatchSortField(field);
      setBatchSortOrder('asc');
    }
  };

  const handleResetBatchFilters = () => {
    setBatchFilterCode('');
    setBatchFilterOrigin('ALL');
    setBatchFilterDest('ALL');
    setBatchSortField(null);
    setBatchSortOrder('asc');
  };

  const [batches, setBatches] = useState<SafBatch[]>(() => {
    const saved = localStorage.getItem('vna_netzero_v2_batches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((b: any) => ({
            ...b,
            destAirportCode: b.destAirportCode || (b.airportCode === 'SIN' || b.airportCode === 'NRT' ? 'SGN' : 'HAN'),
            destAirportName: b.destAirportName || (b.destAirportCode === 'SGN' ? 'TP. Hồ Chí Minh (Tân Sơn Nhất)' : 'Hà Nội (Nội Bài)')
          }));
        }
      } catch (e) { }
    }
    return INITIAL_BATCHES;
  });

  const originAirportOptions = useMemo(() => {
    return Array.from(new Set(batches.map((b) => b.airportCode))).sort();
  }, [batches]);

  const destAirportOptions = useMemo(() => {
    return Array.from(new Set(batches.map((b) => b.destAirportCode || 'HAN'))).sort();
  }, [batches]);

  const processedBatches = useMemo(() => {
    let list = batches.filter(
      (batch) => batch.eligibleSchemes && batch.eligibleSchemes.length >= 1
    );

    // Filter by Batch No
    if (batchFilterCode.trim()) {
      const q = batchFilterCode.trim().toLowerCase();
      list = list.filter((b) => b.batchNo.toLowerCase().includes(q));
    }

    // Filter by Departure Airport
    if (batchFilterOrigin !== 'ALL') {
      list = list.filter((b) => b.airportCode === batchFilterOrigin);
    }

    // Filter by Arrival Airport
    if (batchFilterDest !== 'ALL') {
      list = list.filter((b) => (b.destAirportCode || 'HAN') === batchFilterDest);
    }

    // Sort
    if (batchSortField) {
      list = [...list].sort((a, b) => {
        let valA = '';
        let valB = '';
        if (batchSortField === 'batchNo') {
          valA = a.batchNo;
          valB = b.batchNo;
        } else if (batchSortField === 'airportCode') {
          valA = a.airportCode;
          valB = b.airportCode;
        } else if (batchSortField === 'destAirportCode') {
          valA = a.destAirportCode || 'HAN';
          valB = b.destAirportCode || 'HAN';
        }

        const cmp = valA.localeCompare(valB);
        return batchSortOrder === 'asc' ? cmp : -cmp;
      });
    }

    return list;
  }, [batches, batchFilterCode, batchFilterOrigin, batchFilterDest, batchSortField, batchSortOrder]);


  // Sync Data State & Handler
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const handleSyncData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setBatches(INITIAL_BATCHES);
      localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(INITIAL_BATCHES));
      setSyncToast(
        currentLang === 'vi'
          ? 'Đồng bộ dữ liệu thành công từ Hệ thống Điều hành Bay & Sổ cái SAF Ledger!'
          : 'Data synchronized successfully from Flight Operations & SAF Ledger!'
      );
      setTimeout(() => {
        setSyncToast(null);
      }, 3500);
    }, 750);
  };

  // Saved Scenarios State & Modal
  const [isScenarioListModalOpen, setIsScenarioListModalOpen] = useState(false);
  const [scenarioNameInput, setScenarioNameInput] = useState('');
  const [isSaveNameModalOpen, setIsSaveNameModalOpen] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenarioItem[]>(() => {
    const saved = localStorage.getItem('vna_saved_scenarios_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'sc-1',
        name: 'Kịch bản Cơ sở 2026 (Ưu tiên EU ETS)',
        savedAt: '05/09/2026 09:30',
        period: 'Năm 2026',
        allocationMode: 'ledger',
        batches: INITIAL_BATCHES,
        marketParams: DEFAULT_MARKET_PARAMS,
        metrics: {
          totalAllocatedSaf: 6400,
          co2Saved: 16605,
          totalCredits: 69095,
          totalCost: 3101699,
          totalCostVnd: 78938239550
        }
      },
      {
        id: 'sc-2',
        name: 'Kịch bản Giá Carbon Cao (Stress test +30%)',
        savedAt: '06/09/2026 14:15',
        period: 'Năm 2026',
        allocationMode: 'ledger',
        batches: INITIAL_BATCHES,
        marketParams: {
          ...DEFAULT_MARKET_PARAMS,
          priceEuEts: 99.5,
          priceUkEts: 75.0,
          priceCorsia: 32.0
        },
        metrics: {
          totalAllocatedSaf: 6400,
          co2Saved: 16605,
          totalCredits: 69095,
          totalCost: 3914500,
          totalCostVnd: 99624025000
        }
      },
      {
        id: 'sc-3',
        name: 'Kịch bản Tự nguyện Phân bổ SAF 8,000T (Manual)',
        savedAt: '07/09/2026 11:00',
        period: 'Năm 2026',
        allocationMode: 'manual',
        batches: INITIAL_BATCHES,
        marketParams: DEFAULT_MARKET_PARAMS,
        manualConfig: {
          totalSaf: 8000,
          allocEu: 4500,
          allocUk: 1500,
          allocCorsia: 2000
        },
        metrics: {
          totalAllocatedSaf: 8000,
          co2Saved: 20760,
          totalCredits: 64940,
          totalCost: 2680450,
          totalCostVnd: 68217452500
        }
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<'allocation' | 'comparison' | 'verifier'>('allocation');
  const [allocationMode, setAllocationMode] = useState<'ledger' | 'manual'>('ledger');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  // Selected scenario IDs to compare (defaults to all saved scenarios)
  const [selectedScenarioIdsForCompare, setSelectedScenarioIdsForCompare] = useState<string[]>(['CURRENT', 'sc-1', 'sc-2', 'sc-3']);
  const [isSelectScenariosPickerOpen, setIsSelectScenariosPickerOpen] = useState(false);
  const [tempSelectedScenarioIds, setTempSelectedScenarioIds] = useState<string[]>(['CURRENT', 'sc-1', 'sc-2', 'sc-3']);
  const [searchScenarioQuery, setSearchScenarioQuery] = useState('');


  const [manualSafTonnes, setManualSafTonnes] = useState<number>(5000);
  const [manualAllocEu, setManualAllocEu] = useState<number>(3200);
  const [manualAllocUk, setManualAllocUk] = useState<number>(1000);
  const [manualAllocCorsia, setManualAllocCorsia] = useState<number>(800);

  const handleAutoOptimizeManual = () => {
    let rem = manualSafTonnes;
    const euTarget = Math.min(rem, Math.ceil(marketParams.obligationEuEts / 2.62));
    rem -= euTarget;
    const ukTarget = Math.min(rem, Math.ceil(marketParams.obligationUkEts / 2.58));
    rem -= ukTarget;
    const corsiaTarget = rem;
    setManualAllocEu(euTarget);
    setManualAllocUk(ukTarget);
    setManualAllocCorsia(corsiaTarget);
  };
  const [saveToast, setSaveToast] = useState(false);
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [isAdjustParamsDrawerOpen, setIsAdjustParamsDrawerOpen] = useState(true);

  // New Batch Form State
  const [newBatch, setNewBatch] = useState<Partial<SafBatch>>({
    batchNo: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    airportCode: '',
    airportName: '',
    destAirportCode: '',
    destAirportName: '',
    region: 'EU',
    supplier: '',
    supplierVat: '',
    tonnes: 0,
    lifecycleEmission: 16.5,
    co2SavedPerTonne: 0,
    eligibleSchemes: ['EU_ETS', 'CORSIA'],
    assignedScheme: 'EU_ETS'
  });

  // Calculate allocation metrics for a specific assignment state
  const calculateMetricsForBatches = (batchList: SafBatch[], params: MarketParams) => {
    let safEuTonnes = 0;
    let safUkTonnes = 0;
    let safCorsiaTonnes = 0;

    let co2EuSaved = 0;
    let co2UkSaved = 0;
    let co2CorsiaSaved = 0;

    batchList.forEach(b => {
      let rate = b.co2SavedPerTonne;
      if (b.assignedScheme === 'UK_ETS') rate = Number((b.co2SavedPerTonne * 0.99).toFixed(2));
      else if (b.assignedScheme === 'CORSIA') rate = Number((b.co2SavedPerTonne * 0.97).toFixed(2));
      const co2 = Math.round(b.tonnes * rate);

      if (b.assignedScheme === 'EU_ETS') {
        safEuTonnes += b.tonnes;
        co2EuSaved += co2;
      } else if (b.assignedScheme === 'UK_ETS') {
        safUkTonnes += b.tonnes;
        co2UkSaved += co2;
      } else if (b.assignedScheme === 'CORSIA') {
        safCorsiaTonnes += b.tonnes;
        co2CorsiaSaved += co2;
      }
    });

    // Hạn ngạch miễn giảm: EU ETS & UK ETS
    const freeEu = params.freeAllowanceEuEts ?? 5200;
    const freeUk = params.freeAllowanceUkEts ?? 1100;

    // Nghĩa vụ CORSIA: Tổng phát thải CO2 cần đền bù
    // Công thức: (Phát thải CO2 năm hiện tại * Tỷ tăng trưởng ngành) * Tỷ trọng Sectoral + (Phát thải CO2 năm hiện tại - Baseline) * Tỷ trọng individual
    const growthRate = (params.corsiaGrowthRate ?? 20.0) / 100;
    const sectoralWeight = (params.corsiaSectoralWeight ?? 100.0) / 100;
    const individualWeight = (params.corsiaIndividualWeight ?? 0.0) / 100;
    const baseline = params.corsiaBaseline ?? 2254192;

    const sectoralComponent = (params.obligationCorsia * growthRate) * sectoralWeight;
    const individualComponent = Math.max(0, params.obligationCorsia - baseline) * individualWeight;
    const corsiaTotalObligation = Math.max(0, Math.round(sectoralComponent + individualComponent));

    // Lượng CO2 còn lại phải mua tín chỉ sau khi trừ hạn ngạch miễn giảm và lượng giảm từ SAF (1 tCO2 = 1 Tín chỉ)
    const residualEuCo2 = Math.max(0, params.obligationEuEts - freeEu - co2EuSaved);
    const residualUkCo2 = Math.max(0, params.obligationUkEts - freeUk - co2UkSaved);
    const residualCorsiaCo2 = Math.max(0, corsiaTotalObligation - co2CorsiaSaved);

    const rateEu = params.rateEuEts ?? 25450;
    const rateUk = params.rateUkEts ?? 25450;
    const rateCorsia = params.rateCorsia ?? 25450;

    const costEu = Math.round(residualEuCo2 * params.priceEuEts);
    const costUk = Math.round(residualUkCo2 * params.priceUkEts);
    const costCorsia = Math.round(residualCorsiaCo2 * params.priceCorsia);
    const totalCost = costEu + costUk + costCorsia;

    const costEuVnd = Math.round(costEu * rateEu);
    const costUkVnd = Math.round(costUk * rateUk);
    const costCorsiaVnd = Math.round(costCorsia * rateCorsia);
    const totalCostVnd = costEuVnd + costUkVnd + costCorsiaVnd;

    // Gross Cost without SAF (chi phí khi chưa nạp SAF)
    const grossCostEu = Math.round(Math.max(0, params.obligationEuEts - freeEu) * params.priceEuEts);
    const grossCostUk = Math.round(Math.max(0, params.obligationUkEts - freeUk) * params.priceUkEts);
    const grossCostCorsia = Math.round(corsiaTotalObligation * params.priceCorsia);
    const grossCost = grossCostEu + grossCostUk + grossCostCorsia;

    const grossCostVnd = Math.round(grossCostEu * rateEu + grossCostUk * rateUk + grossCostCorsia * rateCorsia);
    const totalSavedVsGross = grossCost - totalCost;
    const totalSavedVsGrossVnd = grossCostVnd - totalCostVnd;

    return {
      safEuTonnes,
      safUkTonnes,
      safCorsiaTonnes,
      co2EuSaved,
      co2UkSaved,
      co2CorsiaSaved,
      residualEuCo2,
      residualUkCo2,
      residualCorsiaCo2,
      costEu,
      costUk,
      costCorsia,
      costEuVnd,
      costUkVnd,
      costCorsiaVnd,
      totalCost,
      totalCostVnd,
      grossCost,
      grossCostVnd,
      totalSavedVsGross,
      totalSavedVsGrossVnd,
      freeEu,
      freeUk,
      corsiaObligationFromGrowth: corsiaTotalObligation,
      corsiaTotalObligation
    };
  };

  // Effective batches for calculation based on allocation mode (Ledger vs Manual)
  const activeBatches = useMemo(() => {
    if (allocationMode === 'ledger') {
      return batches;
    }
    const list: SafBatch[] = [];
    if (manualAllocEu > 0) {
      list.push({
        id: 'manual-eu',
        batchNo: 'SAF-MANUAL-EU',
        deliveryDate: '2026',
        airportCode: 'EU',
        airportName: 'Các cảng hàng không EU (ReFuelEU)',
        region: 'EU',
        supplier: 'Nhập tay (Manual Input)',
        supplierVat: 'VNA-SAF-EU',
        tonnes: manualAllocEu,
        lifecycleEmission: 16.0,
        co2SavedPerTonne: 2.62,
        eligibleSchemes: ['EU_ETS'],
        assignedScheme: 'EU_ETS'
      });
    }
    if (manualAllocUk > 0) {
      list.push({
        id: 'manual-uk',
        batchNo: 'SAF-MANUAL-UK',
        deliveryDate: '2026',
        airportCode: 'UK',
        airportName: 'Các cảng hàng không UK',
        region: 'UK',
        supplier: 'Nhập tay (Manual Input)',
        supplierVat: 'VNA-SAF-UK',
        tonnes: manualAllocUk,
        lifecycleEmission: 17.0,
        co2SavedPerTonne: 2.58,
        eligibleSchemes: ['UK_ETS'],
        assignedScheme: 'UK_ETS'
      });
    }
    if (manualAllocCorsia > 0) {
      list.push({
        id: 'manual-corsia',
        batchNo: 'SAF-MANUAL-CORSIA',
        deliveryDate: '2026',
        airportCode: 'CORSIA',
        airportName: 'Các chặng bay quốc tế CORSIA',
        region: 'NON_EU',
        supplier: 'Nhập tay (Manual Input)',
        supplierVat: 'VNA-SAF-CORSIA',
        tonnes: manualAllocCorsia,
        lifecycleEmission: 18.0,
        co2SavedPerTonne: 2.55,
        eligibleSchemes: ['CORSIA'],
        assignedScheme: 'CORSIA'
      });
    }
    return list;
  }, [allocationMode, batches, manualAllocEu, manualAllocUk, manualAllocCorsia]);

  // Current user's allocation metrics
  const currentMetrics = useMemo(() => {
    return calculateMetricsForBatches(activeBatches, marketParams);
  }, [activeBatches, marketParams]);

  // Executive KPI Metrics (3 Cards at the bottom of the page)
  const executiveKpiMetrics = useMemo(() => {
    const totalAllocatedSaf = currentMetrics.safEuTonnes + currentMetrics.safUkTonnes + currentMetrics.safCorsiaTonnes;
    const safCostPerTonne = 2450;
    const jetA1CostPerTonne = 850;

    const rateEu = marketParams.rateEuEts ?? 25450;
    const rateUk = marketParams.rateUkEts ?? 25450;
    const rateCorsia = marketParams.rateCorsia ?? 25450;
    const defaultRate = 25450;

    const safCostEu = currentMetrics.safEuTonnes * safCostPerTonne;
    const safCostEuVnd = Math.round(safCostEu * rateEu);

    const safCostUk = currentMetrics.safUkTonnes * safCostPerTonne;
    const safCostUkVnd = Math.round(safCostUk * rateUk);

    const safCostCorsia = currentMetrics.safCorsiaTonnes * safCostPerTonne;
    const safCostCorsiaVnd = Math.round(safCostCorsia * rateCorsia);

    const safCost = safCostEu + safCostUk + safCostCorsia;
    const safCostVnd = safCostEuVnd + safCostUkVnd + safCostCorsiaVnd;

    const totalCreditCost = currentMetrics.totalCost;
    const totalCreditCostVnd = currentMetrics.totalCostVnd;

    const totalScenarioCost = safCost + totalCreditCost;
    const totalScenarioCostVnd = safCostVnd + totalCreditCostVnd;

    const totalGrossEmission = marketParams.obligationEuEts + marketParams.obligationUkEts + marketParams.obligationCorsia;
    const totalFree = (marketParams.freeAllowanceEuEts ?? 5200) + (marketParams.freeAllowanceUkEts ?? 1100);
    const totalCo2Saved = currentMetrics.co2EuSaved + currentMetrics.co2UkSaved + currentMetrics.co2CorsiaSaved;
    const co2Remaining = currentMetrics.residualEuCo2 + currentMetrics.residualUkCo2 + currentMetrics.residualCorsiaCo2;

    // Baseline calculation (Jet A-1 100%, 0 SAF, avoiding ReFuelEU penalties)
    const baselineFuelCost = totalAllocatedSaf * jetA1CostPerTonne;
    const baselineFuelCostVnd = Math.round(baselineFuelCost * defaultRate);
    const baselineCreditEu = Math.max(0, marketParams.obligationEuEts - (marketParams.freeAllowanceEuEts ?? 5200)) * marketParams.priceEuEts;
    const baselineCreditUk = Math.max(0, marketParams.obligationUkEts - (marketParams.freeAllowanceUkEts ?? 1100)) * marketParams.priceUkEts;
    const corsiaGrowth = (marketParams.corsiaGrowthRate ?? 20.0) / 100;
    const corsiaSecWeight = (marketParams.corsiaSectoralWeight ?? 100.0) / 100;
    const corsiaIndWeight = (marketParams.corsiaIndividualWeight ?? 0.0) / 100;
    const corsiaBase = marketParams.corsiaBaseline ?? 2254192;
    const corsiaTotalOblig = Math.max(0, Math.round((marketParams.obligationCorsia * corsiaGrowth) * corsiaSecWeight + Math.max(0, marketParams.obligationCorsia - corsiaBase) * corsiaIndWeight));
    const baselineCreditCorsia = corsiaTotalOblig * marketParams.priceCorsia;
    const refuelEuPenaltyAvoided = currentMetrics.safEuTonnes * 1200;
    const totalBaselineCost = baselineFuelCost + baselineCreditEu + baselineCreditUk + baselineCreditCorsia + refuelEuPenaltyAvoided;
    const totalBaselineCostVnd = baselineFuelCostVnd + Math.round(baselineCreditEu * rateEu) + Math.round(baselineCreditUk * rateUk) + Math.round(baselineCreditCorsia * rateCorsia) + Math.round(refuelEuPenaltyAvoided * rateEu);

    const netSavings = totalBaselineCost - totalScenarioCost;
    const netSavingsVnd = totalBaselineCostVnd - totalScenarioCostVnd;
    const savingsPercentage = totalBaselineCost > 0 ? (netSavings / totalBaselineCost) * 100 : 0;

    return {
      totalAllocatedSaf,
      safCost,
      safCostVnd,
      safCostEu,
      safCostEuVnd,
      safCostUk,
      safCostUkVnd,
      safCostCorsia,
      safCostCorsiaVnd,
      totalCreditCost,
      totalCreditCostVnd,
      totalScenarioCost,
      totalScenarioCostVnd,
      totalGrossEmission,
      totalFree,
      totalCo2Saved,
      co2Remaining,
      totalBaselineCost,
      totalBaselineCostVnd,
      netSavings,
      netSavingsVnd,
      savingsPercentage
    };
  }, [currentMetrics, marketParams]);

  // Strategy 1: Prioritize EU ETS (EU batches -> EU ETS, UK -> UK ETS, others -> CORSIA)
  const strategyEuPriority = useMemo(() => {
    const assigned: SafBatch[] = batches.map(b => {
      if (b.eligibleSchemes.includes('EU_ETS')) {
        return { ...b, assignedScheme: 'EU_ETS' };
      } else if (b.eligibleSchemes.includes('UK_ETS')) {
        return { ...b, assignedScheme: 'UK_ETS' };
      }
      return { ...b, assignedScheme: 'CORSIA' };
    });
    return {
      name: 'Phương án 1: Tối đa hóa kê khai EU ETS',
      description: `Dồn toàn bộ lô SAF đủ điều kiện vào thị trường có đơn giá cao nhất (EU ETS: ${marketParams.priceEuEts} $/tCO2)`,
      batches: assigned,
      metrics: calculateMetricsForBatches(assigned, marketParams)
    };
  }, [batches, marketParams]);

  // Strategy 2: Prioritize CORSIA (All eligible -> CORSIA)
  const strategyCorsiaPriority = useMemo(() => {
    const assigned: SafBatch[] = batches.map(b => ({
      ...b,
      assignedScheme: 'CORSIA'
    }));
    return {
      name: 'Phương án 2: Tối đa hóa kê khai CORSIA',
      description: `Dồn toàn bộ các lô SAF vào cơ chế toàn cầu CORSIA (Đơn giá: ${marketParams.priceCorsia} $/tCO2)`,
      batches: assigned,
      metrics: calculateMetricsForBatches(assigned, marketParams)
    };
  }, [batches, marketParams]);

  // Strategy 3: Smart Greedy Optimizer (Prioritize highest price until obligation is zero, then next highest)
  const strategyOptimal = useMemo(() => {
    let remainingEuCap = Math.max(0, marketParams.obligationEuEts - (marketParams.freeAllowanceEuEts ?? 5200));
    let remainingUkCap = Math.max(0, marketParams.obligationUkEts - (marketParams.freeAllowanceUkEts ?? 1100));
    const corsiaGrowth = (marketParams.corsiaGrowthRate ?? 20.0) / 100;
    const corsiaSecWeight = (marketParams.corsiaSectoralWeight ?? 100.0) / 100;
    const corsiaIndWeight = (marketParams.corsiaIndividualWeight ?? 0.0) / 100;
    const corsiaBase = marketParams.corsiaBaseline ?? 2254192;
    let remainingCorsiaCap = Math.max(0, Math.round((marketParams.obligationCorsia * corsiaGrowth) * corsiaSecWeight + Math.max(0, marketParams.obligationCorsia - corsiaBase) * corsiaIndWeight));

    const assigned: SafBatch[] = batches.map(b => {
      const co2 = Math.round(b.tonnes * b.co2SavedPerTonne);

      if (b.eligibleSchemes.includes('EU_ETS') && remainingEuCap > 0) {
        remainingEuCap -= co2;
        return { ...b, assignedScheme: 'EU_ETS' as const };
      }

      if (b.eligibleSchemes.includes('UK_ETS') && remainingUkCap > 0) {
        remainingUkCap -= co2;
        return { ...b, assignedScheme: 'UK_ETS' as const };
      }

      remainingCorsiaCap -= co2;
      return { ...b, assignedScheme: 'CORSIA' as const };
    });

    return {
      name: 'Phương án Tối ưu (Smart Linear Optimizer)',
      description: 'Thuật toán tự động phân bổ theo biên độ giá cao nhất cho đến khi hết nghĩa vụ nợ, giúp chi phí đền bù nhỏ nhất',
      batches: assigned,
      metrics: calculateMetricsForBatches(assigned, marketParams)
    };
  }, [batches, marketParams]);

  // Handler for changing batch assignment
  const handleAssignBatch = (batchId: string, scheme: SafBatch['assignedScheme']) => {
    const updated = batches.map(b => {
      if (b.id === batchId) {
        return { ...b, assignedScheme: scheme };
      }
      return b;
    });
    setBatches(updated);
    localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(updated));
  };

  // Handler for inline editing of batch tonnage
  const handleUpdateBatchTonnage = (batchId: string, newTonnes: number) => {
    const val = Math.max(0, newTonnes);
    const updated = batches.map(b => {
      if (b.id === batchId) {
        return { ...b, tonnes: val };
      }
      return b;
    });
    setBatches(updated);
    localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(updated));
  };

  // Handler for market param adjustments
  const handleUpdateMarketParam = (key: keyof MarketParams, val: number) => {
    const updated = { ...marketParams, [key]: val };
    setMarketParams(updated);
    localStorage.setItem('vna_netzero_v2_market', JSON.stringify(updated));
  };

  // Preset price scenarios
  const applyPricePreset = (type: 'DEFAULT' | 'HIGH' | 'LOW') => {
    let newP: MarketParams;
    if (type === 'HIGH') {
      newP = {
        ...marketParams,
        priceEuEts: 99.5,
        priceUkEts: 75.0,
        priceCorsia: 32.0
      };
    } else if (type === 'LOW') {
      newP = {
        ...marketParams,
        priceEuEts: 62.0,
        priceUkEts: 45.0,
        priceCorsia: 17.5
      };
    } else {
      newP = DEFAULT_MARKET_PARAMS;
    }
    setMarketParams(newP);
    localStorage.setItem('vna_netzero_v2_market', JSON.stringify(newP));
  };

  // Apply a specific strategy
  const handleApplyStrategy = (stratBatches: SafBatch[]) => {
    setBatches(stratBatches);
    localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(stratBatches));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Load a saved scenario
  const handleLoadScenario = (scenario: SavedScenarioItem) => {
    setReportPeriod(scenario.period);
    setMarketParams(scenario.marketParams);
    setBatches(scenario.batches);
    setAllocationMode(scenario.allocationMode);
    if (scenario.manualConfig) {
      setManualSafTonnes(scenario.manualConfig.totalSaf);
      setManualAllocEu(scenario.manualConfig.allocEu);
      setManualAllocUk(scenario.manualConfig.allocUk);
      setManualAllocCorsia(scenario.manualConfig.allocCorsia);
    }
    localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(scenario.batches));
    localStorage.setItem('vna_netzero_v2_market', JSON.stringify(scenario.marketParams));
    setIsScenarioListModalOpen(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Delete a saved scenario
  const handleDeleteScenario = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa kịch bản này khỏi danh sách đã lưu?')) {
      const updated = savedScenarios.filter(s => s.id !== id);
      setSavedScenarios(updated);
      localStorage.setItem('vna_saved_scenarios_list', JSON.stringify(updated));
    }
  };

  // Save current scenario with custom name
  const handleConfirmSaveScenario = () => {
    const finalName = scenarioNameInput.trim() || `Kịch bản ${reportPeriod} (${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`;
    const totalSaf = allocationMode === 'ledger'
      ? (currentMetrics.safEuTonnes + currentMetrics.safUkTonnes + currentMetrics.safCorsiaTonnes)
      : (manualAllocEu + manualAllocUk + manualAllocCorsia);
    const co2Saved = currentMetrics.co2EuSaved + currentMetrics.co2UkSaved + currentMetrics.co2CorsiaSaved;
    const totalCredits = currentMetrics.residualEuCo2 + currentMetrics.residualUkCo2 + currentMetrics.residualCorsiaCo2;

    const newScenario: SavedScenarioItem = {
      id: `sc-${Date.now()}`,
      name: finalName,
      savedAt: new Date().toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      period: reportPeriod,
      allocationMode: allocationMode,
      batches: batches,
      marketParams: marketParams,
      manualConfig: allocationMode === 'manual' ? {
        totalSaf: manualSafTonnes,
        allocEu: manualAllocEu,
        allocUk: manualAllocUk,
        allocCorsia: manualAllocCorsia
      } : undefined,
      metrics: {
        totalAllocatedSaf: totalSaf,
        co2Saved: co2Saved,
        totalCredits: totalCredits,
        totalCost: currentMetrics.totalCost,
        totalCostVnd: currentMetrics.totalCostVnd
      }
    };

    const updated = [newScenario, ...savedScenarios];
    setSavedScenarios(updated);
    localStorage.setItem('vna_saved_scenarios_list', JSON.stringify(updated));
    localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(batches));
    localStorage.setItem('vna_netzero_v2_market', JSON.stringify(marketParams));

    setIsSaveNameModalOpen(false);
    setScenarioNameInput('');
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Save current setup
  const handleSaveCurrent = () => {
    localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(batches));
    localStorage.setItem('vna_netzero_v2_market', JSON.stringify(marketParams));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Handler for exporting SAF Batch Allocation table to Excel
  const handleExportSafBatchesExcel = () => {
    const displayedBatches = processedBatches;

    if (displayedBatches.length === 0) {
      alert('Không có dữ liệu lô SAF để xuất file.');
      return;
    }

    // Row 1: Group headers
    const headerRow1 = [
      'Mã lô',
      'Ngày nạp',
      'Sân bay xuất phát',
      'Sân bay đáp',
      'Khối lượng SAF (tấn)',
      'Số lượng Chuyến bay (FLS)',
      '',
      '',
      'Lượng CO2 Giảm trừ (tCO2)',
      '',
      '',
      'Chi phí được giảm trừ (USD $)',
      '',
      '',
      'Cơ chế áp dụng'
    ];

    // Row 2: Detailed column names
    const headerRow2 = [
      'Mã lô',
      'Ngày nạp',
      'Sân bay xuất phát',
      'Sân bay đáp',
      'Khối lượng SAF (tấn)',
      'FLS_EU ETS',
      'FLS_UK ETS',
      'FLS_CORSIA',
      'CO2_EU ETS (tCO2)',
      'CO2_UK ETS (tCO2)',
      'CO2_CORSIA (tCO2)',
      'USD_EU ETS ($)',
      'USD_UK ETS ($)',
      'USD_CORSIA ($)',
      'Cơ chế áp dụng'
    ];

    // Data rows
    const dataRows = displayedBatches.map((b) => {
      const flights = getBatchFlights(b);
      const isEu = b.eligibleSchemes.includes('EU_ETS');
      const isUk = b.eligibleSchemes.includes('UK_ETS');
      const isCorsia = b.eligibleSchemes.includes('CORSIA');

      const co2Eu = isEu ? calculateCo2SavedByScheme(b.tonnes, b.co2SavedPerTonne, 'EU_ETS').totalSaved : '';
      const usdEu = isEu ? Math.round(Number(co2Eu) * marketParams.priceEuEts) : '';

      const co2Uk = isUk ? calculateCo2SavedByScheme(b.tonnes, b.co2SavedPerTonne, 'UK_ETS').totalSaved : '';
      const usdUk = isUk ? Math.round(Number(co2Uk) * marketParams.priceUkEts) : '';

      const co2Corsia = isCorsia ? calculateCo2SavedByScheme(b.tonnes, b.co2SavedPerTonne, 'CORSIA').totalSaved : '';
      const usdCorsia = isCorsia ? Math.round(Number(co2Corsia) * marketParams.priceCorsia) : '';

      const schemeLabel = b.assignedScheme === 'EU_ETS' ? 'EU ETS' : b.assignedScheme === 'UK_ETS' ? 'UK ETS' : 'CORSIA';

      return [
        b.batchNo,
        b.deliveryDate,
        b.airportCode,
        b.destAirportCode || 'HAN',
        b.tonnes,
        isEu ? flights : '—',
        isUk ? flights : '—',
        isCorsia ? flights : '—',
        isEu ? -co2Eu : '—',
        isUk ? -co2Uk : '—',
        isCorsia ? -co2Corsia : '—',
        isEu ? usdEu : '—',
        isUk ? usdUk : '—',
        isCorsia ? usdCorsia : '—',
        schemeLabel
      ];
    });

    // Summary totals
    const totalSafTonnes = displayedBatches.reduce((sum, b) => sum + b.tonnes, 0);

    const totalFlsEu = displayedBatches
      .filter((b) => b.eligibleSchemes.includes('EU_ETS'))
      .reduce((sum, b) => sum + getBatchFlights(b), 0);
    const totalFlsUk = displayedBatches
      .filter((b) => b.eligibleSchemes.includes('UK_ETS'))
      .reduce((sum, b) => sum + getBatchFlights(b), 0);
    const totalFlsCorsia = displayedBatches
      .filter((b) => b.eligibleSchemes.includes('CORSIA'))
      .reduce((sum, b) => sum + getBatchFlights(b), 0);

    const totalCo2Eu = displayedBatches
      .filter((b) => b.eligibleSchemes.includes('EU_ETS'))
      .reduce(
        (sum, b) => sum + calculateCo2SavedByScheme(b.tonnes, b.co2SavedPerTonne, 'EU_ETS').totalSaved,
        0
      );
    const totalCo2Uk = displayedBatches
      .filter((b) => b.eligibleSchemes.includes('UK_ETS'))
      .reduce(
        (sum, b) => sum + calculateCo2SavedByScheme(b.tonnes, b.co2SavedPerTonne, 'UK_ETS').totalSaved,
        0
      );
    const totalCo2Corsia = displayedBatches
      .filter((b) => b.eligibleSchemes.includes('CORSIA'))
      .reduce(
        (sum, b) => sum + calculateCo2SavedByScheme(b.tonnes, b.co2SavedPerTonne, 'CORSIA').totalSaved,
        0
      );

    const totalUsdEu = Math.round(totalCo2Eu * marketParams.priceEuEts);
    const totalUsdUk = Math.round(totalCo2Uk * marketParams.priceUkEts);
    const totalUsdCorsia = Math.round(totalCo2Corsia * marketParams.priceCorsia);

    const summaryRow = [
      'TỔNG CỘNG',
      '',
      '',
      '',
      totalSafTonnes,
      totalFlsEu,
      totalFlsUk,
      totalFlsCorsia,
      -totalCo2Eu,
      -totalCo2Uk,
      -totalCo2Corsia,
      totalUsdEu,
      totalUsdUk,
      totalUsdCorsia,
      ''
    ];

    const aoa = [headerRow1, headerRow2, ...dataRows, summaryRow];
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Merge group header cells
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // Mã lô
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // Ngày nạp
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // Sân bay đi
      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // Sân bay đến
      { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } }, // Khối lượng SAF
      { s: { r: 0, c: 5 }, e: { r: 0, c: 7 } }, // FLS
      { s: { r: 0, c: 8 }, e: { r: 0, c: 10 } }, // CO2
      { s: { r: 0, c: 11 }, e: { r: 0, c: 13 } }, // USD
      { s: { r: 0, c: 14 }, e: { r: 1, c: 14 } }, // Cơ chế áp dụng
      { s: { r: aoa.length - 1, c: 0 }, e: { r: aoa.length - 1, c: 3 } } // TỔNG CỘNG merge
    ];

    // Set column widths
    ws['!cols'] = [
      { wch: 18 }, // Mã lô
      { wch: 14 }, // Ngày nạp
      { wch: 16 }, // Sân bay xuất phát
      { wch: 14 }, // Sân bay đáp
      { wch: 20 }, // Khối lượng SAF
      { wch: 14 }, // FLS_EU
      { wch: 14 }, // FLS_UK
      { wch: 15 }, // FLS_CORSIA
      { wch: 18 }, // CO2_EU
      { wch: 18 }, // CO2_UK
      { wch: 18 }, // CO2_CORSIA
      { wch: 18 }, // USD_EU
      { wch: 18 }, // USD_UK
      { wch: 18 }, // USD_CORSIA
      { wch: 16 }  // Cơ chế áp dụng
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Phan_Bo_Lo_SAF');
    XLSX.writeFile(wb, `VNA_Bang_Phan_Bo_Lo_SAF_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Add new batch
  const handleAddNewBatch = () => {
    if (!newBatch.batchNo || !newBatch.tonnes) {
      alert('Vui lòng chọn Mã lô SAF từ kho dữ liệu.');
      return;
    }
    const created: SafBatch = {
      id: `b-${Date.now()}`,
      batchNo: newBatch.batchNo.trim(),
      deliveryDate: newBatch.deliveryDate || '2026-03-25',
      airportCode: newBatch.airportCode || 'CDG',
      airportName: newBatch.airportName || 'Paris CDG',
      destAirportCode: newBatch.destAirportCode || (newBatch.airportCode === 'SIN' || newBatch.airportCode === 'NRT' ? 'SGN' : 'HAN'),
      destAirportName: newBatch.destAirportName || (newBatch.destAirportCode === 'SGN' ? 'TP. Hồ Chí Minh (Tân Sơn Nhất)' : 'Hà Nội (Nội Bài)'),
      region: (newBatch.airportCode === 'CDG' || newBatch.airportCode === 'FRA') ? 'EU' : (newBatch.airportCode === 'LHR' ? 'UK' : 'NON_EU'),
      supplier: newBatch.supplier || '',
      supplierVat: newBatch.supplierVat || '',
      tonnes: Number(newBatch.tonnes),
      lifecycleEmission: Number(newBatch.lifecycleEmission) || 16.5,
      co2SavedPerTonne: Number(newBatch.co2SavedPerTonne) || 2.60,
      eligibleSchemes: (newBatch.airportCode === 'CDG' || newBatch.airportCode === 'FRA') ? ['EU_ETS', 'CORSIA'] : (newBatch.airportCode === 'LHR' ? ['UK_ETS', 'CORSIA'] : ['CORSIA']),
      assignedScheme: (newBatch.airportCode === 'CDG' || newBatch.airportCode === 'FRA') ? 'EU_ETS' : (newBatch.airportCode === 'LHR' ? 'UK_ETS' : 'CORSIA'),
      flightsCount: Math.max(1, Math.round(Number(newBatch.tonnes) / 50))
    };

    const updated = [...batches, created];
    setBatches(updated);
    localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(updated));
    setIsNewBatchModalOpen(false);
    setNewBatch({
      batchNo: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      airportCode: '',
      airportName: '',
      destAirportCode: '',
      destAirportName: '',
      region: 'EU',
      supplier: '',
      supplierVat: '',
      tonnes: 0,
      lifecycleEmission: 16.5,
      co2SavedPerTonne: 0
    });
  };

  const handleDeleteBatch = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa lô SAF này khỏi danh sách mô phỏng?')) {
      const updated = batches.filter(b => b.id !== id);
      setBatches(updated);
      localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(updated));
    }
  };

  // Comparison Chart Data
  const comparisonChartData = [
    {
      name: 'Chưa dùng SAF (Gross)',
      costEu: Math.round(marketParams.obligationEuEts * marketParams.priceEuEts / 1000),
      costUk: Math.round(marketParams.obligationUkEts * marketParams.priceUkEts / 1000),
      costCorsia: Math.round(marketParams.obligationCorsia * marketParams.priceCorsia / 1000),
      totalCost: Math.round((marketParams.obligationEuEts * marketParams.priceEuEts + marketParams.obligationUkEts * marketParams.priceUkEts + marketParams.obligationCorsia * marketParams.priceCorsia) / 1000)
    },
    {
      name: 'Kịch bản 2 (CORSIA)',
      costEu: Math.round(strategyCorsiaPriority.metrics.costEu / 1000),
      costUk: Math.round(strategyCorsiaPriority.metrics.costUk / 1000),
      costCorsia: Math.round(strategyCorsiaPriority.metrics.costCorsia / 1000),
      totalCost: Math.round(strategyCorsiaPriority.metrics.totalCost / 1000)
    },
    {
      name: 'Kịch bản 1 (EU ETS)',
      costEu: Math.round(strategyEuPriority.metrics.costEu / 1000),
      costUk: Math.round(strategyEuPriority.metrics.costUk / 1000),
      costCorsia: Math.round(strategyEuPriority.metrics.costCorsia / 1000),
      totalCost: Math.round(strategyEuPriority.metrics.totalCost / 1000)
    },
    {
      name: 'Phương án Tối ưu (Smart)',
      costEu: Math.round(strategyOptimal.metrics.costEu / 1000),
      costUk: Math.round(strategyOptimal.metrics.costUk / 1000),
      costCorsia: Math.round(strategyOptimal.metrics.costCorsia / 1000),
      totalCost: Math.round(strategyOptimal.metrics.totalCost / 1000)
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 font-sans">

      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <Check size={18} className="font-bold" />
          <span className="text-sm font-bold">
            {currentLang === 'vi' ? 'Đã lưu cấu hình phân bổ SAF & kết quả mô phỏng!' : 'SAF claim configuration & simulation saved!'}
          </span>
        </div>
      )}

      {/* TOP ACTIONS TOOLBAR (NO TITLE, BUTTONS ONLY) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Năm mô phỏng:</span>
          <YearPicker
            value={reportPeriod}
            onChange={(val) => setReportPeriod(val)}
          />
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* <Button
            onClick={() => setIsAdjustParamsDrawerOpen(!isAdjustParamsDrawerOpen)}
            variant="outline"
            className={`text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${isAdjustParamsDrawerOpen ? 'bg-blue-50 text-vna-blue border-vna-blue' : 'text-gray-700 border-gray-300'
              }`}
          >
            <SlidersHorizontal size={15} />
            {isAdjustParamsDrawerOpen ? 'Ẩn bộ chỉnh chỉ số' : 'Điều chỉnh chỉ số đầu vào'}
          </Button> */}

          <Button
            onClick={() => setIsScenarioListModalOpen(true)}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer bg-white"
          >
            <BookmarkCheck size={15} className="text-vna-blue" />
            {currentLang === 'vi' ? 'Danh sách kịch bản' : 'Saved Scenarios'}
            <span className="ml-1 px-1.5 py-0.2 bg-blue-50 text-vna-blue text-[10px] font-black rounded-full border border-blue-200">
              {savedScenarios.length}
            </span>
          </Button>

          <Button
            onClick={() => setIsCompareModalOpen(true)}
            className="bg-vna-blue hover:bg-[#00556e] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <BarChart3 size={15} /> {currentLang === 'vi' ? 'So sánh kịch bản' : 'Compare Scenarios'}
          </Button>

          <Button
            onClick={handleSyncData}
            disabled={isSyncing}
            variant="outline"
            className="border-vna-blue/30 text-vna-blue hover:bg-blue-50/60 bg-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95 disabled:opacity-70"
          >
            <RefreshCw size={15} className={isSyncing ? 'animate-spin text-vna-blue' : 'text-vna-blue'} />
            {isSyncing
              ? (currentLang === 'vi' ? 'Đang đồng bộ...' : 'Syncing...')
              : (currentLang === 'vi' ? 'Đồng bộ dữ liệu' : 'Sync Data')}
          </Button>

          {/* <Button
            onClick={() => handleApplyStrategy(strategyOptimal.batches)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles size={15} /> {currentLang === 'vi' ? 'Tự động Tối ưu (Smart Optimizer)' : 'Smart Optimize'}
          </Button> */}


        </div>
      </div>

      {/* REAL-TIME INTERACTIVE INPUT ADJUSTMENT PANEL */}
      {isAdjustParamsDrawerOpen && (
        <div className="bg-white rounded-2xl border-2 border-vna-blue/30 p-5 shadow-xs space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 size={18} className="text-vna-blue" />
              <div>
                <h3 className="text-sm font-black text-vna-navy">
                  TÍN CHỈ CO2
                </h3>
                {/* <p className="text-[11px] text-gray-400">Thay đổi các tham số dưới đây sẽ tự động cập nhật lại toàn bộ ma trận tính toán và biểu đồ ngay lập tức</p> */}
              </div>
            </div>

            {/* Quick Price Preset Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* <span className="text-[11px] font-bold text-gray-400">Kịch bản giá nhanh:</span> */}
              {/* <button
                onClick={() => applyPricePreset('HIGH')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center gap-1 cursor-pointer"
              >
                <TrendingUp size={12} /> Giá cao (+30%)
              </button> */}
              {/* <button
                onClick={() => applyPricePreset('LOW')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-vna-blue hover:bg-blue-100 border border-blue-200 flex items-center gap-1 cursor-pointer"
              >
                <TrendingDown size={12} /> Giá thấp (-20%)
              </button> */}
              {/* <button
                onClick={() => applyPricePreset('DEFAULT')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} /> Mặc định
              </button> */}
            </div>
          </div>

          {/* Interactive Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">

            {/* 1. EU ETS Group */}
            <div className="space-y-3 bg-blue-50/40 p-4 rounded-xl border border-blue-100/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-blue-100">
                  <span className="text-xs font-black text-vna-blue flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-vna-blue"></span> EU ETS
                  </span>
                  <span className="text-xs font-black text-vna-blue bg-white px-2 py-0.5 rounded border border-blue-200">
                    {formatNumber(marketParams.priceEuEts, 1)} $ / EUA
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-600 mb-1 font-semibold">
                    Đơn giá tín chỉ EUA:
                  </label>
                  <div className="relative">
                    <FormattedNumberInput
                      isDecimal={true}
                      value={marketParams.priceEuEts}
                      onChange={(val) => handleUpdateMarketParam('priceEuEts', val)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 pr-14 text-xs font-bold text-gray-800 bg-white focus:outline-hidden focus:border-vna-blue"
                      placeholder="Nhập đơn giá..."
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">
                      $ / tCO₂
                    </span>
                  </div>
                </div>



                <div>
                  <label className="block text-[11px] text-gray-600 mb-1 font-semibold">
                    Tổng phát thải CO₂:
                  </label>
                  <div className="relative">
                    <FormattedNumberInput
                      value={marketParams.obligationEuEts}
                      onChange={(val) => handleUpdateMarketParam('obligationEuEts', val)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 pr-12 text-xs font-bold text-gray-800 bg-white focus:outline-hidden focus:border-vna-blue"
                      placeholder="Nhập số tấn CO₂..."
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">
                      tCO₂
                    </span>
                  </div>
                </div>

                {/* HẠN NGẠCH MIỄN GIẢM EU ETS */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-gray-700 font-bold flex items-center gap-1">
                      <span>Hạn ngạch:</span>
                    </label>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      Miễn trừ
                    </span>
                  </div>
                  <div className="relative">
                    <FormattedNumberInput
                      value={marketParams.freeAllowanceEuEts ?? 5200}
                      onChange={(val) => handleUpdateMarketParam('freeAllowanceEuEts', val)}
                      className="w-full border border-blue-200 rounded-lg px-3 py-1.5 pr-12 text-xs font-bold text-blue-900 bg-white focus:outline-hidden focus:border-vna-blue"
                      placeholder="Số tấn CO₂ được miễn giảm..."
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-blue-400 pointer-events-none">
                      tCO₂
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Số tấn CO₂ được cấp miễn phí theo quy định ReFuelEU/EU ETS
                  </p>
                </div>
              </div>

              {/* Tóm tắt nợ thực tế EU ETS */}
              <div className="mt-3 pt-2.5 border-t border-blue-100 flex items-center justify-between text-xs bg-white/70 p-2 rounded-lg">
                <span className="text-gray-600 font-medium">Tổng phát thải CO2 sau miễn giảm:</span>
                <span className="font-black text-vna-navy">
                  {Math.max(0, marketParams.obligationEuEts - (marketParams.freeAllowanceEuEts ?? 5200)).toLocaleString(locale)} tCO₂
                </span>
              </div>
            </div>

            {/* 2. UK ETS Group */}
            <div className="space-y-3 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-indigo-100">
                  <span className="text-xs font-black text-indigo-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> UK ETS
                  </span>
                  <span className="text-xs font-black text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                    {formatNumber(marketParams.priceUkEts, 1)} $ / UKA
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-600 mb-1 font-semibold">
                    Đơn giá tín chỉ UKA:
                  </label>
                  <div className="relative">
                    <FormattedNumberInput
                      isDecimal={true}
                      value={marketParams.priceUkEts}
                      onChange={(val) => handleUpdateMarketParam('priceUkEts', val)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 pr-14 text-xs font-bold text-gray-800 bg-white focus:outline-hidden focus:border-indigo-600"
                      placeholder="Nhập đơn giá..."
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">
                      $ / tCO₂
                    </span>
                  </div>
                </div>



                <div>
                  <label className="block text-[11px] text-gray-600 mb-1 font-semibold">
                    Tổng phát thải CO₂:
                  </label>
                  <div className="relative">
                    <FormattedNumberInput
                      value={marketParams.obligationUkEts}
                      onChange={(val) => handleUpdateMarketParam('obligationUkEts', val)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 pr-12 text-xs font-bold text-gray-800 bg-white focus:outline-hidden focus:border-indigo-600"
                      placeholder="Nhập số tấn CO₂..."
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">
                      tCO₂
                    </span>
                  </div>
                </div>

                {/* HẠN NGẠCH MIỄN GIẢM UK ETS */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-gray-700 font-bold flex items-center gap-1">
                      <span>Hạn ngạch:</span>
                    </label>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                      Miễn trừ
                    </span>
                  </div>
                  <div className="relative">
                    <FormattedNumberInput
                      value={marketParams.freeAllowanceUkEts ?? 1100}
                      onChange={(val) => handleUpdateMarketParam('freeAllowanceUkEts', val)}
                      className="w-full border border-indigo-200 rounded-lg px-3 py-1.5 pr-12 text-xs font-bold text-indigo-950 bg-white focus:outline-hidden focus:border-indigo-600"
                      placeholder="Số tấn CO₂ được miễn giảm..."
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-indigo-400 pointer-events-none">
                      tCO₂
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Số tấn CO₂ được cấp miễn phí theo quy chế UK ETS
                  </p>
                </div>
              </div>

              {/* Tóm tắt nợ thực tế UK ETS */}
              <div className="mt-3 pt-2.5 border-t border-indigo-100 flex items-center justify-between text-xs bg-white/70 p-2 rounded-lg">
                <span className="text-gray-600 font-medium">Tổng phát thải CO2 sau miễn giảm:</span>
                <span className="font-black text-vna-navy">
                  {Math.max(0, marketParams.obligationUkEts - (marketParams.freeAllowanceUkEts ?? 1100)).toLocaleString(locale)} tCO₂
                </span>
              </div>
            </div>

            {/* 3. CORSIA Group */}
            <div className="space-y-3 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-100">
                  <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                    <Globe size={14} className="text-emerald-600" /> CORSIA
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {formatNumber(marketParams.priceCorsia, 1)} $ / CEU
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-600 mb-1 font-semibold">
                    Đơn giá tín chỉ CORSIA (CEU):
                  </label>
                  <div className="relative">
                    <FormattedNumberInput
                      isDecimal={true}
                      value={marketParams.priceCorsia}
                      onChange={(val) => handleUpdateMarketParam('priceCorsia', val)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 pr-14 text-xs font-bold text-gray-800 bg-white focus:outline-hidden focus:border-emerald-600"
                      placeholder="Nhập đơn giá..."
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">
                      $ / tCO₂
                    </span>
                  </div>
                </div>



                <div>
                  <label className="block text-[11px] text-gray-600 mb-1 font-semibold">
                    Tổng phát thải CO₂:
                  </label>
                  <div className="relative">
                    <FormattedNumberInput
                      value={marketParams.obligationCorsia}
                      onChange={(val) => handleUpdateMarketParam('obligationCorsia', val)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 pr-12 text-xs font-bold text-gray-800 bg-white focus:outline-hidden focus:border-emerald-600"
                      placeholder="Nhập số tấn CO₂..."
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 pointer-events-none">
                      tCO₂
                    </span>
                  </div>
                </div>

                {/* TỶ LỆ TĂNG TRƯỞNG NGÀNH CORSIA */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-gray-700 font-bold flex items-center gap-1">
                      <span>Tỷ lệ tăng trưởng ngành:</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      CORSIA Rule
                    </span>
                  </div>
                  <div className="relative">
                    <FormattedNumberInput
                      isDecimal={true}
                      min={0}
                      max={100}
                      value={marketParams.corsiaGrowthRate ?? 20.0}
                      onChange={(val) => handleUpdateMarketParam('corsiaGrowthRate', val)}
                      className="w-full border border-emerald-200 rounded-lg px-3 py-1.5 pr-10 text-xs font-bold text-emerald-950 bg-white focus:outline-hidden focus:border-emerald-600"
                      placeholder="Nhập tỷ lệ %..."
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-600 pointer-events-none">
                      %
                    </span>
                  </div>
                </div>

                {/* 2 CỘT: TỶ TRỌNG SECTORAL & TỶ TRỌNG INDIVIDUAL */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-700 font-semibold mb-1 truncate" title="Tỷ trọng Sectoral (Mặc định 100%)">
                      Tỷ trọng Sectoral:
                    </label>
                    <div className="relative">
                      <FormattedNumberInput
                        isDecimal={true}
                        min={0}
                        max={100}
                        value={marketParams.corsiaSectoralWeight ?? 100.0}
                        onChange={(val) => handleUpdateMarketParam('corsiaSectoralWeight', val)}
                        className="w-full border border-emerald-200 rounded-lg px-2.5 py-1.5 pr-8 text-xs font-bold text-emerald-950 bg-white focus:outline-hidden focus:border-emerald-600"
                        placeholder="100"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-600 pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-700 font-semibold mb-1 truncate" title="Tỷ trọng Individual (Mặc định 0%)">
                      Tỷ trọng Individual:
                    </label>
                    <div className="relative">
                      <FormattedNumberInput
                        isDecimal={true}
                        min={0}
                        max={100}
                        value={marketParams.corsiaIndividualWeight ?? 0.0}
                        onChange={(val) => handleUpdateMarketParam('corsiaIndividualWeight', val)}
                        className="w-full border border-emerald-200 rounded-lg px-2.5 py-1.5 pr-8 text-xs font-bold text-emerald-950 bg-white focus:outline-hidden focus:border-emerald-600"
                        placeholder="0"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-600 pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* BASELINE PHÁT THẢI (MẶC ĐỊNH 2,254,192 tCO2) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-gray-700 font-bold flex items-center gap-1">
                      <span>Baseline:</span>
                    </label>
                    {/* <span className="text-[10px] text-gray-500 font-mono">2019-2020</span> */}
                  </div>
                  <div className="relative">
                    <FormattedNumberInput
                      value={marketParams.corsiaBaseline ?? 2254192}
                      onChange={(val) => handleUpdateMarketParam('corsiaBaseline', val)}
                      className="w-full border border-emerald-200 rounded-lg px-3 py-1.5 pr-12 text-xs font-bold text-emerald-950 bg-white focus:outline-hidden focus:border-emerald-600"
                      placeholder="Nhập baseline phát thải..."
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-600 pointer-events-none">
                      tCO₂
                    </span>
                  </div>
                </div>
              </div>

              {/* TỔNG PHÁT THẢI CO2 CẦN ĐỀN BÙ */}
              {(() => {
                const growthRate = (marketParams.corsiaGrowthRate ?? 20.0) / 100;
                const sectoralWeight = (marketParams.corsiaSectoralWeight ?? 100.0) / 100;
                const individualWeight = (marketParams.corsiaIndividualWeight ?? 0.0) / 100;
                const baseline = marketParams.corsiaBaseline ?? 2254192;
                const sectoralComp = (marketParams.obligationCorsia * growthRate) * sectoralWeight;
                const individualComp = Math.max(0, marketParams.obligationCorsia - baseline) * individualWeight;
                const corsiaTotalObligation = Math.max(0, Math.round(sectoralComp + individualComp));

                return (
                  <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-xs bg-white/70 p-2.5 rounded-lg">
                    <div>
                      <span className="text-gray-700 font-bold block">Tổng phát thải CO2 cần đền bù:</span>
                      <span className="text-[10px] text-gray-500 block leading-tight font-mono mt-0.5" title="(Phát thải × Tỷ lệ tăng trưởng) × Tỷ trọng Sectoral + (Phát thải - Baseline) × Tỷ trọng Individual">
                        ({formatNumber(marketParams.obligationCorsia)} × {marketParams.corsiaGrowthRate ?? 20}%) × {marketParams.corsiaSectoralWeight ?? 100}% + ({formatNumber(marketParams.obligationCorsia)} - {formatNumber(baseline)}) × {marketParams.corsiaIndividualWeight ?? 0}%
                      </span>
                    </div>
                    <span className="font-black text-emerald-800 text-sm whitespace-nowrap ml-2">
                      {formatNumber(corsiaTotalObligation)} tCO₂
                    </span>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* SAF ALLOCATION & CLAIM SCENARIO (WITH 2 TABS: LEDGER & MANUAL) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">

        {/* Card Header with 2 Tabs */}
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-sm sm:text-base font-black text-vna-navy uppercase tracking-wide">
                Phân bổ Lô SAF
              </h3>
            </div>
            {/* <p className="text-xs text-gray-500 mt-1">
              {allocationMode === 'ledger'
                ? 'Điều phối các lô SAF thực tế từ kho số Ledger vào các cơ chế thị trường để bù đắp nghĩa vụ nợ carbon.'
                : 'Nhập tổng lượng SAF sẵn có và trực tiếp phân bổ số tấn cho từng cơ chế thị trường (EU ETS, UK ETS, CORSIA).'}
            </p> */}
          </div>

          <div className="flex items-center gap-2">
            {(batchFilterCode || batchFilterOrigin !== 'ALL' || batchFilterDest !== 'ALL' || batchSortField) && (
              <button
                onClick={handleResetBatchFilters}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Đặt lại toàn bộ bộ lọc và sắp xếp"
              >
                <RotateCcw size={13} />
                <span>Đặt lại lọc ({processedBatches.length}/{batches.length})</span>
              </button>
            )}
            <Button
              onClick={handleExportSafBatchesExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Download size={15} /> Xuất Excel
            </Button>
          </div>

          {/* 2 Tabs Switcher */}
          {/* <div className="flex bg-gray-200/80 p-1 rounded-xl gap-1 self-start md:self-auto shadow-inner">
            <button
              onClick={() => setAllocationMode('ledger')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${allocationMode === 'ledger'
                ? 'bg-white text-vna-blue shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Database size={15} />
              Tab 1: Số liệu lấy từ kho Ledger
            </button>

            <button
              onClick={() => setAllocationMode('manual')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${allocationMode === 'manual'
                ? 'bg-white text-vna-blue shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Sliders size={15} />
              Tab 2: Nhập tay
            </button>
          </div> */}
        </div>

        {/* TAB 1 CONTENT: LEDGER DATA (PRESERVE EXISTING DESIGN) */}
        {allocationMode === 'ledger' && (
          <div>


            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[1340px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 font-bold text-[11px] uppercase tracking-wider">
                    {/* 1. Mã lô with Sort */}
                    <th rowSpan={2} className="py-3.5 px-3 text-left border-r border-gray-200 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleSort('batchNo')}
                        className="inline-flex items-center gap-1.5 font-bold text-gray-700 hover:text-vna-blue cursor-pointer select-none group"
                        title="Bấm để sắp xếp theo Mã lô"
                      >
                        <span>Mã lô</span>
                        {batchSortField === 'batchNo' ? (
                          batchSortOrder === 'asc' ? <ArrowUp size={13} className="text-vna-blue" /> : <ArrowDown size={13} className="text-vna-blue" />
                        ) : (
                          <ArrowUpDown size={12} className="text-gray-400 group-hover:text-gray-600" />
                        )}
                      </button>
                    </th>

                    {/* 2. Sân bay xuất phát with Sort */}
                    <th rowSpan={2} className="py-3.5 px-3 text-center border-r border-gray-200 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleSort('airportCode')}
                        className="inline-flex items-center justify-center gap-1.5 font-bold text-gray-700 hover:text-vna-blue cursor-pointer select-none group"
                        title="Bấm để sắp xếp theo Sân bay xuất phát"
                      >
                        <span>Sân bay xuất phát</span>
                        {batchSortField === 'airportCode' ? (
                          batchSortOrder === 'asc' ? <ArrowUp size={13} className="text-vna-blue" /> : <ArrowDown size={13} className="text-vna-blue" />
                        ) : (
                          <ArrowUpDown size={12} className="text-gray-400 group-hover:text-gray-600" />
                        )}
                      </button>
                    </th>

                    {/* 3. Sân bay đáp with Sort */}
                    <th rowSpan={2} className="py-3.5 px-3 text-center border-r border-gray-200 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleSort('destAirportCode')}
                        className="inline-flex items-center justify-center gap-1.5 font-bold text-gray-700 hover:text-vna-blue cursor-pointer select-none group"
                        title="Bấm để sắp xếp theo Sân bay đáp"
                      >
                        <span>Sân bay đáp</span>
                        {batchSortField === 'destAirportCode' ? (
                          batchSortOrder === 'asc' ? <ArrowUp size={13} className="text-vna-blue" /> : <ArrowDown size={13} className="text-vna-blue" />
                        ) : (
                          <ArrowUpDown size={12} className="text-gray-400 group-hover:text-gray-600" />
                        )}
                      </button>
                    </th>
                    
                    <th rowSpan={2} className="py-3 px-3 text-center border-r-2 border-gray-300 whitespace-nowrap">Khối lượng SAF (Tấn) ✍️</th>
                    
                    {/* GROUP 1: FLS */}
                    <th colSpan={3} className="py-2.5 px-3 text-center bg-slate-100 text-slate-800 border-r-2 border-gray-300 font-black">
                      Số lượng Chuyến bay (FLS)
                    </th>

                    {/* GROUP 2: CO2 */}
                    <th colSpan={3} className="py-2.5 px-3 text-center bg-emerald-50 text-emerald-900 border-r-2 border-gray-300 font-black">
                      Lượng CO₂ Giảm trừ (tCO₂)
                    </th>

                    {/* GROUP 3: USD */}
                    <th colSpan={3} className="py-2.5 px-3 text-center bg-blue-50 text-vna-navy border-r-2 border-gray-300 font-black">
                      Chi phí được giảm trừ (USD $)
                    </th>

                    <th rowSpan={2} className="py-3 px-3 text-center border-r border-gray-200 whitespace-nowrap">Cơ chế áp dụng</th>
                    <th rowSpan={2} className="py-3 px-3 text-center whitespace-nowrap">Thao tác</th>
                  </tr>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-[10px]">
                    {/* FLS columns */}
                    <th className="py-2 px-2.5 text-center bg-slate-50 border-r border-gray-200 whitespace-nowrap text-vna-blue font-bold" title="Số lượng chuyến bay nạp SAF (EU ETS)">
                      FLS_EU ETS
                    </th>
                    <th className="py-2 px-2.5 text-center bg-slate-50 border-r border-gray-200 whitespace-nowrap text-indigo-700 font-bold" title="Số lượng chuyến bay nạp SAF (UK ETS)">
                      FLS_UK ETS
                    </th>
                    <th className="py-2 px-2.5 text-center bg-slate-50 border-r-2 border-gray-300 whitespace-nowrap text-emerald-700 font-bold" title="Số lượng chuyến bay nạp SAF (CORSIA)">
                      FLS_CORSIA
                    </th>

                    {/* CO2 columns */}
                    <th className="py-2 px-2.5 text-right bg-emerald-50/40 border-r border-gray-200 whitespace-nowrap text-vna-blue font-bold" title="Lượng CO₂ giảm trừ (EU ETS)">
                      CO2_EU ETS
                    </th>
                    <th className="py-2 px-2.5 text-right bg-emerald-50/40 border-r border-gray-200 whitespace-nowrap text-indigo-700 font-bold" title="Lượng CO₂ giảm trừ (UK ETS)">
                      CO2_UK ETS
                    </th>
                    <th className="py-2 px-2.5 text-right bg-emerald-50/40 border-r-2 border-gray-300 whitespace-nowrap text-emerald-700 font-bold" title="Lượng CO₂ giảm trừ (CORSIA)">
                      CO2_CORSIA
                    </th>

                    {/* USD columns */}
                    <th className="py-2 px-2.5 text-right bg-blue-50/40 border-r border-gray-200 whitespace-nowrap text-vna-blue font-bold" title="Chi phí được giảm trừ (EU ETS)">
                      USD_EU ETS
                    </th>
                    <th className="py-2 px-2.5 text-right bg-blue-50/40 border-r border-gray-200 whitespace-nowrap text-indigo-700 font-bold" title="Chi phí được giảm trừ (UK ETS)">
                      USD_UK ETS
                    </th>
                    <th className="py-2 px-2.5 text-right bg-blue-50/40 border-r-2 border-gray-300 whitespace-nowrap text-emerald-700 font-bold" title="Chi phí được giảm trừ (CORSIA)">
                      USD_CORSIA
                    </th>
                  </tr>

                  {/* DÒNG BỘ LỌC TẬP TRUNG TẠI CÁC CỘT (FILTER ROW) */}
                  <tr className="bg-slate-50 border-b border-gray-200">
                    {/* 1. Lọc Mã lô */}
                    <th className="py-1.5 px-2 border-r border-gray-200 align-middle">
                      <div className="relative">
                        <Search className="absolute left-2 top-2 text-gray-400" size={12} />
                        <input
                          type="text"
                          value={batchFilterCode}
                          onChange={(e) => setBatchFilterCode(e.target.value)}
                          placeholder="Lọc mã..."
                          className="w-full pl-6 pr-5 py-1 bg-white border border-gray-300 rounded text-[11px] font-normal text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-vna-blue h-[28px]"
                        />
                        {batchFilterCode && (
                          <button
                            onClick={() => setBatchFilterCode('')}
                            className="absolute right-1.5 top-1.5 text-gray-400 hover:text-red-500 cursor-pointer"
                            title="Xóa"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </div>
                    </th>

                    {/* 2. Lọc Sân bay xuất phát */}
                    <th className="py-1.5 px-2 border-r border-gray-200 align-middle">
                      <select
                        value={batchFilterOrigin}
                        onChange={(e) => setBatchFilterOrigin(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] font-medium text-gray-700 outline-none cursor-pointer focus:ring-1 focus:ring-vna-blue h-[28px]"
                      >
                        <option value="ALL">Tất cả ({originAirportOptions.length})</option>
                        {originAirportOptions.map((code) => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    </th>

                    {/* 3. Lọc Sân bay đáp */}
                    <th className="py-1.5 px-2 border-r border-gray-200 align-middle">
                      <select
                        value={batchFilterDest}
                        onChange={(e) => setBatchFilterDest(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] font-medium text-gray-700 outline-none cursor-pointer focus:ring-1 focus:ring-vna-blue h-[28px]"
                      >
                        <option value="ALL">Tất cả ({destAirportOptions.length})</option>
                        {destAirportOptions.map((code) => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    </th>

                    {/* 4. Khối lượng SAF */}
                    <th className="py-1.5 px-2 border-r-2 border-gray-300 bg-gray-50/70"></th>

                    {/* 5, 6, 7: FLS */}
                    <th className="py-1.5 px-2 border-r border-gray-200 bg-slate-100/40"></th>
                    <th className="py-1.5 px-2 border-r border-gray-200 bg-slate-100/40"></th>
                    <th className="py-1.5 px-2 border-r-2 border-gray-300 bg-slate-100/40"></th>

                    {/* 8, 9, 10: CO2 */}
                    <th className="py-1.5 px-2 border-r border-gray-200 bg-emerald-50/20"></th>
                    <th className="py-1.5 px-2 border-r border-gray-200 bg-emerald-50/20"></th>
                    <th className="py-1.5 px-2 border-r-2 border-gray-300 bg-emerald-50/20"></th>

                    {/* 11, 12, 13: USD */}
                    <th className="py-1.5 px-2 border-r border-gray-200 bg-blue-50/20"></th>
                    <th className="py-1.5 px-2 border-r border-gray-200 bg-blue-50/20"></th>
                    <th className="py-1.5 px-2 border-r-2 border-gray-300 bg-blue-50/20"></th>

                    {/* 14. Cơ chế áp dụng */}
                    <th className="py-1.5 px-2 border-r border-gray-200 bg-gray-50/70"></th>

                    {/* 15. Thao tác / Nút reset nếu có filter */}
                    <th className="py-1.5 px-2 text-center bg-gray-50/70 align-middle">
                      {(batchFilterCode || batchFilterOrigin !== 'ALL' || batchFilterDest !== 'ALL' || batchSortField) && (
                        <button
                          onClick={handleResetBatchFilters}
                          className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Xóa toàn bộ bộ lọc và sắp xếp"
                        >
                          <RotateCcw size={13} />
                        </button>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(() => {
                    const displayedBatches = processedBatches;

                    if (displayedBatches.length === 0) {
                      return (
                        <tr>
                          <td colSpan={15} className="py-10 text-center text-gray-400 font-medium">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <span>Không tìm thấy lô SAF nào phù hợp với bộ lọc hiện tại.</span>
                              {(batchFilterCode || batchFilterOrigin !== 'ALL' || batchFilterDest !== 'ALL') && (
                                <button
                                  onClick={handleResetBatchFilters}
                                  className="text-xs font-bold text-vna-blue hover:underline cursor-pointer"
                                >
                                  Đặt lại bộ lọc
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return displayedBatches.map((batch, bIndex) => {
                      const isEven = bIndex % 2 === 0;
                      const batchFlights = getBatchFlights(batch);

                      // EU ETS calculation
                      const isEuEligible = batch.eligibleSchemes.includes('EU_ETS');
                      const co2Eu = isEuEligible
                        ? calculateCo2SavedByScheme(batch.tonnes, batch.co2SavedPerTonne, 'EU_ETS').totalSaved
                        : 0;
                      const usdEu = isEuEligible ? Math.round(co2Eu * marketParams.priceEuEts) : 0;

                      // UK ETS calculation
                      const isUkEligible = batch.eligibleSchemes.includes('UK_ETS');
                      const co2Uk = isUkEligible
                        ? calculateCo2SavedByScheme(batch.tonnes, batch.co2SavedPerTonne, 'UK_ETS').totalSaved
                        : 0;
                      const usdUk = isUkEligible ? Math.round(co2Uk * marketParams.priceUkEts) : 0;

                      // CORSIA calculation
                      const isCorsiaEligible = batch.eligibleSchemes.includes('CORSIA');
                      const co2Corsia = isCorsiaEligible
                        ? calculateCo2SavedByScheme(batch.tonnes, batch.co2SavedPerTonne, 'CORSIA').totalSaved
                        : 0;
                      const usdCorsia = isCorsiaEligible ? Math.round(co2Corsia * marketParams.priceCorsia) : 0;

                      const isAssignedEu = batch.assignedScheme === 'EU_ETS';
                      const isAssignedUk = batch.assignedScheme === 'UK_ETS';
                      const isAssignedCorsia = batch.assignedScheme === 'CORSIA';

                      return (
                        <tr
                          key={batch.id}
                          className={`transition-colors border-b border-gray-100 ${
                            isEven ? 'bg-white hover:bg-gray-50/80' : 'bg-gray-50/40 hover:bg-gray-100/60'
                          }`}
                        >
                          {/* 1. Mã lô (Đã bỏ ngày nạp) */}
                          <td className="py-3 px-3 align-middle border-r border-gray-200 whitespace-nowrap">
                            <div className="font-bold text-gray-900">{batch.batchNo}</div>
                          </td>

                          {/* 2. Sân bay xuất phát */}
                          <td className="py-3 px-3 text-center align-middle border-r border-gray-200 whitespace-nowrap">
                            <span className="font-black text-vna-blue bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 text-xs">
                              {batch.airportCode}
                            </span>
                          </td>

                          {/* 3. Sân bay đáp */}
                          <td className="py-3 px-3 text-center align-middle border-r border-gray-200 whitespace-nowrap">
                            <span className="font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-xs">
                              {batch.destAirportCode || 'HAN'}
                            </span>
                          </td>



                          {/* 5. Khối lượng SAF */}
                          <td className="py-3 px-3 text-center align-middle border-r-2 border-gray-300 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <FormattedNumberInput
                                value={batch.tonnes}
                                onChange={(val) => handleUpdateBatchTonnage(batch.id, val)}
                                className="w-20 text-right font-black text-gray-900 border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-vna-blue bg-white"
                              />
                              <span className="text-[11px] text-gray-500 font-bold">tấn</span>
                            </div>
                          </td>

                          {/* GROUP 1: FLS OF MECHANISMS SIDE-BY-SIDE */}
                          {/* FLS_EU ETS */}
                          <td className={`py-3 px-2.5 text-center align-middle border-r border-gray-200 ${isAssignedEu ? 'bg-blue-50/50' : isEuEligible ? 'bg-white' : 'bg-gray-50/30'}`}>
                            {isEuEligible ? (
                              <span className={`font-bold ${isAssignedEu ? 'text-vna-blue font-black' : 'text-gray-700'}`}>
                                {batchFlights}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          {/* FLS_UK ETS */}
                          <td className={`py-3 px-2.5 text-center align-middle border-r border-gray-200 ${isAssignedUk ? 'bg-indigo-50/50' : isUkEligible ? 'bg-white' : 'bg-gray-50/30'}`}>
                            {isUkEligible ? (
                              <span className={`font-bold ${isAssignedUk ? 'text-indigo-700 font-black' : 'text-gray-700'}`}>
                                {batchFlights}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          {/* FLS_CORSIA */}
                          <td className={`py-3 px-2.5 text-center align-middle border-r-2 border-gray-300 ${isAssignedCorsia ? 'bg-emerald-50/50' : isCorsiaEligible ? 'bg-white' : 'bg-gray-50/30'}`}>
                            {isCorsiaEligible ? (
                              <span className={`font-bold ${isAssignedCorsia ? 'text-emerald-800 font-black' : 'text-gray-700'}`}>
                                {batchFlights}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          {/* GROUP 2: CO2 OF MECHANISMS SIDE-BY-SIDE */}
                          {/* CO2_EU ETS */}
                          <td className={`py-3 px-2.5 text-right align-middle border-r border-gray-200 ${isAssignedEu ? 'bg-blue-50/50' : isEuEligible ? 'bg-white' : 'bg-gray-50/30'}`}>
                            {isEuEligible ? (
                              <span className={`font-bold ${isAssignedEu ? 'text-emerald-700 font-black' : 'text-emerald-600'}`}>
                                -{co2Eu.toLocaleString(locale)}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          {/* CO2_UK ETS */}
                          <td className={`py-3 px-2.5 text-right align-middle border-r border-gray-200 ${isAssignedUk ? 'bg-indigo-50/50' : isUkEligible ? 'bg-white' : 'bg-gray-50/30'}`}>
                            {isUkEligible ? (
                              <span className={`font-bold ${isAssignedUk ? 'text-emerald-700 font-black' : 'text-emerald-600'}`}>
                                -{co2Uk.toLocaleString(locale)}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          {/* CO2_CORSIA */}
                          <td className={`py-3 px-2.5 text-right align-middle border-r-2 border-gray-300 ${isAssignedCorsia ? 'bg-emerald-50/50' : isCorsiaEligible ? 'bg-white' : 'bg-gray-50/30'}`}>
                            {isCorsiaEligible ? (
                              <span className={`font-bold ${isAssignedCorsia ? 'text-emerald-700 font-black' : 'text-emerald-600'}`}>
                                -{co2Corsia.toLocaleString(locale)}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          {/* GROUP 3: USD OF MECHANISMS SIDE-BY-SIDE */}
                          {/* USD_EU ETS */}
                          <td className={`py-3 px-2.5 text-right align-middle border-r border-gray-200 ${isAssignedEu ? 'bg-blue-50/50' : isEuEligible ? 'bg-white' : 'bg-gray-50/30'}`}>
                            {isEuEligible ? (
                              <span className={`font-bold ${isAssignedEu ? 'text-vna-blue font-black' : 'text-gray-800'}`}>
                                +{usdEu.toLocaleString(locale)} $
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          {/* USD_UK ETS */}
                          <td className={`py-3 px-2.5 text-right align-middle border-r border-gray-200 ${isAssignedUk ? 'bg-indigo-50/50' : isUkEligible ? 'bg-white' : 'bg-gray-50/30'}`}>
                            {isUkEligible ? (
                              <span className={`font-bold ${isAssignedUk ? 'text-indigo-700 font-black' : 'text-gray-800'}`}>
                                +{usdUk.toLocaleString(locale)} $
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          {/* USD_CORSIA */}
                          <td className={`py-3 px-2.5 text-right align-middle border-r-2 border-gray-300 ${isAssignedCorsia ? 'bg-emerald-50/50' : isCorsiaEligible ? 'bg-white' : 'bg-gray-50/30'}`}>
                            {isCorsiaEligible ? (
                              <span className={`font-bold ${isAssignedCorsia ? 'text-emerald-700 font-black' : 'text-gray-800'}`}>
                                +{usdCorsia.toLocaleString(locale)} $
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          {/* Cơ chế áp dụng */}
                          <td className="py-3 px-3 text-center align-middle border-r border-gray-200 whitespace-nowrap">
                            {batch.eligibleSchemes.length === 1 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                                <CheckCircle2 size={12} />
                                <span>{batch.assignedScheme === 'EU_ETS' ? 'EU ETS' : batch.assignedScheme === 'UK_ETS' ? 'UK ETS' : 'CORSIA'}</span>
                              </span>
                            ) : (
                              <div className="inline-flex items-center gap-1 p-0.5 bg-gray-100 rounded-xl border border-gray-200">
                                {batch.eligibleSchemes.map((sch) => {
                                  const isCurrent = batch.assignedScheme === sch;
                                  const label = sch === 'EU_ETS' ? 'EU ETS' : sch === 'UK_ETS' ? 'UK ETS' : 'CORSIA';
                                  return (
                                    <button
                                      key={sch}
                                      onClick={() => handleAssignBatch(batch.id, sch)}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1 ${
                                        isCurrent
                                          ? sch === 'EU_ETS'
                                            ? 'bg-vna-blue text-white shadow-xs'
                                            : sch === 'UK_ETS'
                                              ? 'bg-indigo-600 text-white shadow-xs'
                                              : 'bg-emerald-600 text-white shadow-xs'
                                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                                      }`}
                                      title={`Áp dụng cho ${label}`}
                                    >
                                      {isCurrent && <Check size={12} />}
                                      <span>{label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </td>

                          {/* Thao tác */}
                          <td className="py-3 px-3 text-center align-middle whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteBatch(batch.id)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa lô này"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
                {(() => {
                  const displayedBatches = processedBatches;
                  if (displayedBatches.length === 0) return null;

                  const totalSafTonnes = displayedBatches.reduce((sum, b) => sum + b.tonnes, 0);

                  const totalFlsEu = displayedBatches
                    .filter((b) => b.eligibleSchemes.includes('EU_ETS'))
                    .reduce((sum, b) => sum + getBatchFlights(b), 0);

                  const totalFlsUk = displayedBatches
                    .filter((b) => b.eligibleSchemes.includes('UK_ETS'))
                    .reduce((sum, b) => sum + getBatchFlights(b), 0);

                  const totalFlsCorsia = displayedBatches
                    .filter((b) => b.eligibleSchemes.includes('CORSIA'))
                    .reduce((sum, b) => sum + getBatchFlights(b), 0);

                  const totalCo2Eu = displayedBatches
                    .filter((b) => b.eligibleSchemes.includes('EU_ETS'))
                    .reduce(
                      (sum, b) => sum + calculateCo2SavedByScheme(b.tonnes, b.co2SavedPerTonne, 'EU_ETS').totalSaved,
                      0
                    );

                  const totalCo2Uk = displayedBatches
                    .filter((b) => b.eligibleSchemes.includes('UK_ETS'))
                    .reduce(
                      (sum, b) => sum + calculateCo2SavedByScheme(b.tonnes, b.co2SavedPerTonne, 'UK_ETS').totalSaved,
                      0
                    );

                  const totalCo2Corsia = displayedBatches
                    .filter((b) => b.eligibleSchemes.includes('CORSIA'))
                    .reduce(
                      (sum, b) => sum + calculateCo2SavedByScheme(b.tonnes, b.co2SavedPerTonne, 'CORSIA').totalSaved,
                      0
                    );

                  const totalUsdEu = Math.round(totalCo2Eu * marketParams.priceEuEts);
                  const totalUsdUk = Math.round(totalCo2Uk * marketParams.priceUkEts);
                  const totalUsdCorsia = Math.round(totalCo2Corsia * marketParams.priceCorsia);

                  return (
                    <tfoot>
                      <tr className="bg-gray-100 font-bold border-t-2 border-gray-300 text-gray-900">
                        {/* Columns before Khối lượng SAF */}
                        <td colSpan={3} className="py-3 px-3 text-right font-black text-gray-900 uppercase tracking-wider border-r border-gray-200 bg-gray-100 text-[11px]">
                          Tổng cộng:
                        </td>

                        {/* Total Khối lượng SAF */}
                        <td className="py-3 px-3 text-center align-middle border-r-2 border-gray-300 bg-gray-100 whitespace-nowrap">
                          <span className="font-black text-gray-900 text-xs">{totalSafTonnes.toLocaleString(locale)}</span>{' '}
                          <span className="text-[10px] text-gray-500 font-bold">tấn</span>
                        </td>

                        {/* Total FLS */}
                        <td className="py-3 px-2.5 text-center align-middle border-r border-gray-200 bg-slate-100 text-vna-blue font-black whitespace-nowrap">
                          {totalFlsEu}
                        </td>
                        <td className="py-3 px-2.5 text-center align-middle border-r border-gray-200 bg-slate-100 text-indigo-700 font-black whitespace-nowrap">
                          {totalFlsUk}
                        </td>
                        <td className="py-3 px-2.5 text-center align-middle border-r-2 border-gray-300 bg-slate-100 text-emerald-800 font-black whitespace-nowrap">
                          {totalFlsCorsia}
                        </td>

                        {/* Total CO2 */}
                        <td className="py-3 px-2.5 text-right align-middle border-r border-gray-200 bg-emerald-50/60 font-black text-emerald-700 whitespace-nowrap">
                          -{totalCo2Eu.toLocaleString(locale)}{' '}
                          <span className="text-[10px] font-normal text-gray-500">tCO₂</span>
                        </td>
                        <td className="py-3 px-2.5 text-right align-middle border-r border-gray-200 bg-emerald-50/60 font-black text-emerald-700 whitespace-nowrap">
                          -{totalCo2Uk.toLocaleString(locale)}{' '}
                          <span className="text-[10px] font-normal text-gray-500">tCO₂</span>
                        </td>
                        <td className="py-3 px-2.5 text-right align-middle border-r-2 border-gray-300 bg-emerald-50/60 font-black text-emerald-700 whitespace-nowrap">
                          -{totalCo2Corsia.toLocaleString(locale)}{' '}
                          <span className="text-[10px] font-normal text-gray-500">tCO₂</span>
                        </td>

                        {/* Total USD */}
                        <td className="py-3 px-2.5 text-right align-middle border-r border-gray-200 bg-blue-50/60 font-black text-vna-blue whitespace-nowrap">
                          +{totalUsdEu.toLocaleString(locale)} $
                        </td>
                        <td className="py-3 px-2.5 text-right align-middle border-r border-gray-200 bg-blue-50/60 font-black text-indigo-700 whitespace-nowrap">
                          +{totalUsdUk.toLocaleString(locale)} $
                        </td>
                        <td className="py-3 px-2.5 text-right align-middle border-r-2 border-gray-300 bg-blue-50/60 font-black text-emerald-700 whitespace-nowrap">
                          +{totalUsdCorsia.toLocaleString(locale)} $
                        </td>

                        {/* Action & assignment */}
                        <td className="py-3 px-3 text-center align-middle border-r border-gray-200 bg-gray-100 text-gray-400 font-medium text-[11px]">
                          —
                        </td>
                        <td className="py-3 px-3 text-center align-middle bg-gray-100 text-gray-400 font-medium text-[11px]">
                          —
                        </td>
                      </tr>
                    </tfoot>
                  );
                })()}
              </table>
            </div>

            {/* Matrix Summary Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 text-xs">
              {(() => {
                const totalTonnes = batches.reduce((a, b) => a + b.tonnes, 0);
                const euBatches = batches.filter(b => b.assignedScheme === 'EU_ETS');
                const ukBatches = batches.filter(b => b.assignedScheme === 'UK_ETS');
                const corsiaBatches = batches.filter(b => b.assignedScheme === 'CORSIA');

                const euTonnes = euBatches.reduce((a, b) => a + b.tonnes, 0);
                const ukTonnes = ukBatches.reduce((a, b) => a + b.tonnes, 0);
                const corsiaTonnes = corsiaBatches.reduce((a, b) => a + b.tonnes, 0);

                const euSavedCo2 = euBatches.reduce((sum, b) => {
                  return sum + calculateCo2SavedByScheme(b.tonnes, b.co2SavedPerTonne, 'EU_ETS').totalSaved;
                }, 0);
                const ukSavedCo2 = ukBatches.reduce((sum, b) => {
                  return sum + calculateCo2SavedByScheme(b.tonnes, b.co2SavedPerTonne, 'UK_ETS').totalSaved;
                }, 0);
                const corsiaSavedCo2 = corsiaBatches.reduce((sum, b) => {
                  return sum + calculateCo2SavedByScheme(b.tonnes, b.co2SavedPerTonne, 'CORSIA').totalSaved;
                }, 0);

                const euReducedCost = Math.round(euSavedCo2 * marketParams.priceEuEts);
                const ukReducedCost = Math.round(ukSavedCo2 * marketParams.priceUkEts);
                const corsiaReducedCost = Math.round(corsiaSavedCo2 * marketParams.priceCorsia);
                const totalReducedCost = euReducedCost + ukReducedCost + corsiaReducedCost;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4 sm:gap-6 font-bold text-gray-700 flex-1">
                    <div>
                      <div className="text-gray-700">
                        Tổng SAF: <strong className="text-gray-900">{totalTonnes.toLocaleString(locale)} tấn</strong>
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                        Tổng chi phí được giảm trừ khi áp dụng claim: <strong className="text-emerald-700 font-bold">{totalReducedCost.toLocaleString(locale)} $</strong>
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-700">
                        Claim cho EU: <strong className="text-vna-blue">{euTonnes.toLocaleString(locale)} tấn</strong>
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                        Tổng chi phí được giảm trừ khi áp dụng claim: <strong className="text-vna-blue font-bold">{euReducedCost.toLocaleString(locale)} $</strong>
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-700">
                        Claim cho UK: <strong className="text-indigo-600">{ukTonnes.toLocaleString(locale)} tấn</strong>
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                        Tổng chi phí được giảm trừ khi áp dụng claim: <strong className="text-indigo-600 font-bold">{ukReducedCost.toLocaleString(locale)} $</strong>
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-700">
                        Claim cho CORSIA: <strong className="text-emerald-600">{corsiaTonnes.toLocaleString(locale)} tấn</strong>
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                        Tổng chi phí được giảm trừ khi áp dụng claim: <strong className="text-emerald-600 font-bold">{corsiaReducedCost.toLocaleString(locale)} $</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center gap-3 shrink-0 pt-3 xl:pt-0 border-t xl:border-t-0 border-gray-200 xl:border-l xl:pl-6">
                <span className="text-gray-500 font-semibold">Tổng CO₂ giảm trừ:</span>
                <span className="text-base font-black text-emerald-600">
                  -{batches.reduce((sum, b) => {
                    const { totalSaved } = calculateCo2SavedByScheme(b.tonnes, b.co2SavedPerTonne, b.assignedScheme);
                    return sum + totalSaved;
                  }, 0).toLocaleString(locale)} tCO₂
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 CONTENT: MANUAL SAF ALLOCATION */}
        {allocationMode === 'manual' && (
          <div className="p-5 sm:p-6 space-y-6">

            {/* Top Config Row: Total SAF Input & Quick Helper */}
            <div className="bg-gradient-to-r from-blue-50/50 via-slate-50 to-emerald-50/40 rounded-2xl p-5 border border-blue-100/80">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-vna-blue text-[10px] font-black uppercase tracking-wider">
                      Nhập tay trực tiếp
                    </span>
                    <h4 className="text-sm font-black text-vna-navy">
                      1. Tổng Lượng Nhiên liệu SAF Khả dụng (Available SAF Volume)
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    Nhập tổng số tấn SAF của toàn hãng hàng không muốn đưa vào giả lập. Hệ thống sẽ cho phép phân bổ linh hoạt vào từng cơ chế thị trường bên dưới.
                  </p>

                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-2 mt-3 text-xs">
                    <span className="text-gray-500 font-semibold text-[11px]">Gợi ý nhanh:</span>
                    {[2000, 5000, 8000, 12000, 20000].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setManualSafTonnes(t);
                          const euTarget = Math.min(t, Math.round(marketParams.obligationEuEts / 2.60));
                          const rem1 = Math.max(0, t - euTarget);
                          const ukTarget = Math.min(rem1, Math.round(marketParams.obligationUkEts / 2.60));
                          const rem2 = Math.max(0, rem1 - ukTarget);
                          setManualAllocEu(euTarget);
                          setManualAllocUk(ukTarget);
                          setManualAllocCorsia(rem2);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${manualSafTonnes === t
                          ? 'bg-vna-blue text-white border-vna-blue'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                      >
                        {t.toLocaleString(locale)} tấn
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Tổng lượng SAF nhập</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <FormattedNumberInput
                          value={manualSafTonnes}
                          min={0}
                          onChange={(val) => setManualSafTonnes(val)}
                          className="w-28 text-lg font-black text-vna-navy focus:outline-hidden border-b-2 border-vna-blue pb-0.5 bg-transparent"
                        />
                        <span className="text-xs font-bold text-gray-500">tấn</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleAutoOptimizeManual}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Sparkles size={16} /> Tự động Tối ưu chi phí
                  </Button>
                </div>
              </div>

              {/* Status balance & progress bar */}
              <div className="mt-5 pt-4 border-t border-blue-100/80">
                {(() => {
                  const allocatedTotal = manualAllocEu + manualAllocUk + manualAllocCorsia;
                  const unallocated = manualSafTonnes - allocatedTotal;
                  const pctEu = manualSafTonnes > 0 ? (manualAllocEu / manualSafTonnes) * 100 : 0;
                  const pctUk = manualSafTonnes > 0 ? (manualAllocUk / manualSafTonnes) * 100 : 0;
                  const pctCorsia = manualSafTonnes > 0 ? (manualAllocCorsia / manualSafTonnes) * 100 : 0;
                  const isOver = allocatedTotal > manualSafTonnes;

                  return (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between text-xs font-bold gap-2">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-700">
                            Đã phân bổ: <strong className={isOver ? 'text-rose-600' : 'text-vna-navy'}>{allocatedTotal.toLocaleString(locale)}</strong> / {manualSafTonnes.toLocaleString(locale)} tấn ({manualSafTonnes > 0 ? Math.round((allocatedTotal / manualSafTonnes) * 100) : 0}%)
                          </span>
                          <span className={unallocated >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                            {unallocated >= 0 ? `Còn dư chưa phân bổ: ${unallocated.toLocaleString(locale)} tấn` : `⚠️ Vượt quá tổng SAF: ${Math.abs(unallocated).toLocaleString(locale)} tấn`}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#006885]"></span> EU ETS ({Math.round(pctEu)}%)
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#4f46e5]"></span> UK ETS ({Math.round(pctUk)}%)
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> CORSIA ({Math.round(pctCorsia)}%)
                          </span>
                        </div>
                      </div>

                      {/* Visual Multi-Segment Bar */}
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                        <div style={{ width: `${Math.min(100, pctEu)}%` }} className="bg-[#006885] transition-all duration-300" title={`EU ETS: ${manualAllocEu.toLocaleString(locale)} t`} />
                        <div style={{ width: `${Math.min(100 - pctEu, pctUk)}%` }} className="bg-[#4f46e5] transition-all duration-300" title={`UK ETS: ${manualAllocUk.toLocaleString(locale)} t`} />
                        <div style={{ width: `${Math.min(100 - pctEu - pctUk, pctCorsia)}%` }} className="bg-[#10b981] transition-all duration-300" title={`CORSIA: ${manualAllocCorsia.toLocaleString(locale)} t`} />
                      </div>

                      {isOver && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 mt-2">
                          <AlertTriangle size={15} className="shrink-0" />
                          <span>Tổng lượng phân bổ cho các cơ chế đang vượt quá tổng lượng SAF khả dụng. Hãy điều chỉnh giảm ở các ô bên dưới hoặc tăng tổng lượng SAF.</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 3 Mechanisms Allocation Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-black text-vna-navy">
                  2. Phân bổ Tấn Nhiên liệu SAF cho Từng Cơ chế Thị trường
                </h4>
                <span className="text-xs text-gray-500">Kéo thanh trượt hoặc nhập số tấn tương ứng</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* 1. EU ETS */}
                <div className="bg-white rounded-2xl border-2 border-blue-200 p-5 shadow-xs flex flex-col justify-between hover:border-vna-blue transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-vna-blue flex items-center justify-center font-bold text-xs">
                          EU
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-vna-navy">Cơ chế EU ETS</h5>
                          <span className="text-[10px] text-gray-400 font-semibold">Châu Âu (Hạn ngạch EUA)</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-vna-blue bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        {marketParams.priceEuEts} $ / tCO₂
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5 mb-4">
                      <div className="flex justify-between text-gray-600">
                        <span>Nghĩa vụ nợ gốc:</span>
                        <strong className="text-gray-900">{marketParams.obligationEuEts.toLocaleString(locale)} tCO₂</strong>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>SAF cần để bù 100%:</span>
                        <strong className="text-vna-blue">~{Math.round(marketParams.obligationEuEts / 2.60).toLocaleString(locale)} tấn</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <label>Khối lượng SAF phân bổ:</label>
                        <span className="text-vna-blue font-black">{manualAllocEu.toLocaleString(locale)} tấn</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FormattedNumberInput
                          value={manualAllocEu}
                          min={0}
                          onChange={(val) => setManualAllocEu(val)}
                          className="w-full border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-black text-gray-800 focus:outline-hidden focus:border-vna-blue bg-white"
                        />
                        <span className="text-xs font-bold text-gray-500">tấn</span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max={Math.max(manualSafTonnes, 5000)}
                        step="50"
                        value={manualAllocEu}
                        onChange={(e) => setManualAllocEu(parseFloat(e.target.value) || 0)}
                        className="w-full accent-vna-blue cursor-pointer"
                      />

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <button
                          onClick={() => setManualAllocEu(0)}
                          className="text-gray-400 hover:text-gray-700 underline cursor-pointer"
                        >
                          Về 0
                        </button>
                        <button
                          onClick={() => setManualAllocEu(Math.min(manualSafTonnes, Math.round(marketParams.obligationEuEts / 2.60)))}
                          className="text-vna-blue hover:underline font-bold cursor-pointer"
                        >
                          Bù 100% nợ EU
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs space-y-1.5 bg-blue-50/30 -mx-5 -mb-5 p-4 rounded-b-2xl">
                    <div className="flex justify-between text-gray-600">
                      <span>CO₂ giảm trừ (2.60x):</span>
                      <span className="font-bold text-emerald-700">-{Math.round(manualAllocEu * 2.60).toLocaleString(locale)} tCO₂</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tiết kiệm chi phí đền bù:</span>
                      <div className="text-right">
                        <span className="font-black text-vna-blue">+{Math.round(manualAllocEu * 2.60 * marketParams.priceEuEts).toLocaleString(locale)} $</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. UK ETS */}
                <div className="bg-white rounded-2xl border-2 border-indigo-200 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-500 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          UK
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-vna-navy">Cơ chế UK ETS</h5>
                          <span className="text-[10px] text-gray-400 font-semibold">Vương quốc Anh (Hạn ngạch UKA)</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                        {marketParams.priceUkEts} $ / tCO₂
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5 mb-4">
                      <div className="flex justify-between text-gray-600">
                        <span>Nghĩa vụ nợ gốc:</span>
                        <strong className="text-gray-900">{marketParams.obligationUkEts.toLocaleString(locale)} tCO₂</strong>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>SAF cần để bù 100%:</span>
                        <strong className="text-indigo-600">~{Math.round(marketParams.obligationUkEts / 2.60).toLocaleString(locale)} tấn</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <label>Khối lượng SAF phân bổ:</label>
                        <span className="text-indigo-700 font-black">{manualAllocUk.toLocaleString(locale)} tấn</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FormattedNumberInput
                          value={manualAllocUk}
                          min={0}
                          onChange={(val) => setManualAllocUk(val)}
                          className="w-full border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-black text-gray-800 focus:outline-hidden focus:border-indigo-500 bg-white"
                        />
                        <span className="text-xs font-bold text-gray-500">tấn</span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max={Math.max(manualSafTonnes, 5000)}
                        step="50"
                        value={manualAllocUk}
                        onChange={(e) => setManualAllocUk(parseFloat(e.target.value) || 0)}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <button
                          onClick={() => setManualAllocUk(0)}
                          className="text-gray-400 hover:text-gray-700 underline cursor-pointer"
                        >
                          Về 0
                        </button>
                        <button
                          onClick={() => setManualAllocUk(Math.min(manualSafTonnes, Math.round(marketParams.obligationUkEts / 2.60)))}
                          className="text-indigo-600 hover:underline font-bold cursor-pointer"
                        >
                          Bù 100% nợ UK
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs space-y-1.5 bg-indigo-50/30 -mx-5 -mb-5 p-4 rounded-b-2xl">
                    <div className="flex justify-between text-gray-600">
                      <span>CO₂ giảm trừ (2.60x):</span>
                      <span className="font-bold text-emerald-700">-{Math.round(manualAllocUk * 2.60).toLocaleString(locale)} tCO₂</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tiết kiệm chi phí đền bù:</span>
                      <div className="text-right">
                        <span className="font-black text-indigo-700">+{Math.round(manualAllocUk * 2.60 * marketParams.priceUkEts).toLocaleString(locale)} $</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. CORSIA */}
                <div className="bg-white rounded-2xl border-2 border-emerald-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-500 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          <Globe size={16} />
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-vna-navy">Cơ chế CORSIA</h5>
                          <span className="text-[10px] text-gray-400 font-semibold">Chuyến bay quốc tế toàn cầu</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {marketParams.priceCorsia} $ / tCO₂
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5 mb-4">
                      <div className="flex justify-between text-gray-600">
                        <span>Nghĩa vụ nợ gốc:</span>
                        <strong className="text-gray-900">{marketParams.obligationCorsia.toLocaleString(locale)} tCO₂</strong>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>SAF cần để bù 100%:</span>
                        <strong className="text-emerald-700">~{Math.round(marketParams.obligationCorsia / 2.55).toLocaleString(locale)} tấn</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <label>Khối lượng SAF phân bổ:</label>
                        <span className="text-emerald-700 font-black">{manualAllocCorsia.toLocaleString(locale)} tấn</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FormattedNumberInput
                          value={manualAllocCorsia}
                          min={0}
                          onChange={(val) => setManualAllocCorsia(val)}
                          className="w-full border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-black text-gray-800 focus:outline-hidden focus:border-emerald-500 bg-white"
                        />
                        <span className="text-xs font-bold text-gray-500">tấn</span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max={Math.max(manualSafTonnes, 5000)}
                        step="50"
                        value={manualAllocCorsia}
                        onChange={(e) => setManualAllocCorsia(parseFloat(e.target.value) || 0)}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <button
                          onClick={() => setManualAllocCorsia(0)}
                          className="text-gray-400 hover:text-gray-700 underline cursor-pointer"
                        >
                          Về 0
                        </button>
                        <button
                          onClick={() => setManualAllocCorsia(Math.max(0, manualSafTonnes - manualAllocEu - manualAllocUk))}
                          className="text-emerald-700 hover:underline font-bold cursor-pointer"
                        >
                          Dồn phần còn lại vào CORSIA
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs space-y-1.5 bg-emerald-50/30 -mx-5 -mb-5 p-4 rounded-b-2xl">
                    <div className="flex justify-between text-gray-600">
                      <span>CO₂ giảm trừ (2.55x):</span>
                      <span className="font-bold text-emerald-700">-{Math.round(manualAllocCorsia * 2.55).toLocaleString(locale)} tCO₂</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tiết kiệm chi phí đền bù:</span>
                      <div className="text-right">
                        <span className="font-black text-emerald-700">+{Math.round(manualAllocCorsia * 2.55 * marketParams.priceCorsia).toLocaleString(locale)} $</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Manual Summary Bar */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span>Tổng SAF phân bổ: <strong className="text-gray-900">{(manualAllocEu + manualAllocUk + manualAllocCorsia).toLocaleString(locale)} tấn</strong></span>
                <span>Claim EU: <strong className="text-vna-blue">{manualAllocEu.toLocaleString(locale)} tấn</strong></span>
                <span>Claim UK: <strong className="text-indigo-600">{manualAllocUk.toLocaleString(locale)} tấn</strong></span>
                <span>Claim CORSIA: <strong className="text-emerald-600">{manualAllocCorsia.toLocaleString(locale)} tấn</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-gray-500 font-semibold">Tổng chi phí mua đền bù còn lại:</span>
                <div className="text-right">
                  <span className="text-base font-black text-vna-blue">
                    {currentMetrics.totalCost.toLocaleString(locale)} $
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>


      {/* TWO KEY FINANCIAL & ESG KPI CARDS (CO2 OFFSET/CREDITS & CHI PHÍ TUÂN THỦ - TỔNG & CHI TIẾT TỐI GIẢN) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-vna-navy uppercase tracking-wide">
              Chỉ số Hiệu quả Tài chính & Bù trừ Phát thải Toàn Hãng
            </h3>
            {/* <p className="text-xs text-gray-500">
              Tổng hợp khối lượng CO₂ giảm thiểu, số tín chỉ cần bù đắp và chi phí tuân thủ theo kịch bản phân bổ hiện tại
            </p> */}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* KPI CARD 1: CO2 OFFSET & GIẢM THIỂU + TÍN CHỈ CO2 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs relative overflow-hidden group hover:border-emerald-500 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    1. CO₂ Offset & Giảm thiểu
                  </p>
                  <h3 className="text-2xl font-black text-emerald-700 mt-1">
                    {executiveKpiMetrics.totalCo2Saved.toLocaleString(locale)} <span className="text-sm font-bold text-gray-500">tCO₂</span>
                  </h3>

                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Leaf size={22} />
                </div>
              </div>

              {/* TỔNG PHÁT THẢI BẢNG CŨ */}
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between items-center">
                  <span>• Tổng phát thải CO2:</span>
                  <span className="font-bold text-gray-800">{executiveKpiMetrics.totalGrossEmission.toLocaleString(locale)} tCO₂</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>• Hạn ngạch miễn phí:</span>
                  <span className="font-bold text-blue-600">-{executiveKpiMetrics.totalFree.toLocaleString(locale)} tCO₂</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>• CO₂ giảm do nạp SAF:</span>
                  <span className="font-bold text-emerald-600">-{executiveKpiMetrics.totalCo2Saved.toLocaleString(locale)} tCO₂</span>
                </div>
                <div className="flex justify-between items-center font-bold text-gray-900 pt-1 border-t border-gray-100">
                  <span className="text-amber-700">• CO₂ còn lại:</span>
                  <span className="text-amber-700 font-black">{executiveKpiMetrics.co2Remaining.toLocaleString(locale)} tCO₂</span>
                </div>
              </div>

              {/* PHẦN CHI TIẾT TỐI GIẢN: SỐ TÍN CHỈ PHẢI MUA (1 tCO2 = 1 Tín chỉ) */}
              <div className="mt-3.5 pt-3 border-t border-dashed border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                    Số tín chỉ CO₂ phải mua:
                  </span>
                  <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {(currentMetrics.residualEuCo2 + currentMetrics.residualUkCo2 + currentMetrics.residualCorsiaCo2).toLocaleString(locale)} tín chỉ
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-600 pl-2 border-l-2 border-amber-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">• EU ETS (EUA):</span>
                    <span className="font-semibold text-gray-800">{currentMetrics.residualEuCo2.toLocaleString(locale)} <span className="text-[10px] text-gray-400">tín chỉ</span></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">• UK ETS (UKA):</span>
                    <span className="font-semibold text-gray-800">{currentMetrics.residualUkCo2.toLocaleString(locale)} <span className="text-[10px] text-gray-400">tín chỉ</span></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">• CORSIA (CEU):</span>
                    <span className="font-semibold text-gray-800">{currentMetrics.residualCorsiaCo2.toLocaleString(locale)} <span className="text-[10px] text-gray-400">tín chỉ</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI CARD 2: TỔNG CHI PHÍ TUÂN THỦ + CHI TIẾT CHI PHÍ MUA TÍN CHỈ */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs relative overflow-hidden group hover:border-vna-blue transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    2. Tổng Chi phí Tuân thủ
                  </p>
                  <h3 className="text-2xl font-black text-vna-navy mt-1">
                    {formatNumber(executiveKpiMetrics.totalScenarioCost / 1000000, 2, currentLang)}M $
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-vna-blue flex items-center justify-center shrink-0">
                  <DollarSign size={22} />
                </div>
              </div>

              {/* PHẦN 1: MUA SAF & CHI PHÍ MUA SAF DỰ KIẾN THEO CƠ CHẾ */}
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs">
                <div className="flex justify-between items-center text-gray-700 font-bold mb-2">
                  <span>• Mua SAF ({executiveKpiMetrics.totalAllocatedSaf.toLocaleString(locale)} tấn):</span>
                  <div className="text-right">
                    <span className="font-black text-gray-900">{formatNumber(executiveKpiMetrics.safCost / 1000000, 2, currentLang)}M $</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-gray-200">
                  <div className="mb-2">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                      Chi phí mua SAF dự kiến:
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 pl-2 border-l-2 border-emerald-400">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">• EU ETS ({currentMetrics.safEuTonnes.toLocaleString(locale)} tấn):</span>
                      <div className="text-right">
                        <span className="font-semibold text-gray-800">{executiveKpiMetrics.safCostEu.toLocaleString(locale)} $</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">• UK ETS ({currentMetrics.safUkTonnes.toLocaleString(locale)} tấn):</span>
                      <div className="text-right">
                        <span className="font-semibold text-gray-800">{executiveKpiMetrics.safCostUk.toLocaleString(locale)} $</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">• CORSIA ({currentMetrics.safCorsiaTonnes.toLocaleString(locale)} tấn):</span>
                      <div className="text-right">
                        <span className="font-semibold text-gray-800">{executiveKpiMetrics.safCostCorsia.toLocaleString(locale)} $</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PHẦN 2: MUA TÍN CHỈ CO2 CÒN LẠI & CHI PHÍ MUA TÍN CHỈ DỰ KIẾN THEO CƠ CHẾ */}
              <div className="mt-3.5 pt-3 border-t border-dashed border-gray-200 text-xs">
                <div className="flex justify-between items-center text-gray-700 font-bold mb-2">
                  <span>• Mua tín chỉ CO₂ còn lại:</span>
                  <div className="text-right">
                    <span className="font-black text-gray-900">{formatNumber(executiveKpiMetrics.totalCreditCost / 1000000, 2, currentLang)}M $</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-gray-200">
                  <div className="mb-2">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                      Chi phí mua tín chỉ dự kiến:
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 pl-2 border-l-2 border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">• EU ETS ({marketParams.priceEuEts} $/EUA):</span>
                      <div className="text-right">
                        <span className="font-semibold text-gray-800">{currentMetrics.costEu.toLocaleString(locale)} $</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">• UK ETS ({marketParams.priceUkEts} $/UKA):</span>
                      <div className="text-right">
                        <span className="font-semibold text-gray-800">{currentMetrics.costUk.toLocaleString(locale)} $</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">• CORSIA ({marketParams.priceCorsia} $/CEU):</span>
                      <div className="text-right">
                        <span className="font-semibold text-gray-800">{currentMetrics.costCorsia.toLocaleString(locale)} $</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM ACTION BAR - DANH SÁCH & LƯU KỊCH BẢN */}
        <div className="pt-4 flex items-center justify-between border-t border-gray-200">
          {/* <Button
            onClick={() => setIsScenarioListModalOpen(true)}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer bg-white"
          >
            <BookmarkCheck size={16} className="text-vna-blue" />
            {currentLang === 'vi' ? 'Xem Danh sách kịch bản' : 'View Saved Scenarios'}
            <span className="px-2 py-0.5 bg-blue-50 text-vna-blue text-xs font-black rounded-full border border-blue-200">
              {savedScenarios.length}
            </span>
          </Button> */}

          <Button
            onClick={() => {
              setScenarioNameInput(`Kịch bản ${reportPeriod} (${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`);
              setIsSaveNameModalOpen(true);
            }}
            className="bg-vna-blue hover:bg-[#00556e] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Save size={18} />
            {currentLang === 'vi' ? 'Lưu kịch bản' : 'Save Scenario'}
          </Button>
        </div>
      </div>

      {/* SCENARIO COMPARISON MODAL */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-7xl max-h-[92vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-vna-blue flex items-center justify-center font-bold">
                  <BarChart3 size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-vna-navy">
                    So sánh Các Phương án & Kịch bản Phân bổ SAF
                  </h3>
                  {/* <p className="text-xs text-gray-500">
                    Lựa chọn các kịch bản trong danh sách để đối chiếu chi phí tuân thủ, số tín chỉ CO₂ cần mua và hiệu quả bù trừ
                  </p> */}
                </div>
              </div>

              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Sub-Header: SCENARIO SELECTION TOOLBAR WITH DEDICATED BUTTON & CHIPS */}
            <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  onClick={() => {
                    setTempSelectedScenarioIds([...selectedScenarioIdsForCompare]);
                    setSearchScenarioQuery('');
                    setIsSelectScenariosPickerOpen(true);
                  }}
                  className="bg-vna-blue hover:bg-[#00556e] text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <SlidersHorizontal size={15} />
                  <span>Chọn kịch bản so sánh</span>
                  <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[11px] font-black">
                    {selectedScenarioIdsForCompare.length}
                  </span>
                </Button>

                <div className="hidden sm:flex items-center gap-1.5 text-gray-500 text-xs">
                  <span>Đang đối chiếu <strong>{selectedScenarioIdsForCompare.length} kịch bản</strong>:</span>
                </div>

                {/* Preview Selected Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedScenarioIdsForCompare.includes('CURRENT') && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-200/80 text-gray-800 text-[11px] font-bold">
                      Hiện tại
                    </span>
                  )}
                  {savedScenarios
                    .filter((sc) => selectedScenarioIdsForCompare.includes(sc.id))
                    .slice(0, 3)
                    .map((sc) => (
                      <span
                        key={sc.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-vna-blue border border-blue-200 text-[11px] font-bold max-w-[180px] truncate"
                        title={sc.name}
                      >
                        {sc.name}
                      </span>
                    ))}
                  {selectedScenarioIdsForCompare.filter((id) => id !== 'CURRENT').length > 3 && (
                    <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-bold">
                      +{selectedScenarioIdsForCompare.filter((id) => id !== 'CURRENT').length - 3} kịch bản khác
                    </span>
                  )}
                </div>
              </div>

              {/* <div className="flex items-center gap-3">
                <span className="text-gray-400 italic text-[11px] hidden md:inline">
                  * Nhấp "Chọn kịch bản so sánh" để tìm kiếm, chọn hoặc bỏ bớt kịch bản
                </span>
              </div> */}
            </div>

            {/* Modal Scrollable Content: Dynamic Comparison Matrix Table */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/90 text-gray-700">
                        <th className="py-4 px-4 font-bold text-gray-500 uppercase tracking-wider text-[11px] w-[230px] bg-gray-100/60 sticky left-0 z-10">
                          Tiêu chí So sánh
                        </th>

                        {/* Dynamic Columns for Selected Scenarios */}
                        {(() => {
                          const getScenarioCompareMetrics = (batchList: SafBatch[] = [], params: MarketParams = marketParams) => {
                            const m = calculateMetricsForBatches(batchList, params);
                            const totalSaf = m.safEuTonnes + m.safUkTonnes + m.safCorsiaTonnes;
                            const totalCo2Saved = m.co2EuSaved + m.co2UkSaved + m.co2CorsiaSaved;
                            const totalResidualCredits = m.residualEuCo2 + m.residualUkCo2 + m.residualCorsiaCo2;

                            const rateEu = params.rateEuEts ?? 25450;
                            const rateUk = params.rateUkEts ?? 25450;
                            const rateCorsia = params.rateCorsia ?? 25450;

                            // Chi phí mua SAF (đơn giá 2.450 $/tấn)
                            const safCostPerTonne = 2450;
                            const safEuCost = m.safEuTonnes * safCostPerTonne;
                            const safEuCostVnd = Math.round(safEuCost * rateEu);
                            const safUkCost = m.safUkTonnes * safCostPerTonne;
                            const safUkCostVnd = Math.round(safUkCost * rateUk);
                            const safCorsiaCost = m.safCorsiaTonnes * safCostPerTonne;
                            const safCorsiaCostVnd = Math.round(safCorsiaCost * rateCorsia);
                            const safTotalCost = safEuCost + safUkCost + safCorsiaCost;
                            const safTotalCostVnd = safEuCostVnd + safUkCostVnd + safCorsiaCostVnd;

                            // Chi phí được giảm trừ khi áp dụng claim SAF theo từng cơ chế
                            const euReducedCost = Math.round(m.co2EuSaved * params.priceEuEts);
                            const euReducedCostVnd = Math.round(euReducedCost * rateEu);
                            const ukReducedCost = Math.round(m.co2UkSaved * params.priceUkEts);
                            const ukReducedCostVnd = Math.round(ukReducedCost * rateUk);
                            const corsiaReducedCost = Math.round(m.co2CorsiaSaved * params.priceCorsia);
                            const corsiaReducedCostVnd = Math.round(corsiaReducedCost * rateCorsia);
                            const totalReducedCost = euReducedCost + ukReducedCost + corsiaReducedCost;
                            const totalReducedCostVnd = euReducedCostVnd + ukReducedCostVnd + corsiaReducedCostVnd;

                            // Tổng chi phí tuân thủ toàn diện (Mua SAF + Mua tín chỉ CO2 còn lại)
                            const totalComplianceCost = safTotalCost + m.totalCost;
                            const totalComplianceCostVnd = safTotalCostVnd + m.totalCostVnd;

                            return {
                              ...m,
                              totalSaf,
                              totalCo2Saved,
                              totalResidualCredits,
                              safTotalCost,
                              safTotalCostVnd,
                              safEuCost,
                              safEuCostVnd,
                              safUkCost,
                              safUkCostVnd,
                              safCorsiaCost,
                              safCorsiaCostVnd,
                              euReducedCost,
                              euReducedCostVnd,
                              ukReducedCost,
                              ukReducedCostVnd,
                              corsiaReducedCost,
                              corsiaReducedCostVnd,
                              totalReducedCost,
                              totalReducedCostVnd,
                              totalComplianceCost,
                              totalComplianceCostVnd
                            };
                          };

                          // Build scenario objects
                          const columns: any[] = [];

                          if (selectedScenarioIdsForCompare.includes('CURRENT')) {
                            columns.push({
                              id: 'CURRENT',
                              name: 'Phương án Hiện tại',
                              badge: 'Đang cấu hình',
                              badgeColor: 'bg-gray-200 text-gray-700',
                              subtext: 'Theo cấu hình đang chỉnh sửa',
                              period: reportPeriod,
                              allocationMode: allocationMode,
                              metrics: getScenarioCompareMetrics(activeBatches, marketParams),
                              onApply: null
                            });
                          }

                          savedScenarios.forEach((sc) => {
                            if (selectedScenarioIdsForCompare.includes(sc.id)) {
                              columns.push({
                                id: sc.id,
                                name: sc.name,
                                badge: sc.period,
                                badgeColor: 'bg-blue-50 text-vna-blue border border-blue-200',
                                subtext: sc.savedAt,
                                period: sc.period,
                                allocationMode: sc.allocationMode,
                                metrics: getScenarioCompareMetrics(sc.batches, sc.marketParams),
                                onApply: () => handleLoadScenario(sc)
                              });
                            }
                          });

                          return columns.map((col) => (
                            <th key={col.id} className="py-4 px-4 font-bold text-center border-l border-gray-200 min-w-[210px]">
                              <div className="flex flex-col items-center gap-1">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${col.badgeColor}`}>
                                  {col.badge}
                                </span>
                                <span className="text-xs font-black text-vna-navy line-clamp-1" title={col.name}>
                                  {col.name}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                  {col.subtext}
                                </span>
                              </div>
                            </th>
                          ));
                        })()}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 font-sans">
                      {(() => {
                        const getScenarioCompareMetrics = (batchList: SafBatch[] = [], params: MarketParams = marketParams) => {
                          const m = calculateMetricsForBatches(batchList, params);
                          const totalSaf = m.safEuTonnes + m.safUkTonnes + m.safCorsiaTonnes;
                          const totalCo2Saved = m.co2EuSaved + m.co2UkSaved + m.co2CorsiaSaved;
                          const totalResidualCredits = m.residualEuCo2 + m.residualUkCo2 + m.residualCorsiaCo2;

                          const rateEu = params.rateEuEts ?? 25450;
                          const rateUk = params.rateUkEts ?? 25450;
                          const rateCorsia = params.rateCorsia ?? 25450;

                          const safCostPerTonne = 2450;
                          const safEuCost = m.safEuTonnes * safCostPerTonne;
                          const safEuCostVnd = Math.round(safEuCost * rateEu);
                          const safUkCost = m.safUkTonnes * safCostPerTonne;
                          const safUkCostVnd = Math.round(safUkCost * rateUk);
                          const safCorsiaCost = m.safCorsiaTonnes * safCostPerTonne;
                          const safCorsiaCostVnd = Math.round(safCorsiaCost * rateCorsia);
                          const safTotalCost = safEuCost + safUkCost + safCorsiaCost;
                          const safTotalCostVnd = safEuCostVnd + safUkCostVnd + safCorsiaCostVnd;

                          const euReducedCost = Math.round(m.co2EuSaved * params.priceEuEts);
                          const euReducedCostVnd = Math.round(euReducedCost * rateEu);
                          const ukReducedCost = Math.round(m.co2UkSaved * params.priceUkEts);
                          const ukReducedCostVnd = Math.round(ukReducedCost * rateUk);
                          const corsiaReducedCost = Math.round(m.co2CorsiaSaved * params.priceCorsia);
                          const corsiaReducedCostVnd = Math.round(corsiaReducedCost * rateCorsia);
                          const totalReducedCost = euReducedCost + ukReducedCost + corsiaReducedCost;
                          const totalReducedCostVnd = euReducedCostVnd + ukReducedCostVnd + corsiaReducedCostVnd;

                          const totalComplianceCost = safTotalCost + m.totalCost;
                          const totalComplianceCostVnd = safTotalCostVnd + m.totalCostVnd;

                          return {
                            ...m,
                            totalSaf,
                            totalCo2Saved,
                            totalResidualCredits,
                            safTotalCost,
                            safTotalCostVnd,
                            safEuCost,
                            safEuCostVnd,
                            safUkCost,
                            safUkCostVnd,
                            safCorsiaCost,
                            safCorsiaCostVnd,
                            euReducedCost,
                            euReducedCostVnd,
                            ukReducedCost,
                            ukReducedCostVnd,
                            corsiaReducedCost,
                            corsiaReducedCostVnd,
                            totalReducedCost,
                            totalReducedCostVnd,
                            totalComplianceCost,
                            totalComplianceCostVnd
                          };
                        };

                        // Precalculate columns for the body
                        const cols: any[] = [];
                        if (selectedScenarioIdsForCompare.includes('CURRENT')) {
                          cols.push({
                            id: 'CURRENT',
                            isCurrent: true,
                            name: 'Phương án Hiện tại',
                            metrics: getScenarioCompareMetrics(activeBatches, marketParams),
                            onApply: null
                          });
                        }

                        savedScenarios.forEach((sc) => {
                          if (selectedScenarioIdsForCompare.includes(sc.id)) {
                            cols.push({
                              id: sc.id,
                              isCurrent: false,
                              name: sc.name,
                              metrics: getScenarioCompareMetrics(sc.batches, sc.marketParams),
                              onApply: () => handleLoadScenario(sc)
                            });
                          }
                        });

                        return (
                          <>
                            {/* SECTION 1: TỔNG CHI PHÍ & TIẾT KIỆM */}
                            <tr className="bg-blue-50/60 font-black text-[11px] text-vna-navy uppercase tracking-wider">
                              <td colSpan={cols.length + 1} className="py-2.5 px-4 bg-blue-50/80">
                                1. Tổng Chi phí & Hiệu quả Giảm trừ Toàn hãng
                              </td>
                            </tr>

                            {/* Row: Tổng Chi phí Tuân thủ Toàn diện */}
                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-3 px-4 font-bold text-gray-900 sticky left-0 bg-white shadow-2xs">
                                Tổng chi phí tuân thủ toàn diện (SAF + Tín chỉ)
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-3 px-4 text-center border-l border-gray-200">
                                  <span className="text-sm font-black text-vna-navy">
                                    {c.metrics.totalComplianceCost.toLocaleString(locale)} $
                                  </span>
                                </td>
                              ))}
                            </tr>

                            {/* Row: Chi phí Mua Tín chỉ Carbon Còn lại */}
                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2.5 px-4 font-semibold text-gray-700 sticky left-0 bg-white">
                                • Chi phí mua tín chỉ carbon còn lại ($)
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2.5 px-4 text-center border-l border-gray-200">
                                  <span className="font-bold text-gray-800">
                                    {c.metrics.totalCost.toLocaleString(locale)} $
                                  </span>
                                </td>
                              ))}
                            </tr>

                            {/* Row: Chi phí Mua SAF Dự kiến */}
                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2.5 px-4 font-semibold text-gray-700 sticky left-0 bg-white">
                                • Chi phí mua nhiên liệu SAF ($)
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2.5 px-4 text-center border-l border-gray-200">
                                  <span className="font-bold text-vna-blue">
                                    {c.metrics.safTotalCost.toLocaleString(locale)} $
                                  </span>
                                </td>
                              ))}
                            </tr>

                            {/* Row: Tổng Chi phí Được Giảm Trừ Khi Áp Dụng Claim SAF */}
                            <tr className="hover:bg-gray-50/80 transition-colors bg-emerald-50/30">
                              <td className="py-3 px-4 font-black text-emerald-800 sticky left-0 bg-emerald-50/50">
                                Tổng chi phí được giảm trừ khi áp dụng claim SAF
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-3 px-4 text-center border-l border-gray-200 bg-emerald-50/20">
                                  <div className="text-sm font-black text-emerald-700">
                                    +{c.metrics.totalReducedCost.toLocaleString(locale)} $
                                  </div>
                                </td>
                              ))}
                            </tr>

                            {/* Row: Tiết kiệm so với không dùng SAF */}
                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2.5 px-4 font-semibold text-gray-700 sticky left-0 bg-white">
                                Tiết kiệm so với kịch bản không nạp SAF
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2.5 px-4 text-center border-l border-gray-200 font-bold text-emerald-700">
                                  +{c.metrics.totalSavedVsGross.toLocaleString(locale)} $
                                </td>
                              ))}
                            </tr>

                            {/* Row: Chênh lệch so với Hiện tại */}
                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2.5 px-4 font-semibold text-gray-700 sticky left-0 bg-white">
                                Chênh lệch chi phí so với Hiện tại
                              </td>
                              {cols.map((c) => {
                                if (c.isCurrent) {
                                  return (
                                    <td key={c.id} className="py-2.5 px-4 text-center border-l border-gray-200 font-bold text-gray-400">
                                      (Gốc so sánh)
                                    </td>
                                  );
                                }
                                const diff = c.metrics.totalCost - currentMetrics.totalCost;
                                return (
                                  <td key={c.id} className="py-2.5 px-4 text-center border-l border-gray-200 font-bold">
                                    {diff === 0 ? (
                                      <span className="text-gray-400">Bằng nhau</span>
                                    ) : diff < 0 ? (
                                      <span className="text-emerald-700">Tiết kiệm {Math.abs(diff).toLocaleString(locale)} $</span>
                                    ) : (
                                      <span className="text-rose-600">Cao hơn +{diff.toLocaleString(locale)} $</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>

                            {/* SECTION 2: THÔNG TIN NGUYÊN LIỆU SAF & PHÂN BỔ */}
                            <tr className="bg-blue-50/60 font-black text-[11px] text-vna-navy uppercase tracking-wider">
                              <td colSpan={cols.length + 1} className="py-2.5 px-4 bg-blue-50/80">
                                2. Thông tin Phân bổ Nhiên liệu SAF (Tấn) & Chi phí Mua SAF
                              </td>
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors bg-blue-50/20">
                              <td className="py-2.5 px-4 font-bold text-gray-900 sticky left-0 bg-white">
                                Tổng lượng SAF phân bổ (Tấn)
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2.5 px-4 text-center border-l border-gray-200 font-black text-vna-blue text-xs">
                                  {c.metrics.totalSaf.toLocaleString(locale)} tấn
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-600 sticky left-0 bg-white pl-6">
                                • Phân bổ cho EU ETS
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200 font-semibold text-vna-blue">
                                  {c.metrics.safEuTonnes.toLocaleString(locale)} tấn
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-600 sticky left-0 bg-white pl-6">
                                • Phân bổ cho UK ETS
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200 font-semibold text-indigo-600">
                                  {c.metrics.safUkTonnes.toLocaleString(locale)} tấn
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-600 sticky left-0 bg-white pl-6">
                                • Phân bổ cho CORSIA
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200 font-semibold text-emerald-600">
                                  {c.metrics.safCorsiaTonnes.toLocaleString(locale)} tấn
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2.5 px-4 font-bold text-gray-900 sticky left-0 bg-white">
                                Tổng chi phí mua SAF ($)
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2.5 px-4 text-center border-l border-gray-200 font-bold text-gray-800">
                                  {c.metrics.safTotalCost.toLocaleString(locale)} $
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-600 sticky left-0 bg-white pl-6">
                                • Chi phí mua SAF cho EU ETS
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200">
                                  <span className="font-semibold text-gray-800">{c.metrics.safEuCost.toLocaleString(locale)} $</span>
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-600 sticky left-0 bg-white pl-6">
                                • Chi phí mua SAF cho UK ETS
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200">
                                  <span className="font-semibold text-gray-800">{c.metrics.safUkCost.toLocaleString(locale)} $</span>
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-600 sticky left-0 bg-white pl-6">
                                • Chi phí mua SAF cho CORSIA
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200">
                                  <span className="font-semibold text-gray-800">{c.metrics.safCorsiaCost.toLocaleString(locale)} $</span>
                                </td>
                              ))}
                            </tr>

                            {/* SECTION 3: CHI PHÍ ĐƯỢC GIẢM TRỪ TỪ CLAIM SAF THEO TỪNG CƠ CHẾ */}
                            <tr className="bg-blue-50/60 font-black text-[11px] text-vna-navy uppercase tracking-wider">
                              <td colSpan={cols.length + 1} className="py-2.5 px-4 bg-blue-50/80">
                                3. Chi phí Được Giảm Trừ Từ Claim SAF Theo Từng Cơ chế ($)
                              </td>
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors bg-emerald-50/30">
                              <td className="py-3 px-4 font-black text-emerald-800 sticky left-0 bg-white">
                                Tổng chi phí được giảm trừ khi áp dụng claim
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-3 px-4 text-center border-l border-gray-200 bg-emerald-50/20">
                                  <div className="text-sm font-black text-emerald-700">
                                    +{c.metrics.totalReducedCost.toLocaleString(locale)} $
                                  </div>
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2.5 px-4 font-semibold text-gray-700 sticky left-0 bg-white pl-6">
                                • Giảm trừ nghĩa vụ EU ETS
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2.5 px-4 text-center border-l border-gray-200">
                                  <span className="font-bold text-vna-blue">+{c.metrics.euReducedCost.toLocaleString(locale)} $</span>
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2.5 px-4 font-semibold text-gray-700 sticky left-0 bg-white pl-6">
                                • Giảm trừ nghĩa vụ UK ETS
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2.5 px-4 text-center border-l border-gray-200">
                                  <span className="font-bold text-indigo-600">+{c.metrics.ukReducedCost.toLocaleString(locale)} $</span>
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2.5 px-4 font-semibold text-gray-700 sticky left-0 bg-white pl-6">
                                • Giảm trừ nghĩa vụ CORSIA
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2.5 px-4 text-center border-l border-gray-200">
                                  <span className="font-bold text-emerald-600">+{c.metrics.corsiaReducedCost.toLocaleString(locale)} $</span>
                                </td>
                              ))}
                            </tr>

                            {/* SECTION 4: GIẢM PHÁT THẢI CO2 TỪ NẠP SAF */}
                            <tr className="bg-blue-50/60 font-black text-[11px] text-vna-navy uppercase tracking-wider">
                              <td colSpan={cols.length + 1} className="py-2.5 px-4 bg-blue-50/80">
                                4. Lượng Giảm Thiểu Phát Thải CO₂ Từ SAF (tCO₂)
                              </td>
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2.5 px-4 font-bold text-gray-900 sticky left-0 bg-white">
                                Tổng CO₂ giảm trừ toàn hãng
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2.5 px-4 text-center border-l border-gray-200 font-black text-emerald-700">
                                  -{c.metrics.totalCo2Saved.toLocaleString(locale)} tCO₂
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-600 sticky left-0 bg-white pl-6">
                                • Lượng CO₂ giảm trừ tại EU ETS
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200 text-gray-700">
                                  -{c.metrics.co2EuSaved.toLocaleString(locale)} tCO₂
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-600 sticky left-0 bg-white pl-6">
                                • Lượng CO₂ giảm trừ tại UK ETS
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200 text-gray-700">
                                  -{c.metrics.co2UkSaved.toLocaleString(locale)} tCO₂
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-600 sticky left-0 bg-white pl-6">
                                • Lượng CO₂ giảm trừ tại CORSIA
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200 text-gray-700">
                                  -{c.metrics.co2CorsiaSaved.toLocaleString(locale)} tCO₂
                                </td>
                              ))}
                            </tr>

                            {/* SECTION 5: NHU CẦU MUA TÍN CHỈ CARBON CÒN LẠI */}
                            <tr className="bg-blue-50/60 font-black text-[11px] text-vna-navy uppercase tracking-wider">
                              <td colSpan={cols.length + 1} className="py-2.5 px-4 bg-blue-50/80">
                                5. Nhu cầu Mua Tín chỉ Carbon Còn Lại
                              </td>
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2.5 px-4 font-bold text-gray-800 sticky left-0 bg-white">
                                Tổng số tín chỉ phải mua (Tín chỉ)
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2.5 px-4 text-center border-l border-gray-200 font-black text-amber-800">
                                  {c.metrics.totalResidualCredits.toLocaleString(locale)} tín chỉ
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-600 sticky left-0 bg-white pl-6">
                                • Tín chỉ EU ETS (EUA)
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200 text-gray-700">
                                  {c.metrics.residualEuCo2.toLocaleString(locale)} EUA
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-600 sticky left-0 bg-white pl-6">
                                • Tín chỉ UK ETS (UKA)
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200 text-gray-700">
                                  {c.metrics.residualUkCo2.toLocaleString(locale)} UKA
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-600 sticky left-0 bg-white pl-6">
                                • Tín chỉ CORSIA (CEU)
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200 text-gray-700">
                                  {c.metrics.residualCorsiaCo2.toLocaleString(locale)} CEU
                                </td>
                              ))}
                            </tr>

                            {/* SECTION 6: CHI TIẾT CHI PHÍ MUA TÍN CHỈ THEO CƠ CHẾ */}
                            <tr className="bg-blue-50/60 font-black text-[11px] text-vna-navy uppercase tracking-wider">
                              <td colSpan={cols.length + 1} className="py-2.5 px-4 bg-blue-50/80">
                                6. Chi tiết Chi phí Mua Tín chỉ Từng Cơ chế ($)
                              </td>
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-700 sticky left-0 bg-white pl-6">
                                • Chi phí mua EUA (EU ETS)
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200">
                                  <span className="font-bold text-gray-800">{c.metrics.costEu.toLocaleString(locale)} $</span>
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-700 sticky left-0 bg-white pl-6">
                                • Chi phí mua UKA (UK ETS)
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200">
                                  <span className="font-bold text-gray-800">{c.metrics.costUk.toLocaleString(locale)} $</span>
                                </td>
                              ))}
                            </tr>

                            <tr className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-4 font-semibold text-gray-700 sticky left-0 bg-white pl-6">
                                • Chi phí mua CEU (CORSIA)
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-2 px-4 text-center border-l border-gray-200">
                                  <span className="font-bold text-gray-800">{c.metrics.costCorsia.toLocaleString(locale)} $</span>
                                </td>
                              ))}
                            </tr>

                            {/* SECTION 7: THAO TÁC ÁP DỤNG */}
                            <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                              <td className="py-4 px-4 font-black text-gray-800 uppercase tracking-wider text-[11px] sticky left-0 bg-gray-50">
                                Thao tác áp dụng
                              </td>
                              {cols.map((c) => (
                                <td key={c.id} className="py-4 px-4 text-center border-l border-gray-200">
                                  {c.isCurrent ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-vna-blue bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                                      <Check size={14} /> Đang áp dụng
                                    </span>
                                  ) : (
                                    <Button
                                      onClick={() => {
                                        c.onApply();
                                        setIsCompareModalOpen(false);
                                      }}
                                      className="bg-vna-blue hover:bg-[#00556e] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                                    >
                                      <Check size={14} /> Áp dụng kịch bản này
                                    </Button>
                                  )}
                                </td>
                              ))}
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* MODAL / DIALOG CHỌN DANH SÁCH KỊCH BẢN SO SÁNH */}
            {isSelectScenariosPickerOpen && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-30 flex items-center justify-center p-4 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">

                  {/* Picker Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                    <div>
                      <h4 className="text-sm font-black text-vna-navy">
                        Chọn Kịch Bản Để Đưa Vào Bảng So Sánh
                      </h4>
                      {/* <p className="text-[11px] text-gray-500 mt-0.5">
                        Tích chọn các kịch bản bạn muốn so sánh đối chiếu cùng lúc (tối thiểu 1 kịch bản)
                      </p> */}
                    </div>
                    <button
                      onClick={() => setIsSelectScenariosPickerOpen(false)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Search and Quick Selection Actions */}
                  <div className="p-3.5 border-b border-gray-100 bg-white space-y-2.5">
                    <input
                      type="text"
                      value={searchScenarioQuery}
                      onChange={(e) => setSearchScenarioQuery(e.target.value)}
                      placeholder="Tìm kiếm theo tên kịch bản, năm mô phỏng hoặc hình thức phân bổ..."
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-vna-blue focus:ring-1 focus:ring-vna-blue/20"
                    />

                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const isAllActive = tempSelectedScenarioIds.length === savedScenarios.length + 1;
                          const isCurrentActive = !isAllActive && tempSelectedScenarioIds.length === 1 && tempSelectedScenarioIds.includes('CURRENT');

                          return (
                            <>
                              <button
                                type="button"
                                onClick={() => setTempSelectedScenarioIds(['CURRENT', ...savedScenarios.map(s => s.id)])}
                                className={"text-xs cursor-pointer transition-colors " + (isAllActive
                                  ? "text-vna-blue font-bold hover:underline"
                                  : "text-gray-400 hover:text-gray-700 font-medium")}
                              >
                                Chọn tất cả
                              </button>
                              <span className="text-gray-300">•</span>
                              <button
                                type="button"
                                onClick={() => setTempSelectedScenarioIds(['CURRENT'])}
                                className={"text-xs cursor-pointer transition-colors " + (isCurrentActive
                                  ? "text-vna-blue font-bold hover:underline"
                                  : "text-gray-400 hover:text-gray-700 font-medium")}
                              >
                                Chỉ chọn Hiện tại
                              </button>
                            </>
                          );
                        })()}
                      </div>

                      <span className="text-gray-500 text-[11px]">
                        Đã chọn: <strong className="text-vna-blue">{tempSelectedScenarioIds.length}</strong> kịch bản
                      </span>
                    </div>
                  </div>

                  {/* Picker List View */}
                  <div className="p-4 overflow-y-auto space-y-2.5 max-h-[380px]">

                    {/* Item 1: Kịch bản Hiện tại (Đang cấu hình) */}
                    {('phương án hiện tại đang cấu hình'.includes(searchScenarioQuery.toLowerCase()) || searchScenarioQuery === '') && (
                      <label className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${tempSelectedScenarioIds.includes('CURRENT')
                        ? 'bg-blue-50/60 border-vna-blue shadow-2xs'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={tempSelectedScenarioIds.includes('CURRENT')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTempSelectedScenarioIds([...tempSelectedScenarioIds, 'CURRENT']);
                              } else {
                                if (tempSelectedScenarioIds.length > 1) {
                                  setTempSelectedScenarioIds(tempSelectedScenarioIds.filter(id => id !== 'CURRENT'));
                                }
                              }
                            }}
                            className="rounded accent-vna-blue cursor-pointer w-4 h-4"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-vna-navy">Phương án Hiện tại</span>
                              <span className="px-2 py-0.2 rounded bg-gray-200 text-gray-700 text-[10px] font-bold">Đang cấu hình</span>
                              <span className="px-2 py-0.2 rounded bg-blue-50 text-vna-blue text-[10px] font-bold">{reportPeriod}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              SAF: {(currentMetrics.safEuTonnes + currentMetrics.safUkTonnes + currentMetrics.safCorsiaTonnes).toLocaleString(locale)} tấn • CO₂ giảm: {(currentMetrics.co2EuSaved + currentMetrics.co2UkSaved + currentMetrics.co2CorsiaSaved).toLocaleString(locale)} tCO₂ • Chi phí: {currentMetrics.totalCost.toLocaleString(locale)} $
                            </p>
                          </div>
                        </div>
                      </label>
                    )}

                    {/* Saved Scenarios List */}
                    {savedScenarios
                      .filter(sc =>
                        sc.name.toLowerCase().includes(searchScenarioQuery.toLowerCase()) ||
                        sc.period.toLowerCase().includes(searchScenarioQuery.toLowerCase()) ||
                        (sc.allocationMode === 'ledger' ? 'kho ledger' : 'nhập tay').includes(searchScenarioQuery.toLowerCase())
                      )
                      .map((sc) => {
                        const isChecked = tempSelectedScenarioIds.includes(sc.id);
                        return (
                          <label
                            key={sc.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${isChecked
                              ? 'bg-blue-50/60 border-vna-blue shadow-2xs'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTempSelectedScenarioIds([...tempSelectedScenarioIds, sc.id]);
                                  } else {
                                    if (tempSelectedScenarioIds.length > 1) {
                                      setTempSelectedScenarioIds(tempSelectedScenarioIds.filter(id => id !== sc.id));
                                    }
                                  }
                                }}
                                className="rounded accent-vna-blue cursor-pointer w-4 h-4"
                              />
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-xs text-vna-navy">{sc.name}</span>
                                  <span className="px-2 py-0.2 rounded bg-blue-50 text-vna-blue text-[10px] font-bold border border-blue-100">{sc.period}</span>
                                </div>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  SAF: {sc.metrics.totalAllocatedSaf.toLocaleString(locale)} tấn • CO₂ giảm: {sc.metrics.co2Saved.toLocaleString(locale)} tCO₂ • Tín chỉ: {sc.metrics.totalCredits.toLocaleString(locale)} • Chi phí: {sc.metrics.totalCost.toLocaleString(locale)} $
                                </p>
                              </div>
                            </div>
                          </label>
                        );
                      })}

                    {savedScenarios.filter(sc => sc.name.toLowerCase().includes(searchScenarioQuery.toLowerCase())).length === 0 && searchScenarioQuery !== '' && (
                      <div className="text-center py-6 text-gray-400 text-xs">
                        Không tìm thấy kịch bản phù hợp với từ khóa "{searchScenarioQuery}"
                      </div>
                    )}
                  </div>

                  {/* Picker Footer */}
                  <div className="p-3.5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Tối thiểu 1 kịch bản để hiển thị bảng
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setIsSelectScenariosPickerOpen(false)}
                        variant="outline"
                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl border-gray-300 cursor-pointer"
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedScenarioIdsForCompare(tempSelectedScenarioIds);
                          setIsSelectScenariosPickerOpen(false);
                        }}
                        className="bg-vna-blue hover:bg-[#00556e] text-white px-4 py-1.5 text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                      >
                        Áp dụng ({tempSelectedScenarioIds.length})
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            )}


            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <span className="text-xs text-gray-500 italic">
                * Tích chọn hoặc bỏ chọn các kịch bản ở thanh công cụ phía trên để tùy chỉnh bảng đối chiếu. Bấm &quot;Áp dụng kịch bản này&quot; để tải kịch bản vào mô phỏng.
              </span>
              <Button
                onClick={() => setIsCompareModalOpen(false)}
                className="bg-vna-blue hover:bg-[#00556e] text-white text-xs font-bold px-5 py-2 cursor-pointer"
              >
                Đóng cửa sổ
              </Button>
            </div>

          </div>
        </div>
      )}


      {/* CREATE NEW BATCH MODAL */}
      {isNewBatchModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsNewBatchModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-black text-vna-navy border-b border-gray-100 pb-3 mb-4">
              Thêm Lô Nhiên liệu SAF Mới vào Kỳ Mô phỏng
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Mã Lô - Cho phép người dùng chọn từ combobox */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Mã Lô (Chọn từ kho dữ liệu SAF): <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newBatch.batchNo || ''}
                    onChange={(e) => {
                      const selectedBatchNo = e.target.value;
                      const found = SAF_WAREHOUSE_REPOSITORY.find(item => item.batchNo === selectedBatchNo);
                      if (found) {
                        setNewBatch({
                          ...newBatch,
                          batchNo: found.batchNo,
                          deliveryDate: found.deliveryDate,
                          airportCode: found.airportCode,
                          airportName: found.airportName,
                          destAirportCode: found.destAirportCode,
                          destAirportName: found.destAirportName,
                          region: found.region,
                          supplier: found.supplier,
                          supplierVat: found.supplierVat,
                          tonnes: found.tonnes,
                          lifecycleEmission: found.lifecycleEmission,
                          co2SavedPerTonne: found.co2SavedPerTonne,
                          eligibleSchemes: found.eligibleSchemes,
                          assignedScheme: found.assignedScheme
                        });
                      } else {
                        setNewBatch({
                          ...newBatch,
                          batchNo: '',
                          airportCode: '',
                          airportName: '',
                          destAirportCode: '',
                          destAirportName: '',
                          tonnes: 0,
                          co2SavedPerTonne: 0
                        });
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold bg-white focus:ring-2 focus:ring-vna-blue/20 focus:border-vna-blue outline-none cursor-pointer shadow-2xs"
                  >
                    <option value="">-- Chọn lô SAF trong kho --</option>
                    {SAF_WAREHOUSE_REPOSITORY.map((item) => (
                      <option key={item.batchNo} value={item.batchNo}>
                        {item.batchNo} ({item.airportCode} → {item.destAirportCode} - {item.tonnes.toLocaleString(locale)} tấn)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Khối lượng SAF - Disabled / Tự động theo mã lô */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Khối lượng SAF (tấn):</label>
                  <Input
                    value={newBatch.tonnes ? `${newBatch.tonnes.toLocaleString(locale)} tấn` : ''}
                    disabled
                    readOnly
                    placeholder="Tự động theo mã lô"
                    className="bg-gray-100 text-gray-700 cursor-not-allowed font-bold border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Sân bay xuất phát - Disabled / Tự động theo mã lô */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Sân bay xuất phát:</label>
                  <Input
                    value={newBatch.airportCode ? `${newBatch.airportCode} - ${newBatch.airportName}` : ''}
                    disabled
                    readOnly
                    placeholder="Tự động theo mã lô"
                    className="bg-gray-100 text-gray-700 cursor-not-allowed font-medium border-gray-200"
                  />
                </div>

                {/* Sân bay đáp - Disabled / Tự động theo mã lô */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Sân bay đáp:</label>
                  <Input
                    value={newBatch.destAirportCode ? `${newBatch.destAirportCode} - ${newBatch.destAirportName}` : ''}
                    disabled
                    readOnly
                    placeholder="Tự động theo mã lô"
                    className="bg-gray-100 text-gray-700 cursor-not-allowed font-medium border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* CO₂ giảm trừ / tấn SAF - Disabled / Tự động theo mã lô */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">CO₂ giảm trừ / tấn SAF:</label>
                  <Input
                    value={newBatch.co2SavedPerTonne ? `${newBatch.co2SavedPerTonne} tCO₂/tấn` : ''}
                    disabled
                    readOnly
                    placeholder="Tự động theo mã lô"
                    className="bg-gray-100 text-gray-700 cursor-not-allowed font-bold border-gray-200"
                  />
                </div>

                {/* Nhà cung cấp - Tự động theo mã lô */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Nhà cung cấp:</label>
                  <Input
                    value={newBatch.supplier ? `${newBatch.supplier}${newBatch.supplierVat ? ` (VAT: ${newBatch.supplierVat})` : ''}` : ''}
                    disabled
                    readOnly
                    placeholder="Tự động theo mã lô"
                    className="bg-gray-100 text-gray-700 cursor-not-allowed font-medium border-gray-200"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsNewBatchModalOpen(false)} className="text-xs">Hủy</Button>
              <Button onClick={handleAddNewBatch} className="bg-vna-blue hover:bg-[#00556e] text-white text-xs font-bold px-4">
                Thêm vào ma trận
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DANH SÁCH KỊCH BẢN ĐÃ LƯU */}
      {isScenarioListModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-vna-blue flex items-center justify-center font-bold">
                  <BookmarkCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-vna-navy">
                    Danh Sách Kịch Bản Đã Lưu
                  </h3>
                  <p className="text-xs text-gray-500">
                    Chọn kịch bản để tải lên bảng mô phỏng, tiếp tục chỉnh sửa phân bổ hoặc cập nhật tham số thị trường
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsScenarioListModalOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Scenarios List */}
            <div className="p-6 overflow-y-auto space-y-4 max-h-[calc(90vh-140px)]">
              {savedScenarios.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <BookmarkCheck size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-bold text-sm">Chưa có kịch bản nào được lưu</p>
                  <p className="text-xs mt-1">Hãy thiết lập thông số mô phỏng và ấn "Lưu kịch bản" ở dưới màn hình.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {savedScenarios.map((sc) => (
                    <div
                      key={sc.id}
                      onClick={() => handleLoadScenario(sc)}
                      className="p-4 rounded-2xl border border-gray-200 hover:border-vna-blue/80 hover:shadow-md transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group relative overflow-hidden"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-black text-sm text-vna-navy group-hover:text-vna-blue transition-colors">
                            {sc.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-vna-blue border border-blue-100">
                            {sc.period}
                          </span>

                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                          <span>SAF: <strong className="text-gray-800 font-bold">{sc.metrics.totalAllocatedSaf.toLocaleString(locale)} tấn</strong></span>
                          <span>•</span>
                          <span>CO₂ giảm: <strong className="text-emerald-600 font-bold">{sc.metrics.co2Saved.toLocaleString(locale)} tCO₂</strong></span>
                          <span>•</span>
                          <span>Tín chỉ bù đắp: <strong className="text-amber-700 font-bold">{sc.metrics.totalCredits.toLocaleString(locale)}</strong></span>
                          <span>•</span>
                          <span>Chi phí bù đắp: <strong className="text-vna-navy font-black">{sc.metrics.totalCost.toLocaleString(locale)} $</strong></span>
                        </div>

                        <p className="text-[11px] text-gray-400">
                          Thời gian lưu: {sc.savedAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <button
                          onClick={() => handleLoadScenario(sc)}
                          className="px-4 py-2 bg-blue-50 hover:bg-vna-blue hover:text-white text-vna-blue font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <FolderOpen size={14} /> Mở chỉnh sửa
                        </button>
                        <button
                          onClick={(e) => handleDeleteScenario(sc.id, e)}
                          title="Xóa kịch bản"
                          className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Tổng cộng <strong>{savedScenarios.length} kịch bản</strong> đã lưu trong hệ thống
              </span>
              <Button
                onClick={() => setIsScenarioListModalOpen(false)}
                variant="outline"
                className="px-4 py-2 text-xs font-bold rounded-xl border-gray-300 cursor-pointer"
              >
                Đóng
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL LƯU KỊCH BẢN VỚI TÊN TÙY CHỌN */}
      {isSaveNameModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-vna-blue flex items-center justify-center font-bold">
                  <Save size={18} />
                </div>
                <h3 className="text-sm font-black text-vna-navy">Lưu Kịch Bản Mô Phỏng</h3>
              </div>
              <button
                onClick={() => setIsSaveNameModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Tên kịch bản:
                </label>
                <input
                  type="text"
                  value={scenarioNameInput}
                  onChange={(e) => setScenarioNameInput(e.target.value)}
                  placeholder="Nhập tên kịch bản..."
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-vna-blue focus:ring-1 focus:ring-vna-blue/20"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-[11px] text-gray-600">
                <div className="flex justify-between">
                  <span>Năm mô phỏng:</span>
                  <strong className="text-gray-900">{reportPeriod}</strong>
                </div>
                {/* <div className="flex justify-between">
                  <span>Hình thức phân bổ:</span>
                  <strong className="text-gray-900">{allocationMode === 'ledger' ? 'Kho Ledger' : 'Nhập tay'}</strong>
                </div> */}
                <div className="flex justify-between">
                  <span>Số tín chỉ CO₂ phải mua:</span>
                  <strong className="text-amber-700">{(currentMetrics.residualEuCo2 + currentMetrics.residualUkCo2 + currentMetrics.residualCorsiaCo2).toLocaleString(locale)} tín chỉ</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tổng ngân sách tuân thủ:</span>
                  <strong className="text-vna-navy">{formatNumber(executiveKpiMetrics.totalScenarioCost / 1000000, 2, currentLang)}M $</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                onClick={() => setIsSaveNameModalOpen(false)}
                variant="outline"
                className="px-4 py-2 text-xs font-bold rounded-xl border-gray-300 cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmSaveScenario}
                className="bg-vna-blue hover:bg-[#00556e] text-white px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save size={15} /> Xác nhận Lưu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SYNC DATA TOAST NOTIFICATION */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900/95 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold backdrop-blur-sm border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <span>{syncToast}</span>
          <button
            onClick={() => setSyncToast(null)}
            className="ml-2 text-gray-400 hover:text-white cursor-pointer p-0.5"
            title="Đóng"
          >
            <X size={14} />
          </button>
        </div>
      )}

    </div>
  );
};
