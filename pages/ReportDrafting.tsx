import React, { useState } from 'react';
import { Card, Button, Select, Toast } from '../components/UI';
import { Save, Download, FileText, BarChart2, Copy, Check, Type, AlignLeft, AlignCenter, AlignRight, List, Image as ImageIcon, Circle, Edit2, CheckCircle2 } from 'lucide-react';

type DraftStatus = 'draft' | 'in_progress' | 'completed';

const STATUS_CONFIG = {
  'draft': { label: 'Soạn thảo nháp', color: 'text-black/45', bg: 'bg-gray-100', icon: <Circle size={12} className="text-black/45" /> },
  'in_progress': { label: 'Đang soạn thảo', color: 'text-vna-blue', bg: 'bg-blue-50', icon: <Edit2 size={12} className="text-vna-blue" /> },
  'completed': { label: 'Đã soạn thảo', color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle2 size={12} className="text-green-600" /> }
};

export const ReportDraftingPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedSection, setSelectedSection] = useState('leadership');
  const [content, setContent] = useState('Tổng công ty Hàng không Việt Nam (Vietnam Airlines) cam kết duy trì các tiêu chuẩn cao nhất về quản trị doanh nghiệp. Quy trình đề cử và bầu chọn thành viên Hội đồng Quản trị được thực hiện minh bạch, công khai, đảm bảo sự đa dạng về chuyên môn, giới tính và kinh nghiệm...');
  const [isSaved, setIsSaved] = useState(false);

  const [sectionStatuses, setSectionStatuses] = useState<Record<string, DraftStatus>>({
    'message': 'completed',
    'gov': 'in_progress',
    'leadership': 'in_progress',
    'policy': 'draft',
    'env': 'draft'
  });

  const handleAction = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const handleSave = () => {
    setIsSaved(true);
    handleAction('Đã lưu bản nháp thành công!', 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSectionStatuses({
      ...sectionStatuses,
      [selectedSection]: e.target.value as DraftStatus
    });
  };

  const renderSectionButton = (id: string, label: string, isSub: boolean = false) => {
    const isSelected = selectedSection === id;
    const status = sectionStatuses[id] || 'draft';
    const config = STATUS_CONFIG[status];
    
    return (
      <button 
        className={`w-full flex items-center justify-between px-3 py-${isSub ? '1.5' : '2'} rounded text-sm transition-colors ${isSelected ? 'bg-vna-blue/10 text-vna-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
        onClick={() => setSelectedSection(id)}
      >
        <span className="truncate pr-2">{label}</span>
        <span title={config.label} className="shrink-0">{config.icon}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue">Soạn thảo báo cáo ESG</h1>
          <p className="text-black/45 text-sm mt-1">Công cụ hỗ trợ Tổ thư ký soạn thảo nội dung chuyên môn</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleAction('Đang xuất file Word...', 'info')}>
            <Download size={16} className="mr-2" />
            Xuất Word (DOCX)
          </Button>
          <Button variant="outline" onClick={() => handleAction('Đang xuất file PDF...', 'info')}>
            <Download size={16} className="mr-2" />
            Xuất PDF
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {isSaved ? <Check size={16} className="mr-2" /> : <Save size={16} className="mr-2" />}
            {isSaved ? 'Đã lưu' : 'Lưu bản nháp'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar: Sections & Data */}
        <div className="col-span-3 space-y-6">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm uppercase text-black/45">Cấu trúc báo cáo</h3>
            </div>
            <div className="space-y-1">
              {renderSectionButton('message', '1. Thông điệp Lãnh đạo')}
              {renderSectionButton('gov', '2. Quản trị (Governance)')}
              <div className="pl-4 space-y-1 mt-1">
                {renderSectionButton('leadership', '2.1 Quy trình đề cử Lãnh đạo', true)}
                {renderSectionButton('policy', '2.2 Cam kết chính sách', true)}
              </div>
              {renderSectionButton('env', '3. Môi trường (Environment)')}
            </div>
            
            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <div className="text-xs font-medium text-black/45 uppercase mb-2">Chú giải trạng thái</div>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2 text-xs text-gray-600">
                  {config.icon}
                  <span>{config.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Editor */}
        <div className="col-span-9">
          <Card className="p-0 overflow-hidden h-[600px] flex flex-col">
            {/* Editor Header & Status */}
            <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium text-black/85">
                  {selectedSection === 'message' ? '1. Thông điệp Lãnh đạo' :
                   selectedSection === 'gov' ? '2. Quản trị (Governance)' :
                   selectedSection === 'leadership' ? '2.1 Quy trình đề cử Lãnh đạo' :
                   selectedSection === 'policy' ? '2.2 Cam kết chính sách' :
                   '3. Môi trường (Environment)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-black/45">Trạng thái:</span>
                <select 
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-vna-blue bg-white"
                  value={sectionStatuses[selectedSection] || 'draft'}
                  onChange={handleStatusChange}
                >
                  <option value="draft">Soạn thảo nháp</option>
                  <option value="in_progress">Đang soạn thảo</option>
                  <option value="completed">Đã soạn thảo</option>
                </select>
              </div>
            </div>

            {/* Editor Toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1">
              <Select className="w-32 h-8 text-sm py-1" onChange={() => handleAction('Đã đổi định dạng văn bản', 'info')}>
                <option>Normal text</option>
                <option>Heading 1</option>
                <option>Heading 2</option>
                <option>Heading 3</option>
              </Select>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('Đã áp dụng In đậm', 'info')}><Type size={16} className="font-bold" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('Đã áp dụng In nghiêng', 'info')}><Type size={16} className="italic" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('Đã áp dụng Gạch chân', 'info')}><Type size={16} className="underline" /></Button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('Căn trái', 'info')}><AlignLeft size={16} /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('Căn giữa', 'info')}><AlignCenter size={16} /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('Căn phải', 'info')}><AlignRight size={16} /></Button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('Tạo danh sách', 'info')}><List size={16} /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('Chèn hình ảnh', 'info')}><ImageIcon size={16} /></Button>
            </div>
            
            {/* Editor Area */}
            <div className="flex-1 p-8 bg-gray-100 overflow-y-auto">
              <div className="bg-white min-h-full hover:shadow-md transition-shadow duration-300 border border-gray-200 p-10 max-w-3xl mx-auto">
                <textarea 
                  className="w-full h-full min-h-[400px] resize-none outline-none text-gray-700 leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Bắt đầu soạn thảo..."
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
