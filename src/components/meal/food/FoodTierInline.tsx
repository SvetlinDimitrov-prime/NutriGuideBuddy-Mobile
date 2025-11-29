import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { FoodComponentLabel, Unit, MealFoodView } from '@/api/types/mealFoods';
import { useFoodTier, type FoodTier } from '@/hooks/useFoodTier';

type FoodTierInput = {
  servingTotalGrams?: number | null;
  calorieAmount?: number | null;
  components?:
    | {
        name: FoodComponentLabel;
        unit: Unit;
        amount?: number | null;
      }[]
    | null;
} & Partial<MealFoodView>;

type Props = {
  food: FoodTierInput | null | undefined;
};

const tierEmoji = (tier: FoodTier): string => {
  switch (tier) {
    case 'S':
      return '💎';
    case 'A':
      return '🥇';
    case 'B':
      return '🥈';
    case 'C':
      return '🥉';
    case 'D':
      return '⚠️';
    case 'E':
      return '🚫';
    case 'F':
      return '☠️';
    default:
      return '❔';
  }
};

export const FoodTierInline: React.FC<Props> = ({ food }) => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const { tier, score, isEstimate } = useFoodTier(food ?? null);

  if (!food) return null;

  return (
    <Text variant="bodySmall" style={styles.text}>
      {tierEmoji(tier)} {tier} • {score.toFixed(0)}/100{isEstimate ? ' (estimate)' : ''}
    </Text>
  );
};

function makeStyles(theme: any) {
  return StyleSheet.create({
    text: {
      color: theme.colors.onSurfaceVariant,
    },
  });
}
