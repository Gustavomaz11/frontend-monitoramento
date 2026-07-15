import { Alert, Grid, LinearProgress, Stack, Typography } from '@mui/material';
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
import { parentApi } from '../api/parentApi';
import { formatDateTime, formatDuration } from '../formatters';
import { useQuery } from '@tanstack/react-query';

export const DashboardPage = () => {
  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: parentApi.getDashboardSummary,
    retry: false,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
  const summary = summaryQuery.data;

  return (
    <Stack spacing={2}>
    {summaryQuery.isFetching ? <LinearProgress /> : null}
    {summaryQuery.error ? <Alert severity="error">{summaryQuery.error.message}</Alert> : null}
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <MetricCard
          label="Tempo total de tela"
          value={formatDuration(summary?.screenTimeTodayMs ?? 0)}
          detail="Hoje"
          icon={<AccessTimeIcon color="primary" />}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <MetricCard
          label="Tentativas bloqueadas"
          value={String(summary?.blockedAttemptsCount ?? 0)}
          detail="Ultimas 24 horas"
          icon={<BlockIcon color="error" />}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <MetricCard
          label="Status do celular"
          value={summary?.deviceStatus ?? 'sem dispositivos'}
          detail="API online"
          icon={<PhoneAndroidIcon color="secondary" />}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <MetricCard
          label="Ultima sincronizacao"
          value={formatDateTime(summary?.lastSyncAt)}
          detail={summaryQuery.isError ? 'Erro ao carregar API' : 'Backend Render'}
          icon={<CloudSyncIcon color="primary" />}
        />
      </Grid>
    </Grid>

    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 7 }}>
        <PageSection title="Comparacao com os sete dias anteriores">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={summary?.dailyPoints ?? []}>
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
            <BarChart data={summary?.categories ?? []}>
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
            {(summary?.topApps ?? []).map((app) => (
              <Typography key={app.id}>
                <strong>{app.appName ?? app.packageName}</strong> | {formatDuration(app.totalForegroundMs)} | {app.openCountEstimate} aberturas
              </Typography>
            ))}
            {(summary?.topApps ?? []).length === 0 ? <Typography color="text.secondary">Nenhum aplicativo sincronizado.</Typography> : null}
          </Stack>
        </PageSection>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <PageSection title="Dominios mais acessados">
          <Stack spacing={1}>
            {(summary?.topDomains ?? []).map((domain) => (
              <Typography key={domain.id}>
                <strong>{domain.domain ?? 'Desconhecido'}</strong> | {domain.category ?? 'sem categoria'} | {domain.accessCount} acessos
              </Typography>
            ))}
            {(summary?.topDomains ?? []).length === 0 ? <Typography color="text.secondary">Nenhum dominio sincronizado.</Typography> : null}
          </Stack>
        </PageSection>
      </Grid>
    </Grid>
  </Stack>
  );
};
