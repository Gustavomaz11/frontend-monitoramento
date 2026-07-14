import { useState } from 'react';
import { Alert, Box, Button, Grid, Stack, TextField, Typography } from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PageSection } from '../components/PageSection';
import { parentApi } from '../api/parentApi';
import { mockDevices } from '../data/mockData';
import { formatDateTime } from '../formatters';

export const DevicePairingPage = () => {
  const [childName, setChildName] = useState('Crianca');
  const [deviceName, setDeviceName] = useState('Celular Android');
  const devices = useQuery({
    queryKey: ['devices'],
    queryFn: parentApi.listDevices,
    retry: false,
  });

  const createCode = useMutation({
    mutationFn: () => parentApi.createPairingCode(childName, deviceName),
  });

  const deviceRows = devices.data ?? mockDevices;

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
              <Box key={device.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                <Typography fontWeight={700}>{device.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {device.childDisplayName} | {device.status} | ultima sync {formatDateTime(device.lastSyncAt)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </PageSection>
      </Grid>
    </Grid>
  );
};
