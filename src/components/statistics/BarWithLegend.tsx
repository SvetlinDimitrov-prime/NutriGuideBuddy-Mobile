import { useBreakpoints } from '@/theme/responsive';
import { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Surface, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

type Entry = {
  id: string;
  name: string;
  kcal: number;
};

type LegendItem = {
  id: string;
  name: string;
  kcal: number;
  percent: number;
  color: string;
};

type Props = {
  entries: Entry[];
  legendLeftLabel?: string; // "Meals" or meal name
  unitLabel?: string; // default "kcal"
  emptyText?: string; // shown when no entries
  maxLabelChars?: number; // x-axis truncation, default 9
  headerMaxChars?: number; // safety for header left text
};

const clampNonNeg = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);

// ✅ stable fallback palette
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

const truncateLabel = (label: string, max = 9) =>
  label.length > max ? `${label.slice(0, max - 1)}…` : label;

type Styles = {
  card: ViewStyle;
  empty: TextStyle;
  axisText: TextStyle;

  legendHeaderRow: ViewStyle;
  legendHeaderLeft: TextStyle;
  legendHeaderRight: TextStyle;

  legendWrap: ViewStyle;
  legendRow: ViewStyle;
  legendDot: ViewStyle;
  legendName: TextStyle;
  legendRight: ViewStyle;
  legendPct: TextStyle;
  legendKcal: TextStyle;
};

