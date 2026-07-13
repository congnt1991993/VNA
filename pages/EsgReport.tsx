import React, { useState } from 'react';
import { Card, Button, Badge, Table, Input, Modal, Toast } from '../components/UI';
import { FileText, Upload, Clock, CheckCircle, Send, Plus, ChevronLeft, Building2, UploadCloud, Download } from 'lucide-react';

const DEPARTMENTS = [
  'Khối Kỹ thuật', 'Khối Khai thác', 'Khối Dịch vụ', 'Ban ATCL', 'Đoàn bay', 'Đoàn tiếp viên', 'Ban Nhân sự', 'Trung tâm BSV'
];

export const EsgReportPage: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  // MOCK DATA
  const [campaigns, setCampaigns] = useState([
    {
      id: 'REQ-2026',
      year: '2026',
      title: 'Yêu cầu nộp số liệu Báo cáo Thường niên PTBV 2026',
      content: 'Đề nghị các cơ quan, đơn vị khẩn trương tổng hợp và nộp báo cáo số liệu ESG năm 2026 phục vụ công tác lập Báo cáo Phát triển Bền vững của TCT.',
      status: 'IN_PROGRESS',
      progress: 6,
      total: 8,
      createdAt: '15/01/2026',
      departments: DEPARTMENTS.map((d, i) => {
        const emailMap: Record<string, string> = {
          'Khối Kỹ thuật': 'tech.ops@vietnamairlines.com',
          'Khối Khai thác': 'ops.flight@vietnamairlines.com',
          'Khối Dịch vụ': 'ops.service@vietnamairlines.com',
          'Ban ATCL': 'safety@vietnamairlines.com',
          'Đoàn bay': 'flight.crew@vietnamairlines.com',
          'Đoàn tiếp viên': 'cabin.crew@vietnamairlines.com',
          'Ban Nhân sự': 'hr.dept@vietnamairlines.com',
          'Trung tâm BSV': 'lotusmile@vietnamairlines.com'
        };
        return {
          name: d,
          status: i < 6 ? 'SUBMITTED' : 'PENDING',
          submittedAt: i < 6 ? '20/01/2026 14:35' : null,
          submittedUser: i < 6 ? (emailMap[d] || 'staff@vietnamairlines.com') : null,
          file: i < 6 ? `BC_SoLieu_${d.replace(/ /g, '')}_2026.pdf` : null
        };
      })
    },
    {
      id: 'REQ-2025',
      year: '2025',
      title: 'Thu thập số liệu Báo cáo ESG 2025',
      content: 'Yêu cầu nộp số liệu năm 2025',
      status: 'COMPLETED',
      progress: 8,
      total: 8,
      createdAt: '10/01/2025',
      departments: DEPARTMENTS.map(d => {
        const emailMap: Record<string, string> = {
          'Khối Kỹ thuật': 'tech.ops@vietnamairlines.com',
          'Khối Khai thác': 'ops.flight@vietnamairlines.com',
          'Khối Dịch vụ': 'ops.service@vietnamairlines.com',
          'Ban ATCL': 'safety@vietnamairlines.com',
          'Đoàn bay': 'flight.crew@vietnamairlines.com',
          'Đoàn tiếp viên': 'cabin.crew@vietnamairlines.com',
          'Ban Nhân sự': 'hr.dept@vietnamairlines.com',
          'Trung tâm BSV': 'lotusmile@vietnamairlines.com'
        };
        return {
          name: d,
          status: 'SUBMITTED',
          submittedAt: '25/01/2025 09:15',
          submittedUser: emailMap[d] || 'staff@vietnamairlines.com',
          file: `BC_SoLieu_${d.replace(/ /g, '')}_2025.pdf`
        };
      })
    }
  ]);

  const handleCreateRequest = () => {
    setToast({ message: 'Đã tạo và gửi Yêu cầu thành công đến tất cả các Tổ/Ban!', type: 'success' });
    setIsCreateModalOpen(false);
  };

  const handleFinishAndPublish = () => {
    setToast({ message: 'Đã hoàn thành Đợt thu thập! File Báo cáo cuối cùng đã được lưu và tự động đẩy sang Kho lưu trữ CMS Website ESG.', type: 'success' });
    setIsFinishModalOpen(false);
    
    // Cập nhật trạng thái
    if (selectedCampaign) {
      const updated = campaigns.map(c => c.id === selectedCampaign.id ? { ...c, status: 'COMPLETED' } : c);
      setCampaigns(updated);
      setSelectedCampaign({ ...selectedCampaign, status: 'COMPLETED' });
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* MÀN HÌNH DANH SÁCH YÊU CẦU */}
      {view === 'LIST' && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-vna-blue">Quản lý Đợt thu thập Báo cáo ESG</h1>
              <p className="text-black/45 text-sm mt-1">Ban Truyền thông & KHPT yêu cầu và đôn đốc các Khối/Ban nộp báo cáo thường niên</p>
            </div>
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} className="mr-2" />
              Tạo Yêu cầu mới
            </Button>
          </div>

          <Card className="p-0">
            <Table>
              <thead>
                <tr>
                  <th className="px-4 py-3">Tên Yêu cầu / Đợt thu thập</th>
                  <th className="px-4 py-3 text-center">Năm BC</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3">Tiến độ nộp</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map(camp => (
                  <tr key={camp.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedCampaign(camp); setView('DETAIL'); }}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${camp.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-vna-blue'}`}>
                          <FileText size={20} />
                        </div>
                        <div className="font-medium text-gray-900">{camp.title}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-gray-600">{camp.year}</td>
                    <td className="px-4 py-4 text-gray-600">{camp.createdAt}</td>
                    <td className="px-4 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1 max-w-[150px]">
                        <div className={`h-2 rounded-full ${camp.progress === camp.total ? 'bg-green-500' : 'bg-vna-blue'}`} style={{ width: `${(camp.progress / camp.total) * 100}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500">{camp.progress} / {camp.total} Ban đã nộp</span>
                    </td>
                    <td className="px-4 py-4">
                      {camp.status === 'COMPLETED' ? (
                        <Badge variant="success"><CheckCircle size={12} className="mr-1 inline" /> Đã kết thúc</Badge>
                      ) : (
                        <Badge variant="warning"><Clock size={12} className="mr-1 inline" /> Đang thu thập</Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-vna-blue">Chi tiết</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </>
      )}

      {/* MÀN HÌNH CHI TIẾT YÊU CẦU */}
      {view === 'DETAIL' && selectedCampaign && (
        <>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setView('LIST')} className="p-2 border border-gray-200">
              <ChevronLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-vna-blue">{selectedCampaign.title}</h1>
              <p className="text-black/45 text-sm mt-1">Chi tiết đôn đốc nộp báo cáo năm {selectedCampaign.year}</p>
            </div>
            <div className="ml-auto">
              {selectedCampaign.status === 'IN_PROGRESS' && (
                <Button variant="primary" onClick={() => setIsFinishModalOpen(true)}>
                  <CheckCircle size={16} className="mr-2" />
                  Kết thúc đợt & Upload Báo cáo cuối
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1 space-y-4">
              <h3 className="font-semibold border-b pb-2">Thông tin Yêu cầu</h3>
              <div>
                <p className="text-xs text-gray-500 mb-1">Nội dung đôn đốc:</p>
                <p className="text-sm font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedCampaign.content}</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-gray-500">Tiến độ tổng:</span>
                <span className="font-bold text-vna-blue">{selectedCampaign.progress} / {selectedCampaign.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-vna-blue h-3 rounded-full" style={{ width: `${(selectedCampaign.progress / selectedCampaign.total) * 100}%` }}></div>
              </div>
            </Card>

            <Card className="lg:col-span-3 p-0 overflow-hidden">
              <div className="p-4 border-b bg-gray-50 font-semibold">Trạng thái nộp của các Tổ/Ban</div>
              <Table>
                <thead>
                  <tr>
                    <th className="px-4 py-3">Tổ / Ban / Khối</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Tài khoản nộp</th>
                    <th className="px-4 py-3">Thời gian nộp</th>
                    <th className="px-4 py-3 text-center">Tệp đính kèm</th>
                    <th className="px-4 py-3 text-center w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedCampaign.departments.map((dept: any, idx: number) => {
                    const handleDownload = (fileName: string, e: React.MouseEvent) => {
                      e.preventDefault();
                      setToast({ message: `Đang tải xuống tệp tin: ${fileName}...`, type: 'success' });
                    };

                    const handleUploadPlaceholder = (deptName: string) => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.pdf,.doc,.docx,.xls,.xlsx';
                      input.onchange = (event: any) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          // Update mock details
                          const updatedCampaigns = campaigns.map(c => {
                            if (c.id === selectedCampaign.id) {
                              const updatedDepts = c.departments.map(d => {
                                if (d.name === deptName) {
                                  // format time as ddMMyyyy hh:mm
                                  const now = new Date();
                                  const pad = (n: number) => String(n).padStart(2, '0');
                                  const formattedDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
                                  return {
                                    ...d,
                                    status: 'SUBMITTED',
                                    submittedAt: formattedDate,
                                    submittedUser: 'current.user@vietnamairlines.com',
                                    file: file.name
                                  };
                                }
                                return d;
                              });
                              return {
                                ...c,
                                progress: updatedDepts.filter(d => d.status === 'SUBMITTED').length,
                                departments: updatedDepts
                              };
                            }
                            return c;
                          });
                          setCampaigns(updatedCampaigns);
                          const currentCamp = updatedCampaigns.find(c => c.id === selectedCampaign.id);
                          if (currentCamp) setSelectedCampaign(currentCamp);
                          setToast({ message: `Đã upload tệp tin "${file.name}" cho đơn vị "${deptName}" thành công!`, type: 'success' });
                        }
                      };
                      input.click();
                    };

                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-400" />
                            {dept.name}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {dept.status === 'SUBMITTED' ? (
                            <Badge variant="success">Đã gửi báo cáo</Badge>
                          ) : (
                            <Badge variant="danger">Chưa gửi</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-750 font-semibold">{dept.submittedUser || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-semibold font-mono">{dept.submittedAt || '-'}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          {dept.file ? (
                            <a 
                              href="#" 
                              onClick={(e) => handleDownload(dept.file, e)}
                              className="text-vna-blue hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              <FileText size={14} /> {dept.file}
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">Chưa có tệp</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center items-center gap-1">
                            <button 
                              onClick={() => handleUploadPlaceholder(dept.name)}
                              className="p-1.5 rounded text-vna-blue hover:bg-vna-blue hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center border border-vna-blue/20"
                              title="Upload tệp báo cáo"
                            >
                              <Upload size={14} />
                            </button>
                            {dept.file && (
                              <button 
                                onClick={(e) => handleDownload(dept.file, e)}
                                className="p-1.5 rounded text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center border border-emerald-200"
                                title="Tải xuống tệp tin"
                              >
                                <Download size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card>
          </div>
        </>
      )}

      {/* MODAL TẠO YÊU CẦU */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        title="Tạo Yêu cầu nộp Báo cáo ESG"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreateRequest}><Send size={16} className="mr-2" /> Gửi Yêu cầu</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Năm báo cáo" type="number" defaultValue="2026" />
          <Input label="Tiêu đề yêu cầu" defaultValue="Yêu cầu nộp số liệu Báo cáo Thường niên PTBV 2026" />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung chi tiết</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue" rows={4} defaultValue="Đề nghị các cơ quan, đơn vị khẩn trương tổng hợp và nộp báo cáo số liệu ESG năm 2026 phục vụ công tác lập Báo cáo Phát triển Bền vững của TCT."></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đơn vị nhận yêu cầu (Mặc định chọn tất cả)</label>
            <div className="p-3 border rounded-md bg-gray-50 max-h-40 overflow-y-auto space-y-2">
              {DEPARTMENTS.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="text-vna-blue focus:ring-vna-blue rounded" />
                  <span className="text-sm">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL HOÀN THÀNH & UPLOAD CMS */}
      <Modal 
        isOpen={isFinishModalOpen} 
        onClose={() => setIsFinishModalOpen(false)} 
        title="Kết thúc đợt & Xuất bản"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFinishModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleFinishAndPublish}><UploadCloud size={16} className="mr-2" /> Xuất bản sang CMS</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 text-vna-blue rounded-md text-sm mb-4 flex items-start gap-2">
            <CheckCircle size={18} className="mt-0.5 shrink-0" />
            <p>Thao tác này sẽ khóa Đợt thu thập (các Ban không thể nộp thêm). Bạn hãy tải lên File Báo cáo ESG hoàn chỉnh cuối cùng để hệ thống tự động đẩy sang Kho lưu trữ CMS Website.</p>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
            <UploadCloud size={40} className="text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700">Kéo thả file Báo cáo Thường niên (PDF) vào đây</p>
            <p className="text-xs text-gray-500 mt-1">hoặc click để chọn file từ máy tính</p>
            <Button variant="outline" size="sm" className="mt-4">Chọn File</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
