import React, { useState } from 'react';
import { Card, Button, Select, Input, Toast, Modal } from '../components/UI';
import { Settings as SettingsIcon, Bell, Clock, Lock, Globe, Database, RefreshCw, Save, Trash2, AlertTriangle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  // Settings State
  const [dateFormat, setDateFormat] = useState('dd/mm/yyyy');
  const [currency, setCurrency] = useState('VND');
  const [autoLogoutTime, setAutoLogoutTime] = useState('30');
  
  // Notification State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [popupEnabled, setPopupEnabled] = useState(true);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAction = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const handleSaveGeneral = () => {
    handleAction('Đã lưu cài đặt chung!');
  };

  const handleSaveNotifications = () => {
    handleAction('Đã lưu cài đặt thông báo!');
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      handleAction('Vui lòng nhập đầy đủ thông tin mật khẩu!', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      handleAction('Mật khẩu mới không khớp!', 'error');
      return;
    }
    handleAction('Đã đổi mật khẩu thành công!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue flex items-center gap-2">
            <SettingsIcon size={24} /> Thiết lập chung
          </h1>
          <p className="text-black/45 text-sm mt-1">Quản lý cấu hình hệ thống, tài khoản và dữ liệu</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card title="Cấu hình hệ thống">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Định dạng ngày giờ</label>
                <Select 
                  options={[
                    { label: 'DD/MM/YYYY', value: 'dd/mm/yyyy' },
                    { label: 'MM/DD/YYYY', value: 'mm/dd/yyyy' }
                  ]}
                  value={dateFormat}
                  onChange={setDateFormat}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tiền tệ hiển thị</label>
                <Select 
                  options={[
                    { label: 'VNĐ (Việt Nam Đồng)', value: 'VND' },
                    { label: 'USD (Đô la Mỹ)', value: 'USD' }
                  ]}
                  value={currency}
                  onChange={setCurrency}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian tự động đăng xuất (phút)</label>
              <Select 
                options={[
                  { label: '15 phút', value: '15' },
                  { label: '30 phút', value: '30' },
                  { label: '60 phút', value: '60' },
                  { label: 'Không bao giờ', value: '0' }
                ]}
                value={autoLogoutTime}
                onChange={setAutoLogoutTime}
              />
              <p className="text-xs text-black/45 mt-1">Hệ thống sẽ tự động đăng xuất nếu không có hoạt động nào trong khoảng thời gian này.</p>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={handleSaveGeneral}><Save size={16} className="mr-2" /> Lưu cấu hình</Button>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card title="Cài đặt thông báo">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-vna-blue rounded-full"><Bell size={18} /></div>
                <div>
                  <h4 className="font-medium text-black/85">Thông báo Popup</h4>
                  <p className="text-xs text-black/45">Hiển thị thông báo nổi trên màn hình khi có sự kiện mới</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={popupEnabled} onChange={() => setPopupEnabled(!popupEnabled)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vna-blue"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><Bell size={18} /></div>
                <div>
                  <h4 className="font-medium text-black/85">Âm thanh thông báo</h4>
                  <p className="text-xs text-black/45">Phát âm thanh khi nhận được thông báo mới</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vna-blue"></div>
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={handleSaveNotifications}><Save size={16} className="mr-2" /> Lưu thông báo</Button>
            </div>
          </div>
        </Card>

        {/* Change Password */}
        <Card title="Đổi mật khẩu">
          <div className="space-y-4">
            <Input 
              type="password" 
              label="Mật khẩu hiện tại" 
              placeholder="Nhập mật khẩu hiện tại" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                type="password" 
                label="Mật khẩu mới" 
                placeholder="Nhập mật khẩu mới" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input 
                type="password" 
                label="Xác nhận mật khẩu mới" 
                placeholder="Nhập lại mật khẩu mới" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={handleChangePassword}><Lock size={16} className="mr-2" /> Đổi mật khẩu</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
