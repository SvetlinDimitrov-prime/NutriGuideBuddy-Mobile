import type { MealFoodView } from '@/api/types/mealFoods';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';
import FoodTierBadge from '../FoodTierBadge'; // adjust path if needed

function truncate(text: string, max = 28) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

type Props = {
  mealId: number;
  food: MealFoodView;
  twoCols: boolean;
  loading?: boolean;
};

export default function FoodRow({ mealId, food, twoCols, loading = false }: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const openFoodModal = () => {
    if (loading) return;

    router.push({
      pathname: '/home/meal/[mealId]/food/[foodId]',
      params: { mealId: String(mealId), foodId: String(food.id) },
    });
  };

  const findAmount = (name: 'CARBOHYDRATE' | 'FAT' | 'PROTEIN'): number => {
    const comp = food.components?.find((c) => c.name === name);
    return comp?.amount ?? 0;
  };

  const carbs = findAmount('CARBOHYDRATE');
  const fats = findAmount('FAT');
  const protein = findAmount('PROTEIN');
  const macroTotal = carbs + fats + protein;

  let macroSummary: string | null = null;
  if (macroTotal > 0.0001) {
    const cPct = Math.round((carbs / macroTotal) * 100);
    const fPct = Math.round((fats / macroTotal) * 100);
    const pPct = Math.round((protein / macroTotal) * 100);
    macroSummary = `C ${cPct}% • P ${pPct}% • F ${fPct}%`;
  }

  return (
    <Pressable
      onPress={openFoodModal}
      disabled={loading}
      style={({ pressed }) => [styles.rowContainer, pressed && styles.rowPressed]}
    >
      <View style={styles.rowInner}>
        {/* LEFT – name + tiny macro ratio text */}
        <View style={styles.leftColumn}>
          <Text style={styles.foodName} numberOfLines={1} ellipsizeMode="tail">
            {truncate(food.name, twoCols ? 42 : 26)}
          </Text>

          {macroSummary && <Text style={styles.macroSummary}>{macroSummary}</Text>}
        </View>

        {/* RIGHT – kcal + tier badge (badge computes tier itself) */}
        <View style={styles.rightColumn}>
          <Text style={styles.kcalText}>{food.calorieAmount.toFixed(0)} kcal</Text>
          <FoodTierBadge food={food} />
        </View>
      </View>
    </Pressable>
  );
}

function makeStyles(
  theme: MD3Theme,
  bp: { isXL: boolean; isLG: boolean; isMD: boolean; isSM: boolean },
) {
  const isSmall = bp.isSM || bp.isMD;

  return StyleSheet.create({
    rowContainer: {
      paddingVertical: vs(6),
      borderRadius: s(6),
    },

    rowPressed: {
      backgroundColor: theme.colors.surfaceVariant,
      opacity: 0.8,
    },

    rowInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(8),
    },

    leftColumn: {
      flex: 1,
      paddingRight: s(8),
    },

    foodName: {
      fontSize: isSmall ? ms(15, 0.2) : ms(14, 0.2),
      lineHeight: isSmall ? ms(20, 0.2) : ms(18, 0.2),
      fontWeight: Platform.OS === 'ios' ? '500' : '600',
    },

    macroSummary: {
      marginTop: vs(1),
      fontSize: ms(11, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    rightColumn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      flexShrink: 0,
    },

    kcalText: {
      fontSize: isSmall ? ms(13, 0.2) : ms(12.5, 0.2),
      color: theme.colors.onSurfaceVariant,
    },
  });
}
