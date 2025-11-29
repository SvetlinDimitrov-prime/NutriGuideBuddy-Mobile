import { useOpenFoodFactsSearch } from '@/api/hooks/openFoodFacts';
import type { OpenFoodFactsFoodShortView } from '@/api/types/openFoodFacts';
import PageShell from '@/components/PageShell';
import OpenFoodFactsAttribution from '@/components/meal/food/search/OpenFoodFactsAttribution';
import SearchResultItem from '@/components/meal/food/search/SearchResultItem';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  View,
  type ListRenderItem, // 👈 add this
} from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { ActivityIndicator, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

type RouteParams = {
  mealId?: string;
};

export default function OpenFoodFactsSearchScreen() {
  const { mealId } = useLocalSearchParams<RouteParams>();
  const numericMealId = useMemo(() => Number(mealId ?? 0), [mealId]);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const theme = useTheme() as MD3Theme;
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

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

  const isInitialLoading = isLoading && !data;

  const backIconSize = Platform.OS === 'web' ? s(18) : s(24);

  // ✅ Stable renderItem, not defined inline in JSX
  const renderItem = useCallback<ListRenderItem<OpenFoodFactsFoodShortView>>(
    ({ item }) => (
      <SearchResultItem item={item} isAdding={false} onPress={() => handleSelect(item.id)} />
    ),
    [handleSelect],
  );

  const keyExtractor = useCallback((item: OpenFoodFactsFoodShortView) => item.id, []);

  // ✅ Stable separator component
  const renderSeparator = useCallback(() => <View style={styles.separator} />, [styles.separator]);

  // ✅ Stable footer component (no inline component in prop)
  const renderFooter = useCallback(
    () => (
      <View style={styles.footerContainer}>
        {isFetchingNextPage && (
          <View style={styles.footerLoading}>
            <ActivityIndicator size="small" />
          </View>
        )}

        <View style={styles.attributionFooter}>
          <OpenFoodFactsAttribution style={styles.attribution} />
        </View>
      </View>
    ),
    [
      isFetchingNextPage,
      styles.footerContainer,
      styles.footerLoading,
      styles.attributionFooter,
      styles.attribution,
    ],
  );

  return (
    <PageShell scrollable={false}>
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.backChip}>
            <IconButton
              icon={Platform.OS === 'ios' ? 'chevron-left' : 'arrow-left'}
              size={backIconSize}
              onPress={handleClose}
              style={styles.backIcon}
            />
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>Add food</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            mode="outlined"
            placeholder="Search foods…"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            contentStyle={styles.searchContent}
            left={<TextInput.Icon icon="magnify" />}
            right={query ? <TextInput.Icon icon="close" onPress={() => setQuery('')} /> : null}
          />
        </View>
      </View>

      <View style={styles.resultsCard}>
        {isInitialLoading && items.length === 0 && (
          <View style={styles.centerStatus}>
            <ActivityIndicator size="small" />
            <Text style={styles.statusText}>Searching…</Text>
          </View>
        )}

        {isError && (
          <View style={styles.centerStatus}>
            <Text style={styles.errorText}>{error?.message ?? 'Failed to load foods'}</Text>
          </View>
        )}

        {showEmpty && (
          <View style={styles.centerStatus}>
            <Text style={styles.statusText}>No foods found.</Text>
          </View>
        )}

        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={<View style={styles.listHeaderSpacer} />}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={renderSeparator}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </PageShell>
  );
}

function makeStyles(theme: MD3Theme) {
  const isWeb = Platform.OS === 'web';

  return StyleSheet.create({
    headerCard: {
      backgroundColor: 'transparent',
      borderRadius: 0,
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      elevation: 0,
    },

    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
    },

    backChip: {
      width: isWeb ? s(34) : s(44),
      height: isWeb ? s(34) : s(44),
      borderRadius: isWeb ? s(17) : s(22),
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },

    backIcon: {
      margin: 0,
    },

    titleBlock: {
      flexShrink: 1,
    },

    label: {
      fontSize: ms(11, 0.2),
      color: theme.colors.onBackground,
      opacity: 0.7,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },

    title: {
      fontSize: ms(isWeb ? 20 : 22, 0.2),
      fontWeight: Platform.OS === 'ios' ? '700' : '800',
      color: theme.colors.onBackground,
      letterSpacing: 0.2,
    },

    subtitle: {
      marginTop: vs(2),
      fontSize: ms(12, 0.2),
      color: theme.colors.onBackground,
      opacity: 0.9,
    },

    searchRow: {
      marginBottom: vs(4),
    },

    searchInput: {
      backgroundColor: theme.colors.surface,
      borderRadius: s(10),
    },

    searchContent: {
      fontSize: ms(14, 0.2),
    },

    resultsCard: {
      flex: 1,
      marginTop: vs(8),

      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.outlineVariant,

      backgroundColor: 'transparent',
      borderRadius: 0,
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      elevation: 0,
    },

    listHeaderSpacer: {
      height: vs(10),
    },

    listContent: {
      paddingBottom: vs(8),
      gap: vs(8),
    },

    separator: {
      height: vs(8),
    },

    centerStatus: {
      paddingVertical: vs(24),
      alignItems: 'center',
      justifyContent: 'center',
    },

    statusText: {
      marginTop: vs(8),
      fontSize: s(13),
      color: theme.colors.onSurfaceVariant,
    },

    errorText: {
      color: theme.colors.error,
      textAlign: 'center',
    },

    footerContainer: {
      paddingTop: vs(8),
      paddingBottom: vs(8),
    },

    footerLoading: {
      paddingVertical: vs(10),
      alignItems: 'center',
      justifyContent: 'center',
    },

    attributionFooter: {
      marginTop: vs(8),
    },

    attribution: {
      paddingHorizontal: 0,
    },
  });
}
