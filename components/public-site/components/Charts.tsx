import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { CHART_DATA_CO2 } from '../constants';

export const EmissionsChart: React.FC = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={CHART_DATA_CO2}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#166534" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#166534" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ade86" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4ade86" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend iconType="circle" />
          <Area
            type="monotone"
            dataKey="emissions"
            name={isEn ? "Actual Emissions Level" : "Mức phát thải thực tế"}
            stroke="#166534"
            fillOpacity={1}
            fill="url(#colorEmissions)"
            strokeWidth={4}
          />
          <Area
            type="monotone"
            dataKey="target"
            name={isEn ? "Target" : "Mục tiêu"}
            stroke="#4ade86"
            fillOpacity={1}
            fill="url(#colorTarget)"
            strokeDasharray="5 5"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SocialImpactChart: React.FC = () => {
    const { i18n } = useTranslation();
    const isEn = i18n.language === 'en';

    const data = [
        { name: isEn ? 'Healthcare' : 'Y tế', value: 4000 },
        { name: isEn ? 'Education' : 'Giáo dục', value: 3000 },
        { name: isEn ? 'Relief' : 'Cứu trợ', value: 2000 },
        { name: isEn ? 'Culture' : 'Văn hóa', value: 2780 },
    ];

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}}/>
                    <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="value" name={isEn ? "Beneficiaries" : "Người hưởng lợi"} fill="#16a34a" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

// --- NEW CHARTS FOR DETAILED VIEWS ---

export const FuelMixChart: React.FC = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const data = [
    { year: '2023', traditional: 99.8, saf: 0.2 },
    { year: '2024', traditional: 98, saf: 2 },
    { year: '2025', traditional: 95, saf: 5 },
    { year: '2030', traditional: 80, saf: 20 },
  ];

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10}/>
          <YAxis axisLine={false} tickLine={false} unit="%" tick={{fill: '#6B7280', fontSize: 12}}/>
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
          <Legend />
          <Bar dataKey="traditional" stackId="a" name={isEn ? "JET A1 Fuel" : "Nhiên liệu JET A1"} fill="#e5e7eb" />
          <Bar dataKey="saf" stackId="a" name={isEn ? "SAF Fuel (Green)" : "Nhiên liệu SAF (Xanh)"} fill="#16a34a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export const DiversityChart: React.FC = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const data = [
    { name: isEn ? 'Male' : 'Nam', value: 55 },
    { name: isEn ? 'Female' : 'Nữ', value: 45 },
  ];
  const COLORS = ['#e5e7eb', '#22c55d'];

  return (
    <div className="h-[250px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export const SafetyScoreChart: React.FC = () => {
    const { i18n } = useTranslation();
    const isEn = i18n.language === 'en';

    const data = [
        { subject: 'IOSA', A: 100, fullMark: 100 },
        { subject: isEn ? 'Flight Safety' : 'An toàn bay', A: 99.9, fullMark: 100 },
        { subject: isEn ? 'Technical' : 'Kỹ thuật', A: 100, fullMark: 100 },
        { subject: isEn ? 'Ground Ops' : 'Mặt đất', A: 98, fullMark: 100 },
    ];
    // Simulating a bar chart for scores as Radar chart might be complex to style perfectly without more config
    return (
        <div className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB"/>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="subject" type="category" width={80} axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 12, fontWeight: 500}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="A" name={isEn ? "Compliance Score (%)" : "Điểm tuân thủ (%)"} fill="#15803d" barSize={24} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#15803d', fontSize: 13, fontWeight: 'bold' }} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}