import { Button, Grid, Stack, Typography } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageSection } from '../components/PageSection';
import { parentApi } from '../api/parentApi';
import { formatDuration } from '../formatters';
import { useQuery } from '@tanstack/react-query';

export const ReportsPage = () => {
  const summaryQuery = useQuery({ queryKey: ['dashboard-summary'], queryFn: parentApi.getDashboardSummary, retry: false });
  const summary = summaryQuery.data;
  const topApp = summary?.topApps[0];
  const topDomain = summary?.topDomains[0];

  return (
    <Grid container spacing={2}>
    <Grid size={{ xs: 12, lg: 7 }}>
      <PageSection title="Resumo semanal">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary?.dailyPoints ?? []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="screenTimeHours" name="Horas de tela" fill="#176b5d" />
            <Bar dataKey="blockedAttempts" name="Tentativas bloqueadas" fill="#b42318" />
          </BarChart>
        </ResponsiveContainer>
      </PageSection>
    </Grid>
    <Grid size={{ xs: 12, lg: 5 }}>
      <PageSection title="Relatorio diario">
        <Stack spacing={1.5}>
          <Typography>
            Tempo de tela: <strong>{formatDuration(summary?.screenTimeTodayMs ?? 0)}</strong>
          </Typography>
          <Typography>
            Top app: <strong>{topApp?.appName ?? topApp?.packageName ?? 'Nenhum'}</strong>
          </Typography>
          <Typography>
            Top dominio: <strong>{topDomain?.domain ?? 'Nenhum'}</strong>
          </Typography>
          <Typography>Tentativas bloqueadas: {summary?.blockedAttemptsCount ?? 0}</Typography>
          <Button startIcon={<FileDownloadIcon />} disabled>
            Exportar CSV/PDF
          </Button>
        </Stack>
      </PageSection>
    </Grid>
  </Grid>
  );
};
