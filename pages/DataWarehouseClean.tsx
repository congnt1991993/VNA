
import React, { useState } from 'react';
import { Button, Toast } from '../components/UI';
import { Search, Database, Layers, Clock, Server, ArrowLeft, Sparkles, CheckCircle, ShieldCheck, Filter, FileDown, ChevronLeft, ChevronRight, Download, Leaf, Users, Building2 } from 'lucide-react';
import { Pillar } from '../types';

// --- TYPES ---
interface CleanDataObject {
  id: string;
  code: string;
  name: string;
  description: string;
  pillar: Pillar;
  sourceCount: number;
  lastProcessed: string;
  status: 'Draft' | 'Locked';
}

// --- MOCK DATA FOR MAIN LIST ---
const MOCK_CLEAN_DATA: CleanDataObject[] = [
  {
    id: 'CLEAN_ENV_01',
    code: 'CLEAN_FLIGHT_FUEL',
    name: 'Dữ liệu Chuyến bay & Nhiên liệu chuẩn hóa',
    description: 'Dữ liệu hợp nhất từ Netlines, FIMS và SF CO2. Đã loại bỏ trùng lặp, chuẩn hóa mã sân bay và đơn vị tính nhiên liệu.',
    pillar: Pillar.ENVIRONMENT,
    sourceCount: 3,
    lastProcessed: '10:30 25/10/2025',
    status: 'Draft'
  },
  {
    id: 'CLEAN_ENV_02',
    code: 'CLEAN_SAF_USAGE',
    name: 'Dữ liệu SAF & Giảm phát thải',
    description: 'Dữ liệu mua và nạp SAF đã được đối chiếu với hóa đơn và chứng chỉ bền vững (LCA).',
    pillar: Pillar.ENVIRONMENT,
    sourceCount: 2,
    lastProcessed: '09:00 25/10/2025',
    status: 'Locked'
  },
  {
    id: 'CLEAN_SOC_01',
    code: 'CLEAN_CUST_NPS',
    name: 'Chỉ số NPS & Phản hồi khách hàng',
    description: 'Dữ liệu khảo sát đã được làm sạch, loại bỏ các phản hồi rác và chuẩn hóa phân loại khiếu nại.',
    pillar: Pillar.SOCIAL,
    sourceCount: 1,
    lastProcessed: '09:15 25/10/2025',
    status: 'Draft'
  },
  {
    id: 'CLEAN_SOC_02',
    code: 'CLEAN_BSV_MEMBERS',
    name: 'Dữ liệu Hội viên Bông Sen Vàng',
    description: 'Thông tin hội viên đã được chuẩn hóa, loại bỏ tài khoản ảo và cập nhật hạng thẻ mới nhất.',
    pillar: Pillar.SOCIAL,
    sourceCount: 1,
    lastProcessed: '05:30 25/10/2025',
    status: 'Locked'
  },
  {
    id: 'CLEAN_GOV_01',
    code: 'CLEAN_HR_STATS',
    name: 'Thống kê Nhân sự & Đào tạo',
    description: 'Dữ liệu nhân sự hợp nhất từ SkyHR và hệ thống E-learning. Đã chuẩn hóa chức danh và phòng ban.',
    pillar: Pillar.GOVERNANCE,
    sourceCount: 2,
    lastProcessed: '01:00 25/10/2025',
    status: 'Draft'
  }
];

// --- MOCK DATA FOR DETAIL TABLE (FLIGHT DATA) ---
const MOCK_CLEAN_FLIGHTS = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  date: '25/10/2025',
  flightNo: `VN ${100 + i}`,
  route: i % 2 === 0 ? 'HAN-SGN' : 'SGN-HAN',
  acType: i % 3 === 0 ? 'B787-9' : 'A321',
  uplift: (15000 + i * 100).toLocaleString(),
  defuel: i % 10 === 0 ? '500' : '0',
  burn: (14000 + i * 90).toLocaleString(),
  saved: (200 + i * 5).toLocaleString(),
  status: 'Verified'
}));

