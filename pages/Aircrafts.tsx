import React, { useState, useMemo, useRef } from 'react';
import { Button, Select, Input } from '../components/UI';
import { Plus, Search, ArrowLeft, Edit2, Power, Info } from 'lucide-react';

interface Aircraft {
  id: string;
  tailNumber: string; // Số đăng ký tàu bay (e.g., VN-A886) - Khóa chính tham chiếu
  typeCode: string; // Loại tàu bay (e.g., A350, B787, A321)
  bodyType: 'Narrow-body' | 'Wide-body'; // Phân loại thân tàu
  engineModel: string; // Cấu hình động cơ (e.g., General Electric GEnx-1B)
  fuelFlow: number; // Mức tiêu thụ nhiên liệu (Tấn/Giờ)
  noiseLevel: 'Chapter 3' | 'Chapter 4' | 'Chapter 14'; // Tiêu chuẩn tiếng ồn ICAO (Airline E-1)
  waterStandard: string; // Định mức tiêu thụ nước sạch tiêu chuẩn (GRI 303-3)
  status: 'Active' | 'Inactive' | 'Maintenance'; // Tình trạng khai thác (TIMS)
  effectiveDate: string; // Ngày bắt đầu khai thác
  expiryDate: string; // Ngày kết thúc khai thác
  notes?: string;
}

