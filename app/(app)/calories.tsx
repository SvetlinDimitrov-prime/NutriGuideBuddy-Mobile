import { useTracker } from '@/api/hooks/useTracker';
import { useCurrentUser } from '@/api/hooks/useUsers';
import IntakeMeter from '@/components/statistics/IntakeMeter';
import { MealFoodsCaloriesBar } from '@/components/statistics/MealFoodsCaloriesBar';
import { MealsCaloriesBar } from '@/components/statistics/MealsCaloriesBar';
import PageShell from '@/components/PageShell';
import DateHeader from '@/components/statistics/DateHeader';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { useMemo, useState } from 'react';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { vs } from 'react-native-size-matters';
import type { FoodComponentIntakeView } from '@/api/types/tracker';

function formatYMD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function CaloriesScreen() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const { data: me, isLoading: meLoading, isError: meError, error: meErr } = useCurrentUser();
  const userId = me?.id ?? 0;

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const selectedYmd = useMemo(() => formatYMD(selectedDate), [selectedDate]);
  const trackerDto = useMemo(() => ({ date: selectedYmd }), [selectedYmd]);

  const {
    data,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErr,
  } = useTracker(userId, trackerDto, !!userId);

  const meals = data?.consumed ?? [];
  const calorieGoal = data?.calorieGoal ?? 0;

  const totalConsumed = useMemo(() => meals.reduce((acc, m) => acc + (m.amount ?? 0), 0), [meals]);

  const caloriesComponent: FoodComponentIntakeView | null = useMemo(() => {
    if (!data) return null;

    return {
      name: 'ENERGY',
      group: 'OTHER',
      unit: 'KCAL',
      recommended: calorieGoal > 0 ? calorieGoal : null,
      maxRecommended: null,
      consumed: [
        {
          mealId: 0,
          mealName: 'Total',
          foodId: 0,
          foodName: 'Total',
          amount: totalConsumed,
        },
      ],
    };
  }, [data, calorieGoal, totalConsumed]);

  const isLoading = meLoading || statsLoading;
  const isError = meError || statsError;
  const errorMessage = meErr?.message ?? statsErr?.message ?? 'Unknown error';

  return (
    <PageShell bottomExtra={vs(40)} contentStyle={styles.content}>
      <View style={styles.headerWrap}>
        <DateHeader date={selectedDate} onChange={setSelectedDate} />
      </View>

      {isLoading && <Text style={styles.statusText}>Loading stats…</Text>}
      {isError && <Text style={styles.errorText}>Couldn’t load stats: {errorMessage}</Text>}

      {!!data && (
        <>
          {caloriesComponent && <IntakeMeter component={caloriesComponent} />}
          <MealsCaloriesBar meals={meals} />
          <MealFoodsCaloriesBar meals={meals} />
        </>
      )}
    </PageShell>
  );
}

function makeStyles(theme: any, _bp: any) {
  type Styles = {
    content: ViewStyle;
    headerWrap: ViewStyle;
    statusText: TextStyle;
    errorText: TextStyle;
  };

  return StyleSheet.create<Styles>({
    content: {
      width: '100%',
      alignItems: 'stretch',
      gap: vs(16),
    },

    headerWrap: {
      width: '100%',
      marginBottom: vs(4),
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
