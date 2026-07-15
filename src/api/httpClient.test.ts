import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestJson } from './httpClient';
import { tokenStore } from './tokenStore';

const jwtWithExpiration = (expiresAt: number) => {
  const payload = btoa(JSON.stringify({ exp: expiresAt })).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  return `header.${payload}.signature`;
};

describe('requestJson', () => {
  beforeEach(() => {
    tokenStore.clear();
    vi.restoreAllMocks();
  });

  it('renova o token expirado antes de acessar um endpoint protegido', async () => {
    const expiredToken = jwtWithExpiration(Math.floor(Date.now() / 1000) - 60);
    const renewedToken = jwtWithExpiration(Math.floor(Date.now() / 1000) + 600);
    tokenStore.save(expiredToken, 'refresh-original');

    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({
        accessToken: renewedToken,
        refreshToken: 'refresh-rotated',
        expiresIn: 600,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));

    await expect(requestJson<{ status: string }>('/api/v1/test')).resolves.toEqual({ status: 'ok' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toContain('/api/v1/auth/refresh');
    const protectedHeaders = fetchMock.mock.calls[1][1]?.headers as Headers;
    expect(protectedHeaders.get('Authorization')).toBe(`Bearer ${renewedToken}`);
    expect(tokenStore.getRefreshToken()).toBe('refresh-rotated');
  });
});
