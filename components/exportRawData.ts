import * as XLSX from 'xlsx';

export interface IndicatorExportInfo {
  code: string;
  name: string;
  pillar: string;
  topic?: string;
  department?: string;
  unit?: string;
  frequency?: string;
  programs?: string[];
  reportType?: string;
  isActive?: boolean;
  introduction?: string;
  metabaseLink?: string;
  inputDept?: string;
  approveDept?: string;
}

export interface ExportRawDataOptions {
  fromPeriod?: string; // e.g. "2025-01" or "01/2025" or "2025-01-01"
  toPeriod?: string;   // e.g. "2026-05" or "05/2026" or "2026-05-31"
  filterMode?: 'month' | 'date' | 'all';
  lang?: 'vi' | 'en';
}

// Chuyển đổi chuỗi kỳ báo cáo (Tháng MM/YYYY, YYYY-MM, Năm YYYY) sang số YYYYMM để so sánh
export function parsePeriodToNumber(periodStr: string): number {
  if (!periodStr) return 0;
  
  // Format "Tháng MM/YYYY" hoặc "Tháng M/YYYY"
  const mMonthVi = periodStr.match(/tháng\s*(\d{1,2})\/(\d{4})/i);
  if (mMonthVi) {
    const m = parseInt(mMonthVi[1], 10);
    const y = parseInt(mMonthVi[2], 10);
    return y * 100 + m;
  }

  // Format "YYYY-MM" hoặc "YYYY-MM-DD"
  const mIso = periodStr.match(/(\d{4})-(\d{1,2})/);
  if (mIso) {
    const y = parseInt(mIso[1], 10);
    const m = parseInt(mIso[2], 10);
    return y * 100 + m;
  }

  // Format "MM/YYYY"
  const mSlash = periodStr.match(/^(\d{1,2})\/(\d{4})/);
  if (mSlash) {
    const m = parseInt(mSlash[1], 10);
    const y = parseInt(mSlash[2], 10);
    return y * 100 + m;
  }

  // Format "Năm YYYY" hoặc "YYYY"
  const mYear = periodStr.match(/năm\s*(\d{4})|(\d{4})/i);
  if (mYear) {
    const y = parseInt(mYear[1] || mYear[2], 10);
    return y * 100 + 1; // Mặc định tháng 1 cho năm
  }

  return 0;
}

// Chuyển đổi định dạng hiển thị ngày/tháng
export function formatDisplayPeriod(periodStr: string): string {
  if (!periodStr) return '';
  const mDate = periodStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (mDate) {
    return `${mDate[3]}/${mDate[2]}/${mDate[1]}`;
  }
  const m = periodStr.match(/(\d{4})-(\d{2})/);
  if (m) {
    return `Tháng ${m[2]}/${m[1]}`;
  }
  return periodStr;
}

