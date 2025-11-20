import {
  createUser,
  deleteUser,
  getMe,
  getMeWithDetails,
  getUserById,
  getUserByIdWithDetails,
  getUsers,
  updateUser,
} from '@/api/endpoints/user';
import { parseApiError } from '@/api/errors';
import { userKeys } from '@/api/queryKeys';
import {
  UserCreateRequest,
  UserFilter,
  UserResponse,
  UserUpdateRequest,
  UserWithDetailsResponse,
} from '@/api/types/user';
import { showError, showSuccess } from '@/lib/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useUsers(filter?: UserFilter) {
  return useQuery<UserResponse[], Error>({
    queryKey: userKeys.list(filter),
    queryFn: () => getUsers(filter),
  });
}

export function useUserById(userId: number | undefined) {
  return useQuery<UserResponse, Error>({
    queryKey: userKeys.detail(userId as number),
    queryFn: () => getUserById(userId as number),
    enabled: !!userId,
  });
}

export function useUserByIdWithDetails(userId: number | undefined) {
  return useQuery<UserWithDetailsResponse, Error>({
    queryKey: userKeys.detailWithDetails(userId as number),
    queryFn: () => getUserByIdWithDetails(userId as number),
    enabled: !!userId,
  });
}

export function useCreateUser(onFieldErrors?: (errors: Record<string, string>) => void) {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, UserCreateRequest>({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.root() });
      showSuccess('User has been created successfully.');
    },
    onError(error) {
      const apiError = parseApiError(error);

      if (apiError?.errors && onFieldErrors) {
        onFieldErrors(apiError.errors);
      }

      showError(
        apiError?.message ?? 'We couldn’t create the user. Please check the details and try again.',
      );
    },
  });
}

export function useUpdateUser(
  userId: number,
  onFieldErrors?: (errors: Record<string, string>) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, UserUpdateRequest>({
    mutationFn: (payload) => updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.root() });
      showSuccess('Changes have been saved.');
    },
    onError(error) {
      const apiError = parseApiError(error);

      if (apiError?.errors && onFieldErrors) {
        onFieldErrors(apiError.errors);
      }

      showError(apiError?.message ?? 'We couldn’t save your changes. Please try again.');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.clear();
      showSuccess('User has been removed.');
    },
    onError(error) {
      const apiError = parseApiError(error);
      showError(apiError?.message ?? 'We couldn’t remove this user. Please try again.');
    },
  });
}

export function useCurrentUser() {
  return useQuery<UserResponse, Error>({
    queryKey: userKeys.me(),
    queryFn: getMe,
  });
}

export function useCurrentUserWithDetails() {
  return useQuery<UserWithDetailsResponse, Error>({
    queryKey: userKeys.me(),
    queryFn: getMeWithDetails,
  });
}
