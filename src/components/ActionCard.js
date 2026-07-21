// ActionCard.js – Premium responsive gradient card
import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '../hooks/useTheme';

export default function ActionCard({ title, subtitle, icon, gradient, onPress, style }) {
  const { colors, fonts, fontSize, radius, shadows, rs } = useTheme();

  const scale = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0)).current;

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
          style={{
            borderRadius: radius.xl,
            padding: rs(20),
            overflow: 'hidden',
            ...shadows.md,
          }}
        >
          {/* Glow overlay */}
          <Animated.View style={[
            StyleSheet.absoluteFill,
            { borderRadius: radius.xl, backgroundColor: 'rgba(255,255,255,0.10)', opacity: glow },
          ]} />

          {/* Decorative arc */}
          <View style={{
            position: 'absolute',
            width: rs(180), height: rs(180), borderRadius: rs(90),
            borderWidth: rs(36), borderColor: 'rgba(255,255,255,0.07)',
            top: -rs(56), right: -rs(56),
          }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(14) }}>
            {/* Icon */}
            <View style={{
              width: rs(50), height: rs(50), borderRadius: radius.lg,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Text style={{ fontSize: rs(24) }}>{icon}</Text>
            </View>

            {/* Text block */}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{
                fontFamily: fonts.heading,
                fontSize: fontSize.lg,
                color: colors.white,
                marginBottom: rs(4),
                letterSpacing: -0.3,
              }}>
                {title}
              </Text>
              <Text style={{
                fontFamily: fonts.body,
                fontSize: fontSize.sm,
                color: 'rgba(255,255,255,0.75)',
                lineHeight: rs(18),
              }} numberOfLines={2}>
                {subtitle}
              </Text>
            </View>

            {/* Arrow */}
            <View style={{
              width: rs(30), height: rs(30), borderRadius: radius.full,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Text style={{
                color: colors.white, fontSize: rs(20),
                fontFamily: fonts.heading, lineHeight: rs(22), marginTop: -rs(2),
              }}>›</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}
