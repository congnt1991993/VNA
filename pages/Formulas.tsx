
import React, { useState } from 'react';
import { Card, Button, Modal, Input, Select, SelectOption, TextArea, StatusChip, Toast } from '../components/UI';
import { Play, Save, Code, Variable, Plus, Search, Edit2, Trash2, ChevronRight, Calculator, Activity, CheckCircle, FileText, Database, ArrowLeft, X, History, Layers, Lock, Sliders } from 'lucide-react';
import { Formula, SimulationParameter } from '../types';

// Mock Data for Indicator Dropdown
const INDICATOR_OPTIONS: SelectOption[] = [
  { label: 'Airline E-1 / Tiếng ồn', value: 'Airline E-1' },
  { label: 'GRI 302-1 / Năng lượng tiêu thụ của tổ chức', value: 'GRI 302-1' },
  { label: 'GRI 302-4 / Giảm tiêu thụ năng lượng', value: 'GRI 302-4' },
  { label: 'Airline B-1 / Mức độ hài lòng của khách hàng', value: 'Airline B-1' },
];

const MOCK_FORMULAS: Formula[] = [
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

// Helper Component for Type Badge
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const isCalc = type === 'Calculation';
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border ${isCalc ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
      {isCalc ? <Calculator size={12} /> : <Activity size={12} />}
      {isCalc ? 'Tính toán' : 'Mô phỏng'}
    </div>
  );
};

