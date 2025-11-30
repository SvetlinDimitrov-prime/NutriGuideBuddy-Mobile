import type { FoodComponentLabel, Unit } from './mealFoods';

export type CustomFoodComponentRdiResponse = {
  id: number;
  name: FoodComponentLabel;
  unit: Unit;
  rdiMin: number | null;
  rdiMax: number | null;
};

export type CustomFoodComponentRdiCreateRequest = {
  name: FoodComponentLabel;
  unit: Unit;
  rdiMin?: number | null;
  rdiMax?: number | null;
};

export type CustomFoodComponentRdiCreateRequestWrapper = {
  components: CustomFoodComponentRdiCreateRequest[];
};

export type CustomFoodComponentRdiUpdateRequest = {
  rdiMin?: number | null;
  rdiMax?: number | null;
};
