// EncryptScreen.js – Fully responsive premium encryption screen
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
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  encryptWithKey, encryptWithPassword,
  base64ToBytes, bytesToBase64,
} from '../crypto/fernet';
import { readFileAsBytes, saveAndShareBytes } from '../utils/webFileIO';
import FilePicker    from '../components/FilePicker';
import PasswordInput from '../components/PasswordInput';
import StatusModal   from '../components/StatusModal';
import DesktopLayout from '../components/DesktopLayout';
import {
  colors, fonts, fontSize, gradients, radius,
  shadows, spacing, rs, hPad,
} from '../theme';

const MODE_KEY  = 'key';
const MODE_PASS = 'password';

export default function EncryptScreen() {
  const { width } = useWindowDimensions();
  const isTablet  = width >= 768;
  const isDesktop = width >= 1024;
  const pad       = hPad();
  const insets    = useSafeAreaInsets();
  const navigation = useNavigation();

  const [mode,      setMode]      = useState(MODE_KEY);
  const [inputFile, setInputFile] = useState(null);
  const [keyFile,   setKeyFile]   = useState(null);
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [outName,   setOutName]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [modal,     setModal]     = useState({ visible: false });
  const [outputBytes, setOutputBytes] = useState(null);
  const [outputName,  setOutputName]  = useState('');

  const pickInput = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.[0]) {
        const a = res.assets[0];
        setInputFile(a);
        if (!outName) setOutName(a.name + '.enc');
      }
    } catch (e) { console.warn(e); }
  };

  const pickKey = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.[0]) {
        setKeyFile(res.assets[0]);
      }
    } catch (e) { console.warn(e); }
  };

  const handleEncrypt = async () => {
    if (!inputFile)
      return setModal({ visible: true, type: 'error', title: 'No input file', message: 'Please select the file you want to encrypt.' });
    if (mode === MODE_KEY && !keyFile)
      return setModal({ visible: true, type: 'error', title: 'No key file', message: 'Please select your .key file.' });
    if (mode === MODE_PASS) {
      if (!password)
        return setModal({ visible: true, type: 'error', title: 'No password', message: 'Please enter an encryption password.' });
      if (password !== confirm)
        return setModal({ visible: true, type: 'error', title: 'Passwords differ', message: 'The two passwords you entered do not match.' });
      if (password.length < 8)
        return setModal({ visible: true, type: 'error', title: 'Weak password', message: 'Please use at least 8 characters for your password.' });
    }

    setLoading(true);
    setOutputBytes(null);
    setModal({
      visible: true, type: 'loading',
      title: 'Encrypting…',
      message: mode === MODE_PASS
        ? 'Deriving key with PBKDF2 (600K iterations). This may take a moment.'
        : 'Encrypting with AES-128-CBC…',
    });

    try {
      // ── Read input file (web-safe) ──────────────────────────────────────
      const plain = await readFileAsBytes(inputFile);

      // ── Encrypt ─────────────────────────────────────────────────────────
      let cipher;
      if (mode === MODE_KEY) {
        let keyStr;
        if (Platform.OS === 'web') {
          // Read key file as text via FileReader
          const keyBytes = await readFileAsBytes(keyFile);
          keyStr = new TextDecoder().decode(keyBytes).trim();
        } else {
          const { default: FileSystem } = await import('expo-file-system');
          keyStr = (await FileSystem.readAsStringAsync(keyFile.uri, {
            encoding: FileSystem.EncodingType.UTF8,
          })).trim();
        }
        cipher = await encryptWithKey(plain, keyStr);
      } else {
        cipher = await encryptWithPassword(plain, password);
      }

      // ── Save / download ──────────────────────────────────────────────────
      const name = outName.trim() || inputFile.name + '.enc';
      setOutputBytes(cipher);
      setOutputName(name);

      await saveAndShareBytes(cipher, name, 'application/octet-stream', 'Save encrypted file');

      setModal({
        visible: true, type: 'success',
        title: 'Encrypted!',
        message: `"${inputFile.name}" encrypted successfully.\n\nOutput: ${name}`,
      });
    } catch (e) {
      setModal({ visible: true, type: 'error', title: 'Encryption Failed', message: e.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const share = async () => {
    if (!outputBytes) return;
    try {
      await saveAndShareBytes(outputBytes, outputName, 'application/octet-stream', 'Save encrypted file');
    } catch (e) { console.warn(e); }
  };

  return (
    <DesktopLayout currentScreen="Encrypt">
    <View style={styles.root}>

      {/* ── Header: compact bar on desktop, full gradient on mobile ── */}
      {isDesktop ? (
        <LinearGradient
          colors={gradients.encrypt}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.desktopHeader}
        >
          <View style={styles.desktopHeaderOrb} />
          <View style={styles.desktopHeaderContent}>
            <View style={styles.desktopHeaderLeft}>
              <Pressable onPress={() => navigation.goBack()} style={styles.desktopBackBtn} hitSlop={12}>
                <Text style={styles.desktopBackText}>‹</Text>
              </Pressable>
              <View style={styles.desktopHeaderIconWrap}>
                <Text style={styles.desktopHeaderEmoji}>🔒</Text>
              </View>
              <View>
                <Text style={styles.desktopHeaderTitle}>Encrypt File</Text>
                <Text style={styles.desktopHeaderSub}>AES-128-CBC · HMAC-SHA256 · Tamper detection</Text>
              </View>
            </View>
            <View style={styles.steps}>
              {['Select File', 'Choose Method', 'Encrypt'].map((s, i) => (
                <View key={s} style={styles.stepWrap}>
                  <View style={styles.stepDot}><Text style={styles.stepNum}>{i + 1}</Text></View>
                  <Text style={styles.stepLabel}>{s}</Text>
                  {i < 2 && <View style={styles.stepLine} />}
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={gradients.encrypt}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top }]}
        >
          <View style={styles.headerOrb} />
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { top: insets.top + rs(10) }]}
            hitSlop={12}
          >
            <Text style={styles.backBtnText}>‹</Text>
          </Pressable>
          <View style={{ width: '100%', alignItems: 'center', paddingBottom: rs(32) }}>
            <View style={styles.headerInner}>
              <View style={styles.headerIconWrap}>
                <Text style={styles.headerEmoji}>🔒</Text>
              </View>
              <Text style={styles.headerTitle}>Encrypt File</Text>
              <Text style={styles.headerSub}>
                AES-128-CBC with HMAC-SHA256{'\n'}authentication &amp; tamper detection
              </Text>
              <View style={styles.steps}>
                {['Select File', 'Choose Method', 'Encrypt'].map((s, i) => (
                  <View key={s} style={styles.stepWrap}>
                    <View style={styles.stepDot}><Text style={styles.stepNum}>{i + 1}</Text></View>
                    <Text style={styles.stepLabel}>{s}</Text>
                    {i < 2 && <View style={styles.stepLine} />}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </LinearGradient>
      )}

      {/* ── Scrollable body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: pad }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.body, isTablet && styles.bodyTablet, isDesktop && styles.bodyDesktop]}>

          {/* Mode toggle */}
          <View style={styles.toggle}>
            {[
              { id: MODE_KEY,  label: '🗝️ Key File' },
              { id: MODE_PASS, label: '🔐 Password' },
            ].map(m => (
              <Pressable
                key={m.id}
                onPress={() => setMode(m.id)}
                style={[styles.toggleTab, mode === m.id && styles.toggleTabOn]}
              >
                <Text style={[styles.toggleText, mode === m.id && styles.toggleTextOn]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Inputs */}
          <FilePicker
            label="Input File"
            placeholder="Select file to encrypt"
            value={inputFile?.name}
            onPress={pickInput}
            icon="📄"
            accent={colors.cyan}
          />

          {mode === MODE_KEY ? (
            <FilePicker
              label="Key File (.key)"
              placeholder="Select your key file"
              value={keyFile?.name}
              onPress={pickKey}
              icon="🗝️"
              accent={colors.cyan}
            />
          ) : (
            <>
              <PasswordInput label="Password" value={password} onChangeText={setPassword} placeholder="Min 8 characters" accent={colors.cyan} />
              <PasswordInput label="Confirm Password" value={confirm} onChangeText={setConfirm} placeholder="Re-enter password" accent={colors.cyan} />
            </>
          )}

          {/* Output name */}
          <Text style={styles.fieldLabel}>OUTPUT FILE NAME</Text>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldPrefix}>💾</Text>
            <TextInput
              style={styles.fieldInput}
              value={outName}
              onChangeText={setOutName}
              placeholder="e.g. document.pdf.enc"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Encrypt button */}
          <Pressable
            onPress={handleEncrypt}
            disabled={loading}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient
              colors={gradients.btnCyan}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.btn, shadows.cyan]}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.btnText}>🔒  Encrypt File</Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Save / re-download output */}
          {outputBytes && !loading && (
            <Pressable
              onPress={share}
              style={[styles.outlineBtn, { borderColor: colors.cyan }]}
            >
              <Text style={[styles.outlineBtnText, { color: colors.cyan }]}>
                {Platform.OS === 'web' ? '⬇️  Download Encrypted File' : '📤  Save / Share Encrypted File'}
              </Text>
            </Pressable>
          )}

          {/* Info panel */}
          <View style={styles.infoPanel}>
            <LinearGradient colors={gradients.subtleCyan} style={styles.infoPanelGrad}>
              <Text style={styles.infoPanelTitle}>
                {mode === MODE_KEY ? '🗝️ Key-file mode' : '🔐 Password mode'}
              </Text>
              <Text style={styles.infoPanelText}>
                {mode === MODE_KEY
                  ? 'Your .key file is used directly as the Fernet encryption key. Fast, and 100% compatible with file_crypt.py --key mode.'
                  : 'A key is derived from your password using PBKDF2-HMAC-SHA256 (600,000 iterations). Compatible with file_crypt.py --password mode.'}
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
        onAction={modal.type === 'success' && outputBytes ? share : null}
        actionLabel={Platform.OS === 'web' ? '⬇️ Download Encrypted File' : '📤 Save Encrypted File'}
      />
    </View>
    </DesktopLayout>
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
    width: rs(240), height: rs(240), borderRadius: rs(120),
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -rs(80), right: -rs(60),
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
    color: 'rgba(255,255,255,0.78)', textAlign: 'center', lineHeight: rs(20),
    marginBottom: rs(24),
  },

  steps: { flexDirection: 'row', alignItems: 'center', gap: rs(6), paddingHorizontal: rs(10) },
  stepWrap: { flexDirection: 'row', alignItems: 'center', gap: rs(6) },
  stepDot: {
    width: rs(24), height: rs(24), borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { fontFamily: fonts.bodySemi, fontSize: rs(11), color: colors.white },
  stepLabel: { fontFamily: fonts.body, fontSize: rs(10), color: 'rgba(255,255,255,0.75)' },
  stepLine: { width: rs(20), height: 1, backgroundColor: 'rgba(255,255,255,0.30)' },

  body: { paddingTop: rs(4) },
  bodyTablet:  { maxWidth: 640, alignSelf: 'center', width: '100%' },
  bodyDesktop: { maxWidth: 800, alignSelf: 'center', width: '100%' },
  headerInner: { alignItems: 'center' },

  /* ── Desktop compact header ── */
  desktopHeader: {
    height: 88,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  desktopHeaderOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -80,
    right: -40,
  },
  desktopHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  desktopHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  desktopBackBtn: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopBackText: {
    color: colors.white,
    fontSize: 22,
    lineHeight: 26,
    marginTop: -2,
  },
  desktopHeaderIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopHeaderEmoji: { fontSize: 22 },
  desktopHeaderTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.white,
    letterSpacing: -0.3,
  },
  desktopHeaderSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.bg2,
    borderRadius: radius.md,
    padding: rs(4),
    marginBottom: rs(20),
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleTab: { flex: 1, paddingVertical: rs(10), borderRadius: radius.sm, alignItems: 'center' },
  toggleTabOn: { backgroundColor: colors.cyanDark },
  toggleText: { fontFamily: fonts.bodyMed, fontSize: fontSize.sm, color: colors.textMuted },
  toggleTextOn: { color: colors.white },

  fieldLabel: {
    fontFamily: fonts.bodySemi, fontSize: fontSize.xs, color: colors.textSub,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: rs(8),
  },
  fieldWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: rs(14),
    gap: rs(10), marginBottom: rs(20),
  },
  fieldPrefix: { fontSize: rs(16) },
  fieldInput: {
    flex: 1, fontFamily: fonts.body, fontSize: fontSize.base,
    color: colors.text, paddingVertical: rs(14),
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },

  btn: {
    borderRadius: radius.md, paddingVertical: rs(15),
    alignItems: 'center', marginBottom: rs(12),
  },
  btnText: { fontFamily: fonts.bodySemi, fontSize: fontSize.base, color: colors.white },
  outlineBtn: {
    borderRadius: radius.md, paddingVertical: rs(14),
    alignItems: 'center', marginBottom: rs(20),
    borderWidth: 1.5, backgroundColor: 'rgba(103,232,249,0.08)',
  },
  outlineBtnText: { fontFamily: fonts.bodyMed, fontSize: fontSize.base },

  infoPanel: {
    borderRadius: radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.cyan + '30',
  },
  infoPanelGrad: { padding: rs(18) },
  infoPanelTitle: {
    fontFamily: fonts.bodySemi, fontSize: fontSize.base,
    color: colors.cyan, marginBottom: rs(8),
  },
  infoPanelText: {
    fontFamily: fonts.body, fontSize: fontSize.sm,
    color: colors.textSub, lineHeight: rs(20),
  },
});
