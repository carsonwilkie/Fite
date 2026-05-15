import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../src/theme';

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; idle: keyof typeof Ionicons.glyphMap }> = {
  index: { active: 'flash', idle: 'flash-outline' },
  ib400: { active: 'library', idle: 'library-outline' },
  history: { active: 'time', idle: 'time-outline' },
  stats: { active: 'stats-chart', idle: 'stats-chart-outline' },
  account: { active: 'person-circle', idle: 'person-circle-outline' },
};

function TabIcon({ focused, color, name }: { focused: boolean; color: string; name: string }) {
  const spec = ICONS[name] ?? ICONS.index;
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={focused ? spec.active : spec.idle} size={22} color={color} />
      {focused && <View style={styles.dot} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: false,
        freezeOnBlur: true,
        animation: 'none',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(13,27,42,0.96)',
          borderTopColor: 'rgba(79,195,247,0.12)',
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          paddingHorizontal: 12,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView tint="dark" intensity={60} style={StyleSheet.absoluteFill} />
          ) : null,
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.textFaint,
        tabBarLabelStyle: {
          fontFamily: Typography.fonts.displaySemibold,
          fontSize: 10,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Practice',
          tabBarIcon: (p) => <TabIcon {...p} name="index" />,
        }}
      />
      <Tabs.Screen
        name="ib400"
        options={{
          title: 'IB 400',
          tabBarIcon: (p) => <TabIcon {...p} name="ib400" />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: (p) => <TabIcon {...p} name="history" />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: (p) => <TabIcon {...p} name="stats" />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: (p) => <TabIcon {...p} name="account" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  dot: {
    position: 'absolute',
    bottom: -24,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.secondary,
    shadowColor: Colors.secondary,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
