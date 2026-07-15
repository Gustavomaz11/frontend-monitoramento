import {
  Alert,
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DevicesIcon from '@mui/icons-material/Devices';
import AppsIcon from '@mui/icons-material/Apps';
import PublicIcon from '@mui/icons-material/Public';
import CategoryIcon from '@mui/icons-material/Category';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GppGoodIcon from '@mui/icons-material/GppGood';
import EventIcon from '@mui/icons-material/Event';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import LogoutIcon from '@mui/icons-material/Logout';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import { parentApi } from '../api/parentApi';
import { tokenStore } from '../api/tokenStore';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 280;

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Vinculacao', path: '/vinculacao', icon: <DevicesIcon /> },
  { label: 'Visualizacao ao vivo', path: '/ao-vivo', icon: <LiveTvIcon /> },
  { label: 'Uso de aplicativos', path: '/aplicativos', icon: <AppsIcon /> },
  { label: 'Historico de dominios', path: '/dominios', icon: <PublicIcon /> },
  { label: 'Categorias', path: '/categorias', icon: <CategoryIcon /> },
  { label: 'Alertas', path: '/alertas', icon: <NotificationsIcon /> },
  { label: 'Sites bloqueados', path: '/regras', icon: <GppGoodIcon /> },
  { label: 'Horarios', path: '/horarios', icon: <EventIcon /> },
  { label: 'Relatorios', path: '/relatorios', icon: <AssessmentIcon /> },
  { label: 'Privacidade', path: '/privacidade', icon: <PrivacyTipIcon /> },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/vinculacao': 'Vinculacao de dispositivo',
  '/ao-vivo': 'Visualizacao ao vivo',
  '/aplicativos': 'Uso de aplicativos',
  '/dominios': 'Historico de dominios',
  '/categorias': 'Categorias acessadas',
  '/alertas': 'Alertas',
  '/regras': 'Sites bloqueados e permitidos',
  '/horarios': 'Configuracao de horarios',
  '/relatorios': 'Relatorio diario e semanal',
  '/privacidade': 'Configuracoes de privacidade',
};

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = async () => {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      if (refreshToken) await parentApi.logout(refreshToken);
    } finally {
      tokenStore.clear();
      navigate('/login', { replace: true });
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Stack spacing={1.5} sx={{ px: 2.5, py: 2.5 }}>
          <Typography variant="h6">Navegacao Segura</Typography>
          <Typography variant="body2" color="text.secondary">
            Painel transparente para responsaveis.
          </Typography>
        </Stack>
        <Divider />
        <List sx={{ px: 1.5, py: 1.5 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h5">{pageTitles[location.pathname] ?? 'Painel'}</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Dados agregados. Sem mensagens, senhas ou conteudo de rede.
              </Typography>
              <Button startIcon={<LogoutIcon />} onClick={logout}>
                Sair
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Todos os dados exibidos vem da API. Se nao houver sincronizacao, as telas mostram listas vazias ou valores zerados.
          </Alert>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
