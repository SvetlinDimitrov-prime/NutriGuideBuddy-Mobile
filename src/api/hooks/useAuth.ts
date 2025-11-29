import { devLogin, loginWithGoogle, refreshToken } from '@/api/endpoints/auth';
import { parseApiError } from '@/api/errors';
import type { AuthenticationResponse, DevUserKey, RefreshTokenRequest } from '@/api/types/auth';
import { showError, showInfo, showSuccess } from '@/lib/toast';
import { clearAuthTokens, saveAuthTokens } from '@/services/authStorage';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useGoogleLogin() {
  return useMutation<AuthenticationResponse, Error, string>({
    mutationFn: (idToken: string) => loginWithGoogle(idToken),
    async onSuccess(data) {
      await saveAuthTokens(data);
      showSuccess('Welcome!', 'Logged in with Google');
    },
    onError(error) {
      const apiError = parseApiError(error);
      showError(apiError?.message ?? 'Google login failed');
    },
  });
}

export function useDevLogin() {
  return useMutation<AuthenticationResponse, Error, DevUserKey>({
    mutationFn: (userKey: DevUserKey) => devLogin(userKey),
    async onSuccess(data) {
      await saveAuthTokens(data);
      showSuccess('Logged in as dev user');
    },
    onError(error) {
      const apiError = parseApiError(error);
      showError(apiError?.message ?? 'Dev login failed');
    },
  });
}

export function useRefreshToken() {
  return useMutation<AuthenticationResponse, Error, RefreshTokenRequest>({
    mutationFn: refreshToken,
    async onSuccess(data) {
      await saveAuthTokens(data);
    },
    onError(error) {
      const apiError = parseApiError(error);
      if (apiError?.status === 401 || apiError?.status === 403) {
        showError('Session expired, please log in again');
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await clearAuthTokens();
    },
    onSuccess() {
      queryClient.clear();
      showInfo('You have been logged out');
    },
  });
}
