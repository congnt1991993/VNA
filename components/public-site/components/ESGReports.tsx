import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { REPORTS, REPORTS_EN } from '../constants';
import { Download, Search, Home, ChevronRight } from 'lucide-react';

interface ESGReportsProps {
  onBack: () => void;
}

const ESGReports: React.FC<ESGReportsProps> = ({ onBack }) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const reportsList = isEn ? REPORTS_EN : REPORTS;

  const [activeYear, setActiveYear] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const publishedReports = reportsList.filter(r => r.status === 'published');
  
  const filteredReports = publishedReports.filter(report => {
    const matchYear = activeYear === 'all' || report.year === activeYear;
    const matchSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchYear && matchSearch;
  });

  const years = Array.from(new Set(publishedReports.map(r => r.year))).sort((a, b) => b - a);

  const displayYears = activeYear === 'all' ? years : [activeYear];

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-[14px] text-[rgba(0,0,0,0.45)] mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2">
            <li className="inline-flex items-center">
              <button onClick={onBack} className="hover:text-[rgba(0,0,0,0.88)] transition-colors flex items-center gap-1">
                <Home size={14} />
                <span>{isEn ? 'Home' : 'Trang chủ'}</span>
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight size={14} className="mx-1" />
                <span className="text-[rgba(0,0,0,0.88)]">{isEn ? 'Reports & Disclosures' : 'Báo cáo & Công bộ thông tin'}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-[30px] font-semibold text-[rgba(0,0,0,0.88)] mb-4">
            {isEn ? 'Sustainability & Annual Reports' : 'Báo cáo Phát triển Bền vững & Thường niên'}
          </h1>
          <p className="text-[14px] text-[rgba(0,0,0,0.65)] max-w-3xl leading-relaxed">
            {isEn 
              ? 'Explore detailed reports on business operations, sustainable development strategy (ESG), and key announcements from Vietnam Airlines over the years.'
              : 'Khám phá các báo cáo chi tiết về hoạt động kinh doanh, chiến lược phát triển bền vững (ESG) và các công bố thông tin quan trọng của Vietnam Airlines qua các năm.'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-md">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[rgba(0,0,0,0.25)] group-focus-within:text-[#1677ff] transition-colors">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder={isEn ? 'Search reports...' : 'Tìm kiếm báo cáo...'} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-esg-200 rounded-lg text-[14px] text-esg-900 placeholder:text-gray-400 hover:border-esg-500 focus:border-esg-500 focus:ring-2 focus:ring-esg-500/20 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-48 flex-shrink-0">
            <div className="md:sticky md:top-24 border-l-2 border-[#f0f0f0]">
              <button 
                onClick={() => setActiveYear('all')}
                className={`block w-full text-left px-4 py-2 text-[15px] font-medium transition-colors border-l-2 -ml-[2px] ${
                  activeYear === 'all' 
                    ? 'text-esg-600 border-esg-600 bg-esg-50' 
                    : 'text-gray-500 border-transparent hover:text-esg-900 hover:border-esg-200'
                }`}
              >
                {isEn ? 'All Years' : 'Tất cả các năm'}
              </button>
              {years.map(year => (
                <button 
                  key={year}
                  onClick={() => setActiveYear(year)}
                  className={`block w-full text-left px-4 py-2 text-[15px] font-medium transition-colors border-l-2 -ml-[2px] ${
                    activeYear === year 
                      ? 'text-esg-600 border-esg-600 bg-esg-50' 
                      : 'text-gray-500 border-transparent hover:text-esg-900 hover:border-esg-200'
                  }`}
                >
                  {isEn ? `Year ${year}` : `Năm ${year}`}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {filteredReports.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-[rgba(0,0,0,0.25)] border border-[#f0f0f0] rounded-lg bg-[#fafafa]">
                <Search size={48} className="mb-4 text-[#d9d9d9]" />
                <p className="text-[14px] text-[rgba(0,0,0,0.45)]">{isEn ? 'No matching reports found' : 'Không tìm thấy báo cáo phù hợp'}</p>
              </div>
            ) : (
              displayYears.map(year => {
                const reportsForYear = filteredReports.filter(r => r.year === year);
                if (reportsForYear.length === 0) return null;

                return (
                  <div key={year} className="mb-12 last:mb-0">
                    <h2 className="text-[20px] font-semibold text-[rgba(0,0,0,0.88)] mb-6 flex items-center gap-3">
                      {isEn ? `Year ${year}` : `Năm ${year}`}
                      <span className="text-[12px] font-normal text-[rgba(0,0,0,0.45)] bg-[#f5f5f5] border border-[#d9d9d9] px-2 py-0.5 rounded-full">
                        {reportsForYear.length} {isEn ? (reportsForYear.length > 1 ? 'reports' : 'report') : 'báo cáo'}
                      </span>
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {reportsForYear.map(report => (
                        <div 
                          key={report.id} 
                          className="group relative bg-white rounded-xl border border-esg-100 overflow-hidden hover:shadow-lg hover:border-esg-300 transition-all duration-300 flex flex-col h-full"
                        >
                          <div className="p-5 border-b border-esg-50 flex-shrink-0">
                            <div className="text-[15px] font-bold text-esg-950 line-clamp-2 mb-1 group-hover:text-esg-600 transition-colors">
                              {report.title}
                            </div>
                            <div className="text-[13px] text-gray-500 font-medium">
                              {report.type === 'Sustainability' 
                                ? (isEn ? 'Sustainability Report' : 'Báo cáo Phát triển Bền vững') 
                                : report.type === 'Annual' 
                                  ? (isEn ? 'Annual Report' : 'Báo cáo Thường niên') 
                                  : (isEn ? 'Other Document' : 'Tài liệu khác')}
                            </div>
                          </div>
                          <div className="relative h-56 bg-slate-50 flex items-center justify-center p-6 flex-grow">
                            <img 
                              src={report.thumbnailUrl} 
                              alt={report.title} 
                              className="max-h-full max-w-full object-contain shadow-md border border-gray-100 group-hover:scale-105 transition-transform duration-500 bg-white"
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-esg-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                              <a 
                                href={report.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white text-esg-900 px-6 py-3 rounded-full text-[14px] font-bold flex items-center gap-2 hover:bg-esg-50 transition-colors shadow-lg transform hover:-translate-y-0.5"
                              >
                                <Download size={18} />
                                {isEn ? 'Download' : 'Tải xuống'}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ESGReports;
