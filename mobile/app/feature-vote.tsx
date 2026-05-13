import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

import { Colors, Typography, Spacing, Radius } from '../src/theme';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { PremiumGate } from '../src/components/PremiumGate';
import { usePaidStatus } from '../src/hooks/usePaidStatus';
import { submitFeedback } from '../src/api';

const ROADMAP_IDEAS = [
  { id: 'adaptive', label: 'Adaptive Difficulty', desc: 'Questions that adjust to your performance over time' },
  { id: 'live', label: 'Live Mock Interviews', desc: 'Real-time sessions with AI playing a senior interviewer' },
  { id: 'analytics', label: 'Deep Analytics', desc: 'Advanced breakdowns by question type, time of day, and more' },
  { id: 'study', label: 'Guided Study Plans', desc: 'Curated weekly practice plans based on your target role' },
  { id: 'modeling', label: 'Modeling Practice', desc: 'Guided financial model walkthroughs and case studies' },
  { id: 'leaderboard', label: 'Peer Leaderboards', desc: 'See how your scores compare with other candidates' },
];

export default function FeatureVoteScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { isPaid } = usePaidStatus();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isPaid) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕ Close</Text>
        </TouchableOpacity>
        <PremiumGate message="Feature voting is for Premium members." />
      </SafeAreaView>
    );
  }

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  async function handleVote() {
    if (!selected.length) { Alert.alert('Select at least one feature to vote for.'); return; }
    setLoading(true);
    try {
      const token = await getToken();
      const labels = selected.map(id => ROADMAP_IDEAS.find(r => r.id === id)?.label ?? id);
      await submitFeedback({ type: 'vote', message: `Voted for: ${labels.join(', ')}`, token: token ?? undefined });
      setSubmitted(true);
    } catch {
      Alert.alert('Error', 'Could not submit your vote. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>🗳️</Text>
          <Text style={styles.successTitle}>Vote submitted!</Text>
          <Text style={styles.successText}>Your input shapes the Fite roadmap. Thanks for voting.</Text>
          <Button label="Close" onPress={() => router.back()} style={{ width: '100%' }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Feature Voting</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subtitle}>
          Vote for the features you want most. Select all that apply.
        </Text>

        {ROADMAP_IDEAS.map(idea => {
          const isSelected = selected.includes(idea.id);
          return (
            <TouchableOpacity key={idea.id} onPress={() => toggle(idea.id)} activeOpacity={0.8}>
              <Card style={[styles.ideaCard, isSelected && styles.ideaCardSelected]}>
                <View style={styles.ideaRow}>
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.ideaText}>
                    <Text style={[styles.ideaLabel, isSelected && styles.ideaLabelSelected]}>{idea.label}</Text>
                    <Text style={styles.ideaDesc}>{idea.desc}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}

        <Button
          label={`Submit Vote${selected.length ? ` (${selected.length})` : ''}`}
          onPress={handleVote}
          loading={loading}
          size="lg"
          style={styles.submitBtn}
        />

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.base },
  closeBtn: { padding: Spacing.base },
  closeBtnText: { color: Colors.textMuted, fontSize: Typography.sizes.base },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.base },
  close: { color: Colors.textMuted, fontSize: Typography.sizes.lg },
  title: { color: Colors.text, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
  subtitle: { color: Colors.textMuted, fontSize: Typography.sizes.base, lineHeight: 22, marginBottom: Spacing.xl },

  ideaCard: { marginBottom: Spacing.sm },
  ideaCardSelected: { borderColor: Colors.secondary, backgroundColor: Colors.secondary + '11' },
  ideaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.base },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  checkboxSelected: { borderColor: Colors.secondary, backgroundColor: Colors.secondary },
  checkmark: { color: Colors.bg, fontSize: 13, fontWeight: Typography.weights.bold },
  ideaText: { flex: 1 },
  ideaLabel: { color: Colors.text, fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, marginBottom: 3 },
  ideaLabelSelected: { color: Colors.secondary },
  ideaDesc: { color: Colors.textMuted, fontSize: Typography.sizes.sm, lineHeight: 18 },

  submitBtn: { marginTop: Spacing.base },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  successIcon: { fontSize: 64, marginBottom: Spacing.base },
  successTitle: { color: Colors.text, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, marginBottom: Spacing.sm },
  successText: { color: Colors.textMuted, fontSize: Typography.sizes.base, textAlign: 'center', marginBottom: Spacing.xl },
});
