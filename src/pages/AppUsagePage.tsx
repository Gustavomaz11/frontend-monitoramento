import {
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageSection } from '../components/PageSection';
import { parentApi } from '../api/parentApi';
import { formatDateTime, formatDuration } from '../formatters';
import { useQuery } from '@tanstack/react-query';

export const AppUsagePage = () => {
  const appUsagesQuery = useQuery({ queryKey: ['app-usages'], queryFn: parentApi.listAppUsages, retry: false });
  const appUsages = appUsagesQuery.data ?? [];

  return (
    <Stack spacing={2}>
    <PageSection title="Filtros">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField label="Crianca" defaultValue="Todas" />
        <TextField label="Dispositivo" defaultValue="Todos" />
        <TextField label="Periodo" defaultValue="Hoje" />
      </Stack>
    </PageSection>
    <PageSection title="Uso diario por app" description="Aberturas sao estimativas do UsageStatsManager.">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={appUsages}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="appName" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="totalForegroundMs" name="Tempo em primeiro plano" fill="#176b5d" />
        </BarChart>
      </ResponsiveContainer>
    </PageSection>
    <PageSection title="Tabela de aplicativos">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>App</TableCell>
            <TableCell>Package</TableCell>
            <TableCell>Tempo</TableCell>
            <TableCell>Primeiro uso</TableCell>
            <TableCell>Ultimo uso</TableCell>
            <TableCell>Aberturas</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appUsages.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{app.appName ?? app.packageName}</TableCell>
              <TableCell>{app.packageName}</TableCell>
              <TableCell>{formatDuration(app.totalForegroundMs)}</TableCell>
              <TableCell>{formatDateTime(app.firstUsedAt)}</TableCell>
              <TableCell>{formatDateTime(app.lastUsedAt)}</TableCell>
              <TableCell>
                <Chip size="small" label={`${app.openCountEstimate} estimadas`} />
              </TableCell>
            </TableRow>
          ))}
          {appUsages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>Nenhum uso de aplicativo sincronizado.</TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </PageSection>
  </Stack>
  );
};
