export type FormId =
  | 'tech-ops'
  | 'ops-flight'
  | 'ops-atcl'
  | 'ops-service'
  | 'ops-ttbsv'
  | 'ops-hr'
  | 'ops-digital'
  | 'ops-comm'
  | 'ops-planning';

export interface FormDefinition {
  id: FormId;
  code: string;
  name: string;
  department: string;
  pillar: 'E' | 'S' | 'G';
  supportsExcel: boolean;
  description: string;
}

export interface FormGrant {
  formId: FormId;
  view: boolean;
  enterCurrent: boolean;
  updateHistory: boolean;
  importExcel: boolean;
  submit: boolean;
  approve: boolean;
}

export interface RoleConfig {
  id: string;
  name: string;
  description: string;
  featureIds: string[];
  formGrants: FormGrant[];
  kpiIds: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  roleIds: string[];
}

export const FORM_DEFINITIONS: FormDefinition[] = [
  { id: 'tech-ops', code: 'KT', name: 'Quản lý vật tư', department: 'Ban Quản lý vật tư', pillar: 'E', supportsExcel: true, description: 'SAF, ReFuelEU và dữ liệu kỹ thuật tàu bay' },
  { id: 'ops-flight', code: 'KT-BAY', name: 'Điều hành khai thác', department: 'Trung tâm Điều hành khai thác', pillar: 'E', supportsExcel: true, description: 'Nhiên liệu, chuyến bay và tham số khai thác' },
  { id: 'ops-atcl', code: 'ATCL', name: 'An toàn chất lượng', department: 'Ban ATCL', pillar: 'E', supportsExcel: true, description: 'Tiếng ồn, an toàn và báo cáo chất lượng' },
  { id: 'ops-service', code: 'DVHK', name: 'Dịch vụ hành khách', department: 'Ban Dịch vụ Hành khách', pillar: 'S', supportsExcel: false, description: 'Nước, nhà cung cấp, NPS và phản hồi khách hàng' },
  { id: 'ops-ttbsv', code: 'TTBSV', name: 'Trung tâm Bông sen vàng', department: 'Trung tâm Bông sen vàng', pillar: 'S', supportsExcel: true, description: 'Hội viên, tương tác và chương trình khách hàng' },
  { id: 'ops-hr', code: 'TCNL', name: 'Tổ chức nhân lực', department: 'Ban Tổ chức nhân lực', pillar: 'S', supportsExcel: true, description: 'Nhân sự, an toàn lao động và đào tạo' },
  { id: 'ops-digital', code: 'CĐS', name: 'Ban Chuyển đổi số và Công nghệ', department: 'Ban Chuyển đổi số và Công nghệ', pillar: 'G', supportsExcel: false, description: 'Bảo mật, quyền riêng tư và mất dữ liệu' },
  { id: 'ops-comm', code: 'TT', name: 'Truyền thông', department: 'Ban Truyền thông', pillar: 'S', supportsExcel: false, description: 'Tình nguyện, cộng đồng và truyền thông ESG' },
  { id: 'ops-planning', code: 'KHPT', name: 'Kế hoạch phát triển', department: 'Ban Kế hoạch Phát triển', pillar: 'G', supportsExcel: true, description: 'Kế hoạch KPI, tổng hợp và phê duyệt' },
];

const fullGrant = (formId: FormId): FormGrant => ({
  formId,
  view: true,
  enterCurrent: true,
  updateHistory: true,
  importExcel: true,
  submit: true,
  approve: true,
});

const entryGrant = (formId: FormId, importExcel = false): FormGrant => ({
  formId,
  view: true,
  enterCurrent: true,
  updateHistory: true,
  importExcel,
  submit: true,
  approve: false,
});

export const ROLE_CONFIGS: RoleConfig[] = [
  {
    id: 'ROLE_ADMIN',
    name: 'Quản trị viên',
    description: 'Toàn quyền hệ thống và xem tất cả biểu mẫu',
    featureIds: ['*'],
    formGrants: FORM_DEFINITIONS.map(form => fullGrant(form.id)),
    kpiIds: ['*'],
  },
  {
    id: 'ROLE_APPROVER',
    name: 'Người phê duyệt ESG',
    description: 'Theo dõi, kiểm tra và phê duyệt dữ liệu các đơn vị',
    featureIds: ['dashboard', 'data-entry', 'documents', 'esg-report', 'data-approval'],
    formGrants: FORM_DEFINITIONS.map(form => ({
      ...entryGrant(form.id, form.supportsExcel),
      enterCurrent: false,
      updateHistory: false,
      submit: false,
      approve: true,
    })),
    kpiIds: ['*'],
  },
  {
    id: 'ROLE_TECH_ENTRY',
    name: 'Nhập liệu Kỹ thuật',
    description: 'Phụ trách SAF, khai thác và dữ liệu kỹ thuật',
    featureIds: ['dashboard', 'data-entry', 'documents'],
    formGrants: [entryGrant('tech-ops', true), entryGrant('ops-flight', true)],
    kpiIds: ['GRI 302-1', 'GRI 305-1', 'SAF'],
  },
  {
    id: 'ROLE_SOCIAL_ENTRY',
    name: 'Nhập liệu Xã hội',
    description: 'Phụ trách nhân sự, khách hàng và cộng đồng',
    featureIds: ['dashboard', 'data-entry', 'documents'],
    formGrants: [entryGrant('ops-service'), entryGrant('ops-ttbsv', true), entryGrant('ops-hr', true), entryGrant('ops-comm')],
    kpiIds: ['GRI 401-1', 'GRI 403-9', 'Airline F-1'],
  },
  {
    id: 'ROLE_GOV_ENTRY',
    name: 'Nhập liệu Quản trị',
    description: 'Phụ trách bảo mật, kế hoạch và quản trị',
    featureIds: ['dashboard', 'data-entry', 'documents'],
    formGrants: [entryGrant('ops-digital'), entryGrant('ops-planning', true), entryGrant('ops-atcl', true)],
    kpiIds: ['GRI 418-1', 'GRI 2-7', 'Airline E-1'],
  },
  {
    id: 'ROLE_DIGITAL_ENTRY',
    name: 'Nhập liệu Chuyển đổi số',
    description: 'Chỉ phụ trách biểu mẫu Chuyển đổi số và công nghệ',
    featureIds: ['dashboard', 'data-entry', 'documents'],
    formGrants: [entryGrant('ops-digital')],
    kpiIds: ['GRI 418-1'],
  },
  {
    id: 'ROLE_VIEWER',
    name: 'Người xem',
    description: 'Chỉ xem dashboard và dữ liệu đã công bố',
    featureIds: ['dashboard', 'documents'],
    formGrants: [],
    kpiIds: [],
  },
];

