import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useMutation } from '@tanstack/react-query';
import { parentApi } from '../api/parentApi';
import { tokenStore } from '../api/tokenStore';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const register = useMutation({
    mutationFn: () => parentApi.register(displayName, email, password),
    onSuccess: (response) => {
      tokenStore.save(response.accessToken, response.refreshToken);
      navigate('/vinculacao');
    },
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Card sx={{ width: '100%', maxWidth: 520 }}>
        <CardContent>
          <Stack spacing={2.5}>
            <Stack spacing={0.5}>
              <Typography variant="h4">Cadastro</Typography>
              <Typography color="text.secondary">Crie a conta do responsavel.</Typography>
            </Stack>
            <TextField label="Nome" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            <TextField label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
            <TextField
              label="Senha"
              type="password"
              helperText="Use pelo menos 12 caracteres."
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <FormControlLabel
              control={<Checkbox checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />}
              label="Li e aceito os termos e a politica de privacidade."
            />
            {register.error ? <Alert severity="error">{register.error.message}</Alert> : null}
            <Button
              size="large"
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => register.mutate()}
              disabled={register.isPending || !acceptedTerms}
            >
              Cadastrar
            </Button>
            <Link component={RouterLink} to="/login">
              Ja tenho conta
            </Link>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
