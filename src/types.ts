export type Language = 'es' | 'en';
export type ThemeMode = 'dark' | 'light';
export type ActiveTab = 'plans' | 'stats';
export type RuleMode = 'daily_limit' | 'always' | 'duration' | 'days';
export type PlanProtectionMode = 'normal' | 'delay' | 'password';
export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type StatsPeriod = 'today' | '7d' | '30d';

export interface AppCatalogEntry {
  name: string;
  androidPackage: string;
  supportsAntiScroll: boolean;
}

export interface AppElementOption {
  id: string;
  labelEs: string;
  labelEn: string;
}

export interface AntiScrollAppRule {
  appName: string;
  androidPackage?: string;
  removedElements: string[];
}

export interface RuleScheduleConfig {
  mode: RuleMode;
  dailyLimitMinutes: number;
  durationPreset: string;
  selectedDays: WeekdayKey[];
  timeRange: string;
}

export interface PlanAntiScrollSection extends RuleScheduleConfig {
  enabled: boolean;
  apps: AntiScrollAppRule[];
}

export interface PlanBlockSection extends RuleScheduleConfig {
  enabled: boolean;
  apps: string[];
}

export interface FocusPlan {
  id: string;
  name: string;
  active: boolean;
  protection: PlanProtectionMode;
  password?: string;
  antiscroll: PlanAntiScrollSection;
  block: PlanBlockSection;
  createdAt?: number;
  updatedAt?: number;
}

export interface HourlyUsagePoint {
  label: string;
  minutesUsed: number;
}

export interface AppUsageStat {
  name: string;
  androidPackage?: string;
  minutesUsed: number;
}

export interface StatsDataset {
  totalMinutesUsed: number;
  series: HourlyUsagePoint[];
  apps: AppUsageStat[];
}

export interface NativeFocusBridge {
  syncPlans(plans: FocusPlan[]): Promise<void>;
  getUsageStats(period: StatsPeriod): Promise<StatsDataset>;
  getInstalledApps?(): Promise<AppCatalogEntry[]>;
  checkPermissions?(): Promise<{
    accessibility: boolean;
    usageStats: boolean;
    overlay: boolean;
  }>;
}
