import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Alert, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { Background } from '../src/components/Background';
import { GlassCard } from '../src/components/GlassCard';
import { GradientButton } from '../src/components/GradientButton';
import { PressableScale } from '../src/components/PressableScale';
import { ScoreDisplay } from '../src/components/ScoreDisplay';
import { LoadingDots } from '../src/components/LoadingDots';
import { SimpleMarkdown } from '../src/components/SimpleMarkdown';
import { usePaidStatus } from '../src/hooks/usePaidStatus';
import { Colors, Spacing, Typography, Radius } from '../src/theme';
import { DIFFICULTY_COLORS } from '../src/constants';
import {
  getIBQuestions, getIBProgress, saveIBProgress, resetIBProgress, gradeAnswer, generateAnswer,
  IBQuestion,
} from '../src/api';

export default function IBQuestionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getToken } = useAuth();
  const { isPaid } = usePaidStatus();

  const [question, setQuestion] = useState<IBQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [loadingA, setLoadingA] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [graded, setGraded] = useState(false);
  const [loadingGrade, setLoadingGrade] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return;
      const [qs, pr] = await Promise.all([getIBQuestions(token), getIBProgress(token)]);
      const q = qs.find(x => x.id === id) ?? null;
      setQuestion(q);
      const prev = pr[id as string];
      if (prev && typeof prev.score === 'number') {
        setScore(prev.score);
        setGraded(true);
      }
      setLoading(false);
    })();
  }, [id, getToken]);

  async function handleReveal() {
    if (!question || revealed) return;
    setRevealed(true);
    setLoadingA(true);
    setAnswer('');
    try {
      const token = await getToken();
      const ans = await generateAnswer({
        question: question.question,
        category: question.category,
        difficulty: question.difficulty,
        math: 'No Math',
        token: token ?? undefined,
        onChunk: (text) => setAnswer(text),
      });
      setAnswer(ans);
    } catch {
      Alert.alert('Error', 'Failed to load model answer.'); setRevealed(false);
    } finally {
      setLoadingA(false);
    }
  }

  async function handleGrade() {
    if (!question) return;
    if (!isPaid) {
      Alert.alert('Premium feature', 'AI grading requires Fite Premium.', [
        { text: 'Maybe later', style: 'cancel' },
        { text: 'Upgrade', onPress: () => router.replace('/paywall') },
      ]);
      return;
    }
    if (!userAnswer.trim()) {
      Alert.alert('Write an answer first', 'Type your answer before grading.');
      return;
    }
    setLoadingGrade(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const result = await gradeAnswer({
        question: question.question,
        userAnswer,
        idealAnswer: answer,
        token,
      });
      setFeedback(result.feedback);
      setScore(result.score);
      setGraded(true);
      await saveIBProgress({ questionId: question.id, score: result.score, token });
    } catch {
      Alert.alert('Error', 'Failed to grade answer.');
    } finally {
      setLoadingGrade(false);
    }
  }

  async function handleRetry() {
    setUserAnswer(''); setAnswer(''); setRevealed(false); setFeedback(''); setGraded(false); setScore(null);
    try {
      const token = await getToken();
      if (token && question) await resetIBProgress(question.id, token);
    } catch {}
  }

  if (loading || !question) {
    return (
      <Background>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loadingWrap}>
            <LoadingDots />
            <Text style={styles.loadingText}>Loading question…</Text>
          </View>
        </SafeAreaView>
      </Background>
    );
  }

  const dColor = DIFFICULTY_COLORS[question.difficulty as keyof typeof DIFFICULTY_COLORS];

  return (
    <Background variant="hero">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <PressableScale onPress={() => router.back()} haptic="selection" containerStyle={styles.closeBtn}>
            <Ionicons name="chevron-down" size={22} color={Colors.text} />
          </PressableScale>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>IB · {question.id.toUpperCase()}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(400)}>
            <View style={styles.tagRow}>
              <View style={[styles.chip, { borderColor: dColor + '55', backgroundColor: dColor + '1a' }]}>
                <Text style={[styles.chipText, { color: dColor }]}>{question.difficulty}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>{question.category}</Text>
              </View>
            </View>
            <Text style={styles.question}>{question.question}</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(400).delay(80)} style={{ marginTop: Spacing.xl }}>
            <GlassCard accent="ghost" padding={16} animate={false}>
              <Text style={styles.label}>YOUR ANSWER</Text>
              <TextInput
                style={styles.input}
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder="Type your answer…"
                placeholderTextColor={Colors.textFaint}
                multiline
                textAlignVertical="top"
                editable={!graded}
              />
              <View style={styles.actionRow}>
                <View style={{ flex: 1 }}>
                  <GradientButton
                    label={revealed ? 'Answer Shown' : 'Reveal Answer'}
                    icon="eye-outline"
                    variant="ghost"
                    onPress={handleReveal}
                    loading={loadingA}
                    disabled={revealed}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <GradientButton
                    label={graded ? 'Graded' : 'Grade Answer'}
                    icon={graded ? 'checkmark-circle' : 'analytics'}
                    onPress={handleGrade}
                    loading={loadingGrade}
                    disabled={graded}
                  />
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {revealed && (
            <Animated.View entering={FadeInUp.duration(400)} style={{ marginTop: Spacing.base }}>
              <GlassCard accent="ghost" padding={18} animate={false}>
                <Text style={styles.label}>MODEL ANSWER</Text>
                {loadingA && !answer ? (
                  <View style={styles.loadingRow}>
                    <LoadingDots />
                    <Text style={styles.loadingText}>Drafting…</Text>
                  </View>
                ) : (
                  <SimpleMarkdown>{answer}</SimpleMarkdown>
                )}
              </GlassCard>
            </Animated.View>
          )}

          {graded && score !== null && (
            <Animated.View entering={FadeInUp.duration(450).springify()} style={{ marginTop: Spacing.base }}>
              <GlassCard accent="gold" glow padding={20} animate={false}>
                <Text style={styles.label}>{feedback ? 'AI FEEDBACK' : 'SAVED SCORE'}</Text>
                <View style={{ alignItems: 'center', gap: 12 }}>
                  <ScoreDisplay score={score} />
                  {feedback ? (
                    <Text style={styles.feedback}>{feedback}</Text>
                  ) : (
                    <Text style={styles.feedbackMuted}>
                      You've already graded this question. Retry to answer again and update your score.
                    </Text>
                  )}
                  <GradientButton
                    label="Retry question"
                    icon="refresh"
                    variant="ghost"
                    onPress={handleRetry}
                    size="sm"
                  />
                </View>
              </GlassCard>
            </Animated.View>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderLight,
  },
  topBarCenter: { flex: 1, alignItems: 'center' },
  topBarTitle: {
    color: Colors.secondary,
    fontFamily: Typography.fonts.displayExtra,
    fontSize: 12, fontWeight: '800', letterSpacing: 2.2,
  },

  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: 80 },

  tagRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.md, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  chipText: {
    color: Colors.textMuted, fontFamily: Typography.fonts.display,
    fontSize: 10, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase',
  },
  question: {
    color: Colors.text, fontFamily: Typography.fonts.displaySemibold,
    fontSize: Typography.sizes.lg, lineHeight: 28, fontWeight: '600',
  },

  label: {
    color: Colors.textMuted, fontFamily: Typography.fonts.display,
    fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginBottom: Spacing.sm,
  },
  input: {
    color: Colors.text, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.base,
    lineHeight: 22, minHeight: 140, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: Radius.md, padding: Spacing.md,
    backgroundColor: 'rgba(2,8,23,0.6)',
  },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },

  feedback: { color: Colors.text, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.base, lineHeight: 22, textAlign: 'center' },
  feedbackMuted: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, lineHeight: 20, textAlign: 'center' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  loadingText: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm },
});
