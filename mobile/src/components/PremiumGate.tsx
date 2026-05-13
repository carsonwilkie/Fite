import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@clerk/clerk-expo';
import { Colors, Typography, Spacing, Gradients } from '../theme';
import { GlassCard } from './GlassCard';
import { GradientButton } from './GradientButton';

interface Props {
  message?: string;
  perks?: string[];
}

const DEFAULT_PERKS = [
  'Unlimited AI question generation',
  'AI grading on every answer',
  'Full IB 400 progress tracking',
  'Mock interview mode + debriefs',
  'Practice history, stats & timer',
];

export function PremiumGate({
  message = 'Unlock the full Fite experience.',
  perks = DEFAULT_PERKS,
}: Props) {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <GlassCard accent="gold" glow padding={28} animate={false}>
          <View style={styles.iconWrap}>
            <LinearGradient
              colors={Gradients.gold as any}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.iconBg}
            >
              <Ionicons name="diamond" size={26} color="#1a1408" />
            </LinearGradient>
          </View>
          <Text style={styles.eyebrow}>FITE PREMIUM</Text>
          <Text style={styles.title}>Go further. Faster.</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.perks}>
            {perks.map((p, i) => (
              <View key={i} style={styles.perkRow}>
                <View style={styles.checkDot}>
                  <Ionicons name="checkmark" size={11} color={Colors.gold} />
                </View>
                <Text style={styles.perkText}>{p}</Text>
              </View>
            ))}
          </View>

          <GradientButton
            label={isSignedIn ? 'Upgrade to Premium' : 'Sign in to upgrade'}
            icon="rocket"
            variant="gold"
            size="lg"
            fullWidth
            onPress={() => router.push(isSignedIn ? '/paywall' : '/(auth)/sign-in')}
          />
        </GlassCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: Spacing.lg },
  iconWrap: { alignItems: 'center', marginBottom: Spacing.md },
  iconBg: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.gold, shadowOpacity: 0.7, shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  eyebrow: {
    color: Colors.gold, fontFamily: Typography.fonts.displayExtra,
    fontSize: 10, fontWeight: '800', letterSpacing: 2.4, textAlign: 'center',
  },
  title: {
    color: Colors.text, fontFamily: Typography.fonts.displayExtra,
    fontSize: 28, fontWeight: '800', letterSpacing: -0.8, textAlign: 'center', marginTop: 6,
  },
  message: {
    color: Colors.textMuted, fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm, textAlign: 'center',
    lineHeight: 20, marginTop: Spacing.sm,
  },
  perks: { marginTop: Spacing.lg, marginBottom: Spacing.lg, gap: 10 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  perkText: { color: Colors.text, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, flex: 1 },
});
