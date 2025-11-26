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
import { LineChart } from 'react-native-gifted-charts';
import { Surface, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

type Point = {
  date: string;
  value: number;
};

type LegendItem = {
  id: string;
  name: string;
  value: number;
  percent: number;
};

type Props = {
  points: Point[];
  unitLabel?: string;
  emptyText?: string;
  maxLabelChars?: number;
  headerLeftLabel?: string;
  headerMaxChars?: number;
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

function PointerLabel({
  value,
  unitLabel,
  theme,
}: {
  value: number;
  unitLabel: string;
  theme: any;
}) {
  return (
    <Surface
      style={{
        paddingHorizontal: s(8),
        paddingVertical: vs(4),
        borderRadius: s(8),
        backgroundColor: theme.colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.outlineVariant,
      }}
      elevation={0}
    >
      <Text style={{ fontSize: ms(11, 0.2), fontWeight: '800' }}>
        {Math.round(value)} {unitLabel}
      </Text>
    </Surface>
  );
}

type Styles = {
  card: ViewStyle;
  empty: TextStyle;
  axisText: TextStyle;

  legendHeaderRow: ViewStyle;
  legendHeaderLeft: TextStyle;
  legendHeaderRightCol: ViewStyle;
  legendHeaderRight: TextStyle;
  legendHeaderRightSub: TextStyle;

  legendWrap: ViewStyle;
  legendRow: ViewStyle;
  legendName: TextStyle;
  legendRight: ViewStyle;
  legendPct: TextStyle;
  legendVal: TextStyle;
};

export default function TrendLineChart({
  points,
  unitLabel = '',
  emptyText = 'No data.',
  maxLabelChars = 8,
  headerLeftLabel = '',
  headerMaxChars = 18,
}: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = makeStyles(theme);
  const isWeb = Platform.OS === 'web';

  const [chartWidth, setChartWidth] = useState(0);
  const onChartLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setChartWidth(w);
  }, []);

  const basePalette = useMemo(() => buildBasePalette(theme.colors), [theme.colors]);
  const pickColor = useMemo(() => makeColorPicker(basePalette), [basePalette]);

  const { data, legendItems, total, maxValue, avgValue, lineColor } = useMemo(() => {
    const safe = (points ?? [])
      .map((p) => ({
        date: p.date,
        value: clampNonNeg(p.value ?? 0),
      }))
      .filter((p) => Number.isFinite(p.value));

    if (safe.length === 0)
      return {
        data: [],
        legendItems: [] as LegendItem[],
        total: 0,
        maxValue: 0,
        avgValue: 0,
        lineColor: pickColor(0),
      };

    const totalVal = safe.reduce((acc, p) => acc + p.value, 0);
    const maxVal = Math.max(...safe.map((p) => p.value), 0);
    const avgVal = totalVal / safe.length;

    const chartData = safe.map((p, i) => {
      const c = pickColor(i);
      return {
        value: p.value,
        label: truncateLabel(p.date, maxLabelChars),
        dataPointColor: c,
        dataPointRadius: 4,
      };
    });

    const legend: LegendItem[] = safe
      .filter((p) => p.value !== 0)
      .map((p, i) => {
        const pct = totalVal > 0 ? p.value / totalVal : 0;
        return {
          id: `${i}`,
          name: p.date,
          value: p.value,
          percent: pct,
        };
      });

    return {
      data: chartData,
      legendItems: legend,
      total: totalVal,
      maxValue: maxVal,
      avgValue: avgVal,
      lineColor: pickColor(0),
    };
  }, [points, maxLabelChars, pickColor]);

  const yAxisLabelWidth = useMemo(() => {
    const biggest = Math.ceil(maxValue * 1.1);
    const sample = `${biggest}`;
    const perChar = s(5.4);
    const raw = sample.length * perChar;
    return Math.max(s(30), Math.min(s(64), raw));
  }, [maxValue]);

  const phoneScale = !isWeb && bp.isSM ? 1.6 : 1;
  const { spacing, initialSpacing, endSpacing, chartCanvasWidth, needsOuterScroll } =
    useMemo(() => {
      const n = data.length;

      const baseGap = bp.isSM ? s(34) : s(40);
      const gap = baseGap * phoneScale;

      if (!chartWidth || n === 0) {
        return {
          spacing: gap,
          initialSpacing: gap,
          endSpacing: gap,
          chartCanvasWidth: undefined,
          needsOuterScroll: false,
        };
      }

      const contentWidth = n * gap + gap * 2;
      const availableWidth = isWeb ? Math.max(0, chartWidth - yAxisLabelWidth - s(12)) : chartWidth;

      const needs = contentWidth > availableWidth;

      return {
        spacing: gap,
        initialSpacing: gap,
        endSpacing: gap,
        chartCanvasWidth: needs ? contentWidth : undefined,
        needsOuterScroll: needs,
      };
    }, [chartWidth, data.length, bp.isSM, isWeb, phoneScale, yAxisLabelWidth]);

  const safeHeaderLeft = truncateLabel(headerLeftLabel, headerMaxChars);

  const pointerLabelComponent = useCallback(
    (items: any[]) => {
      const val = items?.[0]?.value ?? 0;
      return <PointerLabel value={val} unitLabel={unitLabel} theme={theme} />;
    },
    [theme, unitLabel],
  );

  const ChartBody = (
    <LineChart
      data={data}
      thickness={2.4}
      color={lineColor}
      curved
      hideRules={false}
      rulesColor={theme.colors.outlineVariant}
      yAxisColor={theme.colors.outlineVariant}
      xAxisColor={theme.colors.outlineVariant}
      yAxisTextStyle={styles.axisText}
      xAxisLabelTextStyle={styles.axisText}
      yAxisLabelWidth={yAxisLabelWidth}
      noOfSections={4}
      maxValue={maxValue * 1.1}
      spacing={spacing}
      initialSpacing={initialSpacing}
      endSpacing={endSpacing}
      isAnimated
      animationDuration={500}
      focusEnabled
      showDataPointOnFocus
      dataPointsColor={lineColor}
      dataPointsRadius={4}
      pointerConfig={{
        pointerStripColor: theme.colors.outlineVariant,
        pointerStripWidth: 1,
        pointerColor: lineColor,
        radius: 4,
        pointerLabelWidth: s(80),
        pointerLabelHeight: vs(40),
        pointerLabelComponent,
      }}
      disableScroll
      width={chartCanvasWidth}
      height={bp.isSM ? vs(190) : vs(220)}
      areaChart
      startFillColor={isHex(lineColor) ? hexToRgba(lineColor, 0.25) : lineColor}
      endFillColor="transparent"
      startOpacity={0.9}
      endOpacity={0.1}
    />
  );

  return (
    <Surface style={styles.card} elevation={0}>
      {data.length === 0 ? (
        <Text style={styles.empty}>{emptyText}</Text>
      ) : (
        <>
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

          <View style={styles.legendHeaderRow}>
            <Text style={styles.legendHeaderLeft} numberOfLines={1} ellipsizeMode="tail">
              {safeHeaderLeft}
            </Text>

            <View style={styles.legendHeaderRightCol}>
              <Text style={styles.legendHeaderRight} numberOfLines={1} ellipsizeMode="tail">
                Total: {Math.round(total)} {unitLabel}
              </Text>
              <Text style={styles.legendHeaderRightSub} numberOfLines={1} ellipsizeMode="tail">
                Avg: {Math.round(avgValue)} {unitLabel}
              </Text>
            </View>
          </View>

          <View style={styles.legendWrap}>
            {legendItems.map((li) => (
              <View key={li.id} style={styles.legendRow}>
                <Text numberOfLines={1} style={styles.legendName}>
                  {li.name}
                </Text>

                <View style={styles.legendRight}>
                  <Text style={styles.legendPct}>{Math.round(li.percent * 100)}%</Text>
                  <Text style={styles.legendVal}>
                    {Math.round(li.value)} {unitLabel}
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
      paddingTop: s(14),
      paddingBottom: s(14),
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
    legendHeaderRightCol: {
      flexShrink: 0,
      alignItems: 'flex-end',
      gap: vs(2),
    },
    legendHeaderRight: {
      fontSize: ms(11, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.95,
    },
    legendHeaderRightSub: {
      fontSize: ms(10, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.9,
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
    legendVal: {
      fontSize: ms(11, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurfaceVariant,
      minWidth: s(70),
      textAlign: 'right',
    },
  });
}
