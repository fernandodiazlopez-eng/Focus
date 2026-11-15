import React from 'react';

export function CornerReticles({ active = false }: { active?: boolean }) {
  const tone = active
    ? 'border-black/55 dark:border-white/55'
    : 'border-black/20 dark:border-white/20';

  return (
    <>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 left-0 h-2 w-2 border-t border-l transition-colors duration-150 ${tone}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 right-0 h-2 w-2 border-t border-r transition-colors duration-150 ${tone}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l transition-colors duration-150 ${tone}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r transition-colors duration-150 ${tone}`}
      />
    </>
  );
}

interface HardwareToggleProps {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}

export function HardwareToggle({ checked, onChange, ariaLabel }: HardwareToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className="min-h-[44px] min-w-[60px] flex items-center justify-end focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white rounded-xl"
    >
      <span
        className={`relative inline-flex h-7 w-13 items-center rounded-lg border transition-colors duration-150 ${
          checked
            ? 'bg-black border-black dark:bg-white dark:border-white'
            : 'bg-black/[0.06] border-black/20 dark:bg-white/[0.08] dark:border-white/20'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-[5px] transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            checked
              ? 'translate-x-[26px] bg-white dark:bg-black'
              : 'translate-x-[3px] bg-black/70 dark:bg-white/70'
          }`}
        />
      </span>
    </button>
  );
}
