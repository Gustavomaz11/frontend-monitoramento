import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { tokenStore } from './api/tokenStore';

const loadPage = <T extends Record<string, unknown>>(loader: () => Promise<T>, name: keyof T) =>
  lazy(async () => ({ default: (await loader())[name] as ComponentType }));

const LoginPage = loadPage(() => import('./pages/LoginPage'), 'LoginPage');
const RegisterPage = loadPage(() => import('./pages/RegisterPage'), 'RegisterPage');
const DashboardPage = loadPage(() => import('./pages/DashboardPage'), 'DashboardPage');
const DevicePairingPage = loadPage(() => import('./pages/DevicePairingPage'), 'DevicePairingPage');
const AppUsagePage = loadPage(() => import('./pages/AppUsagePage'), 'AppUsagePage');
const DomainHistoryPage = loadPage(() => import('./pages/DomainHistoryPage'), 'DomainHistoryPage');
const CategoriesPage = loadPage(() => import('./pages/CategoriesPage'), 'CategoriesPage');
const AlertsPage = loadPage(() => import('./pages/AlertsPage'), 'AlertsPage');
const RulesPage = loadPage(() => import('./pages/RulesPage'), 'RulesPage');
const SchedulePage = loadPage(() => import('./pages/SchedulePage'), 'SchedulePage');
const ReportsPage = loadPage(() => import('./pages/ReportsPage'), 'ReportsPage');
const PrivacyPage = loadPage(() => import('./pages/PrivacyPage'), 'PrivacyPage');

const RequireAuth = ({ children }: { children: ReactNode }) =>
  tokenStore.hasSession() ? children : <Navigate to="/login" replace />;

const PublicOnly = ({ children }: { children: ReactNode }) =>
  tokenStore.hasSession() ? <Navigate to="/dashboard" replace /> : children;

const LoadingPage = () => (
  <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
    <CircularProgress aria-label="Carregando" />
  </Box>
);

export const App = () => (
  <Suspense fallback={<LoadingPage />}>
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
      <Route path="*" element={<Navigate to={tokenStore.hasSession() ? '/dashboard' : '/login'} replace />} />
    </Routes>
  </Suspense>
);
