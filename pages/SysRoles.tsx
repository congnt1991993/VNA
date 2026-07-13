import React, { useMemo, useState, useEffect } from 'react';
import { FileSpreadsheet, Plus, Save, Search, ShieldCheck } from 'lucide-react';
import { Badge, Button, Input, Modal, Table, Toast, Select } from '../components/UI';
import {
  FORM_DEFINITIONS,
  FormGrant,
  ROLE_CONFIGS,
  RoleConfig,
} from '../data/accessControl';
import { Pillar } from '../types';
import MOCK_INDICATORS from '../data/indicators_main_list.json';

const FEATURES = [
  // ĐIỀU HÀNH & THU THẬP
  { id: 'dashboard', name: 'TỔNG QUAN ĐIỀU HÀNH (Dashboard)', group: 'ĐIỀU HÀNH' },
  { id: 'data-entry', name: 'NHẬP LIỆU (Nhập số liệu báo cáo)', group: 'THU THẬP DỮ LIỆU' },

  // BÁO CÁO & CÔNG BỐ
  { id: 'esg-report', name: 'Báo cáo thường niên ESG', group: 'BÁO CÁO & CÔNG BỐ' },
  { id: 'documents', name: 'Kho tài liệu PTBV chung', group: 'BÁO CÁO & CÔNG BỐ' },
  { id: 'cms-manage', name: 'CMS Website ESG', group: 'BÁO CÁO & CÔNG BỐ' },

  // PHÂN TÍCH & CHIẾN LƯỢC
  { id: 'netzero-simulation', name: 'Mô phỏng kịch bản Net Zero', group: 'PHÂN TÍCH & CHIẾN LƯỢC' },
  { id: 'kpi-manage', name: 'Quản lý KPI', group: 'PHÂN TÍCH & CHIẾN LƯỢC' },

  // CÀI ĐẶT HỆ THỐNG
  { id: 'indicators', name: 'Danh mục chỉ tiêu', group: 'CÀI ĐẶT HỆ THỐNG' },
  // { id: 'aircrafts', name: 'Danh mục máy bay', group: 'CÀI ĐẶT HỆ THỐNG' },
  // { id: 'fuels', name: 'Danh mục nhiên liệu', group: 'CÀI ĐẶT HỆ THỐNG' },
  // { id: 'carbon-credits', name: 'Danh mục tín chỉ carbon', group: 'CÀI ĐẶT HỆ THỐNG' },
  { id: 'suppliers', name: 'Danh mục nhà cung cấp', group: 'CÀI ĐẶT HỆ THỐNG' },

  // QUẢN TRỊ HỆ THỐNG
  { id: 'data-sources', name: 'Nguồn dữ liệu & Kết nối', group: 'QUẢN TRỊ HỆ THỐNG' },
  { id: 'sys-org', name: 'Quản lý Người dùng', group: 'QUẢN TRỊ HỆ THỐNG' },
  { id: 'sys-departments', name: 'Quản lý Ban / Đơn vị', group: 'QUẢN TRỊ HỆ THỐNG' },
  { id: 'sys-roles', name: 'Phân quyền & Vai trò', group: 'QUẢN TRỊ HỆ THỐNG' },
  { id: 'settings', name: 'Cài đặt chung', group: 'QUẢN TRỊ HỆ THỐNG' },
];

const FORM_PERMISSION_COLUMNS: Array<{ key: keyof Omit<FormGrant, 'formId'>; label: string }> = [
  { key: 'view', label: 'Xem' },
  { key: 'enterCurrent', label: 'Nhập kỳ hiện tại' },
  { key: 'updateHistory', label: 'Sửa dữ liệu cũ' },
  { key: 'importExcel', label: 'Import Excel' },
  { key: 'submit', label: 'Gửi duyệt' },
  { key: 'approve', label: 'Phê duyệt' },
];

