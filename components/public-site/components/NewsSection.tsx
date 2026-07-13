import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowRight } from 'lucide-react';

const MOCK_NEWS_VI = [
  {
    id: 1,
    title: "[VNExpress] 6 sáng kiến ESG của 'Liên minh Xanh' Vietnam Airlines",
    date: "07/05/2026",
    excerpt: "\"Liên minh Xanh - Phát triển bền vững\" của Vietnam Airlines khởi động với loạt chương trình, cùng 18 đối tác trong các lĩnh vực môi trường, y tế và công nghệ.",
    imageUrl: "https://spirit.vietnamairlines.com/wp-content/uploads/2026/05/Ảnh-chụp-Màn-hình-2026-05-07-lúc-08.57.50-360x180.png",
    category: "Bền vững",
    link: "https://spirit.vietnamairlines.com/uncategorized/111340.html"
  },
  {
    id: 2,
    title: "Uỷ ban An toàn Vietnam Airlines họp phiên số 02/2026: Giữ vững kỷ luật an toàn để phát triển bền vững",
    date: "29/04/2026",
    excerpt: "Uỷ ban An toàn (UBAT) VNA đã tổ chức họp phiên số 02 nhằm đánh giá công tác an toàn 4 tháng đầu năm, đề ra nhiệm vụ trọng tâm.",
    imageUrl: "https://spirit.vietnamairlines.com/wp-content/uploads/2026/04/IMG_2005-360x180.jpg",
    category: "An toàn",
    link: "https://spirit.vietnamairlines.com/bay-cao-khat-vong-cong-hien/chuyen-dong-24-7/uy-ban-an-toan-vietnam-airlines-hop-phien-so-02-2026-giu-vung-ky-luat-an-toan-de-phat-trien-ben-vung.html"
  },
  {
    id: 3,
    title: "[Infographic] 10 triệu dặm bay – Kết nối những hành trình ý nghĩa",
    date: "25/04/2026",
    excerpt: "Infographic về cột mốc 10 triệu dặm bay nhằm mục đích lan tỏa yêu thương tới cộng đồng và môi trường.",
    imageUrl: "https://spirit.vietnamairlines.com/wp-content/uploads/2026/04/Screenshot-2026-04-24-at-18.02.58-360x180.png",
    category: "Cộng đồng",
    link: "https://spirit.vietnamairlines.com/bay-cao-khat-vong-ben-vung/infographic-10-trieu-dam-bay-ket-noi-nhung-hanh-trinh-y-nghia.html"
  }
];

const MOCK_NEWS_EN = [
  {
    id: 1,
    title: "[VNExpress] 6 ESG initiatives of Vietnam Airlines' 'Green Alliance'",
    date: "05/07/2026",
    excerpt: "Vietnam Airlines' 'Green Alliance - Sustainable Development' launched with a series of programs, alongside 18 partners in environmental, health, and technology sectors.",
    imageUrl: "https://spirit.vietnamairlines.com/wp-content/uploads/2026/05/Ảnh-chụp-Màn-hình-2026-05-07-lúc-08.57.50-360x180.png",
    category: "Sustainability",
    link: "https://spirit.vietnamairlines.com/uncategorized/111340.html"
  },
  {
    id: 2,
    title: "Vietnam Airlines Safety Committee 02/2026 Meeting: Maintaining safety discipline for sustainable development",
    date: "04/29/2026",
    excerpt: "The VNA Safety Committee (UBAT) held meeting No. 02 to evaluate safety work in the first 4 months and set out key tasks.",
    imageUrl: "https://spirit.vietnamairlines.com/wp-content/uploads/2026/04/IMG_2005-360x180.jpg",
    category: "Safety",
    link: "https://spirit.vietnamairlines.com/bay-cao-khat-vong-cong-hien/chuyen-dong-24-7/uy-ban-an-toan-vietnam-airlines-hop-phien-so-02-2026-giu-vung-ky-luat-an-toan-de-phat-trien-ben-vung.html"
  },
  {
    id: 3,
    title: "[Infographic] 10 million flying miles – Connecting meaningful journeys",
    date: "04/25/2026",
    excerpt: "Infographic on the milestone of 10 million flying miles aimed at spreading love to the community and the environment.",
    imageUrl: "https://spirit.vietnamairlines.com/wp-content/uploads/2026/04/Screenshot-2026-04-24-at-18.02.58-360x180.png",
    category: "Community",
    link: "https://spirit.vietnamairlines.com/bay-cao-khat-vong-ben-vung/infographic-10-trieu-dam-bay-ket-noi-nhung-hanh-trinh-y-nghia.html"
  }
];

const NewsSection: React.FC = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const newsList = isEn ? MOCK_NEWS_EN : MOCK_NEWS_VI;

  return (
    <section id="news" className="min-h-[calc(100vh-80px)] py-12 md:py-16 bg-gradient-to-b from-vna-blue/5 to-slate-50 relative flex flex-col justify-center">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-8">
          <span className="text-vna-blue font-bold tracking-widest uppercase text-xs mb-2 block">Spirit of VNA</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{isEn ? 'News & Activities' : 'Tin tức & Hoạt động'}</h2>
          <p className="text-gray-600 mt-2 text-base max-w-2xl mx-auto">
            {isEn ? 'Stay updated with Vietnam Airlines\' latest practical activities on the journey of sustainable development and spreading good values to the community.' : 'Cập nhật những hoạt động thực tiễn mới nhất của Vietnam Airlines trên hành trình phát triển bền vững và lan tỏa giá trị tốt đẹp đến cộng đồng.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {newsList.map((news) => (
            <a key={news.id} href={news.link} target="_blank" rel="noreferrer" className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-vna-blue/10 hover:-translate-y-2 hover:border-vna-blue/50 group cursor-pointer flex flex-col relative text-left">
              <div className="relative h-36 md:h-44 overflow-hidden">
                <img 
                  src={news.imageUrl} 
                  alt={news.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="bg-vna-blue/10 text-vna-blue text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {news.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <Calendar size={12} />
                    <span>{news.date}</span>
                  </div>
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 group-hover:text-vna-blue transition-colors line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2 flex-1 leading-relaxed text-xs">
                  {news.excerpt}
                </p>
                <div className="flex items-center text-vna-blue font-bold text-xs group-hover:text-vna-gold transition-colors mt-auto">
                  {isEn ? 'Read more' : 'Đọc tiếp'} <ArrowRight size={14} className="ml-1" />
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-white/50 backdrop-blur border-2 border-vna-gold text-vna-blue px-8 py-3 rounded-full font-bold hover:bg-vna-gold hover:text-white hover:border-vna-gold transition-colors shadow-sm">
            {isEn ? 'View all news' : 'Xem tất cả tin tức'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
