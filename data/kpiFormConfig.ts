export type InputType = 'number' | 'text' | 'textarea' | 'file';

export interface KPIField {
  id: string;
  label: string;
  type: InputType;
  placeholder?: string;
  unit?: string;
}

export interface KPIConfig {
  id: string;
  code: string;
  name: string;
  department: string;
  fields: KPIField[];
}

export const kpiConfigs: Record<string, KPIConfig> = {
  'GRI-403-9': {
    id: 'GRI-403-9',
    code: 'GRI 403-9',
    name: 'Thương tật do lao động',
    department: 'Ban Tổ chức nhân lực',
    fields: [
      { id: 'ct_4_28', label: 'Tổng số vụ tai nạn', type: 'number', unit: 'vụ' },
      { id: 'ct_4_29', label: 'Số người bị thương', type: 'number', unit: 'người' },
      { id: 'ct_4_30', label: 'Số vụ có người chết', type: 'number', unit: 'vụ' },
      { id: 'ct_4_31', label: 'Số người chết', type: 'number', unit: 'người' },
      { id: 'ct_4_32', label: 'Cơ cấu yếu tố gây chấn thương', type: 'textarea', placeholder: 'Mô tả cơ cấu...' },
      { id: 'ct_4_33', label: 'Cơ cấu nguyên nhân xảy ra tai nạn', type: 'textarea', placeholder: 'Mô tả nguyên nhân...' },
      { id: 'evidence', label: 'Tài liệu minh chứng', type: 'file' }
    ]
  },
  'GRI-418-1': {
    id: 'GRI-418-1',
    code: 'GRI 418-1',
    name: 'Vi phạm quyền riêng tư và mất dữ liệu khách hàng',
    department: 'Ban Chuyển đổi số và Công nghệ',
    fields: [
      { id: 'privacy_breach', label: 'Số vụ vi phạm quyền riêng tư', type: 'number', unit: 'vụ' },
      { id: 'data_loss', label: 'Số vụ mất dữ liệu', type: 'number', unit: 'vụ' },
      { id: 'evidence', label: 'Tài liệu minh chứng', type: 'file' }
    ]
  },
  'AIRLINE-E-1': {
    id: 'AIRLINE-E-1',
    code: 'Airline E-1',
    name: 'Tiếng ồn',
    department: 'Ban An toàn chất lượng',
    fields: [
      { id: 'noise_complaints', label: 'Số lượng khiếu nại về tiếng ồn', type: 'number', unit: 'khiếu nại' },
      { id: 'mitigation_measures', label: 'Các biện pháp giảm thiểu tiếng ồn', type: 'textarea', placeholder: 'Nhập chi tiết các biện pháp...' },
      { id: 'evidence', label: 'Tài liệu minh chứng', type: 'file' }
    ]
  },
  'SCOPE-1': {
    id: 'SCOPE-1',
    code: 'Scope 1',
    name: 'Phát thải khí nhà kính trực tiếp',
    department: 'Ban An toàn chất lượng',
    fields: [
      { id: 'fuel_consumed', label: 'Lượng nhiên liệu tiêu thụ', type: 'number', unit: 'tấn' },
      { id: 'co2_emitted', label: 'Lượng phát thải CO2 tương đương', type: 'number', unit: 'tấn CO2e' },
      { id: 'evidence', label: 'Tài liệu minh chứng', type: 'file' }
    ]
  },
  'AIRLINE-B-2': {
    id: 'AIRLINE-B-2',
    code: 'Airline B-2',
    name: 'Tương tác khách hàng',
    department: 'Trung tâm Bông sen vàng',
    fields: [
      { id: 'active_members', label: 'Số lượng hội viên Active', type: 'number', unit: 'hội viên' },
      { id: 'positive_feedback', label: 'Tỷ lệ phản hồi tích cực', type: 'number', unit: '%' },
      { id: 'evidence', label: 'Báo cáo chi tiết', type: 'file' }
    ]
  },
  'GRI-202-1': {
    id: 'GRI-202-1',
    code: 'GRI 202-1',
    name: 'Tỷ lệ lương khởi điểm tiêu chuẩn so với lương tối thiểu địa phương',
    department: 'Ban Tổ chức nhân lực',
    fields: [
      { id: 'entry_wage_male', label: 'Lương khởi điểm nam (VND)', type: 'number', unit: 'VND' },
      { id: 'entry_wage_female', label: 'Lương khởi điểm nữ (VND)', type: 'number', unit: 'VND' },
      { id: 'local_min_wage', label: 'Lương tối thiểu vùng (VND)', type: 'number', unit: 'VND' },
      { id: 'evidence', label: 'Tài liệu minh chứng', type: 'file' }
    ]
  },
  'AIRLINE-F-1': {
    id: 'AIRLINE-F-1',
    code: 'Airline F-1',
    name: 'Hoạt động tình nguyện và đóng góp cộng đồng',
    department: 'Ban Truyền thông',
    fields: [
      { id: 'volunteer_hours', label: 'Tổng số giờ tình nguyện', type: 'number', unit: 'giờ' },
      { id: 'community_funding', label: 'Tổng quỹ đóng góp', type: 'number', unit: 'VND' },
      { id: 'description', label: 'Mô tả các chương trình nổi bật', type: 'textarea', placeholder: 'Nêu các hoạt động thiện nguyện...' },
      { id: 'evidence', label: 'Hình ảnh / Báo cáo', type: 'file' }
    ]
  },
  'KHPT-1': {
    id: 'KHPT-1',
    code: 'KHPT Định tính',
    name: 'Báo cáo tường thuật các chỉ tiêu định tính ESG',
    department: 'Ban Kế hoạch Phát triển',
    fields: [
      { id: 'report_title', label: 'Tiêu đề báo cáo', type: 'text', placeholder: 'Nhập tiêu đề...' },
      { id: 'report_summary', label: 'Tóm tắt nội dung chính', type: 'textarea', placeholder: 'Mô tả tóm tắt...' },
      { id: 'report_file', label: 'File báo cáo chi tiết', type: 'file' }
    ]
  }
};
