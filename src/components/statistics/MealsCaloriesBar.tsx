import type { MealConsumedView } from '@/api/types/tracker';
import { useMemo } from 'react';
import { BarWithLegend } from './BarWithLegend';

type Props = {
  meals: MealConsumedView[];
};

export function MealsCaloriesBar({ meals }: Props) {
  const entries = useMemo(
    () =>
      (meals ?? []).map((m) => ({
        id: String(m.id),
        name: m.name ?? 'Meal',
        kcal: m.amount ?? 0,
      })),
    [meals],
  );

  return (
    <BarWithLegend
      entries={entries}
      legendLeftLabel="Meals"
      emptyText="No meals logged for this day."
    />
  );
}
