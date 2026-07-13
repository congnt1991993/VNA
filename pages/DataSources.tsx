
import React, { useState } from 'react';
import { Button, Input, Select, StatusChip, Toast } from '../components/UI';
import { Search, RefreshCw, Database, FileSpreadsheet, Globe, ChevronRight, CheckCircle, XCircle, Server } from 'lucide-react';

// --- TYPES ---
type ConnectionStatus = 'Connected' | 'Disconnected';
type ProtocolType = 'API' | 'Database' | 'Excel';

interface DataSource {
  id: string;
  code: string;
  name: string;
  protocol: ProtocolType;
  status: ConnectionStatus;
  frequency: string;
  lastUpdated: string;
}

// --- MOCK DATA ---
const MOCK_DATA_SOURCES: DataSource[] = [
  { id: 'manual-form', code: 'Manual', name: 'Nhập qua form dữ liệu', protocol: 'Excel', status: 'Connected', frequency: '-', lastUpdated: 'Hệ thống' },
  { id: '1', code: 'FIMS', name: 'Hệ thống khai thác dữ liệu chuyến bay', protocol: 'API', status: 'Connected', frequency: 'Real-time', lastUpdated: '10:05 25/10/2025' },
  { id: '2', code: 'ACARS-SITA', name: 'Điện hành trình giữa máy bay – mặt đất', protocol: 'API', status: 'Connected', frequency: 'Real-time', lastUpdated: '10:05 25/10/2025' },
  { id: '3', code: 'Netlines', name: 'Hệ thống lập lịch bay', protocol: 'Database', status: 'Connected', frequency: 'Daily (02:00)', lastUpdated: '02:00 25/10/2025' },
  { id: '4', code: 'CMS', name: 'Hệ thống quản lý hợp đồng', protocol: 'Database', status: 'Disconnected', frequency: 'Monthly', lastUpdated: '15/09/2025' },
  { id: '5', code: 'SkyHR', name: 'Hệ thống quản lý nhân sự', protocol: 'Database', status: 'Connected', frequency: 'Weekly', lastUpdated: '20/10/2025' },
  { id: '6', code: 'E-learning', name: 'Hệ thống đào tạo trực tuyến', protocol: 'Database', status: 'Connected', frequency: 'Daily', lastUpdated: '00:30 25/10/2025' },
  { id: '7', code: 'Revera', name: 'Hệ thống kế toán thu', protocol: 'API', status: 'Connected', frequency: 'Daily', lastUpdated: '01:15 25/10/2025' },
  { id: '8', code: 'Central Hub', name: 'Hệ thống Salesforce Central Hub', protocol: 'API', status: 'Connected', frequency: 'Real-time', lastUpdated: '10:04 25/10/2025' },
  { id: '9', code: 'Qualtrics', name: 'Hệ thống quản lý khảo sát khách hàng', protocol: 'API', status: 'Connected', frequency: 'Daily', lastUpdated: '03:00 25/10/2025' },
  { id: '10', code: 'SF CO2', name: 'Hệ thống phần mềm quản lý tiết kiệm nhiên liệu (SAFRAN)', protocol: 'API', status: 'Connected', frequency: 'Per Flight', lastUpdated: '09:50 25/10/2025' },
  { id: '11', code: 'TIMS', name: 'Hệ thống quản lý thông tin kỹ thuật & lịch bảo dưỡng', protocol: 'Database', status: 'Connected', frequency: 'Daily', lastUpdated: '04:00 25/10/2025' },
  { id: '12', code: 'RPS', name: 'Hệ thống phân tích hiệu quả đường bay', protocol: 'Database', status: 'Disconnected', frequency: 'Monthly', lastUpdated: '01/09/2025' },
  { id: '13', code: 'BI-CLM', name: 'Hệ thống quản lý khách hàng thường xuyên', protocol: 'Database', status: 'Connected', frequency: 'Daily', lastUpdated: '05:00 25/10/2025' },
];

