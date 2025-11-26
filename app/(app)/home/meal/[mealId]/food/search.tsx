import { useOpenFoodFactsSearch } from '@/api/hooks/openFoodFacts';
import type { OpenFoodFactsFoodShortView } from '@/api/types/openFoodFacts';
import SearchHeader from '@/components/meal/food/search/SearchHeader';
import SearchResultsList from '@/components/meal/food/search/SearchResultsList';
import PageShell from '@/components/PageShell';
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
    router.back();
  }, []);

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelect = useCallback(
    (offId: string) => {
      if (!numericMealId) return;

      router.push({
        pathname: '/home/meal/[mealId]/food/open-food',
        params: {
          mealId: String(numericMealId),
          offId,
        },
      });
    },
    [numericMealId],
  );

  const showEmpty = hasSearch && !isLoading && !isFetching && !isError && items.length === 0;

  return (
    <PageShell scrollable={false}>
      <SearchHeader query={query} onQueryChange={setQuery} onBack={handleClose} />

      <SearchResultsList
        items={items}
        addingId={null}
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
