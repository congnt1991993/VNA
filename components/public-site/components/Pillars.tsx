import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PILLAR_DATA, PILLAR_DATA_EN } from '../constants';
import { ChevronRight, Leaf, Users, Landmark, TrendingUp, CheckCircle2 } from 'lucide-react';
import { ESGPillar } from '../types';

const Icons = {
  [ESGPillar.ENVIRONMENT]: Leaf,
  [ESGPillar.SOCIAL]: Users,
  [ESGPillar.GOVERNANCE]: Landmark,
  ['economic']: TrendingUp,
};

interface PillarsProps {
  onDetailClick?: (id: string) => void;
}

const Pillars: React.FC<PillarsProps> = ({ onDetailClick }) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const pillarData = isEn ? PILLAR_DATA_EN : PILLAR_DATA;

  const [activeTab, setActiveTab] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState<{
    label: string;
    value: string;
    unit: string;
    description: string;
    pillarId: string;
    type?: 'metric' | 'chart';
  } | null>(null);

  const getMetricDetailedText = (label: string, isEn: boolean): string => {
    const normLabel = label.toLowerCase().trim();
    
    if (normLabel.includes('co2') || normLabel.includes('cacbon')) {
      return isEn 
        ? "Vietnam Airlines is actively optimizing flight operations using modern new-generation aircraft fleets (Boeing 787, Airbus A350), directly reducing fuel consumption and CO2 emissions per flight. We aim to achieve net-zero carbon by 2050 and adopt Sustainable Aviation Fuel (SAF) on international routes."
        : "Vietnam Airlines đang không ngừng nỗ lực tối ưu hóa hoạt động bay bằng cách sử dụng các dòng máy bay hiện đại thế hệ mới (Boeing 787, Airbus A350), giúp giảm thiểu trực tiếp lượng nhiên liệu tiêu thụ và khí thải CO2 trên mỗi chuyến bay. Chúng tôi đặt mục tiêu giảm phát thải ròng về 0 vào năm 2050 và triển khai sử dụng Nhiên liệu hàng không bền vững (SAF) trên các đường bay quốc tế.";
    }
    
    if (normLabel.includes('rác thải') || normLabel.includes('plastic') || normLabel.includes('nhựa')) {
      return isEn
        ? "The single-use plastics reduction program on Vietnam Airlines flights has successfully eliminated millions of plastic items such as cups, straws, blanket bags, and plastic cutlery. Instead, we use eco-friendly alternatives made from sugarcane bagasse, biodegradable paper, and bamboo."
        : "Chương trình cắt giảm nhựa dùng một lần trên các chuyến bay của Vietnam Airlines đã giúp loại bỏ hàng triệu vật phẩm nhựa như cốc, ống hút, túi đựng chăn ga và thìa dĩa nhựa. Thay vào đó, chúng tôi sử dụng các vật liệu thân thiện với môi trường làm từ bã mía, giấy tự hủy sinh học và tre.";
    }
    
    if (normLabel.includes('chuyến bay') || normLabel.includes('flights') || normLabel.includes('yêu thương')) {
      return isEn
        ? "Vietnam Airlines is proud to connect humanitarian journeys, transporting hundreds of tons of medical equipment, vaccines, and supporting medical teams to participate in emergency relief in areas affected by natural disasters and storms. Flights of Love also transport underprivileged workers and students to reunite with families."
        : "Vietnam Airlines tự hào kết nối các hành trình nhân đạo, vận chuyển miễn phí hàng trăm tấn trang thiết bị y tế, vaccine phòng dịch, và hỗ trợ các đoàn y bác sĩ tham gia cứu trợ khẩn cấp tại các vùng chịu thiên tai, bão lũ. Những chuyến bay yêu thương còn giúp đưa người lao động, học sinh nghèo có hoàn cảnh khó khăn trở về quê hương đoàn tụ.";
    }
    
    if (normLabel.includes('nhân sự') || normLabel.includes('female') || normLabel.includes('nữ')) {
      return isEn
        ? "Vietnam Airlines is committed to creating an equal, diverse, and non-discriminatory working environment. With female staff accounting for 45% of total employees, we promote gender equality by empowering and nurturing female leaders, aiming to increase female senior management to over 30%."
        : "Vietnam Airlines cam kết kiến tạo môi trường làm việc bình đẳng, đa dạng và không phân biệt đối xử. Với tỷ lệ nhân sự nữ chiếm 45% tổng nhân viên toàn hệ thống, chúng tôi tự hào thúc đẩy bình đẳng giới thông qua việc trao cơ hội và bồi dưỡng lãnh đạo nữ, đặt mục tiêu nâng tỷ lệ quản lý cấp cao là nữ đạt trên 30%.";
    }
    
    if (normLabel.includes('tuân thủ') || normLabel.includes('compliance')) {
      return isEn
        ? "Complying 100% with the strict aviation safety standards of ICAO and the International Air Transport Association (IATA). This core principle is the ultimate foundation for all Vietnam Airlines operations, ensuring the absolute safety of passengers and flight crews."
        : "Tuân thủ 100% các tiêu chuẩn an toàn hàng không ngặt nghèo của ICAO và Hiệp hội vận tải hàng không quốc tế (IATA). Đây là tôn chỉ cốt lõi, là nền tảng tối thượng cho mọi hoạt động khai thác của Vietnam Airlines nhằm bảo vệ tuyệt đối tính mạng của hành khách và tổ bay.";
    }
    
    if (normLabel.includes('hội đồng') || normLabel.includes('board')) {
      return isEn
        ? "A modern corporate governance model approaching international standards, with a ratio of 1/3 independent Board members to enhance objectivity and transparency in strategic decisions, protecting the legitimate interests of all stakeholders."
        : "Mô hình quản trị doanh nghiệp hiện đại tiệm cận chuẩn mực quốc tế, với tỷ lệ 1/3 thành viên Hội đồng quản trị độc lập để nâng cao tính khách quan, minh bạch trong các quyết định chiến lược, bảo vệ lợi ích hợp pháp của tất cả cổ đông.";
    }

    return isEn 
      ? "Specific details and implementation progress of this metric are recorded in the annual ESG Sustainability Report of Vietnam Airlines."
      : "Chi tiết cụ thể và tiến độ thực hiện chỉ số này được ghi nhận trong Báo cáo Phát triển Bền vững ESG thường niên của Vietnam Airlines.";
  };

  return (
    <section id="pillars" className="min-h-[calc(100vh-80px)] py-12 md:py-16 bg-slate-50 relative overflow-hidden flex flex-col justify-center">
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-vna-blue/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-vna-gold/10 rounded-full blur-3xl"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-8 block flex flex-col items-center">
          <span className="text-vna-gold font-bold tracking-widest uppercase text-xs mb-2 flex items-center gap-2">
            <span className="w-8 h-1 bg-vna-gold rounded-full"></span>
            {isEn ? 'Core Strategy' : 'Chiến lược trọng tâm'}
            <span className="w-8 h-1 bg-vna-gold rounded-full"></span>
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1 tracking-tight uppercase">
            {isEn ? 'SUSTAINABLE DEVELOPMENT PILLARS' : 'CÁC TRỤ CỘT PHÁT TRIỂN BỀN VỮNG'}
          </h2>
          <p className="text-gray-600 mt-3 max-w-3xl mx-auto text-base leading-relaxed">
            {isEn ? 'We integrate ESG principles into every business operation to create long-term sustainable value for people and the planet.' : 'Chúng tôi tích hợp các nguyên tắc ESG vào mọi hoạt động kinh doanh để tạo ra giá trị bền vững lâu dài cho con người và hành tinh.'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {pillarData.map((pillar, index) => {
            const Icon = Icons[pillar.type as keyof typeof Icons];
            return (
              <button
                key={pillar.id}
                onClick={() => setActiveTab(index)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-base font-semibold transition-all duration-300 border ${
                  activeTab === index
                    ? 'bg-gradient-to-r from-vna-blue to-[#004e5a] text-white border-transparent shadow-lg shadow-vna-blue/30 transform scale-105'
                    : 'bg-white/80 backdrop-blur text-gray-500 border-gray-200 hover:border-vna-gold hover:text-vna-blue'
                }`}
              >
                {Icon && <Icon size={18} />}
                {isEn && pillar.type === ESGPillar.ENVIRONMENT ? 'Environment' : 
                 isEn && pillar.type === ESGPillar.SOCIAL ? 'Social' : 
                 isEn && pillar.type === ESGPillar.GOVERNANCE ? 'Governance' : pillar.type}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="grid md:grid-cols-2 gap-8 items-center min-h-[350px]">
          <div className="relative h-[280px] md:h-[360px] rounded-2xl overflow-hidden shadow-2xl group">
             {/* Animated Image Transition */}
            <img
              src={pillarData[activeTab].image}
              alt={pillarData[activeTab].title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white z-20">
                <h3 className="text-2xl font-bold pb-2 border-b-4 border-vna-gold inline-block tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {pillarData[activeTab].title}
                </h3>
            </div>
          </div>

          <div className="space-y-6 text-justify">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
              {pillarData[activeTab].description}
            </h3>

            {/* Compliance Section */}
            {pillarData[activeTab].compliances && (
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                  {isEn ? 'Standards & Compliance Mechanisms' : 'Tiêu chuẩn & Cơ chế tuân thủ'}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {pillarData[activeTab].compliances?.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-50 text-slate-800 border border-slate-200 shadow-sm">
                      <CheckCircle2 size={16} className="text-vna-gold" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6">
              {pillarData[activeTab].metrics.map((metric, idx) => {
                if (metric.type === 'chart') {
                  return (
                    <div 
                      key={idx}
                      onClick={() => setSelectedMetric({
                        label: metric.label,
                        value: metric.value,
                        unit: metric.unit,
                        description: metric.description,
                        pillarId: pillarData[activeTab].id,
                        type: 'chart'
                      })}
                      className="bg-gradient-to-br from-white to-slate-50/50 p-6 rounded-3xl border-2 border-slate-100 shadow-md hover:shadow-xl hover:border-vna-gold/60 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer text-left flex flex-col justify-between min-h-[250px]"
                      title={isEn ? "Click to view details" : "Click để xem chi tiết"}
                    >
                      <div className="flex justify-between items-start w-full">
                        <h4 className="font-extrabold text-[11px] text-slate-500 uppercase tracking-widest">
                          {metric.label}
                        </h4>
                        <span className="text-[9px] bg-green-50 text-green-700 font-extrabold px-2 py-0.5 rounded border border-green-200">
                          {metric.unit}
                        </span>
                      </div>

                      {/* Bar chart representation */}
                      <div className="flex-1 flex flex-col justify-end mt-4 mb-2">
                        <div className="h-20 flex items-end justify-between px-3 border-b border-slate-200 pb-1">
                          {[
                            { year: "2023", jet: 100, saf: 0 },
                            { year: "2024", jet: 98, saf: 2 },
                            { year: "2025", jet: 95, saf: 5 },
                            { year: "2030", jet: 80, saf: 20 }
                          ].map((d, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 w-1/5">
                              {/* Stacked bar */}
                              <div className="w-5 h-12 bg-slate-100 rounded-sm relative overflow-hidden flex flex-col justify-end">
                                {/* SAF portion (green) */}
                                <div 
                                  className="w-full bg-[#1b8c47]" 
                                  style={{ height: `${d.saf}%` }}
                                ></div>
                                {/* JET A1 portion (gray) */}
                                <div 
                                  className="w-full bg-slate-350" 
                                  style={{ height: `${d.jet - d.saf}%` }}
                                ></div>
                              </div>
                              <span className="text-[8px] text-gray-400 font-bold">{d.year}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Legend */}
                        <div className="flex justify-center gap-3 mt-2 text-[8px] font-bold text-gray-500">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-slate-350 rounded-sm"></span>
                            <span>{isEn ? 'JET A1' : 'JET A1'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-[#1b8c47] rounded-sm"></span>
                            <span>{isEn ? 'SAF' : 'SAF (Xanh)'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-gray-500 font-semibold leading-relaxed border-t border-slate-100 pt-2 mt-1">
                        {metric.description}
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedMetric({
                      label: metric.label,
                      value: metric.value,
                      unit: metric.unit,
                      description: metric.description,
                      pillarId: pillarData[activeTab].id,
                      type: 'metric'
                    })}
                    className="bg-gradient-to-br from-white to-slate-50/50 p-8 rounded-3xl border-2 border-slate-100 shadow-md hover:shadow-xl hover:border-vna-gold/60 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer text-left"
                    title={isEn ? "Click to view details" : "Click để xem chi tiết"}
                  >
                    <div className="text-5xl md:text-6xl font-black text-vna-blue mb-3 tracking-tight">
                      {metric.value} <span className="text-base font-bold text-gray-400 block sm:inline ml-1">{metric.unit}</span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 mb-2 uppercase tracking-widest border-b border-slate-100 pb-2">
                      {metric.label}
                    </div>
                    <div className="text-sm text-gray-500 font-medium leading-relaxed">{metric.description}</div>
                  </div>
                );
              })}
            </div>

            <button 
                onClick={() => onDetailClick && onDetailClick(pillarData[activeTab].id)}
                className="flex items-center gap-3 text-vna-gold font-bold hover:gap-5 hover:text-vna-blue transition-all pt-4 text-lg border-b-2 border-transparent hover:border-vna-gold max-w-max pb-1"
            >
              {isEn ? 'View ' : 'Xem chi tiết chiến lược '}
              {isEn && pillarData[activeTab].type === ESGPillar.ENVIRONMENT ? 'Environment ' : 
               isEn && pillarData[activeTab].type === ESGPillar.SOCIAL ? 'Social ' : 
               isEn && pillarData[activeTab].type === ESGPillar.GOVERNANCE ? 'Governance ' : pillarData[activeTab].type}
              {isEn ? 'Strategy Details' : ''} <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Detail Popup Modal */}
      {selectedMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-150 max-w-lg w-full overflow-hidden transform transition-all duration-300 scale-100 animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Header with theme color */}
            <div className={`p-6 text-white bg-gradient-to-r ${selectedMetric.pillarId === 'environment' ? 'from-teal-700 to-[#005f6e]' : selectedMetric.pillarId === 'social' ? 'from-[#b08420] to-vna-gold' : 'from-slate-700 to-slate-800'} flex justify-between items-center`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold tracking-widest uppercase bg-white/20 px-2.5 py-0.5 rounded">
                  {selectedMetric.pillarId === 'environment' ? (isEn ? 'Environment' : 'Môi trường') : selectedMetric.pillarId === 'social' ? (isEn ? 'Social' : 'Xã hội') : (isEn ? 'Governance' : 'Quản trị')}
                </span>
              </div>
              <button 
                onClick={() => setSelectedMetric(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-all text-sm outline-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6 text-left">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  {isEn ? 'KPI Metric' : 'Chỉ số Chỉ tiêu'}
                </span>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-wide">
                  {selectedMetric.label}
                </h3>
              </div>

              {/* Highlight number card or Chart view */}
              {selectedMetric.type === 'chart' ? (
                <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {isEn ? 'Sustainable Fuel Usage Roadmap' : 'Lộ trình phát triển & Sử dụng SAF'}
                    </span>
                    <span className="text-[10px] bg-green-50 text-green-700 font-extrabold px-2.5 py-0.5 rounded border border-green-200">
                      {selectedMetric.unit}
                    </span>
                  </div>
                  
                  {/* Large high-fidelity bar chart */}
                  <div className="w-full h-36 flex items-end justify-between px-6 border-b border-slate-200 pb-2 mt-2">
                    {[
                      { year: "2023", jet: 100, saf: 0 },
                      { year: "2024", jet: 98, saf: 2 },
                      { year: "2025", jet: 95, saf: 5 },
                      { year: "2030", jet: 80, saf: 20 }
                    ].map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 w-1/5 text-center">
                        <div className="w-8 h-24 bg-slate-100 rounded-sm relative overflow-hidden flex flex-col justify-end shadow-3xs">
                          {/* SAF portion */}
                          <div 
                            className="w-full bg-[#1b8c47] relative" 
                            style={{ height: `${d.saf}%` }}
                          >
                            {d.saf > 0 && (
                              <span className="absolute inset-x-0 -top-4 text-[9px] font-black text-[#1b8c47] text-center">
                                {d.saf}%
                              </span>
                            )}
                          </div>
                          {/* JET A1 portion */}
                          <div 
                            className="w-full bg-slate-350" 
                            style={{ height: `${d.jet - d.saf}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold">{d.year}</span>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center gap-6 mt-4 text-[10px] font-bold text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-slate-350 rounded-sm shadow-3xs"></span>
                      <span>{isEn ? 'JET A1 Fuel' : 'Nhiên liệu JET A1'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#1b8c47] rounded-sm shadow-3xs"></span>
                      <span>{isEn ? 'SAF Fuel (Green)' : 'Nhiên liệu SAF (Xanh)'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-vna-blue tracking-tight">
                    {selectedMetric.value}
                  </span>
                  {selectedMetric.unit && (
                    <span className="text-sm font-bold text-gray-500">
                      {selectedMetric.unit}
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {isEn ? 'Scope & Implementation Details' : 'Phạm vi & Chi tiết hành động'}
                </h4>
                <p className="text-slate-700 font-bold text-sm leading-relaxed">
                  {selectedMetric.description}
                </p>
                <p className="text-slate-550 text-xs leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {getMetricDetailedText(selectedMetric.label, isEn)}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedMetric(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-all outline-none"
              >
                {isEn ? 'Close' : 'Đóng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Pillars;