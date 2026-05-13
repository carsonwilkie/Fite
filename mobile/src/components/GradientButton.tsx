import React from 'react';
import { Text, View, StyleSheet, StyleProp, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Gradients, Radius, Spacing, Typography, Shadows } from '../theme';
import { PressableScale } from './PressableScale';

type Variant = 'primary' | 'gold' | 'ghost' | 'danger' | 'success' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  haptic?: 'light' | 'medium' | 'heavy' | 'selection' | 'none';
}

export function GradientButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  fullWidth,
  icon,
  iconRight,
  style,
  textStyle,
  haptic = 'medium',
}: Props) {
  const sizeStyles = SIZE[size];
  const gradient = GRADIENTS[variant];
  const showGradient = variant !== 'ghost' && variant !== 'outline';

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      haptic={haptic}
      containerStyle={[
        styles.outer,
        fullWidth && { alignSelf: 'stretch' },
        style as any,
      ]}
    >
      {showGradient ? (
        <LinearGradient
          colors={gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.inner,
            sizeStyles.container,
            variant === 'gold' && Shadows.goldGlow,
            variant === 'primary' && Shadows.glow,
            variant === 'success' && Shadows.successGlow,
          ]}
        >
          <ButtonContent
            label={label}
            icon={icon}
            iconRight={iconRight}
            loading={loading}
            size={size}
            color={variant === 'gold' ? '#1a1408' : Colors.textBright}
            textStyle={textStyle}
          />
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.inner,
            sizeStyles.container,
            variant === 'outline' && styles.outline,
            variant === 'ghost' && styles.ghost,
          ]}
        >
          <ButtonContent
            label={label}
            icon={icon}
            iconRight={iconRight}
            loading={loading}
            size={size}
            color={variant === 'outline' ? Colors.secondary : Colors.text}
            textStyle={textStyle}
          />
        </View>
      )}
    </PressableScale>
  );
}

function ButtonContent({
  label,
  icon,
  iconRight,
  loading,
  size,
  color,
  textStyle,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  size: Size;
  color: string;
  textStyle?: StyleProp<TextStyle>;
}) {
  if (loading) return <ActivityIndicator color={color} />;
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 17 : 20;
  return (
    <View style={styles.content}>
      {icon && <Ionicons name={icon} size={iconSize} color={color} style={styles.iconLeft} />}
      <Text style={[styles.text, SIZE[size].text, { color }, textStyle]}>{label}</Text>
      {iconRight && (
        <Ionicons name={iconRight} size={iconSize} color={color} style={styles.iconRight} />
      )}
    </View>
  );
}

const GRADIENTS: Record<Variant, readonly string[]> = {
  primary: Gradients.cyan,
  gold: Gradients.gold,
  danger: Gradients.danger,
  success: Gradients.success,
  ghost: ['transparent', 'transparent'],
  outline: ['transparent', 'transparent'],
};

const SIZE = {
  sm: {
    container: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: Radius.md, minHeight: 36 },
    text: { fontSize: Typography.sizes.sm },
  },
  md: {
    container: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: Radius.lg, minHeight: 46 },
    text: { fontSize: Typography.sizes.base },
  },
  lg: {
    container: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: Radius.lg, minHeight: 56 },
    text: { fontSize: Typography.sizes.md },
  },
} as const;

const styles = StyleSheet.create({
  outer: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  text: {
    fontFamily: Typography.fonts.sansBold,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  iconLeft: { marginRight: Spacing.sm },
  iconRight: { marginLeft: Spacing.sm },
  outline: {
    borderWidth: 1,
    borderColor: Colors.secondary,
    backgroundColor: Colors.cyanGlow,
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
