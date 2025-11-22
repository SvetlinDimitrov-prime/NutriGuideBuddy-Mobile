import { createMeal, deleteMeal, getMealById, getMeals, updateMeal } from '@/api/endpoints/meals';
import { parseApiError } from '@/api/errors';
import type { MealCreateRequest, MealFilter, MealUpdateRequest, MealView } from '@/api/types/meals';
import { showError, showSuccess } from '@/lib/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mealKeys } from '../queryKeys';

export function useMeals(filter?: MealFilter) {
  return useQuery<MealView[], Error>({
    queryKey: mealKeys.list(filter),
    queryFn: () => getMeals(filter),
    select: (data) =>
      [...(data ?? [])].sort((a, b) => (b.totalCalories ?? 0) - (a.totalCalories ?? 0)),
  });
}

export function useMeal(mealId: number, enabled = true) {
  return useQuery<MealView, Error>({
    queryKey: mealKeys.byId(mealId),
    queryFn: () => getMealById(mealId),
    enabled: enabled && mealId > 0,
  });
}

export function useCreateMeal() {
  const qc = useQueryClient();

  return useMutation<MealView, Error, MealCreateRequest>({
    mutationFn: createMeal,
    onSuccess() {
      qc.invalidateQueries({ queryKey: mealKeys.all });
      showSuccess('Meal created');
    },
    onError(error) {
      const apiError = parseApiError(error);
      showError(apiError?.message ?? 'Could not create meal');
    },
  });
}

export function useUpdateMeal() {
  const qc = useQueryClient();

  return useMutation<MealView, Error, { mealId: number; dto: MealUpdateRequest }>({
    mutationFn: ({ mealId, dto }) => updateMeal(mealId, dto),
    onSuccess(_, vars) {
      qc.invalidateQueries({ queryKey: mealKeys.all });
      qc.invalidateQueries({ queryKey: mealKeys.byId(vars.mealId) });
      showSuccess('Meal updated');
    },
    onError(error) {
      const apiError = parseApiError(error);
      showError(apiError?.message ?? 'Could not update meal');
    },
  });
}

export function useDeleteMeal() {
  const qc = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteMeal,
    onSuccess() {
      qc.invalidateQueries({ queryKey: mealKeys.all });
      showSuccess('Meal deleted');
    },
    onError(error) {
      const apiError = parseApiError(error);
      showError(apiError?.message ?? 'Could not delete meal');
    },
  });
}
