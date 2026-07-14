// EncryptScreen.js – Fully responsive premium encryption screen
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  encryptWithKey, encryptWithPassword,
  base64ToBytes, bytesToBase64,
} from '../crypto/fernet';
import FilePicker   from '../components/FilePicker';
import PasswordInput from '../components/PasswordInput';
import StatusModal   from '../components/StatusModal';
import {
  colors, fonts, fontSize, gradients, radius,
  shadows, spacing, rs, hPad,
} from '../theme';

const MODE_KEY  = 'key';
const MODE_PASS = 'password';

export default function EncryptScreen() {
  const { width } = useWindowDimensions();
  const isTablet  = width >= 768;
  const pad       = hPad();

  const [mode,      setMode]      = useState(MODE_KEY);
  const [inputFile, setInputFile] = useState(null);
  const [keyFile,   setKeyFile]   = useState(null);
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [outName,   setOutName]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [modal,     setModal]     = useState({ visible: false });
  const [outputUri, setOutputUri] = useState(null);

  const pickInput = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.[0]) {
        const a = res.assets[0];
        setInputFile({ uri: a.uri, name: a.name });
        if (!outName) setOutName(a.name + '.enc');
      }
    } catch (e) { console.warn(e); }
  };

  const pickKey = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.[0]) {
        const a = res.assets[0];
        setKeyFile({ uri: a.uri, name: a.name });
      }
    } catch (e) { console.warn(e); }
  };

  const handleEncrypt = async () => {
    if (!inputFile) return setModal({ visible: true, type: 'error', title: 'No input file', message: 'Please select the file you want to encrypt.' });
    if (mode === MODE_KEY && !keyFile) return setModal({ visible: true, type: 'error', title: 'No key file', message: 'Please select your .key file.' });
    if (mode === MODE_PASS) {
      if (!password) return setModal({ visible: true, type: 'error', title: 'No password', message: 'Please enter an encryption password.' });
      if (password !== confirm) return setModal({ visible: true, type: 'error', title: 'Passwords differ', message: 'The two passwords you entered do not match.' });
      if (password.length < 8) return setModal({ visible: true, type: 'error', title: 'Weak password', message: 'Please use at least 8 characters for your password.' });
    }

    setLoading(true);
    setModal({
      visible: true, type: 'loading',
      title: 'Encrypting…',
      message: mode === MODE_PASS
        ? 'Deriving key with PBKDF2 (600K iterations). This may take a moment.'
        : 'Encrypting with AES-128-CBC…',
    });

    try {
      const b64 = await FileSystem.readAsStringAsync(inputFile.uri, { encoding: FileSystem.EncodingType.Base64 });
      const plain = base64ToBytes(b64);

      let cipher;
      if (mode === MODE_KEY) {
        const keyStr = (await FileSystem.readAsStringAsync(keyFile.uri, { encoding: FileSystem.EncodingType.UTF8 })).trim();
        cipher = await encryptWithKey(plain, keyStr);
      } else {
        cipher = await encryptWithPassword(plain, password);
      }

      const name = outName.trim() || inputFile.name + '.enc';
      const path = FileSystem.cacheDirectory + name;
      await FileSystem.writeAsStringAsync(path, bytesToBase64(cipher), { encoding: FileSystem.EncodingType.Base64 });
      setOutputUri(path);
      setModal({ visible: true, type: 'success', title: 'Encrypted!', message: `"${inputFile.name}" was encrypted successfully.\n\nOutput: ${name}` });
    } catch (e) {
      setModal({ visible: true, type: 'error', title: 'Encryption Failed', message: e.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const share = async () => {
    if (!outputUri) return;
    try { await Sharing.shareAsync(outputUri, { mimeType: 'application/octet-stream', dialogTitle: 'Save encrypted file' }); }
    catch (e) { console.warn(e); }
  };

  return (
    <View style={styles.root}>
      {/* ── Header – full width, above scroll ── */}
      <LinearGradient
        colors={gradients.encrypt}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerOrb} />
        <SafeAreaView edges={['top']} style={{ width: '100%', alignItems: 'center' }}>
          <View style={styles.headerIconWrap}><Text style={styles.headerEmoji}>🔒</Text></View>
          <Text style={styles.headerTitle}>Encrypt File</Text>
          <Text style={styles.headerSub}>
            AES-128-CBC with HMAC-SHA256{'\n'}authentication & tamper detection
          </Text>

          {/* Step indicators */}
          <View style={styles.steps}>
            {['Select File', 'Choose Method', 'Encrypt'].map((s, i) => (
              <View key={s} style={styles.stepWrap}>
                <View style={styles.stepDot}><Text style={styles.stepNum}>{i + 1}</Text></View>
                <Text style={styles.stepLabel}>{s}</Text>
                {i < 2 && <View style={styles.stepLine} />}
              </View>
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Scrollable body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: pad }]}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Body ── */}
        <View style={[styles.body, isTablet && styles.bodyTablet]}>

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
          <FilePicker label="Input File" placeholder="Select file to encrypt" value={inputFile?.name} onPress={pickInput} icon="📄" accent={colors.cyan} />

          {mode === MODE_KEY ? (
            <FilePicker label="Key File (.key)" placeholder="Select your key file" value={keyFile?.name} onPress={pickKey} icon="🗝️" accent={colors.cyan} />
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
          <Pressable onPress={handleEncrypt} disabled={loading} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
            <LinearGradient
              colors={gradients.btnCyan}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.btn, shadows.cyan]}
            >
              {loading && !outputUri ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.btnText}>🔒  Encrypt File</Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Share output */}
          {outputUri && !loading && (
            <Pressable onPress={share} style={[styles.outlineBtn, { borderColor: colors.cyan }]}>
              <Text style={[styles.outlineBtnText, { color: colors.cyan }]}>📤  Save / Share Encrypted File</Text>
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
        onAction={modal.type === 'success' && outputUri ? share : null}
        actionLabel="📤 Save Encrypted File"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg1 },
  scroll: { paddingBottom: rs(48), paddingTop: rs(24) },

  header: {
    alignItems: 'center',
    paddingBottom: rs(32),
    overflow: 'hidden',
  },
  headerOrb: {
    position: 'absolute',
    width: rs(240), height: rs(240), borderRadius: rs(120),
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -rs(80), right: -rs(60),
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
  bodyTablet: { maxWidth: 640, alignSelf: 'center', width: '100%' },

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
