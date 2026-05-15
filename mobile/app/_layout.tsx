import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';
import { guestMode } from '../src/guestMode';
import { configureRevenueCat, isRcSupported } from '../src/revenuecat';
import { PaidStatusProvider, usePaidStatus } from '../src/hooks/usePaidStatus';
import {
  useFonts as useInterFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { Colors } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const publishableKey =
  Constants.expoConfig?.extra?.clerkPublishableKey ??
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  '';

console.log('Clerk key:', publishableKey ? publishableKey.slice(0, 20) + '...' : 'EMPTY');

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  async deleteToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

function AuthGate() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { loading: paidLoading } = usePaidStatus();
  const segments = useSegments();
  const router = useRouter();

  // Configure RevenueCat once, then keep its app-user-id in sync with Clerk
  // so the backend webhook can map StoreKit events to paid:${userId} in Redis.
  useEffect(() => {
    if (!isRcSupported()) return;
    if (!isLoaded) return;
    configureRevenueCat(isSignedIn ? user?.id ?? null : null).catch(() => {});
  }, [isLoaded, isSignedIn, user?.id]);

  useEffect(() => {
    if (!isLoaded) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isSignedIn && !inAuthGroup && !guestMode.isAllowed()) {
      router.replace('/(auth)/sign-in');
    } else if (isSignedIn && inAuthGroup) {
      // User signed in — clear any guest bypass so the flow is clean next time.
      guestMode.reset();
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isLoaded, segments, router]);

  // Keep the native splash screen up until Clerk has resolved and (for signed-in
  // users) paid status has resolved. This prevents a flash of the free-tier UI
  // on cold start for paid users without showing a separate loading screen.
  const ready = isLoaded && (!isSignedIn || !paidLoading);
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen
        name="interview"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="paywall"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="feedback"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="feature-vote"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="ib-question"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  // Splash hide is owned by <AuthGate> so we can also wait for Clerk + paid
  // status to resolve before revealing the app. Render nothing (splash stays
  // visible) until fonts load.
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <PaidStatusProvider>
            <StatusBar style="light" />
            <AuthGate />
          </PaidStatusProvider>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  loading: { alignItems: 'center', justifyContent: 'center' },
});
