import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button, Select, PillarBadge, Input } from '../components/UI';
import {
  Plus, Search, Upload, Download, FileSpreadsheet, ArrowLeft,
  Settings, BarChart2, Save, X, Info, User, Check, AlertCircle, FileText, Trash2
} from 'lucide-react';
import { Pillar, Status, EsgIndicator } from '../types';
import { IndicatorChart } from '../components/IndicatorChart';
import { FORM_DEFINITIONS } from '../data/accessControl';
import MOCK_INDICATORS_JSON from '../data/indicators_main_list.json';

interface Indicator extends Partial<EsgIndicator> {
  id: string;
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
  reportText?: any;
  formula?: string;
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

const MOCK_INDICATORS: Indicator[] = MOCK_INDICATORS_JSON as Indicator[];

export const IndicatorsPage: React.FC<{ departmentFilter?: string }> = ({ departmentFilter }) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL' | 'DASHBOARD'>('LIST');
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [formIndicator, setFormIndicator] = useState<Indicator | null>(null);
  
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

  const appliedFormulas = useMemo(() => {
    if (!formIndicator) return [];
    return formulas.filter(f => f.appliedTo && f.appliedTo.includes(formIndicator.code));
  }, [formulas, formIndicator]);

  // Advanced filters state
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
        } catch (e) {}
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
    return indicators.filter(item => {
      // 1. Department filter (from parent component props)
      if (departmentFilter) {
        const formDef = FORM_DEFINITIONS.find(fd => fd.id === item.sourceForm);
        const matchDept = item.department === departmentFilter ||
          (formDef && formDef.department === departmentFilter);
        if (!matchDept) return false;
      }

      // 2. Search keyword
      if (searchText) {
        const query = searchText.toLowerCase();
        const codeMatch = item.code?.toLowerCase().includes(query);
        const nameMatch = item.name?.toLowerCase().includes(query);
        if (!codeMatch && !nameMatch) return false;
      }

      // 3. Pillar
      if (selectedPillar && item.pillar !== selectedPillar) return false;

      // 4. Topic
      if (selectedTopic && item.topic !== selectedTopic) return false;

      // 5. Department/Owner
      if (selectedDept && item.department !== selectedDept) return false;

      // 6. Program Tag
      if (selectedProgram) {
        if (!item.programs || !item.programs.includes(selectedProgram)) return false;
      }

      // 7. Status
      if (selectedStatus) {
        const filterActive = selectedStatus === 'active';
        if (item.isActive !== filterActive) return false;
      }

      return true;
    });
  }, [indicators, searchText, selectedPillar, selectedTopic, selectedDept, selectedProgram, selectedStatus, departmentFilter]);

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
      introduction: ''
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

          <div className="flex-1 w-full bg-white rounded-lg overflow-hidden min-h-[750px] flex flex-col">
            <iframe
              src={formIndicator.metabaseLink}
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
                <h2 className="text-lg font-bold text-vna-blue">{formIndicator.name}</h2>
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
            <h2 className="text-xl font-bold text-vna-blue">Dashboard: {formIndicator.code} - {formIndicator.name}</h2>
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

        <div className="bg-white p-5 rounded-lg border border-gray-200 flex-1">
          <h3 className="text-sm font-bold text-vna-blue mb-4 text-left">
            Biểu đồ xu hướng
          </h3>
          <div className="h-[350px] w-full">
            <IndicatorChart indicatorCode={formIndicator.code} chartName={formIndicator.name} chartType="Line" />
          </div>
        </div>
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
                <p className="text-xs text-black/45">Thiết lập chung và Cấu hình chỉ tiêu ESG</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleBack}>Hủy bỏ</Button>
              <Button variant="primary" onClick={handleSave}><Save size={16} className="mr-2" />Lưu thông tin</Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-12 text-left space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* THÔNG TIN CHUNG */}
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">Thông tin chung</h3>
              <Input label="Mã chỉ tiêu" value={formIndicator.code} onChange={(e) => setFormIndicator({ ...formIndicator, code: e.target.value })} placeholder="VD: GRI 305-1, Airline E-1" />
              <Input label="Tên chỉ tiêu (VI)" value={formIndicator.name} onChange={(e) => setFormIndicator({ ...formIndicator, name: e.target.value })} placeholder="VD: Phát thải Scope 1" />

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
                <Input label="Đơn vị tính" value={formIndicator.unit || ''} onChange={(e) => setFormIndicator({ ...formIndicator, unit: e.target.value })} placeholder="VD: %, Tấn, Vụ" />
                <Select
                  label="Trạng thái chỉ tiêu"
                  value={formIndicator.isActive ? 'active' : 'inactive'}
                  onChange={(val) => setFormIndicator({ ...formIndicator, isActive: val === 'active' })}
                  options={[
                    { label: 'Hoạt động', value: 'active' },
                    { label: 'Ngừng hoạt động', value: 'inactive' }
                  ]}
                />
              </div>
            </div>

            {/* TRÁCH NHIỆM & NHÃN CHƯƠNG TRÌNH */}
            <div className="flex flex-col gap-6">
              <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200 space-y-4 shadow-2xs">
                <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">Phân vai & Trách nhiệm</h3>

                {/* Chọn Tổ ban phụ trách */}
                <Select
                  label="Tổ ban phụ trách chỉ tiêu"
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
                  <div className="flex gap-6 p-3 bg-white border border-gray-300 rounded-lg">
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
              </div>

              {/* BLOCK GÁN BIỂU MẪU DỮ LIỆU ĐẦU VÀO (COMBOBOX MULTIPLE SELECT KÈM SEARCH) */}
              <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200 space-y-4 shadow-2xs text-left relative">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <h3 className="text-sm font-bold text-vna-blue uppercase tracking-wider">Liên kết gán Biểu mẫu dữ liệu đầu vào</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 uppercase">
                    {(formIndicator.assignedForms || []).length} được gán
                  </span>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Chọn biểu mẫu thu thập số liệu</label>
                  
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
                                className={`p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors ${
                                  isChecked ? 'bg-blue-50/20 font-bold' : ''
                                }`}
                              >
                                <div className="text-left flex-1 pr-4">
                                  <div className="text-gray-800 font-semibold">{form.name}</div>
                                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">{form.id} • {form.fields?.length || 0} trường động</div>
                                </div>
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  isChecked ? 'border-vna-blue bg-vna-blue text-white' : 'border-gray-300'
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
              </div>

              {/* CÔNG THỨC (chỉ tồn tại với những chỉ tiêu có dashboard báo cáo) */}
              {!!formIndicator.metabaseLink && (
                <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200 space-y-4 shadow-2xs text-left">
                  <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">Công thức tính toán</h3>
                  {appliedFormulas.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">Chưa cấu hình công thức nào trong hệ thống cho chỉ tiêu này.</p>
                  ) : (
                    <div className="space-y-3">
                      {appliedFormulas.map((f: any) => (
                        <div key={f.id} className="p-3 bg-white border border-gray-200 rounded-lg space-y-2 shadow-3xs">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                            <span className="text-xs font-bold text-vna-blue">{f.code} (v{f.version})</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">{f.type === 'Calculation' ? 'Tính toán' : 'Mô phỏng'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 block mb-0.5">Tên công thức</span>
                            <span className="text-xs font-semibold text-gray-800">{f.name}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 block mb-0.5">Biểu thức tính toán</span>
                            <div className="p-2 bg-slate-50 border border-gray-250 rounded font-mono text-xs text-gray-700 select-all">
                              {f.expression}
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
            <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider">Mô tả & Định nghĩa chi tiết</h3>
            <textarea
              value={formIndicator.introduction || ''}
              onChange={(e) => setFormIndicator({ ...formIndicator, introduction: e.target.value })}
              className="w-full min-h-[120px] border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-vna-blue/20 focus:border-vna-blue"
              placeholder="Nhập giới thiệu, phương pháp tính toán của chỉ tiêu ở đây..."
            />
          </div>


        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <div className="text-left">
          <h2 className="text-xl font-bold text-vna-blue">Danh mục Chỉ tiêu ESG</h2>
          <p className="text-sm text-black/45 mt-1">Danh sách chỉ tiêu phân bổ tại các form nhập liệu của tổ ban</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {/* <Button variant="outline" onClick={() => setIsImportOpen(true)} className="cursor-pointer font-bold">
            <Upload size={16} className="mr-1.5" /> Nhập Excel
          </Button> */}
          <Button variant="outline" onClick={handleExportExcel} className="cursor-pointer font-bold">
            <Download size={16} className="mr-1.5" /> Xuất Excel
          </Button>
          <Button onClick={handleAddNew} className="shadow-md cursor-pointer font-bold">
            <Plus size={16} className="mr-1.5" /> Thêm chỉ tiêu
          </Button>
        </div>
      </div>

      {/* Advanced Filters Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 items-end text-left shadow-xs">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Từ khóa</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm kiếm mã hoặc tên..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue text-sm bg-white"
            />
          </div>
        </div>

        <div>
          <Select
            label="Trụ cột"
            options={[
              { label: 'Tất cả', value: '' },
              { label: 'Môi trường (E)', value: Pillar.ENVIRONMENT },
              { label: 'Xã hội (S)', value: Pillar.SOCIAL },
              { label: 'Quản trị (G)', value: Pillar.GOVERNANCE }
            ]}
            value={selectedPillar}
            onChange={setSelectedPillar}
          />
        </div>

        <div>
          <Select
            label="Chủ đề (Topic)"
            options={[{ label: 'Tất cả', value: '' }, ...topicOptions]}
            value={selectedTopic}
            onChange={setSelectedTopic}
          />
        </div>

        <div>
          <Select
            label="Đơn vị phụ trách"
            options={[{ label: 'Tất cả', value: '' }, ...deptOptions]}
            value={selectedDept}
            onChange={setSelectedDept}
          />
        </div>

        <div>
          <Select
            label="Trạng thái"
            options={[
              { label: 'Tất cả', value: '' },
              { label: 'Hiệu lực', value: 'active' },
              { label: 'Ngưng áp dụng', value: 'inactive' }
            ]}
            value={selectedStatus}
            onChange={setSelectedStatus}
          />
        </div>
      </div>

      {/* Indicators List Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 flex-1 min-h-[400px]">
        <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-gray-700 w-12 text-center whitespace-nowrap">STT</th>
              <th className="py-3 px-4 font-semibold text-gray-700 w-28 whitespace-nowrap">Mã chỉ tiêu</th>
              <th className="py-3 px-4 font-semibold text-gray-700 w-72 whitespace-nowrap">Tên chỉ tiêu</th>
              <th className="py-3 px-4 font-semibold text-gray-700 w-28 text-center whitespace-nowrap">Trụ cột</th>
              <th className="py-3 px-4 font-semibold text-gray-700 w-36 whitespace-nowrap">Chủ đề</th>
              <th className="py-3 px-4 font-semibold text-gray-700 w-20 text-center whitespace-nowrap">Đơn vị đo</th>
              <th className="py-3 px-4 font-semibold text-gray-700 w-40 whitespace-nowrap">Đơn vị phụ trách</th>
              <th className="py-3 px-4 font-semibold text-gray-700 w-28 text-center whitespace-nowrap">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-gray-700 w-24 text-center whitespace-nowrap">Thao tác</th>
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
                  <div className="font-semibold text-gray-800 truncate max-w-[280px] text-left" title={item.name}>{item.name}</div>
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
