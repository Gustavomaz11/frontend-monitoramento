import { useState } from 'react';
import {
  Alert,
  Button,
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
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import { parentApi, type DomainAccessFilters } from '../api/parentApi';
import { PageSection } from '../components/PageSection';
import { formatDateTime } from '../formatters';

const categories = ['social', 'video', 'games', 'education', 'news', 'adult', 'gambling', 'unknown', 'malicious', 'violence'];

const sourceLabels = {
  dns: 'Consulta DNS',
  sni_if_available: 'SNI',
  ip_only: 'Somente IP',
  manual: 'Manual',
  unknown: 'Desconhecida',
} as const;

export const DomainHistoryPage = () => {
  const [draft, setDraft] = useState<DomainAccessFilters>({});
  const [filters, setFilters] = useState<DomainAccessFilters>({ page: 1, pageSize: 25 });
  const devicesQuery = useQuery({ queryKey: ['devices'], queryFn: parentApi.listDevices });
  const domainAccessesQuery = useQuery({
    queryKey: ['domain-accesses', filters],
    queryFn: () => parentApi.listDomainAccesses(filters),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
  const page = domainAccessesQuery.data;
  const rows = page?.items ?? [];

  const applyFilters = () => {
    setFilters({
      ...draft,
      from: draft.from ? `${draft.from}T00:00:00-03:00` : undefined,
      to: draft.to ? `${draft.to}T23:59:59-03:00` : undefined,
      page: 1,
      pageSize: filters.pageSize,
    });
  };

  return (
    <Stack spacing={2}>
      <Alert severity="warning">
        Consulta DNS identifica o dominio, nao a pagina completa, e pode incluir antecipacoes do navegador. DNS privado,
        DoH, QUIC ou VPN de terceiros podem impedir a identificacao. Horarios no fuso de Brasilia.
      </Alert>
      <PageSection title="Filtros">
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
          <FormControl sx={{ minWidth: 190 }}>
            <InputLabel>Crianca / dispositivo</InputLabel>
            <Select
              label="Crianca / dispositivo"
              value={draft.deviceId ?? ''}
              onChange={(event) => setDraft((current) => ({ ...current, deviceId: event.target.value || undefined }))}
            >
              <MenuItem value="">Todos</MenuItem>
              {(devicesQuery.data ?? []).map((device) => (
                <MenuItem key={device.id} value={device.id}>{device.childDisplayName} - {device.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Dominio"
            placeholder="youtube.com"
            value={draft.domain ?? ''}
            onChange={(event) => setDraft((current) => ({ ...current, domain: event.target.value }))}
          />
          <FormControl sx={{ minWidth: 170 }}>
            <InputLabel>Categoria</InputLabel>
            <Select
              label="Categoria"
              value={draft.category ?? ''}
              onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value || undefined }))}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField type="date" label="Inicio" InputLabelProps={{ shrink: true }} onChange={(event) => setDraft((current) => ({ ...current, from: event.target.value }))} />
          <TextField type="date" label="Fim" InputLabelProps={{ shrink: true }} onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value }))} />
          <Button variant="contained" startIcon={<SearchIcon />} onClick={applyFilters}>Aplicar</Button>
        </Stack>
      </PageSection>
      {domainAccessesQuery.isFetching ? <LinearProgress /> : null}
      {domainAccessesQuery.error ? <Alert severity="error">{domainAccessesQuery.error.message}</Alert> : null}
      <PageSection title="Historico de acessos">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Crianca</TableCell><TableCell>Dominio</TableCell><TableCell>IP</TableCell>
              <TableCell>Protocolo</TableCell><TableCell>Primeiro</TableCell><TableCell>Ultimo</TableCell>
              <TableCell>Acessos</TableCell><TableCell>Categoria</TableCell><TableCell>Origem</TableCell>
              <TableCell>Correlacao</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((domain) => (
              <TableRow key={domain.id}>
                <TableCell>{domain.childDisplayName}</TableCell>
                <TableCell>{domain.domain ?? 'Nao identificado'}</TableCell>
                <TableCell>{domain.source === 'dns' ? 'Resolver local' : (domain.ipAddress ?? 'Indisponivel')}</TableCell>
                <TableCell>{domain.protocol}{domain.port ? `:${domain.port}` : ''}</TableCell>
                <TableCell>{formatDateTime(domain.firstAccessAt)}</TableCell>
                <TableCell>{formatDateTime(domain.lastAccessAt)}</TableCell>
                <TableCell>{domain.accessCount}</TableCell>
                <TableCell>{domain.category ?? 'unknown'}</TableCell>
                <TableCell>{sourceLabels[domain.source]}</TableCell>
                <TableCell>{domain.correlationType}</TableCell>
              </TableRow>
            ))}
            {!domainAccessesQuery.isFetching && rows.length === 0 ? <TableRow><TableCell colSpan={10}>Nenhum dominio encontrado.</TableCell></TableRow> : null}
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
