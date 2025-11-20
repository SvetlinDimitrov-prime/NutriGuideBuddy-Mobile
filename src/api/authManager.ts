import { API_BASE_URL, API_VERSION_PREFIX } from '@/api/config';
import type { AuthenticationResponse } from '@/api/types/auth';
import { clearAuthTokens, getAuthTokens, saveAuthTokens } from '@/services/authStorage';
import axios from 'axios';

let refreshPromise: Promise<string | null> | null = null;

function isAccessTokenStillValid(tokens: AuthenticationResponse): boolean {
  if (!tokens.expiresAt) return false;

  const expMs = Date.parse(tokens.expiresAt);
  if (Number.isNaN(expMs)) return false;

  const now = Date.now();
  return expMs > now + 30_000;
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getAuthTokens();
  if (!tokens) return null;

  const { accessToken, refreshToken } = tokens;

  if (accessToken && isAccessTokenStillValid(tokens)) {
    return accessToken;
  }

  if (!refreshToken) {
    await clearAuthTokens();
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const { data } = await axios.post<AuthenticationResponse>(
        `${API_BASE_URL}${API_VERSION_PREFIX}/auth/refresh-token`,
        { token: refreshToken },
      );

      await saveAuthTokens(data);
      return data.accessToken;
    } catch {
      await clearAuthTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
