import { useQuery } from '@tanstack/react-query';
import { trackerKeys } from '../queryKeys';
import { getTracker, getFoodComponentAmountInRange } from '@/api/endpoints/tracker';

import type {
  TrackerRequest,
  TrackerView,
  FoodComponentRequest,
  MealFoodComponentConsumedView,
} from '@/api/types/tracker';

export function useTracker(userId: number, dto?: TrackerRequest, enabled = true) {
  return useQuery<TrackerView, Error>({
    queryKey: trackerKeys.byUser(userId, dto),
    queryFn: () => getTracker(userId, dto),
    enabled: enabled && userId > 0,
  });
}

export function useFoodComponentAmountInRange(
  userId: number,
  req: FoodComponentRequest,
  enabled = true,
) {
  return useQuery<Record<string, MealFoodComponentConsumedView[]>, Error>({
    queryKey: trackerKeys.foodComponentRange(userId, req),
    queryFn: () => getFoodComponentAmountInRange(userId, req),
    enabled: enabled && userId > 0 && !!req?.name,
  });
}
