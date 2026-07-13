import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Select, Badge, Table, Modal, Toast } from '../components/UI';
import { useAccess } from '../components/AccessContext';
import { Plus, Search, Calendar, ShieldCheck, Globe, Building2, Check, X, Info, Edit, Trash2, ArrowLeft } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  countryType: 'VN' | 'Foreign';
  contractFrom: string;
  contractTo: string;
  hasSustCommitment: boolean;
  sustDescription: string;
  sustEffectiveDate: string;
  isActive: boolean;
}

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Công ty Cổ phần Nhiên liệu bay Petrolimex (Petrolimex Aviation)',
    countryType: 'VN',
    contractFrom: '2025-01-01',
    contractTo: '2027-12-31',
    hasSustCommitment: true,
    sustDescription: 'Cam kết cung ứng tối thiểu 5% nhiên liệu bay bền vững (SAF) tại sân bay Tân Sơn Nhất và Nội Bài kể từ năm 2026.',
    sustEffectiveDate: '2025-06-01',
    isActive: true
  },
  {
    id: 'SUP-002',
    name: 'Shell Aviation International',
    countryType: 'Foreign',
    contractFrom: '2024-03-15',
    contractTo: '2027-03-15',
    hasSustCommitment: true,
    sustDescription: 'Hỗ trợ kỹ thuật chứng nhận bền vững ISCC đối với các lô hàng SAF pha trộn cung ứng cho đội bay VNA tại thị trường Châu Âu.',
    sustEffectiveDate: '2024-10-01',
    isActive: true
  },
  {
    id: 'SUP-003',
    name: 'Công ty TNHH MTV Nhiên liệu hàng không Skypec',
    countryType: 'VN',
    contractFrom: '2025-01-01',
    contractTo: '2026-12-31',
    hasSustCommitment: true,
    sustDescription: 'Cam kết giảm 15% dấu chân carbon (carbon footprint) trong khâu vận hành tiếp nạp nhiên liệu tại sân bay nội địa đến hết năm 2026.',
    sustEffectiveDate: '2025-05-15',
    isActive: true
  },
  {
    id: 'SUP-004',
    name: 'Skytanking Holding GmbH',
    countryType: 'Foreign',
    contractFrom: '2025-06-01',
    contractTo: '2026-05-31',
    hasSustCommitment: false,
    sustDescription: '',
    sustEffectiveDate: '',
    isActive: true
  }
];

