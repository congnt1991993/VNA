import React, { useState } from 'react';
import { Card, Button, Badge, Table, Toast, Select, Input, Modal, TextArea } from '../components/UI';
import { AlertTriangle, CheckCircle, Bell, Settings, Search, Plus, Edit2, Trash2, Mail } from 'lucide-react';

interface AlertItem {
  id: string;
  indicator: string;
  pillar: string;
  currentValue: string;
  threshold: string;
  type: 'kpi' | 'standard';
  status: 'active' | 'resolved';
  createdAt: string;
}

interface AlertRule {
  id: string;
  name: string;
  indicator: string;
  condition: string;
  threshold: string;
  triggerTime: string;
  methods: string[];
  content: string;
  status: 'active' | 'inactive';
}

const MOCK_ALERTS: AlertItem[] = [
  {
    id: '1',
    indicator: 'Tiếng ồn (% đội tàu đáp ứng Annex 16)',
    pillar: 'Môi trường (E)',
    currentValue: '98%',
    threshold: '100%',
    type: 'kpi',
    status: 'active',
    createdAt: '15/04/2026 08:30'
  },
  {
    id: '2',
    indicator: 'Giảm tiêu thụ năng lượng (Tấn)',
    pillar: 'Môi trường (E)',
    currentValue: '45,000',
    threshold: '50,000',
    type: 'kpi',
    status: 'active',
    createdAt: '14/04/2026 14:15'
  },
  {
    id: '3',
    indicator: 'Tỷ lệ nữ quản lý (%)',
    pillar: 'Xã hội (S)',
    currentValue: '28.5%',
    threshold: '30%',
    type: 'standard',
    status: 'active',
    createdAt: '12/04/2026 09:00'
  },
  {
    id: '4',
    indicator: 'Chương trình nâng cao kỹ năng (Người)',
    pillar: 'Quản trị (G)',
    currentValue: '9,500',
    threshold: '10,000',
    type: 'kpi',
    status: 'resolved',
    createdAt: '10/04/2026 16:45'
  }
];

const MOCK_RULES: AlertRule[] = [
  {
    id: 'R1',
    name: 'Cảnh báo Tiếng ồn dưới ngưỡng',
    indicator: 'Tiếng ồn (% đội tàu đáp ứng Annex 16)',
    condition: '<',
    threshold: '100',
    triggerTime: 'Khi có dữ liệu mới',
    methods: ['email', 'bell'],
    content: 'Chỉ tiêu tiếng ồn hiện tại đang dưới ngưỡng 100%. Vui lòng kiểm tra lại dữ liệu.',
    status: 'active'
  },
  {
    id: 'R2',
    name: 'Cảnh báo Giảm tiêu thụ năng lượng',
    indicator: 'Giảm tiêu thụ năng lượng (Tấn)',
    condition: '<',
    threshold: '50000',
    triggerTime: 'Hàng tháng',
    methods: ['bell'],
    content: 'Lượng giảm tiêu thụ năng lượng chưa đạt mục tiêu 50,000 tấn.',
    status: 'active'
  }
];

