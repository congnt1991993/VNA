import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  BookOpen,
  Leaf,
  Users,
  Landmark,
  Search,
  Scale,
  Calendar,
  Building2,
  CheckCircle2,
  ChevronDown,
  FileText,
  Lightbulb,
  Wrench,
  Activity,
  Info
} from 'lucide-react';
import indicatorsDataVI from './indicators_main_list.json';
import indicatorsDataEN from './indicators_main_list_en.json';

interface IntroductionPageProps {
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



const OverviewContent = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
          {isEn ? 'Vietnam Airlines ESG Overview' : 'Hành trình phát triển bền vững cùng Vietnam Airlines'}
        </h2>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4 text-sm text-slate-600 leading-relaxed text-justify">
        <h3 className="font-extrabold text-slate-900 text-lg">
          {isEn ? 'Taking off for a sustainable future' : 'Cất cánh vì một tương lai bền vững'}
        </h3>
        <p>
          {isEn
            ? "As the National Flag Carrier of Vietnam, Vietnam Airlines identifies sustainable development as a central part of its long-term growth strategy. In the context of the global aviation industry shifting strongly towards reducing emissions, optimizing resources, and enhancing social responsibility, Vietnam Airlines is gradually integrating ESG criteria into its governance, operations, services, and supply chain."
            : "Là Hãng hàng không Quốc gia Việt Nam, Vietnam Airlines xác định phát triển bền vững là một phần trọng tâm trong chiến lược tăng trưởng dài hạn. Trong bối cảnh ngành hàng không toàn cầu đang chuyển dịch mạnh mẽ theo hướng giảm phát thải, tối ưu tài nguyên và nâng cao trách nhiệm xã hội, Vietnam Airlines từng bước tích hợp các tiêu chí ESG vào hoạt động quản trị, khai thác, dịch vụ và chuỗi cung ứng."}
        </p>
        <p>
          {isEn
            ? "ESG at Vietnam Airlines is not only an environmental commitment but also a governance orientation aimed at balancing business efficiency, community responsibility, aviation safety, customer experience, and operational transparency."
            : "ESG tại Vietnam Airlines không chỉ là cam kết về môi trường, mà còn là định hướng quản trị nhằm cân bằng giữa hiệu quả kinh doanh, trách nhiệm với cộng đồng, an toàn hàng không, trải nghiệm khách hàng và sự minh bạch trong vận hành."}
        </p>

        <hr className="my-6 border-slate-100" />

        <h3 className="font-extrabold text-slate-900 text-lg">{isEn ? 'What is ESG?' : 'ESG là gì?'}</h3>
        <p>{isEn ? 'ESG is a set of criteria evaluating a company based on three aspects: Environmental, Social, and Governance.' : 'ESG là bộ tiêu chí đánh giá doanh nghiệp dựa trên ba khía cạnh: Môi trường (Environmental), Xã hội (Social), và Quản trị (Governance).'}</p>

        <h4 className="font-bold text-slate-800 mt-4">{isEn ? '1. Green development and emissions reduction' : '1. Phát triển xanh và giảm phát thải'}</h4>
        <p>{isEn ? 'Vietnam Airlines is gradually promoting emission reduction initiatives in flight and ground operations. Priorities include optimizing fleet operations, saving fuel, applying sustainable aviation fuel (SAF), enhancing digital transformation to track emissions, and improving operational efficiency.' : 'Vietnam Airlines từng bước thúc đẩy các sáng kiến giảm phát thải trong hoạt động bay và hoạt động mặt đất. Các ưu tiên bao gồm tối ưu hóa khai thác đội bay, tiết kiệm nhiên liệu, ứng dụng nhiên liệu hàng không bền vững SAF, tăng cường chuyển đổi số để theo dõi phát thải và cải thiện hiệu quả vận hành.'}</p>

        <h4 className="font-bold text-slate-800 mt-4">{isEn ? '2. People and safety-centric' : '2. Lấy con người và an toàn làm trung tâm'}</h4>
        <p>{isEn ? 'Flight safety, occupational safety, and service quality are the foundation of all Vietnam Airlines activities. The airline focuses on human resource training, professional capacity development, ensuring employee rights, promoting gender equality, and enhancing passenger experience throughout the journey.' : 'An toàn bay, an toàn lao động và chất lượng dịch vụ là nền tảng trong mọi hoạt động của Vietnam Airlines. Hãng chú trọng đào tạo nguồn nhân lực, phát triển năng lực chuyên môn, bảo đảm quyền lợi người lao động, thúc đẩy bình đẳng giới và nâng cao trải nghiệm hành khách trên toàn bộ hành trình.'}</p>

