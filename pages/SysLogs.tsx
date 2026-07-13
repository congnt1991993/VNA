import React, { useState } from 'react';
import { Card, Table, Input, Select, Badge } from '../components/UI';
import { Search, Shield, RefreshCw, Calendar, User, Eye, ArrowUpDown } from 'lucide-react';

interface SystemLog {
  id: string;
  featureName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC';
  createdTime: string;
  updatedTime: string;
  createdUser: string;
  updatedUser: string;
  detailDescription: string;
}

const MOCK_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'LOG-001',
    featureName: 'Quản lý Người dùng',
    action: 'CREATE',
    createdTime: '04/07/2026 09:30:15',
    updatedTime: '04/07/2026 09:30:15',
    createdUser: 'nam.nv@vietnamairlines.com (Quản trị viên)',
    updatedUser: 'nam.nv@vietnamairlines.com (Quản trị viên)',
    detailDescription: 'Thêm tài khoản mới: Nguyễn Văn Nam'
  },
  {
    id: 'LOG-002',
    featureName: 'Quản lý chỉ tiêu',
    action: 'UPDATE',
    createdTime: '02/07/2026 15:45:00',
    updatedTime: '04/07/2026 10:15:22',
    createdUser: 'hai.nm@vietnamairlines.com (Kế hoạch)',
    updatedUser: 'nam.nv@vietnamairlines.com (Quản trị viên)',
    detailDescription: 'Cập nhật trọng số của chỉ tiêu GRI 302-1 từ 8% lên 10%'
  },
  {
    id: 'LOG-003',
    featureName: 'Phân quyền & Vai trò',
    action: 'UPDATE',
    createdTime: '01/07/2026 08:00:00',
    updatedTime: '03/07/2026 14:02:11',
    createdUser: 'nam.nv@vietnamairlines.com (Quản trị viên)',
    updatedUser: 'nam.nv@vietnamairlines.com (Quản trị viên)',
    detailDescription: 'Bổ sung quyền Nhập Excel cho vai trò Tổ kỹ thuật'
  },
  {
    id: 'LOG-004',
    featureName: 'Quản lý Ban / Đơn vị',
    action: 'CREATE',
    createdTime: '30/06/2026 11:20:00',
    updatedTime: '30/06/2026 11:20:00',
    createdUser: 'nam.nv@vietnamairlines.com (Quản trị viên)',
    updatedUser: 'nam.nv@vietnamairlines.com (Quản trị viên)',
    detailDescription: 'Thêm đơn vị mới: Trung tâm Bông Sen Vàng (TTBSV)'
  },
  {
    id: 'LOG-005',
    featureName: 'Nguồn dữ liệu & Kết nối',
    action: 'UPDATE',
    createdTime: '29/06/2026 14:35:40',
    updatedTime: '02/07/2026 09:12:05',
    createdUser: 'nam.nv@vietnamairlines.com (Quản trị viên)',
    updatedUser: 'thuy.lt@vietnamairlines.com (IT & CNTT)',
    detailDescription: 'Chỉnh sửa cổng kết nối API dữ liệu Jet A-1 tự động'
  },
  {
    id: 'LOG-006',
    featureName: 'Danh mục nhà cung cấp',
    action: 'CREATE',
    createdTime: '28/06/2026 10:05:00',
    updatedTime: '28/06/2026 10:05:00',
    createdUser: 'nam.nv@vietnamairlines.com (Quản trị viên)',
    updatedUser: 'nam.nv@vietnamairlines.com (Quản trị viên)',
    detailDescription: 'Khởi tạo danh sách đối tác cung cấp SAF: Neste Aviation, BP Aviation'
  },
  {
    id: 'LOG-007',
    featureName: 'Quản lý Người dùng',
    action: 'UPDATE',
    createdTime: '04/07/2026 11:00:00',
    updatedTime: '04/07/2026 11:05:30',
    createdUser: 'nam.nv@vietnamairlines.com (Quản trị viên)',
    updatedUser: 'nam.nv@vietnamairlines.com (Quản trị viên)',
    detailDescription: 'Khóa tài khoản Nguyễn Hoàng Anh do quá thời hạn báo cáo'
  }
];

