import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
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
import { createCheckout } from '../../src/api';
import { guestMode } from '../../src/guestMode';
import { Colors, Typography, Spacing, Radius, Gradients } from '../../src/theme';

type Tab = 'profile' | 'billing' | 'security';

export default function AccountScreen() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const { isPaid } = usePaidStatus();
  const price = usePrice();

  const [tab, setTab] = useState<Tab>('profile');
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  if (!isLoaded) {
    return <Background><View style={styles.center}><ActivityIndicator color={Colors.secondary} /></View></Background>;
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
      const token = await getToken();
      if (!token) { router.push('/(auth)/sign-in'); return; }
      if (isPaid) {
        // Open Stripe portal via /api/portal — fallback to checkout if unavailable.
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
      }
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
                      Thank you for supporting Fite. Manage your subscription, payment method, or cancel below.
                    </Text>
                    <GradientButton
                      label="Manage Billing"
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

          <View style={{ height: 120 }} />
        </ScrollView>
        <ScrollFade top={28} bottom={90} />
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

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  actionLabel: { color: Colors.text, fontFamily: Typography.fonts.sansSemibold, fontSize: Typography.sizes.sm, flex: 1 },
});
