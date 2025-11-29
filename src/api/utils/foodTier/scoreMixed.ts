import type { FoodLike, FoodTierReason } from '@/types/nutritionProfile';
import { per100g, proteinPer100kcal, kcalPer100g } from './helpers';

/**
 * Mixed foods (meals, lentils, casseroles, processed items):
 *  - We look for a reasonable protein density and some fibre.
 *  - We penalise high sugar, saturated fat and high energy density.
 *  - We don’t expect perfection; this is the “balanced / meal” bucket.
 */
export function scoreMixedFood(food: FoodLike, reasons: FoodTierReason[]): number {
  let score = 55;

  const prot100kcal = proteinPer100kcal(food);
  const fiber100g = per100g(food, 'FIBER');
  const sugar100g = per100g(food, 'SUGAR');
  const satFat100g = per100g(food, 'SATURATED');
  const kcal100 = kcalPer100g(food);

  // ---- Protein density ----
  if (prot100kcal != null) {
    if (prot100kcal >= 12) {
      score += 8;
      reasons.push({
        kind: 'positive',
        message: 'Good protein density for a mixed food (≥ 12 g / 100 kcal).',
      });
    } else if (prot100kcal < 6) {
      score -= 5;
      reasons.push({
        kind: 'negative',
        message: 'Low protein for its calories (< 6 g / 100 kcal).',
      });
    } else {
      reasons.push({
        kind: 'info',
        message: 'Moderate protein – neither high nor low.',
      });
    }
  }

  // ---- Fibre ----
  if (fiber100g != null) {
    if (fiber100g >= 5) {
      score += 6;
      reasons.push({
        kind: 'positive',
        message: 'Contains a good amount of fibre (≥ 5 g / 100 g).',
      });
    } else if (fiber100g >= 3) {
      score += 3;
      reasons.push({
        kind: 'positive',
        message: 'Some fibre present (3–5 g / 100 g).',
      });
    }
  }

  // ---- Sugar ----
  if (sugar100g != null && sugar100g >= 10) {
    score -= 8;
    reasons.push({
      kind: 'negative',
      message: 'High sugar for a mixed food (≥ 10 g / 100 g).',
    });
  } else if (sugar100g != null && sugar100g >= 5) {
    score -= 4;
    reasons.push({
      kind: 'negative',
      message: 'Contains added sugars (5–10 g / 100 g).',
    });
  }

  // ---- Saturated fat ----
  if (satFat100g != null && satFat100g >= 5) {
    score -= 8;
    reasons.push({
      kind: 'negative',
      message: 'High in saturated fat (≥ 5 g / 100 g).',
    });
  } else if (satFat100g != null && satFat100g >= 2) {
    score -= 3;
    reasons.push({
      kind: 'negative',
      message: 'Moderate saturated fat (2–5 g / 100 g).',
    });
  }

  // ---- Energy density ----
  if (kcal100 != null && kcal100 >= 220) {
    score -= 6;
    reasons.push({
      kind: 'negative',
      message: 'Quite calorie-dense – watch portion size (≥ 220 kcal / 100 g).',
    });
  } else if (kcal100 != null && kcal100 < 120) {
    score += 3;
    reasons.push({
      kind: 'positive',
      message: 'Relatively light for a mixed food (< 120 kcal / 100 g).',
    });
  }

  return score;
}
