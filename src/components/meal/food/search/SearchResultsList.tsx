import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { s, vs } from 'react-native-size-matters';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import type { OpenFoodFactsFoodShortView } from '@/api/types/openFoodFacts';
import SearchResultItem from './SearchResultItem';
import OpenFoodFactsAttribution from './OpenFoodFactsAttribution';

type Props = {
  items: OpenFoodFactsFoodShortView[];
  addingId: string | null;
  isInitialLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  showEmpty: boolean;
  isFetchingNextPage: boolean;
  onEndReached: () => void;
  onSelect: (id: string) => void;
};

export default function SearchResultsList({
  items,
  addingId,
  isInitialLoading,
  isError,
  errorMessage,
  showEmpty,
  isFetchingNextPage,
  onEndReached,
  onSelect,
}: Props) {
  const theme = useTheme() as MD3Theme;
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  return (
    <View style={styles.root}>
      {isInitialLoading && items.length === 0 && (
        <View style={styles.centerStatus}>
          <ActivityIndicator size="small" />
          <Text style={styles.statusText}>Searching…</Text>
        </View>
      )}

      {isError && (
        <View style={styles.centerStatus}>
          <Text style={styles.errorText}>{errorMessage ?? 'Failed to load foods'}</Text>
        </View>
      )}

      {showEmpty && (
        <View style={styles.centerStatus}>
          <Text style={styles.statusText}>No foods found.</Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SearchResultItem
            item={item}
            isAdding={addingId === item.id}
            onPress={() => onSelect(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          <View style={styles.footerWrap}>
            {isFetchingNextPage && (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" />
              </View>
            )}

            {/* 🔹 Open Food Facts attribution (license requirement) */}
            <OpenFoodFactsAttribution style={styles.attribution} />
          </View>
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

function makeStyles(
  theme: MD3Theme,
  _bp: { isXL: boolean; isLG: boolean; isMD: boolean; isSM: boolean },
) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },

    listContent: {
      paddingTop: vs(4),
      paddingBottom: vs(8),
      gap: vs(8),
    },

    separator: {
      height: vs(6),
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

    footerWrap: {
      paddingTop: vs(8),
    },

    footerLoading: {
      paddingVertical: vs(8),
      alignItems: 'center',
      justifyContent: 'center',
    },

    attribution: {
      paddingHorizontal: 0,
    },
  });
}
