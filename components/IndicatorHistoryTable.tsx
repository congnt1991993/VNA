import React, { useMemo } from 'react';
import { Clock, User, Calendar } from 'lucide-react';

interface IndicatorHistoryTableProps {
  indicatorCode: string;
  unit: string;
  department: string;
  onViewForm?: (period: string) => void;
}

interface HistoryEntry {
  id: string;
  period: string;
  creator: string;
  editor: string;
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

const matchDepartment = (unit1: string, unit2: string) => {
  const u1 = unit1.toLowerCase();
  const u2 = unit2.toLowerCase();
  if (u1 === u2) return true;
  if (u1.includes(u2) || u2.includes(u1)) return true;
  if (u1.includes('atcl') && u2.includes('atcl')) return true;
  if (u1.includes('qlvt') && u2.includes('qlvt')) return true;
  if (u1.includes('vật tư') && u2.includes('vật tư')) return true;
  if (u1.includes('khai thác') && u2.includes('khai thác')) return true;
  if (u1.includes('ttđhkt') && u2.includes('ttđhkt')) return true;
  if (u1.includes('bông sen vàng') && u2.includes('bông sen vàng')) return true;
  if (u1.includes('bsv') && u2.includes('bsv')) return true;
  if (u1.includes('nhân lực') && u2.includes('nhân lực')) return true;
  if (u1.includes('tcnl') && u2.includes('tcnl')) return true;
  if (u1.includes('kế hoạch') && u2.includes('kế hoạch')) return true;
  if (u1.includes('khpt') && u2.includes('khpt')) return true;
  if (u1.includes('truyền thông') && u2.includes('truyền thông')) return true;
  if (u1.includes('dịch vụ') && u2.includes('dịch vụ')) return true;
  if (u1.includes('công nghệ') && u2.includes('công nghệ')) return true;
  if (u1.includes('cđs') && u2.includes('cđs')) return true;
  return false;
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
    const list: HistoryEntry[] = [];
    const yearNum = 2026;

    try {
      const savedSubmissions = localStorage.getItem('vna_all_submissions');
      let subs = savedSubmissions ? JSON.parse(savedSubmissions) : [];

      if (subs.length === 0) {
        const defaultPeriods = ['Tháng 05/2026', 'Tháng 04/2026', 'Tháng 03/2026', 'Tháng 02/2026', 'Tháng 01/2026'];
        subs = defaultPeriods.map((p, index) => {
          const reportId = `${department.includes('QLVT') ? 'QLVT' : department.includes('ATCL') ? 'ATCL' : department.includes('Khai thác') ? 'KT' : 'ESG'}-${yearNum}-${5 - index}`;
          return {
            id: reportId,
            unit: department,
            period: p,
            status: index === 0 ? 'Pending' : 'Active',
            lastUpdated: `15/${String(5 - index).padStart(2, '0')}/2026 09:30`,
            updatedBy: DEPT_RECORDERS[department] || 'Chuyên viên VNA',
            data: {
              id: reportId,
              creator: DEPT_RECORDERS[department] || 'Chuyên viên VNA',
              editor: index === 0 ? '—' : 'Trần Thị Hà',
              editTime: `15/${String(5 - index).padStart(2, '0')}/2026 09:30`
            }
          };
        });
        localStorage.setItem('vna_all_submissions', JSON.stringify(subs));
      }

      if (Array.isArray(subs)) {
        const deptSubs = subs.filter((sub: any) => sub && matchDepartment(sub.unit, department));

        deptSubs.forEach((sub: any) => {
          const reportId = sub.data?.id || sub.id || `${department.includes('QLVT') ? 'QLVT' : 'ESG'}-${yearNum}-01`;
          const creator = sub.data?.creator || sub.updatedBy || DEPT_RECORDERS[department] || 'Chuyên viên VNA';
          const editor = sub.data?.editor || (sub.status === 'Active' ? 'Trần Thị Hà' : '—');
          const actionTime = sub.data?.editTime || sub.lastUpdated || '15/05/2026 09:30';

          list.push({
            id: reportId,
            period: sub.period || 'Kỳ hiện tại',
            creator: creator,
            editor: editor,
            updatedAt: actionTime,
            status: (sub.status || 'Active') as HistoryEntry['status']
          });
        });
      }
    } catch (e) {
      console.error("Lỗi khi đọc vna_all_submissions", e);
    }

    list.sort((a, b) => {
      const parsePeriod = (p: string) => {
        const m = p.match(/Tháng (\d+)\/(\d+)/);
        if (m) return Number(m[2]) * 12 + Number(m[1]);
        const y = p.match(/Năm (\d+)/);
        if (y) return Number(y[1]) * 12;
        return 0;
      };
      return parsePeriod(b.period) - parsePeriod(a.period);
    });

    return list;
  }, [indicatorCode, department]);

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
        <table className="w-full text-left border-collapse text-xs min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/60 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="p-3.5 border-b border-gray-200 text-center w-12">STT</th>
              <th className="p-3.5 border-b border-gray-200 w-44">Kỳ báo cáo</th>
              <th className="p-3.5 border-b border-gray-200 w-44">Thời gian báo cáo</th>
              <th className="p-3.5 border-b border-gray-200 w-48">Người lập</th>
              <th className="p-3.5 border-b border-gray-200 w-48">Người chỉnh sửa (nếu có)</th>
              <th className="p-3.5 border-b border-gray-200 w-48">Thời gian (khởi tạo hoặc chỉnh sửa)</th>
              {onViewForm && (
                <th className="p-3.5 border-b border-gray-200 text-center w-28">Thao tác</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150">
            {historyData.map((entry, index) => (
              <tr 
                key={entry.id} 
                onClick={() => onViewForm && onViewForm(entry.period)}
                className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
              >
                <td className="p-3.5 text-center font-bold text-gray-400">{index + 1}</td>
                <td className="p-3.5 font-bold text-vna-blue font-mono">{entry.id}</td>
                <td className="p-3.5 font-bold text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-gray-400" />
                    {entry.period}
                  </div>
                </td>
                <td className="p-3.5 font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-slate-400" />
                    {entry.creator}
                  </div>
                </td>
                <td className="p-3.5 font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-slate-400" />
                    {entry.editor}
                  </div>
                </td>
                <td className="p-3.5 text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-gray-400" />
                    {entry.updatedAt}
                  </div>
                </td>
                {onViewForm && (
                  <td className="p-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onViewForm(entry.period)}
                      className="px-3 py-1.5 text-[11px] font-bold text-white bg-vna-blue hover:bg-[#00556e] rounded shadow transition-all cursor-pointer"
                    >
                      Xem chi tiết
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
