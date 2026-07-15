import { describe, expect, it } from 'vitest';
import { formatBrowserOrigin } from './browserNavigation';

describe('formatBrowserOrigin', () => {
  it('formats a secure top-level navigation without its default port', () => {
    expect(formatBrowserOrigin({ domain: 'google.com.br', protocol: 'https', port: 443 }))
      .toBe('https://google.com.br');
  });

  it('keeps a non-default port', () => {
    expect(formatBrowserOrigin({ domain: 'example.com', protocol: 'http', port: 8080 }))
      .toBe('http://example.com:8080');
  });
});
