// PasswordInput.js – Premium secure text field
import React, { useState, useRef } from 'react';
import { Animated, Platform, Pressable, Text, TextInput, View } from 'react-native';
import useTheme from '../hooks/useTheme';

export default function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder = 'Enter password',
  error,
  accent,
}) {
  const { colors, fonts, fontSize, radius, spacing, rs } = useTheme();
  const accentColor = accent || colors.primary;

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
    outputRange: [error ? colors.red : colors.border, error ? colors.red : accentColor],
  });

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && (
        <Text style={{
          fontFamily: fonts.bodySemi,
          fontSize: fontSize.xs,
          color: colors.textSub,
          letterSpacing: 0.9,
          textTransform: 'uppercase',
          marginBottom: rs(8),
        }}>
          {label}
        </Text>
      )}
      <Animated.View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glass,
        borderWidth: 1.5,
        borderRadius: radius.md,
        paddingHorizontal: rs(14),
        gap: rs(10),
        borderColor,
      }}>
        <Text style={{ fontSize: rs(16) }}>🔑</Text>

        <TextInput
          style={{
            flex: 1,
            fontFamily: fonts.mono,
            fontSize: fontSize.base,
            color: colors.text,
            paddingVertical: rs(14),
            letterSpacing: 0.5,
            ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
          }}
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

        <Pressable onPress={() => setVisible(v => !v)} hitSlop={12} style={{ paddingVertical: rs(8) }}>
          <Text style={{ fontSize: rs(18) }}>{visible ? '🙈' : '👁️'}</Text>
        </Pressable>
      </Animated.View>
      {error ? (
        <Text style={{
          fontFamily: fonts.body, fontSize: fontSize.xs,
          color: colors.red, marginTop: rs(6),
        }}>{error}</Text>
      ) : null}
    </View>
  );
}
