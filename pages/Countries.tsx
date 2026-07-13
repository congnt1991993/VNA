import React, { useState } from 'react';
import { Button, Select, Input } from '../components/UI';
import { Search, ArrowLeft, Edit2, Power, Info, RefreshCw } from 'lucide-react';

interface Country {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  region: string; // Vùng địa lý / Châu lục
  status: 'Active' | 'Inactive' | 'Pending'; // Trạng thái: Hoạt động, Hết hạn, Chưa thiết lập
  corsiaStatus: 'Voluntary' | 'Mandatory' | 'Exempted';
  euEtsFlag: boolean;
  ukEtsFlag: boolean;
  refuelEuFlag: boolean;
  carbureFlag: boolean;
}

const MOCK_COUNTRIES: Country[] = [
  { 
    id: '1', 
    code: 'VN', 
    nameVi: 'Việt Nam', 
    nameEn: 'Vietnam', 
    region: 'Châu Á', 
    status: 'Active',
    corsiaStatus: 'Voluntary',
    euEtsFlag: false,
    ukEtsFlag: false,
    refuelEuFlag: false,
    carbureFlag: false
  },
  { 
    id: '2', 
    code: 'US', 
    nameVi: 'Mỹ', 
    nameEn: 'United States', 
    region: 'Châu Mỹ', 
    status: 'Active',
    corsiaStatus: 'Mandatory',
    euEtsFlag: false,
    ukEtsFlag: false,
    refuelEuFlag: false,
    carbureFlag: false
  },
  { 
    id: '3', 
    code: 'GB', 
    nameVi: 'Anh', 
    nameEn: 'United Kingdom', 
    region: 'Châu Âu', 
    status: 'Active',
    corsiaStatus: 'Mandatory',
    euEtsFlag: false,
    ukEtsFlag: true,
    refuelEuFlag: false,
    carbureFlag: false
  },
  { 
    id: '4', 
    code: 'FR', 
    nameVi: 'Pháp', 
    nameEn: 'France', 
    region: 'Châu Âu', 
    status: 'Active',
    corsiaStatus: 'Mandatory',
    euEtsFlag: true,
    ukEtsFlag: false,
    refuelEuFlag: true,
    carbureFlag: true
  },
  { 
    id: '5', 
    code: 'JP', 
    nameVi: 'Nhật Bản', 
    nameEn: 'Japan', 
    region: 'Châu Á', 
    status: 'Active',
    corsiaStatus: 'Voluntary',
    euEtsFlag: false,
    ukEtsFlag: false,
    refuelEuFlag: false,
    carbureFlag: false
  }
];

