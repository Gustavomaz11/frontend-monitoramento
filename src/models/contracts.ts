export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
};

export type DeviceSummary = {
  id: string;
  childDisplayName: string;
  name: string;
  status: string;
  lastSyncAt: string | null;
};

export type PairingCodeResponse = {
  pairingCode: string;
  expiresAt: string;
  qrPayload: string;
};

export type DeviceConfig = {
  retentionDays: number;
  vpnEnabled: boolean;
  usageStatsEnabled: boolean;
  syncIntervalMinutes: number;
  timezone: string;
  configVersion: number;
};

export type AppUsageRecord = {
  localId: string;
  packageName: string;
  appName?: string;
  usageDate: string;
  totalForegroundMs: number;
  firstUsedAt?: string;
  lastUsedAt?: string;
  openCountEstimate: number;
};

export type AppUsageView = {
  id: string;
  deviceId: string;
  childDisplayName: string;
  deviceName: string;
  packageName: string;
  appName: string | null;
  usageDate: string;
  totalForegroundMs: number;
  firstUsedAt: string | null;
  lastUsedAt: string | null;
  openCountEstimate: number;
};

export type DomainAccessRecord = {
  localId: string;
  domain: string | null;
  ipAddress: string | null;
  protocol: 'tcp' | 'udp' | 'icmp' | 'unknown';
  port: number | null;
  category: string | null;
  firstAccessAt: string;
  lastAccessAt: string;
  accessCount: number;
  foregroundPackageName: string | null;
  correlationType: 'none' | 'estimated' | 'observed';
  source: 'dns' | 'sni_if_available' | 'ip_only' | 'manual' | 'unknown';
};

export type DomainAccessView = {
  id: string;
  deviceId: string;
  childDisplayName: string;
  deviceName: string;
  domain: string | null;
  ipAddress: string | null;
  protocol: 'tcp' | 'udp' | 'icmp' | 'unknown';
  port: number | null;
  category: string | null;
  firstAccessAt: string;
  lastAccessAt: string;
  accessCount: number;
  foregroundPackageName: string | null;
  correlationType: 'none' | 'estimated' | 'observed';
  source: 'dns' | 'sni_if_available' | 'ip_only' | 'manual' | 'unknown';
};

export type Alert = {
  id: string;
  alertType: 'adult' | 'gambling' | 'violence' | 'malicious' | 'manual_block';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  summary: string;
  status: 'new' | 'read' | 'resolved';
  createdAt: string;
};

export type BlockingRule = {
  id: string;
  ruleType: 'domain' | 'category' | 'schedule' | 'allow_domain';
  value: string;
  action: 'block' | 'allow' | 'alert_only';
  priority: number;
  enabled: boolean;
  childId?: string | null;
  deviceId?: string | null;
};

export type CreateRuleRequest = {
  ruleType: BlockingRule['ruleType'];
  value: string;
  action: BlockingRule['action'];
  childId?: string | null;
  deviceId?: string | null;
};

export type UpdateRuleRequest = CreateRuleRequest & {
  priority: number;
  enabled: boolean;
};

export type PrivacyExportResponse = {
  requestId: string;
  status: string;
  createdAt: string;
  childrenCount: number;
  devicesCount: number;
  rulesCount: number;
  alertsCount: number;
  appUsageRecords: number;
  domainAccessRecords: number;
  blockAttemptRecords: number;
};

export type PrivacyDeleteAllResponse = {
  requestId: string;
  status: string;
  createdAt: string;
};

export type DashboardSummary = {
  screenTimeTodayMs: number;
  topApps: AppUsageView[];
  topDomains: DomainAccessView[];
  categories: CategorySummary[];
  dailyPoints: DailyPoint[];
  blockedAttemptsCount: number;
  deviceStatus: string;
  lastSyncAt: string | null;
};

export type CategorySummary = {
  name: string;
  displayName: string;
  accessCount: number;
  riskLevel: number;
};

export type DailyPoint = {
  date: string;
  screenTimeHours: number;
  blockedAttempts: number;
};
