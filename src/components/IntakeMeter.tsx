import React, { useMemo } from 'react';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';
import type { FoodComponentIntakeView } from '@/api/types/tracker';
import { getUnitSymbol } from '@/api/utils/foodEnums';

type Props = {
  component: FoodComponentIntakeView;
  style?: ViewStyle;
  dense?: boolean;
};

const clampNonNeg = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const formatAmount = (v: number) => {
  if (!Number.isFinite(v)) return '0';
  if (Math.abs(v) >= 10) return `${Math.round(v)}`;
  // show 1 decimal only when useful
  const oneDec = Math.round(v * 10) / 10;
  return Number.isInteger(oneDec) ? `${oneDec}` : `${oneDec.toFixed(1)}`;
};

export default function IntakeMeter({ component, style, dense }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme, dense);

  const unit = getUnitSymbol(component.unit);

  const consumed = useMemo(() => {
    return clampNonNeg((component.consumed ?? []).reduce((acc, r) => acc + (r.amount ?? 0), 0));
  }, [component.consumed]);

  const recommended = component.recommended ?? null;
  const maxRecommended = component.maxRecommended ?? null;

  // ✅ Pick the displayed target smartly:
  // If max exists, that’s the real ceiling -> show it on the right.
  // Otherwise show recommended.
  const targetValue = maxRecommended ?? recommended ?? null;
  const targetLabel = maxRecommended != null ? 'Max' : 'Recommended';

  // Scale for bar length
  const base = targetValue ?? (consumed > 0 ? consumed : 1);

  const progress = clamp01(consumed / base);

  // Status + delta
  const isOverMax = maxRecommended != null && consumed > maxRecommended;
  const isOnTarget = recommended != null && consumed >= recommended && !isOverMax;

  const deltaText = useMemo(() => {
    if (targetValue == null) {
      return `Consumed ${formatAmount(consumed)} ${unit}`;
    }
    if (isOverMax && maxRecommended != null) {
      return `Over by ${formatAmount(consumed - maxRecommended)} ${unit}`;
    }
    if (recommended != null && consumed < recommended) {
      return `${formatAmount(recommended - consumed)} ${unit} remaining`;
    }
    return `Target reached`;
  }, [targetValue, isOverMax, maxRecommended, recommended, consumed, unit]);

  // ✅ Percent display:
  // If there's a recommended target but NO max, cap the visual % at 100.
  // If max exists, show % of max (can exceed slightly, but keep sane).
  const rawPercent =
    maxRecommended != null
      ? (consumed / maxRecommended) * 100
      : recommended != null
        ? (consumed / recommended) * 100
        : null;

  const displayPercent =
    rawPercent == null
      ? null
      : maxRecommended == null && recommended != null && consumed >= recommended
        ? 100
        : Math.round(rawPercent);

  return (
    <Surface style={[styles.card, style]} elevation={0}>
      {/* TOP ROW */}
      <View style={styles.topRow}>
        <View style={styles.topBlock}>
          <Text style={styles.topLabel}>Consumed</Text>
          <Text style={styles.topValue}>
            {formatAmount(consumed)} {unit}
          </Text>
        </View>

        {targetValue != null && (
          <View style={[styles.topBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.topLabel}>{targetLabel}</Text>
            <Text style={styles.topValue}>
              {formatAmount(targetValue)} {unit}
            </Text>
          </View>
        )}
      </View>

      {/* BAR */}
      <View style={styles.barWrap}>
        <View style={styles.barBase} />
        <View
          style={[
            styles.barFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: isOverMax ? theme.colors.error : theme.colors.primary,
            },
          ]}
        />
      </View>

      {/* BOTTOM ROW */}
      <View style={styles.bottomRow}>
        <Text
          style={[
            styles.bottomLeft,
            isOverMax && { color: theme.colors.error },
            isOnTarget && { color: theme.colors.primary },
          ]}
        >
          {deltaText}
        </Text>

        {displayPercent != null && (
          <Text
            style={[
              styles.bottomRight,
              isOverMax && { color: theme.colors.error },
              isOnTarget && { color: theme.colors.primary },
            ]}
          >
            {displayPercent}%
          </Text>
        )}
      </View>
    </Surface>
  );
}

function makeStyles(theme: any, dense?: boolean) {
  type Styles = {
    card: ViewStyle;
    topRow: ViewStyle;
    topBlock: ViewStyle;
    topLabel: TextStyle;
    topValue: TextStyle;

    barWrap: ViewStyle;
    barBase: ViewStyle;
    barFill: ViewStyle;

    bottomRow: ViewStyle;
    bottomLeft: TextStyle;
    bottomRight: TextStyle;
  };

  const pad = dense ? s(10) : s(14);

  return StyleSheet.create<Styles>({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: s(14),
      padding: pad,
      width: '100%',
      gap: vs(10),
    },

    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    topBlock: {
      gap: vs(2),
    },
    topLabel: {
      fontSize: ms(10, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.9,
    },
    topValue: {
      fontSize: ms(13, 0.2),
      fontWeight: '900',
      color: theme.colors.onSurface,
    },

    barWrap: {
      position: 'relative',
      height: vs(12),
      borderRadius: s(999),
      overflow: 'hidden',
    },
    barBase: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.surfaceVariant,
    },
    barFill: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      borderRadius: s(999),
    },

    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    bottomLeft: {
      fontSize: ms(11, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurfaceVariant,
    },
    bottomRight: {
      fontSize: ms(12, 0.2),
      fontWeight: '900',
      color: theme.colors.onSurfaceVariant,
    },
  });
}
