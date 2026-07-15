import type { AuthResponse } from '../models/contracts';
import { tokenStore } from './tokenStore';

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://backend-monitoramento-vsid.onrender.com';
const requestTimeoutMs = 20_000;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  authenticated?: boolean;
};

type ProblemDetails = { title?: string; detail?: string; traceId?: string };

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly traceId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshPromise: Promise<boolean> | null = null;

const redirectToLogin = () => {
  tokenStore.clear();
  if (window.location.pathname !== '/login') window.location.assign('/login');
};

const fetchWithTimeout = async (url: string, init: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(0, 'A API demorou demais para responder. Tente novamente.');
    }
    throw new ApiError(0, 'Nao foi possivel conectar a API. Verifique sua internet.');
  } finally {
    window.clearTimeout(timeout);
  }
};

const readApiError = async (response: Response): Promise<ApiError> => {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('json')) {
    try {
      const problem = (await response.json()) as ProblemDetails;
      return new ApiError(response.status, problem.detail ?? problem.title ?? `HTTP ${response.status}`, problem.traceId);
    } catch {
      return new ApiError(response.status, `HTTP ${response.status}`);
    }
  }

  const text = await response.text();
  return new ApiError(response.status, text || `HTTP ${response.status}`);
};

const refreshSession = async (): Promise<boolean> => {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetchWithTimeout(`${apiBaseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) return false;

  const auth = (await response.json()) as AuthResponse;
  tokenStore.save(auth.accessToken, auth.refreshToken);
  return true;
};

const runSessionRefresh = () => {
  refreshPromise ??= refreshSession().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

const ensureFreshSession = async (): Promise<boolean> =>
  tokenStore.isAccessTokenValid() || runSessionRefresh();

export const getAuthenticatedAccessToken = async (): Promise<string> => {
  if (!(await ensureFreshSession())) {
    redirectToLogin();
    throw new ApiError(401, 'Sua sessao expirou. Entre novamente.');
  }

  const token = tokenStore.getAccessToken();
  if (!token) throw new ApiError(401, 'Sua sessao expirou. Entre novamente.');
  return token;
};

const send = (path: string, options: RequestOptions, accessToken: string | null) => {
  const headers = new Headers({ Accept: 'application/json' });
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  return fetchWithTimeout(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
};

export const requestJson = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const requiresAuth = options.authenticated !== false;
  if (requiresAuth && !(await ensureFreshSession())) {
    redirectToLogin();
    throw new ApiError(401, 'Sua sessao expirou. Entre novamente.');
  }

  let response = await send(path, options, requiresAuth ? tokenStore.getAccessToken() : null);
  if (requiresAuth && response.status === 401 && (await runSessionRefresh())) {
    response = await send(path, options, tokenStore.getAccessToken());
  }

  if (!response.ok) {
    if (response.status === 401) redirectToLogin();
    throw await readApiError(response);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};
