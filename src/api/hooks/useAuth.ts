import { login, refreshToken } from '@/api/endpoints/auth';
import { parseApiError } from '@/api/errors';
import {
  AuthenticationRequest,
  AuthenticationResponse,
  RefreshTokenRequest,
} from '@/api/types/auth';
import { showError, showInfo, showSuccess } from '@/lib/toast';
import { clearAuthTokens, saveAuthTokens } from '@/services/authStorage';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useLogin() {
  return useMutation<AuthenticationResponse, Error, AuthenticationRequest>({
    mutationFn: login,
    async onSuccess(data) {
      await saveAuthTokens(data);
      showSuccess('Welcome back!', 'Logged in');
    },
    onError(error) {
      const apiError = parseApiError(error);
      showError(apiError?.message ?? 'Wrong email or password');
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
