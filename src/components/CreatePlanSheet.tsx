import React, { useState, useEffect } from 'react';
import {
  X,
  Ban,
  Shield,
  Lock,
  Clock,
  Minus,
  Plus,
  Trash2,
  Check,
  Smartphone,
  Search,
  Moon,
} from 'lucide-react';
import {
  AntiScrollAppRule,
  FocusPlan,
  Language,
  PlanAntiScrollSection,
  PlanBlockSection,
  PlanProtectionMode,
  RuleMode,
  RuleScheduleConfig,
  WeekdayKey,
} from '../types';
import {
  APP_CATALOG,
  APP_ELEMENTS_CATALOG,
  DURATION_PRESETS,
  GENERAL_BLOCK_APPS,
  SOCIAL_APPS,
  WEEKDAYS_ORDER,
  formatDigitalDuration,
} from '../data/initialData';
import { TRANSLATIONS } from '../i18n';
import { DigitalClock } from './DigitalClock';
import { HardwareToggle } from './HardwarePrimitives';

interface CreatePlanSheetProps {
  open: boolean;
  language: Language;
  editingPlan: FocusPlan | null;
  onClose: () => void;
  onSave: (plan: FocusPlan) => void;
  onDelete: (id: string) => void;
}

type DivisionTab = 'antiscroll' | 'block';

const createDefaultAntiscroll = (): PlanAntiScrollSection => ({
  enabled: true,
  mode: 'daily_limit',
  dailyLimitMinutes: 15,
  durationPreset: '1d',
  selectedDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  timeRange: '08:00 – 21:00',
  apps: [
    {
      appName: 'Instagram',
      androidPackage: 'com.instagram.android',
      removedElements: ['ig_lupa', 'ig_reels_tab', 'ig_home_reels'],
    },
    {
      appName: 'TikTok',
      androidPackage: 'com.zhiliaoapp.musically',
      removedElements: ['tt_para_ti', 'tt_escroleo'],
    },
  ],
});

const createDefaultBlock = (): PlanBlockSection => ({
  enabled: false,
  mode: 'daily_limit',
  dailyLimitMinutes: 45,
  durationPreset: '1d',
  selectedDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  timeRange: '22:30 – 07:30',
  apps: [],
});

