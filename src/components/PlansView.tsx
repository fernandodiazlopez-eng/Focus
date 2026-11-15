import React from 'react';
import { Plus, ChevronRight, Lock, Clock } from 'lucide-react';
import { FocusPlan, Language, RuleScheduleConfig } from '../types';
import { TRANSLATIONS } from '../i18n';
import { formatDigitalDuration } from '../data/initialData';
import { CornerReticles, HardwareToggle } from './HardwarePrimitives';
import { DigitalClock } from './DigitalClock';

interface PlansViewProps {
  language: Language;
  plans: FocusPlan[];
  onTogglePlan: (id: string) => void;
  onEditPlan: (plan: FocusPlan) => void;
  onCreatePlan: () => void;
}

function summarizeRuleMode(
  cfg: RuleScheduleConfig,
  language: Language
): string {
  const te = TRANSLATIONS[language].editor;
  const tw = TRANSLATIONS[language].weekdays;
  const td = TRANSLATIONS[language].durations;

  switch (cfg.mode) {
    case 'daily_limit':
      return `${formatDigitalDuration(cfg.dailyLimitMinutes)} / ${
        language === 'es' ? 'día' : 'day'
      }`;
    case 'always':
      return te.modes.always.title;
    case 'duration':
      return td[cfg.durationPreset] ?? cfg.durationPreset;
    case 'days':
      return `${cfg.selectedDays.map((d) => tw[d]).join(' ')} · ${cfg.timeRange}`;
  }
}

export function PlansView({
  language,
  plans,
  onTogglePlan,
  onEditPlan,
  onCreatePlan,
}: PlansViewProps) {
  const t = TRANSLATIONS[language].plans;

  const activePlansCount = plans.filter((p) => p.active).length;
  const digitalRatio = `${String(activePlansCount).padStart(2, '0')}/${String(
    plans.length
  ).padStart(2, '0')}`;

  return (
    <section className="space-y-6">
      {/* Header & Create CTA */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black dark:text-white text-balance">
            {t.title}
          </h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            {t.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onCreatePlan}
          className="min-h-[48px] w-full md:w-auto px-5 py-3 flex items-center justify-center gap-2 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-medium text-sm whitespace-nowrap shrink-0 active:scale-[0.98] transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white"
        >
          <Plus className="h-[18px] w-[18px]" strokeWidth={2.2} />
          <span>{t.createButton}</span>
        </button>
      </div>

      {/* Digital Active Counter Strip */}
      <div className="relative flex items-center justify-between gap-4 rounded-2xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#0C0C0C] p-4 sm:p-5">
        <CornerReticles active={activePlansCount > 0} />
        <div className="space-y-1">
          <span className="text-xs font-medium text-black/55 dark:text-white/55">
            {t.activeLabel}
          </span>
          <div className="pt-0.5 text-black dark:text-white">
            <DigitalClock value={digitalRatio} size="lg" />
          </div>
        </div>

        <div className="text-right font-digital text-xs text-black/50 dark:text-white/50">
          {activePlansCount > 0 ? t.statusActive : t.statusPaused}
        </div>
      </div>

      {/* Plans List */}
      {plans.length === 0 ? (
        <div className="relative rounded-2xl border border-dashed border-black/20 dark:border-white/20 p-8 text-center space-y-3">
          <p className="text-base font-medium text-black dark:text-white">
            {t.emptyTitle}
          </p>
          <p className="text-sm text-black/55 dark:text-white/55 max-w-sm mx-auto">
            {t.emptyBody}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {plans.map((plan) => {
            const antiCount = plan.antiscroll.enabled
              ? plan.antiscroll.apps.length
              : 0;
            const blockCount = plan.block.enabled
              ? plan.block.apps.length
              : 0;

            const primarySummary = plan.antiscroll.enabled
              ? summarizeRuleMode(plan.antiscroll, language)
              : plan.block.enabled
              ? summarizeRuleMode(plan.block, language)
              : t.statusPaused;

            return (
              <div
                key={plan.id}
                onClick={() => onEditPlan(plan)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onEditPlan(plan);
                  }
                }}
                className={`group relative flex flex-col justify-between gap-4 rounded-2xl border p-4 sm:p-5 text-left transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-black dark:focus-visible:outline-white ${
                  plan.active
                    ? 'border-black/25 dark:border-white/25 bg-white dark:bg-[#0D0D0D]'
                    : 'border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] opacity-70'
                }`}
              >
                <CornerReticles active={plan.active} />

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-semibold tracking-tight text-black dark:text-white truncate">
                        {plan.name}
                      </h2>
                      {plan.protection === 'password' && (
                        <Lock className="h-3.5 w-3.5 shrink-0 text-black/65 dark:text-white/65" />
                      )}
                      {plan.protection === 'delay' && (
                        <Clock className="h-3.5 w-3.5 shrink-0 text-black/65 dark:text-white/65" />
                      )}
                    </div>
                    <p className="text-xs text-black/55 dark:text-white/55">
                      {t.configuredNotice(antiCount, blockCount)}
                    </p>
                  </div>

                  <HardwareToggle
                    checked={plan.active}
                    onChange={() => onTogglePlan(plan.id)}
                    ariaLabel={`${plan.name} — ${
                      plan.active ? t.statusActive : t.statusPaused
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-black/8 dark:border-white/8 text-xs text-black/65 dark:text-white/65">
                  <span className="truncate font-digital">{primarySummary}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
