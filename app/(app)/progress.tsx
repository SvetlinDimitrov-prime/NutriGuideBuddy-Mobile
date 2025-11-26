import { useUserDetailsSnapshots } from '@/api/hooks/useUserDetailsSnapshot';
import { useCurrentUser } from '@/api/hooks/useUsers';
import type {
  Gender,
  Goals,
  UserDetailsSnapshotResponse,
  WorkoutState,
} from '@/api/types/userDetailsSnapshot';
import ChipsPanel from '@/components/ChipsPanel';
import DateRangePickerCard, { type Granularity } from '@/components/statistics/DateRangePickerCard';
import TextTrendCard from '@/components/statistics/TextTrendCard';
import TrendLineChart from '@/components/statistics/TrendLineChart';
import PageShell from '@/components/PageShell';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { vs } from 'react-native-size-matters';

function formatYMD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function minusDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() - days);
  return x;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const labelDay = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
const labelMonth = (d: Date) => `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
const labelYear = (d: Date) => `${d.getFullYear()}`;

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

const GRAN_LABEL: Record<Granularity, string> = {
  DAY: 'Per day',
  WEEK: 'Per week',
  MONTH: 'Per month',
  YEAR: 'Per year',
};

const prettyEnum = (v?: string | null) =>
  v
    ? v
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : '—';

const prettyGoal = (g?: Goals | null) => prettyEnum(g);
const prettyWorkout = (w?: WorkoutState | null) => prettyEnum(w);
const prettyGender = (g?: Gender | null) => prettyEnum(g);
const prettyDiet = (d?: string | null) => (d && d.trim() ? d.trim() : '—');

type MetricId = 'weight' | 'height' | 'goals' | 'workout' | 'diet' | 'gender';

const METRICS: { id: MetricId; label: string; kind: 'number' | 'text' }[] = [
  { id: 'weight', label: 'Weight', kind: 'number' },
  { id: 'height', label: 'Height', kind: 'number' },
  { id: 'goals', label: 'Goal', kind: 'text' },
  { id: 'workout', label: 'Workout', kind: 'text' },
  { id: 'diet', label: 'Diet', kind: 'text' },
  { id: 'gender', label: 'Gender', kind: 'text' },
];

export default function ProgressScreen() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const { data: me, isLoading: meLoading, isError: meError, error: meErr } = useCurrentUser();
  const userId = me?.id ?? 0;

  const [endDate, setEndDate] = useState<Date>(() => new Date());
  const [startDate, setStartDate] = useState<Date>(() => minusDays(new Date(), 29));
  const startYmd = useMemo(() => formatYMD(startDate), [startDate]);
  const endYmd = useMemo(() => formatYMD(endDate), [endDate]);

  const [granularity, setGranularity] = useState<Granularity>('DAY');

  const [selectedMetric, setSelectedMetric] = useState<MetricId>('weight');

  const snapshotFilter = useMemo(() => ({ from: startYmd, to: endYmd }), [startYmd, endYmd]);

  const {
    data: snapshots = [],
    isLoading: snapLoading,
    isError: snapError,
    error: snapErr,
  } = useUserDetailsSnapshots(snapshotFilter, !!userId);

  const sortedSnaps = useMemo(
    () =>
      [...snapshots].sort(
        (a, b) => new Date(a.snapshotAt).getTime() - new Date(b.snapshotAt).getTime(),
      ),
    [snapshots],
  );

  const buildNumericPoints = useCallback(
    (pick: (snap: UserDetailsSnapshotResponse) => number | null, unitLabel: string) => {
      if (sortedSnaps.length === 0) return { points: [], unitLabel };

      const dayMap = new Map<string, { dateObj: Date; value: number }>();
      sortedSnaps.forEach((snap) => {
        const dObj = new Date(snap.snapshotAt);
        const ymd = formatYMD(dObj);
        const val = pick(snap);
        if (val == null || !Number.isFinite(val)) return;
        dayMap.set(ymd, { dateObj: dObj, value: val });
      });

      const daily = Array.from(dayMap.entries())
        .map(([ymd, v]) => ({ ymd, ...v }))
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

      if (daily.length === 0) return { points: [], unitLabel };

      if (granularity === 'DAY') {
        const pts = daily.map((d) => ({ date: labelDay(d.dateObj), value: d.value }));
        if (pts.length === 1)
          return { points: [pts[0], { ...pts[0], date: `${pts[0].date}•` }], unitLabel };
        return { points: pts, unitLabel };
      }

      const buckets = new Map<string, { keyDate: Date; sum: number; count: number }>();

      for (const d of daily) {
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
        if (prev) {
          prev.sum += d.value;
          prev.count += 1;
        } else {
          buckets.set(key, { keyDate, sum: d.value, count: 1 });
        }
      }

      const sortedBuckets = Array.from(buckets.values()).sort(
        (a, b) => a.keyDate.getTime() - b.keyDate.getTime(),
      );

      const pts = sortedBuckets.map((b) => ({
        date:
          granularity === 'WEEK'
            ? labelDay(b.keyDate)
            : granularity === 'MONTH'
              ? labelMonth(b.keyDate)
              : labelYear(b.keyDate),
        value: b.sum / Math.max(1, b.count),
      }));

      if (pts.length === 1)
        return { points: [pts[0], { ...pts[0], date: `${pts[0].date}•` }], unitLabel };
      return { points: pts, unitLabel };
    },
    [sortedSnaps, granularity],
  );

  const weightSeries = useMemo(
    () => buildNumericPoints((snap) => snap.kilograms ?? null, 'kg'),
    [buildNumericPoints],
  );

  const heightSeries = useMemo(
    () => buildNumericPoints((snap) => snap.height ?? null, 'cm'),
    [buildNumericPoints],
  );

  const buildTextBuckets = useCallback(
    <T extends string | null>(
      pick: (snap: UserDetailsSnapshotResponse) => T,
      label: string,
      formatValue?: (v: T) => string,
    ) => {
      if (sortedSnaps.length === 0) return { label, rows: [] as { date: string; value: string }[] };

      const daily = sortedSnaps.map((snap) => ({
        dateObj: new Date(snap.snapshotAt),
        value: pick(snap),
      }));

      const fmt = (v: T) => (formatValue ? formatValue(v) : (v ?? '—'));

      if (granularity === 'DAY') {
        const rows = daily
          .map((d) => ({
            date: labelDay(d.dateObj),
            value: fmt(d.value),
          }))
          .filter((r, i, arr) => i === 0 || r.value !== arr[i - 1].value);

        return { label, rows };
      }

      const buckets = new Map<string, { keyDate: Date; value: T }>();

      for (const d of daily) {
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

        buckets.set(key, { keyDate, value: d.value });
      }

      const sortedBuckets = Array.from(buckets.values()).sort(
        (a, b) => a.keyDate.getTime() - b.keyDate.getTime(),
      );

      const rows = sortedBuckets
        .map((b) => ({
          date:
            granularity === 'WEEK'
              ? labelDay(b.keyDate)
              : granularity === 'MONTH'
                ? labelMonth(b.keyDate)
                : labelYear(b.keyDate),
          value: fmt(b.value),
        }))
        .filter((r, i, arr) => i === 0 || r.value !== arr[i - 1].value);

      return { label, rows };
    },
    [sortedSnaps, granularity],
  );

  const goalsText = useMemo(
    () =>
      buildTextBuckets<Goals | null>(
        (snap) => snap.goal ?? null,
        `Goal (${GRAN_LABEL[granularity]})`,
        (v) => prettyGoal(v),
      ),
    [buildTextBuckets, granularity],
  );

  const workoutText = useMemo(
    () =>
      buildTextBuckets<WorkoutState | null>(
        (snap) => snap.workoutState ?? null,
        `Workout state (${GRAN_LABEL[granularity]})`,
        (v) => prettyWorkout(v),
      ),
    [buildTextBuckets, granularity],
  );

  const dietText = useMemo(
    () =>
      buildTextBuckets<string | null>(
        (snap) => snap.diet ?? null,
        `Diet (${GRAN_LABEL[granularity]})`,
        (v) => prettyDiet(v),
      ),
    [buildTextBuckets, granularity],
  );

  const genderText = useMemo(
    () =>
      buildTextBuckets<Gender | null>(
        (snap) => snap.gender ?? null,
        `Gender (${GRAN_LABEL[granularity]})`,
        (v) => prettyGender(v),
      ),
    [buildTextBuckets, granularity],
  );

  useEffect(() => {
    if (!METRICS.some((m) => m.id === selectedMetric)) setSelectedMetric('weight');
  }, [selectedMetric]);

  const isLoading = meLoading || snapLoading;
  const isError = meError || snapError;
  const errorMessage = meErr?.message ?? snapErr?.message ?? 'Unknown error';

  const selectedMetricMeta = METRICS.find((m) => m.id === selectedMetric)!;

  return (
    <PageShell bottomExtra={vs(40)} contentStyle={styles.content}>
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

      {isLoading && <Text style={styles.statusText}>Loading progress…</Text>}
      {isError && <Text style={styles.errorText}>Couldn’t load progress: {errorMessage}</Text>}

      {!isLoading && !isError && (
        <>
          <ChipsPanel
            rows={[
              {
                key: 'metrics',
                title: 'Metric',
                items: METRICS,
                selectedId: selectedMetric,
                onSelect: (m) => setSelectedMetric(m.id),
                getId: (m) => m.id,
                getLabel: (m) => m.label,
                maxLabelChars: 12,
              },
            ]}
          />

          {selectedMetricMeta.kind === 'number' && selectedMetric === 'weight' && (
            <TrendLineChart
              points={weightSeries.points}
              unitLabel={weightSeries.unitLabel}
              headerLeftLabel={`Weight (${GRAN_LABEL[granularity]})`}
              emptyText="No weight snapshots in this range."
              maxLabelChars={granularity === 'DAY' ? 8 : 10}
            />
          )}

          {selectedMetricMeta.kind === 'number' && selectedMetric === 'height' && (
            <TrendLineChart
              points={heightSeries.points}
              unitLabel={heightSeries.unitLabel}
              headerLeftLabel={`Height (${GRAN_LABEL[granularity]})`}
              emptyText="No height snapshots in this range."
              maxLabelChars={granularity === 'DAY' ? 8 : 10}
            />
          )}

          {selectedMetricMeta.kind === 'text' && selectedMetric === 'goals' && (
            <TextTrendCard
              headerLeftLabel={goalsText.label}
              rows={goalsText.rows}
              emptyText="No goal changes in this range."
            />
          )}

          {selectedMetricMeta.kind === 'text' && selectedMetric === 'workout' && (
            <TextTrendCard
              headerLeftLabel={workoutText.label}
              rows={workoutText.rows}
              emptyText="No workout state changes in this range."
            />
          )}

          {selectedMetricMeta.kind === 'text' && selectedMetric === 'diet' && (
            <TextTrendCard
              headerLeftLabel={dietText.label}
              rows={dietText.rows}
              emptyText="No diet changes in this range."
            />
          )}

          {selectedMetricMeta.kind === 'text' && selectedMetric === 'gender' && (
            <TextTrendCard
              headerLeftLabel={genderText.label}
              rows={genderText.rows}
              emptyText="No gender changes in this range."
            />
          )}
        </>
      )}
    </PageShell>
  );
}

function makeStyles(theme: any, _bp: any) {
  type Styles = {
    content: ViewStyle;
    headerWrap: ViewStyle;
    statusText: TextStyle;
    errorText: TextStyle;
  };

  return StyleSheet.create<Styles>({
    content: {
      width: '100%',
      alignItems: 'stretch',
      gap: vs(12),
    },
    headerWrap: {
      width: '100%',
      marginBottom: vs(4),
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
