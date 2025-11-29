import { useDeleteMealFood, useMealFood, useUpdateMealFood } from '@/api/hooks/useMealFoods';
import AppModal from '@/components/AppModal';
import { AboutSection } from '@/components/meal/food/AboutSection';
import { FoodHeaderSection } from '@/components/meal/food/FoodHeaderSection';
import { NutritionAccordions } from '@/components/meal/food/NutritionAccordions';
import { ServingEditorCard } from '@/components/meal/food/ServingEditorCard';
import { ServingMacroCard } from '@/components/meal/food/ServingMacroCard';
import PageShell from '@/components/PageShell';
import { useFoodServingState } from '@/hooks/useFoodServingState';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Text, useTheme } from 'react-native-paper';
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

  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    editOpen,
    setEditOpen,
    selectedServing,
    qtyText,
    onQtyChangeSafe,
    qtyNum,
    setSelectedServing,
    computed,
    scaleRatio,
    scaledCalories,
    macros,
    macroPercents,
    grouped,
    cancelEdit,
  } = useFoodServingState(food ?? null);

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

  const busyDelete = deleteMealFoodMut.isPending;

  return (
    <>
      <PageShell bottomExtra={vs(40)} contentStyle={styles.content}>
        <View style={styles.body}>
          <FoodHeaderSection
            name={food?.name}
            food={food}
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
            onCancel={cancelEdit}
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
              <AboutSection info={food.info} largeInfo={food.largeInfo} picture={food.picture} />
              <NutritionAccordions grouped={grouped} />
            </>
          )}
        </View>
      </PageShell>

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
