import { useState } from 'react';
import {
  Alert,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { PageSection } from '../components/PageSection';
import { parentApi, type AppUsageFilters } from '../api/parentApi';
import { formatDateTime, formatDuration } from '../formatters';

const todayInBrasilia = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

export const AppUsagePage = () => {
  const today = todayInBrasilia();
  const [filters, setFilters] = useState<AppUsageFilters>({ from: today, to: today, page: 1, pageSize: 25 });
  const devicesQuery = useQuery({ queryKey: ['devices'], queryFn: parentApi.listDevices });
  const appUsagesQuery = useQuery({
    queryKey: ['app-usages', filters],
    queryFn: () => parentApi.listAppUsages(filters),
  });
  const page = appUsagesQuery.data;
  const appUsages = page?.items ?? [];

  return (
    <Stack spacing={2}>
      <PageSection title="Filtros">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Crianca / dispositivo</InputLabel>
            <Select
              label="Crianca / dispositivo"
              value={filters.deviceId ?? ''}
              onChange={(event) => setFilters((current) => ({ ...current, deviceId: event.target.value || undefined, page: 1 }))}
            >
              <MenuItem value="">Todos</MenuItem>
              {(devicesQuery.data ?? []).map((device) => (
                <MenuItem key={device.id} value={device.id}>{device.childDisplayName} - {device.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField type="date" label="Inicio" value={filters.from} InputLabelProps={{ shrink: true }} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value, page: 1 }))} />
          <TextField type="date" label="Fim" value={filters.to} InputLabelProps={{ shrink: true }} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value, page: 1 }))} />
        </Stack>
      </PageSection>
      {appUsagesQuery.isFetching ? <LinearProgress /> : null}
      {appUsagesQuery.error ? <Alert severity="error">{appUsagesQuery.error.message}</Alert> : null}
      <PageSection title="Uso diario por app" description="Aberturas sao estimativas do UsageStatsManager.">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={appUsages}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="appName" /><YAxis /><Tooltip />
            <Bar dataKey="totalForegroundMs" name="Tempo em primeiro plano" fill="#176b5d" />
          </BarChart>
        </ResponsiveContainer>
      </PageSection>
      <PageSection title="Tabela de aplicativos">
        <Table size="small">
          <TableHead><TableRow><TableCell>App</TableCell><TableCell>Package</TableCell><TableCell>Tempo</TableCell><TableCell>Primeiro uso</TableCell><TableCell>Ultimo uso</TableCell><TableCell>Aberturas</TableCell></TableRow></TableHead>
          <TableBody>
            {appUsages.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.appName ?? app.packageName}</TableCell><TableCell>{app.packageName}</TableCell>
                <TableCell>{formatDuration(app.totalForegroundMs)}</TableCell><TableCell>{formatDateTime(app.firstUsedAt)}</TableCell>
                <TableCell>{formatDateTime(app.lastUsedAt)}</TableCell><TableCell>{app.openCountEstimate} estimadas</TableCell>
              </TableRow>
            ))}
            {!appUsagesQuery.isFetching && appUsages.length === 0 ? <TableRow><TableCell colSpan={6}>Nenhum uso encontrado.</TableCell></TableRow> : null}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={page?.totalCount ?? 0}
          page={(page?.page ?? 1) - 1}
          rowsPerPage={page?.pageSize ?? 25}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onPageChange={(_, nextPage) => setFilters((current) => ({ ...current, page: nextPage + 1 }))}
          onRowsPerPageChange={(event) => setFilters((current) => ({ ...current, page: 1, pageSize: Number(event.target.value) }))}
        />
      </PageSection>
    </Stack>
  );
};