        <h4 className="font-bold text-slate-800 mt-4">{isEn ? '3. Transparent governance and sustainable adaptation' : '3. Quản trị minh bạch và thích ứng bền vững'}</h4>
        <p>{isEn ? 'Vietnam Airlines enhances governance capacity through internal control systems, risk management, aviation regulation compliance, information disclosure, and gradually approaching international standards in ESG measurement, management, and reporting.' : 'Vietnam Airlines tăng cường năng lực quản trị thông qua hệ thống kiểm soát nội bộ, quản lý rủi ro, tuân thủ quy định hàng không, công bố thông tin và từng bước tiếp cận các chuẩn mực quốc tế trong đo lường, quản lý và báo cáo ESG.'}</p>

        <hr className="my-6 border-slate-100" />

        <h3 className="font-extrabold text-slate-900 text-lg">{isEn ? 'ESG Focus Areas' : 'Các trọng tâm ESG'}</h3>
        <h4 className="font-bold text-slate-800 mt-4">{isEn ? 'Environmental' : 'Môi trường'}</h4>
        <p>{isEn ? 'Vietnam Airlines aims to reduce environmental impact across the aviation value chain. Focus areas include:' : 'Vietnam Airlines đặt mục tiêu giảm tác động môi trường trong toàn bộ chuỗi hoạt động hàng không. Trọng tâm bao gồm:'}</p>
        <ul className="list-disc pl-5 space-y-1">
          {isEn ? (
            <>
              <li>Tracking and managing greenhouse gas emissions.</li>
              <li>Optimizing aviation fuel consumption.</li>
              <li>Gradually expanding the use of sustainable aviation fuel (SAF).</li>
              <li>Applying technology and digital transformation to monitor operational efficiency.</li>
              <li>Reducing waste, enhancing recycling, and efficient resource use.</li>
              <li>Promoting afforestation, environmental protection, and community awareness programs.</li>
            </>
          ) : (
            <>
              <li>Theo dõi và quản lý phát thải khí nhà kính.</li>
              <li>Tối ưu tiêu thụ nhiên liệu bay.</li>
              <li>Từng bước mở rộng sử dụng nhiên liệu hàng không bền vững SAF.</li>
              <li>Ứng dụng công nghệ và chuyển đổi số để giám sát hiệu quả vận hành.</li>
              <li>Giảm chất thải, tăng cường tái chế và sử dụng tài nguyên hiệu quả.</li>
              <li>Thúc đẩy các chương trình trồng rừng, bảo vệ môi trường và nâng cao nhận thức cộng đồng.</li>
            </>
          )}
        </ul>

        <h4 className="font-bold text-slate-800 mt-4">{isEn ? 'Social' : 'Xã hội'}</h4>
        <p>{isEn ? 'Vietnam Airlines is committed to building a safe, professional, and humane working environment while actively contributing to the community. Key focus areas include:' : 'Vietnam Airlines cam kết xây dựng môi trường làm việc an toàn, chuyên nghiệp và nhân văn, đồng thời đóng góp tích cực cho cộng đồng. Các nội dung trọng tâm gồm:'}</p>
        <ul className="list-disc pl-5 space-y-1">
          {isEn ? (
            <>
              <li>Ensuring flight safety and operational safety.</li>
              <li>Enhancing passenger service quality.</li>
              <li>Developing high-quality aviation human resources.</li>
              <li>Enhancing training, welfare, and career development opportunities for employees.</li>
              <li>Promoting equality, diversity, and inclusion in the workplace.</li>
              <li>Implementing social responsibility programs such as community support, volunteering, blood donation, supporting disadvantaged children, and humanitarian activities.</li>
            </>
          ) : (
            <>
              <li>Đảm bảo an toàn bay và an toàn khai thác.</li>
              <li>Nâng cao chất lượng phục vụ hành khách.</li>
              <li>Phát triển nguồn nhân lực hàng không chất lượng cao.</li>
              <li>Tăng cường đào tạo, phúc lợi và cơ hội phát triển nghề nghiệp cho người lao động.</li>
              <li>Thúc đẩy bình đẳng, đa dạng và hòa nhập trong môi trường làm việc.</li>
              <li>Triển khai các chương trình trách nhiệm xã hội như hỗ trợ cộng đồng, thiện nguyện, hiến máu, hỗ trợ trẻ em có hoàn cảnh khó khăn và các hoạt động nhân đạo.</li>
            </>
          )}
        </ul>

