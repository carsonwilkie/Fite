import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkPaid } from '../api';
import { isRcSupported, isRcPremium } from '../revenuecat';

const CACHE_KEY = 'fite_isPaid';

type PaidStatusValue = {
  isPaid: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const PaidStatusContext = createContext<PaidStatusValue | null>(null);

export function PaidStatusProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const inFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      if (!isSignedIn) {
        setIsPaid(false);
        try { await AsyncStorage.setItem(CACHE_KEY, 'false'); } catch {}
        setLoading(false);
        return;
      }

      // Hydrate from cache first so we don't briefly render the free-user UI
      // for a returning paid user while the backend check is in flight.
      let cachedPaid = false;
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached === 'true') {
          cachedPaid = true;
          setIsPaid(true);
        }
      } catch {}

      let paid = false;
      let backendOk = false;
      try {
        const token = await getToken();
        if (token) {
          paid = await checkPaid(token);
          backendOk = true;
        }
      } catch {}

      // RevenueCat fallback: a fresh App Store purchase unlocks instantly
      // even if our webhook hasn't reached Redis yet. Only used on iOS.
      if (!paid && isRcSupported()) {
        try {
          paid = await isRcPremium();
          if (paid) backendOk = true;
        } catch {}
      }

      // If neither source confirmed a status, trust the cache rather than
      // flipping a paid user back to the free view on a transient failure.
      const next = backendOk ? paid : cachedPaid;
      setIsPaid(next);
      try { await AsyncStorage.setItem(CACHE_KEY, next ? 'true' : 'false'); } catch {}
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (!isLoaded) return;
    refresh();
  }, [isLoaded, isSignedIn, refresh]);

  const value: PaidStatusValue = { isPaid, loading, refresh };
  return (
    <PaidStatusContext.Provider value={value}>{children}</PaidStatusContext.Provider>
  );
}

export function usePaidStatus(): PaidStatusValue {
  const ctx = useContext(PaidStatusContext);
  if (!ctx) {
    throw new Error('usePaidStatus must be used inside <PaidStatusProvider>');
  }
  return ctx;
}
