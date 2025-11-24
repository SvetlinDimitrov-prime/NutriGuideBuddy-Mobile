import { apiClient } from '@/api/http/client';
import type {
  UserDetailsSnapshotFilter,
  UserDetailsSnapshotResponse,
} from '@/api/types/userDetailsSnapshot';

const base = () => `/user-details-snapshot`;

export async function getUserDetailsSnapshots(filter?: UserDetailsSnapshotFilter) {
  const { data } = await apiClient.post<UserDetailsSnapshotResponse[]>(
    `${base()}/get-all`,
    filter ?? {},
  );
  return data;
}

export async function getUserDetailsSnapshotById(snapshotId: number) {
  const { data } = await apiClient.get<UserDetailsSnapshotResponse>(`${base()}/${snapshotId}`);
  return data;
}
