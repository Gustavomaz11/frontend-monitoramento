const ACCESS_TOKEN_KEY = 'navegacao_segura.access_token';
const REFRESH_TOKEN_KEY = 'navegacao_segura.refresh_token';

const decodeJwtPayload = (token: string): { exp?: number } | null => {
  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
    return JSON.parse(atob(paddedPayload)) as { exp?: number };
  } catch {
    return null;
  }
};

export const tokenStore = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  save: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  isAccessTokenValid: () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return false;

    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return false;

    const expiresAtMs = payload.exp * 1000;
    const isValid = expiresAtMs > Date.now() + 30_000;
    return isValid;
  },
  hasSession: () => tokenStore.isAccessTokenValid() || Boolean(localStorage.getItem(REFRESH_TOKEN_KEY)),
};
