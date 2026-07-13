
import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Leaf, 
  Users, 
  Building2, 
  TrendingUp, 
  CheckSquare, 
  Database, 
  Globe, 
  ListChecks, 
  FileText,
  Activity,
  Sparkles
} from 'lucide-react';
import { PageName } from '../types';

interface DashboardPageProps {
  onNavigate: (page: PageName) => void;
}

interface TileProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  target: PageName;
  onNavigate: (page: PageName) => void;
  color?: string; // Optional accent color
}

const LaunchpadTile: React.FC<TileProps> = ({ title, subtitle, icon, target, onNavigate, color = "text-vna-blue" }) => (
  <div 
    onClick={() => onNavigate(target)}
    className="group bg-white hover:bg-vna-blue p-5 rounded-lg hover:shadow-md transition-shadow duration-300 hover:shadow-xl border border-gray-100 hover:border-vna-blue cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[150px]"
  >
    <div className="flex justify-between items-start z-10">
      <h3 className="font-bold text-gray-700 text-sm leading-snug group-hover:text-white transition-colors">
        {title}
      </h3>
    </div>
    
    {subtitle && (
      <p className="text-[11px] text-gray-400 mt-1 z-10 group-hover:text-white/80 transition-colors">
        {subtitle}
      </p>
    )}

    <div className={`mt-auto self-end transform group-hover:scale-110 transition-all duration-300 ${color} group-hover:text-white`}>
      {icon}
    </div>
  </div>
);

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* NHÓM 1: TRUNG TÂM BÁO CÁO */}
      <section>
        <h2 className="text-lg font-bold text-black/85 mb-4 border-l-4 border-vna-blue pl-3 flex items-center gap-2">
          Trung tâm Báo cáo <span className="text-gray-400 font-normal text-sm">(Reporting Hub)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          <LaunchpadTile 
            title="Tổng quan Điều hành" 
            subtitle="Dashboard tổng hợp"
            target="kpi-performance" 
            onNavigate={onNavigate}
            icon={<PieChart size={32} strokeWidth={1.5} />} 
          />
          <LaunchpadTile 
            title="Môi trường (Environment)" 
            subtitle="Báo cáo Trụ cột E"
            target="report-env" 
            onNavigate={onNavigate}
            icon={<Leaf size={32} strokeWidth={1.5} className="text-green-600" />} 
            color="text-green-600"
          />
          <LaunchpadTile 
            title="Xã hội (Social)" 
            subtitle="Báo cáo Trụ cột S"
            target="report-soc" 
            onNavigate={onNavigate}
            icon={<Users size={32} strokeWidth={1.5} className="text-blue-500" />} 
            color="text-blue-500"
          />
          <LaunchpadTile 
            title="Quản trị (Governance)" 
            subtitle="Báo cáo Trụ cột G"
            target="report-gov" 
            onNavigate={onNavigate}
            icon={<Building2 size={32} strokeWidth={1.5} className="text-purple-500" />} 
            color="text-purple-500"
          />
          <LaunchpadTile 
            title="Mô phỏng Kịch bản" 
            subtitle="NetZero & Dự báo"
            target="netzero-simulation" 
            onNavigate={onNavigate}
            icon={<TrendingUp size={32} strokeWidth={1.5} className="text-vna-gold" />} 
            color="text-vna-gold"
          />
        </div>
      </section>

      {/* NHÓM 2: QUẢN LÝ DỮ LIỆU */}
      <section>
        <h2 className="text-lg font-bold text-black/85 mb-4 border-l-4 border-vna-blue pl-3 flex items-center gap-2">
          Quản lý Dữ liệu <span className="text-gray-400 font-normal text-sm">(Data Management)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          <LaunchpadTile 
            title="Dữ liệu thô" 
            subtitle="Dữ liệu gốc từ nguồn"
            target="data-warehouse-raw" 
            onNavigate={onNavigate}
            icon={<Database size={32} strokeWidth={1.5} />} 
          />
          <LaunchpadTile 
            title="Dữ liệu chuẩn hóa" 
            subtitle="Dữ liệu đã chuẩn hóa"
            target="data-warehouse-clean" 
            onNavigate={onNavigate}
            icon={<Sparkles size={32} strokeWidth={1.5} className="text-purple-600" />} 
            color="text-purple-600"
          />
          <LaunchpadTile 
            title="Phân tích dữ liệu ESG" 
            subtitle="Thu thập & Phê duyệt"
            target="esg-data-analysis" 
            onNavigate={onNavigate}
            icon={<Activity size={32} strokeWidth={1.5} />} 
          />
        </div>
      </section>

      {/* NHÓM 3: QUẢN TRỊ & TÀI LIỆU */}
      <section>
        <h2 className="text-lg font-bold text-black/85 mb-4 border-l-4 border-vna-blue pl-3 flex items-center gap-2">
          Quản trị & Tài liệu <span className="text-gray-400 font-normal text-sm">(Admin & Docs)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          <LaunchpadTile 
            title="Quản trị Công bố" 
            subtitle="Website & Báo cáo ngoài"
            target="publishing" 
            onNavigate={onNavigate}
            icon={<Globe size={32} strokeWidth={1.5} />} 
          />
          <LaunchpadTile 
            title="Danh mục Chỉ tiêu" 
            subtitle="Cấu hình Metrics ESG"
            target="indicators" 
            onNavigate={onNavigate}
            icon={<ListChecks size={32} strokeWidth={1.5} />} 
          />
          <LaunchpadTile 
            title="Kho Tài liệu PTBV" 
            subtitle="Văn bản & Chứng chỉ"
            target="documents" 
            onNavigate={onNavigate}
            icon={<FileText size={32} strokeWidth={1.5} />} 
          />
        </div>
      </section>

    </div>
  );
};
