import React from 'react';
import { Clock, Calendar, Lock } from 'lucide-react';
import {
  AppBlockMethod,
  DailyFocusState,
  FocusConfig,
  Language,
} from '../types';
import {
  DAILY_MAX_SCROLL_SECONDS,
  formatLocalHHMM,
  WINDOW_MAX_SECONDS,
} from '../data/initialData';
import { TRANSLATIONS } from '../i18n';
import { CornerReticles } from './HardwarePrimitives';
import { DigitalClock } from './DigitalClock';

interface TodayViewProps {
  language: Language;
  config: FocusConfig;
  dailyState: DailyFocusState;
  onOpenActivate: () => void;
  onOpenManage: () => void;
  onCancelPendingDeactivation: () => void;
  onOpenAppBlocker: (method: AppBlockMethod) => void;
}

export function TodayView({
  language,
  config,
  dailyState,
  onOpenActivate,
  onOpenManage,
  onCancelPendingDeactivation,
  onOpenAppBlocker,
}: TodayViewProps) {
  const t = TRANSLATIONS[language].today;

  const isNoScroll = config.mode === 'no_scroll' || config.mode === 'no_scroll_normal';
  const isInactive = config.status === 'inactive';
  const isNormalPending =
    config.status === 'active' &&
    (config.mode === 'normal' || config.mode === 'no_scroll_normal') &&
    config.pendingDeactivateAt !== null;

  const isExhausted = dailyState.usedSecondsToday >= DAILY_MAX_SCROLL_SECONDS;
  const isInPause = !isExhausted && dailyState.pauseEndsAt !== null;

  const usedMinutesToday = Math.floor(dailyState.usedSecondsToday / 60);
  const windowRemainingSeconds = Math.max(
    0,
    WINDOW_MAX_SECONDS - dailyState.windowUsedSeconds
  );
  const availableMinutesInWindow = Math.ceil(windowRemainingSeconds / 60);
  const windowProgressPct = Math.min(
    100,
    Math.round((dailyState.windowUsedSeconds / WINDOW_MAX_SECONDS) * 100)
  );

  const catLabels = TRANSLATIONS[language].appBlockDialog.categories;
  let appBlockStatusText = t.appBlockDesc;
  if (config.appBlock.enabled) {
    const parts: string[] = config.appBlock.categories.map((c) => catLabels[c]);
    if (config.appBlock.apps.length > 0) {
      parts.push(t.appCountLabel(config.appBlock.apps.length));
    }
    const targetSummary = parts.join(' · ');
    if (config.appBlock.method === 'timer') {
      appBlockStatusText = t.appBlockActiveTimer(
        config.appBlock.timerMinutes,
        targetSummary
      );
    } else if (config.appBlock.method === 'schedule') {
      appBlockStatusText = t.appBlockActiveSchedule(
        config.appBlock.scheduleStart,
        config.appBlock.scheduleEnd,
        targetSummary
      );
    } else {
      appBlockStatusText = t.appBlockActivePassword(targetSummary);
    }
  }

  return (
    <section className="space-y-6">
      {/* Primary Rectangular Status Card with Centered 90-degree Corner Reticles */}
      <div className="relative border border-black/14 dark:border-white/14 bg-white dark:bg-[#0B0B0B] p-6 sm:p-8">
        <CornerReticles active={config.status === 'active'} />

        <div className="space-y-6">
          {/* Quiet Mode Header */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-black/60 dark:text-white/60">
              {isInactive
                ? t.inactiveTitle
                : config.mode === 'normal'
                ? t.activeNormal
                : isNoScroll ? (language === 'es' ? 'Focus activo · Sin scroll' : 'Focus active · No scroll') : t.activeStrict}
            </span>

            {config.status === 'active' && !isNoScroll && (
              <span className="inline-flex items-center text-black/55 dark:text-white/55">
                <DigitalClock
                  value={`${String(usedMinutesToday).padStart(2, '0')}/30`}
                  size="xs"
                  showGhost={false}
                />
              </span>
            )}
          </div>

          {isInactive ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white text-balance">
                  {t.inactiveTitle}
                </h1>
                <p className="text-sm text-black/65 dark:text-white/65 leading-relaxed max-w-md">
                  {t.inactiveSubtitle}
                </p>
              </div>

              <div className="space-y-1.5 pt-1 text-xs text-black/55 dark:text-white/55 leading-relaxed">
                <p>{t.rulesSummary}</p>
                <p>{t.exemptSummary}</p>
              </div>

              <button
                type="button"
                onClick={onOpenActivate}
                className="w-full min-h-[52px] bg-black text-white dark:bg-white dark:text-black font-semibold text-sm active:scale-[0.98] transition-transform duration-150"
              >
                {t.activateButton}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {isNoScroll && (
                <h1 className="text-xl font-semibold">
                  {language === 'es' ? 'Feeds bloqueados' : 'Feeds blocked'}
                </h1>
              )}
              {!isNoScroll && !isInPause && !isExhausted && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-lg sm:text-xl font-medium tracking-tight text-black dark:text-white">
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <DigitalClock
                        value={String(usedMinutesToday)}
                        size="sm"
                        showGhost={false}
                      />
                      <span>{t.usedTodayWord}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-black/35 dark:text-white/35"
                    >
                      ·
                    </span>
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <DigitalClock
                        value={String(availableMinutesInWindow)}
                        size="sm"
                        showGhost={false}
                      />
                      <span>{t.availableWord}</span>
                    </span>
                  </div>

                  <div className="h-[3px] w-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-black dark:bg-white transition-all duration-300"
                      style={{ width: `${windowProgressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {!isNoScroll && isInPause && dailyState.pauseEndsAt !== null && (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg sm:text-xl font-medium tracking-tight text-black dark:text-white">
                    <span>{t.pauseLead}</span>
                    <DigitalClock
                      value={formatLocalHHMM(dailyState.pauseEndsAt)}
                      size="sm"
                      showGhost={false}
                    />
                  </div>
                  <p className="text-xs text-black/55 dark:text-white/55">
                    {t.pauseDetail}
                  </p>
                </div>
              )}

              {!isNoScroll && isExhausted && (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg sm:text-xl font-medium tracking-tight text-black dark:text-white">
                    <DigitalClock value="30" size="sm" showGhost={false} />
                    <span>{t.exhaustedLead}</span>
                  </div>
                  <p className="text-xs text-black/55 dark:text-white/55">
                    {t.exhaustedDetail}
                  </p>
                </div>
              )}

              <div className="space-y-1 text-xs text-black/55 dark:text-white/55 leading-relaxed">
                <p>{t.exemptSummary}</p>
                {(config.mode === 'strict' || config.mode === 'no_scroll') && <p>{t.strictPinActiveHint}</p>}
              </div>

              {isNormalPending && config.pendingDeactivateAt !== null ? (
                <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-base font-medium text-black dark:text-white">
                    <span>{t.pendingDeactivationBeforeTime}</span>
                    <DigitalClock
                      value={formatLocalHHMM(config.pendingDeactivateAt)}
                      size="sm"
                      showGhost={false}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={onCancelPendingDeactivation}
                    className="w-full min-h-[48px] px-4 bg-black text-white dark:bg-white dark:text-black font-semibold text-sm active:scale-[0.98] transition-transform"
                  >
                    {t.cancelRequest}
                  </button>
                </div>
              ) : (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onOpenManage}
                    className="min-h-[44px] px-4 border border-black/15 dark:border-white/15 text-xs font-medium text-black dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.05] active:scale-[0.98] transition-all"
                  >
                    {t.manageButton}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Card: Bloquear apps (Rectangular with centered corner reticles) */}
      <div className="relative border border-black/12 dark:border-white/12 bg-white dark:bg-[#0B0B0B] p-5 sm:p-6">
        <CornerReticles active={config.appBlock.enabled} />

        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-black dark:text-white">
              {t.appBlockTitle}
            </h2>
            <p className="text-xs text-black/55 dark:text-white/55 leading-relaxed">
              {appBlockStatusText}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onOpenAppBlocker('timer')}
              className={`min-h-[46px] px-3.5 border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                config.appBlock.enabled && config.appBlock.method === 'timer'
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                  : 'border-black/12 dark:border-white/12 text-black/80 dark:text-white/80 hover:border-black/25 dark:hover:border-white/25'
              }`}
            >
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">{t.methodTimer}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAppBlocker('schedule')}
              className={`min-h-[46px] px-3.5 border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                config.appBlock.enabled && config.appBlock.method === 'schedule'
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                  : 'border-black/12 dark:border-white/12 text-black/80 dark:text-white/80 hover:border-black/25 dark:hover:border-white/25'
              }`}
            >
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">{t.methodSchedule}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAppBlocker('password')}
              className={`min-h-[46px] px-3.5 border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                config.appBlock.enabled && config.appBlock.method === 'password'
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                  : 'border-black/12 dark:border-white/12 text-black/80 dark:text-white/80 hover:border-black/25 dark:hover:border-white/25'
              }`}
            >
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">{t.methodPassword}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
