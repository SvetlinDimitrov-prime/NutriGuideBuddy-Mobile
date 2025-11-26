import type { MealFoodCreateRequest } from '@/api/types/mealFoods';

export type OpenFoodFactsFoodShortView = {
  id: string;
  name: string;
  brand: string;
  picture: string | null;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type OpenFoodFactsSearchParams = {
  name: string;
  page?: number;
  size?: number;
};

export type OpenFoodFactsFoodDetails = MealFoodCreateRequest;
