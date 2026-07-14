import React, { useState } from 'react';
import { Card, Button, Input, Table, Badge, Toast } from './UI';
import { kpiConfigs, KPIConfig } from '../data/kpiFormConfig';
import { Save, Upload, History, FileText, CheckCircle, Clock, CalendarRange, BarChart3 } from 'lucide-react';
import kpiRules from './NetzeroGRI_KPI_Rules.json';

interface ManualDataEntryProps {
  allowedKpiIds: string[];
}

export const ManualDataEntry: React.FC<ManualDataEntryProps> = ({ allowedKpiIds }) => {
  const [selectedKpiId, setSelectedKpiId] = useState<string>(allowedKpiIds[0] || '');
  const [reportPeriod, setReportPeriod] = useState<string>('Tháng 5/2026');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
  const [activeTab, setActiveTab] = useState<'DATA' | 'PLAN'>('DATA');

  const selectedConfig: KPIConfig | undefined = kpiConfigs[selectedKpiId];

  // Logic kiểm tra điều kiện hiển thị tab "Kế hoạch thực hiện"
  const checkShowPlanTab = (): boolean => {
    if (!selectedConfig) return false;
    const griCode = selectedConfig.code;
    const rule = (kpiRules as Record<string, { hasKpi: string; kpiSource: string }>)[griCode];
    
    if (!rule) {
      // Mặc định hiển thị nếu không tìm thấy cấu hình để tránh mất mát tính năng
      return true;
    }

    const hasKpi = rule.hasKpi.trim().toLowerCase();
    const kpiSource = rule.kpiSource.trim();

    // 1. Nếu Có KPI = Yes và Nguồn lấy dữ liệu KH/mục tiêu (KPI) = Nhập thủ công hoặc trống (blank)
    if (hasKpi === 'yes' && (kpiSource === 'Nhập thủ công' || kpiSource === '')) {
      return true;
    }
    // 2. Nếu Có KPI = No
    if (hasKpi === 'no') {
      return true;
    }

    return false;
  };

  const showPlanTab = checkShowPlanTab();

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = () => {
    setToast({ message: 'Đã lưu dữ liệu báo cáo thành công! Chờ KHPT duyệt.', type: 'success' });
    // Reset form after saving
    setTimeout(() => {
      setFormData({});
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Selection & Info */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5">
            <h3 className="text-lg font-bold text-[#005f6e] mb-4 border-b border-gray-100 pb-2">Thông tin Báo cáo</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ báo cáo</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#005f6e] focus:border-[#005f6e]"
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                >
                  <option>Tháng 5/2026</option>
                  <option>Tháng 4/2026</option>
                  <option>Quý 1/2026</option>
                  <option>Năm 2025</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chỉ tiêu cần nhập</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#005f6e] focus:border-[#005f6e]"
                  value={selectedKpiId}
                  onChange={(e) => {
                    setSelectedKpiId(e.target.value);
                    setFormData({}); // reset on change
                    setActiveTab('DATA'); // reset tab
                  }}
                >
                  {allowedKpiIds.map(id => (
                    <option key={id} value={id}>{kpiConfigs[id]?.code} - {kpiConfigs[id]?.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedConfig && (
              <div className="mt-6 p-4 bg-[#005f6e]/5 rounded-lg border border-[#005f6e]/10">
                <p className="text-sm text-gray-600 mb-2"><span className="font-semibold text-black/85">Mã chỉ tiêu:</span> {selectedConfig.code}</p>
                <p className="text-sm text-gray-600 mb-2"><span className="font-semibold text-black/85">Phụ trách:</span> {selectedConfig.department}</p>
                <p className="text-sm text-black/45 italic">Dữ liệu nhập vào sẽ được tổng hợp tự động lên báo cáo ESG theo chuẩn GRI/Airline.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Dynamic Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-black/85 flex items-center gap-2">
                <FileText className="text-[#e6b441]" size={20} />
                Biểu mẫu nhập liệu: {selectedConfig?.code}
              </h3>
            </div>

            {/* TAB SELECTOR (Chỉ hiển thị nếu thỏa mãn điều kiện kpiRules) */}
            {selectedConfig && showPlanTab && (
              <div className="flex border-b border-gray-200 mb-6 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('DATA')}
                  className={`px-4 py-2 text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'DATA'
                      ? 'border-[#005f6e] text-[#005f6e]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <BarChart3 size={16} />
                  Số liệu thực hiện
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('PLAN')}
                  className={`px-4 py-2 text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'PLAN'
                      ? 'border-[#005f6e] text-[#005f6e]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <CalendarRange size={16} />
                  Kế hoạch thực hiện
                </button>
              </div>
            )}

            {selectedConfig ? (
              <div className="flex-1 flex flex-col justify-between">
                {activeTab === 'PLAN' && showPlanTab ? (
                  /* TAB 2: KẾ HOẠCH THỰC HIỆN */
                  <div className="space-y-5 text-left animate-in fade-in duration-200">
                    <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
                      * Nhập kế hoạch và mục tiêu cần đạt được cho chỉ tiêu {selectedConfig.code} trong kỳ báo cáo này.
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Giá trị Kế hoạch (Target)
                        </label>
                        <Input 
                          type="number" 
                          placeholder="Nhập giá trị kế hoạch..." 
                          value={formData[`plan_target_${selectedConfig.id}`] || ''}
                          onChange={(e) => handleInputChange(`plan_target_${selectedConfig.id}`, e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Giá trị Mục tiêu (Goal)
                        </label>
                        <Input 
                          type="number" 
                          placeholder="Nhập giá trị mục tiêu..." 
                          value={formData[`plan_goal_${selectedConfig.id}`] || ''}
                          onChange={(e) => handleInputChange(`plan_goal_${selectedConfig.id}`, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* TAB 1: SỐ LIỆU THỰC HIỆN */
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {selectedConfig.fields.map(field => (
                        <div key={field.id} className={field.type === 'textarea' || field.type === 'file' ? 'md:col-span-2' : ''}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label} {field.unit && <span className="text-gray-400 font-normal">({field.unit})</span>}
                          </label>
                          
                          {field.type === 'number' && (
                            <Input 
                              type="number" 
                              placeholder={field.placeholder || '0'} 
                              value={formData[field.id] || ''}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                            />
                          )}
                          
                          {field.type === 'text' && (
                            <Input 
                              type="text" 
                              placeholder={field.placeholder || ''} 
                              value={formData[field.id] || ''}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                            />
                          )}

                          {field.type === 'textarea' && (
                            <textarea 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#005f6e] focus:border-[#005f6e] text-sm" 
                              rows={3} 
                              placeholder={field.placeholder || ''}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                            />
                          )}

                          {field.type === 'file' && (
                            <div className="flex items-center gap-3">
                              <Button variant="outline" className="gap-2 text-gray-600">
                                <Upload size={16} /> Chọn File
                              </Button>
                              <span className="text-sm text-gray-400">Hỗ trợ .pdf, .xlsx, .docx (Max 10MB)</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setFormData({})}>Làm lại</Button>
                  <Button variant="primary" className="bg-[#005f6e] gap-2" onClick={handleSave}>
                    <Save size={16} /> Lưu và Gửi duyệt
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-10">
                <FileText size={48} className="mb-4 opacity-20" />
                <p>Vui lòng chọn một chỉ tiêu để nhập liệu</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* History Table */}
      <Card className="p-0 overflow-hidden mt-6">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-black/85 flex items-center gap-2">
            <History size={18} className="text-[#005f6e]" />
            Lịch sử nhập liệu gần đây
          </h3>
        </div>
        <Table>
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3">Kỳ báo cáo</th>
              <th className="px-4 py-3">Chỉ tiêu</th>
              <th className="px-4 py-3">Người nhập</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 text-black/85">Tháng 4/2026</td>
              <td className="px-4 py-3 text-[#005f6e] font-medium">{selectedConfig?.code || 'Chỉ tiêu'}</td>
              <td className="px-4 py-3 text-gray-600">Trần Văn A</td>
              <td className="px-4 py-3 text-black/45 text-sm">05/05/2026 14:30</td>
              <td className="px-4 py-3"><Badge variant="success" className="gap-1"><CheckCircle size={12}/> Đã duyệt</Badge></td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 text-black/85">Quý 1/2026</td>
              <td className="px-4 py-3 text-[#005f6e] font-medium">{selectedConfig?.code || 'Chỉ tiêu'}</td>
              <td className="px-4 py-3 text-gray-600">Nguyễn Thị B</td>
              <td className="px-4 py-3 text-black/45 text-sm">10/04/2026 09:15</td>
              <td className="px-4 py-3"><Badge variant="warning" className="gap-1"><Clock size={12}/> Chờ duyệt</Badge></td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </div>
  );
};
