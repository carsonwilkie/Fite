import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Shadows } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glow?: boolean;
  gold?: boolean;
  noPad?: boolean;
}

export function Card({ children, style, glow, gold, noPad }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        glow && styles.glow,
        gold && styles.gold,
        noPad && styles.noPad,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    ...Shadows.card,
  },
  glow: {
    borderColor: Colors.secondary,
    ...Shadows.glow,
  },
  gold: {
    borderColor: Colors.gold,
    ...Shadows.goldGlow,
  },
  noPad: {
    padding: 0,
  },
});
