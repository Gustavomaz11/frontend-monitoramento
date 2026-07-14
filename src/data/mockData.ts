import type {
  Alert,
  AppUsageRecord,
  BlockingRule,
  CategorySummary,
  DailyPoint,
  DashboardSummary,
  DeviceSummary,
  DomainAccessRecord,
} from '../models/contracts';

const now = new Date('2026-07-14T14:30:00-03:00').toISOString();

export const mockDevices: DeviceSummary[] = [
  {
    id: 'device-1',
    childDisplayName: 'Crianca',
    name: 'Celular Android',
    status: 'active',
    lastSyncAt: now,
  },
];

export const mockAppUsages: AppUsageRecord[] = [
  {
    localId: 'app-1',
    appName: 'YouTube',
    packageName: 'com.google.android.youtube',
    usageDate: '2026-07-14',
    totalForegroundMs: 6_900_000,
    firstUsedAt: '2026-07-14T09:12:00-03:00',
    lastUsedAt: '2026-07-14T13:40:00-03:00',
    openCountEstimate: 7,
  },
  {
    localId: 'app-2',
    appName: 'TikTok',
    packageName: 'com.zhiliaoapp.musically',
    usageDate: '2026-07-14',
    totalForegroundMs: 4_200_000,
    firstUsedAt: '2026-07-14T11:02:00-03:00',
    lastUsedAt: '2026-07-14T12:44:00-03:00',
    openCountEstimate: 5,
  },
  {
    localId: 'app-3',
    appName: 'Khan Academy',
    packageName: 'org.khanacademy.android',
    usageDate: '2026-07-14',
    totalForegroundMs: 2_400_000,
    firstUsedAt: '2026-07-14T15:02:00-03:00',
    lastUsedAt: '2026-07-14T15:42:00-03:00',
    openCountEstimate: 2,
  },
];

export const mockDomainAccesses: DomainAccessRecord[] = [
  {
    localId: 'domain-1',
    domain: 'youtube.com',
    ipAddress: '1.1.1.1',
    protocol: 'udp',
    port: 53,
    category: 'video',
    firstAccessAt: '2026-07-14T09:12:00-03:00',
    lastAccessAt: '2026-07-14T13:40:00-03:00',
    accessCount: 38,
    foregroundPackageName: null,
    correlationType: 'none',
    source: 'dns',
  },
  {
    localId: 'domain-2',
    domain: 'tiktok.com',
    ipAddress: '1.1.1.1',
    protocol: 'udp',
    port: 53,
    category: 'social',
    firstAccessAt: '2026-07-14T11:01:00-03:00',
    lastAccessAt: '2026-07-14T12:44:00-03:00',
    accessCount: 24,
    foregroundPackageName: 'com.zhiliaoapp.musically',
    correlationType: 'estimated',
    source: 'dns',
  },
  {
    localId: 'domain-3',
    domain: 'study.example.edu',
    ipAddress: '1.1.1.1',
    protocol: 'udp',
    port: 53,
    category: 'education',
    firstAccessAt: '2026-07-14T15:02:00-03:00',
    lastAccessAt: '2026-07-14T15:42:00-03:00',
    accessCount: 12,
    foregroundPackageName: null,
    correlationType: 'none',
    source: 'dns',
  },
];

export const mockCategories: CategorySummary[] = [
  { name: 'video', displayName: 'Videos', accessCount: 38, riskLevel: 1 },
  { name: 'social', displayName: 'Redes sociais', accessCount: 24, riskLevel: 1 },
  { name: 'education', displayName: 'Educacao', accessCount: 12, riskLevel: 0 },
  { name: 'unknown', displayName: 'Sites desconhecidos', accessCount: 5, riskLevel: 2 },
];

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    alertType: 'manual_block',
    severity: 'warning',
    title: 'Tentativa em dominio bloqueado',
    summary: 'A regra familiar bloqueou acesso a um dominio configurado manualmente.',
    status: 'new',
    createdAt: '2026-07-14T12:05:00-03:00',
  },
  {
    id: 'alert-2',
    alertType: 'gambling',
    severity: 'critical',
    title: 'Categoria sensivel detectada',
    summary: 'Foi registrado acesso classificado como apostas. Nenhum conteudo de pagina foi coletado.',
    status: 'read',
    createdAt: '2026-07-13T18:20:00-03:00',
  },
];

export const mockRules: BlockingRule[] = [
  { id: 'rule-1', ruleType: 'category', value: 'adult', action: 'block', priority: 10, enabled: true },
  { id: 'rule-2', ruleType: 'category', value: 'gambling', action: 'block', priority: 10, enabled: true },
  { id: 'rule-3', ruleType: 'allow_domain', value: 'khanacademy.org', action: 'allow', priority: 1, enabled: true },
  { id: 'rule-4', ruleType: 'schedule', value: 'Mon-Fri 07:00-21:00', action: 'block', priority: 50, enabled: false },
];

export const mockDailyPoints: DailyPoint[] = [
  { date: '08/07', screenTimeHours: 2.1, blockedAttempts: 1 },
  { date: '09/07', screenTimeHours: 2.8, blockedAttempts: 0 },
  { date: '10/07', screenTimeHours: 3.4, blockedAttempts: 3 },
  { date: '11/07', screenTimeHours: 2.5, blockedAttempts: 1 },
  { date: '12/07', screenTimeHours: 4.0, blockedAttempts: 2 },
  { date: '13/07', screenTimeHours: 3.1, blockedAttempts: 4 },
  { date: '14/07', screenTimeHours: 3.75, blockedAttempts: 2 },
];

export const mockDashboardSummary: DashboardSummary = {
  screenTimeTodayMs: mockAppUsages.reduce((sum, app) => sum + app.totalForegroundMs, 0),
  topApps: mockAppUsages,
  topDomains: mockDomainAccesses,
  blockedAttemptsCount: 2,
  lastSyncAt: now,
};
