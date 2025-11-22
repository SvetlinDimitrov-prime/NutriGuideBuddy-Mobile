import type { FoodComponentGroup, FoodComponentLabel, Unit } from './mealFoods';

// TrackerRequest(LocalDate date)
export type TrackerRequest = {
  date?: string; // ISO yyyy-mm-dd, optional because body can be null
};

export type FoodComponentRequest = {
  name: FoodComponentLabel;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
};

export type FoodConsumedView = {
  id: number;
  name: string;
  amount: number;
};

export type MealConsumedView = {
  id: number;
  name: string;
  amount: number;
  foods: FoodConsumedView[];
};

export type MealFoodComponentConsumedView = {
  mealId: number;
  mealName: string;
  foodId: number;
  foodName: string;
  amount: number;
};

export type FoodComponentIntakeView = {
  name: FoodComponentLabel;
  group: FoodComponentGroup;
  consumed: MealFoodComponentConsumedView[];
  recommended: number | null;
  maxRecommended: number | null;
  unit: Unit;
};

export type TrackerView = {
  calorieGoal: number | null;
  consumed: MealConsumedView[];
  components: FoodComponentIntakeView[];
};
