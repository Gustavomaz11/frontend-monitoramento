const ACCESS_TOKEN_KEY = 'navegacao_segura.access_token';
const REFRESH_TOKEN_KEY = 'navegacao_segura.refresh_token';

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
  isAuthenticated: () => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)),
};
