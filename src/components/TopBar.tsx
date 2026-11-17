import React from 'react';
import { Settings } from 'lucide-react';

interface TopBarProps {
  brand: string;
  onOpenSettings: () => void;
  settingsAriaLabel: string;
}

export function TopBar({ brand, onOpenSettings, settingsAriaLabel }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 w-full pt-safe bg-[#FAFAFA]/92 dark:bg-[#050505]/92 backdrop-blur-md border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex h-[54px] max-w-3xl items-center justify-between px-4 sm:px-6">
        <span className="font-brand text-[23px] font-bold leading-none tracking-[0.14em] lowercase text-black dark:text-white whitespace-nowrap shrink-0 select-none">
          {brand}
        </span>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label={settingsAriaLabel}
          title={settingsAriaLabel}
          className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center border border-transparent hover:border-black/12 dark:hover:border-white/15 text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white active:scale-95 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-black dark:focus-visible:outline-white"
        >
          <Settings className="h-[19px] w-[19px]" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
