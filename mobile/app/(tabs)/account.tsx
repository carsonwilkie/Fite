import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser, useAuth, useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

import { Colors, Typography, Spacing, Radius } from '../../src/theme';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { usePaidStatus } from '../../src/hooks/usePaidStatus';
import { usePrice } from '../../src/hooks/usePrice';
import { createCheckout } from '../../src/api';

export default function AccountScreen() {
  const { user, isLoaded } = useUser();
  const { getToken, signOut } = useAuth();
  const { signOut: clerkSignOut } = useClerk();
  const router = useRouter();
  const { isPaid } = usePaidStatus();
  const price = usePrice();

  const [tab, setTab] = useState<'profile' | 'billing' | 'security'>('profile');
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  if (!isLoaded) {
    return <View style={styles.center}><ActivityIndicator color={Colors.secondary} /></View>;
  }

  async function handleSaveName() {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({ firstName, lastName });
      Alert.alert('Saved', 'Profile updated.');
    } catch {
      Alert.alert('Error', 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpgrade() {
    setUpgradeLoading(true);
    try {
      const token = await getToken();
      if (!token) { router.push('/(auth)/sign-in'); return; }
      const url = await createCheckout(token);
      if (url) {
        const { openBrowserAsync } = await import('expo-web-browser');
        await openBrowserAsync(url);
      }
    } catch {
      Alert.alert('Error', 'Could not open checkout.');
    } finally {
      setUpgradeLoading(false);
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await clerkSignOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  }

  async function handleChangePw() {
    if (!newPw.trim()) { Alert.alert('Enter a new password'); return; }
    setPwLoading(true);
    try {
      await user?.updatePassword({ currentPassword: currentPw || undefined, newPassword: newPw });
      Alert.alert('Password updated');
      setCurrentPw('');
      setNewPw('');
    } catch (e: any) {
      Alert.alert('Error', e.errors?.[0]?.message ?? 'Could not update password.');
    } finally {
      setPwLoading(false);
    }
  }

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, isPaid && styles.avatarPaid]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.name}>{user?.fullName ?? 'Account'}</Text>
            <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
            {isPaid && <Text style={styles.premiumBadge}>👑 Premium</Text>}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['profile', 'billing', 'security'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Profile tab */}
        {tab === 'profile' && (
          <Card style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholderTextColor={Colors.textFaint} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholderTextColor={Colors.textFaint} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value={user?.primaryEmailAddress?.emailAddress ?? ''} editable={false} />
            </View>
            <Button label="Save Changes" onPress={handleSaveName} loading={saving} />
          </Card>
        )}

        {/* Billing tab */}
        {tab === 'billing' && (
          <Card style={[styles.card, isPaid && styles.cardGold]}>
            {isPaid ? (
              <>
                <Text style={styles.billingTitle}>👑 Fite Premium</Text>
                <Text style={styles.billingText}>You're on the Premium plan. Thank you for your support!</Text>
                <Button
                  label="Manage Billing"
                  onPress={handleUpgrade}
                  loading={upgradeLoading}
                  variant="ghost"
                  style={styles.billingBtn}
                />
              </>
            ) : (
              <>
                <Text style={styles.billingTitle}>Upgrade to Premium</Text>
                <Text style={styles.billingPrice}>{price}</Text>
                {[
                  'Unlimited question generation',
                  'AI grading & detailed feedback',
                  'Question history & search',
                  'Performance stats & streaks',
                  'Mock interview mode',
                  'Practice timer',
                  'Custom descriptors',
                ].map(f => (
                  <Text key={f} style={styles.feature}>✓ {f}</Text>
                ))}
                <Button
                  label="Upgrade Now"
                  onPress={handleUpgrade}
                  loading={upgradeLoading}
                  variant="gold"
                  style={styles.billingBtn}
                />
              </>
            )}
          </Card>
        )}

        {/* Security tab */}
        {tab === 'security' && (
          <Card style={styles.card}>
            <Text style={styles.fieldLabel}>Current Password</Text>
            <TextInput style={[styles.input, styles.fieldGap]} value={currentPw} onChangeText={setCurrentPw} secureTextEntry placeholder="Leave blank if setting for first time" placeholderTextColor={Colors.textFaint} />
            <Text style={styles.fieldLabel}>New Password</Text>
            <TextInput style={[styles.input, styles.fieldGap]} value={newPw} onChangeText={setNewPw} secureTextEntry placeholder="New password" placeholderTextColor={Colors.textFaint} />
            <Button label="Update Password" onPress={handleChangePw} loading={pwLoading} style={styles.billingBtn} />
          </Card>
        )}

        {/* Footer actions */}
        <View style={styles.footerActions}>
          <Button label="Send Feedback" onPress={() => router.push('/feedback')} variant="ghost" style={styles.footerBtn} />
          {isPaid && <Button label="Feature Voting" onPress={() => router.push('/feature-vote')} variant="ghost" style={styles.footerBtn} />}
          <Button label="Sign Out" onPress={handleSignOut} variant="danger" style={styles.footerBtn} />
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.base },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, marginBottom: Spacing.xl },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.border,
  },
  avatarPaid: { borderColor: Colors.gold },
  avatarText: { color: Colors.white, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
  name: { color: Colors.text, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
  email: { color: Colors.textMuted, fontSize: Typography.sizes.sm },
  premiumBadge: { color: Colors.gold, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, marginTop: 2 },

  tabs: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.base },
  tabBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.secondary + '22', borderColor: Colors.secondary },
  tabText: { color: Colors.textMuted, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  tabTextActive: { color: Colors.secondary },

  card: { marginBottom: Spacing.base },
  cardGold: { borderColor: Colors.gold },
  field: { marginBottom: Spacing.base },
  fieldLabel: { color: Colors.textMuted, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.xs },
  fieldGap: { marginBottom: Spacing.base },
  input: {
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.sm, color: Colors.text, fontSize: Typography.sizes.base,
  },
  inputDisabled: { opacity: 0.5 },

  billingTitle: { color: Colors.text, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, marginBottom: Spacing.sm },
  billingPrice: { color: Colors.gold, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, marginBottom: Spacing.base },
  billingText: { color: Colors.textMuted, fontSize: Typography.sizes.base, marginBottom: Spacing.base },
  feature: { color: Colors.text, fontSize: Typography.sizes.base, marginBottom: Spacing.xs },
  billingBtn: { marginTop: Spacing.base },

  footerActions: { gap: Spacing.sm },
  footerBtn: {},
});
