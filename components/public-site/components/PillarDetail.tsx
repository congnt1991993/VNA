import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  ChevronRight,
  ChevronDown,
  BarChart3,
  ShieldCheck,
  Search,
  ListChecks,
  Leaf,
  Users,
  Landmark,
  Layers,
  ChevronUp,
  Activity,
  FileText
} from 'lucide-react';
import { DETAIL_CONTENT, DETAIL_CONTENT_EN } from '../constants';
import { IndicatorChart } from '../../IndicatorChart';
import indicatorsDataVI from './indicators_main_list.json';
import indicatorsDataEN from './indicators_main_list_en.json';

interface PillarDetailProps {
  pillarId: string;
  onBack: () => void;
}

interface Indicator {
  id: string;
  code: string;
  name: string;
  pillar: string;
  topic: string;
  unit: string;
  frequency: string;
  weight: number;
  department: string;
  sourceForm: string;
  programs: string[];
  inputDept: string;
  approveDept: string;
  monitorDept: string;
  isActive: boolean;
  introduction: string;
}





interface SubChart {
  code: string;
  name: string;
  unit: string;
  source: string;
  frequency: string;
}

const DEFAULT_CHART_DESCRIPTIONS: Record<string, string> = {
  // Môi trường (Environment)
  'GRI 302-1-JETA1': 'Theo dõi tổng lượng tiêu thụ nhiên liệu bay truyền thống (Jet A-1) của toàn đội tàu bay Vietnam Airlines trên mạng đường bay nội địa và quốc tế, phản ánh hiệu quả các chương trình tiết kiệm nhiên liệu và tối ưu kế hoạch bay.',
  'GRI 302-1-SAF': 'Thống kê sản lượng nhiên liệu hàng không bền vững (SAF) được nạp thử nghiệm và ứng dụng định kỳ theo lộ trình giảm phát thải khí nhà kính và chuyển dịch năng lượng xanh của Hãng.',
  'GRI 305-4-ACTUAL': 'Chỉ số cường độ phát thải CO2 trên mỗi đơn vị luân chuyển hành khách và hàng hóa (RTK), đo lường mức độ phát thải trung bình và hiệu suất khai thác xanh của đội tàu bay thế hệ mới A350/B787/A321neo.',
  'GRI 305-1-SUB1': 'Tổng lượng phát thải khí nhà kính trực tiếp (Scope 1) phát sinh chủ yếu từ hoạt động đốt cháy nhiên liệu của động cơ tàu bay và phương tiện cơ giới mặt đất.',
  'GRI 305-2-SUB1': 'Lượng phát thải khí nhà kính gián tiếp (Scope 2) từ tiêu thụ điện năng tại các tòa nhà văn phòng, nhà ga, trung tâm điều hành và xưởng bảo dưỡng kỹ thuật.',
  'GRI 305-3-SUB1': 'Ước tính phát thải khí nhà kính gián tiếp khác (Scope 3) từ chuỗi cung ứng suất ăn, dịch vụ mặt đất thuê ngoài và đi lại công tác của cán bộ nhân viên.',
  'GRI 303-5-SUB1': 'Tổng lượng nước tiêu thụ phục vụ công tác kỹ thuật, vệ sinh tàu bay và sinh hoạt tại các cơ sở mặt đất của Tổng công ty.',
  'GRI 306-3-SUB1': 'Khối lượng và tỷ lệ phân loại, tái chế rác thải rắn phát sinh trên các chuyến bay và tại các khu vực làm việc mặt đất.',

  // Xã hội (Social)
  'AIRLINE-B1-NPS': 'Chỉ số hài lòng và mức độ sẵn sàng giới thiệu của khách hàng (Net Promoter Score) qua các khảo sát độc lập trên toàn mạng bay năm 2024 - 2025, phản ánh chất lượng dịch vụ 4 sao tiêu chuẩn quốc tế SkyTrax.',
  'GRI 404-2-HQ': 'Thời lượng huấn luyện, đào tạo chuyên môn và nâng cao năng lực quản trị dành cho cán bộ nhân viên thuộc Khối Cơ quan Tổng công ty.',
  'GRI 404-2-OPS': 'Tổng số giờ huấn luyện an toàn bay định kỳ, quy trình tác nghiệp tiêu chuẩn và diễn tập ứng phó tình huống khẩn cấp cho lực lượng phi công và tiếp viên.',
  'GRI 404-2-TECH': 'Chương trình đào tạo kỹ thuật định kỳ, chứng chỉ bảo dưỡng tàu bay quốc tế và chuyển giao công nghệ cho đội ngũ kỹ sư bảo dưỡng kỹ thuật.',
  'GRI 404-2-SERVICE': 'Khóa đào tạo văn hóa dịch vụ nâng tầm, kỹ năng chăm sóc khách hàng và quy chuẩn dịch vụ hành khách chuyên nghiệp.',
  'GRI 404-2-COMMERCE': 'Huấn luyện kỹ năng thương mại hàng không, quản trị doanh thu và phát triển thị trường hàng không bền vững.',
  'GRI 401-1-SUB1': 'Tỷ lệ tuyển dụng mới và tỷ lệ biến động nhân sự định kỳ theo từng nhóm tuổi, giới tính và đơn vị công tác.',
  'GRI 403-9-SUB1': 'Thống kê tỷ lệ sự cố tai nạn lao động và các biện pháp bảo hộ, cải thiện điều kiện làm việc cho người lao động toàn Tổng công ty.',
  'GRI 405-1-SUB1': 'Cơ cấu đa dạng lực lượng lao động theo giới tính, độ tuổi và tỷ lệ nữ giới đảm nhiệm các vị trí quản lý lãnh đạo.',

  // Quản trị (Governance)
  'GRI 2-7-PILOTS': 'Cơ cấu tỷ lệ đội ngũ người lái tàu bay (Cơ trưởng, Cơ phó) được phân bổ theo quốc tịch, độ tuổi và thâm niên công tác.',
  'GRI 2-7-CABIN': 'Thống kê lực lượng tiếp viên hàng không phục vụ trên các dòng tàu bay thân rộng và thân hẹp của Vietnam Airlines.',
  'GRI 2-7-TECH': 'Tỷ lệ cơ cấu kỹ sư, nhân viên bảo dưỡng tàu bay có chứng chỉ quốc tế đang làm việc tại các trung tâm bảo dưỡng.',
  'GRI 2-7-GROUND': 'Phân bổ nhân sự khối mặt đất, phục vụ hành khách tại các sân bay căn cứ và các ban chuyên môn cơ quan.',
  'GRI 2-9-IND': 'Số lượng và tỷ lệ thành viên độc lập trong Hội đồng Quản trị nhằm đảm bảo tính minh bạch, khách quan trong các quyết sách chiến lược.',
  'GRI 2-9-EXEC': 'Thành phần thành viên Hội đồng Điều hành trực tiếp chỉ đạo và điều hành hoạt động sản xuất kinh doanh thường nhật của Tổng công ty.',
  'GRI 2-9-NONEXEC': 'Thành phần thành viên không điều hành tham gia giám sát các tiểu ban kiểm toán, quản trị rủi ro và nhân sự.',
  'GRI 205-2-SUB1': 'Tỷ lệ cán bộ nhân viên hoàn thành khóa đào tạo tuân thủ đạo đức kinh doanh và phổ biến chính sách phòng chống tham nhũng.',
  'GRI 418-1-SUB1': 'Số lượng sự cố liên quan đến an toàn an ninh thông tin và bảo mật dữ liệu khách hàng theo tiêu chuẩn ISO 27001 và Nghị định 13/2023/NĐ-CP.'
};

