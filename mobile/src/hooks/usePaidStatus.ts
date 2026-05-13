import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkPaid } from '../api';

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

    try {
      const token = await getToken();
      if (!token) {
        setIsPaid(false);
        setLoading(false);
        return;
      }
      const paid = await checkPaid(token);
      setIsPaid(paid);
      await AsyncStorage.setItem(CACHE_KEY, paid ? 'true' : 'false');
    } catch {
      setIsPaid(false);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { isPaid, loading, refresh };
}
