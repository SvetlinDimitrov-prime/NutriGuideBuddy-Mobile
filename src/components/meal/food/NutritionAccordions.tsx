import type { FoodComponentGroup } from '@/api/types/mealFoods';
import { FOOD_COMPONENT_LABEL_DISPLAY, UNIT_SYMBOL } from '@/api/utils/foodEnums';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { useMemo, useState } from 'react';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { List, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

const GROUP_TITLES: Record<FoodComponentGroup, string> = {
  OTHER: 'Other',
  CARBS: 'Carbohydrates',
  FATS: 'Fats',
  FATTY_ACIDS: 'Fatty acids',
  PROTEIN: 'Protein',
  VITAMINS: 'Vitamins',
  AMINO_ACIDS: 'Amino acids',
  MINERALS: 'Minerals',
};

const GROUPS: FoodComponentGroup[] = [
  'OTHER',
  'CARBS',
  'FATS',
  'FATTY_ACIDS',
  'PROTEIN',
  'VITAMINS',
  'AMINO_ACIDS',
  'MINERALS',
];

// minimal shape we need from a nutrient entry
type NutrientLike = {
  id?: number | string;
  name: string; // FoodComponentLabel in practice
  unit: string;
  amount?: number | null;
};

type Props = {
  grouped: Partial<Record<FoodComponentGroup, NutrientLike[]>>;
};

const clampNonNeg = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);

const getAdaptiveDecimals = (val: number) => {
  if (val >= 1) return 2;
  if (val >= 0.1) return 3;
  if (val >= 0.01) return 4;
  if (val >= 0.001) return 5;
  if (val >= 0.0001) return 6;
  return 7;
};

const formatAmount = (amount: number, unit: string) => {
  const v = clampNonNeg(amount);
  const decimals = v === 0 ? 2 : getAdaptiveDecimals(v);
  const fixed = v.toFixed(decimals);

  const symbol = UNIT_SYMBOL[unit as keyof typeof UNIT_SYMBOL] ?? unit;
  return `${fixed} ${symbol}`;
};

export function NutritionAccordions({ grouped }: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const [expanded, setExpanded] = useState<Partial<Record<FoodComponentGroup, boolean>>>({});

  const toggleGroup = (g: FoodComponentGroup) =>
    setExpanded((prev) => ({ ...prev, [g]: !prev[g] }));

  const visibleGroups = useMemo(
    () => GROUPS.filter((g) => (grouped[g]?.length ?? 0) > 0),
    [grouped],
  );

  return (
    <>
      {visibleGroups.map((g) => {
        const items = grouped[g]!;
        const count = items.length;
        const isOpen = !!expanded[g];

        return (
          <List.Accordion
            key={g}
            title={`${GROUP_TITLES[g]} (${count})`}
            style={styles.accordion}
            expanded={isOpen}
            onPress={() => toggleGroup(g)}
            titleStyle={[
              styles.accordionTitle,
              { color: isOpen ? theme.colors.primary : theme.colors.onSurface },
            ]}
          >
            {items.map((c, idx) => (
              <View
                key={String(c.id ?? `${c.name}-${idx}`)}
                style={[styles.nutrientRow, idx === 0 && styles.nutrientRowFirst]}
              >
                <Text style={styles.nutrientName} numberOfLines={1} ellipsizeMode="tail">
                  {FOOD_COMPONENT_LABEL_DISPLAY[
                    c.name as keyof typeof FOOD_COMPONENT_LABEL_DISPLAY
                  ] ?? c.name}
                </Text>
                <Text style={styles.nutrientVal} numberOfLines={1} ellipsizeMode="tail">
                  {formatAmount(c.amount ?? 0, c.unit)}
                </Text>
              </View>
            ))}
          </List.Accordion>
        );
      })}
    </>
  );
}

function makeStyles(theme: MD3Theme) {
  type Styles = {
    accordion: ViewStyle;
    accordionTitle: TextStyle;
    nutrientRow: ViewStyle;
    nutrientRowFirst: ViewStyle;
    nutrientName: TextStyle;
    nutrientVal: TextStyle;
  };

  return StyleSheet.create<Styles>({
    accordion: {
      backgroundColor: theme.colors.surface,
      borderRadius: s(10),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outlineVariant,
      overflow: 'hidden',
    },

    accordionTitle: {
      fontWeight: '600',
      fontSize: ms(14, 0.2),
    },

    nutrientRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: s(14),
      paddingVertical: vs(6),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.outlineVariant,
      gap: s(8),
    },
    nutrientRowFirst: { borderTopWidth: 0 },

    nutrientName: {
      flex: 1,
      fontSize: ms(13, 0.2),
    },
    nutrientVal: {
      fontSize: ms(13, 0.2),
      color: theme.colors.onSurfaceVariant,
      flexShrink: 0,
    },
  });
}
