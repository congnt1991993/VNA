import React, { useState, useMemo, useRef } from 'react';
import { Button, Select, Input } from '../components/UI';
import { Plus, Search, ArrowLeft, Edit2, Power, Info } from 'lucide-react';

interface Fuel {
  id: string;
  code: string; // Mã nhiên liệu (VD: JETA1, SAF-HEFA, SAF-ATJ) - Khóa chính mapping
  name: string; // Tên nhiên liệu (VD: Jet A-1, Nhiên liệu bền vững...)
  category: 'Fossil' | 'SAF'; // Phân loại nhiên liệu (Fossil / SAF)
  uom: 'Ton' | 'Liter' | 'Gallon'; // Đơn vị đo tiêu chuẩn (Standard UoM)
  density: number; // Hệ số quy đổi tỷ trọng (Density - Lít sang Tấn)
  emissionFactor: number; // Hệ số phát thải CO2 (tấn CO2 / tấn nhiên liệu)
  noxEmissionFactor: number; // Hệ số phát thải NOx (g/kg fuel)
  soxEmissionFactor: number; // Hệ số phát thải SOx (g/kg fuel)
  feedstock: string; // Nguồn gốc nguyên liệu (VD: UCO, Agricultural Waste)
  lifecycleEmissions: number; // Phát thải vòng đời (gCO2e/MJ)
  conversionProcess: string; // Quy trình chuyển đổi công nghệ (VD: HEFA, FT)
  allowSimulation: boolean; // Kịch bản mô phỏng (Scenario Simulation Flag)
  isActive: boolean; // Trạng thái hiệu lực
  notes?: string;
}

