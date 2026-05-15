import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SimpleMarkdown } from '../src/components/SimpleMarkdown';
import { Background } from '../src/components/Background';
import { GlassCard } from '../src/components/GlassCard';
import { GradientButton } from '../src/components/GradientButton';
import { PressableScale } from '../src/components/PressableScale';
import { Pill } from '../src/components/Pill';
import { SectionHeader } from '../src/components/SectionHeader';
import { ScoreDisplay } from '../src/components/ScoreDisplay';
import { LoadingDots } from '../src/components/LoadingDots';
import { PremiumGate } from '../src/components/PremiumGate';
import { usePaidStatus } from '../src/hooks/usePaidStatus';
import {
  CATEGORIES, DIFFICULTIES, MATH_OPTIONS, INTERVIEW_QUESTIONS, DIFFICULTY_COLORS,
  CATEGORY_ICONS,
  type Category, type Difficulty, type MathOption,
} from '../src/constants';
import {
  generateInterview, respondToInterview, debriefInterview,
  saveHistory, type InterviewSession,
} from '../src/api';
import { Colors, Typography, Spacing, Radius, Gradients } from '../src/theme';

type Phase = 'setup' | 'loading' | 'active' | 'debrief';

interface QState {
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
  const [qStates, setQStates] = useState<QState[]>([]);
  const [step, setStep] = useState(0);
  const [loadingResp, setLoadingResp] = useState(false);
  const [debrief, setDebrief] = useState('');

  if (paidLoading) {
    return (
      <Background>
        <View style={styles.center}><ActivityIndicator color={Colors.secondary} /></View>
      </Background>
    );
  }

  if (!isPaid) {
    return (
      <Background variant="hero">
        <SafeAreaView style={styles.safe}>
          <TopBar onClose={() => router.back()} title="MOCK INTERVIEW" />
          <PremiumGate message="Interview mode is a Premium feature. Upgrade to run structured 4-question mock interviews with AI feedback." />
        </SafeAreaView>
      </Background>
    );
  }

  async function handleStart() {
    setPhase('loading');
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const result = await generateInterview({ category, difficulty, math, token });
      setSession(result);
      setQStates(result.questions.map(q => ({ question: q.question, idealAnswer: q.idealAnswer, userAnswer: '' })));
      setStep(0);
      setPhase('active');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {
      Alert.alert('Error', 'Failed to start interview.');
      setPhase('setup');
    }
  }

  async function handleSubmit() {
    if (!session) return;
    const current = qStates[step];
    if (!current.userAnswer.trim()) {
      Alert.alert('Answer required', 'Please write an answer before submitting.');
      return;
    }
    setLoadingResp(true);
    try {
      const token = await getToken();
      if (!token) throw new Error();
      const isLast = step === INTERVIEW_QUESTIONS - 1;
      const result = await respondToInterview({
        scenario: session.scenario,
        questionIndex: step,
        question: current.question,
        idealAnswer: current.idealAnswer,
        userAnswer: current.userAnswer,
        isLast, token,
      });
      const updated = [...qStates];
      updated[step] = { ...current, score: result.score, response: result.response, onTrack: result.onTrack };
      setQStates(updated);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

      if (isLast) {
        const dResult = await debriefInterview({
          scenario: session.scenario,
          questions: updated.map(q => ({ question: q.question, idealAnswer: q.idealAnswer, userAnswer: q.userAnswer })),
          category, difficulty, token,
        });
        setDebrief(dResult.feedback);
        const avg = updated.reduce((s, q) => s + (q.score ?? 0), 0) / updated.length;
        await saveHistory({
          type: 'interview',
          scenario: session.scenario,
          questions: updated.map(q => ({
            question: q.question, idealAnswer: q.idealAnswer,
            userAnswer: q.userAnswer, score: q.score, feedback: q.response,
          })),
          score: Math.round(avg * 10) / 10,
          category: session.resolvedCategory as Category,
          difficulty, math, timestamp: Date.now(),
        }, token);
        setPhase('debrief');
      } else {
        setStep(s => s + 1);
      }
    } catch {
      Alert.alert('Error', 'Failed to submit answer.');
    } finally {
      setLoadingResp(false);
    }
  }

