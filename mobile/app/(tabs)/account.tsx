import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator, Image, Platform, Linking, Modal, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser, useAuth, useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Background } from '../../src/components/Background';
import { GlassCard } from '../../src/components/GlassCard';
import { GradientButton } from '../../src/components/GradientButton';
import { PressableScale } from '../../src/components/PressableScale';
import { SectionHeader } from '../../src/components/SectionHeader';
import { ScrollFade } from '../../src/components/ScrollFade';
import { usePaidStatus } from '../../src/hooks/usePaidStatus';
import { usePrice } from '../../src/hooks/usePrice';
import { createCheckout, deleteAccount } from '../../src/api';
import { guestMode } from '../../src/guestMode';
import {
  isRcSupported,
  getPremiumPackage,
  purchasePremium,
  restorePurchases,
  PREMIUM_ENTITLEMENT,
} from '../../src/revenuecat';
import { Colors, Typography, Spacing, Radius, Gradients } from '../../src/theme';

function GuestAccountScreen() {
  const router = useRouter();
  return (
    <Background variant="hero">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(500)}>
            <GlassCard accent="cyan" glow padding={24} animate={false}>
              <View style={{ alignItems: 'center', gap: Spacing.md }}>
                <LinearGradient
                  colors={Gradients.cyan as any}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[styles.avatar, { marginBottom: 4 }]}
                >
                  <Ionicons name="person-outline" size={28} color="#021018" />
                </LinearGradient>
                <Text style={styles.guestTitle}>Not signed in</Text>
                <Text style={styles.guestSubtitle}>Sign in or create an account to manage your profile, track history, and unlock premium features.</Text>
              </View>
              <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
                <GradientButton
                  label="Sign In"
                  icon="log-in-outline"
                  onPress={() => router.push('/(auth)/sign-in')}
                  fullWidth
                />
                <GradientButton
                  label="Create Account"
                  icon="person-add-outline"
                  onPress={() => router.push('/(auth)/sign-up')}
                  variant="ghost"
                  fullWidth
                />
              </View>
            </GlassCard>
          </Animated.View>

          <SectionHeader eyebrow="MORE" title="Help & info" style={{ marginTop: Spacing.xl }} />
          <View style={{ gap: Spacing.sm }}>
            <ActionRow icon="chatbubble-ellipses-outline" label="Send feedback" onPress={() => router.push('/feedback')} />
            <ActionRow icon="document-text-outline" label="Privacy" onPress={async () => {
              const { openBrowserAsync } = await import('expo-web-browser');
              await openBrowserAsync('https://fitefinance.com/privacy');
            }} />
            <ActionRow icon="reader-outline" label="Terms" onPress={async () => {
              const { openBrowserAsync } = await import('expo-web-browser');
              await openBrowserAsync('https://fitefinance.com/terms');
            }} />
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
        <ScrollFade top={28} bottom={90} />
      </SafeAreaView>
    </Background>
  );
}

type Tab = 'profile' | 'billing' | 'security';

