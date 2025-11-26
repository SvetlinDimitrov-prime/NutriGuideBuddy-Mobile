import { useTracker } from '@/api/hooks/useTracker';
import { useCurrentUser } from '@/api/hooks/useUsers';
import type { FoodComponentGroup, FoodComponentLabel } from '@/api/types/mealFoods';
import { getComponentDisplay, getUnitSymbol } from '@/api/utils/foodEnums';
import ChipsPanel from '@/components/ChipsPanel';
import { BarWithLegend } from '@/components/statistics/BarWithLegend';
import DateHeader from '@/components/statistics/DateHeader';
import IntakeMeter from '@/components/statistics/IntakeMeter';
import PageShell from '@/components/PageShell';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { vs } from 'react-native-size-matters';

function formatYMD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const clampNonNeg = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);

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

export default function NutrientsScreen() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const { data: me, isLoading: meLoading, isError: meError, error: meErr } = useCurrentUser();
  const userId = me?.id ?? 0;

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const selectedYmd = useMemo(() => formatYMD(selectedDate), [selectedDate]);
  const trackerDto = useMemo(() => ({ date: selectedYmd }), [selectedYmd]);

  const {
    data,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErr,
  } = useTracker(userId, trackerDto, !!userId);

  const components = data?.components ?? [];

  // ---------- GROUPS ----------
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

  // ---------- NUTRIENTS IN GROUP ----------
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

  const entries = useMemo(() => {
    const consumed = selectedComponent?.consumed ?? [];
    const map = new Map<number, { id: string; name: string; kcal: number }>();

    for (const row of consumed) {
      const amt = clampNonNeg(row.amount ?? 0);
      if (amt <= 0) continue;

      const prev = map.get(row.foodId);
      if (prev) prev.kcal += amt;
      else {
        map.set(row.foodId, {
          id: String(row.foodId),
          name: row.foodName ?? 'Food',
          kcal: amt,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.kcal - a.kcal);
  }, [selectedComponent]);

  const unitLabel = selectedComponent ? getUnitSymbol(selectedComponent.unit) : '';
  const leftLabel = selectedComponent ? getComponentDisplay(selectedComponent.name) : '';

  const isLoading = meLoading || statsLoading;
  const isError = meError || statsError;
  const errorMessage = meErr?.message ?? statsErr?.message ?? 'Unknown error';

  return (
    <PageShell bottomExtra={vs(40)} contentStyle={styles.content}>
      <View style={styles.headerWrap}>
        <DateHeader date={selectedDate} onChange={setSelectedDate} />
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
            <>
              <IntakeMeter component={selectedComponent} />
              <BarWithLegend
                key={`${selectedComponent.name}-${entries.length}`}
                entries={entries}
                legendLeftLabel={leftLabel}
                unitLabel={unitLabel}
                emptyText="No foods logged for this nutrient."
                maxLabelChars={9}
              />
            </>
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
