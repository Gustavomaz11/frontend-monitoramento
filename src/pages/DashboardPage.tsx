import { Grid, Stack, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BlockIcon from '@mui/icons-material/Block';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { PageSection } from '../components/PageSection';
import {
  mockCategories,
  mockDailyPoints,
  mockDashboardSummary,
  mockDevices,
  mockDomainAccesses,
} from '../data/mockData';
import { formatDateTime, formatDuration } from '../formatters';

export const DashboardPage = () => (
  <Stack spacing={2}>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <MetricCard
          label="Tempo total de tela"
          value={formatDuration(mockDashboardSummary.screenTimeTodayMs)}
          detail="Hoje"
          icon={<AccessTimeIcon color="primary" />}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <MetricCard
          label="Tentativas bloqueadas"
          value={String(mockDashboardSummary.blockedAttemptsCount)}
          detail="Ultimas 24 horas"
          icon={<BlockIcon color="error" />}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <MetricCard
          label="Status do celular"
          value={mockDevices[0].status}
          detail={mockDevices[0].name}
          icon={<PhoneAndroidIcon color="secondary" />}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <MetricCard
          label="Ultima sincronizacao"
          value={formatDateTime(mockDashboardSummary.lastSyncAt)}
          detail="API de analytics pendente"
          icon={<CloudSyncIcon color="primary" />}
        />
      </Grid>
    </Grid>

    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 7 }}>
        <PageSection title="Comparacao com os sete dias anteriores">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={mockDailyPoints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="screenTimeHours" name="Horas de tela" stroke="#176b5d" strokeWidth={2} />
              <Line type="monotone" dataKey="blockedAttempts" name="Bloqueios" stroke="#b42318" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </PageSection>
      </Grid>
      <Grid size={{ xs: 12, lg: 5 }}>
        <PageSection title="Categorias mais acessadas">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mockCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="accessCount" name="Acessos" fill="#385b82" />
            </BarChart>
          </ResponsiveContainer>
        </PageSection>
      </Grid>
    </Grid>

    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <PageSection title="Aplicativos mais utilizados">
          <Stack spacing={1}>
            {mockDashboardSummary.topApps.map((app) => (
              <Typography key={app.localId}>
                <strong>{app.appName}</strong> | {formatDuration(app.totalForegroundMs)} | {app.openCountEstimate} aberturas
              </Typography>
            ))}
          </Stack>
        </PageSection>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <PageSection title="Dominios mais acessados">
          <Stack spacing={1}>
            {mockDomainAccesses.map((domain) => (
              <Typography key={domain.localId}>
                <strong>{domain.domain ?? 'Desconhecido'}</strong> | {domain.category ?? 'sem categoria'} | {domain.accessCount} acessos
              </Typography>
            ))}
          </Stack>
        </PageSection>
      </Grid>
    </Grid>
  </Stack>
);
