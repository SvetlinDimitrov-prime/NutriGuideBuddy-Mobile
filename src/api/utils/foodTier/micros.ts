// src/utils/foodTier/micros.ts
import type { FoodLike, FoodTierReason } from '@/types/nutritionProfile';
import type { FoodComponentLabel } from '@/api/types/mealFoods';
import type { Archetype } from './archetype';

const VITAMIN_LABELS: FoodComponentLabel[] = [
  'VITAMIN_A_RAE',
  'VITAMIN_D_D2_D3',
  'VITAMIN_E_ALPHA_TOCOPHEROL',
  'VITAMIN_K',
  'VITAMIN_B1_THIAMINE',
  'VITAMIN_B2_RIBOFLAVIN',
  'VITAMIN_B3_NIACIN',
  'VITAMIN_B5_PANTOTHENIC_ACID',
  'VITAMIN_B6',
  'VITAMIN_B7_BIOTIN',
  'VITAMIN_B9_FOLATE_DFE',
  'VITAMIN_B12',
  'VITAMIN_C',
  'CHOLINE',
];

const MINERAL_LABELS: FoodComponentLabel[] = [
  'CALCIUM',
  'PHOSPHORUS',
  'MAGNESIUM',
  'POTASSIUM',
  'IRON',
  'ZINC',
  'COPPER',
  'MANGANESE',
  'IODINE',
  'SELENIUM',
];

const AMINO_LABELS: FoodComponentLabel[] = [
  'HISTIDINE',
  'ISOLEUCINE',
  'LEUCINE',
  'LYSINE',
  'THREONINE',
  'TRYPTOPHAN',
  'VALINE',
  'METHIONINE_CYSTEINE_TOTAL',
  'PHENYLALANINE_TYROSINE_TOTAL',
];

const NICE_NAMES: Partial<Record<FoodComponentLabel, string>> = {
  VITAMIN_A_RAE: 'vitamin A',
  VITAMIN_D_D2_D3: 'vitamin D',
  VITAMIN_E_ALPHA_TOCOPHEROL: 'vitamin E',
  VITAMIN_K: 'vitamin K',
  VITAMIN_B1_THIAMINE: 'vitamin B1',
  VITAMIN_B2_RIBOFLAVIN: 'vitamin B2',
  VITAMIN_B3_NIACIN: 'niacin (B3)',
  VITAMIN_B5_PANTOTHENIC_ACID: 'vitamin B5',
  VITAMIN_B6: 'vitamin B6',
  VITAMIN_B7_BIOTIN: 'biotin (B7)',
  VITAMIN_B9_FOLATE_DFE: 'folate (B9)',
  VITAMIN_B12: 'vitamin B12',
  VITAMIN_C: 'vitamin C',
  CHOLINE: 'choline',
  CALCIUM: 'calcium',
  PHOSPHORUS: 'phosphorus',
  MAGNESIUM: 'magnesium',
  POTASSIUM: 'potassium',
  IRON: 'iron',
  ZINC: 'zinc',
  COPPER: 'copper',
  MANGANESE: 'manganese',
  IODINE: 'iodine',
  SELENIUM: 'selenium',
};

export function addMicronutrientSignals(
  food: FoodLike,
  archetype: Archetype,
  reasons: FoodTierReason[],
): number {
  if (!food.components || food.components.length === 0) return 0;

  const pick = (labels: FoodComponentLabel[]) =>
    food.components!.filter((c) => labels.includes(c.name) && (c.amount ?? 0) > 0);

  const vitamins = pick(VITAMIN_LABELS);
  const minerals = pick(MINERAL_LABELS);
  const aminos = pick(AMINO_LABELS);

  const totalMicros = vitamins.length + minerals.length + aminos.length;
  if (!totalMicros) return 0;

  const allInteresting = [...vitamins, ...minerals].sort(
    (a, b) => (b.amount ?? 0) - (a.amount ?? 0),
  );

  const top = allInteresting.slice(0, 3);
  const prettyList = top
    .map((c) => NICE_NAMES[c.name] ?? c.name.replace(/_/g, ' ').toLowerCase())
    .join(', ');

  let bonus = 0;
  switch (archetype) {
    case 'carb':
      bonus = totalMicros >= 5 ? 8 : totalMicros >= 3 ? 5 : 3;
      break;
    case 'protein':
    case 'mixed':
      bonus = totalMicros >= 5 ? 6 : totalMicros >= 3 ? 4 : 2;
      break;
    case 'fat':
      bonus = totalMicros >= 5 ? 5 : totalMicros >= 3 ? 3 : 2;
      break;
  }

  reasons.push({
    kind: 'positive',
    message:
      prettyList.length > 0
        ? `Provides useful micronutrients like ${prettyList}.`
        : 'Provides a mix of vitamins and minerals.',
  });

  return bonus;
}
