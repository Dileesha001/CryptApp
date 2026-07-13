// theme.js – Design tokens for the CryptApp

export const colors = {
  // Backgrounds
  bg:           '#080C18',   // deep space
  bgCard:       '#0F1629',   // card bg
  bgSurface:    '#141B30',   // elevated surface

  // Glass overlays
  glass:        'rgba(255,255,255,0.05)',
  glassBorder:  'rgba(255,255,255,0.10)',
  glassDark:    'rgba(0,0,0,0.30)',

  // Accent – purple
  purple:       '#7C3AED',
  purpleLight:  '#9F67FF',
  purpleDim:    'rgba(124,58,237,0.20)',

  // Accent – cyan
  cyan:         '#06B6D4',
  cyanLight:    '#38BDF8',
  cyanDim:      'rgba(6,182,212,0.20)',

  // Status
  success:      '#10B981',
  successDim:   'rgba(16,185,129,0.20)',
  error:        '#EF4444',
  errorDim:     'rgba(239,68,68,0.20)',
  warning:      '#F59E0B',
  warningDim:   'rgba(245,158,11,0.20)',

  // Text
  text:         '#F1F5F9',
  textSecond:   '#94A3B8',
  textMuted:    '#475569',
  textDark:     '#1E293B',

  // Borders
  border:       'rgba(255,255,255,0.08)',
  borderBright: 'rgba(255,255,255,0.18)',

  // White / Black
  white:        '#FFFFFF',
  black:        '#000000',
};

export const gradients = {
  hero:        ['#7C3AED', '#06B6D4'],
  genKey:      ['#7C3AED', '#9F67FF'],
  encrypt:     ['#0EA5E9', '#06B6D4'],
  decrypt:     ['#10B981', '#059669'],
  danger:      ['#EF4444', '#DC2626'],
  subtle:      ['rgba(124,58,237,0.15)', 'rgba(6,182,212,0.10)'],
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const radius = {
  sm:   8,
  md:   14,
  lg:   20,
  xl:   28,
  full: 999,
};

export const fontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  32,
  hero: 42,
};

export const fontWeight = {
  normal:    '400',
  medium:    '500',
  semibold:  '600',
  bold:      '700',
  extrabold: '800',
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  purple: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  cyan: {
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
};
