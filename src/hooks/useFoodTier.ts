import type { FoodComponentLabel, Unit } from '@/api/types/mealFoods';
import { useMemo } from 'react';

type FoodLike = {
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

export type FoodTierResult = {
  tier: FoodTier;
  score: number; // 0–100
  reasons: string[];
  isEstimate: boolean; // true if we had very limited data
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const findComponentAmount = (food: FoodLike | null, label: FoodComponentLabel): number | null => {
  if (!food?.components) return null;
  const comp = food.components.find((c) => c.name === label);
  if (!comp || comp.amount == null || !Number.isFinite(comp.amount)) return null;
  return comp.amount;
};

const getBaseCalories = (food: FoodLike | null): number => {
  if (!food) return 0;

  const energy = findComponentAmount(food, 'ENERGY');
  if (energy != null) return energy;

  return food.calorieAmount ?? 0;
};

const per100g = (food: FoodLike | null, label: FoodComponentLabel): number | null => {
  if (!food) return null;
  const grams = food.servingTotalGrams ?? 0;
  if (!grams || grams <= 0) return null;

  const amount = findComponentAmount(food, label);
  if (amount == null) return null;

  return (amount / grams) * 100;
};

const proteinPer100kcal = (food: FoodLike | null): number | null => {
  if (!food) return null;
  const calories = getBaseCalories(food);
  if (!calories || calories <= 0) return null;

  const protein = findComponentAmount(food, 'PROTEIN');
  if (protein == null) return null;

  return (protein / calories) * 100;
};

const kcalPer100g = (food: FoodLike | null): number | null => {
  if (!food) return null;
  const grams = food.servingTotalGrams ?? 0;
  const calories = getBaseCalories(food);
  if (!grams || grams <= 0 || !calories || calories <= 0) return null;
  return (calories / grams) * 100;
};

const scoreToTier = (score: number): FoodTier => {
  if (score >= 85) return 'S';
  if (score >= 75) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  if (score >= 20) return 'E';
  return 'F';
};

export function useFoodTier(food: FoodLike | null): FoodTierResult {
  return useMemo(() => {
    if (!food || !food.components || food.components.length === 0) {
      return {
        tier: 'C',
        score: 50,
        reasons: ['Not enough nutrition data – neutral rating.'],
        isEstimate: true,
      };
    }

    let score = 50;
    const reasons: string[] = [];
    let signalsCount = 0;

    // --- POSITIVE SIGNALS ---

    const fiber100g = per100g(food, 'FIBER');
    if (fiber100g != null) {
      signalsCount++;
      if (fiber100g >= 5) {
        score += 15;
        reasons.push('High in fiber (≥ 5 g / 100 g).');
      } else if (fiber100g >= 3) {
        score += 8;
        reasons.push('Decent fiber content (≥ 3 g / 100 g).');
      } else {
        reasons.push('Low fiber content.');
      }
    }

    const prot100kcal = proteinPer100kcal(food);
    if (prot100kcal != null) {
      signalsCount++;
      if (prot100kcal >= 10) {
        score += 15;
        reasons.push('High protein density (≥ 10 g / 100 kcal).');
      } else if (prot100kcal >= 5) {
        score += 7;
        reasons.push('Moderate protein density (≥ 5 g / 100 kcal).');
      } else {
        reasons.push('Low protein density.');
      }
    }

    const kcal100g = kcalPer100g(food);
    if (kcal100g != null) {
      signalsCount++;
      if (kcal100g <= 40) {
        score += 10;
        reasons.push('Very low calorie density (≤ 40 kcal / 100 g).');
      } else if (kcal100g <= 150) {
        score += 5;
        reasons.push('Reasonable calorie density (≤ 150 kcal / 100 g).');
      }
    }

    // --- NEGATIVE SIGNALS ---

    const sugar100g = per100g(food, 'SUGAR');
    if (sugar100g != null) {
      signalsCount++;
      if (sugar100g >= 22.5) {
        score -= 20;
        reasons.push('Very high sugar (≥ 22.5 g / 100 g).');
      } else if (sugar100g >= 5) {
        score -= 10;
        reasons.push('Moderate sugar (≥ 5 g / 100 g).');
      }
    }

    const satFat100g = per100g(food, 'SATURATED');
    if (satFat100g != null) {
      signalsCount++;
      if (satFat100g >= 5) {
        score -= 15;
        reasons.push('High saturated fat (≥ 5 g / 100 g).');
      } else if (satFat100g >= 1.5) {
        score -= 7;
        reasons.push('Moderate saturated fat (≥ 1.5 g / 100 g).');
      }
    }

    const trans100g = per100g(food, 'TRANS');
    if (trans100g != null && trans100g > 0.3) {
      signalsCount++;
      score -= 15;
      reasons.push('Contains trans fat (> 0.3 g / 100 g).');
    }

    const sodium100g = per100g(food, 'SODIUM');
    if (sodium100g != null) {
      signalsCount++;
      if (sodium100g >= 600) {
        score -= 10;
        reasons.push('High sodium (≥ 600 mg / 100 g).');
      } else if (sodium100g >= 120) {
        score -= 5;
        reasons.push('Moderate sodium (≥ 120 mg / 100 g).');
      }
    }

    const isEstimate = signalsCount < 3;
    if (isEstimate && reasons.length === 0) {
      reasons.push('Limited nutrition data – approximate rating.');
    }

    score = clamp(score, 0, 100);
    const tier = scoreToTier(score);

    return { tier, score, reasons, isEstimate };
  }, [food]);
}
