import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Background } from '../../src/components/Background';
import { GlassCard } from '../../src/components/GlassCard';
import { SectionHeader } from '../../src/components/SectionHeader';
import { BrandLogo } from '../../src/components/BrandLogo';
import { AnimatedNumber } from '../../src/components/AnimatedNumber';
import { PremiumGate } from '../../src/components/PremiumGate';
import { ScrollFade } from '../../src/components/ScrollFade';
import { usePaidStatus } from '../../src/hooks/usePaidStatus';
import { getHistory, type HistoryEntry } from '../../src/api';
import { DIFFICULTY_COLORS, CATEGORY_ICONS, type QuestionDifficulty } from '../../src/constants';
import { Colors, Typography, Spacing, Radius, Gradients } from '../../src/theme';

// Smooth red → yellow → green gradient over a 0–10 score range.
function scoreColor(score: number, alpha = 1): string {
  const s = Math.max(0, Math.min(10, score));
  const hue = (s / 10) * 120; // 0 = red, 60 = yellow, 120 = green
  return alpha >= 1
    ? `hsl(${Math.round(hue)}, 78%, 50%)`
    : `hsla(${Math.round(hue)}, 78%, 50%, ${alpha})`;
}

function computeStats(history: HistoryEntry[]) {
  const total = history.length;
  const graded = history.filter(e => typeof e.score === 'number');
  const scores = graded.map(e => e.score!);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;
  const worstScore = scores.length ? Math.min(...scores) : 0;

  const days = [...new Set(history.map(e => new Date(e.timestamp).toDateString()))].sort().reverse();

  // Current streak: consecutive days ending today/yesterday.
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (days[0] === today || days[0] === yesterday) {
    streak = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]); const curr = new Date(days[i]);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (diff === 1) streak++; else break;
    }
  }

  // Longest streak: max run of consecutive practice days anywhere in history.
  let longestStreak = 0;
  if (days.length) {
    const asc = [...days].reverse();
    let run = 1; longestStreak = 1;
    for (let i = 1; i < asc.length; i++) {
      const prev = new Date(asc[i - 1]);
      const curr = new Date(asc[i]);
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      if (diff === 1) { run++; longestStreak = Math.max(longestStreak, run); }
      else run = 1;
    }
  }

  const catMap: Record<string, { count: number; total: number }> = {};
  for (const e of history) {
    const c = e.category ?? 'Unknown';
    if (!catMap[c]) catMap[c] = { count: 0, total: 0 };
    catMap[c].count++;
    if (typeof e.score === 'number') catMap[c].total += e.score;
  }
  const diffMap: Record<string, number> = {};
  for (const e of history) {
    const d = e.difficulty ?? 'Unknown'; diffMap[d] = (diffMap[d] ?? 0) + 1;
  }

  // Full chronological list of graded scores for the interactive chart.
  const chartScored = [...graded].sort((a, b) => a.timestamp - b.timestamp);
  const avgPerDay = days.length ? total / days.length : 0;

  return {
    total, graded: graded.length, avgScore, bestScore, worstScore,
    streak, longestStreak, catMap, diffMap, chartScored, avgPerDay,
  };
}

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
    } finally { setLoading(false); setRefreshing(false); }
  }, [getToken]);

  useEffect(() => { if (isPaid) load(); else setLoading(false); }, [isPaid, load]);

  const stats = useMemo(() => computeStats(history), [history]);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  if (paidLoading) return <Background><View style={styles.center}><ActivityIndicator color={Colors.secondary} /></View></Background>;
  if (!isPaid) return <Background variant="hero"><SafeAreaView style={styles.safe}><PremiumGate message="Detailed practice stats are a Premium feature." /></SafeAreaView></Background>;
  if (loading) return <Background><View style={styles.center}><ActivityIndicator color={Colors.secondary} /></View></Background>;

  if (!history.length) {
    return (
      <Background variant="hero">
        <SafeAreaView style={styles.safe}>
          <View style={styles.empty}>
            <Ionicons name="stats-chart-outline" size={40} color={Colors.textFaint} />
            <Text style={styles.emptyTitle}>No stats yet</Text>
            <Text style={styles.emptyText}>Practice questions to populate your scoreboard.</Text>
          </View>
        </SafeAreaView>
      </Background>
    );
  }

  const avgColor = scoreColor(stats.avgScore);

  return (
    <Background variant="hero">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.secondary} />}
        >
          <View style={styles.headerRow}>
            <BrandLogo size="md" premium={isPaid} />
          </View>

          {/* Hero score */}
          <Animated.View entering={FadeIn.duration(500)}>
            <GlassCard accent="cyan" glow padding={20} animate={false}>
              <Text style={styles.heroEyebrow}>YOUR PERFORMANCE</Text>
              <View style={styles.heroRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.heroValueRow}>
                    <Text style={styles.heroBig}>
                      <AnimatedNumber value={stats.avgScore} duration={900} decimals={1} />
                    </Text>
                    <Text style={styles.heroOf}>/10</Text>
                  </View>
                  <Text style={styles.heroLabel}>AVG SCORE · {stats.graded} graded</Text>
                </View>
                <View style={styles.heroStreak}>
                  <Ionicons name="flame" size={18} color={Colors.gold} />
                  <Text style={styles.streakNum}>
                    <AnimatedNumber value={stats.streak} duration={700} />
                  </Text>
                  <Text style={styles.streakLabel}>DAY STREAK</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Quick stats — first row */}
          <View style={styles.quickGrid}>
            <QuickStat
              icon="document-text" color={Colors.secondary}
              label="Questions" value={stats.total} description="total practiced" delay={40}
            />
            <QuickStat
              icon="trophy" color={Colors.success}
              label="Best" value={stats.bestScore} suffix="/10" description="highest score" delay={100}
            />
            <QuickStat
              icon="trending-down" color={Colors.warning}
              label="Worst" value={stats.worstScore} suffix="/10" description="lowest score" delay={160}
            />
          </View>

          {/* Quick stats — second row */}
          <View style={[styles.quickGrid, { marginTop: 8 }]}>
            <QuickStat
              icon="calendar" color={Colors.gold}
              label="Per day" value={stats.avgPerDay} decimals={1} suffix=" Qs" description="daily average" delay={40}
            />
            <QuickStat
              icon="flame" color={Colors.gold}
              label="Best streak" value={stats.longestStreak} suffix=" days" description="consecutive days" delay={100}
            />
            <QuickStat
              icon="analytics" color={Colors.secondary}
              label="Graded" value={stats.graded} description={`of ${stats.total} total`} delay={160}
            />
          </View>

          {/* Interactive score-history chart with window slider */}
          {stats.chartScored.length >= 2 && (
            <>
              <SectionHeader eyebrow="SCORE HISTORY" title="Rolling average" style={{ marginTop: Spacing.xl }} />
              <ScoreChartCard scored={stats.chartScored} setScrollEnabled={setScrollEnabled} />
            </>
          )}

          {/* Difficulty */}
          <SectionHeader eyebrow="DIFFICULTY" title="Practice mix" style={{ marginTop: Spacing.lg }} />
          <GlassCard accent="ghost" padding={16} animate={false}>
            {Object.entries(stats.diffMap).map(([d, count]) => {
              const color = DIFFICULTY_COLORS[d as QuestionDifficulty] ?? Colors.secondary;
              const pct = (count / stats.total) * 100;
              return (
                <Animated.View key={d} entering={FadeInUp.duration(360)} style={styles.barRow}>
                  <Text style={[styles.barLabel, { color }]}>{d}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.barCount}>{count}</Text>
                  <Text style={styles.barPct}>{Math.round(pct)}%</Text>
                </Animated.View>
              );
            })}
          </GlassCard>

          {/* Category */}
          <SectionHeader eyebrow="CATEGORY" title="Where you spend time" style={{ marginTop: Spacing.lg }} />
          <GlassCard accent="ghost" padding={16} animate={false}>
            <View style={styles.catColHeaders}>
              <View style={{ width: 30 }} />
              <Text style={[styles.catColLabel, { flex: 1, marginLeft: 10 }]}>CATEGORY</Text>
              <Text style={[styles.catColLabel, { width: 36, textAlign: 'right' }]}>QS</Text>
              <Text style={[styles.catColLabel, { width: 36, textAlign: 'right' }]}>AVG</Text>
            </View>
            {Object.entries(stats.catMap)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([cat, { count, total }], idx) => {
                const avg = count ? total / count : 0;
                const maxCount = Math.max(...Object.values(stats.catMap).map(v => v.count), 1);
                const pct = (count / maxCount) * 100;
                const avgColor = avg > 0 ? scoreColor(avg) : Colors.textFaint;
                return (
                  <Animated.View key={cat} entering={FadeInUp.duration(360).delay(idx * 40)} style={styles.catRow}>
                    <View style={styles.catIconBox}>
                      <Ionicons name={(CATEGORY_ICONS[cat] as any) ?? 'apps-outline'} size={14} color={Colors.secondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.catName}>{cat}</Text>
                      <View style={styles.catBarWrap}>
                        <LinearGradient
                          colors={Gradients.cyan as any}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                          style={[styles.catBarFill, { width: `${pct}%` }]}
                        />
                      </View>
                    </View>
                    <View style={styles.catRight}>
                      <Text style={styles.catCount}>{count}</Text>
                      <Text style={[styles.catAvg, { color: avg > 0 ? avgColor : Colors.textFaint }]}>
                        {avg > 0 ? avg.toFixed(1) : '—'}
                      </Text>
                    </View>
                  </Animated.View>
                );
              })}
          </GlassCard>

          <View style={{ height: 120 }} />
        </ScrollView>
        <ScrollFade top={28} bottom={90} />
      </SafeAreaView>
    </Background>
  );
}

