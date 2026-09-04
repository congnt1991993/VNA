import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, Button, Input, Select, Badge, PillarBadge, Toast, Modal } from '../components/UI';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Search, Sliders, Database, Leaf, Users, ShieldCheck,
  Clock, ArrowLeft, FileText, CheckCircle, Save, Filter,
  RotateCcw, Info, Globe, Activity, ShieldAlert, ChevronDown, ChevronRight,
  History, Calendar, User, Copy, Check, Sparkles, BookOpen, AlertCircle, Edit3
} from 'lucide-react';
import MOCK_INDICATORS_JSON from '../data/indicators_main_list.json';
import { Pillar } from '../types';

// --- TYPES ---
const formatUserAccount = (rawUser: string): string => {
  if (!rawUser) return 'admin';
  if (rawUser.includes('@')) {
    return rawUser.split('@')[0];
  }
  if (rawUser.includes('Hải') || rawUser.includes('Admin')) return 'hai.nv';
  if (rawUser.includes('Trang')) return 'trang.tt';
  if (rawUser.includes('Nam')) return 'nam.tv';
  if (rawUser.includes('Đức')) return 'duc.pm';
  if (rawUser.includes('Tuấn')) return 'tuan.lm';
  if (rawUser.includes('Hùng')) return 'hung.nv';
  if (rawUser.includes('Hệ thống') || rawUser.includes('SAP')) return 'system';
  if (rawUser.includes('Thư ký') || rawUser.includes('Pháp chế')) return 'legal.sec';
  return rawUser;
};

export type VersionPublishState = 'active' | 'deactive';

export interface ChartVersionItem {
  id: string;
  versionNumber: string;
  versionName: string;
  chartCode: string;
  indicatorCode: string;
  year: string;
  isPublished: boolean;
  publishStatus?: VersionPublishState;
  createdAt: string;
  createdBy: string;
  note?: string;
  description?: string;
  dataOverrides: Record<string, { isOverride: boolean; overrideValue: string; reason: string }>;
}

const INITIAL_CHART_VERSIONS: ChartVersionItem[] = [
  // --- GRI 302-1-JETA1 (2026) ---
  {
    id: 'ver-jeta1-v1',
    versionNumber: 'v1.0',
    versionName: 'Dữ liệu gốc hệ thống SAP/ERP',
    chartCode: 'GRI 302-1-JETA1',
    indicatorCode: 'GRI 302-1',
    year: '2026',
    isPublished: false,
    publishStatus: 'draft',
    createdAt: '15/07/2026 08:30',
    createdBy: 'Hệ thống tự động (SAP Integration)',
    note: 'Dữ liệu gốc đồng bộ ban đầu',
    description: 'Biểu đồ tiêu thụ nhiên liệu bay Jet A-1 toàn mạng bay của Vietnam Airlines trong năm 2026.',
    dataOverrides: {}
  },
  {
    id: 'ver-jeta1-v2',
    versionNumber: 'v1.1',
    versionName: 'Hiệu chỉnh định mức tiêu hao A350',
    chartCode: 'GRI 302-1-JETA1',
    indicatorCode: 'GRI 302-1',
    year: '2026',
    isPublished: false,
    publishStatus: 'draft',
    createdAt: '15/08/2026 14:15',
    createdBy: 'Trần Thu Trang (Ban Kỹ thuật)',
    note: 'Chuẩn hóa định mức tiêu hao sau kiểm định tàu bay A350',
    description: 'Biểu đồ tiêu thụ nhiên liệu Jet A-1 đã được đối soát định mức tiêu hao nhiên liệu theo tiêu chuẩn kỹ thuật.',
    dataOverrides: {
      'Tháng 11/2026': { isOverride: true, overrideValue: '4,710', reason: 'Hiệu chỉnh định mức A350' },
      'Tháng 12/2026': { isOverride: true, overrideValue: '4,850', reason: 'Đối soát số liệu bay quốc tế' }
    }
  },
  {
    id: 'ver-jeta1-v3',
    versionNumber: 'v2.0',
    versionName: 'Bản kiểm toán IATA ASRH phê duyệt',
    chartCode: 'GRI 302-1-JETA1',
    indicatorCode: 'GRI 302-1',
    year: '2026',
    isPublished: true,
    publishStatus: 'pending_publish',
    createdAt: '22/08/2026 10:00',
    createdBy: 'Nguyễn Văn Hải (Admin)',
    note: 'Bản chính thức công bố đối ngoại theo báo cáo kiểm toán IATA ASRH',
    description: 'Số liệu chính thức công bố đối ngoại trên cổng thông tin Net Zero 2050 và Báo cáo Phát triển bền vững năm 2026.',
    dataOverrides: {
      'Tháng 10/2026': { isOverride: true, overrideValue: '4,690', reason: 'Số liệu kiểm toán IATA ASRH' },
      'Tháng 11/2026': { isOverride: true, overrideValue: '4,710', reason: 'Số liệu kiểm toán IATA ASRH' },
      'Tháng 12/2026': { isOverride: true, overrideValue: '4,860', reason: 'Số liệu kiểm toán IATA ASRH' }
    }
  },

  // --- Airline E-1-SUB1 (2026) ---
  {
    id: 'ver-saf01-v1',
    versionNumber: 'v1.0',
    versionName: 'Dữ liệu sơ bộ ban An toàn chất lượng',
    chartCode: 'Airline E-1-SUB1',
    indicatorCode: 'Airline E-1',
    year: '2026',
    isPublished: false,
    publishStatus: 'draft',
    createdAt: '10/08/2026 09:00',
    createdBy: 'Trần Văn Nam (Ban ATCL)',
    note: 'Bản thống kê sự cố ban đầu',
    description: 'Tỷ lệ sự cố bắt buộc phải báo cáo (MOR) trên 1,000 chuyến bay.',
    dataOverrides: {}
  },
  {
    id: 'ver-saf01-v2',
    versionNumber: 'v1.1',
    versionName: 'Bản chuẩn hóa công bố Website ESG',
    chartCode: 'Airline E-1-SUB1',
    indicatorCode: 'Airline E-1',
    year: '2026',
    isPublished: true,
    publishStatus: 'pending_publish',
    createdAt: '18/08/2026 16:30',
    createdBy: 'Nguyễn Văn Hải (Admin)',
    note: 'Chuẩn hóa số liệu công bố thường niên',
    description: 'Bản số liệu chính thức được phê duyệt công bố cho các tổ chức quốc tế và báo cáo thường niên.',
    dataOverrides: {
      'Tháng 12/2026': { isOverride: true, overrideValue: '4,615', reason: 'Đối soát số liệu theo biên bản kiểm toán IATA ASRH' }
    }
  },

  // --- GRI-2-23-POLICY (2026) ---
  {
    id: 'ver-g223-v1',
    versionNumber: 'v1.0',
    versionName: 'Bản dự thảo thuyết minh ban đầu',
    chartCode: 'GRI-2-23-POLICY',
    indicatorCode: 'GRI 2-23',
    year: '2026',
    isPublished: false,
    createdAt: '01/08/2026 08:00',
    createdBy: 'Tổ Thư ký & Ban Pháp chế',
    note: 'Bản thảo chính sách nội bộ',
    description: 'Ghi chú nội bộ cho phần chính sách ứng xử kinh doanh.',
    dataOverrides: {
      'Năm 2026': {
        isOverride: true,
        overrideValue: 'Vietnam Airlines cam kết thực hiện đúng các quy định pháp luật hiện hành và tiêu chuẩn của IATA về an toàn bay và đạo đức kinh doanh.',
        reason: 'Bản thảo ban đầu'
      }
    }
  },
  {
    id: 'ver-g223-v2',
    versionNumber: 'v2.0',
    versionName: 'Bản chuẩn hóa theo GRI Standards 2026',
    chartCode: 'GRI-2-23-POLICY',
    indicatorCode: 'GRI 2-23',
    year: '2026',
    isPublished: true,
    createdAt: '10/08/2026 11:30',
    createdBy: 'Phạm Minh Đức (Tổ Thư ký)',
    note: 'Biên tập chuẩn hóa văn phong công bố Báo cáo thường niên ESG 2026',
    description: 'Nội dung thuyết minh chính thức công bố trên Báo cáo Phát triển Bền vững.',
    dataOverrides: {
      'Năm 2026': {
        isOverride: true,
        overrideValue: 'Tổng công ty Hàng không Việt Nam (Vietnam Airlines) cam kết tuân thủ đầy đủ các chuẩn mực đạo đức kinh doanh quốc tế, bảo đảm an toàn bay tuyệt đối, trách nhiệm xã hội và bảo vệ môi trường trong toàn bộ chuỗi cung ứng hàng không.\n\nVietnam Airlines nghiêm cấm mọi hình thức hối lộ, tham nhũng và đối xử bất bình đẳng. Chính sách này được phổ biến rộng rãi đến 100% cán bộ nhân viên và đối tác thông qua Bộ Quy tắc ứng xử kinh doanh (Code of Conduct) được rà soát định kỳ hàng năm.',
        reason: 'Biên tập chuẩn hóa văn phong công bố Báo cáo thường niên ESG 2026'
      }
    }
  }
];

interface AdjustmentHistoryItem {
  id: string;
  indicatorCode: string;
  chartCode: string;
  chartName: string;
  period: string;
  originalValue: string;
  adjustedValue: string;
  adjustedBy: string;
  adjustedAt: string;
  reason?: string;
  isText?: boolean;
}

interface AdjustmentItem {
  indicatorCode: string;
  period: string;
  isOverride: boolean;
  overrideValue: string;
  reason: string;
  updatedAt: string;
  updatedBy: string;
  isText?: boolean;
}

interface SubChart {
  code: string;
  name: string;
  unit: string;
  source: string;
  frequency: string;
  isText?: boolean;
}

// Helper to determine if an indicator is qualitative / text-based
export const isTextIndicator = (indicator: any): boolean => {
  if (!indicator) return false;
  if (indicator.unit === 'Văn bản' || indicator.unit === 'Báo cáo' || indicator.unit === 'Đặc tả' || !indicator.unit) return true;
  if (indicator.introduction && indicator.introduction.includes('(text only')) return true;
  const textCodes = [
    'GRI 2-9', 'GRI 2-10', 'GRI 2-11', 'GRI 2-12', 'GRI 2-13', 'GRI 2-15',
    'GRI 2-23', 'GRI 2-24', 'GRI 2-26', 'GRI 2-27', 'GRI 2-28', 'GRI 2-29', 'GRI 2-30',
    'GRI 3-3', 'GRI 401-2', 'GRI 403-4', 'GRI 403-10', 'GRI 406-1', 'GRI 414-1', 'GRI 418-1',
    'Airline G-1', 'Airline S-1', 'Airline E-2'
  ];
  return textCodes.some(c => indicator.code?.includes(c));
};

