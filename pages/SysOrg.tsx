import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Select, Badge, Table, Toast, Modal } from '../components/UI';
import { Search, Edit2, Trash2, Plus, User, Key, Shield, Building2, UserX, UserCheck } from 'lucide-react';
import { ROLE_CONFIGS, RoleConfig } from '../data/accessControl';
import MOCK_INDICATORS_JSON from '../data/indicators_main_list.json';

interface AppUser {
  id: string;
  fullName: string;
  email: string;
  department: string;
  role: string; // Will store role.id (e.g., ROLE_ADMIN, ROLE_TECH_ENTRY)
  status: 'ACTIVE' | 'LOCKED';
  assignedIndicatorIds?: string[]; // Custom assigned indicators
}

const INITIAL_DATA: AppUser[] = [
  { id: '1', fullName: 'Nguyễn Văn Nam', email: 'nam.nv@vietnamairlines.com', department: 'Tổ Khai thác (TTĐHKT)', role: 'ROLE_ADMIN', status: 'ACTIVE', assignedIndicatorIds: [] },
  { id: '2', fullName: 'Trần Thị Hà', email: 'ha.tt@vietnamairlines.com', department: 'Ban An toàn chất lượng (Ban ATCL)', role: 'ROLE_APPROVER', status: 'ACTIVE', assignedIndicatorIds: [] },
  { id: '3', fullName: 'Lê Minh Tuấn', email: 'tuan.lm@vietnamairlines.com', department: 'Tổ Kỹ thuật (Ban QLVT)', role: 'ROLE_TECH_ENTRY', status: 'ACTIVE', assignedIndicatorIds: ['GRI 302-1'] },
  { id: '4', fullName: 'Nguyễn Hoàng Anh', email: 'anh.nh@vietnamairlines.com', department: 'Trung tâm Bông Sen Vàng (TTBSV)', role: 'ROLE_TECH_ENTRY', status: 'ACTIVE', assignedIndicatorIds: [] },
  { id: '5', fullName: 'Lê Thị Thuỷ', email: 'thuy.lt@vietnamairlines.com', department: 'Ban Chuyển đổi số & CNTT', role: 'ROLE_APPROVER', status: 'ACTIVE', assignedIndicatorIds: [] },
  { id: '6', fullName: 'Trần Thanh Sơn', email: 'son.tt@vietnamairlines.com', department: 'Tổ Dịch vụ', role: 'ROLE_TECH_ENTRY', status: 'ACTIVE', assignedIndicatorIds: [] },
  { id: '7', fullName: 'Phạm Thuỳ Linh', email: 'linh.pt@vietnamairlines.com', department: 'Ban Tổ chức Nhân lực', role: 'ROLE_APPROVER', status: 'ACTIVE', assignedIndicatorIds: [] },
  { id: '8', fullName: 'Nguyễn Minh Hải', email: 'hai.nm@vietnamairlines.com', department: 'Ban Kế hoạch Phát triển', role: 'ROLE_ADMIN', status: 'ACTIVE', assignedIndicatorIds: [] },
  { id: '9', fullName: 'Vũ Quốc Khánh', email: 'khanh.vq@vietnamairlines.com', department: 'Ban Truyền thông', role: 'ROLE_APPROVER', status: 'ACTIVE', assignedIndicatorIds: [] }
];

