import { ESGPillar, PillarContent, Report } from './types';

export const HERO_DATA = {
  headline: "Vươn cao bền vững",
  subheadline: "Cam kết của Vietnam Airlines vì một tương lai xanh, xã hội thịnh vượng và quản trị minh bạch.",
  // Image: Clear, bright airplane over blue water - daytime vibe
  imageUrl: "/vna-images/hero-green.png"
};

export const PILLAR_DATA: PillarContent[] = [
  {
    id: 'environment',
    type: ESGPillar.ENVIRONMENT,
    title: "Tiên phong Xanh hóa",
    description: "Chúng tôi cam kết giảm phát thải ròng về 0 vào năm 2050 thông qua việc tối ưu hóa lộ trình bay, chuyển đổi sang nhiên liệu hàng không bền vững (SAF) và giảm thiểu rác thải nhựa trên mỗi chuyến bay.",
    // Image: Nature/Sky view from plane window
    image: "/vna-images/moitruong.jpg",
    metrics: [
      { label: "Giảm CO2", value: "15%", unit: "so với 2019", description: "Hiệu quả sử dụng nhiên liệu" },
      { label: "Lộ trình sử dụng SAF", value: "SAF", unit: "Mục tiêu 2030", description: "Tỷ lệ nhiên liệu bền vững trong tổng tiêu thụ", type: "chart" }
    ],
    compliances: ["CORSIA (ICAO)", "EU ETS (Châu Âu)", "UK ETS (Vương quốc Anh)"],
    color: 'vna-blue'
  },
  {
    id: 'social',
    type: ESGPillar.SOCIAL,
    title: "Gắn kết & Chia sẻ",
    description: "Con người là trung tâm của sự phát triển. Vietnam Airlines không ngừng nỗ lực cải thiện phúc lợi nhân viên, thúc đẩy bình đẳng giới và hỗ trợ vận chuyển y tế, cứu trợ khẩn cấp cho cộng đồng.",
    // Image: Teamwork/Service/People
    image: "/vna-images/xahoi.png",
    metrics: [
      { label: "Chuyến bay yêu thương", value: "50+", unit: "chuyến", description: "Vận chuyển y bác sĩ & hàng cứu trợ" },
      { label: "Nhân sự nữ", value: "45%", unit: "tổng nhân sự", description: "Tỷ lệ lãnh đạo nữ đạt 30%" }
    ],
    color: 'vna-gold'
  },
  {
    id: 'governance',
    type: ESGPillar.GOVERNANCE,
    title: "Minh bạch & Vững mạnh",
    description: "Duy trì các tiêu chuẩn cao nhất về đạo đức kinh doanh, tuân thủ luật pháp quốc tế và minh bạch trong công bố thông tin tới cổ đông và đối tác.",
    // Image: Modern Architecture/Airport Terminal structure
    image: "/vna-images/quantri.jpg",
    metrics: [
      { label: "Tuân thủ", value: "100%", unit: "", description: "Các quy định an toàn hàng không quốc tế" },
      { label: "Hội đồng quản trị", value: "1/3", unit: "", description: "Thành viên độc lập" }
    ],
    color: 'vna-blue'
  }
];
export const PILLAR_DATA_EN: PillarContent[] = [
  {
    id: 'environment',
    type: ESGPillar.ENVIRONMENT,
    title: "Green Pioneer",
    description: "We are committed to achieving net-zero emissions by 2050 through flight route optimization, transition to sustainable aviation fuel (SAF), and minimizing plastic waste on every flight.",
    // Image: Nature/Sky view from plane window
    image: "/vna-images/moitruong.jpg",
    metrics: [
      { label: "CO2 Reduction", value: "15%", unit: "vs 2019", description: "Fuel efficiency" },
      { label: "SAF Roadmap", value: "SAF", unit: "Target 2030", description: "Sustainable fuel ratio in total consumption", type: "chart" }
    ],
    compliances: ["CORSIA (ICAO)", "EU ETS (Europe)", "UK ETS (United Kingdom)"],
    color: 'vna-blue'
  },
  {
    id: 'social',
    type: ESGPillar.SOCIAL,
    title: "Connect & Share",
    description: "People are at the core of our development. Vietnam Airlines constantly strives to improve employee welfare, promote gender equality, and support medical transport and emergency relief for the community.",
    // Image: Teamwork/Service/People
    image: "/vna-images/xahoi.png",
    metrics: [
      { label: "Flights of Love", value: "50+", unit: "flights", description: "Transporting doctors & relief supplies" },
      { label: "Female Workforce", value: "45%", unit: "total workforce", description: "Female leadership reaches 30%" }
    ],
    color: 'vna-gold'
  },
  {
    id: 'governance',
    type: ESGPillar.GOVERNANCE,
    title: "Transparent & Strong",
    description: "Maintaining the highest standards of business ethics, compliance with international laws, and transparency in information disclosure to shareholders and partners.",
    // Image: Modern Architecture/Airport Terminal structure
    image: "/vna-images/quantri.jpg",
    metrics: [
      { label: "Compliance", value: "100%", unit: "", description: "International aviation safety regulations" },
      { label: "Board of Directors", value: "1/3", unit: "", description: "Independent members" }
    ],
    color: 'vna-blue'
  }
];

