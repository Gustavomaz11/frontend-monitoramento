import { Navigate, Route, Routes } from 'react-router-dom';
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

export const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/cadastro" element={<RegisterPage />} />
    <Route path="/" element={<AppLayout />}>
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
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);
