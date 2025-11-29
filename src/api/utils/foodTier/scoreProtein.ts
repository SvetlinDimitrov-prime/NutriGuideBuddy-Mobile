import type { FoodLike, FoodTierReason } from '@/types/nutritionProfile';
import { per100g, proteinPer100kcal, kcalPer100g } from './helpers';

/**
 * Protein-dominant foods (meat, fish, protein powder, legumes if very high protein):
 *  - Protein density is king.
 *  - Saturated fat & sodium are the main negatives.
 *  - Sugar and extreme energy density are minor but still counted.
 */
export function scoreProteinFood(food: FoodLike, reasons: FoodTierReason[]): number {
  // Start slightly lower and let protein density pull good items up strongly.
  let score = 50;

  const prot100kcal = proteinPer100kcal(food);
  const satFat100g = per100g(food, 'SATURATED');
  const sodium100g = per100g(food, 'SODIUM');
  const kcal100 = kcalPer100g(food);
  const sugar100g = per100g(food, 'SUGAR');

  // ---- Protein density (main positive driver) ----
  if (prot100kcal != null) {
    if (prot100kcal >= 25) {
      score += 30;
      reasons.push({
        kind: 'positive',
        message: 'Extremely high protein density (≥ 25 g / 100 kcal) – premium protein source.',
      });
    } else if (prot100kcal >= 20) {
      score += 24;
      reasons.push({
        kind: 'positive',
        message: 'Very high protein density (20–25 g / 100 kcal).',
      });
    } else if (prot100kcal >= 15) {
      score += 16;
      reasons.push({
        kind: 'positive',
        message: 'High protein density (15–20 g / 100 kcal).',
      });
    } else if (prot100kcal >= 10) {
      score += 8;
      reasons.push({
        kind: 'positive',
        message: 'Decent protein density (10–15 g / 100 kcal).',
      });
    } else {
      score -= 8;
      reasons.push({
        kind: 'negative',
        message: 'Low protein for a protein-focused food (< 10 g / 100 kcal).',
      });
    }
  }

  // ---- Saturated fat per 100 g ----
  if (satFat100g != null) {
    if (satFat100g < 1) {
      score += 6;
      reasons.push({
        kind: 'positive',
        message: 'Very low saturated fat (< 1 g / 100 g).',
      });
    } else if (satFat100g < 3) {
      score += 2;
      reasons.push({
        kind: 'info',
        message: 'Moderate saturated fat (1–3 g / 100 g).',
      });
    } else if (satFat100g < 7) {
      score -= 6;
      reasons.push({
        kind: 'negative',
        message: 'High saturated fat (3–7 g / 100 g).',
      });
    } else {
      score -= 12;
      reasons.push({
        kind: 'negative',
        message: 'Very high saturated fat (≥ 7 g / 100 g).',
      });
    }
  }

  // ---- Sodium – we expect some in processed proteins, but very high is bad ----
  if (sodium100g != null) {
    if (sodium100g < 120) {
      score += 3;
      reasons.push({
        kind: 'positive',
        message: 'Low sodium (< 120 mg / 100 g).',
      });
    } else if (sodium100g < 400) {
      reasons.push({
        kind: 'info',
        message: 'Moderate sodium (120–400 mg / 100 g).',
      });
    } else if (sodium100g < 800) {
      score -= 5;
      reasons.push({
        kind: 'negative',
        message: 'High sodium (400–800 mg / 100 g).',
      });
    } else {
      score -= 10;
      reasons.push({
        kind: 'negative',
        message: 'Very high sodium (≥ 800 mg / 100 g).',
      });
    }
  }

  // ---- Energy density – gentle penalty (protein powders and fatty fish often dense) ----
  if (kcal100 != null) {
    if (kcal100 < 120) {
      score += 3;
      reasons.push({
        kind: 'positive',
        message: 'Quite lean (< 120 kcal / 100 g).',
      });
    } else if (kcal100 <= 250) {
      reasons.push({
        kind: 'info',
        message: 'Reasonable calorie density for a protein source (120–250 kcal / 100 g).',
      });
    } else if (kcal100 <= 350) {
      score -= 3;
      reasons.push({
        kind: 'negative',
        message: 'Calorie-dense protein (250–350 kcal / 100 g).',
      });
    } else {
      score -= 5;
      reasons.push({
        kind: 'negative',
        message: 'Very calorie-dense protein (> 350 kcal / 100 g).',
      });
    }
  }

  // ---- Sugar – unusual for a protein-focused product ----
  if (sugar100g != null) {
    if (sugar100g >= 10) {
      score -= 8;
      reasons.push({
        kind: 'negative',
        message: 'High sugar for a protein source (≥ 10 g / 100 g).',
      });
    } else if (sugar100g >= 5) {
      score -= 4;
      reasons.push({
        kind: 'negative',
        message: 'Contains added sugars (5–10 g / 100 g).',
      });
    } else if (sugar100g > 0) {
      reasons.push({
        kind: 'info',
        message: 'Small amount of sugar present.',
      });
    }
  }

  return score;
}
