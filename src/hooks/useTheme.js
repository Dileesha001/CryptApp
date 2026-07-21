/**
 * useTheme.js — Reactive responsive helpers via useWindowDimensions.
 *
 * All size helpers (rs, rf, hPad, fontSize, spacing, radius) re-compute on
 * every window resize, ensuring the UI stays correct when the browser window
 * is maximised / restored / resized.
 */
import { useMemo } from 'react';
import { PixelRatio, Platform, useWindowDimensions } from 'react-native';
import { colors, fonts, gradients, shadows } from '../theme';

const BASE_WIDTH = 390; // iPhone 14 base

export default function useTheme() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    // ── Scale helpers ────────────────────────────────────────────────────────
    const scale    = width / BASE_WIDTH;
    const rsScale  = Math.min(Math.max(scale, 0.85), 1.4);
    const rfScale  = Math.min(Math.max(scale, 0.85), 1.35);

    const rs = (size) =>
      Math.round(PixelRatio.roundToNearestPixel(size * rsScale));

    const rf = (size) =>
      Math.round(PixelRatio.roundToNearestPixel(size * rfScale));

    // ── Breakpoints ──────────────────────────────────────────────────────────
    const isTablet  = width >= 768;
    const isDesktop = width >= 1024;

    // ── Horizontal padding ───────────────────────────────────────────────────
    const hPad = isDesktop ? 48 : isTablet ? 32 : rs(20);

    // ── Sidebar width — collapses proportionally on smaller desktop windows ──
    const sidebarWidth = isDesktop
      ? Math.max(200, Math.min(260, Math.round(width * 0.2)))
      : 0;

    // ── Hero panel (HomeScreen left panel) ───────────────────────────────────
    // Keep it between 30%–38% of the content area (excluding sidebar)
    const contentWidth   = width - sidebarWidth;
    const heroPanelWidth = isDesktop
      ? Math.max(280, Math.min(420, Math.round(contentWidth * 0.38)))
      : 0;

    // ── Max body width for centered forms ────────────────────────────────────
    const bodyMaxWidth = isDesktop ? 720 : isTablet ? 640 : contentWidth;

    // ── Font sizes ───────────────────────────────────────────────────────────
    const fontSize = {
      xs:   rf(11),
      sm:   rf(13),
      base: rf(15),
      md:   rf(17),
      lg:   rf(20),
      xl:   rf(24),
      xxl:  rf(30),
      hero: rf(38),
    };

    // ── Spacing ──────────────────────────────────────────────────────────────
    const spacing = {
      xxs: rs(4),
      xs:  rs(8),
      sm:  rs(12),
      md:  rs(16),
      lg:  rs(24),
      xl:  rs(32),
      xxl: rs(48),
    };

    // ── Border radius ────────────────────────────────────────────────────────
    const radius = {
      xs:   rs(6),
      sm:   rs(10),
      md:   rs(14),
      lg:   rs(18),
      xl:   rs(24),
      xxl:  rs(32),
      full: 999,
    };

    return {
      // dimensions
      width,
      height,
      isTablet,
      isDesktop,
      // helpers
      rs,
      rf,
      hPad,
      sidebarWidth,
      heroPanelWidth,
      contentWidth,
      bodyMaxWidth,
      // design tokens
      colors,
      fonts,
      gradients,
      shadows,
      fontSize,
      spacing,
      radius,
    };
  }, [width, height]);
}
