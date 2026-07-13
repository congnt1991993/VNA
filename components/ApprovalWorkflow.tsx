import React, { useState } from 'react';
import { Button, Modal } from './UI';
import { CheckCircle2, XCircle, Send, Check, X, History } from 'lucide-react';
import { useAccess } from './AccessContext';
import { FORM_DEFINITIONS } from '../data/accessControl';

const getFormIdFromRecordId = (id: string): string => {
  if (id.startsWith('OPS-')) return 'tech-ops';
  if (id.startsWith('FLIGHT-')) return 'ops-flight';
  if (id.startsWith('DIGITAL-')) return 'ops-digital';
  if (id.startsWith('TTBSV-')) return 'ops-ttbsv';
  if (id.startsWith('ATCL-')) return 'ops-atcl';
  if (id.startsWith('HR-')) return 'ops-hr';
  if (id.startsWith('DVHK-')) return 'ops-service';
  if (id.startsWith('TT-')) return 'ops-comm';
  if (id.startsWith('KHPT-')) return 'ops-planning';
  return '';
};

export const syncSubmissionToGlobal = (record: any, formId: string) => {
  const saved = localStorage.getItem('vna_all_submissions');
  let submissions = saved ? JSON.parse(saved) : [];
  const index = submissions.findIndex((s: any) => s.id === record.id && s.formId === formId);
  const newSubmission = {
    id: record.id,
    formId,
    unit: FORM_DEFINITIONS.find(fd => fd.id === formId)?.department || 'Bộ phận',
    period: record.effectivePeriod || record.year || 'Kỳ 2026',
    status: record.status,
    lastUpdated: record.logs && record.logs.length > 0 ? record.logs[record.logs.length - 1].timestamp : new Date().toLocaleString(),
    updatedBy: record.logs && record.logs.length > 0 ? record.logs[record.logs.length - 1].recorder : '—',
    logs: record.logs || [],
    data: record
  };
  if (index >= 0) {
    submissions[index] = newSubmission;
  } else {
    submissions.push(newSubmission);
  }
  localStorage.setItem('vna_all_submissions', JSON.stringify(submissions));
};

export type ApprovalStatus = 'Active' | 'Inactive' | 'Pending' | 'Rejected';

export interface ApprovalLog {
  timestamp: string;
  action: 'Gửi duyệt' | 'Phê duyệt' | 'Từ chối';
  recorder: string;
  approver: string;
  comment: string;
}

export const ApprovalStatusBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
  const styles = {
    Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Rejected: 'bg-red-100 text-red-700 border-red-200',
    Inactive: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  const labels = {
    Active: 'Đã duyệt',
    Pending: 'Chờ duyệt',
    Rejected: 'Bị từ chối',
    Inactive: 'Bản nháp',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export const QuickApprovalActions: React.FC<{
  status: ApprovalStatus;
  recordId: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSubmit: (id: string) => void;
}> = ({ status, recordId, onApprove, onReject, onSubmit }) => {
  return (
    <div className="flex items-center gap-1 justify-center">
      {status === 'Pending' && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); onApprove(recordId); }} 
            title="Phê duyệt nhanh"
            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors border border-emerald-200 pointer-events-auto cursor-pointer"
          >
            <Check size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onReject(recordId); }} 
            title="Từ chối nhanh"
            className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors border border-red-200 pointer-events-auto cursor-pointer"
          >
            <X size={14} />
          </button>
        </>
      )}
      {(status === 'Inactive' || status === 'Rejected') && (
        <button 
          onClick={(e) => { e.stopPropagation(); onSubmit(recordId); }} 
          title="Gửi duyệt nhanh"
          className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors border border-blue-200 pointer-events-auto cursor-pointer"
        >
          <Send size={14} />
        </button>
      )}
    </div>
  );
};

