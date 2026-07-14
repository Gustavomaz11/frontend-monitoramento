import { Alert, Button, Grid, Slider, Stack, Switch, TextField, Typography } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadIcon from '@mui/icons-material/Download';
import { PageSection } from '../components/PageSection';
import { useMutation } from '@tanstack/react-query';
import { parentApi } from '../api/parentApi';
import { formatDateTime } from '../formatters';

export const PrivacyPage = () => {
  const exportRequest = useMutation({ mutationFn: parentApi.requestPrivacyExport });
  const deleteAll = useMutation({ mutationFn: parentApi.requestDeleteAll });

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <PageSection title="Retencao de dados">
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Prazo usado para reduzir dados antigos conforme minimizacao e finalidade familiar.
            </Typography>
            <Slider defaultValue={90} min={7} max={365} valueLabelDisplay="auto" />
            <TextField label="Texto de transparencia exibido no Android" multiline minRows={5} defaultValue="Este celular possui protecao parental ativa. O app registra uso de aplicativos e metadados de DNS quando a VPN local esta ativa. Nao coleta mensagens, senhas, tela, camera, microfone ou conteudo de rede." />
          </Stack>
        </PageSection>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <PageSection title="Direitos e controles">
          <Stack spacing={2}>
            <Alert severity="warning">A exclusao total revoga tokens, remove telemetria e preserva apenas auditoria minima.</Alert>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography>VPN habilitada no dispositivo</Typography>
              <Switch defaultChecked />
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography>UsageStats habilitado</Typography>
              <Switch defaultChecked />
            </Stack>
            <Button startIcon={<DownloadIcon />} onClick={() => exportRequest.mutate()}>
              Solicitar exportacao
            </Button>
            {exportRequest.data ? (
              <Alert severity="success">
                Exportacao aceita em {formatDateTime(exportRequest.data.createdAt)}: {exportRequest.data.devicesCount} dispositivo(s).
              </Alert>
            ) : null}
            <Button color="error" startIcon={<DeleteForeverIcon />} onClick={() => deleteAll.mutate()}>
              Excluir todos os dados
            </Button>
            {deleteAll.data ? <Alert severity="success">Exclusao registrada: {deleteAll.data.status}</Alert> : null}
            {deleteAll.error ? <Alert severity="error">{deleteAll.error.message}</Alert> : null}
          </Stack>
        </PageSection>
      </Grid>
    </Grid>
  );
};
