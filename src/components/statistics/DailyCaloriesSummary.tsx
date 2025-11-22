import { useBreakpoints } from '@/theme/responsive';
import { View, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { s, vs, ms } from 'react-native-size-matters';

type Props = {
  goal: number;
  consumed: number;
};

const clampNonNeg = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);

export function DailyCaloriesSummary({ goal, consumed }: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = makeStyles(theme, bp);

  const safeGoal = clampNonNeg(goal);
  const safeConsumed = clampNonNeg(consumed);

  const progressRaw = safeGoal > 0 ? safeConsumed / safeGoal : 0;
  const progressPct = safeGoal > 0 ? Math.round(progressRaw * 100) : 0;

  const remaining = safeGoal > 0 ? Math.max(0, safeGoal - safeConsumed) : 0;
  const overBy = safeGoal > 0 ? Math.max(0, safeConsumed - safeGoal) : 0;

  const clampedProgress = Math.min(1, progressRaw);
  const overProgress = progressRaw > 1 ? Math.min(0.25, progressRaw - 1) : 0; // small visible cap

  return (
    <Surface style={styles.container} elevation={0}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Daily calories</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            {progressPct}%{safeGoal > 0 ? '' : ''}
          </Text>
        </View>
      </View>

      {/* Main numbers */}
      <View style={styles.numbersRow}>
        <Text style={styles.bigNumber}>
          {safeConsumed.toFixed(0)}
          <Text style={styles.bigUnit}> kcal</Text>
        </Text>
        <Text style={styles.goalText}>/ {safeGoal.toFixed(0)} kcal goal</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clampedProgress * 100}%` }]} />
        {overProgress > 0 && (
          <View style={[styles.overFill, { width: `${overProgress * 100}%` }]} />
        )}
      </View>

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        {progressRaw <= 1 ? (
          <Text style={styles.bottomText}>{remaining.toFixed(0)} kcal remaining</Text>
        ) : (
          <Text style={[styles.bottomText, { color: theme.colors.error }]}>
            {overBy.toFixed(0)} kcal over goal
          </Text>
        )}

        <Text style={styles.bottomGoal}>Goal: {safeGoal.toFixed(0)} kcal</Text>
      </View>
    </Surface>
  );
}

function makeStyles(theme: any, bp: any) {
  const isWide = bp.isLG || bp.isXL || Platform.OS === 'web';

  type Styles = {
    container: ViewStyle;

    headerRow: ViewStyle;
    title: TextStyle;
    pill: ViewStyle;
    pillText: TextStyle;

    numbersRow: ViewStyle;
    bigNumber: TextStyle;
    bigUnit: TextStyle;
    goalText: TextStyle;

    track: ViewStyle;
    fill: ViewStyle;
    overFill: ViewStyle;

    bottomRow: ViewStyle;
    bottomText: TextStyle;
    bottomGoal: TextStyle;
  };

  return StyleSheet.create<Styles>({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: s(14),
      padding: s(16),
      width: '100%',
      gap: vs(10),
    },

    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: ms(15, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    pill: {
      paddingHorizontal: s(8),
      paddingVertical: vs(4),
      borderRadius: s(999),
      backgroundColor: theme.colors.surfaceVariant,
    },
    pillText: {
      fontSize: ms(11, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurface,
    },

    numbersRow: {
      flexDirection: isWide ? 'row' : 'column',
      alignItems: isWide ? 'baseline' : 'flex-start',
      gap: s(6),
    },
    bigNumber: {
      fontSize: ms(28, 0.2),
      fontWeight: '900',
      color: theme.colors.onSurface,
    },
    bigUnit: {
      fontSize: ms(13, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurfaceVariant,
    },
    goalText: {
      fontSize: ms(13, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurfaceVariant,
    },

    track: {
      height: bp.isSM ? vs(12) : vs(14),
      borderRadius: vs(14),
      backgroundColor: theme.colors.surfaceVariant,
      overflow: 'hidden',
      flexDirection: 'row',
    },
    fill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
    },
    overFill: {
      height: '100%',
      backgroundColor: theme.colors.error,
    },

    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginTop: vs(2),
    },
    bottomText: {
      fontSize: ms(12, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurfaceVariant,
    },
    bottomGoal: {
      fontSize: ms(12, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurfaceVariant,
    },
  });
}
