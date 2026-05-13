import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { Background } from '../src/components/Background';
import { GlassCard } from '../src/components/GlassCard';
import { GradientButton } from '../src/components/GradientButton';
import { PressableScale } from '../src/components/PressableScale';
import { submitFeedback } from '../src/api';
import { Colors, Typography, Spacing, Radius, Gradients } from '../src/theme';

const MAX = 4000;

export default function FeedbackScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) { Alert.alert('Write a message first.'); return; }
    setLoading(true);
    try {
      const token = await getToken();
      await submitFeedback({ type: 'feedback', message, token: token ?? undefined });
      setSubmitted(true);
    } catch {
      Alert.alert('Error', 'Could not submit feedback. Please try again.');
    } finally { setLoading(false); }
  }

  if (submitted) {
    return (
      <Background variant="hero">
        <SafeAreaView style={styles.safe}>
          <Animated.View entering={FadeIn.duration(500)} style={styles.successWrap}>
            <LinearGradient
              colors={Gradients.success as any}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.successIcon}
            >
              <Ionicons name="checkmark" size={36} color="#fff" />
            </LinearGradient>
            <Text style={styles.successTitle}>Thanks for the feedback!</Text>
            <Text style={styles.successSub}>We read every submission. The roadmap depends on it.</Text>
            <View style={{ marginTop: Spacing.xl, width: '100%' }}>
              <GradientButton label="Close" onPress={() => router.back()} fullWidth size="lg" />
            </View>
          </Animated.View>
        </SafeAreaView>
      </Background>
    );
  }

  return (
    <Background variant="hero">
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <PressableScale onPress={() => router.back()} haptic="selection" containerStyle={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.text} />
            </PressableScale>
            <Text style={styles.topTitle}>FEEDBACK</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View entering={FadeIn.duration(450)}>
            <GlassCard accent="cyan" glow padding={20} animate={false}>
              <View style={styles.heroBlock}>
                <View style={styles.heroIcon}>
                  <Ionicons name="chatbubble-ellipses" size={20} color={Colors.bgDeep} />
                </View>
                <Text style={styles.heroTitle}>Tell us what's missing.</Text>
                <Text style={styles.heroSub}>
                  Bugs, suggestions, or wishlist features — every note ends up in our planning doc.
                </Text>
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(450).delay(100)} style={{ marginTop: Spacing.lg }}>
            <GlassCard accent="ghost" padding={16} animate={false}>
              <Text style={styles.label}>YOUR MESSAGE</Text>
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={t => setMessage(t.slice(0, MAX))}
                placeholder="What's on your mind?"
                placeholderTextColor={Colors.textFaint}
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{message.length} / {MAX}</Text>
            </GlassCard>
          </Animated.View>

          <View style={{ marginTop: Spacing.xl }}>
            <GradientButton
              label="Send Feedback"
              icon="send"
              onPress={handleSubmit}
              loading={loading}
              size="lg"
              fullWidth
            />
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm, marginBottom: Spacing.md },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.borderLight,
  },
  topTitle: { color: Colors.secondary, fontFamily: Typography.fonts.displayExtra, fontSize: 12, fontWeight: '800', letterSpacing: 2.2 },

  heroBlock: { alignItems: 'center' },
  heroIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.secondary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.secondary, shadowOpacity: 0.6, shadowRadius: 14, shadowOffset: { width: 0, height: 0 },
  },
  heroTitle: { color: Colors.text, fontFamily: Typography.fonts.displayExtra, fontSize: 22, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' },
  heroSub: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, lineHeight: 20, textAlign: 'center', marginTop: 8 },

  label: { color: Colors.textMuted, fontFamily: Typography.fonts.display, fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginBottom: Spacing.sm },
  input: {
    color: Colors.text, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.base,
    lineHeight: 22, minHeight: 200,
    borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: Radius.md, padding: Spacing.md,
    backgroundColor: 'rgba(2,8,23,0.6)',
  },
  charCount: { color: Colors.textFaint, fontFamily: Typography.fonts.sans, fontSize: 11, textAlign: 'right', marginTop: 6 },

  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  successIcon: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.success, shadowOpacity: 0.6, shadowRadius: 20, shadowOffset: { width: 0, height: 0 },
  },
  successTitle: { color: Colors.text, fontFamily: Typography.fonts.displayExtra, fontSize: 26, fontWeight: '800', letterSpacing: -0.6, textAlign: 'center' },
  successSub: { color: Colors.textMuted, fontFamily: Typography.fonts.sans, fontSize: Typography.sizes.sm, lineHeight: 20, textAlign: 'center', marginTop: 10 },
});
