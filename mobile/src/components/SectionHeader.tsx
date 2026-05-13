import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({ eyebrow, title, subtitle, right, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <View style={{ flex: 1 }}>
        {eyebrow && (
          <Text style={styles.eyebrow}>{eyebrow}</Text>
        )}
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.base,
  },
  eyebrow: {
    color: Colors.secondary,
    fontFamily: Typography.fonts.display,
    fontSize: Typography.sizes.xxs,
    fontWeight: '700',
    letterSpacing: Typography.letterSpacing.eyebrow,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    color: Colors.text,
    fontFamily: Typography.fonts.displayExtra,
    fontSize: Typography.sizes.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.textMuted,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    marginTop: 4,
    lineHeight: 19,
  },
});
