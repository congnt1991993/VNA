// Thống kê lượt truy cập Landing page (Cổng thông tin đại chúng).
// - Mỗi phiên trình duyệt (sessionStorage) khi mở Landing page được tính 1 lượt truy cập.
// - Dữ liệu lưu localStorage theo khóa `vna_landing_visits` và phát sự kiện `vna_landing_visits_updated`
//   để trang CMS cập nhật số liệu mà không cần tải lại trang.

export const LANDING_VISITS_KEY = 'vna_landing_visits';
export const LANDING_VISITS_EVENT = 'vna_landing_visits_updated';
const SESSION_FLAG = 'vna_landing_visit_counted';

export interface LandingVisitData {
  total: number;
  daily: Record<string, number>; // yyyy-MM-dd -> số lượt
  lastVisit: string | null; // ISO datetime của lượt truy cập gần nhất
}

export interface LandingVisitStats {
  total: number;
  today: number;
  last7Days: number;
  lastVisit: string | null;
}

const dayKey = (d: Date): string => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const readData = (): LandingVisitData => {
  try {
    const raw = localStorage.getItem(LANDING_VISITS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        total: Number(p.total) || 0,
        daily: p.daily && typeof p.daily === 'object' ? p.daily : {},
        lastVisit: p.lastVisit || null,
      };
    }
  } catch (e) {}
  return { total: 0, daily: {}, lastVisit: null };
};

/** Ghi nhận 1 lượt truy cập Landing page cho phiên trình duyệt hiện tại (mỗi phiên chỉ ghi 1 lần). */
export const recordLandingVisit = (): void => {
  try {
    if (sessionStorage.getItem(SESSION_FLAG)) return;
    sessionStorage.setItem(SESSION_FLAG, '1');
    const data = readData();
    const now = new Date();
    const key = dayKey(now);
    data.total += 1;
    data.daily[key] = (data.daily[key] || 0) + 1;
    data.lastVisit = now.toISOString();
    localStorage.setItem(LANDING_VISITS_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(LANDING_VISITS_EVENT));
  } catch (e) {}
};

/** Tổng hợp số liệu hiển thị tại trang CMS. */
export const getLandingVisitStats = (): LandingVisitStats => {
  const data = readData();
  const now = new Date();
  let last7Days = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    last7Days += data.daily[dayKey(d)] || 0;
  }
  return {
    total: data.total,
    today: data.daily[dayKey(now)] || 0,
    last7Days,
    lastVisit: data.lastVisit,
  };
};
