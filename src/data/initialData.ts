import {
  AppCatalogEntry,
  AppElementOption,
  FocusPlan,
  StatsDataset,
  StatsPeriod,
  WeekdayKey,
} from '../types';

export const APP_CATALOG: AppCatalogEntry[] = [
  { name: 'Instagram', androidPackage: 'com.instagram.android', supportsAntiScroll: true },
  { name: 'TikTok', androidPackage: 'com.zhiliaoapp.musically', supportsAntiScroll: true },
  { name: 'YouTube', androidPackage: 'com.google.android.youtube', supportsAntiScroll: true },
  { name: 'X', androidPackage: 'com.twitter.android', supportsAntiScroll: true },
  { name: 'Reddit', androidPackage: 'com.reddit.frontpage', supportsAntiScroll: true },
  { name: 'Facebook', androidPackage: 'com.facebook.katana', supportsAntiScroll: true },
  { name: 'Threads', androidPackage: 'com.instagram.barcelona', supportsAntiScroll: true },
  { name: 'WhatsApp', androidPackage: 'com.whatsapp', supportsAntiScroll: false },
  { name: 'Chrome', androidPackage: 'com.android.chrome', supportsAntiScroll: false },
  { name: 'Netflix', androidPackage: 'com.netflix.mediaclient', supportsAntiScroll: false },
  { name: 'Twitch', androidPackage: 'tv.twitch.android.app', supportsAntiScroll: false },
];

export const SOCIAL_APPS = APP_CATALOG.filter((a) => a.supportsAntiScroll).map(
  (a) => a.name
);

export const GENERAL_BLOCK_APPS = APP_CATALOG.map((a) => a.name);

export const WEEKDAYS_ORDER: WeekdayKey[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];

export const DURATION_PRESETS = ['2h', '1d', '3d', '7d', '14d', '30d'];

export const APP_ELEMENTS_CATALOG: Record<string, AppElementOption[]> = {
  Instagram: [
    { id: 'ig_lupa', labelEs: 'Lupa (Explorar)', labelEn: 'Explore (Search)' },
    { id: 'ig_reels_tab', labelEs: 'Reels (Pestaña)', labelEn: 'Reels tab' },
    { id: 'ig_home_reels', labelEs: 'Reels en Home Feed', labelEn: 'Reels in Home Feed' },
    { id: 'ig_feed_scroll', labelEs: 'Escroleo del Home Feed', labelEn: 'Home Feed scroll' },
  ],
  TikTok: [
    { id: 'tt_para_ti', labelEs: 'Para ti', labelEn: 'For You' },
    { id: 'tt_escroleo', labelEs: 'Escroleo de vídeos', labelEn: 'Video scrolling' },
    { id: 'tt_siguiendo', labelEs: 'Feed Siguiendo', labelEn: 'Following feed' },
    { id: 'tt_buscar', labelEs: 'Búsqueda y tendencias', labelEn: 'Search & Discover' },
  ],
  YouTube: [
    { id: 'yt_shorts_tab', labelEs: 'Pestaña Shorts', labelEn: 'Shorts tab' },
    { id: 'yt_home_shorts', labelEs: 'Shorts en Inicio', labelEn: 'Shorts on Home' },
    { id: 'yt_recs_scroll', labelEs: 'Scroll de recomendados', labelEn: 'Recommended scroll' },
  ],
  X: [
    { id: 'x_para_ti', labelEs: 'Pestaña Para ti', labelEn: 'For You timeline' },
    { id: 'x_scroll', labelEs: 'Escroleo infinito', labelEn: 'Infinite scroll' },
    { id: 'x_explorar', labelEs: 'Explorar', labelEn: 'Explore' },
  ],
  Reddit: [
    { id: 'rd_popular', labelEs: 'Feed Popular', labelEn: 'Popular feed' },
    { id: 'rd_home_scroll', labelEs: 'Escroleo en Inicio', labelEn: 'Home scroll' },
    { id: 'rd_watch', labelEs: 'Vídeos cortos', labelEn: 'Short videos' },
  ],
  Facebook: [
    { id: 'fb_reels', labelEs: 'Reels', labelEn: 'Reels' },
    { id: 'fb_feed_scroll', labelEs: 'Escroleo del Feed', labelEn: 'Feed scroll' },
  ],
  Threads: [
    { id: 'th_para_ti', labelEs: 'Feed Para ti', labelEn: 'For You feed' },
    { id: 'th_scroll', labelEs: 'Escroleo infinito', labelEn: 'Infinite scroll' },
  ],
};

// Zero sample/mock plans by default
export const INITIAL_PLANS: FocusPlan[] = [];

// All stats initialized strictly to zero
export const ZERO_STATS_BY_PERIOD: Record<StatsPeriod, StatsDataset> = {
  today: {
    totalMinutesUsed: 0,
    series: [
      { label: '08:00', minutesUsed: 0 },
      { label: '10:00', minutesUsed: 0 },
      { label: '12:00', minutesUsed: 0 },
      { label: '14:00', minutesUsed: 0 },
      { label: '16:00', minutesUsed: 0 },
      { label: '18:00', minutesUsed: 0 },
      { label: '20:00', minutesUsed: 0 },
    ],
    apps: [],
  },
  '7d': {
    totalMinutesUsed: 0,
    series: [
      { label: 'LUN', minutesUsed: 0 },
      { label: 'MAR', minutesUsed: 0 },
      { label: 'MIE', minutesUsed: 0 },
      { label: 'JUE', minutesUsed: 0 },
      { label: 'VIE', minutesUsed: 0 },
      { label: 'SAB', minutesUsed: 0 },
      { label: 'DOM', minutesUsed: 0 },
    ],
    apps: [],
  },
  '30d': {
    totalMinutesUsed: 0,
    series: [
      { label: 'SEM 1', minutesUsed: 0 },
      { label: 'SEM 2', minutesUsed: 0 },
      { label: 'SEM 3', minutesUsed: 0 },
      { label: 'SEM 4', minutesUsed: 0 },
    ],
    apps: [],
  },
};

export function formatDigitalDuration(totalMinutes: number): string {
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}
