import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, Pressable,
} from 'react-native';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Background } from '../../src/components/Background';
import { GlassCard } from '../../src/components/GlassCard';
import { GradientButton } from '../../src/components/GradientButton';
import { BrandLogo } from '../../src/components/BrandLogo';
import { Colors, Typography, Spacing, Radius } from '../../src/theme';
import { guestMode } from '../../src/guestMode';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsCode, setNeedsCode] = useState(false);
  const [code, setCode] = useState('');

  async function handleSignIn() {
    if (!isLoaded) return;
    setLoading(true); setError('');
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else if (result.status === 'needs_second_factor') {
        await signIn.prepareSecondFactor({ strategy: 'email_code' });
        setNeedsCode(true);
      } else {
        setError(`Unexpected status: ${result.status}`);
      }
    } catch (e: any) {
      setError(e.errors?.[0]?.message ?? e.message ?? 'Sign in failed.');
    } finally { setLoading(false); }
  }

  async function handleVerifyCode() {
    if (!isLoaded) return;
    setLoading(true); setError('');
    try {
      const result = await signIn.attemptSecondFactor({ strategy: 'email_code', code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setError(`Verification incomplete: ${result.status}`);
      }
    } catch (e: any) {
      setError(e.errors?.[0]?.message ?? e.message ?? 'Invalid code.');
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      const { createdSessionId, setActive: setActiveOAuth } = await startOAuthFlow();
      if (createdSessionId) {
        await setActiveOAuth!({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      Alert.alert('Google sign-in failed', e.message ?? 'Please try again.');
    } finally { setGoogleLoading(false); }
  }

  function handleSkip() {
    guestMode.allow();
    router.replace('/(tabs)');
  }

  return (
    <Background variant="deep">
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Skip row */}
            <View style={styles.skipRow}>
              <View style={{ flex: 1 }} />
              <Pressable onPress={handleSkip} hitSlop={12} style={styles.skipBtn}>
                <Text style={styles.skipText}>Skip</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
              </Pressable>
            </View>

            <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
              <BrandLogo size="lg" />
              <Text style={styles.tagline}>Finance interview prep, weaponized.</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(500).delay(120)}>
              <GlassCard accent="cyan" glow padding={24} animate={false}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Sign in to keep streaks rolling.</Text>

                <GradientButton
                  label={googleLoading ? 'Connecting…' : 'Continue with Google'}
                  icon="logo-google"
                  variant="ghost"
                  onPress={handleGoogle}
                  loading={googleLoading}
                  fullWidth
                />

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR EMAIL</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Text style={styles.label}>EMAIL</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={16} color={Colors.textFaint} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={Colors.textFaint}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <Text style={[styles.label, { marginTop: 14 }]}>PASSWORD</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={16} color={Colors.textFaint} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textFaint}
                    secureTextEntry={!showPw}
                  />
                  <Ionicons
                    name={showPw ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.textFaint}
                    onPress={() => setShowPw(s => !s)}
                  />
                </View>

                {needsCode && (
                  <>
                    <Text style={[styles.label, { marginTop: 14 }]}>VERIFICATION CODE</Text>
                    <Text style={[styles.subtitle, { marginBottom: 8 }]}>Check your email for a 6-digit code.</Text>
                    <View style={styles.inputWrap}>
                      <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textFaint} style={{ marginRight: 8 }} />
                      <TextInput
                        style={styles.input}
                        value={code}
                        onChangeText={setCode}
                        placeholder="000000"
                        placeholderTextColor={Colors.textFaint}
                        keyboardType="number-pad"
                        autoComplete="one-time-code"
                        maxLength={6}
                      />
                    </View>
                  </>
                )}

                {!!error && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={14} color={Colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <View style={{ marginTop: Spacing.lg }}>
                  {needsCode ? (
                    <GradientButton label="Verify Code" icon="shield-checkmark" iconRight={undefined} onPress={handleVerifyCode} loading={loading} fullWidth size="lg" />
                  ) : (
                    <GradientButton label="Sign In" icon="arrow-forward" iconRight={undefined} onPress={handleSignIn} loading={loading} fullWidth size="lg" />
                  )}
                </View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <Link href="/(auth)/sign-up" style={styles.footerLink as any}>Sign up</Link>
                </View>
              </GlassCard>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg, paddingTop: Spacing.sm },
  skipRow: { flexDirection: 'row', alignItems: 'center', paddingTop: Spacing.sm, paddingHorizontal: Spacing.xs },
  skipBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: Spacing.xs },
  skipText: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  tagline: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, marginTop: 12, textAlign: 'center' },

  title: { color: Colors.text, fontFamily: Typography.fonts.displayExtra, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, marginTop: 4, marginBottom: Spacing.lg },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.borderLight },
  dividerText: { color: Colors.textFaint, fontFamily: Typography.fonts.displayExtra, fontSize: 10, fontWeight: '800', letterSpacing: 1.6, marginHorizontal: Spacing.md },

  label: { color: Colors.textMuted, fontFamily: Typography.fonts.display, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(2,8,23,0.7)',
    borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 10,
  },
  input: { flex: 1, color: Colors.text, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.base },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 12, padding: 10, borderRadius: Radius.md,
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)',
  },
  errorText: { color: Colors.error, fontFamily: Typography.fonts.sansSemibold, fontSize: 12, flex: 1 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg, alignItems: 'baseline' },
  footerText: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm },
  footerLink: { color: Colors.secondary, fontFamily: Typography.fonts.sansBold, fontSize: Typography.sizes.sm, fontWeight: '700' },
});
