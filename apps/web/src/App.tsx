import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { useAuth } from './hooks/useAuth';
import { ApprovalPage } from './pages/ApprovalPage';
import { ClientsPage } from './pages/ClientsPage';
import { CreateQuotationPage } from './pages/CreateQuotationPage';
import { DashboardPage } from './pages/DashboardPage';
import { DataTablePage } from './pages/DataTablePage';
import { LoginPage } from './pages/LoginPage';
import { PortalPage } from './pages/PortalPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { QuotationDetailPage } from './pages/QuotationDetailPage';
import { QuotationsPage } from './pages/QuotationsPage';

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading workspace...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/portal/:token" element={<PortalPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/quotations" element={<QuotationsPage />} />
        <Route path="/quotations/new" element={<CreateQuotationPage />} />
        <Route path="/quotations/:quotationId" element={<QuotationDetailPage />} />
        <Route path="/approvals" element={<ApprovalPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/data" element={<DataTablePage />} />
      </Route>
    </Routes>
  );
}
