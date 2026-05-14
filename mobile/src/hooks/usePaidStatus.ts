import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkPaid } from '../api';
import { isRcSupported, isRcPremium } from '../revenuecat';

const CACHE_KEY = 'fite_isPaid';

export function usePaidStatus() {
  const { getToken, isSignedIn } = useAuth();
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setIsPaid(false);
      setLoading(false);
      return;
    }

    // Optimistically read cache
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached === 'true') setIsPaid(true);
    } catch {}

    // Backend (Stripe + RevenueCat-webhook synced) is the source of truth.
    let paid = false;
    try {
      const token = await getToken();
      if (token) paid = await checkPaid(token);
    } catch {}

    // RevenueCat fallback: a fresh App Store purchase unlocks instantly
    // even if our webhook hasn't reached Redis yet. Only used on iOS.
    if (!paid && isRcSupported()) {
      try {
        paid = await isRcPremium();
      } catch {}
    }

    setIsPaid(paid);
    setLoading(false);
    try { await AsyncStorage.setItem(CACHE_KEY, paid ? 'true' : 'false'); } catch {}
  }, [isSignedIn, getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { isPaid, loading, refresh };
}
