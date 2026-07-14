import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Link, Stack, TextField, Typography } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { useMutation } from '@tanstack/react-query';
import { parentApi } from '../api/parentApi';
import { tokenStore } from '../api/tokenStore';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = useMutation({
    mutationFn: () => parentApi.login(email, password),
    onSuccess: (response) => {
      tokenStore.save(response.accessToken, response.refreshToken);
      navigate('/dashboard');
    },
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Card sx={{ width: '100%', maxWidth: 460 }}>
        <CardContent>
          <Stack spacing={2.5}>
            <Stack spacing={0.5}>
              <Typography variant="h4">Navegacao Segura</Typography>
              <Typography color="text.secondary">Acesse o painel do responsavel.</Typography>
            </Stack>
            <Alert severity="info">Use apenas para dispositivos sob sua responsabilidade legal.</Alert>
            <TextField label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {login.error ? <Alert severity="error">{login.error.message}</Alert> : null}
            <Button
              size="large"
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => login.mutate()}
              disabled={login.isPending}
            >
              Entrar
            </Button>
            <Stack direction="row" justifyContent="space-between">
              <Link component={RouterLink} to="/cadastro">
                Criar conta
              </Link>
              <Link component={RouterLink} to="/login">
                Recuperar senha
              </Link>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
