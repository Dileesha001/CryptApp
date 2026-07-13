// FilePicker.js – Premium responsive file selection row
import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, radius, spacing, rs } from '../theme';

export default function FilePicker({
  label,
  placeholder = 'Tap to select',
  value,
  onPress,
  icon = '📄',
  accent = colors.primary,
  error,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const has   = Boolean(value);

  const onIn  = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, tension: 300, friction: 12 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 200, friction: 10 }).start();

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut}>
        <Animated.View
          style={[
            styles.row,
            { borderColor: error ? colors.red : has ? accent : colors.border },
            { transform: [{ scale }] },
          ]}
        >
          {/* Icon badge */}
          <View style={[styles.badge, { backgroundColor: has ? accent + '28' : colors.glass }]}>
            <Text style={styles.badgeIcon}>{has ? '✓' : icon}</Text>
          </View>

          {/* Text */}
          <View style={styles.textWrap}>
            {has ? (
              <>
                <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1} ellipsizeMode="middle">
                  {value}
                </Text>
                <Text style={[styles.hint, { color: accent }]}>Tap to change file</Text>
              </>
            ) : (
              <Text style={styles.placeholder}>{placeholder}</Text>
            )}
          </View>

          {/* Chevron */}
          <Text style={[styles.chevron, { color: has ? accent : colors.textMuted }]}>›</Text>
        </Animated.View>
      </Pressable>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: rs(14),
    gap: rs(12),
  },
  badge: {
    width: rs(44),
    height: rs(44),
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeIcon: { fontSize: rs(20) },
  textWrap: { flex: 1 },
  fileName: {
    fontFamily: fonts.bodyMed,
    fontSize: fontSize.base,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    marginTop: rs(2),
  },
  placeholder: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  chevron: {
    fontSize: rs(24),
    fontFamily: fonts.heading,
    lineHeight: rs(26),
    flexShrink: 0,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.red,
    marginTop: rs(6),
  },
});