export default function AccountScreen() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const { isPaid, refresh: refreshPaid } = usePaidStatus();
  const price = usePrice();
  const useIap = Platform.OS === 'ios' && isRcSupported();

  const [tab, setTab] = useState<Tab>('profile');
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  if (!isLoaded) {
    return <Background><View style={styles.center}><ActivityIndicator color={Colors.secondary} /></View></Background>;
  }

  if (!user) {
    return <GuestAccountScreen />;
  }

  async function handleSaveName() {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({ firstName, lastName });
      Alert.alert('Saved', 'Profile updated.');
    } catch {
      Alert.alert('Error', 'Could not update profile.');
    } finally { setSaving(false); }
  }

  async function handleUpgradeOrManage() {
    setUpgradeLoading(true);
    try {
      // ── Manage existing subscription ─────────────────────────────────────
      if (isPaid) {
        if (useIap) {
          // Apple requires us to send users to the App Store subscriptions screen
          // for native subscriptions (we can't manage them ourselves).
          await Linking.openURL('https://apps.apple.com/account/subscriptions');
          return;
        }
        const token = await getToken();
        if (!token) { router.push('/(auth)/sign-in'); return; }
        // Stripe portal for web/Android subscribers.
        try {
          const res = await fetch('https://fitefinance.com/api/portal', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ returnPath: '/account' }),
          });
          const data = await res.json();
          if (data?.url) {
            const { openBrowserAsync } = await import('expo-web-browser');
            await openBrowserAsync(data.url);
            return;
          }
        } catch {}
        return;
      }

      // ── Upgrade flow ─────────────────────────────────────────────────────
      if (useIap) {
        const pkg = await getPremiumPackage();
        if (!pkg) {
          Alert.alert('Unavailable', 'Could not load subscription details. Please try again later.');
          return;
        }
        const outcome = await purchasePremium(pkg.package);
        if (outcome.kind === 'cancelled') return;
        if (outcome.kind === 'error') {
          Alert.alert('Purchase failed', outcome.message);
          return;
        }
        const entitled =
          outcome.customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;
        if (entitled) await refreshPaid();
        return;
      }

      const token = await getToken();
      if (!token) { router.push('/(auth)/sign-in'); return; }
      const url = await createCheckout(token);
      if (url) {
        const { openBrowserAsync } = await import('expo-web-browser');
        await openBrowserAsync(url);
      }
    } catch {
      Alert.alert('Error', 'Could not open billing.');
    } finally {
      setUpgradeLoading(false);
    }
  }

  async function handleRestoreIap() {
    if (!useIap) return;
    setUpgradeLoading(true);
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
      } else {
        Alert.alert('Nothing to restore', 'No active subscription found for this Apple ID.');
      }
    } finally {
      setUpgradeLoading(false);
    }
  }

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive',
        onPress: async () => {
          guestMode.reset();
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  }

  function handleDeleteAccount() {
    setDeleteConfirmText('');
    setDeleteModalVisible(true);
  }

  async function confirmDeleteAccount() {
    setDeleteLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Could not authenticate. Please sign in again.');
        return;
      }
      await deleteAccount(token);
      setDeleteModalVisible(false);
      guestMode.reset();
      await signOut().catch(() => {});
      router.replace('/(auth)/sign-in');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleChangePw() {
    if (!newPw.trim()) { Alert.alert('Enter a new password'); return; }
    setPwLoading(true);
    try {
      await user?.updatePassword({ currentPassword: currentPw || undefined, newPassword: newPw });
      Alert.alert('Password updated');
      setCurrentPw(''); setNewPw('');
    } catch (e: any) {
      Alert.alert('Error', e.errors?.[0]?.message ?? 'Could not update password.');
    } finally { setPwLoading(false); }
  }

  const initials = ((user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')).toUpperCase()
    || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase()
    || '?';

  return (
    <Background variant="hero">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header / avatar */}
          <Animated.View entering={FadeIn.duration(500)}>
            <GlassCard accent={isPaid ? 'gold' : 'cyan'} glow padding={20} animate={false}>
              <View style={styles.profileRow}>
                {user?.imageUrl && user.hasImage ? (
                  <View style={[styles.avatar, styles.avatarImageWrap, isPaid && styles.avatarImageWrapGold]}>
                    <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} />
                  </View>
                ) : (
                  <LinearGradient
                    colors={(isPaid ? Gradients.gold : Gradients.cyan) as any}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.avatar}
                  >
                    <Text style={[styles.avatarText, isPaid && { color: '#1a1408' }]}>{initials}</Text>
                  </LinearGradient>
                )}
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.name}>{user?.fullName ?? 'Account'}</Text>
                  <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
                  {isPaid ? (
                    <View style={styles.premiumPill}>
                      <Ionicons name="diamond" size={9} color="#1a1408" />
                      <Text style={styles.premiumText}>PREMIUM MEMBER</Text>
                    </View>
                  ) : (
                    <View style={styles.freePill}>
                      <Text style={styles.freeText}>FREE PLAN</Text>
                    </View>
                  )}
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {(['profile', 'billing', 'security'] as Tab[]).map(t => {
              const active = tab === t;
              const icon = t === 'profile' ? 'person-outline' : t === 'billing' ? 'card-outline' : 'lock-closed-outline';
              return (
                <PressableScale
                  key={t}
                  onPress={() => setTab(t)}
                  haptic="selection"
                  containerStyle={[styles.tabBtn, active && styles.tabBtnActive]}
                >
                  <Ionicons name={icon as any} size={14} color={active ? Colors.secondary : Colors.textMuted} />
                  <Text style={[styles.tabText, active && { color: Colors.secondary }]}>{t.toUpperCase()}</Text>
                </PressableScale>
              );
            })}
          </View>

          {/* Profile tab */}
          {tab === 'profile' && (
            <Animated.View entering={FadeIn.duration(180)}>
              <GlassCard accent="ghost" padding={18} animate={false}>
                <Field label="FIRST NAME">
                  <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholderTextColor={Colors.textFaint} />
                </Field>
                <Field label="LAST NAME">
                  <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholderTextColor={Colors.textFaint} />
                </Field>
                <Field label="EMAIL">
                  <TextInput style={[styles.input, { opacity: 0.5 }]} value={user?.primaryEmailAddress?.emailAddress ?? ''} editable={false} />
                </Field>
                <GradientButton label="Save Changes" icon="save" onPress={handleSaveName} loading={saving} fullWidth />
              </GlassCard>
            </Animated.View>
          )}

          {/* Billing tab */}
          {tab === 'billing' && (
            <Animated.View entering={FadeIn.duration(180)}>
              <GlassCard accent={isPaid ? 'gold' : 'ghost'} padding={20} animate={false}>
                {isPaid ? (
                  <>
                    <View style={styles.billHeader}>
                      <Ionicons name="diamond" size={22} color={Colors.gold} />
                      <Text style={styles.billTitle}>Fite Premium</Text>
                    </View>
                    <Text style={styles.billText}>
                      {useIap
                        ? 'Thank you for supporting Fite. Manage your subscription in your Apple ID settings.'
                        : 'Thank you for supporting Fite. Manage your subscription, payment method, or cancel below.'}
                    </Text>
                    <GradientButton
                      label={useIap ? 'Manage in App Store' : 'Manage Billing'}
                      icon="open-outline"
                      onPress={handleUpgradeOrManage}
                      loading={upgradeLoading}
                      variant="ghost"
                      fullWidth
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.billEyebrow}>UPGRADE</Text>
                    <Text style={styles.billTitle}>Fite Premium</Text>
                    <Text style={styles.billPrice}>{price}</Text>
                    <View style={{ marginVertical: Spacing.base }}>
                      {[
                        'Unlimited AI questions',
                        'AI grading on every answer',
                        'IB 400 progress tracking',
                        'Mock interview mode',
                        'History · Stats · Streaks',
                        'Practice timer',
                        'Custom focus prompts',
                      ].map(f => (
                        <View key={f} style={styles.perkLine}>
                          <Ionicons name="checkmark" size={14} color={Colors.gold} />
                          <Text style={styles.perkText}>{f}</Text>
                        </View>
                      ))}
                    </View>
                    <GradientButton
                      label="Upgrade Now"
                      icon="rocket"
                      variant="gold"
                      onPress={handleUpgradeOrManage}
                      loading={upgradeLoading}
                      fullWidth
                    />
                    {useIap && (
                      <PressableScale
                        onPress={handleRestoreIap}
                        haptic="selection"
                        containerStyle={{ alignSelf: 'center', marginTop: 12 }}
                      >
                        <Text style={styles.restoreLink}>Restore Purchases</Text>
                      </PressableScale>
                    )}
                  </>
                )}
              </GlassCard>
            </Animated.View>
          )}

          {/* Security tab */}
          {tab === 'security' && (
            <Animated.View entering={FadeIn.duration(180)}>
              <GlassCard accent="ghost" padding={18} animate={false}>
                <Field label="CURRENT PASSWORD">
                  <TextInput
                    style={styles.input}
                    value={currentPw}
                    onChangeText={setCurrentPw}
                    secureTextEntry
                    placeholder="Leave blank for first-time set"
                    placeholderTextColor={Colors.textFaint}
                  />
                </Field>
                <Field label="NEW PASSWORD">
                  <TextInput
                    style={styles.input}
                    value={newPw}
                    onChangeText={setNewPw}
                    secureTextEntry
                    placeholder="New password"
                    placeholderTextColor={Colors.textFaint}
                  />
                </Field>
                <GradientButton label="Update Password" icon="key" onPress={handleChangePw} loading={pwLoading} fullWidth />
              </GlassCard>
            </Animated.View>
          )}

          {/* Actions */}
          <SectionHeader eyebrow="MORE" title="Help & feedback" style={{ marginTop: Spacing.xl }} />
          <View style={{ gap: Spacing.sm }}>
            <ActionRow icon="chatbubble-ellipses-outline" label="Send feedback" onPress={() => router.push('/feedback')} />
            {isPaid && <ActionRow icon="bulb-outline" label="Vote on roadmap" onPress={() => router.push('/feature-vote')} accent="gold" />}
            <ActionRow icon="document-text-outline" label="Privacy" onPress={async () => {
              const { openBrowserAsync } = await import('expo-web-browser');
              await openBrowserAsync('https://fitefinance.com/privacy');
            }} />
            <ActionRow icon="reader-outline" label="Terms" onPress={async () => {
              const { openBrowserAsync } = await import('expo-web-browser');
              await openBrowserAsync('https://fitefinance.com/terms');
            }} />
          </View>

          <View style={{ marginTop: Spacing.xl }}>
            <GradientButton label="Sign Out" icon="log-out-outline" onPress={handleSignOut} variant="ghost" fullWidth />
          </View>

          <SectionHeader eyebrow="DANGER ZONE" title="Delete account" style={{ marginTop: Spacing.xl }} />
          <GlassCard accent="ghost" padding={18} animate={false}>
            <Text style={styles.deleteWarning}>
              Permanently deletes your account, all practice history, stats, and cancels any active subscription. This action cannot be undone.
            </Text>
            <GradientButton
              label={deleteLoading ? 'Deleting…' : 'Delete My Account'}
              icon="trash-outline"
              onPress={handleDeleteAccount}
              loading={deleteLoading}
              variant="ghost"
              fullWidth
            />
          </GlassCard>

          <View style={{ height: 120 }} />
        </ScrollView>
        <ScrollFade top={28} bottom={90} />

        {/* Delete account confirmation modal */}
        <Modal
          visible={deleteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => !deleteLoading && setDeleteModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.modalCard}>
                  <View style={styles.modalIconRow}>
                    <View style={styles.modalIconBg}>
                      <Ionicons name="warning-outline" size={28} color="#ef4444" />
                    </View>
                  </View>
                  <Text style={styles.modalTitle}>Delete Account</Text>
                  <Text style={styles.modalBody}>
                    This will permanently delete your account, all practice history, stats, and cancel any active subscription.{'\n\n'}
                    Type{' '}<Text style={styles.modalConfirmWord}>CONFIRM</Text>{' '}to continue.
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.modalInput,
                      deleteConfirmText === 'CONFIRM' && styles.modalInputValid,
                    ]}
                    value={deleteConfirmText}
                    onChangeText={setDeleteConfirmText}
                    placeholder="Type CONFIRM"
                    placeholderTextColor={Colors.textFaint}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    editable={!deleteLoading}
                  />
                  <View style={styles.modalActions}>
                    <PressableScale
                      onPress={() => setDeleteModalVisible(false)}
                      haptic="selection"
                      containerStyle={styles.modalCancelBtn}
                      disabled={deleteLoading}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </PressableScale>
                    <PressableScale
                      onPress={confirmDeleteAccount}
                      haptic="medium"
                      containerStyle={[
                        styles.modalDeleteBtn,
                        deleteConfirmText !== 'CONFIRM' && styles.modalDeleteBtnDisabled,
                      ]}
                      disabled={deleteConfirmText !== 'CONFIRM' || deleteLoading}
                    >
                      {deleteLoading
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={styles.modalDeleteText}>Delete Account</Text>
                      }
                    </PressableScale>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </Background>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: Spacing.base }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ActionRow({ icon, label, onPress, accent }: { icon: any; label: string; onPress: () => void; accent?: 'gold' | 'cyan' }) {
  const color = accent === 'gold' ? Colors.gold : Colors.secondary;
  return (
    <PressableScale onPress={onPress} haptic="selection">
      <GlassCard accent="ghost" padding={14} animate={false}>
        <View style={styles.actionRow}>
          <View style={[styles.actionIcon, { backgroundColor: color + '1a', borderColor: color + '55' }]}>
            <Ionicons name={icon} size={16} color={color} />
          </View>
          <Text style={styles.actionLabel}>{label}</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textFaint} />
        </View>
      </GlassCard>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },

  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.secondary, shadowOpacity: 0.55, shadowRadius: 14, shadowOffset: { width: 0, height: 0 },
  },
  avatarText: { color: '#021018', fontFamily: Typography.fonts.displayExtra, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  avatarImageWrap: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(79,195,247,0.55)',
    backgroundColor: 'rgba(2,8,23,0.6)',
  },
  avatarImageWrapGold: {
    borderColor: 'rgba(201,168,76,0.65)',
    shadowColor: Colors.gold,
  },
  avatarImage: { width: '100%', height: '100%' },
  name: { color: Colors.text, fontFamily: Typography.fonts.displayExtra, fontSize: Typography.sizes.lg, fontWeight: '800' },
  email: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, marginTop: 2 },
  premiumPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', marginTop: 6,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: Colors.gold,
  },
  premiumText: { color: '#1a1408', fontFamily: Typography.fonts.displayExtra, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
  freePill: {
    alignSelf: 'flex-start', marginTop: 6,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderLight,
  },
  freeText: { color: Colors.textMuted, fontFamily: Typography.fonts.displayExtra, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },

  tabsRow: { flexDirection: 'row', gap: 6, marginTop: Spacing.lg, marginBottom: Spacing.md },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: 'rgba(255,255,255,0.02)',
  },
  tabBtnActive: { backgroundColor: 'rgba(79,195,247,0.12)', borderColor: Colors.secondary },
  tabText: { color: Colors.textMuted, fontFamily: Typography.fonts.displaySemibold, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },

  fieldLabel: { color: Colors.textMuted, fontFamily: Typography.fonts.display, fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(2,8,23,0.6)',
    borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: Radius.md, padding: Spacing.md,
    color: Colors.text, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.base,
  },

  billHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  billEyebrow: { color: Colors.gold, fontFamily: Typography.fonts.displayExtra, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  billTitle: { color: Colors.text, fontFamily: Typography.fonts.displayExtra, fontSize: Typography.sizes.xl, fontWeight: '800', letterSpacing: -0.5 },
  billPrice: { color: Colors.gold, fontFamily: Typography.fonts.displayExtra, fontSize: 32, fontWeight: '800', letterSpacing: -1, marginTop: 4 },
  billText: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, lineHeight: 20, marginVertical: Spacing.sm },

  perkLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  perkText: { color: Colors.text, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm },
  restoreLink: {
    color: Colors.secondary,
    fontFamily: Typography.fonts.sansSemibold,
    fontSize: Typography.sizes.sm,
    textDecorationLine: 'underline',
  },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  actionLabel: { color: Colors.text, fontFamily: Typography.fonts.sansSemibold, fontSize: Typography.sizes.sm, flex: 1 },

  guestTitle: { color: Colors.text, fontFamily: Typography.fonts.displayExtra, fontSize: Typography.sizes.xl, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' },
  guestSubtitle: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, lineHeight: 20, textAlign: 'center' },
  deleteWarning: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, lineHeight: 20, marginBottom: Spacing.md },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalCard: {
    backgroundColor: '#0d1b2a',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    width: '100%',
  },
  modalIconRow: { alignItems: 'center', marginBottom: Spacing.md },
  modalIconBg: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: {
    color: Colors.text,
    fontFamily: Typography.fonts.displayExtra,
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  modalBody: {
    color: Colors.textMuted,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalConfirmWord: {
    color: Colors.text,
    fontFamily: Typography.fonts.displayExtra,
    fontWeight: '800',
  },
  modalInput: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
    letterSpacing: 2,
  },
  modalInputValid: {
    borderColor: '#ef4444',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: Colors.textMuted,
    fontFamily: Typography.fonts.sansSemibold,
    fontSize: Typography.sizes.sm,
  },
  modalDeleteBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.md,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDeleteBtnDisabled: {
    backgroundColor: 'rgba(239,68,68,0.25)',
  },
  modalDeleteText: {
    color: '#fff',
    fontFamily: Typography.fonts.sansSemibold,
    fontSize: Typography.sizes.sm,
  },
});
