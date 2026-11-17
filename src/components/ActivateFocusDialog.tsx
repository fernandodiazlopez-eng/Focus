import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { FocusMode, Language } from '../types';
import { TRANSLATIONS } from '../i18n';
import { DigitalClock } from './DigitalClock';
import { CornerReticles } from './HardwarePrimitives';

interface ActivateFocusDialogProps {
  open: boolean;
  language: Language;
  initialMode?: FocusMode;
  onConfirm: (mode: FocusMode, pin?: string) => void;
  onClose: () => void;
}

export function ActivateFocusDialog({
  open,
  language,
  initialMode = 'normal',
  onConfirm,
  onClose,
}: ActivateFocusDialogProps) {
  const [selectedMode, setSelectedMode] = useState<FocusMode>(initialMode);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedMode(initialMode);
      setPin('');
      setConfirmPin('');
      setPinError(null);
    }
  }, [open, initialMode]);

  if (!open) return null;

  const t = TRANSLATIONS[language].activateDialog;

  const handleConfirm = () => {
    if (selectedMode === 'normal') {
      onConfirm('normal');
      return;
    }

    const trimmedPin = pin.trim();
    const trimmedConfirm = confirmPin.trim();
    if (trimmedPin.length < 4) {
      setPinError(t.pinTooShort);
      return;
    }
    if (trimmedPin !== trimmedConfirm) {
      setPinError(t.pinMismatch);
      return;
    }
    onConfirm('strict', trimmedPin);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activate-dialog-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md border border-black/15 dark:border-white/15 bg-[#FAFAFA] dark:bg-[#0B0B0B] text-black dark:text-white p-5 sm:p-6"
      >
        <CornerReticles active />

        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="activate-dialog-title"
              className="text-lg font-semibold tracking-tight text-balance"
            >
              {t.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.cancelButton}
              className="min-h-[44px] min-w-[44px] -mt-2 -mr-2 flex items-center justify-center text-black/55 hover:text-black dark:text-white/55 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2.5" role="radiogroup" aria-label={t.title}>
            <button
              type="button"
              role="radio"
              aria-checked={selectedMode === 'normal'}
              onClick={() => {
                setSelectedMode('normal');
                setPinError(null);
              }}
              className={`w-full text-left border p-4 transition-colors duration-150 ${
                selectedMode === 'normal'
                  ? 'border-black bg-black/[0.04] dark:border-white dark:bg-white/[0.06]'
                  : 'border-black/12 dark:border-white/12 bg-white dark:bg-[#101010]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{t.normalTitle}</span>
                  <span className="inline-flex items-center text-black/55 dark:text-white/55">
                    <DigitalClock value="15" size="xs" showGhost={false} />
                  </span>
                </div>
                <span
                  className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedMode === 'normal'
                      ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-black/25 dark:border-white/25'
                  }`}
                >
                  {selectedMode === 'normal' && <Check className="h-3 w-3" />}
                </span>
              </div>
              <p className="mt-1 text-xs text-black/65 dark:text-white/65 leading-relaxed">
                {t.normalDesc}
              </p>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={selectedMode === 'strict'}
              onClick={() => {
                setSelectedMode('strict');
                setPinError(null);
              }}
              className={`w-full text-left border p-4 transition-colors duration-150 ${
                selectedMode === 'strict'
                  ? 'border-black bg-black/[0.04] dark:border-white dark:bg-white/[0.06]'
                  : 'border-black/12 dark:border-white/12 bg-white dark:bg-[#101010]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{t.strictTitle}</span>
                <span
                  className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedMode === 'strict'
                      ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-black/25 dark:border-white/25'
                  }`}
                >
                  {selectedMode === 'strict' && <Check className="h-3 w-3" />}
                </span>
              </div>
              <p className="mt-1 text-xs text-black/65 dark:text-white/65 leading-relaxed">
                {t.strictDesc}
              </p>
            </button>
          </div>

          {selectedMode === 'strict' && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="block text-xs font-medium text-black/65 dark:text-white/65">
                    {t.pinLabel}
                  </span>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setPinError(null);
                    }}
                    placeholder={t.pinPlaceholder}
                    className="w-full min-h-[44px] border border-black/15 dark:border-white/15 bg-white dark:bg-[#121212] px-3.5 text-sm font-digital tracking-widest focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="block text-xs font-medium text-black/65 dark:text-white/65">
                    {t.pinConfirmLabel}
                  </span>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={confirmPin}
                    onChange={(e) => {
                      setConfirmPin(e.target.value);
                      setPinError(null);
                    }}
                    placeholder={t.pinPlaceholder}
                    className="w-full min-h-[44px] border border-black/15 dark:border-white/15 bg-white dark:bg-[#121212] px-3.5 text-sm font-digital tracking-widest focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </label>
              </div>

              {pinError && (
                <p className="text-xs font-medium text-black dark:text-white">
                  {pinError}
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full min-h-[50px] bg-black text-white dark:bg-white dark:text-black font-semibold text-sm active:scale-[0.98] transition-transform duration-150"
          >
            {t.confirmButton}
          </button>
        </div>
      </div>
    </div>
  );
}