export const CountriesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [countries, setCountries] = useState<Country[]>(MOCK_COUNTRIES);
  const [searchText, setSearchText] = useState('');
  const [formCountry, setFormCountry] = useState<Country | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive' | 'Pending'>('ALL');

  const handleReload = () => {
    // Giả lập đồng bộ dữ liệu quốc gia từ hệ thống ICAO/ISO nguồn
    const alreadyReloaded = countries.some(item => item.code === 'SG' || item.code === 'TH');
    if (alreadyReloaded) {
      alert("Hệ thống danh mục Quốc gia đã được cập nhật bản ghi mới nhất từ ISO/ICAO Master Data!");
      return;
    }

    const fetchedCountries: Country[] = [
      {
        id: '6',
        code: 'SG',
        nameVi: 'Singapore',
        nameEn: 'Singapore',
        region: 'Châu Á',
        status: 'Pending', // Trạng thái Chưa thiết lập
        corsiaStatus: 'Exempted',
        euEtsFlag: false,
        ukEtsFlag: false,
        refuelEuFlag: false,
        carbureFlag: false
      },
      {
        id: '7',
        code: 'TH',
        nameVi: 'Thái Lan',
        nameEn: 'Thailand',
        region: 'Châu Á',
        status: 'Pending', // Trạng thái Chưa thiết lập
        corsiaStatus: 'Exempted',
        euEtsFlag: false,
        ukEtsFlag: false,
        refuelEuFlag: false,
        carbureFlag: false
      }
    ];

    setCountries([...countries, ...fetchedCountries]);
    alert("Đồng bộ thành công! Đã tự động cập nhật thêm 2 quốc gia mới (Singapore, Thái Lan) từ ICAO nguồn với trạng thái 'Chưa thiết lập'.");
  };

  const handleEdit = (item: Country) => {
    setFormCountry({ ...item });
    setViewMode('DETAIL');
  };

  const toggleActive = (id: string) => {
    setCountries(countries.map(item => {
      if (item.id === id) {
        // Toggle giữa Active và Inactive
        const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const handleSave = () => {
    if (!formCountry) return;
    if (!formCountry.code.trim() || !formCountry.nameVi.trim() || !formCountry.nameEn.trim()) {
      alert("Vui lòng nhập đầy đủ Mã quốc gia, Tên (VI) và Tên (EN)!");
      return;
    }

    setCountries(countries.map(item => item.id === formCountry.id ? formCountry : item));
    setViewMode('LIST');
    setFormCountry(null);
  };

  const handleBack = () => {
    setViewMode('LIST');
    setFormCountry(null);
  };

  const filtered = countries.filter(item => {
    const matchesSearch = item.code.toLowerCase().includes(searchText.toLowerCase()) || 
      item.nameVi.toLowerCase().includes(searchText.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchText.toLowerCase()) ||
      item.region.toLowerCase().includes(searchText.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getCorsiaLabel = (status: string) => {
    switch (status) {
      case 'Voluntary': return 'CORSIA Tình nguyện';
      case 'Mandatory': return 'CORSIA Bắt buộc';
      default: return 'CORSIA Miễn trừ';
    }
  };

  if (viewMode === 'DETAIL' && formCountry) {
    return (
      <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack} className="p-2 cursor-pointer">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-vna-blue">
                {formCountry.id.startsWith('NEW') ? 'Thêm mới quốc gia' : 'Chỉnh sửa quốc gia'}
              </h2>
              <p className="text-xs text-black/45">Cấu hình thông tin hành chính và chính sách kiểm soát phát thải quốc tế</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleBack}>Hủy bỏ</Button>
            <Button variant="primary" onClick={handleSave}>Lưu thông tin</Button>
          </div>
        </div>

        {/* 50/50 Dual Column Bento Layout for desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full flex-1">
          {/* Left Column: General Metadata */}
          <div className="space-y-4">
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">Thông tin chung</h3>
              <Input 
                label="Mã quốc gia (ISO 2 ký tự)" 
                placeholder="Ví dụ: VN, US, FR..." 
                maxLength={2}
                value={formCountry.code}
                onChange={(e) => setFormCountry({ ...formCountry, code: e.target.value.toUpperCase() })}
              />
              <Input 
                label="Tên quốc gia (VI)" 
                placeholder="Nhập tên tiếng Việt..." 
                value={formCountry.nameVi}
                onChange={(e) => setFormCountry({ ...formCountry, nameVi: e.target.value })}
              />
              <Input 
                label="Tên quốc gia (EN)" 
                placeholder="Nhập tên tiếng Anh..." 
                value={formCountry.nameEn}
                onChange={(e) => setFormCountry({ ...formCountry, nameEn: e.target.value })}
              />
              <Select 
                label="Vùng địa lý / Châu lục"
                value={formCountry.region}
                onChange={(val) => setFormCountry({ ...formCountry, region: val })}
                options={[
                  { label: 'Châu Á', value: 'Châu Á' },
                  { label: 'Châu Âu', value: 'Châu Âu' },
                  { label: 'Châu Mỹ', value: 'Châu Mỹ' },
                  { label: 'Châu Phi', value: 'Châu Phi' },
                  { label: 'Châu Đại Dương', value: 'Châu Đại Dương' }
                ]}
              />
              <Select 
                label="Trạng thái hoạt động"
                value={formCountry.status}
                onChange={(val) => setFormCountry({ ...formCountry, status: val })}
                options={[
                  { label: 'Hiệu lực (Hoạt động)', value: 'Active' },
                  { label: 'Hết hiệu lực (Ngưng hoạt động)', value: 'Inactive' },
                  { label: 'Chưa thiết lập', value: 'Pending' }
                ]}
              />
            </div>
          </div>

          {/* Right Column: Policies & Emission Controls */}
          <div className="space-y-4">
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-5 shadow-2xs">
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">Cấu hình chương trình / Chính sách</h3>
              
              {/* CORSIA Participation Status */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Tham gia CORSIA</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Cấu hình CORSIA Participation</p>
                      <strong>Mục đích:</strong> Đánh dấu quốc gia đó đã tham gia vào giai đoạn tình nguyện hay bắt buộc của CORSIA.<br/>
                      <strong>Logic hệ thống:</strong> Nếu cả nước đi (DEP) và nước đến (ARR) đều bật flag này, hệ thống tự động đưa sản lượng phát thải CO₂ của chuyến bay vào diện phải bù trừ tín chỉ carbon theo chuẩn ICAO.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formCountry.corsiaStatus}
                  onChange={(val) => setFormCountry({ ...formCountry, corsiaStatus: val })}
                  options={[
                    { label: 'Giai đoạn tình nguyện (Voluntary)', value: 'Voluntary' },
                    { label: 'Giai đoạn bắt buộc (Mandatory)', value: 'Mandatory' },
                    { label: 'Miễn trừ (Exempted)', value: 'Exempted' }
                  ]}
                />
              </div>

              {/* EU ETS Scope Flag */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Thuộc liên minh EU/EEA</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">EU ETS Scope Flag</p>
                      <strong>Mục đích:</strong> Xác định quốc gia có thuộc phạm vi áp dụng của Chỉ thị áp dụng Hệ thống mua bán khí thải Châu Âu hay không.<br/>
                      <strong>Logic hệ thống:</strong> Kích hoạt việc theo dõi, tính toán lượng tín chỉ EUA phải nộp đối với các chuyến bay nội khối EU hoặc chặng bay quy định.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formCountry.euEtsFlag ? 'yes' : 'no'}
                  onChange={(val) => setFormCountry({ ...formCountry, euEtsFlag: val === 'yes' })}
                  options={[
                    { label: 'Có (Thuộc phạm vi áp dụng)', value: 'yes' },
                    { label: 'Không', value: 'no' }
                  ]}
                />
              </div>

              {/* UK ETS Scope Flag */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Áp dụng Vương Quốc Anh</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">UK ETS Scope Flag</p>
                      <strong>Mục đích:</strong> Xác định nghĩa vụ báo cáo cho các chuyến bay liên quan đến lãnh thổ Anh.<br/>
                      <strong>Logic hệ thống:</strong> Tự động áp dụng bộ tham số lọc riêng “UK-related flights” và tính toán lượng tín chỉ UKA tương ứng.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formCountry.ukEtsFlag ? 'yes' : 'no'}
                  onChange={(val) => setFormCountry({ ...formCountry, ukEtsFlag: val === 'yes' })}
                  options={[
                    { label: 'Có (Áp dụng UK-ETS)', value: 'yes' },
                    { label: 'Không', value: 'no' }
                  ]}
                />
              </div>

              {/* ReFuelEU Flag */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Áp dụng cơ chế ReFuelEU Aviation</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">ReFuelEU Flag</p>
                      <strong>Mục đích:</strong> Đánh dấu quốc gia bắt buộc áp dụng Điều 8 của Quy định ReFuelEU.<br/>
                      <strong>Logic hệ thống:</strong> Khi chuyến bay khởi hành từ quốc gia này (ví dụ: Pháp), hệ thống sẽ bắt buộc kiểm tra dữ liệu tra nạp SAF (Uplift quantity, tỷ lệ trộn %, nguồn gốc feedstock) từ hệ thống FIMS/TOSS để lập báo cáo Annex II.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formCountry.refuelEuFlag ? 'yes' : 'no'}
                  onChange={(val) => setFormCountry({ ...formCountry, refuelEuFlag: val === 'yes' })}
                  options={[
                    { label: 'Có (Bắt buộc áp dụng Điều 8)', value: 'yes' },
                    { label: 'Không', value: 'no' }
                  ]}
                />
              </div>

              {/* French SAF Reporting Flag (CARBURE) */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Cơ chế CARBURE (Pháp)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">French SAF Reporting Flag</p>
                      <strong>Mục đích:</strong> Thiết lập riêng cho các đầu sân bay/quốc gia có hệ thống kiểm soát môi trường đặc thù (như Pháp).<br/>
                      <strong>Logic hệ thống:</strong> Yêu cầu nhập bổ sung thông tin mã lô SAF và nhà cung cấp.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formCountry.carbureFlag ? 'yes' : 'no'}
                  onChange={(val) => setFormCountry({ ...formCountry, carbureFlag: val === 'yes' })}
                  options={[
                    { label: 'Có (Yêu cầu kiểm soát CARBURE đặc thù)', value: 'yes' },
                    { label: 'Không', value: 'no' }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-vna-blue">Danh mục Quốc gia</h2>
          <p className="text-sm text-black/45 mt-1">Cấu hình thông tin địa lý và áp dụng chế tài kiểm soát phát thải (CORSIA, EU-ETS, UK-ETS, ReFuelEU)</p>
        </div>
        <Button onClick={handleReload} className="shadow-md cursor-pointer" variant="secondary">
          <RefreshCw size={18} /> Đồng bộ từ hệ thống nguồn
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">Bộ lọc nhanh</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm kiếm quốc gia theo mã, tên hoặc châu lục..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue text-sm h-[38px]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">Trạng thái thiết lập</label>
          <Select 
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { label: 'Tất cả trạng thái', value: 'ALL' },
              { label: 'Hiệu lực (Hoạt động)', value: 'Active' },
              { label: 'Hết hiệu lực (Ngưng hoạt động)', value: 'Inactive' },
              { label: 'Chưa thiết lập', value: 'Pending' }
            ]}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 flex-1 min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-12 text-center rounded-tl-lg">STT</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-24">Mã</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-44">Tên quốc gia (VI)</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-32">Vùng địa lý</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Chính sách/Chương trình áp dụng</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-36">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-24 text-center rounded-tr-lg">Chức năng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50 group transition-colors cursor-pointer" onClick={() => handleEdit(item)}>
                <td className="py-3 px-4 text-sm text-black/45 text-center">{index + 1}</td>
                <td className="py-3 px-4 text-sm font-bold text-vna-blue">{item.code}</td>
                <td className="py-3 px-4 text-sm text-black/85 font-medium">
                  <div>
                    <span className="block font-bold">{item.nameVi}</span>
                    <span className="block text-[10px] text-gray-400 uppercase font-semibold">{item.nameEn}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{item.region}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-1.5 flex-wrap max-w-[280px]">
                    {item.corsiaStatus !== 'Exempted' && (
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${
                        item.corsiaStatus === 'Mandatory' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`} title={getCorsiaLabel(item.corsiaStatus)}>
                        CORSIA
                      </span>
                    )}
                    {item.euEtsFlag && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded">EU-ETS</span>
                    )}
                    {item.ukEtsFlag && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 rounded">UK-ETS</span>
                    )}
                    {item.refuelEuFlag && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">ReFuelEU</span>
                    )}
                    {item.carbureFlag && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">CARBURE</span>
                    )}
                    {!item.euEtsFlag && !item.ukEtsFlag && !item.refuelEuFlag && !item.carbureFlag && item.corsiaStatus === 'Exempted' && (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap inline-block ${
                    item.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                    item.status === 'Inactive' ? 'bg-gray-50 text-black/45 border-gray-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {item.status === 'Active' ? 'Hoạt động' : item.status === 'Inactive' ? 'Hết hạn' : 'Chưa thiết lập'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                      className="p-1.5 rounded text-vna-blue hover:bg-blue-100 cursor-pointer"
                      title="Chỉnh sửa quốc gia"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleActive(item.id); }}
                      className={`p-1.5 rounded cursor-pointer ${item.status === 'Active' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                      title={item.status === 'Active' ? "Ngưng hiệu lực" : "Kích hoạt hiệu lực"}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  Không tìm thấy quốc gia nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
