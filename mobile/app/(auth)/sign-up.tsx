import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSignUp, useOAuth } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Colors, Typography, Spacing, Radius } from '../../src/theme';
import { Button } from '../../src/components/Button';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignUp() {
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      await signUp.create({ firstName, emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (e: any) {
      setError(e.errors?.[0]?.message ?? 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      setError(e.errors?.[0]?.message ?? 'Invalid code.');
    } finally {
      setLoading(false);
    }
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
      Alert.alert('Google sign-up failed', e.message ?? 'Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.verifyContainer}>
          <Text style={styles.verifyTitle}>Check your email</Text>
          <Text style={styles.verifySubtitle}>
            We sent a 6-digit code to {email}
          </Text>
          <View style={styles.field}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="000000"
              placeholderTextColor={Colors.textFaint}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Button label="Verify Email" onPress={handleVerify} loading={loading} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.logo}>FITE</Text>
            <Text style={styles.logoSub}>Finance Interview Prep</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start your interview prep today</Text>

            <Button
              label={googleLoading ? 'Connecting...' : 'Continue with Google'}
              onPress={handleGoogle}
              loading={googleLoading}
              variant="ghost"
              style={styles.googleBtn}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Alex"
                placeholderTextColor={Colors.textFaint}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
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

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.textFaint}
                secureTextEntry
              />
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Button
              label="Create Account"
              onPress={handleSignUp}
              loading={loading}
              style={styles.submitBtn}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/sign-in">
                <Text style={styles.footerLink}>Sign in</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  verifyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  verifyTitle: {
    color: Colors.text,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  verifySubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  header: { alignItems: 'center', marginBottom: Spacing.xxl },
  logo: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.secondary,
    letterSpacing: 6,
  },
  logoSub: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.xl,
  },
  googleBtn: { marginBottom: Spacing.base },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    color: Colors.textFaint,
    fontSize: Typography.sizes.sm,
    marginHorizontal: Spacing.sm,
  },
  field: { marginBottom: Spacing.base },
  label: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: Typography.sizes.base,
  },
  error: {
    color: Colors.error,
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.base,
  },
  submitBtn: { marginTop: Spacing.xs },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.base,
  },
  footerText: { color: Colors.textMuted, fontSize: Typography.sizes.sm },
  footerLink: {
    color: Colors.secondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});
