import { apiClient } from '@/api/http/client';
import type {
  MealFoodCreateRequest,
  MealFoodFilter,
  MealFoodUpdateRequest,
  MealFoodView,
} from '@/api/types/mealFoods';

const base = (mealId: number) => `/meals/${mealId}/foods`;

export async function getMealFoods(mealId: number, filter?: MealFoodFilter) {
  const { data } = await apiClient.post<MealFoodView[]>(`${base(mealId)}/get-all`, filter ?? {});
  return data;
}

export async function createMealFood(mealId: number, dto: MealFoodCreateRequest) {
  const { data } = await apiClient.post<MealFoodView>(base(mealId), dto);
  return data;
}

export async function getMealFoodById(mealId: number, foodId: number) {
  const { data } = await apiClient.get<MealFoodView>(`${base(mealId)}/${foodId}`);
  return data;
}

export async function updateMealFood(mealId: number, foodId: number, dto: MealFoodUpdateRequest) {
  const { data } = await apiClient.patch<MealFoodView>(`${base(mealId)}/${foodId}`, dto);
  return data;
}

export async function deleteMealFood(mealId: number, foodId: number) {
  const { data } = await apiClient.delete<void>(`${base(mealId)}/${foodId}`);
  return data;
}
