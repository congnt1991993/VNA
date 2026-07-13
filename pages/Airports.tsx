import React, { useState, useRef } from 'react';
import { Button, Select, Input } from '../components/UI';
import { Search, ArrowLeft, Edit2, Info, RefreshCw } from 'lucide-react';

interface Airport {
  id: string;
  iataCode: string;
  icaoCode: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  schemas: string[]; // Nhiều schema áp dụng cùng lúc
  zone: 'EEA' | 'UK' | 'Domestic' | 'International'; // Phân loại khu vực
  isSafEnabled: boolean; // Khả năng cung ứng SAF
  isRefuelEuMandated: boolean; // Thuộc diện bắt buộc ReFuelEU
  status: 'Active' | 'Inactive' | 'Pending'; // Trạng thái: Hoạt động, Hết hạn, Chưa thiết lập
  description?: string;
}

const MOCK_AIRPORTS: Airport[] = [
  { 
    id: '1', 
    iataCode: 'HAN', 
    icaoCode: 'VVNB', 
    name: 'Sân bay Quốc tế Nội Bài', 
    country: 'Việt Nam', 
    latitude: 21.2212, 
    longitude: 105.8072, 
    schemas: ['CORSIA'], 
    zone: 'Domestic', 
    isSafEnabled: false, 
    isRefuelEuMandated: false, 
    status: 'Active', 
    description: 'Sân bay căn cứ phía Bắc của Vietnam Airlines.' 
  },
  { 
    id: '2', 
    iataCode: 'SGN', 
    icaoCode: 'VVTS', 
    name: 'Sân bay Quốc tế Tân Sơn Nhất', 
    country: 'Việt Nam', 
    latitude: 10.8188, 
    longitude: 106.6518, 
    schemas: ['CORSIA'], 
    zone: 'Domestic', 
    isSafEnabled: true, 
    isRefuelEuMandated: false, 
    status: 'Active', 
    description: 'Sân bay căn cứ lớn nhất phía Nam, đã thử nghiệm thành công nạp nhiên liệu SAF.' 
  },
  { 
    id: '3', 
    iataCode: 'LHR', 
    icaoCode: 'EGLL', 
    name: 'Sân bay London Heathrow', 
    country: 'Anh', 
    latitude: 51.4700, 
    longitude: -0.4543, 
    schemas: ['CORSIA', 'UK-ETS'], 
    zone: 'UK', 
    isSafEnabled: true, 
    isRefuelEuMandated: false, 
    status: 'Active', 
    description: 'Điểm đến chính tại Vương quốc Anh, bắt buộc khai báo UK-ETS và hỗ trợ nạp nhiên liệu sinh học SAF đầy đủ.' 
  },
  { 
    id: '4', 
    iataCode: 'CDG', 
    icaoCode: 'LFPG', 
    name: 'Sân bay Charles de Gaulle', 
    country: 'Pháp', 
    latitude: 49.0097, 
    longitude: 2.5479, 
    schemas: ['CORSIA', 'EU-ETS'], 
    zone: 'EEA', 
    isSafEnabled: true, 
    isRefuelEuMandated: true, 
    status: 'Active', 
    description: 'Căn cứ trung chuyển chính tại Châu Âu, áp dụng chế tài giảm phát thải EU-ETS và bắt buộc ReFuelEU.' 
  },
  { 
    id: '5', 
    iataCode: 'NRT', 
    icaoCode: 'RJAA', 
    name: 'Sân bay Quốc tế Narita', 
    country: 'Nhật Bản', 
    latitude: 35.7720, 
    longitude: 140.3929, 
    schemas: ['CORSIA'], 
    zone: 'International', 
    isSafEnabled: false, 
    isRefuelEuMandated: false, 
    status: 'Active', 
    description: 'Thị trường Đông Bắc Á trọng điểm.' 
  }
];

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ label, value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyStyle = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    let selectedText = text.substring(start, end);
    if (!selectedText) selectedText = "văn bản";

    const openTag = `<${tag}>`;
    const closeTag = `</${tag}>`;
    const newText = text.substring(0, start) + openTag + selectedText + closeTag + text.substring(end);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + selectedText.length);
    }, 50);
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="border border-gray-300 rounded-md overflow-hidden bg-white hover:shadow-md transition-shadow duration-300 focus-within:ring-1 focus-within:ring-vna-blue">
        <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-2 items-center">
          <button type="button" onClick={() => applyStyle('strong')} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer shadow-xs">B</button>
          <button type="button" onClick={() => applyStyle('em')} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs italic text-gray-700 hover:bg-gray-100 cursor-pointer shadow-xs">I</button>
          <button type="button" onClick={() => applyStyle('u')} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs underline text-gray-700 hover:bg-gray-100 cursor-pointer shadow-xs">U</button>
          <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
          <button type="button" onClick={() => applyStyle('code')} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700 hover:bg-gray-100 cursor-pointer font-mono shadow-xs">&lt;/&gt;</button>
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập ghi chú hoặc mô tả về cơ sở hạ tầng SAF của sân bay..."
          className="w-full px-3 py-2 text-sm text-black/85 focus:outline-none min-h-[140px]"
        />
      </div>
      {value && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="text-xs text-gray-700 break-words" dangerouslySetInnerHTML={{ __html: value }} />
        </div>
      )}
    </div>
  );
};

