import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  interpolate,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors, Typography, Spacing, Radius, Gradients, Motion } from '../../src/theme';
import { Background } from '../../src/components/Background';
import { GlassCard } from '../../src/components/GlassCard';
import { GradientButton } from '../../src/components/GradientButton';
import { Pill } from '../../src/components/Pill';
import { InfoButton, InfoSheet } from '../../src/components/InfoBadge';
import { SectionHeader } from '../../src/components/SectionHeader';
import { BrandLogo } from '../../src/components/BrandLogo';
import { PressableScale } from '../../src/components/PressableScale';
import { LoadingDots } from '../../src/components/LoadingDots';
import { ScoreDisplay } from '../../src/components/ScoreDisplay';
import { SimpleMarkdown } from '../../src/components/SimpleMarkdown';
import { usePaidStatus } from '../../src/hooks/usePaidStatus';
import {
  CATEGORIES, QUESTION_DIFFICULTIES, MATH_OPTIONS, TIMER_PRESETS,
  DIFFICULTY_COLORS, CATEGORY_ICONS, FREE_DAILY_LIMIT,
  type Category, type QuestionDifficulty, type MathOption,
} from '../../src/constants';
import {
  generateQuestion, generateAnswer, gradeAnswer, saveHistory,
} from '../../src/api';

const HISTORY_CACHE_KEY = 'fite_questionHistory';
const HISTORY_24H = 24 * 60 * 60 * 1000;

