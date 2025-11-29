import type { FoodComponentLabel, Unit } from './mealFoods';

export type PopulationGroup = 'ALL' | 'MALE' | 'FEMALE' | 'FEMALE_PREGNANT' | 'FEMALE_LACTATING';

export type RdiBasis = string;

export type FoodComponentRdi = {
  ageMin: number;
  ageMax: number;
  rdiMin: number | null;
  rdiMax: number | null;
  unit: Unit | string;
  isDerived: boolean;
  basis: RdiBasis | null;
  divisor: number | null;
  note: string | null;
};

export type FoodComponentRdiMap = Record<
  FoodComponentLabel,
  Record<PopulationGroup, FoodComponentRdi[]>
>;
