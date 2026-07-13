import React, { useState, useMemo } from 'react';
import { Button, Select, Input } from '../components/UI';
import { Plus, Search, ArrowLeft, Edit2, Info, DollarSign, ShieldAlert } from 'lucide-react';

// Định nghĩa Interface Bảng 1: Thông tin Dự án Tín chỉ
interface CarbonProject {
  id: string; // Khóa chính (Mã tín chỉ / Mã dự án, ví dụ: VCS-1566)
  projectName: string;
  applicableSchema: 'CORSIA' | 'EU-ETS' | 'UK-ETS' | 'Voluntary';
  vintage: number;
  hostCountry: string;
  validPhase: string; // Khoảng thời gian hợp lệ (ví dụ: 2024-2026)
  status: 'Active' | 'Inactive';
}

// Định nghĩa Interface Bảng 2: Lịch sử Giá Tín chỉ
interface PriceRecord {
  id: string; // Khóa chính tự tăng/unique string
  projectId: string; // Khóa ngoại trỏ về Bảng 1
  currency: 'USD' | 'EUR' | 'GBP';
  unitPrice: number; // Đơn giá mỗi tấn CO2e
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo: string | null; // YYYY-MM-DD (Null nghĩa là đang hiệu lực hiện tại)
}

// Mock Data Bảng 1
const INITIAL_PROJECTS: CarbonProject[] = [
  {
    id: 'VCS-1566',
    projectName: 'Dự án Bảo vệ Rừng Rimba Raya (Rimba Raya Biodiversity)',
    applicableSchema: 'CORSIA',
    vintage: 2022,
    hostCountry: 'Indonesia',
    validPhase: '2024-2026',
    status: 'Active'
  },
  {
    id: 'GS-4289',
    projectName: 'Dự án Điện Gió Ninh Thuận (Ninh Thuan Wind Power)',
    applicableSchema: 'Voluntary',
    vintage: 2021,
    hostCountry: 'Việt Nam',
    validPhase: '2023-2028',
    status: 'Active'
  },
  {
    id: 'GS-8812',
    projectName: 'Dự án Trồng Rừng Bắc Thụy Điển (Northern Sweden Forestry)',
    applicableSchema: 'EU-ETS',
    vintage: 2023,
    hostCountry: 'Thụy Điển',
    validPhase: '2024-2030',
    status: 'Active'
  },
  {
    id: 'ACR-0012',
    projectName: 'Cơ sở Thu hồi Carbon Trực tiếp Climeworks Orca (Iceland)',
    applicableSchema: 'Voluntary',
    vintage: 2024,
    hostCountry: 'Iceland',
    validPhase: '2024-2035',
    status: 'Active'
  }
];

// Mock Data Bảng 2
const INITIAL_PRICES: PriceRecord[] = [
  // VCS-1566
  { id: 'PR-101', projectId: 'VCS-1566', currency: 'USD', unitPrice: 8.50, effectiveFrom: '2021-01-01', effectiveTo: '2023-12-31' },
  { id: 'PR-102', projectId: 'VCS-1566', currency: 'USD', unitPrice: 12.00, effectiveFrom: '2024-01-01', effectiveTo: '2024-12-31' },
  { id: 'PR-103', projectId: 'VCS-1566', currency: 'USD', unitPrice: 15.50, effectiveFrom: '2025-01-01', effectiveTo: null }, // Đang hiệu lực
  
  // GS-4289
  { id: 'PR-201', projectId: 'GS-4289', currency: 'USD', unitPrice: 4.50, effectiveFrom: '2022-01-01', effectiveTo: '2024-06-30' },
  { id: 'PR-202', projectId: 'GS-4289', currency: 'USD', unitPrice: 6.20, effectiveFrom: '2024-07-01', effectiveTo: null }, // Đang hiệu lực

  // GS-8812
  { id: 'PR-301', projectId: 'GS-8812', currency: 'EUR', unitPrice: 75.00, effectiveFrom: '2023-01-01', effectiveTo: '2023-12-31' },
  { id: 'PR-302', projectId: 'GS-8812', currency: 'EUR', unitPrice: 82.50, effectiveFrom: '2024-01-01', effectiveTo: '2024-12-31' },
  { id: 'PR-303', projectId: 'GS-8812', currency: 'EUR', unitPrice: 94.00, effectiveFrom: '2025-01-01', effectiveTo: null }, // Đang hiệu lực

  // ACR-0012
  { id: 'PR-401', projectId: 'ACR-0012', currency: 'USD', unitPrice: 450.00, effectiveFrom: '2024-01-01', effectiveTo: '2024-12-31' },
  { id: 'PR-402', projectId: 'ACR-0012', currency: 'USD', unitPrice: 550.00, effectiveFrom: '2025-01-01', effectiveTo: null } // Đang hiệu lực
];

