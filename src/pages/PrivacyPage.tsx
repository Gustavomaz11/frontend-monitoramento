import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadIcon from '@mui/icons-material/Download';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageSection } from '../components/PageSection';
import { parentApi } from '../api/parentApi';
import { tokenStore } from '../api/tokenStore';
import { formatDateTime } from '../formatters';
import type { DeviceConfig } from '../models/contracts';

const confirmationText = 'EXCLUIR';

export const PrivacyPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const devicesQuery = useQuery({ queryKey: ['devices'], queryFn: parentApi.listDevices });
  const activeDeviceId = selectedDeviceId || devicesQuery.data?.[0]?.id || '';
  const configQuery = useQuery({
    queryKey: ['device-config', activeDeviceId],
    queryFn: () => parentApi.getDeviceConfig(activeDeviceId),
    enabled: Boolean(activeDeviceId),
  });
  const updateConfig = useMutation({
    mutationFn: (config: DeviceConfig) => parentApi.updateDeviceConfig(activeDeviceId, config),
    onSuccess: (config) => queryClient.setQueryData(['device-config', activeDeviceId], config),
  });
  const exportRequest = useMutation({ mutationFn: parentApi.requestPrivacyExport });
  const deleteAll = useMutation({
    mutationFn: parentApi.requestDeleteAll,
    onSuccess: () => {
      tokenStore.clear();
      navigate('/login', { replace: true });
    },
  });

  const closeDeleteDialog = () => {
    if (deleteAll.isPending) return;
    setDeleteDialogOpen(false);
    setConfirmation('');
  };

  const saveConfig = (values: Partial<DeviceConfig>) => {
    if (!configQuery.data || !activeDeviceId) return;
    updateConfig.mutate({ ...configQuery.data, ...values });
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <PageSection title="Retencao de dados">
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">Prazo usado para minimizacao dos dados familiares.</Typography>
              <FormControl fullWidth>
                <InputLabel>Dispositivo</InputLabel>
                <Select label="Dispositivo" value={activeDeviceId} onChange={(event) => setSelectedDeviceId(event.target.value)}>
                  {(devicesQuery.data ?? []).map((device) => <MenuItem key={device.id} value={device.id}>{device.childDisplayName} - {device.name}</MenuItem>)}
                </Select>
              </FormControl>
              <Typography>Retencao: {configQuery.data?.retentionDays ?? 90} dias</Typography>
              <Slider
                value={configQuery.data?.retentionDays ?? 90}
                min={7}
                max={365}
                valueLabelDisplay="auto"
                disabled={!configQuery.data || updateConfig.isPending}
                onChangeCommitted={(_, value) => saveConfig({ retentionDays: Number(value) })}
              />
              {updateConfig.error ? <Alert severity="error">{updateConfig.error.message}</Alert> : null}
            </Stack>
          </PageSection>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PageSection title="Direitos e controles">
            <Stack spacing={2}>
              <Alert severity="warning">A exclusao total e irreversivel, revoga tokens e remove os dados pessoais e de monitoramento.</Alert>
              <Alert severity="info">A captura de sites é autorizada diretamente no celular, em Acessibilidade. Ela não usa VPN e não pode ser ativada remotamente.</Alert>
              <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography>UsageStats habilitado</Typography><Switch checked={configQuery.data?.usageStatsEnabled ?? false} disabled={!configQuery.data || updateConfig.isPending} onChange={(_, checked) => saveConfig({ usageStatsEnabled: checked })} /></Stack>
              <Button startIcon={<DownloadIcon />} onClick={() => exportRequest.mutate()} disabled={exportRequest.isPending}>Solicitar exportacao</Button>
              {exportRequest.data ? <Alert severity="success">Solicitacao registrada em {formatDateTime(exportRequest.data.createdAt)} para {exportRequest.data.devicesCount} dispositivo(s).</Alert> : null}
              {exportRequest.error ? <Alert severity="error">{exportRequest.error.message}</Alert> : null}
              <Button color="error" startIcon={<DeleteForeverIcon />} onClick={() => setDeleteDialogOpen(true)}>Excluir todos os dados</Button>
            </Stack>
          </PageSection>
        </Grid>
      </Grid>
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Excluir conta e dados</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="error">Dispositivos serao desvinculados e o acesso ao painel sera encerrado.</Alert>
            <TextField label={`Digite ${confirmationText} para confirmar`} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoFocus />
            {deleteAll.error ? <Alert severity="error">{deleteAll.error.message}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleteAll.isPending}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={() => deleteAll.mutate()} disabled={confirmation !== confirmationText || deleteAll.isPending}>Excluir definitivamente</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
