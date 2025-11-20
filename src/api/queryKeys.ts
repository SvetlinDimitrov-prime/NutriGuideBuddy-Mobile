import type { UserFilter } from '@/api/types/user';

export const authKeys = {
  root: () => ['auth'] as const,
};

export const userKeys = {
  root: () => ['users'] as const,
  list: (filter?: UserFilter) => ['users', filter] as const,
  detail: (userId: number) => ['users', 'detail', userId] as const,
  detailWithDetails: (userId: number) => ['users', 'detail', userId, 'with-details'] as const,
  me: () => ['users', 'me'] as const,
  meWithDetails: () => ['users', 'me', 'with-details'] as const,
};

export const userDetailsKeys = {
  root: () => ['details'] as const,
  me: () => ['details', 'me'] as const,
};
