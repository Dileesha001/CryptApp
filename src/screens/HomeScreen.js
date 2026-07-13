// HomeScreen.js – Premium responsive home hub
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StatusBar,
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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Hero ── */}
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        {/* Decorative orbs */}
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
            {/* App badge */}
            <View style={styles.appBadge}>
              <Text style={styles.appBadgeIcon}>🛡️</Text>
              <Text style={styles.appBadgeLabel}>CryptVault</Text>
            </View>

            <Text style={styles.heroTitle}>Secure File{'\n'}Encryption</Text>
            <Text style={styles.heroSub}>
              Military-grade protection for your files.{'\n'}
              Powered by AES-128-CBC + HMAC-SHA256.
            </Text>

            {/* Chip row */}
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
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: pad }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: fadeY }] }}>
          <Text style={styles.sectionLabel}>CHOOSE AN ACTION</Text>

          {/* On tablets: 2-col grid, on phones: single column */}
          {isTablet ? (
            <View style={styles.grid}>
              {cards.map((c, i) => (
                <ActionCard
                  key={c.key}
                  title={c.title}
                  subtitle={c.subtitle}
                  icon={c.icon}
                  gradient={c.gradient}
                  onPress={() => navigation.navigate(c.screen)}
                  style={[styles.gridCard, i === 2 && styles.gridCardFull]}
                />
              ))}
            </View>
          ) : (
            <View style={styles.stack}>
              {cards.map(c => (
                <ActionCard
                  key={c.key}
                  title={c.title}
                  subtitle={c.subtitle}
                  icon={c.icon}
                  gradient={c.gradient}
                  onPress={() => navigation.navigate(c.screen)}
                  style={styles.stackCard}
                />
              ))}
            </View>
          )}

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
  hero: { overflow: 'hidden', paddingBottom: rs(28) },

  orb: { position: 'absolute', borderRadius: radius.full },
  orb1: { width: rs(300), height: rs(300), backgroundColor: 'rgba(255,255,255,0.06)', top: -rs(100), right: -rs(80) },
  orb2: { width: rs(180), height: rs(180), backgroundColor: 'rgba(255,255,255,0.04)', bottom: -rs(60), left: -rs(50) },
  orb3: { width: rs(120), height: rs(120), backgroundColor: 'rgba(255,255,255,0.03)', top: rs(60), left: rs(200) },

  heroInner: { paddingTop: rs(20), paddingBottom: rs(8) },

  appBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: rs(14),
    paddingVertical: rs(7),
    marginBottom: rs(20),
    gap: rs(8),
  },
  appBadgeIcon: { fontSize: rs(16) },
  appBadgeLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.white,
    letterSpacing: 0.5,
  },

  heroTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.hero,
    color: colors.white,
    lineHeight: rs(46),
    letterSpacing: -1,
    marginBottom: rs(14),
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: rs(22),
    marginBottom: rs(20),
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(8) },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.full,
    paddingHorizontal: rs(12),
    paddingVertical: rs(5),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  chipText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.90)',
    letterSpacing: 0.3,
  },

  /* Scroll / cards */
  scroll: { paddingTop: rs(28), paddingBottom: rs(48) },
  sectionLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 1.8,
    marginBottom: rs(16),
    textTransform: 'uppercase',
  },

  /* Phone column */
  stack: { gap: rs(14) },
  stackCard: {},

  /* Tablet grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(14) },
  gridCard: { width: '47%' },
  gridCardFull: { width: '100%' },

  /* Info card */
  infoCard: {
    marginTop: rs(20),
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    ...shadows.sm,
  },
  infoGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: rs(18),
    gap: rs(14),
  },
  infoIcon: { fontSize: rs(22), marginTop: rs(2) },
  infoText: { flex: 1 },
  infoTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.base,
    color: colors.text,
    marginBottom: rs(4),
  },
  infoSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSub,
    lineHeight: rs(20),
  },
  infoMono: {
    fontFamily: fonts.mono,
    color: colors.primary,
  },

  footer: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: rs(28),
    letterSpacing: 0.3,
  },
});
