import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../theme';

interface Props {
  children: React.ReactNode;
  variant?: 'flat' | 'hero' | 'deep';
  style?: StyleProp<ViewStyle>;
}

/**
 * Ambient app background. Provides a subtle vertical gradient and two
 * blurred color "glows" reminiscent of the website hero.
 */
export function Background({ children, variant = 'flat', style }: Props) {
  const gradient = variant === 'hero' ? Gradients.hero : variant === 'deep' ? Gradients.heroDeep : Gradients.hero;
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={gradient as any}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {/* Top-right cyan glow */}
      <View pointerEvents="none" style={[styles.blob, styles.blobCyan]} />
      {/* Bottom-left gold glow (subtle) */}
      <View pointerEvents="none" style={[styles.blob, styles.blobGold]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  blob: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 360,
    opacity: 0.16,
  },
  blobCyan: {
    backgroundColor: Colors.secondary,
    top: -180,
    right: -120,
    shadowColor: Colors.secondary,
    shadowOpacity: 0.5,
    shadowRadius: 100,
  },
  blobGold: {
    backgroundColor: Colors.gold,
    bottom: -220,
    left: -160,
    opacity: 0.08,
  },
});
