import React from 'react';
import {
  X,
  Moon,
  Sun,
  Smartphone,
  Eye,
  CalendarClock,
  ShieldCheck,
  Activity,
  Layers,
  Lock,
} from 'lucide-react';
import { Language, ThemeMode } from '../types';
import { TRANSLATIONS } from '../i18n';

interface SettingsSheetProps {
  open: boolean;
  language: Language;
  theme: ThemeMode;
  onChangeLanguage: (lang: Language) => void;
  onChangeTheme: (theme: ThemeMode) => void;
  onClose: () => void;
}

export function SettingsSheet({
  open,
  language,
  theme,
  onChangeLanguage,
  onChangeTheme,
  onClose,
}: SettingsSheetProps) {
  if (!open) return null;

  const t = TRANSLATIONS[language].settings;

  const androidRows = [
    { icon: ShieldCheck, ...t.androidPerms.accessibility },
    { icon: Activity, ...t.androidPerms.usageStats },
    { icon: Layers, ...t.androidPerms.overlay },
  ];

  const futureRows = [
    { icon: Eye, ...t.futureItems.grayscale },
    { icon: Lock, ...t.futureItems.antiUninstall },
    { icon: Smartphone, ...t.futureItems.haptics },
    { icon: CalendarClock, ...t.futureItems.profiles },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-sheet-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-black/15 dark:border-white/15 bg-[#FAFAFA] dark:bg-[#0B0B0B] text-black dark:text-white overflow-hidden"
      >
        {/* Mobile grab handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-black/20 dark:bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/10 dark:border-white/10">
          <h2 id="settings-sheet-title" className="text-lg font-semibold tracking-tight">
            {t.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 pb-safe">
          {/* Language */}
          <div className="space-y-3">
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-black dark:text-white">
                {t.languageLabel}
              </div>
              <div className="text-xs text-black/55 dark:text-white/55">
                {t.languageDesc}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.04] p-1">
              <button
                type="button"
                onClick={() => onChangeLanguage('es')}
                className={`min-h-[44px] rounded-xl text-sm font-medium transition-colors duration-150 ${
                  language === 'es'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white'
                }`}
              >
                Español
              </button>
              <button
                type="button"
                onClick={() => onChangeLanguage('en')}
                className={`min-h-[44px] rounded-xl text-sm font-medium transition-colors duration-150 ${
                  language === 'en'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="border-t border-black/8 dark:border-white/8" />

          {/* Theme */}
          <div className="space-y-3">
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-black dark:text-white">
                {t.themeLabel}
              </div>
              <div className="text-xs text-black/55 dark:text-white/55">
                {t.themeDesc}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onChangeTheme('dark')}
                className={`min-h-[52px] flex items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition-colors duration-150 ${
                  theme === 'dark'
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                    : 'bg-white dark:bg-[#121212] border-black/12 dark:border-white/12 text-black/75 dark:text-white/75'
                }`}
              >
                <Moon className="h-4 w-4" />
                <span>{t.themeDark}</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeTheme('light')}
                className={`min-h-[52px] flex items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition-colors duration-150 ${
                  theme === 'light'
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                    : 'bg-white dark:bg-[#121212] border-black/12 dark:border-white/12 text-black/75 dark:text-white/75'
                }`}
              >
                <Sun className="h-4 w-4" />
                <span>{t.themeLight}</span>
              </button>
            </div>
          </div>

          <div className="border-t border-black/8 dark:border-white/8" />

          {/* Android APK Native Permissions Architecture */}
          <div className="space-y-3">
            <div className="text-xs font-medium text-black/55 dark:text-white/55">
              {t.androidLabel}
            </div>

            <div className="divide-y divide-black/8 dark:divide-white/8 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#101010] px-4">
              {androidRows.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-center justify-between gap-3 py-3.5"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Icon className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.7} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-black dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-xs text-black/60 dark:text-white/60">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-digital text-black/50 dark:text-white/50 whitespace-nowrap shrink-0">
                      {t.androidBadge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-black/8 dark:border-white/8" />

          {/* Behavioral Health & Future APK Features */}
          <div className="space-y-3">
            <div className="text-xs font-medium text-black/55 dark:text-white/55">
              {t.futureLabel}
            </div>

            <div className="divide-y divide-black/8 dark:divide-white/8 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#101010] px-4">
              {futureRows.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-center justify-between gap-3 py-3.5 opacity-60"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Icon className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.7} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-black dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-xs text-black/60 dark:text-white/60">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-digital text-black/50 dark:text-white/50 whitespace-nowrap shrink-0">
                      {t.comingSoon}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-center text-[11px] text-black/45 dark:text-white/45 pt-1">
            {t.conceptNote}
          </p>
        </div>
      </div>
    </div>
  );
}
