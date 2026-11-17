import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { FocusMode, Language } from '../types';
import { formatLocalHHMM } from '../data/initialData';
import { TRANSLATIONS } from '../i18n';
import { DigitalClock } from './DigitalClock';
import { CornerReticles } from './HardwarePrimitives';

interface ManageFocusDialogProps {
  open: boolean;
  language: Language;
  mode: FocusMode;
  strictPin: string;
  pendingDeactivateAt: number | null;
  onRequestDeactivateNormal: () => void;
  onCancelPendingDeactivation: () => void;
  onSwitchToStrictWithPin: (pin: string) => void;
  onStrictVerifyAndApply: (action: 'to_normal' | 'deactivate') => void;
  onClose: () => void;
}

export function ManageFocusDialog({
  open,
  language,
  mode,
  strictPin,
  pendingDeactivateAt,
  onRequestDeactivateNormal,
  onCancelPendingDeactivation,
  onSwitchToStrictWithPin,
  onStrictVerifyAndApply,
  onClose,
}: ManageFocusDialogProps) {
  const [strictStep, setStrictStep] = useState<
    'menu' | 'pin_to_normal' | 'pin_deactivate'
  >('menu');
  const [normalStep, setNormalStep] = useState<'menu' | 'setup_strict_pin'>(
    'menu'
  );
  const [pinInput, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStrictStep('menu');
      setNormalStep('menu');
      setPinInput('');
      setNewPin('');
      setConfirmNewPin('');
      setErrorMsg(null);
    }
  }, [open]);

  if (!open) return null;

  const t = TRANSLATIONS[language].manageDialog;
  const actT = TRANSLATIONS[language].activateDialog;

  const handleConfirmStrictPin = () => {
    if (pinInput.trim() !== strictPin) {
      setErrorMsg(t.pinInvalid);
      return;
    }
    onStrictVerifyAndApply(
      strictStep === 'pin_to_normal' ? 'to_normal' : 'deactivate'
    );
  };

  const handleConfirmUpgradeToStrict = () => {
    const p1 = newPin.trim();
    const p2 = confirmNewPin.trim();
    if (p1.length < 4) {
      setErrorMsg(actT.pinTooShort);
      return;
    }
    if (p1 !== p2) {
      setErrorMsg(actT.pinMismatch);
      return;
    }
    onSwitchToStrictWithPin(p1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-focus-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md border border-black/15 dark:border-white/15 bg-[#FAFAFA] dark:bg-[#0B0B0B] text-black dark:text-white p-5 sm:p-6"
      >
        <CornerReticles active />

        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2
                id="manage-focus-title"
                className="text-lg font-semibold tracking-tight"
              >
                {t.title}
              </h2>
              <p className="text-xs text-black/55 dark:text-white/55">
                {mode === 'normal' ? t.currentNormal : t.currentStrict}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="min-h-[44px] min-w-[44px] -mt-2 -mr-2 flex items-center justify-center text-black/55 hover:text-black dark:text-white/55 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* NORMAL MODE */}
          {mode === 'normal' && pendingDeactivateAt !== null && (
            <div className="border border-black/15 dark:border-white/15 bg-white dark:bg-[#101010] p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-black dark:text-white">
                <span>{t.pendingBeforeTime}</span>
                <DigitalClock
                  value={formatLocalHHMM(pendingDeactivateAt)}
                  size="xs"
                  showGhost={false}
                />
              </div>

              <button
                type="button"
                onClick={onCancelPendingDeactivation}
                className="w-full min-h-[46px] bg-black text-white dark:bg-white dark:text-black font-semibold text-xs active:scale-[0.98] transition-transform"
              >
                {t.cancelRequest}
              </button>
            </div>
          )}

          {mode === 'normal' &&
            pendingDeactivateAt === null &&
            normalStep === 'menu' && (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={onRequestDeactivateNormal}
                  className="w-full text-left border border-black/12 dark:border-white/12 bg-white dark:bg-[#101010] p-4 hover:border-black/30 dark:hover:border-white/30 transition-colors"
                >
                  <div className="text-sm font-semibold">
                    {t.deactivateIn15Title}
                  </div>
                  <p className="mt-1 text-xs text-black/60 dark:text-white/60 leading-relaxed">
                    {t.deactivateIn15Desc}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNormalStep('setup_strict_pin');
                    setErrorMsg(null);
                  }}
                  className="w-full text-left border border-black/12 dark:border-white/12 bg-white dark:bg-[#101010] p-4 hover:border-black/30 dark:hover:border-white/30 transition-colors"
                >
                  <div className="text-sm font-semibold">
                    {t.switchToStrictTitle}
                  </div>
                  <p className="mt-1 text-xs text-black/60 dark:text-white/60 leading-relaxed">
                    {t.switchToStrictDesc}
                  </p>
                </button>
              </div>
            )}

          {mode === 'normal' &&
            pendingDeactivateAt === null &&
            normalStep === 'setup_strict_pin' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block space-y-1.5">
                    <span className="block text-xs font-medium text-black/65 dark:text-white/65">
                      {actT.pinLabel}
                    </span>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={newPin}
                      onChange={(e) => {
                        setNewPin(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder={actT.pinPlaceholder}
                      className="w-full min-h-[44px] border border-black/15 dark:border-white/15 bg-white dark:bg-[#121212] px-3.5 text-sm font-digital tracking-widest"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="block text-xs font-medium text-black/65 dark:text-white/65">
                      {actT.pinConfirmLabel}
                    </span>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={confirmNewPin}
                      onChange={(e) => {
                        setConfirmNewPin(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder={actT.pinPlaceholder}
                      className="w-full min-h-[44px] border border-black/15 dark:border-white/15 bg-white dark:bg-[#121212] px-3.5 text-sm font-digital tracking-widest"
                    />
                  </label>
                </div>

                {errorMsg && (
                  <p className="text-xs font-medium text-black dark:text-white">
                    {errorMsg}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNormalStep('menu');
                      setErrorMsg(null);
                    }}
                    className="min-h-[46px] px-4 border border-black/15 dark:border-white/15 text-xs font-medium"
                  >
                    {t.backButton}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmUpgradeToStrict}
                    className="flex-1 min-h-[46px] bg-black text-white dark:bg-white dark:text-black text-xs font-semibold"
                  >
                    {t.confirmPinAction}
                  </button>
                </div>
              </div>
            )}

          {/* STRICT MODE (PIN PROTECTED) */}
          {mode === 'strict' && strictStep === 'menu' && (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setStrictStep('pin_to_normal');
                  setPinInput('');
                  setErrorMsg(null);
                }}
                className="w-full text-left border border-black/12 dark:border-white/12 bg-white dark:bg-[#101010] p-4 hover:border-black/30 dark:hover:border-white/30 transition-colors"
              >
                <div className="text-sm font-semibold">
                  {t.backToNormalWithPin}
                </div>
                <p className="mt-1 text-xs text-black/60 dark:text-white/60 leading-relaxed">
                  {t.backToNormalDesc}
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStrictStep('pin_deactivate');
                  setPinInput('');
                  setErrorMsg(null);
                }}
                className="w-full text-left border border-black/12 dark:border-white/12 bg-white dark:bg-[#101010] p-4 hover:border-black/30 dark:hover:border-white/30 transition-colors"
              >
                <div className="text-sm font-semibold">
                  {t.deactivateWithPin}
                </div>
                <p className="mt-1 text-xs text-black/60 dark:text-white/60 leading-relaxed">
                  {t.deactivateWithPinDesc}
                </p>
              </button>
            </div>
          )}

          {mode === 'strict' && strictStep !== 'menu' && (
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="block text-xs font-medium text-black/65 dark:text-white/65">
                  {t.enterPinPrompt}
                </span>
                <input
                  type="password"
                  inputMode="numeric"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder={t.pinPlaceholder}
                  className="w-full min-h-[46px] border border-black/15 dark:border-white/15 bg-white dark:bg-[#121212] px-3.5 text-sm font-digital tracking-widest focus:outline-none focus:border-black dark:focus:border-white"
                />
              </label>

              {errorMsg && (
                <p className="text-xs font-medium text-black dark:text-white">
                  {errorMsg}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStrictStep('menu');
                    setErrorMsg(null);
                  }}
                  className="min-h-[46px] px-4 border border-black/15 dark:border-white/15 text-xs font-medium"
                >
                  {t.backButton}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStrictPin}
                  className="flex-1 min-h-[46px] bg-black text-white dark:bg-white dark:text-black text-xs font-semibold"
                >
                  {t.confirmPinAction}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
