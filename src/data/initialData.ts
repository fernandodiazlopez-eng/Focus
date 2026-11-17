import { AppBlockCategory, DailyFocusState, FocusConfig } from '../types';

export const WINDOW_MAX_SECONDS = 15 * 60; // 15 min per window
export const DAILY_MAX_SCROLL_SECONDS = 30 * 60; // 30 min max per day
export const AUTO_PAUSE_MS = 2 * 60 * 60 * 1000; // 2 hours automatic pause
export const NORMAL_DEACTIVATE_WAIT_MS = 15 * 60 * 1000; // 15 min wait in Normal mode

export const COMPATIBLE_NETWORKS = [
  { id: 'Instagram', androidPackage: 'com.instagram.android' },
  { id: 'TikTok', androidPackage: 'com.zhiliaoapp.musically' },
  { id: 'YouTube', androidPackage: 'com.google.android.youtube' },
];

export const APP_BLOCK_CATEGORIES: AppBlockCategory[] = [
  'social',
  'video',
  'games',
  'browsers',
];

export const TIMER_PRESETS_MINUTES = [30, 60, 120, 240];

export const DEFAULT_CONFIG: FocusConfig = {
  status: 'inactive',
  mode: 'normal',
  strictPin: '',
  pendingDeactivateAt: null,
  uninstallProtection: false,
  appBlock: {
    enabled: false,
    method: 'timer',
    categories: [],
    apps: [],
    timerMinutes: 60,
    timerEndsAt: null,
    scheduleDays: ['L', 'M', 'X', 'J', 'V'],
    scheduleStart: '09:00',
    scheduleEnd: '14:00',
    password: '',
  },
};

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createFreshDailyState(
  dateKey = getLocalDateKey()
): DailyFocusState {
  return {
    dateKey,
    usedSecondsToday: 0,
    windowUsedSeconds: 0,
    windowIndex: 1,
    pauseEndsAt: null,
    usedSecondsByNetwork: {},
  };
}

export function formatLocalHHMM(timestampMs: number): string {
  const d = new Date(timestampMs);
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${mins}`;
}