function RuleModePanel({
  language,
  targetLabel,
  config,
  onChange,
}: {
  language: Language;
  targetLabel: string;
  config: RuleScheduleConfig;
  onChange: (patch: Partial<RuleScheduleConfig>) => void;
}) {
  const t = TRANSLATIONS[language].editor;
  const tw = TRANSLATIONS[language].weekdays;
  const td = TRANSLATIONS[language].durations;

  const [startStr, endStr] = config.timeRange.includes('–')
    ? config.timeRange.split('–').map((s) => s.trim())
    : ['08:00', '21:00'];

  const toggleDay = (day: WeekdayKey) => {
    const exists = config.selectedDays.includes(day);
    if (exists) {
      if (config.selectedDays.length > 1) {
        onChange({ selectedDays: config.selectedDays.filter((d) => d !== day) });
      }
    } else {
      onChange({ selectedDays: [...config.selectedDays, day] });
    }
  };

  return (
    <div className="space-y-3 pt-2 border-t border-black/8 dark:border-white/8">
      <span className="block text-xs font-medium text-black/60 dark:text-white/60">
        {t.modeSectionLabel}
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(['daily_limit', 'always', 'duration', 'days'] as RuleMode[]).map((mode) => {
          const selected = config.mode === mode;
          const copy = t.modes[mode];
          return (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ mode })}
              className={`min-h-[68px] flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-colors ${
                selected
                  ? 'border-black dark:border-white bg-black/[0.04] dark:bg-white/[0.06]'
                  : 'border-black/10 dark:border-white/10 bg-white dark:bg-[#121212]'
              }`}
            >
              <div className="text-sm font-medium">{copy.title}</div>
              <div className="text-[11px] text-black/55 dark:text-white/55 pt-1">
                {copy.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Mode 1: Daily Usage Limit */}
      {config.mode === 'daily_limit' && (
        <div className="rounded-2xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#121212] p-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-black/70 dark:text-white/70">
              {t.dailyMaxLabel}
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    dailyLimitMinutes: Math.max(5, config.dailyLimitMinutes - 5),
                  })
                }
                aria-label="-5 min"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-black/15 dark:border-white/15 active:scale-95"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="min-w-[74px] flex justify-center">
                <DigitalClock
                  value={formatDigitalDuration(config.dailyLimitMinutes)}
                  size="md"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    dailyLimitMinutes: Math.min(180, config.dailyLimitMinutes + 5),
                  })
                }
                aria-label="+5 min"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-black/15 dark:border-white/15 active:scale-95"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-black/55 dark:text-white/55">
            {t.dailyMaxHint(config.dailyLimitMinutes, targetLabel)}
          </p>
        </div>
      )}

      {/* Mode 3: Continuous Duration */}
      {config.mode === 'duration' && (
        <div className="space-y-2">
          <span className="block text-xs font-medium text-black/60 dark:text-white/60">
            {t.durationPickLabel}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DURATION_PRESETS.map((preset) => {
              const selected = config.durationPreset === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange({ durationPreset: preset })}
                  className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                    selected
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                      : 'bg-white dark:bg-[#121212] border-black/12 dark:border-white/12 text-black/80 dark:text-white/80'
                  }`}
                >
                  {td[preset]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 4: Days & Hours */}
      {config.mode === 'days' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-black/60 dark:text-white/60">
              {t.daysPickLabel}
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() =>
                  onChange({ selectedDays: ['mon', 'tue', 'wed', 'thu', 'fri'] })
                }
                className="min-h-[34px] px-2.5 rounded-lg border border-black/12 dark:border-white/12 hover:bg-black/5 dark:hover:bg-white/5"
              >
                {t.quickWeekdays}
              </button>
              <button
                type="button"
                onClick={() => onChange({ selectedDays: ['sat', 'sun'] })}
                className="min-h-[34px] px-2.5 rounded-lg border border-black/12 dark:border-white/12 hover:bg-black/5 dark:hover:bg-white/5"
              >
                {t.quickWeekend}
              </button>
              <button
                type="button"
                onClick={() => onChange({ selectedDays: [...WEEKDAYS_ORDER] })}
                className="min-h-[34px] px-2.5 rounded-lg border border-black/12 dark:border-white/12 hover:bg-black/5 dark:hover:bg-white/5"
              >
                {t.quickAllDays}
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    selectedDays: [...WEEKDAYS_ORDER],
                    timeRange: '22:30 – 07:30',
                  })
                }
                className="min-h-[34px] px-2.5 rounded-lg border border-black/12 dark:border-white/12 hover:bg-black/5 dark:hover:bg-white/5 inline-flex items-center gap-1"
              >
                <Moon className="h-3 w-3" />
                <span>{t.quickSleepHygiene}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS_ORDER.map((day) => {
              const selected = config.selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`min-h-[44px] rounded-xl border text-xs font-semibold transition-colors ${
                    selected
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                      : 'bg-white dark:bg-[#121212] border-black/12 dark:border-white/12 text-black/60 dark:text-white/60'
                  }`}
                >
                  {tw[day]}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-black/50 dark:text-white/50">
                {t.startLabel}
              </label>
              <input
                type="time"
                value={startStr}
                onChange={(e) =>
                  onChange({ timeRange: `${e.target.value} – ${endStr}` })
                }
                className="w-full min-h-[46px] rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#121212] px-3 font-digital text-base text-black dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-black/50 dark:text-white/50">
                {t.endLabel}
              </label>
              <input
                type="time"
                value={endStr}
                onChange={(e) =>
                  onChange({ timeRange: `${startStr} – ${e.target.value}` })
                }
                className="w-full min-h-[46px] rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#121212] px-3 font-digital text-base text-black dark:text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CreatePlanSheet({
  open,
  language,
  editingPlan,
  onClose,
  onSave,
  onDelete,
}: CreatePlanSheetProps) {
  const t = TRANSLATIONS[language].editor;

  const [activeTab, setActiveTab] = useState<DivisionTab>('antiscroll');
  const [name, setName] = useState('');
  const [protection, setProtection] = useState<PlanProtectionMode>('normal');
  const [password, setPassword] = useState('');

  const [antiscroll, setAntiscroll] = useState<PlanAntiScrollSection>(
    createDefaultAntiscroll
  );
  const [block, setBlock] = useState<PlanBlockSection>(createDefaultBlock);

  const [appSearch, setAppSearch] = useState('');
  const [customAppName, setCustomAppName] = useState('');

  useEffect(() => {
    if (!open) return;
    setActiveTab('antiscroll');
    setAppSearch('');
    setCustomAppName('');

    if (editingPlan) {
      setName(editingPlan.name);
      setProtection(editingPlan.protection);
      setPassword(editingPlan.password || '');
      setAntiscroll({
        ...createDefaultAntiscroll(),
        ...JSON.parse(JSON.stringify(editingPlan.antiscroll)),
      });
      setBlock(JSON.parse(JSON.stringify(editingPlan.block)));
    } else {
      setName('');
      setProtection('normal');
      setPassword('');
      setAntiscroll(createDefaultAntiscroll());
      setBlock(createDefaultBlock());
    }
  }, [open, editingPlan]);

  if (!open) return null;

  const toggleAntiScrollApp = (appName: string) => {
    setAntiscroll((prev) => {
      const exists = prev.apps.some((a) => a.appName === appName);
      if (exists) {
        return {
          ...prev,
          apps: prev.apps.filter((a) => a.appName !== appName),
        };
      }
      const catalog = APP_ELEMENTS_CATALOG[appName] ?? [];
      const defaultElements = catalog.slice(0, 2).map((el) => el.id);
      const pkg = APP_CATALOG.find((a) => a.name === appName)?.androidPackage;
      const added: AntiScrollAppRule = {
        appName,
        androidPackage: pkg,
        removedElements: defaultElements,
      };
      return {
        ...prev,
        enabled: true,
        apps: [...prev.apps, added],
      };
    });
  };

  const toggleAppElement = (appName: string, elementId: string) => {
    setAntiscroll((prev) => ({
      ...prev,
      apps: prev.apps.map((rule) => {
        if (rule.appName !== appName) return rule;
        const has = rule.removedElements.includes(elementId);
        return {
          ...rule,
          removedElements: has
            ? rule.removedElements.filter((id) => id !== elementId)
            : [...rule.removedElements, elementId],
        };
      }),
    }));
  };

  const toggleBlockApp = (appName: string) => {
    setBlock((prev) => {
      const exists = prev.apps.includes(appName);
      return {
        ...prev,
        enabled: exists ? prev.enabled : true,
        apps: exists
          ? prev.apps.filter((a) => a !== appName)
          : [...prev.apps, appName],
      };
    });
  };

  const handleAddCustomApp = () => {
    const clean = customAppName.trim();
    if (!clean) return;
    setBlock((prev) => {
      if (prev.apps.includes(clean)) return prev;
      return {
        ...prev,
        enabled: true,
        apps: [...prev.apps, clean],
      };
    });
    setCustomAppName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    const plan: FocusPlan = {
      id: editingPlan ? editingPlan.id : `plan-${now}`,
      name: name.trim() || t.defaultNewName,
      active: editingPlan ? editingPlan.active : true,
      protection,
      password:
        protection === 'password' ? password.trim() || '1234' : undefined,
      antiscroll,
      block,
      createdAt: editingPlan?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(plan);
  };

  const antiCount = antiscroll.enabled ? antiscroll.apps.length : 0;
  const blockCount = block.enabled ? block.apps.length : 0;

  const allBlockChoices = Array.from(
    new Set([...GENERAL_BLOCK_APPS, ...block.apps])
  ).filter((app) =>
    app.toLowerCase().includes(appSearch.trim().toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-sheet-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-black/15 dark:border-white/15 bg-[#FAFAFA] dark:bg-[#0B0B0B] text-black dark:text-white overflow-hidden"
      >
        {/* Mobile grab handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-black/20 dark:bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/10 dark:border-white/10">
          <h2 id="plan-sheet-title" className="text-lg font-semibold tracking-tight">
            {editingPlan ? t.editTitle : t.createTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancel}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Top Plan Name + 2-Part Division Tabs */}
          <div className="px-5 pt-4 pb-3 space-y-3 border-b border-black/8 dark:border-white/8">
            <input
              id="plan-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              aria-label={t.nameLabel}
              className="w-full min-h-[46px] rounded-2xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#121212] px-4 text-sm text-black dark:text-white placeholder:text-black/35 dark:placeholder:text-white/35 focus:outline-none focus:border-black dark:focus:border-white"
            />

            <div
              role="tablist"
              className="grid grid-cols-2 gap-1 rounded-2xl border border-black/12 dark:border-white/12 bg-black/[0.04] dark:bg-white/[0.04] p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'antiscroll'}
                onClick={() => setActiveTab('antiscroll')}
                className={`min-h-[44px] px-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'antiscroll'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-black/65 dark:text-white/65'
                }`}
              >
                <Ban className="h-4 w-4 shrink-0" />
                <span>{t.tabs.antiscroll}</span>
                <DigitalClock
                  value={String(antiCount).padStart(2, '0')}
                  size="xs"
                  showGhost={false}
                />
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'block'}
                onClick={() => setActiveTab('block')}
                className={`min-h-[44px] px-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'block'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-black/65 dark:text-white/65'
                }`}
              >
                <Shield className="h-4 w-4 shrink-0" />
                <span>{t.tabs.block}</span>
                <DigitalClock
                  value={String(blockCount).padStart(2, '0')}
                  size="xs"
                  showGhost={false}
                />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            {/* ANTI-SCROLL DIVISION */}
            {activeTab === 'antiscroll' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#121212] p-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">{t.enableAntiscroll}</div>
                    <div className="text-xs text-black/55 dark:text-white/55">
                      {t.enableAntiscrollDesc}
                    </div>
                  </div>
                  <HardwareToggle
                    checked={antiscroll.enabled}
                    onChange={() =>
                      setAntiscroll((p) => ({ ...p, enabled: !p.enabled }))
                    }
                    ariaLabel={t.enableAntiscroll}
                  />
                </div>

                {antiscroll.enabled && (
                  <>
                    <div className="space-y-2.5">
                      <span className="block text-xs font-medium text-black/60 dark:text-white/60">
                        {t.socialAppsLabel}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SOCIAL_APPS.map((appName) => {
                          const selected = antiscroll.apps.some(
                            (a) => a.appName === appName
                          );
                          return (
                            <button
                              key={appName}
                              type="button"
                              onClick={() => toggleAntiScrollApp(appName)}
                              className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 transition-colors ${
                                selected
                                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                  : 'bg-white dark:bg-[#121212] border-black/12 dark:border-white/12 text-black/75 dark:text-white/75'
                              }`}
                            >
                              <span className="truncate">{appName}</span>
                              {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {antiscroll.apps.length > 0 && (
                      <div className="space-y-3">
                        <div className="space-y-0.5">
                          <h3 className="text-xs font-semibold text-black dark:text-white">
                            {t.stripElementsTitle}
                          </h3>
                          <p className="text-xs text-black/55 dark:text-white/55">
                            {t.stripElementsHint}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {antiscroll.apps.map((rule) => {
                            const elements = APP_ELEMENTS_CATALOG[rule.appName] ?? [];
                            return (
                              <div
                                key={rule.appName}
                                className="rounded-2xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#121212] p-3.5 space-y-2.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold">
                                    {rule.appName}
                                  </span>
                                  <DigitalClock
                                    value={`${String(
                                      rule.removedElements.length
                                    ).padStart(2, '0')}/${String(
                                      elements.length
                                    ).padStart(2, '0')}`}
                                    size="xs"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {elements.map((el) => {
                                    const active = rule.removedElements.includes(
                                      el.id
                                    );
                                    const label =
                                      language === 'es' ? el.labelEs : el.labelEn;
                                    return (
                                      <button
                                        key={el.id}
                                        type="button"
                                        onClick={() =>
                                          toggleAppElement(rule.appName, el.id)
                                        }
                                        className={`min-h-[44px] px-3 py-2 rounded-xl border text-left text-xs font-medium flex items-center justify-between gap-2 transition-colors ${
                                          active
                                            ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black'
                                            : 'border-black/12 dark:border-white/12 text-black/70 dark:text-white/70'
                                        }`}
                                      >
                                        <span className="truncate">{label}</span>
                                        <span
                                          className={`h-3.5 w-3.5 rounded-[3px] border flex items-center justify-center shrink-0 ${
                                            active
                                              ? 'border-white dark:border-black'
                                              : 'border-black/30 dark:border-white/30'
                                          }`}
                                        >
                                          {active && <Check className="h-2.5 w-2.5" />}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <RuleModePanel
                      language={language}
                      targetLabel={t.tabs.antiscroll}
                      config={antiscroll}
                      onChange={(patch) =>
                        setAntiscroll((prev) => ({ ...prev, ...patch }))
                      }
                    />
                  </>
                )}
              </div>
            )}

            {/* BLOCK DIVISION */}
            {activeTab === 'block' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#121212] p-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">{t.enableBlock}</div>
                    <div className="text-xs text-black/55 dark:text-white/55">
                      {t.enableBlockDesc}
                    </div>
                  </div>
                  <HardwareToggle
                    checked={block.enabled}
                    onChange={() =>
                      setBlock((p) => ({ ...p, enabled: !p.enabled }))
                    }
                    ariaLabel={t.enableBlock}
                  />
                </div>

                {block.enabled && (
                  <>
                    <div className="space-y-3">
                      <span className="block text-xs font-medium text-black/60 dark:text-white/60">
                        {t.blockAppsLabel}
                      </span>

                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
                        <input
                          type="text"
                          value={appSearch}
                          onChange={(e) => setAppSearch(e.target.value)}
                          placeholder={t.searchAppsPlaceholder}
                          className="w-full min-h-[44px] rounded-xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#121212] pl-10 pr-4 text-xs text-black dark:text-white placeholder:text-black/35 dark:placeholder:text-white/35 focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {allBlockChoices.map((appName) => {
                          const selected = block.apps.includes(appName);
                          return (
                            <button
                              key={appName}
                              type="button"
                              onClick={() => toggleBlockApp(appName)}
                              className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 transition-colors ${
                                selected
                                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                  : 'bg-white dark:bg-[#121212] border-black/12 dark:border-white/12 text-black/75 dark:text-white/75'
                              }`}
                            >
                              <span className="truncate">{appName}</span>
                              {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customAppName}
                          onChange={(e) => setCustomAppName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomApp();
                            }
                          }}
                          placeholder={t.addCustomAppPlaceholder}
                          className="flex-1 min-h-[44px] rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#121212] px-3.5 text-xs text-black dark:text-white placeholder:text-black/35 dark:placeholder:text-white/35 focus:outline-none focus:border-black dark:focus:border-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomApp}
                          className="min-h-[44px] px-4 rounded-xl border border-black/20 dark:border-white/20 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 whitespace-nowrap"
                        >
                          {t.addCustomAppButton}
                        </button>
                      </div>

                      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-black/20 dark:border-white/20 p-3.5 opacity-75">
                        <Smartphone className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <div className="text-xs font-medium text-black dark:text-white">
                            {t.futureAnyAppTitle}
                          </div>
                          <div className="text-[11px] text-black/55 dark:text-white/55">
                            {t.futureAnyAppDesc}
                          </div>
                        </div>
                      </div>
                    </div>

                    <RuleModePanel
                      language={language}
                      targetLabel={t.tabs.block}
                      config={block}
                      onChange={(patch) =>
                        setBlock((prev) => ({ ...prev, ...patch }))
                      }
                    />
                  </>
                )}
              </div>
            )}

            {/* Shared Plan Protection */}
            <div className="space-y-2.5 pt-3 border-t border-black/8 dark:border-white/8">
              <span className="block text-xs font-medium text-black/60 dark:text-white/60">
                {t.protectionLabel}
              </span>

              <div className="space-y-2">
                {(['normal', 'delay', 'password'] as PlanProtectionMode[]).map(
                  (mode) => {
                    const selected = protection === mode;
                    const copy = t.protectionModes[mode];
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setProtection(mode)}
                        className={`w-full min-h-[54px] flex items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-colors ${
                          selected
                            ? 'border-black dark:border-white bg-black/[0.04] dark:bg-white/[0.06]'
                            : 'border-black/10 dark:border-white/10 bg-white dark:bg-[#121212]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {mode === 'password' && (
                            <Lock className="h-4 w-4 mt-0.5 shrink-0" />
                          )}
                          {mode === 'delay' && (
                            <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <div className="text-xs sm:text-sm font-medium">
                              {copy.title}
                            </div>
                            <div className="text-[11px] text-black/55 dark:text-white/55">
                              {copy.desc}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`h-4 w-4 rounded-sm border flex items-center justify-center shrink-0 ${
                            selected
                              ? 'border-black dark:border-white bg-black dark:bg-white'
                              : 'border-black/30 dark:border-white/30'
                          }`}
                        >
                          {selected && (
                            <Check className="h-3 w-3 text-white dark:text-black" />
                          )}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              {protection === 'password' && (
                <div className="rounded-2xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#121212] p-3.5 space-y-2">
                  <label
                    htmlFor="plan-password-input"
                    className="block text-xs font-medium text-black/70 dark:text-white/70"
                  >
                    {t.passwordInputLabel}
                  </label>
                  <input
                    id="plan-password-input"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full min-h-[44px] rounded-xl border border-black/15 dark:border-white/15 bg-[#FAFAFA] dark:bg-[#0B0B0B] px-3.5 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                  <p className="text-[11px] text-black/55 dark:text-white/55">
                    {t.passwordDefaultHint}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom Footer */}
          <div className="border-t border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-[#0B0B0B] px-5 py-3.5 pb-safe space-y-2.5">
            <div className="text-center text-xs text-black/55 dark:text-white/55">
              {t.divisionSummary(antiCount, blockCount)}
            </div>
            <div className="flex items-center gap-2.5">
              {editingPlan && (
                <button
                  type="button"
                  onClick={() => onDelete(editingPlan.id)}
                  aria-label={t.delete}
                  className="min-h-[48px] min-w-[48px] px-4 flex items-center justify-center rounded-2xl border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98]"
                >
                  <Trash2 className="h-[18px] w-[18px]" />
                </button>
              )}
              <button
                type="submit"
                className="flex-1 min-h-[48px] rounded-2xl bg-black text-white dark:bg-white dark:text-black font-medium text-sm active:scale-[0.98] transition-transform duration-150"
              >
                {editingPlan ? t.save : t.create}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
