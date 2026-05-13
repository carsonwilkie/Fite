import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors, Typography, Spacing, Radius } from '../../src/theme';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { LoadingDots } from '../../src/components/LoadingDots';
import { ScoreDisplay } from '../../src/components/ScoreDisplay';
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
  const { user } = useUser();
  const router = useRouter();
  const { isPaid } = usePaidStatus();

  // ─── Controls ───────────────────────────────────────────────────────────────
  const [category, setCategory] = useState<Category>('All');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('Medium');
  const [math, setMath] = useState<MathOption>('No Math');
  const [customPrompt, setCustomPrompt] = useState('');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerPreset, setTimerPreset] = useState(120);

  // ─── Session snapshots (locked at generation time) ──────────────────────────
  const [snapCategory, setSnapCategory] = useState<Category>('All');
  const [snapDifficulty, setSnapDifficulty] = useState<QuestionDifficulty>('Medium');
  const [snapMath, setSnapMath] = useState<MathOption>('No Math');

  // ─── Question state ──────────────────────────────────────────────────────────
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

  // ─── Timer state ─────────────────────────────────────────────────────────────
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // ─── Modals ──────────────────────────────────────────────────────────────────
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ─── Timer logic ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
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
    startTimeRef.current = Date.now();
    setTimerRunning(true);
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ─── Anti-repeat cache ───────────────────────────────────────────────────────
  async function getRecentQuestions(): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_CACHE_KEY);
      if (!raw) return [];
      const entries: { question: string; timestamp: number }[] = JSON.parse(raw);
      const cutoff = Date.now() - HISTORY_24H;
      return entries.filter(e => e.timestamp > cutoff).map(e => e.question);
    } catch {
      return [];
    }
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

  // ─── Generate question ───────────────────────────────────────────────────────
  async function handleGenerate() {
    setLoadingQ(true);
    setQuestion('');
    setAnswer('');
    setUserAnswer('');
    setFeedback('');
    setScore(null);
    setAnswerRevealed(false);
    setGraded(false);
    resetTimer();

    // Snapshot controls
    setSnapCategory(category);
    setSnapDifficulty(difficulty);
    setSnapMath(math);

    try {
      const token = await getToken();
      const recent = await getRecentQuestions();

      let result = { question: '', questionsUsed: undefined as number | undefined, questionsLimit: undefined as number | undefined };
      let attempts = 0;

      while (attempts < 5) {
        result = await generateQuestion({
          category,
          difficulty,
          math,
          customPrompt: isPaid && difficulty !== 'OTG' ? customPrompt : undefined,
          token: token ?? undefined,
          onChunk: (text) => setQuestion(text),
        });

        // Check if it's a repeat
        if (!recent.some(r => r.slice(0, 60) === result.question.slice(0, 60))) break;
        attempts++;
      }

      if (result.question) {
        setQuestion(result.question);
        await cacheQuestion(result.question);
        if (result.questionsUsed !== undefined) setQuestionsUsed(result.questionsUsed);
        if (result.questionsLimit !== undefined) setQuestionsLimit(result.questionsLimit);
      }
    } catch (e: any) {
      const msg = e.message ?? '';
      if (msg.includes('limit') || msg.includes('429')) {
        Alert.alert('Daily limit reached', 'Free users get 5 questions/day. Upgrade for unlimited access.');
      } else {
        Alert.alert('Error', 'Failed to generate question. Please try again.');
      }
    } finally {
      setLoadingQ(false);
    }
  }

  // ─── Reveal answer ───────────────────────────────────────────────────────────
  async function handleRevealAnswer() {
    if (!question) return;
    setLoadingA(true);
    setAnswerRevealed(true);
    setAnswer('');
    try {
      const token = await getToken();
      const ans = await generateAnswer({
        question,
        category: snapCategory,
        difficulty: snapDifficulty,
        math: snapMath,
        token: token ?? undefined,
        onChunk: (text) => setAnswer(text),
      });
      setAnswer(ans);
    } catch {
      Alert.alert('Error', 'Failed to generate answer. Please try again.');
      setAnswerRevealed(false);
    } finally {
      setLoadingA(false);
    }
  }

  // ─── Grade answer ────────────────────────────────────────────────────────────
  async function handleGrade() {
    if (!isPaid) {
      Alert.alert('Premium Feature', 'AI grading requires Fite Premium.', [
        { text: 'Cancel', style: 'cancel' },
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
      setFeedback(result.feedback);
      setScore(result.score);
      setGraded(true);

      // Save to history
      const timeTaken = timerStarted ? timerPreset - timeLeft : undefined;
      await saveHistory(
        {
          question,
          answer,
          userAnswer,
          feedback: result.feedback,
          score: result.score,
          category: snapCategory,
          difficulty: snapDifficulty,
          math: snapMath,
          customPrompt: customPrompt || undefined,
          timeTaken,
          timeRemaining: timerEnabled ? timeLeft : undefined,
          timestamp: Date.now(),
        },
        token
      );
    } catch {
      Alert.alert('Error', 'Failed to grade answer. Please try again.');
    } finally {
      setLoadingGrade(false);
    }
  }

  const isOTG = difficulty === 'OTG';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Practice</Text>
          {!isPaid && questionsUsed !== null && (
            <View style={styles.usageBadge}>
              <Text style={styles.usageText}>
                {questionsUsed}/{questionsLimit ?? FREE_DAILY_LIMIT} today
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={() => router.push('/interview')} style={styles.interviewBtn}>
            <Text style={styles.interviewBtnText}>🎤 Interview</Text>
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <Card style={styles.controlsCard} noPad>
          {/* Category */}
          <TouchableOpacity
            style={styles.controlRow}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={styles.controlLabel}>Category</Text>
            <View style={styles.controlValue}>
              <Text style={styles.controlValueText}>
                {CATEGORY_ICONS[category] ?? '📊'} {category}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Difficulty */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Difficulty</Text>
            <View style={styles.pillRow}>
              {QUESTION_DIFFICULTIES.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.pill,
                    difficulty === d && { backgroundColor: DIFFICULTY_COLORS[d] + '33', borderColor: DIFFICULTY_COLORS[d] },
                  ]}
                  onPress={() => setDifficulty(d)}
                >
                  <Text
                    style={[styles.pillText, difficulty === d && { color: DIFFICULTY_COLORS[d] }]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.separator} />

          {/* Math */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Math</Text>
            <View style={styles.pillRow}>
              {MATH_OPTIONS.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.pill,
                    math === m && styles.pillActive,
                  ]}
                  onPress={() => setMath(m)}
                >
                  <Text style={[styles.pillText, math === m && styles.pillTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom descriptor (premium only, not OTG) */}
          {isPaid && !isOTG && (
            <>
              <View style={styles.separator} />
              <View style={[styles.controlRow, { flexDirection: 'column', alignItems: 'flex-start', gap: Spacing.xs }]}>
                <Text style={styles.controlLabel}>Custom Focus <Text style={styles.premiumTag}>PREMIUM</Text></Text>
                <TextInput
                  style={styles.customInput}
                  value={customPrompt}
                  onChangeText={setCustomPrompt}
                  placeholder="e.g. LBO modeling, DCF sensitivity..."
                  placeholderTextColor={Colors.textFaint}
                  maxLength={200}
                />
              </View>
            </>
          )}

          {/* Timer toggle (premium only) */}
          {isPaid && (
            <>
              <View style={styles.separator} />
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Timer <Text style={styles.premiumTag}>PREMIUM</Text></Text>
                <TouchableOpacity
                  onPress={() => {
                    setTimerEnabled(!timerEnabled);
                    resetTimer();
                  }}
                  style={[styles.toggle, timerEnabled && styles.toggleOn]}
                >
                  <View style={[styles.toggleKnob, timerEnabled && styles.toggleKnobOn]} />
                </TouchableOpacity>
              </View>
              {timerEnabled && (
                <View style={[styles.controlRow, { paddingTop: 0, paddingBottom: Spacing.md }]}>
                  <View style={styles.timerPresets}>
                    {TIMER_PRESETS.map(t => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.presetPill, timerPreset === t && styles.presetPillActive]}
                        onPress={() => { setTimerPreset(t); resetTimer(); }}
                      >
                        <Text style={[styles.presetText, timerPreset === t && styles.presetTextActive]}>
                          {t < 60 ? `${t}s` : `${t / 60}m`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </Card>

        {/* Generate button */}
        <Button
          label={question ? 'New Question' : 'Generate Question'}
          onPress={handleGenerate}
          loading={loadingQ}
          style={styles.generateBtn}
          size="lg"
        />

        {/* Timer display */}
        {timerEnabled && question && (
          <Card style={styles.timerCard}>
            <View style={styles.timerRow}>
              <Text style={[
                styles.timerTime,
                timeLeft <= 30 && timerStarted && { color: Colors.error },
              ]}>
                {timerStarted ? formatTime(timeLeft) : formatTime(timerPreset)}
              </Text>
              {!timerStarted ? (
                <Button label="Start" onPress={startTimer} size="sm" style={styles.timerBtn} />
              ) : (
                <View style={styles.timerBtns}>
                  <Button
                    label={timerRunning ? 'Pause' : 'Resume'}
                    onPress={() => setTimerRunning(!timerRunning)}
                    size="sm"
                    variant="ghost"
                    style={styles.timerBtn}
                  />
                  <Button label="Reset" onPress={resetTimer} size="sm" variant="ghost" style={styles.timerBtn} />
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Question display */}
        {(question || loadingQ) && (
          <Card glow style={styles.questionCard}>
            {/* Snapshot tags */}
            {question && (
              <View style={styles.tags}>
                <TagBadge label={snapCategory} />
                <TagBadge label={snapDifficulty} color={DIFFICULTY_COLORS[snapDifficulty]} />
                <TagBadge label={snapMath} />
              </View>
            )}

            {loadingQ && !question ? (
              <View style={styles.loadingRow}>
                <LoadingDots />
                <Text style={styles.loadingText}>Generating question...</Text>
              </View>
            ) : (
              <Text style={styles.questionText}>{question}</Text>
            )}
          </Card>
        )}

        {/* User answer input */}
        {question && !loadingQ && (
          <Card style={styles.answerCard}>
            <Text style={styles.sectionLabel}>Your Answer</Text>
            <TextInput
              style={styles.answerInput}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Type your answer here..."
              placeholderTextColor={Colors.textFaint}
              multiline
              textAlignVertical="top"
              editable={!graded}
            />
            <View style={styles.actionRow}>
              <Button
                label={answerRevealed ? 'Answer Shown' : 'Reveal Answer'}
                onPress={handleRevealAnswer}
                variant="ghost"
                loading={loadingA}
                disabled={answerRevealed}
                style={styles.actionBtn}
                size="sm"
              />
              <Button
                label={graded ? 'Graded ✓' : 'Grade My Answer'}
                onPress={handleGrade}
                loading={loadingGrade}
                disabled={graded}
                style={styles.actionBtn}
                size="sm"
              />
            </View>
          </Card>
        )}

        {/* Model answer */}
        {answerRevealed && (
          <Card style={styles.modelAnswerCard}>
            <Text style={styles.sectionLabel}>Model Answer</Text>
            {loadingA && !answer ? (
              <View style={styles.loadingRow}>
                <LoadingDots />
                <Text style={styles.loadingText}>Generating answer...</Text>
              </View>
            ) : (
              <Markdown style={markdownStyles}>{answer}</Markdown>
            )}
          </Card>
        )}

        {/* Grade result */}
        {graded && score !== null && (
          <Card gold style={styles.gradeCard}>
            <Text style={styles.sectionLabel}>AI Feedback</Text>
            <View style={styles.gradeRow}>
              <ScoreDisplay score={score} />
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          </Card>
        )}

        {/* Bottom padding */}
        <View style={{ height: Spacing.xxl }} />
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
            <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={CATEGORIES}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.categoryItem, category === item && styles.categoryItemActive]}
                onPress={() => { setCategory(item); setShowCategoryPicker(false); }}
              >
                <Text style={styles.categoryIcon}>{CATEGORY_ICONS[item] ?? '📊'}</Text>
                <Text style={[styles.categoryLabel, category === item && styles.categoryLabelActive]}>
                  {item}
                </Text>
                {category === item && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function TagBadge({ label, color }: { label: string; color?: string }) {
  return (
    <View style={[tagStyles.badge, color && { borderColor: color + '66', backgroundColor: color + '22' }]}>
      <Text style={[tagStyles.text, color && { color }]}>{label}</Text>
    </View>
  );
}

const tagStyles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginRight: Spacing.xs,
  },
  text: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

const markdownStyles = {
  body: { color: Colors.text, fontSize: Typography.sizes.base, lineHeight: 24 },
  heading2: { color: Colors.secondary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, marginTop: Spacing.base, marginBottom: Spacing.xs },
  bullet_list: { marginLeft: Spacing.base },
  list_item: { color: Colors.text, fontSize: Typography.sizes.base, lineHeight: 24 },
  strong: { color: Colors.text, fontWeight: Typography.weights.bold },
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.base },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    flex: 1,
  },
  usageBadge: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  usageText: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  interviewBtn: {
    backgroundColor: Colors.primary + '33',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  interviewBtnText: {
    color: Colors.secondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },

  controlsCard: { marginBottom: Spacing.base, overflow: 'hidden' },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  controlLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  controlValue: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  controlValueText: { color: Colors.text, fontSize: Typography.sizes.base },
  chevron: { color: Colors.textFaint, fontSize: 20 },
  separator: { height: 1, backgroundColor: Colors.border },
  pillRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  pill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  pillActive: {
    backgroundColor: Colors.secondary + '22',
    borderColor: Colors.secondary,
  },
  pillText: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  pillTextActive: { color: Colors.secondary },
  premiumTag: {
    color: Colors.gold,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  customInput: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    color: Colors.text,
    fontSize: Typography.sizes.sm,
    width: '100%',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: Colors.secondary },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
  },
  toggleKnobOn: { alignSelf: 'flex-end' },
  timerPresets: { flexDirection: 'row', gap: Spacing.xs },
  presetPill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  presetPillActive: { backgroundColor: Colors.secondary + '22', borderColor: Colors.secondary },
  presetText: { color: Colors.textMuted, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold },
  presetTextActive: { color: Colors.secondary },

  generateBtn: { marginBottom: Spacing.base },

  timerCard: { marginBottom: Spacing.base, paddingVertical: Spacing.sm },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timerTime: {
    color: Colors.secondary,
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    fontVariant: ['tabular-nums'],
  },
  timerBtns: { flexDirection: 'row', gap: Spacing.xs },
  timerBtn: { minWidth: 70 },

  questionCard: { marginBottom: Spacing.base },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.sm },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  loadingText: { color: Colors.textMuted, fontSize: Typography.sizes.sm },
  questionText: {
    color: Colors.text,
    fontSize: Typography.sizes.md,
    lineHeight: 26,
    fontWeight: Typography.weights.medium,
  },

  answerCard: { marginBottom: Spacing.base },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  answerInput: {
    color: Colors.text,
    fontSize: Typography.sizes.base,
    lineHeight: 22,
    minHeight: 120,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    backgroundColor: Colors.bg,
  },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { flex: 1 },

  modelAnswerCard: { marginBottom: Spacing.base },
  gradeCard: { marginBottom: Spacing.base },
  gradeRow: { gap: Spacing.base },
  feedbackText: {
    color: Colors.text,
    fontSize: Typography.sizes.base,
    lineHeight: 22,
  },

  // Modal
  modalContainer: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  modalClose: { color: Colors.secondary, fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '55',
    gap: Spacing.sm,
  },
  categoryItemActive: { backgroundColor: Colors.secondary + '11' },
  categoryIcon: { fontSize: 20, width: 28 },
  categoryLabel: { color: Colors.text, fontSize: Typography.sizes.base, flex: 1 },
  categoryLabelActive: { color: Colors.secondary, fontWeight: Typography.weights.semibold },
  checkmark: { color: Colors.secondary, fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold },
});
