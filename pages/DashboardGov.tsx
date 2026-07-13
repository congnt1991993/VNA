import React, { useState } from 'react';
import { Card, Select, Toast, Button } from '../components/UI';
import { 
  Scale, 
  FileCheck, 
  Building2, 
  AlertTriangle, 
  Download, 
  Info, 
  CheckCircle, 
  Shield, 
  ShieldAlert, 
  Award, 
  Handshake, 
  Users, 
  Landmark, 
  HelpCircle, 
  FileText 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  Tooltip
} from 'recharts';

const BOARD_DATA = [
  { name: 'Thành viên độc lập', value: 3 },
  { name: 'Thành viên điều hành', value: 2 },
  { name: 'Thành viên không điều hành', value: 4 },
];

const COMPLIANCE_DATA = [
  { subject: 'Chống tham nhũng', A: 100, fullMark: 100 },
  { subject: 'Bảo mật dữ liệu', A: 98, fullMark: 100 },
  { subject: 'An toàn bay', A: 100, fullMark: 100 },
  { subject: 'Đạo đức kinh doanh', A: 100, fullMark: 100 },
  { subject: 'Cạnh tranh công bằng', A: 100, fullMark: 100 },
];

const COLORS = ['#005F6E', '#E6B441', '#94a3b8'];

