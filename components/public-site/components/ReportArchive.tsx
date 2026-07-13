import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { REPORTS, REPORTS_EN } from '../constants';
import { FileText, Download, Search, Filter } from 'lucide-react';

const ReportArchive: React.FC = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const reportsList = isEn ? REPORTS_EN : REPORTS;

  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const publishedReports = reportsList.filter(r => r.status === 'published');

  const filteredReports = publishedReports.filter(report => {
    const matchYear = filterYear === 'all' || report.year.toString() === filterYear;
    const matchType = filterType === 'all' || report.type === filterType;
    return matchYear && matchType;
  });

  const years = Array.from(new Set(publishedReports.map(r => r.year))).sort((a, b) => b - a);
  const types = Array.from(new Set(publishedReports.map(r => r.type)));

  return (
    <section id="reports" className="min-h-[calc(100vh-80px)] py-12 md:py-16 bg-white font-sans border-t border-[#f0f0f0] flex flex-col justify-center">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 uppercase tracking-tight">{isEn ? 'Documents & Reports' : 'Tài liệu & Báo cáo'}</h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {isEn ? 'Stay updated with Vietnam Airlines\' latest annual and sustainability reports.' : 'Cập nhật các báo cáo thường niên và báo cáo phát triển bền vững mới nhất của Vietnam Airlines.'}
          </p>
        </div>

        {/* Toolbar */}
        {/* <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-vna-blue/5 p-4 rounded-xl border border-vna-blue/10">
          <div className="text-[14px] font-bold text-vna-blue">
            {isEn ? `Showing ${filteredReports.length} documents` : `Hiển thị ${filteredReports.length} tài liệu`}
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[14px] font-semibold text-slate-700 whitespace-nowrap">{isEn ? 'Year:' : 'Năm:'}</span>
              <select 
                className="w-full sm:w-32 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-[14px] text-slate-900 hover:border-vna-gold focus:border-vna-gold focus:ring-1 focus:ring-vna-gold transition-colors outline-none cursor-pointer font-medium"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="all">{isEn ? 'All' : 'Tất cả'}</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[14px] font-semibold text-slate-700 whitespace-nowrap">{isEn ? 'Type:' : 'Loại:'}</span>
              <select 
                className="w-full sm:w-48 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-[14px] text-slate-900 hover:border-vna-gold focus:border-vna-gold focus:ring-1 focus:ring-vna-gold transition-colors outline-none cursor-pointer font-medium"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">{isEn ? 'All' : 'Tất cả'}</option>
                {types.map(t => <option key={t} value={t}>{
                  t === 'Annual' ? (isEn ? 'Annual Report' : 'Thường niên') : 
                  t === 'Sustainability' ? (isEn ? 'Sustainability Report' : 'Phát triển bền vững') : 
                  (isEn ? 'Other' : 'Khác')
                }</option>)}
              </select>
            </div>
          </div>
        </div> */}

        {/* Grid */}
        {filteredReports.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-[rgba(0,0,0,0.25)] border border-[#f0f0f0] rounded-lg bg-[#fafafa]">
            <Search size={48} className="mb-4 text-[#d9d9d9]" />
            <p className="text-[14px] text-[rgba(0,0,0,0.45)]">{isEn ? 'No documents found' : 'Không tìm thấy tài liệu phù hợp'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="group relative bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-vna-blue/30 transition-all duration-300 flex flex-col h-full"
              >
                <div className="p-4 border-b border-slate-100 flex-shrink-0 h-24 flex flex-col justify-between">
                  <div className="text-[14px] font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-vna-blue transition-colors">
                    {report.title}
                  </div>
                  <div className="text-[12px] text-gray-500 font-medium">
                    {report.type === 'Sustainability' ? (isEn ? 'Sustainability Report' : 'Báo cáo Phát triển Bền vững') :
                      report.type === 'Annual' ? (isEn ? 'Annual Report' : 'Báo cáo Thường niên') :
                        (isEn ? 'Other Document' : 'Tài liệu khác')}
                  </div>
                </div>
                <div className="relative h-44 bg-slate-50 overflow-hidden flex-grow">
                  <img
                    src={report.thumbnailUrl}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                    <a
                      href={report.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-vna-blue px-5 py-2.5 rounded-full text-[14px] font-bold flex items-center gap-2 hover:bg-vna-gold hover:text-white transition-all shadow-lg transform hover:-translate-y-0.5"
                    >
                      <Download size={16} />
                      {isEn ? 'Download' : 'Tải xuống'}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReportArchive;
