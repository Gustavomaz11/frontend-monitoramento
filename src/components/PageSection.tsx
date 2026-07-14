import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type PageSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export const PageSection = ({ title, description, children }: PageSectionProps) => (
  <Card>
    <CardContent>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h6">{title}</Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}
        </Stack>
        {children}
      </Stack>
    </CardContent>
  </Card>
);
