import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert, Pressable } from 'react-native';
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
import { usePaidStatus } from '../src/hooks/usePaidStatus';
import { createCheckout } from '../src/api';
import {
  isRcSupported,
  getPremiumPackage,
  purchasePremium,
  restorePurchases,
  PREMIUM_ENTITLEMENT,
} from '../src/revenuecat';
import type { PurchasesPackage } from 'react-native-purchases';
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
  const webPrice = usePrice();
  const { refresh: refreshPaid } = usePaidStatus();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // On iOS, fetch the StoreKit-backed package so we can show Apple's
  // localized price and run the native purchase flow.
  const [iapPackage, setIapPackage] = useState<PurchasesPackage | null>(null);
  const useIap = Platform.OS === 'ios' && isRcSupported();

  useEffect(() => {
    if (!useIap) return;
    let cancelled = false;
    (async () => {
      const result = await getPremiumPackage();
      if (!cancelled && result) setIapPackage(result.package);
    })();
    return () => { cancelled = true; };
  }, [useIap]);

  // Resolve a single display price string. RC gives us the App Store's localized
  // price (e.g. "$3.99"), which we trust over the Stripe price on iOS.
  const iapPriceString = iapPackage?.product.priceString ?? null;
  const displayPrice = iapPriceString
    ? `${iapPriceString}/month`
    : webPrice;

  async function handleUpgrade() {
    if (!isSignedIn) {
      try { (router as any).dismiss?.(); } catch {}
      router.push('/(auth)/sign-in');
      return;
    }

    setLoading(true);
    try {
      if (useIap) {
        if (!iapPackage) {
          Alert.alert('Unavailable', 'Could not load subscription details. Please try again.');
          return;
        }
        const outcome = await purchasePremium(iapPackage);
        if (outcome.kind === 'cancelled') return;
        if (outcome.kind === 'error') {
          Alert.alert('Purchase failed', outcome.message);
          return;
        }
        // Success — refresh paid status (both RC and backend) and dismiss.
        const entitled =
          outcome.customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;
        if (entitled) {
          await refreshPaid();
          try { (router as any).dismiss?.(); } catch { router.back(); }
        }
        return;
      }

      // Non-iOS: keep the existing Stripe checkout flow.
      const token = await getToken();
      if (!token) { router.push('/(auth)/sign-in'); return; }
      const url = await createCheckout(token);
      if (url) {
        const { openBrowserAsync } = await import('expo-web-browser');
        await openBrowserAsync(url);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    if (!useIap) return;
    setRestoring(true);
    try {
      const outcome = await restorePurchases();
      if (outcome.kind === 'error') {
        Alert.alert('Restore failed', outcome.message);
        return;
      }
      const entitled =
        outcome.kind === 'success' &&
        outcome.customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;
      if (entitled) {
        await refreshPaid();
        Alert.alert('Restored', 'Your premium subscription has been restored.');
        try { (router as any).dismiss?.(); } catch { router.back(); }
      } else {
        Alert.alert('Nothing to restore', 'No active subscription found for this Apple ID.');
      }
    } finally {
      setRestoring(false);
    }
  }

  async function openExternal(url: string) {
    const { openBrowserAsync } = await import('expo-web-browser');
    await openBrowserAsync(url);
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
              <Text style={styles.priceBig}>{displayPrice.split('/')[0]}</Text>
              <Text style={styles.priceUnit}>/{displayPrice.split('/')[1] ?? 'month'}</Text>
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
              label={
                !isSignedIn
                  ? 'Sign in to upgrade'
                  : useIap && !iapPackage
                  ? 'Loading…'
                  : `Upgrade for ${displayPrice}`
              }
              icon="rocket"
              variant="gold"
              size="lg"
              fullWidth
              onPress={handleUpgrade}
              loading={loading}
            />

            {useIap && (
              <Pressable
                onPress={handleRestore}
                disabled={restoring}
                style={styles.restoreBtn}
                hitSlop={10}
              >
                <Text style={styles.restoreText}>
                  {restoring ? 'Restoring…' : 'Restore Purchases'}
                </Text>
              </Pressable>
            )}

            {useIap ? (
              <Text style={styles.legalCopy}>
                Fite Premium is a {displayPrice.replace('/', ' / ')} auto-renewing
                subscription. Payment will be charged to your Apple ID at confirmation
                of purchase. Your subscription automatically renews unless auto-renew
                is turned off at least 24 hours before the end of the current period.
                You can manage and cancel subscriptions in your App Store account
                settings after purchase.
              </Text>
            ) : (
              <Text style={styles.terms}>Cancel anytime · Secure Stripe checkout · No hidden fees</Text>
            )}

            <View style={styles.legalLinks}>
              <Pressable onPress={() => openExternal('https://fitefinance.com/terms')} hitSlop={8}>
                <Text style={styles.legalLink}>Terms of Use</Text>
              </Pressable>
              <Text style={styles.legalSep}>·</Text>
              <Pressable onPress={() => openExternal('https://fitefinance.com/privacy')} hitSlop={8}>
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </Pressable>
            </View>
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

  restoreBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  restoreText: {
    color: Colors.secondary, fontFamily: Typography.fonts.sansSemibold,
    fontSize: Typography.sizes.sm, textDecorationLine: 'underline',
  },
  legalCopy: {
    color: Colors.textFaint, fontFamily: Typography.fonts.sans,
    fontSize: 11, lineHeight: 16, textAlign: 'center',
    marginTop: 4, paddingHorizontal: 8,
  },
  legalLinks: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 4,
  },
  legalLink: {
    color: Colors.textMuted, fontFamily: Typography.fonts.sansSemibold,
    fontSize: 11, textDecorationLine: 'underline',
  },
  legalSep: { color: Colors.textFaint, fontSize: 11 },
});
