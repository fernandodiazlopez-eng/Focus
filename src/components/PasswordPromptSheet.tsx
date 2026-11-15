import React, { useState, useEffect } from 'react';
import { Lock, X } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n';

interface PasswordPromptSheetProps {
  open: boolean;
  language: Language;
  planName: string;
  expectedPassword: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PasswordPromptSheet({
  open,
  language,
  planName,
  expectedPassword,
  onSuccess,
  onCancel,
}: PasswordPromptSheetProps) {
  const t = TRANSLATIONS[language].passwordModal;
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setInput('');
      setError(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === expectedPassword) {
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-modal-title"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-black/15 dark:border-white/15 bg-[#FAFAFA] dark:bg-[#0B0B0B] text-black dark:text-white p-5 pb-safe space-y-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl border border-black/15 dark:border-white/15 flex items-center justify-center shrink-0">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <h2 id="password-modal-title" className="text-base font-semibold">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <input
              type="password"
              autoFocus
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError(false);
              }}
              placeholder={t.placeholder}
              className="w-full min-h-[48px] rounded-2xl border border-black/20 dark:border-white/20 bg-white dark:bg-[#121212] px-4 text-sm text-black dark:text-white placeholder:text-black/35 dark:placeholder:text-white/35 focus:outline-none focus:border-black dark:focus:border-white"
            />
            {error && (
              <p className="text-xs font-medium text-black dark:text-white">
                {t.wrongError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[48px] rounded-2xl border border-black/15 dark:border-white/15 text-sm font-medium"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="min-h-[48px] rounded-2xl bg-black text-white dark:bg-white dark:text-black text-sm font-medium active:scale-[0.98]"
            >
              {t.unlockButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
