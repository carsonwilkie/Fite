import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import Markdown from 'react-native-markdown-display';

import { Colors, Typography, Spacing, Radius } from '../src/theme';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { ScoreDisplay } from '../src/components/ScoreDisplay';
import { LoadingDots } from '../src/components/LoadingDots';
import { PremiumGate } from '../src/components/PremiumGate';
import { usePaidStatus } from '../src/hooks/usePaidStatus';
import {
  CATEGORIES, DIFFICULTIES, MATH_OPTIONS, INTERVIEW_QUESTIONS, DIFFICULTY_COLORS,
  type Category, type Difficulty, type MathOption,
} from '../src/constants';
import {
  generateInterview, respondToInterview, debriefInterview,
  saveHistory, type InterviewSession, type InterviewResponse,
} from '../src/api';

type Phase = 'setup' | 'loading' | 'active' | 'debrief';

interface QuestionState {
  question: string;
  idealAnswer: string;
  userAnswer: string;
  score?: number;
  response?: string;
  onTrack?: boolean;
}

export default function InterviewScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { isPaid, loading: paidLoading } = usePaidStatus();

  const [category, setCategory] = useState<Category>('Investment Banking');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [math, setMath] = useState<MathOption>('No Math');

  const [phase, setPhase] = useState<Phase>('setup');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [debrief, setDebrief] = useState('');

  if (paidLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.secondary} />
      </View>
    );
  }

  if (!isPaid) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕ Close</Text>
        </TouchableOpacity>
        <PremiumGate message="Interview mode is a Premium feature. Upgrade to run structured 4-question mock interviews with AI feedback." />
      </SafeAreaView>
    );
  }

  async function handleStart() {
    setPhase('loading');
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const result = await generateInterview({ category, difficulty, math, token });
      setSession(result);
      setQuestionStates(
        result.questions.map(q => ({
          question: q.question,
          idealAnswer: q.idealAnswer,
          userAnswer: '',
        }))
      );
      setCurrentStep(0);
      setPhase('active');
    } catch {
      Alert.alert('Error', 'Failed to start interview. Please try again.');
      setPhase('setup');
    }
  }

  async function handleSubmitAnswer() {
    if (!session) return;
    const current = questionStates[currentStep];
    if (!current.userAnswer.trim()) {
      Alert.alert('Answer required', 'Please write an answer before submitting.');
      return;
    }
    setLoadingResponse(true);
    try {
      const token = await getToken();
      if (!token) throw new Error();
      const isLast = currentStep === INTERVIEW_QUESTIONS - 1;
      const result = await respondToInterview({
        scenario: session.scenario,
        questionIndex: currentStep,
        question: current.question,
        idealAnswer: current.idealAnswer,
        userAnswer: current.userAnswer,
        isLast,
        token,
      });

      const updated = [...questionStates];
      updated[currentStep] = { ...current, score: result.score, response: result.response, onTrack: result.onTrack };
      setQuestionStates(updated);

      if (isLast) {
        // Get debrief
        const debriefResult = await debriefInterview({
          scenario: session.scenario,
          questions: updated.map(q => ({ question: q.question, idealAnswer: q.idealAnswer, userAnswer: q.userAnswer })),
          category,
          difficulty,
          token,
        });
        setDebrief(debriefResult.feedback);

        // Save to history
        const avgScore = updated.reduce((sum, q) => sum + (q.score ?? 0), 0) / updated.length;
        await saveHistory({
          type: 'interview',
          scenario: session.scenario,
          questions: updated.map(q => ({
            question: q.question,
            idealAnswer: q.idealAnswer,
            userAnswer: q.userAnswer,
            score: q.score,
            feedback: q.response,
          })),
          score: Math.round(avgScore * 10) / 10,
          category: session.resolvedCategory as Category,
          difficulty,
          math,
          timestamp: Date.now(),
        }, token);

        setPhase('debrief');
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } catch {
      Alert.alert('Error', 'Failed to submit answer. Please try again.');
    } finally {
      setLoadingResponse(false);
    }
  }

  function handleRestart() {
    setPhase('setup');
    setSession(null);
    setQuestionStates([]);
    setCurrentStep(0);
    setDebrief('');
  }

  // ─── Setup phase ──────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>🎤 Mock Interview</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.subtitle}>
            4 structured questions • AI feedback after each • Final debrief
          </Text>

          <Card style={styles.setupCard}>
            {/* Category */}
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              <View style={styles.hPills}>
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.pill, category === c && styles.pillActive]}
                    onPress={() => setCategory(c as Category)}
                  >
                    <Text style={[styles.pillText, category === c && styles.pillTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Difficulty */}
            <Text style={[styles.fieldLabel, { marginTop: Spacing.base }]}>Difficulty</Text>
            <View style={styles.pillRow}>
              {DIFFICULTIES.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.pill, difficulty === d && { borderColor: DIFFICULTY_COLORS[d], backgroundColor: DIFFICULTY_COLORS[d] + '22' }]}
                  onPress={() => setDifficulty(d)}
                >
                  <Text style={[styles.pillText, difficulty === d && { color: DIFFICULTY_COLORS[d] }]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Math */}
            <Text style={[styles.fieldLabel, { marginTop: Spacing.base }]}>Math</Text>
            <View style={styles.pillRow}>
              {MATH_OPTIONS.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.pill, math === m && styles.pillActive]}
                  onPress={() => setMath(m)}
                >
                  <Text style={[styles.pillText, math === m && styles.pillTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Button label="Start Interview" onPress={handleStart} size="lg" style={styles.startBtn} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Loading phase ────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <View style={styles.center}>
        <LoadingDots />
        <Text style={styles.loadingText}>Preparing your interview...</Text>
      </View>
    );
  }

  // ─── Active phase ─────────────────────────────────────────────────────────
  if (phase === 'active' && session) {
    const current = questionStates[currentStep];
    const prevQ = currentStep > 0 ? questionStates[currentStep - 1] : null;

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Progress */}
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>Question {currentStep + 1} of {INTERVIEW_QUESTIONS}</Text>
            <View style={styles.progressDots}>
              {Array.from({ length: INTERVIEW_QUESTIONS }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i < currentStep && styles.dotDone,
                    i === currentStep && styles.dotCurrent,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Scenario (first question only) */}
          {currentStep === 0 && (
            <Card style={styles.scenarioCard}>
              <Text style={styles.scenarioLabel}>Scenario</Text>
              <Text style={styles.scenarioText}>{session.scenario}</Text>
            </Card>
          )}

          {/* Interviewer response to previous question */}
          {prevQ?.response && (
            <Card style={styles.responseCard}>
              <Text style={styles.responseLabel}>Interviewer</Text>
              <Text style={styles.responseText}>{prevQ.response}</Text>
              {prevQ.score !== undefined && (
                <View style={styles.responseScore}>
                  <ScoreDisplay score={prevQ.score} size="sm" />
                  <Text style={[styles.onTrack, { color: prevQ.onTrack ? Colors.success : Colors.warning }]}>
                    {prevQ.onTrack ? '✓ On track' : '⚠ Off track'}
                  </Text>
                </View>
              )}
            </Card>
          )}

          {/* Current question */}
          <Card glow style={styles.questionCard}>
            <Text style={styles.questionText}>{current.question}</Text>
          </Card>

          {/* Answer input */}
          <Card style={styles.answerCard}>
            <Text style={styles.fieldLabel}>Your Answer</Text>
            <TextInput
              style={styles.answerInput}
              value={current.userAnswer}
              onChangeText={(text) => {
                const updated = [...questionStates];
                updated[currentStep] = { ...current, userAnswer: text };
                setQuestionStates(updated);
              }}
              placeholder="Type your answer..."
              placeholderTextColor={Colors.textFaint}
              multiline
              textAlignVertical="top"
            />
          </Card>

          <Button
            label={loadingResponse ? 'Submitting...' : (currentStep < INTERVIEW_QUESTIONS - 1 ? 'Submit & Next →' : 'Submit Final Answer')}
            onPress={handleSubmitAnswer}
            loading={loadingResponse}
            size="lg"
            style={styles.submitBtn}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Debrief phase ────────────────────────────────────────────────────────
  if (phase === 'debrief') {
    const avgScore = questionStates.reduce((s, q) => s + (q.score ?? 0), 0) / questionStates.length;

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Interview Complete</Text>

          {/* Overall score */}
          <Card gold style={styles.overallCard}>
            <Text style={styles.overallLabel}>Overall Score</Text>
            <ScoreDisplay score={Math.round(avgScore * 10) / 10} />
          </Card>

          {/* Per-question breakdown */}
          {questionStates.map((q, i) => (
            <Card key={i} style={styles.qBreakdownCard}>
              <View style={styles.qBreakdownHeader}>
                <Text style={styles.qBreakdownNum}>Q{i + 1}</Text>
                {q.score !== undefined && <ScoreDisplay score={q.score} size="sm" />}
              </View>
              <Text style={styles.qBreakdownQ}>{q.question}</Text>
              {q.response && <Text style={styles.qBreakdownResponse}>{q.response}</Text>}
            </Card>
          ))}

          {/* AI Debrief */}
          <Card style={styles.debriefCard}>
            <Text style={styles.fieldLabel}>AI Debrief</Text>
            <Markdown style={markdownStyles}>{debrief}</Markdown>
          </Card>

          <Button label="New Interview" onPress={handleRestart} size="lg" style={styles.startBtn} />
          <Button label="Close" onPress={() => router.back()} variant="ghost" size="lg" />

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const markdownStyles = {
  body: { color: Colors.text, fontSize: Typography.sizes.base, lineHeight: 24 },
  strong: { color: Colors.text, fontWeight: Typography.weights.bold },
  bullet_list: { marginLeft: Spacing.base },
  list_item: { color: Colors.text, lineHeight: 24 },
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.base, flexGrow: 1 },
  center: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center', gap: Spacing.base },
  loadingText: { color: Colors.textMuted, fontSize: Typography.sizes.base },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  closeBtn: { padding: Spacing.sm },
  closeBtnText: { color: Colors.textMuted, fontSize: Typography.sizes.base },
  title: { color: Colors.text, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, textAlign: 'center' },
  subtitle: { color: Colors.textMuted, fontSize: Typography.sizes.sm, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 20 },

  setupCard: { marginBottom: Spacing.xl },
  fieldLabel: { color: Colors.textMuted, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm },
  hScroll: { marginHorizontal: -Spacing.xs },
  hPills: { flexDirection: 'row', gap: Spacing.xs, paddingHorizontal: Spacing.xs },
  pillRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  pill: { borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.sm, paddingVertical: 5 },
  pillActive: { backgroundColor: Colors.secondary + '22', borderColor: Colors.secondary },
  pillText: { color: Colors.textMuted, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  pillTextActive: { color: Colors.secondary },
  startBtn: { marginBottom: Spacing.sm },

  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.base },
  progressText: { color: Colors.textMuted, fontSize: Typography.sizes.sm },
  progressDots: { flexDirection: 'row', gap: Spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotDone: { backgroundColor: Colors.success },
  dotCurrent: { backgroundColor: Colors.secondary },

  scenarioCard: { backgroundColor: Colors.surfaceAlt, marginBottom: Spacing.base },
  scenarioLabel: { color: Colors.secondary, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.xs },
  scenarioText: { color: Colors.text, fontSize: Typography.sizes.base, lineHeight: 22 },

  responseCard: { backgroundColor: Colors.surfaceAlt, marginBottom: Spacing.base, borderColor: Colors.secondary + '44' },
  responseLabel: { color: Colors.secondary, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.xs },
  responseText: { color: Colors.text, fontSize: Typography.sizes.base, lineHeight: 22 },
  responseScore: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  onTrack: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },

  questionCard: { marginBottom: Spacing.base },
  questionText: { color: Colors.text, fontSize: Typography.sizes.md, lineHeight: 26, fontWeight: Typography.weights.medium },

  answerCard: { marginBottom: Spacing.base },
  answerInput: {
    color: Colors.text, fontSize: Typography.sizes.base, lineHeight: 22,
    minHeight: 120, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.sm, backgroundColor: Colors.bg,
  },
  submitBtn: { marginBottom: Spacing.sm },

  overallCard: { alignItems: 'center', padding: Spacing.xl, marginBottom: Spacing.base },
  overallLabel: { color: Colors.gold, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.base },

  qBreakdownCard: { marginBottom: Spacing.sm },
  qBreakdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  qBreakdownNum: { color: Colors.textMuted, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, textTransform: 'uppercase' },
  qBreakdownQ: { color: Colors.text, fontSize: Typography.sizes.sm, lineHeight: 20, marginBottom: Spacing.xs },
  qBreakdownResponse: { color: Colors.textMuted, fontSize: Typography.sizes.sm, lineHeight: 18 },

  debriefCard: { marginBottom: Spacing.base },
});
