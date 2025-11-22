export type FoodComponentGroup =
  | 'OTHER'
  | 'CARBS'
  | 'FATS'
  | 'FATTY_ACIDS'
  | 'PROTEIN'
  | 'VITAMINS'
  | 'AMINO_ACIDS'
  | 'MINERALS';

export type Unit = 'KCAL' | 'G' | 'MG' | 'MCG';

export type FoodComponentLabel =
  | 'ENERGY'
  | 'WATER'
  | 'CARBOHYDRATE'
  | 'STARCH'
  | 'SUGAR'
  | 'FIBER'
  | 'FAT'
  | 'SATURATED'
  | 'TRANS'
  | 'MONOUNSATURATED'
  | 'POLYUNSATURATED'
  | 'CHOLESTEROL'
  | 'OMEGA6'
  | 'OMEGA3'
  | 'OMEGA3_EPA'
  | 'OMEGA3_DHA'
  | 'PROTEIN'
  | 'VITAMIN_A_RAE'
  | 'VITAMIN_A_BETA_CAROTENE'
  | 'VITAMIN_A_LUTEIN_ZEAXANTHIN'
  | 'VITAMIN_A_LYCOPENE'
  | 'VITAMIN_D_D2_D3'
  | 'VITAMIN_E_ALPHA_TOCOPHEROL'
  | 'VITAMIN_K'
  | 'VITAMIN_B1_THIAMINE'
  | 'VITAMIN_B2_RIBOFLAVIN'
  | 'VITAMIN_B3_NIACIN'
  | 'VITAMIN_B5_PANTOTHENIC_ACID'
  | 'VITAMIN_B6'
  | 'VITAMIN_B7_BIOTIN'
  | 'VITAMIN_B9_FOLATE_DFE'
  | 'VITAMIN_B12'
  | 'VITAMIN_C'
  | 'CHOLINE'
  | 'HISTIDINE'
  | 'ISOLEUCINE'
  | 'LEUCINE'
  | 'LYSINE'
  | 'THREONINE'
  | 'TRYPTOPHAN'
  | 'VALINE'
  | 'METHIONINE_CYSTEINE_TOTAL'
  | 'PHENYLALANINE_TYROSINE_TOTAL'
  | 'CALCIUM'
  | 'PHOSPHORUS'
  | 'MAGNESIUM'
  | 'SODIUM'
  | 'POTASSIUM'
  | 'IRON'
  | 'ZINC'
  | 'COPPER'
  | 'MANGANESE'
  | 'IODINE'
  | 'SELENIUM';

export type FoodComponent =
  | 'ENERGY'
  | 'WATER'
  | 'CARBOHYDRATE'
  | 'STARCH'
  | 'SUGAR'
  | 'FIBER'
  | 'FAT'
  | 'SATURATED'
  | 'TRANS'
  | 'MONOUNSATURATED'
  | 'POLYUNSATURATED'
  | 'CHOLESTEROL'
  | 'OMEGA6'
  | 'OMEGA3'
  | 'OMEGA3_EPA'
  | 'OMEGA3_DHA'
  | 'HISTIDINE'
  | 'ISOLEUCINE'
  | 'LEUCINE'
  | 'LYSINE'
  | 'THREONINE'
  | 'TRYPTOPHAN'
  | 'VALINE'
  | 'METHIONINE_CYSTEINE_TOTAL'
  | 'PHENYLALANINE_TYROSINE_TOTAL'
  | 'PROTEIN'
  | 'VITAMIN_A_RAE'
  | 'VITAMIN_A_BETA_CAROTENE'
  | 'VITAMIN_A_LUTEIN_ZEAXANTHIN'
  | 'VITAMIN_A_LYCOPENE'
  | 'VITAMIN_D_D2_D3'
  | 'VITAMIN_E_ALPHA_TOCOPHEROL'
  | 'VITAMIN_K'
  | 'VITAMIN_B1_THIAMINE'
  | 'VITAMIN_B2_RIBOFLAVIN'
  | 'VITAMIN_B3_NIACIN'
  | 'VITAMIN_B5_PANTOTHENIC_ACID'
  | 'VITAMIN_B6'
  | 'VITAMIN_B7_BIOTIN'
  | 'VITAMIN_B9_FOLATE_DFE'
  | 'VITAMIN_B12'
  | 'VITAMIN_C'
  | 'CHOLINE'
  | 'CALCIUM'
  | 'PHOSPHORUS'
  | 'MAGNESIUM'
  | 'SODIUM'
  | 'POTASSIUM'
  | 'IRON'
  | 'ZINC'
  | 'COPPER'
  | 'MANGANESE'
  | 'IODINE'
  | 'SELENIUM';

/* -------------------- API TYPES -------------------- */

// matches ServingView
export type ServingView = {
  id: number;
  amount: number;
  metric: string;
  gramsTotal: number;
};

// matches FoodComponentView
export type FoodComponentView = {
  id: number;
  group: FoodComponentGroup;
  name: FoodComponentLabel;
  unit: Unit;
  amount: number;
};

// matches MealFoodView
export type MealFoodView = {
  id: number;
  mealId: number;
  name: string;
  info: string | null;
  largeInfo: string | null;
  picture: string | null;

  calorieAmount: number;
  calorieUnit: string; // backend sends string symbol/unit name

  servingUnit: string;
  servingAmount: number;
  servingTotalGrams: number;

  servings: ServingView[];
  components: FoodComponentView[];
};

// matches MealFoodFilter
export type CustomPageableMealFood = {
  pageNumber?: number;
  pageSize?: number;
  sort?: Record<string, 'ASC' | 'DESC'>;
};

export type MealFoodFilter = {
  name?: string;
  minCalorieAmount?: number;
  maxCalorieAmount?: number;
  idsIn?: number[];
  idsNotIn?: number[];
  pageable?: CustomPageableMealFood;
};

// matches FoodCreateRequest
export type MealFoodCreateRequest = {
  name: string;
  info?: string;
  largeInfo?: string;
  picture?: string;

  servingUnit: string;
  servingAmount: number;
  servingTotalGrams: number;

  servings?: Array<{
    metric: string;
    amount: number;
    gramsTotal: number;
  }>;

  components: Array<{
    name: FoodComponentLabel; // ✅ strongly typed
    unit: Unit; // ✅ strongly typed
    amount: number;
  }>;
};

// matches FoodUpdateRequest
export type MealFoodUpdateRequest = {
  name?: string;
  info?: string;
  largeInfo?: string;
  picture?: string;

  servingUnit?: string;
  servingAmount?: number;
  servingTotalGrams?: number;

  servings?: Array<{
    id: number;
    metric?: string;
    amount?: number;
    gramsTotal?: number;
  }>;

  components?: Array<{
    id: number;
    amount: number;
  }>;
};
