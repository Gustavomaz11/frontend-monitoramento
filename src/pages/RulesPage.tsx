import {
  Alert,
  Button,
  Chip,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PageSection } from '../components/PageSection';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parentApi } from '../api/parentApi';
import { useState } from 'react';

export const RulesPage = () => {
  const queryClient = useQueryClient();
  const [ruleType, setRuleType] = useState<'domain' | 'category' | 'schedule' | 'allow_domain'>('domain');
  const [value, setValue] = useState('');
  const [action, setAction] = useState<'block' | 'allow' | 'alert_only'>('block');
  const rulesQuery = useQuery({ queryKey: ['rules'], queryFn: parentApi.listRules, retry: false });
  const createRule = useMutation({
    mutationFn: () => parentApi.createRule({ ruleType, value, action }),
    onSuccess: () => {
      setValue('');
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
  const updateRule = useMutation({
    mutationFn: (ruleId: string) => {
      const current = (rulesQuery.data ?? []).find((rule) => rule.id === ruleId);
      if (!current) throw new Error('Regra nao encontrada.');
      return parentApi.updateRule(ruleId, { ...current, enabled: !current.enabled });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rules'] }),
  });
  const rules = rulesQuery.data ?? [];

  return (
    <Stack spacing={2}>
      <PageSection title="Nova regra">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Tipo" value={ruleType} onChange={(event) => setRuleType(event.target.value as typeof ruleType)} />
          <TextField label="Valor" placeholder="example.com ou adult" value={value} onChange={(event) => setValue(event.target.value)} />
          <TextField label="Acao" value={action} onChange={(event) => setAction(event.target.value as typeof action)} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => createRule.mutate()} disabled={!value}>
            Adicionar
          </Button>
        </Stack>
        {createRule.error ? <Alert severity="error">{createRule.error.message}</Alert> : null}
      </PageSection>
      <PageSection title="Regras ativas">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ativa</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Acao</TableCell>
              <TableCell>Prioridade</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  <Switch checked={rule.enabled} onChange={() => updateRule.mutate(rule.id)} />
                </TableCell>
                <TableCell>{rule.ruleType}</TableCell>
                <TableCell>{rule.value}</TableCell>
                <TableCell>
                  <Chip size="small" label={rule.action} />
                </TableCell>
                <TableCell>{rule.priority}</TableCell>
              </TableRow>
            ))}
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>Nenhuma regra cadastrada.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </PageSection>
    </Stack>
  );
};
