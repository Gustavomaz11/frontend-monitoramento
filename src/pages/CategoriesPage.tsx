import { Button, Chip, Grid, Stack, Typography } from '@mui/material';
import AddModeratorIcon from '@mui/icons-material/AddModerator';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { PageSection } from '../components/PageSection';
import { parentApi } from '../api/parentApi';
import { useQuery } from '@tanstack/react-query';

const colors = ['#176b5d', '#385b82', '#a15c12', '#667085'];

export const CategoriesPage = () => {
  const summaryQuery = useQuery({ queryKey: ['dashboard-summary'], queryFn: parentApi.getDashboardSummary, retry: false });
  const domainsQuery = useQuery({ queryKey: ['domain-accesses', 'categories'], queryFn: () => parentApi.listDomainAccesses({ pageSize: 100 }), retry: false });
  const categories = summaryQuery.data?.categories ?? [];
  const domains = domainsQuery.data?.items ?? [];

  return (
    <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 5 }}>
      <PageSection title="Distribuicao por categoria">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={categories} dataKey="accessCount" nameKey="displayName" outerRadius={100}>
              {categories.map((category, index) => (
                <Cell key={category.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </PageSection>
    </Grid>
    <Grid size={{ xs: 12, md: 7 }}>
      <PageSection title="Dominios por categoria">
        <Stack spacing={1.5}>
          {categories.map((category) => (
            <Stack key={category.name} spacing={1} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={700}>{category.displayName}</Typography>
                <Chip size="small" label={`risco ${category.riskLevel}`} />
              </Stack>
              {domains
                .filter((domain) => domain.category === category.name)
                .map((domain) => (
                  <Typography key={domain.id} variant="body2" color="text.secondary">
                    {domain.domain} | {domain.accessCount} acessos
                  </Typography>
                ))}
              {category.riskLevel >= 5 ? (
                <Button startIcon={<AddModeratorIcon />} sx={{ alignSelf: 'flex-start' }}>
                  Criar regra
                </Button>
              ) : null}
            </Stack>
          ))}
          {categories.length === 0 ? <Typography color="text.secondary">Nenhuma categoria registrada.</Typography> : null}
        </Stack>
      </PageSection>
    </Grid>
  </Grid>
  );
};
