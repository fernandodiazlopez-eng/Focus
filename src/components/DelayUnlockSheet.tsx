import React, { useEffect, useState } from 'react';
import { Clock, X } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n';
import { DigitalClock } from './DigitalClock';

interface DelayUnlockSheetProps {
  open: boolean;
  language: Language;
  planName: string;
  seconds?: number;
  onComplete: () => void;
  onCancel: () => void;
}

export function DelayUnlockSheet({
  open,
  language,
  planName,
  seconds = 10,
  onComplete,
  onCancel,
}: DelayUnlockSheetProps) {
  const t = TRANSLATIONS[language].delayModal;
  const [remaining, setRemaining] = useState(seconds);
  const [selectedIntention, setSelectedIntention] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    setRemaining(seconds);
    setSelectedIntention('');
    const timer = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, seconds]);

  if (!open) return null;

  const elapsed = seconds - remaining;
  const isDone = remaining === 0;
  const canProceed = isDone && selectedIntention !== '';

  // 4s inhale -> 2s hold -> 4s exhale breathing cue
  const breathCue = isDone
    ? t.readyHint
    : elapsed < 4
    ? t.inhale
    : elapsed < 6
    ? t.hold
    : t.exhale;

  const breathProgressPct = isDone
    ? 100
    : elapsed < 4
    ? Math.round(((elapsed + 1) / 4) * 100)
    : elapsed < 6
    ? 100
    : Math.max(15, Math.round(((10 - elapsed) / 4) * 100));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delay-modal-title"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-black/15 dark:border-white/15 bg-[#FAFAFA] dark:bg-[#0B0B0B] text-black dark:text-white p-5 pb-safe space-y-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl border border-black/15 dark:border-white/15 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <h2 id="delay-modal-title" className="text-base font-semibold">
                {t.title}
              </h2>
              <p className="text-xs text-black/60 dark:text-white/60">
                {t.subtitle(planName)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label={t.cancel}
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Breathing Cadence + Digital Clock */}
        <div className="p-4 flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#121212]">
          <DigitalClock
            value={`00:${String(remaining).padStart(2, '0')}`}
            size="xl"
          />
          <p className="text-xs font-medium text-black dark:text-white">
            {breathCue}
          </p>
          <div className="w-full h-1.5 rounded-sm bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white transition-all duration-700 ease-out"
              style={{ width: `${breathProgressPct}%` }}
            />
          </div>
          {!isDone && (
            <p className="text-[11px] text-black/50 dark:text-white/50 text-center">
              {t.waitHint}
            </p>
          )}
        </div>

        {/* Conscious Intention Check (Cognitive Shift) */}
        <div className="space-y-2">
          <span className="block text-xs font-medium text-black/60 dark:text-white/60">
            {t.intentionLabel}
          </span>
          <div className="grid grid-cols-1 gap-2">
            {t.intentions.map((intent) => {
              const active = selectedIntention === intent;
              return (
                <button
                  key={intent}
                  type="button"
                  onClick={() => setSelectedIntention(intent)}
                  className={`min-h-[44px] px-3.5 rounded-xl border text-left text-xs font-medium transition-colors ${
                    active
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                      : 'bg-white dark:bg-[#121212] border-black/12 dark:border-white/12 text-black/75 dark:text-white/75'
                  }`}
                >
                  {intent}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[48px] rounded-2xl border border-black/15 dark:border-white/15 text-sm font-medium"
          >
            {t.keepActive}
          </button>
          <button
            type="button"
            disabled={!canProceed}
            onClick={onComplete}
            className={`min-h-[48px] rounded-2xl text-sm font-medium transition-opacity ${
              canProceed
                ? 'bg-black text-white dark:bg-white dark:text-black active:scale-[0.98]'
                : 'bg-black/15 text-black/40 dark:bg-white/15 dark:text-white/40 cursor-not-allowed'
            }`}
          >
            {t.proceed}
          </button>
        </div>
      </div>
    </div>
  );
}
