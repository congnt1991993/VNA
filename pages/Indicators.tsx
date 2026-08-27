import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button, Select, PillarBadge, Input, Modal } from '../components/UI';
import {
  Plus, Search, Upload, Download, FileSpreadsheet, ArrowLeft,
  Settings, BarChart2, Save, X, Info, User, Check, AlertCircle, FileText, Trash2,
  Calendar, Clock, History, Edit3, Calculator, Lock, Database, Sparkles, RefreshCw, ShieldAlert,
  ChevronLeft, ChevronRight, GripVertical, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { Pillar, Status, EsgIndicator } from '../types';
import { IndicatorChart } from '../components/IndicatorChart';
import { IndicatorHistoryTable } from '../components/IndicatorHistoryTable';
import MOCK_INDICATORS_JSON from '../data/indicators_main_list.json';

// Helper to extract localized name from "English / Vietnamese" or "English (Vietnamese)"
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

interface Indicator extends Partial<EsgIndicator> {
  id: string;
  reportType?: 'NUMERIC' | 'TEXT';
  code: string;
  name: string;
  pillar: Pillar;
  isActive: boolean;
  topic?: string;
  unit?: string;
  frequency?: string;
  weight?: number;
  department?: string; // Đơn vị chủ trì / owner
  sourceForm?: string; // Biểu mẫu nhập liệu (e.g. 'tech-ops')
  programs?: string[]; // CORSIA, EU ETS, UK ETS
  inputDept?: string; // Đơn vị nhập liệu
  approveDept?: string; // Đơn vị phê duyệt
  monitorDept?: string; // Đơn vị giám sát
  introduction?: string; // Mô tả & định nghĩa chi tiết
  metabaseLink?: string;
  reportLink?: string;
  reportText?: any;
  formula?: string;
  isStatic?: boolean;
  question?: string;
  descriptionCondition?: 'Yes' | 'No';
  mainDisclosurePoints?: string;
}

const MOCK_FORMULAS = [
  {
    id: 'F001',
    code: 'CALC_NET_FUEL_CONS',
    name: 'Khối lượng nhiên liệu Jet Fuel tiêu thụ (Net Consumption)',
    version: '2.1',
    type: 'Calculation',
    status: 'Active',
    expression: 'Jet_Fuel_Uplift - Jet_Fuel_Defueled',
    appliedTo: ['GRI 302-1', 'Airline E-1'],
    createdBy: 'Admin',
    createdAt: '01/10/2024',
    updatedBy: 'System',
    updatedAt: '15/10/2025',
    description: 'Công thức này được sử dụng để tính toán khối lượng nhiên liệu tiêu thụ thực tế (Net Consumption) sau khi trừ đi lượng hút xả (Defueled).'
  },
  {
    id: 'F002',
    code: 'AGG_FUEL_UPLIFT',
    name: 'Tổng Khối lượng Jet Fuel nạp vào (Uplift)',
    version: '1.0',
    type: 'Calculation',
    status: 'Active',
    expression: 'SUM(Flight_Logs.Uplift_Volume_Liters)',
    appliedTo: ['GRI 302-1'],
    createdBy: 'System',
    createdAt: '01/10/2024',
    updatedBy: 'System',
    updatedAt: '01/10/2024',
    description: 'Tổng hợp dữ liệu nạp nhiên liệu từ các nhật ký bay (Flight Logs) để tính tổng lượng Uplift.'
  },
  {
    id: 'F003',
    code: 'AGG_FUEL_DEFUELED',
    name: 'Tổng Khối lượng Jet Fuel hút hoàn trả (Defueled)',
    version: '1.0',
    type: 'Calculation',
    status: 'Active',
    expression: 'SUM(Flight_Logs.Defueled_Volume_Liters)',
    appliedTo: ['GRI 302-1'],
    createdBy: 'System',
    createdAt: '01/10/2024',
    updatedBy: 'System',
    updatedAt: '01/10/2024',
    description: 'Tổng hợp lượng nhiên liệu bị hút ra khỏi tàu bay vì lý do kỹ thuật hoặc thay đổi tải trọng.'
  },
  {
    id: 'F004',
    code: 'CALC_SAVING_V1',
    name: 'Lượng nhiên liệu tiết kiệm trên mỗi chuyến bay',
    version: '1.0',
    type: 'Simulation',
    status: 'Draft',
    expression: '(Baseline_Fuel - Actual_Fuel) / Total_Flight_Hours * (1 + Efficiency_Rate)',
    appliedTo: ['GRI 302-4'],
    createdBy: 'Nguyễn Văn A',
    createdAt: '12/10/2025',
    updatedBy: 'Nguyễn Văn A',
    updatedAt: '12/10/2025',
    description: 'Mô phỏng lượng nhiên liệu tiết kiệm được so với định mức cơ sở (Baseline) trên mỗi giờ bay.',
    simulationParams: [
      { code: 'Efficiency_Rate', name: 'Tỷ lệ hiệu suất', defaultValue: 0.05, unit: '%' },
      { code: 'Baseline_Adj', name: 'Hệ số điều chỉnh cơ sở', defaultValue: 1.0, unit: 'He so' }
    ]
  },
  {
    id: 'F005',
    code: 'SIM_SAF_COST',
    name: 'Mô phỏng chi phí SAF theo kịch bản trộn',
    version: '0.5',
    type: 'Simulation',
    status: 'Draft',
    expression: '(SAF_Price - JetA1_Price) * Total_Volume * Mix_Ratio',
    appliedTo: [],
    createdBy: 'Ban Kế hoạch',
    createdAt: '05/11/2025',
    updatedBy: 'Ban Kế hoạch',
    updatedAt: '05/11/2025',
    description: 'Tính toán chi phí gia tăng khi sử dụng nhiên liệu SAF với các tỷ lệ phối trộn khác nhau.',
    simulationParams: [
      { code: 'SAF_Price', name: 'Giá SAF dự kiến', defaultValue: 2500, unit: 'USD/Tấn' },
      { code: 'JetA1_Price', name: 'Giá Jet A1 dự kiến', defaultValue: 900, unit: 'USD/Tấn' },
      { code: 'Mix_Ratio', name: 'Tỷ lệ phối trộn', defaultValue: 0.02, unit: '%' }
    ]
  }
];

const mapIndicatorDeptToFormDept = (dept: string): string => {
  if (!dept) return 'Ban Kế hoạch Phát triển';
  const d = dept.toLowerCase().trim();
  if (d.includes('kế hoạch') || d.includes('khpt')) return 'Ban Kế hoạch Phát triển';
  if (d.includes('an toàn') || d.includes('atcl')) return 'Ban An toàn chất lượng (Ban ATCL)';
  if (d.includes('khai thác') || d.includes('ttđhkt')) return 'Tổ Khai thác (TTĐHKT)';
  if (d.includes('tổ chức') || d.includes('tcnl') || d.includes('nhân lực')) return 'Ban Tổ chức Nhân lực';
  if (d.includes('công nghệ') || d.includes('cntt') || d.includes('chuyển đổi')) return 'Ban Chuyển đổi số & CNTT';
  if (d.includes('dịch vụ') || d.includes('dvhk')) return 'Tổ Dịch vụ';
  if (d.includes('truyền thông')) return 'Ban Truyền thông';
  if (d.includes('bông sen vàng') || d.includes('ttbsv')) return 'Trung tâm Bông Sen Vàng (TTBSV)';
  if (d.includes('kỹ thuật')) return 'Tổ Kỹ thuật (Ban QLVT)';
  return dept;
};

interface FormulaToken {
  id: string;
  type: 'db_field' | 'number' | 'operator' | 'func' | 'text';
  value: string;
  originalValue: string;
  isDbField: boolean;
}

const parseFormulaToTokens = (expression: string): FormulaToken[] => {
  if (!expression) return [];
  const regex = /([a-zA-Z_][a-zA-Z0-9_\.]*|\d+(?:\.\d+)?|[\+\-\*/\(\)\,\=]|[\s]+)/g;
  const matches = expression.match(regex) || [];

  const tokens: FormulaToken[] = [];
  let idCounter = 0;
  const sqlFuncs = ['SUM', 'AVG', 'COUNT', 'MAX', 'MIN', 'ROUND', 'IF', 'COALESCE'];

  matches.forEach(item => {
    const trimmed = item.trim();
    if (!trimmed) return;

    idCounter++;
    const id = `tok-${idCounter}`;

    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      tokens.push({
        id,
        type: 'number',
        value: trimmed,
        originalValue: trimmed,
        isDbField: false
      });
    } else if (/^[\+\-\*/\(\)\,\=]$/.test(trimmed)) {
      tokens.push({
        id,
        type: 'operator',
        value: trimmed,
        originalValue: trimmed,
        isDbField: false
      });
    } else if (sqlFuncs.includes(trimmed.toUpperCase())) {
      tokens.push({
        id,
        type: 'func',
        value: trimmed.toUpperCase(),
        originalValue: trimmed,
        isDbField: false
      });
    } else {
      tokens.push({
        id,
        type: 'db_field',
        value: trimmed,
        originalValue: trimmed,
        isDbField: true
      });
    }
  });

  return tokens;
};

const MOCK_INDICATORS: Indicator[] = MOCK_INDICATORS_JSON as Indicator[];

