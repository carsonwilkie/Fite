import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '../theme';
import { Card } from './Card';
import { Button } from './Button';
import { useAuth } from '@clerk/clerk-expo';

interface PremiumGateProps {
  message?: string;
}

export function PremiumGate({ message = 'This feature requires Fite Premium.' }: PremiumGateProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  return (
    <View style={styles.container}>
      <Card gold style={styles.card}>
        <Text style={styles.crown}>👑</Text>
        <Text style={styles.title}>Premium Feature</Text>
        <Text style={styles.message}>{message}</Text>
        <Button
          label={isSignedIn ? 'Upgrade to Premium' : 'Sign In to Continue'}
          onPress={() => router.push(isSignedIn ? '/paywall' : '/(auth)/sign-in')}
          variant="gold"
          style={styles.button}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  crown: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  title: {
    color: Colors.gold,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  message: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  button: {
    width: '100%',
  },
});
