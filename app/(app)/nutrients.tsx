import { useTracker } from '@/api/hooks/useTracker';
import { useCurrentUser } from '@/api/hooks/useUsers';
import type { FoodComponentGroup, FoodComponentLabel } from '@/api/types/mealFoods';
import { getComponentDisplay, getUnitSymbol } from '@/api/utils/foodEnums';
import { CaloriesBarWithLegend } from '@/components/CaloriesBarWithLegend';
import ChipsPanel from '@/components/ChipsPanel'; // ✅ new
import DateHeader from '@/components/DateHeader';
import IntakeMeter from '@/components/IntakeMeter';
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
  const insets = useSafeAreaInsets();
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
                <CaloriesBarWithLegend
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
      </ScrollView>
    </Surface>
  );
}

function makeStyles(theme: any, bp: any) {
  const isWeb = Platform.OS === 'web';
  const padX = isWeb ? 0 : bp.isXL ? s(28) : bp.isLG ? s(24) : s(16);
  const padY = bp.isXL ? vs(24) : bp.isLG ? vs(20) : vs(16);
  const headerPadX = isWeb ? s(12) : bp.isXL ? s(28) : bp.isLG ? s(24) : s(16);

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

    headerWrap: {
      width: '100%',
      paddingHorizontal: headerPadX,
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
