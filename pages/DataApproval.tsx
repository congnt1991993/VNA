import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge, Table, Modal, Toast } from '../components/UI';
import { CheckCircle2, XCircle, Eye, History, FileText, Search, ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { useAccess } from '../components/AccessContext';
import { FORM_DEFINITIONS } from '../data/accessControl';

interface SubmissionData {
  id: string;
  formId: string;
  unit: string;
  period: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Rejected' | 'Locked';
  lastUpdated: string;
  updatedBy: string;
  logs: any[];
  data: any;
}

export const DataApprovalPage: React.FC = () => {
  const { currentUser, isAdmin } = useAccess();
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modal states
  const [selectedSub, setSelectedSub] = useState<SubmissionData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approveComment, setApproveComment] = useState('');
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Load submissions from localStorage
  const loadSubmissions = () => {
    const saved = localStorage.getItem('vna_all_submissions');
    if (saved) {
      setSubmissions(JSON.parse(saved));
    } else {
      setSubmissions([]);
    }
  };

  useEffect(() => {
    loadSubmissions();
    const handleStorageChange = () => loadSubmissions();
    window.addEventListener('storage', handleStorageChange);
    // Also listen to local custom events if needed
    window.addEventListener('vna_submissions_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('vna_submissions_updated', handleStorageChange);
    };
  }, []);

  // Filter submissions by department (RLS)
  // Admin or ESG Leadership can see everything.
  // Department Leaders can only see reports corresponding to their own department.
  const isEsgLeader = currentUser.department === 'Ban Chỉ đạo ESG' || currentUser.department === 'Ban Kế hoạch & Phát triển' || isAdmin;
  
  const filteredSubmissions = submissions.filter(sub => {
    const belongsToUserDept = sub.unit === currentUser.department;
    const matchesRLS = isEsgLeader || belongsToUserDept;
    const matchesSearch = sub.unit.toLowerCase().includes(searchTerm.toLowerCase()) || sub.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || sub.status === statusFilter;
    return matchesRLS && matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success">Đã duyệt</Badge>;
      case 'Pending':
        return <Badge variant="warning">Chờ duyệt</Badge>;
      case 'Rejected':
        return <Badge variant="danger">Bị từ chối</Badge>;
      case 'Locked':
        return <Badge variant="primary">Đã khóa chốt số</Badge>;
      case 'Inactive':
        return <Badge variant="secondary">Bản nháp</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleApprove = (sub: SubmissionData) => {
    setSelectedSub(sub);
    setApproveComment('');
    setIsApproveOpen(true);
  };

  const confirmApprove = () => {
    if (!selectedSub) return;
    const now = new Date();
    const timestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newLog = {
      timestamp,
      action: 'Phê duyệt',
      recorder: selectedSub.logs.slice().reverse().find(l => l.action === 'Gửi duyệt')?.recorder || '—',
      approver: currentUser.name,
      comment: approveComment.trim() || 'Đã phê duyệt dữ liệu báo cáo đơn vị.'
    };

    const updatedSubmissions = submissions.map(s => {
      if (s.id === selectedSub.id && s.formId === selectedSub.formId) {
        return {
          ...s,
          status: 'Active' as const,
          lastUpdated: timestamp,
          updatedBy: currentUser.name,
          logs: [...s.logs, newLog],
          data: { ...s.data, status: 'Active', logs: [...(s.data?.logs || []), newLog] }
        };
      }
      return s;
    });

    localStorage.setItem('vna_all_submissions', JSON.stringify(updatedSubmissions));
    window.dispatchEvent(new Event('vna_submissions_updated'));
    setSubmissions(updatedSubmissions);
    setIsApproveOpen(false);
    setIsDetailOpen(false);
    setToast({ message: `Đã phê duyệt báo cáo ${selectedSub.id} thành công!`, type: 'success' });
  };

  const handleReject = (sub: SubmissionData) => {
    setSelectedSub(sub);
    setRejectReason('');
    setRejectError('');
    setIsRejectOpen(true);
  };

  const confirmReject = () => {
    if (!selectedSub) return;
    if (!rejectReason.trim()) {
      setRejectError('Bắt buộc nhập lý do từ chối phê duyệt!');
      return;
    }

    const now = new Date();
    const timestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newLog = {
      timestamp,
      action: 'Từ chối',
      recorder: selectedSub.logs.slice().reverse().find(l => l.action === 'Gửi duyệt')?.recorder || '—',
      approver: currentUser.name,
      comment: rejectReason.trim()
    };

    const updatedSubmissions = submissions.map(s => {
      if (s.id === selectedSub.id && s.formId === selectedSub.formId) {
        return {
          ...s,
          status: 'Rejected' as const,
          lastUpdated: timestamp,
          updatedBy: currentUser.name,
          logs: [...s.logs, newLog],
          data: { ...s.data, status: 'Rejected', logs: [...(s.data?.logs || []), newLog] }
        };
      }
      return s;
    });

    localStorage.setItem('vna_all_submissions', JSON.stringify(updatedSubmissions));
    window.dispatchEvent(new Event('vna_submissions_updated'));
    setSubmissions(updatedSubmissions);
    setIsRejectOpen(false);
    setIsDetailOpen(false);
    setToast({ message: `Đã từ chối báo cáo ${selectedSub.id} và gửi trả lại đơn vị!`, type: 'error' });
  };

  const handleLock = (sub: SubmissionData) => {
    if (!confirm(`Bạn có chắc chắn muốn KHÓA chốt số liệu báo cáo đợt ${sub.id}? Sau khi khóa, đơn vị sẽ không thể sửa đổi hoặc gửi yêu cầu mở khóa trừ phi được Admin cho phép.`)) return;

    const now = new Date();
    const timestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newLog = {
      timestamp,
      action: 'Khóa dữ liệu',
      recorder: sub.updatedBy,
      approver: currentUser.name,
      comment: 'Khóa chốt số liệu báo cáo cấp Tổng công ty.'
    };

    const updatedSubmissions = submissions.map(s => {
      if (s.id === sub.id && s.formId === sub.formId) {
        return {
          ...s,
          status: 'Locked' as const,
          lastUpdated: timestamp,
          updatedBy: currentUser.name,
          logs: [...s.logs, newLog],
          data: { ...s.data, status: 'Locked', logs: [...(s.data?.logs || []), newLog] }
        };
      }
      return s;
    });

    localStorage.setItem('vna_all_submissions', JSON.stringify(updatedSubmissions));
    window.dispatchEvent(new Event('vna_submissions_updated'));
    setSubmissions(updatedSubmissions);
    setToast({ message: `Đã khóa chốt số liệu đợt ${sub.id} thành công!`, type: 'success' });
  };

  const openDetails = (sub: SubmissionData) => {
    setSelectedSub(sub);
    setIsDetailOpen(true);
  };

  const renderDetailsContent = (sub: SubmissionData) => {
    const d = sub.data || {};
    switch (sub.formId) {
      case 'tech-ops':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-vna-blue border-b border-gray-100 pb-1 text-sm uppercase">1. Thông tin chung & Hạn ngạch</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Tỷ lệ SAF kế hoạch:</span> <span className="font-semibold">{d.safPlannedRatio ?? 0}%</span></div>
              <div><span className="text-gray-500">Hạn ngạch EU/UK ETS:</span> <span className="font-semibold">{(d.quotaEts ?? 0).toLocaleString()} Tấn</span></div>
              <div><span className="text-gray-500">Baseline CORSIA:</span> <span className="font-semibold">{(d.baselineCorsia ?? 0).toLocaleString()} Tấn</span></div>
              <div><span className="text-gray-500">Đơn giá EUA/UKA:</span> <span className="font-semibold">${d.priceEua ?? 0}/Tấn</span></div>
            </div>
            <h4 className="font-bold text-vna-blue border-b border-gray-100 pb-1 text-sm uppercase mt-4">2. Tổng hợp SAF nạp thực tế</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Lượng SAF nạp thực tế:</span> <span className="font-semibold">{(d.actualSaf ?? 0).toLocaleString()} Tấn</span></div>
              <div><span className="text-gray-500">Lượng Neat SAF:</span> <span className="font-semibold">{(d.neatSaf ?? 0).toLocaleString()} Tấn</span></div>
              <div><span className="text-gray-500">Phụ phí mua SAF:</span> <span className="font-semibold">${(d.surchargeSaf ?? 0).toLocaleString()}</span></div>
            </div>
            {d.importedRows && d.importedRows.length > 0 && (
              <>
                <h4 className="font-bold text-vna-blue border-b border-gray-100 pb-1 text-sm uppercase mt-4">3. Danh sách lô hàng SAF ({d.importedRows.length} lô)</h4>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-2">Sân bay ICAO</th>
                        <th className="p-2">Nhà CC</th>
                        <th className="p-2">Mã lô</th>
                        <th className="p-2 text-right">Lượng mua (Tấn)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {d.importedRows.map((r: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-2 font-medium">{r.airportIcao}</td>
                          <td className="p-2">{r.supplier}</td>
                          <td className="p-2">{r.batchNumber}</td>
                          <td className="p-2 text-right font-semibold">{r.amountPurchased}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        );
      case 'ops-flight':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-vna-blue border-b border-gray-100 pb-1 text-sm uppercase">Thông số khai thác bay</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Nhiên liệu tiêu thụ Jet A-1:</span> <span className="font-semibold">{(d.fuelConsumed ?? 0).toLocaleString()} Tấn</span></div>
              <div><span className="text-gray-500">Phát thải GHG (Scope 1):</span> <span className="font-semibold">{(d.ghgEmissions ?? 0).toLocaleString()} Tấn CO2e</span></div>
              <div><span className="text-gray-500">Sản lượng thương mại RTK:</span> <span className="font-semibold">{(d.rtk ?? 0).toLocaleString()} triệu tấn-km</span></div>
              <div><span className="text-gray-500">Mức độ tiếng ồn trung bình:</span> <span className="font-semibold">{d.noiseLevel ?? '—'} dB</span></div>
            </div>
          </div>
        );
      case 'ops-ttbsv':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-vna-blue border-b border-gray-100 pb-1 text-sm uppercase">Dữ liệu Chương trình Bông Sen Vàng</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Chỉ số NPS thực hiện:</span> <span className="font-semibold">{d.npsActual ?? 0}</span></div>
              <div><span className="text-gray-500">Chỉ số NPS mục tiêu:</span> <span className="font-semibold">{d.npsTarget ?? 0}</span></div>
              <div><span className="text-gray-500">Số lượng hội viên Active:</span> <span className="font-semibold">{(d.activeMembers ?? 0).toLocaleString()} hội viên</span></div>
              <div><span className="text-gray-500">Số lượng khảo sát KH:</span> <span className="font-semibold">{(d.surveyCount ?? 0).toLocaleString()} lượt</span></div>
            </div>
          </div>
        );
      case 'ops-digital':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-vna-blue border-b border-gray-100 pb-1 text-sm uppercase">An toàn thông tin & CĐS</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Vụ vi phạm quyền riêng tư:</span> <span className="font-semibold text-red-600">{d.privacyBreaches ?? 0} vụ</span></div>
              <div><span className="text-gray-500">Sự cố rò rỉ/mất dữ liệu:</span> <span className="font-semibold text-red-600">{d.dataLosses ?? 0} vụ</span></div>
              <div className="col-span-2">
                <span className="text-gray-500 block mb-1">Cấu hình thông điệp cảnh báo:</span>
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-800 font-medium">
                  {d.alertMessage || '—'}
                </div>
              </div>
            </div>
          </div>
        );
      case 'ops-hr':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-vna-blue border-b border-gray-100 pb-1 text-sm uppercase">Dữ liệu nguồn nhân lực</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Tổng số lao động:</span> <span className="font-semibold">{(d.totalStaff ?? 0).toLocaleString()} người</span></div>
              <div><span className="text-gray-500">Tỷ lệ nghỉ việc:</span> <span className="font-semibold">{d.turnoverRate ?? 0}%</span></div>
              <div><span className="text-gray-500">Số vụ tai nạn lao động:</span> <span className="font-semibold text-red-600">{d.safetyIncidents ?? 0} vụ</span></div>
              <div><span className="text-gray-500">Số giờ đào tạo bình quân:</span> <span className="font-semibold">{d.trainingHours ?? 0} giờ/người</span></div>
            </div>
          </div>
        );
      default:
        // Generic fallback for any other forms
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-vna-blue border-b border-gray-100 pb-1 text-sm uppercase">Chi tiết số liệu đã nhập</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.keys(d).filter(k => k !== 'logs' && k !== 'importedRows' && typeof d[k] !== 'object').map((k, idx) => (
                <div key={idx}>
                  <span className="text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                  <span className="font-semibold">{String(d[k])}</span>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  // Get all logs of all submissions for the Audit Log view
  const auditLogs = submissions
    .flatMap(sub => (sub.logs || []).map(log => ({ ...log, subId: sub.id, subUnit: sub.unit })))
    .sort((a, b) => new Date(b.timestamp.replace(/(\d+)\/(\d+)\/(\d+)/, '$2/$1/$3')).getTime() - new Date(a.timestamp.replace(/(\d+)\/(\d+)\/(\d+)/, '$2/$1/$3')).getTime());

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue">Phê duyệt số liệu đơn vị</h1>
          <p className="text-black/45 text-sm mt-1">
            {isEsgLeader 
              ? 'Hệ thống Quản lý và Phê duyệt báo cáo số liệu ESG từ các Ban chuyên môn' 
              : `Xem xét và Phê duyệt số liệu báo cáo chuyên môn của ${currentUser.department}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAuditLog(!showAuditLog)} className="flex items-center gap-1.5">
            <History size={16} /> {showAuditLog ? 'Xem danh sách duyệt' : 'Lịch sử phê duyệt'}
          </Button>
        </div>
      </div>

      {showAuditLog ? (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">
            Nhật ký phê duyệt toàn hệ thống
          </div>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <th className="w-40">Thời gian</th>
                  <th>Đợt / Đơn vị</th>
                  <th>Hành động</th>
                  <th>Người thực hiện</th>
                  <th>Lý do / Ý kiến nhận xét</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, index) => {
                  let actionBadge = 'bg-blue-100 text-blue-700 border-blue-200';
                  if (log.action === 'Phê duyệt' || log.action === 'Khóa dữ liệu') actionBadge = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                  else if (log.action === 'Từ chối') actionBadge = 'bg-red-100 text-red-700 border-red-200';

                  return (
                    <tr key={index} className="hover:bg-gray-50/50">
                      <td className="text-xs text-gray-500 font-mono">{log.timestamp}</td>
                      <td>
                        <span className="font-semibold text-vna-blue">{log.subId}</span>
                        <span className="block text-xs text-gray-400">{log.subUnit}</span>
                      </td>
                      <td>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${actionBadge}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="font-medium text-sm text-gray-700">{log.approver || log.recorder}</td>
                      <td className="text-gray-600 text-sm italic">{log.comment || '—'}</td>
                    </tr>
                  );
                })}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                      Chưa có lịch sử phê duyệt nào được thực hiện.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Tìm kiếm đợt báo cáo, tên ban nghiệp vụ..." 
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-56">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full">
                <option value="">Tất cả trạng thái</option>
                <option value="Pending">Chờ duyệt (Pending)</option>
                <option value="Active">Đã duyệt (Active)</option>
                <option value="Rejected">Bị từ chối (Rejected)</option>
                <option value="Locked">Đã khóa chốt (Locked)</option>
                <option value="Inactive">Bản nháp (Draft)</option>
              </Select>
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            <Table>
              <thead>
                <tr>
                  <th>Mã đợt</th>
                  <th>Đơn vị báo cáo</th>
                  <th>Kỳ báo cáo</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật cuối</th>
                  <th>Người gửi/cập nhật</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="font-bold text-vna-blue">{sub.id}</td>
                    <td>
                      <span className="font-semibold text-gray-800">{sub.unit}</span>
                      <span className="block text-[10px] text-gray-400 uppercase font-bold mt-0.5">Mã Form: {sub.formId}</span>
                    </td>
                    <td>{sub.period}</td>
                    <td>{getStatusBadge(sub.status)}</td>
                    <td className="text-xs text-gray-500 font-mono">{sub.lastUpdated}</td>
                    <td className="font-medium text-gray-700">{sub.updatedBy}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDetails(sub)} title="Xem chi tiết số liệu" className="h-8 py-1">
                          <Eye size={15} className="mr-1" /> Chi tiết
                        </Button>
                        
                        {sub.status === 'Pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleApprove(sub)}
                              title="Phê duyệt"
                              className="h-8 py-1 text-green-700 border-green-200 hover:bg-green-50"
                            >
                              Duyệt
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleReject(sub)}
                              title="Từ chối"
                              className="h-8 py-1 text-red-700 border-red-200 hover:bg-red-50"
                            >
                              Từ chối
                            </Button>
                          </>
                        )}

                        {sub.status === 'Active' && isEsgLeader && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleLock(sub)}
                            title="Khóa chốt dữ liệu"
                            className="h-8 py-1 text-blue-700 border-blue-200 hover:bg-blue-50"
                          >
                            Khóa chốt
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <ShieldCheck size={36} className="text-gray-300" />
                        <p className="font-medium text-sm">Không có dữ liệu báo cáo nào cần phê duyệt hoặc phù hợp với bộ lọc.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>
        </>
      )}

      {/* DETAIL MODAL */}
      {isDetailOpen && selectedSub && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Chi tiết báo cáo: ${selectedSub.id} · ${selectedSub.unit}`}
          size="lg"
          footer={
            <div className="flex justify-between items-center w-full">
              <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>Đóng</Button>
              {selectedSub.status === 'Pending' && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleReject(selectedSub)}
                    className="text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <XCircle size={16} className="mr-1.5" /> Từ chối
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => handleApprove(selectedSub)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                  >
                    <CheckCircle2 size={16} className="mr-1.5" /> Phê duyệt số liệu
                  </Button>
                </div>
              )}
            </div>
          }
        >
          <div className="space-y-6">
            {renderDetailsContent(selectedSub)}

            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-1.5"><History size={16} /> Lịch sử luồng phê duyệt</h4>
              <div className="space-y-3">
                {selectedSub.logs.map((l: any, idx: number) => {
                  let actBadge = 'bg-blue-100 text-blue-700 border-blue-200';
                  if (l.action === 'Phê duyệt' || l.action === 'Khóa dữ liệu') actBadge = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                  else if (l.action === 'Từ chối') actBadge = 'bg-red-100 text-red-700 border-red-200';
                  return (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex gap-4 text-xs">
                      <div className="text-gray-400 font-mono w-28 shrink-0">{l.timestamp}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-bold border ${actBadge}`}>{l.action}</span>
                          <span className="font-semibold text-gray-800">{l.approver || l.recorder}</span>
                        </div>
                        {l.comment && <p className="text-gray-600 italic mt-1.5">"{l.comment}"</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* APPROVE MODAL */}
      {isApproveOpen && selectedSub && (
        <Modal
          isOpen={isApproveOpen}
          onClose={() => setIsApproveOpen(false)}
          title="Xác nhận Phê duyệt số liệu"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="ghost" onClick={() => setIsApproveOpen(false)}>Hủy</Button>
              <Button variant="primary" onClick={confirmApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">Xác nhận Phê duyệt</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex gap-3 text-sm border border-emerald-100">
              <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold">Bạn chuẩn bị phê duyệt số liệu báo cáo của {selectedSub.unit}</p>
                <p className="text-xs text-emerald-700 mt-0.5">Số liệu được phê duyệt sẽ được ghi nhận chính thức và chuyển lên Dashboard Tổng hợp của Tổng công ty.</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ý kiến phê duyệt (Không bắt buộc)</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-vna-blue/20 outline-none" 
                rows={3}
                placeholder="Nhập ý kiến hoặc lời nhắn gửi tới đơn vị..."
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* REJECT MODAL */}
      {isRejectOpen && selectedSub && (
        <Modal
          isOpen={isRejectOpen}
          onClose={() => setIsRejectOpen(false)}
          title="Từ chối phê duyệt số liệu"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="ghost" onClick={() => setIsRejectOpen(false)}>Hủy</Button>
              <Button variant="danger" onClick={confirmReject}>Từ chối & Yêu cầu chỉnh sửa</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-red-50 text-red-800 p-4 rounded-lg flex gap-3 text-sm border border-red-100">
              <AlertCircle size={20} className="shrink-0 text-red-600" />
              <div>
                <p className="font-bold">Từ chối phê duyệt đợt báo cáo {selectedSub.id}</p>
                <p className="text-xs text-red-700 mt-0.5">Báo cáo sẽ được gửi trả về cho đầu mối nhập liệu sửa đổi. Trạng thái sẽ cập nhật thành "Bị từ chối".</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-red-800 font-bold mb-1">Lý do từ chối phê duyệt (Bắt buộc)</label>
              <textarea 
                className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 outline-none ${rejectError ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-vna-blue/20'}`}
                rows={4}
                placeholder="Vui lòng nhập lý do từ chối cụ thể, chỉ ra phần số liệu cần điều chỉnh..."
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (e.target.value.trim()) setRejectError('');
                }}
              />
              {rejectError && <p className="text-xs text-red-500 mt-1 font-bold">{rejectError}</p>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
