import React, { useState, useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  ActiveTab,
  FocusPlan,
  Language,
  StatsPeriod,
  ThemeMode,
} from './types';
import { TRANSLATIONS } from './i18n';
import {
  loadLanguage,
  loadPlans,
  loadTheme,
  saveLanguage,
  saveTheme,
  webFocusBridge,
} from './services/focusStorage';
import { TopBar } from './components/TopBar';
import { BottomDock } from './components/BottomDock';
import { PlansView } from './components/PlansView';
import { StatsView } from './components/StatsView';
import { CreatePlanSheet } from './components/CreatePlanSheet';
import { SettingsSheet } from './components/SettingsSheet';
import { PasswordPromptSheet } from './components/PasswordPromptSheet';
import { DelayUnlockSheet } from './components/DelayUnlockSheet';

export default function App() {
  const [language, setLanguage] = useState<Language>(loadLanguage);
  const [theme, setTheme] = useState<ThemeMode>(loadTheme);
  const [activeTab, setActiveTab] = useState<ActiveTab>('plans');
  const [plans, setPlans] = useState<FocusPlan[]>(loadPlans);

  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>('today');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FocusPlan | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [pendingChallenge, setPendingChallenge] = useState<{
    plan: FocusPlan;
    intent: 'toggle' | 'edit';
    mode: 'password' | 'delay';
  } | null>(null);

  useEffect(() => {
    void webFocusBridge.syncPlans(plans);
  }, [plans]);

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

  const handleTogglePlan = (id: string) => {
    const target = plans.find((p) => p.id === id);
    if (!target) return;

    if (target.active && target.protection === 'password') {
      setPendingChallenge({ plan: target, intent: 'toggle', mode: 'password' });
      return;
    }

    if (target.active && target.protection === 'delay') {
      setPendingChallenge({ plan: target, intent: 'toggle', mode: 'delay' });
      return;
    }

    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (plan: FocusPlan) => {
    if (plan.active && plan.protection === 'password') {
      setPendingChallenge({ plan, intent: 'edit', mode: 'password' });
      return;
    }
    if (plan.active && plan.protection === 'delay') {
      setPendingChallenge({ plan, intent: 'edit', mode: 'delay' });
      return;
    }
    setEditingPlan(plan);
    setIsEditorOpen(true);
  };

  const handleChallengeSuccess = () => {
    if (!pendingChallenge) return;
    const { plan, intent } = pendingChallenge;
    setPendingChallenge(null);

    if (intent === 'toggle') {
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, active: false } : p))
      );
    } else {
      setEditingPlan(plan);
      setIsEditorOpen(true);
    }
  };

  const handleSavePlan = (savedPlan: FocusPlan) => {
    setPlans((prev) => {
      const exists = prev.some((p) => p.id === savedPlan.id);
      if (exists) {
        return prev.map((p) => (p.id === savedPlan.id ? savedPlan : p));
      }
      return [savedPlan, ...prev];
    });
    setIsEditorOpen(false);
    setEditingPlan(null);
  };

  const handleDeletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    setIsEditorOpen(false);
    setEditingPlan(null);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh flex flex-col bg-[#FAFAFA] text-[#0A0A0A] dark:bg-[#050505] dark:text-[#F5F5F5] cyber-grid-bg transition-colors duration-200">
        <TopBar
          brand={t.brand}
          onOpenSettings={() => setIsSettingsOpen(true)}
          settingsAriaLabel={t.settings.title}
        />

        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-24">
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'plans' ? (
              <motion.div
                key="plans"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              >
                <PlansView
                  language={language}
                  plans={plans}
                  onTogglePlan={handleTogglePlan}
                  onEditPlan={handleOpenEdit}
                  onCreatePlan={handleOpenCreate}
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
                  period={statsPeriod}
                  onChangePeriod={setStatsPeriod}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <BottomDock
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          plansLabel={t.tabs.plans}
          statsLabel={t.tabs.stats}
        />

        <CreatePlanSheet
          open={isEditorOpen}
          language={language}
          editingPlan={editingPlan}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingPlan(null);
          }}
          onSave={handleSavePlan}
          onDelete={handleDeletePlan}
        />

        <PasswordPromptSheet
          open={pendingChallenge?.mode === 'password'}
          language={language}
          planName={pendingChallenge?.plan.name ?? ''}
          expectedPassword={pendingChallenge?.plan.password ?? '1234'}
          onSuccess={handleChallengeSuccess}
          onCancel={() => setPendingChallenge(null)}
        />

        <DelayUnlockSheet
          open={pendingChallenge?.mode === 'delay'}
          language={language}
          planName={pendingChallenge?.plan.name ?? ''}
          onComplete={handleChallengeSuccess}
          onCancel={() => setPendingChallenge(null)}
        />

        <SettingsSheet
          open={isSettingsOpen}
          language={language}
          theme={theme}
          onChangeLanguage={setLanguage}
          onChangeTheme={setTheme}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </MotionConfig>
  );
}
