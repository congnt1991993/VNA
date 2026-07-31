import React, { useMemo } from 'react';
import { Clock, User, Calendar, CheckCircle, AlertCircle, Lock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface IndicatorHistoryTableProps {
  indicatorCode: string;
  unit: string;
  department: string;
  onViewForm?: (period: string) => void;
}

interface HistoryEntry {
  period: string;
  actual: string | number;      // Giá trị nhập liệu của kỳ này
  cumulative: string | number;  // Giá trị đã thực hiện lũy kế
  cumulativeNum: number;        // Số thực của lũy kế để tính tỷ lệ
  target: string | number;
  rate: number;                 // Tỷ lệ hoàn thành dựa trên lũy kế
  recorder: string;
  updatedAt: string;
  status: 'Active' | 'Pending' | 'Rejected' | 'Locked';
}

function getDeterministicValue(code: string, index: number, year: number, offset = 0): number {
  let hash = 0;
  const key = `${code}-${year}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const val = Math.abs(hash + index * 41 + offset * 97) % 100;
  return val;
}

const QUALITATIVE_CODES = [
  'GRI 2-9', 'GRI 2-10', 'GRI 2-11', 'GRI 2-12', 'GRI 2-13', 'GRI 2-14',
  'GRI 2-15', 'GRI 2-23', 'GRI 2-26', 'GRI 2-29', 'GRI 3-3',
  'GRI 201-4', 'GRI 205-2', 'GRI 205-3', 'GRI 206-1', 'GRI 415-1'
];

const DEPT_RECORDERS: Record<string, string> = {
  'Ban Kỹ thuật': 'Lê Minh Tuấn',
  'Trung tâm Điều hành khai thác': 'Lê Minh Tuấn',
  'Ban Khai thác bay': 'Lê Minh Tuấn',
  'Ban An toàn chất lượng': 'Trần Thị Hà',
  'Ban Dịch vụ hành khách': 'Trần Thanh Sơn',
  'Trung tâm Bông sen vàng': 'Nguyễn Hoàng Anh',
  'Ban Tổ chức nhân lực': 'Phạm Thuỳ Linh',
  'Ban Công nghệ thông tin': 'Lê Thị Thuỷ',
  'Ban Kế hoạch phát triển': 'Nguyễn Minh Hải',
  'Ban Truyền thông': 'Vũ Quốc Khánh'
};

const MOCK_QUAL_TEXTS: Record<string, string> = {
  'GRI 2-9': 'Cơ cấu quản trị của Vietnam Airlines gồm ĐHĐCĐ, HĐQT, Ban Kiểm soát và TGĐ cùng bộ máy điều hành...',
  'GRI 2-10': 'Thành viên HĐQT Vietnam Airlines do ĐHĐCĐ bầu theo phương thức bầu dồn phiếu...',
  'GRI 2-11': 'Chủ tịch HĐQT Vietnam Airlines là ông Đặng Ngọc Hòa. Chủ tịch HĐQT không kiêm nhiệm...',
  'GRI 2-12': 'HĐQT là cơ quan quản lý cao nhất của Vietnam Airlines giữ vai trò định hướng...',
  'GRI 2-13': 'HĐQT phân cấp trách nhiệm quản lý các tác động cho Tổng giám đốc và bộ máy điều hành...',
  'GRI 2-14': 'HĐQT chịu trách nhiệm rà soát và phê duyệt các thông tin công bố trong Báo cáo thường niên...',
  'GRI 2-15': 'Điều lệ TCT quy định rõ trách nhiệm tránh xung đột quyền lợi. Cổ đông chi phối là Nhà nước...'
};

export const IndicatorHistoryTable: React.FC<IndicatorHistoryTableProps> = ({
  indicatorCode,
  unit = '',
  department = '',
  onViewForm
}) => {
  const isQualitative = QUALITATIVE_CODES.includes(indicatorCode);

  // Đọc chỉ tiêu Kế hoạch (KPI) từ Quản lý KPI chỉ tiêu lưu trữ trong localStorage
  const assignedKpiTarget = useMemo(() => {
    try {
      const kpisStr = localStorage.getItem('vna_esg_kpis');
      if (kpisStr) {
        const kpis = JSON.parse(kpisStr);
        const matchKpi = kpis.find((k: any) => k.indicatorCode === indicatorCode);
        if (matchKpi && matchKpi.plan !== undefined && matchKpi.plan !== '') {
          return Number(matchKpi.plan);
        }
      }
    } catch (e) {
      console.error("Lỗi khi đọc danh sách KPIs từ localStorage", e);
    }
    return null;
  }, [indicatorCode]);

  const historyData = useMemo(() => {
    // Danh sách tạm chưa có lũy kế, sẽ tính sau khi đã tổng hợp xong
    const rawList: Omit<HistoryEntry, 'cumulative' | 'cumulativeNum' | 'rate'>[] & { actualNum: number; targetVal: number }[] = [];
    const yearNum = 2026;

    // 1. Sinh dữ liệu giả lập cho Tháng 01 - Tháng 05/2026
    const months = ['Tháng 01/2026', 'Tháng 02/2026', 'Tháng 03/2026', 'Tháng 04/2026', 'Tháng 05/2026'];
    months.forEach((m, i) => {
      const seed = getDeterministicValue(indicatorCode, i + 1, yearNum);
      const recorder = DEPT_RECORDERS[department] || 'Nguyễn Văn A';

      if (isQualitative) {
        const valText = MOCK_QUAL_TEXTS[indicatorCode] || `Đã hoàn thiện báo cáo thuyết minh theo hướng dẫn tiêu chuẩn GRI đối với chỉ tiêu ${indicatorCode}...`;
        rawList.push({
          period: m,
          actual: valText,
          actualNum: 0,
          target: '—',
          targetVal: 0,
          recorder,
          updatedAt: `15/${String(i + 1).padStart(2, '0')}/2026 09:30`,
          status: 'Active'
        });
      } else {
        let targetVal: number, actualNum: number;
        if (indicatorCode === 'GRI 418-1') {
          // Chỉ tiêu số sự cố: mục tiêu = 0, thực tế rải rác
          actualNum = (i === 3) ? 1 : 0;
          targetVal = 0;
        } else {
          // Mục tiêu KPI năm: ưu tiên từ Quản lý KPI, nếu không có thì sinh giá trị
          // năm hợp lý (1.000 - 5.000 đơn vị tuỳ chỉ tiêu)
          let hashBase = 0;
          for (let c = 0; c < indicatorCode.length; c++) {
            hashBase = (hashBase << 5) - hashBase + indicatorCode.charCodeAt(c);
            hashBase |= 0;
          }
          const annualTarget = assignedKpiTarget !== null
            ? assignedKpiTarget
            : 1000 + (Math.abs(hashBase) % 4001); // 1.000 – 5.000

          targetVal = annualTarget;

          // Mỗi tháng nhập khoảng 1/12 mục tiêu năm ± 20% biến động tự nhiên
          const baseMonthly = annualTarget / 12;
          // seed cho variance trong khoảng [-20%, +20%]
          const variancePct = ((seed % 41) - 20) / 100;
          actualNum = Math.max(0, Math.round(baseMonthly * (1 + variancePct) * 10) / 10);
        }

        rawList.push({
          period: m,
          actual: indicatorCode === 'GRI 418-1' ? actualNum : actualNum.toFixed(1),
          actualNum,
          target: indicatorCode === 'GRI 418-1' ? targetVal : targetVal.toFixed(1),
          targetVal,
          recorder,
          updatedAt: `15/${String(i + 1).padStart(2, '0')}/2026 09:30`,
          status: 'Active'
        });
      }
    });

    // 2. Tải và ghi đè dữ liệu thực tế từ vna_all_submissions trong LocalStorage
    try {
      const savedSubmissions = localStorage.getItem('vna_all_submissions');
      if (savedSubmissions) {
        const subs = JSON.parse(savedSubmissions);
        if (Array.isArray(subs)) {
          subs.forEach((sub: any) => {
            if (!sub) return;
            const hasData = sub.data && (
              sub.data[indicatorCode] !== undefined ||
              sub.data[indicatorCode + '_VI'] !== undefined
            );

            if (hasData) {
              const rawVal = sub.data[indicatorCode + '_VI'] || sub.data[indicatorCode];
              let actualStr = '';
              let actualNum = 0;

              if (isQualitative) {
                actualStr = typeof rawVal === 'string' ? rawVal : 'Đã nhập báo cáo thuyết minh';
              } else {
                if (Array.isArray(rawVal)) {
                  const sum = rawVal.reduce((acc: number, row: any) => acc + (Number(row.value) || Number(row.actual) || 0), 0);
                  actualStr = sum > 0 ? sum.toFixed(1) : `${rawVal.length} bản ghi`;
                  actualNum = sum;
                } else if (typeof rawVal === 'object' && rawVal !== null) {
                  actualStr = 'Dữ liệu cấu trúc';
                } else {
                  actualStr = String(rawVal);
                  actualNum = Number(rawVal) || 0;
                }
              }

              const targetVal = assignedKpiTarget !== null
                ? assignedKpiTarget
                : (sub.data && sub.data[`${indicatorCode}_PLAN_TARGET`] !== undefined ? Number(sub.data[`${indicatorCode}_PLAN_TARGET`]) : 0);

              const newRawEntry = {
                period: sub.period || 'Kỳ hiện tại',
                actual: actualStr,
                actualNum,
                target: isQualitative ? '—' : (targetVal > 0 ? targetVal.toFixed(1) : '—'),
                targetVal,
                recorder: sub.updatedBy || DEPT_RECORDERS[department] || 'Chuyên viên VNA',
                updatedAt: sub.lastUpdated || 'Vừa xong',
                status: (sub.status || 'Pending') as HistoryEntry['status']
              };

              const duplicateIdx = rawList.findIndex(e => e.period === newRawEntry.period);
              if (duplicateIdx > -1) {
                rawList[duplicateIdx] = newRawEntry;
              } else {
                rawList.push(newRawEntry);
              }
            }
          });
        }
      }
    } catch (e) {
      console.error("Lỗi khi đọc vna_all_submissions", e);
    }

    // 3. Tính lũy kế (cumulative) theo thứ tự thời gian (từ cũ → mới)
    //    rawList hiện theo thứ tự cũ → mới, ta tính lũy kế rồi mới đảo ngược
    let cumulativeSum = 0;
    const list: HistoryEntry[] = rawList.map((raw) => {
      const num = raw.actualNum || 0;
      cumulativeSum += num;

      const targetValNum = typeof raw.targetVal === 'number' ? raw.targetVal : 0;
      const rateFromCumulative = targetValNum > 0
        ? Math.min(100, Math.round((cumulativeSum / targetValNum) * 100))
        : 100;

      return {
        period: raw.period,
        actual: raw.actual,
        cumulative: isQualitative ? '—' : (cumulativeSum > 0 ? cumulativeSum.toFixed(1) : '0'),
        cumulativeNum: cumulativeSum,
        target: raw.target,
        rate: rateFromCumulative,
        recorder: raw.recorder,
        updatedAt: raw.updatedAt,
        status: raw.status
      };
    });

    // Đảo ngược để kỳ mới nhất lên đầu
    return list.reverse();
  }, [indicatorCode, department, isQualitative, assignedKpiTarget]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/30">
            <CheckCircle size={12} className="text-emerald-600" /> Đã phê duyệt
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/30 animate-pulse">
            <Clock size={12} className="text-amber-600" /> Chờ phê duyệt
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-650 border border-red-200/30">
            <AlertCircle size={12} className="text-red-500" /> Từ chối duyệt
          </span>
        );
      case 'Locked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-750 border border-blue-200/30">
            <Lock size={12} className="text-blue-600" /> Đã khóa sổ
          </span>
        );
      default:
        return null;
    }
  };

  const getRateBadge = (rate: number, target: string | number, cumulative: string | number) => {
    if (target === '—' || target === 0 || indicatorCode === 'GRI 418-1') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">
          <Minus size={12} /> Đạt tiêu chuẩn
        </span>
      );
    }
    const isSuccess = rate >= 100;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
        isSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
      }`}>
        {isSuccess ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {rate}%
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6 text-left">
      <div className="bg-gradient-to-r from-gray-50 to-slate-50/50 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h4 className="text-xs font-black text-vna-blue uppercase tracking-wider">
            Lịch sử nhập liệu
          </h4>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
            Dòng thời gian các lần nhập số liệu thuyết minh/thực hiện của chỉ tiêu {indicatorCode}
          </p>
        </div>
        <span className="bg-blue-50 text-vna-blue text-[10px] font-black px-2.5 py-1 rounded-lg border border-blue-150/40 uppercase">
          {historyData.length} Kỳ nhập liệu
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[900px]">
          <thead>
            <tr className="bg-gray-50/60 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="p-3.5 border-b border-gray-200 text-center w-12">STT</th>
              <th className="p-3.5 border-b border-gray-200 w-36">Kỳ báo cáo</th>
              {isQualitative ? (
                <th className="p-3.5 border-b border-gray-200">Nội dung thuyết minh (Tóm tắt)</th>
              ) : (
                <>
                  <th className="p-3.5 border-b border-gray-200 text-center w-40">
                    Giá trị nhập liệu
                  </th>
                  <th className="p-3.5 border-b border-gray-200 text-center w-44 bg-blue-50/60">
                    <span className="text-vna-blue">Giá trị đã thực hiện</span>
                    <div className="text-[9px] font-medium text-blue-400 normal-case tracking-normal mt-0.5">(Lũy kế tất cả kỳ)</div>
                  </th>
                  <th className="p-3.5 border-b border-gray-200 text-center w-40">Mục tiêu (KPI)</th>
                  <th className="p-3.5 border-b border-gray-200 text-center w-32">Hoàn thành KPI</th>
                </>
              )}
              <th className="p-3.5 border-b border-gray-200 w-44">Người nhập liệu</th>
              <th className="p-3.5 border-b border-gray-200 w-44">Thời gian cập nhật</th>
              {isQualitative && onViewForm && (
                <th className="p-3.5 border-b border-gray-200 text-center w-28">Thao tác</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150">
            {historyData.map((entry, index) => (
              <tr key={entry.period} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-3.5 text-center font-bold text-gray-400">{index + 1}</td>
                <td className="p-3.5 font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" />
                  {entry.period}
                </td>

                {isQualitative ? (
                  <td className="p-3.5 text-gray-600 font-semibold truncate max-w-[320px]" title={String(entry.actual)}>
                    {entry.actual}
                  </td>
                ) : (
                  <>
                    {/* Giá trị nhập liệu: số user nhập cho kỳ này */}
                    <td className="p-3.5 text-center font-semibold text-slate-700">
                      {entry.actual} {entry.actual !== '—' ? unit : ''}
                    </td>
                    {/* Giá trị đã thực hiện: lũy kế từ đầu tới kỳ này */}
                    <td className="p-3.5 text-center font-extrabold text-vna-blue bg-blue-50/40">
                      {entry.cumulative !== '—' ? `${entry.cumulative} ${unit}` : '—'}
                    </td>
                    {/* Mục tiêu KPI */}
                    <td className="p-3.5 text-center font-semibold text-gray-500">
                      {entry.target === '—' ? '—' : `${entry.target} ${unit}`}
                    </td>
                    {/* Hoàn thành KPI: so sánh lũy kế với mục tiêu */}
                    <td className="p-3.5 text-center">
                      {getRateBadge(entry.rate, entry.target, entry.cumulative)}
                    </td>
                  </>
                )}

                <td className="p-3.5 font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <User size={13} className="text-slate-400" />
                  {entry.recorder}
                </td>
                <td className="p-3.5 text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-gray-400" />
                    {entry.updatedAt}
                  </div>
                </td>
                {isQualitative && onViewForm && (
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <button
                      onClick={() => onViewForm(entry.period)}
                      className="px-3 py-1.5 text-[11px] font-black text-white bg-vna-blue hover:bg-[#00556e] rounded shadow-md transition-all cursor-pointer uppercase tracking-wider"
                    >
                      Xem form
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