export const CarbonCreditsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [projects, setProjects] = useState<CarbonProject[]>(INITIAL_PROJECTS);
  const [prices, setPrices] = useState<PriceRecord[]>(INITIAL_PRICES);
  
  // State Bộ lọc danh sách
  const [searchText, setSearchText] = useState('');
  const [schemaFilter, setSchemaFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // State Form chi tiết
  const [formProject, setFormProject] = useState<CarbonProject | null>(null);
  
  // State Form thêm giá mới (Quy tắc Nghiệp vụ 1)
  const [newPrice, setNewPrice] = useState<{ unitPrice: string; currency: 'USD' | 'EUR' | 'GBP'; effectiveFrom: string }>({
    unitPrice: '',
    currency: 'USD',
    effectiveFrom: new Date().toISOString().split('T')[0]
  });
  const [showPriceForm, setShowPriceForm] = useState(false);

  const handleAddNew = () => {
    setFormProject({
      id: '',
      projectName: '',
      applicableSchema: 'CORSIA',
      vintage: new Date().getFullYear(),
      hostCountry: 'Việt Nam',
      validPhase: `${new Date().getFullYear()}-${new Date().getFullYear() + 3}`,
      status: 'Active'
    });
    setViewMode('DETAIL');
    setShowPriceForm(false);
  };

  const handleEdit = (item: CarbonProject) => {
    setFormProject({ ...item });
    setViewMode('DETAIL');
    setShowPriceForm(false);
  };

  const handleSaveProject = () => {
    if (!formProject) return;
    if (!formProject.id.trim() || !formProject.projectName.trim()) {
      alert("Vui lòng nhập đầy đủ Mã dự án và Tên dự án!");
      return;
    }

    const isNew = !projects.some(p => p.id === formProject.id);

    if (isNew) {
      setProjects([...projects, formProject]);
      // Khởi tạo mức giá mặc định ban đầu cho dự án mới
      const initPrice: PriceRecord = {
        id: `PR_${Date.now()}`,
        projectId: formProject.id,
        currency: 'USD',
        unitPrice: 10.00,
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: null
      };
      setPrices([...prices, initPrice]);
    } else {
      setProjects(projects.map(p => p.id === formProject.id ? formProject : p));
    }

    setViewMode('LIST');
    setFormProject(null);
  };

  const handleBack = () => {
    setViewMode('LIST');
    setFormProject(null);
  };

  // Logic nghiệp vụ 1: Thêm giá mới và tự động cập nhật thời gian chuyển tiếp của mức giá cũ
  const handleAddNewPrice = () => {
    if (!formProject) return;
    const priceVal = parseFloat(newPrice.unitPrice);
    if (isNaN(priceVal) || priceVal <= 0) {
      alert("Vui lòng nhập đơn giá hợp lệ lớn hơn 0!");
      return;
    }
    if (!newPrice.effectiveFrom) {
      alert("Vui lòng chọn ngày bắt đầu hiệu lực!");
      return;
    }

    // 1. Tìm tất cả các giá cũ của dự án này
    const projectPrices = prices.filter(p => p.projectId === formProject.id);
    
    // 2. Xác thực xem ngày bắt đầu hiệu lực mới có xung đột hoặc nhỏ hơn các mốc trước không
    const conflicting = projectPrices.some(p => p.effectiveFrom >= newPrice.effectiveFrom);
    if (conflicting) {
      alert("Ngày bắt đầu hiệu lực mới phải lớn hơn ngày bắt đầu của tất cả các mức giá trong lịch sử!");
      return;
    }

    // 3. Tìm bản ghi giá hiện tại đang Active (có effectiveTo là null)
    const currentActivePrice = projectPrices.find(p => p.effectiveTo === null);

    let updatedPricesList = [...prices];

    if (currentActivePrice) {
      // Tính ngày kết thúc của mức giá cũ: 1 ngày trước ngày hiệu lực của mức giá mới
      const newFromDate = new Date(newPrice.effectiveFrom);
      const dayBefore = new Date(newFromDate);
      dayBefore.setDate(newFromDate.getDate() - 1);
      const formattedToDate = dayBefore.toISOString().split('T')[0];

      // Ghi nhận cập nhật ngày kết thúc của mức giá cũ
      updatedPricesList = updatedPricesList.map(p => 
        p.id === currentActivePrice.id 
          ? { ...p, effectiveTo: formattedToDate } 
          : p
      );
    }

    // 4. Thêm mức giá mới với effectiveTo là null (Active mới)
    const priceRecord: PriceRecord = {
      id: `PR_${Date.now()}`,
      projectId: formProject.id,
      currency: newPrice.currency,
      unitPrice: priceVal,
      effectiveFrom: newPrice.effectiveFrom,
      effectiveTo: null
    };

    setPrices([...updatedPricesList, priceRecord]);
    setNewPrice({
      unitPrice: '',
      currency: 'USD',
      effectiveFrom: new Date().toISOString().split('T')[0]
    });
    setShowPriceForm(false);
  };

  // Lấy ra giá hiện tại của mỗi dự án phục vụ hiển thị trên List Grid
  const getProjectCurrentPrice = (projId: string) => {
    const projPrices = prices.filter(p => p.projectId === projId);
    const activePrice = projPrices.find(p => p.effectiveTo === null);
    if (activePrice) {
      return `${activePrice.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${activePrice.currency}`;
    }
    if (projPrices.length > 0) {
      const sorted = [...projPrices].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
      return `${sorted[0].unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${sorted[0].currency}`;
    }
    return 'Chưa cấu hình';
  };

  // Lọc tìm kiếm
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.id.toLowerCase().includes(searchText.toLowerCase()) ||
        p.projectName.toLowerCase().includes(searchText.toLowerCase()) ||
        p.hostCountry.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesSchema = schemaFilter === 'ALL' || p.applicableSchema === schemaFilter;
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      
      return matchesSearch && matchesSchema && matchesStatus;
    });
  }, [projects, searchText, schemaFilter, statusFilter]);

  // Danh sách lịch sử giá của dự án đang chỉnh sửa
  const currentProjectPrices = useMemo(() => {
    if (!formProject) return [];
    return prices
      .filter(p => p.projectId === formProject.id)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom)); // Sắp xếp giá mới nhất lên đầu
  }, [prices, formProject]);

  if (viewMode === 'DETAIL' && formProject) {
    return (
      <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
        
        {/* Header chi tiết */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack} className="p-2 cursor-pointer">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-vna-blue">
                {formProject.id ? `Dự án Tín chỉ: ${formProject.id}` : 'Thêm mới dự án tín chỉ'}
              </h2>
              <p className="text-xs text-black/45">Cấu hình thông tin dự án và thiết lập lịch sử biến động giá cấn trừ carbon</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleBack}>Hủy bỏ</Button>
            <Button variant="primary" onClick={handleSaveProject}>Lưu thông tin</Button>
          </div>
        </div>

        {/* 50/50 Dual Column Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start">
          
          {/* CỘT TRÁI: Dữ liệu Tĩnh - Thông tin Dự án */}
          <div className="space-y-6">
            
            {/* CARD 1: Định danh Dự án cốt lõi */}
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                <h3 className="text-sm font-bold text-vna-blue uppercase tracking-wider">1. Định danh dự án (Identification)</h3>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">Project Base</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Mã Tín chỉ / Mã Dự án (Project ID)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Mã định danh tín chỉ</p>
                      <strong>Mục đích:</strong> Mã định danh duy nhất (PK) được cấp phát bởi tổ chức đăng ký (ví dụ: VCS-1566).<br/>
                      <strong>Logic hệ thống:</strong> Dùng để đối chiếu trực tiếp với hồ sơ, chứng từ sở hữu carbon khi kiểm toán khí thải độc lập.
                    </div>
                  </div>
                </div>
                <Input 
                  placeholder="Ví dụ: VCS-1566, GS-4289..."
                  value={formProject.id}
                  disabled={projects.some(p => p.id === formProject.id && formProject.id !== '')}
                  onChange={(e) => setFormProject({ ...formProject, id: e.target.value.toUpperCase() })}
                />
              </div>

              <Input 
                label="Tên Dự án" 
                placeholder="Ví dụ: Dự án Bảo vệ Rừng Rimba Raya..."
                value={formProject.projectName}
                onChange={(e) => setFormProject({ ...formProject, projectName: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select 
                  label="Quốc gia lưu trữ"
                  value={formProject.hostCountry}
                  onChange={(val) => setFormProject({ ...formProject, hostCountry: val })}
                  options={[
                    { label: 'Việt Nam', value: 'Việt Nam' },
                    { label: 'Indonesia', value: 'Indonesia' },
                    { label: 'Thụy Điển', value: 'Thụy Điển' },
                    { label: 'Iceland', value: 'Iceland' },
                    { label: 'Brazil', value: 'Brazil' },
                    { label: 'Mỹ', value: 'Mỹ' }
                  ]}
                />
                
                <Select 
                  label="Trạng thái áp dụng"
                  value={formProject.status}
                  onChange={(val) => setFormProject({ ...formProject, status: val as 'Active' | 'Inactive' })}
                  options={[
                    { label: 'Hoạt động (Active)', value: 'Active' },
                    { label: 'Tạm khóa (Inactive)', value: 'Inactive' }
                  ]}
                />
              </div>
            </div>

            {/* CARD 2: Thuộc tính & Tiêu chuẩn */}
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                <h3 className="text-sm font-bold text-vna-blue uppercase tracking-wider">2. Thuộc tính & Tiêu chuẩn (Metadata)</h3>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-full">Compliance</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select 
                  label="Chương trình áp dụng"
                  value={formProject.applicableSchema}
                  onChange={(val) => setFormProject({ ...formProject, applicableSchema: val as any })}
                  options={[
                    { label: 'CORSIA (Hàng không toàn cầu)', value: 'CORSIA' },
                    { label: 'EU-ETS (Châu Âu)', value: 'EU-ETS' },
                    { label: 'UK-ETS (Vương quốc Anh)', value: 'UK-ETS' },
                    { label: 'Voluntary (Tự nguyện)', value: 'Voluntary' }
                  ]}
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 ml-1">
                    <label className="block text-sm font-semibold text-gray-700">Năm phát hành (Vintage)</label>
                    <div className="relative group inline-block cursor-help">
                      <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                        <p className="font-bold text-vna-gold mb-1">Quy định năm phát hành</p>
                        <strong>Mục đích:</strong> Năm lượng khí phát thải CO2e thực tế được hấp thụ.<br/>
                        <strong>Logic hệ thống:</strong> ICAO CORSIA quy định rất nghiêm ngặt về Vintage, ví dụ giai đoạn thí điểm và Giai đoạn 1 chỉ chấp nhận tín chỉ có Vintage phát hành từ năm 2021 trở đi.
                      </div>
                    </div>
                  </div>
                  <Input 
                    type="number"
                    value={formProject.vintage}
                    onChange={(e) => setFormProject({ ...formProject, vintage: parseInt(e.target.value) || 2024 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Input 
                  label="Giai đoạn hợp lệ" 
                  placeholder="Ví dụ: 2024-2026..."
                  value={formProject.validPhase}
                  onChange={(e) => setFormProject({ ...formProject, validPhase: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Dữ liệu Động - Lịch sử Giá */}
          <div className="space-y-6">
            
            {/* CARD 3: Lịch sử Biến động Giá Tín chỉ (Bảng 2) */}
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-vna-blue uppercase tracking-wider">3. Lịch sử biến động giá</h3>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-80 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Chính sách bảo toàn Lịch sử Giá</p>
                      <strong>Quy tắc nghiệp vụ:</strong> Dữ liệu giá lịch sử là không thể xóa (No-delete Policy).<br/>
                      Khi giá thị trường thay đổi, quản trị viên thêm một mức giá mới vào dòng. Hệ thống sẽ tự động cập nhật *Ngày kết thúc hiệu lực* của bản ghi giá liền trước đó là 1 ngày trước mốc ngày hiệu lực mới.
                    </div>
                  </div>
                </div>
                
                {formProject.id && (
                  <Button 
                    size="sm" 
                    onClick={() => setShowPriceForm(!showPriceForm)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Plus size={14} /> Thêm giá mới
                  </Button>
                )}
              </div>

              {!formProject.id ? (
                <div className="p-4 text-center text-xs text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
                  Vui lòng lưu dự án tín chỉ trước khi bắt đầu cấu hình các mốc giá lịch sử biến động.
                </div>
              ) : (
                <>
                  {/* Form thêm giá mới (Quy tắc 1) */}
                  {showPriceForm && (
                    <div className="bg-white p-4 rounded-lg border border-vna-blue/30 space-y-3 shadow-xs animate-in slide-in-from-top-2">
                      <h4 className="text-xs font-bold text-vna-blue uppercase border-b pb-1 mb-2">Thêm mốc giá mới vào lịch sử</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          label="Đơn giá (Unit Price)" 
                          placeholder="Ví dụ: 12.50" 
                          type="number"
                          step="0.01"
                          value={newPrice.unitPrice}
                          onChange={(e) => setNewPrice({ ...newPrice, unitPrice: e.target.value })}
                        />
                        
                        <Select 
                          label="Đơn vị tiền tệ"
                          value={newPrice.currency}
                          onChange={(val) => setNewPrice({ ...newPrice, currency: val as any })}
                          options={[
                            { label: 'USD (Đô la Mỹ)', value: 'USD' },
                            { label: 'EUR (Đồng Euro)', value: 'EUR' },
                            { label: 'GBP (Bảng Anh)', value: 'GBP' }
                          ]}
                        />
                      </div>

                      <Input 
                        label="Ngày hiệu lực bắt đầu (Effective Date From)" 
                        type="date"
                        value={newPrice.effectiveFrom}
                        onChange={(e) => setNewPrice({ ...newPrice, effectiveFrom: e.target.value })}
                      />

                      <div className="flex justify-end gap-2 pt-1 border-t mt-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowPriceForm(false)}>Hủy</Button>
                        <Button variant="primary" size="sm" onClick={handleAddNewPrice}>Ghi nhận mức giá mới</Button>
                      </div>
                    </div>
                  )}

                  {/* Bảng hiển thị Lịch sử giá không thể xóa */}
                  <div className="overflow-hidden border border-gray-200 rounded-lg bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="py-2 px-3 font-semibold text-gray-700">Đơn giá</th>
                          <th className="py-2 px-3 font-semibold text-gray-700">Tiền tệ</th>
                          <th className="py-2 px-3 font-semibold text-gray-700">Hiệu lực Từ</th>
                          <th className="py-2 px-3 font-semibold text-gray-700">Hiệu lực Đến</th>
                          <th className="py-2 px-3 font-semibold text-gray-700 text-center">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentProjectPrices.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="py-2 px-3 font-bold text-black/85">
                              {p.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 px-3 text-gray-600 font-medium">{p.currency}</td>
                            <td className="py-2 px-3 text-black/45 font-mono">{p.effectiveFrom}</td>
                            <td className="py-2 px-3 text-black/45 font-mono">
                              {p.effectiveTo ? p.effectiveTo : <span className="text-green-600 font-semibold italic">Vô thời hạn</span>}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                p.effectiveTo === null
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-gray-100 text-black/45 border border-gray-200'
                              }`}>
                                {p.effectiveTo === null ? 'Active' : 'Expired'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-800 leading-relaxed">
                    <ShieldAlert size={16} className="text-blue-600 shrink-0" />
                    <div>
                      <strong>Chính sách Bảo toàn Dữ liệu Lịch sử:</strong> Chức năng XÓA bị vô hiệu hóa hoàn toàn đối với bảng lịch sử giá nhằm bảo vệ tính toàn vẹn số liệu kiểm toán phát thải hàng năm.
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-300">
      
      {/* Header danh sách */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-vna-blue">Danh mục Dự án Tín chỉ Carbon</h2>
          <p className="text-sm text-black/45 mt-1">Quản lý định danh dự án bảo vệ rừng, năng lượng tái tạo và quản trị giá cấn trừ carbon lịch sử</p>
        </div>
        <Button onClick={handleAddNew} className="shadow-md cursor-pointer flex items-center gap-1.5">
          <Plus size={18} /> Thêm dự án tín chỉ mới
        </Button>
      </div>

      {/* Grid bộ lọc */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">Bộ lọc tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm kiếm theo mã tín chỉ, tên dự án, quốc gia lưu trữ..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue text-sm h-[38px]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">Chương trình áp dụng</label>
          <Select 
            value={schemaFilter}
            onChange={(val) => setSchemaFilter(val)}
            options={[
              { label: 'Tất cả chương trình', value: 'ALL' },
              { label: 'CORSIA', value: 'CORSIA' },
              { label: 'EU-ETS', value: 'EU-ETS' },
              { label: 'UK-ETS', value: 'UK-ETS' },
              { label: 'Voluntary (Tự nguyện)', value: 'Voluntary' }
            ]}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">Trạng thái dự án</label>
          <Select 
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { label: 'Tất cả trạng thái', value: 'ALL' },
              { label: 'Hoạt động (Active)', value: 'Active' },
              { label: 'Tạm khóa (Inactive)', value: 'Inactive' }
            ]}
          />
        </div>
      </div>

      {/* Grid danh sách */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 flex-1 min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-12 text-center rounded-tl-lg">STT</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-36">Mã Dự án</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Tên Dự án Tín chỉ</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-40">Chương trình</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-28 text-center">Vintage</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-40">Giá hiện tại</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-36">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-24 text-center rounded-tr-lg">Cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProjects.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50 group transition-colors cursor-pointer" onClick={() => handleEdit(item)}>
                <td className="py-3 px-4 text-sm text-black/45 text-center">{index + 1}</td>
                <td className="py-3 px-4 text-sm font-bold text-vna-blue whitespace-nowrap">{item.id}</td>
                <td className="py-3 px-4 text-sm text-black/85 font-medium">
                  <div>{item.projectName}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Quốc gia lưu trữ: {item.hostCountry}</div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold whitespace-nowrap border ${
                    item.applicableSchema === 'CORSIA' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    item.applicableSchema === 'EU-ETS' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    item.applicableSchema === 'UK-ETS' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {item.applicableSchema}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-black/45 text-center font-semibold font-mono">{item.vintage}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 text-sm font-bold text-black/85">
                    <DollarSign size={14} className="text-gray-400" />
                    {getProjectCurrentPrice(item.id)}
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap inline-block ${
                    item.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-gray-50 text-black/45 border-gray-200'
                  }`}>
                    {item.status === 'Active' ? 'Hoạt động' : 'Tạm khóa'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-1.5 rounded text-vna-blue hover:bg-blue-100 cursor-pointer"
                    title="Chỉnh sửa dự án"
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  Không tìm thấy dự án tín chỉ phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
