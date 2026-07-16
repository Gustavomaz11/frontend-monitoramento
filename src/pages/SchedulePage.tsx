import { useEffect, useState } from 'react';
import { Alert, Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Switch, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageSection } from '../components/PageSection';
import { parentApi } from '../api/parentApi';
import type { DailyUsageWindow, DeviceConfig } from '../models/contracts';

const dayNames = ['Segunda-feira', 'Terca-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado', 'Domingo'];
const unrestrictedSchedule = (): DailyUsageWindow[] =>
  dayNames.map((_, index) => ({ dayOfWeek: index + 1, enabled: true, startMinute: 0, endMinute: 1440 }));
const toTime = (minute: number) => `${String(Math.floor(minute / 60) % 24).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
const fromTime = (value: string, endOfDay = false) => {
  const [hour, minute] = value.split(':').map(Number);
  if (endOfDay && hour === 0 && minute === 0) return 1440;
  return hour * 60 + minute;
};

export const SchedulePage = () => {
  const queryClient = useQueryClient();
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [schedule, setSchedule] = useState<DailyUsageWindow[]>(unrestrictedSchedule);
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const devices = useQuery({ queryKey: ['devices'], queryFn: parentApi.listDevices });
  const activeDeviceId = selectedDeviceId || devices.data?.[0]?.id || '';
  const config = useQuery({
    queryKey: ['device-config', activeDeviceId],
    queryFn: () => parentApi.getDeviceConfig(activeDeviceId),
    enabled: Boolean(activeDeviceId),
  });
  const save = useMutation({
    mutationFn: (value: DeviceConfig) => parentApi.updateDeviceConfig(activeDeviceId, value),
    onSuccess: (value) => queryClient.setQueryData(['device-config', activeDeviceId], value),
  });

  useEffect(() => {
    if (!config.data) return;
    setSchedule(config.data.usageSchedule);
    setTimezone(config.data.timezone);
  }, [config.data]);

  const updateDay = (dayOfWeek: number, values: Partial<DailyUsageWindow>) => {
    setSchedule((current) => current.map((day) => day.dayOfWeek === dayOfWeek ? { ...day, ...values } : day));
  };

  const saveSchedule = () => {
    if (!config.data || !activeDeviceId) return;
    save.mutate({ ...config.data, timezone, usageSchedule: schedule });
  };

  return (
    <Stack spacing={2}>
      <PageSection title="Grade semanal" description="Defina quando cada celular pode ser utilizado.">
        <FormControl fullWidth>
          <InputLabel>Dispositivo</InputLabel>
          <Select label="Dispositivo" value={activeDeviceId} onChange={(event) => setSelectedDeviceId(event.target.value)}>
            {(devices.data ?? []).map((device) => (
              <MenuItem key={device.id} value={device.id}>{device.childDisplayName} - {device.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Fuso horario"
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
          helperText="Exemplo: America/Sao_Paulo"
        />
        <Alert severity="info">
          Dias desativados ficam totalmente bloqueados. A nova grade chega ao celular na proxima sincronizacao, normalmente em ate 15 minutos.
        </Alert>
        <Alert severity="warning">
          A aplicacao dos horarios exige que a permissao &quot;Captura de sites acessados&quot; permaneca ativa em Acessibilidade no celular.
        </Alert>
        {devices.data?.length === 0 ? <Alert severity="warning">Nenhum dispositivo vinculado.</Alert> : null}
        <Grid container spacing={1.5}>
          {schedule.map((day) => (
            <Grid key={day.dayOfWeek} size={{ xs: 12, md: 6, lg: 4 }}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={700}>{dayNames[day.dayOfWeek - 1]}</Typography>
                    <Switch checked={day.enabled} onChange={(_, enabled) => updateDay(day.dayOfWeek, { enabled })} />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Inicio"
                      value={toTime(day.startMinute)}
                      disabled={!day.enabled}
                      slotProps={{ inputLabel: { shrink: true } }}
                      onChange={(event) => updateDay(day.dayOfWeek, { startMinute: fromTime(event.target.value) })}
                    />
                    <TextField
                      fullWidth
                      type="time"
                      label="Fim"
                      value={toTime(day.endMinute)}
                      disabled={!day.enabled}
                      slotProps={{ inputLabel: { shrink: true } }}
                      onChange={(event) => updateDay(day.dayOfWeek, { endMinute: fromTime(event.target.value, true) })}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {day.enabled ? `Permitido entre ${toTime(day.startMinute)} e ${toTime(day.endMinute)}` : 'Uso nao permitido neste dia'}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
        {config.error ? <Alert severity="error">{config.error.message}</Alert> : null}
        {save.error ? <Alert severity="error">{save.error.message}</Alert> : null}
        {save.isSuccess ? <Alert severity="success">Horarios salvos com sucesso.</Alert> : null}
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{ alignSelf: 'flex-start' }}
          disabled={!config.data || save.isPending || schedule.some((day) => day.enabled && day.startMinute >= day.endMinute)}
          onClick={saveSchedule}
        >
          {save.isPending ? 'Salvando...' : 'Salvar horarios'}
        </Button>
      </PageSection>
    </Stack>
  );
};
