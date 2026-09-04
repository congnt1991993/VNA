import React, { useState, useEffect, useMemo } from 'react';
import { IndicatorChart } from '../components/IndicatorChart';

interface SubChart {
  code: string;
  name: string;
  unit: string;
  source: string;
  frequency: string;
}

const getIndicatorSource = (code: string, unit: string): string => {
  if (code.includes('GRI 302-1') || code.includes('GRI 302-4') || code.includes('GRI 305-1')) {
    return 'Form Nhập liệu (Chuyên viên Ban Kỹ thuật)';
  }
  if (code.includes('GRI 2-7') || code.includes('GRI 401-1') || code.includes('GRI 404-2')) {
    return 'Form Nhập liệu (Ban Tổ chức nhân lực)';
  }
  if (code.includes('Airline B-1')) {
    return 'Hệ thống tích hợp đối ngoại (Qualtrics API)';
  }
  if (code.includes('Airline B-2')) {
    return 'Hệ thống tích hợp CLM (BI-CLM DB Connect)';
  }
  if (code.includes('GRI 303-3') || code.includes('GRI 303-5')) {
    return 'Form Nhập liệu (Tổ Dịch vụ)';
  }
  return 'Hệ thống tích hợp TCT (SAP/ERP Integration)';
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
    { code: `${code}-SUB1`, name: `Thống kê số liệu ${indicator.name}`, unit: unit, source: getIndicatorSource(code, unit), frequency: freq }
  ];
};
import { Card, Button, Input, Badge, Table, Toast, Modal } from '../components/UI';
import {
  LayoutDashboard, BarChart2, Newspaper, FileText, Upload, Save, RefreshCw, Eye, EyeOff, Edit, Edit2, Plus, CheckCircle, XCircle,
  Leaf, Users, Landmark, Calendar, ArrowLeft, ArrowRight, ArrowUpDown, ArrowUp, ArrowDown, Download, Share2, Printer, ChevronRight, ChevronUp, ChevronDown, Target, Trash2, GripVertical, Layers, Inbox
} from 'lucide-react';
import MOCK_INDICATORS_JSON from '../data/indicators_main_list.json';


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

