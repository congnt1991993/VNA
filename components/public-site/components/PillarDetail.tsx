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
import { FuelMixChart, EmissionsChart, DiversityChart, SocialImpactChart, SafetyScoreChart } from './Charts';
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


interface TextIndicatorItem {
  code: string;
  nameVi: string;
  nameEn: string;
  topicVi: string;
  topicEn: string;
  deptVi: string;
  deptEn: string;
  contentVi: string;
  contentEn: string;
}

const PILLAR_TEXT_INDICATORS: Record<string, TextIndicatorItem[]> = {
  environment: [
    {
      code: 'GRI 3-3',
      nameVi: 'Phương pháp quản lý các chủ đề Môi trường & Khí hậu',
      nameEn: 'Management Approach for Environmental & Climate Topics',
      topicVi: 'Quản trị Môi trường',
      topicEn: 'Environmental Governance',
      deptVi: 'Ban Kế hoạch phát triển',
      deptEn: 'Corporate Planning Dept',
      contentVi: 'Vietnam Airlines triển khai hệ thống quản trị môi trường tích hợp theo tiêu chuẩn ISO 14001:2015, định hướng chiến lược theo cam kết Net Zero 2050 của Chính phủ và ICAO. Tổng công ty thành lập Ban chỉ đạo ESG cấp TCT, áp dụng cơ chế đánh giá rủi ro khí hậu định kỳ và gắn trách nhiệm chỉ tiêu giảm phát thải vào KPI thường niên của từng đơn vị trực thuộc.',
      contentEn: 'Vietnam Airlines implements an integrated environmental management system certified to ISO 14001:2015, aligned with the Net Zero 2050 commitment of Vietnam and ICAO. The Corporation established an ESG Steering Committee, conducts regular climate risk assessments, and embeds emission reduction targets into annual departmental KPIs.'
    },
    {
      code: 'Airline E-2',
      nameVi: 'Lộ trình chuyển đổi năng lượng xanh & Ứng dụng SAF',
      nameEn: 'Green Energy Transition & SAF Adoption Roadmap',
      topicVi: 'Chuyển dịch Năng lượng',
      topicEn: 'Energy Transition',
      deptVi: 'Ban Kỹ thuật',
      deptEn: 'Engineering Dept',
      contentVi: 'Hãng đã xây dựng lộ trình nâng dần tỷ lệ pha trộn nhiên liệu hàng không bền vững (SAF) từ năm 2024 đến năm 2030, kết hợp tối ưu hóa quỹ đạo bay và áp dụng phương pháp cất/hạ cánh liên tục (CDO/CCO). Tại mặt đất, 100% phương tiện trung chuyển và thiết bị phục vụ mặt đất mới tại các sân bay Nội Bài và Tân Sơn Nhất được ưu tiên chuyển đổi sang năng lượng điện.',
      contentEn: 'The airline established a roadmap to progressively increase SAF blending ratios from 2024 to 2030, combined with flight trajectory optimization and continuous descent/climb operations (CDO/CCO). On the ground, 100% of newly procured ground support equipment at Noi Bai and Tan Son Nhat hubs are prioritized for electric power.'
    },
    {
      code: 'GRI 306-1',
      nameVi: 'Quản lý chất thải và Kinh tế tuần hoàn chuyến bay',
      nameEn: 'Waste Management & In-flight Circular Economy',
      topicVi: 'Kinh tế tuần hoàn',
      topicEn: 'Circular Economy',
      deptVi: 'Ban Dịch vụ hành khách',
      deptEn: 'Passenger Services Dept',
      contentVi: 'Chương trình "Chuyến bay Xanh - Bay Nhẹ Tới Tương Lai" đã loại bỏ hơn 65% vật phẩm nhựa dùng một lần trên khoang hành khách, thay thế bằng vật liệu tre, giấy và bã mía tự phân hủy. 100% chất thải phát sinh được các công ty thành viên (NCS, VACS) thu gom, phân loại tại nguồn và chuyển giao cho các đơn vị tái chế chuyên trách.',
      contentEn: 'The "Fly Light to the Future" program eliminated over 65% of single-use plastics in passenger cabins, substituting them with bamboo, paper, and biodegradable bagasse materials. 100% of generated in-flight waste is sorted at source by subsidiaries and transferred to certified recycling partners.'
    }
  ],
  social: [
    {
      code: 'GRI 406-1',
      nameVi: 'Chính sách Không phân biệt đối xử & Bình đẳng cơ hội',
      nameEn: 'Non-discrimination & Equal Opportunity Policy',
      topicVi: 'Bình đẳng & Đa dạng',
      topicEn: 'Diversity & Equality',
      deptVi: 'Ban Tổ chức nhân lực',
      deptEn: 'Human Resources Dept',
      contentVi: 'Vietnam Airlines cam kết xây dựng môi trường làm việc hòa nhập, tôn trọng sự đa dạng và không dung thứ cho bất kỳ hành vi phân biệt đối xử nào dựa trên giới tính, tôn giáo, vùng miền hay nguồn gốc. Tỷ lệ nữ giới tham gia các vị trí quản lý, cán bộ khung đạt trên 32% và luôn được đảm bảo các chính sách đãi ngộ, thăng tiến công bằng.',
      contentEn: 'Vietnam Airlines commits to an inclusive, respectful workplace with zero tolerance for discrimination based on gender, ethnicity, or background. Women hold over 32% of management roles and enjoy equal remuneration, mentorship, and career advancement policies.'
    },
    {
      code: 'GRI 403-4',
      nameVi: 'Sự tham gia của người lao động & Văn hóa An toàn',
      nameEn: 'Worker Participation & Occupational Health and Safety',
      topicVi: 'An toàn Lao động',
      topicEn: 'Occupational Safety',
      deptVi: 'Ban An toàn chất lượng',
      deptEn: 'Safety & Quality Dept',
      contentVi: 'Hội đồng An toàn vệ sinh lao động được thành lập với đại diện công đoàn và người lao động tại tất cả các khối khai thác, kỹ thuật và dịch vụ. Hệ thống báo cáo an toàn tự nguyện (Safety Reporting System) được duy trì 24/7 với nguyên tắc bảo vệ danh tính, khuyến khích chủ động phát hiện và ngăn ngừa nguy cơ rủi ro.',
      contentEn: 'The Occupational Safety Committee includes active labor union representatives across operations, engineering, and services. A non-punitive confidential Safety Reporting System operates 24/7, encouraging proactive hazard reporting and preventive interventions.'
    },
    {
      code: 'GRI 404-2',
      nameVi: 'Chương trình Nâng cao kỹ năng và Đào tạo chuyên nghiệp',
      nameEn: 'Programs for Upgrading Skills & Lifelong Learning',
      topicVi: 'Đào tạo & Phát triển',
      topicEn: 'Training & Development',
      deptVi: 'Ban Tổ chức nhân lực',
      deptEn: 'Human Resources Dept',
      contentVi: 'Năm 2024, thời lượng đào tạo bình quân đạt 42.5 giờ/người/năm. Trung tâm Huấn luyện Bay (FTC) tổ chức các khóa định kỳ cho phi công, tiếp viên theo tiêu chuẩn EASA/FAA; đồng thời triển khai chuỗi chương trình văn hóa dịch vụ nâng tầm "Văn hóa Dịch vụ Chạm đến Trái tim" cho hơn 15.000 cán bộ công nhân viên.',
      contentEn: 'In 2024, average training duration reached 42.5 hours per employee. The Flight Training Center (FTC) conducted periodic simulation and safety courses under EASA/FAA standards alongside the corporate-wide "Service from the Heart" cultural transformation program.'
    }
  ],
  governance: [
    {
      code: 'GRI 2-23',
      nameVi: 'Cam kết Đạo đức kinh doanh & Phòng chống tham nhũng',
      nameEn: 'Policy Commitments & Business Ethics Code',
      topicVi: 'Đạo đức Kinh doanh',
      topicEn: 'Business Ethics',
      deptVi: 'Ban Kiểm toán nội bộ & Giám sát',
      deptEn: 'Internal Audit & Compliance',
      contentVi: 'Tổng công ty ban hành Bộ Quy tắc Đạo đức nghề nghiệp áp dụng bắt buộc cho 100% cán bộ nhân viên và đối tác cung ứng. Cơ chế đường dây nóng bảo mật (Whistleblowing Hotline) hoạt động độc lập dưới sự giám sát của Ủy ban Kiểm toán, tiếp nhận và xử lý nghiêm minh mọi hành vi vi phạm đạo đức kinh doanh.',
      contentEn: 'The Corporation enforces a mandatory Code of Conduct for 100% of personnel and supply chain partners. An independent confidential Whistleblowing Hotline monitored by the Audit Committee ensures strict, transparent handling of any ethical non-compliance.'
    },
    {
      code: 'GRI 418-1',
      nameVi: 'Bảo mật Dữ liệu khách hàng & An toàn an ninh mạng',
      nameEn: 'Customer Privacy & Information Security Management',
      topicVi: 'Bảo mật Thông tin',
      topicEn: 'Cyber Security',
      deptVi: 'Ban Công nghệ thông tin',
      deptEn: 'IT Dept',
      contentVi: 'Hệ thống an toàn thông tin của Vietnam Airlines đạt chứng nhận tiêu chuẩn quốc tế ISO/IEC 27001:2022 và tuân thủ tuyệt đối Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân cùng GDPR. Trong năm qua, 100% dữ liệu hội viên Bông Sen Vàng và thông tin giao dịch chuyến bay được mã hóa cấp cao, không xảy ra sự cố rò rỉ dữ liệu.',
      contentEn: 'Information security systems are certified to ISO/IEC 27001:2022, fully compliant with Personal Data Protection regulations and GDPR. 100% of Lotusmiles member profiles and flight transaction records are protected with enterprise-grade encryption with zero breaches recorded.'
    },
    {
      code: 'GRI 2-9',
      nameVi: 'Cơ cấu Quản trị và Tính minh bạch của Hội đồng',
      nameEn: 'Governance Structure & Board Transparency',
      topicVi: 'Cơ cấu Quản trị',
      topicEn: 'Governance Structure',
      deptVi: 'Tổ Thư ký HĐQT',
      deptEn: 'Board Secretariat',
      contentVi: 'Hội đồng Quản trị duy trì tỷ lệ thành viên độc lập chiếm 33% nhằm đảm bảo tính khách quan trong các quyết sách chiến lược và đầu tư đội tàu bay. Các tiểu ban trực thuộc (Tiểu ban Kiểm toán, Tiểu ban Quản trị rủi ro & ESG, Tiểu ban Nhân sự và Lương thưởng) hoạt động theo quy chế minh bạch, định kỳ công bố thông tin theo chuẩn mực niêm yết.',
      contentEn: 'The Board of Directors maintains a 33% independent member ratio to safeguard objectivity in fleet investments and strategic decisions. Specialized committees (Audit, ESG Risk, and Remuneration) operate under transparent charters and publish disclosures per international listing standards.'
    }
  ]
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

  const currentTextIndicators = useMemo(() => {
    return PILLAR_TEXT_INDICATORS[pillarId] || PILLAR_TEXT_INDICATORS.environment;
  }, [pillarId]);

  const getLiveTextContent = (item: TextIndicatorItem): { text: string; sourceText: string } => {
    try {
      const savedAdjs = localStorage.getItem('vna_publish_adjustments');
      if (savedAdjs) {
        const adjs = JSON.parse(savedAdjs);
        const match = adjs.find((a: any) =>
          (a.indicatorCode === item.code || a.subChartCode?.includes(item.code)) && (a.adjustedValue || a.originalValue)
        );
        if (match) {
          const val = match.adjustedValue || match.originalValue;
          if (typeof val === 'string' && val.trim().length > 10) {
            return {
              text: val.trim(),
              sourceText: isEn ? 'Verified Published Report' : 'Dữ liệu báo cáo công bố'
            };
          }
        }
      }
    } catch (e) { }

    return {
      text: isEn ? item.contentEn : item.contentVi,
      sourceText: isEn ? item.deptEn : item.deptVi
    };
  };

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

  // 5. DEDICATED INDICATOR DETAIL PAGE VIEW (WHEN AN INDICATOR IS CLICKED)
  if (selectedIndicatorDetail) {
    const introSections = parseIntroduction(selectedIndicatorDetail.introduction || '');
    return (
      <div className="min-h-screen bg-slate-50 font-sans animate-fade-in pb-24">
        {/* BANNER / HEADER */}
        <div className="relative h-[24vh] min-h-[190px] md:h-[28vh]">
          <img
            src={content.heroImage}
            alt={selectedIndicatorDetail.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#005F6E]/65 mix-blend-multiply"></div>
          <div className="absolute inset-0 flex flex-col justify-start container mx-auto px-6 pt-7 text-white">
            <button
              type="button"
              onClick={() => {
                setSelectedIndicatorDetail(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-white/90 hover:text-white w-fit hover:bg-white/15 px-4 py-2 rounded-full transition-all border border-white/30 cursor-pointer shadow-xs backdrop-blur-xs text-sm font-medium"
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
            <div className="mb-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                {selectedIndicatorDetail.name}
              </h1>
              {selectedIndicatorDetail.department && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {/* <ShieldCheck size={16} className="text-[#005f6e]" /> */}
                  {/* <span>{isEn ? 'Responsible Unit: ' : 'Đơn vị phụ trách: '}</span>
                  <span className="font-semibold text-gray-700">{selectedIndicatorDetail.department}</span> */}
                </div>
              )}
            </div>

            {/* LONG-FORM ARTICLE BODY */}
            <div className="bg-slate-50/80 rounded-2xl border border-gray-200 p-6 md:p-10 space-y-8 text-justify shadow-2xs">
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
      <div className="relative h-[28vh] min-h-[220px] md:h-[32vh]">
        <img
          src={content.heroImage}
          alt={content.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#005F6E]/60 mix-blend-multiply"></div>
        <div className="absolute inset-0 flex flex-col justify-start container mx-auto px-6 pt-8 text-white">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/90 hover:text-white w-fit hover:bg-white/15 px-4 py-2 rounded-full transition-all border border-white/30 cursor-pointer shadow-xs backdrop-blur-xs text-sm font-medium"
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

          {/* 2. DASHBOARD SECTION (DATA & KEY INDICATORS) */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="text-vna-gold" size={28} />
              <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">{isEn ? 'Data & Key Indicators' : 'Dữ liệu'}</h3>
            </div>
            <div className="bg-slate-50 rounded-3xl p-8 border border-gray-200 shadow-inner space-y-8">
              {/* Charts grid */}
              {renderDashboard()}

              {/* Text / Narrative Indicators Section */}
              <div className="pt-6 border-t border-gray-200/80">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2.5">
                    {/* <div className="p-2 bg-blue-100/70 text-vna-blue rounded-lg">
                      <FileText size={20} />
                    </div> */}
                    <div>
                      {/* <h4 className="font-bold text-slate-800 text-lg">
                        {isEn ? 'Qualitative & Narrative Indicators' : 'Thuyết minh Chỉ tiêu'}
                      </h4> */}
                      <p className="text-xs text-gray-500 mt-0.5">
                        {/* {isEn
                          ? 'Key qualitative governance, policy, and management disclosures according to GRI Standards'
                          : 'Các chỉ tiêu thuyết minh chính sách, phương pháp quản lý và cam kết hành động theo chuẩn mực GRI'} */}
                      </p>
                    </div>
                  </div>
                  {/* <span className="hidden sm:inline-flex text-xs font-bold font-mono px-3 py-1 bg-white text-vna-blue rounded-full border border-blue-200 shadow-2xs">
                    {currentTextIndicators.length} {isEn ? 'narrative disclosures' : 'chỉ tiêu thuyết minh'}
                  </span> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {currentTextIndicators.map((item) => {
                    const live = getLiveTextContent(item);
                    const matchedInd = pillarIndicators.find(ind => ind.code === item.code || ind.name === item.nameVi || ind.name === item.nameEn) || {
                      id: item.code,
                      code: item.code,
                      name: isEn ? item.nameEn : item.nameVi,
                      pillar: targetPillarName,
                      topic: isEn ? item.topicEn : item.topicVi,
                      unit: '',
                      frequency: 'Annual',
                      weight: 1,
                      department: isEn ? item.deptEn : item.deptVi,
                      sourceForm: '',
                      programs: [],
                      inputDept: '',
                      approveDept: '',
                      introduction: live.text
                    };

                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          setSelectedIndicatorDetail(matchedInd);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border-l-4 border-l-vna-blue group text-left cursor-pointer hover:border-vna-blue/50 hover:bg-slate-50/50"
                      >
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold font-mono px-2.5 py-0.5 bg-blue-50 text-vna-blue rounded-md border border-blue-100 group-hover:bg-vna-blue group-hover:text-white transition-colors">
                              {item.code}
                            </span>
                            <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-vna-blue text-slate-400 group-hover:text-white flex items-center justify-center transition-all">
                              <ChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                          <h5 className="font-bold text-gray-900 text-sm mb-2 group-hover:text-vna-blue transition-colors line-clamp-2">
                            {isEn ? item.nameEn : item.nameVi}
                          </h5>
                          <p className="text-xs text-gray-600 leading-relaxed text-justify line-clamp-4">
                            {live.text}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
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
                    {/* Indicator Code Badge */}
                    {/* <span className="text-xs font-bold font-mono px-2.5 py-1 bg-blue-50 text-vna-blue rounded-lg border border-blue-200 shrink-0 group-hover:bg-vna-blue group-hover:text-white transition-colors">
                      {ind.code}
                    </span> */}

                    {/* Indicator Name */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm md:text-base font-bold text-gray-900 group-hover:text-vna-blue transition-colors line-clamp-2">
                        {ind.name}
                      </h4>
                    </div>
                  </div>

                  {/* Navigation Arrow Icon */}
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