export const AlertsManagePage: React.FC<{ departmentFilter?: string }> = ({ departmentFilter }) => {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules'>('alerts');
  
  // Alerts State
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [filterStatus, setFilterStatus] = useState('active');

  // Rules State
  const [rules, setRules] = useState<AlertRule[]>(MOCK_RULES);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, status: 'resolved' } : alert));
    setToast({ message: 'Đã xử lý cảnh báo thành công!', type: 'success' });
  };

  const handleOpenRuleModal = (rule?: AlertRule) => {
    if (rule) {
      setEditingRule(rule);
    } else {
      setEditingRule({
        id: '',
        name: '',
        indicator: '',
        condition: '<',
        threshold: '',
        triggerTime: 'Khi có dữ liệu mới',
        methods: ['bell'],
        content: '',
        status: 'active'
      });
    }
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = () => {
    if (editingRule) {
      if (editingRule.id) {
        setRules(prev => prev.map(r => r.id === editingRule.id ? editingRule : r));
        setToast({ message: 'Đã cập nhật cấu hình cảnh báo!', type: 'success' });
      } else {
        setRules(prev => [...prev, { ...editingRule, id: `R${Date.now()}` }]);
        setToast({ message: 'Đã thêm cấu hình cảnh báo mới!', type: 'success' });
      }
    }
    setIsRuleModalOpen(false);
  };

  const handleDeleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    setToast({ message: 'Đã xóa cấu hình cảnh báo!', type: 'info' });
  };

  const filteredAlerts = alerts.filter(alert => filterStatus === 'all' || alert.status === filterStatus);

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-vna-blue">Quản lý cảnh báo hệ thống</h1>
          <p className="text-black/45 text-sm mt-1">Theo dõi và cấu hình các cảnh báo tự động cho chỉ số ESG</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'rules' && (
            <Button variant="primary" onClick={() => handleOpenRuleModal()}>
              <Plus size={16} className="mr-2" />
              Thêm cấu hình mới
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'alerts'
                ? 'border-vna-blue text-vna-blue'
                : 'border-transparent text-black/45 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              Danh sách cảnh báo
            </div>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'rules'
                ? 'border-vna-blue text-vna-blue'
                : 'border-transparent text-black/45 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <Settings size={16} />
              Cấu hình cảnh báo
            </div>
          </button>
        </nav>
      </div>

      {activeTab === 'alerts' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 flex items-center gap-4 border-l-4 border-red-500">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-xs text-black/45 font-medium uppercase">Cảnh báo đang mở</p>
                <h3 className="text-2xl font-bold text-black/85">{alerts.filter(a => a.status === 'active').length}</h3>
              </div>
            </Card>
            <Card className="p-5 flex items-center gap-4 border-l-4 border-green-500">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-xs text-black/45 font-medium uppercase">Cảnh báo đã xử lý</p>
                <h3 className="text-2xl font-bold text-black/85">{alerts.filter(a => a.status === 'resolved').length}</h3>
              </div>
            </Card>
            <Card className="p-5 flex items-center gap-4 border-l-4 border-blue-500">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Bell size={24} />
              </div>
              <div>
                <p className="text-xs text-black/45 font-medium uppercase">Tổng số cảnh báo</p>
                <h3 className="text-2xl font-bold text-black/85">{alerts.length}</h3>
              </div>
            </Card>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex gap-2">
                <Select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={[
                    { label: 'Tất cả trạng thái', value: 'all' },
                    { label: 'Đang mở', value: 'active' },
                    { label: 'Đã xử lý', value: 'resolved' }
                  ]}
                  className="w-48"
                />
              </div>
              <div className="relative w-64">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm chỉ tiêu..." 
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-vna-blue"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
            </div>

            <Table>
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Chỉ tiêu</th>
                  <th className="px-4 py-3">Trụ cột</th>
                  <th className="px-4 py-3">Hiện tại / Ngưỡng</th>
                  <th className="px-4 py-3">Loại cảnh báo</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-black/85">{alert.indicator}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{alert.pillar}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-red-600">{alert.currentValue}</div>
                      <div className="text-xs text-black/45">Ngưỡng: {alert.threshold}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={alert.type === 'kpi' ? 'warning' : 'danger'}>
                        {alert.type === 'kpi' ? 'Ngưỡng KPI' : 'Quy định chuẩn'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-black/45">{alert.createdAt}</td>
                    <td className="px-4 py-3">
                      <Badge variant={alert.status === 'active' ? 'danger' : 'success'}>
                        {alert.status === 'active' ? 'Đang mở' : 'Đã xử lý'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {alert.status === 'active' && (
                        <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleResolve(alert.id)}>
                          <CheckCircle size={16} className="mr-1" /> Xử lý
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredAlerts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-black/45">Không có cảnh báo nào</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>
        </>
      )}

      {activeTab === 'rules' && (
        <Card className="p-0 overflow-hidden">
          <Table>
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Tên cảnh báo</th>
                <th className="px-4 py-3">Chỉ tiêu áp dụng</th>
                <th className="px-4 py-3">Điều kiện & Ngưỡng</th>
                <th className="px-4 py-3">Khi nào cảnh báo</th>
                <th className="px-4 py-3">Hình thức</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-black/85">{rule.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{rule.indicator}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{rule.condition} {rule.threshold}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{rule.triggerTime}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {rule.methods.includes('email') && <Mail size={16} className="text-blue-500" title="Email" />}
                      {rule.methods.includes('bell') && <Bell size={16} className="text-yellow-500" title="Chuông thông báo" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={rule.status === 'active' ? 'success' : 'secondary'}>
                      {rule.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenRuleModal(rule)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRule(rule.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-black/45">Chưa có cấu hình cảnh báo nào</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Rule Configuration Modal */}
      <Modal 
        isOpen={isRuleModalOpen} 
        onClose={() => setIsRuleModalOpen(false)} 
        title={editingRule?.id ? "Sửa cấu hình cảnh báo" : "Thêm cấu hình cảnh báo"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsRuleModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveRule}>Lưu cấu hình</Button>
          </>
        }
      >
        {editingRule && (
          <div className="space-y-4">
            <Input 
              label="Tên cảnh báo" 
              placeholder="VD: Cảnh báo tiếng ồn" 
              value={editingRule.name}
              onChange={(e) => setEditingRule({...editingRule, name: e.target.value})}
            />
            <Select 
              label="Chỉ tiêu áp dụng" 
              options={[
                { label: 'Tiếng ồn (% đội tàu đáp ứng Annex 16)', value: 'Tiếng ồn (% đội tàu đáp ứng Annex 16)' },
                { label: 'Giảm tiêu thụ năng lượng (Tấn)', value: 'Giảm tiêu thụ năng lượng (Tấn)' },
                { label: 'Tỷ lệ nữ quản lý (%)', value: 'Tỷ lệ nữ quản lý (%)' },
              ]}
              value={editingRule.indicator}
              onChange={(e) => setEditingRule({...editingRule, indicator: e.target.value})}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Select 
                label="Điều kiện cảnh báo" 
                options={[
                  { label: 'Lớn hơn (>)', value: '>' },
                  { label: 'Nhỏ hơn (<)', value: '<' },
                  { label: 'Bằng (==)', value: '==' },
                  { label: 'Lớn hơn hoặc bằng (>=)', value: '>=' },
                  { label: 'Nhỏ hơn hoặc bằng (<=)', value: '<=' },
                ]}
                value={editingRule.condition}
                onChange={(e) => setEditingRule({...editingRule, condition: e.target.value})}
              />
              <Input 
                label="Tham số / Ngưỡng" 
                placeholder="VD: 100" 
                value={editingRule.threshold}
                onChange={(e) => setEditingRule({...editingRule, threshold: e.target.value})}
              />
            </div>

            <Select 
              label="Khi nào cảnh báo" 
              options={[
                { label: 'Khi có dữ liệu mới', value: 'Khi có dữ liệu mới' },
                { label: 'Hàng ngày', value: 'Hàng ngày' },
                { label: 'Hàng tuần', value: 'Hàng tuần' },
                { label: 'Hàng tháng', value: 'Hàng tháng' },
              ]}
              value={editingRule.triggerTime}
              onChange={(e) => setEditingRule({...editingRule, triggerTime: e.target.value})}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hình thức cảnh báo</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingRule.methods.includes('email')}
                    onChange={(e) => {
                      const newMethods = e.target.checked 
                        ? [...editingRule.methods, 'email'] 
                        : editingRule.methods.filter(m => m !== 'email');
                      setEditingRule({...editingRule, methods: newMethods});
                    }}
                    className="rounded border-gray-300 text-vna-blue focus:ring-vna-blue"
                  />
                  <span className="text-sm text-gray-700">Gửi Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingRule.methods.includes('bell')}
                    onChange={(e) => {
                      const newMethods = e.target.checked 
                        ? [...editingRule.methods, 'bell'] 
                        : editingRule.methods.filter(m => m !== 'bell');
                      setEditingRule({...editingRule, methods: newMethods});
                    }}
                    className="rounded border-gray-300 text-vna-blue focus:ring-vna-blue"
                  />
                  <span className="text-sm text-gray-700">Chuông thông báo hệ thống</span>
                </label>
              </div>
            </div>

            <TextArea 
              label="Nội dung cảnh báo" 
              placeholder="Nhập nội dung sẽ được gửi đi..." 
              rows={3}
              value={editingRule.content}
              onChange={(e) => setEditingRule({...editingRule, content: e.target.value})}
            />

            <Select 
              label="Trạng thái" 
              options={[
                { label: 'Hoạt động', value: 'active' },
                { label: 'Tạm dừng', value: 'inactive' },
              ]}
              value={editingRule.status}
              onChange={(e) => setEditingRule({...editingRule, status: e.target.value as 'active' | 'inactive'})}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

