// GenKeyScreen.js – Generate & save a Fernet encryption key
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { generateKey } from '../crypto/fernet';
import { saveAndShareText } from '../utils/webFileIO';
import StatusModal from '../components/StatusModal';
import {
  colors, fonts, fontSize, gradients, radius,
  shadows, spacing, rs, hPad,
} from '../theme';

export default function GenKeyScreen() {
  const { width } = useWindowDimensions();
  const isTablet  = width >= 768;
  const pad       = hPad();
  const insets    = useSafeAreaInsets();
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

  return (
    <View style={styles.root}>
      {/* ── Header gradient – full width, above scroll ── */}
      <LinearGradient
        colors={gradients.genKey}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerOrb} />

        {/* Back button */}
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { top: insets.top + rs(10) }]}
          hitSlop={12}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>

        <View style={{ width: '100%', alignItems: 'center', paddingBottom: rs(36) }}>
          <View style={styles.headerIconWrap}>
            <Text style={styles.headerEmoji}>🗝️</Text>
          </View>
          <Text style={styles.headerTitle}>Generate Key</Text>
          <Text style={styles.headerSub}>
            Creates a 256-bit cryptographically{'\n'}random Fernet encryption key.
          </Text>
        </View>
      </LinearGradient>

      {/* ── Scrollable body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: pad }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.body, isTablet && styles.bodyTablet]}>

          {/* Key preview / placeholder */}
          {keyStr ? (
            <LinearGradient
              colors={gradients.subtlePurple}
              style={styles.keyCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.keyCardTop}>
                <Text style={styles.keyCardLabel}>GENERATED KEY</Text>
                <View style={styles.keyBit}>
                  <Text style={styles.keyBitText}>256-bit</Text>
                </View>
              </View>

              {/* Full key – scrollable horizontally, selectable for copy */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.keyScroll}
              >
                <Text style={styles.keyFull} selectable>{keyStr}</Text>
              </ScrollView>

              <View style={styles.keyPreviewRow}>
                <Text style={styles.keyPreview} selectable>{preview}</Text>
              </View>

              <View style={styles.keyMeta}>
                <Text style={styles.keyMetaText}>✓ {keyStr.length} chars · Base64URL · Fernet-format</Text>
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyOrb}>
                <Text style={{ fontSize: rs(34) }}>🔮</Text>
              </View>
              <Text style={styles.emptyTitle}>No key yet</Text>
              <Text style={styles.emptyHint}>Hit "Generate" below to create a fresh cryptographic key.</Text>
            </View>
          )}

          {/* Security spec chips */}
          <View style={styles.specRow}>
            {['AES-128-CBC', 'HMAC-SHA256', 'CSPRNG', 'Fernet v80'].map(s => (
              <View key={s} style={styles.specChip}>
                <Text style={styles.specChipText}>{s}</Text>
              </View>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>Configuration</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* File name */}
          <Text style={styles.inputLabel}>KEY FILE NAME</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputPrefix}>📁</Text>
            <TextInput
              style={styles.input}
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
              style={[styles.btn, shadows.indigo]}
            >
              {loading && !keyStr ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.btnText}>
                  {keyStr ? '🔄  Regenerate Key' : '✨  Generate Key'}
                </Text>
              )}
            </LinearGradient>
          </Pressable>

          {keyStr && (
            <Pressable
              onPress={handleSave}
              disabled={loading}
              style={({ pressed }) => [styles.outlineBtn, { opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={styles.outlineBtnText}>
                {Platform.OS === 'web' ? '⬇️  Download Key File' : '📤  Save & Share Key File'}
              </Text>
            </Pressable>
          )}

          {/* Warning */}
          <View style={styles.warnCard}>
            <LinearGradient colors={['#1C1006', '#2D1A00']} style={styles.warnGrad}>
              <Text style={styles.warnTitle}>⚠️  Security Notice</Text>
              <Text style={styles.warnText}>
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
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg1 },
  scroll: { paddingBottom: rs(48), paddingTop: rs(24) },

  /* Header */
  header: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerOrb: {
    position: 'absolute',
    width: rs(240),
    height: rs(240),
    borderRadius: rs(120),
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -rs(80),
    right: -rs(60),
  },

  /* Custom back button */
  backBtn: {
    position: 'absolute',
    left: rs(16),
    width: rs(36),
    height: rs(36),
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backBtnText: {
    color: colors.white,
    fontSize: rs(26),
    lineHeight: rs(30),
    marginTop: -rs(2),
  },

  headerIconWrap: {
    width: rs(74),
    height: rs(74),
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: rs(16),
    marginBottom: rs(14),
  },
  headerEmoji: { fontSize: rs(36) },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xxl,
    color: colors.white,
    letterSpacing: -0.6,
    marginBottom: rs(8),
  },
  headerSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    lineHeight: rs(20),
  },

  /* Body */
  body: { paddingTop: rs(4) },
  bodyTablet: { maxWidth: 640, alignSelf: 'center', width: '100%' },

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

  /* Full key display */
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

  /* Empty card */
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
    width: rs(72),
    height: rs(72),
    borderRadius: radius.full,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
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

  /* Spec chips */
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(8),
    marginBottom: rs(20),
  },
  specChip: {
    backgroundColor: colors.bg2,
    borderRadius: radius.full,
    paddingHorizontal: rs(12),
    paddingVertical: rs(5),
    borderWidth: 1,
    borderColor: colors.borderMd,
  },
  specChipText: {
    fontFamily: fonts.bodyMed,
    fontSize: fontSize.xs,
    color: colors.textSub,
  },

  /* Divider */
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rs(20),
    gap: rs(10),
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },

  /* Inputs */
  inputLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: colors.textSub,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: rs(8),
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: rs(14),
    gap: rs(10),
    marginBottom: rs(20),
  },
  inputPrefix: { fontSize: rs(16) },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    paddingVertical: rs(14),
    // web outline removal
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },

  /* Buttons */
  btn: {
    borderRadius: radius.md,
    paddingVertical: rs(15),
    alignItems: 'center',
    marginBottom: rs(12),
  },
  btnText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.base,
    color: colors.white,
    letterSpacing: 0.2,
  },
  outlineBtn: {
    borderRadius: radius.md,
    paddingVertical: rs(14),
    alignItems: 'center',
    marginBottom: rs(20),
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  outlineBtnText: {
    fontFamily: fonts.bodyMed,
    fontSize: fontSize.base,
    color: colors.primary,
  },

  /* Warning */
  warnCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.amber + '30',
  },
  warnGrad: { padding: rs(18) },
  warnTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.base,
    color: colors.amber,
    marginBottom: rs(8),
  },
  warnText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSub,
    lineHeight: rs(20),
  },
});
