import type { DomainAccessView } from '../models/contracts';

type BrowserOriginFields = Pick<DomainAccessView, 'domain' | 'protocol' | 'port'>;

export const formatBrowserOrigin = ({ domain, protocol, port }: BrowserOriginFields): string => {
  if (!domain) return 'Endereço indisponível';

  const scheme = protocol === 'http' ? 'http' : 'https';
  const defaultPort = scheme === 'https' ? 443 : 80;
  return `${scheme}://${domain}${port && port !== defaultPort ? `:${port}` : ''}`;
};
