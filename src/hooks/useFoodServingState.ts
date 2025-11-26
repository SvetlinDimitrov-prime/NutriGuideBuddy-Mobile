// src/hooks/useFoodServingState.ts
import type {
  FoodComponentGroup,
  FoodComponentLabel,
  ServingView,
  Unit,
} from '@/api/types/mealFoods';
import { FOOD_COMPONENT_LABEL_DISPLAY, FOOD_COMPONENT_META } from '@/api/utils/foodEnums';
import { useCallback, useEffect, useMemo, useState } from 'react';

type ComponentLike = {
  id?: number;
  group?: FoodComponentGroup;
  name: FoodComponentLabel;
  unit: Unit;
  amount?: number | null;
};

export type FoodForServing = {
  servingUnit?: string | null;
  servingAmount?: number | null;
  servingTotalGrams?: number | null;
  calorieAmount?: number | null;
  calorieUnit?: string | null;
  servings?: ServingView[] | null;
  components?: ComponentLike[] | null;
};

type ComputedTotals = { grams: number; kcal: number };

export function useFoodServingState<T extends FoodForServing | null>(food: T) {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedServing, setSelectedServing] = useState<ServingView | null>(null);
  const [qtyText, setQtyText] = useState('1');

  const resolveBaselineServing = useCallback((f: FoodForServing): ServingView | null => {
    const servings = f.servings ?? [];
    const unit = f.servingUnit ?? undefined;
    const amount = f.servingAmount ?? undefined;

    // 1) exact match by metric + amount
    const exact =
      servings.find((sv) => unit && amount != null && sv.metric === unit && sv.amount === amount) ??
      null;

    if (exact) return exact;

    // 2) virtual baseline from serving* fields
    if (unit) {
      return {
        id: -1,
        metric: unit,
        amount: amount ?? 1,
        gramsTotal: f.servingTotalGrams ?? 0,
      };
    }

    // 3) fallback to first
    return servings[0] ?? null;
  }, []);

  // 🔥 get calories primarily from ENERGY component, fallback to calorieAmount
  const getBaseCalories = (f: FoodForServing | null): number => {
    if (!f) return 0;
    const comps = f.components ?? [];
    const energy = comps.find((c) => c.name === 'ENERGY' && c.unit === 'KCAL');
    if (energy && typeof energy.amount === 'number') {
      return energy.amount;
    }
    return f.calorieAmount ?? 0;
  };

  // reset when food changes
  useEffect(() => {
    if (!food) {
      setSelectedServing(null);
      setQtyText('1');
      return;
    }

    const base = resolveBaselineServing(food);
    setSelectedServing(base);
    setQtyText(String(food.servingAmount ?? base?.amount ?? 1));
  }, [food, resolveBaselineServing]);

  // safe quantity text handler
  const onQtyChangeSafe = (t: string) => {
    let cleaned = t.replace(/[^0-9.,-]/g, '').replace(/-/g, '');
    if (cleaned.trim() === '') {
      setQtyText('');
      return;
    }
    setQtyText(cleaned);
  };

  const qtyNum = useMemo(() => {
    const raw = qtyText.replace(',', '.').trim();
    if (raw === '' || raw === '.') return 0;
    const v = Number(raw);
    return Number.isFinite(v) && v > 0 ? v : 0;
  }, [qtyText]);

  const computed: ComputedTotals = useMemo(() => {
    if (!food || !selectedServing || qtyNum <= 0) return { grams: 0, kcal: 0 };

    const baseAmount = selectedServing.amount || 1;
    const multiplier = baseAmount > 0 ? qtyNum / baseAmount : qtyNum;
    const grams = multiplier * (selectedServing.gramsTotal ?? 0);

    const baseGrams = food.servingTotalGrams ?? 0;
    const baseCalories = getBaseCalories(food);
    const kcalPerGram = baseGrams > 0 ? baseCalories / baseGrams : 0;

    return { grams, kcal: grams * kcalPerGram };
  }, [food, selectedServing, qtyNum]);

  const scaleRatio = useMemo(() => {
    if (!food) return 0;
    if (!editOpen) return 1;
    if (qtyNum <= 0) return 0;

    const baseGrams = food.servingTotalGrams ?? 0;
    if (computed.grams <= 0 || baseGrams <= 0) return 0;

    return computed.grams / baseGrams;
  }, [food, editOpen, qtyNum, computed.grams]);

  const scaledCalories = useMemo(() => {
    if (!food) return 0;
    const baseCalories = getBaseCalories(food);
    return baseCalories * scaleRatio;
  }, [food, scaleRatio]);

  const scaledComponentsAll = useMemo<ComponentLike[]>(() => {
    if (!food) return [];
    const components = food.components ?? [];
    return components.map((c) => {
      const rawScaled = (c.amount ?? 0) * scaleRatio;
      return {
        ...c,
        amount: Number.isFinite(rawScaled) ? Math.max(0, rawScaled) : 0,
      };
    });
  }, [food, scaleRatio]);

  // helper: derive group from component or meta
  const getGroupFor = (c: ComponentLike): FoodComponentGroup => {
    const meta = FOOD_COMPONENT_META[c.name as keyof typeof FOOD_COMPONENT_META];
    return c.group ?? meta?.group ?? 'OTHER';
  };

  // ---- macros: use derived group so it works for both views + OFF ----
  const macros = useMemo(() => {
    if (!food) return { carbs: 0, fats: 0, protein: 0, total: 0 };

    const comps = scaledComponentsAll;

    const sumWhere = (predicate: (c: ComponentLike) => boolean) =>
      comps.filter(predicate).reduce((acc, c) => acc + (c.amount ?? 0), 0);

    const carbs = sumWhere((c) => getGroupFor(c) === 'CARBS');

    const fats = sumWhere((c) => {
      const g = getGroupFor(c);
      return g === 'FATS' || g === 'FATTY_ACIDS';
    });

    const protein = sumWhere((c) => getGroupFor(c) === 'PROTEIN');

    const total = carbs + fats + protein;

    return { carbs, fats, protein, total };
  }, [food, scaledComponentsAll]);

  const macroPercents = useMemo(() => {
    const { carbs, fats, protein, total } = macros;
    if (total <= 0) return { carbsP: 0, fatsP: 0, proteinP: 0 };

    return {
      carbsP: carbs / total,
      fatsP: fats / total,
      proteinP: protein / total,
    };
  }, [macros]);

  // remove energy + headline macros from the accordion list
  const filteredComponents = useMemo(() => {
    return scaledComponentsAll.filter((c) => {
      const label = FOOD_COMPONENT_LABEL_DISPLAY[c.name];
      return !['Energy', 'CARBOHYDRATE', 'FAT', 'PROTEIN'].includes(label);
    });
  }, [scaledComponentsAll]);

  const grouped = useMemo(() => {
    if (!food) return {} as Partial<Record<FoodComponentGroup, ComponentLike[]>>;

    const map: Partial<Record<FoodComponentGroup, ComponentLike[]>> = {};

    for (const c of filteredComponents) {
      const group = getGroupFor(c);
      if (!map[group]) map[group] = [];
      map[group]!.push(c);
    }

    Object.values(map).forEach((arr) => arr?.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0)));

    return map;
  }, [food, filteredComponents]);

  const cancelEdit = () => {
    if (!food) {
      setEditOpen(false);
      return;
    }
    const base = resolveBaselineServing(food);
    setSelectedServing(base);
    setQtyText(String(food.servingAmount ?? base?.amount ?? 1));
    setEditOpen(false);
  };

  return {
    editOpen,
    setEditOpen,
    selectedServing,
    setSelectedServing,
    qtyText,
    onQtyChangeSafe,
    qtyNum,
    computed,
    scaleRatio,
    scaledCalories,
    macros,
    macroPercents,
    grouped,
    cancelEdit,
  };
}
