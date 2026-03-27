export const APP_CONFIG = {
  MIN_YEAR: 1000,
  MAX_YEAR: 2026,
  DEFAULT_LIMIT_PER_LANG: 5,
  INITIAL_MAP_WORD_COUNT: 35,
};

export const MAP_CONFIG = {
  DEFAULT_CENTER: [39.9334, 32.8597] as [number, number],
  DEFAULT_ZOOM: 4,
  MIN_ZOOM: 3,
  MAX_ZOOM: 8,
  BOUNDS: [
    [-40, -80], 
    [75, 170], 
  ] as [[number, number], [number, number]],
  TILES: {
    LIGHT: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    DARK: (token: string) => `https://{s}.tile.jawg.io/cff409a6-f8fe-4c7b-a746-46097db4ee20/{z}/{x}/{y}{r}.png?access-token=${token}`
  }
};

export const PERIOD_COLORS = {
  OSMANLI_ONCESI: { bg: '#D97706', border: '#B45309' },
  OSMANLI: { bg: '#166534', border: '#14532D' },
  CUMHURIYET: { bg: '#B91C1C', border: '#991B1B' },
  DEFAULT: 'var(--detailspanel-header-bg)'
};

export const PERIOD_NAMES = {
  OSMANLI_ONCESI: 'O. Öncesi',
  OSMANLI: 'Osmanlı',
  CUMHURIYET: 'Cumhuriyet'
};

export const PERIOD_ALIASES: Record<string, string> = {
  'Osmanlı Öncesi': PERIOD_NAMES.OSMANLI_ONCESI,
  [PERIOD_NAMES.OSMANLI_ONCESI]: PERIOD_NAMES.OSMANLI_ONCESI,
  [PERIOD_NAMES.OSMANLI]: PERIOD_NAMES.OSMANLI,
  [PERIOD_NAMES.CUMHURIYET]: PERIOD_NAMES.CUMHURIYET,
};

export const normalizePeriodLabel = (value: string): string => {
  const raw = String(value || '').trim();
  return PERIOD_ALIASES[raw] || raw;
};