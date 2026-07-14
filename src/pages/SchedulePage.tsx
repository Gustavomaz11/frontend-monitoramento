import { Box, Button, Grid, Slider, Stack, Switch, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { PageSection } from '../components/PageSection';

const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

export const SchedulePage = () => (
  <Stack spacing={2}>
    <PageSection title="Grade semanal" description="Defina janelas permitidas sem ocultar a regra da crianca.">
      <Grid container spacing={1.5}>
        {days.map((day, index) => (
          <Grid key={day} size={{ xs: 12, md: 6, lg: 4 }}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={700}>{day}</Typography>
                  <Switch defaultChecked={index < 5} />
                </Stack>
                <Slider value={[7, 21]} min={0} max={24} marks={[{ value: 7, label: '07' }, { value: 21, label: '21' }]} />
                <Typography variant="body2" color="text.secondary">
                  Permitido entre 07:00 e 21:00
                </Typography>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Button variant="contained" startIcon={<SaveIcon />} sx={{ alignSelf: 'flex-start' }}>
        Salvar horarios
      </Button>
    </PageSection>
  </Stack>
);
