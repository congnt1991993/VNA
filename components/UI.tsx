
import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, ChevronDown, Check, ChevronRight } from 'lucide-react';
import { Pillar, Status } from '../types';

// --- BUTTONS ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', className = '', isLoading, ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors inline-flex items-center justify-center gap-2 text-sm";
  
  const variants = {
    // UPDATED: Primary is now Blue (Brand Identity), Secondary is Gold (Auxiliary)
    primary: "bg-vna-blue hover:bg-[#00556e] text-white hover:shadow-md transition-shadow duration-300",
    secondary: "bg-vna-gold hover:bg-vna-goldHover text-white hover:shadow-md transition-shadow duration-300",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
};

// --- INPUTS ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input 
      className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <textarea 
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-vna-blue ${className}`}
      {...props}
    />
  </div>
);

// --- CUSTOM SELECT ---
export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  label?: string;
  value?: string | number;
  onChange?: (value: any) => void; // Using any to simplify usage across app
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Chọn...', 
  error, 
  className = '', 
  disabled 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full bg-white border ${isOpen ? 'border-vna-blue ring-1 ring-vna-blue' : (error ? 'border-red-500' : 'border-gray-300')} rounded-md px-3 py-2 text-left flex justify-between items-center focus:outline-none transition-all hover:shadow-md transition-shadow duration-300 ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'hover:border-gray-400'}`}
          disabled={disabled}
        >
          <span className={`text-sm truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
            {options.length > 0 ? (
              <div className="py-1">
                {options.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => {
                        if (onChange) onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`px-3 py-2 cursor-pointer flex justify-between items-center text-sm transition-colors ${isSelected ? 'bg-blue-50 text-vna-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={16} className="text-vna-blue" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400 text-center">Không có dữ liệu</div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// --- MODAL ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-vna-blue">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
        {footer && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// --- STATUS CHIP ---
export const StatusChip: React.FC<{ status: Status | string }> = ({ status }) => {
  let styles = "bg-gray-100 text-black/85";
  
  switch (status) {
    case Status.APPROVED:
    case 'Success':
    case 'Đạt':
      styles = "bg-green-100 text-green-800 border border-green-200";
      break;
    case Status.REJECTED:
    case 'Failed':
    case 'Không đạt':
      styles = "bg-red-100 text-red-800 border border-red-200";
      break;
    case Status.SUBMITTED:
    case Status.PENDING:
    case 'Running':
    case 'Cảnh báo':
      styles = "bg-orange-100 text-orange-800 border border-orange-200";
      break;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
};

// --- PILLAR BADGE ---
export const PillarBadge: React.FC<{ pillar: Pillar }> = ({ pillar }) => {
  const colors = {
    [Pillar.ENVIRONMENT]: "text-green-700 bg-green-50 border-green-200",
    [Pillar.SOCIAL]: "text-blue-700 bg-blue-50 border-blue-200",
    [Pillar.GOVERNANCE]: "text-purple-700 bg-purple-50 border-purple-200",
  };

  const labels = {
    [Pillar.ENVIRONMENT]: "E - Môi trường",
    [Pillar.SOCIAL]: "S - Xã hội",
    [Pillar.GOVERNANCE]: "G - Quản trị",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${colors[pillar]} whitespace-nowrap`}>
      {labels[pillar]}
    </span>
  );
};

// --- BADGE ---
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'secondary' | 'primary'; className?: string }> = ({ children, variant = 'secondary', className = '' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-orange-100 text-orange-800 border-orange-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    secondary: 'bg-gray-100 text-black/85 border-gray-200',
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// --- TABLE ---
export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`w-full overflow-x-auto ${className}`}>
    <table className="w-full text-sm text-left text-gray-700">
      {children}
    </table>
  </div>
);

// --- CARD ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode }> = ({ children, className = '', title, action }) => (
  <div className={`bg-white rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-200 p-5 ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-4">
        {title && <h3 className="font-semibold text-black/85">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

// --- TOAST ---
export const Toast: React.FC<{ message: string; type?: 'success' | 'error' | 'info'; onClose: () => void }> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 text-white rounded shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300 ${bgColors[type]}`}>
      {type === 'success' && <Check size={18} />}
      {type === 'error' && <X size={18} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 hover:opacity-80"><X size={16} /></button>
    </div>
  );
};

// --- PERIOD TREE SELECT SHARED DATA & COMPONENT ---

export const PERIOD_TREE_DATA = [
  {
    year: 2024,
    quarters: [
      { id: 'q3-2024', label: 'Quý 3', months: [{ id: '07-2024', label: 'Tháng 7' }, { id: '08-2024', label: 'Tháng 8' }, { id: '09-2024', label: 'Tháng 9' }] },
      { id: 'q4-2024', label: 'Quý 4', months: [{ id: '10-2024', label: 'Tháng 10' }, { id: '11-2024', label: 'Tháng 11' }, { id: '12-2024', label: 'Tháng 12' }] },
    ]
  },
  {
    year: 2025,
    quarters: [
      { id: 'q1-2025', label: 'Quý 1', months: [{ id: '01-2025', label: 'Tháng 1' }, { id: '02-2025', label: 'Tháng 2' }, { id: '03-2025', label: 'Tháng 3' }] },
    ]
  }
];

export type PeriodType = 'year' | 'quarter' | 'month';

export const getPeriodType = (id: string): PeriodType => {
  if (/^\d{4}$/.test(id)) return 'year';
  if (id.startsWith('q')) return 'quarter';
  return 'month';
};

export const getPeriodLabel = (id: string): string => {
  if (/^\d{4}$/.test(id)) return id; // Year
  
  let label = id;
  PERIOD_TREE_DATA.forEach(y => {
    y.quarters.forEach(q => {
      if (q.id === id) label = `${q.label} - ${y.year}`;
      q.months.forEach(m => {
        if (m.id === id) label = `${m.label} - ${y.year}`;
      })
    })
  });
  return label;
};

export const ReportingPeriodTreeSelect: React.FC<{ 
  selected: string[]; 
  onChange: (ids: string[]) => void; 
  label?: string;
  className?: string;
}> = ({ selected, onChange, label = "Kỳ báo cáo", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['2025']); // Default expand 2025
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine current active level based on first selection
  const currentActiveLevel: PeriodType | null = selected.length > 0 ? getPeriodType(selected[0]) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedNodes.includes(id)) {
      setExpandedNodes(expandedNodes.filter(n => n !== id));
    } else {
      setExpandedNodes([...expandedNodes, id]);
    }
  };

  const handleSelect = (id: string, type: PeriodType) => {
    if (currentActiveLevel && currentActiveLevel !== type) {
        return; 
    }

    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(s => s !== id));
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && <label className="block text-xs font-semibold text-black/45 mb-1 ml-1">{label} <span className="text-red-500">*</span></label>}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border ${isOpen ? 'border-vna-blue ring-1 ring-vna-blue' : 'border-gray-300'} rounded-md px-2 py-1 flex justify-between items-center cursor-pointer transition-all hover:shadow-md transition-shadow duration-300 min-h-[38px]`}
      >
        <div className="flex flex-wrap gap-1.5 flex-1 py-0.5">
          {selected.length > 0 ? (
            selected.map(id => (
              <span key={id} className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-700 font-medium animate-in zoom-in-95 duration-200">
                {getPeriodLabel(id)}
                <X 
                  size={12} 
                  className="text-gray-400 hover:text-red-500 cursor-pointer" 
                  onClick={(e) => removeTag(id, e)}
                />
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400 pl-1 py-1">Chọn kỳ báo cáo...</span>
          )}
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-100">
          {PERIOD_TREE_DATA.map(yearData => {
            const yearId = yearData.year.toString();
            const yearDisabled = currentActiveLevel !== null && currentActiveLevel !== 'year';
            
            return (
              <div key={yearData.year} className="mb-1">
                {/* Year Node */}
                <div className="flex items-center gap-1 hover:bg-gray-50 p-1 rounded">
                   <span className="text-gray-400 cursor-pointer p-0.5" onClick={(e) => toggleExpand(yearId, e)}>
                      {expandedNodes.includes(yearId) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                   </span>
                   <label className={`flex items-center gap-2 flex-1 cursor-pointer ${yearDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                      <input 
                        type="checkbox"
                        checked={selected.includes(yearId)}
                        disabled={yearDisabled}
                        onChange={() => handleSelect(yearId, 'year')}
                        className="rounded text-vna-blue focus:ring-vna-blue border-gray-300 w-4 h-4"
                      />
                      <span className="text-sm font-semibold text-gray-700">{yearData.year}</span>
                   </label>
                </div>
                
                {/* Quarters */}
                {expandedNodes.includes(yearId) && (
                  <div className="ml-5 border-l border-gray-100 pl-1">
                    {yearData.quarters.map(quarter => {
                        const quarterDisabled = currentActiveLevel !== null && currentActiveLevel !== 'quarter';
                        
                        return (
                          <div key={quarter.id}>
                             <div className="flex items-center gap-1 hover:bg-gray-50 p-1 rounded">
                                <span className="text-gray-400 cursor-pointer p-0.5" onClick={(e) => toggleExpand(quarter.id, e)}>
                                  {expandedNodes.includes(quarter.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </span>
                                <label className={`flex items-center gap-2 flex-1 cursor-pointer ${quarterDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                    <input 
                                      type="checkbox" 
                                      checked={selected.includes(quarter.id)}
                                      disabled={quarterDisabled}
                                      onChange={() => handleSelect(quarter.id, 'quarter')}
                                      className="rounded text-vna-blue focus:ring-vna-blue border-gray-300 w-4 h-4"
                                    />
                                    <span className="text-sm text-gray-700">{quarter.label}</span>
                                </label>
                             </div>

                             {/* Months */}
                             {expandedNodes.includes(quarter.id) && (
                               <div className="ml-6 flex flex-col gap-0.5 mt-0.5 mb-1">
                                  {quarter.months.map(month => {
                                      const monthDisabled = currentActiveLevel !== null && currentActiveLevel !== 'month';

                                      return (
                                        <label key={month.id} className={`flex items-center gap-2 hover:bg-blue-50 p-1.5 rounded cursor-pointer ${monthDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                           <input 
                                             type="checkbox" 
                                             checked={selected.includes(month.id)}
                                             disabled={monthDisabled}
                                             onChange={() => handleSelect(month.id, 'month')}
                                             className="rounded text-vna-blue focus:ring-vna-blue border-gray-300 w-4 h-4"
                                           />
                                           <span className="text-sm text-gray-600">{month.label}</span>
                                        </label>
                                      );
                                  })}
                               </div>
                             )}
                          </div>
                        );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
