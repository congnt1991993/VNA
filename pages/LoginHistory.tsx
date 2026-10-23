import React, { useEffect, useState } from 'react';
import {
  getActiveLoginSessionId,
  LOGIN_HISTORY_EVENT,
  LOGIN_HISTORY_KEY,
  LoginHistoryRecord,
  readLoginHistory,
} from '../components/loginHistory';

// Định dạng thời gian: hh:mm dd/MM/yyyy
const fmt = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const dayKey = (iso: string): string => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const LoginHistoryPage: React.FC = () => {
  const [records, setRecords] = useState<LoginHistoryRecord[]>(() => readLoginHistory());
  const [activeId, setActiveId] = useState<string | null>(() => getActiveLoginSessionId());
  const [searchAccount, setSearchAccount] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [loginDate, setLoginDate] = useState('');
  const [logoutDate, setLogoutDate] = useState('');

  useEffect(() => {
    const refresh = () => {
      setRecords(readLoginHistory());
      setActiveId(getActiveLoginSessionId());
    };
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === LOGIN_HISTORY_KEY) refresh();
    };
    refresh();
    window.addEventListener(LOGIN_HISTORY_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(LOGIN_HISTORY_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const deptOptions = Array.from(new Set(records.map(r => r.department))).filter(Boolean).sort();
  const q = searchAccount.trim().toLowerCase();
  const hasFilter = !!(searchAccount || selectedDept || loginDate || logoutDate);

  const filtered = [...records]
    .sort((a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime())
    .filter(r => {
      const matchesAccount = q === '' || r.account.toLowerCase().includes(q) || (r.userName || '').toLowerCase().includes(q);
      const matchesDept = selectedDept === '' || r.department === selectedDept;
      const matchesLogin = loginDate === '' || dayKey(r.loginAt) === loginDate;
      const matchesLogout = logoutDate === '' || (!!r.logoutAt && dayKey(r.logoutAt) === logoutDate);
      return matchesAccount && matchesDept && matchesLogin && matchesLogout;
    });

  const inputCls = 'w-full text-xs font-normal bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 outline-none focus:border-vna-blue';

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-500">
      {/* Bảng lịch sử đăng nhập (bộ lọc nằm trong từng cột) */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 flex-1 min-h-[400px] bg-white">
        <table className="w-full text-left border-collapse text-sm min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-3 font-semibold text-gray-700 w-16 text-center whitespace-nowrap">STT</th>
              <th className="py-3 px-3 font-semibold text-gray-700 w-72 whitespace-nowrap">Tài khoản</th>
              <th className="py-3 px-3 font-semibold text-gray-700 whitespace-nowrap">Cơ quan đơn vị</th>
              <th className="py-3 px-3 font-semibold text-gray-700 w-52 whitespace-nowrap">Thời gian login</th>
              <th className="py-3 px-3 font-semibold text-gray-700 w-52 whitespace-nowrap">Thời gian logout</th>
            </tr>

            {/* COLUMN FILTER ROW */}
            <tr className="bg-blue-50/70 border-b border-gray-200">
              <th className="py-2 px-2 text-center">
                {hasFilter ? (
                  <button
                    onClick={() => { setSearchAccount(''); setSelectedDept(''); setLoginDate(''); setLogoutDate(''); }}
                    className="text-[11px] font-bold text-red-600 hover:text-red-800 underline cursor-pointer px-1 py-0.5 rounded hover:bg-red-50 whitespace-nowrap"
                    title="Xóa tất cả bộ lọc"
                  >
                    Xóa lọc
                  </button>
                ) : (
                  <span className="text-gray-400 font-normal text-xs">—</span>
                )}
              </th>
              <th className="py-2 px-2 text-left">
                <div className="relative">
                  <input
                    type="text"
                    value={searchAccount}
                    onChange={(e) => setSearchAccount(e.target.value)}
                    placeholder="Lọc tài khoản..."
                    className={inputCls}
                  />
                  {searchAccount && (
                    <button onClick={() => setSearchAccount('')} className="absolute right-1.5 top-1 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                  )}
                </div>
              </th>
              <th className="py-2 px-2 text-left">
                <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className={inputCls}>
                  <option value="">Tất cả đơn vị</option>
                  {deptOptions.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </th>
              <th className="py-2 px-2 text-left">
                <input type="date" value={loginDate} onChange={(e) => setLoginDate(e.target.value)} title="Lọc theo ngày login" className={inputCls} />
              </th>
              <th className="py-2 px-2 text-left">
                <input type="date" value={logoutDate} onChange={(e) => setLogoutDate(e.target.value)} title="Lọc theo ngày logout" className={inputCls} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.map((r, index) => (
              <tr key={r.id} className="hover:bg-blue-50/45 transition-colors">
                <td className="py-3.5 px-4 text-center text-gray-400 font-medium whitespace-nowrap">{index + 1}</td>
                <td className="py-3.5 px-3">
                  <div className="font-bold text-gray-800 truncate max-w-[280px]" title={r.account}>{r.account}</div>
                  {r.userName && <div className="text-[11px] text-gray-400">{r.userName}</div>}
                </td>
                <td className="py-3.5 px-3 text-gray-700 font-medium">{r.department}</td>
                <td className="py-3.5 px-3 text-gray-600 font-semibold font-mono whitespace-nowrap">{fmt(r.loginAt)}</td>
                <td className="py-3.5 px-3 whitespace-nowrap">
                  {r.logoutAt ? (
                    <span className="text-gray-600 font-semibold font-mono">{fmt(r.logoutAt)}</span>
                  ) : r.id === activeId ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-green-50 text-green-700 border-green-200">Đang đăng nhập</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400 italic">
                  Chưa có lịch sử đăng nhập nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
