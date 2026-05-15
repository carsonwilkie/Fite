import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  ActivityIndicator, RefreshControl, Pressable, useWindowDimensions,
  findNodeHandle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, Layout } from 'react-native-reanimated';

import { Background } from '../../src/components/Background';
import { GlassCard } from '../../src/components/GlassCard';
import { Pill } from '../../src/components/Pill';
import { BrandLogo } from '../../src/components/BrandLogo';
import { PressableScale } from '../../src/components/PressableScale';
import { ScoreDisplay } from '../../src/components/ScoreDisplay';
import { PremiumGate } from '../../src/components/PremiumGate';
import { ScrollFade } from '../../src/components/ScrollFade';
import { usePaidStatus } from '../../src/hooks/usePaidStatus';
import { getHistory, type HistoryEntry } from '../../src/api';
import { CATEGORIES, QUESTION_DIFFICULTIES, MATH_OPTIONS, DIFFICULTY_COLORS, type QuestionDifficulty } from '../../src/constants';
import { Colors, Typography, Spacing, Radius } from '../../src/theme';

type SortOrder = 'newest' | 'oldest';
type TimedFilter = 'All' | 'Timed' | 'Untimed';

function formatDate(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HistoryScreen() {
  const { getToken } = useAuth();
  const { isPaid, loading: paidLoading } = usePaidStatus();
  const router = useRouter();
  const { highlight } = useLocalSearchParams<{ highlight?: string }>();
  const { width } = useWindowDimensions();

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');
  const [filterMath, setFilterMath] = useState<string>('All');
  const [filterTimed, setFilterTimed] = useState<TimedFilter>('All');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const scrollRef = useRef<ScrollView | null>(null);
  const entryRefs = useRef<Record<number, View | null>>({});
  const scrollOffsetY = useRef(0);
  const [pendingHighlight, setPendingHighlight] = useState<number | null>(null);
  const processedHighlightRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await getHistory(token);
      setHistory(data);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isPaid) load(); else setLoading(false);
  }, [isPaid, load]);

  // Auto-expand a highlighted entry (driven from /stats) and remember it as
  // pending so the entry's own onLayout can scroll into view once measurable.
  useEffect(() => {
    if (!highlight || loading) return;
    // Process each highlight value only once — otherwise a later refetch of
    // `history` (or a stale param) keeps forcing the original question back
    // open and prevents the user from selecting another entry.
    if (processedHighlightRef.current === highlight) return;
    const ts = Number(highlight);
    if (!Number.isFinite(ts)) return;
    const entry = history.find(e => e.timestamp === ts);
    if (!entry) return;
    processedHighlightRef.current = highlight;
    // Reset filters that might be hiding the entry, then open it.
    setSearch('');
    setFilterCategory('All');
    setFilterDifficulty('All');
    setFilterMath('All');
    setFilterTimed('All');
    setExpanded(ts);
    setExpandedDates(prev => new Set([...prev, formatDate(entry.timestamp)]));
    setPendingHighlight(ts);
  }, [highlight, loading, history]);

  // Once the pending entry is mounted, measure it against the ScrollView's
  // inner node and scroll to it. Retries a few times in case the first layout
  // pass runs before the entry has finished expanding.
  useEffect(() => {
    if (pendingHighlight === null) return;
    let attempts = 0;
    let cancelled = false;
    const tryScroll = () => {
      if (cancelled) return;
      const node = entryRefs.current[pendingHighlight] as any;
      const sv = scrollRef.current as any;
      const svHandle = sv ? findNodeHandle(sv) : null;
      if (node && svHandle != null) {
        try {
          node.measureLayout(
            svHandle,
            (_x: number, y: number) => {
              scrollRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true });
            },
            () => {}
          );
        } catch {}
        setPendingHighlight(null);
        try { router.setParams({ highlight: undefined } as any); } catch {}
        return;
      }
      if (attempts++ < 12) setTimeout(tryScroll, 80);
    };
    const t = setTimeout(tryScroll, 60);
    return () => { cancelled = true; clearTimeout(t); };
  }, [pendingHighlight, router]);

  const filtered = useMemo(() => {
    let xs = history.filter(e => {
      const text = (e.question ?? e.scenario ?? '').toLowerCase();
      if (search && !text.includes(search.toLowerCase())) return false;
      if (filterCategory !== 'All' && e.category !== filterCategory) return false;
      if (filterDifficulty !== 'All' && e.difficulty !== filterDifficulty) return false;
      if (filterMath !== 'All' && e.math !== filterMath) return false;
      if (filterTimed === 'Timed' && !e.timeTaken) return false;
      if (filterTimed === 'Untimed' && e.timeTaken !== undefined) return false;
      return true;
    });
    if (sort === 'oldest') xs = [...xs].reverse();
    return xs;
  }, [history, search, filterCategory, filterDifficulty, filterMath, filterTimed, sort]);

  const grouped = useMemo(() => {
    const m: Record<string, HistoryEntry[]> = {};
    filtered.forEach(e => {
      const key = formatDate(e.timestamp);
      (m[key] = m[key] || []).push(e);
    });
    return m;
  }, [filtered]);

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
          <PremiumGate message="Practice history is a Premium feature." />
        </SafeAreaView>
      </Background>
    );
  }
  if (loading) {
    return (
      <Background>
        <View style={styles.center}><ActivityIndicator color={Colors.secondary} /></View>
      </Background>
    );
  }

  const total = history.length;
  const graded = history.filter(h => typeof h.score === 'number').length;
  const avgScore = graded > 0
    ? history.reduce((s, h) => s + (typeof h.score === 'number' ? h.score : 0), 0) / graded
    : 0;
  const statSize = width < 380 ? 'compact' : width >= 430 ? 'roomy' : 'regular';

  return (
    <Background variant="hero">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl tintColor={Colors.secondary} refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => { scrollOffsetY.current = e.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={50}
        >
          <View style={styles.headerRow}>
            <BrandLogo size="md" premium={isPaid} />
            <PressableScale onPress={() => setSort(s => s === 'newest' ? 'oldest' : 'newest')} haptic="selection" containerStyle={styles.sortBtn}>
              <Ionicons name={sort === 'newest' ? 'arrow-down' : 'arrow-up'} size={14} color={Colors.secondary} />
              <Text style={styles.sortText}>{sort === 'newest' ? 'NEWEST' : 'OLDEST'}</Text>
            </PressableScale>
          </View>

          {/* Stats row */}
          <Animated.View entering={FadeIn.duration(400)} style={[styles.statsRow, statSize === 'compact' && styles.statsRowCompact]}>
            <StatChip icon="document-text" label="ENTRIES" value={`${total}`} size={statSize} />
            <StatChip icon="analytics" label="GRADED" value={`${graded}`} size={statSize} />
            <StatChip
              icon="trophy"
              label="AVG"
              value={graded > 0 ? avgScore.toFixed(1) : '—'}
              suffix={graded > 0 ? '/10' : undefined}
              size={statSize}
            />
          </Animated.View>

          {/* Search */}
          <View style={styles.searchRow}>
            <Ionicons name="search" size={16} color={Colors.textFaint} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search history…"
              placeholderTextColor={Colors.textFaint}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} hitSlop={10}>
                <Ionicons name="close-circle" size={16} color={Colors.textFaint} />
              </Pressable>
            )}
          </View>

          {/* Category filters */}
          <Text style={styles.filterLabel}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(['All', ...CATEGORIES.filter(c => c !== 'All')]).map(c => (
              <Pill key={c} label={c} active={filterCategory === c} onPress={() => setFilterCategory(c)} />
            ))}
          </ScrollView>

          {/* Difficulty filters */}
          <Text style={styles.filterLabel}>DIFFICULTY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(['All', ...QUESTION_DIFFICULTIES]).map(d => (
              <Pill
                key={d}
                label={d}
                active={filterDifficulty === d}
                color={d !== 'All' ? DIFFICULTY_COLORS[d as QuestionDifficulty] : undefined}
                onPress={() => setFilterDifficulty(d)}
              />
            ))}
          </ScrollView>

          {/* Math filter */}
          <Text style={styles.filterLabel}>MATH</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(['All', ...MATH_OPTIONS]).map(m => (
              <Pill key={m} label={m === 'With Math' ? 'Math' : m === 'No Math' ? 'No Math' : m} active={filterMath === m} onPress={() => setFilterMath(m)} small />
            ))}
          </ScrollView>

          {/* Timed filter */}
          <Text style={styles.filterLabel}>TIMED</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(['All', 'Timed', 'Untimed'] as TimedFilter[]).map(t => (
              <Pill key={t} label={t} active={filterTimed === t} onPress={() => setFilterTimed(t)} small />
            ))}
          </ScrollView>

          {Object.keys(grouped).length === 0 ? (
            <GlassCard accent="ghost" padding={32} animate={false} style={{ marginTop: Spacing.xl }}>
              <View style={{ alignItems: 'center', gap: 10 }}>
                <Ionicons name="time-outline" size={32} color={Colors.textFaint} />
                <Text style={styles.emptyTitle}>No history yet</Text>
                <Text style={styles.emptySub}>Generate questions and grade them — they'll show up here.</Text>
              </View>
            </GlassCard>
          ) : (
            Object.entries(grouped).map(([date, items]) => {
              const isFiltering = search.length > 0 || filterCategory !== 'All';
              const isOpen = isFiltering || expandedDates.has(date);
              return (
                <View key={date} style={{ marginTop: Spacing.lg }}>
                  <Pressable
                    onPress={() => setExpandedDates(prev => {
                      const next = new Set(prev);
                      if (next.has(date)) next.delete(date); else next.add(date);
                      return next;
                    })}
                    style={styles.dateHeaderRow}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.dateHeader}>{date}</Text>
                      <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeText}>{items.length}</Text>
                      </View>
                    </View>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={13}
                      color={Colors.secondary}
                    />
                  </Pressable>
                  {isOpen && items.map((e, i) => (
                    <Animated.View
                      key={e.timestamp}
                      entering={FadeInUp.duration(300).delay(Math.min(i * 25, 150))}
                      layout={Layout.springify()}
                      style={[
                        { marginBottom: Spacing.sm },
                        expanded === e.timestamp && styles.entryHighlight,
                      ]}
                    >
                      <View
                        ref={(r) => { entryRefs.current[e.timestamp] = r; }}
                        collapsable={false}
                      >
                        <EntryCard
                          entry={e}
                          isExpanded={expanded === e.timestamp}
                          onToggle={() => setExpanded(expanded === e.timestamp ? null : e.timestamp)}
                        />
                      </View>
                    </Animated.View>
                  ))}
                </View>
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

function StatChip({
  icon,
  label,
  value,
  suffix,
  size,
}: {
  icon: any;
  label: string;
  value: string;
  suffix?: string;
  size: 'compact' | 'regular' | 'roomy';
}) {
  const compact = size === 'compact';
  const roomy = size === 'roomy';

  return (
    <GlassCard accent="ghost" padding={compact ? 9 : roomy ? 13 : 11} animate={false} style={styles.statChip}>
      <View style={styles.statChipContent}>
        <View style={[styles.statTopRow, compact && styles.statTopRowCompact]}>
          <View style={[styles.statIcon, compact && styles.statIconCompact]}>
            <Ionicons name={icon} size={compact ? 12 : 14} color={Colors.secondary} />
          </View>
          <Text style={[styles.statLabel, compact && styles.statLabelCompact]}>{label}</Text>
        </View>
        <View style={[styles.statValueRow, compact && styles.statValueRowCompact]}>
          <Text style={[styles.statValue, compact && styles.statValueCompact, roomy && styles.statValueRoomy]}>{value}</Text>
          {suffix ? <Text style={[styles.statSuffix, compact && styles.statSuffixCompact]}>{suffix}</Text> : null}
        </View>
      </View>
    </GlassCard>
  );
}

function EntryCard({ entry, isExpanded, onToggle }: { entry: HistoryEntry; isExpanded: boolean; onToggle: () => void }) {
  const isInterview = entry.type === 'interview';
  const dColor = entry.difficulty
    ? DIFFICULTY_COLORS[entry.difficulty as QuestionDifficulty] ?? Colors.secondary
    : Colors.secondary;

  return (
    <PressableScale onPress={onToggle} haptic="selection" scaleTo={0.985}>
      <GlassCard accent={isExpanded ? 'cyan' : 'ghost'} padding={14} animate={false}>
        <View style={styles.entryHeader}>
          <View style={styles.entryMeta}>
            {isInterview && (
              <View style={[styles.miniTag, { backgroundColor: 'rgba(79,195,247,0.16)', borderColor: 'rgba(79,195,247,0.45)' }]}>
                <Ionicons name="mic" size={9} color={Colors.secondary} />
                <Text style={[styles.miniTagText, { color: Colors.secondary }]}>INTERVIEW</Text>
              </View>
            )}
            {entry.category && (
              <View style={styles.miniTag}>
                <Text style={styles.miniTagText}>{entry.category}</Text>
              </View>
            )}
            {entry.difficulty && (
              <View style={[styles.miniTag, { borderColor: dColor + '55', backgroundColor: dColor + '1a' }]}>
                <Text style={[styles.miniTagText, { color: dColor }]}>{entry.difficulty}</Text>
              </View>
            )}
          </View>
          {entry.score !== undefined && (
            <ScoreDisplay score={Math.round(entry.score * 10) / 10} size="sm" />
          )}
        </View>
        <Text style={styles.entryQ} numberOfLines={isExpanded ? undefined : 2}>
          {entry.question ?? entry.scenario ?? 'Interview session'}
        </Text>

        {isExpanded && (
          <Animated.View entering={FadeIn.duration(220)} style={styles.expanded}>
            {entry.userAnswer && (
              <View style={styles.expSection}>
                <Text style={styles.expLabel}>YOUR ANSWER</Text>
                <Text style={styles.expText}>{entry.userAnswer}</Text>
              </View>
            )}
            {entry.feedback && (
              <View style={styles.expSection}>
                <Text style={styles.expLabel}>AI FEEDBACK</Text>
                <Text style={styles.expText}>{entry.feedback}</Text>
              </View>
            )}
            {isInterview && entry.questions && (
              <View style={styles.expSection}>
                <Text style={styles.expLabel}>QUESTIONS</Text>
                {entry.questions.map((q, i) => (
                  <View key={i} style={styles.qLine}>
                    <Text style={styles.qNum}>{i + 1}.</Text>
                    <Text style={styles.expText}>{q.question}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}
      </GlassCard>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  sortBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full,
    backgroundColor: 'rgba(79,195,247,0.12)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(79,195,247,0.35)',
  },
  sortText: { color: Colors.secondary, fontFamily: Typography.fonts.displayExtra, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.base },
  statsRowCompact: { gap: 8 },
  statChip: { flex: 1 },
  statChipContent: { alignItems: 'center', justifyContent: 'center' },
  statTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statTopRowCompact: { gap: 4 },
  statIcon: {
    width: 24, height: 24, borderRadius: 7, backgroundColor: 'rgba(79,195,247,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  statIconCompact: { width: 20, height: 20, borderRadius: 6 },
  statLabel: { color: Colors.textMuted, fontFamily: Typography.fonts.display, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, flexShrink: 1 },
  statLabelCompact: { fontSize: 9, letterSpacing: 1 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginTop: 14 },
  statValueRowCompact: { marginTop: 8 },
  statValue: { color: Colors.text, fontFamily: Typography.fonts.displayExtra, fontSize: 24, fontWeight: '800', letterSpacing: -0.5, lineHeight: 26 },
  statValueCompact: { fontSize: 20, lineHeight: 22, letterSpacing: 0 },
  statValueRoomy: { fontSize: 25, lineHeight: 27 },
  statSuffix: { color: Colors.textMuted, fontFamily: Typography.fonts.sansBold, fontSize: 12, fontWeight: '700', marginLeft: 3, letterSpacing: 0 },
  statSuffixCompact: { fontSize: 10, marginLeft: 2 },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(15,34,54,0.85)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  searchInput: { flex: 1, color: Colors.text, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, paddingVertical: 0, textAlignVertical: 'center' },
  filterLabel: {
    color: Colors.textMuted, fontFamily: Typography.fonts.display,
    fontSize: 9, fontWeight: '700', letterSpacing: 1.6,
    marginTop: Spacing.sm, marginBottom: 4,
  },
  filterTwoCol: { flexDirection: 'row', gap: Spacing.base, marginTop: 0 },
  filterRow: { gap: 6, paddingRight: Spacing.base, paddingVertical: 4 },

  dateHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 4, marginBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.borderLight,
  },
  dateHeader: {
    color: Colors.secondary, fontFamily: Typography.fonts.displayExtra,
    fontSize: 10, fontWeight: '800', letterSpacing: 2,
  },
  dateBadge: {
    backgroundColor: 'rgba(79,195,247,0.12)', borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(79,195,247,0.35)',
    paddingHorizontal: 7, paddingVertical: 2,
  },
  dateBadgeText: {
    color: Colors.secondary, fontFamily: Typography.fonts.displayExtra,
    fontSize: 9, fontWeight: '800', letterSpacing: 1,
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  entryMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, flex: 1 },
  miniTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: 'rgba(255,255,255,0.03)',
  },
  miniTagText: { color: Colors.textMuted, fontFamily: Typography.fonts.display, fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  entryQ: { color: Colors.text, fontFamily: Typography.fonts.sansMedium, fontSize: Typography.sizes.sm, lineHeight: 20 },

  expanded: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.borderLight, gap: Spacing.md },
  expSection: { gap: 5 },
  expLabel: { color: Colors.secondary, fontFamily: Typography.fonts.display, fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
  expText: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: 13, lineHeight: 19 },
  qLine: { flexDirection: 'row', gap: 6 },
  qNum: { color: Colors.secondary, fontFamily: Typography.fonts.displayExtra, fontSize: 13, fontWeight: '800', width: 18 },

  emptyTitle: { color: Colors.text, fontFamily: Typography.fonts.sansBold, fontSize: Typography.sizes.base, fontWeight: '700' },
  emptySub: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, textAlign: 'center' },

  entryHighlight: {
    borderRadius: Radius.lg,
    shadowColor: Colors.secondary,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
