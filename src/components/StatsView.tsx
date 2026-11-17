import React from 'react';
import { DailyFocusState, DailyHistoryEntry, Language } from '../types';
import {
  DAILY_MAX_SCROLL_SECONDS,
  getLocalDateKey,
} from '../data/initialData';
import { TRANSLATIONS } from '../i18n';
import { CornerReticles } from './HardwarePrimitives';
import { DigitalClock } from './DigitalClock';

interface StatsViewProps {
  language: Language;
  dailyState: DailyFocusState;
  history: Record<string, DailyHistoryEntry>;
}

export function StatsView({ language, dailyState, history }: StatsViewProps) {
  const t = TRANSLATIONS[language].stats;
  const weekdays = TRANSLATIONS[language].weekdaysShort;

  const usedSecondsToday = dailyState.usedSecondsToday;
  const usedMinutesToday = Math.floor(usedSecondsToday / 60);
  const maxMinutesDaily = Math.round(DAILY_MAX_SCROLL_SECONDS / 60);

  const networkRows = Object.entries(dailyState.usedSecondsByNetwork)
    .filter(([, secs]) => secs > 0)
    .sort((a, b) => b[1] - a[1]);

  const maxNetworkSeconds = Math.max(
    ...networkRows.map(([, secs]) => secs),
    1
  );

  // Build 7-day weekly view (Monday -> Sunday of current local week)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + offsetToMonday);
  const todayKey = getLocalDateKey(today);

  const weeklyPoints = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const key = getLocalDateKey(d);
    const seconds =
      key === todayKey
        ? usedSecondsToday
        : history[key]?.totalScrollSeconds ?? 0;
    return {
      key,
      label: weekdays[idx],
      seconds,
      isToday: key === todayKey,
    };
  });

  const hasAnyWeeklyData = weeklyPoints.some((p) => p.seconds > 0);
  const maxWeeklySeconds = Math.max(
    ...weeklyPoints.map((p) => p.seconds),
    1
  );

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
        {t.title}
      </h1>

      {/* Scroll Used Today Summary */}
      <div className="relative border border-black/14 dark:border-white/14 bg-white dark:bg-[#0B0B0B] p-5 sm:p-6">
        <CornerReticles active={usedSecondsToday > 0} />

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-black/70 dark:text-white/70">
              {t.usedTodayLabel}
            </span>
            <div className="flex items-center gap-1.5 text-black dark:text-white">
              <DigitalClock
                value={String(usedMinutesToday).padStart(2, '0')}
                size="sm"
                showGhost={false}
              />
              <span className="text-xs text-black/55 dark:text-white/55">
                / {t.ofMaxDaily}
              </span>
            </div>
          </div>

          <div className="h-[3px] w-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((usedMinutesToday / maxMinutesDaily) * 100)
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Network Breakdown + Weekly View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 relative border border-black/12 dark:border-white/12 bg-white dark:bg-[#0B0B0B] p-5">
          <CornerReticles />

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-black dark:text-white">
              {t.byNetworkTitle}
            </h2>

            {networkRows.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-black/50 dark:text-white/50">
                  {t.emptyToday}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/8 dark:divide-white/8">
                {networkRows.map(([networkName, secs]) => {
                  const mins = Math.floor(secs / 60);
                  const pct = Math.max(
                    8,
                    Math.round((secs / maxNetworkSeconds) * 100)
                  );
                  return (
                    <div
                      key={networkName}
                      className="py-3 first:pt-1 last:pb-1 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-black dark:text-white">
                          {networkName}
                        </span>
                        <div className="inline-flex items-center gap-1.5 text-black dark:text-white">
                          <DigitalClock
                            value={String(mins).padStart(2, '0')}
                            size="xs"
                            showGhost={false}
                          />
                          <span className="text-xs text-black/55 dark:text-white/55">
                            {t.minUnit}
                          </span>
                        </div>
                      </div>
                      <div className="h-[3px] w-full bg-black/8 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-black dark:bg-white"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-6 relative border border-black/12 dark:border-white/12 bg-white dark:bg-[#0B0B0B] p-5">
          <CornerReticles />

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-black dark:text-white">
              {t.weeklyTitle}
            </h2>

            {!hasAnyWeeklyData ? (
              <div className="py-8 text-center">
                <p className="text-xs text-black/50 dark:text-white/50">
                  {t.emptyWeekly}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-7 items-end gap-2 pt-2 h-40">
                {weeklyPoints.map((pt) => {
                  const mins = Math.floor(pt.seconds / 60);
                  const heightPct =
                    pt.seconds > 0
                      ? Math.max(
                          10,
                          Math.round((pt.seconds / maxWeeklySeconds) * 100)
                        )
                      : 4;
                  return (
                    <div
                      key={pt.key}
                      className="h-full flex flex-col items-center justify-end gap-1.5"
                    >
                      <span className="font-digital text-[11px] text-black/60 dark:text-white/60">
                        {pt.seconds > 0 ? `${mins}m` : ''}
                      </span>
                      <div className="w-full flex-1 flex items-end justify-center px-0.5">
                        <div
                          className={`w-full max-w-[22px] ${
                            pt.seconds === 0
                              ? 'bg-black/10 dark:bg-white/10'
                              : pt.isToday
                              ? 'bg-black dark:bg-white'
                              : 'bg-black/30 dark:bg-white/30'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span
                        className={`font-digital text-[11px] ${
                          pt.isToday
                            ? 'text-black dark:text-white font-semibold'
                            : 'text-black/45 dark:text-white/45'
                        }`}
                      >
                        {pt.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exempt Surfaces Notice */}
      <div className="relative border border-black/10 dark:border-white/10 bg-white dark:bg-[#0B0B0B] px-5 py-4">
        <CornerReticles />
        <div className="space-y-1">
          <div className="text-xs font-semibold text-black dark:text-white">
            {t.exemptTitle}
          </div>
          <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
            {t.exemptBody}
          </p>
        </div>
      </div>
    </section>
  );
}
