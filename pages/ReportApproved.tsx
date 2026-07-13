import React, { useState } from 'react';
import { Card, Button, Badge, Table, Toast } from '../components/UI';
import { Eye, CheckCircle2, Download } from 'lucide-react';

export const ReportApprovedPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const handleAction = (action: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message: action, type });
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div>
        <h1 className="text-2xl font-bold text-vna-blue">Báo cáo đã phê duyệt</h1>
        <p className="text-black/45 text-sm mt-1">Danh sách các báo cáo ESG đã được Lãnh đạo phê duyệt chính thức</p>
      </div>
      <Card className="p-0 overflow-hidden">
        <Table>
          <thead>
            <tr>
              <th>Tên báo cáo</th>
              <th>Kỳ báo cáo</th>
              <th>Người phê duyệt</th>
              <th>Ngày phê duyệt</th>
              <th>Trạng thái</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-medium">Báo cáo ESG Tổng hợp 2025</td>
              <td>Năm 2025</td>
              <td>Ban Giám đốc</td>
              <td>15/03/2026</td>
              <td><Badge variant="success"><CheckCircle2 size={12} className="inline mr-1"/>Đã phê duyệt</Badge></td>
              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" title="Xem trước trên website" onClick={() => handleAction('Đang mở giao diện xem trước trên website...', 'info')}><Eye size={16} /></Button>
                  <Button variant="ghost" size="sm" title="Tải xuống" onClick={() => handleAction('Đang tải xuống báo cáo...', 'success')}><Download size={16} /></Button>
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </div>
  );
};
