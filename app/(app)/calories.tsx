import { useTracker } from '@/api/hooks/useTracker';
import { useCurrentUser } from '@/api/hooks/useUsers';
import { DailyCaloriesSummary } from '@/components/statistics/DailyCaloriesSummary';
import { MealFoodsCaloriesBar } from '@/components/statistics/MealFoodsCaloriesBar';
import { MealsCaloriesBar } from '@/components/statistics/MealsCaloriesBar';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s, vs } from 'react-native-size-matters';

export default function CaloriesScreen() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const insets = useSafeAreaInsets();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const { data: me, isLoading: meLoading, isError: meError, error: meErr } = useCurrentUser();
  const userId = me?.id;

  const {
    data,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErr,
  } = useTracker(userId ?? 0, undefined, !!userId);

  const meals = data?.consumed ?? [];
  const calorieGoal = data?.calorieGoal ?? 0;

  const totalConsumed = useMemo(() => meals.reduce((acc, m) => acc + (m.amount ?? 0), 0), [meals]);

  const isLoading = meLoading || statsLoading;
  const isError = meError || statsError;
  const errorMessage = meErr?.message ?? statsErr?.message ?? 'Unknown error';

  // ✅ fixed concrete bottom padding
  const bottomPad = vs(40) + insets.bottom;

  return (
    <Surface mode="flat" elevation={0} style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={Platform.OS !== 'web'}
      >
        {isLoading && <Text style={styles.statusText}>Loading stats…</Text>}
        {isError && <Text style={styles.errorText}>Couldn’t load stats: {errorMessage}</Text>}

        {!!data && (
          <>
            <DailyCaloriesSummary goal={calorieGoal} consumed={totalConsumed} />
            <MealsCaloriesBar meals={meals} />
            <MealFoodsCaloriesBar meals={meals} />
          </>
        )}
      </ScrollView>
    </Surface>
  );
}

function makeStyles(theme: any, bp: any) {
  const isWeb = Platform.OS === 'web';

  // ✅ full width on web, keep padding on mobile/tablet
  const padX = isWeb ? 0 : bp.isXL ? s(28) : bp.isLG ? s(24) : s(16);
  const padY = bp.isXL ? vs(24) : bp.isLG ? vs(20) : vs(16);

  type Styles = {
    page: ViewStyle;
    scroll: ViewStyle;
    scrollContent: ViewStyle;
    statusText: TextStyle;
    errorText: TextStyle;
  };

  return StyleSheet.create<Styles>({
    page: {
      flex: 1,
      backgroundColor: theme.colors.background,
      width: '100%',
    },

    scroll: {
      flex: 1,
      width: '100%',
    },

    // ✅ removed paddingBottom from styles (we set it in component)
    scrollContent: {
      paddingTop: padY,
      paddingHorizontal: padX,
      gap: vs(16),
      width: '100%',
      alignItems: 'stretch',
    },

    statusText: {
      marginTop: vs(8),
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },

    errorText: {
      marginTop: vs(8),
      textAlign: 'center',
      color: theme.colors.error,
    },
  });
}
