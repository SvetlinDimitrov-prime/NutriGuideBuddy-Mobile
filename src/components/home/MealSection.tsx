// MealSection.tsx
import { useMealFoods } from '@/api/hooks/useMealFoods';
import { useDeleteMeal } from '@/api/hooks/useMeals';
import type { MealFoodView } from '@/api/types/mealFoods';
import type { MealView } from '@/api/types/meals';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

import AppModal from '../AppModal';
import FoodRow from './FoodRow';

type Props = {
  meal: MealView;
  twoCols: boolean;
  loading?: boolean;
};

export default function MealSection({ meal, twoCols, loading = false }: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);
  const deleteMealMutation = useDeleteMeal();
  const isWeb = Platform.OS === 'web';

  const totalCals = meal.totalCalories ?? 0;

  // from /meals – either dedicated count or fallback to preview list
  const foodsCount =
    (meal as any).foodsCount ??
    (Array.isArray((meal as any).foods) ? (meal as any).foods.length : 0);

  // full foods for this meal (from /mealFoods)
  const { data: foods = [], isLoading: foodsLoading, error: foodsError } = useMealFoods(meal.id);

  const [expanded, setExpanded] = useState(false);
  const [mealDeleteOpen, setMealDeleteOpen] = useState(false);

  const busy = loading || deleteMealMutation.isPending;

  const toggleExpanded = () => {
    if (busy) return;
    setExpanded((v) => !v);
  };

  const handleEditMeal = () => {
    if (busy) return;
    router.push({
      pathname: '/home/meal/[id]',
      params: { id: String(meal.id) },
    });
  };

  const handleDeleteMeal = () => {
    if (busy) return;
    setMealDeleteOpen(true);
  };

  const confirmDeleteMeal = () => {
    if (busy) return;
    deleteMealMutation.mutate(meal.id, {
      onSuccess: () => setMealDeleteOpen(false),
    });
  };

  const handleAddFoodSearch = () => {
    if (busy) return;
    router.push({
      pathname: '/home/meal/[mealId]/food/search',
      params: { mealId: String(meal.id) },
    });
  };

  const handleAddFoodQr = () => {
    if (busy || isWeb) return;
    router.push({
      pathname: '/home/meal/[mealId]/food/scan',
      params: { mealId: String(meal.id) },
    });
  };

  return (
    <Surface style={styles.mealSection} elevation={0} mode="flat">
      {/* HEADER */}
      <View style={styles.mealHeaderRow}>
        {/* LEFT – tap to expand / collapse */}
        <Pressable
          onPress={toggleExpanded}
          disabled={busy}
          style={({ pressed }) => [styles.headerLeft, pressed && styles.headerLeftPressed]}
        >
          <View style={styles.titleRow}>
            <Text style={styles.mealName} numberOfLines={1} ellipsizeMode="tail">
              {meal.name || 'Unnamed meal'}
            </Text>

            <View style={styles.kcalPill}>
              <Text style={styles.kcalPillText}>{totalCals.toFixed(0)} kcal</Text>
            </View>
          </View>

          <Text style={styles.mealMeta}>
            {foodsCount === 0 ? 'No foods yet' : `${foodsCount} item${foodsCount === 1 ? '' : 's'}`}
          </Text>
        </Pressable>

        {/* RIGHT – actions + chevron */}
        <View style={styles.headerRight}>
          <IconButton
            icon="square-edit-outline"
            size={s(18)}
            onPress={handleEditMeal}
            disabled={busy}
            iconColor={theme.colors.primary}
            style={styles.headerIconBtn}
          />
          <IconButton
            icon="delete-outline"
            size={s(18)}
            onPress={handleDeleteMeal}
            disabled={busy}
            iconColor={theme.colors.error}
            style={styles.headerIconBtn}
          />
          <IconButton
            disabled={busy}
            icon={expanded ? 'chevron-up' : 'chevron-down'}
            size={s(20)}
            onPress={toggleExpanded}
            style={styles.chevronBtn}
          />
        </View>
      </View>

      {/* BODY (accordion) */}
      {expanded && (
        <View style={styles.body}>
          <View style={styles.foodList}>
            {foodsLoading && <Text style={styles.emptyText}>Loading foods…</Text>}

            {foodsError && !foodsLoading && (
              <Text style={styles.emptyText}>Could not load foods.</Text>
            )}

            {!foodsLoading && !foodsError && foods.length === 0 && (
              <Text style={styles.emptyText}>No foods added yet.</Text>
            )}

            {!foodsLoading &&
              !foodsError &&
              foods.map((food: MealFoodView) => (
                <FoodRow
                  key={food.id}
                  mealId={meal.id}
                  food={food}
                  twoCols={twoCols}
                  loading={busy}
                />
              ))}
          </View>

          <View style={styles.actionsRow}>
            {!isWeb && (
              <Pressable
                onPress={handleAddFoodQr}
                disabled={busy}
                style={({ pressed }) => [styles.flatBtn, pressed && styles.flatBtnPressed]}
              >
                <Text style={styles.flatBtnText}>Scan QR</Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleAddFoodSearch}
              disabled={busy}
              style={({ pressed }) => [styles.flatBtn, pressed && styles.flatBtnPressed]}
            >
              <Text style={styles.flatBtnText}>Add food</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* delete modal */}
      <AppModal
        visible={mealDeleteOpen}
        onDismiss={() => (busy ? null : setMealDeleteOpen(false))}
        title="Delete meal?"
        confirmLabel="Delete"
        confirmTextColor={theme.colors.error}
        onConfirm={confirmDeleteMeal}
        confirmLoading={deleteMealMutation.isPending}
        confirmDisabled={busy}
        onCancel={() => setMealDeleteOpen(false)}
      >
        <Text>
          Are you sure you want to delete{' '}
          <Text style={{ fontWeight: '700' }}>{meal.name || 'this meal'}</Text>? This will remove
          all foods inside it.
        </Text>
      </AppModal>
    </Surface>
  );
}

function makeStyles(
  theme: MD3Theme,
  bp: { isXL: boolean; isLG: boolean; isMD: boolean; isSM: boolean },
) {
  const padX = bp.isXL ? s(24) : bp.isLG ? s(20) : bp.isMD ? s(18) : s(16);
  const padY = bp.isXL ? vs(12) : bp.isLG ? vs(10) : vs(8);
  const maxWidth = bp.isXL ? s(1024) : bp.isLG ? s(864) : bp.isMD ? s(720) : '100%';
  const outline = theme.colors.outlineVariant;
  const isSmall = bp.isSM || bp.isMD;

  return StyleSheet.create({
    mealSection: {
      alignSelf: 'center',
      width: '100%',
      maxWidth,
      paddingHorizontal: padX,
      paddingVertical: padY,
      backgroundColor: 'transparent',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: outline,
    },

    mealHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(12),
    },

    headerLeft: {
      flex: 1,
      paddingVertical: vs(2),
    },
    headerLeftPressed: {
      opacity: 0.7,
    },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(8),
    },

    mealName: {
      flexShrink: 1,
      fontSize: isSmall ? ms(17, 0.2) : ms(16, 0.2),
      fontWeight: Platform.OS === 'ios' ? '600' : '700',
    },

    kcalPill: {
      paddingHorizontal: s(10),
      paddingVertical: vs(2),
      borderRadius: s(999),
      backgroundColor: theme.colors.surfaceVariant,
    },

    kcalPillText: {
      fontSize: ms(12.5, 0.2),
      color: theme.colors.onSurfaceVariant,
      fontWeight: Platform.OS === 'ios' ? '500' : '600',
    },

    mealMeta: {
      marginTop: vs(2),
      fontSize: ms(12.5, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(2),
    },

    headerIconBtn: {
      margin: 0,
      width: s(32),
      height: s(32),
    },

    chevronBtn: {
      margin: 0,
      width: s(32),
      height: s(32),
    },

    body: {
      marginTop: vs(6),
      paddingTop: vs(6),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: outline,
      gap: vs(8),
    },

    foodList: {
      gap: vs(2),
    },

    emptyText: {
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: s(8),
      marginTop: vs(4),
    },

    flatBtn: {
      paddingHorizontal: s(10),
      paddingVertical: vs(4),
      borderRadius: s(999),
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: outline,
    },

    flatBtnPressed: {
      opacity: 0.85,
    },

    flatBtnText: {
      fontSize: ms(12.5, 0.2),
      color: theme.colors.primary,
      fontWeight: Platform.OS === 'ios' ? '500' : '600',
    },
  });
}
