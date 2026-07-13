import React, { useState } from 'react';
import { Card, Button, Badge, Table, Toast } from '../components/UI';
import { Check, X, Eye, Clock } from 'lucide-react';

export const ReportPendingPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const handleAction = (action: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message: action, type });
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div>
        <h1 className="text-2xl font-bold text-vna-blue">Báo cáo chờ phê duyệt</h1>
        <p className="text-black/45 text-sm mt-1">Danh sách các báo cáo ESG đang chờ Lãnh đạo xem xét và phê duyệt</p>
      </div>
      <Card className="p-0 overflow-hidden">
        <Table>
          <thead>
            <tr>
              <th>Tên báo cáo</th>
              <th>Kỳ báo cáo</th>
              <th>Người trình</th>
              <th>Ngày trình</th>
              <th>Trạng thái</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-medium">Báo cáo ESG - Môi trường</td>
              <td>Q1/2026</td>
              <td>Tổ thư ký ESG</td>
              <td>10/04/2026</td>
              <td><Badge variant="warning"><Clock size={12} className="inline mr-1"/>Chờ phê duyệt</Badge></td>
              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" title="Xem trước trên website" onClick={() => handleAction('Đang mở giao diện xem trước trên website...', 'info')}><Eye size={16} /></Button>
                  <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" title="Phê duyệt" onClick={() => handleAction('Đã phê duyệt báo cáo thành công!', 'success')}><Check size={16} /></Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" title="Từ chối" onClick={() => handleAction('Đã từ chối báo cáo!', 'error')}><X size={16} /></Button>
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </div>
  );
};
