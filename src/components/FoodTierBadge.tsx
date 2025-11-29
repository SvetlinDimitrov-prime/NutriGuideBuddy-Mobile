// components/FoodTierBadge.tsx
import AppModal from '@/components/AppModal';
import { useFoodTier } from '@/hooks/useFoodTier';
import { useBreakpoints } from '@/theme/responsive';
import type { FoodLike, FoodTierReason } from '@/types/nutritionProfile';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { ms, s } from 'react-native-size-matters';

type FoodForTier = FoodLike;

type Props = {
  food: FoodForTier | null;
  variant?: 'compact' | 'subtitle';
};

export default function FoodTierBadge({ food, variant = 'compact' }: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const { tier, score, reasons, isEstimate } = useFoodTier(food);

  const [infoOpen, setInfoOpen] = useState(false);

  const palette = {
    S: { base: theme.colors.primary },
    A: { base: theme.colors.secondary ?? theme.colors.primary },
    B: { base: theme.colors.tertiary ?? theme.colors.primary },
    C: { base: theme.colors.outlineVariant },
    D: { base: theme.colors.error },
    E: { base: theme.colors.error },
    F: { base: theme.colors.error },
  } as const;

  const labelMap = {
    S: 'Legend',
    A: 'Great',
    B: 'Good',
    C: 'OK',
    D: 'Limit',
    E: 'Limit',
    F: 'Limit',
  } as const;

  const colors = palette[tier];

  const isSmallScreen = bp.isSM || bp.isMD;
  const fontBase = isSmallScreen ? ms(11, 0.2) : ms(12, 0.2);

  if (variant === 'subtitle') {
    const primaryNegative =
      reasons.find((r) => r.kind === 'negative') ??
      reasons.find((r) => r.kind === 'info') ??
      reasons[0];

    const subtitleText = `Tier ${tier} · ${labelMap[tier]}`;

    return (
      <>
        <View style={styles.subtitleWrap}>
          <View
            style={[
              styles.subtitleDot,
              {
                backgroundColor: colors.base,
                borderColor: colors.base,
              },
            ]}
          />
          <Text
            style={[
              styles.subtitleText,
              {
                fontSize: fontBase,
                color: theme.colors.onSurfaceVariant,
              },
            ]}
            numberOfLines={1}
          >
            {subtitleText}
          </Text>

          <IconButton
            icon="help-circle-outline"
            size={isSmallScreen ? s(14) : s(15)}
            onPress={() => setInfoOpen(true)}
            style={styles.infoIconBtn}
            iconColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <AppModal
          visible={infoOpen}
          onDismiss={() => setInfoOpen(false)}
          showCancel={false}
          title={`Why is this Tier ${tier}?`}
          onConfirm={() => setInfoOpen(false)}
          confirmLabel="Close"
        >
          <View style={styles.modalContent}>
            <Text style={[styles.modalScore, { color: colors.base }]}>
              Score: {score.toFixed(0)} / 100{isEstimate ? ' (estimate)' : ''}
            </Text>

            {primaryNegative && <Text style={styles.modalMain}>{primaryNegative.message}</Text>}

            <ReasonList reasons={reasons} />
          </View>
        </AppModal>
      </>
    );
  }

  // compact variant
  const diameter = isSmallScreen ? s(18) : s(20);

  return (
    <View
      style={[
        styles.compactCircle,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          borderColor: colors.base,
        },
      ]}
    >
      <Text
        style={[
          styles.compactLetter,
          {
            fontSize: fontBase,
            color: colors.base,
          },
        ]}
      >
        {tier}
      </Text>
    </View>
  );
}

// ---------- Reason list used inside modal ----------

type ReasonListProps = { reasons: FoodTierReason[] };

function ReasonList({ reasons }: ReasonListProps) {
  if (!reasons || reasons.length === 0) return null;

  const positives = reasons.filter((r) => r.kind === 'positive').slice(0, 4);
  const negatives = reasons.filter((r) => r.kind === 'negative').slice(0, 6);
  const infos = reasons.filter((r) => r.kind === 'info').slice(0, 2);

  return (
    <View style={styles.reasonBlock}>
      {positives.length > 0 && (
        <View style={styles.reasonSection}>
          <Text style={styles.reasonHeader}>What’s good</Text>
          {positives.map((r, idx) => (
            <Text key={`pos-${idx}`} style={styles.reasonText}>
              • {r.message}
            </Text>
          ))}
        </View>
      )}

      {negatives.length > 0 && (
        <View style={styles.reasonSection}>
          <Text style={styles.reasonHeader}>What holds it back</Text>
          {negatives.map((r, idx) => (
            <Text key={`neg-${idx}`} style={styles.reasonText}>
              • {r.message}
            </Text>
          ))}
        </View>
      )}

      {infos.length > 0 && (
        <View style={styles.reasonSection}>
          {infos.map((r, idx) => (
            <Text key={`info-${idx}`} style={styles.reasonText}>
              • {r.message}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // subtitle variant
  subtitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  subtitleDot: {
    width: s(7),
    height: s(7),
    borderRadius: s(3.5),
    borderWidth: StyleSheet.hairlineWidth,
  },
  subtitleText: {
    flexShrink: 1,
    fontWeight: '500',
  },
  infoIconBtn: {
    margin: 0,
    width: s(24), // smaller touch area
    height: s(24),
  },

  // compact variant
  compactCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  compactLetter: {
    fontWeight: '700',
  },

  // modal
  modalContent: {
    gap: s(6),
  },
  modalScore: {
    fontWeight: '700',
    marginBottom: s(4),
  },
  modalMain: {
    marginBottom: s(4),
  },
  reasonBlock: {
    gap: s(6),
  },
  reasonSection: {
    gap: s(2),
  },
  reasonHeader: {
    fontWeight: '600',
    fontSize: ms(12, 0.2),
  },
  reasonText: {
    fontSize: ms(11, 0.2),
  },
});