const INITIAL_DEPARTMENTS = [
  { name: 'Tổ Khai thác (TTĐHKT)', isActive: true, indicatorIds: ["GRI 302-1", "GRI 302-4", "GRI 305-1", "GRI 305-4", "GRI 305-5", "GRI 305-7"] },
  { name: 'Ban An toàn chất lượng (Ban ATCL)', isActive: true, indicatorIds: ["Airline E-1", "9", "GRI 403-2"] },
  { name: 'Tổ Kỹ thuật (Ban QLVT)', isActive: true, indicatorIds: ["4", "5", "13"] },
  { name: 'Trung tâm Bông Sen Vàng (TTBSV)', isActive: true, indicatorIds: ["Airline B-2"] },
  { name: 'Ban Chuyển đổi số & CNTT', isActive: true, indicatorIds: ["GRI 418-1"] },
  { name: 'Tổ Dịch vụ', isActive: true, indicatorIds: ["GRI 303-3", "GRI 303-5", "Airline B-1", "GRI 204-1", "GRI 406-1", "GRI 416-1", "GRI 416-2", "GRI 417-2"] },
  { name: 'Ban Tổ chức Nhân lực', isActive: true, indicatorIds: ["Airline D-1", "Airline F-2", "GRI 202-1", "GRI 401-1", "GRI 401-2", "GRI 403-4", "GRI 403-9", "GRI 403-10", "GRI 405-1", "GRI 406-1", "GRI 2-7", "GRI 2-30", "GRI 404-2", "GRI 404-3", "GRI 201-3", "GRI 202-2"] },
  { name: 'Ban Kế hoạch Phát triển', isActive: true, indicatorIds: ["GRI 2-9", "GRI 2-10", "GRI 2-11", "GRI 2-12", "GRI 2-13", "GRI 2-15", "GRI 2-23", "GRI 2-26", "GRI 2-29", "GRI 3-3", "GRI 201-4", "GRI 205-2", "GRI 205-3", "GRI 206-1", "GRI 415-1"] },
  { name: 'Ban Truyền thông', isActive: true, indicatorIds: ["Airline F-1", "GRI 417-3"] }
];

const getChildrenForms = (indCode: string, indName: string) => {
  if (indCode === 'GRI 302-1') {
    return [
      { id: `${indCode}-form-jet`, name: 'Biểu mẫu tiêu thụ nhiên liệu Jet A-1' },
      { id: `${indCode}-form-ground`, name: 'Biểu mẫu tiêu thụ nhiên liệu phương tiện mặt đất' }
    ];
  }
  if (indCode === 'GRI 305-1') {
    return [
      { id: `${indCode}-form-direct`, name: 'Biểu mẫu phát thải khí nhà kính trực tiếp Scope 1' }
    ];
  }
  if (indCode === 'GRI 303-3') {
    return [
      { id: `${indCode}-form-water`, name: 'Biểu mẫu tuần hoàn & cấp nước dịch vụ' }
    ];
  }
  return [
    { id: `${indCode}-form-default`, name: `Biểu mẫu nhập số liệu ${indName}` }
  ];
};

