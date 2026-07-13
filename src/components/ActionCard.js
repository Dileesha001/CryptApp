// ActionCard.js – Premium responsive gradient card
import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, fontSize, radius, shadows, spacing, rs } from '../theme';

export default function ActionCard({ title, subtitle, icon, gradient, onPress, style }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const scale   = useRef(new Animated.Value(1)).current;
  const glow    = useRef(new Animated.Value(0)).current;

  const onPressIn  = () => Animated.parallel([
    Animated.spring(scale, { toValue: 0.965, useNativeDriver: true, tension: 200, friction: 10 }),
    Animated.timing(glow,  { toValue: 1, duration: 120, useNativeDriver: true }),
  ]).start();

  const onPressOut = () => Animated.parallel([
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
    Animated.timing(glow,  { toValue: 0, duration: 200, useNativeDriver: true }),
  ]).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={style}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, isWide && styles.cardWide]}
        >
          {/* Noise texture overlay */}
          <Animated.View style={[styles.glowOverlay, { opacity: glow }]} />

          {/* Decorative arc */}
          <View style={styles.arc} />

          <View style={styles.row}>
            {/* Icon */}
            <View style={styles.iconWrap}>
              <Text style={styles.iconText}>{icon}</Text>
            </View>

            {/* Text block */}
            <View style={styles.textBlock}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
            </View>

            {/* Arrow */}
            <View style={styles.arrowWrap}>
              <Text style={styles.arrow}>›</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: rs(20),
    overflow: 'hidden',
    ...shadows.md,
  },
  cardWide: {
    padding: rs(24),
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.xl,
  },
  arc: {
    position: 'absolute',
    width: rs(180),
    height: rs(180),
    borderRadius: rs(90),
    borderWidth: rs(40),
    borderColor: 'rgba(255,255,255,0.07)',
    top: -rs(60),
    right: -rs(60),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(14),
  },
  iconWrap: {
    width: rs(52),
    height: rs(52),
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: rs(26),
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    color: colors.white,
    marginBottom: rs(4),
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: rs(18),
  },
  arrowWrap: {
    width: rs(32),
    height: rs(32),
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  arrow: {
    color: colors.white,
    fontSize: rs(22),
    fontFamily: fonts.heading,
    lineHeight: rs(24),
    marginTop: -rs(2),
  },
});