const MOCK_FUELS: Fuel[] = [
  { 
    id: '1', 
    code: 'JETA1', 
    name: 'Nhiên liệu phản lực hóa thạch Jet A-1', 
    category: 'Fossil',
    uom: 'Ton',
    density: 0.8, 
    emissionFactor: 3.16, 
    noxEmissionFactor: 12.5,
    soxEmissionFactor: 0.8,
    feedstock: 'Dầu thô hóa thạch (Crude Oil)',
    lifecycleEmissions: 89.0,
    conversionProcess: 'Chưng cất dầu mỏ truyền thống',
    allowSimulation: false,
    isActive: true, 
    notes: 'Nhiên liệu phản lực hóa thạch tiêu chuẩn toàn cầu áp dụng cho tất cả máy bay phản lực của VNA.' 
  },
  { 
    id: '2', 
    code: 'SAF-HEFA', 
    name: 'Nhiên liệu sinh học bền vững HEFA', 
    category: 'SAF',
    uom: 'Ton',
    density: 0.76,
    emissionFactor: 0.63, 
    noxEmissionFactor: 10.2,
    soxEmissionFactor: 0.0,
    feedstock: 'UCO (Dầu ăn đã qua sử dụng), Mỡ động vật thải',
    lifecycleEmissions: 22.0,
    conversionProcess: 'HEFA-SPK (Hydroprocessed Esters and Fatty Acids)',
    allowSimulation: true,
    isActive: true, 
    notes: 'Nhiên liệu sinh học bền vững đã được pha trộn, hệ số phát thải thực tế giảm hơn 80% so với Jet A-1 tiêu chuẩn.' 
  },
  { 
    id: '3', 
    code: 'SAF-ATJ', 
    name: 'Nhiên liệu bền vững Alcohol-to-Jet', 
    category: 'SAF',
    uom: 'Ton',
    density: 0.77,
    emissionFactor: 0.95, 
    noxEmissionFactor: 11.0,
    soxEmissionFactor: 0.0,
    feedstock: 'Sinh khối xenlulozo, Phế phẩm nông nghiệp',
    lifecycleEmissions: 32.0,
    conversionProcess: 'ATJ-SPK (Alcohol-to-Jet)',
    allowSimulation: true,
    isActive: true, 
    notes: 'Nhiên liệu sinh học sản xuất từ ethanol sinh khối, giúp tối ưu vòng đời phát thải CO2.' 
  },
  { 
    id: '4', 
    code: 'SAF-FT', 
    name: 'Nhiên liệu tổng hợp Fischer-Tropsch', 
    category: 'SAF',
    uom: 'Ton',
    density: 0.75,
    emissionFactor: 0.52, 
    noxEmissionFactor: 9.8,
    soxEmissionFactor: 0.0,
    feedstock: 'Rác thải đô thị rắn, Sinh khối gỗ rừng trồng',
    lifecycleEmissions: 18.0,
    conversionProcess: 'FT-SPK (Fischer-Tropsch Synthetic Paraffinic Kerosene)',
    allowSimulation: true,
    isActive: false, 
    notes: 'Nhiên liệu tổng hợp từ công nghệ khí hóa rác thải sinh hoạt, phục vụ kịch bản mô phỏng công nghệ tương lai.' 
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
          placeholder="Nhập ghi chú kỹ thuật hoặc tài liệu tham khảo khoa học về chỉ số phát thải..."
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

export const FuelsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [fuels, setFuels] = useState<Fuel[]>(MOCK_FUELS);
  const [searchText, setSearchText] = useState('');
  const [formFuel, setFormFuel] = useState<Fuel | null>(null);

  const handleAddNew = () => {
    setFormFuel({
      id: `NEW_${Date.now()}`,
      code: '',
      name: '',
      category: 'Fossil',
      uom: 'Ton',
      density: 0.8,
      emissionFactor: 0,
      noxEmissionFactor: 0,
      soxEmissionFactor: 0,
      feedstock: '',
      lifecycleEmissions: 0,
      conversionProcess: '',
      allowSimulation: false,
      isActive: true,
      notes: ''
    });
    setViewMode('DETAIL');
  };

  const handleEdit = (item: Fuel) => {
    setFormFuel({ ...item });
    setViewMode('DETAIL');
  };

  const toggleActive = (id: string) => {
    setFuels(fuels.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item));
  };

  const handleSave = () => {
    if (!formFuel) return;
    if (!formFuel.code.trim() || !formFuel.name.trim() || formFuel.emissionFactor < 0 || formFuel.density <= 0) {
      alert("Vui lòng nhập đầy đủ mã, tên nhiên liệu, hệ số phát thải và tỷ trọng quy đổi lớn hơn 0!");
      return;
    }

    if (formFuel.id.startsWith('NEW')) {
      const savedItem = { ...formFuel, id: Date.now().toString() };
      setFuels([...fuels, savedItem]);
    } else {
      setFuels(fuels.map(item => item.id === formFuel.id ? formFuel : item));
    }
    setViewMode('LIST');
    setFormFuel(null);
  };

  const handleBack = () => {
    setViewMode('LIST');
    setFormFuel(null);
  };

  const filtered = fuels.filter(item => 
    item.code.toLowerCase().includes(searchText.toLowerCase()) || 
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  if (viewMode === 'DETAIL' && formFuel) {
    return (
      <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack} className="p-2 cursor-pointer">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-vna-blue">
                {formFuel.id.startsWith('NEW') ? 'Thêm mới loại nhiên liệu' : `Chi tiết nhiên liệu: ${formFuel.code}`}
              </h2>
              <p className="text-xs text-black/45">Cấu hình định danh, hệ số quy đổi tỷ trọng, phát thải CO2/Non-CO2 và đặc tính bền vững SAF</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleBack}>Hủy bỏ</Button>
            <Button variant="primary" onClick={handleSave}>Lưu thông tin</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full flex-1">
          <div className="space-y-6">
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">1. Định danh & Cơ bản (Identification & Basic)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 ml-1">
                    <label className="block text-sm font-semibold text-gray-700">Mã nhiên liệu (Fuel Code)</label>
                    <div className="relative group inline-block cursor-help">
                      <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                        <p className="font-bold text-vna-gold mb-1">Mã Nhiên Liệu</p>
                        <strong>Mục đích:</strong> Nhận diện duy nhất loại nhiên liệu trong hệ thống (Ví dụ: JETA1, SAF-HEFA) để làm khóa chính.
                      </div>
                    </div>
                  </div>
                  <Input 
                    placeholder="Ví dụ: JETA1, SAF-HEFA..." 
                    value={formFuel.code}
                    onChange={(e) => setFormFuel({ ...formFuel, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 ml-1">
                    <label className="block text-sm font-semibold text-gray-700">Đơn vị đo gốc (UoM)</label>
                    <div className="relative group inline-block cursor-help">
                      <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                        <p className="font-bold text-vna-gold mb-1">Đơn vị Đo lường</p>
                        <strong>Mục đích:</strong> Chuẩn hóa đơn vị đo lưu trữ gốc trên hệ thống (Tấn, Lít, Gallon) theo chuẩn ICAO/EU ETS.
                      </div>
                    </div>
                  </div>
                  <Select 
                    value={formFuel.uom}
                    onChange={(val) => setFormFuel({ ...formFuel, uom: val as any })}
                    options={[
                      { label: 'Tấn (Ton)', value: 'Ton' },
                      { label: 'Lít (Liter)', value: 'Liter' },
                      { label: 'Gallon (Mỹ)', value: 'Gallon' }
                    ]}
                  />
                </div>
              </div>
              <Input 
                label="Tên nhiên liệu" 
                placeholder="Ví dụ: Jet A-1 hóa thạch, SAF sinh học..." 
                value={formFuel.name}
                onChange={(e) => setFormFuel({ ...formFuel, name: e.target.value })}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Phân loại nhiên liệu (Category)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Phân loại Nhiên liệu</p>
                      <strong>Mục đích:</strong> Phân chia nhóm nhiên liệu hóa thạch truyền thống (Fossil Fuel) và nhiên liệu bền vững (SAF).
                    </div>
                  </div>
                </div>
                <Select 
                  value={formFuel.category}
                  onChange={(val) => setFormFuel({ ...formFuel, category: val as any })}
                  options={[
                    { label: 'Nhiên liệu hóa thạch (Fossil Fuel)', value: 'Fossil' },
                    { label: 'Nhiên liệu hàng không bền vững (SAF)', value: 'SAF' }
                  ]}
                />
              </div>
            </div>
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">4. Vận hành & Phân tích (Operations & Analytics)</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Kịch bản mô phỏng (Scenario Simulation Flag)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Cờ Mô phỏng Kịch bản</p>
                      <strong>Mục đích:</strong> Cho phép hoặc cấm đưa nhiên liệu này vào công cụ chạy dự báo kịch bản phát thải.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formFuel.allowSimulation ? 'yes' : 'no'}
                  onChange={(val) => setFormFuel({ ...formFuel, allowSimulation: val === 'yes' })}
                  options={[
                    { label: 'Cho phép đưa vào mô phỏng (Simulation Allowed)', value: 'yes' },
                    { label: 'Không cho phép', value: 'no' }
                  ]}
                />
              </div>
              <Select 
                label="Trạng thái áp dụng"
                value={formFuel.isActive ? 'active' : 'inactive'}
                onChange={(val) => setFormFuel({ ...formFuel, isActive: val === 'active' })}
                options={[
                  { label: 'Đang áp dụng (Active)', value: 'active' },
                  { label: 'Ngừng áp dụng (Inactive)', value: 'inactive' }
                ]}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">2. Tính toán & Quy đổi (Calculations)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 ml-1">
                    <label className="block text-sm font-semibold text-gray-700">Tỷ trọng (Density Rate)</label>
                    <div className="relative group inline-block cursor-help">
                      <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                        <p className="font-bold text-vna-gold mb-1">Tỷ trọng Quy đổi</p>
                        <strong>Mục đích:</strong> Hệ số quy đổi tự động từ thể tích (Lít) sang khối lượng (Tấn nhiên liệu).
                      </div>
                    </div>
                  </div>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="Ví dụ: 0.8" 
                    value={formFuel.density}
                    onChange={(e) => setFormFuel({ ...formFuel, density: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 ml-1">
                    <label className="block text-sm font-semibold text-gray-700">Hệ số CO2 (tCO2/t)</label>
                    <div className="relative group inline-block cursor-help">
                      <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                        <p className="font-bold text-vna-gold mb-1">Hệ số Phát thải CO2</p>
                        <strong>Mục đích:</strong> Tham số quy đổi từ khối lượng nhiên liệu sang phát thải CO2.
                      </div>
                    </div>
                  </div>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="Ví dụ: 3.16" 
                    value={formFuel.emissionFactor}
                    onChange={(e) => setFormFuel({ ...formFuel, emissionFactor: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Hệ số phát thải Non-CO2 (NOx, SOx - g/kg)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Giám sát Phát thải Non-CO2</p>
                      <strong>Mục đích:</strong> Cấu hình lượng phát thải NOx, SOx phát sinh trên mỗi kg nhiên liệu.
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    type="number"
                    step="0.1"
                    label="Hệ số NOx (g/kg fuel)"
                    value={formFuel.noxEmissionFactor}
                    onChange={(e) => setFormFuel({ ...formFuel, noxEmissionFactor: parseFloat(e.target.value) || 0 })}
                  />
                  <Input 
                    type="number"
                    step="0.1"
                    label="Hệ số SOx (g/kg fuel)"
                    value={formFuel.soxEmissionFactor}
                    onChange={(e) => setFormFuel({ ...formFuel, soxEmissionFactor: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">3. Đặc tính Nhiên liệu Bền vững (SAF Attributes)</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Nguồn gốc nguyên liệu (Origin of Feedstock)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Nguồn gốc Feedstock</p>
                      <strong>Mục đích:</strong> Khai báo nguồn gốc nguyên liệu dùng để sản xuất ra loại SAF này.
                    </div>
                  </div>
                </div>
                <Input 
                  placeholder="Ví dụ: UCO (Dầu ăn thải), Rác thải nông nghiệp..." 
                  value={formFuel.feedstock}
                  onChange={(e) => setFormFuel({ ...formFuel, feedstock: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 ml-1">
                    <label className="block text-sm font-semibold text-gray-700">Phát thải vòng đời (gCO2e/MJ)</label>
                    <div className="relative group inline-block cursor-help">
                      <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                        <p className="font-bold text-vna-gold mb-1">Lifecycle Emissions</p>
                        <strong>Mục đích:</strong> Đo lường lượng phát thải carbon từ lúc sản xuất đến khi tiêu dùng của SAF.
                      </div>
                    </div>
                  </div>
                  <Input 
                    type="number"
                    step="0.1"
                    placeholder="Ví dụ: 22.0" 
                    value={formFuel.lifecycleEmissions}
                    onChange={(e) => setFormFuel({ ...formFuel, lifecycleEmissions: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 ml-1">
                    <label className="block text-sm font-semibold text-gray-700">Công nghệ sản xuất (Process)</label>
                    <div className="relative group inline-block cursor-help">
                      <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                        <p className="font-bold text-vna-gold mb-1">Công nghệ sản xuất SAF</p>
                        <strong>Mục đích:</strong> Khai báo công nghệ chuyển đổi hóa học sản xuất ra SAF (Ví dụ: HEFA, FT-SPK).
                      </div>
                    </div>
                  </div>
                  <Input 
                    placeholder="Ví dụ: HEFA-SPK, FT-SPK..." 
                    value={formFuel.conversionProcess}
                    onChange={(e) => setFormFuel({ ...formFuel, conversionProcess: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 shadow-2xs">
          <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider">5. Mô tả Pháp lý & Cơ sở Khoa học</h3>
          <RichTextEditor 
            value={formFuel.notes || ''}
            onChange={(val) => setFormFuel({ ...formFuel, notes: val })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-vna-blue">Danh mục Nhiên liệu</h2>
          <p className="text-sm text-black/45 mt-1">Cấu hình loại nhiên liệu và thiết lập tham số phát thải carbon phục vụ CORSIA, EU ETS</p>
        </div>
        <Button onClick={handleAddNew} className="shadow-md cursor-pointer">
          <Plus size={18} /> Thêm loại nhiên liệu mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">Tìm kiếm loại nhiên liệu</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm kiếm theo mã, tên loại nhiên liệu..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue text-sm"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 flex-1 min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-12 text-center rounded-tl-lg">STT</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-32">Mã nhiên liệu</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Tên loại nhiên liệu</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-36">Phân loại</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-28">Đơn vị đo</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-44">Hệ số phát thải (tấn CO2/tấn)</th>
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
                <td className="py-3 px-4 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                    item.category === 'Fossil' 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {item.category === 'Fossil' ? 'Hóa thạch' : 'SAF'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 font-medium">{item.uom === 'Ton' ? 'Tấn' : item.uom === 'Liter' ? 'Lít' : 'Gallon'}</td>
                <td className="py-3 px-4 text-sm text-gray-700 font-bold">{item.emissionFactor}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    item.isActive 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-gray-50 text-black/45 border-gray-200'
                  }`}>
                    {item.isActive ? 'Áp dụng' : 'Khóa'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                      className="p-1.5 rounded text-vna-blue hover:bg-blue-100 cursor-pointer"
                      title="Chỉnh sửa nhiên liệu"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleActive(item.id); }}
                      className={`p-1.5 rounded cursor-pointer ${item.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                      title={item.isActive ? "Ngưng áp dụng" : "Kích hoạt áp dụng"}
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
                  Không tìm thấy loại nhiên liệu phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
