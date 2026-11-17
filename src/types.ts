export type Language = 'es' | 'en';
export type ThemeMode = 'dark' | 'light';
export type ActiveTab = 'today' | 'stats';

export type FocusMode = 'normal' | 'strict';
export type FocusStatus = 'inactive' | 'active';
export type AppBlockMethod = 'timer' | 'schedule' | 'password';
export type AppBlockCategory = 'social' | 'video' | 'games' | 'browsers';

export interface InstalledAppItem {
  packageName: string;
  label: string;
  category?: AppBlockCategory;
}

export interface IndependentAppBlock {
  enabled: boolean;
  method: AppBlockMethod;
  categories: AppBlockCategory[];
  apps: string[];
  timerMinutes: number;
  timerEndsAt: number | null;
  scheduleDays: string[];
  scheduleStart: string;
  scheduleEnd: string;
  password: string;
}

export interface FocusConfig {
  status: FocusStatus;
  mode: FocusMode;
  strictPin: string;
  pendingDeactivateAt: number | null;
  uninstallProtection: boolean;
  appBlock: IndependentAppBlock;
}

export interface DailyFocusState {
  dateKey: string; // Local YYYY-MM-DD
  usedSecondsToday: number;
  windowUsedSeconds: number;
  windowIndex: 1 | 2;
  pauseEndsAt: number | null;
  usedSecondsByNetwork: Record<string, number>;
}

export interface DailyHistoryEntry {
  dateKey: string;
  totalScrollSeconds: number;
  byNetwork: Record<string, number>;
}

export interface NativePermissionStatus {
  accessibility: boolean;
  usageStats: boolean;
  overlay: boolean;
  deviceAdmin: boolean;
}

export interface NativeFocusBridge {
  isNativeAvailable(): boolean;
  syncConfig(config: FocusConfig): Promise<void>;
  syncDailyState(state: DailyFocusState): Promise<void>;
  getPermissionsStatus?(): Promise<NativePermissionStatus>;
  requestPermission?(permission: keyof NativePermissionStatus): Promise<void>;
  getInstalledApps?(): Promise<InstalledAppItem[]>;
}
