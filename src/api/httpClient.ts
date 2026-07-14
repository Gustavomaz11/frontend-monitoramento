import { tokenStore } from './tokenStore';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://backend-monitoramento-vsid.onrender.com';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  authenticated?: boolean;
};

export const requestJson = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = new Headers({ Accept: 'application/json' });

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.authenticated !== false) {
    const token = tokenStore.getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};
