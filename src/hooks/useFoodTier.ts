import { detectArchetype } from '@/api/utils/foodTier/archetype';
import { clamp, scoreToTier } from '@/api/utils/foodTier/helpers';
import { addMicronutrientSignals } from '@/api/utils/foodTier/micros';
import { scoreCarbFood } from '@/api/utils/foodTier/scoreCarb';
import { scoreFatFood } from '@/api/utils/foodTier/scoreFat';
import { scoreMixedFood } from '@/api/utils/foodTier/scoreMixed';
import { scoreProteinFood } from '@/api/utils/foodTier/scoreProtein';
import type { FoodLike, FoodTierReason, FoodTierResult } from '@/types/nutritionProfile';
import { useMemo } from 'react';

export function useFoodTier(food: FoodLike | null): FoodTierResult {
  return useMemo<FoodTierResult>(() => {
    if (!food || !food.components || food.components.length === 0) {
      return {
        tier: 'C',
        score: 50,
        reasons: [
          {
            kind: 'info',
            message: 'Not enough nutrition data – neutral rating.',
          },
        ],
        isEstimate: true,
      };
    }

    const reasons: FoodTierReason[] = [];

    const archetypeInfo = detectArchetype(food);
    const { type: archetype } = archetypeInfo;

    let score: number;
    switch (archetype) {
      case 'protein':
        score = scoreProteinFood(food, reasons);
        break;
      case 'carb':
        score = scoreCarbFood(food, reasons);
        break;
      case 'fat':
        score = scoreFatFood(food, reasons);
        break;
      default:
        score = scoreMixedFood(food, reasons);
        break;
    }

    // vitamins / minerals / amino acids
    score += addMicronutrientSignals(food, archetype, reasons);

    const signalsCount = reasons.length;
    const isEstimate = signalsCount < 3;

    if (isEstimate) {
      reasons.push({
        kind: 'info',
        message: 'Rating is approximate – not all key nutrients were available.',
      });
    }

    score = clamp(score, 0, 100);
    const tier = scoreToTier(score);

    const positives = reasons.filter((r) => r.kind === 'positive').length;
    const negatives = reasons.filter((r) => r.kind === 'negative').length;

    if ((tier === 'B' || tier === 'C') && negatives === 0 && positives > 0) {
      reasons.push({
        kind: 'info',
        message:
          'Overall solid profile – even better when combined with other foods to balance your day.',
      });
    }

    if (tier === 'D' || tier === 'E' || tier === 'F') {
      reasons.push({
        kind: 'info',
        message:
          'Best used occasionally or in smaller portions – pair it with higher-fiber, higher-protein foods.',
      });
    }

    return { tier, score, reasons, isEstimate };
  }, [food]);
}
