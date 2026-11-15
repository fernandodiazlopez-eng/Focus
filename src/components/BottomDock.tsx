import React from 'react';
import { Shield, BarChart2 } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomDockProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  plansLabel: string;
  statsLabel: string;
}

export function BottomDock({
  activeTab,
  onChangeTab,
  plansLabel,
  statsLabel,
}: BottomDockProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/12 dark:border-white/12 bg-[#FAFAFA]/92 dark:bg-[#050505]/92 backdrop-blur-md pb-safe"
    >
      <div className="mx-auto grid h-[58px] max-w-4xl grid-cols-2 items-center gap-2 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => onChangeTab('plans')}
          className={`min-h-[46px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors duration-150 active:scale-[0.97] focus-visible:outline-none ${
            activeTab === 'plans'
              ? 'text-black dark:text-white bg-black/[0.06] dark:bg-white/[0.08]'
              : 'text-black/40 hover:text-black/75 dark:text-white/40 dark:hover:text-white/75'
          }`}
        >
          <Shield className="h-[20px] w-[20px]" strokeWidth={activeTab === 'plans' ? 2.2 : 1.6} />
          <span className="text-[11px] font-medium tracking-tight whitespace-nowrap shrink-0">
            {plansLabel}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('stats')}
          className={`min-h-[46px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors duration-150 active:scale-[0.97] focus-visible:outline-none ${
            activeTab === 'stats'
              ? 'text-black dark:text-white bg-black/[0.06] dark:bg-white/[0.08]'
              : 'text-black/40 hover:text-black/75 dark:text-white/40 dark:hover:text-white/75'
          }`}
        >
          <BarChart2 className="h-[20px] w-[20px]" strokeWidth={activeTab === 'stats' ? 2.2 : 1.6} />
          <span className="text-[11px] font-medium tracking-tight whitespace-nowrap shrink-0">
            {statsLabel}
          </span>
        </button>
      </div>
    </nav>
  );
}
