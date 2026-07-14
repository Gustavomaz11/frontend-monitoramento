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
import { mockAppUsages } from '../data/mockData';
import { formatDateTime, formatDuration } from '../formatters';

export const AppUsagePage = () => (
  <Stack spacing={2}>
    <PageSection title="Filtros">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField label="Crianca" defaultValue="Crianca" />
        <TextField label="Dispositivo" defaultValue="Celular Android" />
        <TextField label="Periodo" defaultValue="Hoje" />
      </Stack>
    </PageSection>
    <PageSection title="Uso diario por app" description="Aberturas sao estimativas do UsageStatsManager.">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={mockAppUsages}>
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
          {mockAppUsages.map((app) => (
            <TableRow key={app.localId}>
              <TableCell>{app.appName}</TableCell>
              <TableCell>{app.packageName}</TableCell>
              <TableCell>{formatDuration(app.totalForegroundMs)}</TableCell>
              <TableCell>{formatDateTime(app.firstUsedAt)}</TableCell>
              <TableCell>{formatDateTime(app.lastUsedAt)}</TableCell>
              <TableCell>
                <Chip size="small" label={`${app.openCountEstimate} estimadas`} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageSection>
  </Stack>
);