        <h4 className="font-bold text-slate-800 mt-4">{isEn ? 'Governance' : 'Quản trị'}</h4>
        <p>{isEn ? 'Vietnam Airlines strives for a transparent, efficient, and responsible governance model. Priorities include:' : 'Vietnam Airlines hướng tới mô hình quản trị minh bạch, hiệu quả và có trách nhiệm. Các ưu tiên bao gồm:'}</p>
        <ul className="list-disc pl-5 space-y-1">
          {isEn ? (
            <>
              <li>Compliance with legal regulations and aviation standards.</li>
              <li>Enhancing the role of the Board of Directors, Executive Board, and internal control mechanisms.</li>
              <li>Strengthening risk management, including operational, financial, climate, safety, and supply chain risks.</li>
              <li>Ensuring information transparency with shareholders, investors, and stakeholders.</li>
              <li>Promoting business ethics, preventing conflicts of interest, and enhancing accountability.</li>
              <li>Protecting customer data and enhancing information security.</li>
            </>
          ) : (
            <>
              <li>Tuân thủ quy định pháp luật và tiêu chuẩn hàng không.</li>
              <li>Nâng cao vai trò của Hội đồng quản trị, Ban điều hành và các cơ chế kiểm soát nội bộ.</li>
              <li>Tăng cường quản trị rủi ro, bao gồm rủi ro vận hành, tài chính, khí hậu, an toàn và chuỗi cung ứng.</li>
              <li>Đảm bảo minh bạch thông tin với cổ đông, nhà đầu tư và các bên liên quan.</li>
              <li>Thúc đẩy đạo đức kinh doanh, phòng chống xung đột lợi ích và nâng cao trách nhiệm giải trình.</li>
              <li>Bảo vệ dữ liệu khách hàng và tăng cường an ninh thông tin.</li>
            </>
          )}
        </ul>

        <hr className="my-6 border-slate-100" />

