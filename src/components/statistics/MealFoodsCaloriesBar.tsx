import type { MealConsumedView } from '@/api/types/tracker';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';
import { CaloriesBarWithLegend } from '../CaloriesBarWithLegend';
import ChipsPanel from '../ChipsPanel'; // ✅ reuse

type Props = {
  meals: MealConsumedView[];
};

const clampNonNeg = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);

type SelectableMeal = {
  id: string;
  name: string;
  kcal: number;
  foods: MealConsumedView['foods'];
};

type Styles = {
  wrap: ViewStyle;
  emptyCard: ViewStyle;
  emptyText: TextStyle;
};

export function MealFoodsCaloriesBar({ meals }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const selectableMeals: SelectableMeal[] = useMemo(() => {
    return (meals ?? [])
      .map((m) => ({
        id: String(m.id),
        name: m.name ?? 'Meal',
        kcal: clampNonNeg(m.amount ?? 0),
        foods: m.foods ?? [],
      }))
      .filter((m) => m.kcal > 0)
      .sort((a, b) => b.kcal - a.kcal);
  }, [meals]);

  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMealId && selectableMeals.length > 0) {
      setSelectedMealId(selectableMeals[0].id);
    }
    if (
      selectedMealId &&
      selectableMeals.length > 0 &&
      !selectableMeals.some((m) => m.id === selectedMealId)
    ) {
      setSelectedMealId(selectableMeals[0].id);
    }
  }, [selectableMeals, selectedMealId]);

  const selectedMeal = selectableMeals.find((m) => m.id === selectedMealId) ?? null;

  const foodEntries = useMemo(
    () =>
      (selectedMeal?.foods ?? [])
        .map((f) => ({
          id: String(f.id),
          name: f.name ?? 'Food',
          kcal: clampNonNeg(f.amount ?? 0),
        }))
        .filter((f) => f.kcal > 0),
    [selectedMeal],
  );

  if (selectableMeals.length === 0) {
    return (
      <Surface style={styles.emptyCard} elevation={0}>
        <Text style={styles.emptyText}>No meals with calories logged for this day.</Text>
      </Surface>
    );
  }

  return (
    <View style={styles.wrap}>
      <ChipsPanel
        rows={[
          {
            key: 'meals',
            title: 'Meal',
            items: selectableMeals,
            selectedId: selectedMealId,
            onSelect: (m) => setSelectedMealId(m.id),
            getId: (m) => m.id,
            getLabel: (m) => m.name,
            maxLabelChars: 12,
          },
        ]}
      />

      <CaloriesBarWithLegend
        entries={foodEntries}
        legendLeftLabel={selectedMeal?.name ?? 'Meal'}
        emptyText="No foods logged in this meal."
        unitLabel="kcal"
        maxLabelChars={9}
      />
    </View>
  );
}

function makeStyles(theme: any) {
  return StyleSheet.create<Styles>({
    wrap: {
      width: '100%',
      gap: vs(8),
    },

    emptyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: s(14),
      padding: s(14),
      width: '100%',
    },

    emptyText: {
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurfaceVariant,
    },
  });
}
