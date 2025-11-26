import {
  createMealFood,
  deleteMealFood,
  getMealFoodById,
  getMealFoods,
  updateMealFood,
} from '@/api/endpoints/mealFoods';
import { parseApiError } from '@/api/errors';
import type {
  MealFoodCreateRequest,
  MealFoodFilter,
  MealFoodUpdateRequest,
  MealFoodView,
} from '@/api/types/mealFoods';
import { showError, showSuccess } from '@/lib/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mealFoodKeys, mealKeys, trackerKeys } from '../queryKeys';

export function useMealFoods(mealId: number, filter?: MealFoodFilter) {
  return useQuery<MealFoodView[], Error>({
    queryKey: mealFoodKeys.list(mealId, filter),
    queryFn: () => getMealFoods(mealId, filter),
    enabled: mealId > 0,
  });
}

export function useMealFood(mealId: number, foodId: number, enabled = true) {
  return useQuery<MealFoodView, Error>({
    queryKey: mealFoodKeys.byId(mealId, foodId),
    queryFn: () => getMealFoodById(mealId, foodId),
    enabled: enabled && mealId > 0 && foodId > 0,
  });
}

function invalidateMealLists(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({
    predicate: (q) =>
      Array.isArray(q.queryKey) && q.queryKey[0] === 'meals' && q.queryKey[1] === 'list',
  });
}

function invalidateTrackerLists(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: trackerKeys.all });
}

export function useCreateMealFood(mealId: number) {
  const qc = useQueryClient();

  return useMutation<MealFoodView, Error, MealFoodCreateRequest>({
    mutationFn: (dto) => createMealFood(mealId, dto),
    onSuccess() {
      qc.invalidateQueries({ queryKey: mealFoodKeys.list(mealId) });
      qc.invalidateQueries({ queryKey: mealKeys.byId(mealId) });
      invalidateMealLists(qc);
      invalidateTrackerLists(qc);

      showSuccess('Food added');
    },
    onError(error) {
      const apiError = parseApiError(error);

      if (apiError?.status === 409) {
        showError('This food is already in this meal.');
        return;
      }

      showError(apiError?.message ?? 'Could not add food');
    },
  });
}

export function useUpdateMealFood(mealId: number) {
  const qc = useQueryClient();

  return useMutation<MealFoodView, Error, { foodId: number; dto: MealFoodUpdateRequest }>({
    mutationFn: ({ foodId, dto }) => updateMealFood(mealId, foodId, dto),
    onSuccess(_, vars) {
      qc.invalidateQueries({ queryKey: mealFoodKeys.list(mealId) });
      qc.invalidateQueries({ queryKey: mealFoodKeys.byId(mealId, vars.foodId) });
      qc.invalidateQueries({ queryKey: mealKeys.byId(mealId) });

      invalidateMealLists(qc);
      invalidateTrackerLists(qc);

      showSuccess('Food updated');
    },
    onError(error) {
      const apiError = parseApiError(error);
      showError(apiError?.message ?? 'Could not update food');
    },
  });
}

export function useDeleteMealFood(mealId: number) {
  const qc = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (foodId) => deleteMealFood(mealId, foodId),
    onSuccess() {
      qc.invalidateQueries({ queryKey: mealFoodKeys.list(mealId) });
      qc.invalidateQueries({ queryKey: mealKeys.byId(mealId) });

      invalidateMealLists(qc);
      invalidateTrackerLists(qc);

      showSuccess('Food deleted');
    },
    onError(error) {
      const apiError = parseApiError(error);
      showError(apiError?.message ?? 'Could not delete food');
    },
  });
}
