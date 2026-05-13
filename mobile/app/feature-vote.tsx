import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
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
import { PremiumGate } from '../src/components/PremiumGate';
import { usePaidStatus } from '../src/hooks/usePaidStatus';
import { submitFeedback } from '../src/api';
import { ROADMAP_IDEAS } from '../src/constants';
import { Colors, Typography, Spacing, Radius, Gradients } from '../src/theme';

export default function FeatureVoteScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { isPaid } = usePaidStatus();

  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isPaid) {
    return (
      <Background variant="hero">
        <SafeAreaView style={styles.safe}>
          <View style={styles.topBar}>
            <PressableScale onPress={() => router.back()} haptic="selection" containerStyle={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.text} />
            </PressableScale>
            <Text style={styles.topTitle}>ROADMAP VOTE</Text>
            <View style={{ width: 40 }} />
          </View>
          <PremiumGate message="Roadmap voting is a Premium perk — your input shapes what we ship next." />
        </SafeAreaView>
      </Background>
    );
  }

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  }

  async function handleSubmit() {
    if (selected.length === 0 && !note.trim()) {
      Alert.alert('Pick at least one idea or write a note.');
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const lines = [
        ...selected.map(s => {
          const idea = ROADMAP_IDEAS.find(i => i.title === s);
          return `+ ${idea?.title ?? s}`;
        }),
        ...(note.trim() ? ['', `Note: ${note.trim()}`] : []),
      ];
      await submitFeedback({ type: 'vote', message: lines.join('\n'), token: token ?? undefined });
      setSubmitted(true);
    } catch {
      Alert.alert('Error', 'Could not submit vote.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Background variant="hero">
        <SafeAreaView style={styles.safe}>
          <Animated.View entering={FadeIn.duration(500)} style={styles.successWrap}>
            <LinearGradient
              colors={Gradients.gold as any}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.successIcon}
            >
              <Ionicons name="checkmark" size={36} color="#1a1408" />
            </LinearGradient>
            <Text style={styles.successTitle}>Vote recorded.</Text>
            <Text style={styles.successSub}>Your priorities are now in our planning doc. Thanks for shaping Fite.</Text>
            <View style={{ marginTop: Spacing.xl, width: '100%' }}>
              <GradientButton label="Close" onPress={() => router.back()} fullWidth size="lg" />
            </View>
          </Animated.View>
        </SafeAreaView>
      </Background>
    );
  }

  return (
    <Background variant="hero">
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <PressableScale onPress={() => router.back()} haptic="selection" containerStyle={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.text} />
            </PressableScale>
            <Text style={styles.topTitle}>ROADMAP VOTE</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View entering={FadeIn.duration(450)}>
            <GlassCard accent="gold" glow padding={20} animate={false}>
              <View style={{ alignItems: 'center' }}>
                <View style={styles.heroIcon}>
                  <Ionicons name="bulb" size={20} color="#1a1408" />
                </View>
                <Text style={styles.heroTitle}>Pick what we build next.</Text>
                <Text style={styles.heroSub}>Tap the ideas you want most. The roadmap follows your votes.</Text>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
            {ROADMAP_IDEAS.map((idea, i) => {
              const active = selected.includes(idea.title);
              return (
                <Animated.View key={idea.title} entering={FadeInUp.duration(340).delay(i * 60)}>
                  <PressableScale onPress={() => toggle(idea.title)} haptic="selection">
                    <GlassCard accent={active ? 'gold' : 'ghost'} padding={14} animate={false}>
                      <View style={styles.ideaRow}>
                        <View style={[styles.checkBox, active && styles.checkBoxActive]}>
                          {active && <Ionicons name="checkmark" size={14} color="#1a1408" />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.ideaTitle, active && { color: Colors.gold }]}>{idea.title}</Text>
                          <Text style={styles.ideaDesc}>{idea.desc}</Text>
                        </View>
                      </View>
                    </GlassCard>
                  </PressableScale>
                </Animated.View>
              );
            })}
          </View>

          <Animated.View entering={FadeInUp.duration(360).delay(400)} style={{ marginTop: Spacing.lg }}>
            <GlassCard accent="ghost" padding={16} animate={false}>
              <Text style={styles.label}>OPTIONAL — TELL US MORE</Text>
              <TextInput
                style={styles.input}
                value={note}
                onChangeText={setNote}
                placeholder="What's the killer feature we're missing?"
                placeholderTextColor={Colors.textFaint}
                multiline
                textAlignVertical="top"
                maxLength={2000}
              />
            </GlassCard>
          </Animated.View>

          <View style={{ marginTop: Spacing.xl }}>
            <GradientButton
              label={`Submit Vote${selected.length ? ` (${selected.length})` : ''}`}
              icon="send"
              variant="gold"
              size="lg"
              fullWidth
              onPress={handleSubmit}
              loading={loading}
            />
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm, marginBottom: Spacing.md },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderLight,
  },
  topTitle: { color: Colors.gold, fontFamily: Typography.fonts.displayExtra, fontSize: 12, fontWeight: '800', letterSpacing: 2.2 },

  heroIcon: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.gold, shadowOpacity: 0.6, shadowRadius: 14, shadowOffset: { width: 0, height: 0 },
  },
  heroTitle: { color: Colors.text, fontFamily: Typography.fonts.displayExtra, fontSize: 22, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' },
  heroSub: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, lineHeight: 20, textAlign: 'center', marginTop: 8 },

  ideaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkBox: {
    width: 24, height: 24, borderRadius: 8,
    borderWidth: 1.5, borderColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  checkBoxActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  ideaTitle: { color: Colors.text, fontFamily: Typography.fonts.sansBold, fontSize: Typography.sizes.base, fontWeight: '700' },
  ideaDesc: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, lineHeight: 18, marginTop: 3 },

  label: { color: Colors.textMuted, fontFamily: Typography.fonts.display, fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginBottom: Spacing.sm },
  input: {
    color: Colors.text, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.base,
    lineHeight: 22, minHeight: 120,
    borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: Radius.md, padding: Spacing.md,
    backgroundColor: 'rgba(2,8,23,0.6)',
  },

  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  successIcon: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
    shadowColor: Colors.gold, shadowOpacity: 0.7, shadowRadius: 20, shadowOffset: { width: 0, height: 0 },
  },
  successTitle: { color: Colors.text, fontFamily: Typography.fonts.displayExtra, fontSize: 26, fontWeight: '800', letterSpacing: -0.6, textAlign: 'center' },
  successSub: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, lineHeight: 20, textAlign: 'center', marginTop: 10 },
});