const getIndicatorSubCharts = (indicator: any): SubChart[] => {
  if (!indicator) return [];
  const code = indicator.code;
  const unit = indicator.unit || 'Tấn';
  const freq = indicator.frequency || 'Hàng tháng';

  if (code === 'GRI 302-1') {
    return [
      { code: 'GRI 302-1-JETA1', name: 'Tiêu thụ Jet A-1 Đội bay', unit: 'Tấn', source: 'Form Nhập liệu (Ban Kỹ thuật)', frequency: freq },
      { code: 'GRI 302-1-SAF', name: 'Tiêu thụ Nhiên liệu SAF pha trộn', unit: 'Tấn', source: 'Form Nhập liệu (Ban Kỹ thuật)', frequency: freq }
    ];
  }

  if (code === 'GRI 305-4') {
    return [
      { code: 'GRI 305-4-ACTUAL', name: 'Cường độ phát thải CO2 thực tế', unit: 'Tấn CO2/100 RTK', source: 'Form Nhập liệu (Ban Kỹ thuật)', frequency: 'Hàng năm' }
    ];
  }

  if (code === 'GRI 404-2') {
    return [
      { code: 'GRI 404-2-HQ', name: 'Giờ đào tạo trung bình Khối Cơ quan', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 404-2-OPS', name: 'Giờ đào tạo trung bình Khối Khai thác', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 404-2-TECH', name: 'Giờ đào tạo trung bình Khối Kỹ thuật', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 404-2-SERVICE', name: 'Giờ đào tạo trung bình Khối Dịch vụ', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 404-2-COMMERCE', name: 'Giờ đào tạo trung bình Khối Thương mại', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq }
    ];
  }

  if (code === 'Airline B-1') {
    return [
      { code: 'AIRLINE-B1-NPS', name: 'Biến động chỉ số Net Promoter Score', unit: 'Điểm', source: 'Hệ thống đối ngoại (Qualtrics API)', frequency: 'Hàng quý' }
    ];
  }

  if (code === 'GRI 2-7') {
    return [
      { code: 'GRI 2-7-PILOTS', name: 'Cơ cấu - Đội ngũ Phi công', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 2-7-CABIN', name: 'Cơ cấu - Đội ngũ Tiếp viên', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 2-7-TECH', name: 'Cơ cấu - Kỹ sư Kỹ thuật', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq },
      { code: 'GRI 2-7-GROUND', name: 'Cơ cấu - Nhân viên Mặt đất & CQ', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq }
    ];
  }

  if (code === 'GRI 2-9') {
    return [
      { code: 'GRI 2-9-IND', name: 'Thành phần Hội đồng Độc lập', unit: 'Thành viên', source: 'Nhập thủ công (Tổ Thư ký)', frequency: 'Hàng năm' },
      { code: 'GRI 2-9-EXEC', name: 'Thành phần Hội đồng Điều hành', unit: 'Thành viên', source: 'Nhập thủ công (Tổ Thư ký)', frequency: 'Hàng năm' },
      { code: 'GRI 2-9-NONEXEC', name: 'Thành phần Hội đồng Không điều hành', unit: 'Thành viên', source: 'Nhập thủ công (Tổ Thư ký)', frequency: 'Hàng năm' }
    ];
  }

  return [
    { code: `${code}-SUB1`, name: `Thống kê số liệu ${indicator.name}`, unit: unit, source: 'Form Nhập liệu ESG', frequency: freq }
  ];
};

