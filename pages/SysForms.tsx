import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Modal, Input, Select, SelectOption, TextArea, Toast } from '../components/UI';
import { Plus, Search, Edit2, Trash2, FileText, Save, Trash, Eye, Settings, Clock, UserCheck } from 'lucide-react';
import { SystemForm, FormField } from '../types';

// Mock Data cho Tiêu chí (GRI Indicators)
const INDICATOR_OPTIONS: SelectOption[] = [
  { label: 'GRI 302-1: Năng lượng tiêu thụ của tổ chức (E)', value: 'GRI 302-1' },
  { label: 'GRI 305-1: Phát thải khí nhà kính trực tiếp (E)', value: 'GRI 305-1' },
  { label: 'GRI 305-2: Phát thải khí nhà kính gián tiếp (E)', value: 'GRI 305-2' },
  { label: 'GRI 401-1: Tuyển dụng mới và tỷ lệ nghỉ việc (S)', value: 'GRI 401-1' },
  { label: 'GRI 403-9: Tai nạn lao động thương tích (S)', value: 'GRI 403-9' },
  { label: 'GRI 2-9: Cơ cấu quản trị và thành phần hội đồng (G)', value: 'GRI 2-9' },
  { label: 'GRI 2-27: Tuân thủ luật pháp và quy định (G)', value: 'GRI 2-27' },
];

const DATATYPE_OPTIONS: SelectOption[] = [
  { label: 'String (Văn bản)', value: 'String' },
  { label: 'Number (Số học)', value: 'Number' },
  { label: 'Date (Ngày tháng)', value: 'Date' },
  { label: 'Boolean (Đúng/Sai)', value: 'Boolean' },
];

const INPUTTYPE_OPTIONS: SelectOption[] = [
  { label: 'Text Input (Ô nhập chữ)', value: 'Text' },
  { label: 'Number Input (Ô nhập số)', value: 'NumberInput' },
  { label: 'Combobox (Danh sách chọn)', value: 'Combobox' },
  { label: 'Datepicker (Chọn ngày)', value: 'Datepicker' },
  { label: 'Checkbox (Hộp kiểm)', value: 'Checkbox' },
];

const MOCK_FORMS: SystemForm[] = [
  {
    id: 'FORM-001',
    name: 'Biểu mẫu kê khai nhiên liệu bay Jet A1',
    indicatorId: 'GRI 302-1',
    indicatorName: 'GRI 302-1: Năng lượng tiêu thụ của tổ chức (E)',
    createdAt: '12/05/2026',
    createdBy: 'Trần Văn Hoàng',
    updatedAt: '02/06/2026',
    updatedBy: 'Lê Hồng Hà',
    description: 'Biểu mẫu thu thập dữ liệu tiêu thụ nhiên liệu hàng tháng của các đội bay.',
    fields: [
      { id: '1', name: 'Đội bay', description: 'Đơn vị khai thác bay', dataType: 'String', inputType: 'Combobox', optionsValue: 'Boeing 787, Airbus A350, Airbus A321' },
      { id: '2', name: 'Sản lượng tiêu thụ (Tấn)', description: 'Tổng khối lượng nhiên liệu tiêu hao', dataType: 'Number', inputType: 'NumberInput' },
      { id: '3', name: 'Ngày ghi nhận', description: 'Ngày nạp nhiên liệu', dataType: 'Date', inputType: 'Datepicker' }
    ]
  },
  {
    id: 'FORM-002',
    name: 'Biểu mẫu thống kê phát thải khí nhà kính trực tiếp',
    indicatorId: 'GRI 305-1',
    indicatorName: 'GRI 305-1: Phát thải khí nhà kính trực tiếp (E)',
    createdAt: '18/05/2026',
    createdBy: 'Nguyễn Thị Minh',
    updatedAt: '12/06/2026',
    updatedBy: 'Trần Văn Hoàng',
    description: 'Thống kê lượng phát thải CO2 trực tiếp từ hoạt động đốt nhiên liệu tĩnh và động.',
    fields: [
      { id: '1', name: 'Nguồn phát thải', description: 'Tên lò đốt hoặc phương tiện', dataType: 'String', inputType: 'Text' },
      { id: '2', name: 'Loại nhiên liệu', description: 'Nhiên liệu đầu vào', dataType: 'String', inputType: 'Combobox', optionsValue: 'Xăng RON 95, Dầu Diesel, Jet A1' },
      { id: '3', name: 'Lượng phát thải CO2 quy đổi (Tấn)', description: 'Khối lượng CO2 tương đương phát thải', dataType: 'Number', inputType: 'NumberInput' }
    ]
  }
];

