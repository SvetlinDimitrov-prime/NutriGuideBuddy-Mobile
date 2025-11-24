import { useQuery } from '@tanstack/react-query';
import { userDetailsSnapshotKeys } from '../queryKeys';
import {
  getUserDetailsSnapshots,
  getUserDetailsSnapshotById,
} from '@/api/endpoints/userDetailsSnapshot';

import type {
  UserDetailsSnapshotFilter,
  UserDetailsSnapshotResponse,
} from '@/api/types/userDetailsSnapshot';

export function useUserDetailsSnapshots(filter?: UserDetailsSnapshotFilter, enabled = true) {
  return useQuery<UserDetailsSnapshotResponse[], Error>({
    queryKey: userDetailsSnapshotKeys.list(filter),
    queryFn: () => getUserDetailsSnapshots(filter),
    enabled,
  });
}

export function useUserDetailsSnapshotById(snapshotId: number, enabled = true) {
  return useQuery<UserDetailsSnapshotResponse, Error>({
    queryKey: userDetailsSnapshotKeys.byId(snapshotId),
    queryFn: () => getUserDetailsSnapshotById(snapshotId),
    enabled: enabled && snapshotId > 0,
  });
}