        <h3 className="font-extrabold text-slate-900 text-lg">{isEn ? 'Key ESG Indicators' : 'Chỉ tiêu ESG trọng yếu'}</h3>
        <p>{isEn ? "Vietnam Airlines' ESG dashboard can monitor the following main indicator groups:" : 'Trang tổng quan ESG của Vietnam Airlines có thể theo dõi các nhóm chỉ tiêu chính sau:'}</p>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left text-slate-500 border border-slate-200">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3 border-b">{isEn ? 'Pillar' : 'Trụ cột'}</th>
                <th className="px-4 py-3 border-b">{isEn ? 'Indicator Group' : 'Nhóm chỉ tiêu'}</th>
                <th className="px-4 py-3 border-b">{isEn ? 'KPI Examples' : 'Ví dụ KPI'}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-emerald-600">{isEn ? 'Environment' : 'Môi trường'}</td>
                <td className="px-4 py-3">{isEn ? 'Emissions' : 'Phát thải'}</td>
                <td className="px-4 py-3">{isEn ? 'Total CO₂ emissions, CO₂/RPK, CO₂/ASK, Scope 1, Scope 2, Scope 3' : 'Tổng phát thải CO₂, CO₂/RPK, CO₂/ASK, Scope 1, Scope 2, Scope 3'}</td>
              </tr>
              <tr className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-emerald-600">{isEn ? 'Environment' : 'Môi trường'}</td>
                <td className="px-4 py-3">{isEn ? 'Fuel' : 'Nhiên liệu'}</td>
                <td className="px-4 py-3">{isEn ? 'Total fuel consumption, fuel burn/ASK, SAF ratio, emissions reduced by SAF' : 'Tổng nhiên liệu tiêu thụ, fuel burn/ASK, tỷ lệ SAF, lượng phát thải giảm nhờ SAF'}</td>
              </tr>
              <tr className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-emerald-600">{isEn ? 'Environment' : 'Môi trường'}</td>
                <td className="px-4 py-3">{isEn ? 'Resources' : 'Tài nguyên'}</td>
                <td className="px-4 py-3">{isEn ? 'Electricity, water, waste, recycling rate, energy-saving initiatives' : 'Điện, nước, chất thải, tỷ lệ tái chế, sáng kiến tiết kiệm năng lượng'}</td>
              </tr>
              <tr className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-blue-600">{isEn ? 'Social' : 'Xã hội'}</td>
                <td className="px-4 py-3">{isEn ? 'Safety' : 'An toàn'}</td>
                <td className="px-4 py-3">{isEn ? 'Number of safety incidents, incident rate/1,000 flights, safety audit results' : 'Số sự cố an toàn, tỷ lệ sự cố/1.000 chuyến bay, kết quả đánh giá an toàn'}</td>
              </tr>
              <tr className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-blue-600">{isEn ? 'Social' : 'Xã hội'}</td>
                <td className="px-4 py-3">{isEn ? 'Human Resources' : 'Nhân sự'}</td>
                <td className="px-4 py-3">{isEn ? 'Total employees, training hours/person, female management ratio, turnover rate' : 'Tổng lao động, giờ đào tạo/người, tỷ lệ nữ trong quản lý, tỷ lệ nghỉ việc'}</td>
              </tr>
              <tr className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-blue-600">{isEn ? 'Social' : 'Xã hội'}</td>
                <td className="px-4 py-3">{isEn ? 'Customers' : 'Khách hàng'}</td>
                <td className="px-4 py-3">{isEn ? 'Satisfaction index, NPS, complaints, punctuality, special passenger assistance' : 'Chỉ số hài lòng, NPS, khiếu nại, đúng giờ, hỗ trợ hành khách đặc biệt'}</td>
              </tr>
              <tr className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-blue-600">{isEn ? 'Social' : 'Xã hội'}</td>
                <td className="px-4 py-3">{isEn ? 'Community' : 'Cộng đồng'}</td>
                <td className="px-4 py-3">{isEn ? 'Number of social programs, contribution value, number of beneficiaries' : 'Số chương trình xã hội, giá trị đóng góp, số người thụ hưởng'}</td>
              </tr>
              <tr className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-amber-600">{isEn ? 'Governance' : 'Quản trị'}</td>
                <td className="px-4 py-3">{isEn ? 'Compliance' : 'Tuân thủ'}</td>
                <td className="px-4 py-3">{isEn ? 'Number of violations, disclosure status, audits, risk management' : 'Số vụ vi phạm, tình trạng công bố thông tin, kiểm toán, quản lý rủi ro'}</td>
              </tr>
              <tr className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-amber-600">{isEn ? 'Governance' : 'Quản trị'}</td>
                <td className="px-4 py-3">{isEn ? 'Supply Chain' : 'Chuỗi cung ứng'}</td>
                <td className="px-4 py-3">{isEn ? 'Percentage of suppliers assessed for ESG, sustainable procurement' : 'Tỷ lệ nhà cung cấp được đánh giá ESG, mua sắm bền vững'}</td>
              </tr>
              <tr className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-amber-600">{isEn ? 'Governance' : 'Quản trị'}</td>
                <td className="px-4 py-3">{isEn ? 'Data' : 'Dữ liệu'}</td>
                <td className="px-4 py-3">{isEn ? 'Information security incidents, level of ESG process digitization' : 'Sự cố an ninh thông tin, mức độ số hóa quy trình ESG'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr className="my-6 border-slate-100" />

        <h3 className="font-extrabold text-slate-900 text-lg">{isEn ? 'Highlight Actions' : 'Hành động nổi bật'}</h3>
        <p>{isEn ? 'Vietnam Airlines is gradually materializing its ESG strategy through practical actions:' : 'Vietnam Airlines đang từng bước cụ thể hóa chiến lược ESG bằng các hành động thực tiễn:'}</p>
        <ul className="list-disc pl-5 space-y-1">
          {isEn ? (
            <>
              <li>Pioneering the testing and application of sustainable aviation fuel (SAF) in Vietnam.</li>
              <li>Expanding flights using SAF on both international and domestic routes.</li>
              <li>Applying digital transformation to monitor, optimize operations, and control emissions.</li>
              <li>Implementing community programs, environmental protection, and ecosystem restoration.</li>
              <li>Strengthening internal governance, risk control, and enhancing operational transparency.</li>
              <li>Aiming for carbon neutrality by 2050, in line with the sustainable development orientation of Vietnam and the global aviation industry.</li>
            </>
          ) : (
            <>
              <li>Tiên phong thử nghiệm và ứng dụng nhiên liệu hàng không bền vững SAF tại Việt Nam.</li>
              <li>Mở rộng các chuyến bay sử dụng SAF trên cả đường bay quốc tế và nội địa.</li>
              <li>Ứng dụng chuyển đổi số để theo dõi, tối ưu vận hành và kiểm soát phát thải.</li>
              <li>Triển khai các chương trình cộng đồng, bảo vệ môi trường và phục hồi hệ sinh thái.</li>
              <li>Tăng cường quản trị nội bộ, kiểm soát rủi ro và nâng cao tính minh bạch trong hoạt động.</li>
              <li>Hướng tới mục tiêu trung hòa carbon vào năm 2050, phù hợp với định hướng phát triển bền vững của Việt Nam và ngành hàng không toàn cầu.</li>
            </>
          )}
        </ul>

        <hr className="my-6 border-slate-100" />

        <h3 className="font-extrabold text-slate-900 text-lg">{isEn ? 'ESG Roadmap' : 'Lộ trình ESG'}</h3>
        <h4 className="font-bold text-slate-800 mt-4">{isEn ? 'Current Phase' : 'Giai đoạn hiện tại'}</h4>
        <p>{isEn ? 'Focusing on building an ESG data foundation, standardizing the indicator set, tracking emissions, expanding green initiatives, and enhancing internal awareness.' : 'Tập trung xây dựng nền tảng dữ liệu ESG, chuẩn hóa bộ chỉ tiêu, theo dõi phát thải, mở rộng các sáng kiến xanh và nâng cao nhận thức nội bộ.'}</p>

        <h4 className="font-bold text-slate-800 mt-4">{isEn ? 'Phase 2025–2030' : 'Giai đoạn 2025–2030'}</h4>
        <p>{isEn ? 'Enhancing the application of ESG measurement tools according to international standards, expanding SAF usage, improving fuel efficiency, managing climate risks, and integrating ESG into governance.' : 'Tăng cường áp dụng công cụ đo lường ESG theo chuẩn quốc tế, mở rộng sử dụng SAF, cải thiện hiệu quả nhiên liệu, quản lý rủi ro khí hậu và tích hợp ESG vào hoạt động quản trị.'}</p>

        <h4 className="font-bold text-slate-800 mt-4">{isEn ? 'Long-term to 2050' : 'Giai đoạn dài hạn đến 2050'}</h4>
        <p>{isEn ? 'Aiming for carbon neutrality, developing a green aviation value chain, enhancing climate adaptation capacity, and solidifying Vietnam Airlines\' pioneering role in sustainable aviation development in Vietnam.' : 'Hướng tới trung hòa carbon, phát triển chuỗi giá trị hàng không xanh, nâng cao năng lực thích ứng khí hậu và củng cố vai trò tiên phong của Vietnam Airlines trong phát triển hàng không bền vững tại Việt Nam.'}</p>

        <hr className="my-6 border-slate-100" />

        <h3 className="font-extrabold text-slate-900 text-lg">{isEn ? 'Message of Commitment' : 'Thông điệp cam kết'}</h3>
        <p>{isEn ? 'Vietnam Airlines believes that sustainable development is a long-term journey requiring continuous innovation, responsibility, and cooperation from the entire aviation ecosystem. As the National Flag Carrier, Vietnam Airlines is committed to accompanying Vietnam on the green transition path, enhancing service quality, protecting the environment, and creating sustainable value for customers, employees, shareholders, and the community.' : 'Vietnam Airlines tin rằng phát triển bền vững là hành trình dài hạn, đòi hỏi sự đổi mới liên tục, trách nhiệm và hợp tác của toàn bộ hệ sinh thái hàng không. Với vai trò Hãng hàng không Quốc gia, Vietnam Airlines cam kết đồng hành cùng Việt Nam trên con đường chuyển đổi xanh, nâng cao chất lượng dịch vụ, bảo vệ môi trường và tạo ra giá trị bền vững cho khách hàng, người lao động, cổ đông và cộng đồng.'}</p>
        <p className="font-bold text-vna-blue text-center mt-6 text-lg">{isEn ? 'Vietnam Airlines — Taking off for a green, safe, and sustainable future.' : 'Vietnam Airlines — Cất cánh vì một tương lai xanh, an toàn và bền vững.'}</p>
      </div>
    </div>
  );
};

