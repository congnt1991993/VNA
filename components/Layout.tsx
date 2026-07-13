import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Database,
  PieChart,
  Globe,
  Settings,
  ChevronDown,
  LogOut,
  Bell,
  Circle,
  Briefcase,
  FileText,
  PanelLeftClose,
  PanelLeft,
  Server,
  ClipboardCheck,
  Workflow,
  Activity,
  Menu,
  FileSpreadsheet,
  Check,
  Target
} from 'lucide-react';
import { PageName } from '../types';
import { VNALogo } from './Logo';
import { useAccess } from './AccessContext';
import { MOCK_USERS, canAccessFeature, getRole } from '../data/accessControl';

// --- INTERFACES ---
interface SidebarProps {
  currentPage: PageName;
  onNavigate: (page: PageName) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  isMobile?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode; // Only for Level 1
  target?: PageName;
  children?: MenuItem[];
  isDivider?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'home',
    label: 'TỔNG QUAN ĐIỀU HÀNH',
    icon: <LayoutDashboard size={20} />,
    target: 'dashboard'
  },
  {
    id: 'data-collection',
    label: 'NHẬP LIỆU',
    icon: <FileSpreadsheet size={20} />,
    target: 'data-entry'
  },
  {
    id: 'indicators',
    label: 'QUẢN LÝ CHỈ TIÊU',
    icon: <Target size={20} />,
    target: 'indicators'
  },

  // 4. BÁO CÁO & CÔNG BỐ
  {
    id: 'reporting',
    label: 'BÁO CÁO & CÔNG BỐ',
    icon: <Workflow size={20} />,
    children: [
      { id: 'esg-report', label: 'Báo cáo thường niên ESG', target: 'esg-report' },
      { id: 'documents', label: 'Kho tài liệu PTBV chung', target: 'documents' },
      { id: 'cms-manage', label: 'CMS Website ESG', target: 'cms-manage' },
    ]
  },
  // 5. PHÂN TÍCH & CHIẾN LƯỢC
  {
    id: 'strategy',
    label: 'PHÂN TÍCH & CHIẾN LƯỢC',
    icon: <TrendingUp size={20} />,
    children: [
      { id: 'netzero', label: 'Mô phỏng kịch bản Net Zero', target: 'netzero-simulation' },
      // { id: 'kpi-manage', label: 'Quản lý KPI', target: 'kpi-manage' },
    ]
  },
  // 6. CÀI ĐẶT HỆ THỐNG
  {
    id: 'system-settings',
    label: 'CÀI ĐẶT HỆ THỐNG',
    icon: <Settings size={20} />,
    children: [
      // { id: 'aircrafts', label: 'Danh mục máy bay', target: 'aircrafts' },
      // { id: 'fuels', label: 'Danh mục nhiên liệu', target: 'fuels' },
      // { id: 'carbon-credits', label: 'Danh mục tín chỉ carbon', target: 'carbon-credits' },
      // { id: 'suppliers', label: 'Danh mục nhà cung cấp', target: 'suppliers' },
      // { id: 'divider-system', label: 'QUẢN TRỊ HỆ THỐNG', isDivider: true },
      { id: 'data-sources', label: 'Nguồn dữ liệu & Kết nối', target: 'data-sources' },
      { id: 'sys-forms', label: 'Quản lý biểu mẫu', target: 'sys-forms' },
      { id: 'sys-org', label: 'Quản lý Người dùng', target: 'sys-org' },
      { id: 'sys-departments', label: 'Quản lý Ban / Đơn vị', target: 'sys-departments' },
      { id: 'sys-roles', label: 'Phân quyền & Vai trò', target: 'sys-roles' },
      { id: 'sys-logs', label: 'Quản lý log hệ thống', target: 'sys-logs' },
      { id: 'settings', label: 'Cài đặt chung', target: 'settings' },
    ]
  }
];;
const MENU_TRANSLATIONS: Record<string, { vi: string; en: string }> = {
  'home': { vi: 'TỔNG QUAN ĐIỀU HÀNH', en: 'EXECUTIVE DASHBOARD' },
  'data-collection': { vi: 'NHẬP LIỆU', en: 'DATA COLLECTION' },
  'data-approval': { vi: 'PHÊ DUYỆT SỐ LIỆU', en: 'DATA APPROVAL' },
  'reporting': { vi: 'BÁO CÁO & CÔNG BỐ', en: 'REPORTING & DISCLOSURE' },
  'esg-report': { vi: 'Báo cáo thường niên ESG', en: 'Annual ESG Report' },
  'documents': { vi: 'Kho tài liệu PTBV chung', en: 'General Sustainability Docs' },
  'cms-manage': { vi: 'CMS Website ESG', en: 'CMS ESG Website' },
  'strategy': { vi: 'PHÂN TÍCH & CHIẾN LƯỢC', en: 'ANALYSIS & STRATEGY' },
  'netzero': { vi: 'Mô phỏng kịch bản Net Zero', en: 'Net Zero Simulation' },
  // 'kpi-manage': { vi: 'Quản lý KPI', en: 'KPI Management' },
  'system-settings': { vi: 'CÀI ĐẶT HỆ THỐNG', en: 'SYSTEM SETTINGS' },
  'indicators': { vi: 'QUẢN LÝ CHỈ TIÊU', en: 'Indicators Manage' },
  // 'aircrafts': { vi: 'Danh mục máy bay', en: 'Fleet Registry' },
  // 'fuels': { vi: 'Danh mục nhiên liệu', en: 'Fuel Registry' },
  // 'carbon-credits': { vi: 'Danh mục tín chỉ carbon', en: 'Carbon Credits Registry' },
  'suppliers': { vi: 'Danh mục nhà cung cấp', en: 'Suppliers Registry' },
  // 'divider-system': { vi: 'QUẢN TRỊ HỆ THỐNG', en: 'SYSTEM ADMINISTRATION' },
  'data-sources': { vi: 'Nguồn dữ liệu & Kết nối', en: 'Data Sources & Integrations' },
  'sys-forms': { vi: 'Quản lý biểu mẫu', en: 'Form Template Management' },
  'sys-org': { vi: 'Quản lý Người dùng', en: 'User Management' },
  'sys-departments': { vi: 'Quản lý Ban / Đơn vị', en: 'Department Management' },
  'sys-roles': { vi: 'Phân quyền & Vai trò', en: 'Roles & Permissions' },
  'sys-logs': { vi: 'Quản lý log hệ thống', en: 'System Change Logs' },
  'settings': { vi: 'Cài đặt chung', en: 'General Settings' }
};


