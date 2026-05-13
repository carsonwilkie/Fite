import React, { useEffect } from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing, Typography } from '../theme';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
  /** Tint when active. Falls back to Colors.secondary. */
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  small?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const IDLE_BG = 'rgba(255,255,255,0.02)';
const IDLE_BORDER = Colors.border;
const IDLE_TEXT = Colors.textMuted;

export function Pill({ label, active, onPress, color, icon, small, disabled, style }: Props) {
  const tint = color ?? Colors.secondary;
  const activeBg = tint + '14';
  const activeBorder = tint;

  const activeAnim = useSharedValue(active ? 1 : 0);
  const pressAnim = useSharedValue(0);

  useEffect(() => {
    activeAnim.value = withTiming(active ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, activeAnim]);

  const handlePressIn = () => {
    pressAnim.value = withSpring(1, { damping: 16, stiffness: 320, mass: 0.55 });
  };
  const handlePressOut = () => {
    pressAnim.value = withTiming(0, { duration: 220 });
  };
  const handlePress = () => {
    if (!onPress || disabled) return;
    Haptics.selectionAsync().catch(() => {});
    onPress();
  };

  // Outer wrapper carries the native shadow glow — keeps overflow:hidden on the
  // inner pill from clipping it, and lets us animate shadowOpacity smoothly.
  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(
      activeAnim.value + pressAnim.value * 0.5,
      [0, 1.5],
      [0, 0.55],
      'clamp'
    ),
    shadowRadius: interpolate(activeAnim.value, [0, 1], [4, 7]),
    transform: [{ scale: 1 - pressAnim.value * 0.06 }],
  }));

  const pillStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(activeAnim.value, [0, 1], [IDLE_BG, activeBg]);
    const border = interpolateColor(activeAnim.value, [0, 1], [IDLE_BORDER, activeBorder]);
    return { backgroundColor: bg, borderColor: border };
  });

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(activeAnim.value, [0, 1], [IDLE_TEXT, tint]),
  }));

  return (
    <Animated.View
      style={[
        styles.glowWrap,
        { shadowColor: tint },
        glowStyle,
        style as any,
      ]}
    >
      <Animated.View style={[styles.pill, small && styles.pillSm, pillStyle]}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || !onPress}
          style={styles.pressable}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={small ? 12 : 14}
              color={active ? tint : Colors.textMuted}
              style={{ marginRight: 4 }}
            />
          )}
          <Animated.Text
            style={[
              styles.label,
              small && { fontSize: Typography.sizes.xxs },
              textStyle,
            ]}
          >
            {label}
          </Animated.Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glowWrap: {
    // shadowColor is set inline (per-tint). iOS renders a smooth radial glow.
    shadowOffset: { width: 0, height: 0 },
    elevation: 4, // Android fallback
  },
  pill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pillSm: {},
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  label: {
    fontFamily: Typography.fonts.displaySemibold,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
