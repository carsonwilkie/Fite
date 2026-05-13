import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Colors, Typography } from '../../src/theme';

function TabIcon({ focused, icon }: { focused: boolean; icon: string }) {
  // Using emoji as icons — replace with a vector icon library if desired
  return null;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.textFaint,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: Typography.weights.semibold,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color }) => (
            <TabBarIcon icon="⚡" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <TabBarIcon icon="📋" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => (
            <TabBarIcon icon="📊" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => (
            <TabBarIcon icon="👤" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

import { Text, StyleSheet } from 'react-native';

function TabBarIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={[styles.icon, { opacity: color === Colors.secondary ? 1 : 0.5 }]}>{icon}</Text>;
}

const styles = StyleSheet.create({
  icon: { fontSize: 20 },
});
