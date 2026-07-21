// DesktopLayout.js – Sidebar + content layout for desktop (≥1024px). Mobile: passthrough.
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, radius } from '../theme';
import useTheme from '../hooks/useTheme';

const NAV = [
  {
    screen:    'Home',
    icon:      '🏠',
    label:     'Home',
    desc:      'Overview & actions',
    accent:    '#818CF8',
    accentBg:  'rgba(129,140,248,0.14)',
  },
  {
    screen:    'GenKey',
    icon:      '🗝️',
    label:     'Generate Key',
    desc:      '256-bit Fernet key',
    accent:    '#818CF8',
    accentBg:  'rgba(79,70,229,0.14)',
  },
  {
    screen:    'Encrypt',
    icon:      '🔒',
    label:     'Encrypt File',
    desc:      'AES-128-CBC',
    accent:    '#67E8F9',
    accentBg:  'rgba(14,116,144,0.14)',
  },
  {
    screen:    'Decrypt',
    icon:      '🔓',
    label:     'Decrypt File',
    desc:      'HMAC-verified',
    accent:    '#34D399',
    accentBg:  'rgba(6,95,70,0.14)',
  },
];

export default function DesktopLayout({ children, currentScreen }) {
  const { isDesktop, sidebarWidth } = useTheme();
  const navigation = useNavigation();

  // Mobile / tablet → transparent passthrough
  if (!isDesktop) return <>{children}</>;

  return (
    <View style={styles.root}>

      {/* ─── Sidebar ───────────────────────────────────────── */}
      <View style={[styles.sidebar, { width: sidebarWidth }]}>

        {/* Brand */}
        <View style={styles.brand}>
          <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.brandGrad}>
            <Text style={styles.brandEmoji}>🛡️</Text>
          </LinearGradient>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.brandName} numberOfLines={1}>CryptVault</Text>
            <Text style={styles.brandSub} numberOfLines={1}>Military-grade encryption</Text>
          </View>
        </View>

        <View style={styles.hr} />

        {/* Nav section */}
        <Text style={styles.navSectionLabel}>NAVIGATION</Text>

        <View style={styles.navList}>
          {NAV.map(item => {
            const active = currentScreen === item.screen;
            return (
              <Pressable
                key={item.screen}
                onPress={() => navigation.navigate(item.screen)}
                style={({ pressed }) => [
                  styles.navItem,
                  active  && [styles.navItemActive, { backgroundColor: item.accentBg }],
                  pressed && !active && styles.navItemPressed,
                ]}
              >
                {active && (
                  <View style={[styles.accentBar, { backgroundColor: item.accent }]} />
                )}
                <View style={[
                  styles.navIconBox,
                  { backgroundColor: active ? item.accentBg : 'rgba(255,255,255,0.05)' },
                ]}>
                  <Text style={styles.navIcon}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={[
                      styles.navItemLabel,
                      active && { color: colors.text, fontFamily: fonts.bodySemi },
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.navItemDesc} numberOfLines={1}>{item.desc}</Text>
                </View>
                {active && (
                  <Text style={[styles.navArrow, { color: item.accent }]}>›</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Push footer to bottom */}
        <View style={{ flex: 1 }} />
        <View style={styles.hr} />

        {/* Security spec footer */}
        <View style={styles.sidebarFooter}>
          <View style={styles.footerBadges}>
            {['PBKDF2 · 600K', 'HMAC-SHA256', 'Zero-knowledge'].map(t => (
              <View key={t} style={styles.footerBadge}>
                <Text style={styles.footerBadgeText} numberOfLines={1}>{t}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.footerNote} numberOfLines={2}>✓ Compatible with file_crypt.py</Text>
        </View>
      </View>

      {/* ─── Main content area ─────────────────────────────── */}
      <View style={styles.content}>
        {children}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.bg0,
  },

  /* ── Sidebar ── */
  sidebar: {
    // width applied inline (reactive)
    flexShrink: 0,
    backgroundColor: colors.bg2,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
  },
  brandGrad: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandEmoji: { fontSize: 18 },
  brandName: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.white,
    letterSpacing: -0.2,
  },
  brandSub: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  hr: { height: 1, backgroundColor: colors.border },

  navSectionLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 1.6,
    paddingHorizontal: 18,
    marginTop: 14,
    marginBottom: 6,
  },
  navList: { paddingHorizontal: 8, gap: 2 },

  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  navItemActive:  { /* bg applied inline */ },
  navItemPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },

  accentBar: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  navIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  navIcon: { fontSize: 14 },
  navItemLabel: {
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    color: colors.textSub,
  },
  navItemDesc: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  navArrow: {
    fontSize: 16,
    lineHeight: 18,
    flexShrink: 0,
  },

  /* ── Sidebar footer ── */
  sidebarFooter: {
    padding: 14,
    gap: 6,
  },
  footerBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  footerBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerBadgeText: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.textMuted,
  },
  footerNote: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
  },

  /* ── Content area ── */
  content: {
    flex: 1,
    overflow: 'hidden',
    minWidth: 0,
  },
});
