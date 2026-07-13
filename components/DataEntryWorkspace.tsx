import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import { Button, Modal, Toast } from './UI';
import { useAccess } from './AccessContext';
import {
  FORM_DEFINITIONS,
  FormDefinition,
  FormGrant,
  FormId,
} from '../data/accessControl';
import { TechOpsPage } from '../pages/TechOps';
import { OpsFlightPage } from '../pages/OpsFlight';
import { OpsATCLPage } from '../pages/OpsATCL';
import { OpsServicePage } from '../pages/OpsService';
import { OpsTTBSVPage } from '../pages/OpsTTBSV';
import { OpsHRPage } from '../pages/OpsHR';
import { OpsDigitalPage } from '../pages/OpsDigital';
import { OpsCommPage } from '../pages/OpsComm';
import { OpsPlanningPage } from '../pages/OpsPlanning';
import { SuppliersPage } from '../pages/Suppliers';

const FORM_COMPONENTS: Record<FormId, React.FC<any>> = {
  'tech-ops': TechOpsPage,
  'ops-flight': OpsFlightPage,
  'ops-atcl': OpsATCLPage,
  'ops-service': OpsServicePage,
  'ops-ttbsv': OpsTTBSVPage,
  'ops-hr': OpsHRPage,
  'ops-digital': OpsDigitalPage,
  'ops-comm': OpsCommPage,
  'ops-planning': OpsPlanningPage,
};

const PILLAR_STYLES = {
  E: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  S: 'bg-blue-50 text-blue-700 border-blue-200',
  G: 'bg-violet-50 text-violet-700 border-violet-200',
};