export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onLogout,
  isCollapsed,
  onToggleSidebar,
  isMobile = false,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>(
    () => (localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi'
  );

  useEffect(() => {
    const handleLangChange = () => {
      setCurrentLang((localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi');
    };
    window.addEventListener('vna_language_changed', handleLangChange);
    return () => window.removeEventListener('vna_language_changed', handleLangChange);
  }, []);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { currentUser, viewAsRoleId } = useAccess();

  // Helper to check if a menu item or its children contains the current page
  const isActiveItem = (item: MenuItem, current: PageName): boolean => {
    if (item.target === current) return true;
    if (item.children) {
      return item.children.some(child => isActiveItem(child, current));
    }
    return false;
  };

  // Automatically expand menus containing the current page
  useEffect(() => {
    const newExpanded: string[] = [];
    const traverse = (items: MenuItem[]) => {
      items.forEach(item => {
        if (item.children && isActiveItem(item, currentPage)) {
          newExpanded.push(item.id);
          traverse(item.children); // Recurse for deeper levels
        }
      });
    };
    traverse(MENU_ITEMS);
    setExpandedMenus(prev => Array.from(new Set([...prev, ...newExpanded])));
  }, [currentPage]);

  const toggleMenu = (menuId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // If sidebar is collapsed and user clicks a parent item, expand sidebar first
    if (isCollapsed) {
      onToggleSidebar();
      setExpandedMenus(prev => [...prev, menuId]);
      return;
    }

    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const labelText = MENU_TRANSLATIONS[item.id] ? MENU_TRANSLATIONS[item.id][currentLang] : item.label;

    if (item.isDivider) {
      if (isCollapsed) return null;
      return (
        <div key={item.id} className="py-2.5 px-4 flex items-center gap-2 select-none">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-[10px] font-black text-[#DBA410] uppercase tracking-widest">{labelText}</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>
      );
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const isActive = item.target === currentPage;
    const isParentOfActive = hasChildren && isActiveItem(item, currentPage);

    // Determine indentation
    // If collapsed, we remove indentation for cleaner icon alignment (or hide children)
    const paddingLeft = isCollapsed ? '0px' : depth > 0 ? `${16 + depth * 16}px` : '16px';
    const justifyContent = isCollapsed ? 'justify-center' : 'justify-between';

    // --- STYLE LOGIC ---
    let wrapperClass = `w-full flex items-center ${justifyContent} py-3 text-sm transition-all duration-200 cursor-pointer select-none relative group/item `;
    let textClass = `whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 text-white/80 group-hover:text-white'}`;
    let iconClass = `text-white/70 group-hover:text-white transition-colors ${isCollapsed ? 'mr-0' : 'mr-3'}`;

    // Active State Logic
    if (isActive) {
      wrapperClass += "bg-white/10 font-semibold ";
      if (!isCollapsed) wrapperClass += "border-l-4 border-white ";
      textClass = `whitespace-nowrap ${isCollapsed ? 'hidden' : 'text-white'}`;
      iconClass = `text-white ${isCollapsed ? 'mr-0' : 'mr-3'}`;
    } else if (isParentOfActive) {
      wrapperClass += "text-white font-medium ";
      if (!isCollapsed) wrapperClass += "border-l-4 border-transparent ";
      textClass = `whitespace-nowrap ${isCollapsed ? 'hidden' : 'text-white'}`;
      iconClass = `text-white ${isCollapsed ? 'mr-0' : 'mr-3'}`;
    } else {
      wrapperClass += "border-l-4 border-transparent hover:bg-white/5 ";
    }

    // Indentation wrapper for collapsed mode to hide children
    if (isCollapsed && depth > 0) return null;

    return (
      <div key={item.id} className="group">
        <div
          onClick={(e) => {
            if (hasChildren) {
              toggleMenu(item.id, e);
            } else if (item.target) {
              onNavigate(item.target);
              if (isMobile && onCloseMobile) onCloseMobile();
            }
          }}
          className={wrapperClass}
          style={{ paddingLeft: isCollapsed ? 0 : paddingLeft }}
          title={isCollapsed ? labelText : ''} // Tooltip when collapsed
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
            {/* Level 1 Icons */}
            {depth === 0 && item.icon && <span className={iconClass}>{item.icon}</span>}

            {/* Level 2+ Dots (Only show if expanded) */}
            {depth > 0 && !isCollapsed && (
              <Circle
                size={6}
                className={`mr-3 ${isActive ? 'fill-white text-white' : 'text-white/40 group-hover:text-white/60'} transition-colors`}
              />
            )}

            <span className={textClass}>{labelText}</span>
          </div>

          {/* Arrow for items with children (Only if expanded) */}
          {hasChildren && !isCollapsed && (
            <span className={`text-white/50 group-hover:text-white transition-transform pr-4 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
              <ChevronDown size={14} />
            </span>
          )}

          {/* Collapsed Active Indicator Dot */}
          {isCollapsed && isActive && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-vna-gold rounded-full"></div>
          )}
        </div>

        {/* Submenu Container */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="bg-black/10 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
            {item.children?.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const sidebarWidthClass = isMobile ? 'w-[280px]' : (isCollapsed ? 'w-20' : 'w-[280px]');
  const sidebarTranslateClass = isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0';

  return (
    <>
      {isMobile && isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in cursor-pointer"
        />
      )}
      <div
        className={`h-[100dvh] flex flex-col fixed left-0 top-0 z-30 shadow-xl font-sans text-white bg-gradient-to-b from-[#006885] to-[#004b61] transition-all duration-300 ease-in-out ${sidebarWidthClass} ${sidebarTranslateClass}`}
      >
        {/* Header with Logo and Toggle */}
        <div className={`h-16 flex items-center border-b border-white/10 bg-white/5 shrink-0 transition-all duration-300 ${isCollapsed && !isMobile ? 'justify-center px-0' : 'justify-between px-4'}`}>
          {(!isCollapsed || isMobile) && <VNALogo variant="light" size="sm" />}

          {!isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
            >
              {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
            </button>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/20 overflow-x-hidden">
          <div className="space-y-0.5">
            {MENU_ITEMS
              .filter(item => {
                if (item.target === 'data-entry') return canAccessFeature(currentUser, 'data-entry', viewAsRoleId);
                if (item.target === 'data-approval') return canAccessFeature(currentUser, 'data-approval', viewAsRoleId);
                return true;
              })
              .map(item => renderMenuItem(item))}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 pb-8 md:pb-4 border-t border-white/10 bg-black/10 shrink-0 overflow-hidden`}>
          <button
            onClick={onLogout}
            className={`flex items-center gap-2 text-white/70 hover:text-white w-full text-sm font-medium transition-colors ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
            title={currentLang === 'vi' ? 'Đăng xuất' : 'Log Out'}
          >
            <LogOut size={18} />
            <span className={`transition-opacity duration-200 ${isCollapsed && !isMobile ? 'opacity-0 hidden' : 'opacity-100'}`}>
              {currentLang === 'vi' ? 'Đăng xuất' : 'Log Out'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export const Header: React.FC<{
  user: string;
  isCollapsed: boolean;
  isMobile?: boolean;
  onToggleMobile?: () => void;
}> = ({ user, isCollapsed, isMobile = false, onToggleMobile }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>(
    () => (localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi'
  );

  const { currentUser, setCurrentUserId, selectedDepartment, setSelectedDepartment } = useAccess();
  const roleNames = currentUser.roleIds.map(roleId => getRole(roleId)?.name).filter(Boolean).join(', ');

  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLangChange = () => {
      setCurrentLang((localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi');
    };
    window.addEventListener('vna_language_changed', handleLangChange);

    const handleClickOutside = (event: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('vna_language_changed', handleLangChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (lang: 'vi' | 'en') => {
    setCurrentLang(lang);
    localStorage.setItem('vna_esg_lang', lang);
    window.dispatchEvent(new Event('vna_language_changed'));
    setShowLanguageDropdown(false);
    alert(lang === 'vi' ? 'Đã chuyển đổi ngôn ngữ sang Tiếng Việt!' : 'Language switched to English!');
  };

  return (
    <header
      className={`h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 fixed top-0 right-0 z-10 font-sans hover:shadow-md transition-shadow duration-300 transition-all duration-300 ease-in-out`}
      style={{ left: isMobile ? '0px' : (isCollapsed ? '80px' : '280px') }}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {isMobile && (
          <button
            onClick={onToggleMobile}
            className="p-2 -ml-2 text-gray-600 hover:text-vna-blue hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Mở menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="flex flex-col overflow-hidden">
          <h1 className="text-xs sm:text-sm font-semibold text-vna-blue uppercase tracking-wide truncate max-w-[180px] xs:max-w-xs sm:max-w-none">
            {currentLang === 'vi' ? 'Hệ thống Báo cáo ESG' : 'ESG Reporting System'}
          </h1>
          <p className="text-[10px] text-black/45 uppercase tracking-wider mt-0.5 truncate hidden sm:block">
            {currentLang === 'vi' ? 'ESG Reporting System' : 'Vietnam Airlines'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="hidden xl:block">
          <label className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
            {currentLang === 'vi' ? 'Tài khoản mô phỏng' : 'Simulation Account'}
          </label>
          <select
            value={currentUser.id}
            onChange={(event) => setCurrentUserId(event.target.value)}
            className="max-w-[220px] rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-none hover:border-vna-blue"
          >
            {MOCK_USERS.map(profile => (
              <option key={profile.id} value={profile.id}>
                {profile.name} ({profile.department}) - {getRole(profile.roleIds[0])?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden xl:block">
          <label className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
            {currentLang === 'vi' ? 'Tổ ban nghiệp vụ' : 'Department'}
          </label>
          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            className="max-w-[220px] rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-none hover:border-vna-blue"
          >
            {[
              'Tổ Khai thác (TTĐHKT)',
              'Ban An toàn chất lượng (Ban ATCL)',
              'Tổ Kỹ thuật (Ban QLVT)',
              'Trung tâm Bông Sen Vàng (TTBSV)',
              'Ban Chuyển đổi số & CNTT',
              'Tổ Dịch vụ',
              'Ban Tổ chức Nhân lực',
              'Ban Kế hoạch Phát triển',
              'Ban Truyền thông'
            ].map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <button
            className="relative p-2 text-black/45 hover:text-vna-blue transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-100 font-semibold text-black/85">
                {currentLang === 'vi' ? 'Thông báo' : 'Notifications'}
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm text-black/85">
                    {currentLang === 'vi' ? (
                      <>
                        <span className="font-semibold">Hệ thống</span> vừa cập nhật dữ liệu phát thải tháng 3/2026.
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">System</span> has updated emission data for March 2026.
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {currentLang === 'vi' ? '10 phút trước' : '10 minutes ago'}
                  </p>
                </div>
                <div className="p-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm text-black/85">
                    {currentLang === 'vi' ? (
                      <>
                        Báo cáo ESG quý 1 đã được <span className="font-semibold">Trần Thị B</span> phê duyệt.
                      </>
                    ) : (
                      <>
                        Q1 ESG Report has been approved by <span className="font-semibold">Tran Thi B</span>.
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {currentLang === 'vi' ? '1 giờ trước' : '1 hour ago'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile with Language Selector */}
        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-black/85">{currentUser.name}</div>
              <div className="max-w-[220px] truncate text-xs text-black/45 text-left" title={roleNames}>{currentUser.department}</div>
            </div>

            <span className="text-[10px] font-bold text-vna-blue bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
              {currentLang}
            </span>

            <div className="w-8 h-8 rounded-full bg-vna-blue text-white flex items-center justify-center font-bold hover:shadow-md transition-shadow duration-300 border-2 border-white ring-1 ring-gray-100">
              {currentUser.name.charAt(0)}
            </div>
          </button>

          {showLanguageDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1 text-left animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Ngôn ngữ / Language
              </div>
              <button
                onClick={() => handleLanguageChange('vi')}
                className={`w-full px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between cursor-pointer focus:outline-none ${currentLang === 'vi' ? 'text-vna-blue font-bold bg-blue-50/50' : 'text-gray-700 font-medium'}`}
              >
                <span className="flex items-center gap-2">VI: Tiếng Việt</span>
                {currentLang === 'vi' && <Check size={16} className="text-vna-blue" />}
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`w-full px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between cursor-pointer focus:outline-none ${currentLang === 'en' ? 'text-vna-blue font-bold bg-blue-50/50' : 'text-gray-700 font-medium'}`}
              >
                <span className="flex items-center gap-2">EN: English</span>
                {currentLang === 'en' && <Check size={16} className="text-vna-blue" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


export const MainLayout: React.FC<{
  children: React.ReactNode;
  currentPage: PageName;
  onNavigate: (page: PageName) => void;
  onLogout: () => void;
}> = ({ children, currentPage, onNavigate, onLogout }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-vna-bg font-sans">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobile={isMobile}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      <Header
        user="Nguyễn Văn A"
        isCollapsed={isSidebarCollapsed}
        isMobile={isMobile}
        onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
      />
      <main
        className="pt-16 h-screen overflow-y-auto scroll-smooth transition-all duration-300 ease-in-out"
        style={{ paddingLeft: isMobile ? '0px' : (isSidebarCollapsed ? '80px' : '280px') }}
      >
        <div className="p-4 sm:p-8 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-300">
          {children}
        </div>
      </main>
    </div>
  );
};
