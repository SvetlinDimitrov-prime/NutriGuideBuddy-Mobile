// src/app/home/index.tsx (or wherever this file lives)
import { useMeals } from '@/api/hooks/useMeals';
import type { MealFilter } from '@/api/types/meals';
import DateHeader from '@/components/statistics/DateHeader';
import MealSection from '@/components/home/MealSection';
import PageShell from '@/components/PageShell';
import { useBreakpoints, useResponsiveStyles, useResponsiveValue } from '@/theme/responsive';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import type { MD3Theme } from 'react-native-paper';
import { Button, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';

function formatYMD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function Home() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const headlineVariant = useResponsiveValue({
    base: 'headlineSmall',
    lg: 'headlineMedium',
    xl: 'headlineLarge',
  }) as 'headlineSmall' | 'headlineMedium' | 'headlineLarge';

  const twoCols = bp.isLG || bp.isXL;

  // ---- DATE STATE ----
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const selectedYmd = useMemo(() => formatYMD(selectedDate), [selectedDate]);

  // today at day-granularity
  const todayYmd = useMemo(() => formatYMD(new Date()), []);
  const isFutureDate = selectedYmd > todayYmd; // YYYY-MM-DD safe for lexicographic compare

  const filter = useMemo<MealFilter>(() => ({ createdAt: selectedYmd }), [selectedYmd]);
  const { data: meals = [], isLoading: loadingMeals, error: mealsError } = useMeals(filter);

  // limit rules
  const mealsLimitReached = meals.length >= 10;
  const canAddMeals = !isFutureDate && !mealsLimitReached;

  const handleAddMeal = useCallback(() => {
    if (!canAddMeals) return;
    router.push({
      pathname: '/home/meal/new',
      params: { createdAt: selectedYmd },
    });
  }, [selectedYmd, canAddMeals]);

  return (
    <PageShell bottomExtra={vs(40)} contentStyle={styles.content}>
      <View style={styles.headerWrap}>
        <DateHeader
          date={selectedDate}
          onChange={setSelectedDate}
          headlineVariant={headlineVariant}
        />
      </View>

      {loadingMeals && <Text style={styles.statusText}>Loading meals…</Text>}

      {!!mealsError && (
        <Text style={styles.errorText}>{mealsError.message ?? 'Failed to load meals'}</Text>
      )}

      {!loadingMeals && !mealsError && meals.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.statusText}>No meals yet for this day.</Text>

          {canAddMeals && (
            <Button mode="contained" icon="plus" onPress={handleAddMeal} style={styles.addMealBtn}>
              Add your first meal
            </Button>
          )}
        </View>
      )}

      {meals.map((meal) => (
        <MealSection key={meal.id} meal={meal} twoCols={twoCols} loading={loadingMeals} />
      ))}

      {meals.length > 0 && canAddMeals && (
        <Button mode="outlined" icon="plus" onPress={handleAddMeal} style={styles.addMealBtn}>
          Add meal
        </Button>
      )}
    </PageShell>
  );
}

function makeStyles(
  theme: MD3Theme,
  bp: { isXL: boolean; isLG: boolean; isMD: boolean; isSM: boolean },
) {
  const padX = bp.isXL ? s(32) : bp.isLG ? s(28) : bp.isMD ? s(20) : s(16);
  const padY = bp.isXL ? vs(28) : bp.isLG ? vs(24) : bp.isMD ? vs(20) : vs(16);
  const outline = theme.colors.outlineVariant;

  const maxWidth = bp.isXL ? s(1024) : bp.isLG ? s(864) : bp.isMD ? s(720) : '100%';

  type Styles = {
    content: ViewStyle;
    headerWrap: ViewStyle;
    statusText: TextStyle;
    errorText: TextStyle;
    emptyCard: ViewStyle;
    addMealBtn: ViewStyle;
  };

  return StyleSheet.create<Styles>({
    content: {
      width: '100%',
      alignItems: 'stretch',
      gap: vs(12),
    },

    headerWrap: {
      width: '100%',
      marginBottom: vs(4),
    },

    statusText: {
      marginTop: vs(8),
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      fontSize: ms(14, 0.2),
    },

    errorText: {
      color: theme.colors.error,
      marginTop: vs(8),
      textAlign: 'center',
    },

    emptyCard: {
      marginTop: vs(10),
      backgroundColor: theme.colors.surface,
      borderRadius: s(12),
      paddingHorizontal: padX,
      paddingVertical: padY,
      alignSelf: 'center',
      width: '100%',
      maxWidth,
      gap: vs(8),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: outline,
    },

    addMealBtn: {
      marginTop: vs(12),
      borderRadius: s(10),
      alignSelf: 'center',
      width: '100%',
      maxWidth: s(420),
    },
  });
}
