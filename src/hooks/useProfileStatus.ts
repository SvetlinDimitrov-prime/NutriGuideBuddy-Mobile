import { useUserDetails } from '@/api/hooks/useUserDetails';
import type { UserDetailsResponse } from '@/api/types/userDetails';

export type ProfileStatus = 'unknown' | 'loading' | 'complete' | 'incomplete';

function isProfileComplete(details?: UserDetailsResponse | null): boolean {
  if (!details) return false;

  const { kilograms, height, age, workoutState, gender, goal } = details;

  return (
    kilograms != null &&
    height != null &&
    age != null &&
    workoutState != null &&
    gender != null &&
    goal != null
  );
}

export function useProfileStatus(enabled: boolean): ProfileStatus {
  const { data, isLoading, isError } = useUserDetails(enabled);

  if (!enabled) return 'unknown';
  if (isLoading) return 'loading';
  if (isError || !data) return 'incomplete';

  return isProfileComplete(data) ? 'complete' : 'incomplete';
}
