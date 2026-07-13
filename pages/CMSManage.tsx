import React, { useState } from 'react';
import { Card, Button, Input, Badge, Table, Toast } from '../components/UI';
import {
  LayoutDashboard, Newspaper, FileText, Upload, Save, RefreshCw, Eye, EyeOff, Edit, Plus, CheckCircle, XCircle,
  Leaf, Users, Landmark, Calendar, ArrowLeft, ArrowRight, Download, Share2, Printer, ChevronRight
} from 'lucide-react';

interface PillarCMSData {
  id: 'environment' | 'social' | 'governance';
  code: 'E' | 'S' | 'G';
  nameVi: string;
  nameEn: string;

  // News configuration
  newsTitleVi: string;
  newsTitleEn: string;
  newsCategoryVi: string;
  newsCategoryEn: string;
  newsThumbnail: string;
  newsPublishDate: string;
  newsExcerptVi: string;
  newsExcerptEn: string;
  newsBodyVi: string;
  newsBodyEn: string;

  // Detail Page configuration
  detailTitleVi: string;
  detailTitleEn: string;
  definitionVi: string;
  definitionEn: string;
  complianceVi: string;
  complianceEn: string;
  futureGoalsVi: string;
  futureGoalsEn: string;
  attachmentNameVi: string;
  attachmentNameEn: string;
  attachmentUrl: string;
  chartUrl: string;
}

const initialPillarsData: PillarCMSData[] = [
  {
    id: 'environment',
    code: 'E',
    nameVi: 'Môi trường',
    nameEn: 'Environment',
    newsTitleVi: "[VNExpress] 6 sáng kiến ESG của 'Liên minh Xanh' Vietnam Airlines",
    newsTitleEn: "[VNExpress] 6 ESG initiatives of Vietnam Airlines' 'Green Alliance'",
    newsCategoryVi: "Môi trường",
    newsCategoryEn: "Environment",
    newsThumbnail: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop",
    newsPublishDate: "2026-05-07",
    newsExcerptVi: "\"Liên minh Xanh - Phát triển bền vững\" của Vietnam Airlines khởi động với loạt chương trình, cùng 18 đối tác trong các lĩnh vực môi trường, y tế và công nghệ.",
    newsExcerptEn: "Vietnam Airlines' 'Green Alliance - Sustainable Development' launched with a series of programs, alongside 18 partners in environmental, health, and technology sectors.",
    newsBodyVi: "Lộ trình chi tiết để đạt mức phát thải ròng bằng 0 vào năm 2050 bao gồm đầu tư đội bay thế hệ mới tiết kiệm nhiên liệu, sử dụng SAF và giảm thiểu rác thải nhựa dùng một lần.",
    newsBodyEn: "Detailed roadmap to achieve net-zero emissions by 2050 includes investing in new generation fuel-efficient fleet, adopting SAF, and minimizing single-use plastics.",
    detailTitleVi: "Chiến lược Môi trường & Chuyển đổi Xanh",
    detailTitleEn: "Environment & Green Transition Strategy",
    definitionVi: "Vietnam Airlines xác định chuyển đổi xanh là mệnh lệnh sống còn. Chúng tôi tập trung vào hiện đại hóa đội tàu bay, tối ưu hóa khai thác, sử dụng nhiên liệu bền vững (SAF).",
    definitionEn: "Vietnam Airlines identifies green transition as a vital imperative. We focus on fleet modernization, operations optimization, and sustainable aviation fuel (SAF).",
    complianceVi: "Tuân thủ nghiêm ngặt chuẩn mực CORSIA (ICAO), EU ETS và UK ETS trên toàn mạng bay.",
    complianceEn: "Strictly comply with CORSIA (ICAO), EU ETS, and UK ETS standards across the entire flight network.",
    futureGoalsVi: "Giảm 15% lượng phát thải khí nhà kính vào năm 2030 và đạt Net Zero Carbon ròng vào năm 2050.",
    futureGoalsEn: "Reduce greenhouse gas emissions by 15% by 2030 and achieve net-zero carbon by 2050.",
    attachmentNameVi: "Báo cáo Kiểm kê khí nhà kính VNA 2024.pdf",
    attachmentNameEn: "VNA Greenhouse Gas Inventory Report 2024.pdf",
    attachmentUrl: "https://vietnamairlines.com/esg/ghg-2024.pdf",
    chartUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 'social',
    code: 'S',
    nameVi: 'Xã hội',
    nameEn: 'Social',
    newsTitleVi: "Vietnam Airlines kết nối những hành trình ý nghĩa vì cộng đồng",
    newsTitleEn: "Vietnam Airlines connects meaningful journeys for the community",
    newsCategoryVi: "Cộng đồng",
    newsCategoryEn: "Community",
    newsThumbnail: "https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=600&auto=format&fit=crop",
    newsPublishDate: "2026-04-25",
    newsExcerptVi: "Infographic về cột mốc chặng đường lan tỏa yêu thương tới cộng đồng và xã hội qua các chuyến bay nhân đạo.",
    newsExcerptEn: "Infographic milestone journey of spreading love to the community and society through humanitarian flights.",
    newsBodyVi: "Hỗ trợ vận chuyển y tế khẩn cấp, vận chuyển vắc-xin, cứu trợ bão lũ và tổ chức các chuyến bay yêu thương chở học sinh nghèo, người lao động khó khăn.",
    newsBodyEn: "Support emergency medical transport, vaccine logistics, natural disaster relief, and organize Flights of Love for underprivileged students and workers.",
    detailTitleVi: "Phát triển Nguồn nhân lực & Trách nhiệm Cộng đồng",
    detailTitleEn: "Human Resource Development & Community Responsibility",
    definitionVi: "Chúng tôi kiến tạo môi trường làm việc hạnh phúc, đa dạng và bao trùm, đồng hành cùng sự phát triển thịnh vượng của cộng đồng.",
    definitionEn: "We create a happy, diverse, and inclusive working environment, accompanying the prosperous development of the community.",
    complianceVi: "Quy trình quản lý an toàn lao động đạt chuẩn SMS quốc tế, thúc đẩy bình đẳng giới.",
    complianceEn: "Occupational safety management system meets international SMS standards, promoting gender equality.",
    futureGoalsVi: "Gia tăng tỷ lệ lãnh đạo nữ đạt 30% và cải thiện phúc lợi nhân viên toàn diện.",
    futureGoalsEn: "Increase female leadership to 30% and improve comprehensive employee benefits.",
    attachmentNameVi: "Chính sách An toàn lao động và Bình đẳng giới VNA.pdf",
    attachmentNameEn: "VNA Occupational Safety and Gender Equality Policy.pdf",
    attachmentUrl: "https://vietnamairlines.com/esg/safety-gender.pdf",
    chartUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 'governance',
    code: 'G',
    nameVi: 'Quản trị',
    nameEn: 'Governance',
    newsTitleVi: "Vietnam Airlines họp phiên Ban chỉ đạo ESG: Chuẩn hóa quy trình",
    newsTitleEn: "Vietnam Airlines ESG Committee Meeting: Standardizing processes",
    newsCategoryVi: "Bền vững",
    newsCategoryEn: "Sustainability",
    newsThumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop",
    newsPublishDate: "2026-04-29",
    newsExcerptVi: "Nâng cao năng lực quản trị doanh nghiệp, tuân thủ các cam kết và chuẩn mực báo cáo ESG quốc tế.",
    newsExcerptEn: "Enhance corporate governance capacity, comply with international commitments and ESG reporting standards.",
    newsBodyVi: "Thực thi nghiêm ngặt Bộ quy tắc ứng xử, phòng chống tham nhũng hối lộ và thiết lập kênh phản ánh độc lập tin cậy.",
    newsBodyEn: "Strictly enforce the Code of Conduct, prevent corruption, and establish a reliable independent whistleblowing channel.",
    detailTitleVi: "Quản trị Minh bạch & Tuân thủ Quốc tế",
    detailTitleEn: "Transparent Governance & International Compliance",
    definitionVi: "Hệ thống quản trị liêm chính, minh bạch là nền tảng cốt lõi giúp bảo vệ quyền lợi cổ đông và các bên liên quan.",
    definitionEn: "A transparent and clean governance system is the core foundation to protect the rights of shareholders and stakeholders.",
    complianceVi: "Ban hành Bộ quy tắc ứng xử (Code of Conduct) và duy trì cơ chế Whistleblowing bảo mật danh tính.",
    complianceEn: "Issue Code of Conduct and maintain secure Whistleblowing mechanism.",
    futureGoalsVi: "100% tuân thủ các quy định pháp luật và tiệm cận các chuẩn mực quản trị cao nhất thế giới.",
    futureGoalsEn: "100% compliance with legal regulations and approaching the world's highest governance standards.",
    attachmentNameVi: "Bộ quy tắc ứng xử VNA mới nhất.pdf",
    attachmentNameEn: "VNA Latest Code of Conduct.pdf",
    attachmentUrl: "https://vietnamairlines.com/esg/coc-vna.pdf",
    chartUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop"
  }
];

