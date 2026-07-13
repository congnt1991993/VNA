
import React, { useState, useMemo } from 'react';
import { Input, Button, Select, Toast } from '../components/UI';
import { Search, Database, Leaf, Users, ShieldCheck, Clock, Server, Layers, ArrowLeft, FileDown, Plus, UploadCloud, Filter, MoreHorizontal, ChevronRight, ChevronLeft, Sparkles, Building2 } from 'lucide-react';
import { Pillar } from '../types';

// --- TYPES ---
interface RawDataObject {
  id: string;
  name: string;
  description: string;
  pillar: Pillar;
  sources: string[];
  lastUpdated: string;
}

// --- MOCK DATA FOR OBJECTS ---
const MOCK_RAW_DATA: RawDataObject[] = [
  {
    id: 'RAW_ENV_01',
    name: 'Danh sách chuyến bay',
    description: 'Dữ liệu chuyến bay, nhiên liệu tiêu thụ, nhiên liệu tiết kiệm, lượng khí phát thải CO2.',
    pillar: Pillar.ENVIRONMENT,
    sources: ['Netlines', 'FIMS', 'SF CO2 (SAFRAN)', 'Nhập thủ công'], // Order: Netlines first
    lastUpdated: '10:05 25/10/2025'
  },
  {
    id: 'RAW_ENV_02',
    name: 'Nhiên liệu bền vững (SAF)',
    description: 'Thông tin mua, nạp và sử dụng nhiên liệu hàng không bền vững (Sustainable Aviation Fuel).',
    pillar: Pillar.ENVIRONMENT,
    sources: ['Revera', 'FIMS', 'Nhập thủ công'],
    lastUpdated: '08:30 24/10/2025'
  },
  {
    id: 'RAW_SOC_01',
    name: 'Trải nghiệm khách hàng',
    description: 'Dữ liệu khảo sát mức độ hài lòng khách hàng (NPS), phản hồi và khiếu nại.',
    pillar: Pillar.SOCIAL,
    sources: ['Qualtrics'],
    lastUpdated: '09:00 25/10/2025'
  },
  {
    id: 'RAW_SOC_02',
    name: 'Hội viên Bông Sen Vàng',
    description: 'Dữ liệu khách hàng thân thiết, hạng thẻ, tích lũy dặm và trả thưởng.',
    pillar: Pillar.SOCIAL,
    sources: ['BI-CLM'],
    lastUpdated: '05:00 25/10/2025'
  },
  {
    id: 'RAW_GOV_01',
    name: 'Danh sách nhân sự',
    description: 'Thống kê nhân sự, cơ cấu tổ chức, đa dạng giới và thông tin hợp đồng lao động.',
    pillar: Pillar.GOVERNANCE,
    sources: ['SkyHR'],
    lastUpdated: '00:00 25/10/2025'
  }
];

// --- MOCK DATA FOR TABLES ---

const MOCK_NETLINES_DATA = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  date: '25/10/2025',
  flightNo: `VN ${100 + i}`,
  route: i % 2 === 0 ? 'HAN-SGN' : 'SGN-HAN',
  dep: i % 2 === 0 ? 'HAN' : 'SGN',
  arr: i % 2 === 0 ? 'SGN' : 'HAN',
  acType: i % 3 === 0 ? 'B787-9' : 'A321',
  std: `0${8 + i}:00`,
  sta: `1${0 + i}:15`,
  status: 'Closed'
}));

const MOCK_FIMS_DATA = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  date: '25/10/2025',
  flightNo: `VN ${100 + i}`,
  acType: i % 3 === 0 ? 'B787-9' : 'A321',
  fuelUplift: (15000 + i * 100).toLocaleString(),
  fuelDefuel: i % 5 === 0 ? '500' : '0',
  fuelBurn: (14000 + i * 90).toLocaleString(),
  tripFuel: (14200 + i * 90).toLocaleString(),
  taxiFuel: '200'
}));

const MOCK_SFCO2_DATA = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  date: '25/10/2025',
  flightNo: `VN ${100 + i}`,
  acType: i % 3 === 0 ? 'B787-9' : 'A321',
  savingKg: (150 + i * 10),
  savingLiter: (185 + i * 12),
  initiative: i % 2 === 0 ? 'Single Engine Taxi' : 'Continuous Descent',
  compliance: '100%'
}));

const MOCK_MANUAL_DATA = Array.from({ length: 5 }).map((_, i) => ({
  id: i,
  date: '25/10/2025',
  dataPoint: `Data Point ${i + 1}`,
  value: (1000 + i * 50),
  unit: 'Kg',
  submitter: 'user@vna',
  status: 'Pending'
}));


