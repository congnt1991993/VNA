
import React, { useState, useMemo } from 'react';
import { Card, Button, StatusChip, Select, Input, TextArea, PillarBadge, ReportingPeriodTreeSelect, Toast } from '../components/UI';
import { 
  Target, BarChart2, TrendingDown, TrendingUp, Plus, FileDown, Search, 
  ChevronRight, ArrowLeft, Save, X, Edit2, Trash2, CheckCircle, 
  AlertTriangle, Filter, Layers, Calendar, Calculator, Bell, Flag, Lock, UploadCloud, ChevronDown, CornerDownRight, Eye, MoreHorizontal,
  Leaf, Users, Award, Scale, Info, ShieldCheck, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts';
import { Pillar } from '../types';

// Extended KPI Interface for Configuration with Hierarchy
interface KPIConfig {
  id: string;
  code: string;
  name: string;
  pillar: Pillar; 
  description: string;
  unit: string;
  corporateTarget: number; 
  year: string;
  status: 'Set' | 'Not Set'; 
  department?: string; 
  // Hierarchy fields
  level?: number; 
  children?: KPIConfig[];
  // System fields
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

// STANDARD INDICATORS LIBRARY (Source for Dropdown)
const STANDARD_INDICATORS_LIST = [
    { code: 'Airline E-1', name: 'Tiếng ồn', pillar: Pillar.ENVIRONMENT, unit: '%', description: 'Tỷ lệ phần trăm (%) đội tàu đáp ứng các giới hạn của Annex 16' },
    { code: 'GRI 302-1', name: 'Năng lượng tiêu thụ của tổ chức', pillar: Pillar.ENVIRONMENT, unit: 'Tấn', description: 'Tổng lượng năng lượng tiêu thụ từ nhiên liệu hóa thạch, điện, hơi nước...' },
    { code: 'GRI 302-4', name: 'Giảm tiêu thụ năng lượng', pillar: Pillar.ENVIRONMENT, unit: 'Tấn', description: 'Lượng năng lượng được tiết kiệm nhờ các sáng kiến bảo tồn và nâng cao hiệu quả.' },
    { code: 'Airline B-1', name: 'Mức độ hài lòng của khách hàng (NPS)', pillar: Pillar.SOCIAL, unit: 'NPS', description: 'Đánh giá mức độ hài lòng tổng thể của chuyến bay dựa trên khảo sát khách hàng.' },
    { code: 'Airline B-2', name: 'Tương tác khách hàng', pillar: Pillar.SOCIAL, unit: 'Hội viên', description: 'Số lượng tương tác và phản hồi của khách hàng qua các kênh chính thức.' },
    { code: 'Airline F-1', name: 'Tham gia hoạt động tình nguyện', pillar: Pillar.SOCIAL, unit: 'Nhân viên', description: 'Tổng số nhân viên tham gia các hoạt động tình nguyện và cộng đồng.' },
    { code: 'GRI 2-7', name: 'Quy mô tổ chức', pillar: Pillar.GOVERNANCE, unit: 'Người', description: 'Số lượng lao động tính đến ngày 31/12 hàng năm.' },
    { code: 'GRI 404-2', name: 'Chương trình nâng cao kỹ năng nhân viên', pillar: Pillar.GOVERNANCE, unit: 'Người', description: 'Các chương trình đào tạo nhằm nâng cao kỹ năng nghề nghiệp cho nhân viên.' }
];

// MOCK DATA - Hierarchy Example
const MOCK_KPI_DATA: KPIConfig[] = [
  { 
    id: 'K001', code: 'Airline E-1', name: 'Tiếng ồn', 
    pillar: Pillar.ENVIRONMENT, 
    description: 'Tỷ lệ phần trăm (%) đội tàu đáp ứng các giới hạn của Annex 16',
    unit: '%', corporateTarget: 100, year: '2025', status: 'Set', department: 'Ban ATCL',
    level: 0,
    children: [],
    createdBy: 'Admin', createdAt: '01/10/2024', updatedBy: 'System', updatedAt: '15/10/2024'
  },
  { 
    id: 'K002', code: 'GRI 302-1', name: 'Năng lượng tiêu thụ của tổ chức', 
    pillar: Pillar.ENVIRONMENT, 
    description: 'Tổng lượng năng lượng tiêu thụ từ nhiên liệu hóa thạch, điện, hơi nước...',
    unit: 'Tấn', corporateTarget: 1250000, year: '2025', status: 'Set', department: 'TCT', // Updated from TCT (Toàn mạng)
    level: 0,
    createdBy: 'System', createdAt: '01/10/2024', updatedBy: 'Admin', updatedAt: '20/10/2024',
    children: [
        {
            id: 'K002-1', code: 'GRI 302-1.1', name: 'Năng lượng tiêu thụ - Khối Khai thác',
            pillar: Pillar.ENVIRONMENT, description: 'Phân bổ cho khối khai thác bay',
            unit: 'Tấn', corporateTarget: 1000000, year: '2025', status: 'Set', department: 'Khối Khai thác',
            level: 1,
            children: [
                {
                    id: 'K002-1-1', code: 'GRI 302-1.1.1', name: 'Năng lượng bay - Đoàn bay 919',
                    pillar: Pillar.ENVIRONMENT, description: 'Nhiên liệu bay trực tiếp',
                    unit: 'Tấn', corporateTarget: 600000, year: '2025', status: 'Set', department: 'Đoàn bay 919',
                    level: 2
                },
                {
                    id: 'K002-1-2', code: 'GRI 302-1.1.2', name: 'Năng lượng mặt đất - Ban Quản lý vật tư',
                    pillar: Pillar.ENVIRONMENT, description: 'Điện năng và nhiên liệu xe thang',
                    unit: 'Tấn', corporateTarget: 400000, year: '2025', status: 'Set', department: 'Ban Quản lý vật tư',
                    level: 2
                }
            ]
        },
        {
            id: 'K002-2', code: 'GRI 302-1.2', name: 'Năng lượng tiêu thụ - Khối Thương mại',
            pillar: Pillar.ENVIRONMENT, description: 'Điện năng văn phòng và các chi nhánh',
            unit: 'Tấn', corporateTarget: 250000, year: '2025', status: 'Set', department: 'Khối Thương mại',
            level: 1,
            children: []
        }
    ]
  },
  { 
    id: 'K003', code: 'GRI 302-4', name: 'Giảm tiêu thụ năng lượng', 
    pillar: Pillar.ENVIRONMENT, 
    description: 'Lượng năng lượng được tiết kiệm',
    unit: 'Tấn', corporateTarget: 45000, year: '2025', status: 'Set', department: 'Trung tâm Điều hành khai thác',
    level: 0,
    createdBy: 'Admin', createdAt: '05/10/2024'
  },
  { 
    id: 'K004', code: 'Airline B-1', name: 'Mức độ hài lòng của khách hàng (NPS)', 
    pillar: Pillar.SOCIAL, 
    description: 'Đánh giá mức độ hài lòng tổng thể của chuyến bay',
    unit: 'NPS', corporateTarget: 65, year: '2025', status: 'Set', department: 'Ban Dịch vụ Hành khách',
    level: 0,
    createdBy: 'Admin', createdAt: '05/10/2024'
  },
  { 
    id: 'K006', code: 'Airline F-1', name: 'Tham gia hoạt động tình nguyện', 
    pillar: Pillar.SOCIAL, 
    description: 'Tổng số nhân viên tham gia hoạt động tình nguyện',
    unit: 'Nhân viên', corporateTarget: 4500, year: '2025', status: 'Not Set', department: 'Ban Truyền thông',
    level: 0,
    createdBy: 'Admin', createdAt: '05/10/2024'
  },
  { 
    id: 'K007', code: 'GRI 2-7', name: 'Quy mô tổ chức', 
    pillar: Pillar.GOVERNANCE, 
    description: 'Số lượng lao động 31/12 hàng năm',
    unit: 'Người', corporateTarget: 21500, year: '2025', status: 'Set', department: 'Ban Tổ chức nhân lực',
    level: 0,
    createdBy: 'Admin', createdAt: '05/10/2024'
  }
];

// Department Hierarchy Mock for Select
const VNA_DEPARTMENTS_HIERARCHY = [
  { label: 'TỔNG CÔNG TY (TCT)', value: 'TCT' },
  { label: 'KHỐI CƠ QUAN', value: 'GRP_COQUAN' },
  { label: '— Ban Kế hoạch & Phát triển', value: 'Ban KH&PT' },
  { label: '— Ban Tài chính Kế toán', value: 'Ban TCKT' },
  { label: '— Ban Tổ chức Nhân lực', value: 'Ban Tổ chức nhân lực' },
  { label: 'KHỐI THƯƠNG MẠI & DỊCH VỤ', value: 'GRP_TM' },
  { label: '— Ban Dịch vụ Hàng không', value: 'Ban Dịch vụ Hành khách' },
  { label: '— Trung tâm Bông sen vàng', value: 'Trung tâm Bông sen vàng' },
  { label: '— Ban Truyền thông', value: 'Ban Truyền thông' },
  { label: 'KHỐI KHAI THÁC & KỸ THUẬT', value: 'GRP_KT' },
  { label: '— Trung tâm Điều hành khai thác', value: 'Trung tâm Điều hành khai thác' },
  { label: '— Ban An toàn Chất lượng', value: 'Ban ATCL' },
  { label: '— Đoàn bay 919', value: 'Đoàn bay 919' },
  { label: '— Ban Quản lý vật tư', value: 'Ban Quản lý vật tư' },
];

// --- MOCK DASHBOARD DATA ---
const DASHBOARD_EMISSION_TREND = [
  { month: 'T1', actual: 4200, target: 4500 },
  { month: 'T2', actual: 3800, target: 4300 },
  { month: 'T3', actual: 4500, target: 4600 },
  { month: 'T4', actual: 4700, target: 4800 },
  { month: 'T5', actual: 4900, target: 5000 },
  { month: 'T6', actual: 5100, target: 5200 },
  { month: 'T7', actual: 5300, target: 5400 },
  { month: 'T8', actual: 5200, target: 5300 },
  { month: 'T9', actual: 4800, target: 4900 },
  { month: 'T10', actual: 4600, target: 4700 },
  { month: 'T11', actual: 0, target: 4500 },
  { month: 'T12', actual: 0, target: 4800 },
];

const DASHBOARD_PILLAR_SCORE = [
  { name: 'Môi trường (E)', score: 85, fill: '#10B981' }, // Green
  { name: 'Xã hội (S)', score: 92, fill: '#3B82F6' }, // Blue
  { name: 'Quản trị (G)', score: 98, fill: '#8B5CF6' }, // Purple
];

const DASHBOARD_ENERGY_MIX = [
  { name: 'Jet Fuel A1', value: 92, fill: '#006885' },
  { name: 'SAF', value: 3, fill: '#10B981' },
  { name: 'Điện năng', value: 4, fill: '#F59E0B' },
  { name: 'Khác', value: 1, fill: '#9CA3AF' },
];

export const KPIPage: React.FC<{ mode: 'targets' | 'performance', departmentFilter?: string }> = ({ mode, departmentFilter }) => {
  // State for Targets Mode
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [kpis, setKpis] = useState<KPIConfig[]>(MOCK_KPI_DATA);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['K002', 'K002-1'])); // Default expand hierarchy demo
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  // State for Performance Mode
  const [performancePeriods, setPerformancePeriods] = useState<string[]>(['2025']);

  // Detail & Edit State
  const [selectedKPI, setSelectedKPI] = useState<KPIConfig | null>(null);
  const [editForm, setEditForm] = useState<KPIConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Filters
  const [selectedKpiId, setSelectedKpiId] = useState(''); // Changed from text input to Select ID
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedDept, setSelectedDept] = useState('');

  // Handlers
  const handleViewDetail = (item: KPIConfig) => {
    setSelectedKPI(item);
    setEditForm(item);
    setIsEditing(false); // Default to view mode
    setViewMode('DETAIL');
  };

  const handleAddNew = () => {
    const newKPI: KPIConfig = {
        id: `NEW_${Date.now()}`,
        code: '',
        name: '',
        pillar: Pillar.ENVIRONMENT,
        description: '',
        unit: '',
        corporateTarget: 0,
        year: selectedYear,
        status: 'Not Set',
        department: '',
        level: 0,
        children: [],
        createdBy: 'Admin',
        createdAt: new Date().toLocaleDateString('vi-VN'),
        updatedBy: 'Admin',
        updatedAt: new Date().toLocaleDateString('vi-VN')
    };
    setSelectedKPI(newKPI);
    setEditForm(newKPI);
    setIsEditing(true); // Start in edit mode
    setViewMode('DETAIL');
  };

  const toggleRow = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newExpanded = new Set(expandedRows);
      if (newExpanded.has(id)) {
          newExpanded.delete(id);
      } else {
          newExpanded.add(id);
      }
      setExpandedRows(newExpanded);
  };

  const handleSave = () => {
     if (editForm) {
        // Simple mock update logic (flattening not handled fully in mock, but visual is key)
        if (selectedKPI && kpis.find(k => k.id === selectedKPI.id)) {
            setKpis(kpis.map(k => k.id === editForm.id ? editForm : k));
            setToast({ message: 'Đã cập nhật KPI thành công!', type: 'success' });
        } else {
            setKpis([editForm, ...kpis]);
            setToast({ message: 'Đã tạo KPI mới thành công!', type: 'success' });
        }
        setSelectedKPI(editForm);
        setIsEditing(false);
     }
  };

  const handleCancel = () => {
      if (selectedKPI?.id.startsWith('NEW_')) {
          setViewMode('LIST');
      } else {
          setIsEditing(false);
          setEditForm(selectedKPI);
      }
  };

  const handleDelete = () => {
    if (selectedKPI && confirm(`Bạn có chắc chắn muốn xóa KPI ${selectedKPI.code} không?`)) {
        // Logic mockup to delete from tree would be more complex, 
        // here we just filter top level or pretend to update.
        setKpis(kpis.filter(k => k.id !== selectedKPI.id));
        setViewMode('LIST');
        setToast({ message: 'Đã xóa KPI thành công!', type: 'success' });
    }
  };

  const updateEditField = (field: keyof KPIConfig, value: any) => {
      if (editForm) {
          setEditForm({ ...editForm, [field]: value });
      }
  };

  const handleIndicatorChange = (selectedCode: string) => {
      if (!editForm) return;
      const stdInd = STANDARD_INDICATORS_LIST.find(i => i.code === selectedCode);
      if (stdInd) {
          setEditForm({
              ...editForm,
              code: stdInd.code,
              name: stdInd.name,
              pillar: stdInd.pillar,
              unit: stdInd.unit,
              description: stdInd.description || editForm.description, // Auto-fill description
          });
      } else {
          updateEditField('code', selectedCode);
      }
  };

  const handleImportExcel = () => {
    setToast({ message: 'Đang mở giao diện nhập Excel...', type: 'info' });
  };

  // Filter Logic (Apply only to root nodes for tree structure usually, or filter and show path)
  // For simplicity: We filter root nodes.
  const filteredKPIs = kpis.filter(k => {
    const matchSearch = !selectedKpiId || k.code === selectedKpiId;
    const matchYear = !selectedYear || k.year === selectedYear;
    const matchDept = !selectedDept || selectedDept.includes('GRP') || k.department === selectedDept;
    const matchDeptFilter = !departmentFilter || k.department === departmentFilter;
    return matchSearch && matchYear && matchDept && matchDeptFilter;
  });

  // KPI Search Options (Only Root Nodes for simplicity in this demo)
  const kpiOptions = useMemo(() => {
    return [
        { label: 'Tất cả chỉ tiêu', value: '' },
        ...kpis.map(k => ({ label: `${k.code} / ${k.name}`, value: k.code }))
    ];
  }, [kpis]);

  const standardIndicatorOptions = useMemo(() => {
      return STANDARD_INDICATORS_LIST.map(i => ({ label: `${i.code} - ${i.name}`, value: i.code }));
  }, []);

  // --- RENDERERS ---

  // RECURSIVE ROW RENDERER
  const renderKPIRows = (items: KPIConfig[]) => {
      return items.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedRows.has(item.id);
          const level = item.level || 0;
          
          return (
              <React.Fragment key={item.id}>
                  <tr 
                    className={`hover:bg-blue-50 group transition-colors relative cursor-pointer ${level > 0 ? 'bg-gray-50/50' : ''}`} 
                    onClick={() => handleViewDetail(item)}
                  >
                    <td className="py-3 px-4 text-sm text-black/45 text-center">
                        {level === 0 ? index + 1 : ''}
                    </td>
                    <td className="py-3 px-4 text-sm">
                        <div 
                            className="flex items-center gap-2" 
                            style={{ paddingLeft: `${level * 24}px` }}
                        >
                            {/* Connector Line for visual hierarchy */}
                            {level > 0 && <CornerDownRight size={14} className="text-gray-300 mb-1" />}
                            
                            {/* Expander Button */}
                            {hasChildren ? (
                                <button 
                                    onClick={(e) => toggleRow(item.id, e)}
                                    className="p-1 hover:bg-gray-200 rounded text-black/45 transition-colors"
                                >
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                            ) : (
                                <span className="w-6 inline-block"></span> // Spacer
                            )}
                            
                            <span className={`font-bold ${level === 0 ? 'text-vna-blue' : 'text-gray-700'}`}>
                                {item.code}
                            </span>
                        </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                        <div className={`${level === 0 ? 'font-semibold text-black/85' : 'text-gray-600'}`}>
                            {item.name}
                        </div>
                    </td>
                    <td className="py-3 px-4">
                        {level === 0 && <PillarBadge pillar={item.pillar} />}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                        <div className="line-clamp-1 text-xs" title={item.description}>{item.description}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 text-center">{item.unit}</td>
                    <td className="py-3 px-4 text-right">
                        <span className={`${level === 0 ? 'font-bold text-vna-blue text-base' : 'text-gray-700 font-medium'}`}>
                            {item.corporateTarget.toLocaleString()}
                        </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-medium">
                        {item.department}
                    </td>
                    <td className="py-3 px-4 text-center">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleViewDetail(item); }}
                            className="p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-vna-blue transition-colors"
                            title="Xem chi tiết"
                        >
                        <ChevronRight size={20} />
                        </button>
                    </td>
                  </tr>
                  {/* Recursively render children if expanded */}
                  {hasChildren && isExpanded && renderKPIRows(item.children!)}
              </React.Fragment>
          );
      });
  };

  // 1. DETAIL VIEW (FORM)
  const renderDetailView = () => {
    if (!editForm) return null;
    const isNew = selectedKPI?.id.startsWith('NEW_');

    return (
        <div className={`bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border ${isEditing ? 'border-vna-blue ring-1 ring-vna-blue' : 'border-gray-100'} min-h-[calc(100vh-120px)] animate-in slide-in-from-right-4 duration-300`}>
             {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
             {/* Navigation */}
             <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center text-sm text-black/45 font-medium">
                    <span onClick={() => setViewMode('LIST')} className="cursor-pointer hover:text-vna-blue">Quản trị nghiệp vụ</span>
                    <span className="mx-2 text-gray-400">&gt;</span>
                    <span onClick={() => setViewMode('LIST')} className="cursor-pointer hover:text-vna-blue">Thiết lập KPI</span>
                    <span className="mx-2 text-gray-400">&gt;</span>
                    <span className="text-vna-blue font-bold">{isNew ? 'Thêm mới KPI' : editForm.code}</span>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 pb-6 border-b border-gray-100 gap-4">
                <div className="space-y-3 flex-1">
                    <h1 className="text-2xl font-bold text-vna-blue">
                        {isNew ? 'Thiết lập KPI' : `Chi tiết KPI: ${editForm.name}`}
                    </h1>
                    <p className="text-black/45 text-sm">Thiết lập và giao chỉ tiêu KPI cho đơn vị</p>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={handleCancel}>Hủy bỏ</Button>
                            <Button variant="primary" onClick={handleSave}><Save size={16}/> Lưu thiết lập</Button>
                        </>
                    ) : (
                        <>
                            <Button variant="primary" onClick={() => setIsEditing(true)}><Edit2 size={16}/> Chỉnh sửa</Button>
                            <Button variant="danger" onClick={handleDelete}><Trash2 size={16}/> Xóa</Button>
                            <div className="h-6 w-px bg-gray-300 mx-1"></div>
                            <Button variant="ghost" onClick={() => setViewMode('LIST')}><ArrowLeft size={16}/> Quay lại</Button>
                        </>
                    )}
                </div>
            </div>

            {/* Form Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Config */}
                <div className="space-y-6">
                    <Card title="Thông tin Chỉ tiêu">
                        <div className="space-y-4">
                            {/* KPI Selection / Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã chỉ tiêu / Tên chỉ tiêu</label>
                                {isEditing ? (
                                    <Select 
                                        options={standardIndicatorOptions}
                                        value={editForm.code}
                                        onChange={handleIndicatorChange}
                                        placeholder="Chọn chỉ tiêu chuẩn từ danh mục..."
                                    />
                                ) : <div className="font-bold text-vna-blue text-lg">{editForm.code} - {editForm.name}</div>}
                            </div>
                            
                            {/* Read-only Auto-filled Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trụ cột</label>
                                    {isEditing ? (
                                         <div className="p-2 bg-gray-100 rounded border border-gray-200 opacity-80 cursor-not-allowed min-h-[40px] flex items-center">
                                             {editForm.code ? (
                                                <PillarBadge pillar={editForm.pillar}/>
                                             ) : (
                                                <span className="text-gray-400 text-xs italic">Tự động điền...</span>
                                             )}
                                         </div>
                                    ) : <PillarBadge pillar={editForm.pillar}/>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                                    {/* Updated: Plain text view style for Unit */}
                                    <div className="font-medium text-gray-900 min-h-[38px] flex items-center">
                                        {editForm.code ? editForm.unit : <span className="text-gray-400 text-xs italic font-normal">Tự động điền...</span>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả / Phạm vi</label>
                                {/* Updated: TextArea for Edit mode, Plain text for View mode */}
                                {isEditing ? (
                                    <TextArea
                                        rows={3}
                                        value={editForm.description}
                                        onChange={(e) => updateEditField('description', e.target.value)}
                                        className="bg-white"
                                        placeholder="Tự động điền theo chỉ tiêu (có thể chỉnh sửa)..."
                                    />
                                ) : (
                                    <div className="text-sm text-gray-900">
                                        {editForm.description || <span className="text-gray-400 italic">Tự động điền theo chỉ tiêu...</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Allocation & System Info */}
                <div className="space-y-6">
                     <Card title="Thiết lập Mục tiêu">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Năm giao KPI</label>
                                    {isEditing ? (
                                        <Select 
                                            value={editForm.year}
                                            onChange={val => updateEditField('year', val)}
                                            options={[
                                                {label: '2025', value: '2025'},
                                                {label: '2026', value: '2026'},
                                            ]}
                                        />
                                    ) : <div className="font-bold text-gray-900">{editForm.year}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                    <div className={`px-3 py-2 rounded text-sm font-medium inline-block ${editForm.status === 'Set' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-black/45'}`}>
                                        {editForm.status === 'Set' ? 'Đã thiết lập' : 'Chưa thiết lập'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị được giao (Owner)</label>
                                {isEditing ? (
                                     <Select 
                                        value={editForm.department || ''}
                                        onChange={val => updateEditField('department', val)}
                                        placeholder="Chọn đơn vị..."
                                        options={VNA_DEPARTMENTS_HIERARCHY.filter(d => !d.value.startsWith('GRP'))}
                                     />
                                ) : <div className="text-gray-900 font-medium">{editForm.department}</div>}
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                <label className="block text-sm font-bold text-blue-900 mb-1">Mục tiêu (Target)</label>
                                {isEditing ? (
                                    <div className="relative">
                                        <Input 
                                            type="number" 
                                            value={editForm.corporateTarget} 
                                            onChange={e => updateEditField('corporateTarget', Number(e.target.value))}
                                            className="text-xl font-bold text-vna-blue pr-12"
                                        />
                                        <span className="absolute right-3 top-2.5 text-black/45 text-sm font-medium">{editForm.code ? editForm.unit : ''}</span>
                                    </div>
                                ) : (
                                    <div className="text-3xl font-bold text-vna-blue">
                                        {editForm.corporateTarget.toLocaleString()} <span className="text-lg font-normal text-black/45">{editForm.unit}</span>
                                    </div>
                                )}
                                <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                                    <Calculator size={12}/> Giá trị này sẽ được dùng để theo dõi hiệu suất (Performance).
                                </p>
                            </div>
                        </div>
                     </Card>

                     {/* System Info Block */}
                     <Card>
                        <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                             <Lock size={14} className="text-gray-400"/>
                             <h3 className="text-xs font-bold text-black/45 uppercase tracking-wide">Thông tin hệ thống</h3>
                        </div>
                        <div className="space-y-2 text-xs text-gray-600">
                             <div className="flex justify-between">
                                 <span>Người tạo:</span> 
                                 <span className="font-medium text-gray-900">{editForm.createdBy || '-'}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span>Ngày tạo:</span> 
                                 <span className="font-medium text-gray-900">{editForm.createdAt || '-'}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span>Người cập nhật:</span> 
                                 <span className="font-medium text-gray-900">{editForm.updatedBy || '-'}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span>Ngày cập nhật:</span> 
                                 <span className="font-medium text-gray-900">{editForm.updatedAt || '-'}</span>
                             </div>
                        </div>
                     </Card>
                </div>
            </div>
        </div>
    );
  };

  // 2. LIST VIEW (TARGETS)
  const renderTargetListView = () => (
    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-300">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h2 className="text-xl font-bold text-vna-blue">Thiết lập Mục tiêu KPI</h2>
                <p className="text-sm text-black/45 mt-1">Quản lý và phân bổ chỉ tiêu cho toàn Tổng công ty</p>
            </div>
             
             {/* Action Group: Import, Add New, Year Select */}
             <div className="flex items-center gap-3">
                 <Button onClick={handleImportExcel} variant="secondary">
                    <UploadCloud size={16} /> Nhập Excel
                 </Button>
                 <Button onClick={handleAddNew} className="shadow-md">
                    <Plus size={18} /> Thêm mới
                 </Button>
                 <div className="w-px h-8 bg-gray-300 mx-1"></div>
                 <div className="w-40">
                    <Select 
                        value={selectedYear}
                        onChange={setSelectedYear}
                        options={[
                            {label: 'Năm 2025', value: '2025'},
                            {label: 'Năm 2026', value: '2026'}
                        ]}
                        className="font-bold border-vna-blue text-vna-blue ring-1 ring-vna-blue bg-blue-50/50"
                    />
                </div>
            </div>
        </div>

        {/* Removed Stats Cards as requested */}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 bg-white p-4 rounded-lg border border-gray-200 items-end">
           {/* Search Dropdown - Changed from Input */}
           <div className="md:col-span-7">
              <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">Tìm kiếm chỉ tiêu</label>
              <Select 
                 value={selectedKpiId}
                 onChange={setSelectedKpiId}
                 placeholder="Tìm theo Mã / Tên chỉ tiêu..."
                 options={kpiOptions}
              />
           </div>
           
           {/* Department Filter (Hierarchy) - Adjusted Col Span */}
           <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">Cơ quan / Đơn vị</label>
              <Select 
                 value={selectedDept}
                 onChange={setSelectedDept}
                 placeholder="Tất cả đơn vị"
                 options={[{label: 'Tất cả đơn vị', value: ''}, ...VNA_DEPARTMENTS_HIERARCHY]}
              />
           </div>
        </div>

        {/* Table */}
        <div className="overflow-visible rounded-lg border border-gray-200 flex-1 min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-vna-blue text-white">
                <th className="py-3 px-4 font-semibold text-sm w-12 text-center rounded-tl-lg">STT</th>
                <th className="py-3 px-4 font-semibold text-sm w-48">Mã chỉ tiêu</th>
                <th className="py-3 px-4 font-semibold text-sm w-1/4">Tên chỉ tiêu</th>
                <th className="py-3 px-4 font-semibold text-sm">Trụ cột</th>
                <th className="py-3 px-4 font-semibold text-sm w-1/4">Mô tả chỉ tiêu</th>
                <th className="py-3 px-4 font-semibold text-sm text-center">Đơn vị tính</th>
                <th className="py-3 px-4 font-semibold text-sm text-right">Mục tiêu</th>
                <th className="py-3 px-4 font-semibold text-sm">Đơn vị phụ trách</th>
                <th className="py-3 px-4 font-semibold text-sm w-12 text-center rounded-tr-lg"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {/* Render Tree Rows */}
               {filteredKPIs.length > 0 ? (
                   renderKPIRows(filteredKPIs)
               ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    Không tìm thấy KPI nào phù hợp.
                  </td>
                </tr>
               )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <div className="text-sm text-black/45 mb-2 sm:mb-0">
            Hiển thị <span className="font-medium text-gray-900">1 - {filteredKPIs.length}</span> của <span className="font-medium text-gray-900">{filteredKPIs.length}</span> kết quả
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-sm text-gray-600 disabled:opacity-50">Trước</button>
            <button className="px-3 py-1 bg-vna-blue text-white rounded text-sm">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-sm text-gray-600">Sau</button>
          </div>
        </div>
    </div>
  );

  // 2. PERFORMANCE VIEW (Read-Only Dashboard)
  const renderPerformanceView = () => {
      // Mock data representing exact VNA KPI targets
      const EXECUTIVE_PILLAR_PERFORMANCE = [
         { name: 'Môi trường (E)', score: 88, fill: '#10B981', desc: 'SAF, CO2 Intensity, Fuel saving' },
         { name: 'Xã hội (S)', score: 92, fill: '#006885', desc: 'IOSA Safety, NPS Satisfaction, Training' },
         { name: 'Quản trị (G)', score: 97, fill: '#DBA410', desc: 'Board Independence, PL02 compliance' }
      ];

      return (
        <div className="space-y-6">
          {/* Header Block */}
          <div className="flex justify-between items-center bg-white p-4 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-200">
             <div className="flex items-center gap-4">
                <div className="p-2 bg-vna-blue/10 text-vna-blue rounded-lg">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-vna-blue">Tổng quan điều hành ESG - Vietnam Airlines</h2>
                    <p className="text-xs text-black/45 mt-0.5">Màn hình giám sát chỉ số ESG cốt lõi theo 3 Trụ cột, chỉ tiêu ASRH và Nghị quyết Phụ lục 02</p>
                </div>
             </div>
             {/* Filter Group: Period + Actions */}
             <div className="flex items-end gap-2">
                <div className="w-72">
                    <ReportingPeriodTreeSelect 
                        selected={performancePeriods}
                        onChange={setPerformancePeriods}
                    />
                </div>
                <Button className="h-[38px] w-[38px] p-0 flex items-center justify-center bg-vna-blue hover:bg-vna-blue/90" title="Tìm kiếm" onClick={() => setToast({ message: 'Đang đồng bộ dữ liệu...', type: 'info' })}>
                    <Search size={18}/>
                </Button>
                <Button 
                    variant="outline" 
                    className="h-[38px] w-[38px] p-0 flex items-center justify-center text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50" 
                    onClick={() => setPerformancePeriods([])}
                    title="Xóa lọc"
                >
                    <X size={18}/>
                </Button>
             </div>
          </div>

          {/* 4 Premium Bento Cards (Top Row) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
             <div className="bg-[#006885]/5 border border-[#006885]/10 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 hover:shadow-md transition-all duration-200 relative group">
                 <div className="flex justify-between items-start">
                     <div className="p-2.5 bg-[#006885]/10 text-[#006885] rounded-lg">
                         <Target size={20} />
                     </div>
                     <div className="relative cursor-help">
                         <Info size={16} className="text-gray-400 hover:text-vna-blue" />
                         <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal">
                             <div className="absolute bottom-0 right-3 translate-y-full border-4 border-transparent border-t-[#0d1525]/95"></div>
                             <p className="font-bold text-[#DBA410] mb-1">Điểm hiệu suất ESG tổng hợp</p>
                             Điểm hiệu suất tổng hợp của toàn Vietnam Airlines, tính theo trọng số: 40% Trụ cột Môi trường (E), 30% Trụ cột Xã hội (S), 30% Trụ cột Quản trị (G).
                         </div>
                     </div>
                 </div>
                 <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-4">Điểm hiệu suất ESG tổng hợp</p>
                 <h3 className="text-2xl font-black text-black/85 mt-1">92.4 <span className="text-xs font-bold text-black/45">/ 100</span></h3>
                 <div className="text-[10px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                     <TrendingUp size={12} /> +2.8% so với cùng kỳ năm trước
                 </div>
             </div>

             <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 hover:shadow-md transition-all duration-200 relative group">
                 <div className="flex justify-between items-start">
                     <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                         <Award size={20} />
                     </div>
                     <div className="relative cursor-help">
                         <Info size={16} className="text-gray-400 hover:text-vna-blue" />
                         <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal">
                             <div className="absolute bottom-0 right-3 translate-y-full border-4 border-transparent border-t-[#0d1525]/95"></div>
                             <p className="font-bold text-[#DBA410] mb-1">Chỉ tiêu ASRH & An toàn Khai thác</p>
                             Tổng hợp các chỉ số An toàn, An ninh, Sức khỏe và Môi trường. Đội bay duy trì 100% tuân thủ tiêu chuẩn IOSA của Hiệp hội Vận tải Hàng không Quốc tế (IATA).
                         </div>
                     </div>
                 </div>
                 <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-4">Chỉ tiêu An toàn & ASRH</p>
                 <h3 className="text-2xl font-black text-black/85 mt-1">100% Đạt</h3>
                 <div className="text-[10px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                     <CheckCircle size={12} /> Chứng nhận IOSA hiệu lực đến 2026
                 </div>
             </div>

             <div className="bg-[#DBA410]/5 border border-[#DBA410]/15 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 hover:shadow-md transition-all duration-200 relative group">
                 <div className="flex justify-between items-start">
                     <div className="p-2.5 bg-[#DBA410]/10 text-[#DBA410] rounded-lg">
                         <FileText size={20} />
                     </div>
                     <div className="relative cursor-help">
                         <Info size={16} className="text-gray-400 hover:text-vna-blue" />
                         <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal">
                             <div className="absolute bottom-0 right-3 translate-y-full border-4 border-transparent border-t-[#0d1525]/95"></div>
                             <p className="font-bold text-[#DBA410] mb-1">Tuân thủ Nghị quyết Phụ lục 02</p>
                             Đo lường mức độ tuân thủ 47 chỉ tiêu quản trị doanh nghiệp bắt buộc của Vietnam Airlines theo yêu cầu kiểm soát vốn của Nhà nước.
                         </div>
                     </div>
                 </div>
                 <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-4">Tuân thủ Nghị quyết Phụ lục 02</p>
                 <h3 className="text-2xl font-black text-black/85 mt-1">91.5%</h3>
                 <div className="text-[10px] text-[#DBA410] font-bold mt-2 flex items-center gap-1">
                     <CheckCircle size={12} className="text-[#DBA410]" /> Đã hoàn thành 43/47 chỉ tiêu
                 </div>
             </div>

             <div className="bg-purple-50 border border-purple-100 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 hover:shadow-md transition-all duration-200 relative group">
                 <div className="flex justify-between items-start">
                     <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg">
                         <Leaf size={20} />
                     </div>
                     <div className="relative cursor-help">
                         <Info size={16} className="text-gray-400 hover:text-vna-blue" />
                         <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal">
                             <div className="absolute bottom-0 right-3 translate-y-full border-4 border-transparent border-t-[#0d1525]/95"></div>
                             <p className="font-bold text-[#DBA410] mb-1">Cắt giảm phát thải CO2 tích lũy</p>
                             Tổng sản lượng phát thải CO2 của đội tàu bay được giảm thiểu trong kỳ nhờ cấn trừ tín chỉ carbon và các sáng kiến tiết kiệm nhiên liệu bay.
                         </div>
                     </div>
                 </div>
                 <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-4">Tổng CO2 Giảm thiểu tích lũy</p>
                 <h3 className="text-2xl font-black text-purple-800 mt-1">1.25M <span className="text-xs font-bold text-gray-400">tCO2e</span></h3>
                 <div className="text-[10px] text-purple-700 font-semibold mt-2 flex items-center gap-1">
                     <CheckCircle size={12} /> Đạt 65% hạn mức CORSIA năm 2025
                 </div>
             </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Chart 1: CO2 Emissions Trend (Combination Chart) */}
             <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-[400px]">
                <div className="flex justify-between items-center mb-6">
                   <div>
                      <h3 className="font-bold text-black/85 text-lg">Xu hướng Phát thải CO2 Lũy kế</h3>
                      <p className="text-sm text-black/45">So sánh lượng phát thải thực tế vs Định mức kế hoạch (Tấn)</p>
                   </div>
                   <div className="p-2 bg-gray-50 rounded-full cursor-pointer hover:bg-gray-100"><MoreHorizontal size={20} className="text-gray-400"/></div>
                </div>
                <div className="flex-1 w-full min-h-0">
                   <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={DASHBOARD_EMISSION_TREND} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                         <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10}/>
                         <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}}/>
                         <Tooltip 
                            contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                            itemStyle={{fontSize: '12px', fontWeight: 600}}
                          />
                         <Legend wrapperStyle={{paddingTop: '20px'}}/>
                         <Bar dataKey="actual" name="Thực tế (Tấn)" fill="#006885" barSize={20} radius={[4, 4, 0, 0]} />
                         <Line type="monotone" dataKey="target" name="Kế hoạch (Tấn)" stroke="#DBA410" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}}/>
                      </ComposedChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* Chart 2: Pillar Performance Score */}
             <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-[400px]">
                <div className="flex justify-between items-center mb-6">
                   <div>
                      <h3 className="font-bold text-black/85 text-lg">Hiệu suất ESG theo Trụ cột cốt lõi</h3>
                      <p className="text-sm text-black/45">Điểm đánh giá tuân thủ & hoàn thành mục tiêu 3 trụ cột ESG</p>
                   </div>
                   <div className="p-2 bg-gray-50 rounded-full cursor-pointer hover:bg-gray-100"><MoreHorizontal size={20} className="text-gray-400"/></div>
                </div>
                <div className="flex-1 w-full min-h-0">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={EXECUTIVE_PILLAR_PERFORMANCE} layout="vertical" margin={{top: 10, right: 30, left: 10, bottom: 0}}>
                         <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB"/>
                         <XAxis type="number" domain={[0, 100]} hide/>
                         <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{fill: '#374151', fontWeight: 600, fontSize: 13}}/>
                         <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                         <Bar dataKey="score" name="Điểm hiệu suất" barSize={30} radius={[0, 4, 4, 0]}>
                            {EXECUTIVE_PILLAR_PERFORMANCE.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* Executive ASRH & Phụ lục 02 detail row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Bento: ASRH & Safety details */}
              <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-2">
                      <ShieldCheck size={20} className="text-[#006885]" />
                      <h3 className="font-bold text-black/85 text-base">Chỉ tiêu An toàn, Sức khỏe & Môi trường (ASRH)</h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                          <span className="text-[10px] text-emerald-800 uppercase font-bold block">IOSA Audit</span>
                          <span className="text-xl font-black text-emerald-700 block mt-1">100% Đạt</span>
                          <p className="text-[8.5px] text-gray-400 mt-1">Hiệu lực an toàn bay</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                          <span className="text-[10px] text-blue-800 uppercase font-bold block">NPS Satisfy</span>
                          <span className="text-xl font-black text-blue-700 block mt-1">82 / 100</span>
                          <p className="text-[8.5px] text-gray-400 mt-1">Khách hàng hài lòng</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg">
                          <span className="text-[10px] text-purple-800 uppercase font-bold block">Ethics Train</span>
                          <span className="text-xl font-black text-purple-700 block mt-1">98.7%</span>
                          <p className="text-[8.5px] text-gray-400 mt-1">Đào tạo liêm chính</p>
                      </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-2.5 text-xs text-gray-600 leading-relaxed">
                      <div className="flex items-center gap-1 text-[#006885] font-bold">
                          <Info size={14} />
                          <span>Chi tiết về tiêu chí ASRH trong Hàng không</span>
                      </div>
                      <p>
                          Chỉ số **ASRH (Safety, Security, Health & Environment)** tại Vietnam Airlines được quản lý trực tiếp bởi Ban An toàn Chất lượng. Đơn vị thực hiện các đợt giám định và tự động phát hiện rủi ro an toàn bay. NPS được tổng hợp từ Qualtrics để theo dõi trực tiếp sức khỏe thương hiệu.
                      </p>
                  </div>
              </div>

              {/* Right Bento: PL02 Resolution details */}
              <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col justify-between">
                  <div>
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                          <Scale size={20} className="text-[#006885]" />
                          <h3 className="font-bold text-black/85 text-base">Trạng thái Tuân thủ Nghị quyết Phụ lục 02</h3>
                      </div>
                      
                      <div className="space-y-4">
                          <div>
                              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5">
                                  <span>Tiến độ tổng thể nghị quyết HĐQT</span>
                                  <span className="text-[#006885]">43 / 47 Chỉ tiêu hoàn thành (91.5%)</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-3 border border-gray-200">
                                  <div className="bg-gradient-to-r from-[#006885] to-[#10B981] h-3 rounded-full animate-pulse" style={{width: '91.5%'}}></div>
                              </div>
                          </div>

                          <div className="bg-gray-50/70 border border-gray-200/60 p-4 rounded-lg text-xs text-gray-600 leading-relaxed space-y-2">
                              <div className="flex items-center gap-1.5 font-bold text-vna-blue">
                                  <ShieldCheck size={14} />
                                  <span>Lộ trình hoàn thành các chỉ tiêu Quản trị G</span>
                              </div>
                              <p>
                                  HĐQT đang nỗ lực hoàn thiện 4 tiêu chí còn lại thuộc Phụ lục 02 trong quý 3/2026, bao gồm số hóa toàn bộ hệ thống kiểm toán dữ liệu ESG và tích hợp báo cáo tự động bằng công nghệ AI. Điều này sẽ giúp VNA đạt điểm tuyệt đối về quản trị minh bạch trước cổ đông nhà nước.
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* QUICK VIEW LIST OF ALL INDICATORS */}
          <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="font-bold text-black/85 text-lg">Danh sách xem nhanh các chỉ tiêu</h3>
                   <p className="text-sm text-black/45">Tiến độ thực hiện so với kế hoạch theo từng trụ cột</p>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                         <th className="py-3 px-4 font-semibold text-sm">Trụ cột</th>
                         <th className="py-3 px-4 font-semibold text-sm">Chỉ tiêu</th>
                         <th className="py-3 px-4 font-semibold text-sm text-right">Số kế hoạch</th>
                         <th className="py-3 px-4 font-semibold text-sm text-right">Số thực hiện</th>
                         <th className="py-3 px-4 font-semibold text-sm text-center">Trạng thái</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {[
                         { pillar: 'Môi trường (E)', name: 'Tiếng ồn (% đội tàu đáp ứng Annex 16)', target: '100%', actual: '100%', status: 'Đạt' },
                         { pillar: 'Môi trường (E)', name: 'Năng lượng tiêu thụ (Tấn)', target: '1,250,000', actual: '1,100,000', status: 'Đạt' },
                         { pillar: 'Môi trường (E)', name: 'Giảm tiêu thụ năng lượng (Tấn)', target: '50,000', actual: '45,000', status: 'Không đạt' },
                         { pillar: 'Xã hội (S)', name: 'Mức độ hài lòng của khách hàng (NPS)', target: '45', actual: '48', status: 'Đạt' },
                         { pillar: 'Xã hội (S)', name: 'Tham gia hoạt động tình nguyện (Nhân viên)', target: '5,000', actual: '5,200', status: 'Đạt' },
                         { pillar: 'Quản trị (G)', name: 'Chương trình nâng cao kỹ năng (Người)', target: '10,000', actual: '9,500', status: 'Không đạt' },
                      ].map((item, idx) => (
                         <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm font-medium text-gray-700">{item.pillar}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{item.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-900 font-semibold text-right">{item.target}</td>
                            <td className="py-3 px-4 text-sm text-gray-900 font-semibold text-right">{item.actual}</td>
                            <td className="py-3 px-4 text-sm text-center">
                               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'Đạt' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {item.status}
                               </span>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      );
  };

  // Main Return based on mode
  if (mode === 'performance') {
      return renderPerformanceView();
  }

  // Toggle based on viewMode
  if (viewMode === 'DETAIL') {
      return renderDetailView();
  }

  return renderTargetListView();
};