export default function DashboardScreen() {
  const { getToken } = useAuth();
  const router = useRouter();
  const { isPaid } = usePaidStatus();

  // Controls
  const [category, setCategory] = useState<Category>('All');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('Medium');
  const [math, setMath] = useState<MathOption>('No Math');
  const [customPrompt, setCustomPrompt] = useState('');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerPreset, setTimerPreset] = useState<number>(120);

  // Session snapshots
  const [snap, setSnap] = useState({ category: 'All' as Category, difficulty: 'Medium' as QuestionDifficulty, math: 'No Math' as MathOption });

  // Question state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [graded, setGraded] = useState(false);

  const [loadingQ, setLoadingQ] = useState(false);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingGrade, setLoadingGrade] = useState(false);

  const [questionsUsed, setQuestionsUsed] = useState<number | null>(null);
  const [questionsLimit, setQuestionsLimit] = useState<number | null>(null);

  // Timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimerRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimerStarted(false);
    setTimeLeft(timerPreset);
  }
  function startTimer() {
    setTimeLeft(timerPreset);
    setTimerStarted(true);
    setTimerRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }
  function formatTime(s: number) {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }

  async function getRecentQuestions(): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_CACHE_KEY);
      if (!raw) return [];
      const entries: { question: string; timestamp: number }[] = JSON.parse(raw);
      const cutoff = Date.now() - HISTORY_24H;
      return entries.filter(e => e.timestamp > cutoff).map(e => e.question);
    } catch { return []; }
  }
  async function cacheQuestion(q: string) {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_CACHE_KEY);
      const entries: { question: string; timestamp: number }[] = raw ? JSON.parse(raw) : [];
      entries.unshift({ question: q, timestamp: Date.now() });
      const cutoff = Date.now() - HISTORY_24H;
      const pruned = entries.filter(e => e.timestamp > cutoff).slice(0, 100);
      await AsyncStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(pruned));
    } catch {}
  }

  async function handleGenerate() {
    setLoadingQ(true);
    setQuestion(''); setAnswer(''); setUserAnswer(''); setFeedback('');
    setScore(null); setAnswerRevealed(false); setGraded(false);
    resetTimer();
    setSnap({ category, difficulty, math });

    try {
      const token = await getToken();
      console.log('Token present:', !!token, '| category:', category, '| difficulty:', difficulty);
      const recent = await getRecentQuestions();
      let result: { question: string; questionsUsed?: number; questionsLimit?: number } = { question: '' };
      let attempts = 0;
      while (attempts < 5) {
        result = await generateQuestion({
          category, difficulty, math,
          customPrompt: isPaid && difficulty !== 'OTG' ? customPrompt : undefined,
          token: token ?? undefined,
          onChunk: (text) => setQuestion(text),
        });
        if (!recent.some(r => r.slice(0, 60) === result.question.slice(0, 60))) break;
        attempts++;
      }
      if (result.question) {
        setQuestion(result.question);
        await cacheQuestion(result.question);
        if (result.questionsUsed !== undefined) setQuestionsUsed(result.questionsUsed);
        if (result.questionsLimit !== undefined) setQuestionsLimit(result.questionsLimit);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    } catch (e: any) {
      const msg = e?.message ?? '';
      console.log('Generate question error:', msg, JSON.stringify(e));
      if (msg.includes('limit') || msg.includes('429')) {
        Alert.alert('Daily limit reached', 'Free users get 5 questions/day. Upgrade for unlimited access.');
      } else {
        Alert.alert('Error', msg || 'Failed to generate question. Please try again.');
      }
    } finally {
      setLoadingQ(false);
    }
  }

  async function handleRevealAnswer() {
    if (!question) return;
    setLoadingA(true); setAnswerRevealed(true); setAnswer('');
    try {
      const token = await getToken();
      const ans = await generateAnswer({
        question, category: snap.category, difficulty: snap.difficulty, math: snap.math,
        token: token ?? undefined,
        onChunk: (text) => setAnswer(text),
      });
      setAnswer(ans);
    } catch {
      Alert.alert('Error', 'Failed to generate answer.'); setAnswerRevealed(false);
    } finally { setLoadingA(false); }
  }

  async function handleGrade() {
    if (!isPaid) {
      Alert.alert('Premium feature', 'AI grading requires Fite Premium.', [
        { text: 'Maybe later', style: 'cancel' },
        { text: 'Upgrade', onPress: () => router.push('/paywall') },
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
      const result = await gradeAnswer({ question, userAnswer, idealAnswer: answer, token });
      setFeedback(result.feedback); setScore(result.score); setGraded(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      const timeTaken = timerStarted ? timerPreset - timeLeft : undefined;
      await saveHistory({
        question, answer, userAnswer,
        feedback: result.feedback, score: result.score,
        category: snap.category, difficulty: snap.difficulty, math: snap.math,
        customPrompt: customPrompt || undefined,
        timeTaken, timeRemaining: timerEnabled ? timeLeft : undefined,
        timestamp: Date.now(),
      }, token);
    } catch {
      Alert.alert('Error', 'Failed to grade answer.');
    } finally {
      setLoadingGrade(false);
    }
  }

  const isOTG = difficulty === 'OTG';

  return (
    <Background variant="hero">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header — logo row */}
          <Animated.View entering={FadeIn.duration(400)} style={styles.headerLogoRow}>
            <BrandLogo size="md" premium={isPaid} />
          </Animated.View>

          {/* Header — actions row */}
          <Animated.View entering={FadeIn.duration(400).delay(60)} style={styles.headerActionsRow}>
            {!isPaid && (
              <PressableScale onPress={() => router.push('/paywall')} haptic="selection">
                <LinearGradient
                  colors={Gradients.gold as any}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.upgradePill}
                >
                  <Ionicons name="diamond" size={11} color="#1a1408" />
                  <Text style={styles.upgradeText}>UPGRADE</Text>
                </LinearGradient>
              </PressableScale>
            )}
            <View style={{ flex: 1 }} />
            <PressableScale
              onPress={() => router.push('/interview')}
              haptic="selection"
              containerStyle={styles.interviewBtn}
            >
              <View style={styles.interviewBtnInner}>
                <Ionicons name="mic-outline" size={18} color={Colors.secondary} />
                <Text style={styles.interviewBtnLabel}>Interview</Text>
                <View style={styles.interviewDivider} />
                <InfoButton
                  eyebrow="Mock Interview"
                  body="Premium feature. Run a 4-question structured mock interview with a scenario, mid-question on-track feedback, scores, and a final AI debrief."
                  variant="dot"
                />
              </View>
            </PressableScale>
          </Animated.View>

          {/* Hero / quota */}
          <Animated.View entering={FadeInDown.duration(450).delay(80)}>
            <GlassCard accent="cyan" padding={20} animate={false} style={styles.heroCard}>
              <View>
                <Text style={styles.heroEyebrow}>
                  {isPaid ? 'PREMIUM · UNLIMITED' : `FREE · ${questionsUsed ?? 0}/${questionsLimit ?? FREE_DAILY_LIMIT} TODAY`}
                </Text>
                <Text style={styles.heroTitle}>
                  Drill <Text style={{ color: Colors.secondary }}>any</Text> finance question.
                </Text>
                <Text style={styles.heroSubtitle}>
                  AI-generated questions across 7 categories and 4 difficulty tiers with model answers and AI grading.
                </Text>
                {!isPaid && questionsUsed !== null && (
                  <QuotaBar used={questionsUsed} limit={questionsLimit ?? FREE_DAILY_LIMIT} />
                )}
              </View>
            </GlassCard>
          </Animated.View>

          {/* Controls section */}
          <SectionHeader
            eyebrow="STEP 1"
            title="Build your session"
            subtitle="Lock in category, difficulty, and math inclusion."
            style={{ marginTop: Spacing.xl }}
          />

          {/* Category */}
          <PressableScale onPress={() => setShowCategoryPicker(true)} haptic="selection">
            <GlassCard accent="ghost" padding={16} animate={false} style={styles.controlBlock}>
              <View style={styles.controlRow}>
                <View style={styles.controlIconWrap}>
                  <Ionicons
                    name={(CATEGORY_ICONS[category] as any) ?? 'apps-outline'}
                    size={20}
                    color={Colors.secondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.controlLabel}>CATEGORY</Text>
                  <Text style={styles.controlValue}>{category}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textFaint} />
              </View>
            </GlassCard>
          </PressableScale>

          {/* Difficulty */}
          <GlassCard accent="ghost" padding={16} animate={false} style={styles.controlBlock}>
            <Text style={styles.miniLabel}>DIFFICULTY</Text>
            <View style={styles.pillRow}>
              {QUESTION_DIFFICULTIES.map(d =>
                d === 'OTG' ? (
                  <OtgCompoundPill
                    key={d}
                    active={difficulty === d}
                    onPress={() => setDifficulty(d)}
                  />
                ) : (
                  <Pill
                    key={d}
                    label={d}
                    active={difficulty === d}
                    color={DIFFICULTY_COLORS[d]}
                    onPress={() => setDifficulty(d)}
                  />
                )
              )}
            </View>
          </GlassCard>

          {/* Math */}
          <GlassCard accent="ghost" padding={16} animate={false} style={styles.controlBlock}>
            <Text style={styles.miniLabel}>MATH</Text>
            <View style={styles.pillRow}>
              {MATH_OPTIONS.map(m => (
                <Pill
                  key={m}
                  label={m}
                  active={math === m}
                  icon={m === 'With Math' ? 'calculator' : 'chatbubble-ellipses'}
                  onPress={() => setMath(m)}
                />
              ))}
            </View>
          </GlassCard>

          {/* Custom focus (premium, not OTG) */}
          {isPaid && !isOTG && (
            <GlassCard accent="gold" padding={16} animate={false} style={styles.controlBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.miniLabel}>CUSTOM FOCUS</Text>
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={8} color="#1a1408" />
                  <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                </View>
              </View>
              <TextInput
                style={styles.customInput}
                value={customPrompt}
                onChangeText={setCustomPrompt}
                placeholder="e.g. LBO modeling, DCF sensitivity, M&A synergies…"
                placeholderTextColor={Colors.textFaint}
                maxLength={200}
              />
            </GlassCard>
          )}

          {/* Timer */}
          {isPaid && (
            <GlassCard accent="ghost" padding={16} animate={false} style={styles.controlBlock}>
              <View style={styles.labelRow}>
                <View>
                  <Text style={styles.miniLabel}>TIMER</Text>
                  <Text style={styles.controlValue}>{timerEnabled ? `${timerPreset / 60}m countdown` : 'Off'}</Text>
                </View>
                <Toggle value={timerEnabled} onChange={(v) => { setTimerEnabled(v); resetTimer(); }} />
              </View>
              {timerEnabled && (
                <Animated.View entering={FadeIn.duration(200)} style={styles.presetRow}>
                  {TIMER_PRESETS.map(t => (
                    <Pill
                      key={t}
                      label={t < 60 ? `${t}s` : `${t / 60}m`}
                      active={timerPreset === t}
                      onPress={() => { setTimerPreset(t); resetTimer(); }}
                      small
                    />
                  ))}
                </Animated.View>
              )}
            </GlassCard>
          )}

          {/* Generate */}
          <View style={{ marginTop: Spacing.lg }}>
            <GradientButton
              label={question ? 'Generate New Question' : 'Generate Question'}
              icon={question ? 'refresh' : 'sparkles'}
              onPress={handleGenerate}
              loading={loadingQ}
              size="lg"
              fullWidth
              haptic="medium"
            />
          </View>

          {/* Timer display */}
          {timerEnabled && question && (
            <Animated.View entering={FadeInUp.duration(300)} style={{ marginTop: Spacing.base }}>
              <GlassCard accent={timeLeft <= 30 && timerStarted ? 'gold' : 'cyan'} padding={14} animate={false}>
                <View style={styles.timerRow}>
                  <View style={styles.timerLeft}>
                    <Ionicons
                      name="timer-outline"
                      size={18}
                      color={timeLeft <= 30 && timerStarted ? Colors.error : Colors.secondary}
                    />
                    <Text style={[
                      styles.timerTime,
                      timeLeft <= 30 && timerStarted && { color: Colors.error },
                    ]}>
                      {timerStarted ? formatTime(timeLeft) : formatTime(timerPreset)}
                    </Text>
                  </View>
                  {!timerStarted ? (
                    <GradientButton label="Start" onPress={startTimer} size="sm" icon="play" />
                  ) : (
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <GradientButton
                        label={timerRunning ? 'Pause' : 'Resume'}
                        onPress={() => setTimerRunning(!timerRunning)}
                        size="sm"
                        variant="ghost"
                      />
                      <GradientButton label="Reset" onPress={resetTimer} size="sm" variant="ghost" />
                    </View>
                  )}
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Question display */}
          {(question || loadingQ) && (
            <Animated.View
              entering={FadeInUp.duration(400).springify()}
              layout={Layout.springify()}
              style={{ marginTop: Spacing.xl }}
            >
              <SectionHeader eyebrow="STEP 2" title="Your prompt" />
              <GlassCard accent="cyan" glow padding={20} animate={false}>
                {question && (
                  <View style={styles.tagRow}>
                    <TagChip label={snap.category} />
                    <TagChip label={snap.difficulty} color={DIFFICULTY_COLORS[snap.difficulty]} />
                    <TagChip label={snap.math} />
                  </View>
                )}
                {loadingQ && !question ? (
                  <View style={styles.loadingRow}>
                    <LoadingDots />
                    <Text style={styles.loadingText}>Crafting question…</Text>
                  </View>
                ) : (
                  <Text style={styles.questionText}>{question}</Text>
                )}
              </GlassCard>
            </Animated.View>
          )}

          {/* Answer input */}
          {question && !loadingQ && (
            <Animated.View entering={FadeInUp.duration(400).delay(80)} style={{ marginTop: Spacing.base }}>
              <GlassCard accent="ghost" padding={16} animate={false}>
                <Text style={styles.sectionLabel}>YOUR ANSWER</Text>
                <TextInput
                  style={styles.answerInput}
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  placeholder="Type your answer here…"
                  placeholderTextColor={Colors.textFaint}
                  multiline
                  textAlignVertical="top"
                  editable={!graded}
                />
                <View style={styles.actionRow}>
                  <View style={{ flex: 1 }}>
                    <GradientButton
                      label={answerRevealed ? 'Answer Shown' : 'Reveal Answer'}
                      onPress={handleRevealAnswer}
                      variant="ghost"
                      loading={loadingA}
                      disabled={answerRevealed}
                      size="md"
                      icon="eye-outline"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <GradientButton
                      label={graded ? 'Graded' : 'Grade Answer'}
                      onPress={handleGrade}
                      loading={loadingGrade}
                      disabled={graded}
                      size="md"
                      icon={graded ? 'checkmark-circle' : 'analytics'}
                    />
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Model answer */}
          {answerRevealed && (
            <Animated.View entering={FadeInUp.duration(400)} style={{ marginTop: Spacing.base }}>
              <GlassCard accent="ghost" padding={18} animate={false}>
                <Text style={styles.sectionLabel}>MODEL ANSWER</Text>
                {loadingA && !answer ? (
                  <View style={styles.loadingRow}>
                    <LoadingDots />
                    <Text style={styles.loadingText}>Drafting model answer…</Text>
                  </View>
                ) : (
                  <SimpleMarkdown>{answer}</SimpleMarkdown>
                )}
              </GlassCard>
            </Animated.View>
          )}

          {/* Grade result */}
          {graded && score !== null && (
            <Animated.View
              entering={FadeInUp.duration(500).springify()}
              style={{ marginTop: Spacing.base }}
            >
              <GlassCard accent="gold" glow padding={20} animate={false}>
                <Text style={styles.sectionLabel}>AI FEEDBACK</Text>
                <View style={styles.gradeRow}>
                  <ScoreDisplay score={score} />
                  <Text style={styles.feedbackText}>{feedback}</Text>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Category picker modal */}
        <Modal
          visible={showCategoryPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <Pressable onPress={() => setShowCategoryPicker(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </Pressable>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.duration(280).delay(index * 25)}>
                  <PressableScale
                    onPress={() => { setCategory(item); setShowCategoryPicker(false); }}
                    haptic="selection"
                    containerStyle={[styles.catItem, category === item && styles.catItemActive]}
                  >
                    <View style={styles.catIcon}>
                      <Ionicons
                        name={(CATEGORY_ICONS[item] as any) ?? 'apps-outline'}
                        size={22}
                        color={category === item ? Colors.secondary : Colors.textMuted}
                      />
                    </View>
                    <Text style={[styles.catLabel, category === item && { color: Colors.secondary, fontFamily: Typography.fonts.sansBold }]}>
                      {item}
                    </Text>
                    {category === item && (
                      <Ionicons name="checkmark-circle" size={22} color={Colors.secondary} />
                    )}
                  </PressableScale>
                </Animated.View>
              )}
            />
          </View>
        </Modal>
      </SafeAreaView>
    </Background>
  );
}

/**
 * Compound pill for the OTG difficulty option. Looks like a single pill with
 * a vertical divider inside: [ OTG │ ⓘ ]. Left half selects difficulty, right
 * half opens the info sheet. Shares one border + background tint so the info
 * affordance reads as part of the OTG control, not a separate sibling.
 */
function OtgCompoundPill({ active, onPress }: { active: boolean; onPress: () => void }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const tint = DIFFICULTY_COLORS.OTG;

  const activeAnim = useSharedValue(active ? 1 : 0);
  const pressLeft = useSharedValue(0);
  const pressRight = useSharedValue(0);

  useEffect(() => {
    activeAnim.value = withTiming(active ? 1 : 0, { duration: 240, easing: Easing.out(Easing.cubic) });
  }, [active, activeAnim]);

  const glowStyle = useAnimatedStyle(() => {
    const p = Math.max(pressLeft.value, pressRight.value);
    return {
      shadowOpacity: interpolate(activeAnim.value + p * 0.5, [0, 1.5], [0, 0.55], 'clamp'),
      shadowRadius: interpolate(activeAnim.value, [0, 1], [4, 7]),
      transform: [{ scale: 1 - p * 0.04 }],
    };
  });

  const wrapStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(activeAnim.value, [0, 1], ['rgba(255,255,255,0.02)', tint + '14']);
    const border = interpolateColor(activeAnim.value, [0, 1], [Colors.border, tint]);
    return { backgroundColor: bg, borderColor: border };
  });

  const leftBgStyle = useAnimatedStyle(() => ({
    backgroundColor: tint,
    opacity: pressLeft.value * 0.18,
  }));
  const rightBgStyle = useAnimatedStyle(() => ({
    backgroundColor: tint,
    opacity: pressRight.value * 0.22,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(activeAnim.value, [0, 1], [Colors.textMuted, tint]),
  }));
  const dividerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(activeAnim.value, [0, 1], ['rgba(255,255,255,0.32)', tint + 'aa']),
  }));

  return (
    <>
      <Animated.View style={[styles.otgGlowWrap, { shadowColor: tint }, glowStyle]}>
      <Animated.View style={[styles.otgWrap, wrapStyle]}>
        <Pressable
          onPress={() => { Haptics.selectionAsync().catch(() => {}); onPress(); }}
          onPressIn={() => { pressLeft.value = withSpring(1, { damping: 16, stiffness: 320, mass: 0.55 }); }}
          onPressOut={() => { pressLeft.value = withTiming(0, { duration: 220 }); }}
          style={styles.otgLeft}
        >
          <Animated.View style={[StyleSheet.absoluteFill, leftBgStyle]} pointerEvents="none" />
          <Animated.Text style={[styles.otgLabel, labelStyle]}>OTG</Animated.Text>
        </Pressable>
        <Animated.View style={[styles.otgDivider, dividerStyle]} />
        <Pressable
          onPress={() => { Haptics.selectionAsync().catch(() => {}); setInfoOpen(true); }}
          onPressIn={() => { pressRight.value = withSpring(1, { damping: 16, stiffness: 320, mass: 0.55 }); }}
          onPressOut={() => { pressRight.value = withTiming(0, { duration: 220 }); }}
          style={styles.otgRight}
          hitSlop={6}
        >
          <Animated.View style={[StyleSheet.absoluteFill, rightBgStyle]} pointerEvents="none" />
          <Ionicons name="information" size={11} color={active ? tint : Colors.textMuted} />
        </Pressable>
      </Animated.View>
      </Animated.View>
      <InfoSheet
        visible={infoOpen}
        onClose={() => setInfoOpen(false)}
        eyebrow="OTG · On The Go"
        body="Quick one-line questions — short definitions, term comparisons, or finance brain-teasers. Built for fast reps, not deep dives."
      />
    </>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <PressableScale
      onPress={() => onChange(!value)}
      haptic="selection"
      scaleTo={0.9}
      containerStyle={[styles.toggle, value && styles.toggleOn]}
    >
      <View style={[styles.toggleKnob, value && styles.toggleKnobOn]} />
    </PressableScale>
  );
}

