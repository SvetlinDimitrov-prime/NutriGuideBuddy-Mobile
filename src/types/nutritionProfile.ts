import type { FoodComponentLabel, Unit } from '@/api/types/mealFoods';

export type FoodLike = {
  servingTotalGrams?: number | null;
  calorieAmount?: number | null;
  components?:
    | {
        name: FoodComponentLabel;
        unit: Unit;
        amount?: number | null;
      }[]
    | null;
};

export type FoodTier = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type FoodTierReasonKind = 'positive' | 'negative' | 'info';

export type FoodTierReason = {
  kind: FoodTierReasonKind;
  message: string;
};

export type FoodTierResult = {
  tier: FoodTier;
  score: number; // 0–100
  reasons: FoodTierReason[];
  isEstimate: boolean;
};
