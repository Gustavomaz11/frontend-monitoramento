import { Alert, Button, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQuery } from '@tanstack/react-query';
import { parentApi } from '../api/parentApi';
import { PageSection } from '../components/PageSection';
import { mockDomainAccesses } from '../data/mockData';
import { formatDateTime } from '../formatters';
import type { DomainAccessView } from '../models/contracts';

const mockDomainAccessViews: DomainAccessView[] = mockDomainAccesses.map((domain) => ({
  id: domain.localId,
  deviceId: 'device-1',
  childDisplayName: 'Crianca',
  deviceName: 'Celular Android',
  ...domain,
}));

export const DomainHistoryPage = () => {
  const domainAccessesQuery = useQuery({
    queryKey: ['domain-accesses'],
    queryFn: parentApi.listDomainAccesses,
    retry: false,
  });
  const rows = domainAccessesQuery.data ?? mockDomainAccessViews;

  return (
    <Stack spacing={2}>
      <Alert severity="warning">
        Dominios podem nao aparecer quando o Android ou o app usa DNS privado, DoH, QUIC ou VPN de terceiros. Horarios exibidos no fuso de Brasilia.
      </Alert>
      {domainAccessesQuery.error ? (
        <Alert severity="info">
          Nao foi possivel carregar a API agora; exibindo dados de exemplo ate o backend autenticado responder.
        </Alert>
      ) : null}
      <PageSection title="Filtros">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Periodo" defaultValue="Ultimos 7 dias" />
          <TextField label="Categoria" defaultValue="Todas" />
          <TextField label="Dominio" placeholder="youtube.com" />
          <Button startIcon={<RefreshIcon />} onClick={() => domainAccessesQuery.refetch()} sx={{ alignSelf: 'center' }}>
            Atualizar
          </Button>
        </Stack>
      </PageSection>
      <PageSection title="Historico de acessos">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Crianca</TableCell>
              <TableCell>Dominio</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>Protocolo</TableCell>
              <TableCell>Porta</TableCell>
              <TableCell>Primeiro</TableCell>
              <TableCell>Ultimo</TableCell>
              <TableCell>Acessos</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Correlacao</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((domain) => (
              <TableRow key={domain.id}>
                <TableCell>{domain.childDisplayName}</TableCell>
                <TableCell>{domain.domain ?? 'Nao identificado'}</TableCell>
                <TableCell>{domain.ipAddress ?? 'Indisponivel'}</TableCell>
                <TableCell>{domain.protocol}</TableCell>
                <TableCell>{domain.port ?? '-'}</TableCell>
                <TableCell>{formatDateTime(domain.firstAccessAt)}</TableCell>
                <TableCell>{formatDateTime(domain.lastAccessAt)}</TableCell>
                <TableCell>{domain.accessCount}</TableCell>
                <TableCell>{domain.category ?? 'unknown'}</TableCell>
                <TableCell>
                  <Chip size="small" label={domain.correlationType} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageSection>
    </Stack>
  );
};
