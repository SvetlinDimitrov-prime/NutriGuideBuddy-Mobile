import { useBreakpoints } from '@/theme/responsive';
import { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { Surface, Text, useTheme, TouchableRipple } from 'react-native-paper';
import { s, vs, ms } from 'react-native-size-matters';
import type { MealConsumedView } from '@/api/types/tracker';

type Props = {
  meals: MealConsumedView[];
  onMealPress?: (meal: MealConsumedView) => void;
};

const clampNonNeg = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);

// ✅ stable nice-looking fallback (never black)
const DEFAULT_PALETTE = [
  '#C7B8FF',
  '#9AD3FF',
  '#A6F4C5',
  '#FFE29A',
  '#FFB4C1',
  '#F7B0FF',
  '#BFE7FF',
  '#D9F99D',
  '#FFCFA8',
  '#BDB2FF',
];

// ---------- color utils ----------
const isHex = (c?: string) => !!c && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c);
const isRgb = (c?: string) => !!c && /^rgba?\(/.test(c);

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((x) => x + x)
          .join('')
      : clean;
  const num = parseInt(full, 16);

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ✅ handles hex OR rgb/rgba
const withAlpha = (color: string, alpha: number) => {
  if (isHex(color)) return hexToRgba(color, alpha);
  if (isRgb(color)) {
    // replace existing alpha or add one
    const hasAlpha = color.startsWith('rgba');
    if (hasAlpha) {
      return color.replace(/rgba\(([^)]+),\s*([01]?\.?\d+)\)/, (_m, body) => {
        return `rgba(${body}, ${alpha})`;
      });
    }
    // rgb(...)
    return color.replace(/rgb\(([^)]+)\)/, (_m, body) => `rgba(${body}, ${alpha})`);
  }
  return color; // fallback
};

const buildBasePalette = (themeColors: any) => {
  const c = themeColors ?? {};
  const candidates = [
    c.primary,
    c.secondary,
    c.tertiary,
    c.error,
    c.primaryContainer,
    c.secondaryContainer,
    c.tertiaryContainer,
    c.inversePrimary,
  ]
    .filter((x: any) => typeof x === 'string')
    .filter((x: string) => isHex(x) || isRgb(x));

  return candidates.length > 0 ? candidates : DEFAULT_PALETTE;
};

const makeColorPicker = (base: string[]) => {
  const alphaSteps = [1, 0.82, 0.65, 0.5, 0.38];

  return (index: number) => {
    const baseIdx = index % base.length;
    const wrap = Math.floor(index / base.length);
    const color = base[baseIdx];

    if (wrap === 0) return color;

    const alpha = alphaSteps[Math.min(wrap, alphaSteps.length - 1)];
    if (isHex(color)) return hexToRgba(color, alpha);

    const fallback = DEFAULT_PALETTE[baseIdx % DEFAULT_PALETTE.length];
    return hexToRgba(fallback, alpha);
  };
};

export function MealsCaloriesBar({ meals, onMealPress }: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = makeStyles(theme, bp);

  const basePalette = useMemo(() => buildBasePalette(theme.colors), [theme.colors]);
  const pickColor = useMemo(() => makeColorPicker(basePalette), [basePalette]);

  const ripple = useMemo(() => withAlpha(theme.colors.primary, 0.12), [theme.colors.primary]);

  const { items, total } = useMemo(() => {
    const safeMeals = (meals ?? [])
      .map((m) => ({
        id: String(m.id),
        name: m.name ?? 'Meal',
        kcal: clampNonNeg(m.amount ?? 0),
        source: m,
      }))
      .filter((m) => m.kcal > 0);

    const totalKcal = safeMeals.reduce((acc, m) => acc + m.kcal, 0);
    if (totalKcal <= 0) return { items: [], total: 0 };

    const withPct = safeMeals
      .map((m, i) => ({
        ...m,
        percent: m.kcal / totalKcal,
        color: pickColor(i),
      }))
      .sort((a, b) => b.kcal - a.kcal);

    return { items: withPct, total: totalKcal };
  }, [meals, pickColor]);

  return (
    <Surface style={styles.card} elevation={0}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Calories by meal</Text>
        <Text style={styles.totalText}>{total.toFixed(0)} kcal</Text>
      </View>

      {items.length === 0 ? (
        <Text style={styles.empty}>No meals logged for this day.</Text>
      ) : (
        <>
          <View style={styles.stackedTrack}>
            {items.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.segment,
                  {
                    backgroundColor: m.color,
                    flexGrow: m.kcal,
                    flexBasis: 0,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.legendGrid}>
            {items.map((m) => (
              <TouchableRipple
                key={m.id}
                onPress={() => onMealPress?.(m.source)}
                rippleColor={ripple}
                style={styles.legendRow}
                accessibilityRole="button"
              >
                <View style={styles.legendRowInner}>
                  <View style={[styles.dot, { backgroundColor: m.color }]} />
                  <View style={styles.legendTextCol}>
                    <Text style={styles.legendLabel} numberOfLines={1}>
                      {m.name}
                    </Text>
                    <Text style={styles.legendSub}>
                      {m.kcal.toFixed(0)} kcal • {Math.round(m.percent * 100)}%
                    </Text>
                  </View>

                  <Text style={styles.tapHint}>Tap</Text>
                </View>
              </TouchableRipple>
            ))}
          </View>
        </>
      )}
    </Surface>
  );
}

function makeStyles(theme: any, bp: any) {
  const isWide = bp.isLG || bp.isXL || Platform.OS === 'web';

  type Styles = {
    card: ViewStyle;
    headerRow: ViewStyle;
    title: TextStyle;
    totalText: TextStyle;
    empty: TextStyle;

    stackedTrack: ViewStyle;
    segment: ViewStyle;

    legendGrid: ViewStyle;
    legendRow: ViewStyle;
    legendRowInner: ViewStyle;
    dot: ViewStyle;
    legendTextCol: ViewStyle;
    legendLabel: TextStyle;
    legendSub: TextStyle;
    tapHint: TextStyle;
  };

  return StyleSheet.create<Styles>({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: s(14),
      padding: s(14),
      gap: vs(12),
      width: '100%',
    },

    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },

    title: {
      fontSize: ms(15, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    totalText: {
      fontSize: ms(12, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurfaceVariant,
    },

    empty: {
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    stackedTrack: {
      height: bp.isSM ? vs(14) : vs(18),
      borderRadius: vs(18),
      overflow: 'hidden',
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceVariant,
    },
    segment: { height: '100%' },

    legendGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: vs(10),
      width: '100%',
    },

    legendRow: {
      width: isWide ? '33%' : '48%',
      minWidth: s(140),
      borderRadius: s(10),
      paddingVertical: vs(6),
      paddingHorizontal: s(8),
      backgroundColor: theme.colors.surface,
      ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : null),
    },

    legendRowInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
    },

    dot: {
      width: s(10),
      height: s(10),
      borderRadius: s(5),
      flexShrink: 0,
    },
    legendTextCol: { flex: 1, gap: vs(2) },

    legendLabel: {
      fontSize: ms(13, 0.2),
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    legendSub: {
      fontSize: ms(11, 0.2),
      color: theme.colors.onSurfaceVariant,
      fontWeight: '600',
    },

    tapHint: {
      fontSize: ms(10, 0.2),
      color: theme.colors.onSurfaceVariant,
      fontWeight: '700',
      opacity: 0.7,
      paddingLeft: s(4),
    },
  });
}
