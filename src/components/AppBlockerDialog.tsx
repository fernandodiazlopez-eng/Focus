import React, { useEffect, useState } from 'react';
import { X, Check, Search, Plus } from 'lucide-react';
import {
  AppBlockCategory,
  AppBlockMethod,
  IndependentAppBlock,
  InstalledAppItem,
  Language,
} from '../types';
import {
  APP_BLOCK_CATEGORIES,
  TIMER_PRESETS_MINUTES,
} from '../data/initialData';
import { TRANSLATIONS } from '../i18n';
import { nativeFocusBridge } from '../services/focusStorage';
import { DigitalClock } from './DigitalClock';
import { CornerReticles } from './HardwarePrimitives';

interface AppBlockerDialogProps {
  open: boolean;
  method: AppBlockMethod;
  language: Language;
  appBlock: IndependentAppBlock;
  onSave: (next: IndependentAppBlock) => void;
  onDisable: () => void;
  onClose: () => void;
}

export function AppBlockerDialog({
  open,
  method,
  language,
  appBlock,
  onSave,
  onDisable,
  onClose,
}: AppBlockerDialogProps) {
  const [categories, setCategories] = useState<AppBlockCategory[]>(
    appBlock.categories
  );
  const [apps, setApps] = useState<string[]>(appBlock.apps);
  const [installedApps, setInstalledApps] = useState<InstalledAppItem[]>([]);
  const [query, setQuery] = useState('');

  const [timerMinutes, setTimerMinutes] = useState<number>(appBlock.timerMinutes);
  const [scheduleDays, setScheduleDays] = useState<string[]>(appBlock.scheduleDays);
  const [scheduleStart, setScheduleStart] = useState<string>(appBlock.scheduleStart);
  const [scheduleEnd, setScheduleEnd] = useState<string>(appBlock.scheduleEnd);
  const [password, setPassword] = useState<string>(appBlock.password);

  useEffect(() => {
    if (open) {
      setCategories(appBlock.categories);
      setApps(appBlock.apps);
      setQuery('');
      setTimerMinutes(appBlock.timerMinutes);
      setScheduleDays(appBlock.scheduleDays);
      setScheduleStart(appBlock.scheduleStart);
      setScheduleEnd(appBlock.scheduleEnd);
      setPassword(appBlock.password);

      if (nativeFocusBridge.getInstalledApps) {
        void nativeFocusBridge.getInstalledApps().then(setInstalledApps);
      }
    }
  }, [open, appBlock]);

  if (!open) return null;

  const t = TRANSLATIONS[language].appBlockDialog;
  const weekdays = TRANSLATIONS[language].weekdaysShort;

  const title =
    method === 'timer'
      ? t.titleTimer
      : method === 'schedule'
      ? t.titleSchedule
      : t.titlePassword;

  const toggleCategory = (cat: AppBlockCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleApp = (appLabel: string) => {
    setApps((prev) =>
      prev.includes(appLabel)
        ? prev.filter((a) => a !== appLabel)
        : [...prev, appLabel]
    );
  };

  const handleAddCustomApp = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (!apps.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      setApps((prev) => [...prev, trimmed]);
    }
    setQuery('');
  };

  const toggleDay = (day: string) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filteredInstalled = installedApps.filter((item) =>
    item.label.toLowerCase().includes(normalizedQuery)
  );
  const exactInstalledMatch = installedApps.some(
    (item) => item.label.toLowerCase() === normalizedQuery
  );

  const hasTarget = categories.length > 0 || apps.length > 0;
  const canSave =
    hasTarget &&
    (method !== 'password' || password.trim().length >= 4) &&
    (method !== 'schedule' || scheduleDays.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-blocker-dialog-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[88dvh] flex flex-col border border-black/15 dark:border-white/15 bg-[#FAFAFA] dark:bg-[#0B0B0B] text-black dark:text-white overflow-hidden"
      >
        <CornerReticles active />

        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 dark:border-white/10">
          <h2
            id="app-blocker-dialog-title"
            className="text-base font-semibold tracking-tight"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-black/55 hover:text-black dark:text-white/55 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Block by Category (Opal / Freedom style) */}
          <div className="space-y-2.5">
            <div className="space-y-0.5">
              <span className="block text-xs font-medium text-black/75 dark:text-white/75">
                {t.categoriesLabel}
              </span>
              <span className="block text-[11px] text-black/50 dark:text-white/50">
                {t.categoriesHint}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {APP_BLOCK_CATEGORIES.map((cat) => {
                const selected = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`min-h-[46px] px-3 border text-xs font-medium flex items-center justify-between gap-2 transition-colors ${
                      selected
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                        : 'bg-white dark:bg-[#121212] border-black/12 dark:border-white/12 text-black/80 dark:text-white/80'
                    }`}
                  >
                    <span className="truncate">{t.categories[cat]}</span>
                    {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Installed Device Apps + Search (AppBlock / Android PackageManager style) */}
          <div className="space-y-2.5 pt-2 border-t border-black/8 dark:border-white/8">
            <span className="block text-xs font-medium text-black/75 dark:text-white/75">
              {t.deviceAppsLabel}
            </span>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/45 dark:text-white/45" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomApp();
                    }
                  }}
                  placeholder={t.searchOrAddPlaceholder}
                  className="w-full min-h-[42px] border border-black/15 dark:border-white/15 bg-white dark:bg-[#121212] pl-9 pr-3 text-xs focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              {query.trim().length > 0 && !exactInstalledMatch && (
                <button
                  type="button"
                  onClick={handleAddCustomApp}
                  className="min-h-[42px] px-3 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black text-xs font-medium flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t.addAppButton}</span>
                </button>
              )}
            </div>

            {installedApps.length > 0 ? (
              <div className="max-h-40 overflow-y-auto divide-y divide-black/8 dark:divide-white/8 border border-black/10 dark:border-white/10 bg-white dark:bg-[#121212]">
                {filteredInstalled.map((item) => {
                  const selected = apps.includes(item.label);
                  return (
                    <button
                      key={item.packageName}
                      type="button"
                      onClick={() => toggleApp(item.label)}
                      className="w-full min-h-[44px] px-3.5 flex items-center justify-between gap-3 text-left text-xs"
                    >
                      <span className="truncate font-medium text-black dark:text-white">
                        {item.label}
                      </span>
                      <span
                        className={`h-4 w-4 border flex items-center justify-center shrink-0 ${
                          selected
                            ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black'
                            : 'border-black/25 dark:border-white/25'
                        }`}
                      >
                        {selected && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-black/50 dark:text-white/50 leading-relaxed">
                {t.nativeAppsEmptyHint}
              </p>
            )}

            {apps.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {apps.map((appLabel) => (
                  <button
                    key={appLabel}
                    type="button"
                    onClick={() => toggleApp(appLabel)}
                    className="min-h-[34px] px-2.5 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black text-xs font-medium flex items-center gap-1.5"
                  >
                    <span>{appLabel}</span>
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Method-Specific Configuration */}
          {method === 'timer' && (
            <div className="space-y-2.5 pt-2 border-t border-black/8 dark:border-white/8">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-black/60 dark:text-white/60">
                  {t.durationLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-black dark:text-white">
                  <DigitalClock
                    value={String(timerMinutes)}
                    size="xs"
                    showGhost={false}
                  />
                  <span className="text-xs text-black/60 dark:text-white/60">min</span>
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {TIMER_PRESETS_MINUTES.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTimerMinutes(mins)}
                    className={`min-h-[42px] border text-xs font-digital transition-colors ${
                      timerMinutes === mins
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                        : 'bg-white dark:bg-[#121212] border-black/12 dark:border-white/12 text-black/75 dark:text-white/75'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          )}

          {method === 'schedule' && (
            <div className="space-y-4 pt-2 border-t border-black/8 dark:border-white/8">
              <div className="space-y-2">
                <span className="block text-xs font-medium text-black/60 dark:text-white/60">
                  {t.daysLabel}
                </span>
                <div className="grid grid-cols-7 gap-1.5">
                  {weekdays.map((day) => {
                    const active = scheduleDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`min-h-[40px] border text-xs font-digital transition-colors ${
                          active
                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                            : 'bg-white dark:bg-[#121212] border-black/12 dark:border-white/12 text-black/70 dark:text-white/70'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-medium text-black/60 dark:text-white/60">
                  {t.hoursLabel}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 block">
                    <span className="text-[11px] text-black/55 dark:text-white/55">
                      {t.fromLabel}
                    </span>
                    <input
                      type="time"
                      value={scheduleStart}
                      onChange={(e) => setScheduleStart(e.target.value)}
                      className="w-full min-h-[44px] border border-black/15 dark:border-white/15 bg-white dark:bg-[#121212] px-3 text-sm font-digital"
                    />
                  </label>
                  <label className="space-y-1 block">
                    <span className="text-[11px] text-black/55 dark:text-white/55">
                      {t.toLabel}
                    </span>
                    <input
                      type="time"
                      value={scheduleEnd}
                      onChange={(e) => setScheduleEnd(e.target.value)}
                      className="w-full min-h-[44px] border border-black/15 dark:border-white/15 bg-white dark:bg-[#121212] px-3 text-sm font-digital"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {method === 'password' && (
            <div className="space-y-2 pt-2 border-t border-black/8 dark:border-white/8">
              <label className="block space-y-1.5">
                <span className="block text-xs font-medium text-black/60 dark:text-white/60">
                  {t.passwordLabel}
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full min-h-[46px] border border-black/15 dark:border-white/15 bg-white dark:bg-[#121212] px-3.5 text-sm font-digital tracking-widest"
                />
              </label>
              <p className="text-xs text-black/55 dark:text-white/55">
                {t.passwordHint}
              </p>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={!canSave}
              onClick={() =>
                onSave({
                  enabled: true,
                  method,
                  categories,
                  apps,
                  timerMinutes,
                  timerEndsAt:
                    method === 'timer'
                      ? Date.now() + timerMinutes * 60_000
                      : null,
                  scheduleDays,
                  scheduleStart,
                  scheduleEnd,
                  password: password.trim(),
                })
              }
              className={`w-full min-h-[48px] text-sm font-semibold transition-all ${
                canSave
                  ? 'bg-black text-white dark:bg-white dark:text-black active:scale-[0.98]'
                  : 'bg-black/15 text-black/35 dark:bg-white/15 dark:text-white/35 cursor-not-allowed'
              }`}
            >
              {t.activateBlock}
            </button>

            {appBlock.enabled && (
              <button
                type="button"
                onClick={onDisable}
                className="w-full min-h-[44px] border border-black/15 dark:border-white/15 text-xs font-medium text-black/75 dark:text-white/75"
              >
                {t.disableBlock}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
