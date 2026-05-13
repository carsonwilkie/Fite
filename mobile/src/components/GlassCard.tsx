import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Gradients, Radius, Shadows } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Accent color for the gradient border. */
  accent?: 'cyan' | 'gold' | 'ghost' | 'none';
  /** Soft glow shadow under the card. */
  glow?: boolean;
  /** Use blur layer (iOS / Android Q+). Falls back to flat tint on web. */
  blur?: boolean;
  /** Inner padding. */
  padding?: number;
  /** Whether to animate entrance. */
  animate?: boolean;
  /** Animation delay in ms. */
  delay?: number;
}

export function GlassCard({
  children,
  style,
  accent = 'ghost',
  glow = false,
  blur = false,
  padding = 16,
  animate = true,
  delay = 0,
}: Props) {
  const borderGradient =
    accent === 'cyan'
      ? Gradients.borderCyan
      : accent === 'gold'
      ? Gradients.borderGold
      : accent === 'ghost'
      ? Gradients.borderGhost
      : null;

  const shadow = glow
    ? accent === 'gold'
      ? Shadows.goldGlow
      : Shadows.glow
    : Shadows.card;

  const Wrap = animate ? Animated.View : View;
  const wrapProps = animate
    ? { entering: FadeInDown.duration(400).delay(delay).springify().damping(20) }
    : {};

  const content = (
    <>
      <LinearGradient
        colors={Gradients.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {blur && Platform.OS !== 'web' && (
        <BlurView
          intensity={20}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
        />
      )}
      <View style={{ padding }}>{children}</View>
    </>
  );

  return (
    <Wrap {...(wrapProps as any)} style={[styles.outer, shadow, style]}>
      {borderGradient ? (
        <LinearGradient
          colors={borderGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.borderLayer}
        >
          <View style={styles.inner}>{content}</View>
        </LinearGradient>
      ) : (
        <View style={[styles.inner, { borderWidth: 0 }]}>{content}</View>
      )}
    </Wrap>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  borderLayer: {
    borderRadius: Radius.xl,
    padding: 1, // gradient border thickness
  },
  inner: {
    borderRadius: Radius.xl - 1,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
});