export const SysFormsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  
  const [forms, setForms] = useState<SystemForm[]>(MOCK_FORMS);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<SystemForm | null>(null);
  
  // Form Info State
  const [formName, setFormName] = useState('');
  const [formIndicator, setFormIndicator] = useState('');
  const [formCreator, setFormCreator] = useState('Trần Văn Hoàng');
  const [formUpdater, setFormUpdater] = useState('Trần Văn Hoàng');
  const [formDesc, setFormDesc] = useState('');
  
  // Dynamic Fields State
  const [dynamicFields, setDynamicFields] = useState<FormField[]>([]);
  const [errors, setErrors] = useState<{ name?: string; indicatorId?: string; fields?: string }>({});
  
  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<SystemForm | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleOpenAdd = () => {
    setEditingForm(null);
    setFormName('');
    setFormIndicator('');
    setFormCreator('Trần Văn Hoàng');
    setFormUpdater('Trần Văn Hoàng');
    setFormDesc('');
    setDynamicFields([]);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (form: SystemForm) => {
    setEditingForm(form);
    setFormName(form.name);
    setFormIndicator(form.indicatorId);
    setFormCreator(form.createdBy);
    setFormUpdater(form.updatedBy || 'Trần Văn Hoàng');
    setFormDesc(form.description || '');
    setDynamicFields(form.fields ? [...form.fields] : []);
    setErrors({});
    setIsModalOpen(true);
  };

  // Add a new blank field configuration to the dynamic fields array
  const handleAddField = () => {
    const newField: FormField = {
      id: `FIELD-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      name: '',
      description: '',
      dataType: 'String',
      inputType: 'Text',
      optionsValue: ''
    };
    setDynamicFields([...dynamicFields, newField]);
  };

  // Update a specific field attribute by ID
  const handleUpdateField = (id: string, key: keyof FormField, value: any) => {
    setDynamicFields(dynamicFields.map(field => {
      if (field.id === id) {
        const updated = { ...field, [key]: value };
        // Reset optionsValue if changed away from Combobox to save space
        if (key === 'inputType' && value !== 'Combobox') {
          updated.optionsValue = '';
        }
        return updated;
      }
      return field;
    }));
  };

  // Remove a field from configuration
  const handleRemoveField = (id: string) => {
    setDynamicFields(dynamicFields.filter(field => field.id !== id));
  };

  const handleSave = () => {
    // Basic validations
    const newErrors: { name?: string; indicatorId?: string; fields?: string } = {};
    if (!formName.trim()) {
      newErrors.name = isEn ? 'Form name cannot be empty' : 'Tên biểu mẫu không được để trống';
    }
    if (!formIndicator) {
      newErrors.indicatorId = isEn ? 'Please select a sustainability indicator' : 'Vui lòng chọn tiêu chí liên kết';
    }

    // Check for empty field names
    const hasEmptyFieldName = dynamicFields.some(f => !f.name.trim());
    if (hasEmptyFieldName) {
      newErrors.fields = isEn ? 'Field names cannot be empty' : 'Tên của các trường dữ liệu không được để trống';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.fields) {
        showToast(newErrors.fields, 'error');
      }
      return;
    }

    const selectedIndicator = INDICATOR_OPTIONS.find(opt => opt.value === formIndicator);
    const indicatorName = selectedIndicator ? selectedIndicator.label : formIndicator;

    if (editingForm) {
      // Edit Mode
      const updated = forms.map(f => {
        if (f.id === editingForm.id) {
          return {
            ...f,
            name: formName.trim(),
            indicatorId: formIndicator,
            indicatorName: indicatorName,
            createdBy: formCreator.trim(),
            updatedAt: new Date().toLocaleDateString('vi-VN'),
            updatedBy: formUpdater.trim() || 'Trần Văn Hoàng',
            description: formDesc.trim(),
            fields: dynamicFields
          };
        }
        return f;
      });
      setForms(updated);
      showToast(isEn ? 'Form template with custom fields saved successfully!' : 'Đã cập nhật biểu mẫu kèm các trường động thành công!', 'success');
    } else {
      // Add Mode
      const newForm: SystemForm = {
        id: `FORM-${Math.floor(100 + Math.random() * 900)}`,
        name: formName.trim(),
        indicatorId: formIndicator,
        indicatorName: indicatorName,
        createdAt: new Date().toLocaleDateString('vi-VN'),
        createdBy: formCreator.trim() || 'Admin',
        updatedAt: '-',
        updatedBy: '-',
        description: formDesc.trim(),
        fields: dynamicFields
      };
      setForms([newForm, ...forms]);
      showToast(isEn ? 'New dynamic form template created successfully!' : 'Đã tạo mới biểu mẫu động thành công!', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const confirmMsg = isEn 
      ? `Are you sure you want to delete form template "${name}"?` 
      : `Bạn có chắc chắn muốn xóa biểu mẫu "${name}"?`;
      
    if (window.confirm(confirmMsg)) {
      setForms(forms.filter(f => f.id !== id));
      showToast(isEn ? 'Form template deleted successfully!' : 'Đã xóa biểu mẫu thành công!', 'error');
    }
  };

  const handleOpenPreview = (form: SystemForm) => {
    setPreviewForm(form);
    setIsPreviewOpen(true);
  };

  const filteredForms = forms.filter(f => 
    f.name.toLowerCase().includes(searchText.toLowerCase()) ||
    f.id.toLowerCase().includes(searchText.toLowerCase()) ||
    f.indicatorId.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-vna-blue">
            {isEn ? 'Form Template Management' : 'Quản lý biểu mẫu'}
          </h2>
          <p className="text-xs text-black/45 mt-1">
            {isEn ? 'Design dynamic custom fields mapping one-on-one with ESG indicators' : 'Thiết kế các trường nhập liệu động gán tỷ lệ 1-1 với tiêu chí báo cáo ESG'}
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="shadow-lg">
          <Plus size={16} /> {isEn ? 'Add Form Template' : 'Thêm biểu mẫu'}
        </Button>
      </div>

      {/* Filters search */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={isEn ? 'Search by form name, code or indicator...' : 'Tìm kiếm theo tên biểu mẫu, mã biểu mẫu hoặc tiêu chí...'}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-vna-blue outline-none"
          />
        </div>
      </div>

      {/* Data Table */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-800 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold text-xs w-12 text-center text-gray-700">{isEn ? 'No.' : 'STT'}</th>
                <th className="p-4 font-bold text-xs w-28 text-gray-700">{isEn ? 'Form Code' : 'Mã biểu mẫu'}</th>
                <th className="p-4 font-bold text-xs text-gray-700">{isEn ? 'Form Name' : 'Tên biểu mẫu'}</th>
                <th className="p-4 font-bold text-xs text-gray-700">{isEn ? 'Linked Indicator' : 'Tiêu chí liên kết'}</th>
                <th className="p-4 font-bold text-xs w-36 text-center text-gray-700">{isEn ? 'Fields Count' : 'Số lượng trường'}</th>
                <th className="p-4 font-bold text-xs w-28 text-gray-700">{isEn ? 'Created Date' : 'Ngày lập'}</th>
                <th className="p-4 font-bold text-xs w-32 text-gray-700">{isEn ? 'Created By' : 'Người lập'}</th>
                <th className="p-4 font-bold text-xs w-28 text-gray-700">{isEn ? 'Updated Date' : 'Ngày sửa'}</th>
                <th className="p-4 font-bold text-xs w-32 text-gray-700">{isEn ? 'Updated By' : 'Người sửa'}</th>
                <th className="p-4 font-bold text-xs w-36 text-center text-gray-700">{isEn ? 'Actions' : 'Thao tác'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredForms.map((form, idx) => (
                <tr key={form.id} className="hover:bg-blue-50/40 group transition-colors">
                  <td className="p-4 text-xs text-black/45 text-center">{idx + 1}</td>
                  <td className="p-4 text-xs font-mono font-bold text-vna-blue">{form.id}</td>
                  <td className="p-4">
                    <div className="text-xs font-bold text-black/85 group-hover:text-vna-blue transition-colors">
                      {form.name}
                    </div>
                    {form.description && (
                      <div className="text-[10px] text-black/40 mt-0.5 line-clamp-1">
                        {form.description}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-sky-50 border border-sky-100 text-sky-800">
                      <FileText size={12} className="text-sky-600" />
                      {form.indicatorName}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800">
                      {form.fields ? form.fields.length : 0} {isEn ? 'fields' : 'trường'}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-600">{form.createdAt}</td>
                  <td className="p-4 text-xs text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                        {form.createdBy.charAt(0)}
                      </div>
                      <span className="truncate max-w-[100px]">{form.createdBy}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock size={12} className="text-gray-400" />
                      {form.updatedAt || '-'}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-gray-700">
                    {form.updatedBy && form.updatedBy !== '-' ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-[10px] font-bold">
                          {form.updatedBy.charAt(0)}
                        </div>
                        <span className="truncate max-w-[100px]">{form.updatedBy}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenPreview(form)}
                        className="p-1 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title={isEn ? 'Preview Form' : 'Xem trước Biểu mẫu'}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(form)}
                        className="p-1 rounded text-gray-400 hover:text-vna-blue hover:bg-gray-100 transition-colors"
                        title={isEn ? 'Edit template' : 'Sửa biểu mẫu'}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(form.id, form.name)}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title={isEn ? 'Delete template' : 'Xóa biểu mẫu'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredForms.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-400 italic text-xs">
                    {isEn ? 'No forms matching query' : 'Không tìm thấy biểu mẫu phù hợp'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Form Editor Modal (Add/Edit) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingForm ? (isEn ? 'Edit Form Template' : 'Chỉnh sửa cấu hình biểu mẫu') : (isEn ? 'Add Form Template' : 'Thiết kế biểu mẫu mới')}
        size="lg" // Larger modal to handle fields layout comfortably
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-xs">
              {isEn ? 'Cancel' : 'Hủy bỏ'}
            </Button>
            <Button onClick={handleSave} className="text-xs gap-1.5">
              <Save size={14} /> {isEn ? 'Save Template' : 'Lưu biểu mẫu'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[70vh]">
          
          {/* Left Column: Form Base Settings */}
          <div className="lg:col-span-4 space-y-4 border-r border-gray-100 pr-0 lg:pr-6">
            <h4 className="text-xs font-bold text-vna-blue uppercase tracking-wider">{isEn ? 'Basic Information' : 'Thông tin cơ bản'}</h4>
            <Input
              label={isEn ? 'Form Name' : 'Tên biểu mẫu'}
              placeholder={isEn ? 'e.g. Flight Fuel Consumption Report' : 'Ví dụ: Báo cáo tiêu hao nhiên liệu bay'}
              value={formName}
              onChange={e => setFormName(e.target.value)}
              error={errors.name}
              className="text-xs"
              required
            />

            <Select
              label={isEn ? 'Linked ESG Indicator (1-1)' : 'Tiêu chí liên kết (1-1)'}
              options={INDICATOR_OPTIONS}
              value={formIndicator}
              onChange={setFormIndicator}
              placeholder={isEn ? 'Choose indicator...' : 'Chọn tiêu chí báo cáo...'}
              error={errors.indicatorId}
              required
            />

            <Input
              label={isEn ? 'Created By' : 'Người lập'}
              value={formCreator}
              onChange={e => setFormCreator(e.target.value)}
              className="text-xs"
            />

            {editingForm && (
              <Input
                label={isEn ? 'Updated By' : 'Người chỉnh sửa'}
                value={formUpdater}
                onChange={e => setFormUpdater(e.target.value)}
                className="text-xs animate-in fade-in duration-200"
              />
            )}

            <TextArea
              label={isEn ? 'Description' : 'Mô tả / Ghi chú'}
              placeholder={isEn ? 'Provide form scope or input instructions...' : 'Nhập hướng dẫn nhập liệu hoặc phạm vi biểu mẫu...'}
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              rows={3}
              className="text-xs"
            />
          </div>

          {/* Right Column: Dynamic Form Fields Designer */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-[350px]">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-vna-blue uppercase tracking-wider">
                {isEn ? 'Design Form Fields' : 'Cấu trúc trường nhập liệu'}
              </h4>
              <Button type="button" variant="outline" onClick={handleAddField} className="text-xs py-1 px-2.5 gap-1 text-[#005f6e] border-[#005f6e] hover:bg-sky-50">
                <Plus size={13} /> {isEn ? 'Add Field' : 'Thêm trường'}
              </Button>
            </div>

            {/* List of Dynamic Fields */}
            <div className="flex-grow overflow-y-auto space-y-3 pr-2 border border-gray-200 rounded-lg p-3 bg-gray-50/50 max-h-[450px]">
              {dynamicFields.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center text-gray-400 gap-2 border border-dashed border-gray-300 rounded bg-white">
                  <Settings size={28} className="text-gray-300" />
                  <p className="text-xs font-bold">{isEn ? 'No fields configured yet' : 'Chưa thiết kế trường dữ liệu nào'}</p>
                  <p className="text-[10px] text-gray-400 max-w-[200px]">{isEn ? 'Click "Add Field" to begin designing your dynamic form fields' : 'Vui lòng nhấn "+ Thêm trường" để bắt đầu thiết kế cấu trúc biểu mẫu động'}</p>
                </div>
              ) : (
                dynamicFields.map((field, index) => (
                  <div key={field.id} className="p-3 bg-white border border-gray-200 rounded-lg shadow-xs hover:border-gray-300 relative group transition-all">
                    
                    {/* Index Badge & Remove button */}
                    <div className="flex justify-between items-center mb-2.5 border-b border-gray-100 pb-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {isEn ? `Field #${index + 1}` : `Trường nhập liệu #${index + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title={isEn ? 'Remove field' : 'Xóa trường này'}
                      >
                        <Trash size={13} />
                      </button>
                    </div>

                    {/* Inputs Layout grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2.5">
                      <Input
                        label={isEn ? 'Field Name' : 'Tên trường'}
                        placeholder={isEn ? 'e.g. Fuel Volume' : 'Ví dụ: Sản lượng dầu'}
                        value={field.name}
                        onChange={e => handleUpdateField(field.id, 'name', e.target.value)}
                        className="text-xs"
                        required
                      />
                      <Input
                        label={isEn ? 'Description' : 'Mô tả / Gợi ý'}
                        placeholder={isEn ? 'e.g. Enter value in metric tons' : 'Ví dụ: Nhập sản lượng quy đổi Tấn'}
                        value={field.description || ''}
                        onChange={e => handleUpdateField(field.id, 'description', e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{isEn ? 'Data Type' : 'Kiểu dữ liệu'}</label>
                        <Select
                          options={DATATYPE_OPTIONS}
                          value={field.dataType}
                          onChange={val => handleUpdateField(field.id, 'dataType', val)}
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{isEn ? 'Input Component' : 'Thành phần nhập liệu'}</label>
                        <Select
                          options={INPUTTYPE_OPTIONS}
                          value={field.inputType}
                          onChange={val => handleUpdateField(field.id, 'inputType', val)}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    {/* Options list for Combobox input type (Values separated by comma) */}
                    {field.inputType === 'Combobox' && (
                      <div className="mt-3 p-3 bg-amber-50/50 rounded border border-amber-100 animate-in slide-in-from-top-1.5 duration-200">
                        <Input
                          label={isEn ? 'Combobox Values (separated by comma "," )' : 'Các giá trị Combobox (ngăn cách nhau bằng dấu phẩy "," )'}
                          placeholder="Ví dụ: VNA, Pacific Airlines, VASCO"
                          value={field.optionsValue || ''}
                          onChange={e => handleUpdateField(field.id, 'optionsValue', e.target.value)}
                          className="text-xs bg-white"
                          required
                        />
                        <p className="text-[9px] text-amber-600 font-medium mt-1">
                          * {isEn ? 'Fill options for user dropdown list, split options by comma.' : 'Liệt kê các giá trị hiển thị trong danh sách chọn, ngăn cách mỗi lựa chọn bằng dấu phẩy.'}
                        </p>
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </Modal>

      {/* Dynamic Form Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`${isEn ? 'Preview Form' : 'Xem trước Biểu mẫu'}: ${previewForm?.name || ''}`}
        footer={
          <Button onClick={() => setIsPreviewOpen(false)} className="text-xs">
            {isEn ? 'Close Preview' : 'Đóng xem trước'}
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
              {isEn ? 'INTERACTIVE LIVE PREVIEW' : 'CHẾ ĐỘ XEM TRƯỚC TƯƠNG TÁC'}
            </span>
            <p className="text-xs text-black/45 mt-2.5">
              {isEn 
                ? 'This shows how the dynamic form fields you configured will display to users in the Data Entry Workspace.'
                : 'Dưới đây hiển thị cách các trường dữ liệu động bạn đã thiết kế hiển thị trực quan trong khu vực làm việc Nhập Liệu.'}
            </p>
          </div>

          <form onSubmit={e => e.preventDefault()} className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-200">
            {previewForm?.fields && previewForm.fields.length > 0 ? (
              previewForm.fields.map(field => {
                return (
                  <div key={field.id} className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      {field.name}
                      {field.description && (
                        <span className="text-[10px] text-gray-400 font-normal">({field.description})</span>
                      )}
                    </label>

                    {/* Render input elements dynamically based on type */}
                    {field.inputType === 'Text' && (
                      <input 
                        type="text" 
                        placeholder={isEn ? 'Enter text value...' : 'Nhập nội dung văn bản...'} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-vna-blue bg-white text-gray-900"
                      />
                    )}

                    {field.inputType === 'NumberInput' && (
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-vna-blue bg-white text-gray-900"
                      />
                    )}

                    {field.inputType === 'Datepicker' && (
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-vna-blue bg-white text-gray-900"
                      />
                    )}

                    {field.inputType === 'Checkbox' && (
                      <label className="flex items-center gap-2 mt-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded text-vna-blue focus:ring-vna-blue cursor-pointer"
                        />
                        <span className="text-xs text-gray-600">{isEn ? 'Yes / Enabled' : 'Có / Bật'}</span>
                      </label>
                    )}

                    {field.inputType === 'Combobox' && (
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-vna-blue bg-white text-gray-700">
                        <option value="">{isEn ? '-- Select option --' : '-- Chọn giá trị --'}</option>
                        {field.optionsValue && field.optionsValue.split(',').map((opt, oIdx) => (
                          <option key={oIdx} value={opt.trim()}>{opt.trim()}</option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-400 italic text-xs">
                {isEn ? 'No input fields defined for this form template.' : 'Biểu mẫu này chưa thiết kế bất cứ trường nhập liệu nào.'}
              </div>
            )}
            
            {previewForm?.fields && previewForm.fields.length > 0 && (
              <div className="pt-3 border-t border-gray-200 flex justify-end">
                <Button type="button" disabled className="text-xs opacity-65 cursor-not-allowed">
                  {isEn ? 'Submit data (Disabled in Preview)' : 'Gửi số liệu (Bị tắt ở Xem trước)'}
                </Button>
              </div>
            )}
          </form>
        </div>
      </Modal>

    </div>
  );
};
