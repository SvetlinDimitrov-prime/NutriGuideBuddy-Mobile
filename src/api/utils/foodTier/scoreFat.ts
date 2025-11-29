import type { FoodLike, FoodTierReason } from '@/types/nutritionProfile';
import { per100g, kcalPer100g } from './helpers';

/**
 * Fat-dominant foods (oils, butter, nuts, seeds):
 *  - Good: unsaturated fats, omega-3, some micronutrients (handled elsewhere).
 *  - Bad: high saturated fat, extreme calorie density, a lot of sodium.
 */
export function scoreFatFood(food: FoodLike, reasons: FoodTierReason[]): number {
  let score = 55;

  const satFat100g = per100g(food, 'SATURATED') ?? 0;
  const mono100g = per100g(food, 'MONOUNSATURATED') ?? 0;
  const poly100g = per100g(food, 'POLYUNSATURATED') ?? 0;
  const kcal100 = kcalPer100g(food);
  const sodium100g = per100g(food, 'SODIUM');
  const omega3 =
    (per100g(food, 'OMEGA3') ?? 0) +
    (per100g(food, 'OMEGA3_EPA') ?? 0) +
    (per100g(food, 'OMEGA3_DHA') ?? 0);

  const unsat = mono100g + poly100g;

  // ---- Omega-3 bonus ----
  if (omega3 >= 1) {
    score += 12;
    reasons.push({
      kind: 'positive',
      message: 'Rich in omega-3 fats – great for heart and brain health.',
    });
  } else if (omega3 >= 0.3) {
    score += 6;
    reasons.push({
      kind: 'positive',
      message: 'Contains meaningful omega-3 fats.',
    });
  }

  // ---- Saturated fat ----
  if (satFat100g < 10) {
    score += 6;
    reasons.push({
      kind: 'positive',
      message: 'Relatively low saturated fat for a fat-dense food (< 10 g / 100 g).',
    });
  } else if (satFat100g < 20) {
    reasons.push({
      kind: 'info',
      message: 'Moderate saturated fat (10–20 g / 100 g).',
    });
  } else {
    score -= 10;
    reasons.push({
      kind: 'negative',
      message: 'Very high saturated fat (≥ 20 g / 100 g).',
    });
  }

  // ---- Unsaturated vs saturated balance ----
  if (unsat > satFat100g * 1.5 && unsat > 15) {
    score += 6;
    reasons.push({
      kind: 'positive',
      message: 'Mostly unsaturated fat – better overall fat profile.',
    });
  }

  // ---- Energy density – fats are always high, only punish extremes ----
  if (kcal100 != null) {
    if (kcal100 > 750) {
      score -= 6;
      reasons.push({
        kind: 'negative',
        message: 'Extremely calorie-dense (> 750 kcal / 100 g).',
      });
    } else if (kcal100 > 600) {
      reasons.push({
        kind: 'info',
        message: 'Very energy-dense – best in small portions.',
      });
    }
  }

  // ---- Sodium ----
  if (sodium100g != null && sodium100g >= 300) {
    score -= 5;
    reasons.push({
      kind: 'negative',
      message: 'High sodium (≥ 300 mg / 100 g).',
    });
  }

  return score;
}
