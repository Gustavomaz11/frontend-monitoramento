import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppLayout } from './layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DevicePairingPage } from './pages/DevicePairingPage';
import { AppUsagePage } from './pages/AppUsagePage';
import { DomainHistoryPage } from './pages/DomainHistoryPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AlertsPage } from './pages/AlertsPage';
import { RulesPage } from './pages/RulesPage';
import { SchedulePage } from './pages/SchedulePage';
import { ReportsPage } from './pages/ReportsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { tokenStore } from './api/tokenStore';

const RequireAuth = ({ children }: { children: ReactNode }) => {
  if (!tokenStore.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicOnly = ({ children }: { children: ReactNode }) => {
  if (tokenStore.isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const App = () => (
  <Routes>
    <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
    <Route path="/cadastro" element={<PublicOnly><RegisterPage /></PublicOnly>} />
    <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="vinculacao" element={<DevicePairingPage />} />
      <Route path="aplicativos" element={<AppUsagePage />} />
      <Route path="dominios" element={<DomainHistoryPage />} />
      <Route path="categorias" element={<CategoriesPage />} />
      <Route path="alertas" element={<AlertsPage />} />
      <Route path="regras" element={<RulesPage />} />
      <Route path="horarios" element={<SchedulePage />} />
      <Route path="relatorios" element={<ReportsPage />} />
      <Route path="privacidade" element={<PrivacyPage />} />
    </Route>
    <Route path="*" element={<Navigate to={tokenStore.isAuthenticated() ? '/dashboard' : '/login'} replace />} />
  </Routes>
);
