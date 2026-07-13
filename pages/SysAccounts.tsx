import React, { useState } from 'react';
import { Card, Button, Input, Select, Badge, Table, Toast, Modal } from '../components/UI';
import { Plus, Search, Edit2, Trash2, Check, UserPlus } from 'lucide-react';
import { FORM_DEFINITIONS, ROLE_CONFIGS } from '../data/accessControl';

const AVAILABLE_ROLES = ROLE_CONFIGS.map(role => ({ id: role.id, name: role.name }));

export const SysAccountsPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');

  // Thêm state cho mock AD search
  const [searchTerm, setSearchTerm] = useState('');
  const [adUser, setAdUser] = useState<{name: string, email: string} | null>(null);

  const handleAction = (action: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message: action, type });
    setIsModalOpen(false);
  };

  const openModal = (type: 'add' | 'edit') => {
    setModalType(type);
    if (type === 'add') {
      setSelectedRoles([]);
      setSearchTerm('');
      setAdUser(null);
    }
    if (type === 'edit') {
      setSelectedRoles(['ROLE_TECH_ENTRY']);
      setAdUser({ name: 'Nguyễn Văn A', email: 'nguyenvana@vietnamairlines.com' });
    }
    setIsModalOpen(true);
  };

  const assignedFormIds = Array.from(new Set(
    selectedRoles.flatMap(roleId => ROLE_CONFIGS.find(role => role.id === roleId)?.formGrants.filter(grant => grant.view).map(grant => grant.formId) || [])
  ));

  const handleSearchAD = () => {
    // Mock AD Search
    if (searchTerm.trim() !== '') {
      setToast({ message: 'Đang kết nối Active Directory...', type: 'info' });
      setTimeout(() => {
        setAdUser({
          name: 'Nhân viên AD (' + searchTerm + ')',
          email: `${searchTerm.toLowerCase()}@vietnamairlines.com`
        });
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalType === 'add' ? "Thêm người dùng từ AD" : "Phân quyền người dùng"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => handleAction(modalType === 'add' ? 'Đã thêm nhân sự thành công!' : 'Đã cập nhật quyền thành công!')}>Lưu</Button>
          </>
        }
      >
        <div className="space-y-4">
          {modalType === 'add' && (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input 
                  label="Tài khoản AD / Mã nhân viên" 
                  placeholder="Nhập mã nhân viên hoặc username AD..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleSearchAD}>
                <Search size={16} className="mr-2" />
                Tìm kiếm
              </Button>
            </div>
          )}

          {adUser && (
            <div className="bg-blue-50 p-3 rounded border border-blue-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-vna-blue text-white flex items-center justify-center font-bold">
                {adUser.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-vna-blue">{adUser.name}</p>
                <p className="text-xs text-black/45">{adUser.email}</p>
              </div>
              <div className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium border border-green-200">
                Verified AD
              </div>
            </div>
          )}

          <Select 
            label="Phòng ban / Đơn vị" 
            options={[
              {label: 'Phòng Môi trường & PTBV (Ban An toàn Chất lượng)', value: 'esg'}, 
              {label: 'Ban Quản lý vật tư', value: 'tech'}, 
              {label: 'Trung tâm Điều hành khai thác', value: 'ops'}
            ]} 
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm quyền / Vai trò</label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md bg-gray-50">
              {AVAILABLE_ROLES.map(role => {
                const isSelected = selectedRoles.includes(role.id);
                return (
                  <div 
                    key={role.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedRoles(selectedRoles.filter(id => id !== role.id));
                      } else {
                        setSelectedRoles([...selectedRoles, role.id]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border flex items-center gap-1 ${
                      isSelected 
                        ? 'bg-blue-100 text-vna-blue border-blue-300' 
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {isSelected && <Check size={12} />}
                    {role.name}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <div className="text-sm font-bold text-vna-blue">Phạm vi nhập liệu hiệu lực</div>
            <p className="mt-1 text-xs text-gray-500">Hợp nhất theo từng form từ tất cả nhóm quyền đã chọn.</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedRoles.includes('ROLE_ADMIN') ? (
                <Badge variant="warning">Toàn bộ {FORM_DEFINITIONS.length} form</Badge>
              ) : assignedFormIds.length > 0 ? assignedFormIds.map(formId => {
                const form = FORM_DEFINITIONS.find(item => item.id === formId);
                return <Badge key={formId} variant="primary">{form?.code} - {form?.name}</Badge>;
              }) : <span className="text-xs font-medium text-amber-700">Chưa có form nhập liệu</span>}
            </div>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4 text-left">
        <div>
          <h2 className="text-xl font-bold text-vna-blue">Quản lý Người dùng</h2>
          <p className="text-sm text-black/45 mt-1">Quản lý, cấp quyền truy cập hệ thống cho các tài khoản Active Directory (AD)</p>
        </div>
        <Button variant="primary" onClick={() => openModal('add')} className="shadow-md cursor-pointer font-bold flex items-center gap-1.5">
          <UserPlus size={16} />
          Thêm từ AD
        </Button>
      </div>

      {/* Advanced Filters Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 items-end text-left shadow-xs">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Từ khóa</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <Input placeholder="Tìm kiếm theo tên, email, tài khoản AD..." className="pl-10" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Phòng ban / đơn vị</label>
          <Select className="w-full">
            <option value="">Tất cả phòng ban / đơn vị</option>
            <option value="esg">Phòng Môi trường & PTBV</option>
            <option value="tech">Ban Quản lý vật tư</option>
            <option value="ops">Trung tâm Điều hành khai thác</option>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 flex-1 min-h-[400px] text-left">
        <Table className="w-full text-left border-collapse text-sm min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-gray-700">Nhân sự</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Cơ cấu Tổ chức</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Vai trò / Phân quyền</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Nguồn</th>
              <th className="py-3 px-4 font-semibold text-gray-700 text-center">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-gray-700 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            <tr className="hover:bg-blue-50/45 group transition-colors">
              <td className="py-3.5 px-4">
                <div className="font-semibold text-gray-800">Nguyễn Văn A</div>
                <div className="text-xs text-gray-400">nguyenvana@vietnamairlines.com</div>
              </td>
              <td className="py-3.5 px-4 text-gray-700 font-semibold">Ban Quản lý vật tư</td>
              <td className="py-3.5 px-4">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="primary">Nhập liệu Kỹ thuật</Badge>
                  <Badge variant="secondary">Người phê duyệt</Badge>
                </div>
              </td>
              <td className="py-3.5 px-4"><span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border">AD Sync</span></td>
              <td className="py-3.5 px-4 text-center">
                <Badge variant="success">Hoạt động</Badge>
              </td>
              <td className="py-3.5 px-4 text-center">
                <div className="flex justify-center gap-1.5">
                  <button 
                    onClick={() => openModal('edit')}
                    className="p-1 rounded text-gray-500 hover:bg-vna-blue hover:text-white transition-colors cursor-pointer"
                    title="Sửa phân quyền"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button 
                    onClick={() => handleAction('Đã thu hồi tất cả quyền của người dùng!', 'info')}
                    className="p-1 rounded text-gray-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                    title="Khóa"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-blue-50/45 group transition-colors">
              <td className="py-3.5 px-4">
                <div className="font-semibold text-gray-800">Trần Thị B</div>
                <div className="text-xs text-gray-400">tranthib@vietnamairlines.com</div>
              </td>
              <td className="py-3.5 px-4 text-gray-700 font-semibold">Phòng Môi trường & PTBV</td>
              <td className="py-3.5 px-4">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="warning">Quản trị viên</Badge>
                  <Badge variant="primary">Thư ký ESG</Badge>
                </div>
              </td>
              <td className="py-3.5 px-4"><span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border">AD Sync</span></td>
              <td className="py-3.5 px-4 text-center">
                <Badge variant="success">Hoạt động</Badge>
              </td>
              <td className="py-3.5 px-4 text-center">
                <div className="flex justify-center gap-1.5">
                  <button 
                    onClick={() => openModal('edit')}
                    className="p-1 rounded text-gray-500 hover:bg-vna-blue hover:text-white transition-colors cursor-pointer"
                    title="Sửa phân quyền"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button 
                    onClick={() => handleAction('Đã thu hồi tất cả quyền của người dùng!', 'info')}
                    className="p-1 rounded text-gray-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                    title="Khóa"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};
