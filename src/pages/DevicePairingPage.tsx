import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageSection } from '../components/PageSection';
import { parentApi } from '../api/parentApi';
import { formatDateTime } from '../formatters';
import type { DeviceSummary } from '../models/contracts';

export const DevicePairingPage = () => {
  const queryClient = useQueryClient();
  const [childName, setChildName] = useState('Crianca');
  const [deviceName, setDeviceName] = useState('Celular Android');
  const [deviceToRemove, setDeviceToRemove] = useState<DeviceSummary | null>(null);
  const devices = useQuery({
    queryKey: ['devices'],
    queryFn: parentApi.listDevices,
    retry: false,
  });

  const createCode = useMutation({
    mutationFn: () => parentApi.createPairingCode(childName, deviceName),
  });
  const removeDevice = useMutation({
    mutationFn: parentApi.revokeDevice,
    onSuccess: async () => {
      setDeviceToRemove(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['devices'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['app-usages'] }),
        queryClient.invalidateQueries({ queryKey: ['domain-accesses'] }),
      ]);
    },
  });

  const deviceRows = devices.data ?? [];

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 5 }}>
        <PageSection
          title="Novo codigo"
          description="O codigo expira rapidamente e deve ser usado no app Android da crianca."
        >
          <Stack spacing={2}>
            <TextField label="Nome da crianca" value={childName} onChange={(event) => setChildName(event.target.value)} />
            <TextField label="Nome do dispositivo" value={deviceName} onChange={(event) => setDeviceName(event.target.value)} />
            <Button
              variant="contained"
              startIcon={<QrCode2Icon />}
              onClick={() => createCode.mutate()}
              disabled={createCode.isPending}
            >
              Gerar QR Code
            </Button>
            {createCode.data ? (
              <Alert severity="success">
                Codigo {createCode.data.pairingCode} valido ate {formatDateTime(createCode.data.expiresAt)}.
              </Alert>
            ) : null}
            {createCode.error ? <Alert severity="error">{createCode.error.message}</Alert> : null}
          </Stack>
        </PageSection>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <PageSection title="Dispositivos vinculados">
          <Stack spacing={1.5}>
            <Button startIcon={<RefreshIcon />} onClick={() => devices.refetch()} sx={{ alignSelf: 'flex-start' }}>
              Atualizar
            </Button>
            {deviceRows.map((device) => (
              <Box
                key={device.id}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, display: 'flex', gap: 1.5, alignItems: 'center' }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={700}>{device.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {device.childDisplayName} | {device.status} | ultima sync {formatDateTime(device.lastSyncAt)}
                  </Typography>
                </Box>
                <Tooltip title="Remover dispositivo">
                  <IconButton color="error" aria-label={`Remover ${device.name}`} onClick={() => setDeviceToRemove(device)}>
                    <DeleteOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
            {deviceRows.length === 0 ? (
              <Typography color="text.secondary">Nenhum dispositivo vinculado.</Typography>
            ) : null}
          </Stack>
        </PageSection>
      </Grid>
      <Dialog open={deviceToRemove !== null} onClose={() => !removeDevice.isPending && setDeviceToRemove(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Remover dispositivo</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography>
              O dispositivo {deviceToRemove?.name} sera desvinculado e nao podera mais sincronizar dados.
              O historico ja recebido sera mantido.
            </Typography>
            {removeDevice.error ? <Alert severity="error">{removeDevice.error.message}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeviceToRemove(null)} disabled={removeDevice.isPending}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!deviceToRemove || removeDevice.isPending}
            onClick={() => deviceToRemove && removeDevice.mutate(deviceToRemove.id)}
          >
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};
