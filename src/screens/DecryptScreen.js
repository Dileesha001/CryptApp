// DecryptScreen.js – Fully responsive premium decryption screen
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
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  decryptWithKey, decryptWithPassword,
} from '../crypto/fernet';
import { readFileAsBytes, saveAndShareBytes } from '../utils/webFileIO';
import FilePicker    from '../components/FilePicker';
import PasswordInput from '../components/PasswordInput';
import StatusModal   from '../components/StatusModal';
import DesktopLayout from '../components/DesktopLayout';
import useTheme from '../hooks/useTheme';

const MODE_KEY  = 'key';
const MODE_PASS = 'password';

export default function DecryptScreen() {
  const {
    isTablet, isDesktop,
    hPad,
    colors, fonts, fontSize, gradients, radius, shadows, rs,
  } = useTheme();
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation();

  const [mode,      setMode]      = useState(MODE_KEY);
  const [inputFile, setInputFile] = useState(null);
  const [keyFile,   setKeyFile]   = useState(null);
  const [password,  setPassword]  = useState('');
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
        if (!outName) {
          setOutName(a.name.endsWith('.enc') ? a.name.slice(0, -4) : 'decrypted_' + a.name);
        }
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

  const handleDecrypt = async () => {
    if (!inputFile)
      return setModal({ visible: true, type: 'error', title: 'No file selected', message: 'Please select the encrypted file to decrypt.' });
    if (mode === MODE_KEY && !keyFile)
      return setModal({ visible: true, type: 'error', title: 'No key file', message: 'Please select your .key file.' });
    if (mode === MODE_PASS && !password)
      return setModal({ visible: true, type: 'error', title: 'No password', message: 'Please enter the decryption password.' });

    setLoading(true);
    setOutputBytes(null);
    setModal({
      visible: true, type: 'loading',
      title: 'Decrypting…',
      message: mode === MODE_PASS
        ? 'Re-deriving key with PBKDF2 (600K iterations). This may take a moment.'
        : 'Verifying HMAC signature and decrypting file…',
    });

    try {
      const cipher = await readFileAsBytes(inputFile);

      let plain;
      if (mode === MODE_KEY) {
        let keyStr;
        if (Platform.OS === 'web') {
          const keyBytes = await readFileAsBytes(keyFile);
          keyStr = new TextDecoder().decode(keyBytes).trim();
        } else {
          const { default: FileSystem } = await import('expo-file-system');
          keyStr = (await FileSystem.readAsStringAsync(keyFile.uri, {
            encoding: FileSystem.EncodingType.UTF8,
          })).trim();
        }
        plain = await decryptWithKey(cipher, keyStr);
      } else {
        plain = await decryptWithPassword(cipher, password);
      }

      const name = outName.trim() || 'decrypted_' + inputFile.name;
      setOutputBytes(plain);
      setOutputName(name);

      await saveAndShareBytes(plain, name, 'application/octet-stream', 'Save decrypted file');

      setModal({
        visible: true, type: 'success',
        title: 'Decrypted!',
        message: `"${inputFile.name}" decrypted successfully.\n\nOutput: ${name}`,
      });
    } catch (e) {
      const msg =
        e.message?.toLowerCase().includes('hmac') || e.message?.toLowerCase().includes('verification') || e.message?.toLowerCase().includes('wrong key')
          ? 'Wrong key or password, or the file has been tampered with. HMAC verification failed.'
          : (e.message || 'An unexpected error occurred.');
      setModal({ visible: true, type: 'error', title: 'Decryption Failed', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const share = async () => {
    if (!outputBytes) return;
    try {
      await saveAndShareBytes(outputBytes, outputName, 'application/octet-stream', 'Save decrypted file');
    } catch (e) { console.warn(e); }
  };

  // ── Reactive styles ────────────────────────────────────────────────────────
  const s = makeStyles({ colors, fonts, fontSize, gradients, radius, shadows, rs });

  return (
    <DesktopLayout currentScreen="Decrypt">
    <View style={s.root}>

      {/* ── Header ── */}
      {isDesktop ? (
        <LinearGradient
          colors={gradients.decrypt}
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
                <Text style={s.desktopHeaderEmoji}>🔓</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.desktopHeaderTitle}>Decrypt File</Text>
                <Text style={s.desktopHeaderSub} numberOfLines={1}>HMAC-SHA256 verified · AES-128-CBC · Integrity check</Text>
              </View>
            </View>
            <View style={s.desktopHmacBadge}>
              <Text style={s.desktopHmacText} numberOfLines={1}>🛡️ HMAC-verified integrity</Text>
            </View>
          </View>
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={gradients.decrypt}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
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
          <View style={{ width: '100%', alignItems: 'center', paddingBottom: rs(32) }}>
            <View style={s.headerInner}>
              <View style={s.headerIconWrap}>
                <Text style={s.headerEmoji}>🔓</Text>
              </View>
              <Text style={s.headerTitle}>Decrypt File</Text>
              <Text style={s.headerSub}>
                Restore an encrypted file using{'\n'}the same key or password used to encrypt it.
              </Text>
              <View style={s.hmacBadge}>
                <Text style={s.hmacText}>🛡️ HMAC-verified integrity check</Text>
              </View>
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

          {/* Mode toggle */}
          <View style={s.toggle}>
            {[
              { id: MODE_KEY,  label: '🗝️ Key File' },
              { id: MODE_PASS, label: '🔐 Password' },
            ].map(m => (
              <Pressable
                key={m.id}
                onPress={() => setMode(m.id)}
                style={[s.toggleTab, mode === m.id && s.toggleTabOn]}
              >
                <Text style={[s.toggleText, mode === m.id && s.toggleTextOn]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>

          <FilePicker
            label="Encrypted File"
            placeholder="Select .enc file to decrypt"
            value={inputFile?.name}
            onPress={pickInput}
            icon="🔒"
            accent={colors.emerald}
          />

          {mode === MODE_KEY ? (
            <FilePicker
              label="Key File (.key)"
              placeholder="Select your key file"
              value={keyFile?.name}
              onPress={pickKey}
              icon="🗝️"
              accent={colors.emerald}
            />
          ) : (
            <PasswordInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter decryption password"
              accent={colors.emerald}
            />
          )}

          <Text style={s.fieldLabel}>OUTPUT FILE NAME</Text>
          <View style={s.fieldWrap}>
            <Text style={s.fieldPrefix}>💾</Text>
            <TextInput
              style={s.fieldInput}
              value={outName}
              onChangeText={setOutName}
              placeholder="e.g. document.pdf"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Pressable
            onPress={handleDecrypt}
            disabled={loading}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient
              colors={gradients.btnGreen}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[s.btn, shadows.green]}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={s.btnText}>🔓  Decrypt File</Text>
              )}
            </LinearGradient>
          </Pressable>

          {outputBytes && !loading && (
            <Pressable
              onPress={share}
              style={[s.outlineBtn, { borderColor: colors.emerald }]}
            >
              <Text style={[s.outlineBtnText, { color: colors.emerald }]}>
                {Platform.OS === 'web' ? '⬇️  Download Decrypted File' : '📤  Save / Share Decrypted File'}
              </Text>
            </Pressable>
          )}

          <View style={s.infoPanel}>
            <LinearGradient colors={gradients.subtleGreen} style={s.infoPanelGrad}>
              <Text style={s.infoPanelTitle}>
                {mode === MODE_KEY ? '🗝️ Key-file mode' : '🔐 Password mode'}
              </Text>
              <Text style={s.infoPanelText}>
                {mode === MODE_KEY
                  ? 'Uses the same .key file that encrypted the data. HMAC-SHA256 verifies authenticity before any decryption takes place.'
                  : 'Re-derives the AES key from your password using PBKDF2. The 16-byte salt is embedded in the file — no need to store it separately.'}
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
        actionLabel={Platform.OS === 'web' ? '⬇️ Download Decrypted File' : '📤 Save Decrypted File'}
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
      color: 'rgba(255,255,255,0.78)', textAlign: 'center',
      lineHeight: rs(20), marginBottom: rs(18),
    },
    hmacBadge: {
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderRadius: radius.full,
      paddingHorizontal: rs(14), paddingVertical: rs(6),
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    },
    hmacText: {
      fontFamily: fonts.bodyMed, fontSize: fontSize.xs, color: colors.white, letterSpacing: 0.3,
    },

    body: { paddingTop: rs(4) },
    bodyTablet:  { maxWidth: 640, alignSelf: 'center', width: '100%' },
    bodyDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },
    headerInner: { alignItems: 'center' },

    /* Desktop compact header */
    desktopHeader: {
      height: 80,
      overflow: 'hidden',
      position: 'relative',
      justifyContent: 'center',
      flexShrink: 0,
    },
    desktopHeaderOrb: {
      position: 'absolute',
      width: 200, height: 200, borderRadius: 100,
      backgroundColor: 'rgba(255,255,255,0.06)',
      top: -80, right: -40,
    },
    desktopHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 28,
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
    desktopHmacBadge: {
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderRadius: 99,
      paddingHorizontal: 12, paddingVertical: 6,
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
      flexShrink: 0,
    },
    desktopHmacText: {
      fontFamily: fonts.bodyMed, fontSize: 11, color: colors.white, letterSpacing: 0.2,
    },

    toggle: {
      flexDirection: 'row', backgroundColor: colors.bg2,
      borderRadius: radius.md, padding: rs(4),
      marginBottom: rs(20), borderWidth: 1, borderColor: colors.border,
    },
    toggleTab: { flex: 1, paddingVertical: rs(10), borderRadius: radius.sm, alignItems: 'center' },
    toggleTabOn: { backgroundColor: colors.emeraldDark },
    toggleText: { fontFamily: fonts.bodyMed, fontSize: fontSize.sm, color: colors.textMuted },
    toggleTextOn: { color: colors.white },

    fieldLabel: {
      fontFamily: fonts.bodySemi, fontSize: fontSize.xs, color: colors.textSub,
      letterSpacing: 1, textTransform: 'uppercase', marginBottom: rs(8),
    },
    fieldWrap: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.glass, borderWidth: 1.5, borderColor: colors.border,
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
      borderWidth: 1.5, backgroundColor: 'rgba(52,211,153,0.08)',
    },
    outlineBtnText: { fontFamily: fonts.bodyMed, fontSize: fontSize.base },

    infoPanel: {
      borderRadius: radius.xl, overflow: 'hidden',
      borderWidth: 1, borderColor: colors.emerald + '30',
    },
    infoPanelGrad: { padding: rs(18) },
    infoPanelTitle: {
      fontFamily: fonts.bodySemi, fontSize: fontSize.base,
      color: colors.emerald, marginBottom: rs(8),
    },
    infoPanelText: {
      fontFamily: fonts.body, fontSize: fontSize.sm,
      color: colors.textSub, lineHeight: rs(20),
    },
  };
}
