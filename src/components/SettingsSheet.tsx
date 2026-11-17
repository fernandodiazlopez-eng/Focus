import React, { useEffect, useState } from 'react';
import {
  X,
  Moon,
  Sun,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import {
  Language,
  NativePermissionStatus,
  ThemeMode,
} from '../types';
import { TRANSLATIONS } from '../i18n';
import { nativeFocusBridge } from '../services/focusStorage';
import { CornerReticles } from './HardwarePrimitives';

interface SettingsSheetProps {
  open: boolean;
  language: Language;
  theme: ThemeMode;
  isNativeConnected: boolean;
  onChangeLanguage: (lang: Language) => void;
  onChangeTheme: (theme: ThemeMode) => void;
  onClose: () => void;
}

export function SettingsSheet({
  open,
  language,
  theme,
  isNativeConnected,
  onChangeLanguage,
  onChangeTheme,
  onClose,
}: SettingsSheetProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [permStatus, setPermStatus] = useState<NativePermissionStatus>({
    accessibility: false,
    usageStats: false,
    overlay: false,
    deviceAdmin: false,
  });
  useEffect(() => {
    if (!open) {
      setAdvancedOpen(false);
      return;
    }
    if (!isNativeConnected) return;
    const refresh = () => void nativeFocusBridge.getPermissionsStatus?.().then(setPermStatus);
    refresh();
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, [open, isNativeConnected]);

  if (!open) return null;

  const t = TRANSLATIONS[language].settings;

  const androidRows = [{
    key: 'accessibility' as const,
    icon: ShieldCheck,
    ...t.androidPerms.accessibility,
    granted: permStatus.accessibility,
  }];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-sheet-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[88dvh] flex flex-col border border-black/15 dark:border-white/15 bg-[#FAFAFA] dark:bg-[#0B0B0B] text-black dark:text-white overflow-hidden"
      >
        <CornerReticles active />

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/10 dark:border-white/10">
          <h2 id="settings-sheet-title" className="text-lg font-semibold tracking-tight">
            {t.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Language & Appearance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="block text-xs font-medium text-black/60 dark:text-white/60">
                {t.languageLabel}
              </span>
              <div className="grid grid-cols-2 gap-1 border border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.04] p-1">
                <button
                  type="button"
                  onClick={() => onChangeLanguage('es')}
                  className={`min-h-[40px] text-xs font-medium ${
                    language === 'es'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-black/60 dark:text-white/60'
                  }`}
                >
                  Español
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLanguage('en')}
                  className={`min-h-[40px] text-xs font-medium ${
                    language === 'en'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-black/60 dark:text-white/60'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-medium text-black/60 dark:text-white/60">
                {t.themeLabel}
              </span>
              <div className="grid grid-cols-2 gap-1 border border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.04] p-1">
                <button
                  type="button"
                  onClick={() => onChangeTheme('dark')}
                  className={`min-h-[40px] text-xs font-medium flex items-center justify-center gap-1.5 ${
                    theme === 'dark'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-black/60 dark:text-white/60'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span>{t.themeDark}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeTheme('light')}
                  className={`min-h-[40px] text-xs font-medium flex items-center justify-center gap-1.5 ${
                    theme === 'light'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-black/60 dark:text-white/60'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>{t.themeLight}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-black/8 dark:border-white/8" />

          {/* Advanced Settings Collapsible Section */}
          <div className="border border-black/12 dark:border-white/12 bg-white dark:bg-[#101010]">
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              aria-expanded={advancedOpen}
              className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between gap-3 text-left"
            >
              <span className="text-sm font-medium text-black dark:text-white">
                {t.advancedTitle}
              </span>
              {advancedOpen ? (
                <ChevronUp className="h-4 w-4 text-black/60 dark:text-white/60" />
              ) : (
                <ChevronDown className="h-4 w-4 text-black/60 dark:text-white/60" />
              )}
            </button>

            {advancedOpen && (
              <div className="px-4 pb-4 pt-3 border-t border-black/8 dark:border-white/8 space-y-5">
                <p className="text-xs text-black/60 dark:text-white/60">
                  {language === 'es' ? 'Protección contra desinstalación disponible solo en dispositivos gestionados.'
                    : 'Uninstall protection is available only on managed devices.'}
                </p>

                {/* Android Permissions */}
                <div className="space-y-2.5 pt-3 border-t border-black/8 dark:border-white/8">
                  <div className="text-xs font-medium text-black/55 dark:text-white/55">
                    {t.androidLabel}
                  </div>
                  <div className="divide-y divide-black/8 dark:divide-white/8 border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-[#0B0B0B] px-3.5">
                    {androidRows.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            if (
                              isNativeConnected &&
                              nativeFocusBridge.requestPermission
                            ) {
                              void nativeFocusBridge.requestPermission(item.key);
                            }
                          }}
                          className="w-full text-left flex items-center justify-between gap-3 py-3"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <Icon
                              className="h-4 w-4 mt-0.5 shrink-0"
                              strokeWidth={1.7}
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-black dark:text-white">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-black/60 dark:text-white/60">
                                {item.desc}
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] font-digital text-black/50 dark:text-white/50 whitespace-nowrap shrink-0">
                            {item.granted ? t.androidConnected : t.androidPending}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-[11px] text-black/45 dark:text-white/45 pt-1">
            {t.footerNote}
          </p>
        </div>
      </div>
    </div>
  );
}