export const DataWarehouseRawPage: React.FC = () => {
  // Global State
  const [searchText, setSearchText] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  // Detail View State
  const [selectedObject, setSelectedObject] = useState<RawDataObject | null>(null);
  const [activeSourceTab, setActiveSourceTab] = useState<string>('');

  // Handlers
  const handleSelectObject = (item: RawDataObject) => {
    setSelectedObject(item);
    setActiveSourceTab(item.sources[0]); // Default to first source
  };

  const handleBack = () => {
    setSelectedObject(null);
    setSearchText('');
  };

  const handleAddNewObject = () => {
    setToast({ message: 'Chức năng thêm mới đối tượng dữ liệu thô', type: 'info' });
  };

  const handleImportExcelGeneral = () => {
    setToast({ message: 'Chức năng Import dữ liệu hàng loạt từ Excel', type: 'info' });
  };

  // --- RENDERERS ---

  // 1. RENDER MAIN LIST (GROUPED BY PILLAR)
  const renderObjectList = () => {
    // Filter by search text
    const filteredData = MOCK_RAW_DATA.filter(item => 
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // Group data
    const envData = filteredData.filter(i => i.pillar === Pillar.ENVIRONMENT);
    const socData = filteredData.filter(i => i.pillar === Pillar.SOCIAL);
    const govData = filteredData.filter(i => i.pillar === Pillar.GOVERNANCE);

    // Section Renderer Helper
    const renderSection = (items: RawDataObject[], title: string, colorClass: string, icon: React.ReactNode) => {
        if (items.length === 0) return null;
        return (
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 pl-3 border-l-4 ${colorClass} flex items-center gap-2`}>
                   {icon} {title} <span className="text-gray-400 font-normal normal-case text-xs">({items.length} đối tượng)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleSelectObject(item)}
                        className="group bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-vna-blue/30 transition-all duration-200 cursor-pointer flex flex-col h-full"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 
                                ${item.pillar === Pillar.ENVIRONMENT ? 'bg-green-100 text-green-600' : 
                                  item.pillar === Pillar.SOCIAL ? 'bg-blue-100 text-blue-600' : 
                                  'bg-purple-100 text-purple-600'}`}>
                                <Layers size={20} />
                             </div>
                             <h3 className="font-bold text-black/85 group-hover:text-vna-blue transition-colors line-clamp-1" title={item.name}>
                               {item.name}
                             </h3>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-5 min-h-[40px]" title={item.description}>
                          {item.description}
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100">
                          <div className="text-xs font-semibold text-black/45 mb-2 flex items-center gap-1">
                             <Server size={12} /> Nguồn dữ liệu ({item.sources.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                             {item.sources.map((source, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[11px] border border-gray-200 font-medium">
                                   {source}
                                </span>
                             ))}
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center gap-1 text-[10px] text-gray-400">
                           <Clock size={10} /> Cập nhật: {item.lastUpdated}
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
              <Database size={24} className="text-vna-gold" /> Dữ liệu thô
            </h2>
            <p className="text-sm text-black/45 mt-1">Quản lý các đối tượng dữ liệu gốc từ hệ thống nguồn</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="w-full md:w-80 relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                   type="text" 
                   placeholder="Tìm kiếm đối tượng..."
                   value={searchText}
                   onChange={(e) => setSearchText(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-vna-blue text-sm hover:shadow-md transition-shadow duration-300"
                />
             </div>
             <div className="flex gap-2 shrink-0">
                <Button variant="outline" onClick={handleImportExcelGeneral} className="bg-white border-green-600 text-green-700 hover:bg-green-50 hover:shadow-md transition-shadow duration-300">
                   <UploadCloud size={18} /> <span className="hidden sm:inline">Import Excel</span>
                </Button>
                <Button onClick={handleAddNewObject} className="shadow-md">
                   <Plus size={18} /> <span className="hidden sm:inline">Thêm mới</span>
                </Button>
             </div>
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
             <Database size={48} className="mb-4 opacity-20" />
             <p>Không tìm thấy đối tượng dữ liệu phù hợp.</p>
          </div>
        )}
      </div>
    );
  };

  // 2. RENDER DETAIL VIEW
  const renderDetailView = () => {
    if (!selectedObject) return null;

    const isManualTab = activeSourceTab === 'Nhập thủ công';

    return (
      <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 mb-4">
           <div className="flex items-center text-sm text-black/45 font-medium">
              <span onClick={handleBack} className="cursor-pointer hover:text-vna-blue">Dữ liệu thô</span>
              <span className="mx-2 text-gray-400">&gt;</span>
              <span className="text-vna-blue font-bold">{selectedObject.name}</span>
           </div>
           <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-vna-blue flex items-center gap-2">
                 {selectedObject.name}
              </h1>
              <div className="flex items-center gap-2">
                  {/* NEW: Process & Clean Button moved here */}
                  <Button 
                    variant="outline" 
                    className="bg-white border-purple-300 text-purple-700 hover:bg-purple-50 hover:shadow-md transition-shadow duration-300"
                    onClick={() => setToast({ message: 'Đang chạy xử lý và làm sạch dữ liệu...', type: 'info' })}
                  >
                     <Sparkles size={16} /> <span className="hidden sm:inline">Chạy xử lý & làm sạch</span>
                  </Button>
                  
                  <div className="w-px h-6 bg-gray-300 mx-2 hidden sm:block"></div>
                  
                  <Button variant="ghost" onClick={handleBack} className="text-black/45 hover:text-vna-blue hover:bg-gray-100">
                     <ArrowLeft size={16} /> Quay lại
                  </Button>
              </div>
           </div>
        </div>

        {/* Detail Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
           {selectedObject.sources.map(source => (
              <button
                key={source}
                onClick={() => setActiveSourceTab(source)}
                className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap
                  ${activeSourceTab === source 
                    ? 'border-vna-blue text-vna-blue bg-blue-50/50' 
                    : 'border-transparent text-black/45 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {source}
              </button>
           ))}
        </div>

        {/* Toolbar */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4 flex flex-wrap md:flex-nowrap justify-between items-center gap-3">
           <div className="flex gap-2 flex-1 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                 <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                 <input 
                    type="text" 
                    placeholder="Tìm kiếm trong bảng..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-vna-blue"
                 />
              </div>
              <Button variant="outline" className="bg-white border-gray-300 text-gray-600 hover:bg-gray-50 px-3">
                 <Filter size={16} /> <span className="hidden sm:inline">Bộ lọc</span>
              </Button>
           </div>

           <div className="flex gap-2 w-full md:w-auto justify-end">
              {isManualTab && (
                 <>
                    <Button variant="outline" className="bg-white border-gray-300 text-green-700 hover:bg-green-50" onClick={() => setToast({ message: 'Đang mở chức năng Import Excel...', type: 'info' })}>
                       <UploadCloud size={16} /> <span className="hidden sm:inline">Import Excel</span>
                    </Button>
                    <Button variant="primary" className="bg-vna-blue text-white hover:shadow-md transition-shadow duration-300" onClick={() => setToast({ message: 'Đang mở chức năng Thêm mới...', type: 'info' })}>
                       <Plus size={16} /> <span className="hidden sm:inline">Thêm mới</span>
                    </Button>
                    <div className="w-px h-8 bg-gray-300 mx-1 hidden sm:block"></div>
                 </>
              )}
              <Button variant="outline" className="bg-white border-vna-blue text-vna-blue hover:bg-blue-50" onClick={() => setToast({ message: 'Đang xuất Excel...', type: 'info' })}>
                 <FileDown size={16} /> Xuất Excel
              </Button>
           </div>
        </div>

        {/* Data Grid Table */}
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white hover:shadow-md transition-shadow duration-300">
           <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                 <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10 hover:shadow-md transition-shadow duration-300">
                    {/* Render Headers based on Active Tab */}
                    {activeSourceTab === 'Netlines' && (
                       <tr>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Ngày bay</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Số hiệu</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Chặng bay</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">DEP</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">ARR</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Loại tàu bay</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200 text-center">STD</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200 text-center">STA</th>
                       </tr>
                    )}
                    {activeSourceTab === 'FIMS' && (
                       <tr>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Ngày bay</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Số hiệu</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Loại tàu bay</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200 text-right">Fuel Uplift (L)</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200 text-right">Fuel Defuel (L)</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200 text-right">Fuel Burn (L)</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200 text-right">Trip Fuel (L)</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200 text-right">Taxi Fuel (L)</th>
                       </tr>
                    )}
                    {activeSourceTab.includes('SF CO2') && (
                       <tr>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Ngày bay</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Số hiệu</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Loại tàu bay</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Sáng kiến</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200 text-right">Tiết kiệm (Kg)</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200 text-right">Tiết kiệm (L)</th>
                          <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200 text-center">Tuân thủ</th>
                       </tr>
                    )}
                    {/* Fallback / Manual Header */}
                    {!['Netlines', 'FIMS'].includes(activeSourceTab) && !activeSourceTab.includes('SF CO2') && (
                        <tr>
                           <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Ngày ghi nhận</th>
                           <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Dữ liệu</th>
                           <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200 text-right">Giá trị</th>
                           <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Đơn vị</th>
                           <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Người nhập</th>
                           <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200">Trạng thái</th>
                           <th className="py-3 px-4 text-xs font-bold uppercase border-b border-gray-200 w-10"></th>
                        </tr>
                    )}
                 </thead>
                 <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {/* Netlines Rows */}
                    {activeSourceTab === 'Netlines' && MOCK_NETLINES_DATA.map((row) => (
                       <tr key={row.id} className="hover:bg-blue-50 cursor-default">
                          <td className="py-2 px-4 font-medium">{row.date}</td>
                          <td className="py-2 px-4 font-bold text-vna-blue">{row.flightNo}</td>
                          <td className="py-2 px-4">{row.route}</td>
                          <td className="py-2 px-4">{row.dep}</td>
                          <td className="py-2 px-4">{row.arr}</td>
                          <td className="py-2 px-4">{row.acType}</td>
                          <td className="py-2 px-4 text-center font-mono text-xs">{row.std}</td>
                          <td className="py-2 px-4 text-center font-mono text-xs">{row.sta}</td>
                       </tr>
                    ))}

                    {/* FIMS Rows */}
                    {activeSourceTab === 'FIMS' && MOCK_FIMS_DATA.map((row) => (
                       <tr key={row.id} className="hover:bg-blue-50 cursor-default">
                          <td className="py-2 px-4 font-medium">{row.date}</td>
                          <td className="py-2 px-4 font-bold text-vna-blue">{row.flightNo}</td>
                          <td className="py-2 px-4">{row.acType}</td>
                          <td className="py-2 px-4 text-right font-mono">{row.fuelUplift}</td>
                          <td className="py-2 px-4 text-right font-mono">{row.fuelDefuel}</td>
                          <td className="py-2 px-4 text-right font-bold text-blue-700 font-mono">{row.fuelBurn}</td>
                          <td className="py-2 px-4 text-right font-mono text-black/45">{row.tripFuel}</td>
                          <td className="py-2 px-4 text-right font-mono text-black/45">{row.taxiFuel}</td>
                       </tr>
                    ))}

                    {/* SF CO2 Rows */}
                    {activeSourceTab.includes('SF CO2') && MOCK_SFCO2_DATA.map((row) => (
                       <tr key={row.id} className="hover:bg-blue-50 cursor-default">
                          <td className="py-2 px-4 font-medium">{row.date}</td>
                          <td className="py-2 px-4 font-bold text-vna-blue">{row.flightNo}</td>
                          <td className="py-2 px-4">{row.acType}</td>
                          <td className="py-2 px-4 text-green-700 font-medium">{row.initiative}</td>
                          <td className="py-2 px-4 text-right font-bold text-green-600 font-mono">{row.savingKg}</td>
                          <td className="py-2 px-4 text-right font-mono">{row.savingLiter}</td>
                          <td className="py-2 px-4 text-center"><span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">{row.compliance}</span></td>
                       </tr>
                    ))}

                    {/* Manual/Fallback Rows */}
                    {!['Netlines', 'FIMS'].includes(activeSourceTab) && !activeSourceTab.includes('SF CO2') && MOCK_MANUAL_DATA.map((row) => (
                       <tr key={row.id} className="hover:bg-blue-50 cursor-default">
                          <td className="py-2 px-4 font-medium">{row.date}</td>
                          <td className="py-2 px-4">{row.dataPoint}</td>
                          <td className="py-2 px-4 text-right font-bold">{row.value}</td>
                          <td className="py-2 px-4 text-black/45">{row.unit}</td>
                          <td className="py-2 px-4">{row.submitter}</td>
                          <td className="py-2 px-4"><span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded border border-orange-200">Pending</span></td>
                          <td className="py-2 px-4 text-center text-gray-400 hover:text-vna-blue cursor-pointer"><MoreHorizontal size={16}/></td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           
           {/* Simple Pagination */}
           <div className="bg-white border-t border-gray-200 p-2 flex justify-between items-center text-xs text-gray-600">
              <div className="pl-2">Hiển thị 15 / 120 dòng</div>
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
