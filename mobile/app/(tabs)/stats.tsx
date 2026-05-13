import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';

import { Colors, Typography, Spacing, Radius } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { PremiumGate } from '../../src/components/PremiumGate';
import { usePaidStatus } from '../../src/hooks/usePaidStatus';
import { getHistory, type HistoryEntry } from '../../src/api';
import { DIFFICULTY_COLORS, type QuestionDifficulty } from '../../src/constants';

function computeStats(history: HistoryEntry[]) {
  const total = history.length;
  const graded = history.filter(e => e.score !== undefined);
  const scores = graded.map(e => e.score!);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;
  const worstScore = scores.length ? Math.min(...scores) : 0;

  // Streak
  const days = [...new Set(history.map(e => new Date(e.timestamp).toDateString()))].sort().reverse();
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (days[0] === today || days[0] === yesterday) {
    streak = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (diff === 1) streak++;
      else break;
    }
  }

  // Category breakdown
  const catMap: Record<string, { count: number; totalScore: number }> = {};
  for (const e of history) {
    const cat = e.category ?? 'Unknown';
    if (!catMap[cat]) catMap[cat] = { count: 0, totalScore: 0 };
    catMap[cat].count++;
    if (e.score !== undefined) catMap[cat].totalScore += e.score;
  }

  // Difficulty breakdown
  const diffMap: Record<string, number> = {};
  for (const e of history) {
    const d = e.difficulty ?? 'Unknown';
    diffMap[d] = (diffMap[d] ?? 0) + 1;
  }

  // Recent trend (last 10 graded)
  const trend = graded.slice(0, 10).map(e => e.score!).reverse();

  const avgPerDay = days.length ? total / days.length : 0;

  return { total, graded: graded.length, avgScore, bestScore, worstScore, streak, catMap, diffMap, trend, avgPerDay };
}

function StatBox({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <View style={statStyles.box}>
      <Text style={[statStyles.value, color ? { color } : {}]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
      {sub && <Text style={statStyles.sub}>{sub}</Text>}
    </View>
  );
}

const statStyles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', padding: Spacing.base },
  value: { color: Colors.secondary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  label: { color: Colors.textMuted, fontSize: Typography.sizes.xs, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  sub: { color: Colors.textFaint, fontSize: Typography.sizes.xs, marginTop: 2 },
});

export default function StatsScreen() {
  const { getToken } = useAuth();
  const { isPaid, loading: paidLoading } = usePaidStatus();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
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
    if (isPaid) load();
    else setLoading(false);
  }, [isPaid, load]);

  if (paidLoading || loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.secondary} /></View>;
  }

  if (!isPaid) {
    return <PremiumGate message="Stats require Fite Premium." />;
  }

  if (!history.length) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No stats yet</Text>
          <Text style={styles.emptyText}>Practice some questions to see your stats here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = computeStats(history);
  const maxBar = Math.max(...Object.values(stats.catMap).map(v => v.count), 1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.secondary} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Stats</Text>

        {/* Overview grid */}
        <Card style={styles.grid}>
          <View style={styles.gridRow}>
            <StatBox label="Questions" value={stats.total} />
            <View style={styles.vDivider} />
            <StatBox label="Graded" value={stats.graded} />
          </View>
          <View style={styles.hDivider} />
          <View style={styles.gridRow}>
            <StatBox label="Avg Score" value={stats.avgScore ? stats.avgScore.toFixed(1) : '—'} color={stats.avgScore >= 7 ? Colors.success : stats.avgScore >= 5 ? Colors.warning : Colors.error} />
            <View style={styles.vDivider} />
            <StatBox label="Streak" value={`${stats.streak}d`} sub="current" color={Colors.gold} />
          </View>
          <View style={styles.hDivider} />
          <View style={styles.gridRow}>
            <StatBox label="Best" value={stats.bestScore ? `${stats.bestScore}/10` : '—'} color={Colors.success} />
            <View style={styles.vDivider} />
            <StatBox label="Per Day" value={stats.avgPerDay.toFixed(1)} sub="avg" />
          </View>
        </Card>

        {/* Recent trend */}
        {stats.trend.length > 1 && (
          <Card style={styles.trendCard}>
            <Text style={styles.sectionLabel}>Recent Score Trend</Text>
            <View style={styles.trendBars}>
              {stats.trend.map((s, i) => {
                const h = Math.max((s / 10) * 60, 4);
                const color = s >= 7 ? Colors.success : s >= 5 ? Colors.secondary : Colors.warning;
                return (
                  <View key={i} style={styles.trendBarWrap}>
                    <Text style={[styles.trendScore, { color }]}>{s}</Text>
                    <View style={[styles.trendBar, { height: h, backgroundColor: color }]} />
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        {/* Difficulty breakdown */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>By Difficulty</Text>
          {Object.entries(stats.diffMap).map(([d, count]) => (
            <View key={d} style={styles.barRow}>
              <Text style={[styles.barLabel, { color: DIFFICULTY_COLORS[d as QuestionDifficulty] ?? Colors.textMuted }]}>{d}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(count / stats.total) * 100}%`, backgroundColor: DIFFICULTY_COLORS[d as QuestionDifficulty] ?? Colors.secondary }]} />
              </View>
              <Text style={styles.barCount}>{count}</Text>
            </View>
          ))}
        </Card>

        {/* Category breakdown */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>By Category</Text>
          {Object.entries(stats.catMap)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([cat, { count, totalScore }]) => {
              const avg = count ? totalScore / count : 0;
              return (
                <View key={cat} style={styles.catRow}>
                  <View style={styles.catInfo}>
                    <Text style={styles.catName}>{cat}</Text>
                    <Text style={styles.catCount}>{count} question{count !== 1 ? 's' : ''}</Text>
                  </View>
                  <View style={styles.catBarWrap}>
                    <View style={[styles.catBar, { width: `${(count / maxBar) * 100}%` }]} />
                  </View>
                  {avg > 0 && (
                    <Text style={[styles.catAvg, { color: avg >= 7 ? Colors.success : avg >= 5 ? Colors.secondary : Colors.warning }]}>
                      {avg.toFixed(1)}
                    </Text>
                  )}
                </View>
              );
            })}
        </Card>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.base },
  title: { color: Colors.text, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, marginBottom: Spacing.base },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { color: Colors.text, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, marginBottom: Spacing.sm },
  emptyText: { color: Colors.textMuted, fontSize: Typography.sizes.base, textAlign: 'center' },

  grid: { marginBottom: Spacing.base, padding: 0, overflow: 'hidden' },
  gridRow: { flexDirection: 'row' },
  vDivider: { width: 1, backgroundColor: Colors.border },
  hDivider: { height: 1, backgroundColor: Colors.border },

  sectionLabel: { color: Colors.textMuted, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.base },

  trendCard: { marginBottom: Spacing.base },
  trendBars: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.xs, height: 80 },
  trendBarWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  trendScore: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold },
  trendBar: { width: '80%', borderRadius: 3, minHeight: 4 },

  sectionCard: { marginBottom: Spacing.base },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  barLabel: { width: 60, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  barTrack: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4 },
  barFill: { height: 8, borderRadius: 4 },
  barCount: { color: Colors.textMuted, fontSize: Typography.sizes.sm, width: 28, textAlign: 'right' },

  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  catInfo: { width: 130 },
  catName: { color: Colors.text, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  catCount: { color: Colors.textFaint, fontSize: Typography.sizes.xs },
  catBarWrap: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3 },
  catBar: { height: 6, backgroundColor: Colors.secondary, borderRadius: 3 },
  catAvg: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, width: 30, textAlign: 'right' },
});
