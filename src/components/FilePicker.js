// FilePicker.js – Premium responsive file selection row
import React, { useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import useTheme from '../hooks/useTheme';

export default function FilePicker({
  label,
  placeholder = 'Tap to select',
  value,
  onPress,
  icon = '📄',
  accent,
  error,
}) {
  const { colors, fonts, fontSize, radius, spacing, rs } = useTheme();
  const accentColor = accent || colors.primary;
  const scale = useRef(new Animated.Value(1)).current;
  const has   = Boolean(value);

  const onIn  = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, tension: 300, friction: 12 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 200, friction: 10 }).start();

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
      <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut}>
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.glass,
              borderWidth: 1.5,
              borderRadius: radius.md,
              padding: rs(14),
              gap: rs(12),
              borderColor: error ? colors.red : has ? accentColor : colors.border,
            },
            { transform: [{ scale }] },
          ]}
        >
          {/* Icon badge */}
          <View style={{
            width: rs(44), height: rs(44), borderRadius: radius.sm,
            backgroundColor: has ? accentColor + '28' : colors.glass,
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Text style={{ fontSize: rs(20) }}>{has ? '✓' : icon}</Text>
          </View>

          {/* Text */}
          <View style={{ flex: 1, minWidth: 0 }}>
            {has ? (
              <>
                <Text style={{
                  fontFamily: fonts.bodyMed,
                  fontSize: fontSize.base,
                  color: colors.text,
                }} numberOfLines={1} ellipsizeMode="middle">
                  {value}
                </Text>
                <Text style={{
                  fontFamily: fonts.body,
                  fontSize: fontSize.xs,
                  color: accentColor,
                  marginTop: rs(2),
                }}>
                  Tap to change file
                </Text>
              </>
            ) : (
              <Text style={{
                fontFamily: fonts.body,
                fontSize: fontSize.base,
                color: colors.textMuted,
              }}>
                {placeholder}
              </Text>
            )}
          </View>

          {/* Chevron */}
          <Text style={{
            fontSize: rs(24), fontFamily: fonts.heading,
            lineHeight: rs(26), flexShrink: 0,
            color: has ? accentColor : colors.textMuted,
          }}>›</Text>
        </Animated.View>
      </Pressable>
      {error ? (
        <Text style={{
          fontFamily: fonts.body, fontSize: fontSize.xs,
          color: colors.red, marginTop: rs(6),
        }}>{error}</Text>
      ) : null}
    </View>
  );
}
