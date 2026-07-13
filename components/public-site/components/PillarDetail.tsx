import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Share2, Printer, ChevronRight, BarChart3, PieChart, ShieldCheck } from 'lucide-react';
import { DETAIL_CONTENT, DETAIL_CONTENT_EN } from '../constants';
import { FuelMixChart, EmissionsChart, DiversityChart, SocialImpactChart, SafetyScoreChart } from './Charts';

interface PillarDetailProps {
  pillarId: string;
  onBack: () => void;
}

const PillarDetail: React.FC<PillarDetailProps> = ({ pillarId, onBack }) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const detailContentMap = isEn ? DETAIL_CONTENT_EN : DETAIL_CONTENT;
  
  // Safe cast or lookup, fallback to environment if not found
  const content = detailContentMap[pillarId as keyof typeof detailContentMap] || detailContentMap.environment;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pillarId]);

  // Define which charts to show based on pillar
  const renderDashboard = () => {
    switch (pillarId) {
      case 'environment':
        return (
          <div className="grid md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-800">{isEn ? 'SAF Adoption Roadmap' : 'Lộ trình sử dụng SAF'}</h4>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">{isEn ? '2030 Target' : 'Mục tiêu 2030'}</span>
                </div>
                <FuelMixChart />
                <p className="text-xs text-gray-500 mt-2 text-center">{isEn ? 'Sustainable fuel proportion in total consumption' : 'Tỷ lệ nhiên liệu bền vững trong tổng tiêu thụ'}</p>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800">{isEn ? 'Carbon Efficiency' : 'Hiệu quả carbon'}</h4>
                    <span className="text-xs font-semibold text-vna-blue bg-blue-50 px-3 py-1 rounded-full">-15% vs 2019</span>
                </div>
                <EmissionsChart />
                <p className="text-xs text-gray-500 mt-2 text-center">{isEn ? 'Emissions reduction per passenger.km' : 'Giảm phát thải trên mỗi hành khách.km'}</p>
             </div>
          </div>
        );
      case 'social':
        return (
             <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-800">{isEn ? 'Gender Diversity' : 'Cơ cấu Giới tính'}</h4>
                        <span className="text-xs font-semibold text-vna-blue bg-blue-50 px-3 py-1 rounded-full">{isEn ? 'Diverse' : 'Đa dạng'}</span>
                    </div>
                    <DiversityChart />
                    <p className="text-xs text-gray-500 mt-2 text-center">{isEn ? 'Male/Female ratio system-wide' : 'Tỷ lệ Nam/Nữ trong toàn hệ thống'}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-800">{isEn ? 'Social Impact' : 'Tác động Xã hội'}</h4>
                        <span className="text-xs font-semibold text-vna-blue bg-blue-50 px-3 py-1 rounded-full">2024</span>
                    </div>
                    <SocialImpactChart />
                    <p className="text-xs text-gray-500 mt-2 text-center">{isEn ? 'Number of program beneficiaries' : 'Số lượng người hưởng lợi từ các chương trình'}</p>
                </div>
             </div>
        );
      case 'governance':
        return (
             <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-800">{isEn ? 'Compliance & Safety Index' : 'Chỉ số Tuân thủ & An toàn'}</h4>
                        <span className="text-xs font-semibold text-vna-blue bg-blue-50 px-3 py-1 rounded-full">{isEn ? '100% Met' : '100% Đạt'}</span>
                    </div>
                    <SafetyScoreChart />
                    <p className="text-xs text-gray-500 mt-2 text-center">{isEn ? 'Periodic evaluation results 2024' : 'Kết quả đánh giá định kỳ 2024'}</p>
                </div>
                {/* Metric Card instead of chart for variety */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <h4 className="font-bold text-slate-800 mb-6">{isEn ? 'Board of Directors Structure' : 'Cơ cấu Hội đồng quản trị'}</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{isEn ? 'Independent Members' : 'Thành viên độc lập'}</span>
                            <span className="font-bold text-vna-blue">33%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{isEn ? 'Female Members' : 'Thành viên nữ'}</span>
                            <span className="font-bold text-vna-blue">25%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{isEn ? 'Executive Members' : 'Thành viên điều hành'}</span>
                            <span className="font-bold text-vna-blue">42%</span>
                        </div>
                    </div>
                </div>
             </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans animate-fade-in">
      {/* HEADER IMAGE */}
      <div className="relative h-[40vh] min-h-[300px]">
        <img 
            src={content.heroImage} 
            alt={content.title}
            className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#005F6E]/70 mix-blend-multiply"></div>
        <div className="absolute inset-0 flex flex-col justify-center container mx-auto px-6 text-white pt-10">
            <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white mb-6 w-fit hover:bg-white/10 px-4 py-2 rounded-full transition-all border border-white/20">
                <ArrowLeft size={18} /> {isEn ? 'Back to Overview' : 'Quay lại Tổng quan'}
            </button>
            <span className="uppercase tracking-widest text-vna-gold font-bold text-sm mb-3">{isEn ? 'Strategy Details' : 'Chi tiết Chiến lược'}</span>
            <h1 className="text-4xl md:text-6xl font-black max-w-4xl leading-tight text-white drop-shadow-md">{content.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 relative -mt-20 z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-14 border border-gray-100 min-h-[500px]">
            
            {/* INTRO SECTION */}
            <div className="max-w-3xl mx-auto text-center mb-16">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-light">"{content.intro}"</p>
                <div className="flex justify-center gap-4 mt-8">
                     <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-600">
                        <Share2 size={16} /> {isEn ? 'Share' : 'Chia sẻ'}
                     </button>
                     <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-600">
                        <Printer size={16} /> {isEn ? 'Print' : 'In trang'}
                     </button>
                     <button className="flex items-center gap-2 px-6 py-2.5 bg-vna-blue text-white rounded-full text-sm font-bold hover:bg-vna-blue/90 shadow-md transition-all">
                        <Download size={16} /> {isEn ? 'Download Report' : 'Tải báo cáo chi tiết'}
                     </button>
                </div>
            </div>

            {/* DASHBOARD SECTION */}
            <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="text-vna-gold" size={28} />
                    <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">{isEn ? 'Data & Key Indicators' : 'Dữ liệu & Chỉ số chính'}</h3>
                </div>
                <div className="bg-slate-50 rounded-3xl p-8 border border-gray-200 shadow-inner">
                    {renderDashboard()}
                </div>
            </div>

            {/* TEXT CONTENT */}
            <div className="grid md:grid-cols-12 gap-16">
                <div className="md:col-span-8 space-y-12 text-justify">
                    {content.contentSections.map((section, idx) => (
                        <div key={idx} className="group">
                            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                {section.heading}
                            </h3>
                            <p className="text-gray-700 leading-relaxed text-base md:text-lg font-light">
                                {section.text}
                            </p>
                        </div>
                    ))}
                </div>

                {/* SIDEBAR */}
                <div className="md:col-span-4 space-y-8 text-left">
                    <div className="bg-vna-blue text-white p-8 rounded-2xl shadow-lg border-t-4 border-vna-gold">
                        <h4 className="font-bold text-xl mb-6 flex items-center gap-3">
                            <ShieldCheck size={24} className="text-vna-gold" />
                            {isEn ? 'Our Commitment' : 'Cam kết của chúng tôi'}
                        </h4>
                        <ul className="space-y-4 text-sm text-white/95 font-light">
                            <li className="flex items-start gap-3">
                                <ChevronRight size={18} className="mt-0.5 text-vna-gold flex-shrink-0" />
                                <span className="leading-relaxed">{isEn ? 'Compliance with highest international standards (GRI, ICAO).' : 'Tuân thủ các chuẩn mực quốc tế cao nhất (GRI, ICAO).'}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <ChevronRight size={18} className="mt-0.5 text-vna-gold flex-shrink-0" />
                                <span className="leading-relaxed">{isEn ? 'Transparency in emission data and social impact.' : 'Minh bạch hóa dữ liệu phát thải và tác động xã hội.'}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <ChevronRight size={18} className="mt-0.5 text-vna-gold flex-shrink-0" />
                                <span className="leading-relaxed">{isEn ? 'Listening to feedback from community and stakeholders.' : 'Lắng nghe phản hồi từ cộng đồng và các bên liên quan.'}</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-slate-50 border border-gray-200 p-8 rounded-2xl">
                        <h4 className="font-bold text-slate-800 mb-3 text-lg">{isEn ? 'Contact ESG Department' : 'Liên hệ phòng ESG'}</h4>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{isEn ? 'Have questions about our ' : 'Bạn có câu hỏi hoặc cần giải đáp về chiến lược '}{content.title.split('&')[0]}{isEn ? ' strategy?' : '?'}</p>
                        <a href="mailto:esg@vietnamairlines.com" className="block text-center w-full py-3 rounded-xl bg-white border border-vna-blue text-vna-blue font-bold hover:bg-vna-blue hover:text-white hover:border-vna-blue shadow-sm transition-all">
                            {isEn ? 'Send Email' : 'Gửi Email'}
                        </a>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default PillarDetail;