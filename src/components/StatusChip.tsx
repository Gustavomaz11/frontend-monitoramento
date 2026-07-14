import { Chip } from '@mui/material';

type StatusChipProps = {
  value: string;
};

export const StatusChip = ({ value }: StatusChipProps) => {
  const color = value === 'critical' || value === 'new' ? 'error' : value === 'warning' ? 'warning' : 'default';
  return <Chip size="small" label={value} color={color} variant={color === 'default' ? 'outlined' : 'filled'} />;
};
