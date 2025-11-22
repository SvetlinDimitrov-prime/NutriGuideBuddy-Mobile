import { useDeleteMealFood, useMealFood, useUpdateMealFood } from '@/api/hooks/useMealFoods';
import type { FoodComponentGroup, MealFoodView, ServingView } from '@/api/types/mealFoods';
import { FOOD_COMPONENT_LABEL_DISPLAY } from '@/api/utils/foodEnums';
import AppModal from '@/components/AppModal';
import { AboutSection } from '@/components/meal/foodModal/AboutSection';
import { FoodHeaderSection } from '@/components/meal/foodModal/FoodHeaderSection';
import { NutritionAccordions } from '@/components/meal/foodModal/NutritionAccordions';
import { ServingEditorCard } from '@/components/meal/foodModal/ServingEditorCard';
import { ServingMacroCard } from '@/components/meal/foodModal/ServingMacroCard';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Surface, Text, useTheme } from 'react-native-paper';
import { s, vs } from 'react-native-size-matters';

export default function FoodModal() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const { mealId, foodId } = useLocalSearchParams<{ mealId: string; foodId: string }>();
  const mId = Number(mealId);
  const fId = Number(foodId);

  const { data: food, isLoading, isError, error } = useMealFood(mId, fId);
  const updateMealFood = useUpdateMealFood(mId);
  const deleteMealFoodMut = useDeleteMealFood(mId);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedServing, setSelectedServing] = useState<ServingView | null>(null);
  const [qtyText, setQtyText] = useState('1');

  const [deleteOpen, setDeleteOpen] = useState(false);

  // --- helper: resolve baseline serving correctly ---
  const resolveBaselineServing = (f: MealFoodView): ServingView | null => {
    // 1) exact match by metric + amount
    const exact =
      f.servings?.find((sv) => sv.metric === f.servingUnit && sv.amount === f.servingAmount) ??
      null;

    if (exact) return exact;

    // 2) virtual baseline serving using saved baseline fields
    if (f.servingUnit) {
      return {
        id: -1,
        metric: f.servingUnit,
        amount: f.servingAmount ?? 1,
        gramsTotal: f.servingTotalGrams ?? 0,
      };
    }

    // 3) fallback
    return f.servings?.[0] ?? null;
  };

  useEffect(() => {
    if (!food) return;
    const match = resolveBaselineServing(food);
    setSelectedServing(match);
    setQtyText(String(food.servingAmount ?? match?.amount ?? 1));
  }, [food]);

  // keep this light — ServingEditorCard already sanitizes hard
  const onQtyChangeSafe = (t: string) => {
    let cleaned = t.replace(/[^0-9.,-]/g, '').replace(/-/g, '');
    if (cleaned.trim() === '') {
      setQtyText('');
      return;
    }
    setQtyText(cleaned);
  };

  const qtyNum = useMemo(() => {
    const raw = qtyText.replace(',', '.').trim();
    if (raw === '' || raw === '.') return 0;
    const v = Number(raw);
    return Number.isFinite(v) && v > 0 ? v : 0;
  }, [qtyText]);

  const computed = useMemo(() => {
    if (!food || !selectedServing || qtyNum <= 0) return { grams: 0, kcal: 0 };

    const multiplier = selectedServing.amount > 0 ? qtyNum / selectedServing.amount : qtyNum;
    const grams = multiplier * selectedServing.gramsTotal;

    const kcalPerGram =
      food.servingTotalGrams > 0 ? food.calorieAmount / food.servingTotalGrams : 0;

    return { grams, kcal: grams * kcalPerGram };
  }, [food, selectedServing, qtyNum]);

  const scaleRatio = useMemo(() => {
    if (!food) return 0;
    if (!editOpen) return 1;
    if (qtyNum <= 0) return 0;
    if (computed.grams <= 0 || food.servingTotalGrams <= 0) return 0;
    return computed.grams / food.servingTotalGrams;
  }, [food, editOpen, qtyNum, computed.grams]);

  const scaledCalories = useMemo(() => {
    if (!food) return 0;
    return food.calorieAmount * scaleRatio;
  }, [food, scaleRatio]);

  const scaledComponentsAll = useMemo(() => {
    if (!food) return [];
    return (food.components ?? []).map((c) => {
      const rawScaled = (c.amount ?? 0) * scaleRatio;
      return {
        ...c,
        amount: Number.isFinite(rawScaled) ? Math.max(0, rawScaled) : 0,
      };
    });
  }, [food, scaleRatio]);

  const onCancelEdit = () => {
    if (!food) {
      setEditOpen(false);
      return;
    }
    const match = resolveBaselineServing(food);
    setSelectedServing(match);
    setQtyText(String(food.servingAmount ?? match?.amount ?? 1));
    setEditOpen(false);
  };

  const onSaveEdit = () => {
    if (!food || !selectedServing || qtyNum <= 0) return;

    updateMealFood.mutate(
      {
        foodId: food.id,
        dto: {
          servingUnit: selectedServing.metric,
          servingAmount: qtyNum,
          servingTotalGrams: computed.grams,

          components: (food.components ?? []).map((c) => ({
            id: c.id,
            amount: (c.amount ?? 0) * scaleRatio,
          })),
        },
      },
      { onSuccess: () => setEditOpen(false) },
    );
  };

  const onDeleteFood = () => {
    if (!food || deleteMealFoodMut.isPending) return;
    setDeleteOpen(true);
  };

  const confirmDeleteFood = () => {
    if (!food || deleteMealFoodMut.isPending) return;
    deleteMealFoodMut.mutate(food.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        router.back();
      },
    });
  };

  const macros = useMemo(() => {
    if (!food) return { carbs: 0, fats: 0, protein: 0, total: 0 };

    const sumByGroup = (g: FoodComponentGroup) =>
      scaledComponentsAll
        .filter((c) => c.group === g && c.unit === 'G')
        .reduce((acc, c) => acc + (c.amount ?? 0), 0);

    const carbs = sumByGroup('CARBS');
    const fats = sumByGroup('FATS') + sumByGroup('FATTY_ACIDS');
    const protein = sumByGroup('PROTEIN');

    return { carbs, fats, protein, total: carbs + fats + protein };
  }, [food, scaledComponentsAll]);

  const macroPercents = useMemo(() => {
    const { carbs, fats, protein, total } = macros;
    if (total <= 0) return { carbsP: 0, fatsP: 0, proteinP: 0 };
    return {
      carbsP: carbs / total,
      fatsP: fats / total,
      proteinP: protein / total,
    };
  }, [macros]);

  const filteredComponents = useMemo(() => {
    return scaledComponentsAll.filter((c) => {
      const label = FOOD_COMPONENT_LABEL_DISPLAY[c.name];
      return !['Energy', 'CARBOHYDRATE', 'FAT', 'PROTEIN'].includes(label);
    });
  }, [scaledComponentsAll]);

  const grouped = useMemo(() => {
    if (!food) return {};
    const map: Partial<Record<FoodComponentGroup, MealFoodView['components']>> = {};
    for (const c of filteredComponents) {
      if (!map[c.group]) map[c.group] = [];
      map[c.group]!.push(c);
    }
    Object.values(map).forEach((arr) => arr?.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0)));
    return map;
  }, [food, filteredComponents]);

  const isWeb = Platform.OS === 'web';
  const busyDelete = deleteMealFoodMut.isPending;

  return (
    <Surface style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={!isWeb}
      >
        <FoodHeaderSection
          name={food?.name}
          disabled={!food || busyDelete}
          onEditToggle={() => setEditOpen((v) => !v)}
          onDelete={onDeleteFood}
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
          onCancel={onCancelEdit}
          onSave={onSaveEdit}
          saving={updateMealFood.isPending}
          saveDisabled={!selectedServing || qtyNum <= 0}
        />

        {isLoading && <Text style={styles.statusText}>Loading food…</Text>}
        {isError && (
          <Text style={styles.errorText}>
            Couldn’t load food: {error?.message ?? 'Unknown error'}
          </Text>
        )}

        {!!food && (
          <>
            <ServingMacroCard
              servingText={
                editOpen
                  ? ''
                  : `🍽️ ${food.servingAmount} ${food.servingUnit} • ${food.servingTotalGrams} g`
              }
              kcalText={editOpen ? '' : `🔥 ${scaledCalories.toFixed(0)} ${food.calorieUnit}`}
              macros={macros}
              macroPercents={macroPercents}
            />

            <AboutSection info={food.info} largeInfo={food.largeInfo} />
            <NutritionAccordions grouped={grouped} />
          </>
        )}
      </ScrollView>

      <AppModal
        visible={deleteOpen}
        onDismiss={() => (busyDelete ? null : setDeleteOpen(false))}
        title="Delete food?"
        confirmLabel="Delete"
        confirmTextColor={theme.colors.error}
        onConfirm={confirmDeleteFood}
        confirmLoading={busyDelete}
        confirmDisabled={busyDelete}
        onCancel={() => setDeleteOpen(false)}
      >
        <Text>
          Are you sure you want to delete{' '}
          <Text style={{ fontWeight: '700' }}>{food?.name || 'this food'}</Text>?
        </Text>
      </AppModal>
    </Surface>
  );
}

function makeStyles(theme: MD3Theme, bp: any) {
  const isWeb = Platform.OS === 'web';

  const padX = bp.isXL ? s(28) : bp.isLG ? s(24) : s(16);
  const padY = bp.isXL ? vs(24) : bp.isLG ? vs(20) : vs(16);

  const maxWidth = isWeb ? '100%' : bp.isXL ? s(760) : '100%';

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
      paddingTop: padY,
      paddingHorizontal: padX,
      width: '100%',
      alignSelf: isWeb ? 'stretch' : 'center',
      maxWidth,
    },
    scroll: {
      flex: 1,
      width: '100%',
    },
    scrollContent: {
      paddingBottom: vs(40),
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