// Helper to extract localized name from "English / Vietnamese" or "English (Vietnamese)"
const getLocalizedIndicatorName = (name: string, lang: 'vi' | 'en' = 'vi'): string => {
  if (!name) return '';

  if (name.includes('/')) {
    const parts = name.split('/').map(p => p.trim());
    if (parts.length >= 2) {
      return lang === 'vi' ? (parts[1] || parts[0]) : (parts[0] || parts[1]);
    }
  }

  const parenMatch = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const enPart = parenMatch[1].trim();
    const viPart = parenMatch[2].trim();
    return lang === 'vi' ? (viPart || enPart) : (enPart || viPart);
  }

  return name;
};

// Helper to determine dynamic periods based on indicator frequency and selected year
const getIndicatorPeriods = (indicator: any, year: string): string[] => {
  if (!indicator) return [];
  const freq = indicator.frequency || 'Hàng năm';

  if (freq.includes('quý') || freq.includes('Quý')) {
    return [`Quý 4/${year}`, `Quý 3/${year}`, `Quý 2/${year}`, `Quý 1/${year}`];
  }
  if (freq.includes('năm') || freq.includes('Năm') || isTextIndicator(indicator)) {
    return [`Năm ${year}`];
  }
  if (freq.includes('bán niên') || freq.includes('Bán niên') || freq.includes('Bán Niên')) {
    return [`Bán niên 2/${year}`, `Bán niên 1/${year}`];
  }
  return Array.from({ length: 12 }).map((_, i) => {
    const m = String(12 - i).padStart(2, '0');
    return `Tháng ${m}/${year}`;
  });
};

// Helper to determine origin source
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
  if (code.includes('GRI 2-9') || code.includes('GRI 2-10') || code.includes('GRI 2-15') || code.includes('GRI 2-23')) {
    return 'Báo cáo thuyết minh (Tổ Thư ký & Ban Pháp chế)';
  }
  if (code.includes('GRI 2-27') || code.includes('Airline E-1')) {
    return 'Báo cáo định kỳ (Ban An toàn Chất lượng - ATCL)';
  }
  return 'Hệ thống tích hợp TCT (SAP/ERP Integration)';
};

// Helper to generate deterministic actual values for numeric OR text indicators
const getSystemRealValue = (code: string, period: string, unit: string): string => {
  const isPercentage = unit === '%';
  const isQualitative = unit === 'Văn bản' || unit === 'Báo cáo' || unit === 'Đặc tả' || !unit || code.includes('-TEXT') || code.includes('DESC') || code.includes('POLICY') || code.includes('COMPLIANCE');

  if (isQualitative) {
    const yearStr = period.includes('/') ? period.split('/')[1] : period.replace('Năm ', '') || '2026';
    if (code.includes('2-23-POLICY') || code.includes('2-23')) {
      return `Tổng công ty Hàng không Việt Nam (Vietnam Airlines) cam kết tuân thủ đầy đủ các chuẩn mực đạo đức kinh doanh quốc tế, bảo đảm an toàn bay tuyệt đối, trách nhiệm xã hội và bảo vệ môi trường trong toàn bộ chuỗi cung ứng hàng không.\n\nVietnam Airlines nghiêm cấm mọi hình thức hối lộ, tham nhũng và đối xử bất bình đẳng. Chính sách này được phổ biến rộng rãi đến 100% cán bộ nhân viên và đối tác thông qua Bộ Quy tắc ứng xử kinh doanh (Code of Conduct) được rà soát định kỳ hàng năm.`;
    }
    if (code.includes('2-23-HUMANRIGHTS')) {
      return `Vietnam Airlines cam kết bảo vệ quyền con người theo Tuyên ngôn Quốc tế Nhân quyền và các công ước cốt lõi của ILO.\n\nTổng công ty tuyệt đối không sử dụng lao động trẻ em, không cưỡng bức lao động, bảo đảm môi trường làm việc an toàn, văn minh và tôn trọng quyền tự do hiệp hội, thương lượng tập thể của người lao động.`;
    }
    if (code.includes('2-27') || code.includes('COMPLIANCE')) {
      return `Trong kỳ báo cáo năm ${yearStr}, Vietnam Airlines không ghi nhận bất kỳ vụ việc vi phạm nghiêm trọng nào liên quan đến pháp luật môi trường, an toàn khai thác bay hoặc các quy định chống độc quyền dẫn đến việc bị xử phạt tài chính lớn hoặc đình chỉ hoạt động.`;
    }
    if (code.includes('2-9')) {
      return `Cơ cấu quản trị của Vietnam Airlines gồm Đại hội đồng cổ đông, Hội đồng quản trị (HĐQT), Ban Kiểm soát và Ban Tổng Giám đốc.\n\nHĐQT bao gồm các thành viên độc lập, thành viên không điều hành và đại diện vốn nhà nước, có trách nhiệm phê duyệt chiến lược Net Zero 2050 và định kỳ giám sát các mục tiêu phát triển bền vững ESG.`;
    }
    if (code.includes('2-10')) {
      return `Quy trình đề cử và bầu chọn thành viên HĐQT, Ban Kiểm soát được thực hiện minh bạch theo Luật Doanh nghiệp và Điều lệ Tổng công ty. Tiêu chí lựa chọn chú trọng năng lực chuyên môn hàng không, tư duy quản trị rủi ro ESG và tính đa dạng về giới tính, kinh nghiệm.`;
    }
    if (code.includes('2-15')) {
      return `Tổng công ty ban hành Quy chế phòng ngừa xung đột lợi ích áp dụng cho toàn thể thành viên HĐQT, Ban Giám đốc và cán bộ quản lý các cấp. Định kỳ hàng năm, các nhân sự chủ chốt có trách nhiệm kê khai lợi ích liên quan và không tham gia biểu quyết trong các giao dịch có phát sinh quyền lợi cá nhân.`;
    }
    if (code.includes('3-3')) {
      return `Vietnam Airlines xác định các chủ đề ESG trọng yếu (gồm Phát thải & SAF, An toàn bay, Phát triển nguồn nhân lực và Quản trị minh bạch) thông qua quá trình đối thoại định kỳ với cổ đông, hành khách, tổ chức quốc tế (IATA, ICAO) và cơ quan quản lý nhà nước.`;
    }
    if (code.includes('406-1')) {
      return `Trong năm ${yearStr}, Vietnam Airlines không ghi nhận bất kỳ khiếu nại hay sự cố phân biệt đối xử nào dựa trên giới tính, tôn giáo, chủng tộc hoặc nguồn gốc dân tộc. Tổng công ty duy trì đường dây nóng bảo mật (Whistleblower Hotline) để tiếp nhận và giải quyết kịp thời mọi phản ánh.`;
    }
    return `Nội dung thuyết minh công bố chính thức cho chỉ tiêu ${code} trong kỳ ${period}. Dữ liệu được tổng hợp và xác thực từ các phòng ban phụ trách theo đúng tiêu chuẩn báo cáo phát triển bền vững GRI Standards.`;
  }

  // Parse month/quarter number for numeric indicators
  let mVal = 1;
  const mMatch = period.match(/Tháng (\d+)/);
  const qMatch = period.match(/Quý (\d+)/);
  const hMatch = period.match(/bán niên (\d+)/i);

  if (mMatch) {
    mVal = Number(mMatch[1]);
  } else if (qMatch) {
    mVal = Number(qMatch[1]) * 3;
  } else if (hMatch) {
    mVal = Number(hMatch[1]) === 1 ? 6 : 12;
  } else {
    mVal = 12; // Year
  }

  const codeHash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  if (isPercentage) {
    const base = 90 + (codeHash % 8);
    const val = base + ((mVal * 7) % 3) + ((mVal * 3) % 2) / 10;
    return `${Math.min(val, 100).toFixed(1)}%`;
  } else {
    const base = 1000 + (codeHash % 12) * 500;
    const val = base + (mVal * 120) - (mVal * mVal * 5);
    return Math.round(val).toLocaleString();
  }
};

