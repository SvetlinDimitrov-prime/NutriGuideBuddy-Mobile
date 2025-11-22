import { apiClient } from '@/api/http/client';
import type { MealCreateRequest, MealFilter, MealUpdateRequest, MealView } from '@/api/types/meals';

export async function getMeals(filter?: MealFilter): Promise<MealView[]> {
  const { data } = await apiClient.post<MealView[]>('meals/get-all', filter ?? {});
  return data;
}

export async function createMeal(payload: MealCreateRequest): Promise<MealView> {
  const { data } = await apiClient.post<MealView>('meals', payload);
  return data;
}

export async function getMealById(mealId: number): Promise<MealView> {
  const { data } = await apiClient.get<MealView>(`meals/${mealId}`);
  return data;
}

export async function updateMeal(mealId: number, payload: MealUpdateRequest): Promise<MealView> {
  const { data } = await apiClient.patch<MealView>(`meals/${mealId}`, payload);
  return data;
}

export async function deleteMeal(mealId: number): Promise<void> {
  await apiClient.delete(`meals/${mealId}`);
}
