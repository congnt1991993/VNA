import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PILLAR_DATA, PILLAR_DATA_EN } from '../constants';
import { ChevronRight, Leaf, Users, Landmark, TrendingUp } from 'lucide-react';
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

          <div className="space-y-6 text-justify flex flex-col justify-center">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">
              {pillarData[activeTab].description}
            </h3>

            <div className="pt-2">
              <button 
                  onClick={() => onDetailClick && onDetailClick(pillarData[activeTab].id)}
                  className="inline-flex items-center gap-3 text-vna-gold font-bold hover:gap-5 hover:text-vna-blue transition-all text-lg border-b-2 border-transparent hover:border-vna-gold pb-1 cursor-pointer"
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
      </div>
    </section>
  );
};

export default Pillars;