export const SysOrgPage: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingUser, setEditingUser] = useState<Partial<AppUser>>({});
  const [indicatorSearch, setIndicatorSearch] = useState('');

  // Load roles, users, departments, indicators from localStorage
  const loadData = () => {
    // 1. Roles
    const savedRoles = localStorage.getItem('vna_esg_roles');
    if (savedRoles) {
      setRoles(JSON.parse(savedRoles));
    } else {
      localStorage.setItem('vna_esg_roles', JSON.stringify(ROLE_CONFIGS));
      setRoles(ROLE_CONFIGS);
    }

    // 2. Users
    const savedUsers = localStorage.getItem('vna_esg_users');
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        if (parsed.length < 9) {
          localStorage.setItem('vna_esg_users', JSON.stringify(INITIAL_DATA));
          setUsers(INITIAL_DATA);
        } else {
          setUsers(parsed);
        }
      } catch (e) {
        localStorage.setItem('vna_esg_users', JSON.stringify(INITIAL_DATA));
        setUsers(INITIAL_DATA);
      }
    } else {
      localStorage.setItem('vna_esg_users', JSON.stringify(INITIAL_DATA));
      setUsers(INITIAL_DATA);
    }

    // 3. Departments
    const savedDepts = localStorage.getItem('vna_esg_departments');
    if (savedDepts) {
      try {
        const parsed = JSON.parse(savedDepts);
        const needsUpdate = parsed.length < 9 || (parsed.find((d: any) => d.name === 'Tổ Khai thác (TTĐHKT)')?.indicatorIds || []).length < 6;
        if (needsUpdate) {
          localStorage.setItem('vna_esg_departments', JSON.stringify(INITIAL_DEPARTMENTS));
          setDepts(INITIAL_DEPARTMENTS);
        } else {
          setDepts(parsed);
        }
      } catch (e) {
        localStorage.setItem('vna_esg_departments', JSON.stringify(INITIAL_DEPARTMENTS));
        setDepts(INITIAL_DEPARTMENTS);
      }
    } else {
      localStorage.setItem('vna_esg_departments', JSON.stringify(INITIAL_DEPARTMENTS));
      setDepts(INITIAL_DEPARTMENTS);
    }

    // 4. Indicators
    const savedInds = localStorage.getItem('vna_esg_indicators');
    if (savedInds) {
      try {
        setIndicators(JSON.parse(savedInds));
      } catch (e) {
        setIndicators(MOCK_INDICATORS_JSON);
      }
    } else {
      setIndicators(MOCK_INDICATORS_JSON);
    }
  };

  useEffect(() => {
    loadData();
    const handleRolesUpdate = () => {
      const saved = localStorage.getItem('vna_esg_roles');
      if (saved) setRoles(JSON.parse(saved));
    };
    const handleDeptsUpdate = () => {
      const saved = localStorage.getItem('vna_esg_departments');
      if (saved) setDepts(JSON.parse(saved));
    };
    const handleIndicatorsUpdate = () => {
      const saved = localStorage.getItem('vna_esg_indicators');
      if (saved) {
        try {
          setIndicators(JSON.parse(saved));
        } catch (e) {}
      }
    };
    window.addEventListener('vna_roles_updated', handleRolesUpdate);
    window.addEventListener('vna_departments_updated', handleDeptsUpdate);
    window.addEventListener('vna_indicators_updated', handleIndicatorsUpdate);
    
    return () => {
      window.removeEventListener('vna_roles_updated', handleRolesUpdate);
      window.removeEventListener('vna_departments_updated', handleDeptsUpdate);
      window.removeEventListener('vna_indicators_updated', handleIndicatorsUpdate);
    };
  }, []);

  const saveUsers = (list: AppUser[]) => {
    setUsers(list);
    localStorage.setItem('vna_esg_users', JSON.stringify(list));
  };

  const getDeptIndicatorIds = (deptName: string): string[] => {
    const department = depts.find(d => d.name === deptName);
    return department?.indicatorIds || [];
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (mode: 'add' | 'edit', user?: AppUser) => {
    setModalMode(mode);
    
    // Choose first active department name
    const activeDept = depts.find(d => d.isActive)?.name || 'Khối Khai thác';
    
    setEditingUser(
      user 
        ? { ...user, assignedIndicatorIds: user.assignedIndicatorIds || [] } 
        : { 
            fullName: '', 
            email: '', 
            department: activeDept, 
            role: roles[2]?.id || 'ROLE_TECH_ENTRY', 
            status: 'ACTIVE',
            assignedIndicatorIds: []
          }
    );
    setIndicatorSearch('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingUser.fullName || !editingUser.email) {
      setToast({ message: 'Vui lòng nhập đầy đủ họ tên và email!', type: 'error' });
      return;
    }

    if (modalMode === 'add') {
      const updated = [...users, { ...editingUser, id: Date.now().toString() } as AppUser];
      saveUsers(updated);
      setToast({ message: 'Đã thêm tài khoản người dùng thành công!', type: 'success' });
    } else {
      const updated = users.map(u => u.id === editingUser.id ? editingUser as AppUser : u);
      saveUsers(updated);
      setToast({ message: 'Đã cập nhật thông tin người dùng!', type: 'success' });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if(confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      const updated = users.filter(u => u.id !== id);
      saveUsers(updated);
      setToast({ message: 'Đã xóa tài khoản thành công!', type: 'info' });
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const updated = users.map(u => u.id === id ? { ...u, status: (currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE') as any } : u);
    saveUsers(updated);
    setToast({ message: currentStatus === 'ACTIVE' ? 'Đã khóa tài khoản!' : 'Đã mở khóa tài khoản!', type: 'success' });
  };

  const handleIndicatorToggle = (code: string) => {
    const currentCustom = editingUser.assignedIndicatorIds || [];
    let updatedCustom: string[];
    if (currentCustom.includes(code)) {
      updatedCustom = currentCustom.filter(id => id !== code);
    } else {
      updatedCustom = [...currentCustom, code];
    }
    setEditingUser({ ...editingUser, assignedIndicatorIds: updatedCustom });
  };

  const inheritedIndicatorIds = getDeptIndicatorIds(editingUser.department || '');

  const allSubFormIds = useMemo(() => {
    const ids: string[] = [];
    indicators.forEach(ind => {
      const parentCode = ind.code || ind.id;
      const children = getChildrenForms(parentCode, ind.name);
      children.forEach(c => ids.push(c.id));
    });
    return ids;
  }, [indicators]);

  const isAllChecked = useMemo(() => {
    if (allSubFormIds.length === 0) return false;
    return allSubFormIds.every(id => {
      const parentCode = id.split('-form-')[0];
      const isAssigned = (editingUser.assignedIndicatorIds || []).includes(id);
      const isInherited = inheritedIndicatorIds.includes(parentCode);
      return isAssigned || isInherited;
    });
  }, [allSubFormIds, editingUser.assignedIndicatorIds, inheritedIndicatorIds]);

  const handleToggleSelectAll = () => {
    if (isAllChecked) {
      setEditingUser(prev => ({ ...prev, assignedIndicatorIds: [] }));
    } else {
      setEditingUser(prev => ({ ...prev, assignedIndicatorIds: [...allSubFormIds] }));
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? "Thêm tài khoản người dùng" : "Sửa thông tin người dùng"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSave}>Lưu thông tin</Button>
          </>
        }
      >
        <div className="space-y-4 text-left max-h-[75vh] overflow-y-auto pr-1">
          <Input 
            label="Họ và tên" 
            placeholder="Nhập họ và tên..." 
            value={editingUser.fullName || ''}
            onChange={e => setEditingUser({...editingUser, fullName: e.target.value})}
          />
          <Input 
            label="Email đăng nhập" 
            placeholder="ten.ho@vietnamairlines.com" 
            value={editingUser.email || ''}
            onChange={e => setEditingUser({...editingUser, email: e.target.value})}
          />
          <Select 
            label="Đơn vị / Phòng ban" 
            value={editingUser.department || ''}
            onChange={e => setEditingUser({...editingUser, department: e.target.value, assignedIndicatorIds: []})}
            options={(() => {
              const activeDepts = depts.filter(d => d.isActive).map(d => ({ label: d.name, value: d.name }));
              if (editingUser.department && !activeDepts.some(d => d.value === editingUser.department)) {
                activeDepts.push({ label: `${editingUser.department} (Không hoạt động)`, value: editingUser.department });
              }
              return activeDepts;
            })()}
          />
          <Select 
            label="Gán quyền (Vai trò)" 
            value={editingUser.role || ''}
            onChange={e => setEditingUser({...editingUser, role: e.target.value})}
            options={roles.map(r => ({ label: r.name, value: r.id }))}
          />
          <Select 
            label="Trạng thái" 
            value={editingUser.status || 'ACTIVE'}
            onChange={e => setEditingUser({...editingUser, status: e.target.value as any})}
            options={[
              {label: 'Đang hoạt động', value: 'ACTIVE'},
              {label: 'Bị khóa', value: 'LOCKED'}
            ]}
          />

          {/* USER INDICATORS ASSIGNMENT */}
          <div className="pt-3 border-t border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-2">Chỉ tiêu phụ trách (Phân cấp Chỉ tiêu & Form)</label>
            
            {/* Search indicator */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <Input 
                placeholder="Tìm nhanh chỉ tiêu theo mã hoặc tên..." 
                className="pl-9 w-full py-1.5 text-xs"
                value={indicatorSearch}
                onChange={(e) => setIndicatorSearch(e.target.value)}
              />
            </div>

            {/* Chọn tất cả Checkbox */}
            <div className="flex items-center gap-2 mb-3 ml-1">
              <input
                type="checkbox"
                id="select-all-indicators-checkbox"
                checked={isAllChecked}
                onChange={handleToggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-vna-blue focus:ring-vna-blue cursor-pointer"
              />
              <label htmlFor="select-all-indicators-checkbox" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                Chọn tất cả chỉ tiêu ({allSubFormIds.length})
              </label>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="max-h-[250px] overflow-y-auto divide-y divide-gray-150 p-2 space-y-2">
                {(() => {
                  const filtered = indicators.filter(ind => {
                    const code = (ind.code || ind.id || '').toLowerCase();
                    const name = (ind.name || '').toLowerCase();
                    const query = indicatorSearch.toLowerCase();
                    return code.includes(query) || name.includes(query);
                  });

                  if (filtered.length === 0) {
                    return <p className="text-xs text-gray-400 italic p-3 text-center">Không tìm thấy chỉ tiêu phù hợp</p>;
                  }

                  return filtered.map((ind) => {
                    const parentCode = ind.code || ind.id;
                    const children = getChildrenForms(parentCode, ind.name);
                    const userAssigned = editingUser.assignedIndicatorIds || [];

                    // Inherited check
                    const isParentInherited = inheritedIndicatorIds.includes(parentCode);

                    // Check states
                    const isParentChecked = isParentInherited || children.every(child => userAssigned.includes(child.id));
                    const isParentIndeterminate = !isParentInherited && !isParentChecked && children.some(child => userAssigned.includes(child.id));

                    const handleParentToggle = () => {
                      if (isParentInherited) return;

                      if (isParentChecked) {
                        // Uncheck all children
                        setEditingUser(prev => ({
                          ...prev,
                          assignedIndicatorIds: (prev.assignedIndicatorIds || []).filter(id => !children.some(c => c.id === id))
                        }));
                      } else {
                        // Check all children
                        setEditingUser(prev => {
                          const withoutChildren = (prev.assignedIndicatorIds || []).filter(id => !children.some(c => c.id === id));
                          return {
                            ...prev,
                            assignedIndicatorIds: [...withoutChildren, ...children.map(c => c.id)]
                          };
                        });
                      }
                    };

                    const handleChildToggle = (childId: string) => {
                      if (isParentInherited) return;

                      setEditingUser(prev => {
                        const current = prev.assignedIndicatorIds || [];
                        const updated = current.includes(childId)
                          ? current.filter(id => id !== childId)
                          : [...current, childId];
                        return {
                          ...prev,
                          assignedIndicatorIds: updated
                        };
                      });
                    };

                    return (
                      <div key={parentCode} className="space-y-1 pb-2">
                        {/* Parent Row */}
                        <div className={`flex items-start gap-3 p-2 rounded-md transition-colors ${
                          isParentInherited 
                            ? 'bg-emerald-50/40 opacity-90' 
                            : isParentChecked 
                              ? 'bg-blue-50/20' 
                              : 'hover:bg-gray-50'
                        }`}>
                          <input 
                            type="checkbox"
                            checked={isParentChecked}
                            disabled={isParentInherited}
                            ref={el => {
                              if (el) el.indeterminate = isParentIndeterminate;
                            }}
                            onChange={handleParentToggle}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-vna-blue focus:ring-vna-blue cursor-pointer disabled:text-emerald-600 disabled:border-emerald-300"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center w-full">
                              <span className="text-xs font-bold text-vna-blue">[{parentCode}]</span>
                              {isParentInherited && (
                                <span className="text-[10px] text-emerald-700 bg-emerald-100/70 font-bold px-1.5 py-0.2 rounded border border-emerald-250">Tự động từ ban</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-800 font-bold block mt-0.5">{ind.name}</span>
                          </div>
                        </div>

                        {/* Children Rows (Forms) */}
                        <div className="pl-8 space-y-1 border-l-2 border-gray-100 ml-4">
                          {children.map(child => {
                            const isChildChecked = isParentInherited || userAssigned.includes(child.id);
                            return (
                              <label 
                                key={child.id} 
                                className={`flex items-start gap-2.5 p-1.5 rounded transition-colors ${
                                  isParentInherited 
                                    ? 'opacity-80' 
                                    : isChildChecked 
                                      ? 'bg-emerald-50/20 hover:bg-emerald-50/30 cursor-pointer' 
                                      : 'hover:bg-gray-50 cursor-pointer'
                                }`}
                              >
                                <input 
                                  type="checkbox"
                                  checked={isChildChecked}
                                  disabled={isParentInherited}
                                  onChange={() => handleChildToggle(child.id)}
                                  className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:text-emerald-500"
                                />
                                <span className="text-[11px] text-gray-650 font-semibold">{child.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4 text-left">
        <div>
          <h2 className="text-xl font-bold text-vna-blue">Quản lý Người dùng</h2>
          <p className="text-sm text-black/45 mt-1">Quản lý danh sách tài khoản đăng nhập và gán quyền trên hệ thống</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal('add')} className="shadow-md cursor-pointer font-bold flex items-center gap-1.5">
          <Plus size={16} />
          Thêm người dùng
        </Button>
      </div>

      {/* Advanced Filters Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 items-end text-left shadow-xs">
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Từ khóa</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, email, phòng ban..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue text-sm bg-white" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 flex-1 min-h-[400px] text-left">
        <Table className="w-full text-left border-collapse text-sm min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-gray-700">Tài khoản</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Đơn vị</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Phân quyền (Vai trò)</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Chỉ tiêu phụ trách</th>
              <th className="py-3 px-4 font-semibold text-gray-700 text-center">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-gray-700 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-blue-50/45 group transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-vna-blue/10 text-vna-blue flex items-center justify-center font-bold text-xs">
                      {user.fullName.split(' ').map(n => n[0]).join('').slice(-2)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{user.fullName}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-gray-700 font-semibold">{user.department}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Shield size={14} className={user.role === 'ROLE_ADMIN' ? 'text-vna-gold' : 'text-blue-500'} />
                    <span className={user.role === 'ROLE_ADMIN' ? 'text-vna-gold' : 'text-blue-600'}>
                      {roles.find(r => r.id === user.role)?.name || user.role}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1 max-w-xs text-left">
                    {(() => {
                      const inherited = getDeptIndicatorIds(user.department);
                      const custom = user.assignedIndicatorIds || [];
                      const all = Array.from(new Set([...inherited, ...custom]));
                      
                      return all.length > 0 ? (
                        all.map(code => {
                          const isInherited = inherited.includes(code);
                          const nameLookup = indicators.find(i => i.code === code || i.id === code)?.name || '';
                          return (
                            <Badge 
                              key={code} 
                              variant="secondary" 
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                isInherited 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                              title={`${nameLookup} ${isInherited ? '(Tự động từ ban)' : '(Gán riêng)'}`}
                            >
                              {code}
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-400 italic">Không có chỉ tiêu</span>
                      );
                    })()}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  {user.status === 'ACTIVE' ? (
                    <Badge variant="success">Hoạt động</Badge>
                  ) : (
                    <Badge variant="default">Đã khóa</Badge>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="flex justify-center gap-1.5">
                    <button 
                      onClick={() => handleOpenModal('edit', user)}
                      className="p-1 rounded text-gray-500 hover:bg-vna-blue hover:text-white transition-colors cursor-pointer"
                      title="Sửa thông tin & Gán quyền"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className="p-1 rounded text-gray-500 hover:bg-vna-blue hover:text-white transition-colors cursor-pointer"
                      title={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {user.status === 'ACTIVE' ? <UserX size={15} className="text-orange-500" /> : <UserCheck size={15} className="text-green-600" />}
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-1 rounded text-gray-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      title="Xóa tài khoản"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 font-bold">Không tìm thấy tài khoản nào</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};