export const ApprovalLogTable: React.FC<{ logs?: ApprovalLog[] }> = ({ logs = [] }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
        <History className="text-vna-blue" size={20} />
        <h3 className="text-lg font-bold text-vna-blue uppercase tracking-wide">
          Lịch sử phê duyệt
        </h3>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700">
              <th className="py-3 px-4 w-12 text-center">STT</th>
              <th className="py-3 px-4">Thời gian ghi nhận</th>
              <th className="py-3 px-4">Thao tác</th>
              <th className="py-3 px-4">Người nhập</th>
              <th className="py-3 px-4">Người duyệt</th>
              <th className="py-3 px-4">Nhận xét</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log, index) => {
              let actionBadge = '';
              if (log.action === 'Gửi duyệt') actionBadge = 'bg-blue-100 text-blue-700 border-blue-200';
              else if (log.action === 'Phê duyệt') actionBadge = 'bg-emerald-100 text-emerald-700 border-emerald-200';
              else if (log.action === 'Từ chối') actionBadge = 'bg-red-100 text-red-700 border-red-200';

              return (
                <tr key={index} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-center text-gray-400 font-medium">{index + 1}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${actionBadge}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-semibold">{log.recorder}</td>
                  <td className="py-3 px-4 text-gray-700 font-semibold">{log.approver}</td>
                  <td className="py-3 px-4 text-gray-600 italic">
                    {log.comment || '—'}
                  </td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                  Chưa có lịch sử ghi log cho lần nhập này
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export function useApprovalWorkflow<T extends { id: string; status: ApprovalStatus; logs?: ApprovalLog[] }>(
  records: T[],
  setRecords: (records: T[]) => void,
  onSave?: (updatedRecord: T) => void
) {
  const { currentUser } = useAccess();
  const initialized = React.useRef(false);
  const inferredFormId = React.useMemo(() => {
    if (records.length === 0) return '';
    return getFormIdFromRecordId(records[0].id);
  }, [records]);

  React.useEffect(() => {
    if (initialized.current || records.length === 0 || !inferredFormId) return;
    initialized.current = true;

    const saved = localStorage.getItem('vna_all_submissions');
    if (!saved) {
      const initialSubmissions = records.map(record => ({
        id: record.id,
        formId: inferredFormId,
        unit: FORM_DEFINITIONS.find(fd => fd.id === inferredFormId)?.department || 'Bộ phận',
        period: (record as any).effectivePeriod || (record as any).year || 'Kỳ 2026',
        status: record.status,
        lastUpdated: record.logs && record.logs.length > 0 ? record.logs[record.logs.length - 1].timestamp : '15/05/2026 09:30',
        updatedBy: record.logs && record.logs.length > 0 ? record.logs[record.logs.length - 1].recorder : 'Nguyễn Văn A',
        logs: record.logs || [],
        data: record
      }));
      localStorage.setItem('vna_all_submissions', JSON.stringify(initialSubmissions));
      return;
    }

    const allSubmissions = JSON.parse(saved);
    let hasChanges = false;
    const updatedRecords = records.map(record => {
      const match = allSubmissions.find((s: any) => s.id === record.id && s.formId === inferredFormId);
      if (match && (match.status !== record.status || JSON.stringify(match.logs) !== JSON.stringify(record.logs))) {
        hasChanges = true;
        return {
          ...record,
          status: match.status,
          logs: match.logs,
          ...match.data
        };
      }
      return record;
    });

    const currentSaved = localStorage.getItem('vna_all_submissions');
    const allSub = currentSaved ? JSON.parse(currentSaved) : [];
    let shouldAddMock = false;
    records.forEach(record => {
      if (!allSub.some((s: any) => s.id === record.id && s.formId === inferredFormId)) {
        allSub.push({
          id: record.id,
          formId: inferredFormId,
          unit: FORM_DEFINITIONS.find(fd => fd.id === inferredFormId)?.department || 'Bộ phận',
          period: (record as any).effectivePeriod || (record as any).year || 'Kỳ 2026',
          status: record.status,
          lastUpdated: record.logs && record.logs.length > 0 ? record.logs[record.logs.length - 1].timestamp : '15/05/2026 09:30',
          updatedBy: record.logs && record.logs.length > 0 ? record.logs[record.logs.length - 1].recorder : 'Nguyễn Văn A',
          logs: record.logs || [],
          data: record
        });
        shouldAddMock = true;
      }
    });
    if (shouldAddMock) {
      localStorage.setItem('vna_all_submissions', JSON.stringify(allSub));
    }

    if (hasChanges) {
      setRecords(updatedRecords);
    }
  }, [records, setRecords, inferredFormId]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    recordId: string;
    type: 'APPROVE' | 'REJECT';
    callback?: () => void;
  } | null>(null);

  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const openApprove = (recordId: string, callback?: () => void) => {
    setComment('');
    setError('');
    setModalState({ isOpen: true, recordId, type: 'APPROVE', callback });
  };

  const openReject = (recordId: string, callback?: () => void) => {
    setComment('');
    setError('');
    setModalState({ isOpen: true, recordId, type: 'REJECT', callback });
  };

  const submitForApproval = (recordId: string, callback?: () => void) => {
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    const now = new Date();
    const timestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const newLog: ApprovalLog = {
      timestamp,
      action: 'Gửi duyệt',
      recorder: currentUser.name,
      approver: '—',
      comment: 'Yêu cầu phê duyệt dữ liệu'
    };

    const updated = {
      ...record,
      status: 'Pending' as const,
      logs: [...(record.logs || []), newLog]
    };

    setRecords(records.map(r => r.id === recordId ? updated : r));
    if (onSave) onSave(updated);
    if (inferredFormId) syncSubmissionToGlobal(updated, inferredFormId);
    alert('Đã gửi trình lãnh đạo phê duyệt dữ liệu!');
    if (callback) callback();
  };

  const handleConfirm = () => {
    if (!modalState) return;
    if (modalState.type === 'REJECT' && !comment.trim()) {
      setError('Bắt buộc phải nhập ý kiến/lý do khi từ chối phê duyệt!');
      return;
    }

    const record = records.find(r => r.id === modalState.recordId);
    if (!record) return;

    const newStatus = modalState.type === 'APPROVE' ? 'Active' : 'Rejected';
    const actionText = (modalState.type === 'APPROVE' ? 'Phê duyệt' : 'Từ chối') as 'Gửi duyệt' | 'Phê duyệt' | 'Từ chối';

    const now = new Date();
    const timestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const lastSubmitter = (record.logs || []).slice().reverse().find(l => l.action === 'Gửi duyệt')?.recorder || '—';

    const newLog: ApprovalLog = {
      timestamp,
      action: actionText,
      recorder: lastSubmitter,
      approver: currentUser.name,
      comment: comment.trim() || (modalState.type === 'APPROVE' ? 'Đã phê duyệt dữ liệu' : 'Từ chối phê duyệt')
    };

    const updated = {
      ...record,
      status: newStatus as ApprovalStatus,
      logs: [...(record.logs || []), newLog]
    };

    setRecords(records.map(r => r.id === modalState.recordId ? updated : r));
    if (onSave) onSave(updated);
    if (inferredFormId) syncSubmissionToGlobal(updated, inferredFormId);

    if (newStatus === 'Active') {
      alert(comment ? `Đã phê duyệt dữ liệu với ý kiến: "${comment}"` : 'Đã phê duyệt dữ liệu thành công!');
    } else {
      alert(`Đã từ chối phê duyệt với lý do: "${comment}"`);
    }

    if (modalState.callback) modalState.callback();
    setModalState(null);
  };

  const ApprovalModalComponent = () => {
    if (!modalState) return null;
    const isApprove = modalState.type === 'APPROVE';
    return (
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(null)}
        title={isApprove ? 'Xác nhận Phê duyệt' : 'Xác nhận Từ chối Phê duyệt'}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setModalState(null)}>Hủy</Button>
            <Button 
              variant={isApprove ? 'primary' : 'danger'}
              onClick={handleConfirm}
              className={isApprove ? 'bg-emerald-600 hover:bg-emerald-700 border-none text-white' : ''}
            >
              Xác nhận
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {isApprove 
              ? 'Nhập ý kiến phê duyệt gửi tới chuyên viên nhập liệu (tùy chọn):' 
              : 'Vui lòng nhập lý do từ chối phê duyệt (bắt buộc):'}
          </p>
          <div>
            <textarea
              className={`w-full border rounded-lg p-3 text-sm focus:ring-2 outline-none ${error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-vna-blue/20'}`}
              rows={4}
              placeholder={isApprove ? 'Nhập ý kiến...' : 'Nhập lý do từ chối...'}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
            />
            {error && <p className="text-xs text-red-500 mt-1 font-semibold">{error}</p>}
          </div>
        </div>
      </Modal>
    );
  };

  return {
    openApprove,
    openReject,
    submitForApproval,
    ApprovalModalComponent
  };
}
