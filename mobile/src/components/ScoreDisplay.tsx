import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface ScoreDisplayProps {
  score: number;
  size?: 'sm' | 'lg';
}

function getScoreColor(score: number): string {
  if (score >= 8) return Colors.success;
  if (score >= 6) return Colors.secondary;
  if (score >= 4) return Colors.warning;
  return Colors.error;
}

function getScoreLabel(score: number): string {
  if (score >= 9) return 'Excellent';
  if (score >= 7) return 'Strong';
  if (score >= 5) return 'Decent';
  if (score >= 3) return 'Weak';
  return 'Poor';
}

export function ScoreDisplay({ score, size = 'lg' }: ScoreDisplayProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  if (size === 'sm') {
    return (
      <View style={[styles.badgeSm, { borderColor: color, backgroundColor: color + '22' }]}>
        <Text style={[styles.scoreSm, { color }]}>{score}/10</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { borderColor: color }]}>
        <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
        <Text style={[styles.outOf, { color: Colors.textMuted }]}>/10</Text>
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.surface,
  },
  scoreNumber: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  outOf: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginTop: 6,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgeSm: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  scoreSm: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});
