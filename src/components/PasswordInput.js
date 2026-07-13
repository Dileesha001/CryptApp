// PasswordInput.js – Premium secure text field
import React, { useState, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, fontSize, radius, spacing, rs } from '../theme';

export default function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder = 'Enter password',
  error,
  accent = colors.primary,
}) {
  const [visible,  setVisible]  = useState(false);
  const [focused,  setFocused]  = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [error ? colors.red : colors.border, error ? colors.red : accent],
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.inputRow, { borderColor }]}>
        {/* Lock icon */}
        <Text style={styles.lockIcon}>🔑</Text>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={onFocus}
          onBlur={onBlur}
        />

        <Pressable onPress={() => setVisible(v => !v)} hitSlop={12} style={styles.eyeBtn}>
          <Text style={styles.eyeIcon}>{visible ? '🙈' : '👁️'}</Text>
        </Pressable>
      </Animated.View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: colors.textSub,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: rs(8),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: rs(14),
    gap: rs(10),
  },
  lockIcon: { fontSize: rs(16) },
  input: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: fontSize.base,
    color: colors.text,
    paddingVertical: rs(14),
    letterSpacing: 0.5,
  },
  eyeBtn: { paddingVertical: rs(8) },
  eyeIcon: { fontSize: rs(18) },
  error: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.red,
    marginTop: rs(6),
  },
});
