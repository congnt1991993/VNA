import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts';
import indicatorsData from '../data/indicators_blocks.json';
import indicatorDetailsData from '../data/indicator_details.json';
import MOCK_INDICATORS from '../data/indicators_main_list.json';
import { PlaneTakeoff, Leaf, Users, ShieldCheck, DollarSign, Target, Award, UserCheck, Droplet, Zap, AlertTriangle, TrendingUp, TrendingDown, Edit, Filter } from 'lucide-react';

const COLORS = {
  vnaBlue: '#005f73',
  vnaGold: '#e9b000',
  emerald: '#10b981',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  orange: '#f59e0b',
  pink: '#ec4899',
  gray: '#9ca3af'
};

// --- MOCK DATA ---
const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
const years = ['2022', '2023', '2024', '2025', '2026'];

// D1
const d1FlightIncidents = months.map((m, i) => ({ name: m, flights: [8000, 8500, 8200, 9000, 9200, 9500][i], incidents: [12, 10, 15, 8, 5, 9][i] }));
const d1Members = months.map((m, i) => ({ name: m, members: [1200, 1500, 1800, 1600, 2000, 2500][i] }));
const d1MonthlyFuel = months.map((m, i) => ({ name: m, jet: [4000, 4200, 4100, 4500, 4800, 5000][i], saf: [50, 80, 60, 100, 120, 150][i] }));
const d1MonthlyEmission = months.map((m, i) => ({ name: m, scope1: [12000, 12500, 12300, 13500, 14400, 15000][i], scope2: [150, 160, 155, 170, 180, 190][i] }));
const d1EuaCost = months.map((m, i) => ({ name: m, cost: [50, 60, 55, 80, 100, 120][i], excess: [1200, 1500, 1300, 2000, 2500, 3000][i] }));

// D2
const d2Fuel = months.map((m, i) => ({ name: m, jet: [100, 120, 110, 130, 140, 150][i], saf: [5, 10, 15, 12, 20, 25][i] }));
const d2Saf = months.map((m, i) => ({ name: m, hefa: [2, 5, 8, 6, 10, 15][i], atj: [3, 5, 7, 6, 10, 10][i] }));
const d2Emission = months.map((m, i) => ({ name: m, emission: [40, 45, 42, 50, 55, 60][i], intensity: [20, 22, 21, 24, 25, 26][i] }));
const d2Saving = months.map((m, i) => ({ name: m, saved: [10, 15, 12, 18, 20, 22][i] }));
const d2Water = months.map((m, i) => ({ name: m, target: 50, actual: [45, 48, 52, 49, 46, 47][i] }));

// D3
const d3Labor = months.map((m, i) => ({ name: m, new: [50, 60, 40, 70, 80, 90][i], leave: [20, 15, 30, 25, 10, 15][i] }));
const d3Incident = months.map((m, i) => ({ name: m, incident: [2, 1, 3, 0, 1, 0][i], victims: [1, 0, 2, 0, 1, 0][i] }));
const d3Nps = months.map((m, i) => ({ name: m, nps: [4.1, 4.2, 4.0, 4.3, 4.5, 4.6][i] }));
const d3Service = months.map((m, i) => ({ name: m, issues: [5, 3, 4, 2, 1, 2][i] }));
const d3Privacy = months.map((m, i) => ({ name: m, breach: [0, 0, 1, 0, 0, 0][i] }));

// D4
const d4Board = [
  { name: 'HĐQT', male: 5, female: 2 },
  { name: 'Ban GĐ', male: 4, female: 1 }
];
const d4Leaders = [
  { name: 'Việt Nam', value: 85 },
  { name: 'Nước ngoài', value: 15 }
];

// D5
const d5SafCost = years.map((y, i) => ({ name: y, cost: [10000, 15000, 12000, 20000, 25000][i], amount: [50, 75, 60, 100, 120][i] }));
const d5Eua = years.map((y, i) => ({ name: y, emission: [500, 400, 350, 200, 100][i], cost: [5000, 4000, 3500, 2000, 1000][i] }));
const d5Supplier = years.map((y, i) => ({ name: y, local: [200, 220, 250, 280, 300][i], intl: [50, 55, 50, 60, 45][i] }));
const d5Training = years.map((y, i) => ({ name: y, cost: [1500, 1800, 1600, 2000, 2200][i] }));
const d5Salary = years.map((y, i) => ({ name: y, avg: [10, 11, 12, 13, 15][i], min: [4.4, 4.6, 4.6, 4.9, 5.2][i] }));

interface DashboardVNAProps {
  activeTabId?: number;
  onTabChange?: (tabId: number) => void;
}




