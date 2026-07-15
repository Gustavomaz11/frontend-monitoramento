import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CancelIcon from '@mui/icons-material/Cancel';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useQuery } from '@tanstack/react-query';
import { parentApi } from '../api/parentApi';
import { LiveStreamClient, type LiveStreamSource, type LiveStreamState } from '../live-streaming/LiveStreamClient';
import { PageSection } from '../components/PageSection';

const sourceLabels: Record<LiveStreamSource, string> = {
  camera_front: 'Camera frontal',
  camera_back: 'Camera traseira',
  screen: 'Tela do celular',
};

export const LiveViewPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [source, setSource] = useState<LiveStreamSource>('camera_back');
  const [streamState, setStreamState] = useState<LiveStreamState>('connecting');
  const [message, setMessage] = useState('Conectando ao canal ao vivo...');
  const [presence, setPresence] = useState<Record<string, boolean>>({});

  const devicesQuery = useQuery({ queryKey: ['devices'], queryFn: parentApi.listDevices, retry: false });
  const client = useMemo(() => new LiveStreamClient({
    onStateChanged: (state, nextMessage) => {
      setStreamState(state);
      setMessage(nextMessage);
    },
    onRemoteStream: (stream) => {
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      if (stream) void videoRef.current.play().catch(() => undefined);
    },
    onDevicePresenceChanged: (deviceId, online) => {
      setPresence((current) => ({ ...current, [deviceId]: online }));
    },
  }), []);

  useEffect(() => {
    void client.connect().catch((error: Error) => {
      setStreamState('error');
      setMessage(error.message);
    });
    return () => { void client.disconnect(); };
  }, [client]);

  useEffect(() => {
    const devices = devicesQuery.data ?? [];
    if (!selectedDeviceId && devices.length > 0) setSelectedDeviceId(devices[0].id);
    devices.forEach((device) => {
      void client.getDevicePresence(device.id)
        .then((online) => setPresence((current) => ({ ...current, [device.id]: online })))
        .catch(() => undefined);
    });
  }, [client, devicesQuery.data, selectedDeviceId]);

  const selectedDevice = devicesQuery.data?.find((device) => device.id === selectedDeviceId);
  const isOnline = selectedDeviceId ? presence[selectedDeviceId] === true : false;
  const isBusy = streamState === 'requesting' || streamState === 'streaming';

  const startStream = async () => {
    if (!selectedDeviceId) return;
    try {
      await client.start(selectedDeviceId, source);
    } catch (error) {
      setStreamState('error');
      setMessage(error instanceof Error ? error.message : 'Nao foi possivel iniciar a transmissao.');
    }
  };

  const stopStream = async () => {
    await client.stop();
    setStreamState('stopped');
    setMessage('Transmissao encerrada.');
  };

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        O celular precisa estar vinculado e com o modo ao vivo ativado. O Android mostra uma notificacao permanente enquanto camera ou tela podem ser transmitidas.
      </Alert>

      <PageSection title="Dispositivo e fonte">
        <Stack spacing={2}>
          {devicesQuery.isLoading ? <CircularProgress size={24} /> : null}
          {devicesQuery.error ? <Alert severity="error">{devicesQuery.error.message}</Alert> : null}
          <FormControl fullWidth>
            <InputLabel id="live-device-label">Dispositivo</InputLabel>
            <Select
              labelId="live-device-label"
              label="Dispositivo"
              value={selectedDeviceId}
              onChange={(event) => {
                void client.stop();
                setSelectedDeviceId(event.target.value);
              }}
            >
              {(devicesQuery.data ?? []).map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  {device.childDisplayName} — {device.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Chip
              icon={<PhoneAndroidIcon />}
              color={isOnline ? 'success' : 'default'}
              label={isOnline ? 'Modo ao vivo disponivel' : 'Dispositivo offline'}
            />
            {selectedDevice ? <Typography color="text.secondary">{selectedDevice.childDisplayName} — {selectedDevice.name}</Typography> : null}
          </Stack>

          <ToggleButtonGroup
            exclusive
            value={source}
            onChange={(_, value: LiveStreamSource | null) => value && setSource(value)}
            aria-label="Fonte da transmissao"
          >
            <ToggleButton value="camera_front"><CameraAltIcon sx={{ mr: 1 }} />Frontal</ToggleButton>
            <ToggleButton value="camera_back"><CameraswitchIcon sx={{ mr: 1 }} />Traseira</ToggleButton>
            <ToggleButton value="screen"><PhoneAndroidIcon sx={{ mr: 1 }} />Tela</ToggleButton>
          </ToggleButtonGroup>

          <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<CameraAltIcon />} disabled={!isOnline || isBusy} onClick={startStream}>
              Iniciar {sourceLabels[source].toLowerCase()}
            </Button>
            <Button variant="outlined" color="error" startIcon={<CancelIcon />} disabled={!isBusy} onClick={stopStream}>
              Encerrar
            </Button>
          </Stack>
        </Stack>
      </PageSection>

      <PageSection title={sourceLabels[source]}>
        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 260, md: 520 },
            bgcolor: '#101418',
            borderRadius: 2,
            overflow: 'hidden',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Box
            component="video"
            ref={videoRef}
            autoPlay
            muted
            playsInline
            aria-label="Video ao vivo do dispositivo"
            sx={{ width: '100%', maxHeight: 680, display: streamState === 'streaming' ? 'block' : 'none', objectFit: 'contain' }}
          />
          {streamState !== 'streaming' ? (
            <Stack alignItems="center" spacing={1.5} sx={{ color: 'white', p: 3, textAlign: 'center' }}>
              {streamState === 'connecting' || streamState === 'requesting' ? <CircularProgress color="inherit" /> : <CameraAltIcon sx={{ fontSize: 56, opacity: 0.65 }} />}
              <Typography>{message}</Typography>
            </Stack>
          ) : null}
        </Box>
        {streamState === 'error' ? <Alert severity="error" sx={{ mt: 2 }}>{message}</Alert> : null}
      </PageSection>
    </Stack>
  );
};
