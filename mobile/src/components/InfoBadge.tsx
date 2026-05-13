import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing, Typography } from '../theme';

/**
 * Standalone info popover. Open with `visible`, controlled by parent.
 *
 * The Modal itself has `animationType="none"` — all entry/exit is handled by
 * Reanimated so the backdrop fade and sheet slide stay in lockstep. (Mixing
 * Modal's built-in fade with Reanimated's exit caused a visible "twitch" on
 * close.)
 */
export function InfoSheet({
  visible,
  onClose,
  eyebrow,
  body,
}: {
  visible: boolean;
  onClose: () => void;
  eyebrow: string;
  body: string;
}) {
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  // Drive a mount/unmount cycle so the exit animation has time to play before
  // the Modal is actually torn down.
  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withSpring(1, { damping: 18, stiffness: 220, mass: 0.7 });
    } else if (mounted) {
      progress.value = withTiming(0, { duration: 180, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 24 },
      { scale: 0.96 + progress.value * 0.04 },
    ],
  }));

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[styles.sheetWrap, sheetStyle]} pointerEvents="box-none">
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color={Colors.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.body}>{body}</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Self-contained info button. Renders as a small ghost pill (or icon-only) and
 * owns its own open/close state. Drop it next to any control that needs an
 * "explain this" affordance.
 */
export function InfoButton({
  eyebrow,
  body,
  variant = 'pill',
  tone = 'neutral',
}: {
  eyebrow: string;
  body: string;
  /** "pill" matches a Pill's height/border. "dot" is a tiny inline indicator. */
  variant?: 'pill' | 'dot';
  tone?: 'neutral' | 'active';
}) {
  const [open, setOpen] = useState(false);

  function handleOpen() {
    Haptics.selectionAsync().catch(() => {});
    setOpen(true);
  }

  if (variant === 'dot') {
    return (
      <>
        <Pressable
          onPress={handleOpen}
          hitSlop={12}
          style={({ pressed }) => [
            styles.dotBtn,
            tone === 'active' && styles.dotBtnActive,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Ionicons
            name="information"
            size={11}
            color={tone === 'active' ? '#fff' : Colors.secondary}
          />
        </Pressable>
        <InfoSheet visible={open} onClose={() => setOpen(false)} eyebrow={eyebrow} body={body} />
      </>
    );
  }

  return (
    <>
      <Pressable
        onPress={handleOpen}
        hitSlop={6}
        style={({ pressed }) => [styles.pillBtn, pressed && { opacity: 0.6 }]}
      >
        <Ionicons name="information-circle-outline" size={14} color={Colors.secondary} />
      </Pressable>
      <InfoSheet visible={open} onClose={() => setOpen(false)} eyebrow={eyebrow} body={body} />
    </>
  );
}

const styles = StyleSheet.create({
  // Pill-shaped info button — matches Pill height so it nestles in a pill row.
  pillBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(79,195,247,0.35)',
    backgroundColor: 'rgba(79,195,247,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Compact circular "i" indicator — for icon-only contexts.
  dotBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(79,195,247,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(79,195,247,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: 'rgba(255,255,255,0.4)',
  },

  // Modal
  modalRoot: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: 'rgba(2,8,23,0.72)',
  },
  sheetWrap: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    bottom: Spacing.xxl + 20,
  },
  sheet: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(79,195,247,0.35)',
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eyebrow: {
    color: Colors.secondary,
    fontFamily: Typography.fonts.displayExtra,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    flex: 1,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  body: {
    color: Colors.text,
    fontFamily: Typography.fonts.sans,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
});

// Back-compat: old code imported { InfoBadge }. Keep the named export.
export const InfoBadge = InfoButton;
