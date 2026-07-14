import { Button, Grid, Stack, Typography } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageSection } from '../components/PageSection';
import { mockAppUsages, mockDailyPoints, mockDomainAccesses } from '../data/mockData';
import { formatDuration } from '../formatters';

export const ReportsPage = () => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, lg: 7 }}>
      <PageSection title="Resumo semanal">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockDailyPoints}>
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
            Tempo de tela: <strong>{formatDuration(mockAppUsages.reduce((sum, app) => sum + app.totalForegroundMs, 0))}</strong>
          </Typography>
          <Typography>
            Top app: <strong>{mockAppUsages[0].appName}</strong>
          </Typography>
          <Typography>
            Top dominio: <strong>{mockDomainAccesses[0].domain}</strong>
          </Typography>
          <Typography>Tentativas bloqueadas: 2</Typography>
          <Button startIcon={<FileDownloadIcon />} disabled>
            Exportar CSV/PDF
          </Button>
        </Stack>
      </PageSection>
    </Grid>
  </Grid>
);
