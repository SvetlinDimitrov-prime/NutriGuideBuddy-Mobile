import { useBreakpoints } from '@/theme/responsive';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

export type Granularity = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

type Props = {
  startDate: Date;
  endDate: Date;
  onChangeStart: (d: Date) => void;
  onChangeEnd: (d: Date) => void;

  granularity: Granularity;
  onChangeGranularity: (g: Granularity) => void;

  style?: ViewStyle;
  title?: string;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const labelDay = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
const labelMonth = (d: Date) => `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
const labelYear = (d: Date) => `${d.getFullYear()}`;

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfWeek(d: Date) {
  const s0 = startOfWeek(d);
  const e = new Date(s0);
  e.setDate(s0.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}
function startOfMonth(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function startOfYear(d: Date) {
  const x = new Date(d.getFullYear(), 0, 1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfYear(d: Date) {
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function addMonths(d: Date, months: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}
function addYears(d: Date, years: number) {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() + years);
  return x;
}

const GRAN_LABEL: Record<Granularity, string> = {
  DAY: 'Day',
  WEEK: 'Week',
  MONTH: 'Month',
  YEAR: 'Year',
};

type Preset = { key: string; label: string; amount: number };

const PRESETS: Record<Granularity, Preset[]> = {
  DAY: [
    { key: '15d', label: '15d', amount: 15 },
    { key: '30d', label: '30d', amount: 30 },
    { key: '60d', label: '60d', amount: 60 },
    { key: '90d', label: '90d', amount: 90 },
  ],
  WEEK: [
    { key: '4w', label: '4w', amount: 4 },
    { key: '8w', label: '8w', amount: 8 },
    { key: '12w', label: '12w', amount: 12 },
    { key: '24w', label: '24w', amount: 24 },
  ],
  MONTH: [
    { key: '3m', label: '3m', amount: 3 },
    { key: '6m', label: '6m', amount: 6 },
    { key: '12m', label: '12m', amount: 12 },
    { key: '24m', label: '24m', amount: 24 },
  ],
  YEAR: [
    { key: '1y', label: '1y', amount: 1 },
    { key: '3y', label: '3y', amount: 3 },
    { key: '5y', label: '5y', amount: 5 },
    { key: '10y', label: '10y', amount: 10 },
  ],
};

const DEFAULT_PRESET_KEY: Record<Granularity, string> = {
  DAY: '30d',
  WEEK: '8w',
  MONTH: '6m',
  YEAR: '1y',
};

export default function DateRangePickerCard({
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  granularity,
  onChangeGranularity,
  style,
  title = 'Compare dates',
}: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = makeStyles(theme);

  const isWeb = Platform.OS === 'web';
  const isPhone = !isWeb && bp.isSM;

  const [selectedPresetKey, setSelectedPresetKey] = useState(DEFAULT_PRESET_KEY[granularity]);

  const applyPreset = useCallback(
    (g: Granularity, amount: number) => {
      const now = new Date();

      if (g === 'DAY') {
        const e = now;
        const s0 = addDays(e, -(amount - 1));
        onChangeStart(s0);
        onChangeEnd(e);
        return;
      }

      if (g === 'WEEK') {
        const e = endOfWeek(now);
        const currentWeekStart = startOfWeek(now);
        const s0 = addDays(currentWeekStart, -7 * (amount - 1));
        onChangeStart(s0);
        onChangeEnd(e);
        return;
      }

      if (g === 'MONTH') {
        const e = endOfMonth(now);
        const currentMonthStart = startOfMonth(now);
        const s0 = startOfMonth(addMonths(currentMonthStart, -(amount - 1)));
        onChangeStart(s0);
        onChangeEnd(e);
        return;
      }

      const e = endOfYear(now);
      const currentYearStart = startOfYear(now);
      const s0 = startOfYear(addYears(currentYearStart, -(amount - 1)));
      onChangeStart(s0);
      onChangeEnd(e);
    },
    [onChangeStart, onChangeEnd],
  );

  useEffect(() => {
    const defKey = DEFAULT_PRESET_KEY[granularity];
    setSelectedPresetKey(defKey);
    const def = PRESETS[granularity].find((p) => p.key === defKey);
    if (def) applyPreset(granularity, def.amount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granularity]);

  const onSelectPreset = (p: Preset) => {
    setSelectedPresetKey(p.key);
    applyPreset(granularity, p.amount);
  };

  const rangeLabel = useMemo(() => {
    if (granularity === 'DAY') return `${labelDay(startDate)} → ${labelDay(endDate)}`;
    if (granularity === 'WEEK') return `${labelDay(startDate)} – ${labelDay(endDate)}`;
    if (granularity === 'MONTH') return `${labelMonth(startDate)} → ${labelMonth(endDate)}`;
    return `${labelYear(startDate)} → ${labelYear(endDate)}`;
  }, [startDate, endDate, granularity]);

  const presetsForG = PRESETS[granularity];

  return (
    <Surface style={[styles.card, style]} elevation={0}>
      {/* ✅ Web keeps original horizontal compact header.
          ✅ Phone stacks title + full-width segments. */}
      <View style={[styles.topRow, isPhone && styles.topRowPhone]}>
        <Text
          style={[styles.title, isPhone && styles.titlePhone]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>

        <View style={[styles.segmentWrap, isPhone && styles.segmentWrapPhone]}>
          {(Object.keys(GRAN_LABEL) as Granularity[]).map((g, idx, arr) => {
            const selected = g === granularity;
            const isFirst = idx === 0;
            const isLast = idx === arr.length - 1;

            return (
              <Button
                key={g}
                mode={selected ? 'contained' : 'outlined'}
                compact
                onPress={() => g !== granularity && onChangeGranularity(g)}
                style={[
                  styles.segmentBtn,
                  isPhone && styles.segmentBtnPhone,
                  isFirst && styles.segmentFirst,
                  isLast && styles.segmentLast,
                ]}
                contentStyle={[styles.segmentContent, isPhone && styles.segmentContentPhone]}
                labelStyle={[
                  styles.segmentLabel,
                  selected && styles.segmentLabelSelected,
                  isPhone && styles.segmentLabelPhone,
                ]}
              >
                {GRAN_LABEL[g]}
              </Button>
            );
          })}
        </View>
      </View>

      {/* Preset pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.presetRow, isPhone && styles.presetRowPhone]}
      >
        {presetsForG.map((p) => {
          const selected = p.key === selectedPresetKey;
          return (
            <Button
              key={p.key}
              mode={selected ? 'contained-tonal' : 'outlined'}
              compact
              onPress={() => onSelectPreset(p)}
              style={[styles.presetBtn, isPhone && styles.presetBtnPhone]}
              contentStyle={[styles.presetContent, isPhone && styles.presetContentPhone]}
              labelStyle={[
                styles.presetLabel,
                selected && styles.presetLabelSelected,
                isPhone && styles.presetLabelPhone,
              ]}
            >
              {p.label}
            </Button>
          );
        })}
      </ScrollView>

      <Text
        style={[styles.rangeText, isPhone && styles.rangeTextPhone]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {rangeLabel}
      </Text>
    </Surface>
  );
}

function makeStyles(theme: any) {
  type Styles = {
    card: ViewStyle;
    topRow: ViewStyle;
    topRowPhone: ViewStyle;
    title: TextStyle;
    titlePhone: TextStyle;

    segmentWrap: ViewStyle;
    segmentWrapPhone: ViewStyle;
    segmentBtn: ViewStyle;
    segmentBtnPhone: ViewStyle;
    segmentFirst: ViewStyle;
    segmentLast: ViewStyle;
    segmentContent: ViewStyle;
    segmentContentPhone: ViewStyle;
    segmentLabel: TextStyle;
    segmentLabelSelected: TextStyle;
    segmentLabelPhone: TextStyle;

    presetRow: ViewStyle;
    presetRowPhone: ViewStyle;
    presetBtn: ViewStyle;
    presetBtnPhone: ViewStyle;
    presetContent: ViewStyle;
    presetContentPhone: ViewStyle;
    presetLabel: TextStyle;
    presetLabelSelected: TextStyle;
    presetLabelPhone: TextStyle;

    rangeText: TextStyle;
    rangeTextPhone: TextStyle;
  };

  return StyleSheet.create<Styles>({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: s(14),
      padding: s(12),
      gap: vs(8),
      width: '100%',
    },

    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(10),
    },
    topRowPhone: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: vs(8),
    },

    title: {
      fontSize: ms(12, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurface,
      opacity: 0.9,
      flexShrink: 1,
    },
    titlePhone: {
      fontSize: ms(13, 0.2),
    },

    // ✅ BASE (web/tablet): exactly your original compact segmented control
    segmentWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: s(999),
      overflow: 'hidden',
    },
    // ✅ PHONE: full width
    segmentWrapPhone: {
      width: '100%',
    },

    segmentBtn: {
      borderRadius: 0,
      marginLeft: -StyleSheet.hairlineWidth,
      minWidth: s(58),
    },
    segmentBtnPhone: {
      minWidth: 0,
      flex: 1,
    },

    segmentFirst: {
      borderTopLeftRadius: s(999),
      borderBottomLeftRadius: s(999),
      marginLeft: 0,
    },
    segmentLast: {
      borderTopRightRadius: s(999),
      borderBottomRightRadius: s(999),
    },

    segmentContent: {
      paddingVertical: Platform.OS === 'web' ? vs(5) : vs(3.5),
      paddingHorizontal: s(8),
    },
    segmentContentPhone: {
      paddingVertical: vs(4.5),
      paddingHorizontal: s(6),
      minHeight: vs(40),
      justifyContent: 'center',
    },

    segmentLabel: {
      fontSize: ms(10.5, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurface,
      letterSpacing: 0.2,
    },
    segmentLabelPhone: {
      fontSize: ms(11, 0.2),
    },
    segmentLabelSelected: {
      color: theme.colors.onPrimary,
    },

    // ✅ BASE presets: original compact pills
    presetRow: {
      flexDirection: 'row',
      gap: s(6),
      paddingRight: s(2),
    },
    // ✅ PHONE: slightly roomier
    presetRowPhone: {
      gap: s(10),
      paddingRight: s(6),
    },

    presetBtn: {
      borderRadius: s(999),
    },
    presetBtnPhone: {
      borderRadius: s(999),
    },

    presetContent: {
      paddingVertical: Platform.OS === 'web' ? vs(5) : vs(3.5),
      paddingHorizontal: s(10),
    },
    presetContentPhone: {
      paddingVertical: vs(5),
      paddingHorizontal: s(14),
      minHeight: vs(44),
      justifyContent: 'center',
    },

    presetLabel: {
      fontSize: ms(10.5, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurface,
    },
    presetLabelPhone: {
      fontSize: ms(11.5, 0.2),
    },
    presetLabelSelected: {
      color: theme.colors.onSecondaryContainer,
    },

    rangeText: {
      fontSize: ms(11.5, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.95,
    },
    rangeTextPhone: {
      fontSize: ms(12, 0.2),
    },
  });
}