export const FormulasPage: React.FC = () => {
  // Global State
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [formulas, setFormulas] = useState<Formula[]>(MOCK_FORMULAS);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  // Detail & Edit State
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Formula | null>(null);
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'FORMULA' | 'USAGE'>('GENERAL');

  // Filter State
  const [searchText, setSearchText] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Handlers
  const handleViewDetail = (formula: Formula) => {
    setSelectedFormula(formula);
    setEditForm(null);
    setIsEditing(false);
    setViewMode('DETAIL');
    setActiveTab('GENERAL');
  };

  const handleCreateNew = () => {
    const newFormula: Formula = {
      id: `F${Date.now()}`,
      code: '',
      name: '',
      version: '1.0',
      type: 'Calculation',
      status: 'Draft',
      expression: '',
      appliedTo: [],
      createdBy: 'Admin',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      updatedBy: 'Admin',
      updatedAt: new Date().toLocaleDateString('vi-VN'),
      description: '',
      simulationParams: []
    };
    setSelectedFormula(newFormula);
    setEditForm(newFormula);
    setIsEditing(true);
    setViewMode('DETAIL');
    setActiveTab('GENERAL');
  };

  const handleEditClick = () => {
    if (selectedFormula) {
      setEditForm({ ...selectedFormula });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (editForm) {
      if (selectedFormula && formulas.find(f => f.id === selectedFormula.id)) {
        // Update existing
        setFormulas(formulas.map(f => f.id === editForm.id ? editForm : f));
        setToast({ message: 'Đã cập nhật công thức thành công!', type: 'success' });
      } else {
        // Add new
        setFormulas([editForm, ...formulas]);
        setToast({ message: 'Đã tạo công thức mới thành công!', type: 'success' });
      }
      setSelectedFormula(editForm);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    if (!selectedFormula?.code && !selectedFormula?.name) {
       // Cancel creating new
       setViewMode('LIST');
    } else {
       setIsEditing(false);
       setEditForm(null);
    }
  };

  const handleDelete = () => {
    if (selectedFormula && confirm('Bạn có chắc chắn muốn xóa công thức này?')) {
      setFormulas(formulas.filter(f => f.id !== selectedFormula.id));
      setViewMode('LIST');
      setToast({ message: 'Đã xóa công thức thành công!', type: 'success' });
    }
  };

  const handleBackToList = () => {
    setViewMode('LIST');
    setSelectedFormula(null);
    setIsEditing(false);
  };

  // Helper to update edit form state
  const updateEditField = (field: keyof Formula, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  // Helper for Simulation Params
  const handleAddParam = () => {
    if (editForm) {
        const newParams = [...(editForm.simulationParams || []), { code: '', name: '', defaultValue: 0, unit: '' }];
        updateEditField('simulationParams', newParams);
    }
  };

  const handleRemoveParam = (index: number) => {
    if (editForm && editForm.simulationParams) {
        const newParams = editForm.simulationParams.filter((_, i) => i !== index);
        updateEditField('simulationParams', newParams);
    }
  };

  const handleParamChange = (index: number, field: keyof SimulationParameter, value: any) => {
    if (editForm && editForm.simulationParams) {
        const newParams = [...editForm.simulationParams];
        newParams[index] = { ...newParams[index], [field]: value };
        updateEditField('simulationParams', newParams);
    }
  };

  // Filter Logic
  const filteredFormulas = formulas.filter(f => {
    const matchSearch = f.code.toLowerCase().includes(searchText.toLowerCase()) || f.name.toLowerCase().includes(searchText.toLowerCase());
    const matchIndicator = !selectedIndicator || f.appliedTo.includes(selectedIndicator);
    const matchType = !selectedType || f.type === selectedType;
    const matchStatus = !selectedStatus || f.status === selectedStatus;

    return matchSearch && matchIndicator && matchType && matchStatus;
  });

  // --- RENDERERS ---

  const renderStatusBadge = (status: string) => {
    const isActive = status === 'Active';
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border w-fit ${isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-black/45 border-gray-200'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        {isActive ? 'Hiệu lực' : 'Nháp'}
      </div>
    );
  };

  const renderUsedBy = (items: string[]) => {
    if (items.length === 0) return <span className="text-gray-400 text-sm italic">Chưa sử dụng</span>;
    const displayItem = items[0];
    const remaining = items.length - 1;
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium border border-gray-200">
          {displayItem}
        </span>
        {remaining > 0 && <span className="text-xs text-black/45 pl-1">+ {remaining} chỉ tiêu khác</span>}
      </div>
    );
  };

  // 1. LIST VIEW
  const renderListView = () => (
    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-vna-blue">Quản lý Công thức tính</h2>
          <p className="text-sm text-black/45 mt-1">Cấu hình công thức tính toán và mô phỏng cho các chỉ tiêu</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateNew} className="shadow-md">
            <Plus size={18} /> Tạo công thức
          </Button>
        </div>
      </div>

      {/* Stats / Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
            <div>
               <div className="text-xs text-black/45 uppercase font-semibold">Tổng công thức</div>
               <div className="text-2xl font-bold text-black/85">{formulas.length}</div>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-vna-blue rounded-full flex items-center justify-center"><Code size={20}/></div>
         </div>
         <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
            <div>
               <div className="text-xs text-black/45 uppercase font-semibold">Đang hiệu lực</div>
               <div className="text-2xl font-bold text-green-600">{formulas.filter(f => f.status === 'Active').length}</div>
            </div>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center"><CheckCircle size={20}/></div>
         </div>
         <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
            <div>
               <div className="text-xs text-black/45 uppercase font-semibold">Công thức tính</div>
               <div className="text-2xl font-bold text-black/85">{formulas.filter(f => f.type === 'Calculation').length}</div>
            </div>
            <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center"><Calculator size={20}/></div>
         </div>
         <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
            <div>
               <div className="text-xs text-black/45 uppercase font-semibold">Công thức mô phỏng</div>
               <div className="text-2xl font-bold text-black/85">{formulas.filter(f => f.type === 'Simulation').length}</div>
            </div>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center"><Activity size={20}/></div>
         </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 bg-white p-4 rounded-lg border border-gray-200 items-end">
        {/* Search */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">Từ khóa</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm theo mã, tên công thức..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue text-sm"
            />
          </div>
        </div>

        {/* Indicator Dropdown */}
        <div className="md:col-span-4">
             <Select 
               label="Chỉ tiêu áp dụng"
               placeholder="Chọn chỉ tiêu..."
               value={selectedIndicator}
               onChange={setSelectedIndicator}
               options={[{label: 'Tất cả', value: ''}, ...INDICATOR_OPTIONS]}
             />
        </div>

        {/* Type Dropdown */}
        <div className="md:col-span-2">
             <Select 
                label="Loại"
                placeholder="Tất cả"
                value={selectedType}
                onChange={setSelectedType}
                options={[{label: 'Tất cả', value: ''}, {label: 'Tính toán', value: 'Calculation'}, {label: 'Mô phỏng', value: 'Simulation'}]}
             />
        </div>

        {/* Status Dropdown */}
        <div className="md:col-span-2">
             <Select 
                label="Trạng thái"
                placeholder="Tất cả"
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={[{label: 'Tất cả', value: ''}, {label: 'Hiệu lực', value: 'Active'}, {label: 'Nháp', value: 'Draft'}]}
             />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-visible rounded-lg border border-gray-200 flex-1 min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-vna-blue text-white">
              <th className="py-3 px-4 font-semibold text-sm w-12 text-center rounded-tl-lg">STT</th>
              <th className="py-3 px-4 font-semibold text-sm">Mã công thức</th>
              <th className="py-3 px-4 font-semibold text-sm">Tên công thức</th>
              <th className="py-3 px-4 font-semibold text-sm">Phiên bản</th>
              <th className="py-3 px-4 font-semibold text-sm">Loại</th>
              <th className="py-3 px-4 font-semibold text-sm">Sử dụng bởi</th>
              <th className="py-3 px-4 font-semibold text-sm">Người tạo</th>
              <th className="py-3 px-4 font-semibold text-sm">Người cập nhật</th>
              <th className="py-3 px-4 font-semibold text-sm">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-sm w-16 text-center rounded-tr-lg"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredFormulas.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50 group transition-colors relative">
                <td className="py-3 px-4 text-sm text-black/45 text-center">{index + 1}</td>
                <td className="py-3 px-4 text-sm font-bold text-vna-blue font-mono">{item.code}</td>
                <td className="py-3 px-4 text-sm text-black/85 font-medium max-w-xs">{item.name}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-300">v{item.version}</span>
                </td>
                <td className="py-3 px-4">{<TypeBadge type={item.type} />}</td>
                <td className="py-3 px-4">{renderUsedBy(item.appliedTo)}</td>
                <td className="py-3 px-4 text-xs text-gray-600">
                    <div className="font-medium text-gray-900">{item.createdBy}</div>
                    <div className="text-gray-400">{item.createdAt}</div>
                </td>
                <td className="py-3 px-4 text-xs text-gray-600">
                    <div className="font-medium text-gray-900">{item.updatedBy}</div>
                    <div className="text-gray-400">{item.updatedAt}</div>
                </td>
                <td className="py-3 px-4">
                   {renderStatusBadge(item.status)}
                </td>
                <td className="py-3 px-4 text-center">
                   <button 
                      onClick={() => handleViewDetail(item)}
                      className="p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-vna-blue transition-colors"
                      title="Xem chi tiết"
                    >
                     <ChevronRight size={20} />
                   </button>
                </td>
              </tr>
            ))}
            {filteredFormulas.length === 0 && (
              <tr>
                <td colSpan={10} className="py-12 text-center text-gray-400">
                  Không tìm thấy công thức nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm text-black/45 mb-2 sm:mb-0">
          Hiển thị <span className="font-medium text-gray-900">1 - {filteredFormulas.length}</span> của <span className="font-medium text-gray-900">{filteredFormulas.length}</span> kết quả
        </div>
        <div className="flex gap-1">
          <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-sm text-gray-600 disabled:opacity-50">Trước</button>
          <button className="px-3 py-1 bg-vna-blue text-white rounded text-sm">1</button>
          <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-sm text-gray-600">Sau</button>
        </div>
      </div>
    </div>
  );

  // 2. DETAIL / EDIT VIEW
  const renderDetailView = () => {
    if (!selectedFormula) return null;

    // Determine which data object to show (editForm if editing, else selectedFormula)
    const displayItem = isEditing && editForm ? editForm : selectedFormula;

    // Check if this is a "Create New" session (original code is empty)
    const isCreating = !selectedFormula.code;

    // Check if Simulation
    const isSimulation = displayItem.type === 'Simulation';

    return (
      <div className={`bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border ${isEditing ? 'border-vna-blue ring-1 ring-vna-blue' : 'border-gray-100'} min-h-[calc(100vh-120px)] animate-in slide-in-from-right-4 duration-300`}>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        {/* Navigation & Breadcrumbs */}
        <div className="flex flex-col gap-4 mb-6">
           <div className="flex items-center text-sm text-black/45 font-medium">
              <span onClick={handleBackToList} className="cursor-pointer hover:text-vna-blue">Quản trị nghiệp vụ</span>
              <span className="mx-2 text-gray-400">&gt;</span>
              <span onClick={handleBackToList} className="cursor-pointer hover:text-vna-blue">Quản lý công thức</span>
              <span className="mx-2 text-gray-400">&gt;</span>
              <span className="text-vna-blue font-bold">{isCreating ? 'Tạo mới' : displayItem.code}</span>
              {!isCreating && isEditing && <span className="ml-2 text-orange-600 italic font-semibold">(Đang chỉnh sửa)</span>}
           </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 pb-6 border-b border-gray-100 gap-4">
           <div className="space-y-3 flex-1 w-full md:w-auto">
              <div className="flex items-center gap-3">
                 {isEditing ? (
                    <Input 
                        value={displayItem.code}
                        onChange={(e) => updateEditField('code', e.target.value)}
                        placeholder="Nhập mã công thức"
                        className="text-2xl font-bold text-vna-blue font-mono uppercase w-auto"
                    />
                 ) : (
                    <h1 className="text-2xl font-bold text-vna-blue font-mono">{displayItem.code}</h1>
                 )}
                 
                 {/* Type Badge */}
                 {isEditing ? (
                     <Select 
                        value={displayItem.type}
                        onChange={(val) => updateEditField('type', val)}
                        options={[{label: 'Tính toán tự động', value: 'Calculation'}, {label: 'Mô phỏng kịch bản', value: 'Simulation'}]}
                        className="w-32"
                     />
                 ) : (
                    <TypeBadge type={displayItem.type} />
                 )}

                 {/* Status Badge */}
                 {isEditing ? (
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                      <input 
                        type="checkbox" 
                        checked={displayItem.status === 'Active'} 
                        onChange={(e) => updateEditField('status', e.target.checked ? 'Active' : 'Draft')}
                        className="rounded text-vna-blue focus:ring-vna-blue"
                      />
                      <span className={`text-xs font-bold ${displayItem.status === 'Active' ? 'text-green-700' : 'text-black/45'}`}>
                        {displayItem.status === 'Active' ? 'Hiệu lực' : 'Bản nháp'}
                      </span>
                    </label>
                 ) : (
                    renderStatusBadge(displayItem.status)
                 )}
              </div>
              
              {isEditing ? (
                 <Input 
                   value={displayItem.name} 
                   onChange={(e) => updateEditField('name', e.target.value)}
                   className="text-lg font-medium text-black/85 w-full"
                   placeholder="Nhập tên công thức..."
                 />
              ) : (
                 <p className="text-lg text-gray-700 font-medium">{displayItem.name}</p>
              )}
           </div>

           <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                   <Button variant="outline" onClick={handleCancelEdit} className="text-gray-600">
                     <X size={16} /> Hủy bỏ
                   </Button>
                   <Button variant="primary" onClick={handleSave}>
                     <Save size={16} /> Lưu lại
                   </Button>
                </>
              ) : (
                <>
                  {/* Removed Test Button as requested */}
                  <Button variant="primary" onClick={handleEditClick}>
                     <Edit2 size={16} /> Chỉnh sửa
                  </Button>
                  <Button variant="danger" onClick={handleDelete}>
                     <Trash2 size={16} /> Xóa
                  </Button>
                  <div className="h-6 w-px bg-gray-300 mx-1"></div>
                  <Button 
                    variant="ghost" 
                    onClick={handleBackToList}
                    className="text-black/45 hover:text-vna-blue hover:bg-gray-100"
                  >
                    <ArrowLeft size={16} /> Quay lại
                  </Button>
                </>
              )}
           </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
           {[
               { id: 'GENERAL', label: 'Thông tin chung', icon: FileText },
               { id: 'FORMULA', label: 'Cấu hình công thức', icon: Calculator },
               { id: 'USAGE', label: 'Lịch sử & Áp dụng', icon: History },
           ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'border-vna-blue text-vna-blue' : 'border-transparent text-black/45 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
           ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300 min-h-[300px]">
           {/* TAB 1: General Info */}
           {activeTab === 'GENERAL' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                   <div>
                      <h3 className="text-sm font-bold text-black/85 uppercase tracking-wide mb-3 border-l-4 border-vna-gold pl-2">Mô tả chi tiết</h3>
                      {isEditing ? (
                          <TextArea 
                              rows={4}
                              value={displayItem.description || ''}
                              onChange={(e) => updateEditField('description', e.target.value)}
                              placeholder="Nhập mô tả chi tiết về công thức..."
                          />
                      ) : (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                             {displayItem.description || `${displayItem.name} - Phiên bản ${displayItem.version}.\nCông thức này được sử dụng để ${displayItem.type === 'Calculation' ? 'tính toán' : 'mô phỏng'} dữ liệu ESG dựa trên các biến số đầu vào chuẩn hóa.`}
                          </div>
                      )}
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="text-xs text-black/45 uppercase font-semibold block mb-1">Phiên bản hiện tại</label>
                         {isEditing ? (
                            <Input value={displayItem.version} onChange={(e) => updateEditField('version', e.target.value)} />
                         ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900">{displayItem.version}</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">Latest</span>
                            </div>
                         )}
                      </div>
                      <div>
                         <label className="text-xs text-black/45 uppercase font-semibold block mb-1">Loại công thức</label>
                         {isEditing ? (
                            <Select 
                                value={displayItem.type}
                                onChange={(val) => updateEditField('type', val)}
                                options={[{label: 'Tính toán tự động', value: 'Calculation'}, {label: 'Mô phỏng kịch bản', value: 'Simulation'}]}
                            />
                         ) : (
                            <p className="mt-1 font-medium text-gray-900">{displayItem.type === 'Calculation' ? 'Tính toán tự động' : 'Mô phỏng kịch bản'}</p>
                         )}
                      </div>
                   </div>
                </div>

                <div className="lg:col-span-1 space-y-6 bg-white p-5 rounded-lg border border-gray-100 h-fit hover:shadow-md transition-shadow duration-300">
                   <div>
                      <label className="text-xs text-black/45 uppercase font-semibold flex items-center gap-2">
                        Thông tin hệ thống <Lock size={12} className="text-gray-400"/>
                      </label>
                      <div className="mt-2 space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
                         <div className="flex justify-between"><span>Người tạo:</span> <span className="font-medium">{displayItem.createdBy}</span></div>
                         <div className="flex justify-between"><span>Ngày tạo:</span> <span className="font-medium">{displayItem.createdAt}</span></div>
                         <div className="flex justify-between"><span>Cập nhật lần cuối:</span> <span className="font-medium">{displayItem.updatedAt}</span></div>
                         <div className="flex justify-between"><span>Người cập nhật:</span> <span className="font-medium">{displayItem.updatedBy}</span></div>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* TAB 2: Formula Config */}
           {activeTab === 'FORMULA' && (
             <div className="space-y-6">
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                    <pre><code>{displayItem.expression}</code></pre>
                </div>
                {isEditing && (
                    <div className="space-y-4">
                        <TextArea 
                            label="Chỉnh sửa biểu thức" 
                            value={displayItem.expression} 
                            onChange={(e) => updateEditField('expression', e.target.value)}
                            rows={4}
                            className="font-mono text-sm"
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">Kiểm tra cú pháp</Button>
                            <Button variant="outline" size="sm">Chạy thử nghiệm</Button>
                        </div>
                    </div>
                )}
                {displayItem.type === 'Simulation' && displayItem.simulationParams && (
                    <div className="mt-6">
                        <h4 className="text-sm font-bold text-black/85 uppercase mb-3">Tham số mô phỏng</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {displayItem.simulationParams.map((param, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-700">{param.name}</span>
                                        <span className="text-xs text-black/45 bg-gray-200 px-2 py-0.5 rounded">{param.code}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input value={param.defaultValue.toString()} readOnly={!isEditing} className="w-full" />
                                        <span className="text-sm text-black/45">{param.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>
           )}

           {/* TAB 3: Usage & History */}
           {activeTab === 'USAGE' && (
             <div className="space-y-8">
                <div>
                   <h3 className="text-sm font-bold text-black/85 uppercase tracking-wide mb-4 border-l-4 border-vna-gold pl-2">Chỉ tiêu áp dụng</h3>
                   {displayItem.appliedTo.length > 0 ? (
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3">Mã chỉ tiêu</th>
                                        <th className="px-4 py-3">Tên chỉ tiêu</th>
                                        <th className="px-4 py-3">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {displayItem.appliedTo.map((code, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-bold text-vna-blue cursor-pointer hover:underline">{code}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {/* Mock lookup based on code if needed, for now static text */}
                                                {code.includes('GRI') ? 'Chỉ tiêu tiêu chuẩn GRI' : 'Chỉ tiêu nội bộ VNA'}
                                            </td>
                                            <td className="px-4 py-3"><span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded border border-green-100">Active</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                   ) : (
                       <div className="p-8 text-center bg-gray-50 rounded border border-dashed border-gray-300 text-black/45 italic">
                           Công thức này chưa được áp dụng cho chỉ tiêu nào.
                       </div>
                   )}
                </div>

                <div>
                   <h3 className="text-sm font-bold text-black/85 uppercase tracking-wide mb-4 border-l-4 border-vna-gold pl-2">Lịch sử phiên bản</h3>
                   <div className="border-l-2 border-gray-200 pl-4 space-y-6">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-vna-blue rounded-full border-2 border-white ring-1 ring-gray-200"></div>
                            <div className="text-sm font-bold text-black/85">Phiên bản {displayItem.version} (Hiện tại)</div>
                            <div className="text-xs text-black/45 mt-1">{displayItem.updatedAt} - Cập nhật bởi {displayItem.updatedBy}</div>
                        </div>
                        <div className="relative opacity-60">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-gray-300 rounded-full border-2 border-white ring-1 ring-gray-200"></div>
                            <div className="text-sm font-bold text-gray-700">Phiên bản 1.0</div>
                            <div className="text-xs text-black/45 mt-1">{displayItem.createdAt} - Tạo bởi {displayItem.createdBy}</div>
                        </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    );
  };

  return viewMode === 'LIST' ? renderListView() : renderDetailView();
};