const getChartType = (code: string): string => {
  if (code.includes('SAF') || code.includes('PILOTS') || code.includes('CABIN') || code.includes('IND') || code.includes('405-1') || code.includes('306-3')) {
    return 'doughnut';
  }
  if (code.includes('NPS') || code.includes('ACTUAL') || code.includes('401-1') || code.includes('418-1')) {
    return 'line';
  }
  return 'bar';
};

interface Section {
  title: string;
  content: string;
}

const parseIntroduction = (introText: string): Section[] => {
  if (!introText) return [];
  const parts = introText.split(/###\s+/);
  const sections: Section[] = [];

  parts.forEach(part => {
    if (!part.trim()) return;
    const lines = part.split('\n');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    if (title && content) {
      sections.push({ title, content });
    }
  });
  return sections;
};

// Truncate text strictly to 250 characters as requested
const truncateDescription = (text: string, maxLen = 250): string => {
  if (!text) return '';
  const clean = text.trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).trim() + '...';
};

const PillarDetail: React.FC<PillarDetailProps> = ({ pillarId, onBack }) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const detailContentMap = isEn ? DETAIL_CONTENT_EN : DETAIL_CONTENT;

  // Safe cast or lookup, fallback to environment if not found
  const content = detailContentMap[pillarId as keyof typeof detailContentMap] || detailContentMap.environment;

  // Search & Indicator Detail Page state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [selectedIndicatorDetail, setSelectedIndicatorDetail] = useState<Indicator | null>(null);

  // Sync published statuses and descriptions from localStorage (saved by CMS & PublishAdjust)
  const [publishedChartStatuses, setPublishedChartStatuses] = useState<Record<string, boolean>>({});
  const [chartDescriptions, setChartDescriptions] = useState<Record<string, string>>(() => {
    try {
      const savedDesc = localStorage.getItem('vna_chart_publish_descriptions');
      if (savedDesc) {
        return { ...DEFAULT_CHART_DESCRIPTIONS, ...JSON.parse(savedDesc) };
      }
    } catch (e) { }
    return { ...DEFAULT_CHART_DESCRIPTIONS };
  });

  useEffect(() => {
    const handleSync = () => {
      const savedStatus = localStorage.getItem('vna_publish_chart_status');
      if (savedStatus) {
        try {
          setPublishedChartStatuses(JSON.parse(savedStatus));
        } catch (e) { }
      }
      const savedDesc = localStorage.getItem('vna_chart_publish_descriptions');
      if (savedDesc) {
        try {
          setChartDescriptions(prev => ({ ...DEFAULT_CHART_DESCRIPTIONS, ...prev, ...JSON.parse(savedDesc) }));
        } catch (e) { }
      }
    };
    handleSync();
    window.addEventListener('vna_publish_adjustments_updated', handleSync);
    return () => window.removeEventListener('vna_publish_adjustments_updated', handleSync);
  }, []);

  const getPublishedSubChartsForIndicator = (ind: any) => {
    if (!ind) return [];
    const subCharts = getIndicatorSubCharts(ind);
    return subCharts.filter(sub => {
      return publishedChartStatuses[sub.code] !== false;
    }).map(sub => {
      const desc = chartDescriptions[`${ind.code}_${sub.code}`] ||
        chartDescriptions[sub.code] ||
        DEFAULT_CHART_DESCRIPTIONS[sub.code] ||
        DEFAULT_CHART_DESCRIPTIONS[`${ind.code}-SUB1`] ||
        DEFAULT_CHART_DESCRIPTIONS[ind.code] ||
        '';
      return {
        ...sub,
        indicatorCode: ind.code,
        indicatorName: ind.name,
        description: desc
      };
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setExpandedMap({});
    setSearchQuery('');
    setSelectedIndicatorDetail(null);
  }, [pillarId]);

  // Target pillar string for indicators filtering
  const targetPillarName = useMemo(() => {
    if (pillarId === 'environment') return 'Environment';
    if (pillarId === 'social') return 'Social';
    return 'Governance';
  }, [pillarId]);

  // Load indicators list corresponding to this pillar
  const pillarIndicators = useMemo(() => {
    const rawList = isEn ? (indicatorsDataEN as Indicator[]) : (indicatorsDataVI as Indicator[]);
    return rawList.filter(ind => ind.pillar === targetPillarName);
  }, [isEn, targetPillarName]);

  // Filtered indicators by search term
  const filteredIndicators = useMemo(() => {
    if (!searchQuery.trim()) return pillarIndicators;
    const q = searchQuery.toLowerCase().trim();
    return pillarIndicators.filter(
      ind =>
        ind.code.toLowerCase().includes(q) ||
        ind.name.toLowerCase().includes(q) ||
        (ind.topic && ind.topic.toLowerCase().includes(q))
    );
  }, [pillarIndicators, searchQuery]);

  // Toggle individual indicator collapse/expand
  const toggleIndicator = (id: string) => {
    setExpandedMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Expand all / Collapse all helpers
  const expandAll = () => {
    const next: Record<string, boolean> = {};
    filteredIndicators.forEach(ind => {
      next[ind.id] = true;
    });
    setExpandedMap(next);
  };

  const collapseAll = () => {
    setExpandedMap({});
  };

  // Pillar theme styles
  const themeConfig = useMemo(() => {
    if (pillarId === 'environment') {
      return {
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-250',
        activeHeaderBg: 'bg-emerald-50/70 border-emerald-300',
        iconColor: 'text-emerald-700',
        pillColor: 'bg-emerald-600 text-white',
        accentColor: '#005f6e',
        pillarLabel: isEn ? 'Environmental Pillar' : 'Môi trường',
        icon: <Leaf size={24} className="text-emerald-700" />
      };
    }
    if (pillarId === 'social') {
      return {
        badgeBg: 'bg-blue-50 text-blue-800 border-blue-250',
        activeHeaderBg: 'bg-blue-50/70 border-blue-300',
        iconColor: 'text-blue-700',
        pillColor: 'bg-blue-600 text-white',
        accentColor: '#0284c7',
        pillarLabel: isEn ? 'Social Pillar' : 'Xã hội',
        icon: <Users size={24} className="text-blue-700" />
      };
    }
    return {
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-250',
      activeHeaderBg: 'bg-amber-50/70 border-amber-300',
      iconColor: 'text-amber-700',
      pillColor: 'bg-amber-600 text-white',
      accentColor: '#b45309',
      pillarLabel: isEn ? 'Governance Pillar' : 'Quản trị',
      icon: <Landmark size={24} className="text-amber-700" />
    };
  }, [pillarId, isEn]);





  // 5. DEDICATED INDICATOR DETAIL PAGE VIEW (WHEN AN INDICATOR IS CLICKED)
  if (selectedIndicatorDetail) {
    const introSections = parseIntroduction(selectedIndicatorDetail.introduction || '');
    return (
      <div className="min-h-screen bg-slate-50 font-sans animate-fade-in pb-24">
        {/* BANNER / HEADER */}
        <div className="relative min-h-[220px] md:min-h-[240px]">
          <img
            src={content.heroImage}
            alt={selectedIndicatorDetail.name}
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className="absolute inset-0 bg-[#005F6E]/65 mix-blend-multiply"></div>
          <div className="relative z-10 container mx-auto px-6 pt-24 md:pt-28 pb-10 flex flex-col justify-start text-white">
            <button
              type="button"
              onClick={() => {
                setSelectedIndicatorDetail(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-white hover:text-white w-fit bg-black/25 hover:bg-black/40 px-4 py-2 rounded-full transition-all border border-white/30 cursor-pointer shadow-sm backdrop-blur-md text-sm font-medium"
            >
              <ArrowLeft size={18} /> {isEn ? `Back to ${themeConfig.pillarLabel}` : `Quay lại ${themeConfig.pillarLabel}`}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT CARD */}
        <div className="w-full px-3 sm:px-6 md:px-8 lg:px-10 py-6 relative -mt-16 z-10">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-12 lg:p-14 border border-gray-100 min-h-[500px] w-full">

            {/* BREADCRUMB & METADATA BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-150">
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIndicatorDetail(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-vna-blue hover:underline cursor-pointer"
                >
                  {isEn ? 'ESG Strategy' : 'Chiến lược ESG'}
                </button>
                <span>/</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIndicatorDetail(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-gray-700 font-semibold hover:text-vna-blue hover:underline cursor-pointer"
                >
                  {themeConfig.pillarLabel}
                </button>
                <span>/</span>
                <span className="text-vna-blue font-bold font-mono">{selectedIndicatorDetail.code}</span>
              </div>


            </div>

            {/* INDICATOR TITLE & METADATA */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold font-mono px-3 py-1 bg-blue-50 text-vna-blue rounded-lg border border-blue-200">
                  {selectedIndicatorDetail.code}
                </span>
                {selectedIndicatorDetail.topic && (
                  <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
                    {selectedIndicatorDetail.topic}
                  </span>
                )}
                {selectedIndicatorDetail.unit && (
                  <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                    ĐVT: {selectedIndicatorDetail.unit}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                {selectedIndicatorDetail.name}
              </h1>
            </div>

            {/* LONG-FORM ARTICLE BODY */}
            <div className="bg-slate-50/80 rounded-2xl border border-gray-200 p-6 md:p-10 space-y-8 text-justify shadow-2xs mb-10">
              {introSections.length > 0 ? (
                <div className="space-y-8 divide-y divide-gray-200/80">
                  {introSections.map((sec, sIdx) => (
                    <div key={sIdx} className={sIdx > 0 ? "pt-8" : ""}>
                      <h3 className="font-bold text-gray-900 text-base md:text-xl mb-4 flex items-center gap-3 uppercase tracking-wide">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#005f6e]"></span>
                        {sec.title}
                      </h3>
                      <div className="whitespace-pre-line text-sm md:text-base text-gray-700 leading-relaxed pl-5 border-l-2 border-[#005f6e]/30">
                        {sec.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 text-base md:text-xl uppercase tracking-wide flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#005f6e]"></span>
                    {isEn ? 'Detailed Indicator Description' : 'Nội dung chi tiết chỉ tiêu'}
                  </h3>
                  <div className="whitespace-pre-line text-sm md:text-base text-gray-700 leading-relaxed pl-5 border-l-2 border-[#005f6e]/30">
                    {selectedIndicatorDetail.introduction || selectedIndicatorDetail.name}
                  </div>
                </div>
              )}
            </div>

            {/* EMBEDDED PUBLISHED CHARTS IN DETAIL VIEW IF AVAILABLE (MOVED TO BOTTOM) */}
            {(() => {
              const detailSubCharts = getPublishedSubChartsForIndicator(selectedIndicatorDetail);
              if (detailSubCharts.length === 0) return null;
              return (
                <div className="mb-8 space-y-6">
                  {/* <div className="flex items-center gap-2.5 border-b border-gray-200 pb-3">
                    <BarChart3 size={20} className="text-vna-blue" />
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                      {isEn ? 'Published Interactive Charts & Data' : 'Biểu đồ số liệu công bố'}
                    </h3>
                  </div> */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {detailSubCharts.map((sub: any, idx: number) => {
                      const isSingleLast = (detailSubCharts.length % 2 === 1) && (idx === detailSubCharts.length - 1);
                      return (
                        <div
                          key={sub.code}
                          className={`bg-slate-50/80 rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3.5 transition-all ${isSingleLast ? 'col-span-1 md:col-span-2' : 'col-span-1'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm md:text-base text-slate-900 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-vna-blue"></span>
                              <span>{sub.name}</span>
                            </h4>
                            <span className="text-[11px] font-semibold text-vna-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                              {sub.unit}
                            </span>
                          </div>

                          <div className={`w-full bg-white rounded-xl p-3 border border-gray-200 shadow-3xs ${isSingleLast ? 'h-[300px] md:h-[340px]' : 'h-[250px]'
                            }`}>
                            <IndicatorChart
                              indicatorCode={sub.code}
                              chartName={sub.name}
                              chartType={getChartType(sub.code)}
                            />
                          </div>

                          {/* PHẦN MÔ TẢ BIỂU ĐỒ DƯỚI BIỂU ĐỒ (LẤY TỪ CMS) */}
                          {sub.description && (
                            <div className="pt-3 border-t border-gray-200/90 bg-white/95 p-4 rounded-xl border border-gray-200 shadow-3xs text-left">
                              <p className="text-xs text-gray-700 leading-relaxed text-justify">
                                {sub.description}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* BOTTOM BACK BUTTON */}
            <div className="mt-12 pt-6 border-t border-gray-150 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedIndicatorDetail(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                <ArrowLeft size={16} /> {isEn ? `Back to ${themeConfig.pillarLabel}` : `Quay lại ${themeConfig.pillarLabel}`}
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans animate-fade-in">
      {/* HEADER IMAGE */}
      <div className="relative min-h-[230px] md:min-h-[250px]">
        <img
          src={content.heroImage}
          alt={content.title}
          className="w-full h-full object-cover absolute inset-0"
        />
        <div className="absolute inset-0 bg-[#005F6E]/60 mix-blend-multiply"></div>
        <div className="relative z-10 container mx-auto px-6 pt-24 md:pt-28 pb-10 flex flex-col justify-start text-white">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-white w-fit bg-black/25 hover:bg-black/40 px-4 py-2 rounded-full transition-all border border-white/30 cursor-pointer shadow-sm backdrop-blur-md text-sm font-medium"
          >
            <ArrowLeft size={18} /> {isEn ? 'Back to Overview' : 'Quay lại Tổng quan'}
          </button>
        </div>
      </div>

      <div className="w-full px-3 sm:px-6 md:px-8 lg:px-10 py-6 relative -mt-16 z-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-12 lg:p-14 border border-gray-100 min-h-[500px] w-full">

          {/* 1. INTRO SECTION */}
          <div className="w-full mb-12">
            <div className="flex justify-start mb-4">
              <span className="text-sm md:text-base font-bold text-gray-500 uppercase tracking-widest">
                {themeConfig.pillarLabel}
              </span>
            </div>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-light italic bg-slate-50 p-6 md:p-8 rounded-2xl border border-gray-150 shadow-2xs text-left w-full">
              "{content.intro}"
            </p>
          </div>



          {/* 3. TEXT CONTENT */}
          <div className="space-y-12 text-justify mb-16">
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

          {/* 4. INDICATORS LIST SECTION (CLICK TO OPEN DEDICATED DETAIL PAGE) */}
          <div className="pt-10 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 rounded-xl">
                  {themeConfig.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <span>{isEn ? `Indicators List - ${themeConfig.pillarLabel}` : `Thông tin liên quan`}</span>
                  </h3>
                </div>
              </div>
            </div>

            {/* INDICATORS LIST GRID (NAVIGATE TO DEDICATED DETAIL PAGE) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredIndicators.map((ind) => (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => {
                    setSelectedIndicatorDetail(ind);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full p-4 md:p-5 rounded-2xl border border-gray-200 hover:border-vna-blue/60 bg-white hover:bg-slate-50/80 hover:shadow-md transition-all duration-200 flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm md:text-base font-bold text-gray-900 group-hover:text-vna-blue transition-colors line-clamp-2">
                        {ind.name}
                      </h4>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-vna-blue text-slate-500 group-hover:text-white flex items-center justify-center transition-all duration-200 shrink-0 shadow-2xs">
                    <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>

            {/* EMPTY STATE */}
            {filteredIndicators.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-gray-250 text-gray-400 text-xs">
                {isEn ? 'No indicators found matching your search term.' : 'Không tìm thấy chỉ tiêu nào phù hợp với từ khóa tìm kiếm.'}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PillarDetail;
