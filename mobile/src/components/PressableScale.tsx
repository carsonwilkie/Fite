import React, { useCallback } from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface Props extends Omit<PressableProps, 'style' | 'children'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: 'light' | 'medium' | 'heavy' | 'selection' | 'none';
  /** Layout/visual style applied to the actual interactive element. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Deprecated — kept for API compat. Glow halo was removed. */
  glowColor?: string;
  noGlow?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  children,
  style,
  scaleTo = 0.96,
  haptic = 'light',
  containerStyle,
  onPress,
  disabled,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(scaleTo, { damping: 18, stiffness: 320, mass: 0.6 });
  }, [scale, scaleTo]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 240, mass: 0.7 });
  }, [scale]);

  const handlePress = useCallback(
    (e: any) => {
      if (disabled) return;
      if (haptic !== 'none' && Platform.OS !== 'web') {
        const map = {
          light: Haptics.ImpactFeedbackStyle.Light,
          medium: Haptics.ImpactFeedbackStyle.Medium,
          heavy: Haptics.ImpactFeedbackStyle.Heavy,
        } as const;
        if (haptic === 'selection') {
          Haptics.selectionAsync().catch(() => {});
        } else {
          Haptics.impactAsync(map[haptic]).catch(() => {});
        }
      }
      onPress?.(e);
    },
    [haptic, onPress, disabled]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.55 : 1,
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[containerStyle, animatedStyle, style as any]}
    >
      {children}
    </AnimatedPressable>
  );
}
