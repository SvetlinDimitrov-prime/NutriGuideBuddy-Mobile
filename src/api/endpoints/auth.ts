import { apiClient } from '@/api/http/client';
import {
  AuthenticationRequest,
  AuthenticationResponse,
  RefreshTokenRequest,
} from '@/api/types/auth';

export async function login(payload: AuthenticationRequest): Promise<AuthenticationResponse> {
  const { data } = await apiClient.post<AuthenticationResponse>('auth/login', payload);
  return data;
}

export async function refreshToken(payload: RefreshTokenRequest): Promise<AuthenticationResponse> {
  const { data } = await apiClient.post<AuthenticationResponse>('auth/refresh-token', payload);
  return data;
}
