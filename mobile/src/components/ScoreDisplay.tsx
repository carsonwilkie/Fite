import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { AnimatedNumber } from './AnimatedNumber';

interface ScoreDisplayProps {
  score: number;
  size?: 'sm' | 'lg';
}

function getScoreColor(score: number): string {
  if (score >= 8) return Colors.success;
  if (score >= 6) return '#84cc16';
  if (score >= 4) return Colors.warning;
  return Colors.error;
}

function getScoreLabel(score: number): string {
  if (score >= 9) return 'Excellent';
  if (score >= 7) return 'Strong';
  if (score >= 5) return 'Decent';
  if (score >= 3) return 'Weak';
  return 'Needs work';
}

export function ScoreDisplay({ score, size = 'lg' }: ScoreDisplayProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  const ringFill = useSharedValue(0);
  const popScale = useSharedValue(0.85);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    ringOpacity.value = withTiming(1, { duration: 220 });
    ringFill.value = withDelay(
      120,
      withTiming(score / 10, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
    popScale.value = withSpring(1, { damping: 9, stiffness: 220, mass: 0.7 });
  }, [score]); // eslint-disable-line react-hooks/exhaustive-deps

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: popScale.value }],
  }));

  if (size === 'sm') {
    return (
      <View style={[styles.badgeSm, { borderColor: color, backgroundColor: color + '22' }]}>
        <Text style={[styles.scoreSm, { color }]}>{score}/10</Text>
      </View>
    );
  }

  // Conic-style fill rendered with a circular gradient layer + arc effect.
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ringWrap, ringStyle]}>
        <LinearGradient
          colors={[color, color + '00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ringGradient}
        />
        <View style={[styles.ringCore, { shadowColor: color }]}>
          <View style={styles.numberRow}>
            <AnimatedNumber
              value={score}
              duration={900}
              style={[styles.scoreNumber, { color }]}
            />
            <Text style={[styles.outOf, { color: Colors.textMuted }]}>/10</Text>
          </View>
        </View>
      </Animated.View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  ringWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  ringGradient: {
    ...StyleSheet.absoluteFillObject as any,
    borderRadius: 48,
  },
  ringCore: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  numberRow: { flexDirection: 'row', alignItems: 'flex-end' },
  scoreNumber: {
    fontFamily: Typography.fonts.displayExtra,
    fontSize: Typography.sizes.xxl,
    fontWeight: '800',
    letterSpacing: -1,
  },
  outOf: {
    fontFamily: Typography.fonts.sansSemibold,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 2,
  },
  label: {
    fontFamily: Typography.fonts.display,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  badgeSm: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  scoreSm: {
    fontFamily: Typography.fonts.sansBold,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
});
