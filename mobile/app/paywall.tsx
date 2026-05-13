import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { Background } from '../src/components/Background';
import { GlassCard } from '../src/components/GlassCard';
import { GradientButton } from '../src/components/GradientButton';
import { PressableScale } from '../src/components/PressableScale';
import { usePrice } from '../src/hooks/usePrice';
import { createCheckout } from '../src/api';
import { Colors, Typography, Spacing, Radius, Gradients } from '../src/theme';

const PERKS = [
  { icon: 'infinite', label: 'Unlimited AI question generation' },
  { icon: 'analytics', label: 'AI grading on every answer' },
  { icon: 'library', label: 'IB 400 full progress tracking' },
  { icon: 'mic', label: 'Mock interview mode' },
  { icon: 'time', label: 'Practice history & search' },
  { icon: 'stats-chart', label: 'Stats, streaks & trends' },
  { icon: 'timer', label: 'Practice timer' },
  { icon: 'sparkles', label: 'Custom focus prompts' },
  { icon: 'bulb', label: 'Roadmap voting' },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const price = usePrice();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!isSignedIn) {
      // Dismiss the paywall modal before routing to sign-in so the
      // paywall doesn't sit behind the auth screen after a successful login.
      try { (router as any).dismiss?.(); } catch {}
      router.push('/(auth)/sign-in');
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) { router.push('/(auth)/sign-in'); return; }
      const url = await createCheckout(token);
      if (url) {
        const { openBrowserAsync } = await import('expo-web-browser');
        await openBrowserAsync(url);
      }
    } finally { setLoading(false); }
  }

  return (
    <Background variant="hero">
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.closeRow}>
            <PressableScale onPress={() => router.back()} haptic="selection" containerStyle={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.text} />
            </PressableScale>
          </View>

          <Animated.View entering={FadeIn.duration(500)} style={styles.heroBlock}>
            <LinearGradient
              colors={Gradients.gold as any}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.crownBg}
            >
              <Ionicons name="diamond" size={36} color="#1a1408" />
            </LinearGradient>
            <Text style={styles.eyebrow}>FITE PREMIUM</Text>
            <Text style={styles.title}>Drill until you{'\n'}can't miss.</Text>
            <Text style={styles.subtitle}>
              Everything Fite offers, unlocked. Cancel anytime.
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceBig}>{price.split('/')[0]}</Text>
              <Text style={styles.priceUnit}>/{price.split('/')[1] ?? 'month'}</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(140)}>
            <GlassCard accent="gold" glow padding={20} animate={false}>
              {PERKS.map((p, i) => (
                <Animated.View
                  key={p.label}
                  entering={FadeInUp.duration(300).delay(200 + i * 50)}
                  style={styles.perkRow}
                >
                  <View style={styles.perkIcon}>
                    <Ionicons name={p.icon as any} size={15} color={Colors.gold} />
                  </View>
                  <Text style={styles.perkText}>{p.label}</Text>
                </Animated.View>
              ))}
            </GlassCard>
          </Animated.View>

          <View style={styles.ctaBlock}>
            <GradientButton
              label={isSignedIn ? `Upgrade for ${price}` : 'Sign in to upgrade'}
              icon="rocket"
              variant="gold"
              size="lg"
              fullWidth
              onPress={handleUpgrade}
              loading={loading}
            />
            <Text style={styles.terms}>Cancel anytime · Secure Stripe checkout · No hidden fees</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 60 },
  closeRow: { paddingTop: Spacing.sm, alignItems: 'flex-end' },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderLight,
  },

  heroBlock: { alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.xl },
  crownBg: {
    width: 76, height: 76, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.base,
    shadowColor: Colors.gold, shadowOpacity: 0.8, shadowRadius: 24, shadowOffset: { width: 0, height: 0 },
  },
  eyebrow: { color: Colors.gold, fontFamily: Typography.fonts.displayExtra, fontSize: 11, fontWeight: '800', letterSpacing: 3, marginBottom: 6 },
  title: { color: Colors.text, fontFamily: Typography.fonts.displayExtra, fontSize: 38, fontWeight: '800', letterSpacing: -1.2, textAlign: 'center', lineHeight: 42 },
  subtitle: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, lineHeight: 20, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: Spacing.lg },
  priceBig: { color: Colors.gold, fontFamily: Typography.fonts.displayExtra, fontSize: 48, fontWeight: '800', letterSpacing: -2, lineHeight: 50 },
  priceUnit: { color: Colors.textMuted, fontFamily: Typography.fonts.sansBold, fontSize: Typography.sizes.base, fontWeight: '700', marginBottom: 8, marginLeft: 4 },

  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 11 },
  perkIcon: {
    width: 28, height: 28, borderRadius: 9,
    backgroundColor: 'rgba(201,168,76,0.13)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  perkText: { color: Colors.text, fontFamily: Typography.fonts.sansMedium, fontSize: Typography.sizes.sm, flex: 1 },

  ctaBlock: { marginTop: Spacing.xl, gap: 12, alignItems: 'center' },
  terms: { color: Colors.textFaint, fontFamily: Typography.fonts.sans, fontSize: 11, textAlign: 'center' },
});
