import React, { useState } from 'react';
import { Button, Input, TextArea } from './UI';
import { FileText, Plus, ArrowLeft, UploadCloud, Save, Clock, CheckCircle, XCircle } from 'lucide-react';

interface DocumentRequest {
  id: string;
  title: string;
  description: string;
  fileName: string;
  submitDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  department: string;
}

const MOCK_REQUESTS: DocumentRequest[] = [
  { id: '1', title: 'Quy trình kiểm soát nhiên liệu 2026', description: 'Tài liệu bắt buộc cập nhật theo ISO mới', fileName: 'QT_NhienLieu_2026.pdf', submitDate: '01/06/2026', status: 'Pending', department: '' },
  { id: '2', title: 'Báo cáo hiệu năng máy bay T5', description: 'Số liệu nội bộ', fileName: 'Report_T5.xlsx', submitDate: '28/05/2026', status: 'Approved', department: '' },
];

export const DocumentUploadRequestTab: React.FC<{ departmentName: string }> = ({ departmentName }) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'CREATE'>('LIST');
  const [requests, setRequests] = useState<DocumentRequest[]>(
    MOCK_REQUESTS.map(req => ({ ...req, department: departmentName }))
  );
  
  const [formData, setFormData] = useState({ title: '', description: '' });

  const handleSave = () => {
    if (!formData.title) {
      alert("Vui lòng nhập tiêu đề tài liệu!");
      return;
    }
    const newReq: DocumentRequest = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      fileName: formData.title.replace(/\s+/g, '_') + '.pdf', // mockup filename
      submitDate: new Date().toLocaleDateString('vi-VN'),
      status: 'Pending',
      department: departmentName
    };
    setRequests([newReq, ...requests]);
    setViewMode('LIST');
    setFormData({ title: '', description: '' });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Pending': return <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded w-fit border border-amber-200"><Clock size={12}/> Chờ duyệt</span>;
      case 'Approved': return <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded w-fit border border-green-200"><CheckCircle size={12}/> Đã duyệt</span>;
      case 'Rejected': return <span className="flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded w-fit border border-red-200"><XCircle size={12}/> Từ chối</span>;
      default: return null;
    }
  };

  if (viewMode === 'CREATE') {
    return (
      <div className="animate-in slide-in-from-right-4 duration-300 flex-1">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
          <Button variant="ghost" onClick={() => setViewMode('LIST')} className="text-black/45 hover:text-vna-blue">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-vna-blue">Tạo yêu cầu tải lên tài liệu mới</h2>
            <p className="text-sm text-black/45">Tài liệu sẽ được gửi tới cấp quản lý phê duyệt trước khi lưu vào kho chung</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Upload Area */}
            <div className="lg:col-span-1">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center h-[300px] hover:bg-gray-50 transition-colors cursor-pointer bg-gray-50/50">
                    <div className="w-16 h-16 bg-blue-50 text-vna-blue rounded-full flex items-center justify-center mb-4">
                        <UploadCloud size={32} />
                    </div>
                    <h3 className="text-sm font-bold text-black/85 mb-1">Kéo thả file vào đây</h3>
                    <p className="text-xs text-black/45 mb-4">hoặc bấm để chọn từ máy tính</p>
                    <Button variant="outline" className="text-xs">Chọn File</Button>
                    <p className="text-[10px] text-gray-400 mt-4">Hỗ trợ: PDF, Excel, Word, Image (Max 20MB)</p>
                </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-2 space-y-5">
                <Input 
                    label="Tiêu đề tài liệu *" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="VD: Báo cáo kỹ thuật tháng 5..."
                />
                <TextArea 
                    label="Mô tả chi tiết" 
                    rows={4}
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Lý do upload, nội dung chính, đối tượng áp dụng..."
                />

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setViewMode('LIST')}>Hủy bỏ</Button>
                    <Button onClick={handleSave}><Save size={16}/> Gửi yêu cầu duyệt</Button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-vna-blue">Quản lý Yêu cầu Tài liệu - {departmentName}</h2>
          <p className="text-sm text-black/45 mt-1">Gửi yêu cầu upload tài liệu lên kho chung và theo dõi tiến độ phê duyệt</p>
        </div>
        <Button onClick={() => setViewMode('CREATE')} className="shadow-md flex items-center gap-1.5">
          <Plus size={18} /> Tạo yêu cầu upload
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 flex-1">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 font-semibold text-sm text-gray-700 w-12 text-center">STT</th>
              <th className="p-4 font-semibold text-sm text-gray-700 w-1/3">Tiêu đề tài liệu</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Tên file</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Ngày gửi</th>
              <th className="p-4 font-semibold text-sm text-gray-700 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {requests.map((req, idx) => (
              <tr key={req.id} className="hover:bg-blue-50 transition-colors">
                <td className="p-4 text-sm text-black/45 text-center">{idx + 1}</td>
                <td className="p-4">
                  <div className="font-bold text-black/85 text-sm mb-1">{req.title}</div>
                  <div className="text-xs text-black/45 line-clamp-1">{req.description}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-sm text-vna-blue font-medium">
                    <FileText size={16}/> {req.fileName}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">{req.submitDate}</td>
                <td className="p-4 flex justify-center">
                  {getStatusBadge(req.status)}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400 italic">Chưa có yêu cầu tài liệu nào được tạo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
