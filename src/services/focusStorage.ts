import {
  DailyFocusState,
  DailyHistoryEntry,
  FocusConfig,
  InstalledAppItem,
  Language,
  NativeFocusBridge,
  NativePermissionStatus,
  ThemeMode,
} from '../types';
import {
  createFreshDailyState,
  DEFAULT_CONFIG,
  getLocalDateKey,
} from '../data/initialData';

const KEYS = {
  CONFIG: 'focus_config_v5',
  DAILY_STATE: 'focus_daily_v5',
  HISTORY: 'focus_history_v5',
  LANGUAGE: 'focus_lang',
  THEME: 'focus_theme',
};

const LEGACY_KEYS = [
  'focus_prototype_state_v3',
  'focus_prototype_state_v4',
  'focus_config_v2',
  'focus_daily_v2',
  'focus_history_v2',
];

function cleanupLegacyStorage(): void {
  try {
    for (const k of LEGACY_KEYS) {
      localStorage.removeItem(k);
    }
  } catch {
    // ignore
  }
}

export function reconcileConfig(
  config: FocusConfig,
  now = Date.now()
): FocusConfig {
  let next = config;

  if (
    config.status === 'active' &&
    config.mode === 'normal' &&
    config.pendingDeactivateAt !== null &&
    now >= config.pendingDeactivateAt
  ) {
    next = {
      ...next,
      status: 'inactive',
      pendingDeactivateAt: null,
    };
  }

  if (
    next.appBlock.enabled &&
    next.appBlock.method === 'timer' &&
    next.appBlock.timerEndsAt !== null &&
    now >= next.appBlock.timerEndsAt
  ) {
    next = {
      ...next,
      appBlock: {
        ...next.appBlock,
        enabled: false,
        timerEndsAt: null,
      },
    };
  }

  return next;
}

export function loadConfig(): FocusConfig {
  cleanupLegacyStorage();
  try {
    const raw = localStorage.getItem(KEYS.CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<FocusConfig>;
      const merged: FocusConfig = {
        ...DEFAULT_CONFIG,
        ...parsed,
        uninstallProtection: Boolean(parsed.uninstallProtection),
        appBlock: {
          ...DEFAULT_CONFIG.appBlock,
          ...(parsed.appBlock ?? {}),
          categories: Array.isArray(parsed.appBlock?.categories)
            ? parsed.appBlock.categories
            : [],
          apps: Array.isArray(parsed.appBlock?.apps)
            ? parsed.appBlock.apps
            : [],
        },
      };
      return reconcileConfig(merged);
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: FocusConfig): void {
  try {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  } catch {
    // ignore storage errors
  }
}

export function reconcileDailyState(
  state: DailyFocusState,
  now = Date.now()
): DailyFocusState {
  const todayKey = getLocalDateKey(new Date(now));

  if (state.dateKey !== todayKey) {
    return createFreshDailyState(todayKey);
  }

  if (state.pauseEndsAt !== null && now >= state.pauseEndsAt) {
    return {
      ...state,
      windowIndex: 2,
      windowUsedSeconds: 0,
      pauseEndsAt: null,
    };
  }

  return state;
}

export function loadDailyState(): DailyFocusState {
  try {
    const raw = localStorage.getItem(KEYS.DAILY_STATE);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyFocusState;
      if (parsed && typeof parsed.dateKey === 'string') {
        return reconcileDailyState(parsed);
      }
    }
  } catch {
    // ignore
  }
  return createFreshDailyState();
}

export function saveDailyState(state: DailyFocusState): void {
  try {
    localStorage.setItem(KEYS.DAILY_STATE, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function loadHistory(): Record<string, DailyHistoryEntry> {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    // ignore
  }
  return {};
}

export function saveHistory(history: Record<string, DailyHistoryEntry>): void {
  try {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function upsertTodayHistory(
  history: Record<string, DailyHistoryEntry>,
  daily: DailyFocusState
): Record<string, DailyHistoryEntry> {
  if (daily.usedSecondsToday === 0 && !history[daily.dateKey]) {
    return history;
  }
  const next = {
    ...history,
    [daily.dateKey]: {
      dateKey: daily.dateKey,
      totalScrollSeconds: daily.usedSecondsToday,
      byNetwork: { ...daily.usedSecondsByNetwork },
    },
  };
  saveHistory(next);
  return next;
}

export function loadLanguage(): Language {
  try {
    const saved = localStorage.getItem(KEYS.LANGUAGE);
    return saved === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
}

export function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem(KEYS.LANGUAGE, lang);
  } catch {
    // ignore
  }
}

export function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(KEYS.THEME);
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(KEYS.THEME, theme);
  } catch {
    // ignore
  }
}

export const nativeFocusBridge: NativeFocusBridge = {
  isNativeAvailable(): boolean {
    const win = window as unknown as { FocusNativeBridge?: unknown };
    return Boolean(win.FocusNativeBridge);
  },
  async syncConfig(config: FocusConfig): Promise<void> {
    saveConfig(config);
    const win = window as unknown as { FocusNativeBridge?: NativeFocusBridge };
    if (win.FocusNativeBridge?.syncConfig) {
      await win.FocusNativeBridge.syncConfig(config);
    }
  },
  async syncDailyState(state: DailyFocusState): Promise<void> {
    saveDailyState(state);
    const win = window as unknown as { FocusNativeBridge?: NativeFocusBridge };
    if (win.FocusNativeBridge?.syncDailyState) {
      await win.FocusNativeBridge.syncDailyState(state);
    }
  },
  async getPermissionsStatus(): Promise<NativePermissionStatus> {
    const win = window as unknown as { FocusNativeBridge?: NativeFocusBridge };
    if (win.FocusNativeBridge?.getPermissionsStatus) {
      return win.FocusNativeBridge.getPermissionsStatus();
    }
    return {
      accessibility: false,
      usageStats: false,
      overlay: false,
      deviceAdmin: false,
    };
  },
  async requestPermission(permission: keyof NativePermissionStatus): Promise<void> {
    const win = window as unknown as { FocusNativeBridge?: NativeFocusBridge };
    if (win.FocusNativeBridge?.requestPermission) {
      await win.FocusNativeBridge.requestPermission(permission);
    }
  },
  async getInstalledApps(): Promise<InstalledAppItem[]> {
    const win = window as unknown as { FocusNativeBridge?: NativeFocusBridge };
    if (win.FocusNativeBridge?.getInstalledApps) {
      return win.FocusNativeBridge.getInstalledApps();
    }
    return [];
  },
};
