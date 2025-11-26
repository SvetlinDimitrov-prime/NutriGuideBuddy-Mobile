import { getOpenFoodFactsFoodById, searchOpenFoodFactsFoods } from '@/api/endpoints/openFoodFacts';
import type {
  OpenFoodFactsFoodDetails,
  OpenFoodFactsFoodShortView,
  PageResponse,
} from '@/api/types/openFoodFacts';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { openFoodFactsKeys } from '../queryKeys';

const createEmptyPage = (page = 0, size = 20): PageResponse<OpenFoodFactsFoodShortView> => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  size,
  number: page,
});

export function useOpenFoodFactsSearch(name: string, size = 20, enabled = true) {
  const trimmed = name.trim();

  return useInfiniteQuery<PageResponse<OpenFoodFactsFoodShortView>, Error>({
    queryKey: openFoodFactsKeys.search(trimmed, size),

    queryFn: ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 0;

      if (!trimmed) {
        return Promise.resolve(createEmptyPage(page, size));
      }

      return searchOpenFoodFactsFoods({ name: trimmed, page, size });
    },

    initialPageParam: 0,

    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.number + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },

    enabled: enabled && !!trimmed,
  });
}

export function useOpenFoodFactsFood(id: string | null | undefined, enabled = true) {
  return useQuery<OpenFoodFactsFoodDetails, Error>({
    queryKey: id ? openFoodFactsKeys.byId(id) : openFoodFactsKeys.byId(''),
    queryFn: () => getOpenFoodFactsFoodById(id as string),
    enabled: enabled && !!id,
  });
}