export const CMSManagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hero' | 'ceo' | 'pillars' | 'news' | 'reports'>('hero');
  const [newsSubTab, setNewsSubTab] = useState<'sync' | 'approve'>('sync');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const [visionData, setVisionData] = useState({
    headlineVi: 'Vươn cao bền vững',
    headlineEn: 'Reaching Sustainable Heights',
    bannerUrl: '/banner.jpg',
    subheadlineVi: 'Cam kết của Vietnam Airlines vì một tương lai xanh, xã hội thịnh vượng và quản trị minh bạch.',
    subheadlineEn: "Vietnam Airlines' commitment to a green future, a prosperous society, and transparent governance.",
    ceoNameVi: 'Ông Lê Hồng Hà',
    ceoNameEn: 'Mr. Le Hong Ha',
    ceoTitleVi: 'Tổng Giám đốc Vietnam Airlines',
    ceoTitleEn: 'CEO of Vietnam Airlines',
    ceoImageUrl: '',
    ceoMessageVi: '"Tại Vietnam Airlines, phát triển bền vững không phải là sự lựa chọn, mà là sứ mệnh. Chúng tôi hiểu rằng mỗi chuyến bay cất cánh không chỉ mang theo hành khách, mà còn mang theo trách nhiệm với môi trường và cộng đồng."',
    ceoMessageEn: '"At Vietnam Airlines, sustainable development is not a choice, but a mission. We understand that each flight that takes off carries not only passengers, but also responsibility for the environment and the community."'
  });
  const [isDraft, setIsDraft] = useState(false);

  const [pillars, setPillars] = useState<PillarCMSData[]>(initialPillarsData);
  const [selectedPillarId, setSelectedPillarId] = useState<'environment' | 'social' | 'governance'>('environment');
  const [editingLang, setEditingLang] = useState<'vi' | 'en'>('vi');
  const [previewLang, setPreviewLang] = useState<'vi' | 'en'>('vi');
  const [previewPage, setPreviewPage] = useState<'home' | 'detail'>('home');
  const [previewPillarId, setPreviewPillarId] = useState<'environment' | 'social' | 'governance'>('environment');
  const [showPreview, setShowPreview] = useState(false);

  const handleAction = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#005f6e]">Quản trị Website ESG (Public)</h1>
          <p className="text-black/45 text-sm mt-1">Cấu hình trực tiếp 4 phân hệ nội dung cốt lõi hiển thị trên trang thông tin đại chúng</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-bold"
            onClick={() => {
              setIsDraft(true);
              handleAction('Đã lưu nháp! Xem trước để kiểm tra trước khi public.', 'info');
            }}
          >
            <Save size={16} /> Lưu nháp {isDraft && <span className="ml-1 w-2 h-2 rounded-full bg-amber-400 inline-block" />}
          </Button>
          <Button variant="primary" className="gap-2 bg-[#e6b441] hover:bg-[#d4a230] text-[#005f6e] font-bold border-transparent">
            <Share2 size={16} /> Lưu & Public
          </Button>
          <Button variant="primary" className="gap-2 bg-[#e6b441] hover:bg-[#d4a230] text-[#005f6e] font-bold border-transparent" onClick={() => {
            setPreviewPage('home');
            setPreviewLang(editingLang);
            setShowPreview(true);
          }}>
            <Eye size={16} /> Xem trước (Preview)
          </Button>
        </div>
      </div>

      {/* Tabs Menu & Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Sidebar - Vertical Tabs representing Page Flow */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-20">
            <h3 className="font-bold text-xs text-black/45 uppercase tracking-wider mb-4 px-2">Luồng hiển thị trên Website</h3>
            <div className="relative pl-4 border-l-2 border-gray-100 ml-4 space-y-6 py-2">
              {/* Tab 1a: Hero */}
              <div className="relative font-sans">
                {/* Bullet */}
                <div className={`absolute -left-[23px] top-[22px] w-[10px] h-[10px] rounded-full border-2 bg-white transition-colors duration-200 ${activeTab === 'hero' ? 'border-[#e6b441] bg-[#005f6e]' : 'border-gray-300'}`} />
                <button
                  className={`w-full flex flex-col items-start gap-0.5 p-3 rounded-lg text-left transition-all duration-200 border ${activeTab === 'hero'
                    ? 'bg-[#005f6e]/5 border-[#005f6e] text-[#005f6e] font-bold shadow-xs'
                    : 'bg-white border-transparent text-gray-700 hover:bg-gray-50'
                    }`}
                  onClick={() => setActiveTab('hero')}
                >
                  <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#e6b441]">
                    <LayoutDashboard size={12} /> 1. Đầu trang (Hero)
                  </span>
                  <span className="text-sm font-bold">Banner & Tiêu đề</span>
                  <span className="text-[10px] text-black/35 leading-tight mt-0.5">Hình ảnh banner, tiêu đề & mô tả phụ</span>
                </button>
              </div>

              {/* Tab 1b: CEO Message */}
              <div className="relative font-sans">
                {/* Bullet */}
                <div className={`absolute -left-[23px] top-[22px] w-[10px] h-[10px] rounded-full border-2 bg-white transition-colors duration-200 ${activeTab === 'ceo' ? 'border-[#e6b441] bg-[#005f6e]' : 'border-gray-300'}`} />
                <button
                  className={`w-full flex flex-col items-start gap-0.5 p-3 rounded-lg text-left transition-all duration-200 border ${activeTab === 'ceo'
                    ? 'bg-[#005f6e]/5 border-[#005f6e] text-[#005f6e] font-bold shadow-xs'
                    : 'bg-white border-transparent text-gray-700 hover:bg-gray-50'
                    }`}
                  onClick={() => setActiveTab('ceo')}
                >
                  <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#e6b441]">
                    <Users size={12} /> 2. Thông điệp Lãnh đạo
                  </span>
                  <span className="text-sm font-bold">Thông điệp CEO</span>
                  <span className="text-[10px] text-black/35 leading-tight mt-0.5">Họ tên, chức danh & nội dung thông điệp</span>
                </button>
              </div>

              {/* Tab 3: Mid */}
              <div className="relative font-sans">
                {/* Bullet */}
                <div className={`absolute -left-[23px] top-[22px] w-[10px] h-[10px] rounded-full border-2 bg-white transition-colors duration-200 ${activeTab === 'pillars' ? 'border-[#e6b441] bg-[#005f6e]' : 'border-gray-300'}`} />
                <button
                  className={`w-full flex flex-col items-start gap-0.5 p-3 rounded-lg text-left transition-all duration-200 border ${activeTab === 'pillars'
                    ? 'bg-[#005f6e]/5 border-[#005f6e] text-[#005f6e] font-bold shadow-xs'
                    : 'bg-white border-transparent text-gray-700 hover:bg-gray-50'
                    }`}
                  onClick={() => {
                    setActiveTab('pillars');
                    if (!selectedPillarId) setSelectedPillarId('environment');
                  }}
                >
                  <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#e6b441]">
                    <Landmark size={12} /> 3. Thân trang (Mid)
                  </span>
                  <span className="text-sm font-bold">Thông tin trụ cột</span>
                  <span className="text-[10px] text-black/35 leading-tight mt-0.5">3 trụ cột cốt lõi E-S-G & bài viết chi tiết</span>
                </button>

                {/* Sub-tabs accordion (Only when Tab 2 is active) */}
                {activeTab === 'pillars' && (
                  <div className="mt-2 ml-4 pl-3 border-l border-dashed border-[#005f6e]/30 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                    {pillars.map((pillar) => {
                      const isSubActive = selectedPillarId === pillar.id;
                      let Icon = Leaf;
                      if (pillar.id === 'social') Icon = Users;
                      if (pillar.id === 'governance') Icon = Landmark;

                      return (
                        <button
                          key={pillar.id}
                          onClick={() => setSelectedPillarId(pillar.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${isSubActive
                            ? 'bg-[#005f6e] text-white border-[#005f6e] shadow-xs'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Icon size={12} />
                            {editingLang === 'vi' ? pillar.nameVi : pillar.nameEn}
                          </span>
                          <span className={`text-[9px] px-1 py-0.5 rounded font-mono ${isSubActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {pillar.code}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tab 4: Lower */}
              <div className="relative font-sans">
                {/* Bullet */}
                <div className={`absolute -left-[23px] top-[22px] w-[10px] h-[10px] rounded-full border-2 bg-white transition-colors duration-200 ${activeTab === 'news' ? 'border-[#e6b441] bg-[#005f6e]' : 'border-gray-300'}`} />
                <button
                  className={`w-full flex flex-col items-start gap-0.5 p-3 rounded-lg text-left transition-all duration-200 border ${activeTab === 'news'
                    ? 'bg-[#005f6e]/5 border-[#005f6e] text-[#005f6e] font-bold shadow-xs'
                    : 'bg-white border-transparent text-gray-700 hover:bg-gray-50'
                    }`}
                  onClick={() => setActiveTab('news')}
                >
                  <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#e6b441]">
                    <Newspaper size={12} /> 4. Thân trang (Lower)
                  </span>
                  <span className="text-sm font-bold">Tin tức & Hoạt động</span>
                  <span className="text-[10px] text-black/35 leading-tight mt-0.5">Bảng tin ESG, bài viết đồng bộ từ Spirit</span>
                </button>
              </div>

              {/* Tab 5: Footer */}
              <div className="relative font-sans">
                {/* Bullet */}
                <div className={`absolute -left-[23px] top-[22px] w-[10px] h-[10px] rounded-full border-2 bg-white transition-colors duration-200 ${activeTab === 'reports' ? 'border-[#e6b441] bg-[#005f6e]' : 'border-gray-300'}`} />
                <button
                  className={`w-full flex flex-col items-start gap-0.5 p-3 rounded-lg text-left transition-all duration-200 border ${activeTab === 'reports'
                    ? 'bg-[#005f6e]/5 border-[#005f6e] text-[#005f6e] font-bold shadow-xs'
                    : 'bg-white border-transparent text-gray-700 hover:bg-gray-50'
                    }`}
                  onClick={() => setActiveTab('reports')}
                >
                  <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#e6b441]">
                    <FileText size={12} /> 5. Cuối trang (Footer)
                  </span>
                  <span className="text-sm font-bold">Lưu trữ Báo cáo</span>
                  <span className="text-[10px] text-black/35 leading-tight mt-0.5">Báo cáo thường niên & Bền vững dạng PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area - Tab Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Hero Tab Content */}
          {activeTab === 'hero' && (
            <Card className="p-6 border-l-4 border-l-[#005f6e]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#005f6e]/10 flex items-center justify-center">
                    <LayoutDashboard size={16} className="text-[#005f6e]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-black/85">Hero — Banner đầu trang</h3>
                    <p className="text-xs text-black/40 mt-0.5">Tiêu đề chính, hình ảnh nền banner và mô tả phụ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                    <button onClick={() => setEditingLang('vi')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${editingLang === 'vi' ? 'bg-[#005f6e] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>VI</button>
                    <button onClick={() => setEditingLang('en')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${editingLang === 'en' ? 'bg-[#005f6e] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>EN</button>
                  </div>
                  {/* <Button variant="outline" className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 text-xs font-bold py-1.5" onClick={() => { setIsDraft(true); handleAction('Đã lưu nháp Hero!', 'info'); }}>
                    <Save size={13} /> Lưu nháp {isDraft && <span className="ml-1 w-2 h-2 rounded-full bg-amber-400 inline-block" />}
                  </Button> */}
                  {/* <Button variant="primary" className="gap-1.5 bg-[#005f6e] hover:bg-[#004e5a] text-white border-transparent text-xs font-bold py-1.5" onClick={() => { setIsDraft(false); handleAction('Đã lưu & public Hero!'); }}>
                    <Share2 size={13} /> Lưu & Public
                  </Button> */}
                </div>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Tiêu đề chính (Headline) — {editingLang === 'vi' ? 'Tiếng Việt' : 'English'}</label>
                    <Input value={editingLang === 'vi' ? visionData.headlineVi : visionData.headlineEn} onChange={e => setVisionData({ ...visionData, [editingLang === 'vi' ? 'headlineVi' : 'headlineEn']: e.target.value })} className="font-semibold" />
                    <p className="text-[10px] text-black/30 mt-1">Hiển thị làm tiêu đề H1 lớn nhất trên banner</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Hình ảnh Banner (URL)</label>
                    <div className="flex gap-2">
                      <Input value={visionData.bannerUrl} onChange={e => setVisionData({ ...visionData, bannerUrl: e.target.value })} placeholder="/vna-images/hero.jpg hoặc URL đầy đủ" />
                      <Button variant="outline" className="shrink-0" title="Upload ảnh"><Upload size={14} /></Button>
                    </div>
                    {visionData.bannerUrl && (
                      <div className="mt-2 rounded-md overflow-hidden border border-gray-100 h-14">
                        <img src={visionData.bannerUrl} alt="banner preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Mô tả phụ (Subheadline) — {editingLang === 'vi' ? 'Tiếng Việt' : 'English'}</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#005f6e] focus:border-[#005f6e] text-sm" rows={2} value={editingLang === 'vi' ? visionData.subheadlineVi : visionData.subheadlineEn} onChange={e => setVisionData({ ...visionData, [editingLang === 'vi' ? 'subheadlineVi' : 'subheadlineEn']: e.target.value })} placeholder="Mô tả ngắn về cam kết ESG..." />
                  <p className="text-[10px] text-black/30 mt-1">Hiển thị phụ đề nhỏ bên dưới tiêu đề chính trên banner</p>
                </div>
              </div>
            </Card>
          )}

          {/* CEO Message Tab Content */}
          {activeTab === 'ceo' && (
            <Card className="p-6 border-l-4 border-l-[#e6b441]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#e6b441]/10 flex items-center justify-center">
                    <Users size={16} className="text-[#e6b441]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-black/85">Thông điệp từ Lãnh đạo</h3>
                    <p className="text-xs text-black/40 mt-0.5">Họ tên, chức danh CEO và nội dung thông điệp</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                    <button onClick={() => setEditingLang('vi')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${editingLang === 'vi' ? 'bg-[#005f6e] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>VI</button>
                    <button onClick={() => setEditingLang('en')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${editingLang === 'en' ? 'bg-[#005f6e] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>EN</button>
                  </div>
                  {/* <Button variant="outline" className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 text-xs font-bold py-1.5" onClick={() => { setIsDraft(true); handleAction('Đã lưu nháp Thông điệp!', 'info'); }}>
                    <Save size={13} /> Lưu nháp {isDraft && <span className="ml-1 w-2 h-2 rounded-full bg-amber-400 inline-block" />}
                  </Button>
                  <Button variant="primary" className="gap-1.5 bg-[#005f6e] hover:bg-[#004e5a] text-white border-transparent text-xs font-bold py-1.5" onClick={() => { setIsDraft(false); handleAction('Đã lưu & public Thông điệp Lãnh đạo!'); }}>
                    <Share2 size={13} /> Lưu & Public
                  </Button> */}
                </div>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Họ tên Lãnh đạo — {editingLang === 'vi' ? 'Tiếng Việt' : 'English'}</label>
                    <Input value={editingLang === 'vi' ? visionData.ceoNameVi : visionData.ceoNameEn} onChange={e => setVisionData({ ...visionData, [editingLang === 'vi' ? 'ceoNameVi' : 'ceoNameEn']: e.target.value })} />
                    <p className="text-[10px] text-black/30 mt-1">Tên đầy đủ hiển thị phía dưới trích dẫn</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Chức danh — {editingLang === 'vi' ? 'Tiếng Việt' : 'English'}</label>
                    <Input value={editingLang === 'vi' ? visionData.ceoTitleVi : visionData.ceoTitleEn} onChange={e => setVisionData({ ...visionData, [editingLang === 'vi' ? 'ceoTitleVi' : 'ceoTitleEn']: e.target.value })} />
                    <p className="text-[10px] text-black/30 mt-1">Chức danh hiển thị kèm tên</p>
                  </div>
                </div>

                {/* Photo Upload Field */}
                <div className="p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/60">
                  <label className="block text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">Ảnh Lãnh đạo</label>
                  <div className="flex items-start gap-4">
                    {/* Avatar Preview */}
                    <div className="shrink-0">
                      <div className="w-20 h-20 rounded-full border-2 border-gray-200 bg-white overflow-hidden flex items-center justify-center shadow-sm">
                        {visionData.ceoImageUrl ? (
                          <img
                            src={visionData.ceoImageUrl}
                            alt="Ảnh lãnh đạo"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-gray-300">
                            <Users size={28} />
                            <span className="text-[8px] font-bold uppercase tracking-wide">Chưa có ảnh</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Upload Controls */}
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={visionData.ceoImageUrl}
                          onChange={e => setVisionData({ ...visionData, ceoImageUrl: e.target.value })}
                          placeholder="Dán URL ảnh hoặc click Upload để chọn file..."
                          className="text-xs"
                        />
                        <label className="cursor-pointer shrink-0">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  setVisionData({ ...visionData, ceoImageUrl: ev.target?.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-gray-300 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm">
                            <Upload size={13} /> Upload
                          </span>
                        </label>
                      </div>
                      {visionData.ceoImageUrl && (
                        <button
                          className="text-[10px] text-red-400 hover:text-red-600 font-medium transition-colors"
                          onClick={() => setVisionData({ ...visionData, ceoImageUrl: '' })}
                        >
                          ✕ Xoá ảnh
                        </button>
                      )}
                      <p className="text-[10px] text-black/30 leading-relaxed">
                        Hỗ trợ JPG, PNG, WEBP. Ảnh sẽ hiển thị dạng tròn bên cạnh trích dẫn trên website.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Nội dung Thông điệp — {editingLang === 'vi' ? 'Tiếng Việt' : 'English'}</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#005f6e] focus:border-[#005f6e] text-sm font-sans" rows={4} value={editingLang === 'vi' ? visionData.ceoMessageVi : visionData.ceoMessageEn} onChange={e => setVisionData({ ...visionData, [editingLang === 'vi' ? 'ceoMessageVi' : 'ceoMessageEn']: e.target.value })} placeholder="Trích dẫn thông điệp của CEO..." />
                  <p className="text-[10px] text-black/30 mt-1">Nội dung sẽ được hiển thị trong ô trích dẫn in nghiêng bên cạnh ảnh CEO</p>
                </div>
                <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-600 mb-2 uppercase tracking-wide">Xem trước trích dẫn</p>
                  <div className="flex items-start gap-3">
                    {visionData.ceoImageUrl && (
                      <img src={visionData.ceoImageUrl} alt="CEO" className="w-10 h-10 rounded-full object-cover border-2 border-[#e6b441]/40 shrink-0 mt-0.5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div className="flex-1">
                      <blockquote className="border-l-2 border-[#e6b441] pl-3 text-xs text-gray-600 italic leading-relaxed">
                        {editingLang === 'vi' ? visionData.ceoMessageVi : visionData.ceoMessageEn}
                      </blockquote>
                      <p className="text-[10px] text-gray-700 font-bold mt-2">
                        — {editingLang === 'vi' ? visionData.ceoNameVi : visionData.ceoNameEn}, <span className="text-[#005f6e]">{editingLang === 'vi' ? visionData.ceoTitleVi : visionData.ceoTitleEn}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'news' && (
            <Card className="p-0 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-black/85">Quản lý Bảng tin ESG</h3>
                    <p className="text-sm text-black/45">Đồng bộ từ Spirit VNA & Phê duyệt tin bài nội bộ</p>
                  </div>
                  {newsSubTab === 'sync' && (
                    <Button variant="outline" className="gap-2 text-[#005f6e] border-[#005f6e] hover:bg-[#005f6e]/5" onClick={() => handleAction('Đã đồng bộ 3 bài viết mới từ Spirit VNA!')}>
                      <RefreshCw size={16} /> Đồng bộ Spirit API
                    </Button>
                  )}
                </div>

                <div className="flex border-b border-gray-200">
                  <button
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${newsSubTab === 'sync' ? 'border-[#e6b441] text-[#005f6e]' : 'border-transparent text-black/45 hover:text-gray-700'}`}
                    onClick={() => setNewsSubTab('sync')}
                  >
                    Bài viết từ Spirit VNA
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${newsSubTab === 'approve' ? 'border-[#e6b441] text-[#005f6e]' : 'border-transparent text-black/45 hover:text-gray-700'}`}
                    onClick={() => setNewsSubTab('approve')}
                  >
                    Phê duyệt tin bài nội bộ
                  </button>
                </div>
              </div>

              {newsSubTab === 'sync' && (
                <Table>
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-4 py-3">Tiêu đề bài viết</th>
                      <th className="px-4 py-3">Ngày đăng</th>
                      <th className="px-4 py-3">Nguồn</th>
                      <th className="px-4 py-3">Trạng thái Public</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-black/85">[VNExpress] 6 sáng kiến ESG của 'Liên minh Xanh' Vietnam Airlines</td>
                      <td className="px-4 py-3 text-sm text-black/45">07/05/2026</td>
                      <td className="px-4 py-3"><Badge variant="primary">Spirit API</Badge></td>
                      <td className="px-4 py-3"><Badge variant="success">Đang hiện</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end items-center">
                          <Button variant="ghost" size="sm" title="Ẩn khỏi Public" className="px-1" onClick={() => handleAction('Đã ẩn bài viết khỏi trang chủ')}><EyeOff size={16} className="text-gray-400 hover:text-red-500" /></Button>
                          <Button variant="ghost" size="sm" title="Sửa" className="px-1"><Edit size={16} className="text-gray-400 hover:text-[#005f6e]" /></Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-black/85">Uỷ ban An toàn Vietnam Airlines họp phiên số 02/2026</td>
                      <td className="px-4 py-3 text-sm text-black/45">29/04/2026</td>
                      <td className="px-4 py-3"><Badge variant="primary">Spirit API</Badge></td>
                      <td className="px-4 py-3"><Badge variant="success">Đang hiện</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end items-center">
                          <Button variant="ghost" size="sm" title="Ẩn khỏi Public" className="px-1" onClick={() => handleAction('Đã ẩn bài viết khỏi trang chủ')}><EyeOff size={16} className="text-gray-400 hover:text-red-500" /></Button>
                          <Button variant="ghost" size="sm" title="Sửa" className="px-1"><Edit size={16} className="text-gray-400 hover:text-[#005f6e]" /></Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 bg-gray-50/50 opacity-60">
                      <td className="px-4 py-3 font-medium text-black/85">[Nội bộ] Thông báo thay đổi quy trình trực lễ</td>
                      <td className="px-4 py-3 text-sm text-black/45">20/04/2026</td>
                      <td className="px-4 py-3"><Badge variant="primary">Spirit API</Badge></td>
                      <td className="px-4 py-3"><Badge variant="secondary">Đã ẩn</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end items-center">
                          <Button variant="ghost" size="sm" title="Hiện lên Public" className="px-1" onClick={() => handleAction('Đã hiển thị bài viết lên trang chủ')}><Eye size={16} className="text-gray-400 hover:text-green-500" /></Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              )}

              {newsSubTab === 'approve' && (
                <Table>
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-4 py-3">Tiêu đề bài viết</th>
                      <th className="px-4 py-3">Ngày gửi</th>
                      <th className="px-4 py-3">Đơn vị / Người gửi</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-black/85">Báo cáo kiểm kê khí nhà kính Quý 1/2026</td>
                      <td className="px-4 py-3 text-sm text-black/45">01/06/2026</td>
                      <td className="px-4 py-3 text-gray-700">Ban Kỹ thuật (Trần Văn E)</td>
                      <td className="px-4 py-3"><Badge variant="warning">Chờ duyệt</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end items-center">
                          <Button variant="ghost" size="sm" title="Xem trước" className="px-1" onClick={() => handleAction('Đang tải nội dung bài viết...', 'info')}><Eye size={16} className="text-gray-400 hover:text-[#005f6e]" /></Button>
                          <Button variant="ghost" size="sm" title="Phê duyệt đăng" className="px-1" onClick={() => handleAction('Đã phê duyệt và xuất bản bài viết lên trang chủ!')}><CheckCircle size={16} className="text-gray-400 hover:text-green-500" /></Button>
                          <Button variant="ghost" size="sm" title="Từ chối" className="px-1" onClick={() => handleAction('Đã từ chối bài viết', 'error')}><XCircle size={16} className="text-gray-400 hover:text-red-500" /></Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              )}
            </Card>
          )}

          {activeTab === 'reports' && (
            <Card className="p-0 overflow-hidden">
              <div className="p-4 bg-gray-50 flex justify-between items-center border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-black/85">Kho Lưu trữ Báo cáo</h3>
                  <p className="text-sm text-black/45">Quản lý file PDF Báo cáo thường niên và Báo cáo bền vững</p>
                </div>
                <Button variant="primary" className="gap-2 bg-[#005f6e] hover:bg-[#004e5a] text-white border-transparent" onClick={() => handleAction('Mở form upload báo cáo mới...', 'info')}>
                  <Upload size={16} /> Tải báo cáo lên
                </Button>
              </div>
              <Table>
                <thead className="bg-gray-50 text-gray-600 font-medium">
                  <tr>
                    <th className="px-4 py-3">Tên Báo cáo</th>
                    <th className="px-4 py-3">Năm xuất bản</th>
                    <th className="px-4 py-3">Phân loại</th>
                    <th className="px-4 py-3">File đính kèm</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-black/85 flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=100&auto=format&fit=crop" className="w-8 h-10 object-cover rounded hover:shadow-md transition-shadow duration-300" alt="cover" />
                      Báo cáo Phát triển Bền vững 2024
                    </td>
                    <td className="px-4 py-3 text-gray-600">2024</td>
                    <td className="px-4 py-3"><Badge variant="success">Bền vững</Badge></td>
                    <td className="px-4 py-3 text-[#005f6e] underline text-sm cursor-pointer">PTBV-2024.pdf</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" title="Sửa"><Edit size={16} className="text-gray-400 hover:text-[#005f6e]" /></Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-black/85 flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=100&auto=format&fit=crop" className="w-8 h-10 object-cover rounded hover:shadow-md transition-shadow duration-300" alt="cover" />
                      Báo cáo Thường niên 2023
                    </td>
                    <td className="px-4 py-3 text-gray-600">2023</td>
                    <td className="px-4 py-3"><Badge variant="primary">Thường niên</Badge></td>
                    <td className="px-4 py-3 text-[#005f6e] underline text-sm cursor-pointer">BCTN-2023.pdf</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" title="Sửa"><Edit size={16} className="text-gray-400 hover:text-[#005f6e]" /></Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          )}

          {activeTab === 'pillars' && (
            <div className="space-y-6">
              {/* Form Workspace */}
              {(() => {
                const activePillar = pillars.find(p => p.id === selectedPillarId)!;
                return (
                  <>
                    {/* Control Header Card */}
                    <Card className="p-4 bg-white border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                      <div>
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                          Cấu hình: Trụ cột {activePillar.code} - {editingLang === 'vi' ? activePillar.nameVi : activePillar.nameEn}
                        </h3>
                        <p className="text-xs text-black/45 mt-0.5">Vui lòng nhập liệu đầy đủ cho cả hai ngôn ngữ Tiếng Việt và Tiếng Anh</p>
                      </div>

                      <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between">
                        {/* Language Switcher */}
                        <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                          <button
                            onClick={() => setEditingLang('vi')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${editingLang === 'vi'
                              ? 'bg-[#005f6e] text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                              }`}
                          >
                            VI: Tiếng Việt
                          </button>
                          <button
                            onClick={() => setEditingLang('en')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${editingLang === 'en'
                              ? 'bg-[#005f6e] text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                              }`}
                          >
                            EN: English
                          </button>
                        </div>

                        {/* Save */}
                        <div className="flex gap-2">
                          {/* <Button
                            variant="primary"
                            className="gap-2 py-1.5 text-xs font-bold bg-[#005f6e] hover:bg-[#004e5a] text-white border-transparent"
                            onClick={() => handleAction(`Đã lưu cấu hình Trụ cột ${activePillar.code} (${editingLang.toUpperCase()}) thành công!`)}
                          >
                            <Save size={14} /> Lưu thay đổi
                          </Button> */}
                        </div>
                      </div>
                    </Card>

                    {/* Section 1: News Highlight Form */}
                    <Card className="p-6 bg-white border-gray-200 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <Newspaper size={18} className="text-[#005f6e]" />
                        <h4 className="font-bold text-sm text-gray-800">1. Cấu hình Bản tin hiển thị ngoài Trang chủ</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">Tiêu đề bài viết (Title)</label>
                          <Input
                            placeholder="Nhập tiêu đề hiển thị trên card tin tức..."
                            value={editingLang === 'vi' ? activePillar.newsTitleVi : activePillar.newsTitleEn}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPillars(pillars.map(p => p.id === activePillar.id ? {
                                ...p,
                                [editingLang === 'vi' ? 'newsTitleVi' : 'newsTitleEn']: val
                              } : p));
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Trụ cột / Danh mục (Category)</label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#005f6e] focus:border-[#005f6e] text-sm"
                            value={editingLang === 'vi' ? activePillar.newsCategoryVi : activePillar.newsCategoryEn}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPillars(pillars.map(p => p.id === activePillar.id ? {
                                ...p,
                                [editingLang === 'vi' ? 'newsCategoryVi' : 'newsCategoryEn']: val
                              } : p));
                            }}
                          >
                            <option value={editingLang === 'vi' ? 'Môi trường' : 'Environment'}>{editingLang === 'vi' ? 'Môi trường' : 'Environment'}</option>
                            <option value={editingLang === 'vi' ? 'Cộng đồng' : 'Community'}>{editingLang === 'vi' ? 'Cộng đồng' : 'Community'}</option>
                            <option value={editingLang === 'vi' ? 'An toàn' : 'Safety'}>{editingLang === 'vi' ? 'An toàn' : 'Safety'}</option>
                            <option value={editingLang === 'vi' ? 'Bền vững' : 'Sustainability'}>{editingLang === 'vi' ? 'Bền vững' : 'Sustainability'}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Ngày xuất bản (Publish Date)</label>
                          <Input
                            type="date"
                            value={activePillar.newsPublishDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPillars(pillars.map(p => p.id === activePillar.id ? { ...p, newsPublishDate: val } : p));
                            }}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">Hình ảnh đại diện (Thumbnail URL)</label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="https://example.com/image.jpg"
                              value={activePillar.newsThumbnail}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPillars(pillars.map(p => p.id === activePillar.id ? { ...p, newsThumbnail: val } : p));
                              }}
                            />
                            <Button variant="outline" className="shrink-0"><Upload size={14} /></Button>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">Đoạn tóm tắt (Excerpt - hiển thị trên Card)</label>
                          <textarea
                            rows={2}
                            placeholder="Mô tả ngắn hiển thị ngoài trang chủ (khoảng 2-3 câu)..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#005f6e] focus:border-[#005f6e] text-sm"
                            value={editingLang === 'vi' ? activePillar.newsExcerptVi : activePillar.newsExcerptEn}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPillars(pillars.map(p => p.id === activePillar.id ? {
                                ...p,
                                [editingLang === 'vi' ? 'newsExcerptVi' : 'newsExcerptEn']: val
                              } : p));
                            }}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">Nội dung chi tiết Bản tin (Body Content - Rich Text)</label>
                          <div className="border border-gray-300 rounded-md overflow-hidden">
                            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
                              <span className="cursor-pointer hover:text-black">Bold</span>
                              <span className="text-gray-300">|</span>
                              <span className="cursor-pointer hover:text-black">Italic</span>
                              <span className="text-gray-300">|</span>
                              <span className="cursor-pointer hover:text-black">Link</span>
                              <span className="text-gray-300">|</span>
                              <span className="cursor-pointer hover:text-black">Insert Image/Video</span>
                            </div>
                            <textarea
                              rows={4}
                              placeholder="Phần bài viết đầy đủ..."
                              className="w-full px-3 py-2 focus:ring-0 focus:border-0 border-none text-sm outline-none resize-y"
                              value={editingLang === 'vi' ? activePillar.newsBodyVi : activePillar.newsBodyEn}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPillars(pillars.map(p => p.id === activePillar.id ? {
                                  ...p,
                                  [editingLang === 'vi' ? 'newsBodyVi' : 'newsBodyEn']: val
                                } : p));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* UX Visual Connector */}
                    <div className="flex flex-col items-center justify-center -my-3 opacity-60">
                      <div className="w-[2px] h-6 bg-gradient-to-b from-[#005f6e] to-[#e6b441]"></div>
                      <div className="bg-[#e6b441]/10 text-[#005f6e] border border-[#e6b441]/30 rounded-full px-4 py-1 text-[10px] font-bold tracking-widest uppercase">
                        Liên kết đến trang chi tiết trụ cột
                      </div>
                      <div className="w-[2px] h-6 bg-gradient-to-b from-[#e6b441] to-[#005f6e]"></div>
                    </div>

                    {/* Section 2: Pillar Detail Form */}
                    <Card className="p-6 bg-white border-gray-200 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <FileText size={18} className="text-[#005f6e]" />
                        <h4 className="font-bold text-sm text-gray-800">2. Cấu hình Bài viết chi tiết Trụ cột (Pillar Details)</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Mã định danh Trụ cột</label>
                          <Input disabled value={`Trụ cột ${activePillar.code}`} />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Tiêu đề bài viết chi tiết</label>
                          <Input
                            placeholder="Nhập tiêu đề trang chi tiết..."
                            value={editingLang === 'vi' ? activePillar.detailTitleVi : activePillar.detailTitleEn}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPillars(pillars.map(p => p.id === activePillar.id ? {
                                ...p,
                                [editingLang === 'vi' ? 'detailTitleVi' : 'detailTitleEn']: val
                              } : p));
                            }}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">Nội dung "Định nghĩa / Giải thích chuyên môn"</label>
                          <textarea
                            rows={3}
                            placeholder="Trả lời câu hỏi: Trụ cột này là gì đối với Vietnam Airlines?"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#005f6e] focus:border-[#005f6e] text-sm"
                            value={editingLang === 'vi' ? activePillar.definitionVi : activePillar.definitionEn}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPillars(pillars.map(p => p.id === activePillar.id ? {
                                ...p,
                                [editingLang === 'vi' ? 'definitionVi' : 'definitionEn']: val
                              } : p));
                            }}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">Nội dung "Cơ chế tuân thủ / Thực tiễn hành động"</label>
                          <textarea
                            rows={3}
                            placeholder="Các chính sách, hoạt động thực tiễn VNA đang áp dụng..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#005f6e] focus:border-[#005f6e] text-sm"
                            value={editingLang === 'vi' ? activePillar.complianceVi : activePillar.complianceEn}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPillars(pillars.map(p => p.id === activePillar.id ? {
                                ...p,
                                [editingLang === 'vi' ? 'complianceVi' : 'complianceEn']: val
                              } : p));
                            }}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">Nội dung "Mục tiêu tương lai" (Lộ trình Net Zero 2030, 2050)</label>
                          <textarea
                            rows={2}
                            placeholder="Định hướng và mục tiêu chiến lược VNA hướng tới..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#005f6e] focus:border-[#005f6e] text-sm"
                            value={editingLang === 'vi' ? activePillar.futureGoalsVi : activePillar.futureGoalsEn}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPillars(pillars.map(p => p.id === activePillar.id ? {
                                ...p,
                                [editingLang === 'vi' ? 'futureGoalsVi' : 'futureGoalsEn']: val
                              } : p));
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Tên tài liệu đính kèm (Tùy chọn)</label>
                          <Input
                            placeholder="Ví dụ: Chính sách bảo vệ môi trường VNA.pdf"
                            value={editingLang === 'vi' ? activePillar.attachmentNameVi : activePillar.attachmentNameEn}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPillars(pillars.map(p => p.id === activePillar.id ? {
                                ...p,
                                [editingLang === 'vi' ? 'attachmentNameVi' : 'attachmentNameEn']: val
                              } : p));
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Link tài liệu đính kèm (URL)</label>
                          <Input
                            placeholder="https://vietnamairlines.com/pdf/policy.pdf"
                            value={activePillar.attachmentUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPillars(pillars.map(p => p.id === activePillar.id ? { ...p, attachmentUrl: val } : p));
                            }}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">Đường dẫn Biểu đồ (Dữ liệu hình ảnh - Tùy chọn)</label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="https://example.com/chart.png"
                              value={activePillar.chartUrl}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPillars(pillars.map(p => p.id === activePillar.id ? { ...p, chartUrl: val } : p));
                              }}
                            />
                            <Button variant="outline" className="shrink-0"><Upload size={14} /></Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-[#0d1525]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">

            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={20} className="text-[#005f6e]" />
                <h2 className="text-lg font-bold text-black/85">
                  Giao diện giả lập: vietnam-airlines-sustainability-v2.0
                </h2>
                <Badge variant="primary" className="text-[10px] py-0.5 bg-[#005f6e]/10 text-[#005f6e] border-none font-bold">Xem trước thực tế</Badge>
              </div>
              <div className="flex items-center gap-4">
                {/* Language Switcher inside Preview */}
                <div className="flex rounded-md border border-gray-300 p-0.5 bg-white">
                  <button
                    onClick={() => setPreviewLang('vi')}
                    className={`px-2.5 py-1 rounded text-[10px] font-extrabold ${previewLang === 'vi' ? 'bg-[#005f6e] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    VI
                  </button>
                  <button
                    onClick={() => setPreviewLang('en')}
                    className={`px-2.5 py-1 rounded text-[10px] font-extrabold ${previewLang === 'en' ? 'bg-[#005f6e] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    EN
                  </button>
                </div>
                <button onClick={() => setShowPreview(false)} className="text-black/45 hover:text-red-500 transition-colors p-1">
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content - The Mock Website UI */}
            <div className="flex-1 overflow-y-auto bg-slate-50 relative">
              {/* Mock Header */}
              <header className="bg-[#005f6e] text-white px-6 py-4 sticky top-0 z-10 flex justify-between items-center shadow-md border-b border-white/10">
                <div className="font-extrabold text-xl tracking-wider text-[#e6b441] flex items-center gap-2 cursor-pointer" onClick={() => setPreviewPage('home')}>
                  <span className="text-white">VIETNAM AIRLINES</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-[#e6b441] font-semibold">ESG PORTAL</span>
                </div>
                <nav className="hidden md:flex gap-6 text-sm font-semibold">
                  <span className={`cursor-pointer hover:text-[#e6b441] transition-colors ${previewPage === 'home' ? 'text-[#e6b441]' : ''}`} onClick={() => setPreviewPage('home')}>
                    {previewLang === 'vi' ? 'Trang chủ' : 'Home'}
                  </span>
                  <span
                    className={`cursor-pointer hover:text-[#e6b441] transition-colors ${previewPage === 'detail' && previewPillarId === 'environment' ? 'text-[#e6b441]' : ''}`}
                    onClick={() => { setPreviewPage('detail'); setPreviewPillarId('environment'); }}
                  >
                    {previewLang === 'vi' ? 'Môi trường' : 'Environment'}
                  </span>
                  <span
                    className={`cursor-pointer hover:text-[#e6b441] transition-colors ${previewPage === 'detail' && previewPillarId === 'social' ? 'text-[#e6b441]' : ''}`}
                    onClick={() => { setPreviewPage('detail'); setPreviewPillarId('social'); }}
                  >
                    {previewLang === 'vi' ? 'Xã hội' : 'Social'}
                  </span>
                  <span
                    className={`cursor-pointer hover:text-[#e6b441] transition-colors ${previewPage === 'detail' && previewPillarId === 'governance' ? 'text-[#e6b441]' : ''}`}
                    onClick={() => { setPreviewPage('detail'); setPreviewPillarId('governance'); }}
                  >
                    {previewLang === 'vi' ? 'Quản trị' : 'Governance'}
                  </span>
                </nav>
              </header>

              {previewPage === 'home' ? (
                <div className="animate-in fade-in duration-200">
                  {/* Mock Banner */}
                  <section className="relative h-[320px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[#005f6e]/75 z-10 mix-blend-multiply"></div>
                    <img
                      src={visionData.bannerUrl}
                      alt="Banner"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop";
                      }}
                    />
                    <div className="relative z-20 text-center px-4 max-w-3xl">
                      <div className="inline-block bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider mb-4">
                        {previewLang === 'vi' ? 'Cam kết Net Zero 2050' : 'Net Zero 2050 Commitment'}
                      </div>
                      <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight drop-shadow-md">
                        {previewLang === 'vi' ? visionData.headline : 'Reaching Sustainable Heights'}
                      </h1>
                      <p className="text-sm md:text-base text-gray-200 mb-6 font-light max-w-2xl mx-auto drop-shadow">
                        {previewLang === 'vi' ? visionData.subheadline : "Vietnam Airlines' commitment to a green future, a prosperous society, and transparent governance."}
                      </p>
                      <button
                        onClick={() => {
                          const el = document.getElementById('preview-pillars-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-[#e6b441] hover:bg-[#d4a330] text-[#005f6e] font-bold text-xs border-none px-6 py-2.5 rounded-full shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        {previewLang === 'vi' ? 'Khám phá ngay' : 'Explore Now'}
                      </button>
                    </div>
                  </section>

                  {/* Mock CEO Message */}
                  <section className="py-12 px-6 bg-white border-b border-gray-100">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 border-2 border-[#e6b441] shadow-md">
                        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop" alt="CEO" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-vna-gold font-bold tracking-widest uppercase text-xs mb-2 block">
                          {previewLang === 'vi' ? 'Thông điệp từ Ban lãnh đạo' : "CEO's Message"}
                        </span>
                        <h3 className="text-xl font-bold text-[#005f6e] mb-4">
                          {previewLang === 'vi' ? 'Cầu nối cho sự phát triển bền vững' : 'Bridging Sustainable Development'}
                        </h3>
                        <p className="text-gray-600 text-sm italic mb-4 leading-relaxed pl-4 border-l-2 border-[#e6b441]">
                          {previewLang === 'vi' ? visionData.ceoMessage : `"At Vietnam Airlines, sustainable development is not an option, but a mission. We believe every flight carries a responsibility towards our environment and society."`}
                        </p>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{previewLang === 'vi' ? visionData.ceoName : 'Mr. Le Hong Ha'}</p>
                          <p className="text-[#005f6e] text-xs font-semibold">{previewLang === 'vi' ? visionData.ceoTitle : 'CEO of Vietnam Airlines'}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Pillars Section */}
                  <section id="preview-pillars-section" className="py-12 px-6 bg-slate-50 border-b border-gray-100">
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-10">
                        <span className="text-[#e6b441] font-bold tracking-widest uppercase text-xs">
                          {previewLang === 'vi' ? 'Chiến lược trọng tâm' : 'Core Pillars'}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-[#005f6e] mt-1">
                          {previewLang === 'vi' ? '3 TRỤ CỘT PHÁT TRIỂN BỀN VỮNG' : 'SUSTAINABLE DEVELOPMENT PILLARS'}
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pillars.map((p) => {
                          let IconComp = Leaf;
                          let themeColor = 'text-[#005f6e] bg-[#005f6e]/10 border-[#005f6e]/20';
                          if (p.id === 'social') {
                            IconComp = Users;
                            themeColor = 'text-vna-gold bg-vna-gold/10 border-vna-gold/20';
                          }
                          if (p.id === 'governance') {
                            IconComp = Landmark;
                            themeColor = 'text-[#005f6e] bg-[#005f6e]/10 border-[#005f6e]/20';
                          }

                          return (
                            <div key={p.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                              <div>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${themeColor}`}>
                                  <IconComp size={20} />
                                </div>
                                <h4 className="font-bold text-base text-gray-900 mb-2">
                                  Trụ cột {p.code} - {previewLang === 'vi' ? p.nameVi : p.nameEn}
                                </h4>
                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
                                  {previewLang === 'vi' ? p.definitionVi : p.definitionEn}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setPreviewPillarId(p.id);
                                  setPreviewPage('detail');
                                }}
                                className="flex items-center gap-1.5 text-xs font-bold text-[#005f6e] hover:text-[#004e5a] text-left mt-2"
                              >
                                {previewLang === 'vi' ? 'Xem chi tiết chiến lược' : 'View Strategy Details'}
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  {/* News Section */}
                  <section className="py-12 px-6 bg-white">
                    <div className="max-w-5xl mx-auto">
                      <div className="text-center mb-10">
                        <span className="text-[#005f6e] font-bold tracking-widest uppercase text-xs">Spirit of VNA</span>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">
                          {previewLang === 'vi' ? 'Tin tức & Hoạt động' : 'News & Activities'}
                        </h2>
                        <p className="text-xs text-gray-500 mt-2 max-w-xl mx-auto">
                          {previewLang === 'vi'
                            ? 'Cập nhật hoạt động thực tiễn theo 3 trụ cột phát triển bền vững của Vietnam Airlines.'
                            : 'Stay updated with Vietnam Airlines\' practical ESG activities across the 3 pillars.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pillars.map((p) => {
                          const category = previewLang === 'vi' ? p.newsCategoryVi : p.newsCategoryEn;
                          const title = previewLang === 'vi' ? p.newsTitleVi : p.newsTitleEn;
                          const excerpt = previewLang === 'vi' ? p.newsExcerptVi : p.newsExcerptEn;

                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                setPreviewPillarId(p.id);
                                setPreviewPage('detail');
                              }}
                              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col"
                            >
                              <div className="h-44 overflow-hidden relative">
                                <img
                                  src={p.newsThumbnail}
                                  alt={title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=400&auto=format&fit=crop";
                                  }}
                                />
                                <span className="absolute top-3 left-3 bg-[#005f6e] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  {category}
                                </span>
                              </div>
                              <div className="p-4 flex flex-col flex-1 justify-between">
                                <div>
                                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2 font-medium">
                                    <Calendar size={10} />
                                    <span>{p.newsPublishDate || '07/05/2026'}</span>
                                  </div>
                                  <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#005f6e] transition-colors line-clamp-2 mb-2">
                                    {title}
                                  </h4>
                                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4">
                                    {excerpt}
                                  </p>
                                </div>
                                <div className="flex items-center text-xs font-bold text-[#005f6e] group-hover:text-[#e6b441] transition-colors mt-auto pt-2 border-t border-gray-50">
                                  {previewLang === 'vi' ? 'Xem bài viết chi tiết' : 'Read Detail Article'}
                                  <ArrowRight size={12} className="ml-1" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                /* Detail Page View */
                (() => {
                  const p = pillars.find(item => item.id === previewPillarId) || pillars[0];
                  const title = previewLang === 'vi' ? p.detailTitleVi : p.detailTitleEn;
                  const definition = previewLang === 'vi' ? p.definitionVi : p.definitionEn;
                  const compliance = previewLang === 'vi' ? p.complianceVi : p.complianceEn;
                  const goals = previewLang === 'vi' ? p.futureGoalsVi : p.futureGoalsEn;
                  const attachmentName = previewLang === 'vi' ? p.attachmentNameVi : p.attachmentNameEn;

                  return (
                    <div className="animate-in fade-in duration-200">
                      {/* Hero banner */}
                      <div className="relative h-[220px] bg-slate-900 flex items-end">
                        <img
                          src={p.newsThumbnail}
                          alt={title}
                          className="absolute inset-0 w-full h-full object-cover opacity-35"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop";
                          }}
                        />
                        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-6 text-white">
                          <button
                            onClick={() => setPreviewPage('home')}
                            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white mb-3 hover:bg-white/10 px-3 py-1 rounded-full transition-all border border-white/20 w-fit"
                          >
                            <ArrowLeft size={12} /> {previewLang === 'vi' ? 'Quay lại Tổng quan' : 'Back to Overview'}
                          </button>
                          <span className="text-[10px] uppercase tracking-widest text-[#e6b441] font-bold block mb-1">
                            {previewLang === 'vi' ? 'Chi tiết Chiến lược Trụ cột' : 'Pillar Strategy Details'}
                          </span>
                          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
                            {title}
                          </h2>
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="max-w-4xl mx-auto px-6 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                          {/* Left Column: Details */}
                          <div className="md:col-span-2 space-y-6">

                            {/* Definition Card */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                              <h3 className="font-bold text-sm text-[#005f6e] border-b border-gray-100 pb-2">
                                {previewLang === 'vi' ? '1. Định nghĩa & Ý nghĩa Chuyên môn' : '1. Definition & Professional Meaning'}
                              </h3>
                              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {definition}
                              </p>
                            </div>

                            {/* Compliance Practices Card */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                              <h3 className="font-bold text-sm text-[#005f6e] border-b border-gray-100 pb-2">
                                {previewLang === 'vi' ? '2. Cơ chế tuân thủ & Thực tiễn hành động' : '2. Compliance Mechanisms & Actions'}
                              </h3>
                              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {compliance}
                              </p>
                            </div>

                            {/* Future Goals Card */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                              <h3 className="font-bold text-sm text-[#005f6e] border-b border-gray-100 pb-2">
                                {previewLang === 'vi' ? '3. Mục tiêu tương lai (2030 - 2050)' : '3. Future Strategic Goals (2030 - 2050)'}
                              </h3>
                              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {goals}
                              </p>
                            </div>
                          </div>

                          {/* Right Column: Sidebar (Chart and Documents) */}
                          <div className="space-y-6">

                            {/* Chart Card */}
                            {p.chartUrl && (
                              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                                <h4 className="font-bold text-xs text-gray-800">
                                  {previewLang === 'vi' ? 'Dữ liệu Biểu đồ Chỉ số' : 'Metric Chart Data'}
                                </h4>
                                <div className="rounded-lg overflow-hidden border border-gray-100 aspect-video">
                                  <img
                                    src={p.chartUrl}
                                    alt="Pillar Chart"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=400&auto=format&fit=crop";
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Attached Documents */}
                            <div className="bg-[#005f6e]/5 p-5 rounded-2xl border border-[#005f6e]/10 space-y-3">
                              <h4 className="font-bold text-xs text-[#005f6e] flex items-center gap-1.5">
                                <FileText size={14} />
                                {previewLang === 'vi' ? 'Tài liệu liên quan' : 'Related Documents'}
                              </h4>
                              {attachmentName ? (
                                <a
                                  href={p.attachmentUrl || '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block p-2 bg-white rounded-lg border border-gray-200 hover:border-[#005f6e] text-left transition-all group"
                                >
                                  <div className="text-[11px] font-bold text-gray-700 group-hover:text-[#005f6e] truncate">
                                    {attachmentName}
                                  </div>
                                  <div className="text-[9px] text-[#005f6e] mt-1 underline">
                                    {previewLang === 'vi' ? 'Tải xuống chính sách' : 'Download Policy'}
                                  </div>
                                </a>
                              ) : (
                                <p className="text-[10px] text-gray-400 italic">
                                  {previewLang === 'vi' ? 'Không có tài liệu đính kèm.' : 'No attachments available.'}
                                </p>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Mock Footer area to make preview scrollable */}
              <footer className="bg-gray-800 text-gray-400 p-8 text-center text-xs border-t border-gray-700">
                <p>&copy; 2026 Vietnam Airlines ESG Public Portal. All rights reserved.</p>
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
