import React, { useState, useMemo, useRef } from 'react';
import { Button, Select, Input } from '../components/UI';
import { Plus, Search, ArrowLeft, Edit2, Power, Info } from 'lucide-react';

interface FlightType {
  id: string;
  code: string;
  name: string;
  isCommercial: boolean;
  generalExempt: boolean;
  corsiaExempt: boolean;
  euEtsExempt: boolean;
  ukEtsExempt: boolean;
  status: 'Active' | 'Inactive';
  notes?: string;
}

const MOCK_FLIGHT_TYPES: FlightType[] = [
  { 
    id: '1', 
    code: 'REG', 
    name: 'Chuyến bay Thương mại Thường lệ', 
    isCommercial: true, 
    generalExempt: false, 
    corsiaExempt: false, 
    euEtsExempt: false, 
    ukEtsExempt: false, 
    status: 'Active', 
    notes: 'Các chuyến bay thương mại vận chuyển hành khách và hàng hóa định kỳ của Vietnam Airlines. Bắt buộc kiểm kê và báo cáo CORSIA/EU-ETS/UK-ETS đầy đủ.' 
  },
  { 
    id: '2', 
    code: 'VIP', 
    name: 'Chuyến bay Chuyên cơ / Ngoại giao', 
    isCommercial: false, 
    generalExempt: true, 
    corsiaExempt: true, 
    euEtsExempt: true, 
    ukEtsExempt: true, 
    status: 'Active', 
    notes: 'Chuyến bay chuyên chở Nguyên thủ quốc gia hoặc phái đoàn ngoại giao cấp cao cấp nhà nước. Miễn trừ bắt buộc khỏi các báo cáo phát thải trực tiếp nội địa và quốc tế.' 
  },
  { 
    id: '3', 
    code: 'AMB', 
    name: 'Chuyến bay Y tế & Cấp cứu (Ambulance)', 
    isCommercial: false, 
    generalExempt: true, 
    corsiaExempt: true, 
    euEtsExempt: true, 
    ukEtsExempt: true, 
    status: 'Active', 
    notes: 'Vận chuyển khẩn cấp bệnh nhân hoặc cơ quan nội tạng ghép tạng. Miễn trừ kiểm kê carbon theo ICAO và EU ETS.' 
  },
  { 
    id: '4', 
    code: 'TRG', 
    name: 'Chuyến bay Huấn luyện & Đào tạo', 
    isCommercial: false, 
    generalExempt: false, 
    corsiaExempt: false, 
    euEtsExempt: false, 
    ukEtsExempt: false, 
    status: 'Active', 
    notes: 'Chuyến bay phục vụ đào tạo phi công, huấn luyện bay hoặc bay thử nghiệm kỹ thuật của Hãng.' 
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
          placeholder="Nhập căn cứ pháp lý hoặc quyết định miễn trừ của ICAO / Cục Hàng không..."
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

export const FlightsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [flightTypes, setFlightTypes] = useState<FlightType[]>(MOCK_FLIGHT_TYPES);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');
  const [formFlightType, setFormFlightType] = useState<FlightType | null>(null);

  const handleAddNew = () => {
    setFormFlightType({
      id: `NEW_${Date.now()}`,
      code: '',
      name: '',
      isCommercial: true,
      generalExempt: false,
      corsiaExempt: false,
      euEtsExempt: false,
      ukEtsExempt: false,
      status: 'Active',
      notes: ''
    });
    setViewMode('DETAIL');
  };

  const handleEdit = (item: FlightType) => {
    setFormFlightType({ ...item });
    setViewMode('DETAIL');
  };

  const toggleActive = (id: string) => {
    setFlightTypes(flightTypes.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' } 
        : item
    ));
  };

  const handleSave = () => {
    if (!formFlightType) return;
    if (!formFlightType.code.trim() || !formFlightType.name.trim()) {
      alert("Vui lòng nhập mã và tên loại chuyến bay!");
      return;
    }

    if (formFlightType.id.startsWith('NEW')) {
      const savedItem = { ...formFlightType, id: Date.now().toString() };
      setFlightTypes([...flightTypes, savedItem]);
    } else {
      setFlightTypes(flightTypes.map(item => item.id === formFlightType.id ? formFlightType : item));
    }
    setViewMode('LIST');
    setFormFlightType(null);
  };

  const handleBack = () => {
    setViewMode('LIST');
    setFormFlightType(null);
  };

  const filtered = useMemo(() => {
    return flightTypes.filter(item => {
      const matchesSearch = item.code.toLowerCase().includes(searchText.toLowerCase()) || 
        item.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [flightTypes, searchText, statusFilter]);

  if (viewMode === 'DETAIL' && formFlightType) {
    return (
      <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack} className="p-2 cursor-pointer">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-vna-blue">
                {formFlightType.id.startsWith('NEW') ? 'Thêm mới loại chuyến bay' : `Cấu hình loại chuyến bay: ${formFlightType.code}`}
              </h2>
              <p className="text-xs text-black/45">Thiết lập các nhóm tham số định danh, phân loại thương mại và chính sách miễn trừ khí thải</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleBack}>Hủy bỏ</Button>
            <Button variant="primary" onClick={handleSave}>Lưu thông tin</Button>
          </div>
        </div>

        {/* 50/50 Dual Column Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
          
          {/* CỘT TRÁI: Định danh & Vận hành */}
          <div className="space-y-6">
            
            {/* CARD 1: Nhóm tham số Định danh & Phân loại */}
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                <h3 className="text-sm font-bold text-vna-blue uppercase tracking-wider">1. Nhóm tham số Định danh</h3>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">Core ID</span>
              </div>
              
              <Input 
                label="Mã loại chuyến bay" 
                placeholder="Ví dụ: REG, VIP, AMB, TRG..." 
                value={formFlightType.code}
                onChange={(e) => setFormFlightType({ ...formFlightType, code: e.target.value.toUpperCase() })}
              />
              
              <Input 
                label="Tên loại chuyến bay" 
                placeholder="Ví dụ: Chuyến bay Thương mại, Ngoại giao..." 
                value={formFlightType.name}
                onChange={(e) => setFormFlightType({ ...formFlightType, name: e.target.value })}
              />

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Tính chất thương mại</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Tính chất thương mại</p>
                      <strong>Mục đích:</strong> Phân định rõ chuyến bay có sinh doanh thu thương mại hay phục vụ hoạt động phi thương mại.<br/>
                      <strong>Logic hệ thống:</strong> Rất quan trọng để lọc, chiết xuất các báo cáo nạp/bơm nhiên liệu bền vững SAF, phân tích và chứng minh tỷ lệ đóng góp giảm phát thải theo yêu cầu các tổ chức hàng không.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formFlightType.isCommercial ? 'commercial' : 'non-commercial'}
                  onChange={(val) => setFormFlightType({ ...formFlightType, isCommercial: val === 'commercial' })}
                  options={[
                    { label: 'Thương mại (Commercial)', value: 'commercial' },
                    { label: 'Phi thương mại (Non-Commercial)', value: 'non-commercial' }
                  ]}
                />
              </div>
            </div>

            {/* CARD 2: Nhóm tham số Vận hành */}
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                <h3 className="text-sm font-bold text-vna-blue uppercase tracking-wider">3. Nhóm tham số Vận hành</h3>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full">System</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Trạng thái hệ thống</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Trạng thái áp dụng</p>
                      <strong>Mục đích:</strong> Cho phép Mở (Active) hoặc Khóa (Inactive) loại chuyến bay này trên hệ thống.<br/>
                      <strong>Logic hệ thống:</strong> Loại chuyến bay bị khóa (Inactive) sẽ không thể sử dụng để gán cho các chuyến bay mới nhập liệu hoặc lập kế hoạch khai thác.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formFlightType.status}
                  onChange={(val) => setFormFlightType({ ...formFlightType, status: val as 'Active' | 'Inactive' })}
                  options={[
                    { label: 'Hoạt động (Active)', value: 'Active' },
                    { label: 'Ngưng hoạt động (Inactive)', value: 'Inactive' }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Miễn trừ phát thải */}
          <div className="space-y-6">
            
            {/* CARD 3: Nhóm tham số Miễn trừ phát thải */}
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                <h3 className="text-sm font-bold text-vna-blue uppercase tracking-wider">2. Miễn trừ phát thải</h3>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full">Exemptions</span>
              </div>

              {/* Cờ miễn trừ chung */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Cờ miễn trừ chung (General Exemption)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Miễn trừ chung</p>
                      <strong>Mục đích:</strong> Tự động loại trừ các chuyến chuyên cơ VIP, cứu thương (AMB), nhân đạo, tìm kiếm cứu nạn... khỏi báo cáo phát thải trực tiếp nội địa.<br/>
                      <strong>Logic hệ thống:</strong> Hệ thống tự động bỏ qua lượng phát thải tiêu thụ của các chuyến bay mang cờ này khỏi báo cáo ESG quốc nội.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formFlightType.generalExempt ? 'yes' : 'no'}
                  onChange={(val) => setFormFlightType({ ...formFlightType, generalExempt: val === 'yes' })}
                  options={[
                    { label: 'Có miễn trừ chung (True)', value: 'yes' },
                    { label: 'Không miễn trừ chung (False)', value: 'no' }
                  ]}
                />
              </div>

              {/* Cờ miễn trừ CORSIA */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Miễn trừ chương trình CORSIA</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Miễn trừ CORSIA</p>
                      <strong>Mục đích:</strong> Cho phép thiết lập miễn trừ riêng biệt theo luật CORSIA của ICAO.<br/>
                      <strong>Logic hệ thống:</strong> Loại bỏ chuyến bay khỏi nghĩa vụ thống kê và mua tín chỉ bù phát thải Carbon CORSIA quốc tế.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formFlightType.corsiaExempt ? 'yes' : 'no'}
                  onChange={(val) => setFormFlightType({ ...formFlightType, corsiaExempt: val === 'yes' })}
                  options={[
                    { label: 'Miễn trừ CORSIA (True)', value: 'yes' },
                    { label: 'Bắt buộc báo cáo CORSIA (False)', value: 'no' }
                  ]}
                />
              </div>

              {/* Cờ miễn trừ EU ETS */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Miễn trừ chương trình EU ETS</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Miễn trừ EU ETS</p>
                      <strong>Mục đích:</strong> Thiết lập miễn trừ riêng biệt theo luật giảm phát thải của Châu Âu (EU ETS).<br/>
                      <strong>Logic hệ thống:</strong> Bỏ qua các chặng bay có liên quan tới không phận Châu Âu khi lập báo cáo nộp hạn ngạch phát thải.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formFlightType.euEtsExempt ? 'yes' : 'no'}
                  onChange={(val) => setFormFlightType({ ...formFlightType, euEtsExempt: val === 'yes' })}
                  options={[
                    { label: 'Miễn trừ EU ETS (True)', value: 'yes' },
                    { label: 'Bắt buộc báo cáo EU ETS (False)', value: 'no' }
                  ]}
                />
              </div>

              {/* Cờ miễn trừ UK ETS */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Miễn trừ chương trình UK ETS</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Miễn trừ UK ETS</p>
                      <strong>Mục đích:</strong> Thiết lập miễn trừ riêng biệt theo luật giảm phát thải Vương quốc Anh (UK ETS).<br/>
                      <strong>Logic hệ thống:</strong> Bỏ qua chặng bay liên quan tới không phận UK khi tính nghĩa vụ báo cáo phát thải.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formFlightType.ukEtsExempt ? 'yes' : 'no'}
                  onChange={(val) => setFormFlightType({ ...formFlightType, ukEtsExempt: val === 'yes' })}
                  options={[
                    { label: 'Miễn trừ UK ETS (True)', value: 'yes' },
                    { label: 'Bắt buộc báo cáo UK ETS (False)', value: 'no' }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CARD: Căn cứ Pháp lý */}
        <div className="w-full mt-6 flex-1 flex flex-col">
          <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 flex flex-col h-full shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-sm font-bold text-vna-blue uppercase tracking-wider">4. Căn cứ Pháp lý & Ghi chú nội bộ</h3>
              <span className="px-2 py-0.5 bg-gray-100 text-black/85 text-[10px] font-bold rounded-full">Legal Basis</span>
            </div>
            <div className="flex-1 flex flex-col">
              <RichTextEditor 
                value={formFlightType.notes || ''}
                onChange={(val) => setFormFlightType({ ...formFlightType, notes: val })}
              />
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
          <h2 className="text-xl font-bold text-vna-blue">Danh mục Loại chuyến bay</h2>
          <p className="text-sm text-black/45 mt-1">Cấu hình loại hình chặng bay và thiết lập chính sách miễn trừ thuế carbon theo quy chuẩn quốc tế</p>
        </div>
        <Button onClick={handleAddNew} className="shadow-md cursor-pointer">
          <Plus size={18} /> Thêm loại chuyến bay mới
        </Button>
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
              placeholder="Tìm kiếm nhanh loại chuyến bay theo mã, tên loại..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue text-sm h-[38px]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">Trạng thái hoạt động</label>
          <Select 
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as 'ALL' | 'Active' | 'Inactive')}
            options={[
              { label: 'Tất cả trạng thái', value: 'ALL' },
              { label: 'Hoạt động (Hiệu lực)', value: 'Active' },
              { label: 'Ngưng hoạt động (Hết hiệu lực)', value: 'Inactive' }
            ]}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 flex-1 min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-12 text-center rounded-tl-lg">STT</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-28">Mã loại</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Tên loại chuyến bay</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-36">Vận hành</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-36 text-center">Miễn trừ chung</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-48">Miễn trừ chương trình</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-36">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-28 text-center rounded-tr-lg">Chức năng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50 group transition-colors cursor-pointer" onClick={() => handleEdit(item)}>
                <td className="py-3 px-4 text-sm text-black/45 text-center">{index + 1}</td>
                <td className="py-3 px-4 text-sm font-bold text-vna-blue">{item.code}</td>
                <td className="py-3 px-4 text-sm text-black/85 font-medium">{item.name}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                    item.isCommercial 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200 shadow-3xs'
                  }`}>
                    {item.isCommercial ? 'Thương mại' : 'Phi thương mại'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                    item.generalExempt 
                      ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-3xs' 
                      : 'bg-gray-50 text-black/45 border-gray-200'
                  }`}>
                    {item.generalExempt ? 'Miễn trừ' : 'Không miễn'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {item.corsiaExempt && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-150 whitespace-nowrap">CORSIA</span>}
                    {item.euEtsExempt && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-150 whitespace-nowrap">EU ETS</span>}
                    {item.ukEtsExempt && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-150 whitespace-nowrap">UK ETS</span>}
                    {!item.corsiaExempt && !item.euEtsExempt && !item.ukEtsExempt && <span className="text-gray-400 text-xs">-</span>}
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    item.status === 'Active' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-gray-50 text-black/45 border-gray-200'
                  }`}>
                    {item.status === 'Active' ? 'Hoạt động' : 'Ngưng hoạt động'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-1.5 rounded text-vna-blue hover:bg-blue-100 cursor-pointer"
                      title="Chỉnh sửa loại chuyến bay"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => toggleActive(item.id)}
                      className={`p-1.5 rounded cursor-pointer ${item.status === 'Active' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                      title={item.status === 'Active' ? "Ngưng áp dụng" : "Kích hoạt áp dụng"}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  Không tìm thấy loại chuyến bay phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
