// HomeScreen.js – Premium fully-responsive home hub
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionCard from '../components/ActionCard';
import DesktopLayout from '../components/DesktopLayout';
import useTheme from '../hooks/useTheme';

const FEATURES = [
  { icon: '🔐', text: 'AES-128-CBC symmetric encryption' },
  { icon: '🛡️', text: 'HMAC-SHA256 tamper detection' },
  { icon: '🔑', text: 'PBKDF2 key derivation · 600K iterations' },
  { icon: '🔗', text: 'file_crypt.py cross-platform compatible' },
];

export default function HomeScreen({ navigation }) {
  const {
    isTablet, isDesktop,
    hPad, heroPanelWidth,
    colors, fonts, fontSize, gradients, radius, shadows, rs,
  } = useTheme();

  const fadeY = useRef(new Animated.Value(24)).current;
  const fade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(fadeY, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const cards = [
    {
      key:      'genkey',
      title:    'Generate Key',
      subtitle: 'Create a cryptographically secure 256-bit encryption key',
      icon:     '🗝️',
      gradient: gradients.genKey,
      screen:   'GenKey',
    },
    {
      key:      'encrypt',
      title:    'Encrypt File',
      subtitle: 'Lock any file with AES-128-CBC + HMAC-SHA256 authentication',
      icon:     '🔒',
      gradient: gradients.encrypt,
      screen:   'Encrypt',
    },
    {
      key:      'decrypt',
      title:    'Decrypt File',
      subtitle: 'Restore an encrypted file with your key or password',
      icon:     '🔓',
      gradient: gradients.decrypt,
      screen:   'Decrypt',
    },
  ];

  // ── Derived styles (reactive to window size) ─────────────────────────────
  const s = makeStyles({ colors, fonts, fontSize, gradients, radius, shadows, rs, isTablet, isDesktop });

  // ── Info card (reused in both layouts) ──────────────────────────────────────
  const InfoCard = () => (
    <View style={s.infoCard}>
      <LinearGradient
        colors={gradients.subtlePurple}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.infoGradient}
      >
        <Text style={s.infoIcon}>ℹ️</Text>
        <View style={s.infoText}>
          <Text style={s.infoTitle}>Cross-platform compatible</Text>
          <Text style={s.infoSub}>
            Files encrypted here are fully compatible with{' '}
            <Text style={s.infoMono}>file_crypt.py</Text>
            {' '}— encrypt on mobile, decrypt with Python and vice versa.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <DesktopLayout currentScreen="Home">

      {isDesktop ? (
        /* ══════════════════════════════════════════════════════════════════════
           DESKTOP  –  Left: gradient hero panel | Right: scrollable cards
           ══════════════════════════════════════════════════════════════════════ */
        <View style={s.desktopRoot}>

          {/* ── Left hero panel ── */}
          <LinearGradient
            colors={gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={[s.desktopHeroPanel, { width: heroPanelWidth }]}
          >
            {/* Decorative orbs */}
            <View style={s.deskOrb1} />
            <View style={s.deskOrb2} />

            <Animated.View style={[s.desktopHeroInner, { opacity: fade, transform: [{ translateY: fadeY }] }]}>
              {/* App badge */}
              <View style={s.appBadge}>
                <Text style={s.appBadgeIcon}>🛡️</Text>
                <Text style={s.appBadgeLabel}>CryptVault</Text>
              </View>

              <Text style={s.desktopHeroTitle}>
                Secure File{'\n'}Encryption
              </Text>
              <Text style={s.desktopHeroSub}>
                Military-grade protection for your files, powered by AES-128-CBC + HMAC-SHA256 authentication.
              </Text>

              {/* Feature checklist */}
              <View style={s.desktopFeatureList}>
                {FEATURES.map(f => (
                  <View key={f.text} style={s.desktopFeatureItem}>
                    <View style={s.desktopFeatureDot}>
                      <Text style={s.desktopFeatureIcon}>{f.icon}</Text>
                    </View>
                    <Text style={s.desktopFeatureText} numberOfLines={2}>{f.text}</Text>
                  </View>
                ))}
              </View>

              {/* Tech chips */}
              <View style={s.chipRow}>
                {['Fernet Compatible', 'PBKDF2 · 600K', 'Zero-knowledge'].map(t => (
                  <View key={t} style={s.chip}>
                    <Text style={s.chipText}>{t}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </LinearGradient>

          {/* ── Right: action cards ── */}
          <ScrollView
            style={s.desktopCardsPanel}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.desktopCardsPanelContent}
          >
            <Animated.View style={{ opacity: fade, transform: [{ translateY: fadeY }] }}>
              <Text style={s.sectionLabel}>CHOOSE AN ACTION</Text>

              <View style={s.desktopCardsStack}>
                {cards.map(c => (
                  <ActionCard
                    key={c.key}
                    title={c.title}
                    subtitle={c.subtitle}
                    icon={c.icon}
                    gradient={c.gradient}
                    onPress={() => navigation.navigate(c.screen)}
                  />
                ))}
              </View>

              <InfoCard />
              <Text style={s.footer}>CryptVault v1.0 · AES-128-CBC · HMAC-SHA256</Text>
            </Animated.View>
          </ScrollView>
        </View>

      ) : (
        /* ══════════════════════════════════════════════════════════════════════
           MOBILE / TABLET  –  stacked layout
           ══════════════════════════════════════════════════════════════════════ */
        <View style={s.root}>
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero */}
            <LinearGradient
              colors={gradients.hero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.hero}
            >
              <View style={[s.orb, s.orb1]} />
              <View style={[s.orb, s.orb2]} />
              <View style={[s.orb, s.orb3]} />

              <SafeAreaView edges={['top']}>
                <Animated.View
                  style={[
                    s.heroInner,
                    { paddingHorizontal: hPad, opacity: fade, transform: [{ translateY: fadeY }] },
                  ]}
                >
                  <View style={s.appBadge}>
                    <Text style={s.appBadgeIcon}>🛡️</Text>
                    <Text style={s.appBadgeLabel}>CryptVault</Text>
                  </View>

                  <Text style={s.heroTitle}>
                    Secure File{'\n'}Encryption
                  </Text>
                  <Text style={s.heroSub}>
                    Military-grade protection for your files.{'\n'}
                    Powered by AES-128-CBC + HMAC-SHA256.
                  </Text>

                  <View style={s.chipRow}>
                    {['Fernet Compatible', 'PBKDF2 · 600K iterations', 'Zero-knowledge'].map(t => (
                      <View key={t} style={s.chip}>
                        <Text style={s.chipText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              </SafeAreaView>
            </LinearGradient>

            {/* Cards */}
            <Animated.View
              style={[
                s.contentWrap,
                { paddingHorizontal: hPad, opacity: fade, transform: [{ translateY: fadeY }] },
              ]}
            >
              <Text style={s.sectionLabel}>CHOOSE AN ACTION</Text>

              <View style={[s.cardGrid, isTablet && s.cardGridTablet]}>
                {cards.map(c => (
                  <ActionCard
                    key={c.key}
                    title={c.title}
                    subtitle={c.subtitle}
                    icon={c.icon}
                    gradient={c.gradient}
                    onPress={() => navigation.navigate(c.screen)}
                    style={isTablet && s.cardTabletItem}
                  />
                ))}
              </View>

              <InfoCard />
              <Text style={s.footer}>CryptVault v1.0 · AES-128-CBC · HMAC-SHA256</Text>
            </Animated.View>
          </ScrollView>
        </View>
      )}

    </DesktopLayout>
  );
}

// ── Reactive stylesheet factory ───────────────────────────────────────────────
function makeStyles({ colors, fonts, fontSize, gradients, radius, shadows, rs, isTablet, isDesktop }) {
  return {
    /* ── Shared root ── */
    root: { flex: 1, backgroundColor: colors.bg1 },

    /* ══ DESKTOP ══════════════════════════════════════════════════════════════ */

    desktopRoot: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: colors.bg1,
    },

    /* Left hero panel — width applied inline (fluid) */
    desktopHeroPanel: {
      flexShrink: 0,
      overflow: 'hidden',
      position: 'relative',
    },
    deskOrb1: {
      position: 'absolute',
      width: 340,
      height: 340,
      borderRadius: 170,
      backgroundColor: 'rgba(255,255,255,0.07)',
      top: -120,
      right: -100,
    },
    deskOrb2: {
      position: 'absolute',
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: 'rgba(255,255,255,0.05)',
      bottom: -80,
      left: -60,
    },
    desktopHeroInner: {
      flex: 1,
      paddingHorizontal: 36,
      paddingVertical: 48,
      justifyContent: 'center',
    },
    desktopHeroTitle: {
      fontFamily: fonts.heading,
      fontSize: Math.min(fontSize.xxl + 8, 44),
      color: colors.white,
      lineHeight: Math.min(fontSize.xxl + 16, 52),
      letterSpacing: -1.5,
      marginBottom: rs(14),
    },
    desktopHeroSub: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm,
      color: 'rgba(255,255,255,0.82)',
      lineHeight: rs(22),
      marginBottom: rs(28),
    },
    desktopFeatureList: {
      gap: rs(10),
      marginBottom: rs(28),
    },
    desktopFeatureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs(10),
    },
    desktopFeatureDot: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    desktopFeatureIcon: { fontSize: 13 },
    desktopFeatureText: {
      fontFamily: fonts.bodyMed,
      fontSize: fontSize.sm,
      color: 'rgba(255,255,255,0.88)',
      flex: 1,
    },

    /* Right cards panel */
    desktopCardsPanel: {
      flex: 1,
      backgroundColor: colors.bg1,
      borderLeftWidth: 1,
      borderLeftColor: 'rgba(255,255,255,0.06)',
      minWidth: 0,
    },
    desktopCardsPanelContent: {
      padding: rs(36),
      paddingTop: rs(32),
      minHeight: '100%',
    },
    desktopCardsStack: {
      gap: rs(12),
      marginBottom: rs(20),
    },

    /* ══ MOBILE / TABLET ══════════════════════════════════════════════════════ */

    scroll: { flex: 1 },
    scrollContent: { paddingBottom: rs(52) },
    contentWrap: { paddingTop: rs(32) },

    hero: { overflow: 'hidden', paddingBottom: rs(36) },
    orb:  { position: 'absolute', borderRadius: radius.full },
    orb1: { width: rs(320), height: rs(320), backgroundColor: 'rgba(255,255,255,0.07)', top: -rs(100), right: -rs(80) },
    orb2: { width: rs(200), height: rs(200), backgroundColor: 'rgba(255,255,255,0.05)', bottom: -rs(60), left: -rs(50) },
    orb3: { width: rs(140), height: rs(140), backgroundColor: 'rgba(255,255,255,0.04)', top: rs(60), right: rs(200) },

    heroInner: { paddingTop: rs(24), paddingBottom: rs(8) },

    heroTitle: {
      fontFamily: fonts.heading, fontSize: fontSize.hero,
      color: colors.white, lineHeight: rs(46),
      letterSpacing: -1, marginBottom: rs(14),
    },
    heroSub: {
      fontFamily: fonts.body, fontSize: fontSize.base,
      color: 'rgba(255,255,255,0.82)', lineHeight: rs(24),
      marginBottom: rs(20),
    },

    cardGrid:       { gap: rs(14) },
    cardGridTablet: { flexDirection: 'row', flexWrap: 'wrap' },
    cardTabletItem: { width: '47.5%' },

    /* ══ SHARED ELEMENTS ══════════════════════════════════════════════════════ */

    appBadge: {
      flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: radius.full,
      paddingHorizontal: rs(14), paddingVertical: rs(7),
      marginBottom: rs(18), gap: rs(8),
    },
    appBadgeIcon:  { fontSize: rs(16) },
    appBadgeLabel: {
      fontFamily: fonts.bodySemi, fontSize: fontSize.sm,
      color: colors.white, letterSpacing: 0.5,
    },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(6) },
    chip: {
      backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: radius.full,
      paddingHorizontal: rs(10), paddingVertical: rs(4),
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
    },
    chipText: {
      fontFamily: fonts.bodySemi, fontSize: fontSize.xs,
      color: 'rgba(255,255,255,0.92)', letterSpacing: 0.3,
    },

    sectionLabel: {
      fontFamily: fonts.bodySemi, fontSize: fontSize.xs,
      color: colors.textMuted, letterSpacing: 1.8,
      marginBottom: rs(14), textTransform: 'uppercase',
    },

    infoCard: {
      marginTop: rs(20), borderRadius: radius.xl,
      overflow: 'hidden', borderWidth: 1,
      borderColor: colors.primaryBorder, ...shadows.sm,
    },
    infoGradient: {
      flexDirection: 'row', alignItems: 'flex-start',
      padding: rs(18), gap: rs(12),
    },
    infoIcon:  { fontSize: rs(20), marginTop: rs(2), flexShrink: 0 },
    infoText:  { flex: 1, minWidth: 0 },
    infoTitle: {
      fontFamily: fonts.bodySemi, fontSize: fontSize.base,
      color: colors.text, marginBottom: rs(4),
    },
    infoSub: {
      fontFamily: fonts.body, fontSize: fontSize.sm,
      color: colors.textSub, lineHeight: rs(20),
    },
    infoMono: { fontFamily: fonts.mono, color: colors.primary },

    footer: {
      fontFamily: fonts.body, fontSize: fontSize.xs,
      color: colors.textMuted, textAlign: 'center',
      marginTop: rs(28), letterSpacing: 0.3,
    },
  };
}