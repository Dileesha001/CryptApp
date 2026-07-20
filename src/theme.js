/**
 * theme.js — Premium design system for CryptVault
 *
 * Palette:  Obsidian Dark + Aurora Accents
 * Fonts:    Space Grotesk (headings) · Inter (body) · System mono (keys)
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

// ─── Responsive helpers ──────────────────────────────────────────────────────

const BASE_WIDTH = 390; // iPhone 14 base

export function getScreenDimensions() {
  const { width, height } = Dimensions.get('window');
  return { width, height };
}

/** Scale a size relative to the base 390 pt design width.
 *  Clamped to [0.85, 1.4] so values don't blow up on wide desktop screens. */
export function rs(size) {
  const { width } = Dimensions.get('window');
  const scale = width / BASE_WIDTH;
  const clamped = Math.min(Math.max(scale, 0.85), 1.4);
  return Math.round(PixelRatio.roundToNearestPixel(size * clamped));
}

/** Scale font size, clamped so text never gets too tiny or too huge */
export function rf(size) {
  const { width } = Dimensions.get('window');
  const scale = width / BASE_WIDTH;
  const clamped = Math.min(Math.max(scale, 0.85), 1.35);
  return Math.round(PixelRatio.roundToNearestPixel(size * clamped));
}

/** Returns whether we're on a tablet-sized screen (≥ 768 logical dp) */
export function isTablet() {
  const { width } = Dimensions.get('window');
  return width >= 768;
}

/** Horizontal padding adapts to screen width.
 *  Uses fixed values at tablet/desktop so wide screens don't over-pad. */
export function hPad() {
  const { width } = Dimensions.get('window');
  if (width >= 1024) return 48;   // fixed 48px on desktop
  if (width >= 768)  return 32;   // fixed 32px on tablet
  return rs(20);                  // proportional on mobile
}

/** Max content width for centered desktop layouts */
export function maxContentWidth() {
  const { width } = Dimensions.get('window');
  if (width >= 1280) return 900;
  if (width >= 1024) return 720;
  return width;  // full width on smaller screens
}

// ─── Color Palette ───────────────────────────────────────────────────────────

export const colors = {
  // ── Backgrounds (true dark, obsidian family)
  bg0:          '#03040D',   // deepest background
  bg1:          '#07091A',   // screen background
  bg2:          '#0C1026',   // elevated card
  bg3:          '#111627',   // selected / pressed state

  // ── Glass / surfaces
  glass:        'rgba(255,255,255,0.045)',
  glassMd:      'rgba(255,255,255,0.075)',
  glassBorder:  'rgba(255,255,255,0.10)',
  glassActive:  'rgba(255,255,255,0.12)',

  // ── Primary – Indigo / Violet aurora
  primary:      '#818CF8',   // soft indigo
  primaryDark:  '#4F46E5',   // rich indigo
  primaryDeep:  '#3730A3',   // deep indigo
  primaryDim:   'rgba(129,140,248,0.15)',
  primaryBorder:'rgba(129,140,248,0.35)',

  // ── Violet accent
  violet:       '#A78BFA',
  violetDark:   '#7C3AED',
  violetDim:    'rgba(167,139,250,0.15)',

  // ── Rose accent
  rose:         '#FB7185',
  roseDark:     '#E11D48',
  roseDim:      'rgba(251,113,133,0.15)',

  // ── Cyan accent
  cyan:         '#67E8F9',
  cyanDark:     '#0891B2',
  cyanDim:      'rgba(103,232,249,0.12)',

  // ── Emerald (success)
  emerald:      '#34D399',
  emeraldDark:  '#059669',
  emeraldDim:   'rgba(52,211,153,0.15)',

  // ── Amber (warning)
  amber:        '#FCD34D',
  amberDark:    '#D97706',
  amberDim:     'rgba(252,211,77,0.15)',

  // ── Red (error)
  red:          '#F87171',
  redDark:      '#DC2626',
  redDim:       'rgba(248,113,113,0.15)',

  // ── Text hierarchy
  text:         '#F1F5F9',
  textSub:      '#94A3B8',
  textMuted:    '#475569',
  textFaint:    '#1E293B',
  white:        '#FFFFFF',
  black:        '#000000',

  // ── Borders
  border:       'rgba(255,255,255,0.07)',
  borderMd:     'rgba(255,255,255,0.12)',
  borderBright: 'rgba(255,255,255,0.22)',
};

// ─── Gradients ───────────────────────────────────────────────────────────────

export const gradients = {
  // Hero aurora sweep
  hero:        ['#4338CA', '#6D28D9', '#BE185D'],
  heroDark:    ['#1E1B4B', '#2E1065', '#4C0519'],

  // Card gradients
  genKey:      ['#4F46E5', '#7C3AED'],
  encrypt:     ['#0E7490', '#0284C7'],
  decrypt:     ['#065F46', '#047857'],
  danger:      ['#9F1239', '#E11D48'],

  // Subtle fills
  subtlePurple:['rgba(79,70,229,0.18)', 'rgba(124,58,237,0.08)'],
  subtleCyan:  ['rgba(14,116,144,0.18)', 'rgba(2,132,199,0.08)'],
  subtleGreen: ['rgba(6,95,70,0.18)',   'rgba(4,120,87,0.08)'],

  // Button fills
  btnPrimary:  ['#4F46E5', '#6D28D9'],
  btnCyan:     ['#0E7490', '#0369A1'],
  btnGreen:    ['#047857', '#065F46'],
};

// ─── Typography ──────────────────────────────────────────────────────────────

export const fonts = {
  heading:     'SpaceGrotesk_700Bold',
  headingSemi: 'SpaceGrotesk_600SemiBold',
  headingMed:  'SpaceGrotesk_500Medium',
  body:        'Inter_400Regular',
  bodyMed:     'Inter_500Medium',
  bodySemi:    'Inter_600SemiBold',
  bodyBold:    'Inter_700Bold',
  mono:        Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};


export const fontSize = {
  xs:   rf(11),
  sm:   rf(13),
  base: rf(15),
  md:   rf(17),
  lg:   rf(20),
  xl:   rf(24),
  xxl:  rf(30),
  hero: rf(38),
};

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
  xxs: rs(4),
  xs:  rs(8),
  sm:  rs(12),
  md:  rs(16),
  lg:  rs(24),
  xl:  rs(32),
  xxl: rs(48),
};

// ─── Border radius ───────────────────────────────────────────────────────────

export const radius = {
  xs:   rs(6),
  sm:   rs(10),
  md:   rs(14),
  lg:   rs(18),
  xl:   rs(24),
  xxl:  rs(32),
  full: 999,
};

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  indigo: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 16,
  },
  cyan: {
    shadowColor: '#0E7490',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 16,
  },
  green: {
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 16,
  },
};
