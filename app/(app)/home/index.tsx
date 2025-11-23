import { useMeals } from '@/api/hooks/useMeals';
import type { MealFilter } from '@/api/types/meals';
import DateHeader from '@/components/DateHeader';
import MealSection from '@/components/home/MealSection';
import { useBreakpoints, useResponsiveStyles, useResponsiveValue } from '@/theme/responsive';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ms, s, vs } from 'react-native-size-matters';

function formatYMD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function Home() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const insets = useSafeAreaInsets();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const headlineVariant = useResponsiveValue({
    base: 'headlineSmall',
    lg: 'headlineMedium',
    xl: 'headlineLarge',
  }) as 'headlineSmall' | 'headlineMedium' | 'headlineLarge';

  const twoCols = bp.isLG || bp.isXL;

  // ---- DATE STATE (kept here) ----
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const selectedYmd = useMemo(() => formatYMD(selectedDate), [selectedDate]);

  // today at day-granularity
  const todayYmd = useMemo(() => formatYMD(new Date()), []);
  const isFutureDate = selectedYmd > todayYmd; // YYYY-MM-DD is safe for lexicographic compare

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

  // TS-safe bottom padding
  const baseBottomPad =
    (styles.scrollContent as any)?.paddingBottom &&
    typeof (styles.scrollContent as any).paddingBottom === 'number'
      ? (styles.scrollContent as any).paddingBottom
      : 0;

  return (
    <Surface mode="flat" elevation={0} style={styles.page}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: baseBottomPad + insets.bottom },
        ]}
      >
        {/* ✅ DATE HEADER COMPONENT */}
        <DateHeader
          date={selectedDate}
          onChange={setSelectedDate}
          headlineVariant={headlineVariant}
        />

        {loadingMeals && <Text style={styles.statusText}>Loading meals…</Text>}
        {!!mealsError && (
          <Text style={styles.errorText}>{mealsError.message ?? 'Failed to load meals'}</Text>
        )}

        {!loadingMeals && !mealsError && meals.length === 0 && (
          <Surface style={styles.emptyCard} elevation={1}>
            <Text style={styles.statusText}>No meals yet for this day.</Text>

            {/* ✅ Only show if allowed */}
            {canAddMeals && (
              <Button
                mode="contained"
                icon="plus"
                onPress={handleAddMeal}
                style={styles.addMealBtn}
              >
                Add your first meal
              </Button>
            )}
          </Surface>
        )}

        {meals.map((meal) => (
          <MealSection key={meal.id} meal={meal} twoCols={twoCols} loading={loadingMeals} />
        ))}

        {/* ✅ Only show bottom Add button if allowed */}
        {meals.length > 0 && canAddMeals && (
          <Button mode="outlined" icon="plus" onPress={handleAddMeal} style={styles.addMealBtn}>
            Add meal
          </Button>
        )}
      </ScrollView>
    </Surface>
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

  return StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.background },

    scrollContent: {
      paddingHorizontal: padX,
      paddingTop: padY,
      paddingBottom: padY,
      alignItems: 'stretch',
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
