import React, { useState } from 'react';
import { MainLayout } from './components/Layout';
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
  React.useEffect(() => {
    const saved = localStorage.getItem('vna_esg_indicators');
    if (saved) {
      try {
        const indicators = JSON.parse(saved);
        const gri418 = indicators.find((ind: any) => ind.code === 'GRI 418-1');
        if (gri418 && gri418.sourceForm !== 'ops-digital') {
          localStorage.removeItem('vna_esg_indicators');
          window.location.reload();
        }
      } catch (e) {}
    }
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => new URLSearchParams(window.location.search).get('demo') === '1'
  );
  const [currentPage, setCurrentPage] = useState<PageName>(
    () => (new URLSearchParams(window.location.search).get('page') as PageName) || 'dashboard'
  );
  const [showLogin, setShowLogin] = useState(false);

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
      {renderContent()}
    </MainLayout>
  );
};

export default App;
