import { Button, Grid, Stack, TextField, Typography } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import RuleIcon from '@mui/icons-material/Rule';
import { PageSection } from '../components/PageSection';
import { StatusChip } from '../components/StatusChip';
import { formatDateTime } from '../formatters';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parentApi } from '../api/parentApi';

export const AlertsPage = () => {
  const queryClient = useQueryClient();
  const alertsQuery = useQuery({
    queryKey: ['alerts'],
    queryFn: () => parentApi.listAlerts(),
    retry: false,
  });
  const updateStatus = useMutation({
    mutationFn: ({ alertId, status }: { alertId: string; status: 'read' | 'resolved' }) =>
      parentApi.updateAlertStatus(alertId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
  const alerts = alertsQuery.data ?? [];

  return (
    <Stack spacing={2}>
      <PageSection title="Filtros">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Severidade" defaultValue="Todas" />
          <TextField label="Status" defaultValue="Todos" />
          <TextField label="Tipo" defaultValue="Todos" />
        </Stack>
      </PageSection>
      <Grid container spacing={2}>
        {alerts.map((alert) => (
          <Grid key={alert.id} size={{ xs: 12, md: 6 }}>
            <PageSection title={alert.title}>
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1}>
                  <StatusChip value={alert.severity} />
                  <StatusChip value={alert.status} />
                </Stack>
                <Typography color="text.secondary">{alert.summary}</Typography>
                <Typography variant="body2">Criado em {formatDateTime(alert.createdAt)}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    startIcon={<DoneIcon />}
                    onClick={() => updateStatus.mutate({ alertId: alert.id, status: 'resolved' })}
                  >
                    Resolver
                  </Button>
                  <Button startIcon={<RuleIcon />}>Criar regra</Button>
                </Stack>
              </Stack>
            </PageSection>
          </Grid>
        ))}
        {alerts.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <PageSection title="Sem alertas">
              <Typography color="text.secondary">Nenhum alerta registrado.</Typography>
            </PageSection>
          </Grid>
        ) : null}
      </Grid>
    </Stack>
  );
};
