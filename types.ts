export type PageName = 
  // NHÓM 1: TỔNG QUAN & KPI
  | 'dashboard' 
  | 'dashboard-tech'
  | 'dashboard-flight'
  | 'dashboard-service'
  | 'dashboard-gov'
  | 'data-entry'
  | 'kpi-manage'
  | 'kpi-targets' 
  | 'kpi-performance'

  // NHÓM 2: KẾ HOẠCH NETZERO
  | 'netzero-simulation'
  | 'netzero-comparison'
  | 'netzero-reports'

  // NHÓM 3: QUẢN TRỊ DỮ LIỆU & CẤU HÌNH (NEW)
  | 'data-sources'
  | 'data-warehouse-raw'   // Modified

  // NHÓM 4: VẬN HÀNH DỮ LIỆU
  | 'esg-data-analysis' // MERGED: Thu thập & Phê duyệt
  | 'data-logs'

  // NHÓM 5: BÁO CÁO & CÔNG BỐ
  | 'report-env'
  | 'report-soc'
  | 'report-gov'
  | 'publishing' // Consolidated Page
  | 'esg-report'
  | 'documents'
  | 'report-drafting' // NEW: Soạn thảo báo cáo
  | 'report-pending' // NEW: Chờ phê duyệt
  | 'report-approved' // NEW: Đã phê duyệt
  | 'document-approval' // NEW: Phê duyệt yêu cầu tài liệu
  | 'cms-manage' // NEW: Quản lý nội dung CMS

  // NHÓM 6: CẤU HÌNH HỆ THỐNG & DANH MỤC
  | 'indicators' 
  | 'countries'
  | 'airports'
  | 'aircrafts'
  | 'fuels'
  | 'suppliers'
  | 'flights'
  | 'formulas' 
  | 'sys-org' // NEW: Quản lý Cơ cấu tổ chức
  | 'sys-departments' // NEW: Quản lý Ban / Đơn vị
  | 'sys-accounts'
  | 'sys-roles'
  | 'sys-forms' // NEW: Quản lý biểu mẫu
  | 'settings'
  | 'alerts-manage'
  | 'carbon-credits'
  | 'tech-ops'
  | 'ops-flight'
  | 'ops-atcl'
  | 'ops-service'
  | 'ops-ttbsv'
  | 'ops-hr'
  | 'ops-digital'
  | 'ops-comm'
  | 'ops-planning'
  | 'sys-logs'
  | 'login';

export enum Pillar {
  ENVIRONMENT = 'Environment',
  SOCIAL = 'Social',
  GOVERNANCE = 'Governance',
}

export enum Status {
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PENDING = 'Pending',
  SUBMITTED = 'Submitted',
  DRAFT = 'Draft',
}

export interface EsgIndicator {
  id: string;
  code: string;
  name: string;
  pillar: Pillar;
  unit: string;
  frequency: string;
  status: Status;
  program: string[]; // CORSIA, EU ETS, etc.
  department: string;
}

export interface SimulationParameter {
  code: string;
  name: string;
  defaultValue: number;
  unit: string;
}

export interface Formula {
  id: string;
  code: string; // Mã công thức (VD: CALC_ENERGY_V1)
  name: string; // Tên công thức
  version: string; // Phiên bản (VD: 2.0)
  type: 'Calculation' | 'Simulation'; // Loại
  status: 'Active' | 'Draft'; // Trạng thái
  expression: string;
  appliedTo: string[]; // List mã chỉ tiêu (GRI 302-1, etc.)
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  description?: string; // Mô tả chi tiết
  simulationParams?: SimulationParameter[]; // Tham số giả định cho mô phỏng
}

export interface IntegrationLog {
  id: string;
  timestamp: string;
  source: string;
  status: 'Success' | 'Running' | 'Failed';
  recordsProcessed: number;
}

export interface DataRecord {
  id: string;
  indicatorName: string;
  value: number;
  unit: string;
  period: string;
  source: 'Integrated' | 'Manual';
  status: Status;
}

export interface KPI {
  id: string;
  indicator: string;
  unit: string;
  target: number;
  actual: number;
  period: string;
}

export interface Document {
  id: string;
  code: string; // Added code
  name: string;
  type: 'PDF' | 'Excel' | 'Word' | 'Image' | 'Other'; // Restricted types
  size: string;
  uploadDate: string;
  uploadedBy: string; // Added uploader
  tags: string[];
  isPublic: boolean;
  description?: string; // Added description
  version: string; // Added version
}

export interface FormField {
  id: string;
  name: string;
  description?: string;
  dataType: 'String' | 'Number' | 'Date' | 'Boolean';
  inputType: 'Text' | 'NumberInput' | 'Combobox' | 'Datepicker' | 'Checkbox';
  optionsValue?: string; // Ví dụ: "VNA, VASCO, Pacific Airlines"
}

export interface SystemForm {
  id: string;
  name: string;
  indicatorId: string;
  indicatorName: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string; // Ngày chỉnh sửa
  updatedBy?: string; // Người chỉnh sửa
  description?: string;
  fields?: FormField[]; // Các trường dữ liệu động
}
