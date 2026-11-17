import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  ActiveTab,
  AppBlockMethod,
  DailyFocusState,
  DailyHistoryEntry,
  FocusConfig,
  FocusMode,
  IndependentAppBlock,
  Language,
  ThemeMode,
} from './types';
import {
  AUTO_PAUSE_MS,
  DAILY_MAX_SCROLL_SECONDS,
  NORMAL_DEACTIVATE_WAIT_MS,
  WINDOW_MAX_SECONDS,
} from './data/initialData';
import { TRANSLATIONS } from './i18n';
import {
  loadConfig,
  loadDailyState,
  loadHistory,
  loadLanguage,
  loadTheme,
  nativeFocusBridge,
  reconcileConfig,
  reconcileDailyState,
  saveLanguage,
  saveTheme,
  upsertTodayHistory,
} from './services/focusStorage';
import { TopBar } from './components/TopBar';
import { BottomDock } from './components/BottomDock';
import { TodayView } from './components/TodayView';
import { StatsView } from './components/StatsView';
import { ActivateFocusDialog } from './components/ActivateFocusDialog';
import { ManageFocusDialog } from './components/ManageFocusDialog';
import { AppBlockerDialog } from './components/AppBlockerDialog';
import { SettingsSheet } from './components/SettingsSheet';

