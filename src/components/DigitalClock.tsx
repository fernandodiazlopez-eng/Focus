import React from 'react';

/**
 * Classic 7-segment LCD digital clock glyph renderer.
 * Supports digits 0-9, ':', '-', '/', and space.
 * Letters like 'h', 'm', 'd' render as crisp digital-clock segments or compact suffix glyphs.
 */
const SEGMENT_MAP: Record<string, boolean[]> = {
  // [top, topRight, bottomRight, bottom, bottomLeft, topLeft, middle]
  '0': [true, true, true, true, true, true, false],
  '1': [false, true, true, false, false, false, false],
  '2': [true, true, false, true, true, false, true],
  '3': [true, true, true, true, false, false, true],
  '4': [false, true, true, false, false, true, true],
  '5': [true, false, true, true, false, true, true],
  '6': [true, false, true, true, true, true, true],
  '7': [true, true, true, false, false, false, false],
  '8': [true, true, true, true, true, true, true],
  '9': [true, true, true, true, false, true, true],
  '-': [false, false, false, false, false, false, true],
  ' ': [false, false, false, false, false, false, false],
  'h': [false, false, true, false, true, true, true],
  'H': [false, true, true, false, true, true, true],
  'd': [false, true, true, true, true, false, true],
  'm': [true, true, true, false, true, true, false],
};

function SevenSegmentChar({
  char,
  height,
  showGhost = true,
}: {
  char: string;
  height: number;
  showGhost?: boolean;
}) {
  if (char === ':') {
    const w = height * 0.28;
    return (
      <svg
        width={w}
        height={height}
        viewBox="0 0 10 36"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="3" y="10" width="4" height="4" className="fill-current" />
        <rect x="3" y="22" width="4" height="4" className="fill-current" />
      </svg>
    );
  }

  if (char === '/') {
    const w = height * 0.42;
    return (
      <svg
        width={w}
        height={height}
        viewBox="0 0 14 36"
        aria-hidden="true"
        className="shrink-0"
      >
        <polygon points="10,4 13,4 4,32 1,32" className="fill-current opacity-40" />
      </svg>
    );
  }

  if (char === '.') {
    const w = height * 0.22;
    return (
      <svg
        width={w}
        height={height}
        viewBox="0 0 8 36"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="2" y="29" width="4" height="4" className="fill-current" />
      </svg>
    );
  }

  const segs = SEGMENT_MAP[char] ?? SEGMENT_MAP[' '];
  const w = height * 0.56;

  // 7-segment polygons in 20x36 coordinate box
  const polygons = [
    '3,2 17,2 14.5,5 5.5,5', // 0: top
    '17.5,3 17.5,16.5 14.5,14.5 14.5,5.5', // 1: topRight
    '17.5,19.5 17.5,33 14.5,30.5 14.5,21.5', // 2: bottomRight
    '3,34 17,34 14.5,31 5.5,31', // 3: bottom
    '2.5,19.5 5.5,21.5 5.5,30.5 2.5,33', // 4: bottomLeft
    '2.5,3 5.5,5.5 5.5,14.5 2.5,16.5', // 5: topLeft
    '3.5,18 5.5,16 14.5,16 16.5,18 14.5,20 5.5,20', // 6: middle
  ];

  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 20 36"
      aria-hidden="true"
      className="shrink-0"
    >
      {polygons.map((points, idx) => {
        const active = segs[idx];
        if (!active && !showGhost) return null;
        return (
          <polygon
            key={idx}
            points={points}
            className={
              active
                ? 'fill-current'
                : 'fill-current opacity-[0.07]'
            }
          />
        );
      })}
    </svg>
  );
}

interface DigitalClockProps {
  value: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showGhost?: boolean;
  className?: string;
}

const HEIGHT_MAP = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
  xl: 42,
};

export function DigitalClock({
  value,
  size = 'md',
  showGhost = true,
  className = '',
}: DigitalClockProps) {
  const height = HEIGHT_MAP[size];

  return (
    <span
      className={`inline-flex items-center gap-[2px] select-none ${className}`}
      aria-label={value}
    >
      {Array.from(value).map((ch, idx) => (
        <SevenSegmentChar
          key={`${idx}-${ch}`}
          char={ch}
          height={height}
          showGhost={showGhost}
        />
      ))}
    </span>
  );
}