export const IndicatorsPage: React.FC<{ departmentFilter?: string }> = ({ departmentFilter }) => {
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

  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL' | 'DASHBOARD'>('LIST');
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [formIndicator, setFormIndicator] = useState<Indicator | null>(null);
  const [historyFormPeriod, setHistoryFormPeriod] = useState<string | null>(null);

  const [formulas, setFormulas] = useState<any[]>([]);
  const [searchFormQuery, setSearchFormQuery] = useState('');
  const [isOpenFormDropdown, setIsOpenFormDropdown] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vna_esg_formulas');
    if (saved) {
      try {
        setFormulas(JSON.parse(saved));
      } catch (e) {
        setFormulas(MOCK_FORMULAS);
      }
    } else {
      setFormulas(MOCK_FORMULAS);
    }
  }, []);

  // Formula Editing States
  const [editingFormula, setEditingFormula] = useState<any | null>(null);
  const [editingTokens, setEditingTokens] = useState<FormulaToken[]>([]);
  const [editingChangeLog, setEditingChangeLog] = useState('');
  const [editingNewVersion, setEditingNewVersion] = useState('');
  const [editingEffectiveDate, setEditingEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [customFormulaHistories, setCustomFormulaHistories] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const savedHistory = localStorage.getItem('vna_formula_histories');
    if (savedHistory) {
      try {
        setCustomFormulaHistories(JSON.parse(savedHistory));
      } catch (e) { }
    }
  }, []);

  const appliedFormulas = useMemo(() => {
    if (!formIndicator) return [];
    const found = formulas.filter(f => f.appliedTo && f.appliedTo.includes(formIndicator.code));
    if (found.length > 0) return found;

    // Default existing formulas if not yet mapped in mock
    if (formIndicator.code === 'GRI 305-1') {
      return [{
        id: 'F_GRI_305_1',
        code: 'CALC_SCOPE1_CO2',
        name: 'Khối lượng phát thải CO2 Scope 1',
        version: '1.2',
        type: 'Calculation',
        status: 'Active',
        expression: 'Net_Fuel_Consumption * 3.15 + Mobile_Combustion_CO2',
        appliedTo: ['GRI 305-1'],
        description: 'Tính toán lượng phát thải CO2 trực tiếp từ tiêu thụ nhiên liệu và phương tiện mặt đất.'
      }];
    }
    if (formIndicator.code === 'GRI 305-2') {
      return [{
        id: 'F_GRI_305_2',
        code: 'CALC_SCOPE2_CO2',
        name: 'Khối lượng phát thải CO2 Scope 2',
        version: '1.0',
        type: 'Calculation',
        status: 'Active',
        expression: 'Purchased_Electricity_kWh * 0.7221 / 1000',
        appliedTo: ['GRI 305-2'],
        description: 'Tính toán lượng phát thải CO2 gián tiếp từ tiêu thụ điện năng mạng lưới.'
      }];
    }
    if (formIndicator.code === 'GRI 401-1') {
      return [{
        id: 'F_GRI_401_1',
        code: 'CALC_TURNOVER_RATE',
        name: 'Tỷ lệ tuyển dụng mới',
        version: '1.0',
        type: 'Calculation',
        status: 'Active',
        expression: '(Total_New_Hires / Total_Employees) * 100',
        appliedTo: ['GRI 401-1'],
        description: 'Tỷ lệ tuyển dụng nhân sự mới trên tổng số lao động bình quân.'
      }];
    }
    if (formIndicator.code === 'GRI 404-2') {
      return [{
        id: 'F_GRI_404_2',
        code: 'CALC_TRAINING_HOURS',
        name: 'Số giờ đào tạo bình quân',
        version: '1.0',
        type: 'Calculation',
        status: 'Active',
        expression: 'Total_Training_Hours / Total_Employees',
        appliedTo: ['GRI 404-2'],
        description: 'Bình quân số giờ đào tạo cho mỗi nhân viên trong năm.'
      }];
    }
    if (formIndicator.code === 'GRI 405-1') {
      return [{
        id: 'F_GRI_405_1',
        code: 'CALC_FEMALE_LEADERSHIP',
        name: 'Tỷ lệ nữ lãnh đạo',
        version: '1.0',
        type: 'Calculation',
        status: 'Active',
        expression: '(Female_Leaders / Total_Leaders) * 100',
        appliedTo: ['GRI 405-1'],
        description: 'Tỷ lệ cán bộ quản lý là nữ trong toàn hệ thống.'
      }];
    }
    if (formIndicator.code === 'Airline B-1') {
      return [{
        id: 'F_AIRLINE_B1',
        code: 'CALC_CSI_INDEX',
        name: 'Chỉ số hài lòng khách hàng (CSI)',
        version: '1.0',
        type: 'Calculation',
        status: 'Active',
        expression: '(Positive_Feedback_Count / Total_Survey_Count) * 100',
        appliedTo: ['Airline B-1'],
        description: 'Tỷ lệ phản hồi tích cực của hành khách qua các khảo sát dịch vụ.'
      }];
    }
    if (formIndicator.formula) {
      return [{
        id: `F_${formIndicator.code.replace(/[^a-zA-Z0-9]/g, '_')}`,
        code: `CALC_${formIndicator.code.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: `Công thức tính ${formIndicator.name}`,
        version: '1.0',
        type: 'Calculation',
        status: 'Active',
        expression: formIndicator.formula,
        appliedTo: [formIndicator.code],
        description: `Công thức tính toán cho chỉ tiêu ${formIndicator.name}`
      }];
    }
    if (formIndicator.unit) {
      return [{
        id: `F_${formIndicator.code.replace(/[^a-zA-Z0-9]/g, '_')}`,
        code: `CALC_${formIndicator.code.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: `Công thức tính ${formIndicator.name}`,
        version: '1.0',
        type: 'Calculation',
        status: 'Active',
        expression: `SUM(${formIndicator.code.replace(/[^a-zA-Z0-9]/g, '_')}_Input_Value) * 1.0`,
        appliedTo: [formIndicator.code],
        description: `Tổng hợp và tính toán số liệu phát sinh cho chỉ tiêu ${formIndicator.name}`
      }];
    }
    return [];
  }, [formulas, formIndicator]);

  const handleOpenEditFormula = (formula: any) => {
    setEditingFormula(formula);
    setEditingTokens(parseFormulaToTokens(formula.expression || ''));
    setEditingChangeLog('');

    // Parse effective date or default to today
    let initDate = new Date().toISOString().split('T')[0];
    if (formula.effectiveDate && formula.effectiveDate.includes('/')) {
      const [d, m, y] = formula.effectiveDate.split('/');
      initDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    setEditingEffectiveDate(initDate);

    // Calculate new version string e.g. 2.1 -> 2.2
    const currentVer = formula.version ? parseFloat(formula.version) : 1.0;
    const nextVer = isNaN(currentVer) ? 'v1.1' : `v${(currentVer + 0.1).toFixed(1)}`;
    setEditingNewVersion(nextVer);
  };

  const handleUpdateTokenValue = (tokenId: string, newVal: string) => {
    setEditingTokens(prev => prev.map(t => t.id === tokenId ? { ...t, value: newVal } : t));
  };

  const handleSaveFormula = () => {
    if (!editingFormula || !formIndicator) return;
    const newExpression = editingTokens.map(t => t.value).join(' ');
    const nowStr = new Date().toLocaleDateString('vi-VN');
    const newVerClean = editingNewVersion.replace(/^v/, '');

    // Format effective date to DD/MM/YYYY
    let formattedEffectiveDate = editingEffectiveDate;
    if (editingEffectiveDate.includes('-')) {
      const [y, m, d] = editingEffectiveDate.split('-');
      formattedEffectiveDate = `${d}/${m}/${y}`;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isFuture = editingEffectiveDate > todayStr;

    // 1. Update in formulas state & localStorage
    const updatedFormulas = [...formulas];
    const existingIndex = updatedFormulas.findIndex(f => f.id === editingFormula.id);
    const updatedFormulaItem = {
      ...editingFormula,
      expression: newExpression,
      version: newVerClean,
      effectiveDate: formattedEffectiveDate,
      updatedAt: nowStr,
      updatedBy: 'Nguyễn Minh Hải (Admin)',
      appliedTo: editingFormula.appliedTo?.includes(formIndicator.code)
        ? editingFormula.appliedTo
        : [...(editingFormula.appliedTo || []), formIndicator.code]
    };

    if (existingIndex >= 0) {
      updatedFormulas[existingIndex] = updatedFormulaItem;
    } else {
      updatedFormulas.push(updatedFormulaItem);
    }
    setFormulas(updatedFormulas);
    localStorage.setItem('vna_esg_formulas', JSON.stringify(updatedFormulas));

    // 2. Prepend to formula history
    const historyItem = {
      version: editingNewVersion.startsWith('v') ? editingNewVersion : `v${editingNewVersion}`,
      expression: newExpression,
      appliedFrom: formattedEffectiveDate,
      appliedTo: 'Hiện tại',
      updatedBy: 'Nguyễn Minh Hải (Admin)',
      updatedAt: nowStr,
      status: isFuture ? 'Scheduled' : 'Active',
      changeLog: editingChangeLog.trim() || `Cập nhật hệ số công thức tính toán (Hiệu lực áp dụng từ ${formattedEffectiveDate}).`
    };

    const updatedHistoryMap = { ...customFormulaHistories };
    const currentList = updatedHistoryMap[formIndicator.code] || [];
    updatedHistoryMap[formIndicator.code] = [historyItem, ...currentList];
    setCustomFormulaHistories(updatedHistoryMap);
    localStorage.setItem('vna_formula_histories', JSON.stringify(updatedHistoryMap));

    // Close modal
    setEditingFormula(null);
  };

  const formulaHistory = useMemo(() => {
    if (!formIndicator) return [];
    const code = formIndicator.code;
    const customList = customFormulaHistories[code] || [];
    const historyList = [...customList];

    if (code === 'GRI 302-1') {
      historyList.push(
        {
          version: 'v2.1',
          expression: 'Jet_Fuel_Uplift - Jet_Fuel_Defueled',
          appliedFrom: '15/10/2025',
          appliedTo: 'Hiện tại',
          updatedBy: 'Nguyễn Văn A',
          updatedAt: '15/10/2025',
          status: 'Active',
          changeLog: 'Cập nhật hệ số hao hụt nhiên liệu Jet A1 theo tiêu chuẩn mới.'
        },
        {
          version: 'v2.0',
          expression: 'Jet_Fuel_Uplift - Jet_Fuel_Defueled * 0.98',
          appliedFrom: '01/01/2025',
          appliedTo: '14/10/2025',
          updatedBy: 'Trần Thị Hà',
          updatedAt: '01/01/2025',
          status: 'Inactive',
          changeLog: 'Sửa đổi công thức tính trừ hao hụt định mức 2% đối với lượng nhiên liệu thu hồi.'
        },
        {
          version: 'v1.0',
          expression: 'Jet_Fuel_Uplift',
          appliedFrom: '01/10/2024',
          appliedTo: '31/12/2024',
          updatedBy: 'Admin',
          updatedAt: '01/10/2024',
          status: 'Inactive',
          changeLog: 'Công thức khởi tạo ban đầu, tính tổng lượng nhiên liệu nạp.'
        }
      );
    } else if (code === 'GRI 305-1') {
      historyList.push(
        {
          version: 'v1.2',
          expression: 'Net_Fuel_Consumption * 3.15 + Mobile_Combustion_CO2',
          appliedFrom: '01/01/2025',
          appliedTo: 'Hiện tại',
          updatedBy: 'Lê Minh Tuấn',
          updatedAt: '01/01/2025',
          status: 'Active',
          changeLog: 'Cập nhật hệ số chuyển đổi phát thải CO2 sang 3.15 theo cập nhật IPCC 2024.'
        },
        {
          version: 'v1.0',
          expression: 'Net_Fuel_Consumption * 3.16',
          appliedFrom: '01/10/2024',
          appliedTo: '31/12/2024',
          updatedBy: 'System',
          updatedAt: '01/10/2024',
          status: 'Inactive',
          changeLog: 'Công thức phiên bản đầu tiên theo hệ số quy đổi cũ.'
        }
      );
    } else if (code === 'GRI 302-4') {
      historyList.push(
        {
          version: 'v1.0',
          expression: '(Baseline_Fuel - Actual_Fuel) / Total_Flight_Hours * (1 + Efficiency_Rate)',
          appliedFrom: '12/10/2025',
          appliedTo: 'Hiện tại',
          updatedBy: 'Nguyễn Văn A',
          updatedAt: '12/10/2025',
          status: 'Active',
          changeLog: 'Thiết lập công thức mô phỏng tính nhiên liệu tiết kiệm đầu tiên.'
        }
      );
    } else {
      // General history mock only for quantitative indicators (having unit/weight/assigned forms/metabase link)
      if (formIndicator.metabaseLink || formIndicator.unit) {
        historyList.push(
          {
            version: 'v1.1',
            expression: `Sum(${code}_Input_Value) * 1.05`,
            appliedFrom: '01/01/2026',
            appliedTo: 'Hiện tại',
            updatedBy: 'Chuyên viên ESG',
            updatedAt: '01/01/2026',
            status: 'Active',
            changeLog: 'Điều chỉnh hệ số quy đổi năng lượng hiệu quả.'
          },
          {
            version: 'v1.0',
            expression: `Sum(${code}_Input_Value)`,
            appliedFrom: '01/10/2024',
            appliedTo: '31/12/2025',
            updatedBy: 'Admin',
            updatedAt: '01/10/2024',
            status: 'Inactive',
            changeLog: 'Thiết lập công thức tích lũy cơ bản.'
          }
        );
      }
    }
    return historyList;
  }, [formIndicator]);

  // Sorting state
  const [sortField, setSortField] = useState<'code' | 'name' | null>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('asc');

  const handleToggleSort = (field: 'code' | 'name') => {
    if (sortField === field) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else if (sortOrder === 'desc') {
        setSortOrder('none');
        setSortField(null);
      } else {
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Advanced filters state
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Import Dialog state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [importFile, setImportFile] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  // Load state from localStorage on mount
  const [allForms, setAllForms] = useState<any[]>([]);

  useEffect(() => {
    // Load forms
    const loadForms = () => {
      const savedForms = localStorage.getItem('vna_esg_forms');
      if (savedForms) {
        try {
          setAllForms(JSON.parse(savedForms));
        } catch (e) { }
      } else {
        // Fallback default mock forms
        const defaults = [
          {
            id: 'FORM-001',
            name: 'Biểu mẫu kê khai nhiên liệu bay Jet A1',
            indicatorId: 'GRI 302-1',
            indicatorName: 'GRI 302-1: Năng lượng tiêu thụ của tổ chức (E)',
            createdAt: '12/05/2026',
            createdBy: 'Trần Văn Hoàng',
            fields: [
              { id: '1', name: 'Đội bay', dataType: 'String', inputType: 'Combobox' },
              { id: '2', name: 'Sản lượng tiêu thụ (Tấn)', dataType: 'Number', inputType: 'NumberInput' }
            ]
          },
          {
            id: 'FORM-002',
            name: 'Biểu mẫu thống kê phát thải khí nhà kính trực tiếp',
            indicatorId: 'GRI 305-1',
            indicatorName: 'GRI 305-1: Phát thải khí nhà kính trực tiếp (E)',
            createdAt: '18/05/2026',
            createdBy: 'Nguyễn Thị Minh',
            fields: [
              { id: '1', name: 'Nguồn phát thải', dataType: 'String', inputType: 'Text' }
            ]
          }
        ];
        setAllForms(defaults);
        localStorage.setItem('vna_esg_forms', JSON.stringify(defaults));
      }
    };

    loadForms();

    const handleFormsSync = () => {
      loadForms();
    };
    window.addEventListener('vna_forms_updated', handleFormsSync);

    const saved = localStorage.getItem('vna_esg_indicators');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const synced = parsed.map((item: any) => {
            const match = MOCK_INDICATORS.find(m => m.id === item.id) ||
              MOCK_INDICATORS.find(m => m.name === item.name) ||
              (item.code && MOCK_INDICATORS.find(m => m.code === item.code));
            if (match) {
              return {
                ...item,
                department: match.department,
                sourceForm: match.sourceForm,
                inputDept: match.inputDept,
                approveDept: match.approveDept,
                metabaseLink: match.metabaseLink,
                reportText: match.reportText
              };
            }
            return item;
          });
          setIndicators(synced);
          localStorage.setItem('vna_esg_indicators', JSON.stringify(synced));
        } else {
          setIndicators(MOCK_INDICATORS);
          localStorage.setItem('vna_esg_indicators', JSON.stringify(MOCK_INDICATORS));
        }
      } catch (e) {
        setIndicators(MOCK_INDICATORS);
        localStorage.setItem('vna_esg_indicators', JSON.stringify(MOCK_INDICATORS));
      }
    } else {
      setIndicators(MOCK_INDICATORS);
      localStorage.setItem('vna_esg_indicators', JSON.stringify(MOCK_INDICATORS));
    }

    // Listen to sync events from other pages (like SysRoles)
    const handleSync = () => {
      const data = localStorage.getItem('vna_esg_indicators');
      if (data) {
        try {
          setIndicators(JSON.parse(data));
        } catch (e) { }
      }
    };
    window.addEventListener('vna_indicators_updated', handleSync);
    return () => {
      window.removeEventListener('vna_indicators_updated', handleSync);
      window.removeEventListener('vna_forms_updated', handleFormsSync);
    };
  }, []);

  // Filtered list
  const filteredIndicators = useMemo(() => {
    let result = indicators.filter(item => {
      // 1. Department filter (from parent component props)
      if (departmentFilter) {
        const formDef = FORM_DEFINITIONS.find(fd => fd.id === item.sourceForm);
        const matchDept = item.department === departmentFilter ||
          (formDef && formDef.department === departmentFilter);
        if (!matchDept) return false;
      }

      // 2. Search Code
      if (searchCode.trim()) {
        const query = searchCode.trim().toLowerCase();
        if (!item.code?.toLowerCase().includes(query)) return false;
      }

      // 3. Search Name (matching localized name and raw name)
      if (searchName.trim()) {
        const query = searchName.trim().toLowerCase();
        const localizedName = getLocalizedIndicatorName(item.name, currentLang).toLowerCase();
        const rawName = (item.name || '').toLowerCase();
        if (!localizedName.includes(query) && !rawName.includes(query)) return false;
      }

      // Legacy Search keyword (if any)
      if (searchText) {
        const query = searchText.toLowerCase();
        const codeMatch = item.code?.toLowerCase().includes(query);
        const nameMatch = item.name?.toLowerCase().includes(query);
        if (!codeMatch && !nameMatch) return false;
      }

      // 4. Pillar
      if (selectedPillar && item.pillar !== selectedPillar) return false;

      // 5. Topic
      if (selectedTopic && item.topic !== selectedTopic) return false;

      // 6. Department/Owner
      if (selectedDept && item.department !== selectedDept) return false;

      // 7. Program Tag
      if (selectedProgram) {
        if (!item.programs || !item.programs.includes(selectedProgram)) return false;
      }

      // 8. Status
      if (selectedStatus) {
        const filterActive = selectedStatus === 'active';
        if (item.isActive !== filterActive) return false;
      }

      return true;
    });

    // Sort by Code or Name
    if (sortField && sortOrder !== 'none') {
      result = [...result].sort((a, b) => {
        if (sortField === 'code') {
          const codeA = a.code || '';
          const codeB = b.code || '';
          return sortOrder === 'asc'
            ? codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' })
            : codeB.localeCompare(codeA, undefined, { numeric: true, sensitivity: 'base' });
        } else if (sortField === 'name') {
          const nameA = getLocalizedIndicatorName(a.name, currentLang) || a.name || '';
          const nameB = getLocalizedIndicatorName(b.name, currentLang) || b.name || '';
          return sortOrder === 'asc'
            ? nameA.localeCompare(nameB, undefined, { sensitivity: 'base' })
            : nameB.localeCompare(nameA, undefined, { sensitivity: 'base' });
        }
        return 0;
      });
    }

    return result;
  }, [indicators, searchCode, searchName, searchText, selectedPillar, selectedTopic, selectedDept, selectedProgram, selectedStatus, departmentFilter, currentLang, sortField, sortOrder]);

  // Topic Options
  const topicOptions = useMemo(() => {
    const topics = new Set(indicators.map(item => item.topic).filter(Boolean));
    return Array.from(topics).map(t => ({ label: t as string, value: t as string }));
  }, [indicators]);

  // Department / Owner Options
  const deptOptions = useMemo(() => {
    const depts = new Set(indicators.map(item => item.department).filter(Boolean));
    return Array.from(depts).map(d => ({ label: d as string, value: d as string }));
  }, [indicators]);

  const handleAddNew = () => {
    setFormIndicator({
      id: '',
      code: '',
      name: '',
      pillar: Pillar.ENVIRONMENT,
      topic: '',
      unit: '',
      frequency: 'Hàng tháng',
      weight: 10,
      department: 'Ban Quản lý vật tư',
      sourceForm: 'tech-ops',
      programs: [],
      inputDept: 'Ban Quản lý vật tư',
      approveDept: 'Lãnh đạo Ban QLVT',
      monitorDept: 'Ban Chỉ đạo ESG',
      isActive: true,
      introduction: '',
      isStatic: false,
      question: '',
      descriptionCondition: 'No',
      mainDisclosurePoints: ''
    });
    setViewMode('DETAIL');
  };

  const handleBack = () => setViewMode('LIST');

  const handleSave = () => {
    if (!formIndicator) return;

    let updated = [...indicators];
    const isNew = !formIndicator.id;

    if (isNew) {
      const newId = String(Date.now());
      const newIndicator = { ...formIndicator, id: newId };
      updated.push(newIndicator);
    } else {
      updated = updated.map(ind => ind.id === formIndicator.id ? formIndicator : ind);
    }

    setIndicators(updated);
    localStorage.setItem('vna_esg_indicators', JSON.stringify(updated));
    window.dispatchEvent(new Event('vna_indicators_updated'));

    alert('Đã lưu thông tin chỉ tiêu thành công!');
    setViewMode('LIST');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chỉ tiêu này khỏi danh mục?')) {
      const updated = indicators.filter(ind => ind.id !== id);
      setIndicators(updated);
      localStorage.setItem('vna_esg_indicators', JSON.stringify(updated));
      window.dispatchEvent(new Event('vna_indicators_updated'));
      alert('Đã xóa chỉ tiêu thành công!');
    }
  };

  // Mock Export Excel
  const handleExportExcel = () => {
    setImportLoading(true);
    setTimeout(() => {
      setImportLoading(false);
      alert('Đã xuất danh mục chỉ tiêu ra tệp Excel thành công! (vna_esg_indicators.xlsx)');
    }, 800);
  };

  // Mock Import Steps
  const handleFileSelect = () => {
    setImportLoading(true);
    setTimeout(() => {
      setImportLoading(false);
      setImportFile('danh_muc_chi_tieu_esg_vna_import.xlsx');
      setImportStep(2);
    }, 1200);
  };

  const handleConfirmImport = () => {
    setImportLoading(true);
    setTimeout(() => {
      // Mock imported records
      const importedRecords: Indicator[] = [
        {
          id: String(Date.now() + 1),
          code: 'KPI-ENV-07',
          name: 'Tỷ lệ sử dụng chất liệu nhựa tái chế thân thiện môi trường',
          pillar: Pillar.ENVIRONMENT,
          topic: 'Chất thải',
          unit: '%',
          frequency: 'Hàng tháng',
          weight: 10,
          department: 'Ban Dịch vụ Hành khách',
          sourceForm: 'ops-service',
          programs: [],
          inputDept: 'Ban Dịch vụ Hành khách',
          approveDept: 'Trưởng ban DVHK',
          monitorDept: 'Ban Chỉ đạo ESG',
          isActive: true,
          introduction: 'Tỷ lệ pha trộn chất liệu tái sinh trên các vật phẩm bay cung cấp cho khách hàng.'
        },
        {
          id: String(Date.now() + 2),
          code: 'KPI-SOC-02',
          name: 'Tỷ lệ cán bộ quản lý nữ trong ban lãnh đạo',
          pillar: Pillar.SOCIAL,
          topic: 'Nhân sự',
          unit: '%',
          frequency: 'Hàng năm',
          weight: 10,
          department: 'Ban Tổ chức nhân lực',
          sourceForm: 'ops-hr',
          programs: [],
          inputDept: 'Ban Tổ chức nhân lực',
          approveDept: 'Trưởng ban TCNL',
          monitorDept: 'Ban Chỉ đạo ESG',
          isActive: true,
          introduction: 'Tỷ lệ nữ giới nắm giữ vị trí quản lý cấp phòng trở lên tại Vietnam Airlines.'
        }
      ];

      const merged = [...indicators, ...importedRecords];
      setIndicators(merged);
      localStorage.setItem('vna_esg_indicators', JSON.stringify(merged));
      window.dispatchEvent(new Event('vna_indicators_updated'));

      setImportLoading(false);
      setIsImportOpen(false);
      setImportStep(1);
      setImportFile(null);
      alert('Đã nạp thành công 2 chỉ tiêu mới từ tệp Excel vào danh mục!');
    }, 1500);
  };

  if (viewMode === 'DASHBOARD' && formIndicator) {
    const hasMetabaseLink = !!formIndicator.metabaseLink;
    const hasReportText = !!formIndicator.reportText;

    if (hasMetabaseLink) {
      return (
        <div className="bg-white p-6 rounded-lg border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <Button variant="ghost" onClick={handleBack} className="p-2 cursor-pointer border border-gray-200 hover:bg-gray-100 flex items-center gap-1 text-xs bg-white">
              <ArrowLeft size={16} /> Quay lại danh sách chỉ tiêu
            </Button>
            <a
              href={formIndicator.metabaseLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-vna-blue hover:bg-[#00556e] rounded-md transition-all shadow-sm"
            >
              Xem chi tiết trên Metabase ↗
            </a>
          </div>

          <div className="flex-1 w-full bg-white rounded-lg overflow-hidden min-h-[750px] flex flex-col mb-6">
            <iframe
              src={formIndicator.metabaseLink}
              frameBorder="0"
              width="100%"
              height="100%"
              className="flex-1 min-h-[750px] w-full border-none"
              allowtransparency
            ></iframe>
          </div>

          <IndicatorHistoryTable
            indicatorCode={formIndicator.code}
            unit={formIndicator.unit || ''}
            department={formIndicator.department || ''}
            onViewForm={(period) => setHistoryFormPeriod(period)}
          />

          <Modal
            isOpen={!!historyFormPeriod && !!formIndicator}
            onClose={() => setHistoryFormPeriod(null)}
            title={`Chi tiết biểu mẫu nhập liệu - Kỳ ${historyFormPeriod}`}
            size="xl"
          >
            {historyFormPeriod && formIndicator && (
              <div className="max-h-[85vh] overflow-y-auto p-4 bg-slate-50 rounded-xl">
                <UnifiedDataEntryForm
                  department={mapIndicatorDeptToFormDept(formIndicator.department || '')}
                  effectivePeriod={historyFormPeriod}
                  onBack={() => setHistoryFormPeriod(null)}
                  onSave={() => setHistoryFormPeriod(null)}
                  isNewPeriod={false}
                />
              </div>
            )}
          </Modal>
        </div>
      );
    }

    if (hasReportText) {
      const report = formIndicator.reportText;
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
                    {formIndicator.code}
                  </span>
                  <PillarBadge pillar={formIndicator.pillar} />
                </div>
                <h2 className="text-lg font-bold text-vna-blue">{getLocalizedIndicatorName(formIndicator.name, currentLang)}</h2>
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

          <div className="flex-1 bg-slate-50 p-6 rounded-xl border border-gray-200 flex flex-col min-h-[500px] mb-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <FileText size={16} className="text-vna-blue" /> Văn bản hiển thị trên Dashboard
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                Chính thức
              </span>
            </div>

            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md flex-1 prose max-w-none relative overflow-y-auto leading-relaxed text-gray-800">
              {/* Watermark logo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                <div className="text-9xl font-extrabold text-vna-blue rotate-12">VNA</div>
              </div>

              {report.title && (
                <h3 className="text-xl font-bold text-center text-vna-blue mb-8 border-b-2 border-vna-blue pb-2 uppercase tracking-wide">
                  {report.title}
                </h3>
              )}

              {formIndicator.code === 'GRI 2-9' && (
                <div className="my-6 flex justify-center">
                  <img
                    src="/vna-images/gri_2_9_structure.png"
                    alt="Cơ cấu tổ chức VNA"
                    className="max-h-[450px] w-auto object-contain rounded-lg border border-gray-200 shadow-sm"
                  />
                </div>
              )}

              <div className="whitespace-pre-line text-[15px] text-justify text-gray-700 leading-relaxed">
                {report.content}
              </div>
            </div>
          </div>

          <IndicatorHistoryTable
            indicatorCode={formIndicator.code}
            unit={formIndicator.unit || ''}
            department={formIndicator.department || ''}
            onViewForm={(period) => setHistoryFormPeriod(period)}
          />

          <Modal
            isOpen={!!historyFormPeriod && !!formIndicator}
            onClose={() => setHistoryFormPeriod(null)}
            title={`Chi tiết biểu mẫu nhập liệu - Kỳ ${historyFormPeriod}`}
            size="xl"
          >
            {historyFormPeriod && formIndicator && (
              <div className="max-h-[85vh] overflow-y-auto p-4 bg-slate-50 rounded-xl">
                <UnifiedDataEntryForm
                  department={mapIndicatorDeptToFormDept(formIndicator.department || '')}
                  effectivePeriod={historyFormPeriod}
                  onBack={() => setHistoryFormPeriod(null)}
                  onSave={() => setHistoryFormPeriod(null)}
                  isNewPeriod={false}
                />
              </div>
            )}
          </Modal>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
          <Button variant="ghost" onClick={handleBack} className="p-2 cursor-pointer">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-vna-blue">Dashboard: {formIndicator.code} - {getLocalizedIndicatorName(formIndicator.name, currentLang)}</h2>
            <p className="text-xs text-black/45">
              Theo dõi số liệu thực hiện và tiến độ mục tiêu chiến lược
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
            <div className="text-blue-800 text-sm font-bold mb-1">Đơn vị đo / Trọng số</div>
            <div className="text-3xl font-black text-vna-blue">{formIndicator.unit || '-'} / {formIndicator.weight || 10}%</div>
          </div>
          <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-100">
            <div className="text-emerald-850 text-sm font-bold mb-1">Đơn vị chủ trì / Phụ trách</div>
            <div className="text-xl font-black text-emerald-800 truncate" title={formIndicator.department}>{formIndicator.department || '-'}</div>
          </div>
          <div className="bg-orange-50 p-5 rounded-lg border border-orange-100">
            <div className="text-orange-800 text-sm font-bold mb-1">Trạng thái áp dụng</div>
            <div className="text-3xl font-black text-orange-700">
              {formIndicator.isActive ? 'ĐANG HIỆU LỰC' : 'NGƯNG HIỆU LỰC'}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 flex-1 mb-6">
          <h3 className="text-sm font-bold text-vna-blue mb-4 text-left">
            Biểu đồ xu hướng
          </h3>
          <div className="h-[350px] w-full">
            <IndicatorChart indicatorCode={formIndicator.code} chartName={formIndicator.name} chartType="Line" />
          </div>
        </div>

        <IndicatorHistoryTable
          indicatorCode={formIndicator.code}
          unit={formIndicator.unit || ''}
          department={formIndicator.department || ''}
          onViewForm={(period) => setHistoryFormPeriod(period)}
        />

        <Modal
          isOpen={!!historyFormPeriod && !!formIndicator}
          onClose={() => setHistoryFormPeriod(null)}
          title={`Chi tiết biểu mẫu nhập liệu - Kỳ ${historyFormPeriod}`}
          size="xl"
        >
          {historyFormPeriod && formIndicator && (
            <div className="max-h-[85vh] overflow-y-auto p-4 bg-slate-50 rounded-xl">
              <UnifiedDataEntryForm
                department={mapIndicatorDeptToFormDept(formIndicator.department || '')}
                effectivePeriod={historyFormPeriod}
                onBack={() => setHistoryFormPeriod(null)}
                onSave={() => setHistoryFormPeriod(null)}
                isNewPeriod={false}
              />
            </div>
          )}
        </Modal>
      </div>
    );
  }

  if (viewMode === 'DETAIL' && formIndicator) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col text-left animate-in slide-in-from-right-4 duration-300">
        <div className="flex flex-col border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack} className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h2 className="text-xl font-bold text-vna-blue">
                  {formIndicator.code || 'Mới'} - {formIndicator.name || 'Tên chỉ tiêu'}
                </h2>
                {/* <p className="text-xs text-black/45">Thiết lập chung và Cấu hình chỉ tiêu ESG</p> */}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleBack}>Hủy bỏ</Button>
              <Button variant="primary" onClick={handleSave}><Save size={16} className="mr-2" />Lưu</Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-12 text-left space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* THÔNG TIN CHUNG */}
            <div className={`${Boolean(formIndicator.id) && !formIndicator.isStatic ? '' : 'lg:col-span-2'} bg-gray-50/50 p-5 rounded-lg border border-gray-200 space-y-4 shadow-2xs`}>
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">Thông tin chung</h3>
              <Input label="Mã chỉ tiêu" value={formIndicator.code} onChange={(e) => setFormIndicator({ ...formIndicator, code: e.target.value })} placeholder="VD: GRI 305-1, Airline E-1" />
              <Input label="Tên chỉ tiêu (VI)" value={formIndicator.name} onChange={(e) => setFormIndicator({ ...formIndicator, name: e.target.value })} placeholder="VD: Phát thải Scope 1" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Trụ cột ESG"
                  value={formIndicator.pillar}
                  onChange={(val) => setFormIndicator({ ...formIndicator, pillar: val as Pillar })}
                  options={[
                    { label: 'Môi trường (E)', value: Pillar.ENVIRONMENT },
                    { label: 'Xã hội (S)', value: Pillar.SOCIAL },
                    { label: 'Quản trị (G)', value: Pillar.GOVERNANCE }
                  ]}
                />
                <Input label="Chủ đề (Topic)" value={formIndicator.topic || ''} onChange={(e) => setFormIndicator({ ...formIndicator, topic: e.target.value })} placeholder="VD: Khí nhà kính, Nhiên liệu SAF" />
              </div>

              {/* 2 TRƯỜNG PHÂN VAI & TRÁCH NHIỆM (ĐẶT NGAY DƯỚI TRỤ CỘT VÀ CHỦ ĐỀ) */}
              <Select
                label="CQĐV Phụ trách"
                value={formIndicator.department || ''}
                onChange={(val) => setFormIndicator({ ...formIndicator, department: val })}
                options={[
                  { label: 'Ban Kỹ thuật (KT)', value: 'Ban Kỹ thuật' },
                  { label: 'Ban Khai thác bay (KTB)', value: 'Ban Khai thác bay' },
                  { label: 'Ban An toàn chất lượng (ATCL)', value: 'Ban An toàn chất lượng' },
                  { label: 'Ban Dịch vụ hành khách (DVHK)', value: 'Ban Dịch vụ hành khách' },
                  { label: 'Ban Tổ chức nhân lực (TCNL)', value: 'Ban Tổ chức nhân lực' },
                  { label: 'Ban Công nghệ thông tin (CNTT)', value: 'Ban Công nghệ thông tin' },
                  { label: 'Ban Kế hoạch phát triển (KHPT)', value: 'Ban Kế hoạch phát triển' },
                  { label: 'Ban Truyền thông (TT)', value: 'Ban Truyền thông' }
                ]}
              />

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nhãn chương trình áp dụng</label>
                <div className="flex flex-wrap gap-6 p-3 bg-white border border-gray-300 rounded-lg">
                  {['CORSIA', 'EU ETS', 'UK ETS'].map(prog => {
                    const isChecked = formIndicator.programs?.includes(prog) || false;
                    return (
                      <label key={prog} className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            let newProgs = [...(formIndicator.programs || [])];
                            if (isChecked) {
                              newProgs = newProgs.filter(p => p !== prog);
                            } else {
                              newProgs.push(prog);
                            }
                            setFormIndicator({ ...formIndicator, programs: newProgs });
                          }}
                          className="w-4 h-4 text-vna-blue rounded border-gray-300 focus:ring-vna-blue cursor-pointer"
                        />
                        {prog}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Trạng thái chỉ tiêu */}
              <Select
                label="Trạng thái chỉ tiêu"
                value={formIndicator.isActive ? 'active' : 'inactive'}
                onChange={(val) => setFormIndicator({ ...formIndicator, isActive: val === 'active' })}
                options={[
                  { label: 'Hoạt động', value: 'active' },
                  { label: 'Ngừng hoạt động', value: 'inactive' }
                ]}
              />

              {/* Hình thức báo cáo */}
              <Select
                label="Hình thức báo cáo"
                value={formIndicator.isStatic ? 'TEXT' : 'NUMERIC'}
                onChange={(val) => {
                  const isText = val === 'TEXT';
                  setFormIndicator({
                    ...formIndicator,
                    reportType: isText ? 'TEXT' : 'NUMERIC',
                    isStatic: isText,
                    unit: isText ? 'Văn bản' : (formIndicator.unit === 'Văn bản' ? '' : formIndicator.unit),
                    question: isText ? (formIndicator.question || '') : '',
                    descriptionCondition: isText ? (formIndicator.descriptionCondition || 'No') : 'No',
                    mainDisclosurePoints: isText ? (formIndicator.mainDisclosurePoints || '') : ''
                  });
                }}
                options={[
                  { label: 'Số liệu', value: 'NUMERIC' },
                  { label: 'Nội dung văn bản', value: 'TEXT' }
                ]}
              />

              {/* 1. NẾU LÀ "SỐ LIỆU": HIỂN THỊ ĐƠN VỊ TÍNH, TẦN SUẤT BÁO CÁO, CHỌN BIỂU MẪU THU THẬP SỐ LIỆU, LINK BÁO CÁO, LINK METABASE */}
              {!formIndicator.isStatic && (
                <div className="space-y-4 pt-2 border-t border-gray-200 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Đơn vị tính"
                      value={formIndicator.unit === 'Văn bản' ? '' : (formIndicator.unit || '')}
                      onChange={(e) => setFormIndicator({ ...formIndicator, unit: e.target.value })}
                      placeholder="VD: %, Tấn, Vụ, Tấn-km..."
                    />
                    <Select
                      label="Tần suất báo cáo"
                      value={formIndicator.frequency || 'Hàng tháng'}
                      onChange={(val) => setFormIndicator({ ...formIndicator, frequency: val })}
                      options={[
                        { label: 'Theo tháng', value: 'Hàng tháng' },
                        { label: 'Theo quý', value: 'Hàng quý' },
                        { label: 'Theo năm', value: 'Hàng năm' }
                      ]}
                    />
                  </div>

                  {/* CHỌN BIỂU MẪU THU THẬP SỐ LIỆU */}
                  <div className="relative text-left">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Chọn biểu mẫu nhập liệu
                      </label>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 uppercase">
                        {(formIndicator.assignedForms || []).length} được gán
                      </span>
                    </div>

                    {/* Combobox Input Trigger */}
                    <div
                      onClick={() => setIsOpenFormDropdown(!isOpenFormDropdown)}
                      className="min-h-[42px] p-2 bg-white border border-gray-300 rounded-lg flex flex-wrap gap-1.5 items-center cursor-pointer hover:border-gray-400 transition-colors focus-within:border-vna-blue focus-within:ring-1 focus-within:ring-vna-blue/30"
                    >
                      {(formIndicator.assignedForms || []).length === 0 ? (
                        <span className="text-sm text-gray-400 pl-1.5">Click để chọn các biểu mẫu...</span>
                      ) : (
                        (formIndicator.assignedForms || []).map(formId => {
                          const formObj = allForms.find(f => f.id === formId);
                          return (
                            <div
                              key={formId}
                              className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-vna-blue px-2.5 py-0.5 rounded-md text-xs font-bold"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>{formObj ? formObj.name : formId}</span>
                              <button
                                onClick={() => {
                                  const newAssigned = (formIndicator.assignedForms || []).filter(id => id !== formId);
                                  setFormIndicator({ ...formIndicator, assignedForms: newAssigned });
                                }}
                                className="text-blue-500 hover:text-blue-750 font-bold ml-1 rounded-full w-3.5 h-3.5 flex items-center justify-center hover:bg-blue-100"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })
                      )}
                      <span className="ml-auto text-gray-400 mr-1.5">▼</span>
                    </div>

                    {/* Dropdown Menu */}
                    {isOpenFormDropdown && (
                      <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-250 rounded-lg shadow-lg overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
                        {/* Search Bar inside Combobox */}
                        <div className="p-2 border-b border-gray-150 bg-gray-50 flex items-center gap-2">
                          <Search size={14} className="text-gray-400 ml-1.5" />
                          <input
                            type="text"
                            value={searchFormQuery}
                            onChange={(e) => setSearchFormQuery(e.target.value)}
                            placeholder="Tìm kiếm biểu mẫu nhanh..."
                            className="flex-1 bg-transparent text-sm border-none focus:outline-none focus:ring-0 p-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {searchFormQuery && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSearchFormQuery(''); }}
                              className="text-gray-400 hover:text-gray-655 text-xs font-bold"
                            >
                              Xóa
                            </button>
                          )}
                        </div>

                        {/* Options List */}
                        <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                          {(() => {
                            const filtered = allForms.filter(f =>
                              f.name.toLowerCase().includes(searchFormQuery.toLowerCase()) ||
                              f.id.toLowerCase().includes(searchFormQuery.toLowerCase())
                            );

                            if (filtered.length === 0) {
                              return <div className="p-3 text-center text-xs text-gray-400">Không tìm thấy biểu mẫu nào</div>;
                            }

                            return filtered.map(form => {
                              const isChecked = (formIndicator.assignedForms || []).includes(form.id);
                              return (
                                <div
                                  key={form.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentAssigned = [...(formIndicator.assignedForms || [])];
                                    let newAssigned;
                                    if (isChecked) {
                                      newAssigned = currentAssigned.filter(id => id !== form.id);
                                    } else {
                                      newAssigned = [...currentAssigned, form.id];
                                    }
                                    setFormIndicator({ ...formIndicator, assignedForms: newAssigned });
                                  }}
                                  className={`p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors ${isChecked ? 'bg-blue-50/20 font-bold' : ''
                                    }`}
                                >
                                  <div className="text-left flex-1 pr-4">
                                    <div className="text-gray-800 font-semibold">{form.name}</div>
                                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{form.id} • {form.fields?.length || 0} trường động</div>
                                  </div>
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'border-vna-blue bg-vna-blue text-white' : 'border-gray-300'
                                    }`}>
                                    {isChecked && <span className="text-[9px] font-black">✓</span>}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>

                        {/* Dropdown Footer Action */}
                        <div className="p-2 bg-gray-50 border-t border-gray-150 flex justify-between items-center text-[10px]">
                          <span className="text-gray-500 font-semibold">Bấm bên ngoài để đóng bảng chọn</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setIsOpenFormDropdown(false); }}
                            className="px-2.5 py-1 bg-vna-blue hover:bg-vna-blue/90 text-white rounded font-bold cursor-pointer transition-colors"
                          >
                            Xác nhận
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Link Báo cáo" value={formIndicator.reportLink || ''} onChange={(e) => setFormIndicator({ ...formIndicator, reportLink: e.target.value })} placeholder="Nhập link embed báo cáo" />
                    <Input label="Link Metabase" value={formIndicator.metabaseLink || ''} onChange={(e) => setFormIndicator({ ...formIndicator, metabaseLink: e.target.value })} placeholder="Nhập link truy cập metabase" />
                  </div>
                </div>
              )}

              {/* 2. NẾU LÀ "NỘI DUNG VĂN BẢN": HIỂN THỊ CÂU HỎI, ĐIỀU KIỆN MÔ TẢ, MỤC CHÍNH CẦN CÔNG BỐ THUYẾT MINH */}
              {formIndicator.isStatic && (
                <div className="space-y-4 pt-3 border-t border-gray-200 animate-in fade-in duration-200">
                  <div className="space-y-4 pl-4 border-l-2 border-vna-blue bg-blue-50/10 p-3 rounded-r-md">
                    <Input
                      label="Câu hỏi (Question)"
                      value={formIndicator.question || ''}
                      onChange={(e) => setFormIndicator({ ...formIndicator, question: e.target.value })}
                      placeholder="VD: Trong kỳ báo cáo, doanh nghiệp có xảy ra bất kỳ vụ việc..."
                    />

                    {/* <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Điều kiện mô tả</span>
                      <div className="flex gap-6 items-center bg-white border border-gray-250 p-2.5 rounded-lg w-fit">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                          <input
                            type="checkbox"
                            checked={formIndicator.descriptionCondition === 'Yes'}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormIndicator({ ...formIndicator, descriptionCondition: 'Yes' });
                              }
                            }}
                            className="w-4 h-4 text-vna-blue rounded border-gray-300 focus:ring-vna-blue cursor-pointer"
                          />
                          <span>{currentLang === 'en' ? 'Yes' : 'Có'}</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                          <input
                            type="checkbox"
                            checked={formIndicator.descriptionCondition === 'No'}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormIndicator({ ...formIndicator, descriptionCondition: 'No' });
                              }
                            }}
                            className="w-4 h-4 text-vna-blue rounded border-gray-300 focus:ring-vna-blue cursor-pointer"
                          />
                          <span>{currentLang === 'en' ? 'No' : 'Không'}</span>
                        </label>
                      </div>
                    </div> */}

                    <div className="w-full">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">yêu cầu của GRI/ASRH</label>
                      <textarea
                        value={formIndicator.mainDisclosurePoints || ''}
                        onChange={(e) => setFormIndicator({ ...formIndicator, mainDisclosurePoints: e.target.value })}
                        className="w-full min-h-[90px] border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-vna-blue/30 focus:border-vna-blue bg-white text-gray-800"
                        placeholder="VD: - Tổng số và tính chất các sự cố...&#10;- Số lượng nhân sự bị xử lý..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CỘT PHẢI: CÔNG THỨC TÍNH TOÁN (Chỉ hiển thị khi chỉnh sửa chỉ tiêu số liệu) */}
            <div className="flex flex-col gap-6">
              {/* CÔNG THỨC TÍNH TOÁN (Chỉ hiển thị khi chỉnh sửa chỉ tiêu số liệu) */}
              {Boolean(formIndicator.id) && !formIndicator.isStatic && (appliedFormulas.length > 0 || formIndicator.metabaseLink || formIndicator.unit) && (
                <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200 space-y-4 shadow-2xs text-left">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                    <h3 className="text-sm font-bold text-vna-blue uppercase tracking-wider flex items-center gap-1.5">
                      <Calculator size={16} />
                      <span>Công thức tính toán</span>
                    </h3>
                  </div>
                  {appliedFormulas.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">Chưa cấu hình công thức nào trong hệ thống cho chỉ tiêu này.</p>
                  ) : (
                    <div className="space-y-3">
                      {appliedFormulas.map((f: any) => (
                        <div key={f.id} className="p-3 bg-white border border-gray-200 rounded-lg space-y-2.5 shadow-3xs">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-vna-blue font-mono">{f.code}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">v{f.version}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">{f.type === 'Calculation' ? 'Tính toán' : 'Mô phỏng'}</span>
                            </div>

                            {/* BUTTON CHỈNH SỬA CÔNG THỨC */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditFormula(f)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-250 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-3xs"
                              title="Chỉnh sửa hệ số công thức"
                            >
                              <Edit3 size={12} />
                              <span>Sửa công thức</span>
                            </button>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 block mb-0.5">Tên công thức</span>
                            <span className="text-xs font-semibold text-gray-800">{f.name}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 block mb-0.5">Biểu thức tính toán</span>
                            <div className="p-2.5 bg-slate-50 border border-gray-250 rounded-lg font-mono text-xs text-gray-800 select-all flex items-center justify-between">
                              <span>{f.expression}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-500 font-medium pt-0.5">
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-150">
                              <Calendar size={12} className="text-vna-blue" />
                              <span>Ngày hiệu lực áp dụng: <strong className="text-vna-blue font-bold">{f.effectiveDate || f.appliedFrom || f.updatedAt || '01/01/2026'}</strong></span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                              <User size={12} />
                              <span>Người cập nhật: <strong className="text-gray-700">{f.updatedBy || 'Admin'}</strong></span>
                            </div>
                          </div>
                          {f.description && (
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 block mb-0.5">Mô tả chi tiết</span>
                              <p className="text-[11px] text-gray-600 italic leading-relaxed">{f.description}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200 shadow-2xs text-left">
            <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider">Mô tả</h3>
            <textarea
              value={formIndicator.introduction || ''}
              onChange={(e) => setFormIndicator({ ...formIndicator, introduction: e.target.value })}
              className="w-full min-h-[120px] border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-vna-blue/20 focus:border-vna-blue"
              placeholder="Nhập giới thiệu, phương pháp tính toán của chỉ tiêu ở đây..."
            />
          </div>

          {/* LỊCH SỬ CÔNG THỨC TÍNH TOÁN (Chỉ hiển thị khi chỉnh sửa chỉ tiêu số liệu) */}
          {Boolean(formIndicator.id) && !formIndicator.isStatic && (
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-left mt-6">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-4">
                <History className="text-vna-blue" size={18} />
                <h3 className="text-sm font-bold text-vna-blue uppercase tracking-wider">Lịch sử công thức tính toán</h3>
              </div>

              {formulaHistory.length === 0 ? (
                <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Info size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-semibold">Không tìm thấy lịch sử công thức tính toán cho chỉ tiêu này.</p>
                  <p className="text-xs text-gray-400 mt-1">Chỉ tiêu này là định tính (Thuyết minh) hoặc chưa được thiết lập công thức tính toán.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-3xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50/60 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3 w-16 text-center">Phiên bản</th>
                        <th className="p-3 w-72">Biểu thức công thức</th>
                        <th className="p-3">Mô tả thay đổi / Lý do cập nhật</th>
                        <th className="p-3 w-48 text-center">Thời gian áp dụng</th>
                        <th className="p-3 w-36">Người cập nhật</th>
                        <th className="p-3 w-28 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 bg-white">
                      {formulaHistory.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-3 text-center font-bold text-slate-800">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                              {item.version}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-gray-700 select-all bg-slate-50/50">
                            {item.expression}
                          </td>
                          <td className="p-3 text-gray-600 font-medium">
                            {item.changeLog}
                          </td>
                          <td className="p-3 text-center text-gray-500 font-semibold">
                            <div className="flex items-center justify-center gap-1">
                              <Calendar size={12} className="text-gray-400" />
                              <span>{item.appliedFrom}</span>
                              <span className="text-gray-300">→</span>
                              <span className={item.appliedTo === 'Hiện tại' ? 'text-vna-blue font-bold' : ''}>
                                {item.appliedTo}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-gray-500 font-medium">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1 font-semibold text-slate-700">
                                <User size={12} className="text-gray-400" />
                                <span>{item.updatedBy}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Clock size={11} className="text-gray-300" />
                                <span>{item.updatedAt}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            {item.status === 'Active' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/30">
                                <Check size={10} /> Đang áp dụng
                              </span>
                            ) : item.status === 'Scheduled' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock size={10} /> Sắp áp dụng ({item.appliedFrom})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-200/30">
                                Hết hiệu lực
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL CHỈNH SỬA HỆ SỐ CÔNG THỨC */}
        {editingFormula && (
          <div className="fixed inset-0 bg-[#0d1525]/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl border border-gray-200">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                    <Calculator size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-vna-blue font-mono">{editingFormula.code}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-vna-blue border border-blue-200 rounded font-mono">
                        Phiên bản hiện tại: v{editingFormula.version}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 mt-0.5">Chỉnh sửa hệ số công thức tính toán</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingFormula(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-left">
                {/* Guidance banner */}
                <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-gray-700">
                  <ShieldAlert size={16} className="text-vna-blue shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-vna-blue">Quy tắc chỉnh sửa hệ số công thức:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-600">
                      <li><strong className="text-amber-800">Hệ số số học có sẵn (✏️ Cho phép sửa):</strong> Bạn có thể trực tiếp thay đổi giá trị của các hệ số có sẵn trong công thức (hệ số phát thải, tỷ lệ quy đổi...).</li>
                      <li><strong className="text-gray-800">Trường dữ liệu DB, Toán tử & Cấu trúc (🔒 Cố định):</strong> Khóa cố định toàn bộ các trường DB, toán tử (+, -, ×, ÷) và cấu trúc biểu thức để bảo toàn tính toàn vẹn dữ liệu.</li>
                    </ul>
                  </div>
                </div>

                {/* Interactive Token Board */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-600" />
                      <span>Thành phần công thức</span>
                    </label>
                    <span className="text-[11px] text-gray-400 italic">Nhập giá trị mới vào các ô Hệ số bên dưới</span>
                  </div>

                  {/* Token Container */}
                  <div className="p-4 bg-slate-50 border-2 border-dashed border-gray-250 rounded-xl flex flex-wrap items-center gap-2.5 min-h-[90px]">
                    {editingTokens.map(tok => {
                      if (tok.isDbField) {
                        return (
                          <div
                            key={tok.id}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-vna-blue border border-blue-200 rounded-lg text-xs font-mono font-bold shadow-3xs cursor-not-allowed select-none"
                            title="Trường dữ liệu DB (Cố định, không cho phép sửa)"
                          >
                            <Lock size={11} className="text-blue-500 shrink-0" />
                            <Database size={12} className="text-blue-600 shrink-0" />
                            <span>{tok.value}</span>
                          </div>
                        );
                      }

                      if (tok.type === 'number') {
                        return (
                          <div key={tok.id} className="flex flex-col items-center gap-0.5">
                            <span className="text-[8px] font-bold text-amber-700 uppercase tracking-wider">Hệ số (Sửa)</span>
                            <input
                              type="number"
                              step="any"
                              value={tok.value}
                              onChange={(e) => handleUpdateTokenValue(tok.id, e.target.value)}
                              className="w-24 px-2 py-1 text-xs font-mono font-black text-amber-900 bg-amber-50 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:bg-white text-center shadow-3xs focus:outline-none"
                              title="Nhập hệ số mới"
                            />
                          </div>
                        );
                      }

                      return (
                        <span key={tok.id} className="text-base font-bold text-gray-500 px-1 select-none">
                          {tok.value === '*' ? '×' : tok.value === '/' ? '÷' : tok.value}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Live Expression Preview */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-600 uppercase">Biểu thức tính toán sau khi điều chỉnh:</label>
                  <div className="p-3 bg-gray-900 text-emerald-400 font-mono text-xs rounded-xl border border-gray-800 select-all shadow-inner break-all">
                    {editingTokens.map(t => t.value).join(' ')}
                  </div>
                </div>

                {/* Version, Effective Date & Change Log */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Phiên bản mới:</label>
                    <Input
                      value={editingNewVersion}
                      onChange={(e) => setEditingNewVersion(e.target.value)}
                      className="text-xs font-mono font-bold"
                      placeholder="v2.2"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1 flex items-center gap-1">
                      <Calendar size={12} className="text-vna-blue" />
                      <span>Ngày hiệu lực áp dụng:</span>
                    </label>
                    <Input
                      type="date"
                      value={editingEffectiveDate}
                      onChange={(e) => setEditingEffectiveDate(e.target.value)}
                      className="text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Lý do điều chỉnh / Ghi chú:</label>
                    <Input
                      value={editingChangeLog}
                      onChange={(e) => setEditingChangeLog(e.target.value)}
                      className="text-xs"
                      placeholder="Ví dụ: Cập nhật hệ số theo ICAO 2026..."
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2.5 p-3.5 border-t border-gray-200 bg-gray-50/80">
                <Button variant="outline" size="sm" onClick={() => setEditingFormula(null)}>
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveFormula}
                  className="bg-vna-blue hover:bg-vna-blue/90 text-white font-bold flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Lưu công thức</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-300">
      {/* Top Actions & Count Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="text-xs font-semibold text-gray-500">
          {/* {currentLang === 'vi' ? `Tổng số: ${filteredIndicators.length} chỉ tiêu` : `Total: ${filteredIndicators.length} indicators`} */}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" onClick={handleExportExcel} className="cursor-pointer font-bold text-xs">
            <Download size={15} className="mr-1.5" /> {currentLang === 'vi' ? 'Xuất Excel' : 'Export Excel'}
          </Button>
          <Button onClick={handleAddNew} className="shadow-xs cursor-pointer font-bold text-xs">
            <Plus size={15} className="mr-1.5" /> {currentLang === 'vi' ? 'Thêm mới' : 'Add new'}
          </Button>
        </div>
      </div>

      {/* Indicators List Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 flex-1 min-h-[400px]">
        <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-3 font-semibold text-gray-700 w-12 text-center whitespace-nowrap">STT</th>
              <th
                onClick={() => handleToggleSort('code')}
                className="py-3 px-3 font-semibold text-gray-700 w-36 whitespace-nowrap cursor-pointer select-none hover:bg-gray-100 transition-colors"
                title={currentLang === 'vi' ? 'Nhấn để sắp xếp theo Mã chỉ tiêu' : 'Click to sort by Code'}
              >
                <div className="flex items-center gap-1.5 justify-between">
                  <span>{currentLang === 'vi' ? 'Mã chỉ tiêu' : 'Code'}</span>
                  <span className="text-gray-400">
                    {sortField === 'code' && sortOrder === 'asc' ? <ArrowUp size={14} className="text-vna-blue font-bold" /> :
                      sortField === 'code' && sortOrder === 'desc' ? <ArrowDown size={14} className="text-vna-blue font-bold" /> :
                        <ArrowUpDown size={14} className="opacity-40" />}
                  </span>
                </div>
              </th>
              <th
                onClick={() => handleToggleSort('name')}
                className="py-3 px-3 font-semibold text-gray-700 min-w-[240px] whitespace-nowrap cursor-pointer select-none hover:bg-gray-100 transition-colors"
                title={currentLang === 'vi' ? 'Nhấn để sắp xếp theo Tên chỉ tiêu' : 'Click to sort by Indicator Name'}
              >
                <div className="flex items-center gap-1.5 justify-between">
                  <span>{currentLang === 'vi' ? 'Tên chỉ tiêu' : 'Indicator Name'}</span>
                  <span className="text-gray-400">
                    {sortField === 'name' && sortOrder === 'asc' ? <ArrowUp size={14} className="text-vna-blue font-bold" /> :
                      sortField === 'name' && sortOrder === 'desc' ? <ArrowDown size={14} className="text-vna-blue font-bold" /> :
                        <ArrowUpDown size={14} className="opacity-40" />}
                  </span>
                </div>
              </th>
              <th className="py-3 px-3 font-semibold text-gray-700 w-36 text-center whitespace-nowrap">{currentLang === 'vi' ? 'Trụ cột' : 'Pillar'}</th>
              <th className="py-3 px-3 font-semibold text-gray-700 w-40 whitespace-nowrap">{currentLang === 'vi' ? 'Chủ đề' : 'Topic'}</th>
              <th className="py-3 px-3 font-semibold text-gray-700 w-24 text-center whitespace-nowrap">{currentLang === 'vi' ? 'ĐVT' : 'Unit'}</th>
              <th className="py-3 px-3 font-semibold text-gray-700 w-44 whitespace-nowrap">{currentLang === 'vi' ? 'CQĐV Phụ Trách' : 'Department'}</th>
              <th className="py-3 px-3 font-semibold text-gray-700 w-28 text-center whitespace-nowrap">{currentLang === 'vi' ? 'Trạng thái' : 'Status'}</th>
              <th className="py-3 px-3 font-semibold text-gray-700 w-24 text-center whitespace-nowrap">{currentLang === 'vi' ? 'Thao tác' : 'Actions'}</th>
            </tr>

            {/* COLUMN FILTER ROW */}
            <tr className="bg-blue-50/70 border-b border-gray-200">
              {/* 1. STT Spacer */}
              <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

              {/* 2. Filter Code */}
              <th className="py-2 px-2 text-left">
                <div className="relative">
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder={currentLang === 'vi' ? 'Lọc mã...' : 'Filter code...'}
                    className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue"
                  />
                  {searchCode && (
                    <button onClick={() => setSearchCode('')} className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                  )}
                </div>
              </th>

              {/* 3. Filter Name */}
              <th className="py-2 px-2 text-left">
                <div className="relative">
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder={currentLang === 'vi' ? 'Lọc tên chỉ tiêu...' : 'Filter name...'}
                    className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue"
                  />
                  {searchName && (
                    <button onClick={() => setSearchName('')} className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                  )}
                </div>
              </th>

              {/* 4. Filter Pillar */}
              <th className="py-2 px-2 text-center">
                <select
                  value={selectedPillar}
                  onChange={(e) => setSelectedPillar(e.target.value)}
                  className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue"
                >
                  <option value="">{currentLang === 'vi' ? 'Tất cả trụ cột' : 'All Pillars'}</option>
                  <option value={Pillar.ENVIRONMENT}>{currentLang === 'vi' ? 'Môi trường (E)' : 'Environment (E)'}</option>
                  <option value={Pillar.SOCIAL}>{currentLang === 'vi' ? 'Xã hội (S)' : 'Social (S)'}</option>
                  <option value={Pillar.GOVERNANCE}>{currentLang === 'vi' ? 'Quản trị (G)' : 'Governance (G)'}</option>
                </select>
              </th>

              {/* 5. Filter Topic */}
              <th className="py-2 px-2 text-left">
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue"
                >
                  <option value="">{currentLang === 'vi' ? 'Tất cả chủ đề' : 'All Topics'}</option>
                  {topicOptions.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </th>

              {/* 6. Filter Unit Spacer */}
              <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

              {/* 7. Filter Department */}
              <th className="py-2 px-2 text-left">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue"
                >
                  <option value="">{currentLang === 'vi' ? 'Tất cả đơn vị' : 'All Depts'}</option>
                  {deptOptions.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </th>

              {/* 8. Filter Status */}
              <th className="py-2 px-2 text-center">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue"
                >
                  <option value="">{currentLang === 'vi' ? 'Tất cả' : 'All'}</option>
                  <option value="active">{currentLang === 'vi' ? 'Hiệu lực' : 'Active'}</option>
                  <option value="inactive">{currentLang === 'vi' ? 'Ngưng áp dụng' : 'Inactive'}</option>
                </select>
              </th>

              {/* 9. Clear Filter Action */}
              <th className="py-2 px-2 text-center">
                {(searchCode || searchName || selectedPillar || selectedTopic || selectedDept || selectedStatus) && (
                  <button
                    onClick={() => {
                      setSearchCode('');
                      setSearchName('');
                      setSelectedPillar('');
                      setSelectedTopic('');
                      setSelectedDept('');
                      setSelectedStatus('');
                    }}
                    className="text-[11px] font-bold text-red-600 hover:text-red-800 underline cursor-pointer px-1 py-0.5 rounded hover:bg-red-50"
                    title={currentLang === 'vi' ? 'Xóa tất cả bộ lọc' : 'Clear all filters'}
                  >
                    {currentLang === 'vi' ? 'Xóa lọc' : 'Clear'}
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredIndicators.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50/45 group transition-colors cursor-pointer" onClick={() => {
                setFormIndicator(item);
                setViewMode('DASHBOARD');
              }}>
                <td className="py-3.5 px-4 text-center text-gray-400 font-medium whitespace-nowrap">{index + 1}</td>
                <td className="py-3.5 px-4 font-bold text-vna-blue whitespace-nowrap">{item.code}</td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="font-semibold text-gray-800 truncate max-w-[280px] text-left" title={item.name}>{getLocalizedIndicatorName(item.name, currentLang)}</div>
                  {item.programs && item.programs.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {item.programs.map(p => (
                        <span key={p} className="bg-blue-50 text-[9px] font-bold text-vna-blue px-1.5 py-0.2 rounded border border-blue-200">{p}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${item.pillar === Pillar.ENVIRONMENT ? 'bg-green-50 text-green-700 border-green-200' : item.pillar === Pillar.SOCIAL ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {item.pillar === Pillar.ENVIRONMENT ? 'Môi trường (E)' : item.pillar === Pillar.SOCIAL ? 'Xã hội (S)' : 'Quản trị (G)'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-600 font-medium whitespace-nowrap text-left">{item.topic || '--'}</td>
                <td className="py-3.5 px-4 text-center text-gray-600 font-bold whitespace-nowrap">{item.unit || '--'}</td>
                <td className="py-3.5 px-4 text-gray-700 font-semibold whitespace-nowrap text-left">{item.department}</td>
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-650 border border-red-200'}`}>
                    {item.isActive ? 'Hoạt động' : 'Ngưng áp dụng'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <div className="flex justify-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormIndicator(item);
                        setViewMode('DETAIL');
                      }}
                      className="p-1 rounded text-gray-500 hover:bg-vna-blue hover:text-white transition-colors cursor-pointer"
                      title="Sửa cấu hình"
                    >
                      <Settings size={15} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormIndicator(item);
                        setViewMode('DASHBOARD');
                      }}
                      className="p-1 rounded text-gray-500 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
                      title="Xem biểu đồ"
                    >
                      <BarChart2 size={15} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-1 rounded text-gray-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      title="Xóa chỉ tiêu"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredIndicators.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-400 font-bold">
                  Không tìm thấy chỉ tiêu nào phù hợp với bộ lọc tìm kiếm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CHỈNH SỬA HỆ SỐ CÔNG THỨC */}
      {editingFormula && (
        <div className="fixed inset-0 bg-[#0d1525]/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  <Calculator size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-vna-blue font-mono">{editingFormula.code}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-vna-blue border border-blue-200 rounded font-mono">
                      Phiên bản hiện tại: v{editingFormula.version}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mt-0.5">Chỉnh sửa hệ số công thức tính toán</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingFormula(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-left">
              {/* Guidance banner */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-gray-700">
                <ShieldAlert size={16} className="text-vna-blue shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-vna-blue">Quy tắc bảo vệ dữ liệu công thức:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-600">
                    <li><strong className="text-gray-800">Trường dữ liệu từ DB (🔒 Khóa):</strong> Được bảo vệ cố định theo cấu trúc bảng cơ sở dữ liệu, không cho phép chỉnh sửa.</li>
                    <li><strong className="text-amber-800">Hệ số số học (✏️ Mở):</strong> Bạn có thể trực tiếp thay đổi các hệ số quy đổi, định mức hoặc tỷ lệ %.</li>
                  </ul>
                </div>
              </div>

              {/* Interactive Token Board */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>Thành phần công thức</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMultiplier}
                    className="text-[11px] text-vna-blue hover:text-vna-blue/80 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Thêm hệ số (* 1.0)</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border-2 border-dashed border-gray-250 rounded-xl flex flex-wrap items-center gap-2.5 min-h-[90px]">
                  {editingTokens.map(tok => {
                    if (tok.isDbField) {
                      return (
                        <div
                          key={tok.id}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-vna-blue border border-blue-200 rounded-lg text-xs font-mono font-bold shadow-3xs cursor-not-allowed select-none"
                          title="Trường dữ liệu DB (Cố định, không thể sửa)"
                        >
                          <Lock size={11} className="text-blue-500 shrink-0" />
                          <Database size={12} className="text-blue-600 shrink-0" />
                          <span>{tok.value}</span>
                        </div>
                      );
                    }

                    if (tok.type === 'number') {
                      return (
                        <div key={tok.id} className="flex flex-col items-center gap-0.5">
                          <span className="text-[8px] font-bold text-amber-700 uppercase tracking-wider">Hệ số (Sửa)</span>
                          <input
                            type="number"
                            step="any"
                            value={tok.value}
                            onChange={(e) => handleUpdateTokenValue(tok.id, e.target.value)}
                            className="w-24 px-2 py-1 text-xs font-mono font-black text-amber-900 bg-amber-50 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:bg-white text-center shadow-3xs focus:outline-none"
                          />
                        </div>
                      );
                    }

                    return (
                      <span key={tok.id} className="text-base font-bold text-gray-500 px-0.5">
                        {tok.value}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Live Expression Preview */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 uppercase">Biểu thức tính toán sau khi điều chỉnh:</label>
                <div className="p-3 bg-gray-900 text-emerald-400 font-mono text-xs rounded-xl border border-gray-800 select-all shadow-inner break-all">
                  {editingTokens.map(t => t.value).join(' ')}
                </div>
              </div>

              {/* Version & Change Log */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Phiên bản mới:</label>
                  <Input
                    value={editingNewVersion}
                    onChange={(e) => setEditingNewVersion(e.target.value)}
                    className="text-xs font-mono font-bold"
                    placeholder="v2.2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Lý do điều chỉnh / Ghi chú thay đổi:</label>
                  <Input
                    value={editingChangeLog}
                    onChange={(e) => setEditingChangeLog(e.target.value)}
                    className="text-xs"
                    placeholder="Ví dụ: Cập nhật hệ số phát thải theo hướng dẫn mới 2026..."
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2.5 p-3.5 border-t border-gray-200 bg-gray-50/80">
              <Button variant="outline" size="sm" onClick={() => setEditingFormula(null)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveFormula}
                className="bg-vna-blue hover:bg-vna-blue/90 text-white font-bold flex items-center gap-1.5"
              >
                <Save size={14} />
                <span>Lưu công thức</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Excel Import Dialog */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden text-left animate-in zoom-in-95 duration-200">
            <div className="bg-vna-blue text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><FileSpreadsheet size={18} /> Nhập danh mục chỉ tiêu từ Excel</h3>
              <button onClick={() => setIsImportOpen(false)} className="text-white/70 hover:text-white transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Step indicator */}
              <div className="grid grid-cols-3 gap-2">
                {['Chọn tệp Excel', 'Kiểm định dữ liệu', 'Hoàn thành'].map((lbl, idx) => (
                  <div key={lbl} className={`rounded-lg border px-3 py-2 text-center text-xs font-bold ${importStep === idx + 1 ? 'border-vna-blue bg-blue-50 text-vna-blue' : importStep > idx + 1 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-400'}`}>
                    {idx + 1}. {lbl}
                  </div>
                ))}
              </div>

              {importLoading && (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-4 border-t-vna-blue border-r-vna-blue/20 border-b-vna-blue/20 border-l-vna-blue/20 animate-spin" />
                  <p className="text-sm font-semibold text-gray-500">Đang tải và xử lý dữ liệu...</p>
                </div>
              )}

              {!importLoading && importStep === 1 && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-3">
                    <div className="bg-blue-50 p-4 rounded-full text-vna-blue"><Upload size={28} /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Kéo thả hoặc click để chọn tệp tải lên</p>
                      <p className="text-xs text-gray-400 mt-1">Hỗ trợ định dạng .xlsx, .xls theo biểu mẫu chuẩn VNA</p>
                    </div>
                    <Button onClick={handleFileSelect} variant="primary" size="sm" className="mt-2">Chọn file từ máy tính</Button>
                  </div>
                  <div className="bg-blue-50/55 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                    <Info size={16} className="text-vna-blue shrink-0 mt-0.5" />
                    <div className="text-xs text-vna-blue leading-relaxed">
                      <span className="font-bold">Lưu ý:</span> Cột mã chỉ tiêu, tên chỉ tiêu, trụ cột và đơn vị chủ trì là bắt buộc. Hệ thống sẽ tự động đối chiếu và cảnh báo nếu có bản ghi không hợp lệ hoặc bị trùng lặp.
                    </div>
                  </div>
                </div>
              )}

              {!importLoading && importStep === 2 && (
                <div className="space-y-4 text-left">
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg flex items-center gap-2.5 text-emerald-800 text-sm font-bold">
                    <Check className="bg-emerald-500 text-white rounded-full p-0.5" size={16} />
                    <span>Tìm thấy 2 chỉ tiêu hợp lệ mới sẵn sàng để nạp vào hệ thống.</span>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-150 border-b border-gray-200 font-bold text-gray-600">
                          <th className="py-2.5 px-3 w-24">Mã chỉ tiêu</th>
                          <th className="py-2.5 px-3">Tên chỉ tiêu</th>
                          <th className="py-2.5 px-3 w-20 text-center">Trụ cột</th>
                          <th className="py-2.5 px-3 w-36">Bộ phận phụ trách</th>
                          <th className="py-2.5 px-3 w-16 text-center">Kiểm định</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 font-bold text-vna-blue">KPI-ENV-07</td>
                          <td className="py-2 px-3 text-gray-800 font-medium truncate max-w-[200px]" title="Tỷ lệ sử dụng chất liệu nhựa tái chế thân thiện môi trường">Tỷ lệ nhựa tái chế</td>
                          <td className="py-2 px-3 text-center"><span className="bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded">E</span></td>
                          <td className="py-2 px-3 text-gray-600 truncate max-w-[120px]">Ban Dịch vụ HK</td>
                          <td className="py-2 px-3 text-center text-emerald-600 font-bold">Hợp lệ</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-bold text-vna-blue">KPI-SOC-02</td>
                          <td className="py-2 px-3 text-gray-800 font-medium truncate max-w-[200px]" title="Tỷ lệ cán bộ quản lý nữ trong ban lãnh đạo">Tỷ lệ quản lý nữ</td>
                          <td className="py-2 px-3 text-center"><span className="bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">S</span></td>
                          <td className="py-2 px-3 text-gray-600 truncate max-w-[120px]">Ban Tổ chức NL</td>
                          <td className="py-2 px-3 text-center text-emerald-600 font-bold">Hợp lệ</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
              <Button variant="ghost" onClick={() => setIsImportOpen(false)}>Hủy bỏ</Button>
              <div className="flex gap-2">
                {importStep === 2 && <Button variant="outline" onClick={() => setImportStep(1)}>Quay lại</Button>}
                {importStep === 2 ? (
                  <Button variant="primary" onClick={handleConfirmImport}>Xác nhận nạp dữ liệu</Button>
                ) : (
                  <Button variant="primary" disabled={!importFile} onClick={() => setImportStep(2)}>Tiếp tục</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
