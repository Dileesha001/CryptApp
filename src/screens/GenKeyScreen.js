// GenKeyScreen.js – Generate & save a Fernet encryption key
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { generateKey } from '../crypto/fernet';
import { saveAndShareText } from '../utils/webFileIO';
import StatusModal from '../components/StatusModal';
import DesktopLayout from '../components/DesktopLayout';
import useTheme from '../hooks/useTheme';

export default function GenKeyScreen() {
  const {
    isTablet, isDesktop,
    hPad,
    colors, fonts, fontSize, gradients, radius, shadows, rs,
  } = useTheme();
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation();

  const [keyStr,   setKeyStr]   = useState(null);
  const [fileName, setFileName] = useState('secret.key');
  const [loading,  setLoading]  = useState(false);
  const [modal,    setModal]    = useState({ visible: false });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      setKeyStr(generateKey());
    } catch (e) {
      setModal({ visible: true, type: 'error', title: 'Generation Failed', message: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!keyStr) return;
    setLoading(true);
    try {
      const name = fileName.trim() || 'secret.key';
      await saveAndShareText(keyStr, name, 'application/octet-stream', 'Save your encryption key');
      if (Platform.OS !== 'web') {
        setModal({ visible: true, type: 'success', title: 'Key Saved', message: `Saved as "${name}".` });
      }
    } catch (e) {
      setModal({ visible: true, type: 'error', title: 'Save Failed', message: e.message });
    } finally {
      setLoading(false);
    }
  };

  const preview = keyStr
    ? keyStr.slice(0, 20) + ' … ' + keyStr.slice(-12)
    : null;

  // ── Reactive styles ────────────────────────────────────────────────────────
  const s = makeStyles({ colors, fonts, fontSize, gradients, radius, shadows, rs });

  return (
    <DesktopLayout currentScreen="GenKey">
    <View style={s.root}>

      {/* ── Header ── */}
      {isDesktop ? (
        <LinearGradient
          colors={gradients.genKey}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.desktopHeader}
        >
          <View style={s.desktopHeaderOrb} />
          <View style={s.desktopHeaderContent}>
            <View style={s.desktopHeaderLeft}>
              <Pressable onPress={() => navigation.goBack()} style={s.desktopBackBtn} hitSlop={12}>
                <Text style={s.desktopBackText}>‹</Text>
              </Pressable>
              <View style={s.desktopHeaderIconWrap}>
                <Text style={s.desktopHeaderEmoji}>🗝️</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.desktopHeaderTitle}>Generate Key</Text>
                <Text style={s.desktopHeaderSub} numberOfLines={1}>256-bit CSPRNG · Base64URL Fernet format · AES-128-CBC compatible</Text>
              </View>
            </View>
            <View style={s.desktopSpecChips}>
              {['AES-128-CBC', 'HMAC-SHA256', 'Fernet v80'].map(spec => (
                <View key={spec} style={s.desktopSpecChip}>
                  <Text style={s.desktopSpecChipText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={gradients.genKey}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.header, { paddingTop: insets.top }]}
        >
          <View style={s.headerOrb} />
          <Pressable
            onPress={() => navigation.goBack()}
            style={[s.backBtn, { top: insets.top + rs(10) }]}
            hitSlop={12}
          >
            <Text style={s.backBtnText}>‹</Text>
          </Pressable>
          <View style={{ width: '100%', alignItems: 'center', paddingBottom: rs(36) }}>
            <View style={s.headerInner}>
              <View style={s.headerIconWrap}>
                <Text style={s.headerEmoji}>🗝️</Text>
              </View>
              <Text style={s.headerTitle}>Generate Key</Text>
              <Text style={s.headerSub}>
                Creates a 256-bit cryptographically{'\n'}random Fernet encryption key.
              </Text>
            </View>
          </View>
        </LinearGradient>
      )}

      {/* ── Scrollable body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingHorizontal: hPad }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[s.body, isTablet && s.bodyTablet, isDesktop && s.bodyDesktop]}>

          {/* Key preview / placeholder */}
          {keyStr ? (
            <LinearGradient
              colors={gradients.subtlePurple}
              style={s.keyCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={s.keyCardTop}>
                <Text style={s.keyCardLabel}>GENERATED KEY</Text>
                <View style={s.keyBit}>
                  <Text style={s.keyBitText}>256-bit</Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.keyScroll}
              >
                <Text style={s.keyFull} selectable>{keyStr}</Text>
              </ScrollView>

              <View style={s.keyPreviewRow}>
                <Text style={s.keyPreview} selectable>{preview}</Text>
              </View>

              <View style={s.keyMeta}>
                <Text style={s.keyMetaText}>✓ {keyStr.length} chars · Base64URL · Fernet-format</Text>
              </View>
            </LinearGradient>
          ) : (
            <View style={s.emptyCard}>
              <View style={s.emptyOrb}>
                <Text style={{ fontSize: rs(34) }}>🔮</Text>
              </View>
              <Text style={s.emptyTitle}>No key yet</Text>
              <Text style={s.emptyHint}>Hit "Generate" below to create a fresh cryptographic key.</Text>
            </View>
          )}

          {/* Security spec chips */}
          <View style={s.specRow}>
            {['AES-128-CBC', 'HMAC-SHA256', 'CSPRNG', 'Fernet v80'].map(spec => (
              <View key={spec} style={s.specChip}>
                <Text style={s.specChipText}>{spec}</Text>
              </View>
            ))}
          </View>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerLabel}>Configuration</Text>
            <View style={s.dividerLine} />
          </View>

          {/* File name */}
          <Text style={s.inputLabel}>KEY FILE NAME</Text>
          <View style={s.inputWrap}>
            <Text style={s.inputPrefix}>📁</Text>
            <TextInput
              style={s.input}
              value={fileName}
              onChangeText={setFileName}
              placeholder="secret.key"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Buttons */}
          <Pressable
            onPress={handleGenerate}
            disabled={loading}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient
              colors={gradients.btnPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[s.btn, shadows.indigo]}
            >
              {loading && !keyStr ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={s.btnText}>
                  {keyStr ? '🔄  Regenerate Key' : '✨  Generate Key'}
                </Text>
              )}
            </LinearGradient>
          </Pressable>

          {keyStr && (
            <Pressable
              onPress={handleSave}
              disabled={loading}
              style={({ pressed }) => [s.outlineBtn, { opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={s.outlineBtnText}>
                {Platform.OS === 'web' ? '⬇️  Download Key File' : '📤  Save & Share Key File'}
              </Text>
            </Pressable>
          )}

          {/* Warning */}
          <View style={s.warnCard}>
            <LinearGradient colors={['#1C1006', '#2D1A00']} style={s.warnGrad}>
              <Text style={s.warnTitle}>⚠️  Security Notice</Text>
              <Text style={s.warnText}>
                Store your key file securely. Anyone who obtains it can decrypt all files encrypted
                with this key. Never send it via unencrypted channels.
              </Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      <StatusModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ visible: false })}
      />
    </View>
    </DesktopLayout>
  );
}

