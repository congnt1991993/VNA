
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Button, StatusChip, Select, Input, ReportingPeriodTreeSelect, Toast } from '../components/UI';
import { FileText, Download, Eye, UploadCloud, Globe, Lock, Share2, Search, FileDown, Database, CheckCircle, X, ChevronDown, ChevronRight, Save, Filter, ArrowLeft, MoreHorizontal, TrendingUp, DollarSign, Wind, Leaf, Info, ShieldCheck, BookOpen, Users, Award, Scale, Activity } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, ReferenceLine
} from 'recharts';
import { Document, Pillar } from '../types';

// --- TYPES & MOCK DATA ---

// Mock Data for Publish Selection (Based on Indicators)
interface PublishItem {
    id: string;
    code: string;
    name: string;
    pillar: Pillar;
    type: 'Dynamic' | 'Content';
    program: string;
    status: 'Approved'; // In this screen, we assume only approved items appear
    isPublished: boolean;
    category?: 'NetZero'; // Added category to distinguish NetZero plans
}

const INITIAL_PUBLISH_DATA: PublishItem[] = [
    // --- NET ZERO PLANS ---
    { id: 'NZ-1', code: 'NZ-SCENARIO-01', name: 'Kịch bản cơ sở (BAU) - 2025', pillar: Pillar.ENVIRONMENT, type: 'Dynamic', program: 'NetZero', status: 'Approved', isPublished: true, category: 'NetZero' },
    { id: 'NZ-2', code: 'NZ-SCENARIO-02', name: 'Kịch bản Cam kết NetZero', pillar: Pillar.ENVIRONMENT, type: 'Dynamic', program: 'NetZero', status: 'Approved', isPublished: false, category: 'NetZero' },

    // --- STANDARD INDICATORS ---
    { id: '1', code: 'Airline E-1', name: 'Tiếng ồn', pillar: Pillar.ENVIRONMENT, type: 'Dynamic', program: 'CORSIA', status: 'Approved', isPublished: true },
    { id: '2', code: 'GRI 302-1', name: 'Năng lượng tiêu thụ của tổ chức', pillar: Pillar.ENVIRONMENT, type: 'Dynamic', program: 'CORSIA', status: 'Approved', isPublished: true },
    { id: '3', code: 'GRI 302-4', name: 'Giảm tiêu thụ năng lượng', pillar: Pillar.ENVIRONMENT, type: 'Dynamic', program: 'EU ETS', status: 'Approved', isPublished: false },
    { id: '4', code: 'Airline B-1', name: 'Mức độ hài lòng của khách hàng (NPS)', pillar: Pillar.SOCIAL, type: 'Dynamic', program: '', status: 'Approved', isPublished: true },
    { id: '5', code: 'Airline B-2', name: 'Tương tác khách hàng', pillar: Pillar.SOCIAL, type: 'Dynamic', program: '', status: 'Approved', isPublished: false },
    { id: '6', code: 'Airline F-1', name: 'Tham gia hoạt động tình nguyện', pillar: Pillar.SOCIAL, type: 'Dynamic', program: '', status: 'Approved', isPublished: false },
    { id: '7', code: 'GRI 2-7', name: 'Quy mô tổ chức', pillar: Pillar.GOVERNANCE, type: 'Dynamic', program: '', status: 'Approved', isPublished: true },
    { id: '8', code: 'GRI 2-9', name: 'Cơ cấu và thành phần quản trị', pillar: Pillar.GOVERNANCE, type: 'Content', program: '', status: 'Approved', isPublished: true },
    { id: '9', code: 'GRI 404-2', name: 'Chương trình nâng cao kỹ năng nhân viên', pillar: Pillar.GOVERNANCE, type: 'Dynamic', program: '', status: 'Approved', isPublished: false },
];

// --- MOCK PREMIUM ESG DATA FOR VNA ---

const MOCK_ENV_FUEL_MIX = [
  { month: 'T1', jetA1: 104000, saf: 2500 },
  { month: 'T2', jetA1: 98000, saf: 3000 },
  { month: 'T3', jetA1: 105000, saf: 3800 },
  { month: 'T4', jetA1: 102000, saf: 4200 },
  { month: 'T5', jetA1: 108000, saf: 5100 },
  { month: 'T6', jetA1: 112000, saf: 5800 },
];

const MOCK_ENV_SAF_RATIOS = [
  { ratio: 'Blend 1%', volume: 1500, costSaved: 12000 },
  { ratio: 'Blend 2%', volume: 3200, costSaved: 25000 },
  { ratio: 'Blend 3%', volume: 4800, costSaved: 38000 },
  { ratio: 'Blend 5%', volume: 7500, costSaved: 62000 },
  { ratio: 'Blend 10%', volume: 12000, costSaved: 106950 },
];

const MOCK_ENV_EMISSIONS_INTENSITY = [
  { year: '2021', actual: 78.5, target: 79.0 },
  { year: '2022', actual: 77.2, target: 78.0 },
  { year: '2023', actual: 76.1, target: 77.0 },
  { year: '2024', actual: 74.8, target: 75.5 },
  { year: '2025', actual: 74.2, target: 74.5 },
];

const MOCK_SOC_DIVERSITY = [
  { name: 'Phi công (Pilots)', value: 12, fill: '#006885' },
  { name: 'Tiếp viên (Cabin Crew)', value: 45, fill: '#DBA410' },
  { name: 'Kỹ sư kỹ thuật (Tech)', value: 28, fill: '#10B981' },
  { name: 'Mặt đất & Khối CQ (Ground)', value: 15, fill: '#8B5CF6' },
];

const MOCK_SOC_TRAINING_DEPT = [
  { dept: 'Khối Khai thác', hours: 85 },
  { dept: 'Khối Kỹ thuật', hours: 120 },
  { dept: 'Khối Dịch vụ', hours: 90 },
  { dept: 'Khối Thương mại', hours: 65 },
  { dept: 'Khối Cơ quan', hours: 48 },
];

const MOCK_GOV_BOARD_BREAKDOWN = [
  { name: 'Thành viên Độc lập (Independent)', value: 3, fill: '#10B981' },
  { name: 'Thành viên Điều hành (Executive)', value: 4, fill: '#006885' },
  { name: 'Thành viên Không điều hành (Non-Executive)', value: 2, fill: '#DBA410' },
];

const MOCK_GOV_AUDIT_READINESS = [
  { module: 'Môi trường (E)', score: 92 },
  { module: 'Xã hội (S)', score: 95 },
  { module: 'Quản trị (G)', score: 96 },
  { module: 'Tài chính Xanh', score: 93 },
];

const MOCK_ENV_DATA_CO2 = [
  { month: 'T1', co2: 12000 },
  { month: 'T2', co2: 11500 },
  { month: 'T3', co2: 12800 },
  { month: 'T4', co2: 13000 },
  { month: 'T5', co2: 13200 },
  { month: 'T6', co2: 14000 },
];

const MOCK_ENV_DATA_SAVING = [
  { name: 'Single Engine Taxi', value: 150 },
  { name: 'Flight Optimization', value: 300 },
  { name: 'APU Usage', value: 80 },
  { name: 'Weight Reduction', value: 120 },
];

const MOCK_SOC_DATA_NPS = [
  { quarter: 'Q1', nps: 78 },
  { quarter: 'Q2', nps: 80 },
  { quarter: 'Q3', nps: 82 },
  { quarter: 'Q4', nps: 81 },
];

const MOCK_SOC_DATA_TRAINING = [
  { dept: 'Khối KT', hours: 2500 },
  { dept: 'Khối TM', hours: 1200 },
  { dept: 'Khối DV', hours: 3100 },
  { dept: 'Khối CQ', hours: 800 },
];

const MOCK_GOV_DATA_BOARD = [
  { name: 'Nam', value: 7, fill: '#006885' },
  { name: 'Nữ', value: 3, fill: '#DBA410' },
];

const MOCK_GOV_DATA_COMPLIANCE = [
  { month: 'T1', incidents: 0 },
  { month: 'T2', incidents: 0 },
  { month: 'T3', incidents: 1 }, // Warning
  { month: 'T4', incidents: 0 },
  { month: 'T5', incidents: 0 },
  { month: 'T6', incidents: 0 },
];

// --- MOCK CHART DATA FOR DETAIL DASHBOARD (PUBLISHING) ---
const MOCK_PUB_TREND = [
  { month: 'T1', actual: 850, target: 800 },
  { month: 'T2', actual: 880, target: 820 },
  { month: 'T3', actual: 870, target: 850 },
  { month: 'T4', actual: 900, target: 850 },
  { month: 'T5', actual: 920, target: 880 },
  { month: 'T6', actual: 950, target: 900 },
  { month: 'T7', actual: 980, target: 920 },
  { month: 'T8', actual: 960, target: 940 },
  { month: 'T9', actual: 990, target: 950 },
  { month: 'T10', actual: 1020, target: 980 },
];

const MOCK_PUB_DIST = [
  { name: 'Khối Cơ quan', value: 30, fill: '#006885' },
  { name: 'Khối Khai thác', value: 45, fill: '#DBA410' },
  { name: 'Khối Kỹ thuật', value: 25, fill: '#10B981' },
];

// --- MOCK DATA FOR NETZERO CHART ---
const MOCK_NZ_CHART_DATA = [
    { year: 2025, forecast: 12.5, target: 12.5 },
    { year: 2026, forecast: 13.1, target: 12.7 },
    { year: 2027, forecast: 13.8, target: 12.9 },
    { year: 2028, forecast: 14.2, target: 13.1 },
    { year: 2029, forecast: 14.8, target: 13.3 },
    { year: 2030, forecast: 15.2, target: 13.5 }, // Gap starts widening
    { year: 2031, forecast: 15.8, target: 13.2 },
    { year: 2032, forecast: 16.4, target: 12.9 },
    { year: 2033, forecast: 17.0, target: 12.6 },
    { year: 2034, forecast: 17.5, target: 12.3 },
    { year: 2035, forecast: 18.0, target: 12.0 },
];

// --- MAIN PAGE COMPONENT ---

