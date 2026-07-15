import type {
  AuthResponse,
  Alert,
  AppUsageView,
  BlockingRule,
  CreateRuleRequest,
  DeviceConfig,
  DomainAccessView,
  DeviceSummary,
  DashboardSummary,
  PairingCodeResponse,
  PagedResponse,
  PrivacyDeleteAllResponse,
  PrivacyExportResponse,
  UpdateRuleRequest,
} from '../models/contracts';
import { requestJson } from './httpClient';

export type DomainAccessFilters = {
  deviceId?: string;
  domain?: string;
  category?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

export type AppUsageFilters = {
  deviceId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

const toQueryString = (values: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return params.toString();
};

const normalizePage = <T>(response: PagedResponse<T> | T[], page = 1, pageSize = 50): PagedResponse<T> =>
  Array.isArray(response)
    ? { items: response, page, pageSize, totalCount: response.length }
    : response;

export const parentApi = {
  login: (email: string, password: string) =>
    requestJson<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      authenticated: false,
      body: { email, password },
    }),
  register: (displayName: string, email: string, password: string) =>
    requestJson<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      authenticated: false,
      body: { displayName, email, password, acceptedTerms: true },
    }),
  refresh: (refreshToken: string) =>
    requestJson<AuthResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      authenticated: false,
      body: { refreshToken },
    }),
  logout: (refreshToken: string) =>
    requestJson<void>('/api/v1/auth/logout', {
      method: 'POST',
      body: { refreshToken },
    }),
  createPairingCode: (childDisplayName: string, deviceName: string) =>
    requestJson<PairingCodeResponse>('/api/v1/pairing-codes', {
      method: 'POST',
      body: { childDisplayName, deviceName },
    }),
  listDevices: () => requestJson<DeviceSummary[]>('/api/v1/devices'),
  getDashboardSummary: () => requestJson<DashboardSummary>('/api/v1/dashboard/summary'),
  listAppUsages: (filters: AppUsageFilters = {}) =>
    requestJson<PagedResponse<AppUsageView> | AppUsageView[]>(`/api/v1/app-usages?${toQueryString(filters)}`)
      .then((response) => normalizePage(response, filters.page, filters.pageSize)),
  listDomainAccesses: (filters: DomainAccessFilters = {}) =>
    requestJson<PagedResponse<DomainAccessView> | DomainAccessView[]>(`/api/v1/domain-accesses?${toQueryString(filters)}`)
      .then((response) => normalizePage(response, filters.page, filters.pageSize)),
  getDeviceConfig: (deviceId: string) => requestJson<DeviceConfig>(`/api/v1/devices/${deviceId}/config`),
  updateDeviceConfig: (deviceId: string, config: DeviceConfig) =>
    requestJson<DeviceConfig>(`/api/v1/devices/${deviceId}/config`, {
      method: 'PUT',
      body: config,
    }),
  listRules: () => requestJson<BlockingRule[]>('/api/v1/rules'),
  createRule: (request: CreateRuleRequest) =>
    requestJson<BlockingRule>('/api/v1/rules', {
      method: 'POST',
      body: request,
    }),
  updateRule: (ruleId: string, request: UpdateRuleRequest) =>
    requestJson<BlockingRule>(`/api/v1/rules/${ruleId}`, {
      method: 'PUT',
      body: request,
    }),
  deleteRule: (ruleId: string) =>
    requestJson<void>(`/api/v1/rules/${ruleId}`, {
      method: 'DELETE',
    }),
  listAlerts: (status?: string) => requestJson<Alert[]>(`/api/v1/alerts${status ? `?status=${status}` : ''}`),
  updateAlertStatus: (alertId: string, status: Alert['status']) =>
    requestJson<void>(`/api/v1/alerts/${alertId}/status`, {
      method: 'PATCH',
      body: { status },
    }),
  requestPrivacyExport: () =>
    requestJson<PrivacyExportResponse>('/api/v1/privacy/export', {
      method: 'POST',
    }),
  requestDeleteAll: () =>
    requestJson<PrivacyDeleteAllResponse>('/api/v1/privacy/delete-all', {
      method: 'POST',
    }),
};
