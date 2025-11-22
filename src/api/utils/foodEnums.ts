// api/utils/foodEnums.ts
import type {
  FoodComponent,
  FoodComponentGroup,
  FoodComponentLabel,
  Unit,
} from '@/api/types/mealFoods';

export const FOOD_COMPONENT_LABEL_DISPLAY: Record<FoodComponentLabel, string> = {
  ENERGY: 'Energy',
  WATER: 'Water',
  CARBOHYDRATE: 'Carbohydrate',
  STARCH: 'Starch',
  SUGAR: 'Total Sugars',
  FIBER: 'Dietary Fiber',
  FAT: 'Fat',
  SATURATED: 'Saturated Fat',
  TRANS: 'Trans Fat',
  MONOUNSATURATED: 'Monounsaturated Fat',
  POLYUNSATURATED: 'Polyunsaturated Fat',
  CHOLESTEROL: 'Cholesterol',
  OMEGA6: 'Linoleic Acid (LA)',
  OMEGA3: 'α-Linolenic Acid (ALA)',
  OMEGA3_EPA: 'Eicosapentaenoic Acid (EPA)',
  OMEGA3_DHA: 'Docosahexaenoic Acid (DHA)',
  PROTEIN: 'Protein',
  VITAMIN_A_RAE: 'Vitamin A (RAE)',
  VITAMIN_A_BETA_CAROTENE: 'Beta-Carotene',
  VITAMIN_A_LUTEIN_ZEAXANTHIN: 'Lutein + Zeaxanthin',
  VITAMIN_A_LYCOPENE: 'Lycopene',
  VITAMIN_D_D2_D3: 'Vitamin D (D2 + D3)',
  VITAMIN_E_ALPHA_TOCOPHEROL: 'Vitamin E (α-Tocopherol)',
  VITAMIN_K: 'Vitamin K',
  VITAMIN_B1_THIAMINE: 'Vitamin B1 (Thiamine)',
  VITAMIN_B2_RIBOFLAVIN: 'Vitamin B2 (Riboflavin)',
  VITAMIN_B3_NIACIN: 'Vitamin B3 (Niacin)',
  VITAMIN_B5_PANTOTHENIC_ACID: 'Vitamin B5 (Pantothenic Acid)',
  VITAMIN_B6: 'Vitamin B6',
  VITAMIN_B7_BIOTIN: 'Vitamin B7 (Biotin)',
  VITAMIN_B9_FOLATE_DFE: 'Folate (DFE)',
  VITAMIN_B12: 'Vitamin B12',
  VITAMIN_C: 'Vitamin C',
  CHOLINE: 'Choline',
  HISTIDINE: 'Histidine',
  ISOLEUCINE: 'Isoleucine',
  LEUCINE: 'Leucine',
  LYSINE: 'Lysine',
  THREONINE: 'Threonine',
  TRYPTOPHAN: 'Tryptophan',
  VALINE: 'Valine',
  METHIONINE_CYSTEINE_TOTAL: 'Methionine + Cysteine (total)',
  PHENYLALANINE_TYROSINE_TOTAL: 'Phenylalanine + Tyrosine (total)',
  CALCIUM: 'Calcium',
  PHOSPHORUS: 'Phosphorus',
  MAGNESIUM: 'Magnesium',
  SODIUM: 'Sodium',
  POTASSIUM: 'Potassium',
  IRON: 'Iron',
  ZINC: 'Zinc',
  COPPER: 'Copper',
  MANGANESE: 'Manganese',
  IODINE: 'Iodine',
  SELENIUM: 'Selenium',
};

export const UNIT_SYMBOL: Record<Unit, string> = {
  KCAL: 'kcal',
  G: 'g',
  MG: 'mg',
  MCG: 'µg',
};

// Full FoodComponent mapping (mirrors Java enum)
export const FOOD_COMPONENT_META: Record<
  FoodComponent,
  { label: FoodComponentLabel; unit: Unit; group: FoodComponentGroup }
