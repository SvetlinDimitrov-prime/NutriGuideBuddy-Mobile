import type { FoodComponentGroup, FoodComponentLabel, Unit } from './mealFoods';

export type FoodComponentCatalogEntry = {
  label: FoodComponentLabel;
  unit: Unit;
  group: FoodComponentGroup;
  description: string;
  richSources: string[];
  funFact: string;
};
