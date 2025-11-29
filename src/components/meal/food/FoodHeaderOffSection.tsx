import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { router } from 'expo-router';
import { Platform, StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';
import type { MealFoodView } from '@/api/types/mealFoods';
import { FoodTierInline } from '@/components/meal/food/FoodTierInline';

type Props = {
  name?: string;
  disabled?: boolean;
  onEditToggle: () => void;
  onAdd: () => void;
  food?: Partial<MealFoodView> | null;
};

export function FoodHeaderOffSection({ name, disabled, onEditToggle, onAdd, food }: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  return (
    <View style={styles.headerBlock}>
      <View style={styles.titleRow}>
        <View style={styles.titleCol}>
          <Text
            variant="headlineSmall"
            numberOfLines={2}
            ellipsizeMode="tail"
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={styles.foodTitle}
          >
            {name ?? 'Food'}
          </Text>

          <FoodTierInline food={food} />
        </View>

        <View style={styles.actionsRow}>
          <IconButton
            icon="square-edit-outline"
            onPress={onEditToggle}
            disabled={disabled}
            size={styles.actionIconSize}
            style={styles.actionBtn}
            iconColor={theme.colors.onSurface}
            accessibilityLabel="Edit serving"
          />
          <IconButton
            icon="plus"
            onPress={onAdd}
            disabled={disabled}
            size={styles.actionIconSize}
            style={styles.actionBtn}
            iconColor={theme.colors.primary}
            accessibilityLabel="Add food"
          />
          <IconButton
            icon="close"
            onPress={() => router.back()}
            size={styles.actionIconSize}
            style={styles.actionBtn}
            iconColor={theme.colors.onSurface}
            accessibilityLabel="Close"
          />
        </View>
      </View>
    </View>
  );
}

function makeStyles(theme: MD3Theme, bp: any) {
  const isSmall = bp.isSM || bp.isMD;
  const isWeb = Platform.OS === 'web';

  const actionIconSize = isSmall ? s(18) : isWeb ? s(16) : s(18);
  const actionBtnBox = isSmall ? s(32) : isWeb ? s(28) : s(32);

  const titleFontSize = isSmall ? ms(18, 0.2) : ms(22, 0.2);
  const titleLineHeight = isSmall ? ms(22, 0.2) : ms(26, 0.2);

  type Styles = {
    headerBlock: ViewStyle;
    titleRow: ViewStyle;
    titleCol: ViewStyle;
    foodTitle: TextStyle;
    actionsRow: ViewStyle;
    actionBtn: ViewStyle;
  };

  const isAndroid = Platform.OS === 'android';

  const sheet = StyleSheet.create<Styles>({
    headerBlock: {
      gap: vs(6),
      marginBottom: vs(6),
    },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(8),
    },

    titleCol: {
      flex: 1,
      minWidth: 0,
      flexShrink: 1,
      gap: vs(2),
    },

    foodTitle: {
      fontSize: titleFontSize,
      lineHeight: titleLineHeight,
      ...(isAndroid
        ? ({
            includeFontPadding: false,
            textAlignVertical: 'center',
          } as TextStyle)
        : null),
    },

    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      flexShrink: 0,
    },

    actionBtn: {
      margin: 0,
      width: actionBtnBox,
      height: actionBtnBox,
      borderRadius: s(10),
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outlineVariant,
    },
  });

  return { ...sheet, actionIconSize };
}