export const AirportsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [airports, setAirports] = useState<Airport[]>(MOCK_AIRPORTS);
  const [searchText, setSearchText] = useState('');
  const [formAirport, setFormAirport] = useState<Airport | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive' | 'Pending'>('ALL');

  const handleReload = () => {
    // Giả lập đồng bộ dữ liệu sân bay từ hệ thống nguồn ICAO Master Data
    const alreadyReloaded = airports.some(item => item.iataCode === 'SIN' || item.iataCode === 'BKK');
    if (alreadyReloaded) {
      alert("Hệ thống danh mục Sân bay đã được cập nhật bản ghi mới nhất từ ICAO Master Data!");
      return;
    }

    const fetchedAirports: Airport[] = [
      {
        id: '6',
        iataCode: 'SIN',
        icaoCode: 'WSSS',
        name: 'Sân bay Quốc tế Changi',
        country: 'Singapore',
        latitude: 1.3644,
        longitude: 103.9915,
        schemas: [],
        zone: 'International',
        isSafEnabled: false,
        isRefuelEuMandated: false,
        status: 'Pending', // Trạng thái Chưa thiết lập
        description: 'Sân bay trung chuyển lớn nhất khu vực Đông Nam Á.'
      },
      {
        id: '7',
        iataCode: 'BKK',
        icaoCode: 'VTBS',
        name: 'Sân bay Quốc tế Suvarnabhumi',
        country: 'Thái Lan',
        latitude: 13.6900,
        longitude: 100.7501,
        schemas: [],
        zone: 'International',
        isSafEnabled: false,
        isRefuelEuMandated: false,
        status: 'Pending', // Trạng thái Chưa thiết lập
        description: 'Đầu mối hàng không chính tại Thái Lan.'
      }
    ];

    setAirports([...airports, ...fetchedAirports]);
    alert("Đồng bộ thành công! Đã tự động cập nhật thêm 2 sân bay mới (Changi SIN, Suvarnabhumi BKK) với trạng thái 'Chưa thiết lập'.");
  };

  const handleEdit = (item: Airport) => {
    setFormAirport({ ...item });
    setViewMode('DETAIL');
  };

  const handleSave = () => {
    if (!formAirport) return;

    setAirports(airports.map(item => item.id === formAirport.id ? formAirport : item));
    setViewMode('LIST');
    setFormAirport(null);
  };

  const handleBack = () => {
    setViewMode('LIST');
    setFormAirport(null);
  };

  const filtered = airports.filter(item => {
    const matchesSearch = item.iataCode.toLowerCase().includes(searchText.toLowerCase()) || 
      item.icaoCode.toLowerCase().includes(searchText.toLowerCase()) || 
      item.name.toLowerCase().includes(searchText.toLowerCase()) || 
      item.country.toLowerCase().includes(searchText.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (viewMode === 'DETAIL' && formAirport) {
    return (
      <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
        {/* Header chi tiết */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack} className="p-2 cursor-pointer">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-vna-blue">Chi tiết sân bay: {formAirport.iataCode} ({formAirport.icaoCode})</h2>
              <p className="text-xs text-black/45">Cấu hình thông tin định danh, cơ chế pháp lý và khả năng nạp liệu SAF của sân bay</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleBack}>Hủy bỏ</Button>
            <Button variant="primary" onClick={handleSave}>Lưu thông tin</Button>
          </div>
        </div>

        {/* 50/50 Dual Column Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          
          {/* CỘT TRÁI: Định danh & Vận hành */}
          <div className="space-y-6">
            
            {/* 1. Nhóm tham số Hành chính & Định danh */}
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">1. Hành chính & Định danh (Identification)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Mã IATA" 
                  maxLength={3}
                  placeholder="Ví dụ: HAN, SGN, LHR..."
                  value={formAirport.iataCode}
                  onChange={(e) => setFormAirport({ ...formAirport, iataCode: e.target.value.toUpperCase() })}
                />
                <Input 
                  label="Mã ICAO" 
                  maxLength={4}
                  placeholder="Ví dụ: VVNB, VVTS, EGLL..."
                  value={formAirport.icaoCode}
                  onChange={(e) => setFormAirport({ ...formAirport, icaoCode: e.target.value.toUpperCase() })}
                />
              </div>

              <Input 
                label="Tên Sân bay" 
                placeholder="Nhập tên sân bay đầy đủ..."
                value={formAirport.name}
                onChange={(e) => setFormAirport({ ...formAirport, name: e.target.value })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select 
                  label="Quốc gia chủ quản"
                  value={formAirport.country}
                  onChange={(val) => setFormAirport({ ...formAirport, country: val })}
                  options={[
                    { label: 'Việt Nam', value: 'Việt Nam' },
                    { label: 'Pháp', value: 'Pháp' },
                    { label: 'Anh', value: 'Anh' },
                    { label: 'Mỹ', value: 'Mỹ' },
                    { label: 'Nhật Bản', value: 'Nhật Bản' },
                    { label: 'Singapore', value: 'Singapore' },
                    { label: 'Thái Lan', value: 'Thái Lan' }
                  ]}
                />
                
                <Select 
                  label="Trạng thái hoạt động"
                  value={formAirport.status}
                  onChange={(val) => setFormAirport({ ...formAirport, status: val as 'Active' | 'Inactive' | 'Pending' })}
                  options={[
                    { label: 'Hoạt động (Hiệu lực)', value: 'Active' },
                    { label: 'Hết hiệu lực (Ngưng hoạt động)', value: 'Inactive' },
                    { label: 'Chưa thiết lập', value: 'Pending' }
                  ]}
                />
              </div>

              {/* Tọa độ địa lý Lat/Long */}
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Vĩ độ (Latitude)" 
                  type="number"
                  step="0.0001"
                  placeholder="Ví dụ: 21.2212"
                  value={formAirport.latitude}
                  onChange={(e) => setFormAirport({ ...formAirport, latitude: parseFloat(e.target.value) || 0 })}
                />
                <Input 
                  label="Kinh độ (Longitude)" 
                  type="number"
                  step="0.0001"
                  placeholder="Ví dụ: 105.8072"
                  value={formAirport.longitude}
                  onChange={(e) => setFormAirport({ ...formAirport, longitude: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* 4. Nhóm tham số Vận hành hệ thống */}
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">4. Vận hành & Ghi chú nội bộ</h3>
              <RichTextEditor 
                label="Ghi chú kỹ thuật & Mô tả hạ tầng mặt đất" 
                value={formAirport.description || ''}
                onChange={(val) => setFormAirport({ ...formAirport, description: val })}
              />
            </div>
          </div>

          {/* CỘT PHẢI: Cơ chế pháp lý & Nhiên liệu bền vững SAF */}
          <div className="space-y-6">
            
            {/* 2. Nhóm tham số Cơ chế Pháp lý & Ngoại lệ */}
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-5 shadow-2xs">
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">2. Cơ chế Pháp lý & Ngoại lệ (Compliance)</h3>
              
              {/* Phân loại khu vực */}
              <Select 
                label="Phân loại khu vực (Airport Zone)"
                value={formAirport.zone}
                onChange={(val) => setFormAirport({ ...formAirport, zone: val as 'EEA' | 'UK' | 'Domestic' | 'International' })}
                options={[
                  { label: 'EEA (Khu vực kinh tế Châu Âu)', value: 'EEA' },
                  { label: 'UK (Vương quốc Anh)', value: 'UK' },
                  { label: 'Domestic (Nội địa Việt Nam)', value: 'Domestic' },
                  { label: 'International (Quốc tế chung)', value: 'International' }
                ]}
              />


            </div>

            {/* 3. Nhóm tham số Nhiên liệu Bền vững (SAF Parameters) */}
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-5 shadow-2xs">
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">3. Cấu hình Nhiên liệu Bền vững (SAF)</h3>
              
              {/* Khả năng cung ứng SAF */}
              <Select 
                label="Khả năng cung ứng SAF tại sân bay (SAF Availability)"
                value={formAirport.isSafEnabled ? 'yes' : 'no'}
                onChange={(val) => setFormAirport({ ...formAirport, isSafEnabled: val === 'yes' })}
                options={[
                  { label: 'Có (Sẵn sàng tra nạp SAF)', value: 'yes' },
                  { label: 'Không hỗ trợ nạp SAF', value: 'no' }
                ]}
              />

              {/* Thuộc diện bắt buộc của ReFuelEU */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Diện bắt buộc của ReFuelEU Aviation</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Quy chế bắt buộc ReFuelEU</p>
                      <strong>Mục đích:</strong> Xác định sân bay có thuộc diện bắt buộc nạp tối thiểu SAF (lượng khách &gt; 1.2M/năm hoặc hàng hóa &gt; 100,000 tấn/năm).<br/>
                      <strong>Logic hệ thống:</strong> Đưa ra cảnh báo đỏ ngay lập tức cho phòng Khai thác nếu chuyến bay khởi hành tại đây mà chưa có kế hoạch nạp SAF trong phiếu bay.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formAirport.isRefuelEuMandated ? 'yes' : 'no'}
                  onChange={(val) => setFormAirport({ ...formAirport, isRefuelEuMandated: val === 'yes' })}
                  options={[
                    { label: 'Có (Bắt buộc áp dụng ReFuelEU)', value: 'yes' },
                    { label: 'Không bắt buộc', value: 'no' }
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
          <h2 className="text-xl font-bold text-vna-blue">Danh mục Sân bay</h2>
          <p className="text-sm text-black/45 mt-1">Cấu hình mã sân bay quốc tế, áp dụng kiểm kê khí thải và năng lực nạp liệu SAF</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button onClick={handleReload} className="shadow-md cursor-pointer whitespace-nowrap self-center" variant="secondary">
            <RefreshCw size={18} /> Đồng bộ từ hệ thống nguồn
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">Bộ lọc tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm kiếm nhanh sân bay theo mã IATA, ICAO, tên hoặc quốc gia..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue text-sm h-[38px]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">Trạng thái hoạt động</label>
          <Select 
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as 'ALL' | 'Active' | 'Inactive' | 'Pending')}
            options={[
              { label: 'Tất cả trạng thái', value: 'ALL' },
              { label: 'Hoạt động (Hiệu lực)', value: 'Active' },
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
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-24">Mã IATA</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-24">Mã ICAO</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Tên Sân bay</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-32">Quốc gia</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-36">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-20 text-center rounded-tr-lg">Cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50 group transition-colors cursor-pointer" onClick={() => handleEdit(item)}>
                <td className="py-3 px-4 text-sm text-black/45 text-center">{index + 1}</td>
                <td className="py-3 px-4 text-sm font-bold text-vna-blue">{item.iataCode}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{item.icaoCode}</td>
                <td className="py-3 px-4 text-sm text-black/85 font-medium">{item.name}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{item.country}</td>
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
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                    className="p-1.5 rounded text-vna-blue hover:bg-blue-100 cursor-pointer"
                    title="Cập nhật thông tin"
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  Không tìm thấy sân bay phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