// ── Reactive stylesheet factory ───────────────────────────────────────────────
function makeStyles({ colors, fonts, fontSize, gradients, radius, shadows, rs }) {
  return {
    root:   { flex: 1, backgroundColor: colors.bg1 },
    scroll: { paddingBottom: rs(48), paddingTop: rs(24) },

    header: {
      alignItems: 'center',
      overflow: 'hidden',
    },
    headerOrb: {
      position: 'absolute',
      width: rs(240), height: rs(240), borderRadius: rs(120),
      backgroundColor: 'rgba(255,255,255,0.07)',
      top: -rs(80), right: -rs(60),
    },

    backBtn: {
      position: 'absolute',
      left: rs(16),
      width: rs(36), height: rs(36),
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 10,
    },
    backBtnText: {
      color: colors.white, fontSize: rs(26),
      lineHeight: rs(30), marginTop: -rs(2),
    },

    headerIconWrap: {
      width: rs(74), height: rs(74), borderRadius: radius.xl,
      backgroundColor: 'rgba(255,255,255,0.20)',
      alignItems: 'center', justifyContent: 'center',
      marginTop: rs(16), marginBottom: rs(14),
    },
    headerEmoji: { fontSize: rs(36) },
    headerTitle: {
      fontFamily: fonts.heading, fontSize: fontSize.xxl, color: colors.white,
      letterSpacing: -0.6, marginBottom: rs(8),
    },
    headerSub: {
      fontFamily: fonts.body, fontSize: fontSize.sm,
      color: 'rgba(255,255,255,0.78)',
      textAlign: 'center', lineHeight: rs(20),
    },

    body: { paddingTop: rs(4) },
    bodyTablet:  { maxWidth: 640, alignSelf: 'center', width: '100%' },
    bodyDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },
    headerInner: { alignItems: 'center' },

    /* Desktop compact header */
    desktopHeader: {
      height: 80, overflow: 'hidden',
      position: 'relative', justifyContent: 'center',
      flexShrink: 0,
    },
    desktopHeaderOrb: {
      position: 'absolute',
      width: 200, height: 200, borderRadius: 100,
      backgroundColor: 'rgba(255,255,255,0.06)',
      top: -80, right: -40,
    },
    desktopHeaderContent: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', paddingHorizontal: 28,
      gap: 16,
    },
    desktopHeaderLeft: {
      flexDirection: 'row', alignItems: 'center',
      gap: 12, flex: 1, minWidth: 0,
    },
    desktopBackBtn: {
      width: 32, height: 32, borderRadius: 99,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    desktopBackText: { color: colors.white, fontSize: 22, lineHeight: 26, marginTop: -2 },
    desktopHeaderIconWrap: {
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.20)',
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    desktopHeaderEmoji: { fontSize: 20 },
    desktopHeaderTitle: {
      fontFamily: fonts.heading, fontSize: 17, color: colors.white, letterSpacing: -0.3,
    },
    desktopHeaderSub: {
      fontFamily: fonts.body, fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2,
    },
    desktopSpecChips: { flexDirection: 'row', gap: 6, flexShrink: 0 },
    desktopSpecChip: {
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderRadius: 99,
      paddingHorizontal: 10, paddingVertical: 4,
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    },
    desktopSpecChipText: {
      fontFamily: fonts.bodyMed, fontSize: 10, color: colors.white,
    },

    /* Key card */
    keyCard: {
      borderRadius: radius.xl,
      padding: rs(20),
      marginBottom: rs(16),
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      ...shadows.sm,
    },
    keyCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: rs(14),
    },
    keyCardLabel: {
      fontFamily: fonts.bodySemi,
      fontSize: fontSize.xs,
      color: colors.primary,
      letterSpacing: 1.2,
    },
    keyBit: {
      backgroundColor: colors.primaryDark,
      borderRadius: radius.full,
      paddingHorizontal: rs(10),
      paddingVertical: rs(3),
    },
    keyBitText: {
      fontFamily: fonts.bodySemi,
      fontSize: fontSize.xs,
      color: colors.white,
    },

    keyScroll: { paddingBottom: rs(4) },
    keyFull: {
      fontFamily: fonts.mono,
      fontSize: fontSize.sm,
      color: colors.primary,
      letterSpacing: 0.5,
      marginBottom: rs(6),
    },
    keyPreviewRow: { marginBottom: rs(12) },
    keyPreview: {
      fontFamily: fonts.mono,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      letterSpacing: 0.4,
    },

    keyMeta: {
      backgroundColor: 'rgba(129,140,248,0.12)',
      borderRadius: radius.sm,
      paddingHorizontal: rs(10),
      paddingVertical: rs(6),
    },
    keyMetaText: {
      fontFamily: fonts.body,
      fontSize: fontSize.xs,
      color: colors.textSub,
    },

    emptyCard: {
      backgroundColor: colors.bg2,
      borderRadius: radius.xl,
      padding: rs(32),
      marginBottom: rs(16),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    emptyOrb: {
      width: rs(72), height: rs(72),
      borderRadius: radius.full,
      backgroundColor: colors.primaryDim,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: rs(14),
    },
    emptyTitle: {
      fontFamily: fonts.headingSemi,
      fontSize: fontSize.md,
      color: colors.textSub,
      marginBottom: rs(6),
    },
    emptyHint: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: rs(20),
    },

    specRow: {
      flexDirection: 'row', flexWrap: 'wrap',
      gap: rs(8), marginBottom: rs(20),
    },
    specChip: {
      backgroundColor: colors.bg2,
      borderRadius: radius.full,
      paddingHorizontal: rs(12), paddingVertical: rs(5),
      borderWidth: 1, borderColor: colors.borderMd,
    },
    specChipText: {
      fontFamily: fonts.bodyMed,
      fontSize: fontSize.xs,
      color: colors.textSub,
    },

    divider: {
      flexDirection: 'row', alignItems: 'center',
      marginBottom: rs(20), gap: rs(10),
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerLabel: {
      fontFamily: fonts.body,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      letterSpacing: 0.5,
    },

    inputLabel: {
      fontFamily: fonts.bodySemi, fontSize: fontSize.xs, color: colors.textSub,
      letterSpacing: 1, textTransform: 'uppercase', marginBottom: rs(8),
    },
    inputWrap: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.glass,
      borderWidth: 1.5, borderColor: colors.border,
      borderRadius: radius.md, paddingHorizontal: rs(14),
      gap: rs(10), marginBottom: rs(20),
    },
    inputPrefix: { fontSize: rs(16) },
    input: {
      flex: 1, fontFamily: fonts.body, fontSize: fontSize.base,
      color: colors.text, paddingVertical: rs(14),
      ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
    },

    btn: {
      borderRadius: radius.md, paddingVertical: rs(15),
      alignItems: 'center', marginBottom: rs(12),
    },
    btnText: {
      fontFamily: fonts.bodySemi, fontSize: fontSize.base,
      color: colors.white, letterSpacing: 0.2,
    },
    outlineBtn: {
      borderRadius: radius.md, paddingVertical: rs(14),
      alignItems: 'center', marginBottom: rs(20),
      borderWidth: 1.5, borderColor: colors.primary,
      backgroundColor: colors.primaryDim,
    },
    outlineBtnText: {
      fontFamily: fonts.bodyMed, fontSize: fontSize.base,
      color: colors.primary,
    },

    warnCard: {
      borderRadius: radius.xl, overflow: 'hidden',
      borderWidth: 1, borderColor: colors.amber + '30',
    },
    warnGrad: { padding: rs(18) },
    warnTitle: {
      fontFamily: fonts.bodySemi, fontSize: fontSize.base,
      color: colors.amber, marginBottom: rs(8),
    },
    warnText: {
      fontFamily: fonts.body, fontSize: fontSize.sm,
      color: colors.textSub, lineHeight: rs(20),
    },
  };
}