> = {
  ENERGY: { label: 'ENERGY', unit: 'KCAL', group: 'OTHER' },
  WATER: { label: 'WATER', unit: 'G', group: 'OTHER' },

  CARBOHYDRATE: { label: 'CARBOHYDRATE', unit: 'G', group: 'CARBS' },
  STARCH: { label: 'STARCH', unit: 'G', group: 'CARBS' },
  SUGAR: { label: 'SUGAR', unit: 'G', group: 'CARBS' },
  FIBER: { label: 'FIBER', unit: 'G', group: 'CARBS' },

  FAT: { label: 'FAT', unit: 'G', group: 'FATS' },
  SATURATED: { label: 'SATURATED', unit: 'G', group: 'FATS' },
  TRANS: { label: 'TRANS', unit: 'G', group: 'FATS' },
  MONOUNSATURATED: { label: 'MONOUNSATURATED', unit: 'G', group: 'FATS' },
  POLYUNSATURATED: { label: 'POLYUNSATURATED', unit: 'G', group: 'FATS' },
  CHOLESTEROL: { label: 'CHOLESTEROL', unit: 'MG', group: 'FATS' },

  OMEGA6: { label: 'OMEGA6', unit: 'G', group: 'FATTY_ACIDS' },
  OMEGA3: { label: 'OMEGA3', unit: 'G', group: 'FATTY_ACIDS' },
  OMEGA3_EPA: { label: 'OMEGA3_EPA', unit: 'G', group: 'FATTY_ACIDS' },
  OMEGA3_DHA: { label: 'OMEGA3_DHA', unit: 'G', group: 'FATTY_ACIDS' },

  HISTIDINE: { label: 'HISTIDINE', unit: 'G', group: 'AMINO_ACIDS' },
  ISOLEUCINE: { label: 'ISOLEUCINE', unit: 'G', group: 'AMINO_ACIDS' },
  LEUCINE: { label: 'LEUCINE', unit: 'G', group: 'AMINO_ACIDS' },
  LYSINE: { label: 'LYSINE', unit: 'G', group: 'AMINO_ACIDS' },
  THREONINE: { label: 'THREONINE', unit: 'G', group: 'AMINO_ACIDS' },
  TRYPTOPHAN: { label: 'TRYPTOPHAN', unit: 'G', group: 'AMINO_ACIDS' },
  VALINE: { label: 'VALINE', unit: 'G', group: 'AMINO_ACIDS' },
  METHIONINE_CYSTEINE_TOTAL: {
    label: 'METHIONINE_CYSTEINE_TOTAL',
    unit: 'G',
    group: 'AMINO_ACIDS',
  },
  PHENYLALANINE_TYROSINE_TOTAL: {
    label: 'PHENYLALANINE_TYROSINE_TOTAL',
    unit: 'G',
    group: 'AMINO_ACIDS',
  },

  PROTEIN: { label: 'PROTEIN', unit: 'G', group: 'PROTEIN' },

  VITAMIN_A_RAE: { label: 'VITAMIN_A_RAE', unit: 'MCG', group: 'VITAMINS' },
  VITAMIN_A_BETA_CAROTENE: {
    label: 'VITAMIN_A_BETA_CAROTENE',
    unit: 'MCG',
    group: 'VITAMINS',
  },
  VITAMIN_A_LUTEIN_ZEAXANTHIN: {
    label: 'VITAMIN_A_LUTEIN_ZEAXANTHIN',
    unit: 'MCG',
    group: 'VITAMINS',
  },
  VITAMIN_A_LYCOPENE: {
    label: 'VITAMIN_A_LYCOPENE',
    unit: 'MCG',
    group: 'VITAMINS',
  },
  VITAMIN_D_D2_D3: {
    label: 'VITAMIN_D_D2_D3',
    unit: 'MCG',
    group: 'VITAMINS',
  },
  VITAMIN_E_ALPHA_TOCOPHEROL: {
    label: 'VITAMIN_E_ALPHA_TOCOPHEROL',
    unit: 'MG',
    group: 'VITAMINS',
  },
  VITAMIN_K: { label: 'VITAMIN_K', unit: 'MCG', group: 'VITAMINS' },
  VITAMIN_B1_THIAMINE: {
    label: 'VITAMIN_B1_THIAMINE',
    unit: 'MG',
    group: 'VITAMINS',
  },
  VITAMIN_B2_RIBOFLAVIN: {
    label: 'VITAMIN_B2_RIBOFLAVIN',
    unit: 'MG',
    group: 'VITAMINS',
  },
  VITAMIN_B3_NIACIN: { label: 'VITAMIN_B3_NIACIN', unit: 'MG', group: 'VITAMINS' },
  VITAMIN_B5_PANTOTHENIC_ACID: {
    label: 'VITAMIN_B5_PANTOTHENIC_ACID',
    unit: 'MG',
    group: 'VITAMINS',
  },
  VITAMIN_B6: { label: 'VITAMIN_B6', unit: 'MG', group: 'VITAMINS' },
  VITAMIN_B7_BIOTIN: { label: 'VITAMIN_B7_BIOTIN', unit: 'MCG', group: 'VITAMINS' },
  VITAMIN_B9_FOLATE_DFE: {
    label: 'VITAMIN_B9_FOLATE_DFE',
    unit: 'MCG',
    group: 'VITAMINS',
  },
  VITAMIN_B12: { label: 'VITAMIN_B12', unit: 'MCG', group: 'VITAMINS' },
  VITAMIN_C: { label: 'VITAMIN_C', unit: 'MG', group: 'VITAMINS' },
  CHOLINE: { label: 'CHOLINE', unit: 'MG', group: 'VITAMINS' },

  CALCIUM: { label: 'CALCIUM', unit: 'MG', group: 'MINERALS' },
  PHOSPHORUS: { label: 'PHOSPHORUS', unit: 'MG', group: 'MINERALS' },
  MAGNESIUM: { label: 'MAGNESIUM', unit: 'MG', group: 'MINERALS' },
  SODIUM: { label: 'SODIUM', unit: 'MG', group: 'MINERALS' },
  POTASSIUM: { label: 'POTASSIUM', unit: 'MG', group: 'MINERALS' },
  IRON: { label: 'IRON', unit: 'MG', group: 'MINERALS' },
  ZINC: { label: 'ZINC', unit: 'MG', group: 'MINERALS' },
  COPPER: { label: 'COPPER', unit: 'MCG', group: 'MINERALS' },
  MANGANESE: { label: 'MANGANESE', unit: 'MG', group: 'MINERALS' },
  IODINE: { label: 'IODINE', unit: 'MCG', group: 'MINERALS' },
  SELENIUM: { label: 'SELENIUM', unit: 'MCG', group: 'MINERALS' },
};

// helper for UI
export function getComponentDisplay(c: FoodComponentLabel) {
  return FOOD_COMPONENT_LABEL_DISPLAY[c];
}
export function getUnitSymbol(u: Unit) {
  return UNIT_SYMBOL[u];
}
