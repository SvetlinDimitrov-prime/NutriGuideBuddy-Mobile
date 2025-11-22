import { useMeals } from '@/api/hooks/useMeals'; // <-- wherever your hook lives
import type { MealFilter } from '@/api/types/meals';
import MealSection from '@/components/home/MealSection';
import { useBreakpoints, useResponsiveStyles, useResponsiveValue } from '@/theme/responsive';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
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

function prettyDate(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default function Home() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const insets = useSafeAreaInsets();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const handleAddMeal = () => {
    router.push({
      pathname: '/home/meal/new',
      params: { createdAt: todayYmd },
    });
  };

  const headlineVariant = useResponsiveValue({
    base: 'headlineSmall',
    lg: 'headlineMedium',
    xl: 'headlineLarge',
  }) as 'headlineSmall' | 'headlineMedium' | 'headlineLarge';

  const twoCols = bp.isLG || bp.isXL;

  const today = useMemo(() => new Date(), []);
  const todayYmd = useMemo(() => formatYMD(today), [today]);
  const todayPretty = useMemo(() => prettyDate(today), [today]);

  const filter = useMemo<MealFilter>(() => ({ createdAt: todayYmd }), [todayYmd]);
  const { data: meals = [], isLoading: loadingMeals, error: mealsError } = useMeals(filter);

  return (
    <Surface mode="flat" elevation={0} style={styles.page}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: styles.scrollContent.paddingBottom + insets.bottom },
        ]}
      >
        {/* DATE HEADER */}
        <View style={styles.header}>
          <Text
            variant={headlineVariant}
            style={styles.title}
            accessibilityRole="header"
            {...(Platform.OS === 'web' ? { accessibilityLevel: 1 as any } : {})}
          >
            {todayPretty}
          </Text>
          <Text style={styles.subtitle}>Your meals for today</Text>
        </View>

        {loadingMeals && <Text style={styles.statusText}>Loading meals…</Text>}
        {!!mealsError && (
          <Text style={styles.errorText}>{mealsError.message ?? 'Failed to load meals'}</Text>
        )}

        {!loadingMeals && !mealsError && meals.length === 0 && (
          <Surface style={styles.emptyCard} elevation={1}>
            <Text style={styles.statusText}>No meals yet for today.</Text>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => console.log('add meal')}
              style={styles.addMealBtn}
            >
              Add your first meal
            </Button>
          </Surface>
        )}

        {/* MEALS */}
        {meals.map((meal) => (
          <MealSection key={meal.id} meal={meal} twoCols={twoCols} loading={loadingMeals} />
        ))}

        {/* ADD MEAL AT THE END */}
        {meals.length > 0 && (
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

    header: {
      alignItems: 'center',
      alignSelf: 'center',
      width: '100%',
      maxWidth,
      marginBottom: vs(8),
    },
    title: { textAlign: 'center', marginTop: vs(4) },
    subtitle: {
      marginTop: vs(6),
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.9,
      fontSize: ms(15, 0.2),
    },

    statusText: {
      marginTop: vs(8),
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
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
