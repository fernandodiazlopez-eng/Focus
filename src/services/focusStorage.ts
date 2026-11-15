import {
  FocusPlan,
  Language,
  NativeFocusBridge,
  StatsDataset,
  StatsPeriod,
  ThemeMode,
} from '../types';
import { INITIAL_PLANS, ZERO_STATS_BY_PERIOD } from '../data/initialData';

const KEYS = {
  PLANS: 'focus_plans_v1',
  LANGUAGE: 'focus_lang',
  THEME: 'focus_theme',
  STATS: 'focus_stats_v1',
};

export function loadPlans(): FocusPlan[] {
  try {
    const raw = localStorage.getItem(KEYS.PLANS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return INITIAL_PLANS;
}

export function savePlans(plans: FocusPlan[]): void {
  try {
    localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
  } catch {
    // ignore storage errors
  }
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

export function loadStats(period: StatsPeriod): StatsDataset {
  try {
    const raw = localStorage.getItem(KEYS.STATS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed[period]) {
        return parsed[period];
      }
    }
  } catch {
    // ignore
  }
  return ZERO_STATS_BY_PERIOD[period];
}

/**
 * Web-local fallback implementation of NativeFocusBridge.
 * Replace or wrap with Capacitor/Android native plugin calls when packaging as an APK.
 */
export const webFocusBridge: NativeFocusBridge = {
  async syncPlans(plans: FocusPlan[]): Promise<void> {
    savePlans(plans);
  },
  async getUsageStats(period: StatsPeriod): Promise<StatsDataset> {
    return loadStats(period);
  },
};
