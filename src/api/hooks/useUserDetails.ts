import { getMyUserDetails, updateMyUserDetails } from '@/api/endpoints/userDetails';
import { parseApiError } from '@/api/errors';
import { userDetailsKeys, userKeys } from '@/api/queryKeys';
import type { UserDetailsRequest, UserDetailsResponse } from '@/api/types/userDetails';
import { showError, showSuccess } from '@/lib/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useUserDetails(enabled = true) {
  return useQuery<UserDetailsResponse, Error>({
    queryKey: userDetailsKeys.me(),
    queryFn: getMyUserDetails,
    enabled,
  });
}

export function useUpdateUserDetails(onFieldErrors?: (errors: Record<string, string>) => void) {
  const queryClient = useQueryClient();

  return useMutation<UserDetailsResponse, Error, UserDetailsRequest>({
    mutationFn: updateMyUserDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userDetailsKeys.root() });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      showSuccess('Your details have been updated.');
    },
    onError(error) {
      const apiError = parseApiError(error);

      if (apiError?.errors && onFieldErrors) {
        onFieldErrors(apiError.errors);
      }

      showError(
        apiError?.message ?? 'We couldn’t update your details. Please check and try again.',
      );
    },
  });
}