const ExcelImportDialog: React.FC<{
  isOpen: boolean;
  form: FormDefinition;
  onClose: () => void;
  onComplete: () => void;
}> = ({ isOpen, form, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [fileLoaded, setFileLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFileLoaded(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Import Excel - ${form.name}`}
      size="xl"
      footer={
        <div className="flex w-full justify-between">
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <div className="flex gap-2">
            {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Quay lại</Button>}
            {step < 3 ? (
              <Button variant="primary" disabled={step === 1 && !fileLoaded} onClick={() => setStep(step + 1)}>
                Tiếp tục <ChevronRight size={16} />
              </Button>
            ) : (
              <Button variant="primary" onClick={onComplete}>
                <CheckCircle2 size={16} /> Xác nhận nhập dữ liệu
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {['Chọn tệp', 'Kiểm tra dữ liệu', 'Xác nhận'].map((label, index) => (
            <div key={label} className={`rounded-lg border px-3 py-2 text-center text-sm font-semibold ${step === index + 1 ? 'border-vna-blue bg-blue-50 text-vna-blue' : step > index + 1 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-400'}`}>
              {index + 1}. {label}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <button className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 text-left hover:border-vna-blue">
              <span>
                <span className="block font-semibold text-gray-800">Biểu mẫu chuẩn: {form.code}_Template_2026.xlsx</span>
                <span className="text-xs text-gray-500">Tải đúng cấu trúc cột trước khi nhập dữ liệu.</span>
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold text-vna-blue"><Download size={16} /> Tải biểu mẫu</span>
            </button>
            <button
              onClick={() => setFileLoaded(true)}
              className={`flex min-h-48 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${fileLoaded ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 bg-white hover:border-vna-blue hover:bg-blue-50/30'}`}
            >
              {fileLoaded ? <CheckCircle2 size={36} className="mb-3 text-emerald-600" /> : <UploadCloud size={36} className="mb-3 text-vna-blue" />}
              <span className="font-semibold text-gray-800">{fileLoaded ? `${form.code}_Du_lieu_Thang_05_2026.xlsx` : 'Kéo thả hoặc chọn file Excel'}</span>
              <span className="mt-1 text-xs text-gray-500">Prototype hỗ trợ mô phỏng .xlsx, .xls, .csv tối đa 10MB</span>
            </button>
          </>
        )}

        {step === 2 && (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <p className="font-semibold text-gray-800">Xem trước 4 dòng dữ liệu</p>
                <p className="text-xs text-gray-500">3 hợp lệ, 1 dòng cần kiểm tra</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">1 cảnh báo</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-sm">
                <thead>
                  <tr>
                    <th>Dòng</th>
                    <th>Mã chỉ tiêu</th>
                    <th>Kỳ báo cáo</th>
                    <th>Kế hoạch</th>
                    <th>Thực hiện</th>
                    <th>Kiểm tra</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map(row => (
                    <tr key={row} className={row === 4 ? 'bg-amber-50' : ''}>
                      <td>{row + 1}</td>
                      <td>{form.code}-{String(row).padStart(2, '0')}</td>
                      <td>05/2026</td>
                      <td>{(1000 * row).toLocaleString('vi-VN')}</td>
                      <td>{row === 4 ? '-' : (930 * row).toLocaleString('vi-VN')}</td>
                      <td>
                        {row === 4
                          ? <span className="flex items-center gap-1 font-semibold text-amber-700"><AlertCircle size={14} /> Thiếu thực hiện</span>
                          : <span className="flex items-center gap-1 font-semibold text-emerald-700"><CheckCircle2 size={14} /> Hợp lệ</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex gap-4">
              <CheckCircle2 size={32} className="shrink-0 text-emerald-600" />
              <div>
                <h3 className="text-lg font-bold text-emerald-900">Sẵn sàng nhập dữ liệu</h3>
                <p className="mt-1 text-sm text-emerald-800">Ba dòng hợp lệ sẽ được đưa vào kỳ tháng 05/2026. Dòng cảnh báo được giữ lại để người dùng bổ sung thủ công.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

const enhanceEntryTables = (root: HTMLElement) => {
  root.querySelectorAll<HTMLHeadingElement>('h1').forEach(heading => {
    if (heading.textContent?.trim().toLowerCase().startsWith('nghiệp vụ')) {
      heading.parentElement?.classList.add('legacy-business-heading-hidden');
    }
  });

  root.querySelectorAll<HTMLTableElement>('table').forEach(table => {
    if (table.dataset.columnFilters === 'true') return;

    const thead = table.tHead;
    const tbody = table.tBodies[0];
    const headerRow = thead?.rows[thead.rows.length - 1];
    if (!thead || !tbody || !headerRow || headerRow.cells.length < 2) return;

    table.dataset.columnFilters = 'true';
    const filterRow = document.createElement('tr');
    filterRow.className = 'legacy-column-filter-row';

    Array.from(headerRow.cells).forEach((headerCell, columnIndex) => {
      const filterCell = document.createElement('th');
      const headerLabel = headerCell.textContent?.trim() || `Cột ${columnIndex + 1}`;
      const isActionColumn = /thao tác|chức năng|action/i.test(headerLabel);

      if (isActionColumn) {
        filterCell.innerHTML = '<span class="legacy-filter-empty">—</span>';
      } else {
        const input = document.createElement('input');
        input.type = 'search';
        input.placeholder = 'Lọc...';
        input.setAttribute('aria-label', `Lọc theo ${headerLabel}`);
        input.className = 'legacy-column-filter-input';
        input.addEventListener('click', event => event.stopPropagation());
        input.addEventListener('input', () => {
          const filters = Array.from(filterRow.querySelectorAll<HTMLInputElement>('input'));
          Array.from(table.tBodies).forEach(body => {
            Array.from(body.rows).forEach(row => {
              const visible = filters.every(filter => {
                const index = Number(filter.dataset.columnIndex);
                const query = filter.value.trim().toLocaleLowerCase('vi');
                if (!query) return true;
                return (row.cells[index]?.textContent || '').toLocaleLowerCase('vi').includes(query);
              });
              row.style.display = visible ? '' : 'none';
            });
          });
        });
        input.dataset.columnIndex = String(columnIndex);
        filterCell.appendChild(input);
      }
      filterRow.appendChild(filterCell);
    });

    thead.appendChild(filterRow);
  });
};

const getFormIdByDepartment = (deptName: string): FormId => {
  const normalized = (deptName || '').toLowerCase().trim();
  if (normalized.includes('khai thác') || normalized.includes('điều hành') || normalized.includes('ttđhkt')) return 'ops-flight';
  if (normalized.includes('an toàn') || normalized.includes('atcl')) return 'ops-atcl';
  if (normalized.includes('kỹ thuật') || normalized.includes('vật tư') || normalized.includes('qlvt')) return 'tech-ops';
  if (normalized.includes('bông sen vàng') || normalized.includes('ttbsv')) return 'ops-ttbsv';
  if (normalized.includes('chuyển đổi số') || normalized.includes('cntt') || normalized.includes('công nghệ')) return 'ops-digital';
  if (normalized.includes('dịch vụ')) return 'ops-service';
  if (normalized.includes('tổ chức') || normalized.includes('nhân lực') || normalized.includes('tcnl')) return 'ops-hr';
  if (normalized.includes('kế hoạch') || normalized.includes('khpt')) return 'ops-planning';
  if (normalized.includes('truyền thông')) return 'ops-comm';
  return 'ops-planning'; // default fallback
};

export const DataEntryWorkspace: React.FC = () => {
  const {
    currentUser,
    effectiveFormGrants,
    selectedDepartment,
  } = useAccess();
  const availableForms = useMemo(
    () => FORM_DEFINITIONS.filter(form => effectiveFormGrants.some(grant => grant.formId === form.id)),
    [effectiveFormGrants],
  );
  const [selectedFormId, setSelectedFormId] = useState<FormId | ''>('');
  const [showImport, setShowImport] = useState(false);
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [isNewPeriod, setIsNewPeriod] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const formShellRef = useRef<HTMLElement>(null);

  const targetFormId = useMemo(() => getFormIdByDepartment(selectedDepartment), [selectedDepartment]);

  useEffect(() => {
    if (targetFormId) {
      setSelectedFormId(targetFormId);
    }
  }, [targetFormId]);

  useEffect(() => {
    const handlePeriodChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsNewPeriod(!!customEvent.detail?.isNew);
    };
    window.addEventListener('vna-period-mode-change', handlePeriodChange);
    return () => {
      window.removeEventListener('vna-period-mode-change', handlePeriodChange);
    };
  }, []);

  const deptIndicators = useMemo(() => {
    const savedDeptsStr = localStorage.getItem('vna_esg_departments');

    const INITIAL_DEPARTMENTS = [
      { name: 'Tổ Khai thác (TTĐHKT)', indicatorIds: ["GRI 302-1", "GRI 302-4", "GRI 305-1", "GRI 305-4", "GRI 305-5", "GRI 305-7"] },
      { name: 'Ban An toàn chất lượng (Ban ATCL)', indicatorIds: ["Airline E-1", "9", "GRI 403-2"] },
      { name: 'Tổ Kỹ thuật (Ban QLVT)', indicatorIds: ["4", "5", "13"] },
      { name: 'Trung tâm Bông Sen Vàng (TTBSV)', indicatorIds: ["Airline B-2"] },
      { name: 'Ban Chuyển đổi số & CNTT', indicatorIds: ["GRI 418-1"] },
      { name: 'Tổ Dịch vụ', indicatorIds: ["GRI 303-3", "GRI 303-5", "Airline B-1", "GRI 204-1", "GRI 406-1", "GRI 416-1", "GRI 416-2", "GRI 417-2"] },
      { name: 'Ban Tổ chức Nhân lực', indicatorIds: ["Airline D-1", "Airline F-2", "GRI 202-1", "GRI 401-1", "GRI 401-2", "GRI 403-4", "GRI 403-9", "GRI 403-10", "GRI 405-1", "GRI 406-1", "GRI 2-7", "GRI 2-30", "GRI 404-2", "GRI 404-3", "GRI 201-3", "GRI 202-2"] },
      { name: 'Ban Kế hoạch Phát triển', indicatorIds: ["GRI 2-9", "GRI 2-10", "GRI 2-11", "GRI 2-12", "GRI 2-13", "GRI 2-15", "GRI 2-23", "GRI 2-26", "GRI 2-29", "GRI 3-3", "GRI 201-4", "GRI 205-2", "GRI 205-3", "GRI 206-1", "GRI 415-1"] },
      { name: 'Ban Truyền thông', indicatorIds: ["Airline F-1", "GRI 417-3"] }
    ];

    if (savedDeptsStr) {
      try {
        const depts = JSON.parse(savedDeptsStr);
        const needsUpdate = depts.length < 9 || (depts.find((d: any) => d.name === 'Tổ Khai thác (TTĐHKT)')?.indicatorIds || []).length < 6;
        if (needsUpdate) {
          localStorage.setItem('vna_esg_departments', JSON.stringify(
            INITIAL_DEPARTMENTS.map((d, index) => ({ id: `DEPT-00${index + 1}`, ...d, isActive: true }))
          ));
          const matched = INITIAL_DEPARTMENTS.find(d => d.name.toLowerCase().trim() === selectedDepartment.toLowerCase().trim());
          return matched ? matched.indicatorIds : [];
        }

        const matched = depts.find((d: any) => {
          return d.name.toLowerCase().trim() === selectedDepartment.toLowerCase().trim();
        });
        if (matched && matched.indicatorIds) {
          return matched.indicatorIds as string[];
        }
      } catch (e) {
        console.error(e);
      }
    }

    const matched = INITIAL_DEPARTMENTS.find(d => d.name.toLowerCase().trim() === selectedDepartment.toLowerCase().trim());
    return matched ? matched.indicatorIds : [];
  }, [selectedDepartment]);

  const indicatorDetails = useMemo(() => {
    const savedInds = localStorage.getItem('vna_esg_indicators');
    let allIndicators: any[] = [];
    if (savedInds) {
      try {
        allIndicators = JSON.parse(savedInds);
      } catch (e) {
        allIndicators = [];
      }
    }

    return deptIndicators.map(id => {
      const found = allIndicators.find(ind => ind.code === id || ind.id === id);
      return {
        code: found ? (found.code === 'Chưa có mã' ? found.name : found.code) : id,
        name: found ? found.name : 'Chỉ tiêu chưa cấu hình tên',
        pillar: found ? found.pillar : 'E'
      };
    });
  }, [deptIndicators]);

  const selectedForm = availableForms.find(form => form.id === selectedFormId);
  const selectedGrant: FormGrant | undefined = effectiveFormGrants.find(grant => grant.formId === selectedFormId);
  const SelectedComponent = selectedFormId ? FORM_COMPONENTS[selectedFormId] : null;
  const hasMultipleForms = availableForms.length > 1;

  useEffect(() => {
    const root = formShellRef.current;
    if (!root) return;

    const enhance = () => enhanceEntryTables(root);
    const frame = window.requestAnimationFrame(enhance);
    const observer = new MutationObserver(enhance);
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  if (availableForms.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-lg rounded-xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <ShieldCheck size={44} className="mx-auto mb-4 text-amber-500" />
          <h1 className="text-xl font-bold text-gray-900">Chưa được phân công biểu mẫu</h1>
          <p className="mt-2 text-sm text-gray-500">Tài khoản {currentUser.name} chưa thuộc nhóm quyền có form nhập liệu. Vui lòng liên hệ quản trị hệ thống.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {selectedForm && (
        <ExcelImportDialog
          isOpen={showImport}
          form={selectedForm}
          onClose={() => setShowImport(false)}
          onComplete={() => {
            setShowImport(false);
            setToast({ message: 'Đã nhập 3 dòng dữ liệu hợp lệ. 1 dòng được đưa vào danh sách cần bổ sung.', type: 'success' });
          }}
        />
      )}

      {selectedForm && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-fit items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-vna-blue">
                <FileSpreadsheet size={19} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base font-semibold text-gray-900">{selectedForm.code} · {selectedForm.name}</h1>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${PILLAR_STYLES[selectedForm.pillar]}`}>
                    Trụ cột {selectedForm.pillar}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{selectedForm.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isNewPeriod && (
                <Button
                  variant="primary"
                  onClick={() => {
                    const event = new CustomEvent('vna-save-new-period');
                    window.dispatchEvent(event);
                  }}
                  className="text-xs h-9 font-bold bg-vna-blue hover:bg-vna-blue/90 text-white shadow-md flex items-center gap-1.5"
                >
                  Lưu dữ liệu
                </Button>
              )}
            </div>
          </div>

          {/* <div className="flex min-w-0 items-center gap-2 overflow-x-auto border-y border-gray-200 bg-gray-50/60 px-4 py-2.5">
            <span className="min-w-fit text-xs font-bold text-gray-700">Chỉ tiêu được gán của đơn vị:</span>
            {indicatorDetails.length === 0 ? (
              <span className="text-xs text-gray-400 italic">Không có chỉ tiêu nào được gán cho đơn vị này</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {indicatorDetails.map(ind => (
                  <span
                    key={ind.code}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      ind.pillar === 'E'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ind.pillar === 'S'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-violet-50 text-violet-700 border-violet-200'
                    }`}
                  >
                    <span className="font-bold">{ind.code}</span>
                  </span>
                ))}
              </div>
            )}
          </div> */}


        </section>
      )}

      <section ref={formShellRef} className="legacy-form-shell">
        {SelectedComponent && (
          <SelectedComponent
            onImportExcel={
              selectedGrant?.importExcel && selectedForm.supportsExcel
                ? () => setShowImport(true)
                : undefined
            }
            onNewPeriodChange={(isNew: boolean) => setIsNewPeriod(isNew)}
          />
        )}
      </section>
    </div>
  );
};
