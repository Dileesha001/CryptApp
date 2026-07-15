// StatusModal.js – Premium animated modal: bottom-sheet on mobile, centered dialog on desktop
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, fontSize, gradients, radius, shadows, spacing, rs } from '../theme';

const CONFIGS = {
  success: {
    icon: '✅',
    label: 'Success',
    color: colors.emerald,
    dimColor: colors.emeraldDim,
    bg: ['#022C22', '#064E3B'],
    borderColor: colors.emerald + '35',
  },
  error: {
    icon: '⚠️',
    label: 'Error',
    color: colors.red,
    dimColor: colors.redDim,
    bg: ['#1C0505', '#3B0A0A'],
    borderColor: colors.red + '35',
  },
  loading: {
    icon: '⚙️',
    label: 'Working',
    color: colors.primary,
    dimColor: colors.primaryDim,
    bg: ['#06061A', '#0D0D2B'],
    borderColor: colors.primary + '35',
  },
};

export default function StatusModal({
  visible,
  type = 'success',
  title,
  message,
  onClose,
  onAction,
  actionLabel,
}) {
  const { width, height } = useWindowDimensions();
  const isWide = width >= 768;

  // On mobile: slide up from bottom. On desktop: fade + scale in from center.
  const slide = useRef(new Animated.Value(600)).current;
  const fade  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(isWide ? 0.92 : 1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slide, { toValue: 0,    tension: 65, friction: 11, useNativeDriver: true }),
        Animated.timing(fade,  { toValue: 1,    duration: 220, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1,    tension: 80, friction: 12, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slide, { toValue: 600, duration: 280, useNativeDriver: true }),
        Animated.timing(fade,  { toValue: 0,   duration: 220, useNativeDriver: true }),
        Animated.spring(scale, { toValue: isWide ? 0.92 : 1, tension: 80, friction: 12, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const cfg = CONFIGS[type] || CONFIGS.success;

  // Desktop: centered dialog; mobile: bottom-sheet
  const sheetWidth  = isWide ? Math.min(width * 0.5, 520) : width;
  const sheetRadius = isWide
    ? { borderRadius: radius.xxl }
    : { borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={type !== 'loading' ? onClose : undefined}
    >
      <Animated.View style={[
        styles.overlay,
        isWide ? styles.overlayCenter : styles.overlayBottom,
        { opacity: fade },
      ]}>
        {/* Backdrop dismiss */}
        {type !== 'loading' && (
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        )}

        <Animated.View style={[
          styles.sheetWrap,
          isWide && { width: sheetWidth, alignSelf: 'center', zIndex: 2 },
          {
            transform: [
              { translateY: isWide ? 0 : slide },
              { scale: isWide ? scale : 1 },
            ],
          },
        ]}>
          <LinearGradient
            colors={cfg.bg}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.sheet,
              sheetRadius,
              { borderWidth: 1, borderColor: cfg.borderColor },
            ]}
          >
            {/* Pill handle – mobile only */}
            {!isWide && <View style={styles.handle} />}

            {/* Icon circle */}
            <View style={[styles.iconCircle, { backgroundColor: cfg.dimColor }]}>
              <Text style={styles.iconText}>{cfg.icon}</Text>
            </View>

            {/* Badge */}
            <View style={[styles.typeBadge, { backgroundColor: cfg.color + '22', borderColor: cfg.color + '55' }]}>
              <Text style={[styles.typeBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>

            <Text style={[styles.title, { color: cfg.color }]}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {/* Actions */}
            <View style={styles.btnGroup}>
              {onAction && actionLabel && (
                <Pressable
                  onPress={onAction}
                  style={({ pressed }) => [
                    styles.btn, styles.btnPrimary,
                    { backgroundColor: cfg.color, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={styles.btnPrimaryText}>{actionLabel}</Text>
                </Pressable>
              )}
              {type !== 'loading' && (
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [styles.btn, styles.btnSecondary, { opacity: pressed ? 0.75 : 1 }]}
                >
                  <Text style={[styles.btnSecondaryText, { color: cfg.color }]}>
                    {onAction ? 'Dismiss' : 'Close'}
                  </Text>
                </Pressable>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  overlayBottom: {
    justifyContent: 'flex-end',
  },
  overlayCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: rs(24),
  },

  sheetWrap: {
    width: '100%',
  },
  sheet: {
    padding: rs(28),
    paddingBottom: rs(36),
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.md,
  },
  handle: {
    width: rs(40),
    height: rs(5),
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginBottom: rs(20),
  },
  iconCircle: {
    width: rs(80),
    height: rs(80),
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rs(14),
  },
  iconText: { fontSize: rs(38) },
  typeBadge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: rs(14),
    paddingVertical: rs(4),
    marginBottom: rs(12),
  },
  typeBadgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: rs(10),
  },
  message: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: rs(22),
    marginBottom: rs(24),
  },
  btnGroup: { width: '100%', gap: rs(10) },
  btn: {
    width: '100%',
    paddingVertical: rs(14),
    borderRadius: radius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  btnPrimary: {},
  btnPrimaryText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.base,
    color: colors.white,
  },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  btnSecondaryText: {
    fontFamily: fonts.bodyMed,
    fontSize: fontSize.base,
  },
});