export const DashboardGovPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setToast({ message: `Đã tải dữ liệu năm ${e.target.value}`, type: 'success' });
  };

  const tabs = [
    { id: 'overview', label: '1. TỔNG QUAN QUẢN TRỊ' },
    { id: 'governance-structure', label: '2. CƠ CẤU & ỦY QUYỀN HĐQT' },
    { id: 'compliance-ethics', label: '3. ĐẠO ĐỨC & TUÂN THỦ' },
    { id: 'government-relations', label: '4. HỖ TRỢ CHÍNH PHỦ' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* VNA Brand Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg border border-gray-150 shadow-xs relative overflow-hidden">
        {/* Subtle Asian Lattice Background overlay */}
        <div className="absolute inset-0 opacity-3 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(#E6B441 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-vna-blue/10 text-vna-blue text-[10px] font-bold px-2 py-0.5 rounded border border-vna-blue/20 tracking-wider uppercase">Tổ Thư Ký HĐQT</span>
            <span className="bg-vna-gold/10 text-[#a37c1d] text-[10px] font-bold px-2 py-0.5 rounded border border-vna-gold/20 tracking-wider uppercase">Chuẩn GRI & IATA</span>
          </div>
          <h1 className="text-2xl font-bold text-vna-blue">Cổng Công Bố Quản Trị ESG</h1>
          <p className="text-black/45 text-sm mt-1">Theo dõi, phê duyệt và thuyết minh các chỉ số Quản trị (G) & Tuân thủ (Compliance) của hãng hàng không quốc gia.</p>
        </div>
        <div className="flex gap-3 relative z-10 shrink-0 self-stretch md:self-auto">
          <Select 
            options={[{label: 'Năm 2026', value: '2026'}, {label: 'Năm 2025', value: '2025'}]} 
            value="2026" 
            className="w-36" 
            onChange={handleYearChange} 
          />
          <Button variant="outline" onClick={() => setToast({ message: 'Đang chuẩn bị xuất báo cáo ESG Quản trị...', type: 'info' })}>
            <Download size={16} />
            Xuất file thuyết minh
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-250 bg-white px-4 rounded-lg shadow-2xs border">
        <nav className="-mb-px flex flex-wrap gap-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-all cursor-pointer
                ${activeTab === tab.id
                  ? 'border-vna-blue text-vna-blue'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ==================== TAB 1: TỔNG QUAN ==================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 flex items-center gap-4 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Building2 size={22} />
              </div>
              <div>
                <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider">Cơ cấu HĐQT độc lập</p>
                <h3 className="text-xl font-black text-black/85">33,3% <span className="text-xs font-normal text-gray-400">(3/9 TV)</span></h3>
                <span className="text-[10px] text-purple-600 font-semibold block mt-0.5">Tách biệt hoàn toàn CEO</span>
              </div>
            </Card>
            
            <Card className="p-5 flex items-center gap-4 border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100">
                <FileCheck size={22} />
              </div>
              <div>
                <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider">Tuân thủ Đạo đức & Cạnh tranh</p>
                <h3 className="text-xl font-black text-black/85">100% Đạt</h3>
                <span className="text-[10px] text-green-600 font-semibold block mt-0.5">0 vụ việc vi phạm luật</span>
              </div>
            </Card>
            
            <Card className="p-5 flex items-center gap-4 border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0 border border-yellow-100">
                <Scale size={22} />
              </div>
              <div>
                <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider">Chống tham nhũng & Hối lộ</p>
                <h3 className="text-xl font-black text-black/85">0 ca <span className="text-xs font-normal text-gray-400">(Trong kỳ)</span></h3>
                <span className="text-[10px] text-yellow-600 font-semibold block mt-0.5">100% cán bộ ký cam kết</span>
              </div>
            </Card>
            
            <Card className="p-5 flex items-center gap-4 border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <ShieldAlert size={22} />
              </div>
              <div>
                <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider">Đóng góp chính trị</p>
                <h3 className="text-xl font-black text-black/85">0 VND</h3>
                <span className="text-[10px] text-red-600 font-semibold block mt-0.5">Tuyệt đối trung lập chính trị</span>
              </div>
            </Card>
          </div>

          {/* Recharts Visualizations & Key Commitments Bento Block */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Board composition donut chart */}
            <Card title="Cơ cấu phân bổ Hội đồng Quản trị VNA" className="lg:col-span-1 border border-gray-200">
              <div className="h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={BOARD_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      fill="#8884d8"
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {BOARD_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] text-center font-medium">
                <div>
                  <span className="w-2.5 h-2.5 inline-block rounded-full bg-[#005F6E] mr-1.5 align-middle"></span>
                  <span className="text-gray-600 block sm:inline">Độc lập: 3 TV</span>
                </div>
                <div>
                  <span className="w-2.5 h-2.5 inline-block rounded-full bg-[#E6B441] mr-1.5 align-middle"></span>
                  <span className="text-gray-600 block sm:inline">Điều hành: 2 TV</span>
                </div>
                <div>
                  <span className="w-2.5 h-2.5 inline-block rounded-full bg-[#94a3b8] mr-1.5 align-middle"></span>
                  <span className="text-gray-600 block sm:inline">Phi điều hành: 4 TV</span>
                </div>
              </div>
            </Card>

            {/* Radar chart for compliance */}
            <Card title="Chỉ số Đánh giá Tuân thủ ESG (%)" className="lg:col-span-1 border border-gray-200">
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={COMPLIANCE_DATA}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#425466', fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <Radar name="Mức độ tuân thủ" dataKey="A" stroke="#005F6E" fill="#005F6E" fillOpacity={0.4} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Key commitments summary box (VNA Creme Style) */}
            <div className="lg:col-span-1 bg-[#FAFAEB] rounded-lg border border-amber-200/60 p-5 flex flex-col justify-between shadow-2xs">
              <div>
                <h4 className="text-sm font-bold text-vna-blue mb-3 flex items-center border-b border-amber-250/50 pb-2">
                  <Award size={18} className="text-vna-gold mr-2" />
                  MỤC TIÊU & CAM KẾT HĐQT
                </h4>
                <ul className="space-y-3 text-xs text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Tuyệt đối liêm chính:</strong> Tiếp tục duy trì thành tích 0 ca tham nhũng, hối lộ trong vận hành bay toàn cầu.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Ủy quyền hiệu quả:</strong> Định kỳ giám sát tiến độ thực thi ESG 3 tháng/lần của Ban Chỉ đạo.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Công bằng & Dân chủ:</strong> 100% người lao động trực tiếp tham gia thảo luận bảo hộ lao động và OHS.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-250/50 flex justify-between items-center text-[10px] text-black/45 font-bold tracking-wide">
                <span>PHÊ DUYỆT BỞI: VĂN PHÒNG HĐQT</span>
                <span className="text-vna-blue">KỲ THỰC HIỆN: T4/2026</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== TAB 2: CƠ CẤU & ỦY QUYỀN HĐQT ==================== */}
      {activeTab === 'governance-structure' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
          <div className="p-4 bg-[#FAFAEB] rounded-lg border border-amber-200/50 text-xs text-gray-700 leading-relaxed flex items-start gap-3 shadow-2xs">
            <Info size={16} className="text-vna-gold shrink-0 mt-0.5" />
            <div>
              <strong className="text-vna-blue text-sm block mb-0.5">Định hướng công bố thông tin:</strong>
              Các chỉ tiêu dưới đây được biên soạn chi tiết và chuẩn mực nhằm khẳng định cấu trúc quản trị độc lập, chuyên nghiệp và có sự giám sát chặt chẽ của HĐQT VNA đối với mọi vấn đề chiến lược và hạn chế xung đột lợi ích.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* GRI 2-9, 2-10, 2-11 card */}
            <div className="bg-white rounded-lg border border-gray-150 p-5 space-y-3 flex flex-col justify-between shadow-3xs hover:shadow-md transition-shadow min-h-[250px]">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2 border-b border-gray-100 pb-2">
                  <span className="bg-vna-blue/10 text-vna-blue text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">GRI 2-9, 2-10, 2-11</span>
                  <Building2 className="text-vna-blue shrink-0" size={18} />
                </div>
                <h4 className="font-bold text-sm text-vna-blue">Cơ cấu Quản trị & Độc lập HĐQT</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  "Vietnam Airlines duy trì cơ cấu quản trị doanh nghiệp minh bạch và độc lập theo các chuẩn mực quốc tế cao nhất. Cơ quan quản trị cao nhất của Tổng công ty là Hội đồng Quản trị (HĐQT), hoạt động độc lập và tách biệt hoàn toàn với Ban Điều hành (Tổng giám đốc). HĐQT bao gồm các thành viên có năng lực chuyên môn sâu rộng trong ngành hàng không, tài chính và quản trị. Dưới HĐQT, các Ủy ban chuyên trách bao gồm Ủy ban Nhân sự & Lương thưởng, Ban Kiểm toán Nội bộ và Ban An toàn Chất lượng trực tiếp giám sát, chỉ đạo các hoạt động trọng yếu của Tổng công ty, bảo đảm tối đa hóa lợi ích dài hạn của cổ đông và các bên liên quan."
                </p>
              </div>
              <div className="text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-2 flex justify-between">
                <span>LOẠI: ĐỊNH TÍNH (TEXT ONLY)</span>
                <span className="text-emerald-600 font-bold">100% ĐẠT CHUẨN</span>
              </div>
            </div>

            {/* GRI 2-12, 2-13 card */}
            <div className="bg-white rounded-lg border border-gray-150 p-5 space-y-3 flex flex-col justify-between shadow-3xs hover:shadow-md transition-shadow min-h-[250px]">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2 border-b border-gray-100 pb-2">
                  <span className="bg-vna-blue/10 text-vna-blue text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">GRI 2-12, 2-13</span>
                  <Users className="text-vna-blue shrink-0" size={18} />
                </div>
                <h4 className="font-bold text-sm text-vna-blue">Ủy quyền & Giám sát Tác động ESG</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  "HĐQT Vietnam Airlines chịu trách nhiệm cao nhất trong việc định hình chiến lược phát triển bền vững và giám sát các tác động kinh tế, môi trường và xã hội của Tổng công ty. HĐQT ủy quyền trực tiếp cho Tổng giám đốc và Ban Chỉ đạo Phát triển Bền vững (ESG) chịu trách nhiệm điều hành, triển khai các sáng kiến ESG thường niên. Định kỳ hàng quý, Ban Chỉ đạo thực hiện báo cáo tiến độ cắt giảm khí thải carbon, an toàn lao động và các chương trình xã hội lên HĐQT nhằm bảo đảm mọi quyết sách kinh doanh đều hài hòa với mục tiêu phát triển xanh."
                </p>
              </div>
              <div className="text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-2 flex justify-between">
                <span>LOẠI: ĐỊNH TÍNH (TEXT ONLY)</span>
                <span className="text-emerald-600 font-bold">100% ĐẠT CHUẨN</span>
              </div>
            </div>

            {/* GRI 2-15 card */}
            <div className="bg-white rounded-lg border border-gray-150 p-5 space-y-3 flex flex-col justify-between shadow-3xs hover:shadow-md transition-shadow min-h-[250px]">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2 border-b border-gray-100 pb-2">
                  <span className="bg-vna-blue/10 text-vna-blue text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">GRI 2-15</span>
                  <Scale className="text-vna-blue shrink-0" size={18} />
                </div>
                <h4 className="font-bold text-sm text-vna-blue">Kiểm soát Xung đột Lợi ích</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  "Vietnam Airlines cam kết thực thi các quy chuẩn đạo đức kinh doanh cao nhất. Quy trình nhận diện và quản trị xung đột lợi ích của Tổng công ty được thiết lập chặt chẽ theo Luật Doanh nghiệp và Bộ Quy tắc ứng xử nội bộ. 100% thành viên HĐQT, Ban Kiểm soát và cán bộ quản lý cấp cao thực hiện công bố thông tin lợi ích liên quan định kỳ hàng năm. Trong mọi phiên họp quyết sách, thành viên có quyền lợi liên quan bắt buộc phải công bố và không tham gia biểu quyết nhằm bảo đảm tính khách quan, minh bạch tuyệt đối."
                </p>
              </div>
              <div className="text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-2 flex justify-between">
                <span>LOẠI: ĐỊNH TÍNH (TEXT ONLY)</span>
                <span className="text-emerald-600 font-bold">100% ĐẠT CHUẨN</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== TAB 3: ĐẠO ĐỨC & TUÂN THỦ ==================== */}
      {activeTab === 'compliance-ethics' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
          
          <div className="p-4 bg-[#FAFAEB] rounded-lg border border-amber-200/50 text-xs text-gray-700 leading-relaxed flex items-start gap-3 shadow-2xs">
            <Shield size={16} className="text-vna-gold shrink-0 mt-0.5" />
            <div>
              <strong className="text-vna-blue text-sm block mb-0.5">Tiêu chuẩn Liêm chính & Đạo đức (Integrity & Compliance):</strong>
              Thuyết minh cam kết tuân thủ chính sách phòng chống tham nhũng, hối lộ, chống cạnh tranh không lành mạnh và bảo đảm tính trung lập chính trị, tạo độ tin cậy tuyệt đối với cộng đồng hàng không toàn cầu.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* GRI 2-23, GRI 3-3 */}
            <div className="bg-white rounded-lg border border-gray-150 p-5 space-y-3 flex flex-col justify-between shadow-3xs hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2 border-b border-gray-100 pb-2">
                  <span className="bg-vna-blue/10 text-vna-blue text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">GRI 2-23, GRI 3-3</span>
                  <Award className="text-vna-blue shrink-0" size={18} />
                </div>
                <h4 className="font-bold text-sm text-vna-blue">Cam kết Chính sách Phát triển Bền vững</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  "Vietnam Airlines cam kết sâu sắc đối với các nguyên tắc phát triển bền vững toàn cầu. Chúng tôi tuân thủ tuyệt đối luật pháp sở tại, các công ước quốc tế của ICAO/IATA và Bộ Quy tắc Ứng xử Đạo đức kinh doanh VNA. Cam kết chính sách của chúng tôi bao gồm: tôn trọng quyền con người, không sử dụng lao động cưỡng bức/trẻ em, bảo đảm an toàn lao động tối cao và giảm thiểu tác động môi trường thông qua lộ trình Net Zero. Các cam kết này được tích hợp sâu sắc vào mọi hoạt động vận hành thường nhật của toàn Tổng công ty."
                </p>
              </div>
              <div className="text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-2">
                TRẠNG THÁI: PHÊ DUYỆT BỞI HĐQT
              </div>
            </div>

            {/* GRI 2-26 */}
            <div className="bg-white rounded-lg border border-gray-150 p-5 space-y-3 flex flex-col justify-between shadow-3xs hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2 border-b border-gray-100 pb-2">
                  <span className="bg-vna-blue/10 text-vna-blue text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">GRI 2-26</span>
                  <HelpCircle className="text-vna-blue shrink-0" size={18} />
                </div>
                <h4 className="font-bold text-sm text-vna-blue">Cơ chế Phản hồi & Tố giác Đạo đức (Whistleblowing)</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  "Chúng tôi kiến tạo môi trường làm việc minh bạch thông qua việc vận hành cơ chế Whistleblowing bảo mật và an toàn. Người lao động, đối tác và khách hàng có thể dễ dàng phản hồi ý kiến, tìm kiếm lời khuyên hoặc tố giác các hành vi vi phạm đạo đức kinh doanh thông qua các kênh bảo mật: Đường dây nóng Ban Thanh tra nhân dân, Hòm thư Công đoàn hoặc Cổng tiếp nhận trực tuyến. Vietnam Airlines cam kết bảo mật 100% danh tính người phản ánh và áp dụng chính sách 'Không trả đũa' nghiêm ngặt đối với bất kỳ nhân sự nào báo cáo trung thực các mối lo ngại về tuân thủ pháp luật."
                </p>
              </div>
              <div className="text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-2">
                TRẠNG THÁI: KHUÊ ĐỒNG HÀNH KHÔNG TRẢ ĐŨA
              </div>
            </div>

            {/* GRI 2-29 */}
            <div className="bg-white rounded-lg border border-gray-150 p-5 space-y-3 flex flex-col justify-between shadow-3xs hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2 border-b border-gray-100 pb-2">
                  <span className="bg-vna-blue/10 text-vna-blue text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">GRI 2-29</span>
                  <Handshake className="text-vna-blue shrink-0" size={18} />
                </div>
                <h4 className="font-bold text-sm text-vna-blue">Cách tiếp cận các Bên Liên quan</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  "Vietnam Airlines chủ động tương tác định kỳ và cởi mở với các bên liên quan nhằm thấu hiểu sâu sắc các mối quan tâm cốt lõi. Chúng tôi duy trì ma trận đối thoại đa kênh: khảo sát sự hài lòng của hành khách (7 tiêu chí), Đại hội đồng cổ đông thường niên, hội nghị đối thoại người lao động định kỳ với Công đoàn, và phối hợp chặt chẽ với các cơ quan quản lý nhà nước để thúc đẩy các chính sách hàng không xanh. Sự đồng hành của các bên liên quan là kim chỉ nam cho mọi chiến lược phát triển bền vững của hãng."
                </p>
              </div>
              <div className="text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-2">
                TRẠNG THÁI: 7 NHÓM BÊN LIÊN QUAN CHỦ CHỐT
              </div>
            </div>

            {/* GRI 205-2 */}
            <div className="bg-white rounded-lg border border-gray-150 p-5 space-y-3 flex flex-col justify-between shadow-3xs hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2 border-b border-gray-100 pb-2">
                  <span className="bg-vna-blue/10 text-vna-blue text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">GRI 205-2</span>
                  <Shield className="text-vna-blue shrink-0" size={18} />
                </div>
                <h4 className="font-bold text-sm text-vna-blue">Đào tạo & Truyền thông Chống tham nhũng</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  "Vietnam Airlines áp dụng nguyên tắc 'Không khoan nhượng' đối với mọi hành vi tham nhũng và hối lộ. 100% thành viên HĐQT, Ban điều hành và toàn bộ người lao động toàn hãng đều được truyền thông và ký cam kết tuân thủ chính sách phòng chống tham nhũng hàng năm. Chúng tôi định kỳ tổ chức các khóa huấn luyện bắt buộc về đạo đức nghề nghiệp, kiểm soát nội bộ và quản trị rủi ro mua sắm cho các bộ phận nhạy cảm như kỹ thuật, thương mại và chuỗi cung ứng, bảo đảm sự liêm chính xuyên suốt mọi mắt xích vận hành."
                </p>
              </div>
              <div className="text-[10px] text-emerald-600 font-bold border-t border-gray-100 pt-2">
                TỶ LỆ KHAI BÁO & HUẤN LUYỆN: 100% ĐẠT
              </div>
            </div>

            {/* GRI 205-3, 206-1, 415-1 Composite Card */}
            <div className="bg-white rounded-lg border border-gray-150 p-5 space-y-3 flex flex-col justify-between shadow-3xs hover:shadow-md transition-shadow md:col-span-2">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2 border-b border-gray-100 pb-2">
                  <span className="bg-vna-blue/10 text-vna-blue text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">GRI 205-3, 206-1, 415-1</span>
                  <FileText className="text-vna-blue shrink-0" size={18} />
                </div>
                <h4 className="font-bold text-sm text-vna-blue">Tuyên bố Không Vi phạm & Trung lập Chính trị</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1">
                    <span className="font-bold text-vna-blue block">🛡️ [GRI 205-3] Chống Tham Nhũng</span>
                    <p className="text-[11px] leading-relaxed">"Vietnam Airlines tự hào duy trì thành tích quản trị sạch với **0 vụ việc tham nhũng** hay hối lộ được ghi nhận hoặc xác minh trong suốt kỳ báo cáo."</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1">
                    <span className="font-bold text-vna-blue block">⚖️ [GRI 206-1] Luật Cạnh Tranh</span>
                    <p className="text-[11px] leading-relaxed">"Trong kỳ báo cáo, Tổng công ty **không phải đối mặt với bất kỳ hành vi pháp lý hay cuộc điều tra nào** liên quan đến cạnh tranh không lành mạnh hoặc độc quyền."</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1">
                    <span className="font-bold text-vna-blue block">🏛️ [GRI 415-1] Trung lập Chính trị</span>
                    <p className="text-[11px] leading-relaxed">"Tổng công ty áp dụng chính sách nghiêm ngặt: **không đóng góp bất kỳ khoản tài chính hoặc hiện vật nào** cho các tổ chức, đảng phái chính trị."</p>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-2 flex justify-between">
                <span>CHỨNG NHẬN PHÒNG PHÁP CHẾ & BAN TCNL</span>
                <span className="text-emerald-600 font-bold">100% TUÂN THỦ TUYỆT ĐỐI</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== TAB 4: QUAN HỆ CHÍNH PHỦ ==================== */}
      {activeTab === 'government-relations' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
          
          <div className="p-4 bg-[#FAFAEB] rounded-lg border border-amber-200/50 text-xs text-gray-700 leading-relaxed flex items-start gap-3 shadow-2xs">
            <Landmark size={16} className="text-vna-gold shrink-0 mt-0.5" />
            <div>
              <strong className="text-vna-blue text-sm block mb-0.5">Đối thoại & Hỗ trợ Chính phủ (GRI 201-4):</strong>
              Phương án truyền thông tinh tế, định tính dành cho Tổ Thư ký, kết nối các chính sách hỗ trợ vĩ mô của Nhà nước với vai trò gánh vác trách nhiệm quốc gia và thực thi nghĩa vụ công ích hàng không của VNA.
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-150 p-6 space-y-4 shadow-3xs">
            <div className="flex justify-between items-start gap-2 border-b border-gray-100 pb-3">
              <span className="bg-vna-blue/10 text-vna-blue text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">GRI 201-4 Thuyết minh</span>
              <Landmark className="text-vna-blue shrink-0" size={20} />
            </div>
            
            <h4 className="font-bold text-base text-vna-blue">Hỗ trợ từ Chính phủ & Sứ mệnh Hãng hàng không Quốc gia</h4>
            
            <p className="text-xs text-gray-600 leading-relaxed bg-[#FAFAEB]/40 p-4 rounded-lg border border-amber-100">
              "Là Hãng hàng không Quốc gia Việt Nam, Vietnam Airlines nhận được sự đồng hành và hỗ trợ chính sách mang tính chiến lược từ Chính phủ để duy trì năng lực kết nối hàng không cốt lõi. Trong giai đoạn phục hồi sau khủng hoảng, Tổng công ty đã áp dụng hiệu quả các chính sách miễn giảm thuế bảo vệ môi trường đối với nhiên liệu bay, các gói gia hạn thuế và hỗ trợ phí cất hạ cánh theo chủ trương phục hồi kinh tế của Nhà nước. 
              <br/><br/>
              Song hành cùng các chính sách hỗ trợ đó, Vietnam Airlines đã thực hiện xuất sắc các nhiệm vụ công ích quốc gia: duy trì các đường bay vùng sâu vùng xa (phục vụ dân sinh), thực hiện các chuyến bay chuyên cơ ngoại giao, các chiến dịch nhân đạo vận chuyển công dân và cứu trợ thiên tai. Sự hỗ trợ từ Chính phủ là động lực giúp chúng tôi hoàn thành vai trò cầu nối kinh tế và sứ mệnh an sinh xã hội bền vững."
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-bold text-vna-blue block mb-1">🎁 Phía hỗ trợ của Nhà nước:</span>
                Miễn giảm 50-100% thuế BVMT xăng bay, gia hạn thời gian nộp thuế, ưu đãi phí cất hạ cánh tại các HUB mặt đất nội địa.
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-150">
                <span className="font-bold text-vna-gold block mb-1">✈️ Phía thực thi nghĩa vụ VNA:</span>
                Vận chuyển chuyên cơ, bắc cầu hàng không vùng cao (Điện Biên, Côn Đảo...), thực hiện bay cứu hộ thiên tai quốc tế.
              </div>
            </div>
            
            <div className="text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-3 flex justify-between">
              <span>ĐỊNH HƯỚNG TRUYỀN THÔNG: BẢO MẬT SỐ LIỆU VAY/NỢ CHUYÊN SÂU</span>
              <span className="text-vna-gold font-bold">KHUYÊN DÙNG PUBLIC</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};