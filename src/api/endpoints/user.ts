import { apiClient } from '@/api/http/client';
import {
  UserCreateRequest,
  UserFilter,
  UserResponse,
  UserUpdateRequest,
  UserWithDetailsResponse,
} from '@/api/types/user';

export async function createUser(payload: UserCreateRequest): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>('user', payload);
  return data;
}

export async function getUsers(filter?: UserFilter): Promise<UserResponse[]> {
  const { data } = await apiClient.post<UserResponse[]>('user/get/all', filter ?? {});
  return data;
}

export async function getUserById(userId: number): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>(`user/${userId}`);
  return data;
}

export async function getUserByIdWithDetails(userId: number): Promise<UserWithDetailsResponse> {
  const { data } = await apiClient.get<UserWithDetailsResponse>(`user/${userId}/with-details`);
  return data;
}

export async function getMe(): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>('user/me');
  return data;
}

export async function getMeWithDetails(): Promise<UserWithDetailsResponse> {
  const { data } = await apiClient.get<UserWithDetailsResponse>('user/me/with-details');
  return data;
}

export async function updateUser(
  userId: number,
  payload: UserUpdateRequest,
): Promise<UserResponse> {
  const { data } = await apiClient.patch<UserResponse>(`user/${userId}`, payload);
  return data;
}

export async function deleteUser(userId: number): Promise<void> {
  await apiClient.delete(`user/${userId}`);
}
