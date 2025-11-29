import type { AuthenticationResponse, DevUserKey, RefreshTokenRequest } from '@/api/types/auth';
import { apiClient } from '../http/client';

export async function refreshToken(body: RefreshTokenRequest): Promise<AuthenticationResponse> {
  const res = await apiClient.post('/auth/refresh-token', body);
  return res.data;
}

export async function loginWithGoogle(idToken: string): Promise<AuthenticationResponse> {
  const res = await apiClient.post('/auth/login/google', { idToken });
  return res.data;
}

export async function devLogin(userKey: DevUserKey): Promise<AuthenticationResponse> {
  const res = await apiClient.post(`/auth/dev-login/${userKey}`);
  return res.data;
}
