import React from 'react';
import { Clock, BarChart2 } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomDockProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  todayLabel: string;
  statsLabel: string;
}

export function BottomDock({
  activeTab,
  onChangeTab,
  todayLabel,
  statsLabel,
}: BottomDockProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/12 dark:border-white/12 bg-[#FAFAFA]/92 dark:bg-[#050505]/92 backdrop-blur-md pb-safe"
    >
      <div className="mx-auto grid h-[60px] max-w-3xl grid-cols-2 items-center gap-2 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => onChangeTab('today')}
          className={`min-h-[46px] flex flex-col items-center justify-center gap-1 border transition-all duration-150 active:scale-[0.97] focus-visible:outline-none ${
            activeTab === 'today'
              ? 'text-black dark:text-white bg-black/[0.06] dark:bg-white/[0.08] border-black/12 dark:border-white/15'
              : 'text-black/42 hover:text-black/75 dark:text-white/42 dark:hover:text-white/75 border-transparent'
          }`}
        >
          <Clock
            className="h-[19px] w-[19px]"
            strokeWidth={activeTab === 'today' ? 2.15 : 1.6}
          />
          <span className="text-[11px] font-medium tracking-tight whitespace-nowrap shrink-0">
            {todayLabel}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('stats')}
          className={`min-h-[46px] flex flex-col items-center justify-center gap-1 border transition-all duration-150 active:scale-[0.97] focus-visible:outline-none ${
            activeTab === 'stats'
              ? 'text-black dark:text-white bg-black/[0.06] dark:bg-white/[0.08] border-black/12 dark:border-white/15'
              : 'text-black/42 hover:text-black/75 dark:text-white/42 dark:hover:text-white/75 border-transparent'
          }`}
        >
          <BarChart2
            className="h-[19px] w-[19px]"
            strokeWidth={activeTab === 'stats' ? 2.15 : 1.6}
          />
          <span className="text-[11px] font-medium tracking-tight whitespace-nowrap shrink-0">
            {statsLabel}
          </span>
        </button>
      </div>
    </nav>
  );
}
