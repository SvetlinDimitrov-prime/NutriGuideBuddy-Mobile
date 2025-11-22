import type { MealFoodShortView } from '@/api/types/meals';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

function truncate(text: string, max = 28) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

type Props = {
  mealId: number;
  food: MealFoodShortView;
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

  return (
    <Pressable
      onPress={openFoodModal}
      disabled={loading}
      style={({ pressed }) => [styles.foodRow, pressed ? styles.foodRowPressed : null]}
    >
      <Text style={styles.foodName} numberOfLines={1} ellipsizeMode="tail">
        {truncate(food.name, twoCols ? 42 : 26)}
      </Text>

      <View style={styles.foodRight}>
        <Text style={styles.foodCalories}>{(food.calories ?? 0).toFixed(0)} kcal</Text>
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
    foodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: vs(6),
      borderRadius: s(6),
    },

    foodRowPressed: {
      backgroundColor: theme.colors.surfaceVariant,
      opacity: 0.7,
    },

    foodName: {
      flex: 1,
      paddingRight: s(8),
      fontSize: isSmall ? ms(15, 0.2) : ms(14, 0.2),
      lineHeight: isSmall ? ms(20, 0.2) : ms(18, 0.2),
      fontWeight: Platform.OS === 'ios' ? '500' : '600',
    },

    foodRight: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
    },

    foodCalories: {
      fontSize: isSmall ? ms(14, 0.2) : ms(13, 0.2),
      lineHeight: isSmall ? ms(20, 0.2) : ms(18, 0.2),
      color: theme.colors.onSurfaceVariant,
      marginRight: s(2),
    },
  });
}