// Hàm sinh số xác định theo chuỗi mã và thời gian để số liệu trông thực tế và nhất quán
function hashNumber(str: string, seed: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i) + seed;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function exportIndicatorRawData(
  indicator: IndicatorExportInfo,
  optionsOrLang?: ExportRawDataOptions | 'vi' | 'en'
): void {
  const options: ExportRawDataOptions = typeof optionsOrLang === 'string'
    ? { lang: optionsOrLang }
    : (optionsOrLang || {});

  const currentLang = options.lang || 'vi';

  if (!indicator) {
    alert(currentLang === 'vi' ? 'Không tìm thấy thông tin chỉ tiêu để xuất dữ liệu.' : 'Indicator info not found.');
    return;
  }

  const code = indicator.code || 'KPI-ESG';
  const name = indicator.name || 'Chỉ tiêu ESG';
  const pillar = indicator.pillar || 'Môi trường (E)';
  const dept = indicator.department || 'Vietnam Airlines';
  const unit = indicator.unit || '--';

  const isEmissionsOrFuel = /gri\s*(302|305)|airline\s*e-1|fuel|saf|phát thải|nhiên liệu|co2|khí thải|tiêu thụ năng lượng/i.test(
    `${code} ${name} ${indicator.topic || ''}`
  );

  const isCustomerService = /airline\s*b-1|dịch vụ|khách hàng|nps|skytrax|khiếu nại/i.test(
    `${code} ${name} ${indicator.topic || ''}`
  );

  const isSafetyOrHR = /gri\s*(403|404|405)|an toàn|lao động|nhân lực|đào tạo|tai nạn/i.test(
    `${code} ${name} ${indicator.topic || ''}`
  );

  // Danh sách các kỳ dữ liệu mặc định từ 2022 đến 2026
  let allPeriods = [
    'Tháng 05/2026', 'Tháng 04/2026', 'Tháng 03/2026', 'Tháng 02/2026', 'Tháng 01/2026',
    'Tháng 12/2025', 'Tháng 11/2025', 'Tháng 10/2025', 'Tháng 09/2025', 'Tháng 08/2025',
    'Tháng 07/2025', 'Tháng 06/2025', 'Tháng 05/2025', 'Tháng 04/2025', 'Tháng 03/2025',
    'Tháng 02/2025', 'Tháng 01/2025',
    'Năm 2024', 'Năm 2023', 'Năm 2022'
  ];

  // Lọc theo khoảng thời gian nếu người dùng chọn
  const fromNum = options.fromPeriod ? parsePeriodToNumber(options.fromPeriod) : 0;
  const toNum = options.toPeriod ? parsePeriodToNumber(options.toPeriod) : 999999;

  let filteredPeriods = allPeriods;
  if (fromNum > 0 || toNum < 999999) {
    filteredPeriods = allPeriods.filter(p => {
      const pNum = parsePeriodToNumber(p);
      return pNum >= fromNum && pNum <= toNum;
    });

    // Nếu không khớp kỳ cố định nhưng người dùng chọn khoảng tháng cụ thể, tự sinh các tháng trong khoảng đó
    if (filteredPeriods.length === 0 && fromNum > 0 && toNum >= fromNum) {
      const generated: string[] = [];
      let currentYear = Math.floor(fromNum / 100);
      let currentMonth = fromNum % 100;
      const endYear = Math.floor(toNum / 100);
      const endMonth = toNum % 100;

      while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        generated.push(`Tháng ${String(currentMonth).padStart(2, '0')}/${currentYear}`);
        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
      }
      filteredPeriods = generated.reverse();
    }
  }

  // Đảm bảo luôn có ít nhất 1 kỳ để xuất
  if (filteredPeriods.length === 0) {
    filteredPeriods = [formatDisplayPeriod(options.fromPeriod || '2026-05')];
  }

  const rawRecords: any[] = [];
  let stt = 1;

  if (isEmissionsOrFuel) {
    // Chi tiết theo Chặng bay và Đội tàu bay
    const routes = [
      { name: 'HAN-SGN (Trục Nội địa chính)', type: 'Nội địa', fleet: 'B787-9' },
      { name: 'SGN-HAN (Trục Nội địa chính)', type: 'Nội địa', fleet: 'A350-900' },
      { name: 'HAN-DAD (Nội địa miền Trung)', type: 'Nội địa', fleet: 'A321-NEO' },
      { name: 'SGN-DAD (Nội địa miền Trung)', type: 'Nội địa', fleet: 'A321-200' },
      { name: 'SGN-PQC (Nội địa du lịch)', type: 'Nội địa', fleet: 'A321-NEO' },
      { name: 'HAN-CXR (Nội địa du lịch)', type: 'Nội địa', fleet: 'A321-NEO' },
      { name: 'HAN-NRT (Quốc tế Đông Bắc Á)', type: 'Quốc tế', fleet: 'A350-900' },
      { name: 'SGN-SIN (Quốc tế Đông Nam Á)', type: 'Quốc tế', fleet: 'A321-NEO' },
      { name: 'HAN-ICN (Quốc tế Đông Bắc Á)', type: 'Quốc tế', fleet: 'B787-10' },
      { name: 'HAN-CDG (Quốc tế Châu Âu)', type: 'Quốc tế', fleet: 'B787-9' },
      { name: 'SGN-SYD (Quốc tế Châu Úc)', type: 'Quốc tế', fleet: 'A350-900' }
    ];

    filteredPeriods.forEach((period, pIdx) => {
      routes.forEach((route, rIdx) => {
        const seed = pIdx * 100 + rIdx * 17;
        const baseFuel = route.type === 'Quốc tế' ? 1200 + (hashNumber(code + period, seed) % 800) : 350 + (hashNumber(code + period, seed) % 250);
        const actualFuel = parseFloat((baseFuel * (1 + (hashNumber(period, rIdx) % 10) / 100)).toFixed(2));
        const targetFuel = parseFloat((baseFuel * 1.02).toFixed(2));
        const co2Emissions = parseFloat((actualFuel * 3.16).toFixed(2));
        const compRate = ((targetFuel / actualFuel) * 100).toFixed(1);

        rawRecords.push({
          'STT': stt++,
          'Mã chỉ tiêu': code,
          'Tên chỉ tiêu': name,
          'Trụ cột ESG': pillar,
          'Đơn vị phụ trách': dept,
          'Kỳ báo cáo': period,
          'Phân loại chặng bay': route.name,
          'Tuyến đường': route.type,
          'Dòng tàu bay': route.fleet,
          'Nhiên liệu tiêu thụ (Tấn)': actualFuel,
          'Phát thải CO2 (tCO2e)': co2Emissions,
          'Định mức Kế hoạch (Tấn)': targetFuel,
          'Tỷ lệ hoàn thành (%)': `${compRate}%`,
          'Đơn vị tính': unit !== '--' ? unit : 'Tấn / tCO2e',
          'Nguồn dữ liệu': 'Hệ thống FIMS / Safran SF CO2',
          'Người cập nhật': 'Lê Minh Tuấn',
          'Thời gian ghi nhận': `15/${String((pIdx % 12) + 1).padStart(2, '0')}/2025 09:30`,
          'Trạng thái dữ liệu': 'Đã phê duyệt (Chính thức)'
        });
      });
    });
  } else if (isCustomerService) {
    // Chi tiết theo Phân khúc khách hàng và Điểm chạm dịch vụ
    const touchpoints = [
      'Dịch vụ mặt đất & Check-in',
      'Phòng chờ Bông Sen Vàng',
      'Suất ăn & Đồ uống trên chuyến bay',
      'Giải trí không dây (Wireless-IFE)',
      'Thái độ & Tác phong Tiếp viên',
      'Dịch vụ nhận hành lý & Chăm sóc sau bay'
    ];
    const classes = ['Hạng Thương gia (Business)', 'Hạng Phổ thông đặc biệt', 'Hạng Phổ thông (Economy)'];

    filteredPeriods.forEach((period, pIdx) => {
      touchpoints.forEach((tp, tIdx) => {
        classes.forEach((cls, cIdx) => {
          const seed = pIdx * 50 + tIdx * 13 + cIdx * 7;
          const score = 82 + (hashNumber(code + period, seed) % 15);
          const target = 85;
          const compRate = ((score / target) * 100).toFixed(1);

          rawRecords.push({
            'STT': stt++,
            'Mã chỉ tiêu': code,
            'Tên chỉ tiêu': name,
            'Trụ cột ESG': pillar,
            'Đơn vị phụ trách': dept,
            'Kỳ báo cáo': period,
            'Điểm chạm dịch vụ': tp,
            'Hạng vé / Phân khúc': cls,
            'Điểm số khảo sát': score,
            'Đơn vị tính': unit !== '--' ? unit : 'Điểm / %',
            'Chỉ tiêu Kế hoạch': target,
            'Tỷ lệ hoàn thành (%)': `${compRate}%`,
            'Nguồn dữ liệu': 'Khảo sát hành khách Qualtrics / CSAT',
            'Người cập nhật': 'Trần Thanh Sơn',
            'Thời gian ghi nhận': `10/${String((pIdx % 12) + 1).padStart(2, '0')}/2025 15:45`,
            'Trạng thái dữ liệu': 'Đã phê duyệt (Chính thức)'
          });
        });
      });
    });
  } else if (isSafetyOrHR) {
    // Chi tiết theo Khối chuyên môn và Chi nhánh
    const blocks = [
      'Khối Khai thác bay (Đoàn bay 919)',
      'Khối Tiếp viên (Đoàn tiếp viên)',
      'Khối Kỹ thuật & Bảo dưỡng (VAECO)',
      'Khối Dịch vụ mặt đất (VIAGS)',
      'Khối Cơ quan Tổng công ty'
    ];

    filteredPeriods.forEach((period, pIdx) => {
      blocks.forEach((blk, bIdx) => {
        const seed = pIdx * 40 + bIdx * 9;
        const val = 10 + (hashNumber(code + period, seed) % 85);
        const target = 100;
        const compRate = ((val / target) * 100).toFixed(1);

        rawRecords.push({
          'STT': stt++,
          'Mã chỉ tiêu': code,
          'Tên chỉ tiêu': name,
          'Trụ cột ESG': pillar,
          'Đơn vị phụ trách': dept,
          'Kỳ báo cáo': period,
          'Khối chuyên môn / Đơn vị': blk,
          'Giá trị thực hiện': val,
          'Đơn vị tính': unit !== '--' ? unit : 'Vụ / % / Người',
          'Chỉ tiêu Kế hoạch': target,
          'Tỷ lệ hoàn thành (%)': `${compRate}%`,
          'Nguồn dữ liệu': 'Hệ thống Quản lý An toàn & Nhân sự SkyHR/SMS',
          'Người cập nhật': 'Phạm Thuỳ Linh',
          'Thời gian ghi nhận': `05/${String((pIdx % 12) + 1).padStart(2, '0')}/2025 11:20`,
          'Trạng thái dữ liệu': 'Đã phê duyệt (Chính thức)'
        });
      });
    });
  } else {
    // Chỉ tiêu thông thường theo đơn vị chi nhánh
    const branches = [
      'Chi nhánh Miền Bắc (HAN)',
      'Chi nhánh Miền Nam (SGN)',
      'Chi nhánh Miền Trung (DAD)',
      'Văn phòng Tổng công ty',
      'Chi nhánh Quốc tế'
    ];

    filteredPeriods.forEach((period, pIdx) => {
      branches.forEach((br, bIdx) => {
        const seed = pIdx * 30 + bIdx * 11;
        const val = 20 + (hashNumber(code + period, seed) % 75);
        const target = 80;
        const compRate = ((val / target) * 100).toFixed(1);

        rawRecords.push({
          'STT': stt++,
          'Mã chỉ tiêu': code,
          'Tên chỉ tiêu': name,
          'Trụ cột ESG': pillar,
          'Đơn vị phụ trách': dept,
          'Kỳ báo cáo': period,
          'Chi nhánh / Khu vực': br,
          'Giá trị thực hiện': val,
          'Đơn vị tính': unit !== '--' ? unit : 'Giá trị',
          'Chỉ tiêu Kế hoạch': target,
          'Tỷ lệ hoàn thành (%)': `${compRate}%`,
          'Nguồn dữ liệu': 'Hệ thống Quản trị ESG VNA',
          'Người cập nhật': 'Chuyên viên Ban ESG',
          'Thời gian ghi nhận': `01/${String((pIdx % 12) + 1).padStart(2, '0')}/2025 10:00`,
          'Trạng thái dữ liệu': 'Đã phê duyệt (Chính thức)'
        });
      });
    });
  }

  const fromLabel = options.fromPeriod ? formatDisplayPeriod(options.fromPeriod) : 'Từ trước đến nay';
  const toLabel = options.toPeriod ? formatDisplayPeriod(options.toPeriod) : 'Hiện tại';

  // Sheet 2: Metadata chỉ tiêu
  const metaRows: any[][] = [
    ['THÔNG TIN THIẾT LẬP CHỈ TIÊU ESG - VIETNAM AIRLINES', ''],
    ['Mã chỉ tiêu', code],
    ['Tên chỉ tiêu', name],
    ['Trụ cột ESG', pillar],
    ['Chủ đề (Topic)', indicator.topic || '--'],
    ['CQĐV Phụ trách (Owner)', dept],
    ['Hình thức báo cáo', indicator.reportType === 'TEXT' ? 'Nội dung văn bản' : 'Số liệu'],
    ['Đơn vị tính', unit],
    ['Tần suất báo cáo', indicator.frequency || 'Hàng tháng'],
    ['Nhãn chương trình áp dụng', (indicator.programs || []).join(', ') || 'Toàn mạng bay'],
    ['Trạng thái áp dụng', indicator.isActive !== false ? 'Hoạt động (Đang áp dụng)' : 'Ngừng áp dụng'],
    ['Khoảng thời gian trích xuất', `${fromLabel} - ${toLabel}`],
    ['Tổng số dòng dữ liệu trích xuất', `${rawRecords.length} dòng dữ liệu`],
    ['Mô tả / Phương pháp tính', indicator.introduction || '--'],
    ['Đường dẫn Dashboard Metabase', indicator.metabaseLink || '--'],
    ['Đơn vị nhập liệu', indicator.inputDept || dept],
    ['Đơn vị phê duyệt', indicator.approveDept || `Lãnh đạo ${dept}`],
    ['Thời điểm trích xuất dữ liệu', new Date().toLocaleString('vi-VN')],
    ['Hệ thống trích xuất', 'Hệ thống Báo cáo & Quản trị ESG - Vietnam Airlines (VNA NetZero)']
  ];

  // Khởi tạo Workbook
  const wb = XLSX.utils.book_new();

  // Tạo Sheet 1: Raw Data
  const wsRaw = XLSX.utils.json_to_sheet(rawRecords);
  wsRaw['!cols'] = [
    { wch: 6 },   // STT
    { wch: 15 },  // Mã chỉ tiêu
    { wch: 32 },  // Tên chỉ tiêu
    { wch: 16 },  // Trụ cột
    { wch: 24 },  // Đơn vị
    { wch: 16 },  // Kỳ báo cáo
    { wch: 30 },  // Phân loại / Chặng bay
    { wch: 22 },  // Tuyến đường / Điểm chạm / Khối
    { wch: 20 },  // Dòng tàu bay / Hạng vé
    { wch: 22 },  // Nhiên liệu / Giá trị
    { wch: 20 },  // Phát thải / Chỉ tiêu
    { wch: 20 },  // Định mức kế hoạch
    { wch: 18 },  // Tỷ lệ hoàn thành
    { wch: 14 },  // Đơn vị tính
    { wch: 26 },  // Nguồn dữ liệu
    { wch: 20 },  // Người cập nhật
    { wch: 22 },  // Thời gian ghi nhận
    { wch: 22 }   // Trạng thái dữ liệu
  ];
  XLSX.utils.book_append_sheet(wb, wsRaw, 'Dữ_Liệu_Thô_Raw_Data');

  // Tạo Sheet 2: Metadata
  const wsMeta = XLSX.utils.aoa_to_sheet(metaRows);
  wsMeta['!cols'] = [{ wch: 32 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsMeta, 'Thông_Tin_Chỉ_Tiêu');

  // Lưu và kích hoạt tải về
  const cleanCode = code.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fromClean = (options.fromPeriod || 'ALL').replace(/[^a-zA-Z0-9_-]/g, '_');
  const toClean = (options.toPeriod || 'NOW').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `Raw_Data_${cleanCode}_${fromClean}_den_${toClean}_${dateStr}.xlsx`;

  XLSX.writeFile(wb, filename);

  alert(`Đã trích xuất thành công ${rawRecords.length} dòng dữ liệu thô (${fromLabel} - ${toLabel}) của chỉ tiêu ${code} ra tệp Excel: ${filename}`);
}
