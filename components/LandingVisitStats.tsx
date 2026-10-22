import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import {
  getLandingVisitStats,
  LANDING_VISITS_EVENT,
  LANDING_VISITS_KEY,
  LandingVisitStats as LandingVisitStatsData,
} from './public-site/landingVisits';

const fmtNumber = (n: number) => n.toLocaleString('vi-VN');

/** Dải thống kê lượt truy cập Landing page (gọn, 1 hàng), hiển thị tại trang quản trị CMS Website ESG. */
export const LandingVisitStats: React.FC = () => {
  const [stats, setStats] = useState<LandingVisitStatsData>(() => getLandingVisitStats());

  useEffect(() => {
    const refresh = () => setStats(getLandingVisitStats());
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === LANDING_VISITS_KEY) refresh();
    };
    refresh();
    window.addEventListener(LANDING_VISITS_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(LANDING_VISITS_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-2xs px-4 py-2.5 flex items-center justify-between gap-4"
      title="Mỗi phiên truy cập vào trang công khai được tính 1 lượt; số liệu ghi nhận trên trình duyệt đang sử dụng."
    >
      <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#e6b441]">
        <Globe size={13} /> Tổng lượt truy cập Landing page:
      </span>
      <span className="text-xl font-bold leading-none text-[#005f6e]">{fmtNumber(stats.total)}</span>
    </div>
  );
};

export default LandingVisitStats;
