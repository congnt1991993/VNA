import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Line,
  AreaChart,
  Area,
  LineChart,
} from 'recharts';

interface IndicatorChartProps {
  indicatorCode: string;
  chartName: string;
  chartType: string;
  reportYear?: string;
  reportQuarter?: string;
  reportMonth?: string;
}

const CHART_COLORS = ['#005f73', '#0a9396', '#94d2bd', '#e9d8a6', '#ee9b00', '#ca6702', '#bb3e03', '#ae2012'];

// Deterministic random value generator based on hash
function getDeterministicValue(code: string, index: number, year: number, offset = 0): number {
  let hash = 0;
  const key = `${code}-${year}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const val = Math.abs(hash + index * 41 + offset * 97) % 100;
  return val;
}

export const IndicatorChart: React.FC<IndicatorChartProps> = ({
  indicatorCode,
  chartName,
  chartType,
  reportYear = '2026',
  reportQuarter = '2',
  reportMonth = 'all',
}) => {
  const ctype = chartType.toLowerCase();
  const yearNum = Number(reportYear);

  // Generate deterministic trend data (T1 - T12)
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  const trendData = months.map((m, i) => {
    const seed = getDeterministicValue(indicatorCode, i + 1, yearNum);
    
    let target, actual;
    if (indicatorCode === 'GRI 418-1') {
      // Almost all months are 0, only 1 case in T4 and T8
      actual = (i === 3 || i === 7) ? 1 : 0;
      target = 0;
    } else {
      target = 60 + (seed % 30); // Target between 60 and 90
      const variance = (seed % 15) - 7;
      actual = Math.max(0, target + variance);
    }

    return {
      month: m,
      actual,
      target,
      value1: actual * 0.65,
      value2: actual * 0.35,
    };
  });

  // Generate deterministic pie data
  const pieData = indicatorCode === 'GRI 302-1' ? [
    { name: 'Nhiên liệu SAF', value: 2.5 },
    { name: 'Nhiên liệu Jet-A1', value: 97.5 },
  ] : [
    { name: 'Khối Cơ quan', value: 30 + (getDeterministicValue(indicatorCode, 1, yearNum, 10) % 40) },
    { name: 'Khối Khai thác', value: 20 + (getDeterministicValue(indicatorCode, 2, yearNum, 20) % 35) },
    { name: 'Khối Dịch vụ', value: 15 + (getDeterministicValue(indicatorCode, 3, yearNum, 30) % 25) },
    { name: 'Đơn vị khác', value: 10 + (getDeterministicValue(indicatorCode, 4, yearNum, 40) % 15) },
  ];

  // If the chart type is not configured or unknown, return fallback UI
  const isPie = ctype.includes('donut') || ctype.includes('doughnut') || ctype.includes('pie');
  const isBar = ctype.includes('bar') || ctype.includes('column');
  const isCombo = ctype.includes('combo');
  const isArea = ctype.includes('area');
  const isLine = ctype.includes('line');

  if (!isPie && !isBar && !isCombo && !isArea && !isLine) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
        <div>
          <p className="text-sm font-semibold text-gray-500">Chưa cấu hình biểu đồ cho chỉ tiêu này</p>
          <p className="mt-1 text-xs text-gray-400">Chỉ tiêu: {indicatorCode} ({chartName || 'Chưa đặt tên'})</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[250px] relative">
      <ResponsiveContainer width="100%" height="100%">
        {isPie ? (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={ctype.includes('pie') ? 0 : 55}
              outerRadius={75}
              fill="#8884d8"
              paddingAngle={ctype.includes('pie') ? 0 : 4}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        ) : isBar ? (
          <BarChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8c8c8c' }} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#8c8c8c' }} 
              domain={indicatorCode === 'GRI 418-1' ? [0, 10] : undefined}
              allowDecimals={indicatorCode === 'GRI 418-1' ? false : undefined}
            />
            <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }} />
            <Legend verticalAlign="bottom" height={24} iconType="rect" wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="value1" name="Thực tế" stackId={ctype.includes('stacked') ? "a" : undefined} fill="#005f73" />
            {ctype.includes('stacked') && <Bar dataKey="value2" name="Bổ sung" stackId="a" fill="#94d2bd" />}
            {!ctype.includes('stacked') && <Bar dataKey="target" name="Kế hoạch" fill="#e9d8a6" />}
          </BarChart>
        ) : isCombo ? (
          <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8c8c8c' }} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#8c8c8c' }} 
              domain={indicatorCode === 'GRI 418-1' ? [0, 10] : undefined}
              allowDecimals={indicatorCode === 'GRI 418-1' ? false : undefined}
            />
            <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }} />
            <Legend verticalAlign="bottom" height={24} iconType="rect" wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="actual" name="Thực tế" fill="#0a9396" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="target" name="Kế hoạch" stroke="#ca6702" strokeWidth={2.5} dot={{ r: 3 }} />
          </ComposedChart>
        ) : isArea ? (
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94d2bd" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#94d2bd" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8c8c8c' }} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#8c8c8c' }} 
              domain={indicatorCode === 'GRI 418-1' ? [0, 10] : undefined}
              allowDecimals={indicatorCode === 'GRI 418-1' ? false : undefined}
            />
            <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }} />
            <Area type="monotone" dataKey="actual" name="Thực tế" stroke="#0a9396" strokeWidth={2.5} fillOpacity={1} fill="url(#colorArea)" />
          </AreaChart>
        ) : (
          <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8c8c8c' }} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#8c8c8c' }} 
              domain={indicatorCode === 'GRI 418-1' ? [0, 10] : undefined}
              allowDecimals={indicatorCode === 'GRI 418-1' ? false : undefined}
            />
            <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }} />
            <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
            <Line type="monotone" dataKey="actual" name="Thực tế" stroke="#005f73" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="target" name="Kế hoạch" stroke="#e9b000" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
