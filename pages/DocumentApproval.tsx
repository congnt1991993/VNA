import React, { useState } from 'react';
import { Button } from '../components/UI';
import { CheckCircle, XCircle, FileText, Download, Clock, Eye, AlertCircle, RefreshCw } from 'lucide-react';

interface DocumentRequest {
  id: string;
  title: string;
  description: string;
  fileName: string;
  submitDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  department: string;
  requestedBy: string;
}

const MOCK_PENDING_REQUESTS: DocumentRequest[] = [
  { id: '101', title: 'Quy trình kiểm soát nhiên liệu 2026', description: 'Tài liệu bắt buộc cập nhật theo ISO mới', fileName: 'QT_NhienLieu_2026.pdf', submitDate: '01/06/2026', status: 'Pending', department: 'Ban Quản lý vật tư', requestedBy: 'Lê Kỹ Thuật' },
  { id: '102', title: 'Hồ sơ đánh giá rủi ro an toàn chuyến bay', description: 'Đánh giá an toàn chuyến bay quý 2', fileName: 'Risk_Assess_Q2.docx', submitDate: '02/06/2026', status: 'Pending', department: 'Trung tâm Điều hành khai thác', requestedBy: 'Trần Khai Thác' },
  { id: '103', title: 'Chính sách phúc lợi nhân sự sửa đổi', description: 'Theo quyết định số 123/QĐ', fileName: 'Chinh_sach_Nhan_su_v2.pdf', submitDate: '02/06/2026', status: 'Pending', department: 'Ban Nhân sự', requestedBy: 'Phạm Nhân Sự' },
];

export const DocumentApprovalPage: React.FC = () => {
  const [requests, setRequests] = useState<DocumentRequest[]>(MOCK_PENDING_REQUESTS);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'PROCESSED'>('PENDING');
  
  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const processedRequests = requests.filter(r => r.status !== 'Pending');

  const handleApprove = (id: string) => {
    if(confirm("Bạn có chắc chắn muốn phê duyệt tài liệu này và tự động chuyển vào Kho tài liệu chung?")) {
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
      // In a real app, this would also trigger an API call to add to Documents repo
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt("Vui lòng nhập lý do từ chối tài liệu:");
    if (reason !== null) {
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-100 pb-6">
         <div>
            <h1 className="text-2xl font-bold text-vna-blue flex items-center gap-2">
                <CheckCircle size={28} className="text-vna-gold" />
                Phê duyệt Yêu cầu Tài liệu ESG
            </h1>
            <p className="text-sm text-black/45 mt-1">Kiểm duyệt và tự động đưa tài liệu của các tổ/ban vào kho lưu trữ chung</p>
         </div>
         <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw size={16}/> Làm mới
            </Button>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button 
          className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 relative ${activeTab === 'PENDING' ? 'border-vna-gold text-vna-blue' : 'border-transparent text-black/45 hover:text-gray-700'}`}
          onClick={() => setActiveTab('PENDING')}
        >
          Chờ phê duyệt
          {pendingRequests.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {pendingRequests.length}
            </span>
          )}
        </button>
        <button 
          className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'PROCESSED' ? 'border-vna-gold text-vna-blue' : 'border-transparent text-black/45 hover:text-gray-700'}`}
          onClick={() => setActiveTab('PROCESSED')}
        >
          Đã xử lý
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 font-semibold text-sm text-gray-700 w-12 text-center">STT</th>
              <th className="p-4 font-semibold text-sm text-gray-700 w-1/3">Thông tin tài liệu</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Tổ / Ban yêu cầu</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Ngày gửi</th>
              <th className="p-4 font-semibold text-sm text-gray-700 text-center">Tình trạng</th>
              <th className="p-4 font-semibold text-sm text-gray-700 text-center w-36">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {(activeTab === 'PENDING' ? pendingRequests : processedRequests).map((req, idx) => (
              <tr key={req.id} className="hover:bg-blue-50 transition-colors group">
                <td className="p-4 text-sm text-black/45 text-center">{idx + 1}</td>
                <td className="p-4">
                  <div className="font-bold text-black/85 text-sm mb-1">{req.title}</div>
                  <div className="text-xs text-black/45 line-clamp-1 mb-2">{req.description}</div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-vna-blue bg-blue-50 px-2 py-1 rounded border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
                    <FileText size={14}/> <span>{req.fileName}</span> <Download size={12} className="ml-1 text-blue-400"/>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-semibold text-black/85">{req.department}</div>
                  <div className="text-xs text-black/45">Bởi: {req.requestedBy}</div>
                </td>
                <td className="p-4 text-sm text-gray-600">{req.submitDate}</td>
                <td className="p-4">
                  <div className="flex justify-center">
                    {req.status === 'Pending' && <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded w-fit border border-amber-200"><Clock size={12}/> Chờ duyệt</span>}
                    {req.status === 'Approved' && <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded w-fit border border-green-200"><CheckCircle size={12}/> Đã duyệt</span>}
                    {req.status === 'Rejected' && <span className="flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded w-fit border border-red-200"><XCircle size={12}/> Từ chối</span>}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    {req.status === 'Pending' ? (
                      <>
                        <button 
                            onClick={() => handleApprove(req.id)}
                            className="p-1.5 rounded-md text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            title="Phê duyệt"
                        >
                            <CheckCircle size={18} />
                        </button>
                        <button 
                            onClick={() => handleReject(req.id)}
                            className="p-1.5 rounded-md text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                            title="Từ chối"
                        >
                            <XCircle size={18} />
                        </button>
                      </>
                    ) : (
                      <button className="p-1.5 rounded-md text-gray-400 hover:text-vna-blue hover:bg-blue-50 transition-colors" title="Xem chi tiết">
                        <Eye size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {(activeTab === 'PENDING' ? pendingRequests : processedRequests).length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <AlertCircle size={48} className="mb-4 text-gray-300 opacity-50" />
                        <p className="text-lg font-medium text-black/45">Không có yêu cầu nào</p>
                        <p className="text-sm">Hiện tại không có yêu cầu nào trong danh sách này.</p>
                    </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