const getIndicatorSubCharts = (indicator: any): SubChart[] => {
  if (!indicator) return [];
  const code = indicator.code;
  const unit = indicator.unit || 'Tấn';
  const freq = indicator.frequency || (isTextIndicator(indicator) ? 'Hàng năm' : 'Hàng tháng');

  // NUMERIC INDICATORS
  if (code === 'GRI 302-1') {
    return [
      { code: 'GRI 302-1-JETA1', name: 'Tiêu thụ Jet A-1 Đội bay', unit: 'Tấn', source: 'Form Nhập liệu (Ban Kỹ thuật)', frequency: freq, isText: false },
      { code: 'GRI 302-1-SAF', name: 'Tiêu thụ Nhiên liệu SAF pha trộn', unit: 'Tấn', source: 'Form Nhập liệu (Ban Kỹ thuật)', frequency: freq, isText: false }
    ];
  }

  if (code === 'GRI 305-4') {
    return [
      { code: 'GRI 305-4-ACTUAL', name: 'Cường độ phát thải CO2 thực tế', unit: 'Tấn CO2/100 RTK', source: 'Form Nhập liệu (Ban Kỹ thuật)', frequency: 'Hàng năm', isText: false }
    ];
  }

  if (code === 'GRI 404-2') {
    return [
      { code: 'GRI 404-2-HQ', name: 'Giờ đào tạo trung bình Khối Cơ quan', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq, isText: false },
      { code: 'GRI 404-2-OPS', name: 'Giờ đào tạo trung bình Khối Khai thác', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq, isText: false },
      { code: 'GRI 404-2-TECH', name: 'Giờ đào tạo trung bình Khối Kỹ thuật', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq, isText: false },
      { code: 'GRI 404-2-SERVICE', name: 'Giờ đào tạo trung bình Khối Dịch vụ', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq, isText: false },
      { code: 'GRI 404-2-COMMERCE', name: 'Giờ đào tạo trung bình Khối Thương mại', unit: 'Giờ', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq, isText: false }
    ];
  }

  if (code === 'Airline B-1') {
    return [
      { code: 'AIRLINE-B1-NPS', name: 'Biến động chỉ số Net Promoter Score', unit: 'Điểm', source: 'Hệ thống đối ngoại (Qualtrics API)', frequency: 'Hàng quý', isText: false }
    ];
  }

  if (code === 'GRI 2-7') {
    return [
      { code: 'GRI 2-7-PILOTS', name: 'Cơ cấu - Đội ngũ Phi công', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq, isText: false },
      { code: 'GRI 2-7-CABIN', name: 'Cơ cấu - Đội ngũ Tiếp viên', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq, isText: false },
      { code: 'GRI 2-7-TECH', name: 'Cơ cấu - Kỹ sư Kỹ thuật', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq, isText: false },
      { code: 'GRI 2-7-GROUND', name: 'Cơ cấu - Nhân viên Mặt đất & CQ', unit: '%', source: 'Form Nhập liệu (Ban Tổ chức nhân lực)', frequency: freq, isText: false }
    ];
  }

  // QUALITATIVE / TEXT INDICATORS
  if (code === 'GRI 2-23') {
    return [
      { code: 'GRI-2-23-POLICY', name: 'Cam kết chính sách ứng xử kinh doanh', unit: 'Văn bản', source: 'Form Nhập liệu (Tổ Thư ký & Pháp chế)', frequency: freq, isText: true },
      { code: 'GRI-2-23-HUMANRIGHTS', name: 'Thuyết minh cam kết tôn trọng quyền con người', unit: 'Văn bản', source: 'Form Nhập liệu (Ban TCNL & Pháp chế)', frequency: freq, isText: true }
    ];
  }

  if (code === 'GRI 2-27') {
    return [
      { code: 'GRI-2-27-COMPLIANCE', name: 'Báo cáo tình hình tuân thủ luật pháp và quy định', unit: 'Văn bản', source: 'Form Nhập liệu (Ban ATCL & Pháp chế)', frequency: freq, isText: true }
    ];
  }

  if (code === 'GRI 2-9') {
    return [
      { code: 'GRI-2-9-DESC', name: 'Thuyết minh cơ cấu và thành phần quản trị', unit: 'Văn bản', source: 'Nhập thủ công (Tổ Thư ký)', frequency: freq, isText: true }
    ];
  }

  if (code === 'GRI 2-10') {
    return [
      { code: 'GRI-2-10-DESC', name: 'Quy trình đề cử, lựa chọn lãnh đạo cấp cao', unit: 'Văn bản', source: 'Nhập thủ công (Tổ Thư ký)', frequency: freq, isText: true }
    ];
  }

  if (code === 'GRI 2-15') {
    return [
      { code: 'GRI-2-15-DESC', name: 'Quy chế kiểm soát và phòng ngừa xung đột lợi ích', unit: 'Văn bản', source: 'Nhập thủ công (Tổ Thư ký & Ban Kiểm soát)', frequency: freq, isText: true }
    ];
  }

  if (code === 'GRI 3-3') {
    return [
      { code: 'GRI-3-3-DESC', name: 'Báo cáo phương pháp quản lý các chủ đề ESG trọng yếu', unit: 'Văn bản', source: 'Form Nhập liệu (Ban Kế hoạch phát triển)', frequency: freq, isText: true }
    ];
  }

  if (code === 'GRI 406-1') {
    return [
      { code: 'GRI-406-1-DESC', name: 'Thuyết minh kiểm soát không phân biệt đối xử', unit: 'Văn bản', source: 'Form Nhập liệu (Ban TCNL)', frequency: freq, isText: true }
    ];
  }

  // Default text indicator
  if (isTextIndicator(indicator)) {
    return [
      {
        code: `${code}-TEXT`,
        name: `Thuyết minh văn bản ${getLocalizedIndicatorName(indicator.name, 'vi')}`,
        unit: 'Văn bản',
        source: indicator.department ? `Báo cáo thuyết minh (${indicator.department})` : 'Form Nhập liệu Thuyết minh',
        frequency: freq,
        isText: true
      }
    ];
  }

  // Default numeric subchart
  return [
    { code: `${code}-SUB1`, name: `Thống kê số liệu ${indicator.name}`, unit: unit, source: getIndicatorSource(code, unit), frequency: freq, isText: false }
  ];
};

