import { useMemo } from 'react';
import { Platform, StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

type TextRow = {
  date: string; // already formatted label e.g. "Nov 19"
  value: string; // already prettified
};

type Props = {
  headerLeftLabel?: string;
  rows?: TextRow[];
  emptyText?: string;
  headerMaxChars?: number;
};

const truncateLabel = (label: string, max = 26) =>
  label.length > max ? `${label.slice(0, max - 1)}…` : label;

export default function TextTrendCard({
  headerLeftLabel = '',
  rows = [],
  emptyText = 'No data.',
  headerMaxChars = 22,
}: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  // ✅ group values per same date into one row
  const grouped = useMemo(() => {
    if (!rows?.length) return [];

    const map = new Map<string, string[]>();
    for (const r of rows) {
      if (!map.has(r.date)) map.set(r.date, []);
      map.get(r.date)!.push(r.value);
    }

    // keep original order by first appearance
    const orderedDates: string[] = [];
    for (const r of rows) {
      if (!orderedDates.includes(r.date)) orderedDates.push(r.date);
    }

    return orderedDates.map((date) => ({
      date,
      values: map.get(date) ?? [],
    }));
  }, [rows]);

  const safeHeaderLeft = truncateLabel(headerLeftLabel, headerMaxChars);
  const lastVal = rows?.length ? rows[rows.length - 1]?.value : '—';

  return (
    <Surface style={styles.card} elevation={0}>
      {grouped.length === 0 ? (
        <Text style={styles.empty}>{emptyText}</Text>
      ) : (
        <>
          {/* header */}
          <View style={styles.headerRow}>
            <Text style={styles.headerLeft} numberOfLines={1} ellipsizeMode="tail">
              {safeHeaderLeft}
            </Text>

            <View style={styles.headerRightCol}>
              <Text style={styles.headerRight}>Changes: {rows.length}</Text>
              <Text style={styles.headerRightSub}>Last: {lastVal}</Text>
            </View>
          </View>

          {/* grouped timeline */}
          <View style={styles.timeline}>
            {grouped.map((g, idx) => {
              const isLast = idx === grouped.length - 1;
              return (
                <View key={`${g.date}-${idx}`} style={styles.itemRow}>
                  {/* rail + dot */}
                  <View style={styles.railCol}>
                    <View style={[styles.dot, isLast && styles.dotLast]} />
                    {!isLast && <View style={styles.rail} />}
                  </View>

                  {/* content */}
                  <View style={styles.contentCol}>
                    <Text style={styles.dateText}>{g.date}</Text>

                    <View style={styles.valueWrap}>
                      {g.values.map((val, j) => (
                        <View
                          key={`${g.date}-${j}-${val}`}
                          style={[
                            styles.valuePill,
                            isLast && j === g.values.length - 1 && styles.valuePillLast,
                          ]}
                        >
                          <Text style={styles.valueText} numberOfLines={1}>
                            {val}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}
    </Surface>
  );
}

type Styles = {
  card: ViewStyle;
  empty: TextStyle;

  headerRow: ViewStyle;
  headerLeft: TextStyle;
  headerRightCol: ViewStyle;
  headerRight: TextStyle;
  headerRightSub: TextStyle;

  timeline: ViewStyle;
  itemRow: ViewStyle;

  railCol: ViewStyle;
  dot: ViewStyle;
  dotLast: ViewStyle;
  rail: ViewStyle;

  contentCol: ViewStyle;
  dateText: TextStyle;
  valueWrap: ViewStyle;
  valuePill: ViewStyle;
  valuePillLast: ViewStyle;
  valueText: TextStyle;
};

function makeStyles(theme: any) {
  const isWeb = Platform.OS === 'web';

  // ✅ WEB-ONLY sizes for timeline dots
  const DOT_SIZE = isWeb ? s(8) : s(12);
  const DOT_RADIUS = isWeb ? s(3) : s(4);
  const RAIL_W = isWeb ? s(1.5) : s(2);

  // ✅ WEB-ONLY sizes for value pills (THIS is the change)
  const PILL_H_PAD = isWeb ? s(10) : s(14);
  const PILL_V_PAD = isWeb ? vs(4) : vs(7);
  const PILL_MIN_H = isWeb ? vs(28) : vs(36);
  const PILL_FONT = isWeb ? ms(11, 0.2) : ms(12, 0.2);

  return StyleSheet.create<Styles>({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: s(14),
      padding: s(14),
      gap: vs(10),
      width: '100%',
    },

    empty: {
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: s(8),
      marginBottom: vs(4),
    },
    headerLeft: {
      flex: 1,
      flexShrink: 1,
      fontSize: ms(11, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurface,
      opacity: 0.9,
    },
    headerRightCol: {
      flexShrink: 0,
      alignItems: 'flex-end',
      gap: vs(2),
    },
    headerRight: {
      fontSize: ms(11, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.95,
    },
    headerRightSub: {
      fontSize: ms(10, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.9,
    },

    timeline: {
      gap: vs(10),
    },

    // ✅ WEB: stretch row so rail flex:1 works (connector visible)
    itemRow: {
      flexDirection: 'row',
      gap: s(10),
      alignItems: isWeb ? 'stretch' : 'flex-start',
    },

    railCol: {
      width: s(18),
      alignItems: 'center',
      alignSelf: isWeb ? 'stretch' : 'auto',
    },

    // ✅ dot smaller on web only
    dot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_RADIUS,
      backgroundColor: theme.colors.outlineVariant,
      marginTop: vs(2),
    },
    dotLast: {
      backgroundColor: theme.colors.primaryContainer,
    },

    // ✅ connector always visible, thinner on web
    rail: {
      width: RAIL_W,
      flex: 1,
      backgroundColor: theme.colors.outlineVariant,
      opacity: isWeb ? 0.45 : 0.6,
      marginTop: vs(4),
      borderRadius: RAIL_W,
    },

    contentCol: {
      flex: 1,
      gap: vs(6),
    },

    dateText: {
      fontSize: ms(11, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.9,
    },

    valueWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
    },

    // ✅ pills smaller only on web
    valuePill: {
      borderRadius: s(999),
      paddingHorizontal: PILL_H_PAD,
      paddingVertical: PILL_V_PAD,
      minHeight: PILL_MIN_H,
      justifyContent: 'center',
      borderWidth: 1.2,
      backgroundColor: isWeb ? 'transparent' : theme.colors.surface,
      borderColor: theme.colors.outlineVariant,
    },
    valuePillLast: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primaryContainer,
    },
    valueText: {
      fontSize: PILL_FONT,
      fontWeight: '800',
      letterSpacing: 0.2,
      color: theme.colors.onSurface,
    },
  });
}
