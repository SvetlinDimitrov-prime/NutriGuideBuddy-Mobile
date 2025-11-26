import { getOpenFoodFactsFoodById } from '@/api/endpoints/openFoodFacts';
import { parseApiError } from '@/api/errors';
import { useOpenFoodFactsSearch } from '@/api/hooks/openFoodFacts';
import { useCreateMealFood } from '@/api/hooks/useMealFoods';
import type { OpenFoodFactsFoodShortView } from '@/api/types/openFoodFacts';
import SearchHeader from '@/components/meal/food/search/SearchHeader';
import SearchResultsList from '@/components/meal/food/search/SearchResultsList';
import PageShell from '@/components/PageShell';
import { showError } from '@/lib/toast';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

type RouteParams = {
  mealId?: string;
};

export default function OpenFoodFactsSearchScreen() {
  const { mealId } = useLocalSearchParams<RouteParams>();
  const numericMealId = useMemo(() => Number(mealId ?? 0), [mealId]);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const createMealFoodMutation = useCreateMealFood(numericMealId);

  // debounce search text
  useEffect(() => {
    const h = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(h);
  }, [query]);

  const hasSearch = debouncedQuery.trim().length > 0;

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useOpenFoodFactsSearch(debouncedQuery, 20, hasSearch);

  const items: OpenFoodFactsFoodShortView[] = useMemo(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data],
  );

  const handleClose = useCallback(() => {
    if (createMealFoodMutation.isPending) return;
    router.back();
  }, [createMealFoodMutation.isPending]);

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelect = useCallback(
    async (offId: string) => {
      if (!numericMealId || createMealFoodMutation.isPending) return;

      try {
        setSelectedId(offId);

        const dto = await getOpenFoodFactsFoodById(offId);

        createMealFoodMutation.mutate(dto, {
          onSuccess: () => {
            setSelectedId(null);
            router.back();
          },
          onError: () => {
            setSelectedId(null);
          },
        });
      } catch (err) {
        setSelectedId(null);
        const apiError = parseApiError(err as Error);
        showError(apiError?.message ?? 'Could not add food');
      }
    },
    [numericMealId, createMealFoodMutation],
  );

  const showEmpty = hasSearch && !isLoading && !isFetching && !isError && items.length === 0;

  return (
    <PageShell scrollable={false}>
      <SearchHeader query={query} onQueryChange={setQuery} onBack={handleClose} />

      <SearchResultsList
        items={items}
        addingId={selectedId}
        isInitialLoading={isLoading && !data}
        isError={isError}
        errorMessage={error?.message}
        showEmpty={showEmpty}
        isFetchingNextPage={isFetchingNextPage}
        onEndReached={handleEndReached}
        onSelect={handleSelect}
      />
    </PageShell>
  );
}
