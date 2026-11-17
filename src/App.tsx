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
import { NORMAL_DEACTIVATE_WAIT_MS } from './data/initialData';
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

  const [permissionGranted, setPermissionGranted] = useState(false);
  useEffect(() => {
    void nativeFocusBridge.syncConfig(config);
  }, [config]);

  useEffect(() => {
    const refresh = () => {
      const now = Date.now();
      setConfig((previous) => reconcileConfig(previous, now));
      const snapshot = nativeFocusBridge.getSnapshot();
      if (snapshot) {
        setDailyState(snapshot.daily);
        setHistory(snapshot.history);
        void nativeFocusBridge.getPermissionsStatus?.().then((status) => setPermissionGranted(status.accessibility));
      } else {
        setDailyState((previous) => reconcileDailyState(previous, now));
      }
    };
    refresh();
    const interval = window.setInterval(refresh, 1000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
    };
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

  const openProtectionSetup = async (setup: () => void) => {
    if (!isNativeConnected) {
      setup();
      return;
    }
    const status = await nativeFocusBridge.getPermissionsStatus?.();
    setPermissionGranted(Boolean(status?.accessibility));
    if (status?.accessibility) {
      setup();
    } else {
      await nativeFocusBridge.requestPermission?.('accessibility');
    }
  };

  const handleConfirmActivate = useCallback((mode: FocusMode, pin?: string) => {
    setConfig((prev) => ({
      ...prev,
      status: 'active',
      mode,
      strictPin: pin ?? prev.strictPin,
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

  const handleSwitchToProtectedMode = useCallback((mode: 'strict' | 'no_scroll', pin: string) => {
    setConfig((prev) => ({
      ...prev,
      status: 'active',
      mode,
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

        <main className="mx-auto w-full min-w-0 max-w-3xl flex-1 px-4 pt-6 pb-24 sm:px-6">
          {isNativeConnected && !permissionGranted && (
            <section aria-label={language === 'es' ? 'Protección pendiente' : 'Protection pending'}
              className="mb-4 space-y-2 border border-current/20 p-4 text-sm">
              <p className="font-semibold" role="status">
                {language === 'es' ? 'Protección pendiente: falta Accesibilidad' : 'Protection pending: Accessibility is off'}
              </p>
              <p className="text-xs opacity-75">
                {language === 'es'
                  ? 'Activa Accesibilidad para que funcionen el límite de scroll y el bloqueo de apps.'
                  : 'Enable Accessibility to turn on the scroll limit and app blocking.'}
              </p>
              <button className="min-h-[44px] underline underline-offset-4" type="button"
                onClick={() => void nativeFocusBridge.requestPermission?.('accessibility')}>
                {language === 'es' ? 'Configurar Accesibilidad' : 'Set up Accessibility'}
              </button>
            </section>
          )}
          {isNativeConnected && permissionGranted && (
            <p className="mb-4 text-xs opacity-70">
              {language === 'es' ? 'Anti-scroll en pruebas · Instagram, TikTok y YouTube' : 'Anti-scroll in testing · Instagram, TikTok and YouTube'}
            </p>
          )}
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
                  onOpenActivate={() => void openProtectionSetup(() => setIsActivateOpen(true))}
                  onOpenManage={() => setIsManageOpen(true)}
                  onCancelPendingDeactivation={handleCancelPendingDeactivation}
                  onOpenAppBlocker={(method) => void openProtectionSetup(() => setAppBlockDialogMethod(method))}
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
          onSwitchToProtectedMode={handleSwitchToProtectedMode}
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
          isNativeConnected={isNativeConnected}
          onChangeLanguage={setLanguage}
          onChangeTheme={setTheme}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </MotionConfig>
  );
}
