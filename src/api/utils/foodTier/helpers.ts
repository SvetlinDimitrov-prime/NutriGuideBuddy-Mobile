import type { FoodLike, FoodTier } from '@/types/nutritionProfile';
import type { FoodComponentLabel } from '@/api/types/mealFoods';

/** Clamp numeric value into [min, max]. */
export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Map 0–100 score into S–F tier.
 * Slightly tightened bands so truly great foods land in S/A,
 * and “meh” foods fall into C/D.
 */
export const scoreToTier = (score: number): FoodTier => {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  if (score >= 25) return 'E';
  return 'F';
};

/** Get raw amount of a nutrient from the food (whatever unit it’s stored in). */
export const findComponentAmount = (
  food: FoodLike | null,
  label: FoodComponentLabel,
): number | null => {
  if (!food?.components) return null;
  const comp = food.components.find((c) => c.name === label);
  if (!comp || comp.amount == null || !Number.isFinite(comp.amount)) return null;
  return comp.amount;
};

/** Prefer ENERGY component, fall back to calorieAmount. */
export const getBaseCalories = (food: FoodLike | null): number => {
  if (!food) return 0;
  const energy = findComponentAmount(food, 'ENERGY');
  if (energy != null) return energy;
  return food.calorieAmount ?? 0;
};

/** Generic “per 100 g” helper for any nutrient. */
export const per100g = (food: FoodLike | null, label: FoodComponentLabel): number | null => {
  if (!food) return null;
  const grams = food.servingTotalGrams ?? 0;
  if (!grams || grams <= 0) return null;

  const amount = findComponentAmount(food, label);
  if (amount == null) return null;

  return (amount / grams) * 100;
};

/** Generic “per 100 kcal” helper for any nutrient. */
export const per100kcal = (food: FoodLike | null, label: FoodComponentLabel): number | null => {
  if (!food) return null;
  const calories = getBaseCalories(food);
  if (!calories || calories <= 0) return null;

  const amount = findComponentAmount(food, label);
  if (amount == null) return null;

  return (amount / calories) * 100;
};

/** Backwards-compatible helper specifically for protein density. */
export const proteinPer100kcal = (food: FoodLike | null): number | null =>
  per100kcal(food, 'PROTEIN');

/** kcal per 100 g of food. */
export const kcalPer100g = (food: FoodLike | null): number | null => {
  if (!food) return null;
  const grams = food.servingTotalGrams ?? 0;
  const calories = getBaseCalories(food);
  if (!grams || grams <= 0 || !calories || calories <= 0) return null;
  return (calories / grams) * 100;
};
