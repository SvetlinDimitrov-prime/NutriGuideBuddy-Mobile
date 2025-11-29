import { apiClient } from '@/api/http/client';
import type { FoodComponentRdiMap } from '@/api/types/foodRdi';
import type { FoodComponentCatalogEntry } from '@/api/types/foodComponentCatalog';

export async function getFoodComponentsRdi() {
  const { data } = await apiClient.get<FoodComponentRdiMap>('/food-components/rdi');
  return data;
}

export async function getFoodComponentsCatalog() {
  const { data } = await apiClient.get<FoodComponentCatalogEntry[]>('/food-components/catalog');
  return data;
}