const MOCK_KPIS = [
  { id: 'GRI 302-1', name: 'Năng lượng tiêu thụ của tổ chức', pillar: 'E', formId: 'ops-flight' },
  { id: 'SAF', name: 'Tỷ lệ sử dụng nhiên liệu hàng không bền vững', pillar: 'E', formId: 'tech-ops' },
  { id: 'Airline E-1', name: 'Tiếng ồn tàu bay', pillar: 'E', formId: 'ops-atcl' },
  { id: 'Airline B-1', name: 'Mức độ hài lòng của khách hàng', pillar: 'S', formId: 'ops-service' },
  { id: 'Airline F-1', name: 'Tham gia hoạt động tình nguyện', pillar: 'S', formId: 'ops-comm' },
  { id: 'GRI 401-1', name: 'Tuyển dụng và nghỉ việc', pillar: 'S', formId: 'ops-hr' },
  { id: 'GRI 418-1', name: 'Quyền riêng tư và mất dữ liệu khách hàng', pillar: 'G', formId: 'ops-digital' },
];

export const SysRolesPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleConfig[]>(() => {
    const saved = localStorage.getItem('vna_esg_roles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    localStorage.setItem('vna_esg_roles', JSON.stringify(ROLE_CONFIGS));
    return ROLE_CONFIGS;
  });
  const [selectedRoleId, setSelectedRoleId] = useState('ROLE_ADMIN');
  const [activeTab, setActiveTab] = useState<'FEATURES' | 'FORMS' | 'KPIS'>('FEATURES');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [formSearch, setFormSearch] = useState('');
  const [pillarFilter, setPillarFilter] = useState<'ALL' | 'E' | 'S' | 'G'>('ALL');

  // New Role Form States
  const [newRoleId, setNewRoleId] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  // KPI Dynamic States
  const [kpis, setKpis] = useState<any[]>(() => {
    const saved = localStorage.getItem('vna_esg_indicators');
    if (saved) {
      try {
        const indicators = JSON.parse(saved);
        return indicators.map((ind: any) => ({
          id: ind.code || ind.id,
          name: ind.name,
          pillar: ind.pillar === 'Environment' ? 'E' : (ind.pillar === 'Social' ? 'S' : 'G'),
          formId: ind.sourceForm || 'tech-ops'
        }));
      } catch (e) { }
    }
    return MOCK_KPIS;
  });

  // Modal to add new KPI
  const [isAddKpiModalOpen, setIsAddKpiModalOpen] = useState(false);
  const [newKpiCode, setNewKpiCode] = useState('');
  const [newKpiName, setNewKpiName] = useState('');
  const [newKpiPillar, setNewKpiPillar] = useState<'E' | 'S' | 'G'>('E');
  const [newKpiFormId, setNewKpiFormId] = useState<string>('tech-ops');

  // Sync state with localStorage changes
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('vna_esg_indicators');
      if (saved) {
        try {
          const indicators = JSON.parse(saved);
          const mapped = indicators.map((ind: any) => ({
            id: ind.code || ind.id,
            name: ind.name,
            pillar: ind.pillar === 'Environment' ? 'E' : (ind.pillar === 'Social' ? 'S' : 'G'),
            formId: ind.sourceForm || 'tech-ops'
          }));
          setKpis(mapped);
        } catch (e) { }
      }
    };
    window.addEventListener('vna_indicators_updated', handleSync);
    return () => window.removeEventListener('vna_indicators_updated', handleSync);
  }, []);

  const selectedRole = roles.find(role => role.id === selectedRoleId) || roles[0];
  const isAdminRole = selectedRole.id === 'ROLE_ADMIN';
  const visibleForms = useMemo(
    () => FORM_DEFINITIONS.filter(form =>
      (pillarFilter === 'ALL' || form.pillar === pillarFilter)
      && `${form.code} ${form.name} ${form.department}`.toLowerCase().includes(formSearch.toLowerCase()),
    ),
    [formSearch, pillarFilter],
  );

  const updateSelectedRole = (updater: (role: RoleConfig) => RoleConfig) => {
    setRoles(current => {
      const updated = current.map(role => role.id === selectedRole.id ? updater(role) : role);
      localStorage.setItem('vna_esg_roles', JSON.stringify(updated));
      window.dispatchEvent(new Event('vna_roles_updated'));
      return updated;
    });
  };

  const getFeatureGrant = (featureId: string): { create: boolean; read: boolean; update: boolean; delete: boolean } => {
    if (isAdminRole) {
      return { create: true, read: true, update: true, delete: true };
    }

    const grants = (selectedRole as any).featureGrants || [];
    const found = grants.find((g: any) => g.featureId === featureId);
    if (found) {
      return {
        create: Boolean(found.create),
        read: Boolean(found.read),
        update: Boolean(found.update),
        delete: Boolean(found.delete),
      };
    }

    const hasAccess = selectedRole.featureIds.includes(featureId) || selectedRole.featureIds.includes('*');
    return {
      create: false,
      read: hasAccess,
      update: false,
      delete: false,
    };
  };

  const toggleFeaturePermission = (featureId: string, action: 'create' | 'read' | 'update' | 'delete') => {
    if (isAdminRole) return;

    updateSelectedRole(role => {
      const grants = (role as any).featureGrants || [];
      const currentGrant = grants.find((g: any) => g.featureId === featureId);

      const baseGrant = currentGrant || {
        featureId,
        create: false,
        read: role.featureIds.includes(featureId) || role.featureIds.includes('*'),
        update: false,
        delete: false,
      };

      const updatedValue = !baseGrant[action];
      const updatedGrant = { ...baseGrant, [action]: updatedValue };

      if (action !== 'read' && updatedValue) {
        updatedGrant.read = true;
      }

      if (action === 'read' && !updatedValue) {
        updatedGrant.create = false;
        updatedGrant.update = false;
        updatedGrant.delete = false;
      }

      let newFeatureIds = [...role.featureIds];
      if (updatedGrant.read) {
        if (!newFeatureIds.includes(featureId)) {
          newFeatureIds.push(featureId);
        }
      } else {
        newFeatureIds = newFeatureIds.filter(id => id !== featureId);
      }

      const newGrants = currentGrant
        ? grants.map((g: any) => g.featureId === featureId ? updatedGrant : g)
        : [...grants, updatedGrant];

      return {
        ...role,
        featureIds: newFeatureIds,
        featureGrants: newGrants
      } as any;
    });
  };

  const getGrant = (formId: string): FormGrant | undefined =>
    selectedRole.formGrants.find(grant => grant.formId === formId);

  const toggleFormPermission = (formId: FormGrant['formId'], key: keyof Omit<FormGrant, 'formId'>) => {
    if (isAdminRole) return;
    updateSelectedRole(role => {
      const currentGrant = role.formGrants.find(grant => grant.formId === formId);
      const baseGrant: FormGrant = currentGrant || {
        formId,
        view: false,
        enterCurrent: false,
        updateHistory: false,
        importExcel: false,
        submit: false,
        approve: false,
      };
      const updatedGrant = { ...baseGrant, [key]: !baseGrant[key] };
      if (key !== 'view' && updatedGrant[key]) updatedGrant.view = true;
      if (key === 'view' && !updatedGrant.view) {
        updatedGrant.enterCurrent = false;
        updatedGrant.updateHistory = false;
        updatedGrant.importExcel = false;
        updatedGrant.submit = false;
        updatedGrant.approve = false;
      }
      const formGrants = currentGrant
        ? role.formGrants.map(grant => grant.formId === formId ? updatedGrant : grant)
        : [...role.formGrants, updatedGrant];
      return { ...role, formGrants };
    });
  };

  const setAllForms = (enabled: boolean) => {
    if (isAdminRole) return;
    updateSelectedRole(role => ({
      ...role,
      formGrants: enabled
        ? FORM_DEFINITIONS.map(form => ({
          formId: form.id,
          view: true,
          enterCurrent: true,
          updateHistory: true,
          importExcel: form.supportsExcel,
          submit: true,
          approve: false,
        }))
        : [],
    }));
  };

  const toggleKpi = (kpiId: string) => {
    if (isAdminRole) return;
    updateSelectedRole(role => {
      const isAssigned = role.kpiIds.includes('*') || role.kpiIds.includes(kpiId);
      let newKpiIds = [...role.kpiIds];
      if (isAssigned) {
        newKpiIds = newKpiIds.filter(id => id !== kpiId && id !== '*');
      } else {
        newKpiIds.push(kpiId);
      }
      return { ...role, kpiIds: newKpiIds };
    });
  };

  const handleCreateKpi = () => {
    if (!newKpiCode || !newKpiName) {
      alert('Vui lòng nhập đầy đủ mã và tên chỉ tiêu!');
      return;
    }

    // Check if code already exists
    if (kpis.some(k => k.id.toLowerCase() === newKpiCode.toLowerCase())) {
      alert('Mã chỉ tiêu này đã tồn tại!');
      return;
    }

    const newKpiObj = {
      id: newKpiCode,
      name: newKpiName,
      pillar: newKpiPillar,
      formId: newKpiFormId
    };

    // 1. Update local state
    const updatedKpis = [...kpis, newKpiObj];
    setKpis(updatedKpis);

    // 2. Sync to localStorage indicators
    const saved = localStorage.getItem('vna_esg_indicators');
    let indicatorsList: any[] = [];
    if (saved) {
      try {
        indicatorsList = JSON.parse(saved);
      } catch (e) {
        indicatorsList = [...MOCK_INDICATORS];
      }
    } else {
      indicatorsList = [...MOCK_INDICATORS];
    }

    const newIndicator = {
      id: String(Date.now()),
      code: newKpiCode,
      name: newKpiName,
      pillar: newKpiPillar === 'E' ? Pillar.ENVIRONMENT : (newKpiPillar === 'S' ? Pillar.SOCIAL : Pillar.GOVERNANCE),
      topic: 'Chỉ tiêu phân bổ',
      unit: '%',
      frequency: 'Hàng tháng',
      weight: 10,
      department: FORM_DEFINITIONS.find(fd => fd.id === newKpiFormId)?.department || 'Ban Quản lý vật tư',
      sourceForm: newKpiFormId,
      programs: [],
      inputDept: FORM_DEFINITIONS.find(fd => fd.id === newKpiFormId)?.department || 'Bộ phận nghiệp vụ',
      approveDept: 'Lãnh đạo đơn vị',
      monitorDept: 'Ban Kế hoạch Phát triển',
      isActive: true,
      introduction: 'Chỉ tiêu được thêm mới trực tiếp từ giao diện Phân bổ chỉ tiêu hệ thống.'
    };

    indicatorsList.push(newIndicator);
    localStorage.setItem('vna_esg_indicators', JSON.stringify(indicatorsList));
    window.dispatchEvent(new Event('vna_indicators_updated'));

    // Reset form & close modal
    setNewKpiCode('');
    setNewKpiName('');
    setIsAddKpiModalOpen(false);
    setToast({ message: `Đã tạo mới chỉ tiêu ${newKpiCode} thành công!`, type: 'success' });
  };

  const handleCreateRole = () => {
    if (!newRoleId.trim() || !newRoleName.trim()) {
      alert('Vui lòng nhập đầy đủ mã và tên nhóm quyền!');
      return;
    }

    const cleanRoleId = newRoleId.trim().toUpperCase();
    if (roles.some(r => r.id === cleanRoleId)) {
      alert('Mã nhóm quyền này đã tồn tại!');
      return;
    }

    const newRole: RoleConfig = {
      id: cleanRoleId,
      name: newRoleName.trim(),
      description: newRoleDescription.trim(),
      featureIds: ['dashboard'],
      formGrants: FORM_DEFINITIONS.map(f => ({
        formId: f.id,
        view: false,
        enterCurrent: false,
        updateHistory: false,
        submit: false,
        approve: false,
        importExcel: false
      })),
      kpiIds: []
    };

    const updated = [...roles, newRole];
    setRoles(updated);
    localStorage.setItem('vna_esg_roles', JSON.stringify(updated));
    window.dispatchEvent(new Event('vna_roles_updated'));

    // Reset fields & close modal
    setNewRoleId('');
    setNewRoleName('');
    setNewRoleDescription('');
    setIsAddModalOpen(false);
    setSelectedRoleId(cleanRoleId);
    setToast({ message: `Đã thêm vai trò "${newRole.name}" thành công! Hãy phân quyền bên dưới.`, type: 'success' });
  };

  const assignedFormIds = new Set(selectedRole.formGrants.filter(grant => grant.view).map(grant => grant.formId));
  const availableKpis = kpis.filter(kpi => isAdminRole || assignedFormIds.has(kpi.formId as FormGrant['formId']));

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Role Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm nhóm quyền mới"
        footer={<><Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Hủy</Button><Button variant="primary" onClick={handleCreateRole}>Lưu nhóm quyền</Button></>}
      >
        <div className="space-y-4">
          <Input label="Mã nhóm quyền" placeholder="VD: ROLE_ENV_ENTRY" value={newRoleId} onChange={(e) => setNewRoleId(e.target.value)} />
          <Input label="Tên nhóm quyền" placeholder="VD: Nhập liệu Môi trường" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 text-left font-bold">Mô tả</label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-vna-blue text-sm"
              value={newRoleDescription}
              onChange={(e) => setNewRoleDescription(e.target.value)}
              placeholder="Mô tả chức năng chính của vai trò này..."
            />
          </div>
        </div>
      </Modal>

      {/* KPI Add Modal */}
      <Modal
        isOpen={isAddKpiModalOpen}
        onClose={() => setIsAddKpiModalOpen(false)}
        title="Thêm mới chỉ tiêu và phân bổ"
        footer={<><Button variant="ghost" onClick={() => setIsAddKpiModalOpen(false)}>Hủy bỏ</Button><Button variant="primary" onClick={handleCreateKpi}>Lưu chỉ tiêu</Button></>}
      >
        <div className="space-y-4 text-left">
          <Input label="Mã chỉ tiêu (KPI Code)" value={newKpiCode} onChange={(e) => setNewKpiCode(e.target.value)} placeholder="VD: GRI 305-6 hoặc Airline E-2" />
          <Input label="Tên chỉ tiêu (KPI Name)" value={newKpiName} onChange={(e) => setNewKpiName(e.target.value)} placeholder="VD: Lượng rác thải nhựa phát sinh" />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Trụ cột"
              value={newKpiPillar}
              onChange={(val) => setNewKpiPillar(val as 'E' | 'S' | 'G')}
              options={[
                { label: 'Môi trường (E)', value: 'E' },
                { label: 'Xã hội (S)', value: 'S' },
                { label: 'Quản trị (G)', value: 'G' }
              ]}
            />
            <Select
              label="Biểu mẫu nguồn (Đơn vị)"
              value={newKpiFormId}
              onChange={(val) => setNewKpiFormId(val)}
              options={FORM_DEFINITIONS.map(fd => ({ label: `${fd.code} - ${fd.name}`, value: fd.id }))}
            />
          </div>
        </div>
      </Modal>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4 text-left">
        <div>
          <h2 className="text-xl font-bold text-vna-blue">Quản lý Nhóm quyền & Vai trò</h2>
          <p className="text-sm text-black/45 mt-1">Tách biệt quyền truy cập tính năng, phạm vi form nhập liệu và chỉ tiêu ESG</p>
        </div>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="shadow-md cursor-pointer font-bold flex items-center gap-1.5">
          <Plus size={16} /> Thêm nhóm quyền
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="flex h-[680px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 p-4">
            <div className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input className="pl-10" placeholder="Tìm nhóm quyền..." /></div>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {roles.map(role => (
              <button key={role.id} onClick={() => setSelectedRoleId(role.id)} className={`w-full rounded-lg border p-3 text-left transition-colors ${selectedRole.id === role.id ? 'border-blue-200 bg-blue-50' : 'border-transparent hover:bg-gray-50'}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className={`font-semibold ${selectedRole.id === role.id ? 'text-vna-blue' : 'text-gray-800'}`}>{role.name}</span>
                  <Badge variant={role.id === 'ROLE_ADMIN' ? 'warning' : 'secondary'}>{role.formGrants.filter(grant => grant.view).length} form</Badge>
                </div>
                <p className="mt-1 text-xs text-gray-500">{role.description}</p>
                <p className="mt-2 font-mono text-[10px] text-gray-400">{role.id}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-[680px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-3">
          <div className="border-b border-gray-200 bg-gray-50 px-4 pt-4 text-left">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2"><ShieldCheck size={19} className="text-vna-gold" /><h2 className="font-bold text-gray-800">{selectedRole.name}</h2></div>
                {isAdminRole && <p className="mt-1 text-xs text-amber-700">Nhóm hệ thống: luôn có toàn quyền và không thể giới hạn form.</p>}
              </div>
              <Button variant="primary" size="sm" onClick={() => setToast({ message: 'Đã lưu cấu hình nhóm quyền thành công.', type: 'success' })}><Save size={16} /> Lưu thay đổi</Button>
            </div>
            <div className="mt-4 flex gap-5 overflow-x-auto">
              {[
                ['FEATURES', 'Phân quyền Tính năng'],
                // ['FORMS', 'Form nhập liệu'],
                // ['KPIS', 'Phân bổ Chỉ tiêu'],
              ].map(([id, label]) => (
                <button key={id} onClick={() => setActiveTab(id as typeof activeTab)} className={`whitespace-nowrap border-b-2 pb-3 text-sm font-semibold ${activeTab === id ? 'border-vna-blue text-vna-blue' : 'border-transparent text-gray-500'}`}>{label}</button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {activeTab === 'FEATURES' && (
              <Table>
                <thead className="sticky top-0 z-10 bg-white">
                  <tr>
                    <th className="text-left py-3">Nhóm chức năng</th>
                    <th className="text-left py-3">Tính năng</th>
                    <th className="text-center py-3 w-28">Xem (Read)</th>
                    <th className="text-center py-3 w-28">Thêm mới (Create)</th>
                    <th className="text-center py-3 w-28">Chỉnh sửa (Update)</th>
                    <th className="text-center py-3 w-28">Xóa (Delete)</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map(feature => {
                    const grant = getFeatureGrant(feature.id);
                    return (
                      <tr key={feature.id} className="hover:bg-slate-50/50">
                        <td className="text-xs font-bold text-gray-400 text-left">{feature.group}</td>
                        <td className="font-semibold text-gray-800 text-left">{feature.name}</td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={grant.read}
                            disabled={isAdminRole}
                            onChange={() => toggleFeaturePermission(feature.id, 'read')}
                            className="h-4 w-4 rounded text-vna-blue cursor-pointer disabled:opacity-40"
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={grant.create}
                            disabled={isAdminRole}
                            onChange={() => toggleFeaturePermission(feature.id, 'create')}
                            className="h-4 w-4 rounded text-vna-blue cursor-pointer disabled:opacity-40"
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={grant.update}
                            disabled={isAdminRole}
                            onChange={() => toggleFeaturePermission(feature.id, 'update')}
                            className="h-4 w-4 rounded text-vna-blue cursor-pointer disabled:opacity-40"
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={grant.delete}
                            disabled={isAdminRole}
                            onChange={() => toggleFeaturePermission(feature.id, 'delete')}
                            className="h-4 w-4 rounded text-vna-blue cursor-pointer disabled:opacity-40"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}

            {activeTab === 'FORMS' && (
              <div>
                <div className="flex flex-col gap-3 border-b border-gray-200 p-4 xl:flex-row xl:items-end xl:justify-between">
                  <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                    <div className="relative max-w-md flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={formSearch} onChange={event => setFormSearch(event.target.value)} placeholder="Tìm mã form, nghiệp vụ, đơn vị..." className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-vna-blue" /></div>
                    <div className="flex gap-1">{(['ALL', 'E', 'S', 'G'] as const).map(pillar => <button key={pillar} onClick={() => setPillarFilter(pillar)} className={`rounded-md border px-3 py-2 text-xs font-bold ${pillarFilter === pillar ? 'border-vna-blue bg-blue-50 text-vna-blue' : 'border-gray-200 text-gray-500'}`}>{pillar === 'ALL' ? 'Tất cả' : pillar}</button>)}</div>
                  </div>
                  {!isAdminRole && <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setAllForms(false)}>Bỏ chọn</Button><Button variant="outline" size="sm" onClick={() => setAllForms(true)}>Gán tất cả</Button></div>}
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-[1080px] w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-white">
                      <tr><th className="min-w-[260px] text-left">Biểu mẫu nghiệp vụ</th>{FORM_PERMISSION_COLUMNS.map(column => <th key={column.key} className="text-center">{column.label}</th>)}</tr>
                    </thead>
                    <tbody>
                      {visibleForms.map(form => {
                        const grant = getGrant(form.id);
                        return (
                          <tr key={form.id}>
                            <td>
                              <div className="flex items-start gap-3 text-left">
                                <div className="rounded-lg bg-blue-50 p-2 text-vna-blue"><FileSpreadsheet size={18} /></div>
                                <div><div className="font-bold text-gray-800">{form.code} - {form.name}</div><div className="text-xs text-gray-500">{form.department} · Trụ cột {form.pillar}</div></div>
                              </div>
                            </td>
                            {FORM_PERMISSION_COLUMNS.map(column => (
                              <td key={column.key} className="text-center">
                                <input type="checkbox" checked={isAdminRole || Boolean(grant?.[column.key])} disabled={isAdminRole || (column.key === 'importExcel' && !form.supportsExcel)} onChange={() => toggleFormPermission(form.id, column.key)} className="h-4 w-4 rounded text-vna-blue disabled:opacity-30 cursor-pointer" />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'KPIS' && (
              <div>
                {!isAdminRole && assignedFormIds.size === 0 && <div className="m-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 text-left">Hãy gán ít nhất một form nhập liệu trước khi phân bổ chỉ tiêu.</div>}

                {/* Header bar with Add KPI button */}
                <div className="flex justify-between items-center px-6 py-3 border-b border-gray-250 bg-gray-50/50">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chọn chỉ tiêu phân bổ quyền nộp số liệu</span>
                  <Button variant="primary" size="sm" onClick={() => setIsAddKpiModalOpen(true)}>
                    <Plus size={14} className="mr-1" /> Thêm chỉ tiêu mới
                  </Button>
                </div>

                <Table>
                  <thead className="sticky top-0 z-10 bg-white"><tr><th className="w-16 text-center">Gán</th><th>Mã KPI</th><th>Tên chỉ tiêu</th><th>Form nguồn</th><th>Trụ cột</th></tr></thead>
                  <tbody>
                    {availableKpis.map(kpi => {
                      const form = FORM_DEFINITIONS.find(item => item.id === kpi.formId);
                      const checked = isAdminRole || selectedRole.kpiIds.includes('*') || selectedRole.kpiIds.includes(kpi.id);
                      return (
                        <tr key={kpi.id}>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isAdminRole}
                              onChange={() => toggleKpi(kpi.id)}
                              className="h-4 w-4 rounded text-vna-blue cursor-pointer"
                            />
                          </td>
                          <td className="font-bold text-vna-blue text-left">{kpi.id}</td>
                          <td className="text-left font-medium text-gray-800">{kpi.name}</td>
                          <td className="text-left">{form?.name || 'Chỉ tiêu phụ'}</td>
                          <td><Badge variant={kpi.pillar === 'E' ? 'success' : kpi.pillar === 'S' ? 'primary' : 'warning'}>{kpi.pillar}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
