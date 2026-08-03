import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DataEntryWorkspace } from './components/DataEntryWorkspace';
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { EsgReportPage } from './pages/EsgReport';
import { DashboardPage } from './pages/Dashboard';
import { IndicatorsPage } from './pages/Indicators';
import { FormulasPage } from './pages/Formulas';
import { DataOpsPage } from './pages/DataOps';
import { ReportsPage } from './pages/Reports';
import { DocumentsPage } from './pages/Documents';
import { NetZeroPage } from './pages/NetZero';
import { KPIPage } from './pages/KPI';
import { DataSourcesPage } from './pages/DataSources';
import { DataWarehouseRawPage } from './pages/DataWarehouseRaw';
import { ReportDraftingPage } from './pages/ReportDrafting';
import { ReportPendingPage } from './pages/ReportPending';
import { ReportApprovedPage } from './pages/ReportApproved';
import { DocumentApprovalPage } from './pages/DocumentApproval';
import { DashboardEnvPage } from './pages/DashboardEnv';
import { DashboardSocPage } from './pages/DashboardSoc';
import { DashboardGovPage } from './pages/DashboardGov';
import { KPIManagePage } from './pages/KPIManage';
import { CMSManagePage } from './pages/CMSManage';
import { SysOrgPage } from './pages/SysOrg';
import { DepartmentsPage } from './pages/Departments';
import { SysAccountsPage } from './pages/SysAccounts';
import { SysRolesPage } from './pages/SysRoles';
import { SysLogsPage } from './pages/SysLogs';
import { SysFormsPage } from './pages/SysForms';
import { SettingsPage } from './pages/Settings';
import { AlertsManagePage } from './pages/AlertsManage';
import { CountriesPage } from './pages/Countries';
import { AirportsPage } from './pages/Airports';
import { AircraftsPage } from './pages/Aircrafts';
import { FuelsPage } from './pages/Fuels';
import { SuppliersPage } from './pages/Suppliers';
import { FlightsPage } from './pages/Flights';
import { CarbonCreditsPage } from './pages/CarbonCredits';
import { TechOpsPage } from './pages/TechOps';
import { OpsFlightPage } from './pages/OpsFlight';
import { OpsATCLPage } from './pages/OpsATCL';
import { OpsServicePage } from './pages/OpsService';
import { OpsTTBSVPage } from './pages/OpsTTBSV';
import { OpsHRPage } from './pages/OpsHR';
import { OpsDigitalPage } from './pages/OpsDigital';
import { OpsCommPage } from './pages/OpsComm';
import { OpsPlanningPage } from './pages/OpsPlanning';
import { LoginPage } from './pages/Login';
import PublicSite from './components/public-site/PublicSite';
import { PageName } from './types';

import { Card } from './components/UI';
import { Server, Database, Workflow } from 'lucide-react';

