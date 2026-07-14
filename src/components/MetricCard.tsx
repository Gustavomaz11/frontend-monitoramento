import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
};

export const MetricCard = ({ label, value, detail, icon }: MetricCardProps) => (
  <Card>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        {icon}
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {detail}
          </Typography>
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);
