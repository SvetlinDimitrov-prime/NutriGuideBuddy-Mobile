import type { UserFilter } from '@/api/types/user';
import { MealFoodFilter } from './types/mealFoods';
import { MealFilter } from './types/meals';
import { FoodComponentRequest, TrackerRequest } from './types/tracker';

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

export const mealKeys = {
  all: ['meals'] as const,
  list: (filter?: MealFilter) => ['meals', 'list', filter ?? {}] as const,
  byId: (id: number) => ['meals', 'byId', id] as const,
};

export const mealFoodKeys = {
  all: ['mealFoods'] as const,

  list(mealId: number, filter?: MealFoodFilter) {
    return [...this.all, 'list', mealId, filter ?? {}] as const;
  },

  byId(mealId: number, foodId: number) {
    return [...this.all, 'byId', mealId, foodId] as const;
  },
};

export const trackerKeys = {
  all: ['tracker'] as const,

  byUser(userId: number, dto?: TrackerRequest) {
    return [...this.all, 'byUser', userId, dto ?? {}] as const;
  },

  foodComponentRange(userId: number, req: FoodComponentRequest) {
    return [...this.all, 'foodComponentRange', userId, req] as const;
  },
};