function TagChip({ label, color }: { label: string; color?: string }) {
  return (
    <View
      style={[
        styles.tagChip,
        color && { borderColor: color + '66', backgroundColor: color + '1a' },
      ]}
    >
      <Text style={[styles.tagText, color && { color }]}>{label}</Text>
    </View>
  );
}

function QuotaBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min(1, used / limit);
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse]);
  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <View style={styles.quotaWrap}>
      <View style={styles.quotaTrack}>
        <LinearGradient
          colors={Gradients.cyan as any}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.quotaFill, { width: `${pct * 100}%` }]}
        />
        <Animated.View style={[styles.quotaTip, { left: `${pct * 100}%` }, style]} />
      </View>
      <Text style={styles.quotaText}>
        {limit - used} of {limit} free questions remaining today
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base, paddingBottom: 120 },

  // Header
  headerLogoRow: {
    marginBottom: Spacing.sm,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  upgradePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    gap: 5,
  },
  upgradeText: {
    fontFamily: Typography.fonts.displayExtra,
    fontSize: 10,
    color: '#1a1408',
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(79,195,247,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(79,195,247,0.35)',
  },
  // Header Interview button — pill shape with mic + label + integrated info dot.
  interviewBtn: {
    borderRadius: 9999,
    backgroundColor: 'rgba(79,195,247,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(79,195,247,0.35)',
  },
  interviewBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 7,
  },
  interviewBtnLabel: {
    color: Colors.secondary,
    fontFamily: Typography.fonts.displaySemibold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  interviewDivider: {
    width: StyleSheet.hairlineWidth,
    height: 16,
    backgroundColor: 'rgba(79,195,247,0.35)',
    marginHorizontal: 2,
  },

  // Hero
  heroCard: { marginBottom: Spacing.xs },
  heroEyebrow: {
    color: Colors.secondary,
    fontFamily: Typography.fonts.display,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.4,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    color: Colors.text,
    fontFamily: Typography.fonts.displayExtra,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.7,
    lineHeight: 31,
  },
  heroSubtitle: {
    color: Colors.textMuted,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    lineHeight: 19,
    marginTop: Spacing.sm,
  },

  // Quota
  quotaWrap: { marginTop: Spacing.base },
  quotaTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'visible',
    position: 'relative',
  },
  quotaFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3 },
  quotaTip: {
    position: 'absolute',
    top: -4, width: 14, height: 14,
    borderRadius: 7,
    backgroundColor: Colors.secondary,
    marginLeft: -7,
    shadowColor: Colors.secondary,
    shadowOpacity: 0.9, shadowRadius: 8,
  },
  quotaText: {
    color: Colors.textMuted,
    fontFamily: Typography.fonts.sans,
    fontSize: 11,
    marginTop: 8,
  },

  // Controls
  controlBlock: { marginTop: Spacing.sm },
  controlRow: { flexDirection: 'row', alignItems: 'center' },
  controlIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(79,195,247,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(79,195,247,0.25)',
  },
  controlLabel: {
    color: Colors.textMuted,
    fontFamily: Typography.fonts.display,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  controlValue: {
    color: Colors.text,
    fontFamily: Typography.fonts.sansSemibold,
    fontSize: Typography.sizes.base,
  },
  miniLabel: {
    color: Colors.textMuted,
    fontFamily: Typography.fonts.display,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, alignItems: 'center' },

  // Compound OTG pill — shares one border with the info affordance inside it.
  otgGlowWrap: {
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  otgWrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.02)',
    overflow: 'hidden',
  },
  otgLeft: {
    paddingLeft: Spacing.md,
    paddingRight: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otgLabel: {
    color: Colors.textMuted,
    fontFamily: Typography.fonts.displaySemibold,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  otgDivider: {
    width: 1.5,
    alignSelf: 'stretch',
    marginVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 1,
  },
  otgRight: {
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Stacked soft halos behind the compound pill — concentric tinted rings
  // approximate a feathered radial glow.
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.gold,
    gap: 4,
  },
  premiumBadgeText: {
    fontFamily: Typography.fonts.displayExtra,
    fontSize: 9,
    color: '#1a1408',
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  customInput: {
    backgroundColor: 'rgba(2,8,23,0.6)',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
  },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: Spacing.sm },

  toggle: {
    width: 48, height: 26, borderRadius: 13,
    backgroundColor: Colors.border, justifyContent: 'center', paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: Colors.secondary },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.white, alignSelf: 'flex-start' },
  toggleKnobOn: { alignSelf: 'flex-end' },

  // Timer
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  timerTime: {
    color: Colors.secondary,
    fontFamily: Typography.fonts.displayExtra,
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },

  // Question
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  tagChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  tagText: {
    color: Colors.textMuted,
    fontFamily: Typography.fonts.display,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  questionText: {
    color: Colors.text,
    fontFamily: Typography.fonts.sansMedium,
    fontSize: Typography.sizes.md,
    lineHeight: 26,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  loadingText: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm },

  // Answer
  sectionLabel: {
    color: Colors.textMuted,
    fontFamily: Typography.fonts.display,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: Spacing.sm,
  },
  answerInput: {
    color: Colors.text,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    lineHeight: 22,
    minHeight: 120,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(2,8,23,0.6)',
  },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },

  // Grade
  gradeRow: { gap: Spacing.base, alignItems: 'center' },
  feedbackText: {
    color: Colors.text,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.base,
    lineHeight: 22,
    textAlign: 'center',
  },

  // Modal
  modalContainer: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
  },
  modalTitle: {
    color: Colors.text,
    fontFamily: Typography.fonts.displayExtra,
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
  },
  modalClose: {
    color: Colors.secondary,
    fontFamily: Typography.fonts.sansBold,
    fontSize: Typography.sizes.base,
    fontWeight: '700',
  },
  catItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(30,58,95,0.4)',
    gap: Spacing.md,
  },
  catItemActive: { backgroundColor: 'rgba(79,195,247,0.06)' },
  catIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(79,195,247,0.08)',
  },
  catLabel: { color: Colors.text, fontFamily: Typography.fonts.sansMedium, fontSize: Typography.sizes.base, flex: 1 },
});
