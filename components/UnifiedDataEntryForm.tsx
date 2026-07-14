import React, { useState, useEffect, useRef } from 'react';
import { Button } from './UI';
import { ArrowLeft, Save, FileSpreadsheet, ArrowRight, ShieldCheck, RefreshCw, Search } from 'lucide-react';

import kpiRules from './NetzeroGRI_KPI_Rules.json';

interface UnifiedDataEntryFormProps {
  department: string;
  effectivePeriod: string;
  onBack: () => void;
  onSave: () => void;
  isNewPeriod?: boolean;
}

export const UnifiedDataEntryForm: React.FC<UnifiedDataEntryFormProps> = ({
  department,
  effectivePeriod,
  onBack,
  onSave,
  isNewPeriod,
}) => {
  const [activeSec, setActiveSec] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<string>('TAB_1');
  const [activeMainTab, setActiveMainTab] = useState<'DATA' | 'PLAN'>('DATA');

  useEffect(() => {
    setActiveSubTab('TAB_1');
    setActiveMainTab('DATA'); // Reset main tab khi chuyển chỉ tiêu
  }, [activeSec]);

  // Get indicators for this department from localStorage
  const indicators: string[] = React.useMemo(() => {
    const savedDeptsStr = localStorage.getItem('vna_esg_departments');
    if (savedDeptsStr) {
      try {
        const depts = JSON.parse(savedDeptsStr);
        const matched = depts.find((d: any) => d.name.toLowerCase().trim() === department.toLowerCase().trim());
        if (matched && matched.indicatorIds) {
          return matched.indicatorIds;
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Fallbacks
    const fallback: Record<string, string[]> = {
      'Tổ Khai thác (TTĐHKT)': ["GRI 302-1", "GRI 302-4", "GRI 305-1", "GRI 305-4", "GRI 305-5", "GRI 305-7"],
      'Ban An toàn chất lượng (Ban ATCL)': ["Airline E-1", "9", "GRI 403-2"],
      'Tổ Kỹ thuật (Ban QLVT)': ["4", "5", "13"],
      'Trung tâm Bông Sen Vàng (TTBSV)': ["Airline B-2"],
      'Ban Chuyển đổi số & CNTT': ["GRI 418-1"],
      'Tổ Dịch vụ': ["GRI 303-3", "GRI 303-5", "Airline B-1", "GRI 204-1", "GRI 406-1", "GRI 416-1", "GRI 416-2", "GRI 417-2"],
      'Ban Tổ chức Nhân lực': ["Airline D-1", "Airline F-2", "GRI 202-1", "GRI 202-2", "GRI 403-9", "GRI 401-1", "GRI 401-2"],
      'Ban Kế hoạch Phát triển': ["GRI 2-9", "GRI 2-15", "GRI 2-23", "GRI 205-2", "GRI 205-3", "GRI 206-1", "GRI 415-1"],
      'Ban Truyền thông': ["Airline F-1", "GRI 417-3"],
    };
    return fallback[department] || [];
  }, [department]);

  // Load name and pillar details for each indicator
  const indicatorDetails = React.useMemo(() => {
    const savedInds = localStorage.getItem('vna_esg_indicators');
    let allIndicators: any[] = [];
    if (savedInds) {
      try {
        allIndicators = JSON.parse(savedInds);
      } catch (e) { }
    }
    return indicators.map(id => {
      const found = allIndicators.find(ind => ind.code === id || ind.id === id);
      return {
        code: id,
        displayCode: found ? (found.code === 'Chưa có mã' ? found.name : found.code) : id,
        name: found ? found.name : 'Chỉ tiêu nghiệp vụ',
        pillar: found ? found.pillar : 'E'
      };
    });
  }, [indicators]);

  // Set default active tab and hide parent page headers/tabs when editing
  useEffect(() => {
    if (indicators.length > 0) {
      setActiveSec(indicators[0]);
    }

    // Find parent page headers and tabs elements to hide
    const parentTabs = document.querySelector('.flex.border-b.border-gray-200.mb-6');
    const parentHeader = document.querySelector('.flex.flex-col.md\\:flex-row.md\\:items-center.justify-between.gap-4');

    if (parentTabs) (parentTabs as HTMLElement).style.display = 'none';
    if (parentHeader) (parentHeader as HTMLElement).style.display = 'none';

    return () => {
      // Restore on unmount
      if (parentTabs) (parentTabs as HTMLElement).style.display = '';
      if (parentHeader) (parentHeader as HTMLElement).style.display = '';
    };
  }, [indicators]);

  useEffect(() => {
    if (isNewPeriod) {
      const event = new CustomEvent('vna-period-mode-change', { detail: { isNew: true } });
      window.dispatchEvent(event);
    } else {
      const event = new CustomEvent('vna-period-mode-change', { detail: { isNew: false } });
      window.dispatchEvent(event);
    }
    return () => {
      const event = new CustomEvent('vna-period-mode-change', { detail: { isNew: false } });
      window.dispatchEvent(event);
    };
  }, [isNewPeriod]);

  useEffect(() => {
    const handleSaveEvent = () => {
      onSave();
    };
    window.addEventListener('vna-save-new-period', handleSaveEvent);
    return () => {
      window.removeEventListener('vna-save-new-period', handleSaveEvent);
    };
  }, [onSave]);

  // Scroll to element function
  const scrollToSection = (code: string) => {
    setActiveSec(code);
    const element = document.getElementById(`section-${code}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // State to hold editable cell values
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Initialize form mock rows
  useEffect(() => {
    const initial: Record<string, any> = {};

    // 1. Tổ Khai thác
    initial["GRI 302-1_TAB_1"] = [
      { energy: "Nhiên liệu bay (Jet A-1)", value: "2450.00", unit: "Tấn" },
      { energy: "Xăng động cơ (Phương tiện mặt đất)", value: "4.20", unit: "Tấn" },
      { energy: "Dầu Diesel (Phương tiện mặt đất)", value: "12.50", unit: "Tấn" },
      { energy: "Điện năng tiêu thụ (Tòa nhà điều hành)", value: "14520.00", unit: "kWh" },
    ];
    initial["GRI 302-1_TAB_2"] = [
      { co2_source: "Phát thải CO2 từ Jet A1 tiêu thụ", value: "7717.50", unit: "Tấn" },
      { co2_source: "Phát thải CO2 từ phương tiện mặt đất", value: "48.20", unit: "Tấn" },
    ];
    initial["GRI 302-4"] = [
      { measure: "Tối ưu hóa đường bay hàng năm", saved: "45000", target: "50000", unit: "kg" },
      { measure: "Giảm phụ tải buồng lái (Paperless)", saved: "1200", target: "1500", unit: "kg" },
    ];
    initial["GRI 305-1"] = [
      { source: "Jet A-1 tiêu thụ trên chuyến bay", co2: "7717.50", method: "Khảo sát thực tế" },
      { source: "Phương tiện mặt đất (Xăng/Dầu)", co2: "48.20", method: "Khảo sát thực tế" },
    ];
    initial["GRI 305-4"] = [
      { type: "Cường độ phát thải trên RPK (Hành khách-km)", intensity: "75.40", target: "74.00", unit: "gCO2/RPK" },
    ];
    initial["GRI 305-5"] = [
      { measure: "Sử dụng hỗn hợp SAF 2% tại Pháp", reduced: "120.00", target: "125.00" },
      { measure: "Tối ưu hóa lập kế hoạch bay", reduced: "35.50", target: "40.00" },
    ];
    initial["GRI 305-7"] = [
      { gas: "Oxit Nitơ (NOx)", weight: "142.50", method: "Ước tính ICAO" },
      { gas: "Oxit Lưu huỳnh (SOx)", weight: "8.40", method: "Ước tính ICAO" },
    ];

    // 2. Ban ATCL
    initial["Airline E-1"] = [
      { type: "A320-272N", reg: "VN-A513", cert: "01-N/07/2024/GCN-CHK", chapter: "Chapter 4", date: "2024-07-20", noise: "Đạt" },
      { type: "A321-272N", reg: "VN-A515", cert: "02-N/12/2024/GCN-CHK", chapter: "Chapter 14", date: "2024-12-15", noise: "Đạt" },
      { type: "A321-231", reg: "VN-A323", cert: "01-N/04/2011/GCN-CHK", chapter: "Chapter 4", date: "2011-04-15", noise: "Đạt" },
    ];
    initial["9"] = [
      { flightType: "Chuyến bay nội địa Việt Nam", emissions: "35400.00", target: "36000.00" },
    ];
    initial["GRI 403-2"] = [
      { safety: "Số vụ tai nạn lao động phi hành đoàn", actual: "0", target: "0", ltifr: "0.00" },
      { safety: "Số vụ tai nạn lao động khối mặt đất", actual: "1", target: "0", ltifr: "0.15" },
    ];

    // 3. Tổ Kỹ thuật
    initial["4"] = [
      { icao: "LFPG", name: "Charles de Gaulle", start: "2026-03-01", end: "2026-03-31", plan: "50.00", mandated: "2.0%", total: "2500.00", actual: "52.00", jeta1: "2448.00" },
      { icao: "EGLL", name: "London Heathrow", start: "2026-03-01", end: "2026-03-31", plan: "40.00", mandated: "2.0%", total: "2000.00", actual: "41.50", jeta1: "1958.50" },
    ];
    initial["5"] = [
      { airport: "LFPG (Paris)", supplier: "TotalEnergies", batch: "BAT-2026-03A", amount: "52.00", reduction: "85.0%" },
    ];
    initial["13"] = [
      { system: "Liên minh EU ETS", allowance: "12000", purchase: "3000", price: "65.00", cost: "195000" },
      { hệthống: "Vương quốc Anh UK ETS", allowance: "8000", purchase: "2000", price: "70.00", cost: "140000" },
    ];

    // 4. TTBSV
    initial["Airline B-2"] = [
      { tier: "Hội viên Triệu dặm & Bạch Kim", satisfaction: "94.50", target: "95.00", count: "1200" },
      { tier: "Hội viên Vàng & Titan", satisfaction: "88.20", target: "88.00", count: "4500" },
      { tier: "Hội viên Bạc & Phổ thông", satisfaction: "82.10", target: "82.00", count: "15400" },
    ];

    // 5. Ban CĐS
    initial["GRI 418-1"] = [
      { type: "Khiếu nại từ khách hàng về quyền riêng tư", complaints: "0", leaks: "0", solutions: "Không ghi nhận sự cố" },
      { type: "Yêu cầu cung cấp thông tin từ cơ quan quản lý", complaints: "0", leaks: "0", solutions: "Không có" },
    ];

    // 6. Tổ Dịch vụ
    initial["GRI 303-3"] = [
      { source: "Nước ngầm tự khai thác", value: "4.25", target: "4.50" },
      { source: "Nước máy đô thị cung cấp", value: "18.40", target: "19.00" },
    ];
    initial["GRI 303-5"] = [
      { zone: "Tiêu thụ tại văn phòng tổng công ty", value: "12.50", target: "13.00" },
      { zone: "Tiêu thụ tại sân bay & phục vụ mặt đất", value: "8.15", target: "8.50" },
    ];
    initial["Airline B-1"] = [
      { service: "Dịch vụ phòng chờ Thương gia (Lounge)", npsDom: "48.5", npsInt: "52.0" },
      { service: "Dịch vụ suất ăn và đồ uống trên máy bay", npsDom: "46.0", npsInt: "51.5" },
    ];
    initial["GRI 204-1_TAB_1"] = [
      {
        name: "Petrolimex Aviation",
        countryType: "VN",
        contractFrom: "2025-01-01",
        contractTo: "2027-12-31",
        hasSustCommitment: "Có",
        sustEffectiveDate: "2025-06-01",
        sustDescription: "Cam kết cung ứng tối thiểu 5% nhiên liệu bay bền vững (SAF) tại Tân Sơn Nhất và Nội Bài kể từ 2026."
      },
      {
        name: "Shell Aviation International",
        countryType: "Foreign",
        contractFrom: "2024-03-15",
        contractTo: "2027-03-15",
        hasSustCommitment: "Có",
        sustEffectiveDate: "2024-10-01",
        sustDescription: "Hỗ trợ kỹ thuật chứng nhận bền vững ISCC đối với các lô hàng SAF pha trộn cho đội bay VNA."
      },
      {
        name: "Skytanking Holding GmbH",
        countryType: "Foreign",
        contractFrom: "2025-06-01",
        contractTo: "2026-05-31",
        hasSustCommitment: "Không",
        sustEffectiveDate: "",
        sustDescription: ""
      }
    ];
    initial["GRI 204-1_TAB_2"] = [
      { name: "NCS - Suất ăn Nội Bài", address: "Sân bay Nội Bài", type: "Nhà cung cấp Việt Nam", country: "Việt Nam", domain: "Suất ăn hàng không", start: "2026-01-01", end: "2026-12-31" },
      { name: "VACS - Suất ăn Việt Nam", address: "Sân bay Tân Sơn Nhất", type: "Nhà cung cấp Việt Nam", country: "Việt Nam", domain: "Suất ăn hàng không", start: "2026-01-01", end: "2026-12-31" },
    ];
    initial["GRI 406-1"] = [
      { code: "INC-2026-001", start: "2026-03-15", end: "2026-03-20", status: "Đã đóng (Closed)", solution: "Thư xin lỗi và tặng dặm" },
      { code: "INC-2026-002", start: "2026-03-22", end: "", status: "Đang điều tra (In review)", solution: "Đang kiểm chứng dịch vụ" },
    ];
    initial["GRI 416-1"] = [
      { category: "Suất ăn đặc biệt (BMVDAD, BMVHAN...)", standard: "ISO 22000 / HACCP", audited: "100%" },
      { category: "Hóa chất làm sạch bề mặt tàu bay", standard: "QĐ VSTB của VNA", audited: "100%" },
    ];
    initial["GRI 416-2"] = [
      { category: "Sự cố mất an toàn vệ sinh thực phẩm", cases: "0", authority: "Không ghi nhận" },
    ];
    initial["GRI 417-2"] = [
      { category: "Thiếu tem cảnh báo dị ứng thực phẩm", cases: "0", action: "Không ghi nhận" },
    ];

    // 7. Ban TCNL
    initial["Airline D-1"] = [
      { name: "Ngừng việc tự phát tại bộ phận mặt đất", start: "2026-03-12", workers: "0", daysLost: "0", status: "Không xảy ra" },
    ];
    initial["Airline F-2"] = [
      { group: "Khối Khai thác bay (Phi công, Tiếp viên)", overall: "4.25", work: "4.10", training: "4.20", manager: "4.30", income: "4.15" },
      { group: "Khối Kỹ thuật (Kỹ sư bảo dưỡng)", overall: "4.05", work: "3.95", training: "4.00", manager: "4.10", income: "3.90" },
    ];
    initial["GRI 202-1"] = [
      { role: "Phi công Việt Nam khởi điểm", wage: "45000000", minRegion: "4960000", ratio: "9.07" },
      { role: "Tiếp viên cơ hữu khởi điểm", wage: "15000000", minRegion: "4960000", ratio: "3.02" },
      { role: "Lao động mặt đất phổ thông", wage: "7500000", minRegion: "4960000", ratio: "1.51" },
    ];
    initial["GRI 202-2"] = [
      { scope: "Ban quản lý cấp cao tại trụ sở chính", local: "100.0%", foreign: "0.0%" },
      { scope: "Quản lý tại các chi nhánh nước ngoài", local: "45.0%", foreign: "55.0%" },
    ];
    initial["GRI 403-9"] = [
      { cause: "Không có thiết bị an toàn đạt chuẩn", cases: "0", deadCases: "0", victims: "0", deaths: "0", heavyInjures: "0" },
      { cause: "Thiếu phương tiện bảo hộ lao động cá nhân", cases: "0", deadCases: "0", victims: "0", deaths: "0", heavyInjures: "0" },
    ];
    initial["GRI 401-1"] = [
      { metric: "Tổng số lao động ký HĐLĐ cơ hữu", value: "6200", unit: "Người" },
      { metric: "Tỷ lệ tuyển dụng mới trong kỳ", value: "2.5", unit: "%" },
      { metric: "Tỷ lệ thôi việc/nghỉ việc trong kỳ", value: "1.8", unit: "%" },
    ];
    initial["GRI 401-2"] = [
      { metric: "Bảo hiểm sức khỏe cao cấp cho phi hành đoàn", value: "100", unit: "% nhân sự áp dụng" },
      { metric: "Hỗ trợ nhà ở/phòng nghỉ chặng bay đêm", value: "100", unit: "% nhân sự áp dụng" },
    ];

    // 8. Ban KHPT
    initial["GRI 2-9"] = [{ indicator: "Cơ cấu quản trị bền vững", level: "Đầy đủ", notes: "Đã thành lập Ủy ban Phát triển Bền vững" }];
    initial["GRI 2-15"] = [{ indicator: "Quy trình kiểm soát xung đột lợi ích", level: "Đầy đủ", notes: "Có bản cam kết công khai lợi ích thường niên" }];
    initial["GRI 2-23"] = [{ indicator: "Ban hành các cam kết chính sách ESG", level: "Đầy đủ", notes: "Đã công bố Bộ Quy tắc Ứng xử VNA" }];
    initial["GRI 205-2"] = [{ indicator: "Truyền thông phòng chống tham nhũng", level: "Đầy đủ", notes: "100% người lao động tham gia khóa học trực tuyến" }];
    initial["GRI 205-3"] = [{ indicator: "Vụ việc tham nhũng phát sinh", level: "Đầy đủ (Không xảy ra)", notes: "Không ghi nhận vụ việc" }];
    initial["GRI 206-1"] = [{ indicator: "Hành vi phản cạnh tranh, độc quyền", level: "Đầy đủ (Không xảy ra)", notes: "Không phát sinh khiếu kiện" }];
    initial["GRI 415-1"] = [{ indicator: "Tài trợ và đóng góp chính trị", level: "Đầy đủ (Không xảy ra)", notes: "Tuân thủ nghiêm ngặt chính sách độc lập" }];

    // 9. Ban Truyền thông
    initial["Airline F-1"] = [
      { name: "Chiến dịch môi trường 'Hành trình Xanh VNA'", dept: "Tổ Khai thác", date: "2026-03-15", hours: "48", participants: "150", cost: "50000000" },
      { name: "Quyên góp áo ấm & học bổng trẻ em vùng cao", dept: "Tổ Dịch vụ", date: "2026-03-20", hours: "24", participants: "80", cost: "120000000" },
    ];
    initial["GRI 417-3"] = [
      { name: "Sai sót thông tin quảng cáo vé Tết", date: "2026-03-05", fined: "Không", warned: "Không", ruleViolated: "Không", details: "Không phát sinh vi phạm" },
    ];

    setFormData(initial);
  }, []);

  const handleCellChange = (indicator: string, rowIdx: number, field: string, value: string) => {
    const hasTabs = indicator === 'GRI 302-1' || indicator === 'GRI 204-1';
    const dataKey = hasTabs ? `${indicator}_${activeSubTab}` : indicator;
    setFormData(prev => {
      const updated = { ...prev };
      if (updated[dataKey]) {
        const rows = [...updated[dataKey]];
        rows[rowIdx] = { ...rows[rowIdx], [field]: value };

        // Auto-calculate logic if needed
        // For Technical Ops Uplift Form
        if (indicator === '4') {
          const total = parseFloat(rows[rowIdx].total) || 0;
          const actual = parseFloat(rows[rowIdx].actual) || 0;
          rows[rowIdx].jeta1 = (total - actual).toFixed(2);
        }

        updated[dataKey] = rows;
      }
      return updated;
    });
  };

  const [searchText, setSearchText] = useState<string>('');

  const filteredIndicators = React.useMemo(() => {
    return indicatorDetails.filter(ind => {
      const matchQuery = searchText.toLowerCase().trim();
      if (!matchQuery) return true;
      return ind.code.toLowerCase().includes(matchQuery) || ind.name.toLowerCase().includes(matchQuery);
    });
  }, [indicatorDetails, searchText]);

  return (
    <div className="flex gap-6 min-h-[75vh] text-left animate-in fade-in duration-300">

      {/* Sidebar: CHỈ TIÊU ĐƯỢC PHÂN CÔNG */}
      <div className="w-80 bg-white rounded-xl border border-gray-200 p-5 shrink-0 flex flex-col h-[calc(100vh-140px)] sticky top-20 shadow-sm">
        <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wide">CHỈ TIÊU ĐƯỢC PHÂN CÔNG</h3>
        <p className="text-xs text-gray-400 mt-1 mb-3 font-semibold">Chọn chỉ tiêu để nhập liệu</p>

        {/* Search box */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm kiếm mã hoặc tên chỉ tiêu..."
            className="w-full pl-9 pr-4 py-2 border border-gray-350 hover:border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-vna-blue/30 text-xs font-semibold bg-gray-50/20"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {filteredIndicators.length === 0 ? (
            <div className="text-center text-xs text-gray-400 italic py-6">
              Không tìm thấy chỉ tiêu
            </div>
          ) : (
            filteredIndicators.map(ind => {
              const sheetCount = (ind.code === 'GRI 302-1' || ind.code === 'GRI 204-1') ? 2 : 1;
              const isActive = activeSec === ind.code;

              return (
                <button
                  key={ind.code}
                  onClick={() => scrollToSection(ind.code)}
                  className={`w-full p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:border-vna-blue/50 ${isActive
                      ? 'border-vna-blue ring-1 ring-vna-blue/10 bg-blue-50/10'
                      : 'border-gray-200 bg-white hover:bg-gray-50/50'
                    }`}
                >
                  <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase mb-1">{ind.code}</span>
                  <span className="font-bold text-gray-800 text-sm block leading-tight">{ind.name}</span>
                  <span className="text-[10px] text-gray-400 font-semibold mt-2 flex items-center gap-1">
                    <FileSpreadsheet size={12} /> {sheetCount} {sheetCount > 1 ? 'Sheets' : 'Sheet'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[70vh] flex flex-col relative">

        {/* Header toolbar */}
        {indicatorDetails.map(ind => {
          if (ind.code !== activeSec) return null;
          const hasTabs = ind.code === 'GRI 302-1' || ind.code === 'GRI 204-1';
          const dataKey = hasTabs ? `${ind.code}_${activeSubTab}` : ind.code;
          const rows = formData[dataKey] || [];

          return (
            <div key={ind.code} className="flex-1 flex flex-col">

              {/* Header with Title and Save Button */}
              <div className="flex justify-between items-start border-b border-gray-150 pb-5 mb-5 gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={onBack} className="p-2 -ml-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-lg font-black text-vna-blue">{ind.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500 font-bold">Kỳ báo cáo:</span>
                      <select className="border border-gray-300 rounded px-2.5 py-1 text-xs font-bold text-gray-700 bg-white focus:ring-1 focus:ring-vna-blue/20 outline-none">
                        <option>{effectivePeriod}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onBack} className="text-xs py-1.5 h-9 font-bold">Hủy bỏ</Button>
                  {rows.length > 0 && (
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs h-9 font-bold flex items-center gap-1.5">
                      <FileSpreadsheet size={16} className="text-emerald-600" /> Nhập Excel (Import)
                    </Button>
                  )}
                </div>
              </div>

              {/* TAB SELECTOR LỚN (Chỉ hiển thị nếu thỏa mãn điều kiện kpiRules: hasKpi = Yes và nguồn = Nhập thủ công/trống) */}
              {(() => {
                const rule = (kpiRules as Record<string, { hasKpi: string; kpiSource: string }>)[ind.code];
                const showPlanTab = rule && rule.hasKpi.trim().toLowerCase() === 'yes' && (rule.kpiSource.trim() === 'Nhập thủ công' || rule.kpiSource.trim() === '');
                
                if (!showPlanTab) return null;
                
                return (
                  <div className="flex border-b border-gray-200 mb-5 gap-2 animate-in fade-in duration-200">
                    <button
                      type="button"
                      onClick={() => setActiveMainTab('DATA')}
                      className={`px-4 py-2 border-b-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                        activeMainTab === 'DATA'
                          ? 'border-vna-blue text-vna-blue bg-blue-50/10 rounded-t-lg shadow-sm'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Số liệu thực hiện
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMainTab('PLAN')}
                      className={`px-4 py-2 border-b-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                        activeMainTab === 'PLAN'
                          ? 'border-vna-blue text-vna-blue bg-blue-50/10 rounded-t-lg shadow-sm'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Kế hoạch thực hiện
                    </button>
                  </div>
                );
              })()}

              {/* Sub-tabs / Sheets Selectors if any - only display if indicator has more than 1 form/sheet AND we are in DATA tab */}
              {activeMainTab === 'DATA' && ind.code === 'GRI 302-1' && (
                <div className="flex border-b border-gray-200 mb-5 gap-1 animate-in fade-in duration-200">
                  <button
                    onClick={() => setActiveSubTab('TAB_1')}
                    className={`px-4 py-2 border-b-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeSubTab === 'TAB_1'
                        ? 'border-vna-blue text-vna-blue bg-blue-50/10 rounded-t-lg shadow-sm'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Nhiên liệu Jet A1
                  </button>
                  <button
                    onClick={() => setActiveSubTab('TAB_2')}
                    className={`px-4 py-2 border-b-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeSubTab === 'TAB_2'
                        ? 'border-vna-blue text-vna-blue bg-blue-50/10 rounded-t-lg shadow-sm'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Phát thải CO2 (CORSIA)
                  </button>
                </div>
              )}

              {activeMainTab === 'DATA' && ind.code === 'GRI 204-1' && (
                <div className="flex border-b border-gray-200 mb-5 gap-1 animate-in fade-in duration-200">
                  <button
                    onClick={() => setActiveSubTab('TAB_1')}
                    className={`px-4 py-2 border-b-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeSubTab === 'TAB_1'
                        ? 'border-vna-blue text-vna-blue bg-blue-50/10 rounded-t-lg shadow-sm'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Danh sách nhà cung cấp
                  </button>
                  <button
                    onClick={() => setActiveSubTab('TAB_2')}
                    className={`px-4 py-2 border-b-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeSubTab === 'TAB_2'
                        ? 'border-vna-blue text-vna-blue bg-blue-50/10 rounded-t-lg shadow-sm'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Tỷ lệ chi tiêu (Cũ)
                  </button>
                </div>
              )}

              {/* FORM KẾ HOẠCH THỰC HIỆN (Render dưới dạng bảng Excel đồng nhất) */}
              {(() => {
                const rule = (kpiRules as Record<string, { hasKpi: string; kpiSource: string }>)[ind.code];
                const showPlanTab = rule && rule.hasKpi.trim().toLowerCase() === 'yes' && (rule.kpiSource.trim() === 'Nhập thủ công' || rule.kpiSource.trim() === '');
                if (showPlanTab && activeMainTab === 'PLAN') {
                  return (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 flex-1 animate-in fade-in duration-200">
                      <table className="w-full text-left border-collapse text-xs min-w-[800px]">
                        <thead>
                          <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] uppercase tracking-wide text-gray-650 font-bold">
                            <th className="p-3 border border-gray-200 w-12 text-center">Th..</th>
                            <th className="p-3 border border-gray-200 font-semibold text-gray-700 bg-gray-55/20 text-left">Chỉ tiêu kế hoạch / mục tiêu</th>
                            <th className="p-3 border border-gray-200 font-semibold text-gray-700 bg-gray-55/20 text-center w-64">Giá trị Kế hoạch (Target)</th>
                            <th className="p-3 border border-gray-200 font-semibold text-gray-700 bg-gray-55/20 text-center w-64">Giá trị Mục tiêu (Goal)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-blue-50/20 transition-colors">
                            <td className="p-3 border border-gray-200 text-center font-bold text-gray-500 bg-gray-50/10 w-16">
                              Dòng 1
                            </td>
                            <td className="p-3 border border-gray-200 font-semibold text-gray-800">
                              Kế hoạch và Mục tiêu (KPI) cần đạt của chỉ tiêu
                            </td>
                            <td className="p-2 border border-gray-200 text-center">
                              <input
                                type="number"
                                placeholder="Nhập KH..."
                                value={formData[`${ind.code}_PLAN_TARGET`] || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, [`${ind.code}_PLAN_TARGET`]: e.target.value }))}
                                className="w-full text-xs font-semibold px-2 py-1.5 rounded outline-none border border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-vna-blue/30 bg-white text-gray-800 text-center"
                              />
                            </td>
                            <td className="p-2 border border-gray-200 text-center">
                              <input
                                type="number"
                                placeholder="Nhập mục tiêu..."
                                value={formData[`${ind.code}_PLAN_GOAL`] || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, [`${ind.code}_PLAN_GOAL`]: e.target.value }))}
                                className="w-full text-xs font-semibold px-2 py-1.5 rounded outline-none border border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-vna-blue/30 bg-white text-gray-800 text-center"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Table rendering or Text Multiple Line rendering (Ẩn nếu đang ở tab PLAN) */}
              {(() => {
                const rule = (kpiRules as Record<string, { hasKpi: string; kpiSource: string }>)[ind.code];
                const showPlanTab = rule && rule.hasKpi.trim().toLowerCase() === 'yes' && (rule.kpiSource.trim() === 'Nhập thủ công' || rule.kpiSource.trim() === '');
                const isHidden = showPlanTab && activeMainTab === 'PLAN';
                return (
                  <div className={`overflow-x-auto rounded-lg border border-gray-200 flex-1 ${isHidden ? 'hidden' : ''}`}>
                {!Array.isArray(rows) || rows.length === 0 ? (
                  <div className="p-5 flex flex-col gap-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Nội dung báo cáo định tính (Text Multiple Line)</label>
                    <textarea
                      rows={12}
                      value={String(formData[ind.code] || '')}
                      onChange={(e) => setFormData(prev => ({ ...prev, [ind.code]: e.target.value }))}
                      placeholder={`Nhập thông tin thuyết minh chi tiết hoặc số liệu báo cáo định tính cho chỉ tiêu ${ind.code}...`}
                      className="w-full text-sm font-semibold p-4 rounded outline-none border border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-vna-blue/30 bg-white text-gray-800"
                    />
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] uppercase tracking-wide text-gray-655 font-bold">
                        <th className="p-3 border border-gray-200 w-12 text-center">Th..</th>
                        {Object.keys(rows[0]).map(key => {
                          let colLabel = key;
                          if (key === 'name') {
                            colLabel = (ind.code === 'GRI 204-1') ? 'Tên nhà cung cấp' : 'Tên chỉ tiêu / Đối tượng';
                          }
                          else if (key === 'energy') colLabel = 'Loại năng lượng / Tiêu thụ';
                          else if (key === 'value') colLabel = 'Lượng thực tế';
                          else if (key === 'unit') colLabel = 'Đơn vị';
                          else if (key === 'co2_source') colLabel = 'Nguồn phát thải CO2';
                          else if (key === 'countryType') colLabel = 'Quốc gia';
                          else if (key === 'contractFrom') colLabel = 'Hợp đồng từ';
                          else if (key === 'contractTo') colLabel = 'Hợp đồng đến';
                          else if (key === 'hasSustCommitment') colLabel = 'Cam kết PTBV?';
                          else if (key === 'sustEffectiveDate') colLabel = 'Ngày cam kết hiệu lực';
                          else if (key === 'sustDescription') colLabel = 'Mô tả cam kết phát triển bền vững';
                          else if (key === 'measure') colLabel = 'Chỉ tiêu tiết kiệm / Giảm thiểu';
                          else if (key === 'saved') colLabel = 'Thực tế tiết kiệm (kg)';
                          else if (key === 'target') colLabel = 'Chỉ tiêu mục tiêu';
                          else if (key === 'source') colLabel = 'Nguồn phát thải / Cấp nước';
                          else if (key === 'co2') colLabel = 'Phát thải CO2 (Tấn)';
                          else if (key === 'method') colLabel = 'Phương pháp tính / Đo';
                          else if (key === 'type') colLabel = 'Kiểu loại / Loại sự cố';
                          else if (key === 'intensity') colLabel = 'Cường độ thực tế';
                          else if (key === 'reduced') colLabel = 'Lượng giảm thực tế (tCO2e)';
                          else if (key === 'gas') colLabel = 'Khí thải phát sinh';
                          else if (key === 'weight') colLabel = 'Khối lượng (Tấn)';
                          else if (key === 'reg') colLabel = 'Số đăng ký TB';
                          else if (key === 'cert') colLabel = 'Chứng chỉ tiếng ồn';
                          else if (key === 'chapter') colLabel = 'Hệ số CORSIA';
                          else if (key === 'date') colLabel = 'Ngày cấp/Ngày xảy ra';
                          else if (key === 'noise') colLabel = 'Tiếng ồn';
                          else if (key === 'flightType') colLabel = 'Phạm vi khai thác';
                          else if (key === 'emissions') colLabel = 'Khối lượng phát thải (tCO2)';
                          else if (key === 'safety') colLabel = 'Chỉ số an toàn lao động';
                          else if (key === 'actual') colLabel = 'Lượng thực tế / Số vụ';
                          else if (key === 'ltifr') colLabel = 'Tỷ lệ tần suất LTIFR';
                          else if (key === 'icao') colLabel = 'Mã ICAO Sân bay';
                          else if (key === 'start') colLabel = 'Ngày bắt đầu';
                          else if (key === 'end') colLabel = 'Ngày kết thúc';
                          else if (key === 'plan') colLabel = 'SAF kế hoạch (Tấn)';
                          else if (key === 'mandated') colLabel = 'Tỷ lệ SAF yêu cầu (%)';
                          else if (key === 'total') colLabel = 'Tổng nhiên liệu nạp (Tấn)';
                          else if (key === 'jeta1') colLabel = 'Jet A-1 thực tế (Tấn)';
                          else if (key === 'supplier') colLabel = 'Nhà cung cấp';
                          else if (key === 'batch') colLabel = 'Số lô (Batch)';
                          else if (key === 'amount') colLabel = 'SAF thực nạp (Tấn)';
                          else if (key === 'reduction') colLabel = 'Tỷ lệ giảm phát thải';
                          else if (key === 'system') colLabel = 'Hệ thống ETS';
                          else if (key === 'allowance') colLabel = 'Hạn ngạch cấp miễn phí (tCO2)';
                          else if (key === 'purchase') colLabel = 'Lượng tín chỉ mua (tCO2)';
                          else if (key === 'price') colLabel = 'Đơn giá mua (USD)';
                          else if (key === 'cost') colLabel = 'Tổng chi phí (USD)';
                          else if (key === 'tier') colLabel = 'Phân khúc khách hàng';
                          else if (key === 'satisfaction') colLabel = 'Điểm thực tế (NPS / Điểm số)';
                          else if (key === 'count') colLabel = 'Tổng số lượng phản hồi';
                          else if (key === 'complaints') colLabel = 'Số vụ khiếu nại';
                          else if (key === 'leaks') colLabel = 'Số vụ mất dữ liệu';
                          else if (key === 'solutions') colLabel = 'Biện pháp khắc phục';
                          else if (key === 'zone') colLabel = 'Khu vực / Mục đích tiêu thụ';
                          else if (key === 'npsDom') colLabel = 'NPS nội địa';
                          else if (key === 'npsInt') colLabel = 'NPS quốc tế';
                          else if (key === 'address') colLabel = 'Địa chỉ / Sân bay';
                          else if (key === 'country') colLabel = 'Quốc gia';
                          else if (key === 'domain') colLabel = 'Lĩnh vực hợp đồng';
                          else if (key === 'code') colLabel = 'Mã sự cố';
                          else if (key === 'status') colLabel = 'Trạng thái xử lý';
                          else if (key === 'solution') colLabel = 'Biện pháp giải quyết';
                          else if (key === 'category') colLabel = 'Danh mục / Suất ăn';
                          else if (key === 'standard') colLabel = 'Tiêu chuẩn chất lượng';
                          else if (key === 'audited') colLabel = 'Tỷ lệ đã đánh giá (%)';
                          else if (key === 'cases') colLabel = 'Số vụ vi phạm';
                          else if (key === 'authority') colLabel = 'Cơ quan xử lý';
                          else if (key === 'action') colLabel = 'Hành động khắc phục';
                          else if (key === 'group') colLabel = 'Khối nhân viên / Nhóm';
                          else if (key === 'overall') colLabel = 'Hài lòng tổng thể';
                          else if (key === 'work') colLabel = 'Điều kiện làm việc';
                          else if (key === 'training') colLabel = 'Đào tạo & Thăng tiến';
                          else if (key === 'manager') colLabel = 'Cấp trên trực tiếp';
                          else if (key === 'income') colLabel = 'Thu nhập';
                          else if (key === 'role') colLabel = 'Nhóm chức danh';
                          else if (key === 'wage') colLabel = 'Mức lương khởi điểm (VNĐ)';
                          else if (key === 'minRegion') colLabel = 'Mức tối thiểu vùng (VNĐ)';
                          else if (key === 'ratio') colLabel = 'Tỷ lệ so sánh';
                          else if (key === 'scope') colLabel = 'Phạm vi quản lý';
                          else if (key === 'local') colLabel = 'Tỷ lệ Lãnh đạo bản địa (%)';
                          else if (key === 'foreign') colLabel = 'Tỷ lệ Lãnh đạo nước ngoài (%)';
                          else if (key === 'cause') colLabel = 'Nguyên nhân xảy ra';
                          else if (key === 'deadCases') colLabel = 'Số vụ có tử vong';
                          else if (key === 'victims') colLabel = 'Số người bị nạn';
                          else if (key === 'deaths') colLabel = 'Số người tử vong';
                          else if (key === 'heavyInjures') colLabel = 'Số người chấn thương nặng';
                          else if (key === 'metric') colLabel = 'Chỉ số nhân sự';
                          else if (key === 'indicator') colLabel = 'Mục quản trị ESG';
                          else if (key === 'level') colLabel = 'Mức độ tuân thủ';
                          else if (key === 'notes') colLabel = 'Ghi chú';
                          else if (key === 'dept') colLabel = 'Đơn vị phụ trách';
                          else if (key === 'hours') colLabel = 'Tổng số giờ';
                          else if (key === 'participants') colLabel = 'Số người tham gia';
                          else if (key === 'fined') colLabel = 'Bị xử phạt';
                          else if (key === 'warned') colLabel = 'Bị cảnh cáo';
                          else if (key === 'ruleViolated') colLabel = 'Vi phạm quy tắc';
                          else if (key === 'details') colLabel = 'Chi tiết xử lý';

                          return (
                            <th key={key} className="p-3 border border-gray-200 font-semibold text-gray-700 bg-gray-55/20">
                              {colLabel}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rows.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-blue-50/20 transition-colors">
                          <td className="p-3 border border-gray-200 text-center font-bold text-gray-500 bg-gray-50/10 w-16">
                            Dòng {rIdx + 1}
                          </td>
                          {Object.entries(row).map(([field, val]) => {
                            const isReadOnly = field === 'jeta1' || field === 'ratio' || field === 'cost';
                            let displayValue = String(val);

                            if (ind.code === 'GRI 302-1' && activeSubTab === 'TAB_1') {
                              if (field === 'value') {
                                if (rIdx === 0) displayValue = '47400';
                                else if (rIdx === 1) displayValue = '44872';
                              }
                            }

                            // Custom inputs for GRI 204-1 TAB_1
                            if (ind.code === 'GRI 204-1' && activeSubTab === 'TAB_1') {
                              if (field === 'countryType') {
                                return (
                                  <td key={field} className="p-2 border border-gray-200 min-w-[150px]">
                                    <select
                                      value={displayValue}
                                      onChange={(e) => handleCellChange(ind.code, rIdx, field, e.target.value)}
                                      className="w-full text-xs font-bold px-2 py-1.5 rounded outline-none border border-gray-200 bg-white text-gray-800 focus:ring-1 focus:ring-vna-blue/30"
                                    >
                                      <option value="VN">NCC Việt Nam</option>
                                      <option value="Foreign">NCC nước ngoài</option>
                                    </select>
                                  </td>
                                );
                              }
                              if (field === 'hasSustCommitment') {
                                return (
                                  <td key={field} className="p-2 border border-gray-200 min-w-[110px]">
                                    <select
                                      value={displayValue}
                                      onChange={(e) => handleCellChange(ind.code, rIdx, field, e.target.value)}
                                      className="w-full text-xs font-bold px-2 py-1.5 rounded outline-none border border-gray-200 bg-white text-gray-800 focus:ring-1 focus:ring-vna-blue/30"
                                    >
                                      <option value="Có">Có</option>
                                      <option value="Không">Không</option>
                                    </select>
                                  </td>
                                );
                              }
                              if (field === 'contractFrom' || field === 'contractTo' || field === 'sustEffectiveDate') {
                                return (
                                  <td key={field} className="p-2 border border-gray-200 min-w-[145px]">
                                    <input
                                      type="date"
                                      value={displayValue}
                                      onChange={(e) => handleCellChange(ind.code, rIdx, field, e.target.value)}
                                      className="w-full text-xs font-semibold px-2 py-1.5 rounded outline-none border border-gray-200 bg-white text-gray-800 focus:ring-1 focus:ring-vna-blue/30"
                                    />
                                  </td>
                                );
                              }
                              if (field === 'sustDescription') {
                                return (
                                  <td key={field} className="p-2 border border-gray-200 min-w-[280px]">
                                    <textarea
                                      rows={2}
                                      value={displayValue}
                                      onChange={(e) => handleCellChange(ind.code, rIdx, field, e.target.value)}
                                      className="w-full text-xs font-semibold px-2 py-1.5 rounded outline-none border border-gray-200 bg-white text-gray-800 focus:ring-1 focus:ring-vna-blue/30"
                                      placeholder="Nhập chi tiết các điều khoản cam kết..."
                                    />
                                  </td>
                                );
                              }
                            }

                            return (
                              <td key={field} className="p-2 border border-gray-200">
                                <input
                                  type="text"
                                  value={displayValue}
                                  readOnly={isReadOnly}
                                  onChange={(e) => handleCellChange(ind.code, rIdx, field, e.target.value)}
                                  className={`w-full text-xs font-semibold px-2 py-1.5 rounded outline-none border focus:ring-1 focus:ring-vna-blue/30 ${isReadOnly
                                      ? 'bg-gray-100 text-gray-500 border-transparent cursor-not-allowed'
                                      : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                                    }`}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })()}
        </div>
          );
        })}
      </div>
    </div>
  );
};
