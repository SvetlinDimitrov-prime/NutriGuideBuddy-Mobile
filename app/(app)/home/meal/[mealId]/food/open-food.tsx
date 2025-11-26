import { getOpenFoodFactsFoodById } from '@/api/endpoints/openFoodFacts';
import { parseApiError } from '@/api/errors';
import { useCreateMealFood } from '@/api/hooks/useMealFoods';
import type { MealFoodView } from '@/api/types/mealFoods';
import { AboutSection } from '@/components/meal/food/AboutSection';
import { FoodHeaderOffSection } from '@/components/meal/food/FoodHeaderOffSection';
import { NutritionAccordions } from '@/components/meal/food/NutritionAccordions';
import { ServingEditorCard } from '@/components/meal/food/ServingEditorCard';
import { ServingMacroCard } from '@/components/meal/food/ServingMacroCard';
import PageShell from '@/components/PageShell';
import { useFoodServingState } from '@/hooks/useFoodServingState';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Text, useTheme } from 'react-native-paper';
import { s, vs } from 'react-native-size-matters';

type OffFood = MealFoodView;

export default function OpenFoodFactsFoodScreen() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const { mealId, offId } = useLocalSearchParams<{ mealId: string; offId: string }>();
  const mId = Number(mealId);
  const offCode = String(offId ?? '');

  const createMealFood = useCreateMealFood(mId);

  const [food, setFood] = useState<OffFood | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!offCode) return;

    let cancelled = false;

    const run = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const dto = await getOpenFoodFactsFoodById(offCode);
        if (!cancelled) {
          setFood(dto as OffFood);
        }
      } catch (err) {
        if (!cancelled) {
          const apiErr = parseApiError(err as Error);
          setLoadError(apiErr?.message ?? 'Could not load food');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [offCode]);

  const {
    editOpen,
    setEditOpen,
    selectedServing,
    qtyText,
    onQtyChangeSafe,
    setSelectedServing,
    qtyNum,
    computed,
    scaleRatio,
    scaledCalories,
    macros,
    macroPercents,
    grouped,
    cancelEdit,
  } = useFoodServingState(food);

  const addBusy = createMealFood.isPending;

  const onAddFood = () => {
    if (!food || !selectedServing || qtyNum <= 0 || !mId || addBusy) return;

    const dto = {
      ...food,
      servingUnit: selectedServing.metric,
      servingAmount: qtyNum,
      servingTotalGrams: computed.grams,
      calorieAmount: scaledCalories,
      components: (food.components ?? []).map((c) => ({
        ...c,
        amount: (c.amount ?? 0) * scaleRatio,
      })),
    };

    createMealFood.mutate(dto as any, {
      onSuccess: () => router.replace('/(app)/home'),
    });
  };

  return (
    <>
      <PageShell bottomExtra={vs(40)} contentStyle={styles.content}>
        <View style={styles.body}>
          <FoodHeaderOffSection
            name={food?.name}
            disabled={!food || addBusy}
            onEditToggle={() => setEditOpen((v) => !v)}
            onAdd={onAddFood}
          />

          <ServingEditorCard
            visible={!!food && editOpen}
            servings={food?.servings ?? []}
            selected={selectedServing}
            qtyText={qtyText}
            onQtyChange={onQtyChangeSafe}
            onSelectServing={setSelectedServing}
            gramsPreview={computed.grams}
            kcalPreview={computed.kcal}
            kcalUnit={food?.calorieUnit ?? 'KCAL'}
            onCancel={cancelEdit}
            onSave={onAddFood}
            saving={addBusy}
            saveDisabled={!selectedServing || qtyNum <= 0}
          />

          {isLoading && <Text style={styles.statusText}>Loading food…</Text>}

          {loadError && !isLoading && <Text style={styles.errorText}>{loadError}</Text>}

          {!!food && !isLoading && !loadError && (
            <>
              <ServingMacroCard
                servingText={
                  editOpen
                    ? ''
                    : `🍽️ ${food.servingAmount} ${food.servingUnit} • ${food.servingTotalGrams} g`
                }
                kcalText={editOpen ? '' : `🔥 ${scaledCalories.toFixed(0)} kcal`}
                macros={macros}
                macroPercents={macroPercents}
              />

              <AboutSection info={food.info} largeInfo={food.largeInfo} picture={food.picture} />
              <NutritionAccordions grouped={grouped} />
            </>
          )}
        </View>
      </PageShell>
    </>
  );
}

function makeStyles(theme: MD3Theme, bp: any) {
  const maxWidth = bp.isXL ? s(760) : '100%';

  type Styles = {
    content: ViewStyle;
    body: ViewStyle;
    statusText: TextStyle;
    errorText: TextStyle;
  };

  return StyleSheet.create<Styles>({
    content: {
      width: '100%',
      alignItems: 'stretch',
    },
    body: {
      width: '100%',
      maxWidth,
      alignSelf: 'center',
      gap: vs(12),
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