const App: React.FC = () => {
  // (cache-busting logic removed — was causing infinite reload loop)

  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageName>('dashboard');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // 1. Initialize vna_esg_indicators
    const savedInds = localStorage.getItem('vna_esg_indicators');
    if (!savedInds || savedInds === '[]' || savedInds === 'null' || savedInds === '') {
      import('./data/indicators_main_list.json').then(m => {
        localStorage.setItem('vna_esg_indicators', JSON.stringify(m.default));
      }).catch(e => console.error(e));
    }

    // 2. Initialize vna_esg_departments
    const savedDepts = localStorage.getItem('vna_esg_departments');
    if (!savedDepts || savedDepts === '[]' || savedDepts === 'null' || savedDepts === '') {
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
      ].map((d, index) => ({ id: `DEPT-00${index + 1}`, ...d, isActive: true }));
      localStorage.setItem('vna_esg_departments', JSON.stringify(INITIAL_DEPARTMENTS));
    }

    // 3. Initialize vna_all_submissions with default values for all departments
    const savedSubs = localStorage.getItem('vna_all_submissions');
    if (!savedSubs || savedSubs === '[]' || savedSubs === 'null' || savedSubs === '') {
      const defaultDepartments = [
        'Tổ Khai thác (TTĐHKT)',
        'Ban An toàn chất lượng (Ban ATCL)',
        'Tổ Kỹ thuật (Ban QLVT)',
        'Trung tâm Bông Sen Vàng (TTBSV)',
        'Ban Chuyển đổi số & CNTT',
        'Tổ Dịch vụ',
        'Ban Tổ chức Nhân lực',
        'Ban Kế hoạch Phát triển',
        'Ban Truyền thông'
      ];
      const defaultPeriods = ['Tháng 05/2026', 'Tháng 04/2026', 'Tháng 03/2026', 'Tháng 02/2026', 'Tháng 01/2026'];
      const initialSubs: any[] = [];

      defaultDepartments.forEach(dept => {
        defaultPeriods.forEach((p, index) => {
          const reportId = `${dept.includes('QLVT') ? 'QLVT' : dept.includes('ATCL') ? 'ATCL' : dept.includes('Khai thác') ? 'KT' : 'ESG'}-2026-${5 - index}`;
          initialSubs.push({
            id: reportId,
            unit: dept,
            period: p,
            status: index === 0 ? 'Pending' : 'Active',
            lastUpdated: `15/${String(5 - index).padStart(2, '0')}/2026 09:30`,
            updatedBy: 'Nguyễn Văn A',
            data: {
              id: reportId,
              creator: 'Nguyễn Văn A',
              editor: index === 0 ? '—' : 'Trần Thị Hà',
              editTime: `15/${String(5 - index).padStart(2, '0')}/2026 09:30`
            }
          });
        });
      });
      localStorage.setItem('vna_all_submissions', JSON.stringify(initialSubs));
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowLogin(false);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'dashboard-tech':
        return <ExecutiveDashboard />;
      case 'dashboard-flight':
        return <ExecutiveDashboard />;
      case 'dashboard-service':
        return <ExecutiveDashboard />;
      case 'dashboard-gov':
        return <ExecutiveDashboard />;
      case 'data-entry':
        return <DataEntryWorkspace />;
      case 'kpi-manage':
        return <KPIManagePage />;
      
      // NHÓM 2 (Data Gov & Config)
      case 'data-sources':
        return <DataSourcesPage />;
      case 'data-warehouse-raw':
        return <DataWarehouseRawPage />;
      case 'kpi-targets':
        return <KPIPage mode="targets" />;
      case 'indicators':
        return <IndicatorsPage />;
      case 'countries':
        return <CountriesPage />;
      case 'airports':
        return <AirportsPage />;
      case 'aircrafts':
        return <AircraftsPage />;
      case 'fuels':
        return <FuelsPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'flights':
        return <FlightsPage />;
      case 'carbon-credits':
        return <CarbonCreditsPage />;
      case 'tech-ops':
        return <TechOpsPage />;
      case 'ops-flight':
        return <OpsFlightPage />;
      case 'ops-atcl':
        return <OpsATCLPage />;
      case 'ops-service':
        return <OpsServicePage />;
      case 'ops-ttbsv':
        return <OpsTTBSVPage />;
      case 'ops-hr':
        return <OpsHRPage />;
      case 'ops-digital':
        return <OpsDigitalPage />;
      case 'ops-comm':
        return <OpsCommPage />;
      case 'ops-planning':
        return <OpsPlanningPage />;
      // NHÓM 3
      case 'netzero-simulation':
        return <NetZeroPage mode="simulation" />;
      case 'netzero-comparison':
        return <NetZeroPage mode="comparison" />;
      case 'netzero-reports':
        return <NetZeroPage mode="reports" />;

      // NHÓM 4 (Operations)
      case 'esg-data-analysis': // MERGED PAGE
        return <DataOpsPage mode="analysis" />;
      case 'data-logs':
        return <DataOpsPage mode="logs" />;

      // NHÓM 5
      case 'kpi-performance':
        return <KPIPage mode="performance" />;
      case 'report-env':
        return <ReportsPage mode="bi-env" />;
      case 'report-soc':
        return <ReportsPage mode="bi-soc" />;
      case 'report-gov':
        return <ReportsPage mode="bi-gov" />;
      case 'publishing':
        return <ReportsPage mode="publishing" />;
      case 'esg-report':
        return <EsgReportPage />;
      case 'documents':
        return <DocumentsPage />; 
      case 'report-drafting':
        return <ReportDraftingPage />;
      case 'report-pending':
        return <ReportPendingPage />;
      case 'report-approved':
        return <ReportApprovedPage />;
      case 'document-approval':
        return <DocumentApprovalPage />;
      case 'cms-manage':
        return <CMSManagePage />;

      // NHÓM 6
      case 'formulas':
        return <FormulasPage />;
      case 'sys-org':
        return <SysOrgPage />;
      case 'sys-departments':
        return <DepartmentsPage />;
      case 'sys-accounts':
        return <SysAccountsPage />;
      case 'sys-roles':
        return <SysRolesPage />;
      case 'sys-logs':
        return <SysLogsPage />;
      case 'sys-forms':
        return <SysFormsPage />;
      case 'alerts-manage':
        return <AlertsManagePage />;
      case 'settings':
        return <SettingsPage />;
        
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  if (!isAuthenticated) {
    if (showLogin) {
      return (
        <LoginPage 
          onLogin={() => {
            setIsAuthenticated(true);
            setShowLogin(false);
          }} 
          onBack={() => setShowLogin(false)}
        />
      );
    }
    return <PublicSite onLoginClick={() => setShowLogin(true)} />;
  }

  return (
    <MainLayout 
      currentPage={currentPage} 
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
    >
      <ErrorBoundary>
        {renderContent()}
      </ErrorBoundary>
    </MainLayout>
  );
};

export default App;
