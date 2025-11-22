import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

type Props = {
  servingText: string;
  kcalText: string;
  macros: { carbs: number; fats: number; protein: number; total: number };
  macroPercents: { carbsP: number; fatsP: number; proteinP: number };
};

export function ServingMacroCard({ servingText, kcalText, macros, macroPercents }: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  if (macros.total <= 0) {
    return <Text style={styles.statusTextSmall}>No macro data for this food.</Text>;
  }

  const showHeader = !!servingText || !!kcalText;

  return (
    <View style={styles.macroCard}>
      {showHeader && (
        <View style={styles.macroHeaderRow}>
          {!!servingText && <Text style={styles.macroHeaderTitle}>{servingText}</Text>}
          {!!kcalText && <Text style={styles.macroHeaderKcal}>{kcalText}</Text>}
        </View>
      )}

      <View style={styles.macroBar}>
        <View
          style={[
            styles.macroSeg,
            { flex: macroPercents.carbsP, backgroundColor: theme.colors.primary },
          ]}
        />
        <View
          style={[
            styles.macroSeg,
            { flex: macroPercents.fatsP, backgroundColor: theme.colors.tertiary },
          ]}
        />
        <View
          style={[
            styles.macroSeg,
            { flex: macroPercents.proteinP, backgroundColor: theme.colors.secondary },
          ]}
        />
      </View>

      <View style={styles.macroLegend}>
        <Text style={styles.legendItem}>Carbs {macros.carbs.toFixed(1)}g</Text>
        <Text style={styles.legendItem}>Fats {macros.fats.toFixed(1)}g</Text>
        <Text style={styles.legendItem}>Protein {macros.protein.toFixed(1)}g</Text>
      </View>
    </View>
  );
}

function makeStyles(theme: MD3Theme, _: any) {
  type Styles = {
    macroCard: ViewStyle;
    macroHeaderRow: ViewStyle;
    macroHeaderTitle: TextStyle;
    macroHeaderKcal: TextStyle;
    macroBar: ViewStyle;
    macroSeg: ViewStyle;
    macroLegend: ViewStyle;
    legendItem: TextStyle;
    statusTextSmall: TextStyle;
  };

  return StyleSheet.create<Styles>({
    macroCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: s(12),
      padding: s(12),
      gap: vs(8),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outlineVariant,
    },

    macroHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: s(8),
    },
    macroHeaderTitle: {
      fontSize: ms(12, 0.2),
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      flexShrink: 1,
    },
    macroHeaderKcal: {
      fontSize: ms(12, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurface,
      flexShrink: 0,
    },

    macroBar: {
      flexDirection: 'row',
      height: vs(14),
      borderRadius: s(999),
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceVariant,
    },
    macroSeg: { height: '100%' },

    macroLegend: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: s(6),
    },
    legendItem: {
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    statusTextSmall: {
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurfaceVariant,
    },
  });
}
