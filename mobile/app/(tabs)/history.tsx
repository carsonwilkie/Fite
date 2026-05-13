import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

import { Colors, Typography, Spacing, Radius } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { ScoreDisplay } from '../../src/components/ScoreDisplay';
import { PremiumGate } from '../../src/components/PremiumGate';
import { usePaidStatus } from '../../src/hooks/usePaidStatus';
import { getHistory, type HistoryEntry } from '../../src/api';
import { QUESTION_DIFFICULTIES, CATEGORIES, DIFFICULTY_COLORS, type QuestionDifficulty } from '../../src/constants';

type SortOrder = 'newest' | 'oldest';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function groupByDate(entries: HistoryEntry[]): Record<string, HistoryEntry[]> {
  const groups: Record<string, HistoryEntry[]> = {};
  for (const entry of entries) {
    const key = formatDate(entry.timestamp);
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }
  return groups;
}

export default function HistoryScreen() {
  const { getToken } = useAuth();
  const { isPaid, loading: paidLoading } = usePaidStatus();
  const router = useRouter();

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [expanded, setExpanded] = useState<number | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await getHistory(token);
      setHistory(data);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isPaid) loadHistory();
    else setLoading(false);
  }, [isPaid, loadHistory]);

  if (paidLoading || loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.secondary} /></View>;
  }

  if (!isPaid) {
    return <PremiumGate message="History tracking requires Fite Premium." />;
  }

  // Filter + sort
  let filtered = history.filter(e => {
    const text = (e.question ?? e.scenario ?? '').toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (filterCategory !== 'All' && e.category !== filterCategory) return false;
    if (filterDifficulty !== 'All' && e.difficulty !== filterDifficulty) return false;
    return true;
  });

  if (sort === 'oldest') filtered = [...filtered].reverse();

  const groups = groupByDate(filtered);
  const dates = Object.keys(groups);

  const renderEntry = (entry: HistoryEntry, idx: number) => {
    const isExpanded = expanded === entry.timestamp;
    const isInterview = entry.type === 'interview';

    return (
      <TouchableOpacity
        key={entry.timestamp}
        onPress={() => setExpanded(isExpanded ? null : entry.timestamp)}
        activeOpacity={0.8}
      >
        <Card style={styles.entryCard}>
          <View style={styles.entryHeader}>
            {/* Type + category */}
            <View style={styles.entryMeta}>
              {isInterview && <Text style={styles.interviewTag}>🎤 Interview</Text>}
              {entry.category && (
                <Text style={styles.categoryTag}>{entry.category}</Text>
              )}
              {entry.difficulty && (
                <Text style={[styles.diffTag, { color: DIFFICULTY_COLORS[entry.difficulty as QuestionDifficulty] ?? Colors.textMuted }]}>
                  {entry.difficulty}
                </Text>
              )}
            </View>
            {/* Score */}
            {entry.score !== undefined && (
              <ScoreDisplay score={Math.round(entry.score * 10) / 10} size="sm" />
            )}
          </View>

          <Text style={styles.entryQ} numberOfLines={isExpanded ? undefined : 2}>
            {entry.question ?? entry.scenario ?? 'Interview session'}
          </Text>

          {isExpanded && (
            <View style={styles.expanded}>
              {entry.userAnswer && (
                <View style={styles.expandedSection}>
                  <Text style={styles.expandedLabel}>Your Answer</Text>
                  <Text style={styles.expandedText}>{entry.userAnswer}</Text>
                </View>
              )}
              {entry.feedback && (
                <View style={styles.expandedSection}>
                  <Text style={styles.expandedLabel}>AI Feedback</Text>
                  <Text style={styles.expandedText}>{entry.feedback}</Text>
                </View>
              )}
              {isInterview && entry.questions && (
                <View style={styles.expandedSection}>
                  <Text style={styles.expandedLabel}>Questions</Text>
                  {entry.questions.map((q, qi) => (
                    <Text key={qi} style={styles.expandedText}>
                      {qi + 1}. {q.question}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity onPress={() => setSort(sort === 'newest' ? 'oldest' : 'newest')}>
          <Text style={styles.sortBtn}>{sort === 'newest' ? '↓ Newest' : '↑ Oldest'}</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search questions..."
          placeholderTextColor={Colors.textFaint}
        />
      </View>

      {/* Filters */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['All', ...CATEGORIES.filter(c => c !== 'All')]}
        keyExtractor={i => i}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterPill, filterCategory === item && styles.filterPillActive]}
            onPress={() => setFilterCategory(item)}
          >
            <Text style={[styles.filterText, filterCategory === item && styles.filterTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Main list */}
      <FlatList
        data={dates}
        keyExtractor={d => d}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadHistory(); }} tintColor={Colors.secondary} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No history yet. Generate some questions!</Text>
          </View>
        }
        renderItem={({ item: date }) => (
          <View>
            <Text style={styles.dateHeader}>{date}</Text>
            {groups[date].map((entry, i) => renderEntry(entry, i))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base },
  title: { color: Colors.text, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
  sortBtn: { color: Colors.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },

  searchRow: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  searchInput: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.sm, color: Colors.text, fontSize: Typography.sizes.base,
  },

  filterRow: { paddingHorizontal: Spacing.base, gap: Spacing.xs, paddingBottom: Spacing.sm },
  filterPill: { borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  filterPillActive: { backgroundColor: Colors.secondary + '22', borderColor: Colors.secondary },
  filterText: { color: Colors.textMuted, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold },
  filterTextActive: { color: Colors.secondary },

  listContent: { padding: Spacing.base, paddingTop: 0 },
  dateHeader: { color: Colors.textMuted, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, textTransform: 'uppercase', letterSpacing: 1, marginVertical: Spacing.sm },

  entryCard: { marginBottom: Spacing.sm },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xs },
  entryMeta: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', flex: 1 },
  interviewTag: { fontSize: Typography.sizes.xs, color: Colors.secondary, fontWeight: Typography.weights.bold },
  categoryTag: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  diffTag: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold },
  entryQ: { color: Colors.text, fontSize: Typography.sizes.sm, lineHeight: 20 },

  expanded: { marginTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, gap: Spacing.sm },
  expandedSection: { gap: Spacing.xs },
  expandedLabel: { color: Colors.textMuted, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, textTransform: 'uppercase', letterSpacing: 1 },
  expandedText: { color: Colors.textMuted, fontSize: Typography.sizes.sm, lineHeight: 18 },

  empty: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  emptyText: { color: Colors.textFaint, fontSize: Typography.sizes.base },
});
