import type { FoodLike } from '@/types/nutritionProfile';
import { per100g } from './helpers';

export type Archetype = 'protein' | 'carb' | 'fat' | 'mixed';

export type ArchetypeInfo = {
  type: Archetype;
  carbs: number;
  fat: number;
  protein: number;
  cShare: number;
  pShare: number;
  fShare: number;
};

export function detectArchetype(food: FoodLike | null): ArchetypeInfo {
  const carbs = per100g(food, 'CARBOHYDRATE') ?? 0;
  const fat = per100g(food, 'FAT') ?? 0;
  const protein = per100g(food, 'PROTEIN') ?? 0;

  const cKcal = carbs * 4;
  const pKcal = protein * 4;
  const fKcal = fat * 9;
  const totalKcal = cKcal + pKcal + fKcal;

  if (!totalKcal) {
    return {
      type: 'mixed',
      carbs,
      fat,
      protein,
      cShare: 0,
      pShare: 0,
      fShare: 0,
    };
  }

  const cShare = cKcal / totalKcal;
  const pShare = pKcal / totalKcal;
  const fShare = fKcal / totalKcal;

  if (protein >= 20 && pShare >= 0.4) {
    return { type: 'protein', carbs, fat, protein, cShare, pShare, fShare };
  }

  if (protein >= 12 && carbs >= 20 && pShare >= 0.2 && cShare >= 0.2) {
    return { type: 'mixed', carbs, fat, protein, cShare, pShare, fShare };
  }

  if (cShare >= 0.6) {
    return { type: 'carb', carbs, fat, protein, cShare, pShare, fShare };
  }

  if (fShare >= 0.6 || fat >= 30) {
    return { type: 'fat', carbs, fat, protein, cShare, pShare, fShare };
  }

  return { type: 'mixed', carbs, fat, protein, cShare, pShare, fShare };
}