export const MOCK_USERS: UserProfile[] = [
  { id: 'admin', name: 'Nguyễn Văn Nam', email: 'nam.nv@vietnamairlines.com', department: 'Tổ Khai thác (TTĐHKT)', roleIds: ['ROLE_ADMIN'] },
  { id: 'atcl', name: 'Trần Thị Hà', email: 'ha.tt@vietnamairlines.com', department: 'Ban An toàn chất lượng (Ban ATCL)', roleIds: ['ROLE_APPROVER'] },
  { id: 'kythuat', name: 'Lê Minh Tuấn', email: 'tuan.lm@vietnamairlines.com', department: 'Tổ Kỹ thuật (Ban QLVT)', roleIds: ['ROLE_TECH_ENTRY'] },
  { id: 'bsv', name: 'Nguyễn Hoàng Anh', email: 'anh.nh@vietnamairlines.com', department: 'Trung tâm Bông Sen Vàng (TTBSV)', roleIds: ['ROLE_TECH_ENTRY'] },
  { id: 'cds', name: 'Lê Thị Thuỷ', email: 'thuy.lt@vietnamairlines.com', department: 'Ban Chuyển đổi số & CNTT', roleIds: ['ROLE_APPROVER'] },
  { id: 'dichvu', name: 'Trần Thanh Sơn', email: 'son.tt@vietnamairlines.com', department: 'Tổ Dịch vụ', roleIds: ['ROLE_TECH_ENTRY'] },
  { id: 'nhanluc', name: 'Phạm Thuỳ Linh', email: 'linh.pt@vietnamairlines.com', department: 'Ban Tổ chức Nhân lực', roleIds: ['ROLE_APPROVER'] },
  { id: 'kehoach', name: 'Nguyễn Minh Hải', email: 'hai.nm@vietnamairlines.com', department: 'Ban Kế hoạch Phát triển', roleIds: ['ROLE_ADMIN'] },
  { id: 'truyenthong', name: 'Vũ Quốc Khánh', email: 'khanh.vq@vietnamairlines.com', department: 'Ban Truyền thông', roleIds: ['ROLE_APPROVER'] }
];

export const isAdminUser = (user: UserProfile): boolean => user.roleIds.includes('ROLE_ADMIN');

export const getRole = (roleId: string): RoleConfig | undefined =>
  ROLE_CONFIGS.find(role => role.id === roleId);

export const getEffectiveFormGrants = (user: UserProfile, viewAsRoleId?: string | null): FormGrant[] => {
  const effectiveRoleIds = viewAsRoleId && isAdminUser(user) ? [viewAsRoleId] : user.roleIds;
  if (!viewAsRoleId && isAdminUser(user)) {
    return FORM_DEFINITIONS.map(form => fullGrant(form.id));
  }

  const grants = new Map<FormId, FormGrant>();
  effectiveRoleIds.forEach(roleId => {
    getRole(roleId)?.formGrants.forEach(grant => {
      const current = grants.get(grant.formId);
      grants.set(grant.formId, {
        formId: grant.formId,
        view: Boolean(current?.view || grant.view),
        enterCurrent: Boolean(current?.enterCurrent || grant.enterCurrent),
        updateHistory: Boolean(current?.updateHistory || grant.updateHistory),
        importExcel: Boolean(current?.importExcel || grant.importExcel),
        submit: Boolean(current?.submit || grant.submit),
        approve: Boolean(current?.approve || grant.approve),
      });
    });
  });
  return Array.from(grants.values()).filter(grant => grant.view);
};

export const canAccessFeature = (user: UserProfile, featureId: string, viewAsRoleId?: string | null): boolean => {
  const roleIds = viewAsRoleId && isAdminUser(user) ? [viewAsRoleId] : user.roleIds;
  return roleIds.some(roleId => {
    const role = getRole(roleId);
    return role?.featureIds.includes('*') || role?.featureIds.includes(featureId);
  });
};