export default function App() {
  const [language, setLanguage] = useState<Language>(loadLanguage);
  const [theme, setTheme] = useState<ThemeMode>(loadTheme);
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [config, setConfig] = useState<FocusConfig>(loadConfig);
  const [dailyState, setDailyState] = useState<DailyFocusState>(loadDailyState);
  const [history, setHistory] =
    useState<Record<string, DailyHistoryEntry>>(loadHistory);

  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appBlockDialogMethod, setAppBlockDialogMethod] =
    useState<AppBlockMethod | null>(null);

  const isNativeConnected = useMemo(
    () => nativeFocusBridge.isNativeAvailable(),
    []
  );

  // Sync config & daily state to storage and native Android bridge
  useEffect(() => {
    void nativeFocusBridge.syncConfig(config);
  }, [config]);

  useEffect(() => {
    void nativeFocusBridge.syncDailyState(dailyState);
    setHistory((prev) => upsertTodayHistory(prev, dailyState));
  }, [dailyState]);

  // Real-time reconciliation for midnight reset, 2h automatic pause, 15m deactivation wait, and app timer
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setConfig((prev) => reconcileConfig(prev, now));
      setDailyState((prev) => reconcileDailyState(prev, now));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        setConfig((prev) => reconcileConfig(prev, now));
        setDailyState((prev) => reconcileDailyState(prev, now));
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Listen for scroll usage events dispatched by native Android WebView bridge
  useEffect(() => {
    const handleNativeUsage = (event: Event) => {
      const custom = event as CustomEvent<{
        network?: string;
        seconds?: number;
      }>;
      const network = custom.detail?.network;
      const seconds = custom.detail?.seconds ?? 0;
      if (!network || seconds <= 0) return;

      const now = Date.now();
      setDailyState((prev) => {
        const current = reconcileDailyState(prev, now);
        if (
          current.pauseEndsAt !== null ||
          current.usedSecondsToday >= DAILY_MAX_SCROLL_SECONDS
        ) {
          return current;
        }
        const remainingWindow = Math.max(
          0,
          WINDOW_MAX_SECONDS - current.windowUsedSeconds
        );
        const remainingDaily = Math.max(
          0,
          DAILY_MAX_SCROLL_SECONDS - current.usedSecondsToday
        );
        const deducted = Math.min(seconds, remainingWindow, remainingDaily);
        if (deducted <= 0) return current;

        const nextWindowUsed = current.windowUsedSeconds + deducted;
        const nextTotalUsed = current.usedSecondsToday + deducted;
        const nextByNetwork = {
          ...current.usedSecondsByNetwork,
          [network]: (current.usedSecondsByNetwork[network] ?? 0) + deducted,
        };

        if (
          current.windowIndex === 1 &&
          nextWindowUsed >= WINDOW_MAX_SECONDS &&
          nextTotalUsed < DAILY_MAX_SCROLL_SECONDS
        ) {
          return {
            ...current,
            usedSecondsToday: nextTotalUsed,
            windowUsedSeconds: nextWindowUsed,
            pauseEndsAt: now + AUTO_PAUSE_MS,
            usedSecondsByNetwork: nextByNetwork,
          };
        }

        return {
          ...current,
          usedSecondsToday: nextTotalUsed,
          windowUsedSeconds: nextWindowUsed,
          usedSecondsByNetwork: nextByNetwork,
        };
      });
    };

    window.addEventListener('focus:nativeScrollUsage', handleNativeUsage);
    return () =>
      window.removeEventListener('focus:nativeScrollUsage', handleNativeUsage);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    saveLanguage(language);
  }, [language]);

  const t = TRANSLATIONS[language];

  const handleConfirmActivate = useCallback((mode: FocusMode, pin?: string) => {
    setConfig((prev) => ({
      ...prev,
      status: 'active',
      mode,
      strictPin: mode === 'strict' && pin ? pin : prev.strictPin,
      pendingDeactivateAt: null,
    }));
    setIsActivateOpen(false);
  }, []);

  const handleRequestDeactivateNormal = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      pendingDeactivateAt: Date.now() + NORMAL_DEACTIVATE_WAIT_MS,
    }));
  }, []);

  const handleCancelPendingDeactivation = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      pendingDeactivateAt: null,
    }));
    setIsManageOpen(false);
  }, []);

  const handleSwitchToStrictWithPin = useCallback((pin: string) => {
    setConfig((prev) => ({
      ...prev,
      status: 'active',
      mode: 'strict',
      strictPin: pin,
      pendingDeactivateAt: null,
    }));
    setIsManageOpen(false);
  }, []);

  const handleStrictVerifyAndApply = useCallback(
    (action: 'to_normal' | 'deactivate') => {
      setConfig((prev) => ({
        ...prev,
        status: action === 'deactivate' ? 'inactive' : 'active',
        mode: action === 'to_normal' ? 'normal' : prev.mode,
        pendingDeactivateAt: null,
      }));
      setIsManageOpen(false);
    },
    []
  );

  const handleSaveAppBlock = useCallback((nextBlock: IndependentAppBlock) => {
    setConfig((prev) => ({
      ...prev,
      appBlock: nextBlock,
    }));
    setAppBlockDialogMethod(null);
  }, []);

  const handleDisableAppBlock = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      appBlock: {
        ...prev.appBlock,
        enabled: false,
        timerEndsAt: null,
      },
    }));
    setAppBlockDialogMethod(null);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh flex flex-col bg-[#FAFAFA] text-[#0A0A0A] dark:bg-[#050505] dark:text-[#F5F5F5] cyber-grid-bg transition-colors duration-200">
        <TopBar
          brand={t.brand}
          onOpenSettings={() => setIsSettingsOpen(true)}
          settingsAriaLabel={t.topBar.settingsLabel}
        />

        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-24">
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'today' ? (
              <motion.div
                key="today"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              >
                <TodayView
                  language={language}
                  config={config}
                  dailyState={dailyState}
                  onOpenActivate={() => setIsActivateOpen(true)}
                  onOpenManage={() => setIsManageOpen(true)}
                  onCancelPendingDeactivation={handleCancelPendingDeactivation}
                  onOpenAppBlocker={(method) => setAppBlockDialogMethod(method)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              >
                <StatsView
                  language={language}
                  dailyState={dailyState}
                  history={history}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <BottomDock
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          todayLabel={t.tabs.today}
          statsLabel={t.tabs.stats}
        />

        <ActivateFocusDialog
          open={isActivateOpen}
          language={language}
          initialMode={config.mode}
          onConfirm={handleConfirmActivate}
          onClose={() => setIsActivateOpen(false)}
        />

        <ManageFocusDialog
          open={isManageOpen}
          language={language}
          mode={config.mode}
          strictPin={config.strictPin}
          pendingDeactivateAt={config.pendingDeactivateAt}
          onRequestDeactivateNormal={handleRequestDeactivateNormal}
          onCancelPendingDeactivation={handleCancelPendingDeactivation}
          onSwitchToStrictWithPin={handleSwitchToStrictWithPin}
          onStrictVerifyAndApply={handleStrictVerifyAndApply}
          onClose={() => setIsManageOpen(false)}
        />

        <AppBlockerDialog
          open={appBlockDialogMethod !== null}
          method={appBlockDialogMethod ?? 'timer'}
          language={language}
          appBlock={config.appBlock}
          onSave={handleSaveAppBlock}
          onDisable={handleDisableAppBlock}
          onClose={() => setAppBlockDialogMethod(null)}
        />

        <SettingsSheet
          open={isSettingsOpen}
          language={language}
          theme={theme}
          config={config}
          isNativeConnected={isNativeConnected}
          onChangeConfig={setConfig}
          onChangeLanguage={setLanguage}
          onChangeTheme={setTheme}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </MotionConfig>
  );
}
