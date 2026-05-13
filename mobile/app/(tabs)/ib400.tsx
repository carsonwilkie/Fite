import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';

import { Background } from '../../src/components/Background';
import { GlassCard } from '../../src/components/GlassCard';
import { PremiumGate } from '../../src/components/PremiumGate';
import { Pill } from '../../src/components/Pill';
import { PressableScale } from '../../src/components/PressableScale';
import { BrandLogo } from '../../src/components/BrandLogo';
import { ScrollFade } from '../../src/components/ScrollFade';
import { AnimatedNumber } from '../../src/components/AnimatedNumber';
import { Colors, Spacing, Typography, Radius, Gradients } from '../../src/theme';
import { DIFFICULTIES, DIFFICULTY_COLORS } from '../../src/constants';
import { getIBQuestions, getIBProgress, resetIBProgress, IBQuestion, IBProgressEntry } from '../../src/api';
import { usePaidStatus } from '../../src/hooks/usePaidStatus';

type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard';

// Icon mapping for the IB topic categories that actually appear in the IB 400 bank.
const IB_CAT_ICONS: Record<string, string> = {
  'Accounting': 'calculator-outline',
  'DCF': 'analytics-outline',
  'LBO': 'trending-up-outline',
  'M&A': 'git-merge-outline',
  'Valuation': 'pie-chart-outline',
  'Markets': 'stats-chart-outline',
  'Debt & Capital Structure': 'cash-outline',
  'Brain Teasers': 'bulb-outline',
};

