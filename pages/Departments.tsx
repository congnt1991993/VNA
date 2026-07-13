import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge, Table, Modal, Toast } from '../components/UI';
import { Plus, Search, Check, X, Shield, Settings, Info, Edit, Trash2 } from 'lucide-react';
import MOCK_INDICATORS_JSON from '../data/indicators_main_list.json';

interface Department {
  id: string;
  name: string;
  indicatorIds: string[]; // List of indicator codes (e.g. ['SAF', 'GRI 302-1'])
  isActive: boolean;
}

const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'DEPT-001', name: 'Tổ Khai thác (TTĐHKT)', indicatorIds: ["GRI 302-1", "GRI 302-4", "GRI 305-1", "GRI 305-4", "GRI 305-5", "GRI 305-7"], isActive: true },
  { id: 'DEPT-002', name: 'Ban An toàn chất lượng (Ban ATCL)', indicatorIds: ["Airline E-1", "9", "GRI 403-2"], isActive: true },
  { id: 'DEPT-003', name: 'Tổ Kỹ thuật (Ban QLVT)', indicatorIds: ["4", "5", "13"], isActive: true },
  { id: 'DEPT-004', name: 'Trung tâm Bông Sen Vàng (TTBSV)', indicatorIds: ["Airline B-2"], isActive: true },
  { id: 'DEPT-005', name: 'Ban Chuyển đổi số & CNTT', indicatorIds: ["GRI 418-1"], isActive: true },
  { id: 'DEPT-006', name: 'Tổ Dịch vụ', indicatorIds: ["GRI 303-3", "GRI 303-5", "Airline B-1", "GRI 204-1", "GRI 406-1", "GRI 416-1", "GRI 416-2", "GRI 417-2"], isActive: true },
  { id: 'DEPT-007', name: 'Ban Tổ chức Nhân lực', indicatorIds: ["Airline D-1", "Airline F-2", "GRI 202-1", "GRI 401-1", "GRI 401-2", "GRI 403-4", "GRI 403-9", "GRI 403-10", "GRI 405-1", "GRI 406-1", "GRI 2-7", "GRI 2-30", "GRI 404-2", "GRI 404-3", "GRI 201-3", "GRI 202-2"], isActive: true },
  { id: 'DEPT-008', name: 'Ban Kế hoạch Phát triển', indicatorIds: ["GRI 2-9", "GRI 2-10", "GRI 2-11", "GRI 2-12", "GRI 2-13", "GRI 2-15", "GRI 2-23", "GRI 2-26", "GRI 2-29", "GRI 3-3", "GRI 201-4", "GRI 205-2", "GRI 205-3", "GRI 206-1", "GRI 415-1"], isActive: true },
  { id: 'DEPT-009', name: 'Ban Truyền thông', indicatorIds: ["Airline F-1", "GRI 417-3"], isActive: true },
];

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingDept, setEditingDept] = useState<Partial<Department>>({});
  
  // Modal Fields state
  const [name, setName] = useState('');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [indicatorSearch, setIndicatorSearch] = useState('');

  // Load departments and indicators on mount
  useEffect(() => {
    // 1. Load Departments
    const savedDepts = localStorage.getItem('vna_esg_departments');
    if (savedDepts) {
      try {
        const parsed = JSON.parse(savedDepts);
        const needsUpdate = parsed.length < 9 || (parsed.find((d: any) => d.name === 'Tổ Khai thác (TTĐHKT)')?.indicatorIds || []).length < 6;
        if (needsUpdate) {
          localStorage.setItem('vna_esg_departments', JSON.stringify(INITIAL_DEPARTMENTS));
          setDepartments(INITIAL_DEPARTMENTS);
        } else {
          setDepartments(parsed);
        }
      } catch (e) {
        localStorage.setItem('vna_esg_departments', JSON.stringify(INITIAL_DEPARTMENTS));
        setDepartments(INITIAL_DEPARTMENTS);
      }
    } else {
      localStorage.setItem('vna_esg_departments', JSON.stringify(INITIAL_DEPARTMENTS));
      setDepartments(INITIAL_DEPARTMENTS);
    }

    // 2. Load Indicators for listing
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
  }, []);

  const saveDepartments = (list: Department[]) => {
    localStorage.setItem('vna_esg_departments', JSON.stringify(list));
    setDepartments(list);
    window.dispatchEvent(new Event('vna_departments_updated'));
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setName('');
    setSelectedIndicators([]);
    setIsActive(true);
    setFormError('');
    setIndicatorSearch('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: Department) => {
    setModalMode('edit');
    setEditingDept(dept);
    setName(dept.name);
    setSelectedIndicators(dept.indicatorIds || []);
    setIsActive(dept.isActive);
    setFormError('');
    setIndicatorSearch('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setFormError('Tên Ban / Đơn vị không được để trống!');
      return;
    }

    if (modalMode === 'add') {
      const newDept: Department = {
        id: `DEPT-${String(Date.now()).slice(-3)}`,
        name: name.trim(),
        indicatorIds: selectedIndicators,
        isActive
      };
      const updated = [...departments, newDept];
      saveDepartments(updated);
      setToast({ message: `Đã tạo Ban "${newDept.name}" thành công!`, type: 'success' });
    } else {
      const updated = departments.map(d => 
        d.id === editingDept.id 
          ? { ...d, name: name.trim(), indicatorIds: selectedIndicators, isActive } 
          : d
      );
      saveDepartments(updated);
      setToast({ message: `Đã cập nhật Ban "${name}" thành công!`, type: 'success' });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa Ban này?')) return;
    const updated = departments.filter(d => d.id !== id);
    saveDepartments(updated);
    setToast({ message: 'Đã xóa Ban thành công!', type: 'success' });
  };

  const toggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = departments.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d);
    saveDepartments(updated);
    const item = departments.find(d => d.id === id);
    if (item) {
      setToast({ message: `Đã chuyển Ban sang trạng thái ${item.isActive ? 'Tạm khóa' : 'Hoạt động'}!`, type: 'info' });
    }
  };

  const handleIndicatorToggle = (code: string) => {
    setSelectedIndicators(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // Filter list
  const filteredDepartments = departments.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || (statusFilter === 'active' ? d.isActive : !d.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4 text-left">
        <div>
          <h2 className="text-xl font-bold text-vna-blue">Quản lý Ban / Đơn vị</h2>
          <p className="text-sm text-black/45 mt-1">Quản lý cơ cấu các ban của VNA, phân bổ chỉ tiêu ESG quản lý và liên thông người dùng</p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal} className="shadow-md cursor-pointer font-bold flex items-center gap-1.5">
          <Plus size={16} /> Thêm mới Ban
        </Button>
      </div>

      {/* Advanced Filters Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 items-end text-left shadow-xs">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Từ khóa</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm Ban theo tên hoặc mã..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue text-sm bg-white" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Trạng thái</label>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động (Active)</option>
            <option value="deactive">Tạm dừng (Deactive)</option>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 flex-1 min-h-[400px] text-left">
        <Table className="w-full text-left border-collapse text-sm min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-gray-700 w-32">Mã Ban</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Tên Ban / Đơn vị</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Chỉ tiêu quản lý</th>
              <th className="py-3 px-4 font-semibold text-gray-700 text-center w-40">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-gray-700 text-center w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredDepartments.map((dept) => (
              <tr key={dept.id} className={`hover:bg-blue-50/45 group transition-colors ${!dept.isActive ? 'opacity-60 bg-gray-50/40' : ''}`}>
                <td className="py-3.5 px-4 font-bold text-vna-blue">{dept.id}</td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-gray-800 block text-left">{dept.name}</span>
                </td>
                <td className="py-3.5 px-4 text-left">
                  <div className="flex flex-wrap gap-1.5 max-w-xl">
                    {dept.indicatorIds && dept.indicatorIds.length > 0 ? (
                      dept.indicatorIds.map((code) => {
                        const nameLookup = indicators.find(i => i.code === code || i.id === code)?.name || '';
                        return (
                          <Badge 
                            key={code} 
                            variant="secondary" 
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded cursor-pointer"
                            title={nameLookup}
                          >
                            {code}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-xs text-gray-400 italic">Chưa gán chỉ tiêu nào</span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  {dept.isActive ? (
                    <Badge variant="success">Hoạt động</Badge>
                  ) : (
                    <Badge variant="default">Tạm dừng</Badge>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="flex justify-center gap-1.5">
                    <button 
                      onClick={() => handleOpenEditModal(dept)}
                      className="p-1 rounded text-gray-500 hover:bg-vna-blue hover:text-white transition-colors cursor-pointer"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit size={15} />
                    </button>
                    <button 
                      onClick={(e) => toggleStatus(dept.id, e)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        dept.isActive ? 'text-amber-500 hover:bg-amber-500 hover:text-white' : 'text-emerald-500 hover:bg-emerald-500 hover:text-white'
                      }`}
                      title={dept.isActive ? "Tạm ngưng" : "Kích hoạt"}
                    >
                      {dept.isActive ? <X size={15} /> : <Check size={15} />}
                    </button>
                    <button 
                      onClick={(e) => handleDelete(dept.id, e)}
                      className="p-1 rounded text-gray-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      title="Xóa ban"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDepartments.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400 font-bold">
                  Không tìm thấy Ban nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* ADD / EDIT DEPT MODAL */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'add' ? 'Thêm mới Ban / Đơn vị' : 'Chỉnh sửa Ban / Đơn vị'}
          size="lg"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleSave}>Xác nhận Lưu</Button>
            </div>
          }
        >
          <div className="space-y-5 text-left">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-semibold text-red-600">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tên Ban / Đơn vị <span className="text-red-500">*</span></label>
              <Input 
                placeholder="Nhập tên đầy đủ của Ban/Đơn vị (VD: Ban Quản lý vật tư)..."
                value={name}
                onChange={(e) => { setName(e.target.value); setFormError(''); }}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Chỉ tiêu gán cho Ban (Phân cấp Chỉ tiêu & Form)</label>
              
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input 
                  placeholder="Tìm kiếm nhanh chỉ tiêu theo mã hoặc tên..." 
                  className="pl-9 w-full py-1.5 text-xs"
                  value={indicatorSearch}
                  onChange={(e) => setIndicatorSearch(e.target.value)}
                />
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                {/* Scrollable multi-choice list */}
                <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-150 p-2 space-y-2">
                  {(() => {
                    // Match and group indicators by code and their form name
                    const filtered = indicators.filter(ind => {
                      const code = (ind.code || ind.id || '').toLowerCase();
                      const name = (ind.name || '').toLowerCase();
                      const query = indicatorSearch.toLowerCase();
                      return code.includes(query) || name.includes(query);
                    });

                    if (filtered.length === 0) {
                      return <p className="text-xs text-gray-400 italic p-3 text-center">Không tìm thấy chỉ tiêu phù hợp</p>;
                    }

                    // Form dictionary mapping indicators to sub-forms
                    // Let's create sub-forms representing the forms where users input data
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
                      // Fallback: 1 child form representing its base sheet
                      return [
                        { id: `${indCode}-form-default`, name: `Biểu mẫu nhập số liệu ${indName}` }
                      ];
                    };

                    return filtered.map((ind) => {
                      const parentCode = ind.code || ind.id;
                      const children = getChildrenForms(parentCode, ind.name);
                      
                      // Parent is checked if ALL its children are checked
                      const isParentChecked = children.every(child => selectedIndicators.includes(child.id));
                      // Indeterminate if some children are checked
                      const isParentIndeterminate = !isParentChecked && children.some(child => selectedIndicators.includes(child.id));

                      const handleParentToggle = () => {
                        if (isParentChecked) {
                          // Uncheck all children
                          setSelectedIndicators(prev => prev.filter(id => !children.some(c => c.id === id)));
                        } else {
                          // Check all children (without duplicates)
                          setSelectedIndicators(prev => {
                            const withoutChildren = prev.filter(id => !children.some(c => c.id === id));
                            return [...withoutChildren, ...children.map(c => c.id)];
                          });
                        }
                      };

                      const handleChildToggle = (childId: string) => {
                        setSelectedIndicators(prev => 
                          prev.includes(childId) ? prev.filter(id => id !== childId) : [...prev, childId]
                        );
                      };

                      return (
                        <div key={parentCode} className="space-y-1 pb-2">
                          {/* Parent Row */}
                          <div className={`flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors ${isParentChecked ? 'bg-blue-50/20' : ''}`}>
                            <input 
                              type="checkbox"
                              checked={isParentChecked}
                              ref={el => {
                                if (el) el.indeterminate = isParentIndeterminate;
                              }}
                              onChange={handleParentToggle}
                              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-vna-blue focus:ring-vna-blue cursor-pointer"
                            />
                            <div className="flex-1">
                              <span className="text-xs font-bold text-vna-blue mr-2">[{parentCode}]</span>
                              <span className="text-xs text-gray-800 font-bold">{ind.name}</span>
                              <span className="block text-[10px] text-gray-400">Trụ cột: {ind.pillar === 'Environment' || ind.pillar === 'E' ? 'Môi trường' : ind.pillar === 'Social' || ind.pillar === 'S' ? 'Xã hội' : 'Quản trị'}</span>
                            </div>
                          </div>

                          {/* Children (Sub-forms) */}
                          <div className="pl-8 space-y-1 border-l-2 border-gray-100 ml-4">
                            {children.map(child => {
                              const isChildChecked = selectedIndicators.includes(child.id);
                              return (
                                <label 
                                  key={child.id} 
                                  className={`flex items-start gap-2.5 p-1.5 rounded hover:bg-gray-50 cursor-pointer transition-colors ${isChildChecked ? 'bg-emerald-50/20' : ''}`}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={isChildChecked}
                                    onChange={() => handleChildToggle(child.id)}
                                    className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
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

            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-gray-700">Trạng thái:</label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-gray-300 text-vna-blue focus:ring-vna-blue"
                />
                <span>Kích hoạt hoạt động (Active)</span>
              </label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
