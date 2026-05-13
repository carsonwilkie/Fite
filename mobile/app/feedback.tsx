import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

import { Colors, Typography, Spacing, Radius } from '../src/theme';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { submitFeedback } from '../src/api';

const MAX_CHARS = 4000;

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
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Thanks for the feedback!</Text>
          <Text style={styles.successText}>We read every submission and use it to improve Fite.</Text>
          <Button label="Close" onPress={() => router.back()} style={styles.closeBtn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Feedback</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subtitle}>
          Bugs, suggestions, or general thoughts — we want to hear it all.
        </Text>

        <Card style={styles.card}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={t => setMessage(t.slice(0, MAX_CHARS))}
            placeholder="What's on your mind?"
            placeholderTextColor={Colors.textFaint}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{message.length}/{MAX_CHARS}</Text>
        </Card>

        <Button label="Send Feedback" onPress={handleSubmit} loading={loading} size="lg" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.base, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.base },
  close: { color: Colors.textMuted, fontSize: Typography.sizes.lg },
  title: { color: Colors.text, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
  subtitle: { color: Colors.textMuted, fontSize: Typography.sizes.base, lineHeight: 22, marginBottom: Spacing.xl },
  card: { marginBottom: Spacing.base },
  input: { color: Colors.text, fontSize: Typography.sizes.base, lineHeight: 22, minHeight: 180 },
  charCount: { color: Colors.textFaint, fontSize: Typography.sizes.xs, textAlign: 'right', marginTop: Spacing.xs },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  successIcon: { fontSize: 64, marginBottom: Spacing.base },
  successTitle: { color: Colors.text, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, marginBottom: Spacing.sm },
  successText: { color: Colors.textMuted, fontSize: Typography.sizes.base, textAlign: 'center', marginBottom: Spacing.xl },
  closeBtn: { width: '100%' },
});
