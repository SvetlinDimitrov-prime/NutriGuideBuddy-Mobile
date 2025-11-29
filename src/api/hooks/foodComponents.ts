import { useQuery } from '@tanstack/react-query';
import { getFoodComponentsRdi, getFoodComponentsCatalog } from '@/api/endpoints/foodComponents';
import type { FoodComponentRdiMap } from '@/api/types/foodRdi';
import type { FoodComponentCatalogEntry } from '@/api/types/foodComponentCatalog';

const foodComponentsKeys = {
  rdi: ['food-components', 'rdi'] as const,
  catalog: ['food-components', 'catalog'] as const,
};

export function useFoodComponentsRdi(enabled = true) {
  return useQuery<FoodComponentRdiMap, Error>({
    queryKey: foodComponentsKeys.rdi,
    queryFn: getFoodComponentsRdi,
    enabled,
  });
}

export function useFoodComponentsCatalog(enabled = true) {
  return useQuery<FoodComponentCatalogEntry[], Error>({
    queryKey: foodComponentsKeys.catalog,
    queryFn: getFoodComponentsCatalog,
    enabled,
  });
}