const MOCK_AIRCRAFTS: Aircraft[] = [
  { 
    id: '1', 
    tailNumber: 'VN-A886', 
    typeCode: 'B787-9', 
    bodyType: 'Wide-body',
    engineModel: 'General Electric GEnx-1B', 
    fuelFlow: 5.4, 
    noiseLevel: 'Chapter 14',
    waterStandard: 'Tiêu chuẩn GOM B787 (0.15 m3)',
    status: 'Active',
    effectiveDate: '2015-08-01',
    expiryDate: '2030-12-31',
    notes: 'Dòng tàu bay thân rộng hiện đại, khai thác các chặng bay đường dài Hà Nội/TP.HCM đi Châu Âu, Úc, Mỹ.' 
  },
  { 
    id: '2', 
    tailNumber: 'VN-A898', 
    typeCode: 'A350-900', 
    bodyType: 'Wide-body',
    engineModel: 'Rolls-Royce Trent XWB', 
    fuelFlow: 5.8, 
    noiseLevel: 'Chapter 14',
    waterStandard: 'Tiêu chuẩn GOM A350 (0.18 m3)',
    status: 'Active',
    effectiveDate: '2016-03-15',
    expiryDate: '2032-12-31',
    notes: 'Dòng tàu bay thân rộng hiệu suất cao phục vụ chặng bay quốc tế chặng dài và chặng nội địa cao điểm.' 
  },
  { 
    id: '3', 
    tailNumber: 'VN-A612', 
    typeCode: 'A321-200Neo', 
    bodyType: 'Narrow-body',
    engineModel: 'Pratt & Whitney PW1100G-JM', 
    fuelFlow: 2.4, 
    noiseLevel: 'Chapter 4',
    waterStandard: 'Tiêu chuẩn GOM A321 (0.08 m3)',
    status: 'Active',
    effectiveDate: '2018-11-20',
    expiryDate: '2028-11-20',
    notes: 'Tàu bay thân hẹp chủ lực khai thác các đường bay quốc nội và khu vực Đông Nam Á.' 
  },
  { 
    id: '4', 
    tailNumber: 'VN-A504', 
    typeCode: 'ATR72-600', 
    bodyType: 'Narrow-body',
    engineModel: 'Pratt & Whitney Canada PW127M', 
    fuelFlow: 0.7, 
    noiseLevel: 'Chapter 3',
    waterStandard: 'Tiêu chuẩn ATR72 (0.03 m3)',
    status: 'Maintenance',
    effectiveDate: '2010-05-10',
    expiryDate: '2026-05-10',
    notes: 'Dòng tàu bay cánh quạt phục vụ các chặng bay ngắn nội địa như Côn Đảo, Điện Biên.' 
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
          placeholder="Nhập ghi chú kỹ thuật hoặc đặc tính tiêu thụ nhiên liệu..."
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

export const AircraftsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [aircrafts, setAircrafts] = useState<Aircraft[]>(MOCK_AIRCRAFTS);
  const [searchText, setSearchText] = useState('');
  const [formAircraft, setFormAircraft] = useState<Aircraft | null>(null);

  const handleAddNew = () => {
    setFormAircraft({
      id: `NEW_${Date.now()}`,
      tailNumber: '',
      typeCode: '',
      bodyType: 'Narrow-body',
      engineModel: '',
      fuelFlow: 0,
      noiseLevel: 'Chapter 14',
      waterStandard: '',
      status: 'Active',
      effectiveDate: '',
      expiryDate: '',
      notes: ''
    });
    setViewMode('DETAIL');
  };

  const handleEdit = (item: Aircraft) => {
    setFormAircraft({ ...item });
    setViewMode('DETAIL');
  };

  const toggleActive = (id: string) => {
    setAircrafts(aircrafts.map(item => {
      if (item.id === id) {
        const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const handleSave = () => {
    if (!formAircraft) return;
    if (!formAircraft.tailNumber.trim() || !formAircraft.typeCode.trim() || !formAircraft.engineModel.trim() || formAircraft.fuelFlow <= 0) {
      alert("Vui lòng nhập đầy đủ Số đăng ký, Loại tàu bay, Thông tin động cơ và Mức tiêu thụ nhiên liệu lớn hơn 0!");
      return;
    }

    if (formAircraft.id.startsWith('NEW')) {
      const savedItem = { ...formAircraft, id: Date.now().toString() };
      setAircrafts([...aircrafts, savedItem]);
    } else {
      setAircrafts(aircrafts.map(item => item.id === formAircraft.id ? formAircraft : item));
    }
    setViewMode('LIST');
    setFormAircraft(null);
  };

  const handleBack = () => {
    setViewMode('LIST');
    setFormAircraft(null);
  };

  const filtered = aircrafts.filter(item => 
    item.tailNumber.toLowerCase().includes(searchText.toLowerCase()) ||
    item.typeCode.toLowerCase().includes(searchText.toLowerCase()) || 
    item.engineModel.toLowerCase().includes(searchText.toLowerCase())
  );

  if (viewMode === 'DETAIL' && formAircraft) {
    return (
      <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack} className="p-2 cursor-pointer">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-vna-blue">
                {formAircraft.id.startsWith('NEW') ? 'Thêm mới tàu bay' : `Chi tiết tàu bay: ${formAircraft.tailNumber}`}
              </h2>
              <p className="text-xs text-black/45">Cấu hình định danh, kỹ thuật, chỉ tiêu môi trường và trạng thái hoạt động</p>
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
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">1. Định danh & Phân loại (Identification)</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Số đăng ký tàu bay (Tail Number)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Định danh Tàu bay</p>
                      <strong>Mục đích:</strong> Nhận diện duy nhất mỗi tàu bay cụ thể trong đội bay (Ví dụ: VN-A886) để làm khóa tham chiếu chính.<br/>
                      <strong>Logic hệ thống:</strong> Sử dụng để liên kết trực tiếp với dữ liệu lịch sử bay từ FIMS, Flight Ops và Revera, đảm bảo tính nhất quán của lượng nhiên liệu tiêu thụ và số chặng khai thác.
                    </div>
                  </div>
                </div>
                <Input 
                  placeholder="Ví dụ: VN-A886..." 
                  value={formAircraft.tailNumber}
                  onChange={(e) => setFormAircraft({ ...formAircraft, tailNumber: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Loại tàu bay (Aircraft Type/Sub-type)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Phân loại Dòng Máy Bay</p>
                      <strong>Mục đích:</strong> Xác định dòng tàu bay cụ thể (Ví dụ: A350, B787, A321) để phân nhóm báo cáo.<br/>
                      <strong>Logic hệ thống:</strong> Sử dụng làm tham số phân nhóm khi xuất các báo cáo phát thải tổng hợp và tự động tính toán các chỉ số định mức trung bình theo từng dòng máy bay.
                    </div>
                  </div>
                </div>
                <Input 
                  placeholder="Ví dụ: A350, B787, A321..." 
                  value={formAircraft.typeCode}
                  onChange={(e) => setFormAircraft({ ...formAircraft, typeCode: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Phân loại thân tàu (Body Type)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Cấu trúc Thân Tàu</p>
                      <strong>Mục đích:</strong> Phân loại cấu trúc thiết kế của thân tàu bay (Thân hẹp hoặc Thân rộng).<br/>
                      <strong>Logic hệ thống:</strong> Sử dụng để áp dụng các hệ số phát thải và định mức tiêu hao năng lượng đặc thù cho từng nhóm kích thước đội tàu bay trong các thuật toán phân tích và biểu đồ thống kê ESG.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formAircraft.bodyType}
                  onChange={(val) => setFormAircraft({ ...formAircraft, bodyType: val as any })}
                  options={[
                    { label: 'Thân hẹp (Narrow-body)', value: 'Narrow-body' },
                    { label: 'Thân rộng (Wide-body)', value: 'Wide-body' }
                  ]}
                />
              </div>
            </div>
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">4. Trạng thái Hệ thống (System Status)</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Tình trạng khai thác (TIMS Status)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Tình trạng Vận hành</p>
                      <strong>Mục đích:</strong> Xác định trạng thái vận hành thực tế của tàu bay được đồng bộ với hệ thống TIMS.<br/>
                      <strong>Logic hệ thống:</strong> Đảm bảo hệ thống chỉ đưa các tàu bay ở trạng thái Active vào các báo cáo tính toán phát thải, đối chiếu dữ liệu hoặc các kịch bản dự báo Net Zero.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formAircraft.status}
                  onChange={(val) => setFormAircraft({ ...formAircraft, status: val as any })}
                  options={[
                    { label: 'Hoạt động (Active)', value: 'Active' },
                    { label: 'Ngừng hoạt động (Inactive)', value: 'Inactive' },
                    { label: 'Đang bảo dưỡng (In Maintenance)', value: 'Maintenance' }
                  ]}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Thời gian khai thác (Effective/Expiry Date)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Vòng đời dữ liệu tàu bay</p>
                      <strong>Mục đích:</strong> Quản lý mốc thời gian bắt đầu và kết thúc vòng đời khai thác của máy bay trong đội tàu.<br/>
                      <strong>Logic hệ thống:</strong> Giúp các báo cáo phát thải lịch sử trong các kỳ kế toán quá khứ luôn chính xác, không bị ảnh hưởng số liệu ngay cả khi tàu bay này đã ngừng khai thác hoặc chuyển nhượng ở hiện tại.
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    type="date"
                    label="Ngày bắt đầu (Effective)"
                    value={formAircraft.effectiveDate}
                    onChange={(e) => setFormAircraft({ ...formAircraft, effectiveDate: e.target.value })}
                  />
                  <Input 
                    type="date"
                    label="Ngày kết thúc (Expiry)"
                    value={formAircraft.expiryDate}
                    onChange={(e) => setFormAircraft({ ...formAircraft, expiryDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">2. Kỹ thuật & Khai thác (Technical & Operations)</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Cấu hình động cơ (Engine Type)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Cấu hình động cơ</p>
                      <strong>Mục đích:</strong> Thiết lập chi tiết mã động cơ của tàu bay để phục vụ giám sát khí thải đặc thù.<br/>
                      <strong>Logic hệ thống:</strong> Dùng để tính toán chính xác mức độ đốt nhiên liệu lý thuyết và phục vụ việc mở rộng giám sát lượng phát thải khí Non-CO2 (NOx, SOx) theo quy định của EU áp dụng từ năm 2025.
                    </div>
                  </div>
                </div>
                <Input 
                  placeholder="Ví dụ: Rolls-Royce Trent XWB, GEnx-1B..." 
                  value={formAircraft.engineModel}
                  onChange={(e) => setFormAircraft({ ...formAircraft, engineModel: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Mức tiêu thụ nhiên liệu (Fuel Consumption Rate - Tấn/Giờ)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Định mức tiêu hao nhiên liệu</p>
                      <strong>Mục đích:</strong> Thiết lập định mức lượng tiêu thụ nhiên liệu trung bình theo thiết kế của tàu.<br/>
                      <strong>Logic hệ thống:</strong> Dùng làm cơ sở đối chiếu, phát hiện sai lệch bất thường với lượng tiêu hao thực tế nhận về từ hệ thống FIMS, hoặc tự động điền khi chuyến bay bị thiếu dữ liệu thực tế.
                    </div>
                  </div>
                </div>
                <Input 
                  type="number"
                  step="0.1"
                  placeholder="Ví dụ: 5.4, 2.4..." 
                  value={formAircraft.fuelFlow || ''}
                  onChange={(e) => setFormAircraft({ ...formAircraft, fuelFlow: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-2 uppercase tracking-wider">3. Môi trường & Tiêu chuẩn ESG (ESG Compliance)</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Chứng nhận Tiếng ồn ICAO (Annex 16)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Chứng nhận Tiếng ồn</p>
                      <strong>Mục đích:</strong> Đánh dấu cấp chứng nhận tiếng ồn đáp ứng của tàu bay theo tiêu chuẩn của ICAO (Annex 16, Volume I).<br/>
                      <strong>Logic hệ thống:</strong> Tự động tính toán tỷ lệ phần trăm (%) đội tàu bay hoạt động đáp ứng các giới hạn tiêu chuẩn tiếng ồn nghiêm ngặt, trực tiếp phục vụ cho việc xuất chỉ tiêu Airline E-1.
                    </div>
                  </div>
                </div>
                <Select 
                  value={formAircraft.noiseLevel}
                  onChange={(val) => setFormAircraft({ ...formAircraft, noiseLevel: val as any })}
                  options={[
                    { label: 'ICAO Annex 16 - Chapter 3', value: 'Chapter 3' },
                    { label: 'ICAO Annex 16 - Chapter 4', value: 'Chapter 4' },
                    { label: 'ICAO Annex 16 - Chapter 14 (Cao nhất)', value: 'Chapter 14' }
                  ]}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Định mức tiêu thụ nước tiêu chuẩn (Water Standard)</label>
                  <div className="relative group inline-block cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-vna-blue" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal normal-case animate-in fade-in zoom-in-95 duration-100">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d1525]/95"></div>
                      <p className="font-bold text-vna-gold mb-1">Định mức Nước sạch</p>
                      <strong>Mục đích:</strong> Cấu hình định mức cấp nước sạch lý thuyết tiêu chuẩn cho dòng máy bay (Ví dụ: GOM standard áp dụng cho A321).<br/>
                      <strong>Logic hệ thống:</strong> Phục vụ tính toán tự động lượng nước sạch cấp lên và tiêu dùng trên các chuyến bay khi hệ thống bị thiếu dữ liệu thực tế, trực tiếp đáp ứng yêu cầu đo đạc của chỉ tiêu GRI 303-3.
                    </div>
                  </div>
                </div>
                <Input 
                  placeholder="Ví dụ: Tiêu chuẩn GOM A321 (0.08 m3)..." 
                  value={formAircraft.waterStandard}
                  onChange={(e) => setFormAircraft({ ...formAircraft, waterStandard: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50/50 p-5 rounded-lg border border-gray-200/80 shadow-2xs">
          <h3 className="text-sm font-bold text-vna-blue border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider">5. Đặc tính Kỹ thuật & Ghi chú nội bộ</h3>
          <RichTextEditor 
            value={formAircraft.notes || ''}
            onChange={(val) => setFormAircraft({ ...formAircraft, notes: val })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-vna-blue">Danh mục Máy bay</h2>
          <p className="text-sm text-black/45 mt-1">Cấu hình định mức động cơ và chỉ số tiêu hao nhiên liệu trung bình phục vụ dự báo kịch bản khí thải</p>
        </div>
        <Button onClick={handleAddNew} className="shadow-md cursor-pointer">
          <Plus size={18} /> Thêm dòng máy bay mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">Tìm kiếm loại máy bay</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm kiếm theo số đăng ký, dòng máy bay, động cơ..." 
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
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-32">Số đăng ký</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-44">Loại máy bay</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Thông tin động cơ máy bay</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-44">Định mức tiêu thụ (Tấn/Giờ)</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-40">Chứng nhận Tiếng ồn</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-36">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-28 text-center rounded-tr-lg">Chức năng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50 group transition-colors cursor-pointer" onClick={() => handleEdit(item)}>
                <td className="py-3 px-4 text-sm text-black/45 text-center">{index + 1}</td>
                <td className="py-3 px-4 text-sm font-bold text-vna-blue">{item.tailNumber}</td>
                <td className="py-3 px-4 text-sm text-black/85 font-semibold">
                  <div>
                    <span className="block">{item.typeCode}</span>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border mt-1 ${
                      item.bodyType === 'Wide-body' 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-blue-50 text-vna-blue border-blue-200'
                    }`}>
                      {item.bodyType === 'Wide-body' ? 'Thân rộng' : 'Thân hẹp'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 font-medium">{item.engineModel}</td>
                <td className="py-3 px-4 text-sm text-gray-700 font-bold">{item.fuelFlow} Tấn/Giờ</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {item.noiseLevel}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap inline-block ${
                    item.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                    item.status === 'Inactive' ? 'bg-gray-50 text-black/45 border-gray-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {item.status === 'Active' ? 'Hoạt động' : item.status === 'Inactive' ? 'Hết hiệu lực' : 'Đang bảo dưỡng'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                      className="p-1.5 rounded text-vna-blue hover:bg-blue-100 cursor-pointer"
                      title="Chỉnh sửa dòng máy bay"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleActive(item.id); }}
                      className={`p-1.5 rounded cursor-pointer ${item.status === 'Active' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                      title={item.status === 'Active' ? "Ngưng hoạt động" : "Kích hoạt hoạt động"}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  Không tìm thấy dòng máy bay phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