export const DataSourcesPage: React.FC = () => {
  // Data State
  const [dataSources, setDataSources] = useState<DataSource[]>(MOCK_DATA_SOURCES);
  const [syncingIds, setSyncingIds] = useState<string[]>([]);
  
  // Filters State
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  // Handlers
  const handleRefresh = () => {
    const syncableSources = dataSources.filter(ds => ds.code !== 'Manual');
    const idsToSync = syncableSources.map(ds => ds.id);
    
    setSyncingIds(prev => [...prev, ...idsToSync]);
    setToast({ message: 'Đang kiểm tra kết nối và đồng bộ toàn bộ hệ thống nguồn...', type: 'info' });

    setTimeout(() => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

      setDataSources(prev => prev.map(ds => {
        if (ds.code !== 'Manual') {
          return {
            ...ds,
            status: 'Connected',
            lastUpdated: timeStr
          };
        }
        return ds;
      }));

      setSyncingIds([]);
      setToast({ message: 'Đồng bộ và làm mới trạng thái tất cả các hệ thống nguồn thành công!', type: 'success' });
    }, 1500);
  };

  const handleSync = (id: string) => {
    const item = dataSources.find(ds => ds.id === id);
    if (!item || item.code === 'Manual') return;

    setSyncingIds(prev => [...prev, id]);
    setToast({ message: `Đang tiến hành đồng bộ dữ liệu từ hệ thống ${item.code}...`, type: 'info' });

    setTimeout(() => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

      setDataSources(prev => prev.map(ds => {
        if (ds.id === id) {
          return {
            ...ds,
            status: 'Connected',
            lastUpdated: timeStr
          };
        }
        return ds;
      }));

      setSyncingIds(prev => prev.filter(x => x !== id));
      setToast({ message: `Đồng bộ thành công dữ liệu từ hệ thống ${item.code}!`, type: 'success' });
    }, 1500);
  };

  const handleDetail = (item: DataSource) => {
    // Logic to view details
    console.log("View detail", item.code);
  };

  // Filter Logic
  const filteredData = dataSources.filter(item => {
    const matchSearch = item.code.toLowerCase().includes(searchText.toLowerCase()) || item.name.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    const matchProtocol = !protocolFilter || item.protocol === protocolFilter;
    return matchSearch && matchStatus && matchProtocol;
  });

  // Helper to render Protocol Badge
  const renderProtocolBadge = (protocol: ProtocolType) => {
    let icon = <Globe size={12} />;
    if (protocol === 'Database') icon = <Database size={12} />;
    if (protocol === 'Excel') icon = <FileSpreadsheet size={12} />;

    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 w-fit">
        {icon} {protocol}
      </span>
    );
  };

  // Helper to render Status
  const renderStatus = (status: ConnectionStatus) => {
    if (status === 'Connected') {
      return (
        <span className="flex items-center gap-1.5 text-green-700 text-sm font-medium">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
          Kết nối tốt
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
        Mất kết nối
      </span>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-vna-blue flex items-center gap-2">
            Quản lý Nguồn Dữ liệu
          </h2>
          <p className="text-sm text-black/45 mt-1">Theo dõi trạng thái kết nối và cấu hình các hệ thống nguồn ESG</p>
        </div>
        <div>
           <Button variant="outline" onClick={handleRefresh} className="text-vna-blue border-vna-blue hover:bg-blue-50">
              <RefreshCw size={16} /> Làm mới
           </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 bg-white p-4 rounded-lg border border-gray-200 items-end">
        {/* Search */}
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">Từ khóa</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm theo mã hoặc tên hệ thống..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue text-sm"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3">
           <Select 
              label="Trạng thái"
              placeholder="Tất cả trạng thái"
              options={[
                  {label: 'Tất cả', value: ''},
                  {label: '🟢 Kết nối tốt', value: 'Connected'},
                  {label: '🔴 Mất kết nối', value: 'Disconnected'}
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
           />
        </div>

        {/* Protocol Filter */}
        <div className="md:col-span-3">
           <Select 
              label="Giao thức"
              placeholder="Tất cả giao thức"
              options={[
                  {label: 'Tất cả', value: ''},
                  {label: 'API', value: 'API'},
                  {label: 'Database', value: 'Database'},
                  {label: 'Excel', value: 'Excel'}
              ]}
              value={protocolFilter}
              onChange={setProtocolFilter}
           />
        </div>
        
        {/* Action button placeholder or spacer */}
        <div className="md:col-span-1"></div>
      </div>

      {/* Data Table */}
      <div className="overflow-visible rounded-lg border border-gray-200 flex-1 min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-vna-blue text-white">
              <th className="py-3 px-4 font-semibold text-sm w-16 text-center rounded-tl-lg">STT</th>
              <th className="py-3 px-4 font-semibold text-sm w-32">Mã nguồn</th>
              <th className="py-3 px-4 font-semibold text-sm w-1/3">Tên hệ thống nguồn</th>
              <th className="py-3 px-4 font-semibold text-sm w-32">Giao thức</th>
              <th className="py-3 px-4 font-semibold text-sm w-40">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-sm">Tần suất</th>
              <th className="py-3 px-4 font-semibold text-sm">Cập nhật cuối</th>
              <th className="py-3 px-4 font-semibold text-sm w-44 text-center rounded-tr-lg">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50 group transition-colors cursor-pointer" onClick={() => handleDetail(item)}>
                  <td className="py-3 px-4 text-sm text-black/45 text-center">{index + 1}</td>
                  <td className="py-3 px-4 text-sm font-bold text-vna-blue">{item.code}</td>
                  <td className="py-3 px-4 text-sm text-black/85 font-medium">{item.name}</td>
                  <td className="py-3 px-4 text-sm">
                    {renderProtocolBadge(item.protocol)}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {renderStatus(item.status)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{item.frequency}</td>
                  <td className="py-3 px-4 text-sm text-black/45 font-mono text-xs">{item.lastUpdated}</td>
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleSync(item.id)}
                        disabled={syncingIds.includes(item.id) || item.code === 'Manual'}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all duration-200 ${
                          item.code === 'Manual'
                            ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                            : syncingIds.includes(item.id)
                            ? 'bg-blue-50 text-vna-blue border-blue-200 cursor-wait'
                            : 'bg-white text-vna-blue border-blue-200 hover:bg-vna-blue hover:text-white hover:border-vna-blue shadow-xs'
                        }`}
                        title={item.code === 'Manual' ? 'Hệ thống nhập liệu thủ công không thể đồng bộ tự động' : 'Đồng bộ dữ liệu thủ công'}
                      >
                        <RefreshCw size={12} className={syncingIds.includes(item.id) ? 'animate-spin' : ''} />
                        {syncingIds.includes(item.id) ? 'Đang đồng bộ...' : 'Đồng bộ'}
                      </button>
                      <button 
                        onClick={() => handleDetail(item)}
                        className="p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-vna-blue transition-colors"
                        title="Xem chi tiết"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 italic">
                  <div className="flex flex-col items-center justify-center">
                    <Server size={48} className="mb-2 opacity-20" />
                    Không tìm thấy hệ thống nguồn phù hợp.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (Visual Only) */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm text-black/45 mb-2 sm:mb-0">
          Hiển thị <span className="font-medium text-gray-900">1 - {filteredData.length}</span> của <span className="font-medium text-gray-900">{filteredData.length}</span> kết quả
        </div>
        <div className="flex gap-1">
          <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-sm text-gray-600 disabled:opacity-50">Trước</button>
          <button className="px-3 py-1 bg-vna-blue text-white rounded text-sm">1</button>
          <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-sm text-gray-600">Sau</button>
        </div>
      </div>
    </div>
  );
};