export const REPORTS: Report[] = [
  { id: '1', year: 2024, title: 'Báo cáo Phát triển bền vững 2024', type: 'Sustainability', thumbnailUrl: '/vna-images/a350.jpg', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' },
  { id: '2', year: 2023, title: 'Báo cáo Thường niên 2023', type: 'Annual', thumbnailUrl: '/vna-images/b787.jpg', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' },
  { id: '3', year: 2022, title: 'Báo cáo Thường niên 2022', type: 'Annual', thumbnailUrl: '/vna-images/governance.jpg', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' },
  { id: '4', year: 2021, title: 'Sách trắng Chuyển đổi số', type: 'Special', thumbnailUrl: '/vna-images/a321.jpg', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' },
  { id: '5', year: 2025, title: 'Báo cáo Phát triển bền vững 2025 (Bản nháp)', type: 'Sustainability', thumbnailUrl: '/vna-images/a350.jpg', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'draft' },
  { id: '6', year: 2025, title: 'Báo cáo Thường niên 2025 (Chờ duyệt)', type: 'Annual', thumbnailUrl: '/vna-images/b787.jpg', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'pending' },
];
export const REPORTS_EN: Report[] = [
  { id: '1', year: 2024, title: 'Sustainability Report 2024', type: 'Sustainability', thumbnailUrl: '/vna-images/a350.jpg', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' },
  { id: '2', year: 2023, title: 'Annual Report 2023', type: 'Annual', thumbnailUrl: '/vna-images/b787.jpg', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' },
  { id: '3', year: 2022, title: 'Annual Report 2022', type: 'Annual', thumbnailUrl: '/vna-images/governance.jpg', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' },
  { id: '4', year: 2021, title: 'Digital Transformation Whitepaper', type: 'Special', thumbnailUrl: '/vna-images/a321.jpg', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'published' },
  { id: '5', year: 2025, title: 'Sustainability Report 2025 (Draft)', type: 'Sustainability', thumbnailUrl: '/vna-images/a350.jpg', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'draft' },
  { id: '6', year: 2025, title: 'Annual Report 2025 (Pending Approval)', type: 'Annual', thumbnailUrl: '/vna-images/b787.jpg', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', status: 'pending' },
];

export const CHART_DATA_CO2 = [
  { year: '2020', emissions: 100, target: 100 },
  { year: '2021', emissions: 92, target: 95 },
  { year: '2022', emissions: 85, target: 90 },
  { year: '2023', emissions: 82, target: 85 },
  { year: '2024', emissions: 78, target: 80 },
];

export const DETAIL_CONTENT = {
  environment: {
    heroImage: "/vna-images/a321.jpg", // Updated Clouds/Nature/Sky
    title: "Chiến lược Môi trường & Chuyển đổi Xanh",
    intro: "Vietnam Airlines xác định chuyển đổi xanh là mệnh lệnh sống còn. Chúng tôi tập trung vào 4 mũi nhọn: Hiện đại hóa đội tàu bay, Tối ưu hóa khai thác, Sử dụng nhiên liệu bền vững (SAF) và Ứng dụng công nghệ thân thiện môi trường.",
    contentSections: [
      {
        heading: "1. Lộ trình Net Zero 2050",
        text: "Vietnam Airlines đã xây dựng lộ trình chi tiết để đạt mức phát thải ròng bằng 0 vào năm 2050. Kế hoạch bao gồm việc đầu tư vào các dòng máy bay thế hệ mới như A321neo, A350 và B787 giúp tiết kiệm 20-25% nhiên liệu. Đồng thời, chúng tôi tích cực tham gia chương trình CORSIA của ICAO ngay từ giai đoạn tự nguyện."
      },
      {
        heading: "2. Nhiên liệu Hàng không Bền vững (SAF)",
        text: "SAF được xem là chìa khóa cho hàng không xanh. Năm 2024 đánh dấu cột mốc quan trọng khi Vietnam Airlines thực hiện chuyến bay đầu tiên sử dụng nhiên liệu SAF. Chúng tôi đang làm việc với các nhà cung cấp nhiên liệu và chính phủ để xây dựng chuỗi cung ứng SAF tại Việt Nam."
      },
      {
        heading: "3. Kinh tế Tuần hoàn trên không",
        text: "Dự án 'Chuyến bay Bền vững' đã loại bỏ hàng triệu vật dụng nhựa dùng một lần, thay thế bằng các vật liệu có thể phân hủy sinh học hoặc tái chế. Quy trình thu gom và xử lý rác thải trên tàu bay được kiểm soát chặt chẽ theo tiêu chuẩn quốc tế."
      }
    ]
  },
  social: {
    heroImage: "/vna-images/social.jpg", // People/Handshake
    title: "Phát triển Nguồn nhân lực & Trách nhiệm Cộng đồng",
    intro: "Chúng tôi kiến tạo môi trường làm việc hạnh phúc, đa dạng và bao trùm, nơi mỗi cá nhân được phát huy tối đa tiềm năng. Đồng thời, Vietnam Airlines luôn có mặt kịp thời để hỗ trợ cộng đồng trong những giai đoạn khó khăn nhất.",
    contentSections: [
      {
        heading: "1. Bình đẳng giới & Đa dạng",
        text: "Tự hào là hãng hàng không có tỷ lệ nữ phi công và kỹ sư ngày càng tăng. Chúng tôi thực hiện chính sách trả lương bình đẳng và tạo cơ hội thăng tiến không phân biệt giới tính. Các chương trình 'Women at VNA' giúp nâng cao năng lực lãnh đạo cho cán bộ nữ."
      },
      {
        heading: "2. An toàn & Sức khỏe nghề nghiệp",
        text: "An toàn là giá trị cốt lõi số 1. Hệ thống quản lý an toàn (SMS) được áp dụng đồng bộ. Các chương trình chăm sóc sức khỏe thể chất và tinh thần cho phi công, tiếp viên và nhân viên mặt đất được triển khai định kỳ."
      },
      {
        heading: "3. Chung tay vì cộng đồng",
        text: "Chiến dịch 'Flights of Love' đã thực hiện hàng trăm chuyến bay vận chuyển y bác sĩ, vắc-xin và hàng cứu trợ trong đại dịch và thiên tai. Chúng tôi cũng tài trợ vận chuyển cho các tổ chức phẫu thuật nụ cười và bảo vệ động vật hoang dã."
      }
    ]
  },
  governance: {
    heroImage: "/vna-images/governance.jpg", // Corporate building
    title: "Quản trị Minh bạch & Tuân thủ Quốc tế",
    intro: "Hệ thống quản trị doanh nghiệp tiệm cận các chuẩn mực quốc tế, đảm bảo quyền lợi của cổ đông và các bên liên quan, đồng thời duy trì sự liêm chính trong mọi hoạt động kinh doanh.",
    contentSections: [
      {
        heading: "1. Cơ cấu Quản trị",
        text: "Hội đồng quản trị bao gồm các thành viên độc lập có uy tín quốc tế, đảm bảo tính khách quan trong ra quyết định. Các ủy ban trực thuộc như Ủy ban Kiểm toán, Ủy ban Nhân sự hoạt động hiệu quả để giám sát và tư vấn chiến lược."
      },
      {
        heading: "2. Đạo đức Kinh doanh & Chống tham nhũng",
        text: "Bộ quy tắc ứng xử (Code of Conduct) được áp dụng cho toàn bộ nhân viên và đối tác chuỗi cung ứng. Chúng tôi duy trì chính sách 'Không khoan nhượng' đối với tham nhũng và hối lộ, với cơ chế báo cáo vi phạm (Whistleblowing) bảo mật danh tính."
      },
      {
        heading: "3. Quản trị Rủi ro",
        text: "Hệ thống quản trị rủi ro doanh nghiệp (ERM) được tích hợp vào quy trình ra quyết định chiến lược, giúp Vietnam Airlines chủ động ứng phó với các biến động của thị trường nhiên liệu, tỷ giá và các rủi ro địa chính trị."
      }
    ]
  }
};
export const DETAIL_CONTENT_EN = {
  environment: {
    heroImage: "/vna-images/a321.jpg", // Updated Clouds/Nature/Sky
    title: "Environment & Green Transition Strategy",
    intro: "Vietnam Airlines identifies green transition as a vital imperative. We focus on 4 spearheads: Fleet modernization, Operations optimization, Sustainable Aviation Fuel (SAF) utilization, and Eco-friendly technology application.",
    contentSections: [
      {
        heading: "1. Net Zero 2050 Roadmap",
        text: "Vietnam Airlines has developed a detailed roadmap to achieve net-zero emissions by 2050. The plan includes investing in new generation aircraft such as A321neo, A350, and B787 to save 20-25% fuel. Concurrently, we actively participate in ICAO's CORSIA program right from the voluntary phase."
      },
      {
        heading: "2. Sustainable Aviation Fuel (SAF)",
        text: "SAF is considered the key to green aviation. 2024 marks a milestone when Vietnam Airlines operated the first flight using SAF. We are working with fuel suppliers and the government to build a SAF supply chain in Vietnam."
      },
      {
        heading: "3. In-flight Circular Economy",
        text: "The 'Sustainable Flight' project has eliminated millions of single-use plastic items, replacing them with biodegradable or recyclable materials. The in-flight waste collection and processing procedure is strictly controlled according to international standards."
      }
    ]
  },
  social: {
    heroImage: "/vna-images/social.jpg", // People/Handshake
    title: "Human Resource Development & Community Responsibility",
    intro: "We create a happy, diverse, and inclusive working environment where every individual can maximize their potential. Simultaneously, Vietnam Airlines is always present to support the community during the most difficult times.",
    contentSections: [
      {
        heading: "1. Gender Equality & Diversity",
        text: "Proud to be an airline with an increasing ratio of female pilots and engineers. We implement an equal pay policy and provide promotion opportunities regardless of gender. 'Women at VNA' programs help enhance leadership capacity for female staff."
      },
      {
        heading: "2. Occupational Safety & Health",
        text: "Safety is the number 1 core value. The Safety Management System (SMS) is applied synchronously. Physical and mental health care programs for pilots, flight attendants, and ground staff are implemented periodically."
      },
      {
        heading: "3. Joining hands for the community",
        text: "The 'Flights of Love' campaign has operated hundreds of flights transporting doctors, vaccines, and relief goods during pandemics and natural disasters. We also sponsor transportation for smile surgery and wildlife protection organizations."
      }
    ]
  },
  governance: {
    heroImage: "/vna-images/governance.jpg", // Corporate building
    title: "Transparent Governance & International Compliance",
    intro: "The corporate governance system approaches international standards, ensuring the rights of shareholders and stakeholders, while maintaining integrity in all business activities.",
    contentSections: [
      {
        heading: "1. Governance Structure",
        text: "The Board of Directors includes independent members with international reputation, ensuring objectivity in decision making. Sub-committees such as the Audit Committee and HR Committee operate effectively to supervise and advise on strategy."
      },
      {
        heading: "2. Business Ethics & Anti-Corruption",
        text: "The Code of Conduct is applied to all employees and supply chain partners. We maintain a 'Zero Tolerance' policy towards corruption and bribery, with a confidential whistleblowing mechanism."
      },
      {
        heading: "3. Risk Management",
        text: "The Enterprise Risk Management (ERM) system is integrated into the strategic decision-making process, helping Vietnam Airlines proactively respond to fluctuations in fuel markets, exchange rates, and geopolitical risks."
      }
    ]
  }
};