export default function IB400Screen() {
  const { getToken } = useAuth();
  const router = useRouter();
  const { isPaid, loading: paidLoading } = usePaidStatus();

  const [questions, setQuestions] = useState<IBQuestion[]>([]);
  const [progress, setProgress] = useState<Record<string, IBProgressEntry>>({});
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [diffFilter, setDiffFilter] = useState<Difficulty>('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) { setLoading(false); return; }
    const [qs, pr] = await Promise.all([getIBQuestions(token), getIBProgress(token)]);
    setQuestions(qs);
    setProgress(pr);
    setLoading(false);
  }, [getToken]);

  useEffect(() => { load(); }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function confirmResetAll() {
    Alert.alert(
      'Reset All Progress',
      'This will permanently clear all saved scores for every IB 400 question. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            try {
              const token = await getToken();
              if (token) await resetIBProgress(null, token);
              setProgress({});
            } catch {
              Alert.alert('Error', 'Failed to reset progress. Please try again.');
            } finally {
              setResetting(false);
            }
          },
        },
      ],
    );
  }

  // Topic categories derived from the IB 400 bank itself (not the dashboard
  // industry list). Same set the web /ib-questions page filters by.
  const ibCategories = useMemo(() => {
    const set = new Set<string>();
    questions.forEach(q => q.category && set.add(q.category));
    return Array.from(set).sort();
  }, [questions]);

  // Per-category counts (graded vs total) for the topic chips.
  const counts = useMemo(() => {
    const c: Record<string, { total: number; done: number }> = {};
    ibCategories.forEach(cat => (c[cat] = { total: 0, done: 0 }));
    c['All'] = { total: questions.length, done: 0 };
    questions.forEach(q => {
      if (c[q.category]) c[q.category].total += 1;
      if (progress[q.id] && typeof progress[q.id].score === 'number') {
        if (c[q.category]) c[q.category].done += 1;
        c['All'].done += 1;
      }
    });
    return c;
  }, [questions, progress, ibCategories]);

  const filtered = useMemo(() => {
    let xs = questions;
    if (activeCategory !== 'All') xs = xs.filter(q => q.category === activeCategory);
    if (diffFilter !== 'All') xs = xs.filter(q => q.difficulty === diffFilter);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      xs = xs.filter(q => q.question.toLowerCase().includes(s));
    }
    return xs;
  }, [questions, activeCategory, diffFilter, search]);

  // Shuffle: prefer an unanswered question from the current filter; if none
  // remain, fall back to any question in the filter.
  const handleShuffle = useCallback(() => {
    if (filtered.length === 0) return;
    const pool = filtered.filter(q => !progress[q.id]);
    const source = pool.length > 0 ? pool : filtered;
    const pick = source[Math.floor(Math.random() * source.length)];
    router.push({ pathname: '/ib-question', params: { id: pick.id } } as any);
  }, [filtered, progress, router]);

  const overallPct = useMemo(() => {
    const total = questions.length || 1;
    const done = counts['All']?.done ?? 0;
    return Math.round((done / total) * 100);
  }, [counts, questions]);

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
          <PremiumGate message="The IB 400 question bank is a Premium feature." />
        </SafeAreaView>
      </Background>
    );
  }

  return (
    <Background variant="hero">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.secondary} />}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(400)} style={styles.headerRow}>
            <BrandLogo size="md" premium={isPaid} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.headerBadge}>
                <Ionicons name="library" size={11} color={Colors.secondary} />
                <Text style={styles.headerBadgeText}>IB 400</Text>
              </View>
              <PressableScale
                onPress={confirmResetAll}
                haptic="selection"
                disabled={resetting}
                containerStyle={styles.resetBtn}
              >
                <Ionicons name="refresh" size={13} color={Colors.textMuted} />
              </PressableScale>
            </View>
          </Animated.View>

          {/* Progress hero */}
          <Animated.View entering={FadeInDown.duration(450).delay(60)}>
            <GlassCard accent="cyan" glow padding={20} animate={false}>
              <Text style={styles.heroEyebrow}>INVESTMENT BANKING · 400 QUESTIONS</Text>
              <Text style={styles.heroTitle}>The interview bank, drilled.</Text>
              <Text style={styles.heroSub}>
                Every question used in real IB recruiting. Practice, reveal model answers, get graded, track progress.
              </Text>

              <View style={styles.progressRow}>
                <View style={styles.progressLeft}>
                  <Text style={styles.progressPct}>
                    <AnimatedNumber value={overallPct} duration={900} suffix="%" />
                  </Text>
                  <Text style={styles.progressLabel}>COMPLETE</Text>
                </View>
                <View style={styles.progressBarWrap}>
                  <View style={styles.progressTrack}>
                    <LinearGradient
                      colors={Gradients.cyan as any}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${overallPct}%` }]}
                    />
                  </View>
                  <Text style={styles.progressDelta}>
                    {counts['All']?.done ?? 0} of {questions.length || 400} graded
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Filters (sticky) — search + topic + difficulty + shuffle */}
          <View style={styles.stickyWrap}>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={Colors.textFaint} style={{ marginRight: 8 }} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Type a question…"
                placeholderTextColor={Colors.textFaint}
                style={styles.searchInput}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} hitSlop={10}>
                  <Ionicons name="close-circle" size={16} color={Colors.textFaint} />
                </Pressable>
              )}
            </View>

            <Text style={styles.filterLabel}>DIFFICULTY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {(['All', ...DIFFICULTIES] as Difficulty[]).map(d => (
                <Pill
                  key={d}
                  label={d}
                  active={diffFilter === d}
                  color={d === 'All' ? Colors.secondary : DIFFICULTY_COLORS[d as keyof typeof DIFFICULTY_COLORS]}
                  onPress={() => setDiffFilter(d)}
                />
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>TOPIC</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {(['All', ...ibCategories]).map(cat => {
                const active = activeCategory === cat;
                const total = counts[cat]?.total ?? 0;
                const done = counts[cat]?.done ?? 0;
                return (
                  <PressableScale
                    key={cat}
                    onPress={() => setActiveCategory(cat)}
                    haptic="selection"
                    containerStyle={[styles.topicChip, active && styles.topicChipActive]}
                  >
                    {cat !== 'All' && (
                      <Ionicons
                        name={(IB_CAT_ICONS[cat] as any) ?? 'apps-outline'}
                        size={12}
                        color={active ? Colors.secondary : Colors.textMuted}
                      />
                    )}
                    <Text style={[styles.topicChipText, active && { color: Colors.secondary }]} numberOfLines={1}>
                      {cat}
                    </Text>
                    {total > 0 && (() => {
                      const pct = total > 0 ? done / total : 0;
                      const doneColor = done === 0
                        ? Colors.textFaint
                        : pct >= 0.75 ? Colors.success
                        : pct >= 0.4 ? Colors.secondary
                        : Colors.warning;
                      return (
                        <Text style={styles.topicChipCount}>
                          <Text style={{ color: doneColor }}>{done}</Text>
                          <Text style={{ color: Colors.textFaint }}>/{total}</Text>
                        </Text>
                      );
                    })()}
                  </PressableScale>
                );
              })}
            </ScrollView>
          </View>

          {/* Question list header + shuffle */}
          <View style={styles.listHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listHeaderEyebrow}>{filtered.length} QUESTIONS</Text>
              <Text style={styles.listHeaderTitle}>
                {activeCategory === 'All' ? 'All topics' : activeCategory}
              </Text>
            </View>
            <PressableScale
              onPress={handleShuffle}
              disabled={filtered.length === 0}
              haptic="medium"
              containerStyle={styles.shuffleBtn}
            >
              <LinearGradient
                colors={Gradients.cyan as any}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="shuffle" size={16} color={Colors.textBright} />
              <Text style={styles.shuffleText}>Shuffle</Text>
            </PressableScale>
          </View>
          {loading ? (
            <SkeletonList />
          ) : filtered.length === 0 ? (
            <GlassCard accent="ghost" padding={24} animate={false}>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Ionicons name="search-outline" size={28} color={Colors.textFaint} />
                <Text style={styles.emptyTitle}>No matches</Text>
                <Text style={styles.emptySub}>Try clearing search or changing filters.</Text>
              </View>
            </GlassCard>
          ) : (
            filtered.map((q, idx) => {
              const p = progress[q.id];
              const dColor = DIFFICULTY_COLORS[q.difficulty as keyof typeof DIFFICULTY_COLORS];
              return (
                <Animated.View
                  key={q.id}
                  entering={FadeInUp.duration(280).delay(Math.min(idx * 10, 200))}
                  layout={Layout.springify()}
                  style={{ marginBottom: Spacing.sm }}
                >
                  <PressableScale
                    onPress={() => router.push({ pathname: '/ib-question', params: { id: q.id } } as any)}
                    haptic="selection"
                  >
                    <GlassCard accent="ghost" padding={14} animate={false}>
                      <View style={styles.qRow}>
                        <View style={{ flex: 1 }}>
                          <View style={styles.qTagRow}>
                            <View style={[styles.qIdChip, { borderColor: dColor + '55' }]}>
                              <Text style={[styles.qIdText, { color: dColor }]}>{q.id.toUpperCase()}</Text>
                            </View>
                            <View style={[styles.qDiffChip, { backgroundColor: dColor + '1a', borderColor: dColor + '55' }]}>
                              <Text style={[styles.qDiffText, { color: dColor }]}>{q.difficulty}</Text>
                            </View>
                          </View>
                          <Text style={styles.qText} numberOfLines={2}>{q.question}</Text>
                        </View>
                        <View style={styles.qRight}>
                          {p && typeof p.score === 'number' ? (
                            <ScoreBadge score={p.score} />
                          ) : (
                            <Ionicons name="chevron-forward" size={20} color={Colors.textFaint} />
                          )}
                        </View>
                      </View>
                    </GlassCard>
                  </PressableScale>
                </Animated.View>
              );
            })
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
        <ScrollFade top={28} bottom={90} />
      </SafeAreaView>
    </Background>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? Colors.success :
    score >= 6 ? '#84cc16' :
    score >= 4 ? Colors.warning : Colors.error;
  return (
    <View style={[styles.scoreBadge, { borderColor: color + '99', backgroundColor: color + '22' }]}>
      <Text style={[styles.scoreText, { color }]}>{score}</Text>
    </View>
  );
}

function SkeletonList() {
  return (
    <View>
      {Array.from({ length: 6 }).map((_, i) => (
        <Animated.View key={i} entering={FadeIn.duration(300).delay(i * 60)} style={[styles.skeleton]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base, paddingBottom: 120 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(79,195,247,0.12)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(79,195,247,0.35)',
  },
  headerBadgeText: {
    color: Colors.secondary,
    fontFamily: Typography.fonts.displayExtra,
    fontSize: 10, fontWeight: '800', letterSpacing: 1.6,
  },
  resetBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderLight,
  },

  // Hero
  heroEyebrow: {
    color: Colors.secondary, fontFamily: Typography.fonts.display,
    fontSize: 10, fontWeight: '700', letterSpacing: 2.2, marginBottom: 8,
  },
  heroTitle: {
    color: Colors.text, fontFamily: Typography.fonts.displayExtra,
    fontSize: 26, fontWeight: '800', letterSpacing: -0.6, lineHeight: 30,
  },
  heroSub: {
    color: Colors.textMuted, fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm, lineHeight: 19, marginTop: 8,
  },
  progressRow: { flexDirection: 'row', marginTop: Spacing.lg, alignItems: 'center', gap: Spacing.base },
  progressLeft: { alignItems: 'flex-start' },
  progressPct: {
    color: Colors.secondary, fontFamily: Typography.fonts.displayExtra,
    fontSize: 32, fontWeight: '800', letterSpacing: -1,
  },
  progressLabel: { color: Colors.textMuted, fontFamily: Typography.fonts.display, fontSize: 9, letterSpacing: 1.8, fontWeight: '700' },
  progressBarWrap: { flex: 1 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)' },
  progressFill: { height: 8, borderRadius: 4 },
  progressDelta: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: 11, marginTop: 6 },

  // Sticky bar — transparent so the page background bleeds through instead of
  // showing a hard solid-navy block when scrolled.
  stickyWrap: { backgroundColor: 'transparent', paddingTop: Spacing.base, paddingBottom: Spacing.sm, zIndex: 10 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(15,34,54,0.55)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderLight,
  },
  searchInput: {
    flex: 1, color: Colors.text,
    fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm,
  },
  filterLabel: {
    color: Colors.textMuted, fontFamily: Typography.fonts.display,
    fontSize: 9, fontWeight: '700', letterSpacing: 1.6,
    marginTop: Spacing.md, marginBottom: 6,
  },
  chipRow: { gap: 6, paddingRight: Spacing.base, paddingVertical: 2 },

  // Topic filter chip
  topicChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.borderLight,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  topicChipActive: {
    borderColor: Colors.secondary,
    backgroundColor: 'rgba(79,195,247,0.12)',
  },
  topicChipText: {
    color: Colors.textMuted,
    fontFamily: Typography.fonts.displaySemibold,
    fontSize: 11, fontWeight: '700', letterSpacing: 0.4,
  },
  topicChipCount: {
    color: Colors.textFaint,
    fontFamily: Typography.fonts.display,
    fontSize: 9, fontWeight: '700', letterSpacing: 1,
    marginLeft: 2,
  },

  // List header + shuffle
  listHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: Spacing.lg, marginBottom: Spacing.md,
  },
  listHeaderEyebrow: {
    color: Colors.textMuted, fontFamily: Typography.fonts.display,
    fontSize: 10, fontWeight: '700', letterSpacing: 1.8,
  },
  listHeaderTitle: {
    color: Colors.text, fontFamily: Typography.fonts.displayExtra,
    fontSize: Typography.sizes.lg, fontWeight: '800', letterSpacing: -0.3,
    marginTop: 2,
  },
  shuffleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: Radius.full, overflow: 'hidden',
    shadowColor: Colors.secondary, shadowOpacity: 0.45,
    shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  shuffleText: {
    color: Colors.textBright,
    fontFamily: Typography.fonts.displayExtra,
    fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase',
  },

  // Question list rows
  qRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  qTagRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  qIdChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  qIdText: { fontFamily: Typography.fonts.displayExtra, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  qDiffChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  qDiffText: { fontFamily: Typography.fonts.display, fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  qText: { color: Colors.text, fontFamily: Typography.fonts.sansMedium, fontSize: Typography.sizes.sm, lineHeight: 19 },
  qRight: { alignItems: 'center', justifyContent: 'center' },
  scoreBadge: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  scoreText: { fontFamily: Typography.fonts.displayExtra, fontSize: 13, fontWeight: '800' },

  emptyTitle: { color: Colors.text, fontFamily: Typography.fonts.sansBold, fontSize: Typography.sizes.base, fontWeight: '700', marginTop: 6 },
  emptySub: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, textAlign: 'center' },
  skeleton: {
    height: 80,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: Spacing.sm,
  },
});