export const DataWarehouseCleanPage: React.FC = () => {
  // Global State
  const [cleanData, setCleanData] = useState<CleanDataObject[]>(MOCK_CLEAN_DATA);
  const [searchText, setSearchText] = useState('');
  const [selectedObject, setSelectedObject] = useState<CleanDataObject | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  // Detail State
  const [detailSearchText, setDetailSearchText] = useState('');

  const handleToggleLock = (id: string) => {
    setCleanData(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = item.status === 'Locked' ? 'Draft' : 'Locked';
        setToast({ message: newStatus === 'Locked' ? 'Đã xác nhận và khóa dữ liệu!' : 'Đã mở khóa dữ liệu!', type: 'success' });
        if (selectedObject?.id === id) {
          setSelectedObject({ ...item, status: newStatus });
        }
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  // 1. RENDER LIST (GROUPED)
  const renderObjectList = () => {
    const filteredData = cleanData.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase()) || 
        item.code.toLowerCase().includes(searchText.toLowerCase())
    );

    // Group Data
    const envData = filteredData.filter(i => i.pillar === Pillar.ENVIRONMENT);
    const socData = filteredData.filter(i => i.pillar === Pillar.SOCIAL);
    const govData = filteredData.filter(i => i.pillar === Pillar.GOVERNANCE);

    // Section Helper
    const renderSection = (items: CleanDataObject[], title: string, colorClass: string, icon: React.ReactNode) => {
        if (items.length === 0) return null;
        return (
            <div className="mb-8">
                <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 pl-3 border-l-4 ${colorClass} flex items-center gap-2`}>
                   {icon} {title} <span className="text-gray-400 font-normal normal-case text-xs">({items.length} đối tượng)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => setSelectedObject(item)}
                        className="group bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-vna-blue/30 transition-all duration-200 cursor-pointer flex flex-col h-full"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 
                                ${item.pillar === Pillar.ENVIRONMENT ? 'bg-green-100 text-green-600' : 
                                  item.pillar === Pillar.SOCIAL ? 'bg-blue-100 text-blue-600' : 
                                  'bg-purple-100 text-purple-600'}`}>
                                <CheckCircle size={20} />
                             </div>
                             <div>
                                <h3 className="font-bold text-black/85 group-hover:text-vna-blue transition-colors line-clamp-1" title={item.name}>
                                  {item.name}
                                </h3>
                                <div className="text-xs text-gray-400 font-mono mt-0.5">{item.code}</div>
                             </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-5 min-h-[40px] line-clamp-2" title={item.description}>
                          {item.description}
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="text-xs text-black/45 flex items-center gap-1" title="Số lượng nguồn tích hợp">
                                 <Server size={14} /> {item.sourceCount} nguồn
                              </div>
                          </div>
                          
                          <div className="text-[10px] text-gray-400 flex items-center gap-1">
                             <Clock size={12} /> {item.lastProcessed}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
      <div className="flex flex-col h-full">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-vna-blue flex items-center gap-2">
              <Sparkles size={24} className="text-vna-gold" /> Dữ liệu chuẩn hóa
            </h2>
            <p className="text-sm text-black/45 mt-1">Dữ liệu đã qua xử lý, làm sạch và chuẩn hóa sẵn sàng cho báo cáo</p>
          </div>
          <div className="w-full md:w-96 relative">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
             <input 
                type="text" 
                placeholder="Tìm kiếm đối tượng dữ liệu..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-vna-blue text-sm hover:shadow-md transition-shadow duration-300"
             />
          </div>
        </div>

        {/* Content Sections */}
        {filteredData.length > 0 ? (
            <div className="flex-1 overflow-y-auto pr-2">
                {renderSection(envData, 'Môi trường (Environment)', 'border-green-500 text-green-800', <Leaf size={18} className="text-green-600" />)}
                {renderSection(socData, 'Xã hội (Social)', 'border-blue-500 text-blue-800', <Users size={18} className="text-blue-600" />)}
                {renderSection(govData, 'Quản trị (Governance)', 'border-purple-500 text-purple-800', <Building2 size={18} className="text-purple-600" />)}
            </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <Sparkles size={48} className="mb-4 opacity-20" />
             <p>Không tìm thấy đối tượng dữ liệu sạch phù hợp.</p>
          </div>
        )}
      </div>
    );
  };

  // 2. RENDER DETAIL VIEW
  const renderDetailView = () => {
    if (!selectedObject) return null;

    // Filter logic for detail table (mock implementation)
    const filteredRows = MOCK_CLEAN_FLIGHTS.filter(row => 
        row.flightNo.toLowerCase().includes(detailSearchText.toLowerCase()) ||
        row.route.toLowerCase().includes(detailSearchText.toLowerCase())
    );

    const isFlightData = selectedObject.code === 'CLEAN_FLIGHT_FUEL';

    return (
      <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
        {/* Navigation Header */}
        <div className="flex flex-col gap-4 mb-4">
           <div className="flex items-center text-sm text-black/45 font-medium">
              <span onClick={() => setSelectedObject(null)} className="cursor-pointer hover:text-vna-blue">Dữ liệu chuẩn hóa</span>
              <span className="mx-2 text-gray-400">&gt;</span>
              <span className="text-vna-blue font-bold">{selectedObject.name}</span>
           </div>
           <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <Sparkles size={24} />
                  </div>
                  <div>
                      <h1 className="text-2xl font-bold text-vna-blue flex items-center gap-2">
                         {selectedObject.name}
                         {selectedObject.status === 'Locked' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200 flex items-center gap-1"><CheckCircle size={12}/> Đã khóa</span>}
                         {selectedObject.status === 'Draft' && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200 flex items-center gap-1">Chưa khóa</span>}
                      </h1>
                      <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-black/45 font-mono">{selectedObject.code}</span>
                      </div>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant={selectedObject.status === 'Locked' ? 'outline' : 'primary'} 
                  onClick={() => handleToggleLock(selectedObject.id)}
                  className={selectedObject.status === 'Locked' ? 'text-gray-600 border-gray-300 hover:bg-gray-50' : ''}
                >
                  {selectedObject.status === 'Locked' ? 'Mở khóa dữ liệu' : 'Xác nhận & Khóa'}
                </Button>
                <Button variant="ghost" onClick={() => setSelectedObject(null)} className="text-black/45 hover:text-vna-blue hover:bg-gray-100">
                   <ArrowLeft size={16} /> Quay lại
                </Button>
              </div>
           </div>
        </div>

        {/* Toolbar */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4 flex flex-wrap md:flex-nowrap justify-between items-center gap-3">
           <div className="flex gap-2 flex-1 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                 <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                 <input 
                    type="text" 
                    placeholder="Tìm kiếm dữ liệu (Số hiệu, Chặng bay...)"
                    value={detailSearchText}
                    onChange={(e) => setDetailSearchText(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-vna-blue"
                 />
              </div>
              <Button variant="outline" className="bg-white border-gray-300 text-gray-600 hover:bg-gray-50 px-3">
                 <Filter size={16} /> <span className="hidden sm:inline">Bộ lọc</span>
              </Button>
           </div>

           <div className="flex gap-2 w-full md:w-auto justify-end">
              <Button variant="outline" className="bg-white border-vna-blue text-vna-blue hover:bg-blue-50" onClick={() => setToast({ message: 'Đang xuất dữ liệu...', type: 'info' })}>
                 <FileDown size={16} /> Xuất dữ liệu
              </Button>
           </div>
        </div>

        {/* Unified Data Table */}
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white hover:shadow-md transition-shadow duration-300">
           <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                 <thead className="bg-vna-blue/5 text-vna-blue sticky top-0 z-10 hover:shadow-md transition-shadow duration-300 border-b border-blue-100">
                    {/* Render Columns based on Object Type */}
                    {isFlightData ? (
                       <tr>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-blue-100">Ngày bay</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-blue-100">Số hiệu</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-blue-100">Chặng bay</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-blue-100">Loại tàu bay</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-blue-100 text-right">Jet Fuel Nạp (L)</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-blue-100 text-right">Jet Fuel Hút (L)</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-blue-100 text-right">Jet Fuel Tiêu thụ (L)</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-blue-100 text-right text-green-700">NL Tiết kiệm (Kg)</th>
                       </tr>
                    ) : (
                       // Generic Header for other types
                        <tr>
                           <th className="py-3 px-4 text-xs font-bold uppercase border-b border-blue-100">Thời gian</th>
                           <th className="py-3 px-4 text-xs font-bold uppercase border-b border-blue-100">Mã định danh</th>
                           <th className="py-3 px-4 text-xs font-bold uppercase border-b border-blue-100">Tên dữ liệu</th>
                           <th className="py-3 px-4 text-xs font-bold uppercase border-b border-blue-100 text-right">Giá trị</th>
                           <th className="py-3 px-4 text-xs font-bold uppercase border-b border-blue-100">Đơn vị</th>
                           <th className="py-3 px-4 text-xs font-bold uppercase border-b border-blue-100">Trạng thái</th>
                        </tr>
                    )}
                 </thead>
                 <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {isFlightData ? (
                       filteredRows.map((row) => (
                          <tr key={row.id} className="hover:bg-blue-50 cursor-default">
                             <td className="py-3 px-4 font-medium">{row.date}</td>
                             <td className="py-3 px-4 font-bold text-vna-blue">{row.flightNo}</td>
                             <td className="py-3 px-4">{row.route}</td>
                             <td className="py-3 px-4">{row.acType}</td>
                             <td className="py-3 px-4 text-right font-mono text-gray-600">{row.uplift}</td>
                             <td className="py-3 px-4 text-right font-mono text-gray-600">{row.defuel}</td>
                             <td className="py-3 px-4 text-right font-mono font-bold text-black/85">{row.burn}</td>
                             <td className="py-3 px-4 text-right font-mono font-bold text-green-600">{row.saved}</td>
                          </tr>
                       ))
                    ) : (
                       // Generic Rows (Placeholder)
                       <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-400">
                             Dữ liệu chi tiết cho đối tượng này chưa được cập nhật trong bản Demo.
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
           
           {/* Pagination */}
           <div className="bg-white border-t border-gray-200 p-2 flex justify-between items-center text-xs text-gray-600">
              <div className="pl-2">Hiển thị {isFlightData ? filteredRows.length : 0} kết quả</div>
              <div className="flex gap-1">
                 <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"><ChevronLeft size={16}/></button>
                 <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16}/></button>
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {selectedObject ? renderDetailView() : renderObjectList()}
    </div>
  );
};
