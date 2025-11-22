import { apiClient } from '@/api/http/client';
import type { TrackerRequest, TrackerView, FoodComponentRequest } from '@/api/types/tracker';
import type { MealFoodComponentConsumedView } from '@/api/types/tracker';

const base = (userId: number) => `/tracker/user/${userId}`;

export async function getTracker(userId: number, dto?: TrackerRequest) {
  const { data } = await apiClient.post<TrackerView>(base(userId), dto ?? {});
  return data;
}

export async function getFoodComponentAmountInRange(userId: number, req: FoodComponentRequest) {
  const { data } = await apiClient.post<Record<string, MealFoodComponentConsumedView[]>>(
    `${base(userId)}/food-name`,
    req,
  );

  return data;
}
