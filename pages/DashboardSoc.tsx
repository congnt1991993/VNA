import React, { useState } from 'react';
import { Card, Select, Toast, Button } from '../components/UI';
import { Users, Heart, GraduationCap, ShieldAlert, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const GENDER_AGE_DATA = [
  { age: '< 30', male: 1200, female: 1500 },
  { age: '30 - 40', male: 2500, female: 2100 },
  { age: '40 - 50', male: 1800, female: 1200 },
  { age: '> 50', male: 800, female: 400 },
];

const TRAINING_DATA = [
  { month: 'T1', hours: 12 }, { month: 'T2', hours: 15 }, { month: 'T3', hours: 18 },
  { month: 'T4', hours: 22 }, { month: 'T5', hours: 25 }, { month: 'T6', hours: 28 },
];

const CSI_DATA = [
  { month: 'T1', score: 82 }, { month: 'T2', score: 83 }, { month: 'T3', score: 85 },
  { month: 'T4', score: 84 }, { month: 'T5', score: 86 }, { month: 'T6', score: 88 },
];

export const DashboardSocPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setToast({ message: `Đã tải dữ liệu năm ${e.target.value}`, type: 'success' });
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan các chỉ tiêu' },
    { id: 'indicator-1', label: 'Mức độ hài lòng của khách hàng (NPS)' },
    { id: 'indicator-2', label: 'Tham gia hoạt động tình nguyện' },
  ];

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue">Báo cáo động - Xã hội (Social)</h1>
          <p className="text-black/45 text-sm mt-1">Theo dõi các chỉ số về nhân sự, an toàn và khách hàng</p>
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
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-black/45 font-medium uppercase">Tổng nhân sự</p>
            <h3 className="text-xl font-bold text-black/85">11,500 <span className="text-xs font-normal text-black/45">người</span></h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-xs text-black/45 font-medium uppercase">Tỷ lệ nữ quản lý</p>
            <h3 className="text-xl font-bold text-black/85">28.5 <span className="text-xs font-normal text-black/45">%</span></h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-xs text-black/45 font-medium uppercase">Giờ đào tạo TB</p>
            <h3 className="text-xl font-bold text-black/85">45.2 <span className="text-xs font-normal text-black/45">giờ/người</span></h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-xs text-black/45 font-medium uppercase">Tỷ lệ tai nạn (LTIFR)</p>
            <h3 className="text-xl font-bold text-black/85">0.12 <span className="text-xs font-normal text-black/45">/1M giờ</span></h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Phân bổ nhân sự theo độ tuổi & giới tính">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GENDER_AGE_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="male" name="Nam" fill="#006885" radius={[4, 4, 0, 0]} />
                <Bar dataKey="female" name="Nữ" fill="#e83e8c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Chỉ số hài lòng khách hàng (CSI)">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CSI_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00a859" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00a859" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" name="Điểm CSI" stroke="#00a859" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Giờ đào tạo trung bình tích lũy (Giờ/người)">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TRAINING_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hours" name="Giờ đào tạo" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      </>
      )}

      {activeTab === 'indicator-1' && (
        <div className="space-y-6">
          <Card title="Chỉ tiêu: Mức độ hài lòng của khách hàng (NPS)">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Mục tiêu năm 2025</p>
                <h3 className="text-2xl font-bold text-black/85">45 <span className="text-sm font-normal text-black/45">điểm</span></h3>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Thực hiện hiện tại</p>
                <h3 className="text-2xl font-bold text-green-600">42 <span className="text-sm font-normal text-black/45">điểm</span></h3>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Trạng thái</p>
                <h3 className="text-2xl font-bold text-yellow-600">Cần chú ý</h3>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { month: 'T1', nps: 38 }, { month: 'T2', nps: 39 }, { month: 'T3', nps: 40 },
                  { month: 'T4', nps: 41 }, { month: 'T5', nps: 41 }, { month: 'T6', nps: 42 },
                  { month: 'T7', nps: 42 }, { month: 'T8', nps: 42 }, { month: 'T9', nps: 42 },
                ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis domain={[30, 50]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="nps" name="Điểm NPS" stroke="#006885" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'indicator-2' && (
        <div className="space-y-6">
          <Card title="Chỉ tiêu: Tham gia hoạt động tình nguyện">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Mục tiêu năm 2025</p>
                <h3 className="text-2xl font-bold text-black/85">5,000 <span className="text-sm font-normal text-black/45">Giờ</span></h3>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Thực hiện hiện tại</p>
                <h3 className="text-2xl font-bold text-vna-blue">3,200 <span className="text-sm font-normal text-black/45">Giờ</span></h3>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-black/45 mb-1">Trạng thái</p>
                <h3 className="text-2xl font-bold text-green-600">Đạt tiến độ</h3>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { month: 'Q1', hours: 1200 },
                  { month: 'Q2', hours: 1500 },
                  { month: 'Q3', hours: 500 },
                ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" name="Số giờ tình nguyện" fill="#00a859" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};