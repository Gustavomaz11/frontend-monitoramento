import type {
  AuthResponse,
  Alert,
  BlockingRule,
  CreateRuleRequest,
  DeviceConfig,
  DomainAccessView,
  DeviceSummary,
  PairingCodeResponse,
  PrivacyDeleteAllResponse,
  PrivacyExportResponse,
  UpdateRuleRequest,
} from '../models/contracts';
import { requestJson } from './httpClient';

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
  createPairingCode: (childDisplayName: string, deviceName: string) =>
    requestJson<PairingCodeResponse>('/api/v1/pairing-codes', {
      method: 'POST',
      body: { childDisplayName, deviceName },
    }),
  listDevices: () => requestJson<DeviceSummary[]>('/api/v1/devices'),
  listDomainAccesses: () => requestJson<DomainAccessView[]>('/api/v1/domain-accesses?limit=200'),
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
