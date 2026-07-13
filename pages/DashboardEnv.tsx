import React, { useState } from 'react';
import { Card, Select, Toast, Button } from '../components/UI';
import { Leaf, Droplets, Wind, Zap, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const EMISSION_DATA = [
  { name: 'Q1', scope1: 1200, scope2: 300, scope3: 150 },
  { name: 'Q2', scope1: 1350, scope2: 320, scope3: 160 },
  { name: 'Q3', scope1: 1400, scope2: 350, scope3: 180 },
  { name: 'Q4', scope1: 1100, scope2: 280, scope3: 140 },
];

const INTENSITY_DATA = [
  { month: 'T1', value: 85 }, { month: 'T2', value: 84 }, { month: 'T3', value: 82 },
  { month: 'T4', value: 83 }, { month: 'T5', value: 81 }, { month: 'T6', value: 80 },
  { month: 'T7', value: 79 }, { month: 'T8', value: 78 }, { month: 'T9', value: 77 },
  { month: 'T10', value: 76 }, { month: 'T11', value: 75 }, { month: 'T12', value: 74 },
];

const ENERGY_DATA = [
  { name: 'Nhiên liệu bay (Jet A1)', value: 85 },
  { name: 'Nhiên liệu bay (SAF)', value: 5 },
  { name: 'Điện năng mặt đất', value: 8 },
  { name: 'Xăng dầu mặt đất', value: 2 },
];

const COLORS = ['#006885', '#00a859', '#f59e0b', '#ef4444'];

export const DashboardEnvPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setToast({ message: `Đã tải dữ liệu năm ${e.target.value}`, type: 'success' });
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan các chỉ tiêu' },
    { id: 'indicator-1', label: 'Tiếng ồn' },
    { id: 'indicator-2', label: 'Năng lượng tiêu thụ' },
    { id: 'indicator-3', label: 'Giảm tiêu thụ năng lượng' },
  ];

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue">Báo cáo động - Môi trường (Environment)</h1>
          <p className="text-black/45 text-sm mt-1">Theo dõi các chỉ số phát thải, năng lượng và tài nguyên</p>
        </div>
        <div className="flex gap-4">
          <Select options={[{label: 'Năm 2025', value: '2025'}, {label: 'Năm 2024', value: '2024'}]} value="2025" className="w-40" onChange={handleYearChange} />
          <Button variant="outline" onClick={() => setToast({ message: 'Đang xuất báo cáo...', type: 'info' })}>
            <Download size={16} className="mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-vna-blue text-vna-blue'
                  : 'border-transparent text-black/45 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Wind size={24} />
          </div>
          <div>
            <p className="text-xs text-black/45 font-medium uppercase">Tổng phát thải (Scope 1,2,3)</p>
            <h3 className="text-xl font-bold text-black/85">5,050 <span className="text-xs font-normal text-black/45">ngàn tấn CO2e</span></h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <Leaf size={24} />
          </div>
          <div>
            <p className="text-xs text-black/45 font-medium uppercase">Cường độ phát thải</p>
            <h3 className="text-xl font-bold text-black/85">74.5 <span className="text-xs font-normal text-black/45">gCO2/RPK</span></h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-xs text-black/45 font-medium uppercase">Tỷ lệ sử dụng SAF</p>
            <h3 className="text-xl font-bold text-black/85">5.2 <span className="text-xs font-normal text-black/45">%</span></h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
            <Droplets size={24} />
          </div>
          <div>
            <p className="text-xs text-black/45 font-medium uppercase">Tiêu thụ nước</p>
            <h3 className="text-xl font-bold text-black/85">450 <span className="text-xs font-normal text-black/45">ngàn m³</span></h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Phát thải Khí nhà kính theo Scope (Ngàn tấn CO2e)">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EMISSION_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="scope1" name="Scope 1 (Trực tiếp)" stackId="a" fill="#006885" />
                <Bar dataKey="scope2" name="Scope 2 (Gián tiếp)" stackId="a" fill="#00a859" />
                <Bar dataKey="scope3" name="Scope 3 (Chuỗi giá trị)" stackId="a" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Cường độ phát thải theo tháng (gCO2/RPK)">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={INTENSITY_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="value" name="gCO2/RPK" stroke="#00a859" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Cơ cấu tiêu thụ năng lượng">
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ENERGY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {ENERGY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      </>
      )}

      {activeTab === 'indicator-1' && (
        <div className="space-y-6">
          <Card title="Chỉ tiêu: Tiếng ồn (% đội tàu đáp ứng Annex 16)">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Mục tiêu năm 2025</p>
                <h3 className="text-2xl font-bold text-black/85">100%</h3>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Thực hiện hiện tại</p>
                <h3 className="text-2xl font-bold text-green-600">98%</h3>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Trạng thái</p>
                <h3 className="text-2xl font-bold text-yellow-600">Cần chú ý</h3>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { month: 'T1', value: 95 }, { month: 'T2', value: 95 }, { month: 'T3', value: 96 },
                  { month: 'T4', value: 96 }, { month: 'T5', value: 97 }, { month: 'T6', value: 97 },
                  { month: 'T7', value: 98 }, { month: 'T8', value: 98 }, { month: 'T9', value: 98 },
                ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis domain={[90, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="% Đội tàu đáp ứng" stroke="#006885" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'indicator-2' && (
        <div className="space-y-6">
          <Card title="Chỉ tiêu: Năng lượng tiêu thụ">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Mục tiêu năm 2025</p>
                <h3 className="text-2xl font-bold text-black/85">1,200,000 <span className="text-sm font-normal text-black/45">GJ</span></h3>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Thực hiện hiện tại</p>
                <h3 className="text-2xl font-bold text-vna-blue">850,000 <span className="text-sm font-normal text-black/45">GJ</span></h3>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Trạng thái</p>
                <h3 className="text-2xl font-bold text-green-600">Đạt tiến độ</h3>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={[
                  { month: 'Q1', jetA1: 250000, saf: 10000 },
                  { month: 'Q2', jetA1: 260000, saf: 15000 },
                  { month: 'Q3', jetA1: 270000, saf: 20000 },
                ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="jetA1" stackId="a" name="Jet A1 (GJ)" fill="#006885" />
                  <Bar dataKey="saf" stackId="a" name="SAF (GJ)" fill="#00a859" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'indicator-3' && (
        <div className="space-y-6">
          <Card title="Chỉ tiêu: Giảm tiêu thụ năng lượng">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Mục tiêu năm 2025</p>
                <h3 className="text-2xl font-bold text-black/85">50,000 <span className="text-sm font-normal text-black/45">Tấn</span></h3>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Thực hiện hiện tại</p>
                <h3 className="text-2xl font-bold text-red-600">45,000 <span className="text-sm font-normal text-black/45">Tấn</span></h3>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Trạng thái</p>
                <h3 className="text-2xl font-bold text-red-600">Cảnh báo</h3>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { month: 'T1', target: 4000, actual: 3800 },
                  { month: 'T2', target: 8000, actual: 7500 },
                  { month: 'T3', target: 12000, actual: 11000 },
                  { month: 'T4', target: 16000, actual: 15000 },
                  { month: 'T5', target: 20000, actual: 18500 },
                  { month: 'T6', target: 25000, actual: 22000 },
                  { month: 'T7', target: 29000, actual: 26000 },
                  { month: 'T8', target: 33000, actual: 30000 },
                  { month: 'T9', target: 37000, actual: 34000 },
                ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="target" name="Kế hoạch lũy kế (Tấn)" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} />
                  <Line type="monotone" dataKey="actual" name="Thực tế lũy kế (Tấn)" stroke="#ef4444" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
