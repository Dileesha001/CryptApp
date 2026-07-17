// HomeScreen.js – Premium responsive home hub
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionCard from '../components/ActionCard';
import {
  colors, fonts, fontSize, gradients, radius,
  shadows, spacing, rs, hPad,
} from '../theme';

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isTablet  = width >= 768;
  const isDesktop = width >= 1024;

  const fadeY = useRef(new Animated.Value(24)).current;
  const fade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(fadeY, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const pad = hPad();

  const cards = [
    {
      key: 'genkey',
      title: 'Generate Key',
      subtitle: 'Create a cryptographically secure 256-bit encryption key',
      icon: '🗝️',
      gradient: gradients.genKey,
      screen: 'GenKey',
    },
    {
      key: 'encrypt',
      title: 'Encrypt File',
      subtitle: 'Lock any file with AES-128-CBC + HMAC-SHA256 authentication',
      icon: '🔒',
      gradient: gradients.encrypt,
      screen: 'Encrypt',
    },
    {
      key: 'decrypt',
      title: 'Decrypt File',
      subtitle: 'Restore an encrypted file with your key or password',
      icon: '🔓',
      gradient: gradients.decrypt,
      screen: 'Decrypt',
    },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={[styles.orb, styles.orb1]} />
          <View style={[styles.orb, styles.orb2]} />
          <View style={[styles.orb, styles.orb3]} />

          <SafeAreaView edges={['top']}>
            <Animated.View
              style={[
                styles.heroInner,
                { paddingHorizontal: pad, opacity: fade, transform: [{ translateY: fadeY }] },
              ]}
            >
              <View style={styles.appBadge}>
                <Text style={styles.appBadgeIcon}>🛡️</Text>
                <Text style={styles.appBadgeLabel}>CryptVault</Text>
              </View>

              <Text style={[styles.heroTitle, isDesktop && styles.heroTitleLg]}>
                Secure File{'\n'}Encryption
              </Text>
              <Text style={styles.heroSub}>
                Military-grade protection for your files.{'\n'}
                Powered by AES-128-CBC + HMAC-SHA256.
              </Text>

              <View style={styles.chipRow}>
                {['Fernet Compatible', 'PBKDF2 · 600K iterations', 'Zero-knowledge'].map(t => (
                  <View key={t} style={styles.chip}>
                    <Text style={styles.chipText}>{t}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>

        {/* ── Cards ── */}
        <Animated.View
          style={[
            styles.contentWrap,
            isDesktop && styles.contentWrapDesktop,
            { paddingHorizontal: pad, opacity: fade, transform: [{ translateY: fadeY }] },
          ]}
        >
          <Text style={styles.sectionLabel}>CHOOSE AN ACTION</Text>

          {/* Phone: single column | Tablet: 2-col wrap | Desktop: 3-col equal */}
          <View style={[
            styles.cardGrid,
            isTablet && styles.cardGridTablet,
            isDesktop && styles.cardGridDesktop,
          ]}>
            {cards.map(c => (
              <ActionCard
                key={c.key}
                title={c.title}
                subtitle={c.subtitle}
                icon={c.icon}
                gradient={c.gradient}
                onPress={() => navigation.navigate(c.screen)}
                style={[
                  isTablet && !isDesktop && styles.cardTabletItem,
                  isDesktop && styles.cardDesktopItem,
                ]}
              />
            ))}
          </View>

          {/* Footer info card */}
          <View style={styles.infoCard}>
            <LinearGradient
              colors={gradients.subtlePurple}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.infoGradient}
            >
              <Text style={styles.infoIcon}>ℹ️</Text>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Cross-platform compatible</Text>
                <Text style={styles.infoSub}>
                  Files encrypted here are fully compatible with{' '}
                  <Text style={styles.infoMono}>file_crypt.py</Text>
                  {' '}— encrypt on mobile, decrypt with Python and vice versa.
                </Text>
              </View>
            </LinearGradient>
          </View>

          <Text style={styles.footer}>CryptVault v1.0 · AES-128-CBC · HMAC-SHA256</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg1 },

  /* Hero */
  hero: { overflow: 'hidden', paddingBottom: rs(36) },
  orb: { position: 'absolute', borderRadius: radius.full },
  orb1: { width: rs(320), height: rs(320), backgroundColor: 'rgba(255,255,255,0.07)', top: -rs(100), right: -rs(80) },
  orb2: { width: rs(200), height: rs(200), backgroundColor: 'rgba(255,255,255,0.05)', bottom: -rs(60), left: -rs(50) },
  orb3: { width: rs(140), height: rs(140), backgroundColor: 'rgba(255,255,255,0.04)', top: rs(60), right: rs(200) },

  heroInner: { paddingTop: rs(24), paddingBottom: rs(8) },

  appBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: rs(14), paddingVertical: rs(7),
    marginBottom: rs(20), gap: rs(8),
  },
  appBadgeIcon: { fontSize: rs(16) },
  appBadgeLabel: {
    fontFamily: fonts.bodySemi, fontSize: fontSize.sm,
    color: colors.white, letterSpacing: 0.5,
  },

  heroTitle: {
    fontFamily: fonts.heading, fontSize: fontSize.hero,
    color: colors.white, lineHeight: rs(46),
    letterSpacing: -1, marginBottom: rs(14),
  },
  heroTitleLg: { fontSize: rs(48), lineHeight: rs(56) },
  heroSub: {
    fontFamily: fonts.body, fontSize: fontSize.base,
    color: 'rgba(255,255,255,0.82)', lineHeight: rs(24),
    marginBottom: rs(20),
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(8) },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: radius.full,
    paddingHorizontal: rs(12), paddingVertical: rs(5),
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
  },
  chipText: {
    fontFamily: fonts.bodySemi, fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.92)', letterSpacing: 0.3,
  },

  /* Content */
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: rs(52) },
  contentWrap: { paddingTop: rs(32) },
  contentWrapDesktop: { maxWidth: 1100, alignSelf: 'center', width: '100%' },

  sectionLabel: {
    fontFamily: fonts.bodySemi, fontSize: fontSize.xs,
    color: colors.textMuted, letterSpacing: 1.8,
    marginBottom: rs(16), textTransform: 'uppercase',
  },

  /* Card grid */
  cardGrid: { gap: rs(14) },
  cardGridTablet: { flexDirection: 'row', flexWrap: 'wrap' },
  cardGridDesktop: { flexDirection: 'row', flexWrap: 'nowrap' },

  cardTabletItem: { width: '47.5%' },
  cardDesktopItem: { flex: 1 },

  /* Info card */
  infoCard: {
    marginTop: rs(24), borderRadius: radius.xl,
    overflow: 'hidden', borderWidth: 1,
    borderColor: colors.primaryBorder, ...shadows.sm,
  },
  infoGradient: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: rs(20), gap: rs(14),
  },
  infoIcon: { fontSize: rs(22), marginTop: rs(2) },
  infoText: { flex: 1 },
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
    marginTop: rs(32), letterSpacing: 0.3,
  },
});