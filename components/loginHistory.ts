// Lịch sử đăng nhập: ghi lại tài khoản, cơ quan đơn vị, thời gian đăng nhập và đăng xuất của người dùng.
// - Dữ liệu lưu localStorage theo khóa `vna_login_history`, phát sự kiện `vna_login_history_updated` khi thay đổi.
// - Mỗi phiên trình duyệt giữ mã bản ghi đang mở trong sessionStorage (`vna_login_session`) để ghi giờ đăng xuất đúng bản ghi.

export const LOGIN_HISTORY_KEY = 'vna_login_history';
export const LOGIN_HISTORY_EVENT = 'vna_login_history_updated';
const SESSION_KEY = 'vna_login_session';
const MAX_RECORDS = 500;

export interface LoginHistoryRecord {
  id: string;
  account: string;      // Tài khoản (email)
  userName: string;     // Họ tên người dùng
  department: string;   // Cơ quan đơn vị
  loginAt: string;      // ISO datetime
  logoutAt: string | null; // ISO datetime, null nếu chưa ghi nhận đăng xuất
}

export const readLoginHistory = (): LoginHistoryRecord[] => {
  try {
    const raw = localStorage.getItem(LOGIN_HISTORY_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {}
  return [];
};

const writeLoginHistory = (list: LoginHistoryRecord[]) => {
  try {
    localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(list.slice(0, MAX_RECORDS)));
    window.dispatchEvent(new Event(LOGIN_HISTORY_EVENT));
  } catch (e) {}
};

const readSession = (): { id: string; account: string } | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

/** Id bản ghi đăng nhập của phiên trình duyệt hiện tại (dùng để đánh dấu "Đang đăng nhập"). */
export const getActiveLoginSessionId = (): string | null => readSession()?.id || null;

/** Ghi giờ đăng xuất cho phiên đang mở (nếu có) và đóng phiên. */
export const endLoginSession = (): void => {
  try {
    const session = readSession();
    if (!session) return;
    const list = readLoginHistory();
    const rec = list.find(r => r.id === session.id);
    if (rec && !rec.logoutAt) {
      rec.logoutAt = new Date().toISOString();
      writeLoginHistory(list);
    }
    sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {}
};

/**
 * Đồng bộ phiên đăng nhập với tài khoản đang sử dụng:
 * - Chưa có phiên: ghi 1 bản ghi đăng nhập mới.
 * - Đã có phiên của cùng tài khoản: giữ nguyên (không ghi trùng).
 * - Đã có phiên của tài khoản khác (đổi tài khoản): đóng phiên cũ (ghi giờ đăng xuất) rồi ghi phiên mới.
 */
export const syncLoginSession = (account: string, userName: string, department: string): void => {
  try {
    const session = readSession();
    if (session && session.account === account) return;
    if (session) endLoginSession();
    const rec: LoginHistoryRecord = {
      id: `LH-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      account,
      userName,
      department,
      loginAt: new Date().toISOString(),
      logoutAt: null,
    };
    writeLoginHistory([rec, ...readLoginHistory()]);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: rec.id, account }));
  } catch (e) {}
};
