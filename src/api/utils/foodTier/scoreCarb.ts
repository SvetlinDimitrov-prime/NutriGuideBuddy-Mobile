import type { FoodLike, FoodTierReason } from '@/types/nutritionProfile';
import { per100g, proteinPer100kcal, kcalPer100g } from './helpers';

/**
 * Carbohydrate-dominant foods:
 *  - Good: fibre, micronutrients (handled separately), a bit of protein, low sugar.
 *  - Bad: high free sugar, very calorie-dense, salty.
 */
export function scoreCarbFood(food: FoodLike, reasons: FoodTierReason[]): number {
  // Start neutral-ish; sugar/fibre/energy will move it a lot.
  let score = 55;

  const fiber100g = per100g(food, 'FIBER');
  const sugar100g = per100g(food, 'SUGAR');
  const prot100kcal = proteinPer100kcal(food);
  const kcal100 = kcalPer100g(food);
  const sodium100g = per100g(food, 'SODIUM');

  // ---- Fibre (major positive driver for carbs) ----
  if (fiber100g != null) {
    if (fiber100g >= 7) {
      score += 14;
      reasons.push({
        kind: 'positive',
        message: 'Very high in fibre (≥ 7 g / 100 g) – great for gut health and satiety.',
      });
    } else if (fiber100g >= 5) {
      score += 10;
      reasons.push({
        kind: 'positive',
        message: 'High fibre (5–7 g / 100 g).',
      });
    } else if (fiber100g >= 3) {
      score += 5;
      reasons.push({
        kind: 'positive',
        message: 'Decent fibre (3–5 g / 100 g).',
      });
    } else if (fiber100g < 1) {
      score -= 6;
      reasons.push({
        kind: 'negative',
        message: 'Very low fibre (< 1 g / 100 g) – mostly quick carbs.',
      });
    } else {
      reasons.push({
        kind: 'info',
        message: 'Moderate fibre (1–3 g / 100 g).',
      });
    }
  }

  // ---- Sugar (main negative driver) – aligned with Nutri-Score cut-offs ----
  if (sugar100g != null) {
    if (sugar100g > 22.5) {
      score -= 18;
      reasons.push({
        kind: 'negative',
        message: 'Very high sugar (> 22.5 g / 100 g).',
      });
    } else if (sugar100g > 15) {
      score -= 12;
      reasons.push({
        kind: 'negative',
        message: 'High sugar (15–22.5 g / 100 g).',
      });
    } else if (sugar100g > 10) {
      score -= 8;
      reasons.push({
        kind: 'negative',
        message: 'Moderate–high sugar (10–15 g / 100 g).',
      });
    } else if (sugar100g > 5) {
      score -= 4;
      reasons.push({
        kind: 'negative',
        message: 'Some sugar (5–10 g / 100 g) – keep an eye on portions.',
      });
    } else {
      score += 4;
      reasons.push({
        kind: 'positive',
        message: 'Low sugar (≤ 5 g / 100 g).',
      });
    }
  }

  // ---- Protein is a bonus for carb foods (higher satiety) ----
  if (prot100kcal != null) {
    if (prot100kcal >= 7) {
      score += 5;
      reasons.push({
        kind: 'positive',
        message: 'Good protein for a carb source (≥ 7 g / 100 kcal).',
      });
    } else if (prot100kcal >= 3) {
      reasons.push({
        kind: 'info',
        message: 'Some protein present – still mainly carbs.',
      });
    } else {
      reasons.push({
        kind: 'info',
        message: 'Mostly carbs – best to pair with a protein source.',
      });
    }
  }

  // ---- Energy density (kcal / 100 g) – stronger penalty for very dense carbs ----
  if (kcal100 != null) {
    if (kcal100 < 80) {
      score += 4;
      reasons.push({
        kind: 'positive',
        message: 'Light on calories (< 80 kcal / 100 g).',
      });
    } else if (kcal100 <= 160) {
      reasons.push({
        kind: 'info',
        message: 'Moderate calorie density (80–160 kcal / 100 g).',
      });
    } else if (kcal100 <= 260) {
      score -= 5;
      reasons.push({
        kind: 'negative',
        message: 'Quite calorie-dense for carbs (160–260 kcal / 100 g).',
      });
    } else {
      score -= 10;
      reasons.push({
        kind: 'negative',
        message: 'Very calorie-dense carbs (≥ 260 kcal / 100 g).',
      });
    }
  }

  // ---- Sodium – usually small factor for carb foods ----
  if (sodium100g != null) {
    if (sodium100g >= 600) {
      score -= 8;
      reasons.push({
        kind: 'negative',
        message: 'Very high sodium (≥ 600 mg / 100 g).',
      });
    } else if (sodium100g >= 300) {
      score -= 4;
      reasons.push({
        kind: 'negative',
        message: 'High sodium (300–600 mg / 100 g).',
      });
    } else if (sodium100g < 120) {
      score += 2;
      reasons.push({
        kind: 'positive',
        message: 'Low sodium (< 120 mg / 100 g).',
      });
    }
  }

  return score;
}
