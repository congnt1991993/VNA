import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
const resources = {
  vi: {
    translation: {
      "nav": {
        "home": "Trang chủ",
        "overview": "Tổng quan",
        "esg_strategy": "Chiến lược ESG",
        "pillars": "Các trụ cột",
        "reports": "Lưu trữ báo cáo",
        "news": "Tin tức & Hoạt động",
        "about": "Giới thiệu",
        "login": "Đăng nhập"
      },
      "footer": {
        "address": "Tầng 5, Tòa nhà Tổng Công ty Hàng không Việt Nam, 200 Nguyễn Sơn, Long Biên, Hà Nội, Việt Nam",
        "connect": "Kết nối với chúng tôi",
        "quick_links": "Liên kết nhanh",
        "sustainability_report": "Báo cáo Phát triển bền vững",
        "esg_strategy": "Chiến lược ESG",
        "environmental_protection": "Bảo vệ môi trường",
        "social_responsibility": "Trách nhiệm xã hội",
        "corporate_governance": "Quản trị doanh nghiệp",
        "copyright": "© 2024 Vietnam Airlines. Bảo lưu mọi quyền."
      },
      "app": {
        "esg_commitments": "CAM KẾT ESG CỦA VIETNAM AIRLINES",
        "esg_message": "Xây dựng tương lai bền vững, nâng tầm thương hiệu quốc gia",
        "ceo_message": "Thông điệp từ Tổng Giám đốc",
        "ceo_quote": "Tại Vietnam Airlines, phát triển bền vững không chỉ là mục tiêu mà là kim chỉ nam cho mọi hoạt động. Chúng tôi cam kết hành động mạnh mẽ vì môi trường, xã hội và quản trị doanh nghiệp minh bạch.",
        "news_updates": "TIN TỨC & CẬP NHẬT ESG",
        "latest_news": "Cập nhật những hoạt động và thành tựu phát triển bền vững mới nhất của Vietnam Airlines.",
        "esg_reports": "BÁO CÁO ESG & ẤN PHẨM",
        "esg_reports_desc": "Minh bạch thông tin là nguyên tắc hàng đầu. Khám phá các báo cáo thường niên và phát triển bền vững của chúng tôi."
      },
      "news": {
        "read_more": "Đọc thêm",
        "read_report": "Đọc báo cáo",
        "all_reports": "Tất cả báo cáo"
      },
      "pillars": {
        "explore_more": "Tìm hiểu thêm",
        "key_metrics": "Chỉ số nổi bật",
        "compliance": "Tuân thủ chuẩn mực"
      },
      "common": {
        "back_to_home": "Quay lại Trang chủ"
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "overview": "Overview",
        "esg_strategy": "ESG Strategy",
        "pillars": "Pillars",
        "reports": "Report Archive",
        "news": "News & Activities",
        "about": "About ESG",
        "login": "Login"
      },
      "footer": {
        "address": "5th Floor, Vietnam Airlines Headquarters, 200 Nguyen Son, Long Bien, Hanoi, Vietnam",
        "connect": "Connect with us",
        "quick_links": "Quick Links",
        "sustainability_report": "Sustainability Report",
        "esg_strategy": "ESG Strategy",
        "environmental_protection": "Environmental Protection",
        "social_responsibility": "Social Responsibility",
        "corporate_governance": "Corporate Governance",
        "copyright": "© 2024 Vietnam Airlines. All rights reserved."
      },
      "app": {
        "esg_commitments": "VIETNAM AIRLINES' ESG COMMITMENTS",
        "esg_message": "Building a sustainable future, elevating the national brand",
        "ceo_message": "Message from the CEO",
        "ceo_quote": "At Vietnam Airlines, sustainable development is not just a goal but a guiding principle for all our activities. We are committed to strong actions for the environment, society, and transparent corporate governance.",
        "news_updates": "ESG NEWS & UPDATES",
        "latest_news": "Discover the latest sustainable development activities and achievements of Vietnam Airlines.",
        "esg_reports": "ESG REPORTS & PUBLICATIONS",
        "esg_reports_desc": "Information transparency is our top priority. Explore our annual and sustainability reports."
      },
      "news": {
        "read_more": "Read more",
        "read_report": "Read report",
        "all_reports": "All reports"
      },
      "pillars": {
        "explore_more": "Explore more",
        "key_metrics": "Key Metrics",
        "compliance": "Compliance Standards"
      },
      "common": {
        "back_to_home": "Back to Home"
      }
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "vi", // default language
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
