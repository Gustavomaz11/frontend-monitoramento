import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const childAppUrl = 'navegacaosegura://responsavel';

export const OpenChildAppPage = () => (
  <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
    <Card sx={{ width: '100%', maxWidth: 520 }}>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Typography variant="h4">Abrir Navegacao Segura</Typography>
            <Typography color="text.secondary">
              Use esta pagina no celular vinculado para acessar a area do responsavel.
            </Typography>
          </Stack>
          <Alert severity="info">
            O aplicativo continuara exigindo o mesmo usuario e senha do painel.
          </Alert>
          <Button
            component="a"
            href={childAppUrl}
            size="large"
            variant="contained"
            startIcon={<OpenInNewIcon />}
          >
            Abrir aplicativo
          </Button>
          <Typography variant="body2" color="text.secondary">
            Se estiver em um computador, abra este mesmo endereco diretamente no celular Android.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  </Box>
);