export function BarWithLegend({
  entries,
  legendLeftLabel = '',
  unitLabel = 'kcal',
  emptyText = 'No data.',
  maxLabelChars = 9,
  headerMaxChars = 18,
}: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = makeStyles(theme);
  const isWeb = Platform.OS === 'web';

  // measure available width
  const [chartWidth, setChartWidth] = useState(0);
  const onChartLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setChartWidth(w);
  }, []);

  const basePalette = useMemo(() => buildBasePalette(theme.colors), [theme.colors]);
  const pickColor = useMemo(() => makeColorPicker(basePalette), [basePalette]);

  const { items, legendItems, total, maxKcal } = useMemo(() => {
    const safe = (entries ?? [])
      .map((e) => ({
        id: String(e.id),
        name: e.name ?? 'Item',
        kcal: clampNonNeg(e.kcal ?? 0),
      }))
      .filter((e) => e.kcal > 0);

    const totalKcal = safe.reduce((acc, e) => acc + e.kcal, 0);
    if (totalKcal <= 0) {
      return { items: [], legendItems: [] as LegendItem[], total: 0, maxKcal: 0 };
    }

    const sorted = [...safe].sort((a, b) => b.kcal - a.kcal);

    const bars = sorted.map((e, i) => {
      const color = pickColor(i);
      return {
        value: e.kcal,
        label: truncateLabel(e.name, maxLabelChars),
        frontColor: color,
      };
    });

    const legend: LegendItem[] = sorted.map((e, i) => {
      const color = pickColor(i);
      const percent = e.kcal / totalKcal;
      return { id: e.id, name: e.name, kcal: e.kcal, percent, color };
    });

    const max = Math.max(...sorted.map((e) => e.kcal), 0);

    return { items: bars, legendItems: legend, total: totalKcal, maxKcal: max };
  }, [entries, pickColor, maxLabelChars]);

  // y-axis width so numbers never truncate
  const yAxisLabelWidth = useMemo(() => {
    const biggest = Math.ceil(maxKcal * 1.1);
    const sample = `${biggest}`;
    const perChar = s(5.4);
    const raw = sample.length * perChar;
    return Math.max(s(30), Math.min(s(64), raw));
  }, [maxKcal]);

  // ✅ CONSTANT bar sizing (no more shrinking)
  const phoneBarScale = !isWeb && bp.isSM ? 2 : 1;

  const { barWidth, spacing, initialSpacing, endSpacing, chartCanvasWidth, needsOuterScroll } =
    useMemo(() => {
      const n = items.length;

      // base constant sizes
      const baseBW = isWeb ? (bp.isSM ? s(18) : s(24)) : bp.isSM ? s(22) : s(28);
      const baseGap = bp.isSM ? s(6) : s(8);

      const bw = baseBW * phoneBarScale;
      const gap = baseGap * phoneBarScale;

      if (!chartWidth || n === 0) {
        return {
          barWidth: bw,
          spacing: gap,
          initialSpacing: gap,
          endSpacing: gap,
          chartCanvasWidth: undefined,
          needsOuterScroll: false,
        };
      }

      const contentWidth = n * bw + (n + 1) * gap;

      // ✅ WEB-ONLY FIX:
      // on web the Y axis eats into the drawable width, so subtract it.
      // also subtract a small safety gutter to handle rounding / internal padding.
      const availableWidth = isWeb ? Math.max(0, chartWidth - yAxisLabelWidth - s(12)) : chartWidth;

      const needs = contentWidth > availableWidth;

      return {
        barWidth: bw,
        spacing: gap,
        initialSpacing: gap,
        endSpacing: gap,
        chartCanvasWidth: needs ? contentWidth : undefined,
        needsOuterScroll: needs,
      };
    }, [chartWidth, items.length, bp.isSM, isWeb, phoneBarScale, yAxisLabelWidth]);

  const safeHeaderLeft = truncateLabel(legendLeftLabel, headerMaxChars);

  const ChartBody = (
    <BarChart
      data={items}
      barWidth={barWidth}
      spacing={spacing}
      initialSpacing={initialSpacing}
      endSpacing={endSpacing}
      roundedTop
      roundedBottom={false}
      hideRules={false}
      rulesColor={theme.colors.outlineVariant}
      yAxisColor={theme.colors.outlineVariant}
      xAxisColor={theme.colors.outlineVariant}
      yAxisTextStyle={styles.axisText}
      xAxisLabelTextStyle={styles.axisText}
      yAxisLabelWidth={yAxisLabelWidth}
      yAxisTextNumberOfLines={1}
      noOfSections={4}
      maxValue={maxKcal * 1.1}
      isAnimated
      animationDuration={500}
      showValuesAsTopLabel={false}
      // ✅ outer scroll is responsible now
      disableScroll
      showScrollIndicator={false}
      width={chartCanvasWidth}
      height={bp.isSM ? vs(190) : vs(220)}
    />
  );

  return (
    <Surface style={styles.card} elevation={0}>
      {items.length === 0 ? (
        <Text style={styles.empty}>{emptyText}</Text>
      ) : (
        <>
          {/* chart container */}
          <View onLayout={onChartLayout} style={{ width: '100%', overflow: 'hidden' }}>
            {needsOuterScroll ? (
              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator
                contentContainerStyle={{ paddingRight: s(4) }}
                style={{ width: '100%' }}
              >
                {ChartBody}
              </ScrollView>
            ) : (
              ChartBody
            )}
          </View>

          {/* Legend header with total (safe) */}
          <View style={styles.legendHeaderRow}>
            <Text style={styles.legendHeaderLeft} numberOfLines={1} ellipsizeMode="tail">
              {safeHeaderLeft}
            </Text>

            <Text style={styles.legendHeaderRight} numberOfLines={1} ellipsizeMode="tail">
              Total: {Math.round(total)} {unitLabel}
            </Text>
          </View>

          {/* Legend rows */}
          <View style={styles.legendWrap}>
            {legendItems.map((li) => (
              <View key={li.id} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: li.color }]} />
                <Text numberOfLines={1} style={styles.legendName}>
                  {li.name}
                </Text>

                <View style={styles.legendRight}>
                  <Text style={styles.legendPct}>{Math.round(li.percent * 100)}%</Text>
                  <Text style={styles.legendKcal}>
                    {Math.round(li.kcal)} {unitLabel}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </Surface>
  );
}

function makeStyles(theme: any) {
  return StyleSheet.create<Styles>({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: s(14),
      padding: s(14),
      gap: vs(8),
      width: '100%',
    },

    empty: {
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    axisText: {
      fontSize: ms(10, 0.2),
      color: theme.colors.onSurfaceVariant,
      fontWeight: '600',
    },

    legendHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginTop: vs(2),
      marginBottom: vs(4),
      gap: s(8),
    },
    legendHeaderLeft: {
      flex: 1,
      flexShrink: 1,
      fontSize: ms(11, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurface,
      opacity: 0.9,
    },
    legendHeaderRight: {
      flexShrink: 0,
      fontSize: ms(11, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.95,
    },

    legendWrap: {
      flexDirection: 'column',
      gap: vs(6),
    },

    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      paddingVertical: vs(2),
    },

    legendDot: {
      width: s(10),
      height: s(10),
      borderRadius: s(5),
    },

    legendName: {
      flex: 1,
      fontSize: ms(11, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurface,
      opacity: 0.95,
    },

    legendRight: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: s(8),
    },

    legendPct: {
      fontSize: ms(11, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurface,
      opacity: 0.9,
      minWidth: s(36),
      textAlign: 'right',
    },

    legendKcal: {
      fontSize: ms(11, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurfaceVariant,
      minWidth: s(70),
      textAlign: 'right',
    },
  });
}
