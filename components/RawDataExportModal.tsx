import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from './UI';
import { IndicatorExportInfo, exportIndicatorRawData } from './exportRawData';

interface RawDataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicator: IndicatorExportInfo | null;
  currentLang?: 'vi' | 'en';
}

export const RawDataExportModal: React.FC<RawDataExportModalProps> = ({
  isOpen,
  onClose,
  indicator,
  currentLang = 'vi'
}) => {
  const [fromDate, setFromDate] = useState<string>('2025-01-01');
  const [toDate, setToDate] = useState<string>('2026-05-31');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen || !indicator) return null;

  const handleExport = () => {
    if (!fromDate) {
      setErrorMessage(
        currentLang === 'vi'
          ? 'Vui lòng chọn thời gian bắt đầu (Từ thời gian).'
          : 'Please select start time.'
      );
      return;
    }
    if (!toDate) {
      setErrorMessage(
        currentLang === 'vi'
          ? 'Vui lòng chọn thời gian kết thúc (Đến thời gian).'
          : 'Please select end time.'
      );
      return;
    }
    if (fromDate > toDate) {
      setErrorMessage(
        currentLang === 'vi'
          ? 'Thời gian bắt đầu (Từ thời gian) không được lớn hơn thời gian kết thúc (Đến thời gian).'
          : 'Start time cannot be after end time.'
      );
      return;
    }

    setErrorMessage('');
    exportIndicatorRawData(indicator, {
      fromPeriod: fromDate,
      toPeriod: toDate,
      filterMode: 'date',
      lang: currentLang
    });

    onClose();
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
              <FileSpreadsheet size={22} />
            </div>
            <div className="text-left">
              <h3 className="text-base font-black text-slate-800 leading-tight">
                {currentLang === 'vi' ? 'Xuất dữ liệu thô (Raw Data)' : 'Export Raw Data'}
              </h3>
              {/* <p className="text-xs text-gray-500 font-semibold mt-0.5 truncate max-w-[280px]">
                {indicator.code} - {indicator.name}
              </p> */}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-left">
          {/* Inputs: Từ thời gian - Đến thời gian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {currentLang === 'vi' ? 'Từ thời gian *' : 'From Time *'}
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setErrorMessage(''); }}
                className="w-full px-3 py-2.5 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-vna-blue focus:border-vna-blue shadow-2xs cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {currentLang === 'vi' ? 'Đến thời gian *' : 'To Time *'}
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setErrorMessage(''); }}
                className="w-full px-3 py-2.5 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-vna-blue focus:border-vna-blue shadow-2xs cursor-pointer"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-700 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}


        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold py-2 px-4 border-gray-300 hover:bg-gray-100 cursor-pointer rounded-lg bg-white"
          >
            {currentLang === 'vi' ? 'Hủy bỏ' : 'Cancel'}
          </Button>

          <Button
            variant="primary"
            onClick={handleExport}
            className="text-xs font-bold py-2 px-5 flex items-center gap-2 shadow-sm bg-[#006885] hover:bg-[#005570] text-white cursor-pointer rounded-lg transition-all"
          >
            <Download size={15} />
            <span>{currentLang === 'vi' ? 'Xuất dữ liệu Excel' : 'Export Excel File'}</span>
          </Button>
        </div>

      </div>
    </div>
  );
};
