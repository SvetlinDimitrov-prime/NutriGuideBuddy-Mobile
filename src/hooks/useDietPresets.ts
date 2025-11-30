import { useMemo } from 'react';
import { useCurrentUserWithDetails } from '@/api/hooks/useUsers';
import type { FoodComponentLabel, Unit } from '@/api/types/mealFoods';
import type { CustomFoodComponentRdiCreateRequest } from '@/api/types/customRdi';

export type DietPresetId = 'balanced' | 'higher_protein' | 'keto' | 'carnivore';

export type DietPreset = {
  id: DietPresetId;
  label: string;
  shortLabel: string;
  description: string;
  note?: string;
  overrides: CustomFoodComponentRdiCreateRequest[];
};

const PROTEIN: FoodComponentLabel = 'PROTEIN';
const CARBS: FoodComponentLabel = 'CARBOHYDRATE';
const FAT: FoodComponentLabel = 'FAT';
const SUGAR: FoodComponentLabel = 'SUGAR';
const FIBER: FoodComponentLabel = 'FIBER';

const G: Unit = 'G';

export function useDietPresets() {
  const { data: user, isLoading, isError, error } = useCurrentUserWithDetails();

  const presets = useMemo<DietPreset[]>(() => {
    if (!user) return [];

    const weightKg = user.kilograms ?? 70;

    const perKg = (gramsPerKg: number) => Math.round(gramsPerKg * weightKg * 10) / 10;

    return [
      {
        id: 'balanced',
        label: 'Balanced (default)',
        shortLabel: 'Balanced',
        description: 'Roughly 50% carbs, 20–25% protein, 25–30% fats.',
        overrides: [],
      },
      {
        id: 'higher_protein',
        label: 'Higher protein',
        shortLabel: 'High protein',
        description: 'More protein while keeping carbs and fats moderate.',
        note: 'Useful if you care about muscle, satiety or body recomposition.',
        overrides: [
          {
            name: PROTEIN,
            unit: G,
            rdiMin: perKg(1.6),
            rdiMax: null,
          },
          {
            name: FIBER,
            unit: G,
            rdiMin: 25,
            rdiMax: null,
          },
        ],
      },
      {
        id: 'keto',
        label: 'Lower carb / keto-style',
        shortLabel: 'Keto-style',
        description: 'Very low carbs, higher fat, solid protein.',
        note: 'Macros are based on common low-carb patterns, not strict medical keto.',
        overrides: [
          {
            name: CARBS,
            unit: G,
            rdiMin: null,
            rdiMax: 50,
          },
          {
            name: PROTEIN,
            unit: G,
            rdiMin: perKg(1.6),
            rdiMax: null,
          },
          {
            name: FAT,
            unit: G,
            rdiMin: null,
            rdiMax: null,
          },
          {
            name: SUGAR,
            unit: G,
            rdiMin: null,
            rdiMax: 20,
          },
        ],
      },
      {
        id: 'carnivore',
        label: 'Mostly animal-based',
        shortLabel: 'Carnivore-style',
        description:
          'Almost all calories from animal foods: high protein, high fat, very low carbs.',
        note: 'This is a tracking preset only. It is not a recommendation and can miss key nutrients.',
        overrides: [
          {
            name: CARBS,
            unit: G,
            rdiMin: null,
            rdiMax: 20,
          },
          {
            name: FIBER,
            unit: G,
            rdiMin: 0,
            rdiMax: null,
          },
          {
            name: PROTEIN,
            unit: G,
            rdiMin: perKg(2.0),
            rdiMax: null,
          },
        ],
      },
    ];
  }, [user]);

  const presetIdFromUser = (() => {
    if (!user?.diet) return 'balanced';
    const match = presets.find((p) => p.id === user.diet);
    return match ? match.id : ('balanced' as DietPresetId);
  })();

  const currentPreset = presets.find((p) => p.id === presetIdFromUser) ?? presets[0] ?? null;

  return {
    presets,
    currentPresetId: presetIdFromUser,
    currentPreset,
    user,
    isLoading,
    isError,
    error,
  };
}
