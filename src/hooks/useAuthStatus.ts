// useAuthStatus.ts
import { useEffect, useState } from 'react';
import { getAuthTokens, subscribeToAuthChanges } from '@/services/authStorage';
import { useProfileStatus } from '@/hooks/useProfileStatus';

export type AuthStatus =
  | 'loading'
  | 'unauthenticated'
  | 'authenticated-partial'
  | 'authenticated-full';

type TokenStatus = 'loading' | 'unauthenticated' | 'authenticated';

export function useAuthStatus(): AuthStatus {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    const loadTokens = async () => {
      try {
        const tokens = await getAuthTokens();
        if (cancelled) return;

        if (!tokens?.accessToken) {
          setTokenStatus('unauthenticated');
        } else {
          setTokenStatus('authenticated');
        }
      } catch (err) {
        if (cancelled) return;
        console.warn('[useAuthStatus] getAuthTokens failed:', err);
        setTokenStatus('unauthenticated');
      }
    };

    // initial load
    loadTokens();

    // re-run whenever tokens change
    const unsubscribe = subscribeToAuthChanges(() => {
      loadTokens();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // only fetch profile when we know we have tokens
  const shouldFetchProfile = tokenStatus === 'authenticated';
  const profileStatus = useProfileStatus(shouldFetchProfile);

  // map (tokenStatus + profileStatus) -> AuthStatus
  if (tokenStatus === 'loading') return 'loading';
  if (tokenStatus === 'unauthenticated') return 'unauthenticated';

  // tokenStatus === 'authenticated'
  if (profileStatus === 'loading' || profileStatus === 'unknown') {
    return 'loading';
  }

  if (profileStatus === 'complete') {
    return 'authenticated-full';
  }

  // incomplete or error
  return 'authenticated-partial';
}
