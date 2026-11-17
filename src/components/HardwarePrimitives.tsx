import React from 'react';

interface CornerReticlesProps {
  active?: boolean;
}

/**
 * Centered 90-degree rectangular corner brackets calibrated to sit flush on
 * rectangular (rounded-none) bordered cards. Wrapped in a single inset-0 layer
 * with !m-0 so parent flex/space-y utilities never offset any corner.
 */
export function CornerReticles({ active = false }: CornerReticlesProps) {
  const tone = active
    ? 'border-black/70 dark:border-white/70'
    : 'border-black/28 dark:border-white/28';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 !m-0"
    >
      <span
        className={`absolute -top-[1px] -left-[1px] h-3 w-3 border-t-[1.5px] border-l-[1.5px] transition-colors duration-150 ${tone}`}
      />
      <span
        className={`absolute -top-[1px] -right-[1px] h-3 w-3 border-t-[1.5px] border-r-[1.5px] transition-colors duration-150 ${tone}`}
      />
      <span
        className={`absolute -bottom-[1px] -right-[1px] h-3 w-3 border-b-[1.5px] border-r-[1.5px] transition-colors duration-150 ${tone}`}
      />
      <span
        className={`absolute -bottom-[1px] -left-[1px] h-3 w-3 border-b-[1.5px] border-l-[1.5px] transition-colors duration-150 ${tone}`}
      />
    </div>
  );
}