export const ReportsPage: React.FC<{ mode: 'bi-env' | 'bi-soc' | 'bi-gov' | 'publishing' | 'documents' }> = ({ mode }) => {
  // State for Publishing Mode
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['2025']);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedIndicatorId, setSelectedIndicatorId] = useState(''); // Replaced searchText with Dropdown ID
  const [publishData, setPublishData] = useState<PublishItem[]>(INITIAL_PUBLISH_DATA);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  // State for BI Mode
  const [biPeriods, setBiPeriods] = useState<string[]>(['2025']);

  // State for Detail View
  const [detailItem, setDetailItem] = useState<PublishItem | null>(null);

  // States for Sub-Indicators tabs
  const [envSubTab, setEnvSubTab] = useState<'302-1' | '305-4' | '302-4'>('302-1');
  const [socSubTab, setSocSubTab] = useState<'404-2' | 'B-1' | '403-9'>('404-2');
  const [govSubTab, setGovSubTab] = useState<'2-9' | 'PL02'>('2-9');

  const handleTogglePublish = (id: string) => {
     setPublishData(prev => prev.map(item => 
        item.id === id ? { ...item, isPublished: !item.isPublished } : item
     ));
     setToast({ message: 'Đã cập nhật trạng thái công bố!', type: 'success' });
  };
  
  // BI Embedded View (Môi trường / Xã hội / Quản trị)
  if (mode === 'bi-env' || mode === 'bi-soc' || mode === 'bi-gov') {
    const title = mode === 'bi-env' ? 'Môi trường (Environment)' : mode === 'bi-soc' ? 'Xã hội (Social)' : 'Quản trị (Governance)';
    
    return (
      <div className="space-y-6">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-200">
           <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-vna-blue">{title} Dashboard</h2>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">Live Data</span>
           </div>
           {/* Replaced Year/Scope Selects with ReportingPeriodTreeSelect + Buttons */}
           <div className="flex items-end gap-2">
                <div className="w-72">
                    <ReportingPeriodTreeSelect 
                        selected={biPeriods}
                        onChange={setBiPeriods}
                    />
                </div>
                <Button className="h-[38px] w-[38px] p-0 flex items-center justify-center bg-vna-blue hover:bg-vna-blue/90" title="Tìm kiếm" onClick={() => setToast({ message: 'Đang tải dữ liệu...', type: 'info' })}>
                    <Search size={18}/>
                </Button>
                <Button 
                    variant="outline" 
                    className="h-[38px] w-[38px] p-0 flex items-center justify-center text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50" 
                    onClick={() => setBiPeriods([])}
                    title="Xóa lọc"
                >
                    <X size={18}/>
                </Button>
           </div>
        </div>

        {/* Dashboard Content Based on Mode */}
        {mode === 'bi-env' && (
            <div className="space-y-6">
                {/* 4 Bento Cards Top Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="bg-[#006885]/5 border border-[#006885]/10 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 hover:shadow-md transition-all duration-200 relative group">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-[#006885]/10 text-[#006885] rounded-lg">
                                <Leaf size={20} />
                            </div>
                            <div className="relative cursor-help">
                                <Info size={16} className="text-gray-400 hover:text-vna-blue" />
                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal">
                                    <div className="absolute bottom-0 right-3 translate-y-full border-4 border-transparent border-t-[#0d1525]/95"></div>
                                    <p className="font-bold text-[#DBA410] mb-1">GRI 302-1: Tiêu thụ năng lượng</p>
                                    Tổng năng lượng tiêu thụ được quy đổi ra Tấn dầu tương đương hoặc đơn vị nhiệt trị. Bao gồm tiêu thụ Jet A-1 cho đội bay và điện mặt đất.
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-4">Năng lượng tiêu thụ (GRI 302-1)</p>
                        <h3 className="text-2xl font-black text-black/85 mt-1">1.25M <span className="text-xs font-bold text-black/45">tấn</span></h3>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                            <TrendingUp size={12} /> Giảm 45k tấn nhờ tối ưu đường bay
                        </div>
                    </div>

                    <div className="bg-[#DBA410]/5 border border-[#DBA410]/15 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 hover:shadow-md transition-all duration-200 relative group">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-[#DBA410]/10 text-[#DBA410] rounded-lg">
                                <Wind size={20} />
                            </div>
                            <div className="relative cursor-help">
                                <Info size={16} className="text-gray-400 hover:text-vna-blue" />
                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal">
                                    <div className="absolute bottom-0 right-3 translate-y-full border-4 border-transparent border-t-[#0d1525]/95"></div>
                                    <p className="font-bold text-[#DBA410] mb-1">CT 1.5: Tỷ lệ pha trộn SAF</p>
                                    Lượng SAF tiêu thụ thực tế pha trộn vào Jet A-1 tại các sân bay áp dụng cơ chế bắt buộc (ReFuelEU) và cấn trừ tự nguyện.
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-4">Tỷ lệ pha trộn SAF (CT 1.5)</p>
                        <h3 className="text-2xl font-black text-black/85 mt-1">5.2%</h3>
                        <div className="text-[10px] text-[#DBA410] font-bold mt-2 flex items-center gap-1">
                            <CheckCircle size={12} className="text-[#DBA410]" /> Đạt mục tiêu kế hoạch (Target: 5.0%)
                        </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 hover:shadow-md transition-all duration-200 relative group">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                                <Activity size={20} />
                            </div>
                            <div className="relative cursor-help">
                                <Info size={16} className="text-gray-400 hover:text-vna-blue" />
                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal">
                                    <div className="absolute bottom-0 right-3 translate-y-full border-4 border-transparent border-t-[#0d1525]/95"></div>
                                    <p className="font-bold text-[#DBA410] mb-1">GRI 305-4: Cường độ phát thải</p>
                                    Được tính bằng <strong>Tấn CO2 / 100 RTK</strong>. Phản ánh hiệu quả sử dụng nhiên liệu trên mỗi đơn vị tải vận chuyển hành khách và hàng hóa.
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-4">Cường độ phát thải (GRI 305-4)</p>
                        <h3 className="text-2xl font-black text-black/85 mt-1">74.2 <span className="text-xs font-bold text-black/45">tCO2/100 RTK</span></h3>
                        <div className="text-[10px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                            <TrendingUp size={12} /> Tối ưu hơn 0.4% so với target (74.5)
                        </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 hover:shadow-md transition-all duration-200 relative group">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                                <DollarSign size={20} />
                            </div>
                            <div className="relative cursor-help">
                                <Info size={16} className="text-gray-400 hover:text-vna-blue" />
                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal">
                                    <div className="absolute bottom-0 right-3 translate-y-full border-4 border-transparent border-t-[#0d1525]/95"></div>
                                    <p className="font-bold text-[#DBA410] mb-1">Tối ưu cấn trừ SAF</p>
                                    Lợi ích tài chính cấn trừ tối ưu lượng CO2 giảm thiểu từ SAF sang các nghĩa vụ thuế carbon đắt hơn (EU-ETS, UK-ETS) thay vì CORSIA.
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-4">Tối ưu cấn trừ SAF tài chính</p>
                        <h3 className="text-2xl font-black text-indigo-800 mt-1">$106,950 <span className="text-xs font-bold text-gray-400">USD</span></h3>
                        <div className="text-[10px] text-indigo-700 font-semibold mt-2 flex items-center gap-1">
                            <CheckCircle size={12} /> Tiết kiệm tối ưu 23% chi phí đền bù
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-bold text-black/85">Cơ cấu Tiêu thụ Nhiên liệu Đội bay (GRI 302-1)</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Xu hướng tiêu thụ Jet A-1 vs SAF pha trộn theo tháng (Tấn)</p>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={MOCK_ENV_FUEL_MIX} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                    <defs>
                                        <linearGradient id="colorJetA1" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#006885" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#006885" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorSaf" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fill: '#6B7280', fontSize: 11}} />
                                    <YAxis tickLine={false} axisLine={false} tick={{fill: '#6B7280', fontSize: 10}} />
                                    <Tooltip contentStyle={{borderRadius: '8px', fontSize: '11px'}} />
                                    <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                                    <Area type="monotone" dataKey="jetA1" name="Nhiên liệu hóa thạch Jet A-1" stroke="#006885" strokeWidth={2} fillOpacity={1} fill="url(#colorJetA1)" />
                                    <Area type="monotone" dataKey="saf" name="Nhiên liệu sinh học SAF" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSaf)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-bold text-black/85">Hiệu quả và Tỷ lệ pha trộn SAF (CT 1.5)</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Sản lượng SAF pha trộn quy đổi & Số tiền đền bù tương ứng được giảm thiểu</p>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={MOCK_ENV_SAF_RATIOS} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="ratio" tickLine={false} axisLine={false} tick={{fill: '#6B7280', fontSize: 11}} />
                                    <YAxis tickLine={false} axisLine={false} tick={{fill: '#6B7280', fontSize: 10}} />
                                    <Tooltip contentStyle={{borderRadius: '8px', fontSize: '11px'}} />
                                    <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                                    <Bar dataKey="volume" name="Khối lượng SAF pha trộn (Tấn)" fill="#006885" radius={[4, 4, 0, 0]} barSize={25} />
                                    <Bar dataKey="costSaved" name="Lợi ích cấn trừ đền bù ($ USD)" fill="#DBA410" radius={[4, 4, 0, 0]} barSize={25} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Emissions Intensity and Explanation */}
                <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-8 h-[300px] flex flex-col">
                            <div className="mb-4">
                                <h3 className="font-bold text-black/85">Xu hướng Cường độ phát thải CO2 (GRI 305-4)</h3>
                                <p className="text-xs text-gray-400 mt-0.5">So sánh Cường độ thực tế vs Hạn mức định hướng VNA (Tấn CO2 / 100 RTK)</p>
                            </div>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={MOCK_ENV_EMISSIONS_INTENSITY} margin={{top: 10, right: 10, left: -25, bottom: 0}}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{fill: '#6B7280', fontSize: 11}} />
                                        <YAxis tickLine={false} axisLine={false} tick={{fill: '#6B7280', fontSize: 10}} domain={['auto', 'auto']} />
                                        <Tooltip contentStyle={{borderRadius: '8px', fontSize: '11px'}} />
                                        <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                                        <Line type="monotone" dataKey="actual" name="Cường độ thực tế" stroke="#10B981" strokeWidth={3} dot={{r: 5, fill: '#10B981'}} activeDot={{r: 8}} />
                                        <Line type="monotone" dataKey="target" name="Định mức định hướng" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={{r: 4, fill: '#EF4444'}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="lg:col-span-4 bg-gray-50/70 border border-gray-200/60 p-5 rounded-lg space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                                <Info size={16} className="text-[#006885]" />
                                <h4 className="text-xs font-bold text-[#006885] uppercase tracking-wide">Giải thích logic tính toán</h4>
                            </div>
                            <div className="text-xs text-gray-600 space-y-3 leading-relaxed">
                                <p>
                                    <strong>1. Công thức Cường độ phát thải (GRI 305-4):</strong>
                                    <span className="block mt-1 bg-white p-2 rounded border border-gray-200 font-mono text-[10px] text-black/85">
                                        Cường độ = Tổng lượng CO2 (Tấn) / (Tổng RTK / 100)
                                    </span>
                                    Quy chuẩn ICAO tính toán lượng phát thải CO2 từ mức tiêu thụ nhiên liệu Jet A-1 nhân với hệ số phát thải mặc định là <strong>3.16</strong>.
                                </p>
                                <p>
                                    <strong>2. Liên hệ trực quan biểu đồ (Năm 2025):</strong>
                                    Cường độ thực tế trên biểu đồ đạt <strong>74.2 tCO2/100 RTK</strong>, vượt chỉ tiêu định hướng (<strong>74.5</strong>). Con số này được tính toán khoa học từ các chỉ tiêu con nghiệp vụ bên dưới:
                                    <span className="block mt-1 bg-white p-1 rounded border border-gray-200 font-mono text-[9px] text-gray-700 leading-tight">
                                        • Tổng CO2 (CT 1.2): 3,925,000 Tấn<br/>
                                        • Tổng RTK (CT 1.3): 5,289,757 (1.000 RTK)<br/>
                                        • Tính toán: 3,925,000 / 52,897.57 = 74.2 tCO2 / 100 RTK
                                    </span>
                                    Sự sụt giảm cường độ từ <strong>78.5 (2021)</strong> xuống <strong>74.2 (2025)</strong> chứng minh hiệu quả tối ưu hóa đường bay của Tổ Khai thác.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VNA ESG SUB-INDICATORS DETAILED TABLE SECTION */}
                <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 mt-6 animate-in fade-in duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-150 gap-4">
                        <div>
                            <h3 className="font-bold text-black/85 text-base flex items-center gap-2">
                                <Database size={18} className="text-[#006885]" />
                                Chi tiết Chỉ tiêu con Nghiệp vụ VNA (Business Sub-Indicators Breakdown)
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">Tra cứu đầy đủ 4-5 chỉ tiêu con cho mỗi chỉ tiêu chuẩn quốc tế theo tài liệu nghiệp vụ</p>
                        </div>
                        {/* Selector tabs for E indicators */}
                        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                            <button 
                                onClick={() => setEnvSubTab('302-1')} 
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${envSubTab === '302-1' ? 'bg-[#006885] text-white shadow-xs' : 'text-gray-600 hover:text-black/85'}`}
                            >
                                GRI 302-1 (Tiêu thụ)
                            </button>
                            <button 
                                onClick={() => setEnvSubTab('305-4')} 
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${envSubTab === '305-4' ? 'bg-[#006885] text-white shadow-xs' : 'text-gray-600 hover:text-black/85'}`}
                            >
                                GRI 305-4 (Cường độ)
                            </button>
                            <button 
                                onClick={() => setEnvSubTab('302-4')} 
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${envSubTab === '302-4' ? 'bg-[#006885] text-white shadow-xs' : 'text-gray-600 hover:text-black/85'}`}
                            >
                                GRI 302-4 / 305-5 (Tiết kiệm)
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600">
                                    <th className="py-2.5 px-4 w-28">Mã chỉ tiêu con</th>
                                    <th className="py-2.5 px-4 w-2/5">Tên chỉ tiêu con (Vietnamese & English)</th>
                                    <th className="py-2.5 px-4 text-right">Thực tế (YTD)</th>
                                    <th className="py-2.5 px-4 text-right">Định mức / Kế hoạch</th>
                                    <th className="py-2.5 px-4 text-center">Đơn vị tính</th>
                                    <th className="py-2.5 px-4">Đơn vị phụ trách</th>
                                    <th className="py-2.5 px-4 text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-750">
                                {envSubTab === '302-1' && [
                                    { code: 'CT 1.1', name: 'Total fuel consumption – Tổng nhiên liệu tiêu thụ', val: '1,245,000,000', tgt: '1,250,000,000', unit: 'Lít', dept: 'Tổ Khai thác', status: 'Đạt' },
                                    { code: 'CT 1.2', name: 'Jet A-1 Fuel Consumption – Nhiên liệu tiêu thụ Jet A-1', val: '1,180,000,000', tgt: '1,200,000,000', unit: 'Lít', dept: 'Tổ Khai thác', status: 'Đạt' },
                                    { code: 'CT 1.3', name: 'SAF Fuel Consumption – Nhiên liệu tiêu thụ SAF', val: '65,000,000', tgt: '50,000,000', unit: 'Lít', dept: 'Tổ Kỹ thuật', status: 'Vượt' },
                                    { code: 'CT 1.4', name: 'Fuel Type Distribution – Tỷ lệ các loại nhiên liệu', val: '94.8% Jet / 5.2% SAF', tgt: '95.0% / 5.0%', unit: '%', dept: 'Tổ Khai thác', status: 'Đạt' },
                                    { code: 'CT 1.5', name: 'SAF Consumption by SAF Blending Ratio – Tiêu thụ SAF theo tỷ lệ pha trộn SAF', val: '5.2%', tgt: '5.0%', unit: '%', dept: 'Tổ Kỹ thuật', status: 'Đạt' },
                                    { code: 'CT 1.6', name: 'Annual Fuel Consumption vs Target – Tiêu thụ nhiên liệu theo năm so với mục tiêu', val: '1,245,000,000', tgt: '1,250,000,000', unit: 'Lít', dept: 'Tổ Khai thác', status: 'Đạt' },
                                    { code: 'CT 1.7', name: 'Monthly Fuel Consumption in the Current Year – Tiêu thụ nhiên liệu theo tháng trong năm hiện tại', val: 'Có dữ liệu', tgt: 'Đối chiếu', unit: 'Lít', dept: 'Tổ Khai thác', status: 'Đạt' },
                                    { code: 'CT 1.8', name: 'Monthly Fuel Consumption Across Years – Tiêu thụ nhiên liệu theo tháng qua các năm', val: 'Có dữ liệu', tgt: 'Đối chiếu', unit: 'Lít', dept: 'Tổ Khai thác', status: 'Đạt' }
                                ].map((item, index) => (
                                    <tr key={index} className="hover:bg-blue-50/45 transition-colors">
                                        <td className="py-3 px-4 font-bold text-vna-blue">{item.code}</td>
                                        <td className="py-3 px-4 font-semibold text-black/85">{item.name}</td>
                                        <td className="py-3 px-4 font-bold text-gray-900 text-right">{item.val}</td>
                                        <td className="py-3 px-4 font-medium text-black/45 text-right">{item.tgt}</td>
                                        <td className="py-3 px-4 text-center text-gray-650">{item.unit}</td>
                                        <td className="py-3 px-4 text-black/45 font-medium">{item.dept}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.status === 'Vượt' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-green-50 text-green-700 border-green-200'}`}>{item.status}</span>
                                        </td>
                                    </tr>
                                ))}
                                {envSubTab === '305-4' && [
                                    { code: 'CT 1.1', name: 'Tổng cường độ phát thải khí nhà kính (Total emissions intensity)', val: '74.2', tgt: '74.5', unit: 'tCO2/100 RTK', dept: 'Tổ Khai thác', status: 'Đạt' },
                                    { code: 'CT 1.2', name: 'Tổng lượng phát thải khí nhà kính tuyệt đối (Total absolute GHG emissions)', val: '3,925,000', tgt: '4,000,000', unit: 'Tấn CO2e', dept: 'Tổ Khai thác', status: 'Đạt' },
                                    { code: 'CT 1.3', name: 'Tổng RTK hàng không thương mại (Total Revenue Tonne Kilometers)', val: '5,289,757', tgt: '5,369,000', unit: '1.000 RTK', dept: 'Khối Thương mại', status: 'Đạt' },
                                    { code: 'CT 1.4', name: 'Cường độ phát thải theo năm vs. Target', val: '74.2', tgt: '74.5', unit: 'tCO2/100 RTK', dept: 'Tổ Khai thác', status: 'Đạt' },
                                    { code: 'CT 1.5', name: 'Cường độ phát thải theo tháng năm hiện tại', val: '74.2', tgt: '74.5', unit: 'tCO2/100 RTK', dept: 'Tổ Khai thác', status: 'Đạt' },
                                    { code: 'CT 1.6', name: 'Cường độ phát thải theo tháng năm bất kỳ', val: '76.1', tgt: '77.0', unit: 'tCO2/100 RTK', dept: 'Tổ Khai thác', status: 'Đạt' }
                                ].map((item, index) => (
                                    <tr key={index} className="hover:bg-blue-50/45 transition-colors">
                                        <td className="py-3 px-4 font-bold text-vna-blue">{item.code}</td>
                                        <td className="py-3 px-4 font-semibold text-black/85">{item.name}</td>
                                        <td className="py-3 px-4 font-bold text-gray-900 text-right">{item.val}</td>
                                        <td className="py-3 px-4 font-medium text-black/45 text-right">{item.tgt}</td>
                                        <td className="py-3 px-4 text-center text-gray-650">{item.unit}</td>
                                        <td className="py-3 px-4 text-black/45 font-medium">{item.dept}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-green-50 text-green-700 border-green-200">Đạt</span>
                                        </td>
                                    </tr>
                                ))}
                                {envSubTab === '302-4' && [
                                    { code: 'CT 1.1', name: 'Total Energy Saved – Tổng năng lượng tiết kiệm', val: '45,000,000', tgt: '40,000,000', unit: 'Lít', dept: 'Tổ Khai thác', status: 'Vượt' },
                                    { code: 'CT 1.2', name: 'Total Fuel Saved – Tổng tiết kiệm nhiên liệu', val: '35,550,000', tgt: '31,600,000', unit: 'kg', dept: 'Tổ Khai thác', status: 'Vượt' },
                                    { code: 'CT 1.3', name: 'Total Reduction of Emissions – Tổng giảm phát thải khí nhà kính', val: '112,287', tgt: '99,800', unit: 'Tấn CO2e', dept: 'Tổ Khai thác', status: 'Vượt' },
                                    { code: 'CT 1.4', name: 'Annual Energy Saved vs Target – Năng lượng tiết kiệm theo năm so với mục tiêu', val: '45,000,000', tgt: '40,000,000', unit: 'Lít', dept: 'Tổ Khai thác', status: 'Vượt' },
                                    { code: 'CT 1.5', name: 'Annual Fuel Saved vs Target – Kết quả tiết kiệm nhiên liệu theo năm so với mục tiêu', val: '35,550,000', tgt: '31,600,000', unit: 'kg', dept: 'Tổ Khai thác', status: 'Vượt' },
                                    { code: 'CT 1.6', name: 'Monthly Energy Saved in Current Year – Năng lượng tiết kiệm theo tháng trong năm hiện tại', val: 'Có dữ liệu', tgt: 'Đối chiếu', unit: 'Lít', dept: 'Tổ Khai thác', status: 'Đạt' },
                                    { code: 'CT 1.7', name: 'Monthly Energy Saved Across Years – Năng lượng tiết kiệm theo tháng qua các năm', val: 'Có dữ liệu', tgt: 'Đối chiếu', unit: 'Lít', dept: 'Tổ Khai thác', status: 'Đạt' }
                                ].map((item, index) => (
                                    <tr key={index} className="hover:bg-blue-50/45 transition-colors">
                                        <td className="py-3 px-4 font-bold text-vna-blue">{item.code}</td>
                                        <td className="py-3 px-4 font-semibold text-black/85">{item.name}</td>
                                        <td className="py-3 px-4 font-bold text-gray-900 text-right">{item.val}</td>
                                        <td className="py-3 px-4 font-medium text-black/45 text-right">{item.tgt}</td>
                                        <td className="py-3 px-4 text-center text-gray-650">{item.unit}</td>
                                        <td className="py-3 px-4 text-black/45 font-medium">{item.dept}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.status === 'Vượt' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-green-50 text-green-700 border-green-200'}`}>{item.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {mode === 'bi-soc' && (
            <div className="space-y-6">
                {/* 3 Bento Cards Top Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 hover:shadow-md transition-all duration-200 relative group">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                                <Award size={20} />
                            </div>
                            <div className="relative cursor-help">
                                <Info size={16} className="text-gray-400 hover:text-vna-blue" />
                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal">
                                    <div className="absolute bottom-0 right-3 translate-y-full border-4 border-transparent border-t-[#0d1525]/95"></div>
                                    <p className="font-bold text-[#DBA410] mb-1">Flight Safety Audit (IOSA)</p>
                                    Chứng nhận Đánh giá An toàn Khai thác của IATA. Đây là chứng chỉ an toàn hàng không toàn cầu bắt buộc duy trì định kỳ 2 năm một lần.
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-4">An toàn khai thác bay (IOSA)</p>
                        <h3 className="text-2xl font-black text-black/85 mt-1">100% Tuân thủ</h3>
                        <div className="text-[10px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                            <CheckCircle size={12} /> 0 lỗi nghiêm trọng, Chứng nhận hiệu lực
                        </div>
                    </div>

                    <div className="bg-[#006885]/5 border border-[#006885]/10 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 hover:shadow-md transition-all duration-200 relative group">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-[#006885]/10 text-[#006885] rounded-lg">
                                <Users size={20} />
                            </div>
                            <div className="relative cursor-help">
                                <Info size={16} className="text-gray-400 hover:text-vna-blue" />
                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal">
                                    <div className="absolute bottom-0 right-3 translate-y-full border-4 border-transparent border-t-[#0d1525]/95"></div>
                                    <p className="font-bold text-[#DBA410] mb-1">Airline B-1: Chỉ số hài lòng khách hàng NPS</p>
                                    Đo lường sự trung thành và mức độ hài lòng của khách hàng qua hệ thống khảo sát tự động Qualtrics tích hợp ngay sau chuyến bay.
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-4">Mức độ hài lòng của khách hàng (NPS)</p>
                        <h3 className="text-2xl font-black text-black/85 mt-1">82 / 100</h3>
                        <div className="text-[10px] text-[#006885] font-semibold mt-2 flex items-center gap-1">
                            <TrendingUp size={12} /> Vượt 2 điểm so với kế hoạch (Target: 80)
                        </div>
                    </div>

                    <div className="bg-[#DBA410]/5 border border-[#DBA410]/15 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 hover:shadow-md transition-all duration-200 relative group">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-[#DBA410]/10 text-[#DBA410] rounded-lg">
                                <BookOpen size={20} />
                            </div>
                            <div className="relative cursor-help">
                                <Info size={16} className="text-gray-400 hover:text-vna-blue" />
                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal">
                                    <div className="absolute bottom-0 right-3 translate-y-full border-4 border-transparent border-t-[#0d1525]/95"></div>
                                    <p className="font-bold text-[#DBA410] mb-1">GRI 404-2: Nâng cao năng lực nhân sự</p>
                                    Số giờ đào tạo bình quân hàng năm của mỗi nhân viên, tập trung vào an toàn bay, dịch vụ khách hàng chất lượng 5 sao, và nâng cao tay nghề kỹ thuật.
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-4">Giờ đào tạo trung bình (GRI 404-2)</p>
                        <h3 className="text-2xl font-black text-black/85 mt-1">90 <span className="text-xs font-bold text-black/45">giờ/nhân viên</span></h3>
                        <div className="text-[10px] text-[#DBA410] font-bold mt-2 flex items-center gap-1">
                            <CheckCircle size={12} className="text-[#DBA410]" /> Đạt 95% mục tiêu đào tạo của Tổng công ty
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 h-[400px] flex flex-col">
                        <div className="mb-4">
                            <h3 className="font-bold text-black/85">Cơ cấu Lao động & Đa dạng Giới (GRI 2-7)</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Tỷ trọng các nhóm nhân sự chủ chốt trong Vietnam Airlines</p>
                        </div>
                        <div className="flex-1 min-h-0 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={MOCK_SOC_DIVERSITY} 
                                        cx="50%" 
                                        cy="45%" 
                                        innerRadius={65} 
                                        outerRadius={95} 
                                        dataKey="value" 
                                        paddingAngle={4}
                                        label={({name, percent}) => `${name.split(' (')[0]}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {MOCK_SOC_DIVERSITY.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '8px', fontSize: '11px'}} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 h-[400px] flex flex-col">
                        <div className="mb-4">
                            <h3 className="font-bold text-black/85">Giờ Đào tạo Trung bình theo Khối (GRI 404-2)</h3>
                            <p className="text-xs text-gray-400 mt-0.5">So sánh giờ huấn luyện nâng cao kỹ năng bình quân đầu người trong năm</p>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={MOCK_SOC_TRAINING_DEPT} margin={{top: 10, right: 10, left: -25, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="dept" tickLine={false} axisLine={false} tick={{fill: '#6B7280', fontSize: 10}} />
                                    <YAxis tickLine={false} axisLine={false} tick={{fill: '#6B7280', fontSize: 10}} />
                                    <Tooltip contentStyle={{borderRadius: '8px', fontSize: '11px'}} />
                                    <Bar dataKey="hours" name="Giờ đào tạo trung bình" fill="#DBA410" radius={[4, 4, 0, 0]} barSize={35}>
                                        {MOCK_SOC_TRAINING_DEPT.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 1 ? '#006885' : '#DBA410'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Customer Satisfaction Metrics & Calculation */}
                <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-8 h-[300px] flex flex-col">
                            <div className="mb-4">
                                <h3 className="font-bold text-black/85">Chỉ số Hài lòng của Khách hàng (NPS - Airline B-1)</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Biến động chỉ số Net Promoter Score qua các quý của năm 2025</p>
                            </div>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={MOCK_SOC_DATA_NPS} margin={{top: 10, right: 15, left: -25, bottom: 0}}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="quarter" tickLine={false} axisLine={false} tick={{fill: '#6B7280', fontSize: 11}} />
                                        <YAxis tickLine={false} axisLine={false} tick={{fill: '#6B7280', fontSize: 10}} domain={[0, 100]} />
                                        <Tooltip contentStyle={{borderRadius: '8px', fontSize: '11px'}} />
                                        <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                                        <Line type="monotone" dataKey="nps" name="Chỉ số NPS Thực tế" stroke="#006885" strokeWidth={3.5} dot={{r: 6, fill: '#006885'}} activeDot={{r: 9}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="lg:col-span-4 bg-gray-50/70 border border-gray-200/60 p-5 rounded-lg space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                                <Info size={16} className="text-[#006885]" />
                                <h4 className="text-xs font-bold text-[#006885] uppercase tracking-wide">Giải thích logic & Nghiệp vụ</h4>
                            </div>
                            <div className="text-xs text-gray-600 space-y-3 leading-relaxed">
                                <p>
                                    <strong>1. Chỉ số NPS (Airline B-1):</strong>
                                    Đo lường mức độ thiện cảm thương hiệu của khách hàng sau chuyến bay:
                                    <span className="block mt-1 bg-white p-2 rounded border border-gray-200 font-mono text-[10px] text-black/85">
                                        NPS = % Promoters - % Detractors
                                    </span>
                                    • <strong>Promoters (9-10đ):</strong> Khách hàng cực kỳ hài lòng và sẵn sàng giới thiệu VNA.<br/>
                                    • <strong>Passives (7-8đ):</strong> Hài lòng nhưng trung lập.<br/>
                                    • <strong>Detractors (0-6đ):</strong> Chưa hài lòng về dịch vụ.
                                </p>
                                <p>
                                    <strong>2. Phân tích Chi tiết trên Biểu đồ & Bảng số liệu:</strong>
                                    Chỉ số NPS bình quân năm 2025 duy trì ở mức xuất sắc <strong>&gt;80</strong> (Q3 đạt đỉnh <strong>82 điểm</strong> trên biểu đồ bên cạnh).
                                    Khi bóc tách sâu theo phân khúc hạng dịch vụ (ở bảng chỉ tiêu con bên dưới):
                                    <span className="block mt-1 bg-white p-1.5 rounded border border-gray-200 font-mono text-[9px] text-gray-700 leading-tight">
                                        • Hạng Thương gia (CT 1.1): 88 điểm (Target: 85)<br/>
                                        • Hạng Phổ thông (CT 1.2): 78 điểm (Target: 75)
                                    </span>
                                    Kết quả này thể hiện sự đột phá của Tổ Dịch vụ trong việc nâng cấp phòng chờ Lotus Lounge và chuyển đổi số quy trình thủ tục bay.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VNA ESG SOCIAL SUB-INDICATORS TABLE SECTION */}
                <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 mt-6 animate-in fade-in duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-150 gap-4">
                        <div>
                            <h3 className="font-bold text-black/85 text-base flex items-center gap-2">
                                <Users size={18} className="text-[#006885]" />
                                Chi tiết Chỉ tiêu con Trụ cột Xã hội (Social Sub-Indicators Breakdown)
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">Chi tiết các chỉ tiêu lao động, an toàn sức khỏe nghề nghiệp và hài lòng khách hàng</p>
                        </div>
                        {/* Selector tabs for S indicators */}
                        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                            <button 
                                onClick={() => setSocSubTab('404-2')} 
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${socSubTab === '404-2' ? 'bg-[#006885] text-white shadow-xs' : 'text-gray-600 hover:text-black/85'}`}
                            >
                                GRI 404-2 (Đào tạo)
                            </button>
                            <button 
                                onClick={() => setSocSubTab('B-1')} 
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${socSubTab === 'B-1' ? 'bg-[#006885] text-white shadow-xs' : 'text-gray-600 hover:text-black/85'}`}
                            >
                                Airline B-1 (NPS)
                            </button>
                            <button 
                                onClick={() => setSocSubTab('403-9')} 
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${socSubTab === '403-9' ? 'bg-[#006885] text-white shadow-xs' : 'text-gray-600 hover:text-black/85'}`}
                            >
                                GRI 403-9 (An toàn)
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600">
                                    <th className="py-2.5 px-4 w-28">Mã chỉ tiêu con</th>
                                    <th className="py-2.5 px-4 w-2/5">Tên chỉ tiêu con (Vietnamese & English)</th>
                                    <th className="py-2.5 px-4 text-right">Thực tế (YTD)</th>
                                    <th className="py-2.5 px-4 text-right">Định mức / Kế hoạch</th>
                                    <th className="py-2.5 px-4 text-center">Đơn vị tính</th>
                                    <th className="py-2.5 px-4">Đơn vị phụ trách</th>
                                    <th className="py-2.5 px-4 text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-750">
                                {socSubTab === '404-2' && [
                                    { code: 'CT 1.1', name: 'Giờ đào tạo trung bình Khối Kỹ thuật (AML Training)', val: '120', tgt: '100', unit: 'Giờ/nhân viên', dept: 'Ban TCNL', status: 'Đạt' },
                                    { code: 'CT 1.2', name: 'Giờ đào tạo trung bình Khối Khai thác (Pilot Flight Ops)', val: '85', tgt: '80', unit: 'Giờ/nhân viên', dept: 'Ban TCNL', status: 'Đạt' },
                                    { code: 'CT 1.3', name: 'Giờ đào tạo trung bình Khối Dịch vụ (Cabin Service)', val: '90', tgt: '85', unit: 'Giờ/nhân viên', dept: 'Ban TCNL', status: 'Đạt' },
                                    { code: 'CT 1.4', name: 'Tỷ lệ nhân viên được đánh giá năng lực nghề nghiệp (GRI 404-3)', val: '98%', tgt: '95%', unit: '%', dept: 'Ban TCNL', status: 'Đạt' }
                                ].map((item, index) => (
                                    <tr key={index} className="hover:bg-blue-50/45 transition-colors">
                                        <td className="py-3 px-4 font-bold text-vna-blue">{item.code}</td>
                                        <td className="py-3 px-4 font-semibold text-black/85">{item.name}</td>
                                        <td className="py-3 px-4 font-bold text-gray-900 text-right">{item.val}</td>
                                        <td className="py-3 px-4 font-medium text-black/45 text-right">{item.tgt}</td>
                                        <td className="py-3 px-4 text-center text-gray-650">{item.unit}</td>
                                        <td className="py-3 px-4 text-black/45 font-medium">{item.dept}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-green-50 text-green-700 border-green-200">Đạt</span>
                                        </td>
                                    </tr>
                                ))}
                                {socSubTab === 'B-1' && [
                                    { code: 'CT 1.1', name: 'Chỉ số NPS khách hàng Hạng Thương gia (Business Class NPS)', val: '88', tgt: '85', unit: 'Điểm', dept: 'Tổ Dịch vụ', status: 'Vượt' },
                                    { code: 'CT 1.2', name: 'Chỉ số NPS khách hàng Hạng Phổ thông (Economy Class NPS)', val: '78', tgt: '75', unit: 'Điểm', dept: 'Tổ Dịch vụ', status: 'Vượt' },
                                    { code: 'CT 1.3', name: 'Số khiếu nại được xác thực về bảo mật dữ liệu (GRI 418-1)', val: '0', tgt: '0', unit: 'Vụ việc', dept: 'Ban CĐSCN', status: 'Đạt' }
                                ].map((item, index) => (
                                    <tr key={index} className="hover:bg-blue-50/45 transition-colors">
                                        <td className="py-3 px-4 font-bold text-vna-blue">{item.code}</td>
                                        <td className="py-3 px-4 font-semibold text-black/85">{item.name}</td>
                                        <td className="py-3 px-4 font-bold text-gray-900 text-right">{item.val}</td>
                                        <td className="py-3 px-4 font-medium text-black/45 text-right">{item.tgt}</td>
                                        <td className="py-3 px-4 text-center text-gray-650">{item.unit}</td>
                                        <td className="py-3 px-4 text-black/45 font-medium">{item.dept}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.status === 'Vượt' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-green-50 text-green-700 border-green-200'}`}>{item.status}</span>
                                        </td>
                                    </tr>
                                ))}
                                {socSubTab === '403-9' && [
                                    { code: 'CT 1.1', name: 'Tần suất thương tích mất ngày công quy đổi (LTIFR)', val: '0.12', tgt: '< 0.20', unit: '/1M Giờ công', dept: 'Ban TCNL', status: 'Đạt' },
                                    { code: 'CT 1.2', name: 'Số vụ việc tai nạn thương tích ghi nhận (Work-related injuries)', val: '2', tgt: '< 5', unit: 'Vụ việc', dept: 'Ban TCNL', status: 'Đạt' },
                                    { code: 'CT 1.3', name: 'Tỷ lệ cán bộ tham vấn quy trình an toàn vệ sinh lao động (GRI 403-4)', val: '100%', tgt: '100%', unit: '%', dept: 'Ban TCNL', status: 'Đạt' }
                                ].map((item, index) => (
                                    <tr key={index} className="hover:bg-blue-50/45 transition-colors">
                                        <td className="py-3 px-4 font-bold text-vna-blue">{item.code}</td>
                                        <td className="py-3 px-4 font-semibold text-black/85">{item.name}</td>
                                        <td className="py-3 px-4 font-bold text-gray-900 text-right">{item.val}</td>
                                        <td className="py-3 px-4 font-medium text-black/45 text-right">{item.tgt}</td>
                                        <td className="py-3 px-4 text-center text-gray-650">{item.unit}</td>
                                        <td className="py-3 px-4 text-black/45 font-medium">{item.dept}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-green-50 text-green-700 border-green-200">Đạt</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {mode === 'bi-gov' && (
            <div className="space-y-6">
                {/* 3 Bento Cards Top Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-[#006885]/5 border border-[#006885]/10 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 hover:shadow-md transition-all duration-200 relative group">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-[#006885]/10 text-[#006885] rounded-lg">
                                <Scale size={20} />
                            </div>
                            <div className="relative cursor-help">
                                <Info size={16} className="text-gray-400 hover:text-vna-blue" />
                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal">
                                    <div className="absolute bottom-0 right-3 translate-y-full border-4 border-transparent border-t-[#0d1525]/95"></div>
                                    <p className="font-bold text-[#DBA410] mb-1">GRI 2-9: Cơ cấu và thành phần quản trị</p>
                                    Tỷ lệ thành viên Hội đồng quản trị (HĐQT) độc lập nhằm đảm bảo tính minh bạch, khách quan trong các quyết định lớn của Tổng công ty.
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-4">HĐQT Độc lập (GRI 2-9)</p>
                        <h3 className="text-2xl font-black text-black/85 mt-1">33.3% Độc lập</h3>
                        <div className="text-[10px] text-[#006885] font-semibold mt-2 flex items-center gap-1">
                            <CheckCircle size={12} /> 3/9 Thành viên độc lập (Đạt tối thiểu Luật Doanh nghiệp)
                        </div>
                    </div>

                    <div className="bg-[#DBA410]/5 border border-[#DBA410]/15 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 hover:shadow-md transition-all duration-200 relative group">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-[#DBA410]/10 text-[#DBA410] rounded-lg">
                                <FileText size={20} />
                            </div>
                            <div className="relative cursor-help">
                                <Info size={16} className="text-gray-400 hover:text-vna-blue" />
                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal">
                                    <div className="absolute bottom-0 right-3 translate-y-full border-4 border-transparent border-t-[#0d1525]/95"></div>
                                    <p className="font-bold text-[#DBA410] mb-1">Báo cáo Tuân thủ Nghị quyết Phụ lục 02</p>
                                    Đánh giá tiến độ hoàn thành các chỉ tiêu quản trị doanh nghiệp bắt buộc của Vietnam Airlines theo quy định quản lý vốn nhà nước.
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-4">Tuân thủ Nghị quyết Phụ lục 02</p>
                        <h3 className="text-2xl font-black text-black/85 mt-1">91.5%</h3>
                        <div className="text-[10px] text-[#DBA410] font-bold mt-2 flex items-center gap-1">
                            <CheckCircle size={12} className="text-[#DBA410]" /> Đã hoàn thành 43/47 chỉ tiêu nghị quyết
                        </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 hover:shadow-md transition-all duration-200 relative group">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="relative cursor-help">
                                <Info size={16} className="text-gray-400 hover:text-vna-blue" />
                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#0d1525]/95 text-white text-[11px] rounded-lg shadow-xl border border-white/10 backdrop-blur-md z-50 leading-relaxed font-normal">
                                    <div className="absolute bottom-0 right-3 translate-y-full border-4 border-transparent border-t-[#0d1525]/95"></div>
                                    <p className="font-bold text-[#DBA410] mb-1">ESG Audit Readiness Score</p>
                                    Mức độ hoàn thiện và sẵn sàng của hệ thống cơ sở dữ liệu ESG phục vụ kiểm toán độc lập của bên thứ ba (Bureau Veritas / PwC).
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-4">Chỉ số Sẵn sàng Kiểm toán Dữ liệu ESG</p>
                        <h3 className="text-2xl font-black text-black/85 mt-1">94 / 100</h3>
                        <div className="text-[10px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                            <CheckCircle size={12} /> Cơ sở dữ liệu số hóa & Đã được xác thực nội bộ
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 h-[400px] flex flex-col">
                        <div className="mb-4">
                            <h3 className="font-bold text-black/85">Thành phần Hội đồng Quản trị (GRI 2-9)</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Đa dạng và tính độc lập của các thành viên HĐQT Vietnam Airlines</p>
                        </div>
                        <div className="flex-1 min-h-0 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={MOCK_GOV_BOARD_BREAKDOWN} 
                                        cx="50%" 
                                        cy="45%" 
                                        innerRadius={65} 
                                        outerRadius={95} 
                                        dataKey="value" 
                                        paddingAngle={5}
                                        label={({name, value}) => `${name.split(' (')[0]}: ${value}`}
                                    >
                                        {MOCK_GOV_BOARD_BREAKDOWN.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '8px', fontSize: '11px'}} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 h-[400px] flex flex-col">
                        <div className="mb-4">
                            <h3 className="font-bold text-black/85">Mức độ Sẵn sàng Kiểm toán Dữ liệu ESG</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Điểm đánh giá hệ thống quản lý dữ liệu theo từng phân mục chỉ tiêu (Tối đa: 100)</p>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={MOCK_GOV_AUDIT_READINESS} layout="vertical" margin={{top: 10, right: 15, left: 10, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                    <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tick={{fill: '#6B7280', fontSize: 10}} />
                                    <YAxis dataKey="module" type="category" tickLine={false} axisLine={false} tick={{fill: '#374151', fontSize: 10, fontWeight: 'bold'}} width={100} />
                                    <Tooltip contentStyle={{borderRadius: '8px', fontSize: '11px'}} />
                                    <Bar dataKey="score" name="Điểm sẵn sàng kiểm toán" fill="#006885" radius={[0, 4, 4, 0]} barSize={22}>
                                        {MOCK_GOV_AUDIT_READINESS.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 2 ? '#10B981' : '#006885'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Resolution Progress list and Information */}
                <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        <div className="lg:col-span-7 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-black/85 mb-2">Chi tiết tiến độ thực hiện chỉ tiêu Phụ lục 02</h3>
                                <p className="text-xs text-gray-400 mb-4">Các nghị quyết bắt buộc của HĐQT phục vụ phát triển ESG bền vững</p>
                            </div>
                            
                            <div className="space-y-3.5">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5">
                                        <span>Tiến độ tổng thể hoàn thành nghị quyết</span>
                                        <span className="text-[#006885]">43 / 47 Chỉ tiêu (91.5%)</span>
                                    </div>
                                    <div className="w-full bg-gray-150 rounded-full h-3 border border-gray-200/40">
                                        <div className="bg-gradient-to-r from-[#006885] to-[#10B981] h-3 rounded-full" style={{width: '91.5%'}}></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                                        <div className="text-[10px] text-emerald-800 uppercase font-bold">Đã hoàn thành</div>
                                        <div className="text-lg font-black text-emerald-700 mt-0.5">43 Chỉ tiêu</div>
                                        <p className="text-[9px] text-gray-400 mt-1">• HĐQT độc lập (33.3%)<br/>• Đào tạo phòng chống tham nhũng (98.7%)</p>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                                        <div className="text-[10px] text-amber-800 uppercase font-bold">Đang triển khai</div>
                                        <div className="text-lg font-black text-amber-600 mt-0.5">4 Chỉ tiêu</div>
                                        <p className="text-[9px] text-gray-400 mt-1">• Kiểm toán dữ liệu ESG bên thứ ba<br/>• Công bố thông tin song ngữ tự động</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 bg-gray-50/70 border border-gray-200/60 p-5 rounded-lg space-y-4 flex flex-col justify-center">
                            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                                <Info size={16} className="text-[#006885]" />
                                <h4 className="text-xs font-bold text-[#006885] uppercase tracking-wide">Quy chế Quản trị & Tuân thủ</h4>
                            </div>
                            <div className="text-xs text-gray-600 space-y-3 leading-relaxed">
                                <p>
                                    <strong>1. Cơ cấu Hội đồng quản trị (GRI 2-9):</strong>
                                    Ủy ban Kiểm toán độc lập trực thuộc HĐQT bao gồm 100% thành viên không điều hành, chủ trì bởi thành viên độc lập. Đảm bảo tuân thủ nghiêm ngặt Luật Chứng khoán Việt Nam 2020 và chuẩn mực Quản trị của OECD.
                                </p>
                                <p>
                                    <strong>2. Mục tiêu Phụ lục 02 (Ủy ban Vốn Nhà nước):</strong>
                                    Là bộ khung 47 chỉ tiêu nghiệp vụ và pháp lý bắt buộc Vietnam Airlines phải tự đánh giá và hoàn thiện hàng năm, nhằm gia tăng điểm tín nhiệm xanh phục vụ huy động vốn ưu đãi nước ngoài (Green Loans) tài trợ đội tàu bay thân rộng thế hệ mới.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VNA ESG GOVERNANCE SUB-INDICATORS TABLE SECTION */}
                <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 mt-6 animate-in fade-in duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-150 gap-4">
                        <div>
                            <h3 className="font-bold text-black/85 text-base flex items-center gap-2">
                                <Scale size={18} className="text-[#006885]" />
                                Chi tiết Chỉ tiêu con Trụ cột Quản trị (Governance Sub-Indicators Breakdown)
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">Thống kê chi tiết chỉ số cơ cấu HĐQT, chính sách và chỉ tiêu tuân thủ Phụ lục 02</p>
                        </div>
                        {/* Selector tabs for G indicators */}
                        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                            <button 
                                onClick={() => setGovSubTab('2-9')} 
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${govSubTab === '2-9' ? 'bg-[#006885] text-white shadow-xs' : 'text-gray-600 hover:text-black/85'}`}
                            >
                                GRI 2-9 (Cơ cấu HĐQT)
                            </button>
                            <button 
                                onClick={() => setGovSubTab('PL02')} 
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${govSubTab === 'PL02' ? 'bg-[#006885] text-white shadow-xs' : 'text-gray-600 hover:text-black/85'}`}
                            >
                                Phụ lục 02 Compliance
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600">
                                    <th className="py-2.5 px-4 w-28">Mã chỉ tiêu con</th>
                                    <th className="py-2.5 px-4 w-2/5">Tên chỉ tiêu con (Vietnamese & English)</th>
                                    <th className="py-2.5 px-4 text-right">Thực tế (YTD)</th>
                                    <th className="py-2.5 px-4 text-right">Định mức / Kế hoạch</th>
                                    <th className="py-2.5 px-4 text-center">Đơn vị tính</th>
                                    <th className="py-2.5 px-4">Đơn vị phụ trách</th>
                                    <th className="py-2.5 px-4 text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-750">
                                {govSubTab === '2-9' && [
                                    { code: 'CT 1.1', name: 'Tỷ lệ thành viên độc lập HĐQT (Board Independence Ratio)', val: '33.3%', tgt: '30%', unit: '%', dept: 'Tổ Thư ký', status: 'Đạt' },
                                    { code: 'CT 1.2', name: 'Tỷ lệ thành viên nữ trong HĐQT (Board Gender Diversity)', val: '22.2%', tgt: '20%', unit: '%', dept: 'Tổ Thư ký', status: 'Đạt' },
                                    { code: 'CT 1.3', name: 'Cán bộ hoàn thành đào tạo phòng chống tham nhũng (GRI 205-2)', val: '98.7%', tgt: '95%', unit: '%', dept: 'Tổ Thư ký', status: 'Đạt' },
                                    { code: 'CT 1.4', name: 'Cam kết chính sách nhân quyền, đạo đức & liêm chính (GRI 2-23)', val: '100%', tgt: '100%', unit: '%', dept: 'Tổ Thư ký', status: 'Đạt' }
                                ].map((item, index) => (
                                    <tr key={index} className="hover:bg-blue-50/45 transition-colors">
                                        <td className="py-3 px-4 font-bold text-vna-blue">{item.code}</td>
                                        <td className="py-3 px-4 font-semibold text-black/85">{item.name}</td>
                                        <td className="py-3 px-4 font-bold text-gray-900 text-right">{item.val}</td>
                                        <td className="py-3 px-4 font-medium text-black/45 text-right">{item.tgt}</td>
                                        <td className="py-3 px-4 text-center text-gray-650">{item.unit}</td>
                                        <td className="py-3 px-4 text-black/45 font-medium">{item.dept}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-green-50 text-green-700 border-green-200">Đạt</span>
                                        </td>
                                    </tr>
                                ))}
                                {govSubTab === 'PL02' && [
                                    { code: 'Tiêu chí 1', name: 'Cơ cấu HĐQT Độc lập & thành lập Ủy ban Kiểm toán', val: 'Tuân thủ', tgt: 'Bắt buộc', unit: 'Tiêu chí', dept: 'Tổ Thư ký', status: 'Đạt' },
                                    { code: 'Tiêu chí 2', name: 'Công bố thông tin tài chính song ngữ tự động trên cổng điện tử', val: '75%', tgt: '100%', unit: '%', dept: 'Tổ Thư ký', status: 'Đang làm' },
                                    { code: 'Tiêu chí 3', name: 'Quy chế quản lý rủi ro và cam kết đạo đức liêm chính ESG', val: 'Tuân thủ', tgt: 'Bắt buộc', unit: 'Tiêu chí', dept: 'Tổ Thư ký', status: 'Đạt' },
                                    { code: 'Tiêu chí 4', name: 'Kiểm toán độc lập bên thứ ba cho dữ liệu ESG tích hợp', val: '50%', tgt: '100%', unit: '%', dept: 'Ban ATCL', status: 'Đang làm' }
                                ].map((item, index) => (
                                    <tr key={index} className="hover:bg-blue-50/45 transition-colors">
                                        <td className="py-3 px-4 font-bold text-vna-blue">{item.code}</td>
                                        <td className="py-3 px-4 font-semibold text-black/85">{item.name}</td>
                                        <td className="py-3 px-4 font-bold text-gray-900 text-right">{item.val}</td>
                                        <td className="py-3 px-4 font-medium text-black/45 text-right">{item.tgt}</td>
                                        <td className="py-3 px-4 text-center text-gray-650">{item.unit}</td>
                                        <td className="py-3 px-4 text-black/45 font-medium">{item.dept}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.status === 'Đang làm' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>{item.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  }

  // Publishing Selection View
  if (mode === 'publishing') {
    // Generate Options for Dropdown
    const indicatorOptions = useMemo(() => {
        return [
            { label: 'Tất cả chỉ tiêu', value: '' },
            ...publishData.map(item => ({ label: `${item.code} - ${item.name}`, value: item.id }))
        ];
    }, [publishData]);

    // Filter Data
    const filteredData = publishData.filter(item => {
        const matchProgram = !selectedProgram || item.program === selectedProgram;
        const matchIndicator = !selectedIndicatorId || item.id === selectedIndicatorId;
        // Note: Period filter is visual context for this mock, but in real app would filter data availability
        return matchProgram && matchIndicator;
    });

    const handleClearFilters = () => {
        setSelectedProgram('');
        setSelectedIndicatorId('');
        setSelectedPeriods(['2025']);
    };

    // Render Detail View Logic
    if (detailItem) {
        // Sync with latest state (for toggle switch reactivity)
        const activeItem = publishData.find(i => i.id === detailItem.id) || detailItem;

        return (
            <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                {/* Navigation */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center text-sm text-black/45 font-medium">
                        <span onClick={() => setDetailItem(null)} className="cursor-pointer hover:text-vna-blue">Chọn dữ liệu Công bố</span>
                        <span className="mx-2 text-gray-400">&gt;</span>
                        <span className="text-vna-blue font-bold">Chi tiết {activeItem.category === 'NetZero' ? 'Kịch bản' : 'Chỉ tiêu'}</span>
                    </div>
                </div>

                {/* Header with Publish Toggle */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 pb-4 border-b border-gray-100 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-vna-blue flex items-center gap-2">
                            {activeItem.code}
                        </h1>
                        <p className="text-lg text-gray-700 font-medium mt-1">{activeItem.name}</p>
                        <div className="mt-3 flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${activeItem.category === 'NetZero' ? 'bg-vna-gold/10 text-vna-gold border-vna-gold/30' : activeItem.type === 'Dynamic' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                {activeItem.category === 'NetZero' ? 'Kế hoạch NetZero' : activeItem.type === 'Dynamic' ? 'Báo cáo động' : 'Báo cáo nội dung'}
                            </span>
                            {activeItem.program && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium border border-gray-200">{activeItem.program}</span>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Detail View Toggle */}
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-colors ${activeItem.isPublished ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                            <span className={`text-sm font-semibold ${activeItem.isPublished ? 'text-vna-blue' : 'text-black/45'}`}>
                                {activeItem.isPublished ? <span className="flex items-center gap-1"><Globe size={14}/> Công bố</span> : <span className="flex items-center gap-1"><Lock size={14}/> Lưu hành nội bộ</span>}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={activeItem.isPublished}
                                    onChange={() => handleTogglePublish(activeItem.id)}
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-vna-blue"></div>
                            </label>
                        </div>

                        <div className="h-8 w-px bg-gray-200 mx-1"></div>

                        <Button variant="ghost" onClick={() => setDetailItem(null)} className="text-black/45 hover:text-vna-blue hover:bg-gray-100">
                            <ArrowLeft size={16} /> Quay lại
                        </Button>
                    </div>
                </div>

                {/* Content Area Switch */}
                {activeItem.category === 'NetZero' ? (
                    // --- NETZERO VIEW ---
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                        {/* Top Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-200 text-center">
                              <p className="text-xs text-black/45 font-semibold uppercase">Dự báo Phát thải 2030</p>
                              <div className="text-3xl font-bold text-vna-blue mt-2">15.20</div>
                              <div className="text-sm text-gray-400">MtCO2</div>
                           </div>
                           <div className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow duration-300 border border-red-200 bg-red-50/50 text-center">
                              <p className="text-xs text-black/45 font-semibold uppercase">Khoảng cách Mục tiêu (Gap)</p>
                              <div className="text-3xl font-bold mt-2 text-red-600">+1.70</div>
                              <div className="text-sm text-gray-400">MtCO2 (Cần giảm thêm)</div>
                           </div>
                           <div className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-200 text-center">
                              <p className="text-xs text-black/45 font-semibold uppercase">Chi phí Xanh hóa (Est.)</p>
                              <div className="text-3xl font-bold text-vna-gold mt-2">$75M</div>
                              <div className="text-sm text-gray-400">USD (SAF Premium)</div>
                           </div>
                        </div>

                        {/* Chart Area */}
                        <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-200 flex-1 min-h-[400px] flex flex-col">
                           <div className="flex justify-between items-center mb-6">
                              <h3 className="font-bold text-black/85 flex items-center gap-2">
                                 <TrendingUp size={20} className="text-vna-blue"/>
                                 Lộ trình Phát thải 2025 - 2035
                              </h3>
                              <div className="flex items-center gap-4 text-xs">
                                 <div className="flex items-center gap-1"><div className="w-3 h-3 bg-vna-blue rounded-full"></div> Dự báo (Forecast)</div>
                                 <div className="flex items-center gap-1"><div className="w-3 h-1 border-t-2 border-red-500 border-dashed"></div> Mục tiêu (Target)</div>
                              </div>
                           </div>
                           <div className="flex-1 w-full min-h-0">
                              <ResponsiveContainer width="100%" height="100%">
                                 <LineChart data={MOCK_NZ_CHART_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} domain={['auto', 'auto']} />
                                    <Tooltip 
                                       contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                       labelStyle={{fontWeight: 'bold', color: '#374151'}}
                                    />
                                    <Line 
                                       type="monotone" 
                                       dataKey="forecast" 
                                       name="Dự báo" 
                                       stroke="#006885" 
                                       strokeWidth={3} 
                                       dot={{r: 4, strokeWidth: 2}} 
                                       activeDot={{r: 6}}
                                    />
                                    <Line 
                                       type="monotone" 
                                       dataKey="target" 
                                       name="Mục tiêu SBTi" 
                                       stroke="#EF4444" 
                                       strokeWidth={2} 
                                       strokeDasharray="5 5" 
                                       dot={false} 
                                    />
                                    <ReferenceLine x={2030} stroke="#9CA3AF" strokeDasharray="3 3" label={{ position: 'top',  value: '2030 Milestone', fill: '#6B7280', fontSize: 10 }} />
                                 </LineChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                    </div>
                ) : activeItem.type === 'Dynamic' ? (
                    // --- DYNAMIC VIEW: BI DASHBOARD ---
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                        {/* KPI Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="bg-blue-50 border-blue-100">
                                <div className="text-sm text-blue-700 font-medium mb-1 flex items-center gap-2"><Database size={14}/> Thực tế (YTD)</div>
                                <div className="text-2xl font-bold text-blue-900">1,250 <span className="text-xs font-normal text-blue-600">đơn vị</span></div>
                            </Card>
                            <Card className="bg-green-50 border-green-100">
                                <div className="text-sm text-green-700 font-medium mb-1 flex items-center gap-2"><CheckCircle size={14}/> Hoàn thành</div>
                                <div className="text-2xl font-bold text-green-900">98.5%</div>
                            </Card>
                            <Card className="bg-orange-50 border-orange-100">
                                <div className="text-sm text-orange-700 font-medium mb-1 flex items-center gap-2"><TrendingUp size={14}/> Tăng trưởng</div>
                                <div className="text-2xl font-bold text-orange-900">+5.2% <span className="text-xs font-normal text-orange-600">so với kỳ trước</span></div>
                            </Card>
                            <Card className="bg-purple-50 border-purple-100">
                                <div className="text-sm text-purple-700 font-medium mb-1 flex items-center gap-2"><Eye size={14}/> Dự báo năm</div>
                                <div className="text-2xl font-bold text-purple-900">2,500 <span className="text-xs font-normal text-purple-600">đơn vị</span></div>
                            </Card>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300 h-[400px]">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-black/85">Xu hướng theo thời gian</h3>
                                    <Select 
                                        className="w-32 text-xs" 
                                        options={[{label: 'Năm 2025', value: '2025'}, {label: 'Năm 2024', value: '2024'}]} 
                                        value="2025" 
                                    />
                                </div>
                                <ResponsiveContainer width="100%" height="90%">
                                    <ComposedChart data={MOCK_PUB_TREND}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                                        <Tooltip 
                                            contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                            itemStyle={{fontSize: '12px', fontWeight: 600}}
                                        />
                                        <Legend wrapperStyle={{paddingTop: '20px'}} />
                                        <Bar dataKey="actual" name="Thực tế" fill="#006885" barSize={30} radius={[4, 4, 0, 0]} />
                                        <Line type="monotone" dataKey="target" name="Kế hoạch" stroke="#DBA410" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="lg:col-span-1 bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300 h-[400px]">
                                <h3 className="font-bold text-black/85 mb-4">Phân bổ theo đơn vị</h3>
                                <ResponsiveContainer width="100%" height="90%">
                                    <PieChart>
                                        <Pie 
                                            data={MOCK_PUB_DIST} 
                                            innerRadius={60} 
                                            outerRadius={100} 
                                            dataKey="value" 
                                            paddingAngle={5}
                                        >
                                            {MOCK_PUB_DIST.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{borderRadius: '8px'}} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                ) : (
                    // --- CONTENT VIEW: STATIC TEXT ---
                    <div className="flex-1 flex flex-col bg-gray-50 p-8 rounded-lg border border-gray-200 overflow-y-auto">
                        <div className="w-full max-w-4xl mx-auto bg-white hover:shadow-md transition-shadow duration-300 border border-gray-200 p-12 min-h-[600px] text-black/85">
                            {/* Read-only Document Simulation */}
                            <h2 className="text-2xl font-bold mb-6 text-center uppercase text-gray-900 border-b pb-4">{activeItem.name}</h2>
                            
                            <div className="space-y-4 text-justify leading-relaxed">
                                <p className="font-bold text-lg">1. Tổng quan</p>
                                <p>
                                    Hội đồng quản trị (HĐQT) là cơ quan quản trị cao nhất của Vietnam Airlines, chịu trách nhiệm định hướng chiến lược và giám sát hoạt động kinh doanh. Cơ cấu quản trị được xây dựng dựa trên các nguyên tắc minh bạch, hiệu quả và tuân thủ pháp luật.
                                </p>
                                
                                <p className="font-bold text-lg mt-6">2. Cơ cấu Hội đồng quản trị</p>
                                <p>
                                    Tính đến ngày 31/12/2024, Hội đồng quản trị của Tổng công ty Hàng không Việt Nam bao gồm các thành viên với sự đa dạng về chuyên môn và kinh nghiệm:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 mt-2">
                                    <li>Ông Đặng Ngọc Hòa - Chủ tịch HĐQT</li>
                                    <li>Ông Lê Hồng Hà - Thành viên HĐQT, Tổng Giám đốc</li>
                                    <li>Ông Lê Trường Giang - Thành viên HĐQT</li>
                                    <li>Ông Tạ Mạnh Hùng - Thành viên HĐQT</li>
                                    <li>Đại diện vốn nhà nước và các cổ đông chiến lược khác.</li>
                                </ul>

                                <p className="font-bold text-lg mt-6">3. Các Ủy ban trực thuộc</p>
                                <p>
                                    Để hỗ trợ hoạt động giám sát và ra quyết định, HĐQT đã thành lập các Ủy ban chuyên trách:
                                </p>
                                <div className="mt-4 border border-gray-300 rounded overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 font-semibold text-gray-700">
                                            <tr>
                                                <td className="p-3 border-r border-b border-gray-300 w-1/3">Tên Ủy ban</td>
                                                <td className="p-3 border-b border-gray-300">Chức năng chính</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="p-3 border-r border-b border-gray-300 font-medium">Ủy ban Kiểm toán</td>
                                                <td className="p-3 border-b border-gray-300">Giám sát tính trung thực của Báo cáo tài chính và hệ thống kiểm soát nội bộ.</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 border-r border-gray-300 font-medium">Ủy ban Nhân sự & Lương thưởng</td>
                                                <td className="p-3 border-gray-300">Tham mưu về chính sách nhân sự cấp cao và chế độ đãi ngộ.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="italic text-gray-400 mt-8 text-center text-sm border-t pt-4">
                                    -- Hết nội dung báo cáo --
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default: List View
    const renderSection = (items: PublishItem[], title: string, colorClass: string, icon?: React.ReactNode) => {
        if (items.length === 0) return null;

        return (
            <div className="mb-8">
                <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 pl-3 border-l-4 ${colorClass} flex items-center gap-2`}>
                   {icon} {title} <span className="text-gray-400 font-normal normal-case text-xs">({items.length} chỉ tiêu)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {items.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => setDetailItem(item)} // Changed: Click card to view
                            className={`bg-white rounded-lg hover:shadow-md transition-shadow duration-300 border transition-all duration-200 hover:shadow-md flex flex-col cursor-pointer ${item.isPublished ? 'border-vna-blue ring-1 ring-vna-blue/20' : 'border-gray-200'}`}
                        >
                            {/* Card Header */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                                <div>
                                    <div className="text-sm font-bold text-vna-blue">{item.code}</div>
                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 w-fit">
                                        <CheckCircle size={10} /> Đã duyệt
                                    </div>
                                </div>
                                <div className={`p-1.5 rounded-full ${item.category === 'NetZero' ? 'bg-vna-gold/10 text-vna-gold' : item.type === 'Dynamic' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`} title={item.type === 'Dynamic' ? 'Dữ liệu động' : 'Nội dung'}>
                                    {item.category === 'NetZero' ? <TrendingUp size={16}/> : item.type === 'Dynamic' ? <Database size={16}/> : <FileText size={16}/>}
                                </div>
                            </div>
                            
                            {/* Card Body */}
                            <div className="p-4 flex-1">
                                <h4 className="font-medium text-black/85 text-sm line-clamp-2 min-h-[40px]" title={item.name}>{item.name}</h4>
                                <div className="mt-3">
                                    {item.program ? (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 font-medium inline-block">{item.program}</span>
                                    ) : <span className="h-6 block"></span>}
                                </div>
                            </div>

                            {/* Card Footer - Action */}
                            <div className={`p-3 border-t flex justify-between items-center rounded-b-lg transition-colors ${item.isPublished ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50/50 border-gray-100'}`}>
                                <span className={`text-xs font-semibold ${item.isPublished ? 'text-vna-blue' : 'text-black/45'}`}>
                                    {item.isPublished ? <span className="flex items-center gap-1"><Globe size={12}/> Công bố</span> : <span className="flex items-center gap-1"><Lock size={12}/> Lưu hành nội bộ</span>}
                                </span>
                                
                                {/* Custom Toggle Switch */}
                                <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={item.isPublished}
                                        onChange={() => handleTogglePublish(item.id)}
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-vna-blue"></div>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const netZeroItems = filteredData.filter(i => i.category === 'NetZero');
    const envItems = filteredData.filter(i => i.pillar === Pillar.ENVIRONMENT && !i.category);
    const socItems = filteredData.filter(i => i.pillar === Pillar.SOCIAL && !i.category);
    const govItems = filteredData.filter(i => i.pillar === Pillar.GOVERNANCE && !i.category);

    return (
      <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-vna-blue flex items-center gap-2">
              Chọn dữ liệu Công bố
            </h2>
            <p className="text-sm text-black/45 mt-1">Lựa chọn các chỉ tiêu ESG đã được phê duyệt để xuất bản lên Website/Báo cáo</p>
          </div>
        </div>

        {/* Filters - Styled like DataOps */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 bg-white p-5 rounded-lg border border-gray-200 items-end hover:shadow-md transition-shadow duration-300">
            {/* Period Filter */}
            <div className="md:col-span-4">
                 <ReportingPeriodTreeSelect selected={selectedPeriods} onChange={setSelectedPeriods} />
            </div>

            {/* Program Filter */}
            <div className="md:col-span-3">
                 <Select 
                    label="Chương trình" 
                    placeholder="Tất cả chương trình"
                    options={[{label: 'Tất cả', value: ''}, {label: 'CORSIA', value: 'CORSIA'}, {label: 'EU ETS', value: 'EU ETS'}, {label: 'UK ETS', value: 'UK ETS'}]}
                    value={selectedProgram}
                    onChange={setSelectedProgram}
                 />
            </div>

            {/* Indicator Dropdown (Replaces Search Input) */}
            <div className="md:col-span-3">
                 <Select 
                    label="Mã/Tên chỉ tiêu"
                    placeholder="Tìm theo chỉ tiêu..."
                    options={indicatorOptions}
                    value={selectedIndicatorId}
                    onChange={setSelectedIndicatorId}
                 />
            </div>
            
            {/* Action Buttons */}
            <div className="md:col-span-2 flex gap-2">
                <Button className="flex-1 bg-vna-blue" onClick={() => setToast({ message: 'Đang tìm kiếm...', type: 'info' })}><Search size={16}/> Tìm kiếm</Button>
                <Button 
                    variant="outline" 
                    className="px-3 text-black/45 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors" 
                    onClick={handleClearFilters}
                    title="Xóa bộ lọc"
                    disabled={selectedPeriods.length === 0 && !selectedProgram && !selectedIndicatorId}
                >
                    <X size={18} />
                </Button>
            </div>
        </div>

        {/* Content Area */}
        {filteredData.length > 0 ? (
            <div className="flex-1">
                {/* NetZero Plan Section - New */}
                {renderSection(netZeroItems, 'Kế hoạch NetZero', 'border-vna-gold text-vna-blue', <Wind size={18} className="text-vna-gold" />)}
                
                {renderSection(envItems, 'Môi trường (Environment)', 'border-green-500 text-green-800')}
                {renderSection(socItems, 'Xã hội (Social)', 'border-blue-500 text-blue-800')}
                {renderSection(govItems, 'Quản trị (Governance)', 'border-purple-500 text-purple-800')}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] text-gray-400 border border-dashed border-gray-300 rounded-lg">
                <Filter size={48} className="mb-2 opacity-20"/>
                <p>Không tìm thấy dữ liệu phù hợp với bộ lọc.</p>
            </div>
        )}
      </div>
    );
  }

  // Fallback
  return null;
};