const GlobalFilter = () => (
    <div className="bg-white p-3 rounded-lg border border-[#f0f0f0] flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-[14px] text-black/85">
            <Filter size={16} className="text-black/45" />
            <span className="font-medium">Bộ lọc:</span>
        </div>
        <select className="border border-[#d9d9d9] rounded px-3 py-1.5 text-[13px] text-black/85 hover:border-[#1677ff] outline-none">
            <option>Tất cả chi nhánh</option>
            <option>VNA Group</option>
            <option>Pacific Airlines</option>
            <option>VASCO</option>
        </select>
        <select className="border border-[#d9d9d9] rounded px-3 py-1.5 text-[13px] text-black/85 hover:border-[#1677ff] outline-none">
            <option>Năm 2026</option>
            <option>Năm 2025</option>
            <option>Năm 2024</option>
        </select>
        <select className="border border-[#d9d9d9] rounded px-3 py-1.5 text-[13px] text-black/85 hover:border-[#1677ff] outline-none">
            <option>Quý 2</option>
            <option>Quý 1</option>
            <option>Cả năm</option>
        </select>
    </div>
);
const SingleIndicatorView = ({ indicator, onBack }: { indicator: any, onBack: () => void }) => {
  let metabaseLink = indicator.metabaseLink;
  if (!metabaseLink) {
    const saved = localStorage.getItem('vna_esg_indicators');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = parsed.find((p: any) => p.name === indicator.name || p.id === indicator.id || (p.code && p.code !== "Chưa có mã" && p.code === indicator.code));
        if (match) metabaseLink = match.metabaseLink;
      } catch (e) {}
    }
  }
  if (!metabaseLink) {
    const match = (MOCK_INDICATORS as any[]).find((p: any) => p.name === indicator.name || p.id === indicator.id || (p.code && p.code !== "Chưa có mã" && p.code === indicator.code));
    if (match) metabaseLink = match.metabaseLink;
  }

  if (metabaseLink) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-655 hover:text-vna-blue hover:bg-gray-100 rounded-md border border-gray-200 transition-all cursor-pointer bg-white"
          >
             ← Quay lại danh sách chỉ tiêu
          </button>
          <a 
            href={metabaseLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-vna-blue hover:bg-[#00556e] rounded-md transition-all shadow-sm"
          >
            Xem chi tiết trên Metabase ↗
          </a>
        </div>

        <div className="flex-1 w-full bg-white rounded-lg overflow-hidden min-h-[750px] flex flex-col">
          <iframe 
            src={metabaseLink}
            frameBorder="0"
            width="100%"
            height="100%"
            className="flex-1 min-h-[750px] w-full border-none"
            allowtransparency
          ></iframe>
        </div>
      </div>
    );
  }

  let reportText = indicator.reportText;
  if (!reportText) {
    const match = (MOCK_INDICATORS as any[]).find((p: any) => p.name === indicator.name || p.id === indicator.id || (p.code && p.code !== "Chưa có mã" && p.code === indicator.code));
    if (match) reportText = match.reportText;
  }

  if (reportText) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4 justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-650 hover:text-vna-blue hover:bg-gray-100 rounded-md border border-gray-200 transition-all cursor-pointer bg-white"
            >
               ← Quay lại
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-vna-blue border border-blue-200 rounded">
                  {indicator.code}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  indicator.pillar === 'Environment' || indicator.pillar === 'E'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                    : indicator.pillar === 'Social' || indicator.pillar === 'S'
                    ? 'bg-blue-50 text-blue-700 border-blue-250'
                    : 'bg-amber-50 text-amber-700 border-amber-250'
                }`}>
                  {indicator.pillar === 'Environment' || indicator.pillar === 'E' ? 'Môi trường (E)' : indicator.pillar === 'Social' || indicator.pillar === 'S' ? 'Xã hội (S)' : 'Quản trị (G)'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-vna-blue">{indicator.name}</h2>
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(reportText.content || '');
              alert('Đã sao chép nội dung báo cáo tĩnh vào bộ nhớ tạm!');
            }}
            className="flex items-center gap-2 text-xs py-1.5 px-3 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 bg-white cursor-pointer font-semibold transition-colors"
          >
            Sao chép văn bản
          </button>
        </div>

        <div className="flex-1 bg-slate-50 p-6 rounded-xl border border-gray-200 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              Văn bản hiển thị trên Dashboard
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
              Chính thức
            </span>
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md flex-1 prose max-w-none relative overflow-y-auto leading-relaxed text-gray-800">
            {/* Watermark logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
              <div className="text-9xl font-extrabold text-vna-blue rotate-12">VNA</div>
            </div>
            
            {reportText.title && (
              <h3 className="text-xl font-bold text-center text-vna-blue mb-8 border-b-2 border-vna-blue pb-2 uppercase tracking-wide">
                {reportText.title}
              </h3>
            )}

            {indicator.code === 'GRI 2-9' && (
              <div className="my-6 flex justify-center">
                <img 
                  src="/vna-images/gri_2_9_structure.png" 
                  alt="Cơ cấu tổ chức VNA" 
                  className="max-h-[450px] w-auto object-contain rounded-lg border border-gray-200 shadow-sm"
                />
              </div>
            )}
            
            <div className="whitespace-pre-line text-[15px] text-justify text-gray-700 leading-relaxed">
              {reportText.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const details = (indicatorDetailsData as any)[indicator.code || ''] || [];
  const cards = details.filter((d: any) => d.chartType.toLowerCase() === 'card');
  const charts = details.filter((d: any) => d.chartType.toLowerCase() !== 'card');

  const trendData = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map((m, i) => {
    const baseValue = 100 + (parseInt(indicator.id) || 0) * 10;
    return { month: m, actual: baseValue + Math.random() * 50 - 25, target: baseValue, value1: baseValue * 0.6 + Math.random()*10, value2: baseValue * 0.4 + Math.random()*10 };
  });
  const pieData = [
      { name: 'Loại 1', value: 400 },
      { name: 'Loại 2', value: 300 },
      { name: 'Loại 3', value: 300 },
      { name: 'Loại 4', value: 200 },
  ];
  const COLORS_ARR = ['#005f73', '#0a9396', '#94d2bd', '#e9d8a6', '#ee9b00', '#ca6702', '#bb3e03', '#ae2012'];

  if (cards.length === 0 && charts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
          <button onClick={onBack} className="p-2 cursor-pointer text-gray-500 hover:text-vna-blue hover:bg-gray-100 rounded-full">
             ← Quay lại
          </button>
          <div>
            <h2 className="text-xl font-bold text-vna-blue">Dashboard: {indicator.code} - {indicator.name}</h2>
            <p className="text-xs text-black/45">Theo dõi số liệu và tiến độ mục tiêu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
             <div className="text-blue-800 text-sm font-bold mb-1">Giá trị hiện tại</div>
             <div className="text-3xl font-black text-vna-blue">{(100 + parseInt(indicator.id || '0') * 10 + 15).toFixed(1)} {indicator.unit || '-'}</div>
          </div>
          <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-100">
             <div className="text-emerald-800 text-sm font-bold mb-1">Mục tiêu (Target)</div>
             <div className="text-3xl font-black text-emerald-700">{(100 + parseInt(indicator.id || '0') * 10).toFixed(1)} {indicator.unit || '-'}</div>
          </div>
          <div className="bg-orange-50 p-5 rounded-lg border border-orange-100">
             <div className="text-orange-800 text-sm font-bold mb-1">Trạng thái</div>
             <div className="text-3xl font-black text-orange-700">Đạt tiến độ</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 flex-1">
          <h3 className="text-sm font-bold text-vna-blue mb-4">Biểu đồ xu hướng năm nay</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005f73" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#005f73" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8c8c8c' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8c8c8c' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value: number) => [value.toFixed(1), 'Thực tế']} />
                <Area type="monotone" dataKey="actual" stroke="#005f73" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                <Line type="stepAfter" dataKey="target" stroke="#e9b000" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
        <button onClick={onBack} className="p-2 cursor-pointer text-gray-500 hover:text-vna-blue hover:bg-gray-100 rounded-full">
           ← Quay lại
        </button>
        <div>
          <h2 className="text-xl font-bold text-vna-blue">Dashboard: {indicator.code} - {indicator.name}</h2>
          <p className="text-xs text-black/45">Dữ liệu được tự động sinh theo cấu hình chi tiết nghiệp vụ</p>
        </div>
      </div>

      {cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {cards.map((c: any, idx: number) => {
            const bgColors = ['bg-blue-50', 'bg-emerald-50', 'bg-orange-50', 'bg-purple-50', 'bg-indigo-50'];
            const borderColors = ['border-blue-100', 'border-emerald-100', 'border-orange-100', 'border-purple-100', 'border-indigo-100'];
            const textColors = ['text-blue-800', 'text-emerald-800', 'text-orange-800', 'text-purple-800', 'text-indigo-800'];
            const valColors = ['text-vna-blue', 'text-emerald-700', 'text-orange-700', 'text-purple-700', 'text-indigo-700'];
            
            const colorIdx = idx % bgColors.length;
            let randomValue = Math.floor(Math.random() * 5000);
            if (c.name.toLowerCase().includes('tỷ lệ') || c.name.toLowerCase().includes('nps')) randomValue = Math.floor(Math.random() * 100);
            
            return (
              <div key={idx} className={`${bgColors[colorIdx]} p-4 rounded-lg border ${borderColors[colorIdx]}`}>
                 <div className={`${textColors[colorIdx]} text-xs font-bold mb-1 leading-snug h-8 overflow-hidden`}>{c.name}</div>
                 <div className={`text-2xl font-black ${valColors[colorIdx]}`}>{randomValue.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      )}

      {charts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {charts.map((c: any, idx: number) => {
            const ctype = c.chartType.toLowerCase();
            return (
              <div key={idx} className="bg-white p-5 rounded-lg border border-gray-200">
                <h3 className="text-sm font-bold text-vna-blue mb-4 truncate" title={c.name}>{c.name} ({c.chartType})</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {ctype.includes('donut') || ctype.includes('doughnut') || ctype.includes('pie') ? (
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={ctype.includes('pie') ? 0 : 60} outerRadius={80} fill="#8884d8" paddingAngle={ctype.includes('pie') ? 0 : 5} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_ARR[index % COLORS_ARR.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    ) : ctype.includes('bar') || ctype.includes('column') ? (
                      <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey="value1" name="Thực tế" stackId={ctype.includes('stacked') ? "a" : undefined} fill="#005f73" />
                        {ctype.includes('stacked') && <Bar dataKey="value2" name="Bổ sung" stackId="a" fill="#e9b000" />}
                        {!ctype.includes('stacked') && <Bar dataKey="target" name="Mục tiêu" fill="#e9b000" />}
                      </BarChart>
                    ) : ctype.includes('combo') ? (
                      <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey="actual" name="Thực tế" fill="#0a9396" />
                        <Line type="monotone" dataKey="target" name="Mục tiêu" stroke="#ca6702" strokeWidth={2} />
                      </ComposedChart>
                    ) : ctype.includes('area') ? (
                      <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`colorArea-${idx}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94d2bd" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#94d2bd" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="actual" stroke="#0a9396" fillOpacity={1} fill={`url(#colorArea-${idx})`} />
                      </AreaChart>
                    ) : (
                      <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="actual" name="Thực tế" stroke="#005f73" strokeWidth={2} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
const BlockLayout = ({ blockKey, title, children, onGoMain }: { blockKey: 'tech' | 'flight' | 'service' | 'general', title: string, children: React.ReactNode, onGoMain?: () => void }) => {
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null);
  const data = indicatorsData[blockKey] || [];
  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 3/4 Main Content for Charts */}
      <div className="w-full lg:w-3/4 flex flex-col gap-4">
        <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] flex items-center justify-between shadow-sm">
            <h2 className="text-[18px] font-bold text-black/85">{title}</h2>
            <div className="flex gap-3 items-center">
                {onGoMain && (
                  <button 
                    onClick={onGoMain}
                    className="flex items-center gap-2 text-[13px] font-medium text-white bg-[#005f73] hover:bg-[#004d5c] px-3 py-1.5 rounded-md transition-colors"
                  >
                    Quay về Dashboard chung
                  </button>
                )}
            <a 
              href="https://metabase-dev.aequitas.dev/auth/login?redirect=%2Fdashboard%2F54-13-co2-emissions-report-offset-by-eua%3Feu_location%3DSweden%26eu_location%3DPoland%26eu_location%3DGreece%26eu_location%3DIreland%26eu_location%3DItaly%26eu_location%3DSpain%26eu_location%3DFinland%26eu_location%3DGermany%26eu_location%3DRomania%26eu_location%3DAustria%26eu_location%3DFrance%26eu_location%3DDenmark%26eu_location%3DHungary%26eu_location%3DTurkey%26eu_location%3DNetherlands%26n%2525C4%252583m%3D2025%26tab%3D19-eu-ets%26uk_location%3DUnited%2BKingdom"
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 text-[14px] font-medium text-[#1677ff] hover:text-[#0958d9] bg-[#e6f4ff] hover:bg-[#bae0ff] px-3 py-1.5 rounded-md transition-colors"
            >
              <Edit size={16} /> Chỉnh sửa
            </a>
            </div>
        </div>
        
        <GlobalFilter />

        <div className="flex flex-col gap-6">
            {selectedIndicator ? <SingleIndicatorView indicator={selectedIndicator} onBack={() => setSelectedIndicator(null)} /> : children}
        </div>
      </div>

      {/* 1/4 Sidebar for Indicator List */}
      <div className="w-full lg:w-1/4">
        <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] shadow-sm sticky top-6 h-[calc(100vh-120px)] flex flex-col">
            <h3 className="font-bold text-black/85 text-[16px] mb-4 shrink-0">Danh sách Chỉ tiêu</h3>
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 flex-1 pb-4">
                {data.map((item, idx) => (
                    <div key={idx} onClick={() => setSelectedIndicator(item)} className={`p-3 border rounded-lg cursor-pointer transition-all shrink-0 ${selectedIndicator?.name === item.name ? 'border-[#1677ff] bg-[#e6f4ff] shadow-sm' : 'border-[#f0f0f0] bg-[#fafafa] hover:bg-white hover:shadow-sm group'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] font-semibold text-[#005f73] bg-[#e6f4ff] px-1.5 py-0.5 rounded border border-[#91caff]">{item.code || 'N/A'}</span>
                            <span className="text-[11px] text-[#52c41a]"><Target size={12} className="inline mr-1"/>Có dữ liệu</span>
                        </div>
                        <h4 className="text-[13px] font-medium text-black/85 mb-1 line-clamp-2 group-hover:text-[#1677ff]">{item.name}</h4>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[11px] text-black/45">{item.department}</span>
                            <button className="text-[11px] text-[#005f73] font-medium hover:text-[#1677ff]">Chi tiết</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

const TechCharts = () => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[13px] text-black/45 font-medium">Tổng Số Chuyến Bay EU</p>
                    <span className="flex items-center text-[12px] font-medium text-[#52c41a] bg-[#f6ffed] border border-[#b7eb8f] px-1.5 py-0.5 rounded"><TrendingUp size={12} className="mr-0.5"/> 12.5%</span>
                </div>
                <h3 className="text-[28px] font-semibold text-black/85 mb-2">3,240</h3>
                <div className="h-[30px] opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d2Saf}><Line type="monotone" dataKey="hefa" stroke="#52c41a" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[13px] text-black/45 font-medium">Tổng Giờ Bay</p>
                    <span className="flex items-center text-[12px] font-medium text-[#52c41a] bg-[#f6ffed] border border-[#b7eb8f] px-1.5 py-0.5 rounded"><TrendingUp size={12} className="mr-0.5"/> 8.2%</span>
                </div>
                <h3 className="text-[28px] font-semibold text-black/85 mb-2">12,450 <span className="text-[13px] font-normal text-black/45">giờ</span></h3>
                <div className="h-[30px] opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d2Saf}><Line type="monotone" dataKey="atj" stroke="#52c41a" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[13px] text-black/45 font-medium">SAF Thực Tế Nạp</p>
                    <span className="flex items-center text-[12px] font-medium text-[#ff4d4f] bg-[#fff2f0] border border-[#ffccc7] px-1.5 py-0.5 rounded"><TrendingDown size={12} className="mr-0.5"/> 2.1%</span>
                </div>
                <h3 className="text-[28px] font-semibold text-black/85 mb-2">120 <span className="text-[13px] font-normal text-black/45">tấn</span></h3>
                <div className="h-[30px] opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d2Saf}><Line type="monotone" dataKey="hefa" stroke="#ff4d4f" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] h-[360px] flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-[15px] font-bold text-black/85 mb-4">Chi phí SAF & Lượng Mua (Năm)</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={d5SafCost} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={{stroke: '#f0f0f0'}} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} iconType="circle" />
                            <Bar yAxisId="right" dataKey="amount" name="Lượng SAF (Tấn)" fill="#10b981" radius={[4,4,0,0]} barSize={32} />
                            <Line yAxisId="left" type="monotone" dataKey="cost" name="Chi phí (USD)" stroke="#e9b000" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] h-[360px] flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-[15px] font-bold text-black/85 mb-4">Lượng SAF nạp theo tháng</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={d2Saf} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={{stroke: '#f0f0f0'}} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} iconType="circle" />
                            <Bar dataKey="hefa" name="HEFA" stackId="a" fill="#005f73" barSize={32} />
                            <Bar dataKey="atj" name="ATJ" stackId="a" fill="#3b82f6" radius={[4,4,0,0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </>
);

const FlightCharts = () => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[13px] text-black/45 font-medium">Tổng NL Tiêu Thụ</p>
                    <span className="flex items-center text-[12px] font-medium text-[#ff4d4f] bg-[#fff2f0] border border-[#ffccc7] px-1.5 py-0.5 rounded"><TrendingUp size={12} className="mr-0.5"/> 4.5%</span>
                </div>
                <h3 className="text-[28px] font-semibold text-black/85 mb-2">45,200 <span className="text-[13px] font-normal text-black/45">Tấn</span></h3>
                <div className="h-[30px] opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d2Saf}><Line type="monotone" dataKey="hefa" stroke="#ff4d4f" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[13px] text-black/45 font-medium">Jet A-1</p>
                    <span className="flex items-center text-[12px] font-medium text-[#ff4d4f] bg-[#fff2f0] border border-[#ffccc7] px-1.5 py-0.5 rounded"><TrendingUp size={12} className="mr-0.5"/> 4.2%</span>
                </div>
                <h3 className="text-[28px] font-semibold text-black/85 mb-2">44,850 <span className="text-[13px] font-normal text-black/45">Tấn</span></h3>
                <div className="h-[30px] opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d2Saf}><Line type="monotone" dataKey="atj" stroke="#ff4d4f" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[13px] text-black/45 font-medium">SAF</p>
                    <span className="flex items-center text-[12px] font-medium text-[#52c41a] bg-[#f6ffed] border border-[#b7eb8f] px-1.5 py-0.5 rounded"><TrendingUp size={12} className="mr-0.5"/> 15.0%</span>
                </div>
                <h3 className="text-[28px] font-semibold text-black/85 mb-2">350 <span className="text-[13px] font-normal text-black/45">Tấn</span></h3>
                <div className="h-[30px] opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d2Saving}><Line type="monotone" dataKey="saved" stroke="#52c41a" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-[#f6ffed] p-4 rounded-lg border border-[#b7eb8f] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[13px] text-[#389e0d] font-medium">Tiết kiệm năng lượng</p>
                    <span className="flex items-center text-[12px] font-medium text-[#52c41a] bg-white border border-[#b7eb8f] px-1.5 py-0.5 rounded"><TrendingUp size={12} className="mr-0.5"/> 22.4%</span>
                </div>
                <h3 className="text-[28px] font-semibold text-[#389e0d] mb-2">1,200 <span className="text-[13px] font-normal text-[#52c41a]">Lít</span></h3>
                <div className="h-[30px] opacity-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d2Saving}><Line type="monotone" dataKey="saved" stroke="#52c41a" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] h-[360px] flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-[15px] font-bold text-black/85 mb-4">Tiêu thụ nhiên liệu theo tháng</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={d1MonthlyFuel} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={{stroke: '#f0f0f0'}} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} iconType="circle" />
                            <Bar dataKey="jet" name="Jet A-1" fill="#005f73" stackId="a" barSize={32} />
                            <Bar dataKey="saf" name="SAF" fill="#10b981" stackId="a" radius={[4,4,0,0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] h-[360px] flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-[15px] font-bold text-black/85 mb-4">Năng lượng tiết kiệm theo tháng</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={d2Saving} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={{stroke: '#f0f0f0'}} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} iconType="circle" />
                            <Bar dataKey="saved" name="Tiết kiệm" fill="#3b82f6" radius={[4,4,0,0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </>
);

const ServiceCharts = () => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[13px] text-black/45 font-medium">Điểm Hài Lòng Khách Hàng (NPS)</p>
                    <span className="flex items-center text-[12px] font-medium text-[#52c41a] bg-[#f6ffed] border border-[#b7eb8f] px-1.5 py-0.5 rounded"><TrendingUp size={12} className="mr-0.5"/> 0.2</span>
                </div>
                <h3 className="text-[28px] font-semibold text-black/85 mb-2">4.6 <span className="text-[13px] font-normal text-black/45">/ 5.0</span></h3>
                <div className="h-[30px] opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d3Nps}><Line type="monotone" dataKey="nps" stroke="#52c41a" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[13px] text-black/45 font-medium">Tổng Lượng Nước Tiêu Thụ</p>
                    <span className="flex items-center text-[12px] font-medium text-[#ff4d4f] bg-[#fff2f0] border border-[#ffccc7] px-1.5 py-0.5 rounded"><TrendingUp size={12} className="mr-0.5"/> 5.1%</span>
                </div>
                <h3 className="text-[28px] font-semibold text-black/85 mb-2">285 <span className="text-[13px] font-normal text-black/45">m³</span></h3>
                <div className="h-[30px] opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d2Water}><Line type="monotone" dataKey="actual" stroke="#ff4d4f" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[13px] text-black/45 font-medium">Sự Cố Dịch Vụ</p>
                    <span className="flex items-center text-[12px] font-medium text-[#52c41a] bg-[#f6ffed] border border-[#b7eb8f] px-1.5 py-0.5 rounded"><TrendingDown size={12} className="mr-0.5"/> 2</span>
                </div>
                <h3 className="text-[28px] font-semibold text-black/85 mb-2">2 <span className="text-[13px] font-normal text-black/45">vụ</span></h3>
                <div className="h-[30px] opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d3Service}><Line type="monotone" dataKey="issues" stroke="#52c41a" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] h-[360px] flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-[15px] font-bold text-black/85 mb-4">Xu hướng điểm NPS</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={d3Nps} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                            <defs>
                                <linearGradient id="colorNps" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={{stroke: '#f0f0f0'}} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} iconType="circle" />
                            <Area type="monotone" dataKey="nps" name="Điểm NPS" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorNps)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] h-[360px] flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-[15px] font-bold text-black/85 mb-4">Lượng Nước Tiêu Thụ so với Mục tiêu</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={d2Water} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={{stroke: '#f0f0f0'}} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} iconType="circle" />
                            <Bar dataKey="actual" name="Thực tế" fill="#005f73" radius={[4,4,0,0]} barSize={32} />
                            <Line type="step" dataKey="target" name="Mục tiêu" stroke="#ff4d4f" strokeWidth={3} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </>
);

const GeneralCharts = () => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[13px] text-black/45 font-medium">Tàu Bay Chuẩn Tiếng Ồn C14</p>
                    <span className="flex items-center text-[12px] font-medium text-[#52c41a] bg-[#f6ffed] border border-[#b7eb8f] px-1.5 py-0.5 rounded"><TrendingUp size={12} className="mr-0.5"/> 2 tàu</span>
                </div>
                <h3 className="text-[28px] font-semibold text-black/85 mb-2">85 <span className="text-[13px] font-normal text-black/45">tàu</span></h3>
                <div className="h-[30px] opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d2Saf}><Line type="monotone" dataKey="atj" stroke="#52c41a" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[13px] text-black/45 font-medium">Lãnh đạo tại VN</p>
                    <span className="flex items-center text-[12px] font-medium text-[#52c41a] bg-[#f6ffed] border border-[#b7eb8f] px-1.5 py-0.5 rounded"><TrendingUp size={12} className="mr-0.5"/> 1.5%</span>
                </div>
                <h3 className="text-[28px] font-semibold text-black/85 mb-2">85%</h3>
                <div className="h-[30px] opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d2Saving}><Line type="monotone" dataKey="saved" stroke="#52c41a" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-[#fff1f0] p-4 rounded-lg border border-[#ffa39e] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[13px] text-[#cf1322] font-medium">Vi Phạm Quyền Riêng Tư</p>
                    <span className="flex items-center text-[12px] font-medium text-[#52c41a] bg-white border border-[#b7eb8f] px-1.5 py-0.5 rounded"><TrendingDown size={12} className="mr-0.5"/> 1 vụ</span>
                </div>
                <h3 className="text-[28px] font-semibold text-[#cf1322] mb-2">0 <span className="text-[13px] font-normal text-[#cf1322]">vụ</span></h3>
                <div className="h-[30px] opacity-70">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d3Privacy}><Line type="monotone" dataKey="breach" stroke="#cf1322" strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] h-[360px] flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-[15px] font-bold text-black/85 mb-4">Lao Động Tuyển Mới & Nghỉ Việc</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={d3Labor} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={{stroke: '#f0f0f0'}} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} iconType="circle" />
                            <Bar dataKey="new" name="Tuyển mới" fill="#10b981" radius={[4,4,0,0]} barSize={24} />
                            <Bar dataKey="leave" name="Nghỉ việc" fill="#ff4d4f" radius={[4,4,0,0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] h-[360px] flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-[15px] font-bold text-black/85 mb-4">Sự Cố ATLĐ</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d3Incident} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={{stroke: '#f0f0f0'}} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} iconType="circle" />
                            <Line type="monotone" dataKey="incident" name="Sự cố" stroke="#ff4d4f" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                            <Line type="monotone" dataKey="victims" name="Nạn nhân" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </>
);

export const DashboardVNA: React.FC<DashboardVNAProps> = ({ activeTabId = 1, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(activeTabId);

  useEffect(() => {
    setActiveTab(activeTabId);
  }, [activeTabId]);

  const handleTabClick = (tabId: number) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const tabs = [
    { id: 1, name: 'Tổng quan chung', icon: PlaneTakeoff },
    { id: 2, name: 'Môi trường', icon: Leaf },
    { id: 3, name: 'Xã hội', icon: Users },
    { id: 4, name: 'Quản trị', icon: ShieldCheck },
    { id: 5, name: 'Tài chính & Đầu tư', icon: DollarSign }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Bỏ Header & Tabs vì đã đưa sang Menu Sidebar */}

      {/* DASHBOARD 1: TỔNG QUAN (ANT DESIGN STYLE) */}
      {activeTab === 1 && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content (Full width now that Alerts are removed) */}
          <div className="w-full flex flex-col gap-6">
            
            <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-black/85">Tổng quan chung</h2>
                <a 
                  href="https://metabase-dev.aequitas.dev/auth/login?redirect=%2Fdashboard%2F54-13-co2-emissions-report-offset-by-eua%3Feu_location%3DSweden%26eu_location%3DPoland%26eu_location%3DGreece%26eu_location%3DIreland%26eu_location%3DItaly%26eu_location%3DSpain%26eu_location%3DFinland%26eu_location%3DGermany%26eu_location%3DRomania%26eu_location%3DAustria%26eu_location%3DFrance%26eu_location%3DDenmark%26eu_location%3DHungary%26eu_location%3DTurkey%26eu_location%3DNetherlands%26n%2525C4%252583m%3D2025%26tab%3D19-eu-ets%26uk_location%3DUnited%2BKingdom"
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[14px] font-medium text-[#1677ff] hover:text-[#0958d9] bg-[#e6f4ff] hover:bg-[#bae0ff] px-3 py-1.5 rounded-md transition-colors"
                >
                  <Edit size={16} /> Chỉnh sửa
                </a>
            </div>

            {/* KPI Cards: 5 columns */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow duration-300 relative">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[14px] text-black/45 font-medium">Tổng Phát Thải</p>
                        <div className="bg-[#e6f4ff] p-1.5 rounded-md"><Leaf size={16} className="text-[#1677ff]"/></div>
                    </div>
                    <h3 className="text-[24px] font-medium text-black/85">14,283<span className="text-[14px] text-black/45 ml-1">tCO2e</span></h3>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="h-1.5 w-full bg-[#f5f5f5] rounded-full overflow-hidden"><div className="h-full bg-[#52c41a] w-[75%]"></div></div>
                        <span className="text-[12px] text-[#52c41a] whitespace-nowrap">75%</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow duration-300 relative">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[14px] text-black/45 font-medium">Tiêu Thụ NL</p>
                        <div className="bg-[#e6f4ff] p-1.5 rounded-md"><Droplet size={16} className="text-[#1677ff]"/></div>
                    </div>
                    <h3 className="text-[24px] font-medium text-black/85">4,520<span className="text-[14px] text-black/45 ml-1">Tấn</span></h3>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="h-1.5 w-full bg-[#f5f5f5] rounded-full overflow-hidden"><div className="h-full bg-[#1677ff] w-[82%]"></div></div>
                        <span className="text-[12px] text-[#1677ff] whitespace-nowrap">82%</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow duration-300 relative">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[14px] text-black/45 font-medium">Chuyến Bay</p>
                        <div className="bg-[#e6f4ff] p-1.5 rounded-md"><PlaneTakeoff size={16} className="text-[#1677ff]"/></div>
                    </div>
                    <h3 className="text-[24px] font-medium text-black/85">52,400</h3>
                    <div className="mt-4 text-[12px] text-[#52c41a] flex items-center gap-1">
                        <TrendingUp size={12} /> <span>+5.2% YoY</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow duration-300 relative">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[14px] text-black/45 font-medium">Hội Viên</p>
                        <div className="bg-[#e6f4ff] p-1.5 rounded-md"><Users size={16} className="text-[#1677ff]"/></div>
                    </div>
                    <h3 className="text-[24px] font-medium text-black/85">3.2M</h3>
                    <div className="mt-4 text-[12px] text-[#52c41a] flex items-center gap-1">
                        <TrendingUp size={12} /> <span>+12% YoY</span>
                    </div>
                </div>

                <div className="bg-[#fff1f0] p-5 rounded-lg border border-[#ffa39e] hover:shadow-md transition-shadow duration-300 relative lg:col-span-1 col-span-2">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[14px] text-[#cf1322] font-medium">Tín Chỉ EUA</p>
                        <div className="bg-[#ffccc7] p-1.5 rounded-md"><DollarSign size={16} className="text-[#cf1322]"/></div>
                    </div>
                    <h3 className="text-[24px] font-medium text-[#cf1322]">12,500</h3>
                    <div className="mt-4 text-[12px] text-[#cf1322] flex items-center gap-1 font-medium">
                        <AlertTriangle size={12} /> Cần mua gấp
                    </div>
                </div>
            </div>

            {/* Charts Grid 1: Môi trường (3 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow duration-300 flex flex-col h-[340px]">
                    <div className="px-5 py-3 border-b border-[#f0f0f0]">
                        <h3 className="text-[14px] font-medium text-black/85">Tiêu thụ NL theo tháng</h3>
                    </div>
                    <div className="p-5 flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={d1MonthlyFuel}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={{stroke: '#f0f0f0'}} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                <Legend wrapperStyle={{fontSize: '12px', color: 'rgba(0,0,0,0.85)'}} iconType="circle" />
                                <Bar dataKey="jet" name="Jet A-1" stackId="a" fill="#005f73" />
                                <Bar dataKey="saf" name="SAF" stackId="a" fill="#52c41a" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow duration-300 flex flex-col h-[340px]">
                    <div className="px-5 py-3 border-b border-[#f0f0f0]">
                        <h3 className="text-[14px] font-medium text-black/85">Phát thải CO2e theo tháng</h3>
                    </div>
                    <div className="p-5 flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={d1MonthlyEmission}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={{stroke: '#f0f0f0'}} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                <Legend wrapperStyle={{fontSize: '12px', color: 'rgba(0,0,0,0.85)'}} iconType="circle" />
                                <Bar dataKey="scope1" name="Phạm vi 1" stackId="a" fill="#fa8c16" />
                                <Bar dataKey="scope2" name="Phạm vi 2" stackId="a" fill="#722ed1" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow duration-300 flex flex-col h-[340px]">
                    <div className="px-5 py-3 border-b border-[#f0f0f0]">
                        <h3 className="text-[14px] font-medium text-black/85">Chi phí EUA & Phát thải vượt</h3>
                    </div>
                    <div className="p-5 flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={d1EuaCost}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={{stroke: '#f0f0f0'}} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                <Legend wrapperStyle={{fontSize: '12px', color: 'rgba(0,0,0,0.85)'}} iconType="circle" />
                                <Area yAxisId="left" type="monotone" dataKey="cost" name="Chi phí (K$)" fill="#ffccc7" stroke="#ff4d4f" />
                                <Line yAxisId="right" type="monotone" dataKey="excess" name="Vượt hạn ngạch" stroke="#faad14" strokeWidth={2} dot={{r: 4, strokeWidth: 2}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Grid 2: Vận hành & Xã hội (2 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow duration-300 flex flex-col h-[340px]">
                    <div className="px-5 py-3 border-b border-[#f0f0f0]">
                        <h3 className="text-[14px] font-medium text-black/85">Sự cố & Chuyến bay theo tháng</h3>
                    </div>
                    <div className="p-5 flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={d1FlightIncidents}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={{stroke: '#f0f0f0'}} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                <Legend wrapperStyle={{fontSize: '12px', color: 'rgba(0,0,0,0.85)'}} iconType="circle" />
                                <Bar yAxisId="left" dataKey="flights" name="Chuyến bay" fill="#005f73" radius={[4,4,0,0]} barSize={40} />
                                <Line yAxisId="right" type="monotone" dataKey="incidents" name="Sự cố" stroke="#ff4d4f" strokeWidth={2} dot={{r: 4}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#f0f0f0] hover:shadow-md transition-shadow duration-300 flex flex-col h-[340px]">
                    <div className="px-5 py-3 border-b border-[#f0f0f0]">
                        <h3 className="text-[14px] font-medium text-black/85">Xu hướng Hội viên theo tháng</h3>
                    </div>
                    <div className="p-5 flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={d1Members}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={{stroke: '#f0f0f0'}} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(0,0,0,0.45)'}} />
                                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                <Legend wrapperStyle={{fontSize: '12px', color: 'rgba(0,0,0,0.85)'}} iconType="circle" />
                                <Bar dataKey="members" name="Hội viên mới" fill="#faad14" radius={[4,4,0,0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* KHỐI KỸ THUẬT */}
      {activeTab === 2 && <BlockLayout blockKey="tech" title="Khối Kỹ Thuật"><TechCharts /></BlockLayout>}

      {/* KHỐI KHAI THÁC */}
      {activeTab === 3 && <BlockLayout blockKey="flight" title="Khối Khai Thác"><FlightCharts /></BlockLayout>}

      {/* KHỐI DỊCH VỤ */}
      {activeTab === 4 && <BlockLayout blockKey="service" title="Khối Dịch Vụ"><ServiceCharts /></BlockLayout>}

      {/* QUẢN LÝ CHUNG */}
      {activeTab === 5 && <BlockLayout blockKey="general" title="Quản Lý Chung"><GeneralCharts /></BlockLayout>}
</div>
  );
};
