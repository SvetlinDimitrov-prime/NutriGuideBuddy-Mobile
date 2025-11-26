import { useDeleteMeal } from '@/api/hooks/useMeals';
import type { MealView } from '@/api/types/meals';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Divider, IconButton, Surface, Text, useTheme } from 'react-native-paper';
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

  const isSmall = bp.isSM || bp.isMD;
  const isWeb = Platform.OS === 'web';
  const isLarge = bp.isLG || bp.isXL;

  const headerIconSize = isSmall ? s(18) : s(14);
  const actionIconSize = isSmall ? s(20) : isWeb && isLarge ? s(15) : s(18);

  const editIconColor = theme.colors.primary;
  const deleteIconColor = theme.colors.error;

  const totalCals = meal.totalCalories ?? 0;
  const foods = useMemo(() => meal.foods ?? [], [meal.foods]);

  const [mealDeleteOpen, setMealDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const busy = loading || deleteMealMutation.isPending;

  const handleEditMeal = () => {
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

  const toggleAddActions = () => {
    if (busy) return;
    setAddOpen((v) => !v);
  };

  const handleAddByQr = () => {
    if (busy || isWeb) return;

    setAddOpen(false);

    router.push({
      pathname: '/home/meal/[mealId]/food/scan',
      params: { mealId: String(meal.id) },
    });
  };

  const handleAddBySearch = () => {
    setAddOpen(false);
    router.push({
      pathname: '/home/meal/[mealId]/food/search',
      params: { mealId: String(meal.id) },
    });
  };

  return (
    <Surface style={styles.mealSection} elevation={1}>
      <View style={styles.mealHeaderRow}>
        <Text style={styles.mealNameText} numberOfLines={1} ellipsizeMode="tail">
          {meal.name || 'Unnamed meal'}
        </Text>

        <View style={styles.mealHeaderRight}>
          <Text style={styles.mealCaloriesText}>{totalCals.toFixed(0)} kcal</Text>

          {/* EDIT */}
          <IconButton
            icon="square-edit-outline"
            size={headerIconSize}
            onPress={handleEditMeal}
            disabled={busy}
            iconColor={editIconColor}
            style={styles.iconBtnHeader}
            accessibilityLabel="Edit meal"
          />

          {/* DELETE */}
          <IconButton
            icon="delete-outline"
            size={headerIconSize}
            onPress={handleDeleteMeal}
            disabled={busy}
            iconColor={deleteIconColor}
            style={styles.iconBtnHeader}
            accessibilityLabel="Delete meal"
          />
        </View>
      </View>

      <Divider style={styles.mealDivider} />

      {/* foods */}
      <View style={styles.foodList}>
        {foods.map((food) => (
          <FoodRow key={food.id} mealId={meal.id} food={food} twoCols={twoCols} loading={busy} />
        ))}

        {foods.length === 0 && <Text style={styles.statusTextSmall}>No foods added yet.</Text>}
      </View>

      {/* action row: Add only + inline quick actions */}
      <View style={styles.foodActionsRow}>
        <IconButton
          icon="plus"
          size={actionIconSize}
          onPress={toggleAddActions}
          disabled={busy}
          iconColor={theme.colors.primary}
          style={styles.actionIconBtn}
          accessibilityLabel="Add food"
        />

        {addOpen && (
          <View style={styles.quickActionsWrap}>
            {!isWeb && (
              <Pressable
                onPress={handleAddByQr}
                style={({ pressed }) => [
                  styles.quickActionBtn,
                  pressed && styles.quickActionPressed,
                ]}
              >
                <IconButton
                  icon="qrcode-scan"
                  size={actionIconSize - s(2)}
                  iconColor={theme.colors.primary}
                  style={styles.quickActionIcon}
                />
                <Text style={styles.quickActionText}>QR</Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleAddBySearch}
              style={({ pressed }) => [styles.quickActionBtn, pressed && styles.quickActionPressed]}
            >
              <IconButton
                icon="magnify"
                size={actionIconSize - s(2)}
                iconColor={theme.colors.primary}
                style={styles.quickActionIcon}
              />
              <Text style={styles.quickActionText}>Search</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* MEAL delete confirm */}
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
  const isWeb = Platform.OS === 'web';
  const isLarge = bp.isLG || bp.isXL;
  const isSmall = bp.isSM || bp.isMD;

  const mealPadX = bp.isXL ? s(18) : bp.isLG ? s(16) : bp.isMD ? s(14) : s(12);
  const mealPadY = bp.isXL ? vs(14) : bp.isLG ? vs(12) : bp.isMD ? vs(10) : vs(8);
  const outline = theme.colors.outlineVariant;

  const maxWidth = bp.isXL ? s(1024) : bp.isLG ? s(864) : bp.isMD ? s(720) : '100%';

  // match FoodHeaderSection vibe
  const headerIconBox = isSmall ? s(30) : s(24);
  const actionIconBox = isSmall ? s(36) : isWeb && isLarge ? s(28) : s(32);

  const sheet = StyleSheet.create({
    mealSection: {
      marginTop: vs(12),
      backgroundColor: theme.colors.surface,
      borderRadius: s(12),
      paddingHorizontal: mealPadX,
      paddingVertical: mealPadY,
      alignSelf: 'center',
      width: '100%',
      maxWidth,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: outline,
    },

    mealHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(8),
    },

    mealNameText: {
      flex: 1,
      fontSize: isSmall ? ms(17, 0.2) : ms(16, 0.2),
      lineHeight: isSmall ? ms(20, 0.2) : ms(18, 0.2),
      fontWeight: Platform.OS === 'ios' ? '600' : '700',
      paddingRight: s(8),
    },

    mealHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      flexShrink: 0,
    },

    mealCaloriesText: {
      fontSize: isSmall ? ms(15, 0.2) : ms(14, 0.2),
      lineHeight: isSmall ? ms(20, 0.2) : ms(18, 0.2),
      color: theme.colors.onSurfaceVariant,
      marginRight: s(2),
    },

    // ✅ header buttons (edit/delete) — modern outlined squares
    iconBtnHeader: {
      margin: 0,
      width: headerIconBox,
      height: headerIconBox,
      borderRadius: s(9),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: outline,
      backgroundColor: theme.colors.surface,
    },

    mealDivider: {
      marginTop: vs(8),
      marginBottom: vs(6),
      backgroundColor: outline,
      height: StyleSheet.hairlineWidth,
    },

    foodList: {
      gap: vs(6),
    },

    statusTextSmall: {
      marginTop: vs(4),
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    foodActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: s(8),
      marginTop: vs(10),
    },

    // ✅ add button same family as header buttons
    actionIconBtn: {
      margin: 0,
      width: actionIconBox,
      height: actionIconBox,
      borderRadius: s(10),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: outline,
      backgroundColor: theme.colors.surface,
    },

    quickActionsWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
    },

    // keep these as small chips (still consistent now)
    quickActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(6),
      paddingVertical: vs(2),
      borderRadius: s(8),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: outline,
      backgroundColor: theme.colors.surface,
    },

    quickActionPressed: {
      opacity: 0.7,
    },

    quickActionIcon: {
      margin: 0,
      padding: 0,
    },

    quickActionText: {
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurface,
      marginLeft: s(-2),
    },
  });

  return sheet;
}