function QuickStat({ icon, color, label, value, suffix, decimals, description, delay = 0 }: { icon: any; color: string; label: string; value: number; suffix?: string; decimals?: number; description?: string; delay?: number }) {
  return (
    <Animated.View entering={FadeInUp.duration(400).delay(delay)} style={{ flex: 1 }}>
      <GlassCard accent="ghost" padding={14} animate={false}>
        <View style={{ alignItems: 'center', gap: 5 }}>
          <View style={[styles.qIcon, { backgroundColor: color + '22', borderColor: color + '55' }]}>
            <Ionicons name={icon} size={14} color={color} />
          </View>
          <Text style={styles.qLabel}>{label}</Text>
          <View style={styles.qValueRow}>
            <Text style={styles.qValue}>
              <AnimatedNumber value={value} duration={800} decimals={decimals ?? 0} />
            </Text>
            {suffix ? <Text style={styles.qSuffix}>{suffix}</Text> : null}
          </View>
          {description ? <Text style={styles.qDescription}>{description}</Text> : null}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

// ─── Interactive score chart ──────────────────────────────────────────────
// Shows up to MAX_BARS bars on-screen (samples larger windows). Bar widths
// scale with bar count so they fill the chart area at any density.

const MAX_BARS = 40;
const CHART_HEIGHT = 100;
const Y_MARKS = [10, 7, 5] as const;

function ScoreChartCard({ scored, setScrollEnabled }: { scored: HistoryEntry[]; setScrollEnabled: (v: boolean) => void }) {
  const router = useRouter();
  const maxN = scored.length;
  const [windowN, setWindowN] = useState<number>(Math.min(maxN, 12));
  const [selected, setSelected] = useState<number | null>(null);
  const [chartWidth, setChartWidth] = useState(0);

  const effectiveN = Math.min(windowN, maxN);
  const windowBars = useMemo(() => scored.slice(-effectiveN), [scored, effectiveN]);

  // Sample down to MAX_BARS so we never render an unmanageable number of bars.
  const displayed = useMemo(() => {
    if (windowBars.length <= MAX_BARS) return windowBars;
    const step = windowBars.length / MAX_BARS;
    const out: HistoryEntry[] = [];
    for (let i = 0; i < MAX_BARS; i++) out.push(windowBars[Math.floor(i * step)]);
    return out;
  }, [windowBars]);

  // Reset selection when the window shrinks past the selected index.
  useEffect(() => {
    if (selected !== null && selected >= displayed.length) setSelected(null);
  }, [displayed.length, selected]);

  // Bar width fills the measured chart area; stays between 3–16 px.
  const barWidth = useMemo(() => {
    if (!chartWidth || !displayed.length) return 8;
    const gap = 2;
    const totalGap = Math.max(0, displayed.length - 1) * gap;
    return Math.max(3, Math.min(16, (chartWidth - totalGap) / displayed.length));
  }, [chartWidth, displayed.length]);

  const windowAvg = windowBars.length
    ? windowBars.reduce((s, e) => s + (e.score ?? 0), 0) / windowBars.length
    : 0;
  const avgColor = scoreColor(windowAvg);

  const selectedEntry = selected !== null ? displayed[selected] : null;

  const openInHistory = (ts: number) =>
    router.push({ pathname: '/(tabs)/history', params: { highlight: String(ts) } } as any);

  const handleBarPress = (i: number) => {
    if (selected === i) {
      const e = displayed[i];
      if (e?.timestamp) openInHistory(e.timestamp);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setSelected(i);
    }
  };

  return (
    <GlassCard accent="ghost" padding={16} animate={false}>
      <View style={styles.chartHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.chartAvgRow}>
            <Text style={[styles.chartAvg, { color: avgColor }]}>{windowAvg.toFixed(1)}</Text>
            <Text style={styles.chartAvgOf}>/10</Text>
          </View>
          <Text style={styles.chartAvgLabel}>
            avg over last {effectiveN} question{effectiveN !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.windowBadge}>
          <Text style={styles.windowBadgeText}>{effectiveN}</Text>
          <Text style={styles.windowBadgeUnit}>Qs</Text>
        </View>
      </View>

      {/* Tooltip */}
      <SelectedEntryTooltip
        entry={selectedEntry}
        onClose={() => setSelected(null)}
        onOpen={(ts) => openInHistory(ts)}
      />

      {/* Chart: y-axis + bars side-by-side */}
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisCol}>
          {Y_MARKS.map(s => (
            <Text key={s} style={[styles.yAxisLabel, { bottom: s * 10 - 4 }]}>{s}</Text>
          ))}
          <Text style={[styles.yAxisLabel, { bottom: -4 }]}>0</Text>
        </View>

        {/* Bars + hairline reference lines */}
        <View
          style={styles.chartBars}
          onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
        >
          {/* Reference lines */}
          {Y_MARKS.map(s => (
            <View
              key={s}
              pointerEvents="none"
              style={[styles.refLine, { bottom: s * 10 }]}
            />
          ))}
          {/* Score bars */}
          {displayed.map((e, i) => {
            const s = e.score ?? 0;
            const color = scoreColor(s);
            return (
              <ChartBar
                key={`${e.timestamp}-${i}`}
                score={s}
                color={color}
                delay={Math.min(i * 15, 300)}
                selected={selected === i}
                onPress={() => handleBarPress(i)}
                barWidth={barWidth}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.chartAxis}>
        <Text style={styles.chartAxisLabel}>oldest</Text>
        <Text style={styles.chartAxisLabel}>newest</Text>
      </View>

      {/* Slider */}
      <RangeSlider min={2} max={maxN} value={effectiveN} onChange={setWindowN} setScrollEnabled={setScrollEnabled} />
      <View style={styles.sliderTicks}>
        <Text style={styles.tickLabel}>2</Text>
        <Text style={styles.tickLabel}>{maxN}</Text>
      </View>
    </GlassCard>
  );
}

function ChartBar({
  score, color, delay, selected, onPress, barWidth,
}: { score: number; color: string; delay: number; selected: boolean; onPress: () => void; barWidth: number }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withTiming(Math.max((score / 10) * CHART_HEIGHT, 3), {
      duration: 600, easing: Easing.out(Easing.cubic),
    });
  }, [score, h]);
  const animStyle = useAnimatedStyle(() => ({ height: h.value }));
  const radius = Math.max(2, barWidth * 0.25);
  return (
    <Animated.View
      entering={FadeIn.duration(200).delay(delay)}
      style={{ width: barWidth, height: CHART_HEIGHT, justifyContent: 'flex-end' }}
    >
      <Pressable
        onPress={onPress}
        hitSlop={6}
        style={{ width: barWidth, height: CHART_HEIGHT, justifyContent: 'flex-end' }}
      >
        <Animated.View
          style={[
            { width: barWidth, borderRadius: radius, minHeight: 3, backgroundColor: color },
            animStyle,
            selected && { borderWidth: 1.5, borderColor: Colors.textBright },
          ]}
        />
      </Pressable>
    </Animated.View>
  );
}

function SelectedEntryTooltip({
  entry, onClose, onOpen,
}: { entry: HistoryEntry | null; onClose: () => void; onOpen: (ts: number) => void }) {
  if (!entry) return null;
  const s = entry.score ?? 0;
  const hcol = scoreColor(s);
  const date = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const isInterview = entry.type === 'interview';
  const title = entry.question ?? entry.scenario ?? (isInterview ? 'Interview session' : '');

  return (
    <Animated.View entering={FadeIn.duration(180)} style={styles.tooltipWrap}>
      <Pressable
        onPress={() => onOpen(entry.timestamp)}
        style={styles.tooltipCard}
      >
        <View style={[styles.tooltipScore, { borderColor: hcol, backgroundColor: scoreColor(s, 0.18) }]}>
          <Text style={[styles.tooltipScoreText, { color: hcol }]}>{s}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.tooltipTitle} numberOfLines={1}>{title}</Text>
          <View style={styles.tooltipTagsRow}>
            {isInterview && <Text style={[styles.tooltipTag, { color: Colors.gold }]}>Interview</Text>}
            {entry.category && <Text style={styles.tooltipTag}>{entry.category}</Text>}
            {entry.difficulty && <Text style={styles.tooltipTag}>{entry.difficulty}</Text>}
            <Text style={styles.tooltipDate}>{date}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => onOpen(entry.timestamp)}
          hitSlop={8}
          style={styles.tooltipOpenBtn}
        >
          <Ionicons name="information-circle" size={20} color={Colors.secondary} />
        </Pressable>
        <Pressable onPress={onClose} hitSlop={8} style={{ paddingLeft: 4 }}>
          <Ionicons name="close" size={16} color={Colors.textFaint} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

function RangeSlider({ min, max, value, onChange, setScrollEnabled }: { min: number; max: number; value: number; onChange: (v: number) => void; setScrollEnabled?: (v: boolean) => void }) {
  const widthRef = useRef(0);
  // Store the container's absolute screen-X so we can map gestureState coords correctly.
  // locationX is relative to the touch target (could be the thumb, not the container),
  // which causes jumps. gestureState.moveX is always absolute screen coords.
  const pageXRef = useRef(0);
  const viewRef = useRef<View>(null);
  const lastValueRef = useRef(value);
  lastValueRef.current = value;

  const respondRef = useRef<(xRaw: number) => void>(() => {});
  respondRef.current = (xRaw: number) => {
    const w = widthRef.current;
    if (!w) return;
    const x = Math.max(0, Math.min(w, xRaw));
    const v = Math.round(min + (x / w) * (max - min));
    if (v !== lastValueRef.current) {
      lastValueRef.current = v;
      Haptics.selectionAsync().catch(() => {});
      onChange(v);
    }
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (_, g) => {
        setScrollEnabled?.(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        respondRef.current(g.x0 - pageXRef.current);
      },
      onPanResponderMove: (_, g) => respondRef.current(g.moveX - pageXRef.current),
      onPanResponderRelease: () => {
        setScrollEnabled?.(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
      },
      onPanResponderTerminate: () => setScrollEnabled?.(true),
    })
  ).current;

  const pct = max > min ? (value - min) / (max - min) : 0;

  return (
    <View
      ref={viewRef}
      style={styles.sliderHit}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
        viewRef.current?.measure((_x, _y, _w, _h, pageX) => {
          pageXRef.current = pageX;
        });
      }}
      {...pan.panHandlers}
    >
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${pct * 100}%` }]} />
      </View>
      <View style={[styles.sliderThumb, { left: `${pct * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base },

  headerRow: { marginBottom: Spacing.lg },

  // Hero
  heroEyebrow: { color: Colors.secondary, fontFamily: Typography.fonts.displayExtra, fontSize: 10, fontWeight: '800', letterSpacing: 2.2, marginBottom: Spacing.md },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  heroValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  heroBig: { color: Colors.text, fontFamily: Typography.fonts.displayExtra, fontSize: 48, fontWeight: '800', letterSpacing: -2, lineHeight: 52 },
  heroOf: { color: Colors.textMuted, fontFamily: Typography.fonts.sansBold, fontSize: 20, fontWeight: '700', letterSpacing: 0, marginLeft: 6 },
  heroLabel: { color: Colors.textMuted, fontFamily: Typography.fonts.display, fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginTop: 4 },
  heroStreak: {
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: Radius.lg,
    backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.35)',
    alignItems: 'center', gap: 2,
  },
  streakNum: { color: Colors.gold, fontFamily: Typography.fonts.displayExtra, fontSize: 26, fontWeight: '800', lineHeight: 30 },
  streakLabel: { color: Colors.gold, fontFamily: Typography.fonts.display, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },

  // Quick stats
  quickGrid: { flexDirection: 'row', gap: 8, marginTop: Spacing.md },
  qIcon: {
    width: 30, height: 30, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  qLabel: { color: Colors.textMuted, fontFamily: Typography.fonts.display, fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
  qValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  qValue: { color: Colors.text, fontFamily: Typography.fonts.displayExtra, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  qSuffix: { color: Colors.textMuted, fontFamily: Typography.fonts.sansBold, fontSize: 11, fontWeight: '700', marginLeft: 3, letterSpacing: 0 },
  qDescription: { color: Colors.textFaint, fontFamily: Typography.fonts.sans, fontSize: 9, textAlign: 'center', lineHeight: 13 },

  // Score chart card
  chartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  chartAvgRow: { flexDirection: 'row', alignItems: 'baseline' },
  chartAvg: { fontFamily: Typography.fonts.displayExtra, fontSize: 30, fontWeight: '800', letterSpacing: -1, lineHeight: 32 },
  chartAvgOf: { color: Colors.textMuted, fontFamily: Typography.fonts.sansBold, fontSize: 14, fontWeight: '700', marginLeft: 4, letterSpacing: 0 },
  chartAvgLabel: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: 11, marginTop: 2 },
  windowBadge: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.md,
    backgroundColor: 'rgba(79,195,247,0.12)', borderWidth: 1, borderColor: 'rgba(79,195,247,0.4)',
    flexDirection: 'row', alignItems: 'baseline', gap: 3,
  },
  windowBadgeText: { color: Colors.secondary, fontFamily: Typography.fonts.displayExtra, fontSize: 16, fontWeight: '800' },
  windowBadgeUnit: { color: Colors.secondary, fontFamily: Typography.fonts.display, fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  // Tooltip for selected bar
  tooltipWrap: { marginBottom: Spacing.md },
  tooltipCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: Radius.md,
    backgroundColor: 'rgba(15,34,54,0.85)',
    borderWidth: 1, borderColor: 'rgba(79,195,247,0.45)',
  },
  tooltipScore: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
  },
  tooltipScoreText: { fontFamily: Typography.fonts.displayExtra, fontSize: 12, fontWeight: '800' },
  tooltipTitle: { color: Colors.text, fontFamily: Typography.fonts.sansMedium, fontSize: 12, lineHeight: 16 },
  tooltipTagsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 3 },
  tooltipTag: {
    color: Colors.textMuted, fontFamily: Typography.fonts.display,
    fontSize: 9, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase',
  },
  tooltipDate: { color: Colors.textFaint, fontFamily: Typography.fonts.sans, fontSize: 10 },
  tooltipOpenBtn: { paddingHorizontal: 4, paddingVertical: 2 },

  // Chart layout
  chartContainer: { flexDirection: 'row', gap: 6, height: CHART_HEIGHT, marginBottom: Spacing.sm },
  yAxisCol: { width: 14, height: CHART_HEIGHT, position: 'relative' },
  yAxisLabel: {
    position: 'absolute', right: 0,
    color: Colors.textFaint, fontFamily: Typography.fonts.display,
    fontSize: 8, fontWeight: '700', textAlign: 'right',
  },
  refLine: {
    position: 'absolute', left: 0, right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  chartBars: {
    flex: 1, height: CHART_HEIGHT, position: 'relative',
    flexDirection: 'row', alignItems: 'flex-end', gap: 2,
  },
  chartAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 14 },
  chartAxisLabel: { color: Colors.textFaint, fontFamily: Typography.fonts.display, fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },

  // Range slider
  sliderHit: { height: 32, justifyContent: 'center' },
  sliderTrack: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' },
  sliderFill: { height: 4, borderRadius: 2, backgroundColor: Colors.secondary },
  sliderThumb: {
    position: 'absolute', width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.secondary, marginLeft: -9,
    borderWidth: 2, borderColor: Colors.bg,
    shadowColor: Colors.secondary, shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  sliderTicks: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  tickLabel: { color: Colors.textFaint, fontFamily: Typography.fonts.display, fontSize: 9, fontWeight: '700', letterSpacing: 1 },

  // Bars
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  barLabel: { width: 70, fontFamily: Typography.fonts.display, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  barTrack: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4 },
  barFill: { height: 8, borderRadius: 4 },
  barCount: { color: Colors.text, fontFamily: Typography.fonts.sansBold, fontSize: 13, width: 28, textAlign: 'right' },
  barPct: { color: Colors.textFaint, fontFamily: Typography.fonts.display, fontSize: 9, fontWeight: '700', width: 30, textAlign: 'right', letterSpacing: 0.5 },

  // Category
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  catIconBox: { width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(79,195,247,0.12)', alignItems: 'center', justifyContent: 'center' },
  catName: { color: Colors.text, fontFamily: Typography.fonts.sansMedium, fontSize: Typography.sizes.sm, marginBottom: 4 },
  catBarWrap: { height: 5, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  catBarFill: { height: 5, borderRadius: 3 },
  catColHeaders: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  catColLabel: { color: Colors.textFaint, fontFamily: Typography.fonts.display, fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
  catRight: { flexDirection: 'row', alignItems: 'center', gap: 0, width: 72 },
  catCount: { color: Colors.text, fontFamily: Typography.fonts.sansBold, fontSize: 13, width: 36, textAlign: 'right' },
  catAvg: { fontFamily: Typography.fonts.displayExtra, fontSize: 11, fontWeight: '800', width: 36, textAlign: 'right' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyTitle: { color: Colors.text, fontFamily: Typography.fonts.displayExtra, fontSize: Typography.sizes.lg, fontWeight: '800' },
  emptyText: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, textAlign: 'center' },
});