const IntroductionPage: React.FC<IntroductionPageProps> = ({ onBack }) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [activeMenu, setActiveMenu] = useState<'Overview' | 'Environment' | 'Social' | 'Governance'>('Overview');
  const [expandedPillars, setExpandedPillars] = useState({
    Environment: true, // Open by default
    Social: false,
    Governance: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(null);

  const indicators = useMemo(() => {
    return isEn ? (indicatorsDataEN as Indicator[]) : (indicatorsDataVI as Indicator[]);
  }, [isEn]);

  // Group indicators by pillar for navigation sidebar
  const groupedIndicators = useMemo(() => {
    const groups: { [key: string]: Indicator[] } = {
      Environment: [],
      Social: [],
      Governance: []
    };
    indicators.forEach(ind => {
      if (groups[ind.pillar]) {
        groups[ind.pillar].push(ind);
      }
    });
    return groups;
  }, [indicators]);

  // Statistics
  const stats = useMemo(() => {
    const total = indicators.length;
    const environment = indicators.filter(i => i.pillar === 'Environment').length;
    const social = indicators.filter(i => i.pillar === 'Social').length;
    const governance = indicators.filter(i => i.pillar === 'Governance').length;
    return { total, environment, social, governance };
  }, [indicators]);

  // Selected indicator details
  const selectedIndicator = useMemo(() => {
    if (!selectedIndicatorId) return null;
    return indicators.find(ind => ind.id === selectedIndicatorId) || null;
  }, [selectedIndicatorId, indicators]);

  // Handle sidebar pillar menu click
  const togglePillarExpand = (pillar: 'Environment' | 'Social' | 'Governance') => {
    setExpandedPillars(prev => {
      const isAlreadyOpen = prev[pillar];
      return {
        Environment: pillar === 'Environment' ? !isAlreadyOpen : false,
        Social: pillar === 'Social' ? !isAlreadyOpen : false,
        Governance: pillar === 'Governance' ? !isAlreadyOpen : false
      };
    });
    setActiveMenu(pillar);
    setSelectedIndicatorId(null);
  };

  const handleSelectIndicator = (ind: Indicator) => {
    setSelectedIndicatorId(ind.id);
    setActiveMenu(ind.pillar as any);
  };

  // Filter indicators inside sidebar lists based on search term
  const getFilteredList = (pillar: 'Environment' | 'Social' | 'Governance') => {
    const list = groupedIndicators[pillar] || [];
    if (!searchTerm) return list;
    return list.filter(ind =>
      ind.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans animate-fade-in text-slate-800">
      {/* HEADER BANNER */}
      <div className="relative bg-vna-blue text-white pt-28 pb-10 shadow-md overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: 'url(/vna-images/esg-bg-2.png)' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#005F6E]/90 via-emerald-800/70 to-[#005F6E]/90"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-vna-gold/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>

        <div className="relative container mx-auto px-6">
          <div className="text-right flex flex-col items-end">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white drop-shadow-md uppercase mb-2">
              {isEn ? 'ESG INDICATORS INTRODUCTION' : 'GIỚI THIỆU CHỈ TIÊU ESG'}
            </h1>
            <p className="text-white/90 text-base md:text-lg font-medium max-w-2xl drop-shadow">
              {isEn ? 'Join Vietnam Airlines towards green, safe, and sustainable growth' : 'Cùng Vietnam Airlines hướng tới tăng trưởng xanh, an toàn và bền vững'}
            </p>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT SIDEBAR MENU (ACCORDION LAYOUT) */}
          <aside className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto">

              {/* Search Box */}
              <div className="relative mb-6">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder={isEn ? "Search indicator..." : "Tìm chỉ tiêu..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-vna-blue focus:ring-2 focus:ring-vna-blue/10 transition-all"
                />
              </div>

              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2 border-slate-100">
                {isEn ? 'Menu Functions' : 'Menu chức năng'}
              </h2>

              <div className="space-y-3">
                {/* 0. TỔNG QUAN ESG */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveMenu('Overview');
                      setSelectedIndicatorId(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeMenu === 'Overview' && !selectedIndicatorId
                      ? 'bg-slate-100 text-vna-blue'
                      : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen size={18} className={activeMenu === 'Overview' && !selectedIndicatorId ? 'text-vna-blue' : 'text-slate-500'} />
                      <span>{isEn ? 'ESG Overview' : 'Hành trình phát triển bền vững ESG'}</span>
                    </div>
                  </button>
                </div>

                {/* 1. MÔI TRƯỜNG */}
                <div className="space-y-1">
                  <button
                    onClick={() => togglePillarExpand('Environment')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeMenu === 'Environment' && !selectedIndicatorId
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Leaf size={18} className="text-emerald-600" />
                      <span>{isEn ? 'Environment' : 'Môi trường (Environment)'}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-300 ${expandedPillars.Environment || searchTerm ? 'transform rotate-180' : ''
                        }`}
                    />
                  </button>

                  {/* Indicators Sub-list */}
                  {(expandedPillars.Environment || searchTerm) && (
                    <div className="pl-6 pt-1 space-y-1 border-l-2 border-emerald-100 ml-6 animate-fade-in max-h-[40vh] overflow-y-auto pr-2">
                      {getFilteredList('Environment').map((ind) => (
                        <button
                          key={ind.id}
                          onClick={() => handleSelectIndicator(ind)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedIndicatorId === ind.id
                            ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                          <div className="font-bold text-[10px] opacity-75 mb-0.5">{ind.code}</div>
                          <div className="line-clamp-1">{ind.name}</div>
                        </button>
                      ))}
                      {getFilteredList('Environment').length === 0 && (
                        <div className="text-[10px] text-slate-400 py-1 pl-3">{isEn ? 'No indicators found' : 'Không tìm thấy chỉ tiêu'}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. XÃ HỘI */}
                <div className="space-y-1">
                  <button
                    onClick={() => togglePillarExpand('Social')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeMenu === 'Social' && !selectedIndicatorId
                      ? 'bg-blue-50 text-blue-800'
                      : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users size={18} className="text-blue-600" />
                      <span>{isEn ? 'Social' : 'Xã hội (Social)'}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-300 ${expandedPillars.Social || searchTerm ? 'transform rotate-180' : ''
                        }`}
                    />
                  </button>

                  {/* Indicators Sub-list */}
                  {(expandedPillars.Social || searchTerm) && (
                    <div className="pl-6 pt-1 space-y-1 border-l-2 border-blue-100 ml-6 animate-fade-in max-h-[40vh] overflow-y-auto pr-2">
                      {getFilteredList('Social').map((ind) => (
                        <button
                          key={ind.id}
                          onClick={() => handleSelectIndicator(ind)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedIndicatorId === ind.id
                            ? 'bg-blue-600 text-white font-semibold shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                          <div className="font-bold text-[10px] opacity-75 mb-0.5">{ind.code}</div>
                          <div className="line-clamp-1">{ind.name}</div>
                        </button>
                      ))}
                      {getFilteredList('Social').length === 0 && (
                        <div className="text-[10px] text-slate-400 py-1 pl-3">{isEn ? 'No indicators found' : 'Không tìm thấy chỉ tiêu'}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. QUẢN TRỊ */}
                <div className="space-y-1">
                  <button
                    onClick={() => togglePillarExpand('Governance')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeMenu === 'Governance' && !selectedIndicatorId
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Landmark size={18} className="text-amber-600" />
                      <span>{isEn ? 'Governance' : 'Quản trị (Governance)'}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-300 ${expandedPillars.Governance || searchTerm ? 'transform rotate-180' : ''
                        }`}
                    />
                  </button>

                  {/* Indicators Sub-list */}
                  {(expandedPillars.Governance || searchTerm) && (
                    <div className="pl-6 pt-1 space-y-1 border-l-2 border-amber-100 ml-6 animate-fade-in max-h-[40vh] overflow-y-auto pr-2">
                      {getFilteredList('Governance').map((ind) => (
                        <button
                          key={ind.id}
                          onClick={() => handleSelectIndicator(ind)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedIndicatorId === ind.id
                            ? 'bg-amber-600 text-white font-semibold shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                          <div className="font-bold text-[10px] opacity-75 mb-0.5">{ind.code}</div>
                          <div className="line-clamp-1">{ind.name}</div>
                        </button>
                      ))}
                      {getFilteredList('Governance').length === 0 && (
                        <div className="text-[10px] text-slate-400 py-1 pl-3">{isEn ? 'No indicators found' : 'Không tìm thấy chỉ tiêu'}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <div className="text-3xl font-black text-slate-800">{stats.total}</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{isEn ? 'Total ESG Indicators' : 'Tổng chỉ tiêu số hóa'}</div>
              </div> */}

            </div>
          </aside>

          {/* RIGHT CONTENT AREA */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 md:p-8 min-h-[600px]">

              {/* CASE 1: OVERVIEW */}
              {activeMenu === 'Overview' && !selectedIndicatorId ? (
                <OverviewContent />
              ) : selectedIndicator ? (
                <div className="space-y-8 animate-fade-in">
                  {/* Title & Topic Header */}
                  <div className="border-b border-slate-100 pb-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xs font-bold bg-vna-blue text-white px-3 py-1 rounded-full uppercase">
                        {selectedIndicator.code}
                      </span>
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                        {isEn ? 'Topic' : 'Chủ đề'}: {selectedIndicator.topic}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${selectedIndicator.pillar === 'Environment' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                        selectedIndicator.pillar === 'Social' ? 'bg-blue-50 text-blue-800 border border-blue-100' :
                          'bg-amber-50 text-amber-800 border border-amber-100'
                        }`}>
                        {isEn ? 'Pillar' : 'Trụ cột'}: {
                          selectedIndicator.pillar === 'Environment' ? (isEn ? 'Environment' : 'Môi trường') :
                            selectedIndicator.pillar === 'Social' ? (isEn ? 'Social' : 'Xã hội') : (isEn ? 'Governance' : 'Quản trị')
                        }
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                      {selectedIndicator.name}
                    </h2>
                  </div>

                  {/* Detailed Content / Introduction Sections */}
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4 text-sm text-slate-600 leading-relaxed text-justify">
                    <h3 className="font-bold text-slate-800 text-base uppercase tracking-wider border-b pb-2 border-slate-100 mb-4">
                      {isEn ? 'Detailed Report Content' : 'Nội dung chi tiết nghiệp vụ'}
                    </h3>

                    <div className="space-y-6">
                      {parseIntroduction(selectedIndicator.introduction).map((sec, idx) => (
                        <div key={idx} className="animate-fade-in">
                          <h4 className="font-bold text-slate-800 text-base mb-2">
                            {sec.title}
                          </h4>
                          <div className="whitespace-pre-line">
                            {sec.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* CASE 2: PILLAR OVERVIEW (DEFAULT INITIAL AND ACCORDION ROOT CLIICK VIEW) */
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <div className={`p-5 rounded-full mb-6 ${activeMenu === 'Environment' ? 'bg-emerald-100 text-emerald-800' :
                    activeMenu === 'Social' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                    {activeMenu === 'Environment' ? <Leaf size={40} /> :
                      activeMenu === 'Social' ? <Users size={40} /> : <Landmark size={40} />}
                  </div>
                  <h3 className="font-bold text-slate-800 text-xl mb-2">
                    {isEn ? 'Pillar' : 'Trụ cột'} {
                      activeMenu === 'Environment' ? (isEn ? 'Environment' : 'Môi trường (Environment)') :
                        activeMenu === 'Social' ? (isEn ? 'Social' : 'Xã hội (Social)') : (isEn ? 'Governance' : 'Quản trị (Governance)')
                    }
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                    {isEn ? 'This pillar includes ' : 'Trụ cột này bao gồm '}
                    {
                      activeMenu === 'Environment' ? stats.environment :
                        activeMenu === 'Social' ? stats.social : stats.governance
                    }
                    {isEn ? ' operational indicators established to monitor ESG data of Vietnam Airlines.' : ' chỉ tiêu nghiệp vụ được thiết lập để giám sát dữ liệu ESG của Vietnam Airlines.'}
                  </p>
                  <p className="text-xs text-vna-blue font-bold flex items-center gap-1">
                    {isEn ? 'Please click on the left menu and select an indicator to view details.' : 'Vui lòng nhấp mở danh mục bên trái và chọn một chỉ tiêu để xem chi tiết.'}
                  </p>
                </div>
              )}

            </div>
          </main>

        </div>
      </div>
    </div>
  );
};

export default IntroductionPage;
