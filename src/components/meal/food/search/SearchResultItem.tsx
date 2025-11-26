import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import type { OpenFoodFactsFoodShortView } from '@/api/types/openFoodFacts';

type Props = {
  item: OpenFoodFactsFoodShortView;
  isAdding: boolean;
  onPress: () => void;
};

export default function SearchResultItem({ item, isAdding, onPress }: Props) {
  const theme = useTheme() as MD3Theme;
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  return (
    <Pressable
      onPress={onPress}
      disabled={isAdding}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      {item.picture ? (
        <Image source={{ uri: item.picture }} style={styles.itemImage} resizeMode="cover" />
      ) : (
        <View style={styles.itemPlaceholder}>
          <Text style={styles.itemPlaceholderText}>No image</Text>
        </View>
      )}

      <View style={styles.itemTextWrap}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        {!!item.brand && (
          <Text style={styles.itemBrand} numberOfLines={1}>
            {item.brand}
          </Text>
        )}
        <Text style={styles.itemHint}>Tap to add to meal</Text>
      </View>

      <View style={styles.itemRight}>
        {isAdding ? (
          <ActivityIndicator size="small" />
        ) : (
          <IconButton
            icon="plus"
            size={s(18)}
            style={styles.itemPlusBtn}
            iconColor={theme.colors.primary}
            onPress={onPress}
          />
        )}
      </View>
    </Pressable>
  );
}

function makeStyles(
  theme: MD3Theme,
  _bp: { isXL: boolean; isLG: boolean; isMD: boolean; isSM: boolean },
) {
  const outline = theme.colors.outlineVariant;

  return StyleSheet.create({
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: vs(8),
      paddingHorizontal: s(10),
      borderRadius: s(16),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: outline,
      backgroundColor: theme.colors.surface,
      gap: s(10),
    },

    itemPressed: {
      opacity: 0.9,
    },

    itemImage: {
      width: s(44),
      height: s(44),
      borderRadius: s(10),
      backgroundColor: theme.colors.surfaceVariant,
    },

    itemPlaceholder: {
      width: s(44),
      height: s(44),
      borderRadius: s(10),
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },

    itemPlaceholderText: {
      fontSize: ms(10, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    itemTextWrap: {
      flex: 1,
      gap: vs(2),
    },

    itemName: {
      fontSize: ms(14, 0.2),
      fontWeight: '500',
    },

    itemBrand: {
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    itemHint: {
      fontSize: ms(11, 0.2),
      color: theme.colors.onSurfaceVariant,
      opacity: 0.8,
      marginTop: vs(2),
    },

    itemRight: {
      justifyContent: 'center',
      alignItems: 'center',
    },

    itemPlusBtn: {
      margin: 0,
    },
  });
}