export const SysLogsPage: React.FC = () => {
  const [logs] = useState<SystemLog[]>(MOCK_SYSTEM_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  const features = Array.from(new Set(logs.map(l => l.featureName)));

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.detailDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.createdUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.updatedUser.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFeature = selectedFeature === '' || log.featureName === selectedFeature;
    const matchesAction = selectedAction === '' || log.action === selectedAction;

    return matchesSearch && matchesFeature && matchesAction;
  });

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue tracking-tight flex items-center gap-2">
            <Shield className="text-vna-blue" size={26} /> Quản lý log hệ thống
          </h1>
          <p className="text-sm text-gray-500 mt-1">Xem nhật ký thay đổi thông tin chi tiết của từng chức năng thuộc danh mục quản trị</p>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nội dung, tài khoản..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-vna-blue/30 text-xs font-semibold"
          />
        </div>

        <Select 
          options={[{ label: 'Tất cả chức năng', value: '' }, ...features.map(f => ({ label: f, value: f }))]}
          value={selectedFeature}
          onChange={setSelectedFeature}
        />

        <Select 
          options={[
            { label: 'Tất cả hành động', value: '' },
            { label: 'CREATE (Thêm mới)', value: 'CREATE' },
            { label: 'UPDATE (Chỉnh sửa)', value: 'UPDATE' },
            { label: 'DELETE (Xóa)', value: 'DELETE' }
          ]}
          value={selectedAction}
          onChange={setSelectedAction}
        />

        <button 
          onClick={() => { setSearchQuery(''); setSelectedFeature(''); setSelectedAction(''); }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg text-xs font-bold hover:bg-gray-50 cursor-pointer"
        >
          <RefreshCw size={14} /> Reset bộ lọc
        </button>
      </div>

      {/* Logs Table */}
      <Card className="p-0 overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr className="bg-gray-50">
                <th className="w-16 text-center">STT</th>
                <th className="w-48 text-left">Chức năng</th>
                <th className="w-32 text-center">Hành động</th>
                <th className="w-48 text-left">Thời gian tạo</th>
                <th className="w-48 text-left">Thời gian sửa</th>
                <th className="w-64 text-left">Tài khoản tạo</th>
                <th className="w-64 text-left">Tài khoản chỉnh sửa</th>
                <th className="text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={log.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="text-center text-gray-400 font-medium">{index + 1}</td>
                  <td className="font-bold text-gray-800 text-left">{log.featureName}</td>
                  <td className="text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      log.action === 'CREATE' ? 'bg-green-50 text-green-700 border-green-200' :
                      log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="text-gray-600 font-semibold font-mono text-left">{log.createdTime}</td>
                  <td className="text-gray-600 font-semibold font-mono text-left">{log.updatedTime}</td>
                  <td className="text-gray-700 font-medium text-left truncate max-w-[200px]" title={log.createdUser}>{log.createdUser}</td>
                  <td className="text-gray-700 font-medium text-left truncate max-w-[200px]" title={log.updatedUser}>{log.updatedUser}</td>
                  <td className="text-center">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="p-1 rounded text-vna-blue hover:bg-vna-blue hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center"
                      title="Xem chi tiết thay đổi"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 italic">
                    Không tìm thấy log hệ thống nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-150 animate-in zoom-in-95 duration-200 text-left">
            <div className="bg-vna-blue px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Shield size={18} /> Chi tiết Log Hệ thống: {selectedLog.id}
              </h3>
              <button 
                onClick={() => setSelectedLog(null)} 
                className="text-white/80 hover:text-white cursor-pointer p-1 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide">Chức năng tác động</label>
                  <span className="block mt-1 text-sm font-bold text-gray-800">{selectedLog.featureName}</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide">Hành động</label>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">{selectedLog.action}</span>
                </div>
              </div>

              <div className="w-full h-px bg-gray-100"></div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Calendar size={12}/> Thời gian tạo</label>
                  <span className="block mt-1 text-sm font-semibold font-mono text-gray-700">{selectedLog.createdTime}</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Calendar size={12}/> Thời gian sửa đổi cuối</label>
                  <span className="block mt-1 text-sm font-semibold font-mono text-gray-700">{selectedLog.updatedTime}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><User size={12}/> Tài khoản khởi tạo</label>
                  <span className="block mt-1 text-xs font-semibold text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 mt-1.5">{selectedLog.createdUser}</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><User size={12}/> Tài khoản sửa đổi</label>
                  <span className="block mt-1 text-xs font-semibold text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 mt-1.5">{selectedLog.updatedUser}</span>
                </div>
              </div>

              <div className="w-full h-px bg-gray-100"></div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide">Mô tả chi tiết nội dung thay đổi</label>
                <div className="mt-2 bg-slate-900 text-emerald-450 font-mono text-xs p-4 rounded-lg leading-relaxed shadow-inner max-h-48 overflow-y-auto">
                  {selectedLog.detailDescription}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
