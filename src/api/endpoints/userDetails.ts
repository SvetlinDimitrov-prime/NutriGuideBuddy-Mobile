import { apiClient } from '@/api/http/client';
import type { UserDetailsRequest, UserDetailsResponse } from '@/api/types/userDetails';

export async function getMyUserDetails(): Promise<UserDetailsResponse> {
  const { data } = await apiClient.get<UserDetailsResponse>('user-details/me');
  return data;
}

export async function updateMyUserDetails(
  payload: UserDetailsRequest,
): Promise<UserDetailsResponse> {
  const { data } = await apiClient.patch<UserDetailsResponse>('user-details/me', payload);
  return data;
}