export const PublishAdjustPage: React.FC = () => {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<any | null>(null);
  const [selectedSubChart, setSelectedSubChart] = useState<any | null>(null);
  const [expandedIndicators, setExpandedIndicators] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPillar, setFilterPillar] = useState('');
  const [filterPublish, setFilterPublish] = useState(''); // '' (Tất cả), 'published' (Công bố), 'unpublished' (Không công bố)
  const [filterType, setFilterType] = useState(''); // '' (Tất cả định dạng), 'numeric' (Biểu đồ số liệu), 'text' (Văn bản / Thuyết minh)
  const [selectedYear, setSelectedYear] = useState('2026');
  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>(
    () => (localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi'
  );

  useEffect(() => {
    const handleLangChange = () => {
      const savedLang = (localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi';
      setCurrentLang(savedLang);
    };
    window.addEventListener('vna_language_changed', handleLangChange);
    return () => window.removeEventListener('vna_language_changed', handleLangChange);
  }, []);

  // Global publish statuses map & CMS Pillars sync
  const getVersionPublishState = (ver: ChartVersionItem): 'active' | 'deactive' => {
    if (ver.publishStatus === 'active' || ver.isPublished === true) return 'active';
    return 'deactive';
  };

  const [publishedChartStatuses, setPublishedChartStatuses] = useState<Record<string, boolean>>({});
  const [cmsPillars, setCmsPillars] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('vna_cms_pillars');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'environment',
        detailReports: [
          { id: 'env-detail-1', type: 'chart', value: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=400&auto=format&fit=crop' },
          { id: 'env-detail-2', type: 'indicator', value: 'GRI 305-1' }
        ]
      },
      {
        id: 'social',
        detailReports: [
          { id: 'soc-detail-1', type: 'chart', value: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400&auto=format&fit=crop' },
          { id: 'soc-detail-2', type: 'indicator', value: 'GRI 403-9' }
        ]
      },
      {
        id: 'governance',
        detailReports: [
          { id: 'gov-detail-1', type: 'chart', value: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop' },
          { id: 'gov-detail-2', type: 'indicator', value: 'GRI 2-7' }
        ]
      }
    ];
  });

  // Helper to determine 3-state publication status: 'published' | 'submitted' | 'draft'
  const getSubChartPublishState = (subCode: string, indCode?: string): 'published' | 'submitted' | 'draft' => {
    // 1. CÔNG BỐ: Present in CMS detailReports (Sprint)
    const isAttachedToCms = cmsPillars.some((p: any) =>
      (p.detailReports || []).some((r: any) => r.value === subCode || (indCode && r.value === indCode))
    );
    if (isAttachedToCms) {
      return 'published';
    }

    // 2. ĐÃ GỬI: User has published an active version in PublishAdjust
    const chartVers = chartVersions.filter((v: any) => v.chartCode === subCode || (indCode && v.indicatorCode === indCode));
    const hasPublishedVersion = chartVers.some((v: any) => v.isPublished === true);

    if (hasPublishedVersion) {
      return 'submitted';
    }

    // 3. NHÁP: No active version selected
    return 'draft';
  };

  const getIndicatorPublishState = (ind: any): 'published' | 'submitted' | 'draft' => {
    const subCharts = getIndicatorSubCharts(ind);
    if (subCharts.length === 0) {
      return getSubChartPublishState(ind.code, ind.code);
    }
    const states = subCharts.map(s => getSubChartPublishState(s.code, ind.code));
    if (states.includes('published')) return 'published';
    if (states.includes('submitted')) return 'submitted';
    return 'draft';
  };

  // Adjustment History state
  const INITIAL_MOCK_HISTORY: AdjustmentHistoryItem[] = useMemo(() => [
    {
      id: 'HIST-VNA001',
      indicatorCode: 'Airline E-1',
      chartCode: 'Airline E-1-SUB1',
      chartName: 'Tiếng ồn',
      period: 'Tháng 12/2026',
      originalValue: '4,615',
      adjustedValue: '4,615',
      adjustedBy: 'Nguyễn Văn Hải (Admin)',
      adjustedAt: '18/08/2026 16:30',
      reason: 'Đối soát số liệu theo biên bản kiểm toán IATA ASRH',
      isText: false
    },
    {
      id: 'HIST-VNA002',
      indicatorCode: 'GRI 302-1',
      chartCode: 'GRI 302-1-JETA1',
      chartName: 'Tiêu thụ Jet A-1 Đội bay',
      period: 'Tháng 11/2026',
      originalValue: '4,720',
      adjustedValue: '4,710',
      adjustedBy: 'Trần Thu Trang (Ban Kỹ thuật)',
      adjustedAt: '15/08/2026 14:15',
      reason: 'Chuẩn hóa định mức tiêu hao sau kiểm định tàu bay A350',
      isText: false
    },
    {
      id: 'HIST-VNA003',
      indicatorCode: 'GRI 2-23',
      chartCode: 'GRI-2-23-POLICY',
      chartName: 'Cam kết chính sách ứng xử kinh doanh',
      period: 'Năm 2026',
      originalValue: 'Vietnam Airlines cam kết thực hiện đúng các quy định pháp luật hiện hành và tiêu chuẩn của IATA.',
      adjustedValue: 'Tổng công ty Hàng không Việt Nam (Vietnam Airlines) cam kết tuân thủ đầy đủ các chuẩn mực đạo đức kinh doanh quốc tế, bảo đảm an toàn bay tuyệt đối, trách nhiệm xã hội và bảo vệ môi trường trong toàn bộ chuỗi cung ứng hàng không.',
      adjustedBy: 'Phạm Minh Đức (Tổ Thư ký)',
      adjustedAt: '10/08/2026 11:30',
      reason: 'Biên tập chuẩn hóa văn phong công bố Báo cáo thường niên ESG 2026',
      isText: true
    }
  ], []);

  const [adjustHistory, setAdjustHistory] = useState<AdjustmentHistoryItem[]>(() => {
    const saved = localStorage.getItem('vna_publish_adjust_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MOCK_HISTORY;
      }
    }
    return INITIAL_MOCK_HISTORY;
  });

  // Chart-level publish status & description state
  const [isChartPublished, setIsChartPublished] = useState(true);
  const [chartDescription, setChartDescription] = useState('');

  useEffect(() => {
    const handleSync = () => {
      const savedStatus = localStorage.getItem('vna_publish_chart_status');
      if (savedStatus) {
        try {
          setPublishedChartStatuses(JSON.parse(savedStatus));
        } catch (e) { }
      }
      const savedPillars = localStorage.getItem('vna_cms_pillars');
      if (savedPillars) {
        try {
          setCmsPillars(JSON.parse(savedPillars));
        } catch (e) {}
      }
      const savedVersions = localStorage.getItem('vna_chart_versions');
      if (savedVersions) {
        try {
          setChartVersions(JSON.parse(savedVersions));
        } catch (e) {}
      }
    };
    handleSync();
    window.addEventListener('vna_publish_adjustments_updated', handleSync);
    return () => window.removeEventListener('vna_publish_adjustments_updated', handleSync);
  }, []);

  const currentPeriods = useMemo(() => getIndicatorPeriods(selectedIndicator, selectedYear), [selectedIndicator, selectedYear]);

  const isCurrentSubChartText = useMemo(() => {
    if (!selectedSubChart) return false;
    return selectedSubChart.isText || selectedSubChart.unit === 'Văn bản' || (selectedIndicator && isTextIndicator(selectedIndicator));
  }, [selectedSubChart, selectedIndicator]);

  // Adjustments state (flat array stored in localStorage)
  const [adjustments, setAdjustments] = useState<AdjustmentItem[]>([]);

  // --- CHART VERSIONS SYSTEM STATE ---
  const [chartVersions, setChartVersions] = useState<ChartVersionItem[]>(() => {
    const saved = localStorage.getItem('vna_chart_versions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CHART_VERSIONS;
      }
    }
    return INITIAL_CHART_VERSIONS;
  });

  const saveChartVersionsToStorage = (versions: ChartVersionItem[]) => {
    setChartVersions(versions);
    localStorage.setItem('vna_chart_versions', JSON.stringify(versions));
  };

  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);
  const [newVerNumber, setNewVerNumber] = useState('');
  const [newVerName, setNewVerName] = useState('');
  const [newVerNote, setNewVerNote] = useState('');
  const [newVerSetPublished, setNewVerSetPublished] = useState(true);

  // Filter versions for the currently selected sub-chart and year
  const currentChartVersions = useMemo(() => {
    if (!selectedSubChart) return [];
    return chartVersions.filter(
      v => v.chartCode === selectedSubChart.code && v.year === selectedYear
    );
  }, [chartVersions, selectedSubChart, selectedYear]);

  // Active version being viewed
  const activeVersion = useMemo(() => {
    if (!selectedSubChart) return null;
    if (activeVersionId) {
      const found = currentChartVersions.find(v => v.id === activeVersionId);
      if (found) return found;
    }
    // Default to published version or first version
    const published = currentChartVersions.find(v => v.isPublished);
    return published || currentChartVersions[currentChartVersions.length - 1] || null;
  }, [currentChartVersions, activeVersionId, selectedSubChart]);

  // Sync activeVersionId when subchart or year changes
  useEffect(() => {
    if (currentChartVersions.length > 0) {
      const published = currentChartVersions.find(v => v.isPublished);
      setActiveVersionId(published ? published.id : currentChartVersions[currentChartVersions.length - 1].id);
    } else if (selectedSubChart) {
      // Auto create initial v1.0 version if none exists
      const initialVer: ChartVersionItem = {
        id: `ver-${selectedSubChart.code}-${selectedYear}-v1-${Date.now()}`,
        versionNumber: 'v1.0',
        versionName: 'Dữ liệu gốc ban đầu',
        chartCode: selectedSubChart.code,
        indicatorCode: selectedIndicator?.code || '',
        year: selectedYear,
        isPublished: false,
        createdAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        createdBy: 'Hệ thống tự động',
        note: 'Phiên bản khởi tạo tự động',
        description: chartDescription || '',
        dataOverrides: {}
      };
      const updated = [...chartVersions, initialVer];
      saveChartVersionsToStorage(updated);
      setActiveVersionId(initialVer.id);
    } else {
      setActiveVersionId(null);
    }
  }, [selectedSubChart?.code, selectedYear]);

  // 1. Đề nghị công bố (Chuyển sang Active)
  const handlePublishVersion = (versionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedSubChart) return;

    const updated = chartVersions.map(v => {
      if (v.chartCode === selectedSubChart.code && v.year === selectedYear) {
        if (v.id === versionId) {
          return {
            ...v,
            publishStatus: 'active' as const,
            isPublished: true
          };
        }
        return {
          ...v,
          publishStatus: 'deactive' as const,
          isPublished: false
        };
      }
      return v;
    });

    saveChartVersionsToStorage(updated);

    const targetVer = updated.find(v => v.id === versionId);
    if (targetVer) {
      const savedStatus = localStorage.getItem('vna_publish_chart_status');
      const statuses = savedStatus ? JSON.parse(savedStatus) : {};
      statuses[selectedSubChart.code] = true;
      localStorage.setItem('vna_publish_chart_status', JSON.stringify(statuses));
      setPublishedChartStatuses(statuses);
      setIsChartPublished(true);

      // Sync overrides from this published version into adjustments
      const filtered = adjustments.filter(
        a => !(a.indicatorCode === selectedSubChart.code && a.period.endsWith(selectedYear))
      );
      const newEntries: AdjustmentItem[] = Object.keys(targetVer.dataOverrides).map(p => ({
        indicatorCode: selectedSubChart.code,
        period: p,
        isOverride: true,
        overrideValue: targetVer.dataOverrides[p].overrideValue,
        reason: targetVer.dataOverrides[p].reason || `Phiên bản ${targetVer.versionNumber}`,
        updatedAt: targetVer.createdAt,
        updatedBy: targetVer.createdBy,
        isText: isCurrentSubChartText
      }));

      const finalAdj = [...filtered, ...newEntries];
      localStorage.setItem('vna_publish_adjustments', JSON.stringify(finalAdj));
      setAdjustments(finalAdj);

      window.dispatchEvent(new Event('vna_publish_adjustments_updated'));
      setToast({
        message: `Đã kích hoạt phiên bản [${targetVer.versionNumber} - ${targetVer.versionName}] sang trạng thái Active!`,
        type: 'success'
      });
    }
  };

  // 2. Đề nghị gỡ công bố (Chuyển sang Deactive)
  const handleUnpublishVersion = (versionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedSubChart) return;

    const updated = chartVersions.map(v => {
      if (v.id === versionId) {
        return {
          ...v,
          publishStatus: 'deactive' as const,
          isPublished: false
        };
      }
      return v;
    });

    saveChartVersionsToStorage(updated);

    const savedStatus = localStorage.getItem('vna_publish_chart_status');
    const statuses = savedStatus ? JSON.parse(savedStatus) : {};
    statuses[selectedSubChart.code] = false;
    localStorage.setItem('vna_publish_chart_status', JSON.stringify(statuses));
    setPublishedChartStatuses(statuses);
    setIsChartPublished(false);

    // If present in CMS detailReports, remove it
    try {
      const savedPillars = localStorage.getItem('vna_cms_pillars');
      if (savedPillars) {
        const pillarsList = JSON.parse(savedPillars);
        const updatedPillars = pillarsList.map((p: any) => ({
          ...p,
          detailReports: (p.detailReports || []).filter((r: any) => r.value !== selectedSubChart.code && r.value !== selectedIndicator?.code)
        }));
        localStorage.setItem('vna_cms_pillars', JSON.stringify(updatedPillars));
        setCmsPillars(updatedPillars);
      }
    } catch (err) {}

    window.dispatchEvent(new Event('vna_publish_adjustments_updated'));
    setToast({
      message: 'Đã chuyển phiên bản sang trạng thái Deactive!',
      type: 'info'
    });
  };

  // Create a new version
  const handleCreateNewVersion = () => {
    if (!selectedSubChart || !selectedIndicator) return;

    const verNum = newVerNumber.trim() || `v${currentChartVersions.length + 1}.0`;
    const verName = newVerName.trim() || `Bản cập nhật số liệu ${verNum}`;
    const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Capture current working editStates
    const capturedOverrides: Record<string, { isOverride: boolean; overrideValue: string; reason: string }> = {};
    Object.keys(editStates).forEach(p => {
      const st = editStates[p];
      const realVal = getSystemRealValue(selectedSubChart.code, p, selectedSubChart.unit);
      if (st.overrideValue && st.overrideValue.trim() !== realVal.trim()) {
        capturedOverrides[p] = {
          isOverride: true,
          overrideValue: st.overrideValue.trim(),
          reason: st.reason || ''
        };
      }
    });

    const newVerId = `ver-${selectedSubChart.code}-${selectedYear}-${Date.now()}`;

    let updatedList = chartVersions.map(v => {
      if (newVerSetPublished && v.chartCode === selectedSubChart.code && v.year === selectedYear) {
        return { ...v, isPublished: false };
      }
      return v;
    });

    const newVersionItem: ChartVersionItem = {
      id: newVerId,
      versionNumber: verNum,
      versionName: verName,
      chartCode: selectedSubChart.code,
      indicatorCode: selectedIndicator.code,
      year: selectedYear,
      isPublished: newVerSetPublished,
      createdAt: nowStr,
      createdBy: 'Nguyễn Văn Hải (Admin)',
      note: newVerNote.trim(),
      description: chartDescription,
      dataOverrides: capturedOverrides
    };

    updatedList.push(newVersionItem);
    saveChartVersionsToStorage(updatedList);
    setActiveVersionId(newVerId);
    setIsNewVersionModalOpen(false);

    if (newVerSetPublished) {
      handleSetVersionPublished(newVerId);
    }

    setToast({
      message: `Đã tạo thành công phiên bản mới [${verNum} - ${verName}]!`,
      type: 'success'
    });
  };

  // Update editStates when activeVersion changes
  useEffect(() => {
    if (!selectedSubChart) {
      setEditStates({});
      return;
    }

    const states: Record<string, { isOverride: boolean; overrideValue: string; reason: string }> = {};

    currentPeriods.forEach(p => {
      if (activeVersion && activeVersion.dataOverrides[p]) {
        const ov = activeVersion.dataOverrides[p];
        states[p] = {
          isOverride: true,
          overrideValue: ov.overrideValue,
          reason: ov.reason || ''
        };
      } else {
        const realValue = getSystemRealValue(selectedSubChart.code, p, selectedSubChart.unit);
        states[p] = {
          isOverride: false,
          overrideValue: realValue,
          reason: ''
        };
      }
    });

    setEditStates(states);

    if (activeVersion && activeVersion.description !== undefined) {
      setChartDescription(activeVersion.description);
    }
  }, [activeVersion?.id, selectedSubChart, currentPeriods]);


  // Detail form edit state (for the selected indicator)
  const [editStates, setEditStates] = useState<Record<string, { isOverride: boolean; overrideValue: string; reason: string }>>({});

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Measure right column height to sync left card height pixel-perfectly
  const rightColRef = useRef<HTMLDivElement>(null);
  const [rightColHeight, setRightColHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!rightColRef.current) return;
    const updateHeight = () => {
      if (rightColRef.current) {
        const h = rightColRef.current.getBoundingClientRect().height || rightColRef.current.offsetHeight;
        if (h > 100) {
          setRightColHeight(Math.round(h));
        }
      }
    };
    updateHeight();
    const rafId = requestAnimationFrame(updateHeight);
    const timeoutId = setTimeout(updateHeight, 150);

    const observer = new ResizeObserver(updateHeight);
    observer.observe(rightColRef.current);
    window.addEventListener('resize', updateHeight);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [selectedIndicator, selectedSubChart, selectedYear, isChartPublished, adjustments, filterType]);



  const previewChartData = useMemo(() => {
    if (!selectedSubChart || isCurrentSubChartText) return [];

    const chronologicalPeriods = [...currentPeriods].reverse();
    return chronologicalPeriods.map(p => {
      const state = editStates[p] || { isOverride: false, overrideValue: '', reason: '' };
      const realValueStr = getSystemRealValue(selectedSubChart.code, p, selectedSubChart.unit);

      const parseNum = (str: string) => {
        if (!str) return 0;
        const cleaned = str.replace(/[^0-9.-]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
      };

      const originalVal = parseNum(realValueStr);
      const adjustedVal = parseNum(state.overrideValue || realValueStr);

      let label = p;
      if (p.includes('Tháng ')) {
        label = 'T' + parseInt(p.replace('Tháng ', ''));
      } else if (p.includes('Quý ')) {
        label = 'Q' + p.replace('Quý ', '').split('/')[0];
      } else if (p.includes('Bán niên ')) {
        label = 'BN' + p.replace('Bán niên ', '').split('/')[0];
      }

      return {
        periodLabel: label,
        fullName: p,
        'Số liệu gốc': originalVal,
        'Số liệu điều chỉnh': adjustedVal
      };
    });
  }, [selectedSubChart, currentPeriods, editStates, isCurrentSubChartText]);

  // Load initial data
  useEffect(() => {
    const savedInds = localStorage.getItem('vna_esg_indicators');
    if (savedInds) {
      try {
        setIndicators(JSON.parse(savedInds));
      } catch (e) {
        setIndicators(MOCK_INDICATORS_JSON);
      }
    } else {
      setIndicators(MOCK_INDICATORS_JSON);
    }

    const savedAdjs = localStorage.getItem('vna_publish_adjustments');
    if (savedAdjs) {
      try {
        setAdjustments(JSON.parse(savedAdjs));
      } catch (e) { }
    }
  }, []);

  // Update editStates when selectedSubChart changes
  useEffect(() => {
    if (!selectedSubChart) {
      setEditStates({});
      return;
    }

    const states: Record<string, { isOverride: boolean; overrideValue: string; reason: string }> = {};

    currentPeriods.forEach(p => {
      const existing = adjustments.find(
        a => a.indicatorCode === selectedSubChart.code && a.period === p
      );

      if (existing && existing.isOverride) {
        states[p] = {
          isOverride: true,
          overrideValue: existing.overrideValue,
          reason: existing.reason
        };
      } else {
        const realValue = getSystemRealValue(selectedSubChart.code, p, selectedSubChart.unit);
        states[p] = {
          isOverride: false,
          overrideValue: realValue,
          reason: ''
        };
      }
    });

    setEditStates(states);
  }, [selectedSubChart, adjustments, currentPeriods]);

  const handleToggleSubChartPublish = (subCode: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentStatus = publishedChartStatuses[subCode] !== false;
    const newStatus = !currentStatus;
    const savedStatus = localStorage.getItem('vna_publish_chart_status');
    const statuses = savedStatus ? JSON.parse(savedStatus) : {};
    statuses[subCode] = newStatus;
    localStorage.setItem('vna_publish_chart_status', JSON.stringify(statuses));
    setPublishedChartStatuses(statuses);

    if (selectedSubChart?.code === subCode) {
      setIsChartPublished(newStatus);
    }
  };

  useEffect(() => {
    if (!selectedSubChart) {
      setChartDescription('');
      return;
    }
    const savedStatus = localStorage.getItem('vna_publish_chart_status');
    if (savedStatus) {
      try {
        const statuses = JSON.parse(savedStatus);
        setIsChartPublished(statuses[selectedSubChart.code] !== false);
      } catch (e) {
        setIsChartPublished(true);
      }
    } else {
      setIsChartPublished(true);
    }

    // Load chart/text description
    const key = `${selectedSubChart.code}_${selectedYear}`;
    const savedDescriptions = localStorage.getItem('vna_chart_publish_descriptions');
    if (savedDescriptions) {
      try {
        const descMap = JSON.parse(savedDescriptions);
        setChartDescription(descMap[key] || descMap[selectedSubChart.code] || '');
      } catch (e) {
        setChartDescription('');
      }
    } else {
      setChartDescription('');
    }
  }, [selectedSubChart, selectedYear]);

  // Handle query & filters
  const filteredIndicators = useMemo(() => {
    return indicators.filter(ind => {
      const localizedName = getLocalizedIndicatorName(ind.name, currentLang);
      const matchesSearch =
        ind.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        localizedName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPillar =
        !filterPillar ||
        ind.pillar.toLowerCase() === filterPillar.toLowerCase();

      const isText = isTextIndicator(ind);
      let matchesType = true;
      if (filterType === 'numeric') {
        matchesType = !isText;
      } else if (filterType === 'text') {
        matchesType = isText;
      }

      let matchesPublish = true;
      if (filterPublish) {
        const subCharts = getIndicatorSubCharts(ind);
        if (filterPublish === 'published') {
          matchesPublish = subCharts.some(sc => publishedChartStatuses[sc.code] !== false);
        } else if (filterPublish === 'unpublished') {
          matchesPublish = subCharts.some(sc => publishedChartStatuses[sc.code] === false);
        }
      }

      return matchesSearch && matchesPillar && matchesPublish && matchesType;
    });
  }, [indicators, searchQuery, filterPillar, filterPublish, filterType, publishedChartStatuses]);

  // Check if an indicator has any active overrides
  const getIndicatorStatus = (ind: any) => {
    const subCharts = getIndicatorSubCharts(ind);
    const subCodes = subCharts.map(sc => sc.code);
    const hasActive = adjustments.some(
      a => subCodes.includes(a.indicatorCode) && a.isOverride
    );
    return hasActive ? 'adjusted' : 'default';
  };

  // Check if a specific sub-chart has any active overrides
  const getSubChartStatus = (subCode: string) => {
    const hasActive = adjustments.some(
      a => a.indicatorCode === subCode && a.isOverride
    );
    return hasActive ? 'adjusted' : 'default';
  };

  // Update value for a period
  const handleValueChange = (period: string, val: string) => {
    setEditStates(prev => ({
      ...prev,
      [period]: {
        ...prev[period],
        overrideValue: val
      }
    }));
  };

  // Update reason for a period
  const handleReasonChange = (period: string, val: string) => {
    setEditStates(prev => ({
      ...prev,
      [period]: {
        ...prev[period],
        reason: val
      }
    }));
  };

// Helper tính toán phiên bản tiếp theo (Semantic Versioning)
const calculateNextVersions = (currentVerStr: string) => {
  const clean = (currentVerStr || 'v1.0').replace(/[^0-9.]/g, '');
  const parts = clean.split('.');
  const major = parseInt(parts[0] || '1', 10);
  const minor = parseInt(parts[1] || '0', 10);
  const nextMinor = `v${major}.${minor + 1}`;
  const nextMajor = `v${major + 1}.0`;
  return {
    current: currentVerStr || 'v1.0',
    nextMinor,
    nextMajor
  };
};

  // 1. Kiểm tra trước khi mở popup nhập version
  const [versionOptions, setVersionOptions] = useState<{ current: string; nextMinor: string; nextMajor: string }>({
    current: 'v1.0',
    nextMinor: 'v1.1',
    nextMajor: 'v2.0'
  });
  const [versionType, setVersionType] = useState<'minor' | 'major' | 'custom'>('minor');

  const handleInitiateSave = () => {
    if (!selectedSubChart || !selectedIndicator) return;

    const newOverrides: Record<string, { isOverride: boolean; overrideValue: string; reason: string }> = {};

    // Construct new overrides and detect changes
    let hasModifiedValues = false;
    currentPeriods.forEach(period => {
      const state = editStates[period];
      if (!state) return;
      const realValue = getSystemRealValue(selectedSubChart.code, period, selectedSubChart.unit);

      const isValueDifferent = Boolean(state.overrideValue && state.overrideValue.trim() !== realValue.trim());
      if (isValueDifferent) {
        hasModifiedValues = true;
        newOverrides[period] = {
          isOverride: true,
          overrideValue: state.overrideValue.trim(),
          reason: state.reason || ''
        };
      }
    });

    // Check if description was changed
    const origDesc = activeVersion?.description || '';
    const isDescChanged = Boolean(chartDescription && chartDescription.trim() !== origDesc.trim());

    // Compare with current active version's existing overrides
    if (activeVersion && Object.keys(newOverrides).length > 0) {
      const activeOverrides = activeVersion.dataOverrides || {};
      const sameKeyCount = Object.keys(newOverrides).length === Object.keys(activeOverrides).length;
      const allIdentical = sameKeyCount && Object.keys(newOverrides).every(k =>
        activeOverrides[k] &&
        activeOverrides[k].overrideValue === newOverrides[k].overrideValue &&
        (activeOverrides[k].reason || '') === (newOverrides[k].reason || '')
      );
      if (allIdentical && !isDescChanged) {
        hasModifiedValues = false;
      }
    }

    // If no adjustments made, show error notification as requested
    if (!hasModifiedValues && Object.keys(newOverrides).length === 0 && !isDescChanged) {
      setToast({
        message: 'Bạn không điều chỉnh số liệu mới nên không thể lưu!',
        type: 'error'
      });
      return;
    }

    // Tính toán version hiện tại và gợi ý Semantic Versioning
    const currentVerStr = activeVersion?.versionNumber || (currentChartVersions.length > 0 ? currentChartVersions[currentChartVersions.length - 1].versionNumber : 'v1.0');
    const calculated = calculateNextVersions(currentVerStr);

    setVersionOptions(calculated);
    setVersionType('minor'); // Mặc định chọn Minor update (v1.1)
    setNewVerNumber(calculated.nextMinor);
    setNewVerName(`Bản hiệu chỉnh số liệu ${calculated.nextMinor}`);
    setNewVerNote('');
    setNewVerSetPublished(false);
    setIsNewVersionModalOpen(true);
  };

  // 2. Xác nhận lưu phiên bản mới sau khi người dùng nhập version
  const handleConfirmSaveVersion = () => {
    if (!selectedSubChart || !selectedIndicator) return;

    const trimmedVer = newVerNumber.trim();
    if (!trimmedVer) {
      setToast({
        message: 'Vui lòng nhập số phiên bản (Ví dụ: v1.1, v2.0, v3.0)!',
        type: 'error'
      });
      return;
    }

    const formattedVer = trimmedVer.startsWith('v') || trimmedVer.startsWith('V')
      ? trimmedVer.toLowerCase()
      : `v${trimmedVer}`;

    const finalVerName = newVerName.trim() || `Bản hiệu chỉnh số liệu ${formattedVer}`;
    const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const newOverrides: Record<string, { isOverride: boolean; overrideValue: string; reason: string }> = {};
    const newEntries: AdjustmentItem[] = [];

    currentPeriods.forEach(period => {
      const state = editStates[period];
      if (!state) return;
      const realValue = getSystemRealValue(selectedSubChart.code, period, selectedSubChart.unit);

      const isValueDifferent = Boolean(state.overrideValue && state.overrideValue.trim() !== realValue.trim());
      if (isValueDifferent) {
        newOverrides[period] = {
          isOverride: true,
          overrideValue: state.overrideValue.trim(),
          reason: state.reason || ''
        };
        newEntries.push({
          indicatorCode: selectedSubChart.code,
          period,
          isOverride: true,
          overrideValue: state.overrideValue.trim(),
          reason: state.reason,
          updatedAt: nowStr,
          updatedBy: 'hai.nv',
          isText: isCurrentSubChartText
        });
      }
    });

    const newVerId = `ver-${selectedSubChart.code}-${selectedYear}-${Date.now()}`;

    // Nếu người dùng chọn kích hoạt làm bản công bố chính thức
    let updatedList = chartVersions.map(v => {
      if (newVerSetPublished && v.chartCode === selectedSubChart.code && v.year === selectedYear) {
        return { ...v, isPublished: false, publishStatus: 'deactive' as VersionPublishState };
      }
      return v;
    });

    const newVersionItem: ChartVersionItem = {
      id: newVerId,
      versionNumber: formattedVer,
      versionName: finalVerName,
      chartCode: selectedSubChart.code,
      indicatorCode: selectedIndicator.code,
      year: selectedYear,
      isPublished: newVerSetPublished,
      publishStatus: newVerSetPublished ? 'active' : 'deactive',
      createdAt: nowStr,
      createdBy: 'Nguyễn Văn Hải (Admin)',
      note: newVerNote.trim() || 'Tạo khi lưu điều chỉnh số liệu',
      description: chartDescription,
      dataOverrides: newOverrides
    };

    updatedList.push(newVersionItem);
    saveChartVersionsToStorage(updatedList);
    setActiveVersionId(newVerId);
    setIsNewVersionModalOpen(false);

    // Save adjustment history entries
    if (newEntries.length > 0) {
      const newHistoryItems: AdjustmentHistoryItem[] = newEntries.map(ent => ({
        id: `HIST-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        indicatorCode: selectedIndicator.code,
        chartCode: selectedSubChart.code,
        chartName: selectedSubChart.name,
        period: ent.period,
        originalValue: getSystemRealValue(selectedSubChart.code, ent.period, selectedSubChart.unit),
        adjustedValue: ent.overrideValue,
        adjustedBy: 'hai.nv',
        adjustedAt: nowStr,
        reason: ent.reason || '',
        isText: isCurrentSubChartText
      }));

      setAdjustHistory(prev => {
        const updated = [...newHistoryItems, ...prev];
        localStorage.setItem('vna_publish_adjust_history', JSON.stringify(updated.slice(0, 200)));
        return updated;
      });
    }

    // Save audit log to system logs
    const savedLogs = localStorage.getItem('vna_system_logs');
    let logsList = savedLogs ? JSON.parse(savedLogs) : [];

    newEntries.forEach(ent => {
      logsList.unshift({
        id: `LOG-ADJ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: nowStr,
        user: 'hai.nm@vietnamairlines.com',
        userName: 'Nguyễn Minh Hải',
        role: 'Quản trị viên',
        featureName: isCurrentSubChartText ? 'Điều chỉnh văn bản thuyết minh công bố' : 'Dữ liệu số liệu công bố đối ngoại',
        actionDetails: isCurrentSubChartText
          ? `Tạo phiên bản mới [${formattedVer}] thuyết minh [${selectedSubChart.name}] (Chỉ tiêu [${selectedIndicator.code}]) kỳ ${ent.period}. Lý do: ${ent.reason || 'Biên tập chuẩn hóa'}`
          : `Tạo phiên bản mới [${formattedVer}] số liệu biểu đồ [${selectedSubChart.name}] (Chỉ tiêu [${selectedIndicator.code}]) kỳ ${ent.period} thành "${ent.overrideValue}". Lý do: ${ent.reason || 'Hiệu chỉnh số liệu'}`
      });
    });

    localStorage.setItem('vna_system_logs', JSON.stringify(logsList.slice(0, 100)));
    window.dispatchEvent(new Event('vna_publish_adjustments_updated'));

    setToast({
      message: `Đã tạo và lưu phiên bản mới [${formattedVer} - ${finalVerName}] thành công!`,
      type: 'success'
    });
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: INDICATOR LIST (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col">
          <div
            style={rightColHeight ? { height: `${rightColHeight}px` } : { minHeight: '820px' }}
            className="bg-white rounded-lg border border-gray-250 p-5 flex flex-col gap-4 overflow-hidden shadow-2xs hover:shadow-md transition-shadow duration-300"
          >
            {/* SEARCH & FILTERS */}
            <div className="flex flex-col gap-2.5 shrink-0">
              <div className="relative">
                <Input
                  placeholder="Tìm kiếm mã, tên chỉ tiêu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={filterPillar}
                  onChange={setFilterPillar}
                  options={[
                    { label: 'Tất cả trụ cột', value: '' },
                    { label: 'Môi trường (E)', value: 'Environment' },
                    { label: 'Xã hội (S)', value: 'Social' },
                    { label: 'Quản trị (G)', value: 'Governance' },
                  ]}
                  className="text-xs"
                />

                <Select
                  value={filterType}
                  onChange={setFilterType}
                  options={[
                    { label: 'Tất cả định dạng', value: '' },
                    { label: '📊 Số liệu (Biểu đồ)', value: 'numeric' },
                    { label: '📝 Văn bản (Định tính)', value: 'text' },
                  ]}
                  className="text-xs font-semibold"
                />
              </div>

              <Select
                value={filterPublish}
                onChange={setFilterPublish}
                options={[
                  { label: 'Tất cả trạng thái', value: '' },
                  { label: 'Công bố', value: 'published' },
                  { label: 'Đã gửi', value: 'submitted' },
                  { label: 'Nháp', value: 'draft' },
                ]}
                className="text-xs font-semibold"
              />
            </div>

            {/* UNIFIED TABLE CONTAINER (HEADER + LIST) */}
            <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col flex-1 min-h-0 -mt-1 shadow-2xs">
              {/* TABLE HEADER */}
              <div className="flex items-center justify-between bg-slate-50 border-b border-gray-200 px-3.5 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider select-none shrink-0">
                <span className="pl-1">Chỉ tiêu / Biểu đồ</span>
                <span className="w-20 text-center pr-1">Trạng thái</span>
              </div>

              {/* LIST */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-150 min-h-0">
                {filteredIndicators.map(ind => {
                  const isSelected = selectedIndicator?.code === ind.code;
                  const isExpanded = !!expandedIndicators[ind.code];
                  const status = getIndicatorStatus(ind);
                  const subCharts = getIndicatorSubCharts(ind);
                  const isIndText = isTextIndicator(ind);

                  return (
                    <div key={ind.code} className="flex flex-col">
                      {/* INDICATOR ROW */}
                      <div
                        onClick={() => {
                          setSelectedIndicator(ind);
                          setExpandedIndicators(prev => ({
                            ...prev,
                            [ind.code]: !prev[ind.code]
                          }));
                          if (subCharts.length > 0) {
                            setSelectedSubChart(subCharts[0]);
                          }
                        }}
                        className={`px-3 py-2.5 cursor-pointer transition-all flex items-center justify-between group border-b border-gray-100 ${isSelected
                          ? 'bg-slate-50 border-l-4 border-vna-blue'
                          : 'hover:bg-slate-50/70'
                          }`}
                      >
                        <div className="flex-1 pr-2 min-w-0 flex items-center gap-2">
                          <span className="text-gray-400 shrink-0">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0 flex items-center gap-1 ${isIndText ? 'bg-amber-100/70 text-amber-900 border border-amber-250' : 'bg-gray-100 text-gray-700'
                            }`}>
                            {isIndText ? <FileText size={10} className="text-amber-600" /> : <Activity size={10} className="text-vna-blue" />}
                            {ind.code}
                          </span>
                          <span className="text-xs font-bold text-gray-800 truncate" title={getLocalizedIndicatorName(ind.name, currentLang)}>
                            {getLocalizedIndicatorName(ind.name, currentLang)}
                          </span>
                        </div>

                        <div className="w-20 flex justify-center items-center shrink-0 pr-1">
                          {(() => {
                            const indState = getIndicatorPublishState(ind);
                            if (indState === 'published') {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                  Công bố
                                </span>
                              );
                            }
                            if (indState === 'submitted') {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-vna-blue border border-blue-200 shadow-2xs">
                                  Đã gửi
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 shadow-2xs">
                                Nháp
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* SUB-ITEMS EXPANDED LIST */}
                      {isExpanded && (
                        <div className="bg-slate-50/40 border-l-2 border-slate-300 divide-y divide-gray-100">
                          {subCharts
                            .filter(sub => {
                              if (!filterPublish) return true;
                              return getSubChartPublishState(sub.code, ind.code) === filterPublish;
                            })
                            .map(sub => {
                              const isSubSelected = selectedSubChart?.code === sub.code;
                              const subStatus = getSubChartStatus(sub.code);
                              const subState = getSubChartPublishState(sub.code, ind.code);

                              return (
                                <div
                                  key={sub.code}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIndicator(ind);
                                    setSelectedSubChart(sub);
                                  }}
                                  className={`pl-7 pr-3 py-2 cursor-pointer transition-all flex items-center justify-between ${isSubSelected
                                    ? 'bg-blue-50/80 border-r-3 border-vna-blue'
                                    : 'hover:bg-slate-100/60'
                                    }`}
                                >
                                  <div className="flex-1 pr-2 min-w-0 flex items-center gap-1.5 flex-wrap">
                                    {sub.isText ? (
                                      <FileText size={12} className="text-amber-600 shrink-0" />
                                    ) : (
                                      <Activity size={12} className="text-vna-blue shrink-0" />
                                    )}
                                    <span className={`text-xs font-semibold ${subState === 'draft' ? 'text-gray-500' : 'text-gray-800'}`}>
                                      {sub.name}
                                    </span>
                                    {subStatus === 'adjusted' && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Có số liệu điều chỉnh"></span>
                                    )}
                                  </div>

                                  <div className="w-20 flex justify-center items-center shrink-0 pr-1">
                                    {subState === 'published' && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                        Công bố
                                      </span>
                                    )}
                                    {subState === 'submitted' && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-vna-blue border border-blue-200 shadow-2xs">
                                        Đã gửi
                                      </span>
                                    )}
                                    {subState === 'draft' && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 shadow-2xs">
                                        Nháp
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredIndicators.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-xs italic">
                    Không tìm thấy chỉ tiêu nào phù hợp điều kiện lọc.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL EDIT FORM (col-span-8) */}
        <div ref={rightColRef} className="lg:col-span-8 flex flex-col gap-6">
          {!selectedSubChart || !selectedIndicator ? (
            <Card className="p-12 text-center text-gray-400 border border-gray-250 flex flex-col items-center justify-center min-h-[500px] shadow-2xs">
              <Sliders size={48} className="text-gray-300 mb-4 stroke-1" />
              <h3 className="text-base font-bold text-gray-700 mb-1">Chưa chọn chỉ tiêu điều chỉnh</h3>
              <p className="text-xs text-gray-500 max-w-sm">
                Vui lòng chọn một chỉ tiêu số liệu hoặc chỉ tiêu văn bản ở danh sách bên trái để tiến hành điều chỉnh nội dung công bố.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              {/* TOP DETAIL CARD */}
              <Card className="p-5 border border-gray-250 flex flex-col gap-4 shadow-2xs">
                {/* INDICATOR & SUBCHART HEADER */}
                <div className="flex flex-col gap-3.5 border-b border-gray-200 pb-4">
                  {/* ROW 1: INDICATOR CODE & NAME */}
                  <div className="flex items-start sm:items-center gap-2.5">
                    <span className="text-xs font-bold font-mono px-2.5 py-1 bg-gray-100 text-gray-800 rounded border border-gray-200 shrink-0 mt-0.5 sm:mt-0">
                      {selectedIndicator.code}
                    </span>
                    <h2 className="text-base font-bold text-gray-900 leading-snug break-words">
                      {selectedSubChart.name}
                    </h2>
                  </div>

                  {/* ROW 2: ACTION TOOLBAR */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-3.5 py-2.5 rounded-lg border border-gray-200">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-700 whitespace-nowrap">Năm báo cáo:</label>
                        <Select
                          value={selectedYear}
                          onChange={setSelectedYear}
                          options={[
                            { label: '2026', value: '2026' },
                            { label: '2025', value: '2025' },
                            { label: '2024', value: '2024' },
                          ]}
                          className="w-28 text-xs font-bold bg-white"
                        />
                      </div>

                      {/* Active Version Tag */}
                      {/* <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-gray-200 text-xs shadow-2xs">
                        <span className="text-gray-500 font-medium">Đang chỉnh sửa:</span>
                        <span className="font-mono font-black text-vna-blue bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          {activeVersion?.versionNumber || 'v1.0'}
                        </span>
                        <span className="font-semibold text-gray-800 line-clamp-1 max-w-[200px]" title={activeVersion?.versionName}>
                          - {activeVersion?.versionName}
                        </span>
                        {activeVersion?.isPublished && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 ml-1">
                            ✓ Đang công bố
                          </span>
                        )}
                      </div> */}
                    </div>

                    <div className="flex items-center gap-2.5">
                      {/* <Button
                        variant="outline"
                        onClick={() => {
                          setNewVerNumber(`v${currentChartVersions.length + 1}.0`);
                          setNewVerName(`Bản hiệu chỉnh số liệu ${selectedYear}`);
                          setNewVerNote('');
                          setNewVerSetPublished(true);
                          setIsNewVersionModalOpen(true);
                        }}
                        className="text-xs py-1.5 px-3 border border-emerald-600/30 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 hover:text-emerald-800 cursor-pointer flex items-center gap-1.5 font-bold shadow-2xs transition-colors"
                        title="Tạo phiên bản mới từ dữ liệu đang nhập"
                      >
                        <Sparkles size={13} className="text-emerald-600" />
                        <span>+ Tạo version mới</span>
                      </Button> */}

                      <Button
                        variant="outline"
                        onClick={() => setIsPreviewOpen(true)}
                        className="text-xs py-1.5 px-3.5 border border-gray-300 text-gray-700 bg-white cursor-pointer flex items-center gap-1.5 font-semibold shadow-2xs hover:bg-slate-100"
                      >
                        {isCurrentSubChartText ? <BookOpen size={14} className="text-amber-600" /> : <Activity size={14} className="text-vna-blue" />}
                        <span>Xem trước</span>
                      </Button>

                      <Button
                        variant="primary"
                        onClick={handleInitiateSave}
                        className="text-xs py-1.5 px-4 bg-vna-blue text-white cursor-pointer flex items-center gap-1.5 font-bold shadow-xs hover:bg-[#004d5a]"
                        title="Lưu số liệu thành phiên bản mới"
                      >
                        <Save size={14} />
                        <span>Lưu</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* === CASE 1: TEXT / QUALITATIVE INDICATOR EDITOR === */}
                {isCurrentSubChartText ? (
                  <div className="flex flex-col gap-4">
                    {currentPeriods.map(p => {
                      const state = editStates[p] || { isOverride: false, overrideValue: '', reason: '' };
                      const realValue = getSystemRealValue(selectedSubChart.code, p, selectedSubChart.unit);
                      const isOverridden = state.overrideValue && state.overrideValue.trim() !== realValue.trim();

                      return (
                        <div key={p} className="flex flex-col gap-4">
                          {/* VERTICAL STACKED TEXT EDITING STUDIO */}
                          <div className="flex flex-col gap-4 w-full">
                            {/* 1. ORIGINAL SYSTEM TEXT (FULL WIDTH) */}
                            <div className="flex flex-col gap-2.5 p-4 bg-slate-50/90 rounded-xl border border-gray-250 text-left shadow-2xs">
                              <div className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-2.5 gap-2">
                                <div className="flex items-center gap-2">
                                  <Database size={15} className="text-gray-600" />
                                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                                    Nội dung gốc
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleValueChange(p, realValue)}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-white border border-[#005f6e]/30 text-[#005f6e] hover:bg-[#005f6e] hover:text-white rounded-md shadow-2xs transition-all cursor-pointer"
                                    title="Sao chép nội dung gốc xuống khung biên tập bên dưới"
                                  >
                                    <Copy size={12} />
                                    <span>Sao chép sang ô sửa bên dưới</span>
                                  </button>
                                </div>
                              </div>

                              <div className="w-full bg-white p-4 rounded-lg border border-gray-200 min-h-[110px] max-h-[300px] overflow-y-auto text-xs text-gray-750 leading-relaxed whitespace-pre-line shadow-2xs select-text">
                                {realValue}
                              </div>
                            </div>

                            {/* 2. ADJUSTED PUBLICATION TEXT (FULL WIDTH) */}
                            <div className="flex flex-col gap-2.5 p-4 bg-slate-50/90 rounded-xl border border-gray-250 text-left shadow-2xs">
                              <div className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-2.5 gap-2">
                                <div className="flex items-center gap-2">
                                  <Edit3 size={15} className="text-gray-600" />
                                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                                    Nội dung điều chỉnh công bố (Phiên bản {activeVersion?.versionNumber || 'v1.0'})
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span className="font-medium text-gray-600">{state.overrideValue?.split(/\s+/).filter(Boolean).length || 0} từ</span>
                                  <span className="text-gray-300">•</span>
                                  <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600 font-semibold">{state.overrideValue?.length || 0} ký tự</span>
                                </div>
                              </div>

                              <textarea
                                rows={8}
                                value={state.overrideValue}
                                onChange={(e) => handleValueChange(p, e.target.value)}
                                placeholder="Nhập nội dung biên tập, chuẩn hóa câu chữ hoặc thuyết minh đầy đủ để xuất bản ra website và báo cáo ESG..."
                                className="w-full bg-white p-4 rounded-lg border border-gray-200 text-xs text-gray-900 leading-relaxed shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#005f6e]/30 focus:border-[#005f6e] resize-y min-h-[140px]"
                              />
                            </div>
                          </div>

                          {/* REASON FOR TEXT ADJUSTMENT */}
                          <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <label className="text-xs font-bold text-gray-700 whitespace-nowrap shrink-0">
                              Lý do điều chỉnh / Ghi chú kiểm toán:
                            </label>
                            <input
                              type="text"
                              value={state.reason}
                              onChange={(e) => handleReasonChange(p, e.target.value)}
                              placeholder="Ví dụ: Rút gọn để đưa vào báo cáo thường niên, Chuẩn hóa thuật ngữ theo GRI 2-23..."
                              className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-vna-blue"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* === CASE 2: NUMERIC INDICATOR PERIODS TABLE === */
                  <div className={`overflow-x-auto border rounded-xl max-h-[520px] transition-all duration-300 ${isChartPublished
                    ? 'border-gray-200'
                    : 'border-amber-200 bg-gray-50/30 opacity-85'
                    }`}>
                    <table className="w-full text-left border-collapse min-w-[650px]">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-600 uppercase tracking-wider sticky top-0 z-10 shadow-xs">
                          <th className="p-3.5 pl-4">Kỳ</th>
                          <th className="p-3.5 w-44">Số liệu gốc</th>
                          <th className="p-3.5 w-44">Điều chỉnh ({activeVersion?.versionNumber || 'v1.0'})</th>
                          <th className="p-3.5 pr-4">Lý do</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 text-xs">
                        {currentPeriods.map(p => {
                          const state = editStates[p] || { isOverride: false, overrideValue: '', reason: '' };
                          const realValue = getSystemRealValue(selectedSubChart.code, p, selectedSubChart.unit);
                          const isOverridden = state.overrideValue && state.overrideValue.trim() !== realValue.trim();

                          return (
                            <tr
                              key={p}
                              className={`transition-colors hover:bg-slate-50/50 ${isOverridden ? 'bg-amber-50/15' : ''
                                }`}
                            >
                              <td className="p-3 pl-4 font-bold text-gray-800 text-sm whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <Activity size={14} className="text-vna-blue shrink-0" />
                                  <span className={!isChartPublished ? 'text-gray-400' : 'text-gray-800'}>
                                    {p}
                                  </span>
                                </div>
                              </td>

                              <td className="p-3">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-mono text-sm font-bold truncate text-gray-850">
                                    {realValue}
                                  </span>
                                </div>
                              </td>

                              <td className="p-3">
                                <input
                                  type="text"
                                  value={state.overrideValue}
                                  onChange={(e) => handleValueChange(p, e.target.value)}
                                  placeholder="Số mới..."
                                  className={`w-full text-xs font-bold font-mono px-2.5 py-1.5 border rounded-md focus:outline-none focus:ring-1 ${isOverridden
                                    ? 'bg-amber-50/10 border-amber-300 text-gray-850 shadow-xs focus:ring-amber-500'
                                    : 'bg-white border-gray-200 text-gray-800 focus:ring-vna-blue'
                                    }`}
                                />
                              </td>

                              <td className="p-3 pr-4">
                                <input
                                  type="text"
                                  value={state.reason}
                                  onChange={(e) => handleReasonChange(p, e.target.value)}
                                  placeholder="Nhập lý do điều chỉnh..."
                                  className={`w-full text-xs px-2.5 py-1.5 border rounded-md focus:outline-none focus:ring-1 ${isOverridden
                                    ? 'bg-amber-50/10 border-amber-300 text-gray-850 shadow-xs focus:ring-amber-500'
                                    : 'bg-white border-gray-200 text-gray-800 focus:ring-vna-blue'
                                    }`}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* === BẢNG DANH SÁCH VERSION (ĐẶT PHÍA DƯỚI BẢNG ĐIỀU CHỈNH) === */}
              <Card className="p-5 border border-gray-250 flex flex-col gap-3.5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-150 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 text-vna-blue rounded-lg border border-blue-200">
                      <History size={17} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-vna-blue uppercase tracking-wider">
                          Danh sách Phiên bản
                        </h3>
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          {currentChartVersions.length} phiên bản
                        </Badge>
                      </div>
                      {/* <p className="text-[11px] text-gray-500 mt-0.5">
                        Mỗi biểu đồ chỉ có <strong>1 version duy nhất</strong> được kích hoạt công bố. Bạn có thể bấm vào dòng để chuyển sang xem và điều chỉnh số liệu của version đó.
                      </p> */}
                    </div>
                  </div>

                  {/* <Button
                    variant="outline"
                    onClick={() => {
                      setNewVerNumber(`v${currentChartVersions.length + 1}.0`);
                      setNewVerName(`Bản hiệu chỉnh số liệu ${selectedYear}`);
                      setNewVerNote('');
                      setNewVerSetPublished(true);
                      setIsNewVersionModalOpen(true);
                    }}
                    className="text-xs py-1.5 px-3 border border-emerald-600/30 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 hover:text-emerald-800 cursor-pointer flex items-center gap-1.5 font-bold shadow-2xs transition-colors"
                  >
                    <Sparkles size={13} className="text-emerald-600" />
                    <span>+ Tạo version mới</span>
                  </Button> */}
                </div>

                {/* TABLE OF VERSIONS */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-12 text-center">STT</th>
                        <th className="py-2.5 px-3 w-24 text-center">VERSION</th>
                        <th className="py-2.5 px-4 w-36">THỜI GIAN</th>
                        <th className="py-2.5 px-4 w-36">NGƯỜI THỰC HIỆN</th>
                        <th className="py-2.5 px-4 w-44 text-center">TRẠNG THÁI CÔNG BỐ</th>
                        <th className="py-2.5 px-4 w-28 text-center">THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {currentChartVersions.map((ver, idx) => {
                        const isViewing = activeVersion?.id === ver.id;
                        const vStatus = getVersionPublishState(ver);

                        return (
                          <tr
                            key={ver.id}
                            onClick={() => setActiveVersionId(ver.id)}
                            className={`transition-colors cursor-pointer ${isViewing
                              ? 'bg-blue-50/60 border-l-4 border-l-vna-blue'
                              : 'hover:bg-slate-50/80'
                              }`}
                          >
                            {/* 1. STT */}
                            <td className="py-3 px-3 text-center text-gray-500 font-medium">
                              {idx + 1}
                            </td>

                            {/* 2. Version */}
                            <td className="py-3 px-3 text-center font-mono">
                              <span className={`font-black text-xs px-2.5 py-1 rounded shadow-2xs ${isViewing
                                ? 'bg-vna-blue text-white'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}>
                                {ver.versionNumber}
                              </span>
                            </td>

                            {/* 3. Thời gian */}
                            <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} className="text-gray-400 shrink-0" />
                                <span>{ver.createdAt}</span>
                              </div>
                            </td>

                            {/* 4. Người thực hiện (Username không đuôi @) */}
                            <td className="py-3 px-4 text-gray-800 font-mono text-xs font-bold">
                              <div className="flex items-center gap-1.5">
                                <User size={13} className="text-gray-400 shrink-0" />
                                <span>{formatUserAccount(ver.createdBy)}</span>
                              </div>
                            </td>

                            {/* 5. Trạng thái công bố: Active / Deactive */}
                            <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                              {vStatus === 'active' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-xs font-bold shadow-2xs">
                                  <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                                  <span>Active</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md border border-gray-200 bg-gray-100 text-gray-500 text-xs font-bold shadow-2xs">
                                  <span>Deactive</span>
                                </span>
                              )}
                            </td>

                            {/* 6. Thao tác: Đề nghị công bố / Đề nghị gỡ công bố */}
                            <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                              {vStatus === 'active' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => handleUnpublishVersion(ver.id, e)}
                                  className="text-xs py-1.5 px-3 border-amber-400 text-amber-800 bg-amber-50/80 hover:bg-amber-100 font-bold shadow-2xs transition-all cursor-pointer rounded-md whitespace-nowrap"
                                  title="Đề nghị gỡ công bố phiên bản này"
                                >
                                  Đề nghị gỡ công bố
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => handlePublishVersion(ver.id, e)}
                                  className="text-xs py-1.5 px-3 border-emerald-500 text-emerald-800 bg-emerald-50/80 hover:bg-emerald-600 hover:text-white font-bold shadow-2xs transition-all cursor-pointer rounded-md whitespace-nowrap"
                                  title="Đề nghị công bố phiên bản này"
                                >
                                  Đề nghị công bố
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>


              {/* DESCRIPTION / NARRATIVE CARD */}
              <Card className="p-5 border border-gray-250 flex flex-col gap-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-gray-150 pb-2.5">
                  <h3 className="text-xs font-bold text-vna-blue uppercase tracking-wider flex items-center gap-2">
                    <FileText size={15} />
                    <span>{isCurrentSubChartText ? 'Ghi chú biên tập / Thuyết minh bổ sung' : 'Mô tả / Thuyết minh biểu đồ'}</span>
                  </h3>
                  <span className="text-[11px] text-gray-500 font-mono">
                    Áp dụng cho: <strong>{activeVersion?.versionNumber || 'v1.0'}</strong>
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <textarea
                    rows={4}
                    value={chartDescription}
                    onChange={(e) => setChartDescription(e.target.value)}
                    placeholder={
                      isCurrentSubChartText
                        ? 'Nhập ghi chú bổ sung, trích dẫn tài liệu pháp lý hoặc thuyết minh tổng hợp cho chỉ tiêu văn bản này...'
                        : 'Nhập phần mô tả, bối cảnh số liệu, phân tích xu hướng hoặc ghi chú thuyết minh cho toàn bộ biểu đồ này...'
                    }
                    className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-vna-blue bg-white text-gray-800 resize-y leading-relaxed shadow-2xs"
                  />
                </div>
              </Card>            </div>
          )}
        </div>
      </div>



      {/* MODAL LƯU PHIÊN BẢN THEO PHƯƠNG ÁN 1: SEMANTIC VERSIONING PRESETS */}
      <Modal
        isOpen={isNewVersionModalOpen}
        onClose={() => setIsNewVersionModalOpen(false)}
        title="Lưu phiên bản điều chỉnh mới"
        size="md"
      >
        <div className="p-5 space-y-4 text-left">
          {/* Thông tin ngữ cảnh & Version hiện tại */}
          <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-vna-blue font-mono px-2 py-0.5 bg-blue-50 border border-blue-200 rounded">
                {selectedSubChart?.code}
              </span>
              <span className="font-semibold text-gray-800">{selectedSubChart?.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 text-[11px]">Bản hiện tại:</span>
              <span className="font-bold text-slate-700 font-mono px-2 py-0.5 bg-gray-200/80 rounded">
                {versionOptions.current}
              </span>
            </div>
          </div>

          {/* 1. HAI THẺ LỰA CHỌN NHANH (QUICK PRESETS) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
              Chọn mức độ thay đổi phiên bản:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Thẻ 1: Minor Update */}
              <div
                onClick={() => {
                  setVersionType('minor');
                  setNewVerNumber(versionOptions.nextMinor);
                }}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  versionType === 'minor'
                    ? 'border-vna-blue bg-blue-50/50 shadow-sm ring-1 ring-vna-blue'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Chỉnh sửa nhỏ</span>
                  </span>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-vna-blue">
                    {versionOptions.nextMinor}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-snug">
                  Hiệu chỉnh số lẻ, đối soát định mức kỹ thuật hoặc cập nhật nhỏ.
                </p>
              </div>

              {/* Thẻ 2: Major Update */}
              <div
                onClick={() => {
                  setVersionType('major');
                  setNewVerNumber(versionOptions.nextMajor);
                }}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  versionType === 'major'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Bản chính thức mới</span>
                  </span>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {versionOptions.nextMajor}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-snug">
                  Chốt kỳ báo cáo năm/quý, sau kiểm toán IATA hoặc thay đổi lớn.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsNewVersionModalOpen(false)}
              className="text-xs px-4 py-2"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSaveVersion}
              className="text-xs px-5 py-2 bg-vna-blue text-white font-bold flex items-center gap-1.5 shadow-md hover:bg-[#004d5a]"
            >
              <Save size={14} />
              <span>Lưu phiên bản [{newVerNumber || '...'}]</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* PREVIEW MODAL (NUMERIC OR TEXT) */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={isCurrentSubChartText ? `Ấn phẩm công bố: ${selectedSubChart?.name}` : `Biểu đồ công bố: ${selectedSubChart?.name}`}
        size="lg"
      >
        <div className="p-5 space-y-4 text-left">
          {/* HEADER IN PREVIEW */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono px-2 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-200">
                {selectedIndicator?.code}
              </span>
              <PillarBadge pillar={selectedIndicator?.pillar} />
              <span className="text-xs text-gray-500">Năm {selectedYear}</span>
            </div>
            <Badge variant={isChartPublished ? 'success' : 'danger'}>
              {isChartPublished ? 'Trạng thái: Công bố' : 'Trạng thái: Tạm ẩn'}
            </Badge>
          </div>

          {isCurrentSubChartText ? (
            /* TEXT PUBLICATION PREVIEW */
            <div className="bg-slate-50/70 p-5 rounded-xl border border-gray-200 space-y-4">
              <div className="flex items-center gap-2 text-vna-blue">
                <BookOpen size={18} />
                <h4 className="text-sm font-bold text-gray-900">{selectedSubChart?.name}</h4>
              </div>

              <div className="bg-white p-4.5 rounded-lg border border-gray-200 shadow-2xs text-xs text-gray-800 leading-relaxed whitespace-pre-line font-normal">
                {editStates[`Năm ${selectedYear}`]?.overrideValue || getSystemRealValue(selectedSubChart?.code, `Năm ${selectedYear}`, selectedSubChart?.unit)}
              </div>

              {chartDescription && (
                <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3 text-xs text-gray-700">
                  <span className="font-bold text-vna-blue block mb-1">Thuyết minh bổ sung:</span>
                  <p className="whitespace-pre-line leading-relaxed">{chartDescription}</p>
                </div>
              )}
            </div>
          ) : (
            /* NUMERIC CHART PREVIEW */
            <div className="space-y-4">
              <div className="h-[350px] bg-slate-50 p-4 rounded-xl border border-gray-200">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={previewChartData} margin={{ top: 15, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="periodLabel" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} unit={selectedSubChart?.unit === '%' ? '%' : ''} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                      labelFormatter={(label, items) => items[0]?.payload?.fullName || label}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Số liệu gốc" fill="#9ca3af" opacity={0.35} radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="Số liệu điều chỉnh" stroke="#005f73" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {chartDescription && (
                <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 text-xs text-gray-700">
                  <div className="font-bold text-vna-blue mb-1 flex items-center gap-1.5">
                    <FileText size={14} />
                    <span>Mô tả / Thuyết minh biểu đồ:</span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed text-gray-800">{chartDescription}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
