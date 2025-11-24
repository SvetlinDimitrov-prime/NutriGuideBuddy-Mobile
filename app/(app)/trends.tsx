import { useFoodComponentAmountInRange, useTracker } from '@/api/hooks/useTracker';
import { useCurrentUser } from '@/api/hooks/useUsers';
import type { FoodComponentGroup, FoodComponentLabel } from '@/api/types/mealFoods';
import type { FoodComponentRequest, MealFoodComponentConsumedView } from '@/api/types/tracker';
import { getComponentDisplay, getUnitSymbol } from '@/api/utils/foodEnums';
import ChipsPanel from '@/components/ChipsPanel';
import DateRangePickerCard, { type Granularity } from '@/components/statistics/DateRangePickerCard';
import TrendLineChart from '@/components/statistics/TrendLineChart';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s, vs } from 'react-native-size-matters';

function formatYMD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function parseYMD(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function minusDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() - days);
  return x;
}
const clampNonNeg = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);

// ---------- label helpers ----------
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const labelDay = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`; // "Nov 23"
const labelMonth = (d: Date) => `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`; // "Nov 25"
const labelYear = (d: Date) => `${d.getFullYear()}`;

// Monday-start week
function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun .. 6 Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

// ---------- groups ----------
const GROUP_DISPLAY: Partial<Record<FoodComponentGroup, string>> = {
  CARBS: 'Carbs',
  FATS: 'Fats',
  FATTY_ACIDS: 'Fatty Acids',
  PROTEIN: 'Protein',
  AMINO_ACIDS: 'Amino Acids',
  VITAMINS: 'Vitamins',
  MINERALS: 'Minerals',
  OTHER: 'Other',
};

const prettyGroup = (g: FoodComponentGroup) =>
  GROUP_DISPLAY[g] ??
  g
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

// ---------- granularity labels for header ----------
const GRAN_LABEL: Record<Granularity, string> = {
  DAY: 'Per day',
  WEEK: 'Per week',
  MONTH: 'Per month',
  YEAR: 'Per year',
};

export default function TrendsScreen() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const insets = useSafeAreaInsets();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const { data: me, isLoading: meLoading, isError: meError, error: meErr } = useCurrentUser();
  const userId = me?.id ?? 0;

  // default to last 30 days → today
  const [endDate, setEndDate] = useState<Date>(() => new Date());
  const [startDate, setStartDate] = useState<Date>(() => minusDays(new Date(), 29));

  const startYmd = useMemo(() => formatYMD(startDate), [startDate]);
  const endYmd = useMemo(() => formatYMD(endDate), [endDate]);

  // ✅ granularity controlled by DateRangePickerCard
  const [granularity, setGranularity] = useState<Granularity>('DAY');

  // still need components list for chips; anchor to endDate
  const trackerDto = useMemo(() => ({ date: endYmd }), [endYmd]);
  const {
    data: tracker,
    isLoading: trackerLoading,
    isError: trackerError,
    error: trackerErr,
  } = useTracker(userId, trackerDto, !!userId);

  const components = tracker?.components ?? [];

  // groups
  const groups = useMemo<FoodComponentGroup[]>(() => {
    const set = new Set<FoodComponentGroup>();
    components.forEach((c) => set.add(c.group));
    return Array.from(set);
  }, [components]);

  const [selectedGroup, setSelectedGroup] = useState<FoodComponentGroup | null>(null);
  useEffect(() => {
    if (!selectedGroup && groups.length > 0) setSelectedGroup(groups[0]);
    if (selectedGroup && groups.length > 0 && !groups.includes(selectedGroup)) {
      setSelectedGroup(groups[0]);
    }
  }, [groups, selectedGroup]);

  // nutrients in group
  const nutrientsInGroup = useMemo(
    () => components.filter((c) => c.group === selectedGroup),
    [components, selectedGroup],
  );

  const [selectedNutrient, setSelectedNutrient] = useState<FoodComponentLabel | null>(null);
  useEffect(() => {
    if (!selectedNutrient && nutrientsInGroup.length > 0) {
      setSelectedNutrient(nutrientsInGroup[0].name);
    }
    if (
      selectedNutrient &&
      nutrientsInGroup.length > 0 &&
      !nutrientsInGroup.some((c) => c.name === selectedNutrient)
    ) {
      setSelectedNutrient(nutrientsInGroup[0].name);
    }
  }, [nutrientsInGroup, selectedNutrient]);

  const selectedComponent = nutrientsInGroup.find((c) => c.name === selectedNutrient) ?? null;
  const unitLabel = selectedComponent ? getUnitSymbol(selectedComponent.unit) : '';

  // range request
  const rangeReq = useMemo<FoodComponentRequest | null>(() => {
    if (!selectedNutrient) return null;
    return { name: selectedNutrient, startDate: startYmd, endDate: endYmd };
  }, [selectedNutrient, startYmd, endYmd]);

  const {
    data: rangeData,
    isLoading: rangeLoading,
    isError: rangeError,
    error: rangeErr,
  } = useFoodComponentAmountInRange(userId, rangeReq as FoodComponentRequest, !!rangeReq);

  // ✅ convert API shape -> filled daily totals (stable ordering)
  const dailyTotals = useMemo(() => {
    if (!rangeData) return [];

    const totals = new Map<string, number>();
    for (const [date, rows] of Object.entries(rangeData)) {
      const sum = (rows ?? []).reduce(
        (acc, r: MealFoodComponentConsumedView) => acc + clampNonNeg(r.amount ?? 0),
        0,
      );
      totals.set(date, sum);
    }

    const start = parseYMD(startYmd);
    const end = parseYMD(endYmd);
    const filled: { ymd: string; dateObj: Date; value: number }[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const ymd = formatYMD(d);
      filled.push({ ymd, dateObj: new Date(d), value: totals.get(ymd) ?? 0 });
    }

    return filled;
  }, [rangeData, startYmd, endYmd]);

  // ✅ aggregate dailyTotals -> chart points based on granularity
  const points = useMemo(() => {
    if (dailyTotals.length === 0) return [];

    if (granularity === 'DAY') {
      const out = dailyTotals.map((d) => ({
        date: labelDay(d.dateObj),
        value: d.value,
      }));
      if (out.length === 1) return [out[0], { ...out[0], date: `${out[0].date}•` }];
      return out;
    }

    const buckets = new Map<string, { keyDate: Date; sum: number }>();

    for (const d of dailyTotals) {
      let keyDate: Date;
      let key: string;

      if (granularity === 'WEEK') {
        keyDate = startOfWeek(d.dateObj);
        key = formatYMD(keyDate);
      } else if (granularity === 'MONTH') {
        keyDate = new Date(d.dateObj.getFullYear(), d.dateObj.getMonth(), 1);
        key = `${keyDate.getFullYear()}-${keyDate.getMonth() + 1}`;
      } else {
        keyDate = new Date(d.dateObj.getFullYear(), 0, 1);
        key = `${keyDate.getFullYear()}`;
      }

      const prev = buckets.get(key);
      if (prev) prev.sum += d.value;
      else buckets.set(key, { keyDate, sum: d.value });
    }

    const sorted = Array.from(buckets.values()).sort(
      (a, b) => a.keyDate.getTime() - b.keyDate.getTime(),
    );

    const out = sorted.map((b) => ({
      date:
        granularity === 'WEEK'
          ? labelDay(b.keyDate)
          : granularity === 'MONTH'
            ? labelMonth(b.keyDate)
            : labelYear(b.keyDate),
      value: clampNonNeg(b.sum),
    }));

    if (out.length === 1) return [out[0], { ...out[0], date: `${out[0].date}•` }];
    return out;
  }, [dailyTotals, granularity]);

  const isLoading = meLoading || trackerLoading || rangeLoading;
  const isError = meError || trackerError || rangeError;
  const errorMessage =
    meErr?.message ?? trackerErr?.message ?? rangeErr?.message ?? 'Unknown error';

  const bottomPad = vs(40) + insets.bottom;

  return (
    <Surface mode="flat" elevation={0} style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={Platform.OS !== 'web'}
      >
        {/* ✅ NO extra horizontal padding here — scrollContent already pads */}
        <View style={styles.headerWrap}>
          <DateRangePickerCard
            startDate={startDate}
            endDate={endDate}
            onChangeStart={setStartDate}
            onChangeEnd={setEndDate}
            granularity={granularity}
            onChangeGranularity={setGranularity}
            title="Compare dates"
          />
        </View>

        {isLoading && <Text style={styles.statusText}>Loading stats…</Text>}
        {isError && <Text style={styles.errorText}>Couldn’t load stats: {errorMessage}</Text>}

        {!isLoading && !isError && (
          <>
            <ChipsPanel
              rows={[
                {
                  key: 'groups',
                  title: 'Group',
                  items: groups,
                  selectedId: selectedGroup ?? null,
                  onSelect: (g) => setSelectedGroup(g),
                  getId: (g) => g,
                  getLabel: (g) => prettyGroup(g),
                  maxLabelChars: 14,
                },
                {
                  key: 'nutrients',
                  title: 'Nutrient',
                  items: nutrientsInGroup,
                  selectedId: selectedNutrient ?? null,
                  onSelect: (c) => setSelectedNutrient(c.name),
                  getId: (c) => c.name,
                  getLabel: (c) => getComponentDisplay(c.name),
                  maxLabelChars: 18,
                },
              ]}
            />

            {selectedComponent && (
              <TrendLineChart
                points={points}
                unitLabel={unitLabel}
                headerLeftLabel={`${getComponentDisplay(
                  selectedComponent.name,
                )} (${GRAN_LABEL[granularity]})`}
                emptyText="No data for this nutrient in the selected range."
                maxLabelChars={granularity === 'DAY' ? 8 : 10}
              />
            )}
          </>
        )}
      </ScrollView>
    </Surface>
  );
}

function makeStyles(theme: any, bp: any) {
  const isWeb = Platform.OS === 'web';

  const padX = isWeb ? (bp.isXL ? s(24) : s(16)) : bp.isXL ? s(28) : bp.isLG ? s(24) : s(16);
  const padY = bp.isXL ? vs(24) : bp.isLG ? vs(20) : vs(16);

  type Styles = {
    page: ViewStyle;
    scroll: ViewStyle;
    scrollContent: ViewStyle;
    headerWrap: ViewStyle;
    statusText: TextStyle;
    errorText: TextStyle;
  };

  return StyleSheet.create<Styles>({
    page: {
      flex: 1,
      backgroundColor: theme.colors.background,
      width: '100%',
    },
    scroll: {
      flex: 1,
      width: '100%',
    },
    scrollContent: {
      paddingTop: padY,
      paddingHorizontal: padX,
      gap: vs(12),
      width: '100%',
      alignItems: 'stretch',
    },

    // ✅ headerWrap no horizontal padding (prevents double-inset)
    headerWrap: {
      width: '100%',
    },

    statusText: {
      marginTop: vs(8),
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
    errorText: {
      marginTop: vs(8),
      textAlign: 'center',
      color: theme.colors.error,
    },
  });
}
