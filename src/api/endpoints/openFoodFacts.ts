import { apiClient } from '@/api/http/client';
import type {
  OpenFoodFactsFoodShortView,
  OpenFoodFactsSearchParams,
  OpenFoodFactsFoodDetails,
  PageResponse,
} from '@/api/types/openFoodFacts';

const base = '/food_db_api';

export async function searchOpenFoodFactsFoods(params: OpenFoodFactsSearchParams) {
  const { name, page = 0, size = 20 } = params;

  const { data } = await apiClient.get<PageResponse<OpenFoodFactsFoodShortView>>(base, {
    params: { name, page, size },
  });

  return data;
}

export async function getOpenFoodFactsFoodById(id: string) {
  const { data } = await apiClient.get<OpenFoodFactsFoodDetails>(`${base}/${id}`);
  return data;
}