export const SuppliersPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [commitmentFilter, setCommitmentFilter] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [countryType, setCountryType] = useState<'VN' | 'Foreign'>('VN');
  const [contractFrom, setContractFrom] = useState('');
  const [contractTo, setContractTo] = useState('');
  const [hasSustCommitment, setHasSustCommitment] = useState(false);
  const [sustDescription, setSustDescription] = useState('');
  const [sustEffectiveDate, setSustEffectiveDate] = useState('');
  const [formError, setFormError] = useState('');

  // Use the safe React context hook instead of direct unsafe localStorage reading
  const { selectedDepartment, currentUser } = useAccess();
  const userDept = selectedDepartment || currentUser.department || 'Tổ Khai thác (TTĐHKT)';

  // Load and save state
  useEffect(() => {
    const saved = localStorage.getItem('vna_esg_suppliers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSuppliers(parsed);
        } else {
          setSuppliers(MOCK_SUPPLIERS);
        }
      } catch (e) {
        setSuppliers(MOCK_SUPPLIERS);
      }
    } else {
      localStorage.setItem('vna_esg_suppliers', JSON.stringify(MOCK_SUPPLIERS));
      setSuppliers(MOCK_SUPPLIERS);
    }
  }, []);

  const saveToStorage = (list: Supplier[]) => {
    localStorage.setItem('vna_esg_suppliers', JSON.stringify(list));
    setSuppliers(list);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedSupplier(null);
    setName('');
    setCountryType('VN');
    setContractFrom('');
    setContractTo('');
    setHasSustCommitment(false);
    setSustDescription('');
    setSustEffectiveDate('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (sub: Supplier, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModalMode('edit');
    setSelectedSupplier(sub);
    setName(sub.name);
    setCountryType(sub.countryType);
    setContractFrom(sub.contractFrom);
    setContractTo(sub.contractTo);
    setHasSustCommitment(sub.hasSustCommitment);
    setSustDescription(sub.sustDescription || '');
    setSustEffectiveDate(sub.sustEffectiveDate || '');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleAddSupplier = () => {
    if (!name.trim()) {
      setFormError('Tên nhà cung cấp không được để trống!');
      return;
    }
    if (!contractFrom || !contractTo) {
      setFormError('Vui lòng chọn thời hạn hợp đồng có hiệu lực!');
      return;
    }
    if (new Date(contractFrom) > new Date(contractTo)) {
      setFormError('Ngày hợp đồng có hiệu lực từ phải nhỏ hơn hoặc bằng ngày hết hạn!');
      return;
    }
    if (hasSustCommitment && !sustEffectiveDate) {
      setFormError('Vui lòng chọn ngày cam kết phát triển bền vững có hiệu lực!');
      return;
    }

    if (modalMode === 'add') {
      const newSupplier: Supplier & { departmentOwner?: string } = {
        id: `SUP-${String(Date.now()).slice(-3)}`,
        name: name.trim(),
        countryType,
        contractFrom,
        contractTo,
        hasSustCommitment,
        sustDescription: hasSustCommitment ? sustDescription.trim() : '',
        sustEffectiveDate: hasSustCommitment ? sustEffectiveDate : '',
        isActive: true,
        departmentOwner: userDept // Bind to current user department context
      };

      const updated = [newSupplier, ...suppliers];
      saveToStorage(updated);
      setIsAddModalOpen(false);
      setToast({ message: `Đã thêm mới nhà cung cấp "${newSupplier.name}" thành công!`, type: 'success' });
    } else if (modalMode === 'edit' && selectedSupplier) {
      const updated = suppliers.map(s => 
        s.id === selectedSupplier.id 
          ? { 
              ...s, 
              name: name.trim(), 
              countryType, 
              contractFrom, 
              contractTo, 
              hasSustCommitment, 
              sustDescription: hasSustCommitment ? sustDescription.trim() : '', 
              sustEffectiveDate: hasSustCommitment ? sustEffectiveDate : '' 
            } 
          : s
      );
      saveToStorage(updated);
      setIsAddModalOpen(false);
      setSelectedSupplier(null);
      setToast({ message: `Đã cập nhật thông tin nhà cung cấp thành công!`, type: 'success' });
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này khỏi hệ thống?')) return;
    const updated = suppliers.filter(s => s.id !== id);
    saveToStorage(updated);
    setToast({ message: 'Đã xóa nhà cung cấp thành công!', type: 'success' });
  };

  const toggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = suppliers.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s);
    saveToStorage(updated);
    const item = suppliers.find(s => s.id === id);
    if (item) {
      setToast({
        message: `Đã ${item.isActive ? 'tạm ngừng' : 'kích hoạt lại'} nhà cung cấp ${item.name}!`,
        type: 'info'
      });
    }
  };

  const viewDetails = (sub: Supplier) => {
    setSelectedSupplier(sub);
    setIsDetailModalOpen(true);
  };

  // Sort suppliers: non-PTBV (hasSustCommitment === false) comes first
  const sortedSuppliers = useMemo(() => {
    const list = Array.isArray(suppliers) ? suppliers : [];
    return [...list].sort((a, b) => {
      const aVal = a.hasSustCommitment ? 1 : 0;
      const bVal = b.hasSustCommitment ? 1 : 0;
      return aVal - bVal;
    });
  }, [suppliers]);

  // Filters + Department Context Filter: Only show suppliers belonging to user's department, or if no department is bound, show all.
  const filteredSuppliers = sortedSuppliers.filter(s => {
    // If supplier has a bound departmentOwner, check if it matches the current user's department
    const boundDept = (s as any).departmentOwner;
    if (boundDept && userDept && boundDept.toLowerCase().trim() !== userDept.toLowerCase().trim()) {
      return false;
    }
    const matchesSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (s.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = countryFilter === '' || s.countryType === countryFilter;
    const matchesCommit = commitmentFilter === '' || String(s.hasSustCommitment) === commitmentFilter;
    return matchesSearch && matchesCountry && matchesCommit;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800" title="Quay lại">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-vna-blue">Danh mục Nhà cung cấp</h1>
            <p className="text-black/45 text-sm mt-1">Quản lý danh sách đối tác cung ứng, thời hạn hợp đồng và cam kết phát triển bền vững (PTBV)</p>
          </div>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal} className="flex items-center gap-1">
          <Plus size={16} /> Thêm mới
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Tìm kiếm theo mã, tên nhà cung cấp..." 
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-full">
            <option value="">Tất cả quốc gia</option>
            <option value="VN">NCC Việt Nam</option>
            <option value="Foreign">NCC nước ngoài</option>
          </Select>
        </div>
        <div className="w-full md:w-56">
          <Select value={commitmentFilter} onChange={(e) => setCommitmentFilter(e.target.value)} className="w-full">
            <option value="">Tất cả cam kết PTBV</option>
            <option value="true">Có cam kết PTBV</option>
            <option value="false">Không có cam kết PTBV</option>
          </Select>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <thead>
            <tr>
              <th className="w-24">Mã đối tác</th>
              <th>Tên nhà cung cấp</th>
              <th>Quốc gia</th>
              <th>Hợp đồng từ</th>
              <th>Hợp đồng đến</th>
              <th className="text-center w-36">Cam kết PTBV</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((sub) => (
              <tr 
                key={sub.id} 
                className={`hover:bg-blue-50/20 transition-colors cursor-pointer ${!sub.isActive ? 'opacity-65' : ''}`}
                onClick={() => viewDetails(sub)}
              >
                <td className="font-bold text-vna-blue">{sub.id}</td>
                <td>
                  <span className="font-semibold text-gray-800 block">{sub.name}</span>
                  {!sub.isActive && <Badge variant="secondary" className="mt-1">Tạm ngừng</Badge>}
                </td>
                <td>
                  {sub.countryType === 'VN' ? (
                    <span className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                      <Building2 size={14} className="text-vna-blue" /> NCC Việt Nam
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                      <Globe size={14} className="text-amber-600" /> NCC nước ngoài
                    </span>
                  )}
                </td>
                <td className="text-xs text-gray-600 font-medium">{formatDate(sub.contractFrom)}</td>
                <td className="text-xs text-gray-600 font-medium">{formatDate(sub.contractTo)}</td>
                <td className="text-center">
                  <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={sub.hasSustCommitment} 
                      readOnly 
                    />
                  </div>
                </td>
                <td className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={(e) => handleOpenEditModal(sub, e)} title="Chỉnh sửa">
                      <Edit size={15} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => toggleStatus(sub.id, e)} 
                      title={sub.isActive ? "Tạm khóa" : "Mở khóa"}
                      className={sub.isActive ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}
                    >
                      <X size={15} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => handleDelete(sub.id, e)} 
                      title="Xóa đối tác"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSuppliers.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400 italic">
                  Không tìm thấy nhà cung cấp nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* VIEW DETAIL MODAL */}
      {isDetailModalOpen && selectedSupplier && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Chi tiết đối tác: ${selectedSupplier.id}`}
          footer={
            <div className="flex justify-between items-center w-full">
              <div>
                <span className="text-xs text-gray-400">Trạng thái: </span>
                {selectedSupplier.isActive ? (
                  <Badge variant="success">Hoạt động</Badge>
                ) : (
                  <Badge variant="secondary">Tạm ngừng</Badge>
                )}
              </div>
              <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Tên nhà cung cấp</label>
              <p className="text-sm font-semibold text-gray-800 mt-1">{selectedSupplier.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase">Phân loại quốc gia</label>
                <p className="text-sm font-semibold mt-1">
                  {selectedSupplier.countryType === 'VN' ? 'Nhà cung cấp Việt Nam' : 'Nhà cung cấp nước ngoài'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase">Thời hạn hợp đồng</label>
                <p className="text-sm font-semibold mt-1">
                  {formatDate(selectedSupplier.contractFrom)} → {formatDate(selectedSupplier.contractTo)}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  checked={selectedSupplier.hasSustCommitment} 
                  readOnly 
                  className="w-4.5 h-4.5 rounded border-gray-300 text-vna-blue cursor-not-allowed" 
                />
                <label className="text-sm font-bold text-gray-800">Cam kết phát triển bền vững (PTBV)</label>
              </div>

              {selectedSupplier.hasSustCommitment ? (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3 mt-3">
                  <div>
                    <span className="text-xs text-gray-400 block">Ngày cam kết hiệu lực:</span>
                    <span className="text-sm font-semibold text-gray-800 mt-0.5 block">{formatDate(selectedSupplier.sustEffectiveDate)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Nội dung cam kết PTBV chi tiết:</span>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed bg-white p-3 rounded-lg border border-gray-200/50">
                      {selectedSupplier.sustDescription || 'Chưa có nội dung mô tả chi tiết.'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic mt-1">Nhà cung cấp này hiện chưa nộp văn bản cam kết phát triển bền vững hoặc chưa tích hợp tiêu chuẩn ESG.</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ADD SUPPLIER MODAL */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={modalMode === 'add' ? 'Thêm mới Nhà cung cấp' : 'Chỉnh sửa Nhà cung cấp'}
          size="lg"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleAddSupplier}>
                {modalMode === 'add' ? 'Xác nhận Thêm' : 'Xác nhận Lưu'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-semibold text-red-600">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tên nhà cung cấp <span className="text-red-500">*</span></label>
              <Input 
                placeholder="Nhập tên chính thức của đối tác/nhà cung cấp..."
                value={name}
                onChange={(e) => { setName(e.target.value); setFormError(''); }}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Quốc gia <span className="text-red-500">*</span></label>
              <div className="flex gap-6 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={countryType === 'VN'}
                    onChange={() => setCountryType('VN')}
                    className="w-4.5 h-4.5 rounded border-gray-300 text-vna-blue focus:ring-vna-blue"
                  />
                  <span>NCC Việt Nam</span>
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={countryType === 'Foreign'}
                    onChange={() => setCountryType('Foreign')}
                    className="w-4.5 h-4.5 rounded border-gray-300 text-vna-blue focus:ring-vna-blue"
                  />
                  <span>NCC nước ngoài</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Hợp đồng có hiệu lực từ <span className="text-red-500">*</span></label>
                <Input 
                  type="date"
                  value={contractFrom}
                  onChange={(e) => setContractFrom(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Hợp đồng có hiệu lực đến <span className="text-red-500">*</span></label>
                <Input 
                  type="date"
                  value={contractTo}
                  onChange={(e) => setContractTo(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-700">Cam kết Phát triển bền vững?</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hasSustCommitment}
                        onChange={() => setHasSustCommitment(true)}
                        className="w-4 h-4 rounded border-gray-300 text-vna-blue"
                      />
                      <span>Có</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!hasSustCommitment}
                        onChange={() => {
                          setHasSustCommitment(false);
                          setSustDescription('');
                          setSustEffectiveDate('');
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-vna-blue"
                      />
                      <span>Không</span>
                    </label>
                  </div>
                </div>

                {hasSustCommitment && (
                  <div className="space-y-3 pt-2 border-t border-gray-200/60 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Ngày cam kết hiệu lực <span className="text-red-500">*</span></label>
                      <Input 
                        type="date"
                        value={sustEffectiveDate}
                        onChange={(e) => setSustEffectiveDate(e.target.value)}
                        className="w-full max-w-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Mô tả cam kết phát triển bền vững</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-vna-blue/20 outline-none"
                        rows={3}
                        placeholder="Nhập chi tiết các điều khoản cam kết ESG, chỉ tiêu giảm khí thải hoặc chuyển đổi công nghệ xanh..."
                        value={sustDescription}
                        onChange={(e) => setSustDescription(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