  function handleRestart() {
    setPhase('setup'); setSession(null); setQStates([]); setStep(0); setDebrief('');
  }

  // ─── Setup ──
  if (phase === 'setup') {
    return (
      <Background variant="hero">
        <SafeAreaView style={styles.safe}>
          <TopBar onClose={() => router.back()} title="MOCK INTERVIEW" />
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.duration(500)}>
              <GlassCard accent="cyan" glow padding={24} animate={false}>
                <View style={{ alignItems: 'center' }}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="mic" size={28} color={Colors.bgDeep} />
                  </View>
                  <Text style={styles.setupTitle}>4 questions. One scenario.</Text>
                  <Text style={styles.setupSub}>
                    Structured mock interview with mid-question feedback, on-track tracking, and a final debrief.
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>

            <SectionHeader eyebrow="STEP 1" title="Category" style={{ marginTop: Spacing.xl }} />
            <GlassCard accent="ghost" padding={14} animate={false}>
              <View style={styles.catGrid}>
                {CATEGORIES.filter(c => c !== 'All').map(c => {
                  const active = category === c;
                  return (
                    <PressableScale
                      key={c}
                      onPress={() => setCategory(c as Category)}
                      haptic="selection"
                      containerStyle={[styles.catChip, active && styles.catChipActive]}
                    >
                      <Ionicons
                        name={(CATEGORY_ICONS[c] as any) ?? 'apps-outline'}
                        size={14}
                        color={active ? Colors.secondary : Colors.textMuted}
                      />
                      <Text style={[styles.catChipText, active && { color: Colors.secondary }]} numberOfLines={1}>{c}</Text>
                    </PressableScale>
                  );
                })}
              </View>
            </GlassCard>

            <SectionHeader eyebrow="STEP 2" title="Difficulty & math" style={{ marginTop: Spacing.lg }} />
            <GlassCard accent="ghost" padding={16} animate={false}>
              <Text style={styles.miniLabel}>DIFFICULTY</Text>
              <View style={styles.pillRow}>
                {DIFFICULTIES.map(d => (
                  <Pill key={d} label={d} active={difficulty === d} color={DIFFICULTY_COLORS[d]} onPress={() => setDifficulty(d)} />
                ))}
              </View>
              <Text style={[styles.miniLabel, { marginTop: Spacing.md }]}>MATH</Text>
              <View style={styles.pillRow}>
                {MATH_OPTIONS.map(m => (
                  <Pill key={m} label={m} active={math === m} onPress={() => setMath(m)} icon={m === 'With Math' ? 'calculator' : 'chatbubble-ellipses'} />
                ))}
              </View>
            </GlassCard>

            <View style={{ marginTop: Spacing.xl }}>
              <GradientButton label="Start Interview" icon="play" onPress={handleStart} size="lg" fullWidth />
            </View>
            <View style={{ height: 60 }} />
          </ScrollView>
        </SafeAreaView>
      </Background>
    );
  }

  // ─── Loading ──
  if (phase === 'loading') {
    return (
      <Background variant="hero">
        <SafeAreaView style={styles.safe}>
          <TopBar onClose={() => router.back()} title="MOCK INTERVIEW" />
          <View style={styles.center}>
            <LoadingDots />
            <Text style={styles.loadingText}>Preparing your interviewer…</Text>
            <Text style={styles.loadingSub}>Scenario · 4 questions · personalized to {category}</Text>
          </View>
        </SafeAreaView>
      </Background>
    );
  }

  // ─── Active ──
  if (phase === 'active' && session) {
    const current = qStates[step];
    const prevQ = step > 0 ? qStates[step - 1] : null;
    const progress = (step) / INTERVIEW_QUESTIONS;

    return (
      <Background variant="hero">
        <SafeAreaView style={styles.safe}>
          <TopBar onClose={() => router.back()} title={`QUESTION ${step + 1} / ${INTERVIEW_QUESTIONS}`} />
          <View style={styles.progressBar}>
            <LinearGradient
              colors={Gradients.cyan as any}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${Math.max(progress, 0.05) * 100}%` }]}
            />
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {step === 0 && (
              <Animated.View entering={FadeInUp.duration(400)}>
                <GlassCard accent="ghost" padding={18} animate={false}>
                  <Text style={styles.miniLabel}>SCENARIO</Text>
                  <Text style={styles.scenarioText}>{session.scenario}</Text>
                </GlassCard>
              </Animated.View>
            )}

            {prevQ?.response && (
              <Animated.View entering={FadeInUp.duration(400)} style={{ marginTop: Spacing.base }}>
                <GlassCard accent="cyan" padding={16} animate={false}>
                  <View style={styles.respHeader}>
                    <View style={styles.respAvatar}>
                      <Ionicons name="person" size={14} color={Colors.bgDeep} />
                    </View>
                    <Text style={styles.respLabel}>INTERVIEWER</Text>
                    {prevQ.score !== undefined && (
                      <View style={[styles.onTrackPill, { backgroundColor: (prevQ.onTrack ? Colors.success : Colors.warning) + '22', borderColor: prevQ.onTrack ? Colors.success : Colors.warning }]}>
                        <Ionicons name={prevQ.onTrack ? 'checkmark' : 'alert'} size={11} color={prevQ.onTrack ? Colors.success : Colors.warning} />
                        <Text style={[styles.onTrackText, { color: prevQ.onTrack ? Colors.success : Colors.warning }]}>{prevQ.onTrack ? 'ON TRACK' : 'OFF TRACK'}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.respText}>{prevQ.response}</Text>
                </GlassCard>
              </Animated.View>
            )}

            <Animated.View
              key={step}
              entering={FadeInUp.duration(420).springify()}
              layout={Layout.springify()}
              style={{ marginTop: Spacing.base }}
            >
              <GlassCard accent="cyan" glow padding={20} animate={false}>
                <Text style={styles.qLabel}>Q{step + 1}.</Text>
                <Text style={styles.qText}>{current.question}</Text>
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(400).delay(80)} style={{ marginTop: Spacing.base }}>
              <GlassCard accent="ghost" padding={16} animate={false}>
                <Text style={styles.miniLabel}>YOUR RESPONSE</Text>
                <TextInput
                  style={styles.answerInput}
                  value={current.userAnswer}
                  onChangeText={(text) => {
                    const u = [...qStates]; u[step] = { ...current, userAnswer: text }; setQStates(u);
                  }}
                  placeholder="Walk the interviewer through it…"
                  placeholderTextColor={Colors.textFaint}
                  multiline textAlignVertical="top"
                />
              </GlassCard>
            </Animated.View>

            <View style={{ marginTop: Spacing.lg }}>
              <GradientButton
                label={step < INTERVIEW_QUESTIONS - 1 ? 'Submit & Next' : 'Submit Final Answer'}
                iconRight={step < INTERVIEW_QUESTIONS - 1 ? 'arrow-forward' : 'flag'}
                onPress={handleSubmit}
                loading={loadingResp}
                size="lg"
                fullWidth
              />
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>
        </SafeAreaView>
      </Background>
    );
  }

  // ─── Debrief ──
  if (phase === 'debrief') {
    const avg = qStates.reduce((s, q) => s + (q.score ?? 0), 0) / qStates.length;
    return (
      <Background variant="hero">
        <SafeAreaView style={styles.safe}>
          <TopBar onClose={() => router.back()} title="DEBRIEF" />
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeIn.duration(500)}>
              <GlassCard accent="gold" glow padding={24} animate={false}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.overallLabel}>OVERALL SCORE</Text>
                  <ScoreDisplay score={Math.round(avg * 10) / 10} />
                  <Text style={styles.overallSub}>{INTERVIEW_QUESTIONS} questions · {category} · {difficulty}</Text>
                </View>
              </GlassCard>
            </Animated.View>

            <SectionHeader eyebrow="BREAKDOWN" title="Per-question scores" style={{ marginTop: Spacing.xl }} />
            {qStates.map((q, i) => (
              <Animated.View key={i} entering={FadeInUp.duration(360).delay(i * 60)} style={{ marginBottom: Spacing.sm }}>
                <GlassCard accent="ghost" padding={14} animate={false}>
                  <View style={styles.qBreakRow}>
                    <View style={styles.qBreakNum}>
                      <Text style={styles.qBreakNumText}>Q{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.qBreakQ} numberOfLines={2}>{q.question}</Text>
                      {q.response && <Text style={styles.qBreakResp} numberOfLines={3}>{q.response}</Text>}
                    </View>
                    {q.score !== undefined && <ScoreDisplay score={q.score} size="sm" />}
                  </View>
                </GlassCard>
              </Animated.View>
            ))}

            <SectionHeader eyebrow="COACH" title="AI debrief" style={{ marginTop: Spacing.lg }} />
            <GlassCard accent="ghost" padding={18} animate={false}>
              <SimpleMarkdown>{debrief}</SimpleMarkdown>
            </GlassCard>

            <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
              <GradientButton label="New Interview" icon="refresh" onPress={handleRestart} size="lg" fullWidth />
              <GradientButton label="Close" onPress={() => router.back()} variant="ghost" size="lg" fullWidth />
            </View>
            <View style={{ height: 60 }} />
          </ScrollView>
        </SafeAreaView>
      </Background>
    );
  }
  return null;
}

function TopBar({ onClose, title }: { onClose: () => void; title: string }) {
  return (
    <View style={styles.topBar}>
      <PressableScale onPress={onClose} haptic="selection" containerStyle={styles.closeBtn}>
        <Ionicons name="close" size={22} color={Colors.text} />
      </PressableScale>
      <Text style={styles.topBarTitle}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.base },
  loadingText: { color: Colors.text, fontFamily: Typography.fonts.sansBold, fontSize: Typography.sizes.base },
  loadingSub: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: 60 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.lg,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderLight,
  },
  topBarTitle: { color: Colors.secondary, fontFamily: Typography.fonts.displayExtra, fontSize: 12, fontWeight: '800', letterSpacing: 2.2 },

  progressBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: Spacing.base, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 3, borderRadius: 2 },

  // Setup
  iconCircle: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.secondary,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
    shadowColor: Colors.secondary, shadowOpacity: 0.7, shadowRadius: 14, shadowOffset: { width: 0, height: 0 },
  },
  setupTitle: { color: Colors.text, fontFamily: Typography.fonts.displayExtra, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  setupSub: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, textAlign: 'center', lineHeight: 20, marginTop: Spacing.sm, paddingHorizontal: Spacing.base },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  catChipActive: { backgroundColor: 'rgba(79,195,247,0.14)', borderColor: Colors.secondary },
  catChipText: { color: Colors.textMuted, fontFamily: Typography.fonts.sansSemibold, fontSize: 12, fontWeight: '600' },
  miniLabel: { color: Colors.textMuted, fontFamily: Typography.fonts.display, fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginBottom: Spacing.sm },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  // Active
  scenarioText: { color: Colors.text, fontFamily: Typography.fonts.sansMedium, fontSize: Typography.sizes.base, lineHeight: 22 },
  respHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  respAvatar: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  respLabel: { color: Colors.secondary, fontFamily: Typography.fonts.displayExtra, fontSize: 10, fontWeight: '800', letterSpacing: 1.6, flex: 1 },
  respText: { color: Colors.text, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, lineHeight: 20 },
  onTrackPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  onTrackText: { fontFamily: Typography.fonts.displayExtra, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },

  qLabel: { color: Colors.secondary, fontFamily: Typography.fonts.displayExtra, fontSize: 12, fontWeight: '800', letterSpacing: 1.8, marginBottom: 8 },
  qText: { color: Colors.text, fontFamily: Typography.fonts.displaySemibold, fontSize: Typography.sizes.md, fontWeight: '600', lineHeight: 26 },
  answerInput: {
    color: Colors.text, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.base, lineHeight: 22,
    minHeight: 140, borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: Radius.md, padding: Spacing.md, backgroundColor: 'rgba(2,8,23,0.6)',
  },

  // Debrief
  overallLabel: { color: Colors.gold, fontFamily: Typography.fonts.displayExtra, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: Spacing.md },
  overallSub: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, marginTop: Spacing.sm },
  qBreakRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  qBreakNum: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(79,195,247,0.14)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(79,195,247,0.3)',
  },
  qBreakNumText: { color: Colors.secondary, fontFamily: Typography.fonts.displayExtra, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  qBreakQ: { color: Colors.text, fontFamily: Typography.fonts.sansMedium, fontSize: Typography.sizes.sm, lineHeight: 19 },
  qBreakResp: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: 12, lineHeight: 17, marginTop: 4 },
});