interface PillarReportItem {
  id: string;
  type: 'chart' | 'indicator';
  value: string;
}

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

  // Added dynamic reports list
  newsReports?: PillarReportItem[];
  detailReports?: PillarReportItem[];
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
    chartUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=400&auto=format&fit=crop",
    newsReports: [
      { id: 'env-news-1', type: 'chart', value: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=400&auto=format&fit=crop' },
      { id: 'env-news-2', type: 'indicator', value: 'GRI 302-1' }
    ],
    detailReports: [
      { id: 'env-detail-1', type: 'chart', value: 'GRI 302-1-JETA1' },
      { id: 'env-detail-2', type: 'indicator', value: 'GRI 305-1' }
    ]
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
    chartUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400&auto=format&fit=crop",
    newsReports: [
      { id: 'soc-news-1', type: 'chart', value: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400&auto=format&fit=crop' },
      { id: 'soc-news-2', type: 'indicator', value: 'GRI 401-1' }
    ],
    detailReports: [
      { id: 'soc-detail-1', type: 'chart', value: 'GRI 401-1-SUB1' },
      { id: 'soc-detail-2', type: 'indicator', value: 'GRI 403-9' }
    ]
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
    chartUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop",
    newsReports: [
      { id: 'gov-news-1', type: 'chart', value: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop' },
      { id: 'gov-news-2', type: 'indicator', value: 'GRI 418-1' }
    ],
    detailReports: [
      { id: 'gov-detail-1', type: 'chart', value: 'GRI 2-7-SUB1' },
      { id: 'gov-detail-2', type: 'indicator', value: 'GRI 2-9' }
    ]
  }
];

export const CMSManagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hero' | 'ceo' | 'pillars' | 'detail' | 'news' | 'reports'>('hero');
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

  const [pillars, setPillars] = useState<PillarCMSData[]>(() => {
    try {
      const saved = localStorage.getItem('vna_cms_pillars');
      if (saved) {
        const parsed: PillarCMSData[] = JSON.parse(saved);
        // Sanitize legacy image URLs in detailReports
        return parsed.map(p => ({
          ...p,
          detailReports: (p.detailReports || []).map(r => {
            if (r.value && r.value.startsWith('http')) {
              if (p.id === 'environment') return { ...r, value: 'GRI 302-1-JETA1' };
              if (p.id === 'social') return { ...r, value: 'GRI 401-1-SUB1' };
              if (p.id === 'governance') return { ...r, value: 'GRI 2-7-SUB1' };
            }
            return r;
          })
        }));
      }
    } catch (e) { }
    return initialPillarsData;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vna_cms_pillars', JSON.stringify(pillars));
      window.dispatchEvent(new Event('vna_publish_adjustments_updated'));
    } catch (e) { }
  }, [pillars]);
  const [selectedPillarId, setSelectedPillarId] = useState<'environment' | 'social' | 'governance'>('environment');
  const [editingLang, setEditingLang] = useState<'vi' | 'en'>('vi');
  const [previewLang, setPreviewLang] = useState<'vi' | 'en'>('vi');
  const [previewPage, setPreviewPage] = useState<'home' | 'detail'>('home');
  const [previewPillarId, setPreviewPillarId] = useState<'environment' | 'social' | 'governance'>('environment');
  const [showPreview, setShowPreview] = useState(false);
  const [previewingChart, setPreviewingChart] = useState<any | null>(null);

  // Indicator visibility map for public Pillar Detail page
  const [indicatorVisibility, setIndicatorVisibility] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('vna_cms_indicator_visibility');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return {};
  });

  const [indicatorSearchQuery, setIndicatorSearchQuery] = useState('');
  const [searchIndCode, setSearchIndCode] = useState('');
  const [searchIndName, setSearchIndName] = useState('');
  const [indSortField, setIndSortField] = useState<'code' | 'name' | null>(null);
  const [indSortOrder, setIndSortOrder] = useState<'asc' | 'desc'>('asc');
  const [indicatorFilterStatus, setIndicatorFilterStatus] = useState<'all' | 'visible' | 'hidden'>('all');
  const [publishedIndicatorSubTab, setPublishedIndicatorSubTab] = useState<'indicators' | 'charts'>('indicators');

  const toggleIndicatorVisibility = (code: string) => {
    setIndicatorVisibility(prev => {
      const current = prev[code] !== false; // default is true (visible)
      const nextState = !current;
      const updated = { ...prev, [code]: nextState };
      try {
        localStorage.setItem('vna_cms_indicator_visibility', JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });
  };

  // Sync published statuses and descriptions from localStorage (saved by PublishAdjust page)
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
  const [expandedDescMap, setExpandedDescMap] = useState<Record<string, boolean>>({});
  const [editingChartForDesc, setEditingChartForDesc] = useState<any | null>(null);
  const [editingDescInput, setEditingDescInput] = useState<string>('');
  const [searchChartCode, setSearchChartCode] = useState<string>('');
  const [searchChartName, setSearchChartName] = useState<string>('');
  const [sidePreviewChart, setSidePreviewChart] = useState<any | null>(null);

  const getSubChartDescription = (sub: any) => {
    return chartDescriptions[`${sub.indicatorCode}_${sub.code}`] ||
      chartDescriptions[sub.code] ||
      sub.description ||
      DEFAULT_CHART_DESCRIPTIONS[sub.code] ||
      DEFAULT_CHART_DESCRIPTIONS[`${sub.indicatorCode}-SUB1`] ||
      DEFAULT_CHART_DESCRIPTIONS[sub.indicatorCode] ||
      `Số liệu thống kê và diễn biến phân tích định kỳ chỉ tiêu ${sub.name}, phản ánh các cam kết và tiến độ phát triển bền vững của Vietnam Airlines.`;
  };

  const handleOpenEditDesc = (sub: any) => {
    const currentDesc = getSubChartDescription(sub);
    setEditingChartForDesc(sub);
    setEditingDescInput(currentDesc);
  };

  const handleSaveDesc = () => {
    if (!editingChartForDesc) return;
    const subCode = editingChartForDesc.code;
    const indCode = editingChartForDesc.indicatorCode || '';
    const newDesc = editingDescInput.trim();

    const updated = {
      ...chartDescriptions,
      [subCode]: newDesc,
      [`${indCode}_${subCode}`]: newDesc
    };

    setChartDescriptions(updated);
    try {
      localStorage.setItem('vna_chart_publish_descriptions', JSON.stringify(updated));
      window.dispatchEvent(new Event('vna_publish_adjustments_updated'));
    } catch (e) {
      console.error('Failed to save chart descriptions', e);
    }

    setToast({ message: `Đã cập nhật mô tả cho biểu đồ "${editingChartForDesc.name}" thành công!`, type: 'success' });
    setEditingChartForDesc(null);
  };

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
      } else {
        setChartDescriptions(prev => ({ ...DEFAULT_CHART_DESCRIPTIONS, ...prev }));
      }
    };
    handleSync();
    window.addEventListener('vna_publish_adjustments_updated', handleSync);
    return () => window.removeEventListener('vna_publish_adjustments_updated', handleSync);
  }, []);

  const publishedSubChartsForPillar = useMemo(() => {
    const activePillar = pillars.find(p => p.id === selectedPillarId);
    if (!activePillar) return [];

    // Get indicators for current active pillar
    const targetPillarMap: Record<string, string> = {
      environment: 'Environment',
      social: 'Social',
      governance: 'Governance'
    };
    const targetPillarName = targetPillarMap[activePillar.id];
    const pillarInds = MOCK_INDICATORS_JSON.filter(ind => {
      if (ind.pillar !== targetPillarName) return false;
      // Filter out indicators that do not have a valid code or are "Chưa có mã"
      if (!ind.code || ind.code === 'Chưa có mã' || ind.code.toLowerCase().includes('chưa có mã')) return false;
      return true;
    });

    // Extract all subcharts and filter by published status
    const allSubCharts: any[] = [];
    pillarInds.forEach(ind => {
      const subCharts = getIndicatorSubCharts(ind);
      subCharts.forEach(sub => {
        // Exclude unassigned/un-coded subcharts
        if (!sub.code || sub.code.includes('Chưa có mã')) return;

        const isPublished = publishedChartStatuses[sub.code] !== false;
        if (isPublished) {
          const desc = chartDescriptions[`${ind.code}_${sub.code}`] || chartDescriptions[sub.code] || '';
          allSubCharts.push({
            ...sub,
            indicatorCode: ind.code,
            indicatorName: ind.name,
            description: desc
          });
        }
      });
    });

    return allSubCharts;
  }, [selectedPillarId, pillars, publishedChartStatuses, chartDescriptions]);

  // Backlog pool: only items NOT yet added to Sprint (detailReports)
  const availableBacklogSubCharts = useMemo(() => {
    const activePillar = pillars.find(p => p.id === selectedPillarId);
    const sprintReportValues = new Set((activePillar?.detailReports || []).map(r => r.value));

    return publishedSubChartsForPillar.filter(sub => {
      // Exclude if already in Sprint
      if (sprintReportValues.has(sub.code) || sprintReportValues.has(sub.indicatorCode)) {
        return false;
      }
      return true;
    });
  }, [publishedSubChartsForPillar, selectedPillarId, pillars]);

  const filteredPublishedSubCharts = useMemo(() => {
    return availableBacklogSubCharts.filter(sub => {
      const codeStr = (sub.indicatorCode || sub.code || '').toLowerCase();
      const nameStr = (sub.name || '').toLowerCase();
      const matchesCode = !searchChartCode || codeStr.includes(searchChartCode.toLowerCase());
      const matchesName = !searchChartName || nameStr.includes(searchChartName.toLowerCase());
      return matchesCode && matchesName;
    });
  }, [availableBacklogSubCharts, searchChartCode, searchChartName]);

  // Helper map for fast indicator lookup by ID/Code
  const indicatorMap = useMemo(() => {
    const map = new Map<string, any>();
    MOCK_INDICATORS_JSON.forEach(ind => {
      map.set(String(ind.code || ind.id), ind);
    });
    return map;
  }, []);

  const getPillarIndicators = (pillarId: 'environment' | 'social' | 'governance') => {
    const pillarMap: Record<string, string> = {
      environment: 'Environment',
      social: 'Social',
      governance: 'Governance'
    };
    const targetPillarName = pillarMap[pillarId];
    return MOCK_INDICATORS_JSON.filter(ind => ind.pillar === targetPillarName);
  };

  const addReportRow = (pillarId: string, section: 'news' | 'detail') => {
    setPillars(pillars.map(p => {
      if (p.id === pillarId) {
        const field = section === 'news' ? 'newsReports' : 'detailReports';
        const currentList = p[field] || [];
        const newRow: PillarReportItem = {
          id: `${section}-${Date.now()}-${Math.random()}`,
          type: 'chart',
          value: ''
        };
        return {
          ...p,
          [field]: [...currentList, newRow]
        };
      }
      return p;
    }));
  };

  const updateReportRow = (pillarId: string, section: 'news' | 'detail', rowId: string, key: 'type' | 'value', val: string) => {
    setPillars(pillars.map(p => {
      if (p.id === pillarId) {
        const field = section === 'news' ? 'newsReports' : 'detailReports';
        const currentList = p[field] || [];
        const updatedList = currentList.map(item => {
          if (item.id === rowId) {
            return { ...item, [key]: val, ...(key === 'type' ? { value: '' } : {}) };
          }
          return item;
        });
        return {
          ...p,
          [field]: updatedList
        };
      }
      return p;
    }));
  };

  const deleteReportRow = (pillarId: string, section: 'news' | 'detail', rowId: string) => {
    setPillars(pillars.map(p => {
      if (p.id === pillarId) {
        const field = section === 'news' ? 'newsReports' : 'detailReports';
        const currentList = p[field] || [];
        const itemToDelete = currentList.find(item => item.id === rowId);

        // When removed from CMS detailReports, revert version status in PublishAdjust to 'draft'
        if (itemToDelete && section === 'detail') {
          try {
            const savedVer = localStorage.getItem('vna_chart_versions');
            if (savedVer) {
              const vers = JSON.parse(savedVer);
              const updatedVers = vers.map((v: any) => {
                if (v.chartCode === itemToDelete.value || v.indicatorCode === itemToDelete.value) {
                  return { ...v, publishStatus: 'deactive', isPublished: false };
                }
                return v;
              });
              localStorage.setItem('vna_chart_versions', JSON.stringify(updatedVers));
            }
          } catch (e) { }
        }

        return {
          ...p,
          [field]: currentList.filter(item => item.id !== rowId)
        };
      }
      return p;
    }));
  };

  // Drag and Drop state & helpers for attached reports (Jira Sprint & Backlog)
  const [draggedReport, setDraggedReport] = useState<{ section: 'news' | 'detail'; index: number } | null>(null);
  const [dragOverReport, setDragOverReport] = useState<{ section: 'news' | 'detail'; index: number } | null>(null);
  const [draggedBacklogItem, setDraggedBacklogItem] = useState<any | null>(null);
  const [isDragOverSprintZone, setIsDragOverSprintZone] = useState(false);

  // Helper to add a chart/indicator from Backlog into Sprint (detailReports)
  const addBacklogItemToSprint = (pillarId: string, sub: any, insertIndex?: number) => {
    const isInd = sub.isText || sub.unit === 'Văn bản';
    const newReportItem: ReportItem = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: isInd ? 'indicator' : 'chart',
      value: sub.code || sub.indicatorCode
    };

    setPillars(pillars.map(p => {
      if (p.id === pillarId) {
        const currentList = [...(p.detailReports || [])];
        const exists = currentList.some(item => item.value === newReportItem.value);
        if (exists) {
          setToast({ message: `Biểu đồ "${sub.name}" đã có trong Trang chi tiết!`, type: 'info' });
          return p;
        }

        if (insertIndex !== undefined && insertIndex >= 0) {
          currentList.splice(insertIndex, 0, newReportItem);
        } else {
          currentList.push(newReportItem);
        }

        return {
          ...p,
          detailReports: currentList
        };
      }
      return p;
    }));

    setToast({ message: `Đã đính kèm "${sub.name}" vào Trang chi tiết (Sprint)!`, type: 'success' });
  };

  const reorderReportRow = (pillarId: string, section: 'news' | 'detail', fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setPillars(pillars.map(p => {
      if (p.id === pillarId) {
        const field = section === 'news' ? 'newsReports' : 'detailReports';
        const list = [...(p[field] || [])];
        const [movedItem] = list.splice(fromIndex, 1);
        list.splice(toIndex, 0, movedItem);
        return {
          ...p,
          [field]: list
        };
      }
      return p;
    }));
  };

  const moveReportRow = (pillarId: string, section: 'news' | 'detail', index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    reorderReportRow(pillarId, section, index, targetIndex);
  };

  const handleAction = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#005f6e]">Quản trị Website ESG (Public)</h1>
          {/* <p className="text-black/45 text-sm mt-1">Cấu hình trực tiếp 4 phân hệ nội dung cốt lõi hiển thị trên trang thông tin đại chúng</p> */}
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

      {/* Top Horizontal Tabs - Luồng hiển thị trên Website */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-3 sm:p-4 mt-6">
        {/* 6 Horizontal Stepper Tabs (Tab chính) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Tab 1: Hero */}
          <button
            onClick={() => setActiveTab('hero')}
            className={`flex flex-col items-start gap-1 p-3 rounded-lg text-left transition-all duration-200 border cursor-pointer relative overflow-hidden ${activeTab === 'hero'
              ? 'bg-[#005f6e]/5 border-[#005f6e] text-[#005f6e] font-bold shadow-xs'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-slate-50 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#e6b441]">
                <LayoutDashboard size={13} /> 1. Đầu trang (Hero)
              </span>
              <div className={`w-2.5 h-2.5 rounded-full border ${activeTab === 'hero' ? 'bg-[#005f6e] border-[#e6b441]' : 'bg-white border-gray-300'}`} />
            </div>
            <span className="text-sm font-bold text-gray-900 line-clamp-1">Banner & Tiêu đề</span>
          </button>

          {/* Tab 2: CEO */}
          <button
            onClick={() => setActiveTab('ceo')}
            className={`flex flex-col items-start gap-1 p-3 rounded-lg text-left transition-all duration-200 border cursor-pointer relative overflow-hidden ${activeTab === 'ceo'
              ? 'bg-[#005f6e]/5 border-[#005f6e] text-[#005f6e] font-bold shadow-xs'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-slate-50 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#e6b441]">
                <Users size={13} /> 2. Thông điệp Lãnh đạo
              </span>
              <div className={`w-2.5 h-2.5 rounded-full border ${activeTab === 'ceo' ? 'bg-[#005f6e] border-[#e6b441]' : 'bg-white border-gray-300'}`} />
            </div>
            <span className="text-sm font-bold text-gray-900 line-clamp-1">Thông điệp CEO</span>
          </button>

          {/* Tab 3: Pillars (Mid) - Thông tin trụ cột Trang chủ */}
          <button
            onClick={() => {
              setActiveTab('pillars');
              if (!selectedPillarId) setSelectedPillarId('environment');
            }}
            className={`flex flex-col items-start gap-1 p-3 rounded-lg text-left transition-all duration-200 border cursor-pointer relative overflow-hidden ${activeTab === 'pillars'
              ? 'bg-[#005f6e]/5 border-[#005f6e] text-[#005f6e] font-bold shadow-xs'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-slate-50 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#e6b441]">
                <Landmark size={13} /> 3. Thân trang (Mid)
              </span>
              <div className={`w-2.5 h-2.5 rounded-full border ${activeTab === 'pillars' ? 'bg-[#005f6e] border-[#e6b441]' : 'bg-white border-gray-300'}`} />
            </div>
            <span className="text-sm font-bold text-gray-900 line-clamp-1">Thông tin trụ cột</span>
          </button>

          {/* Tab 4: Detail - Chi tiết Trụ cột & Quản lý Biểu đồ */}
          <button
            onClick={() => {
              setActiveTab('detail');
              if (!selectedPillarId) setSelectedPillarId('environment');
            }}
            className={`flex flex-col items-start gap-1 p-3 rounded-lg text-left transition-all duration-200 border cursor-pointer relative overflow-hidden ${activeTab === 'detail'
              ? 'bg-[#005f6e]/5 border-[#005f6e] text-[#005f6e] font-bold shadow-xs'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-slate-50 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#e6b441]">
                <Layers size={13} /> 4. Chỉ tiêu công bố
              </span>
              <div className={`w-2.5 h-2.5 rounded-full border ${activeTab === 'detail' ? 'bg-[#005f6e] border-[#e6b441]' : 'bg-white border-gray-300'}`} />
            </div>
            <span className="text-sm font-bold text-gray-900 line-clamp-1">Chỉ tiêu & Biểu đồ</span>
          </button>

          {/* Tab 5: News (Lower) */}
          <button
            onClick={() => setActiveTab('news')}
            className={`flex flex-col items-start gap-1 p-3 rounded-lg text-left transition-all duration-200 border cursor-pointer relative overflow-hidden ${activeTab === 'news'
              ? 'bg-[#005f6e]/5 border-[#005f6e] text-[#005f6e] font-bold shadow-xs'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-slate-50 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#e6b441]">
                <Newspaper size={13} /> 5. Thân trang (Lower)
              </span>
              <div className={`w-2.5 h-2.5 rounded-full border ${activeTab === 'news' ? 'bg-[#005f6e] border-[#e6b441]' : 'bg-white border-gray-300'}`} />
            </div>
            <span className="text-sm font-bold text-gray-900 line-clamp-1">Tin tức & Hoạt động</span>
          </button>

          {/* Tab 6: Reports (Footer) */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-start gap-1 p-3 rounded-lg text-left transition-all duration-200 border cursor-pointer relative overflow-hidden ${activeTab === 'reports'
              ? 'bg-[#005f6e]/5 border-[#005f6e] text-[#005f6e] font-bold shadow-xs'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-slate-50 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#e6b441]">
                <FileText size={13} /> 6. Cuối trang (Footer)
              </span>
              <div className={`w-2.5 h-2.5 rounded-full border ${activeTab === 'reports' ? 'bg-[#005f6e] border-[#e6b441]' : 'bg-white border-gray-300'}`} />
            </div>
            <span className="text-sm font-bold text-gray-900 line-clamp-1">Lưu trữ Báo cáo</span>
          </button>
        </div>

        {/* Tab trụ cột ESG (E - S - G) hiển thị khi chọn Tab 3 hoặc Tab 4 */}
        {(activeTab === 'pillars' || activeTab === 'detail') && (
          <div className="mt-3.5 pt-3.5 border-t border-gray-150 flex flex-wrap items-center justify-between gap-3 animate-in fade-in-50 duration-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Trụ cột ESG:</span>
              <div className="flex flex-wrap gap-2">
                {pillars.map((pillar) => {
                  const isSubActive = selectedPillarId === pillar.id;
                  let Icon = Leaf;
                  if (pillar.id === 'social') Icon = Users;
                  if (pillar.id === 'governance') Icon = Landmark;

                  return (
                    <button
                      key={pillar.id}
                      onClick={() => setSelectedPillarId(pillar.id)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${isSubActive
                        ? 'bg-[#005f6e] text-white shadow-xs border border-[#005f6e]'
                        : 'bg-slate-50 border border-gray-200 text-gray-700 hover:bg-slate-100 hover:border-gray-300'
                        }`}
                    >
                      <Icon size={13} className={isSubActive ? 'text-[#e6b441]' : 'text-gray-500'} />
                      <span>{editingLang === 'vi' ? pillar.nameVi : pillar.nameEn}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSubActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {pillar.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Ngôn ngữ:</span>
              <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                <button
                  onClick={() => setEditingLang('vi')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-200 ${editingLang === 'vi' ? 'bg-[#005f6e] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  VI
                </button>
                <button
                  onClick={() => setEditingLang('en')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-200 ${editingLang === 'en' ? 'bg-[#005f6e] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Full Width Content Container */}
      <div className="w-full mt-6">
        {activeTab === 'hero' && (
          <Card className="p-6 border-l-4 border-l-[#005f6e]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#005f6e]/10 flex items-center justify-center">
                  <LayoutDashboard size={16} className="text-[#005f6e]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black/85">Hero — Banner</h3>
                  {/* <p className="text-xs text-black/40 mt-0.5">Tiêu đề chính, hình ảnh nền banner và mô tả phụ</p> */}
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
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Tiêu đề chính</label>
                  <Input value={editingLang === 'vi' ? visionData.headlineVi : visionData.headlineEn} onChange={e => setVisionData({ ...visionData, [editingLang === 'vi' ? 'headlineVi' : 'headlineEn']: e.target.value })} className="font-semibold" />
                  {/* <p className="text-[10px] text-black/30 mt-1">Hiển thị làm tiêu đề H1 lớn nhất trên banner</p> */}
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
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Mô tả phụ</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#005f6e] focus:border-[#005f6e] text-sm" rows={2} value={editingLang === 'vi' ? visionData.subheadlineVi : visionData.subheadlineEn} onChange={e => setVisionData({ ...visionData, [editingLang === 'vi' ? 'subheadlineVi' : 'subheadlineEn']: e.target.value })} placeholder="Mô tả ngắn về cam kết ESG..." />
                {/* <p className="text-[10px] text-black/30 mt-1">Hiển thị phụ đề nhỏ bên dưới tiêu đề chính trên banner</p> */}
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
                  {/* <p className="text-xs text-black/40 mt-0.5">Họ tên, chức danh CEO và nội dung thông điệp</p> */}
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
                  {/* <p className="text-[10px] text-black/30 mt-1">Tên đầy đủ hiển thị phía dưới trích dẫn</p> */}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Chức danh — {editingLang === 'vi' ? 'Tiếng Việt' : 'English'}</label>
                  <Input value={editingLang === 'vi' ? visionData.ceoTitleVi : visionData.ceoTitleEn} onChange={e => setVisionData({ ...visionData, [editingLang === 'vi' ? 'ceoTitleVi' : 'ceoTitleEn']: e.target.value })} />
                  {/* <p className="text-[10px] text-black/30 mt-1">Chức danh hiển thị kèm tên</p> */}
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
                      Hỗ trợ JPG, PNG
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Nội dung Thông điệp — {editingLang === 'vi' ? 'Tiếng Việt' : 'English'}</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#005f6e] focus:border-[#005f6e] text-sm font-sans" rows={4} value={editingLang === 'vi' ? visionData.ceoMessageVi : visionData.ceoMessageEn} onChange={e => setVisionData({ ...visionData, [editingLang === 'vi' ? 'ceoMessageVi' : 'ceoMessageEn']: e.target.value })} placeholder="Trích dẫn thông điệp của CEO..." />
                {/* <p className="text-[10px] text-black/30 mt-1">Nội dung sẽ được hiển thị trong ô trích dẫn in nghiêng bên cạnh ảnh CEO</p> */}
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

        {activeTab === 'pillars' && (
          <div className="space-y-6">
            {/* Form Workspace - Thông tin trụ cột */}
            {(() => {
              const activePillar = pillars.find(p => p.id === selectedPillarId)!;
              return (
                <>


                  {/* Section 1: News Highlight Form (Trang chủ) */}
                  <Card className="p-6 bg-white border-gray-200 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                      <Newspaper size={18} className="text-[#005f6e]" />
                      <h4 className="font-bold text-sm text-gray-800">1. Cấu hình thông tin Trụ cột hiển thị ngoài Trang chủ</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Tiêu đề bài viết</label>
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

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Hình ảnh đại diện</label>
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
                        <label className="block text-xs font-bold text-gray-700 mb-1">Đoạn tóm tắt</label>
                        <textarea
                          rows={3}
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
                    </div>
                  </Card>

                  {/* Section 2: Pillar Detail Form (Bài viết chi tiết trụ cột) */}
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
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nội dung Định nghĩa chuyên môn</label>
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
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nội dung bài viết</label>
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
                    </div>
                  </Card>
                </>
              );
            })()}
          </div>
        )}

        {/* Tab 4: CHỈ TIÊU CÔNG BỐ - Quản lý Ẩn/Hiện thẻ chỉ tiêu & Bảng Công bố Biểu đồ */}

        {activeTab === 'detail' && (
          <div className="space-y-4">
            {(() => {
              const activePillar = pillars.find(p => p.id === selectedPillarId) || pillars[0];
              const pillarIndicators = getPillarIndicators(activePillar.id);

              const filteredPillarIndicators = pillarIndicators.filter(ind => {
                const isVisible = indicatorVisibility[ind.code] !== false;
                if (indicatorFilterStatus === 'visible' && !isVisible) return false;
                if (indicatorFilterStatus === 'hidden' && isVisible) return false;

                if (indicatorSearchQuery.trim()) {
                  const q = indicatorSearchQuery.toLowerCase();
                  return (ind.code || '').toLowerCase().includes(q) || (ind.name || '').toLowerCase().includes(q);
                }
                return true;
              });

              return (
                <>


                  {/* 2 SUB-TABS: 1 THẺ DANH SÁCH CHỈ TIÊU & 1 THẺ BIỂU ĐỒ */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                    <div className="flex border-b border-gray-200 bg-slate-50/60 px-3 pt-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPublishedIndicatorSubTab('indicators')}
                        className={`flex items-center gap-2 px-5 py-3 font-bold text-xs transition-all border-b-2 cursor-pointer rounded-t-lg ${publishedIndicatorSubTab === 'indicators'
                          ? 'border-[#005f6e] text-[#005f6e] bg-white shadow-xs'
                          : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-slate-100/50'
                          }`}
                      >
                        <Target size={15} />
                        <span>1. Danh sách Chỉ tiêu theo Trụ cột</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPublishedIndicatorSubTab('charts')}
                        className={`flex items-center gap-2 px-5 py-3 font-bold text-xs transition-all border-b-2 cursor-pointer rounded-t-lg ${publishedIndicatorSubTab === 'charts'
                          ? 'border-[#005f6e] text-[#005f6e] bg-white shadow-xs'
                          : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-slate-100/50'
                          }`}
                      >
                        <BarChart2 size={15} />
                        <span>2. Quản lý Biểu đồ Công bố </span>
                      </button>
                    </div>

                    {/* SUB-TAB 1 CONTENT: DANH SÁCH CHỈ TIÊU */}
                    {publishedIndicatorSubTab === 'indicators' && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse min-w-[750px]">
                          {/* HEADER GIỐNG CHỨC NĂNG QUẢN LÝ CHỈ TIÊU */}
                          <thead className="bg-gray-50/90 text-gray-700 border-b border-gray-200">
                            {/* ROW 1: TITLE CỘT & SORT */}
                            <tr className="text-xs font-semibold">
                              <th className="py-3 px-3 text-center w-14 text-gray-700">STT</th>

                              {/* MÃ CHỈ TIÊU */}
                              <th
                                className="py-3 px-3 w-48 text-gray-700 cursor-pointer hover:bg-gray-100/70 transition-colors select-none"
                                onClick={() => {
                                  if (indSortField === 'code') {
                                    setIndSortOrder(indSortOrder === 'asc' ? 'desc' : 'asc');
                                  } else {
                                    setIndSortField('code');
                                    setIndSortOrder('asc');
                                  }
                                }}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span>Mã chỉ tiêu</span>
                                  <span className="text-gray-400">
                                    {indSortField === 'code' && indSortOrder === 'asc' ? (
                                      <ArrowUp size={14} className="text-[#005f6e] font-bold" />
                                    ) : indSortField === 'code' && indSortOrder === 'desc' ? (
                                      <ArrowDown size={14} className="text-[#005f6e] font-bold" />
                                    ) : (
                                      <ArrowUpDown size={14} className="opacity-40" />
                                    )}
                                  </span>
                                </div>
                              </th>

                              {/* TÊN CHỈ TIÊU */}
                              <th
                                className="py-3 px-3 min-w-[280px] text-gray-700 cursor-pointer hover:bg-gray-100/70 transition-colors select-none"
                                onClick={() => {
                                  if (indSortField === 'name') {
                                    setIndSortOrder(indSortOrder === 'asc' ? 'desc' : 'asc');
                                  } else {
                                    setIndSortField('name');
                                    setIndSortOrder('asc');
                                  }
                                }}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span>Tên chỉ tiêu</span>
                                  <span className="text-gray-400">
                                    {indSortField === 'name' && indSortOrder === 'asc' ? (
                                      <ArrowUp size={14} className="text-[#005f6e] font-bold" />
                                    ) : indSortField === 'name' && indSortOrder === 'desc' ? (
                                      <ArrowDown size={14} className="text-[#005f6e] font-bold" />
                                    ) : (
                                      <ArrowUpDown size={14} className="opacity-40" />
                                    )}
                                  </span>
                                </div>
                              </th>

                              <th className="py-3 px-3 w-28 text-center text-gray-700 whitespace-nowrap">ĐVT</th>
                              <th className="py-3 px-3 w-36 text-center text-gray-700 whitespace-nowrap">Trạng thái</th>
                              <th className="py-3 px-3 w-32 text-center text-gray-700 whitespace-nowrap">Thao tác</th>
                            </tr>

                            {/* ROW 2: DÒNG LỌC (COLUMN FILTER ROW) */}
                            <tr className="bg-blue-50/60 border-t border-b border-gray-200">
                              {/* 1. STT Spacer */}
                              <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

                              {/* 2. Filter Mã chỉ tiêu */}
                              <th className="py-2 px-2 text-left">
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={searchIndCode}
                                    onChange={(e) => setSearchIndCode(e.target.value)}
                                    placeholder="Lọc mã..."
                                    className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-[#005f6e] shadow-2xs"
                                  />
                                  {searchIndCode && (
                                    <button
                                      type="button"
                                      onClick={() => setSearchIndCode('')}
                                      className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </th>

                              {/* 3. Filter Tên chỉ tiêu */}
                              <th className="py-2 px-2 text-left">
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={searchIndName}
                                    onChange={(e) => setSearchIndName(e.target.value)}
                                    placeholder="Lọc tên chỉ tiêu..."
                                    className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-[#005f6e] shadow-2xs"
                                  />
                                  {searchIndName && (
                                    <button
                                      type="button"
                                      onClick={() => setSearchIndName('')}
                                      className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </th>

                              {/* 4. ĐVT Spacer */}
                              <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

                              {/* 5. Filter Trạng thái */}
                              <th className="py-2 px-2 text-center">
                                <select
                                  value={indicatorFilterStatus}
                                  onChange={(e) => setIndicatorFilterStatus(e.target.value as any)}
                                  className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-[#005f6e] shadow-2xs cursor-pointer"
                                >
                                  <option value="all">Tất cả</option>
                                  <option value="visible">Đang hiện</option>
                                  <option value="hidden">Đang ẩn</option>
                                </select>
                              </th>

                              {/* 6. Thao tác Spacer */}
                              <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-150 bg-white text-xs">
                            {(() => {
                              let list = pillarIndicators.filter(ind => {
                                const isVisible = indicatorVisibility[ind.code] !== false;
                                if (indicatorFilterStatus === 'visible' && !isVisible) return false;
                                if (indicatorFilterStatus === 'hidden' && isVisible) return false;

                                if (searchIndCode.trim()) {
                                  if (!(ind.code || '').toLowerCase().includes(searchIndCode.toLowerCase().trim())) return false;
                                }
                                if (searchIndName.trim()) {
                                  if (!(ind.name || '').toLowerCase().includes(searchIndName.toLowerCase().trim())) return false;
                                }
                                return true;
                              });

                              if (indSortField === 'code') {
                                list = [...list].sort((a, b) => {
                                  const comp = (a.code || '').localeCompare(b.code || '');
                                  return indSortOrder === 'asc' ? comp : -comp;
                                });
                              } else if (indSortField === 'name') {
                                list = [...list].sort((a, b) => {
                                  const comp = (a.name || '').localeCompare(b.name || '');
                                  return indSortOrder === 'asc' ? comp : -comp;
                                });
                              }

                              if (list.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={6} className="py-8 text-center text-xs text-gray-400 italic">
                                      Không tìm thấy chỉ tiêu nào phù hợp với bộ lọc.
                                    </td>
                                  </tr>
                                );
                              }

                              return list.map((ind, index) => {
                                const isVisible = indicatorVisibility[ind.code] !== false;
                                const attachedCharts = (activePillar.detailReports || []).filter(rep => {
                                  const matchingSub = publishedSubChartsForPillar.find(s => s.code === rep.value || s.indicatorCode === rep.value);
                                  return rep.value === ind.code || matchingSub?.indicatorCode === ind.code;
                                });

                                return (
                                  <tr
                                    key={ind.code || index}
                                    className={`transition-colors ${isVisible ? 'hover:bg-slate-50/70' : 'bg-gray-50/50 opacity-75 hover:bg-gray-100/50'}`}
                                  >
                                    {/* 1. STT */}
                                    <td className="py-2.5 px-3 text-center font-mono text-gray-500 font-bold">
                                      #{index + 1}
                                    </td>

                                    {/* 2. Mã chỉ tiêu */}
                                    <td className="py-2.5 px-3">
                                      <span className="text-[11px] font-bold font-mono px-2 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-200 whitespace-nowrap shadow-2xs inline-block">
                                        {ind.code}
                                      </span>
                                    </td>

                                    {/* 3. Tên chỉ tiêu */}
                                    <td className="py-2.5 px-3 font-bold text-gray-900 leading-snug">
                                      <div className="flex items-center gap-2">
                                        <span>{ind.name}</span>
                                        {attachedCharts.length > 0 && (
                                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap shrink-0" title="Biểu đồ đã đính kèm">
                                            📊 {attachedCharts.length} biểu đồ
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* 4. Đơn vị tính */}
                                    <td className="py-2.5 px-3 text-center text-gray-600 font-medium">
                                      {ind.unit || '—'}
                                    </td>

                                    {/* 5. Trạng thái Web */}
                                    <td className="py-2.5 px-3 text-center">
                                      {isVisible ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          <Eye size={12} /> Đang hiện
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-250">
                                          <EyeOff size={12} /> Đang ẩn
                                        </span>
                                      )}
                                    </td>

                                    {/* 6. Thao tác Ẩn/Hiện */}
                                    <td className="py-2.5 px-3 text-center">
                                      <button
                                        type="button"
                                        onClick={() => toggleIndicatorVisibility(ind.code)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs border ${isVisible
                                          ? 'bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300'
                                          : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                                          }`}
                                        title={isVisible ? 'Ẩn thẻ chỉ tiêu này khỏi Trang chi tiết public' : 'Hiển thị thẻ chỉ tiêu này lên Trang chi tiết public'}
                                      >
                                        {isVisible ? (
                                          <>
                                            <EyeOff size={13} /> Ẩn thẻ
                                          </>
                                        ) : (
                                          <>
                                            <Eye size={13} /> Hiện thẻ
                                          </>
                                        )}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* SUB-TAB 2 CONTENT: QUẢN LÝ BIỂU ĐỒ (SPRINT & BACKLOG) - CHIA 2 CỘT TỶ LỆ 2:1 */}
                    {publishedIndicatorSubTab === 'charts' && (() => {
                      // Hàm helper chuẩn hóa và trích xuất thông tin đầy đủ của biểu đồ (Mã chỉ tiêu, Tên biểu đồ, ĐVT...)
                      const resolveChartInfo = (item: any) => {
                        if (!item) return null;
                        const rawCode = typeof item === 'string' ? item : (item.code || item.value || '');
                        if (!rawCode || rawCode.startsWith('http')) {
                          return publishedSubChartsForPillar[0] || availableBacklogSubCharts[0] || null;
                        }
                        const matchingSub = publishedSubChartsForPillar.find(s => s.code === rawCode || s.indicatorCode === rawCode);
                        if (matchingSub) return matchingSub;
                        const indInfo = indicatorMap.get(rawCode);
                        if (indInfo) {
                          return {
                            code: indInfo.code,
                            indicatorCode: indInfo.code,
                            name: indInfo.name,
                            unit: indInfo.unit || 'Tấn',
                            frequency: indInfo.frequency || 'Hàng tháng',
                            source: indInfo.department || 'Form Nhập liệu'
                          };
                        }
                        return {
                          code: rawCode,
                          indicatorCode: rawCode,
                          name: item.name && !item.name.startsWith('http') ? item.name : `Biểu đồ ${rawCode}`,
                          unit: 'Tấn',
                          frequency: 'Hàng tháng',
                          source: 'Form Nhập liệu'
                        };
                      };

                      // Xác định biểu đồ preview hiện tại (mặc định lấy phần tử đầu tiên hợp lệ trong Sprint hoặc Backlog)
                      const firstSprintItem = (activePillar.detailReports && activePillar.detailReports.length > 0)
                        ? resolveChartInfo(activePillar.detailReports[0])
                        : null;
                      const firstBacklogItem = (availableBacklogSubCharts.length > 0) ? availableBacklogSubCharts[0] : null;
                      
                      const activePreview = resolveChartInfo(sidePreviewChart) || firstSprintItem || firstBacklogItem;

                      const isCurrentPreviewInSprint = activePreview && (activePillar.detailReports || []).some(
                        r => r.value === activePreview.code || r.value === activePreview.indicatorCode
                      );

                      const previewDesc = activePreview ? getSubChartDescription(activePreview) : '';
                      const displayCode = activePreview?.indicatorCode || activePreview?.code || '';
                      const displayName = activePreview?.name || displayCode;

                      return (
                        <div className="p-4">
                          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                            {/* CỘT TRÁI (2/3): BẢNG SPRINT & BẢNG BACKLOG (GIỮ NGUYÊN THIẾT KẾ VÀ LOGIC) */}
                            <div className="xl:col-span-2 space-y-6">
                              {/* 1. SPRINT ZONE: CẤU HÌNH BÁO CÁO ĐÍNH KÈM TRANG CHI TIẾT (SPRINT) */}
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.dataTransfer.dropEffect = 'move';
                                  if (!isDragOverSprintZone) setIsDragOverSprintZone(true);
                                }}
                                onDragLeave={() => {
                                  setIsDragOverSprintZone(false);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDragOverSprintZone(false);
                                  if (draggedBacklogItem) {
                                    addBacklogItemToSprint(activePillar.id, draggedBacklogItem);
                                    setDraggedBacklogItem(null);
                                  }
                                }}
                                className={`bg-white rounded-xl border transition-all shadow-2xs overflow-hidden ${isDragOverSprintZone
                                  ? 'border-[#005f6e] ring-2 ring-[#005f6e]/30 bg-blue-50/20'
                                  : 'border-gray-250'
                                  }`}
                              >
                                {/* SPRINT HEADER */}
                                <div className="p-3.5 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-[#005f6e]/10 text-[#005f6e] rounded-lg border border-[#005f6e]/20">
                                      <Layers size={16} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                                          Cấu hình Báo cáo đính kèm Trang chi tiết (Biểu đồ xuất bản)
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400 font-medium italic flex items-center gap-1">
                                      <GripVertical size={12} /> Kéo thả đổi thứ tự
                                    </span>
                                  </div>
                                </div>

                                {/* SPRINT TABLE */}
                                {(!activePillar.detailReports || activePillar.detailReports.length === 0) ? (
                                  <div className="p-8 text-center bg-gray-50/60 flex flex-col items-center justify-center gap-2 border-b border-gray-100">
                                    <Inbox size={32} className="text-gray-300 stroke-1" />
                                    <p className="text-xs font-semibold text-gray-600">
                                      Chưa có biểu đồ nào được đính kèm vào Trang chi tiết
                                    </p>
                                    <p className="text-[11px] text-gray-400 max-w-md">
                                      Hãy kéo thả các thẻ biểu đồ từ <strong>Biểu đồ yêu cầu công bố (Backlog)</strong> bên dưới lên khu vực này.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-left border-collapse min-w-[700px]">
                                      <thead className="bg-gray-50/90 text-gray-700 border-b border-gray-200">
                                        <tr className="text-[11px] font-bold uppercase tracking-wider">
                                          <th className="py-2.5 px-3 w-14 text-center shrink-0">STT</th>
                                          <th className="py-2.5 px-3 w-36 whitespace-nowrap shrink-0">MÃ CHỈ TIÊU</th>
                                          <th className="py-2.5 px-3 w-56 min-w-[180px]">TÊN BIỂU ĐỒ</th>
                                          <th className="py-2.5 px-4 min-w-[240px]">MÔ TẢ BIỂU ĐỒ</th>
                                          <th className="py-2.5 px-3 w-28 text-center shrink-0">THAO TÁC</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-150 bg-white text-xs">
                                        {activePillar.detailReports.map((report, idx) => {
                                          const isDragging = draggedReport?.section === 'detail' && draggedReport?.index === idx;
                                          const isDragOver = dragOverReport?.section === 'detail' && dragOverReport?.index === idx;

                                          const matchingSub = publishedSubChartsForPillar.find(s => s.code === report.value || s.indicatorCode === report.value);
                                          const indInfo = indicatorMap.get(report.value) || (matchingSub ? { code: matchingSub.indicatorCode, name: matchingSub.name } : null);
                                          const chartName = matchingSub?.name || (indInfo?.name || report.value);
                                          const chartCode = matchingSub?.indicatorCode || indInfo?.code || (matchingSub?.code || report.value);
                                          const desc = matchingSub ? getSubChartDescription(matchingSub) : 'Biểu đồ được cấu hình xuất bản trên trang chi tiết.';

                                          const resolvedInfo = matchingSub || { code: report.value, name: chartName, indicatorCode: chartCode, unit: 'Tấn', frequency: 'Hàng tháng', source: 'Form Nhập liệu' };
                                          const isSelectedForPreview = activePreview && (activePreview.code === report.value || activePreview.code === matchingSub?.code || activePreview.indicatorCode === chartCode);

                                          return (
                                            <tr
                                              key={report.id}
                                              draggable
                                              onClick={() => {
                                                setSidePreviewChart(resolvedInfo);
                                              }}
                                              onDragStart={(e) => {
                                                e.dataTransfer.setData('text/plain', idx.toString());
                                                e.dataTransfer.effectAllowed = 'move';
                                                setDraggedReport({ section: 'detail', index: idx });
                                              }}
                                              onDragOver={(e) => {
                                                e.preventDefault();
                                                e.dataTransfer.dropEffect = 'move';
                                                if (dragOverReport?.index !== idx || dragOverReport?.section !== 'detail') {
                                                  setDragOverReport({ section: 'detail', index: idx });
                                                }
                                              }}
                                              onDragLeave={() => {
                                                if (dragOverReport?.index === idx) {
                                                  setDragOverReport(null);
                                                }
                                              }}
                                              onDrop={(e) => {
                                                e.preventDefault();
                                                if (draggedReport && draggedReport.section === 'detail') {
                                                  reorderReportRow(activePillar.id, 'detail', draggedReport.index, idx);
                                                } else if (draggedBacklogItem) {
                                                  addBacklogItemToSprint(activePillar.id, draggedBacklogItem, idx);
                                                  setDraggedBacklogItem(null);
                                                }
                                                setDraggedReport(null);
                                                setDragOverReport(null);
                                              }}
                                              onDragEnd={() => {
                                                setDraggedReport(null);
                                                setDragOverReport(null);
                                                setDraggedBacklogItem(null);
                                              }}
                                              className={`transition-all cursor-pointer ${isDragging
                                                ? 'opacity-40 bg-blue-50/40'
                                                : isDragOver
                                                  ? 'border-t-2 border-t-[#005f6e] bg-blue-50/20'
                                                  : isSelectedForPreview
                                                    ? 'bg-[#005f6e]/8 ring-1 ring-[#005f6e]/30'
                                                    : 'hover:bg-slate-50/70'
                                                }`}
                                            >
                                              {/* 1. STT & DRAG HANDLE */}
                                              <td className="py-3 px-3 text-center">
                                                <div className="flex items-center justify-center gap-1 text-gray-500">
                                                  <div
                                                    className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-[#005f6e] hover:bg-gray-100 rounded transition-colors"
                                                    title="Kéo thả để sắp xếp vị trí"
                                                  >
                                                    <GripVertical size={15} />
                                                  </div>
                                                  <span className="font-mono font-bold text-gray-700">#{idx + 1}</span>
                                                </div>
                                              </td>

                                              {/* 2. MÃ CHỈ TIÊU */}
                                              <td className="py-3 px-3">
                                                <span className="text-[11px] font-bold font-mono px-2 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-200 whitespace-nowrap shadow-2xs inline-block">
                                                  {chartCode}
                                                </span>
                                              </td>

                                              {/* 3. TÊN BIỂU ĐỒ */}
                                              <td className="py-3 px-3 font-bold text-gray-900 leading-snug">
                                                <div className="flex items-center gap-1.5">
                                                  {isSelectedForPreview && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#005f6e] shrink-0" title="Đang xem trước" />
                                                  )}
                                                  <span>{chartName}</span>
                                                </div>
                                              </td>

                                              {/* 4. MÔ TẢ BIỂU ĐỒ */}
                                              <td className="py-3 px-4 text-gray-700 text-xs leading-relaxed">
                                                <p
                                                  className={`whitespace-pre-line text-[11px] ${expandedDescMap[chartCode] ? '' : 'line-clamp-2'
                                                    }`}
                                                  title={expandedDescMap[chartCode] ? undefined : desc}
                                                >
                                                  {desc}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                  {desc.length > 80 && (
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpandedDescMap(prev => ({
                                                          ...prev,
                                                          [chartCode]: !prev[chartCode]
                                                        }));
                                                      }}
                                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#005f6e] hover:underline cursor-pointer"
                                                    >
                                                      {expandedDescMap[chartCode] ? '▲ Thu gọn' : '▼ Xem thêm'}
                                                    </button>
                                                  )}
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleOpenEditDesc(matchingSub || { code: report.value, name: chartName, indicatorCode: chartCode });
                                                    }}
                                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer ml-1"
                                                    title="Chỉnh sửa mô tả cho biểu đồ này"
                                                  >
                                                    Sửa mô tả
                                                  </button>
                                                </div>
                                              </td>

                                              {/* 5. THAO TÁC */}
                                              <td className="py-3 px-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setSidePreviewChart(resolvedInfo);
                                                    }}
                                                    className={`p-1.5 h-7.5 w-7.5 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs transition-all rounded-lg ${
                                                      isSelectedForPreview
                                                        ? 'bg-[#005f6e] text-white border-[#005f6e]'
                                                        : 'border-[#005f6e]/30 text-[#005f6e] hover:bg-[#005f6e] hover:text-white'
                                                    }`}
                                                    title="Xem trước biểu đồ ở khung bên phải"
                                                  >
                                                    <BarChart2 size={14} />
                                                  </Button>

                                                  <Button
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      deleteReportRow(activePillar.id, 'detail', report.id);
                                                    }}
                                                    className="text-red-500 hover:bg-red-50 p-1.5 h-7.5 w-7.5 rounded-lg shrink-0 flex items-center justify-center border border-transparent cursor-pointer"
                                                    title="Gỡ khỏi Trang chi tiết"
                                                  >
                                                    <Trash2 size={14} />
                                                  </Button>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* 2. BACKLOG ZONE: BIỂU ĐỒ YÊU CẦU CÔNG BỐ (BACKLOG POOL) */}
                              <div className="bg-white rounded-xl border border-gray-250 shadow-2xs overflow-hidden">
                                {/* BACKLOG HEADER */}
                                <div className="p-3.5 bg-gray-50/80 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-amber-500/10 text-amber-700 rounded-lg border border-amber-500/20">
                                      <Inbox size={16} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                                          Biểu đồ yêu cầu công bố (Backlog)
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {(searchChartCode || searchChartName) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSearchChartCode('');
                                        setSearchChartName('');
                                      }}
                                      className="text-xs font-bold text-red-600 hover:text-red-800 underline cursor-pointer px-2.5 py-1 rounded hover:bg-red-50"
                                    >
                                      Xóa tất cả lọc
                                    </button>
                                  )}
                                </div>

                                {/* BACKLOG TABLE WITH IN-COLUMN FILTERS */}
                                <div className="overflow-x-auto">
                                  {filteredPublishedSubCharts.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-gray-400 italic">
                                      Không tìm thấy biểu đồ nào phù hợp với bộ lọc trong Backlog.
                                    </div>
                                  ) : (
                                    <table className="min-w-full text-left border-collapse min-w-[700px]">
                                      <thead className="bg-gray-50/90 text-gray-700 border-b border-gray-200">
                                        {/* ROW 1: TITLE CỘT */}
                                        <tr className="text-xs font-semibold">
                                          <th className="py-3 px-3 w-14 text-center shrink-0 text-gray-700">STT</th>
                                          <th className="py-3 px-3 w-48 text-gray-700 shrink-0">Mã chỉ tiêu</th>
                                          <th className="py-3 px-3 w-56 min-w-[180px] text-gray-700">Tên biểu đồ</th>
                                          <th className="py-3 px-4 min-w-[240px] text-gray-700">Mô tả biểu đồ</th>
                                          <th className="py-3 px-3 w-28 text-center shrink-0 text-gray-700">Thao tác</th>
                                        </tr>

                                        {/* ROW 2: DÒNG LỌC (COLUMN FILTER ROW) */}
                                        <tr className="bg-blue-50/60 border-t border-b border-gray-200">
                                          {/* 1. STT Spacer */}
                                          <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

                                          {/* 2. Filter Mã chỉ tiêu */}
                                          <th className="py-2 px-2 text-left">
                                            <div className="relative">
                                              <input
                                                type="text"
                                                value={searchChartCode}
                                                onChange={(e) => setSearchChartCode(e.target.value)}
                                                placeholder="Lọc mã..."
                                                className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-[#005f6e] shadow-2xs"
                                              />
                                              {searchChartCode && (
                                                <button
                                                  type="button"
                                                  onClick={() => setSearchChartCode('')}
                                                  className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                                                >
                                                  ✕
                                                </button>
                                              )}
                                            </div>
                                          </th>

                                          {/* 3. Filter Tên biểu đồ */}
                                          <th className="py-2 px-2 text-left">
                                            <div className="relative">
                                              <input
                                                type="text"
                                                value={searchChartName}
                                                onChange={(e) => setSearchChartName(e.target.value)}
                                                placeholder="Lọc tên biểu đồ..."
                                                className="w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-[#005f6e] shadow-2xs"
                                              />
                                              {searchChartName && (
                                                <button
                                                  type="button"
                                                  onClick={() => setSearchChartName('')}
                                                  className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                                                >
                                                  ✕
                                                </button>
                                              )}
                                            </div>
                                          </th>

                                          {/* 4. Mô tả Spacer */}
                                          <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>

                                          {/* 5. Thao tác Spacer */}
                                          <th className="py-2 px-2 text-center text-gray-400 font-normal text-xs">—</th>
                                        </tr>
                                      </thead>

                                      <tbody className="divide-y divide-gray-150 bg-white text-xs">
                                        {filteredPublishedSubCharts.map((sub, index) => {
                                          const desc = getSubChartDescription(sub);
                                          const displayCode = sub.indicatorCode || sub.code || 'Chưa có mã';
                                          const isSelectedForPreview = activePreview && (activePreview.code === sub.code || activePreview.code === sub.indicatorCode);

                                          return (
                                            <tr
                                              key={sub.code}
                                              draggable
                                              onClick={() => {
                                                setSidePreviewChart(sub);
                                              }}
                                              onDragStart={(e) => {
                                                e.dataTransfer.setData('text/plain', sub.code);
                                                e.dataTransfer.effectAllowed = 'move';
                                                setDraggedBacklogItem(sub);
                                              }}
                                              onDragEnd={() => {
                                                setDraggedBacklogItem(null);
                                              }}
                                              className={`cursor-pointer transition-all group ${
                                                isSelectedForPreview
                                                  ? 'bg-[#005f6e]/8 ring-1 ring-[#005f6e]/30'
                                                  : 'hover:bg-blue-50/30'
                                              }`}
                                            >
                                              {/* 1. STT & DRAG HANDLE */}
                                              <td className="py-3 px-3 text-center">
                                                <div className="flex items-center justify-center gap-1 text-gray-500">
                                                  <div
                                                    className="p-1 rounded text-gray-400 hover:text-[#005f6e] hover:bg-gray-100 transition-colors"
                                                    title="Kéo thả lên Sprint phía trên"
                                                  >
                                                    <GripVertical size={15} />
                                                  </div>
                                                  <span className="font-mono font-bold text-gray-700">#{index + 1}</span>
                                                </div>
                                              </td>

                                              {/* 2. MÃ CHỈ TIÊU */}
                                              <td className="py-3 px-3">
                                                <span className="text-[11px] font-bold font-mono px-2 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-200 whitespace-nowrap shadow-2xs inline-block">
                                                  {displayCode}
                                                </span>
                                              </td>

                                              {/* 3. TÊN BIỂU ĐỒ */}
                                              <td className="py-3 px-3 font-bold text-gray-900 leading-snug">
                                                <div className="flex items-center gap-1.5">
                                                  {isSelectedForPreview && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#005f6e] shrink-0" title="Đang xem trước" />
                                                  )}
                                                  <span>{sub.name}</span>
                                                </div>
                                              </td>

                                              {/* 4. MÔ TẢ BIỂU ĐỒ */}
                                              <td className="py-3 px-4 text-gray-700 text-xs leading-relaxed">
                                                <p
                                                  className={`whitespace-pre-line text-[11px] ${expandedDescMap[sub.code] ? '' : 'line-clamp-2'
                                                    }`}
                                                  title={expandedDescMap[sub.code] ? undefined : desc}
                                                >
                                                  {desc}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                  {desc.length > 80 && (
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpandedDescMap(prev => ({
                                                          ...prev,
                                                          [sub.code]: !prev[sub.code]
                                                        }));
                                                      }}
                                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#005f6e] hover:underline cursor-pointer"
                                                    >
                                                      {expandedDescMap[sub.code] ? '▲ Thu gọn' : '▼ Xem thêm'}
                                                    </button>
                                                  )}
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleOpenEditDesc(sub);
                                                    }}
                                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer ml-1"
                                                    title="Chỉnh sửa mô tả cho biểu đồ này"
                                                  >
                                                    Sửa mô tả
                                                  </button>
                                                </div>
                                              </td>

                                              {/* 5. THAO TÁC */}
                                              <td className="py-3 px-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setSidePreviewChart(sub);
                                                    }}
                                                    className={`p-1.5 h-7.5 w-7.5 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs transition-all rounded-lg ${
                                                      isSelectedForPreview
                                                        ? 'bg-[#005f6e] text-white border-[#005f6e]'
                                                        : 'border-[#005f6e]/30 text-[#005f6e] hover:bg-[#005f6e] hover:text-white'
                                                    }`}
                                                    title="Xem trước biểu đồ ở khung bên phải"
                                                  >
                                                    <BarChart2 size={14} />
                                                  </Button>

                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      addBacklogItemToSprint(activePillar.id, sub);
                                                    }}
                                                    className="text-xs py-1 px-2.5 h-7.5 border-emerald-600/30 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 hover:text-emerald-800 font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs transition-all"
                                                    title="Đưa vào Báo cáo đính kèm (Sprint)"
                                                  >
                                                    <Plus size={13} />
                                                  </Button>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* CỘT PHẢI (1/3): KHUNG PREVIEW BIỂU ĐỒ TRỰC QUAN (STICKY) */}
                            <div className="xl:col-span-1 sticky top-6">
                              <div className="bg-white rounded-xl border border-gray-250 shadow-sm overflow-hidden animate-in fade-in duration-200">
                                {/* Header Preview */}
                                <div className="p-3.5 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-gray-200 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-[#005f6e]/10 text-[#005f6e]">
                                      <BarChart2 size={16} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                                      Xem trước Biểu đồ
                                    </span>
                                  </div>
                                </div>

                                {/* Body Preview */}
                                {!activePreview ? (
                                  <div className="p-10 text-center flex flex-col items-center justify-center gap-2 text-gray-400">
                                    <BarChart2 size={36} className="text-gray-300 stroke-1" />
                                    <p className="text-xs font-semibold text-gray-600">Chưa chọn biểu đồ nào</p>
                                    <p className="text-[11px] text-gray-400">
                                      Nhấp vào bất kỳ dòng nào ở bảng bên trái để xem trước biểu đồ tại đây.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="p-4 space-y-4">
                                    {/* Chart Title & Code */}
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-blue-50 text-[#005f6e] border border-blue-200 rounded">
                                          {displayCode}
                                        </span>
                                      </div>
                                      <h4 className="text-sm font-bold text-gray-900 leading-snug">
                                        {displayName}
                                      </h4>
                                    </div>

                                    {/* Realtime Chart Rendering */}
                                    <div className="h-[270px] bg-slate-50/80 p-2 rounded-xl border border-gray-200 shadow-inner">
                                      <IndicatorChart
                                        indicatorCode={activePreview.code}
                                        chartName={displayName}
                                        chartType={activePreview.code?.includes('SAF') ? 'doughnut' : 'line'}
                                      />
                                    </div>

                                    {/* Chart Description / Thuyết minh */}
                                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-xs space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-[#005f6e] text-[11px]">
                                          Mô tả / Thuyết minh:
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditDesc(activePreview)}
                                          className="text-[10px] font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                                        >
                                          Sửa mô tả
                                        </button>
                                      </div>
                                      <p className="text-gray-700 text-[11px] leading-relaxed whitespace-pre-line">
                                        {previewDesc}
                                      </p>
                                    </div>

                                    {/* Quick Action Button */}
                                    <div className="pt-2 border-t border-gray-150 flex items-center justify-between gap-2">
                                      {isCurrentPreviewInSprint ? (
                                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                                          <CheckCircle size={13} /> Đang đính kèm trang chi tiết
                                        </span>
                                      ) : (
                                        <Button
                                          variant="primary"
                                          size="sm"
                                          onClick={() => addBacklogItemToSprint(activePillar.id, activePreview)}
                                          className="w-full bg-[#005f6e] hover:bg-[#004e5a] text-white border-transparent text-xs font-bold py-1.5 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                        >
                                          <Plus size={14} /> Đưa biểu đồ này vào Trang chi tiết (Sprint)
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {activeTab === 'news' && (
          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-black/85">Quản lý Bảng tin ESG</h3>
                  {/* <p className="text-sm text-black/45">Đồng bộ từ Spirit VNA & Phê duyệt tin bài nội bộ</p> */}
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
                {/* <button
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${newsSubTab === 'approve' ? 'border-[#e6b441] text-[#005f6e]' : 'border-transparent text-black/45 hover:text-gray-700'}`}
                    onClick={() => setNewsSubTab('approve')}
                  >
                    Phê duyệt tin bài nội bộ
                  </button> */}
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
                {/* <p className="text-sm text-black/45">Quản lý file PDF Báo cáo thường niên và Báo cáo bền vững</p> */}
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
                                  {p.newsReports && p.newsReports.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                                      <div className="text-[10px] font-bold text-[#005f6e] uppercase tracking-wide text-left">
                                        {previewLang === 'vi' ? 'Báo cáo đính kèm:' : 'Attached Reports:'}
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {p.newsReports.map((rep) => (
                                          <span key={rep.id} className="text-[9px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-650 font-medium whitespace-nowrap">
                                            {rep.type === 'chart' ? '📊 Biểu đồ' : `📈 Chỉ tiêu: ${rep.value}`}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
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

                            {/* Visible Pillar Indicators Section (Web Public) */}
                            {(() => {
                              const pillarInds = getPillarIndicators(p.id).filter(ind => indicatorVisibility[ind.code] !== false);
                              if (pillarInds.length === 0) return null;

                              return (
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 text-left">
                                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <h3 className="font-bold text-sm text-[#005f6e] flex items-center gap-2">
                                      <Target size={16} />
                                      {previewLang === 'vi' ? '4. Danh mục Chỉ tiêu Trụ cột' : '4. Pillar Indicators & Metrics'}
                                    </h3>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                                      {pillarInds.length} {previewLang === 'vi' ? 'chỉ tiêu công bố' : 'published indicators'}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 gap-3">
                                    {pillarInds.map((ind) => {
                                      const attachedCharts = (p.detailReports || []).filter(rep => {
                                        const matchingSub = publishedSubChartsForPillar.find(s => s.code === rep.value || s.indicatorCode === rep.value);
                                        return rep.value === ind.code || matchingSub?.indicatorCode === ind.code;
                                      });

                                      return (
                                        <div key={ind.code} className="border border-gray-150 rounded-xl p-3.5 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] font-bold text-[#005f6e] bg-[#005f6e]/10 px-2 py-0.5 rounded font-mono">
                                                {ind.code}
                                              </span>
                                              <span className="font-bold text-xs text-gray-900">{ind.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                              <span>{ind.unit ? `ĐVT: ${ind.unit}` : ''}</span>
                                              <span>•</span>
                                              <span>{ind.frequency || 'Hàng năm'}</span>
                                            </div>
                                          </div>

                                          {/* Render charts attached to this indicator */}
                                          {attachedCharts.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-gray-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                              {attachedCharts.map(rep => {
                                                const matchingSub = publishedSubChartsForPillar.find(s => s.code === rep.value || s.indicatorCode === rep.value);
                                                const chartName = matchingSub?.name || (rep.type === 'chart' ? rep.value : rep.value);
                                                return (
                                                  <div key={rep.id} className="bg-white p-2 rounded-lg border border-blue-100 flex items-center justify-between gap-2 shadow-2xs">
                                                    <span className="text-[11px] font-semibold text-gray-800 truncate">
                                                      📊 {chartName}
                                                    </span>
                                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold shrink-0">
                                                      Đã công bố
                                                    </span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Attached Reports for Details */}
                            {p.detailReports && p.detailReports.length > 0 && (
                              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 text-left">
                                <h3 className="font-bold text-sm text-[#005f6e] border-b border-gray-100 pb-2 flex items-center gap-2">
                                  <Target size={16} />
                                  {previewLang === 'vi' ? '4. Báo cáo & Số liệu Trụ cột bổ sung' : '4. Additional Pillar Reports & Metrics'}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {p.detailReports.map((rep) => {
                                    if (rep.type === 'chart') {
                                      return (
                                        <div key={rep.id} className="border border-gray-150 rounded-xl overflow-hidden shadow-2xs bg-slate-50 flex flex-col justify-between">
                                          <div className="p-3 border-b border-gray-150 bg-white">
                                            <span className="text-[10px] font-bold text-[#005f6e] uppercase tracking-wider">📊 Biểu đồ trực quan</span>
                                          </div>
                                          <div className="p-2 aspect-video flex items-center justify-center bg-gray-100">
                                            {rep.value ? (
                                              <img
                                                src={rep.value}
                                                alt="Chart"
                                                className="w-full h-full object-cover rounded"
                                                onError={(e) => {
                                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=400&auto=format&fit=crop";
                                                }}
                                              />
                                            ) : (
                                              <span className="text-[10px] text-gray-400 italic">Chưa nhập URL biểu đồ</span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    } else {
                                      const ind = indicatorMap.get(rep.value);
                                      return (
                                        <div key={rep.id} className="border border-gray-150 rounded-xl p-4 bg-blue-50/20 border-l-4 border-l-[#005f6e] flex flex-col justify-between">
                                          <div>
                                            <div className="flex justify-between items-center mb-1">
                                              <span className="text-[10px] font-bold text-[#005f6e] bg-[#005f6e]/10 px-2 py-0.5 rounded font-mono">
                                                {rep.value}
                                              </span>
                                              <span className="text-[9px] text-slate-400 font-medium">Chỉ tiêu gốc</span>
                                            </div>
                                            <h4 className="font-bold text-xs text-slate-800 line-clamp-2">
                                              {ind ? ind.name : rep.value}
                                            </h4>
                                            {ind && <p className="text-[10px] text-slate-400 mt-1">Đơn vị: {ind.unit} • Tần suất: {ind.frequency}</p>}
                                          </div>
                                        </div>
                                      );
                                    }
                                  })}
                                </div>
                              </div>
                            )}
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

      {/* MODAL CHỈNH SỬA MÔ TẢ / THUYẾT MINH BIỂU ĐỒ */}
      {editingChartForDesc && (
        <div className="fixed inset-0 bg-[#0d1525]/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Chỉnh sửa Mô tả / Thuyết minh Biểu đồ</h3>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                    {editingChartForDesc.indicatorCode || editingChartForDesc.code}: {editingChartForDesc.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingChartForDesc(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-lg transition-colors cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
              <label className="block text-xs font-bold text-gray-700">
                Nội dung mô tả / Thuyết minh (hiển thị trên Web Public):
              </label>
              <textarea
                rows={5}
                value={editingDescInput}
                onChange={(e) => setEditingDescInput(e.target.value)}
                placeholder="Nhập phần diễn giải, thuyết minh chi tiết cho biểu đồ này..."
                className="w-full text-xs font-normal bg-white border border-gray-300 rounded-xl p-3 text-gray-800 outline-none focus:border-[#005f6e] focus:ring-1 focus:ring-[#005f6e] shadow-2xs leading-relaxed"
              />
              <p className="text-[11px] text-gray-400 italic">
                * Thuyết minh này sẽ hiển thị bên dưới biểu đồ trên trang chi tiết web public để giải thích số liệu cho người xem.
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-3.5 border-t border-gray-100 bg-gray-50/50">
              <Button variant="outline" size="sm" onClick={() => setEditingChartForDesc(null)}>
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveDesc}
                className="bg-[#005f6e] hover:bg-[#004e5a] text-white border-transparent font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={14} /> Lưu mô tả
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM TRƯỚC BIỂU ĐỒ ĐÃ CÔNG BỐ */}
      {previewingChart && (
        <div className="fixed inset-0 bg-[#0d1525]/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-[#005f6e]">
                  <Eye size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-[#005f6e] border border-blue-200 rounded font-mono">
                      {previewingChart.code}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded">
                      Đang công bố
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mt-0.5">{previewingChart.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setPreviewingChart(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-lg transition-colors cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-150">
                <div>
                  <span className="text-gray-400 block text-[10px]">Đơn vị tính:</span>
                  <span className="font-semibold text-gray-700">{previewingChart.unit}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Tần suất:</span>
                  <span className="font-semibold text-gray-700">{previewingChart.frequency}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Nguồn số liệu:</span>
                  <span className="font-semibold text-gray-700 truncate block" title={previewingChart.source}>{previewingChart.source}</span>
                </div>
              </div>

              <div className="h-[280px] bg-slate-50 p-3 rounded-xl border border-gray-200">
                <IndicatorChart
                  indicatorCode={previewingChart.code}
                  chartName={previewingChart.name}
                  chartType={previewingChart.code.includes('SAF') ? 'doughnut' : 'line'}
                />
              </div>

              {/* Hiển thị mô tả / thuyết minh của biểu đồ nếu có */}
              {(() => {
                const desc = previewingChart.description || chartDescriptions[`${previewingChart.indicatorCode}_${previewingChart.code}`] || chartDescriptions[previewingChart.code];
                if (!desc) return null;
                return (
                  <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 text-xs text-gray-700">
                    <span className="font-bold text-[#005f6e] block mb-1">Mô tả / Thuyết minh biểu đồ:</span>
                    <p className="whitespace-pre-line leading-relaxed">{desc}</p>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-3.5 border-t border-gray-100 bg-gray-50/50">
              <Button variant="outline" size="sm" onClick={() => setPreviewingChart(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
