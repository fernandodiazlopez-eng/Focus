import React, { useState, useEffect } from 'react';
import { Language, StatsPeriod } from '../types';
import { formatDigitalDuration, ZERO_STATS_BY_PERIOD } from '../data/initialData';
import { TRANSLATIONS } from '../i18n';
import { CornerReticles } from './HardwarePrimitives';
import { DigitalClock } from './DigitalClock';

interface StatsViewProps {
  language: Language;
  period: StatsPeriod;
  onChangePeriod: (period: StatsPeriod) => void;
}

export function StatsView({ language, period, onChangePeriod }: StatsViewProps) {
  const t = TRANSLATIONS[language].stats;
  const dataset = ZERO_STATS_BY_PERIOD[period];

  const [selectedIndex, setSelectedIndex] = useState<number>(
    dataset.series.length - 1
  );

  useEffect(() => {
    setSelectedIndex(ZERO_STATS_BY_PERIOD[period].series.length - 1);
  }, [period]);

  const maxSeriesMinutes = Math.max(
    ...dataset.series.map((p) => p.minutesUsed),
    1
  );
  const maxAppMinutes = Math.max(
    ...dataset.apps.map((a) => a.minutesUsed),
    1
  );
  const activePoint =
    dataset.series[selectedIndex] ?? dataset.series[dataset.series.length - 1];

  return (
    <section className="space-y-6">
      {/* Header & Period Switcher */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black dark:text-white text-balance">
            {t.title}
          </h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            {t.subtitle}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={t.title}
          className="grid grid-cols-3 gap-1 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.04] p-1 md:min-w-[260px]"
        >
          {(
            [
              { id: 'today', label: t.periods.today },
              { id: '7d', label: t.periods.d7 },
              { id: '30d', label: t.periods.d30 },
            ] as { id: StatsPeriod; label: string }[]
          ).map((item) => {
            const selected = period === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onChangePeriod(item.id)}
                className={`min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-black dark:focus-visible:outline-white ${
                  selected
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Total Screen Usage Time Hero (Digital Clock) */}
      <div className="relative flex items-center justify-between gap-4 rounded-2xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#0C0C0C] p-5">
        <CornerReticles active={dataset.totalMinutesUsed > 0} />
        <div className="space-y-2">
          <p className="text-xs font-medium text-black/55 dark:text-white/55">
            {t.totalUsageLabel}
          </p>
          <div className="text-black dark:text-white">
            <DigitalClock
              value={formatDigitalDuration(dataset.totalMinutesUsed)}
              size="xl"
            />
          </div>
        </div>
        <span className="font-digital text-xs text-black/45 dark:text-white/45 self-end">
          {t.hoursFormatHint}
        </span>
      </div>

      {/* Hours Distribution + Per-App Usage Time */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Usage Time Bars */}
        <div className="md:col-span-6 relative rounded-2xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#0D0D0D] p-4 sm:p-5 space-y-5">
          <CornerReticles />

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-black dark:text-white">
              {t.hourlyChartTitle}
            </h2>
            {activePoint && (
              <div className="flex items-center gap-2.5">
                <span className="font-digital text-xs text-black/55 dark:text-white/55">
                  {activePoint.label}
                </span>
                <DigitalClock
                  value={formatDigitalDuration(activePoint.minutesUsed)}
                  size="sm"
                />
              </div>
            )}
          </div>

          <div
            className="grid items-end gap-2 pt-3 h-44"
            style={{
              gridTemplateColumns: `repeat(${dataset.series.length}, minmax(0, 1fr))`,
            }}
          >
            {dataset.series.map((point, idx) => {
              const heightPct =
                point.minutesUsed > 0
                  ? Math.max(
                      10,
                      Math.round((point.minutesUsed / maxSeriesMinutes) * 100)
                    )
                  : 4;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={point.label}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  aria-label={`${point.label} ${formatDigitalDuration(
                    point.minutesUsed
                  )}`}
                  className="h-full flex flex-col items-center justify-end gap-2 rounded-xl py-1 focus-visible:outline-2 focus-visible:outline-black dark:focus-visible:outline-white"
                >
                  <div className="w-full flex-1 flex items-end justify-center px-1">
                    <div
                      className={`w-full max-w-[26px] rounded-[4px] transition-all duration-200 ${
                        point.minutesUsed === 0
                          ? 'bg-black/10 dark:bg-white/10'
                          : isSelected
                          ? 'bg-black dark:bg-white'
                          : 'bg-black/30 dark:bg-white/30'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span
                    className={`font-digital text-[11px] whitespace-nowrap ${
                      isSelected
                        ? 'text-black dark:text-white font-semibold'
                        : 'text-black/45 dark:text-white/45'
                    }`}
                  >
                    {point.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* App Usage Breakdown (Zeroed empty state when no app usage recorded) */}
        <div className="md:col-span-6 relative rounded-2xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#0D0D0D] p-4 sm:p-5 space-y-4">
          <CornerReticles />

          <h2 className="text-sm font-semibold text-black dark:text-white">
            {t.appUsageTitle}
          </h2>

          {dataset.apps.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
              <DigitalClock value="00:00" size="md" />
              <p className="text-xs text-black/50 dark:text-white/50">
                {t.noAppUsage}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/8 dark:divide-white/8">
              {dataset.apps.map((app) => {
                const pct = Math.max(
                  6,
                  Math.round((app.minutesUsed / maxAppMinutes) * 100)
                );

                return (
                  <div key={app.name} className="py-3.5 first:pt-1 last:pb-1 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="h-8 w-8 rounded-lg border border-black/15 dark:border-white/15 flex items-center justify-center font-brand text-xs font-bold text-black dark:text-white shrink-0">
                          {app.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-black dark:text-white truncate">
                          {app.name}
                        </span>
                      </div>

                      <div className="text-black dark:text-white shrink-0">
                        <DigitalClock
                          value={formatDigitalDuration(app.minutesUsed)}
                          size="sm"
                        />
                      </div>
                    </div>

                    <div className="h-[3px] w-full rounded-sm bg-black/8 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-black dark:bg-white transition-all duration-300"
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
    </section>
  );
}
