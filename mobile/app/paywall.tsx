import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

import { Colors, Typography, Spacing, Radius } from '../src/theme';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { usePrice } from '../src/hooks/usePrice';
import { createCheckout } from '../src/api';

const FEATURES = [
  { icon: '∞', label: 'Unlimited question generation' },
  { icon: '🤖', label: 'AI grading & detailed feedback' },
  { icon: '📋', label: 'Full question history' },
  { icon: '📊', label: 'Performance stats & streaks' },
  { icon: '🎤', label: 'Mock interview mode' },
  { icon: '⏱', label: 'Practice timer' },
  { icon: '🎯', label: 'Custom focus descriptors' },
  { icon: '🗳️', label: 'Feature voting' },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const price = usePrice();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!isSignedIn) { router.push('/(auth)/sign-in'); return; }
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) { router.push('/(auth)/sign-in'); return; }
      const url = await createCheckout(token);
      if (url) {
        const { openBrowserAsync } = await import('expo-web-browser');
        await openBrowserAsync(url);
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.closeRow} onPress={() => router.back()}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.crown}>👑</Text>
        <Text style={styles.title}>Fite Premium</Text>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.subtitle}>Everything you need to ace your finance interviews.</Text>

        <Card gold style={styles.featuresCard}>
          {FEATURES.map(f => (
            <View key={f.label} style={styles.feature}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </Card>

        <Button
          label={isSignedIn ? `Upgrade for ${price}` : 'Sign In to Upgrade'}
          onPress={handleUpgrade}
          loading={loading}
          variant="gold"
          size="lg"
          style={styles.upgradeBtn}
        />

        <Text style={styles.terms}>Cancel anytime. No hidden fees.</Text>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.xl, alignItems: 'center' },
  closeRow: { alignSelf: 'flex-start', marginBottom: Spacing.base },
  close: { color: Colors.textMuted, fontSize: Typography.sizes.lg },
  crown: { fontSize: 64, marginBottom: Spacing.sm },
  title: { color: Colors.text, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.extrabold, marginBottom: Spacing.xs },
  price: { color: Colors.gold, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, marginBottom: Spacing.xs },
  subtitle: { color: Colors.textMuted, fontSize: Typography.sizes.base, textAlign: 'center', marginBottom: Spacing.xl },
  featuresCard: { width: '100%', marginBottom: Spacing.xl, gap: Spacing.sm },
  feature: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  featureIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  featureLabel: { color: Colors.text, fontSize: Typography.sizes.base },
  upgradeBtn: { width: '100%', marginBottom: Spacing.base },
  terms: { color: Colors.textFaint, fontSize: Typography.sizes.sm },
});
