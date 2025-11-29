// src/components/info/FoodRankingInfo.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Text, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';

export default function FoodRankingInfo() {
  const theme = useTheme() as MD3Theme;
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  // Same palette logic as FoodTierBadge (compact variant)
  const tierColors: Record<'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F', string> = {
    S: theme.colors.primary,
    A: theme.colors.secondary ?? theme.colors.primary,
    B: theme.colors.tertiary ?? theme.colors.primary,
    C: theme.colors.outlineVariant,
    D: theme.colors.error,
    E: theme.colors.error,
    F: theme.colors.error,
  };

  return (
    <List.Accordion
      title="Food ranking system"
      description="How a food becomes a 0–100 score and an S–F tier."
      style={styles.accordion}
      titleStyle={styles.accordionTitle}
      descriptionStyle={styles.accordionDescription}
    >
      <View style={styles.accordionBody}>
        {/* SECTION: How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How the ranking works</Text>
          <Text style={styles.paragraph}>
            Each food is scored from 0–100 based on its nutrition, then mapped to a tier from{' '}
            <Text style={styles.bold}>S</Text> (standout) down to <Text style={styles.bold}>F</Text>{' '}
            (mostly treat). The rules shift slightly depending on whether the food is mainly
            protein, carbs, fat or a mix.
          </Text>

          <View style={styles.stepsRow}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepLabel}>Detect food type</Text>
              <Text style={styles.stepText}>We look at where the calories come from.</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepLabel}>Score 0–100</Text>
              <Text style={styles.stepText}>Protein, fibre, sugar, fats, salt, calories.</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepLabel}>Map to tier</Text>
              <Text style={styles.stepText}>Higher score → closer to S.</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* SECTION: Tiers (using badge-style circles) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiers at a glance</Text>

          <View style={styles.tierRow}>
            {(['S', 'A', 'B', 'C', 'D', 'E', 'F'] as const).map((t) => (
              <View
                key={t}
                style={[
                  styles.tierBadge,
                  {
                    borderColor: tierColors[t],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tierBadgeText,
                    {
                      color: tierColors[t],
                    },
                  ]}
                >
                  {t}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.paragraphSmall}>
            <Text style={styles.bold}>S–A</Text> – core everyday foods.{' '}
            <Text style={styles.bold}>B–C</Text> – generally fine in normal portions.{' '}
            <Text style={styles.bold}>D–F</Text> – more “treat” or imbalanced; best in smaller
            amounts.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* SECTION: Signals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What affects the score</Text>

          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Text style={styles.columnHeader}>Helps</Text>
              <Text style={styles.bullet}>
                • High <Text style={styles.bold}>protein per 100 kcal</Text> (protein / mixed
                foods).
              </Text>
              <Text style={styles.bullet}>
                • More <Text style={styles.bold}>fibre</Text>, especially in carb-heavy foods.
              </Text>
              <Text style={styles.bullet}>
                • Better <Text style={styles.bold}>fat profile</Text> (more unsaturated, omega-3).
              </Text>
              <Text style={styles.bullet}>
                • Reasonable <Text style={styles.bold}>calories per 100 g</Text>.
              </Text>
              <Text style={styles.bullet}>
                • A mix of <Text style={styles.bold}>vitamins and minerals</Text>.
              </Text>
            </View>

            <View style={styles.column}>
              <Text style={styles.columnHeader}>Hurts</Text>
              <Text style={styles.bullet}>
                • Very <Text style={styles.bold}>high sugar</Text> for carb or mixed foods.
              </Text>
              <Text style={styles.bullet}>
                • High <Text style={styles.bold}>saturated fat</Text>, especially in fat / mixed.
              </Text>
              <Text style={styles.bullet}>
                • High <Text style={styles.bold}>sodium</Text>, mainly in processed foods.
              </Text>
              <Text style={styles.bullet}>
                • Very <Text style={styles.bold}>calorie-dense</Text> per 100 g.
              </Text>
              <Text style={styles.bullet}>
                • <Text style={styles.bold}>Missing data</Text> – rating is marked as an estimate
                and kept closer to the middle.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* SECTION: Food types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How different foods are judged</Text>
          <Text style={styles.paragraph}>
            First, the app checks where most of the calories come from and puts the food into one of
            these buckets:
          </Text>

          <View style={styles.chipRow}>
            <Text style={styles.typeChip}>Protein foods</Text>
            <Text style={styles.typeChip}>Carb foods</Text>
            <Text style={styles.typeChip}>Fat foods</Text>
            <Text style={styles.typeChip}>Mixed foods</Text>
          </View>

          <Text style={styles.paragraphSmall}>
            • <Text style={styles.bold}>Protein foods</Text>: protein per 100 kcal is the main
            driver; saturated fat, sodium and sugar pull the score down.{'\n'}•{' '}
            <Text style={styles.bold}>Carb foods</Text>: fibre and sugar matter most; very sugary,
            dense carbs score lower.{'\n'}• <Text style={styles.bold}>Fat foods</Text>: judged on
            fat type (unsaturated vs saturated), omega-3, calorie density and sodium.{'\n'}•{' '}
            <Text style={styles.bold}>Mixed foods</Text>: balanced view of protein, fibre, sugar,
            saturated fat and calories.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* SECTION: How to use */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Using tiers in your day</Text>
          <Text style={styles.bullet}>
            • Build most meals from <Text style={styles.bold}>S and A</Text> tier foods.
          </Text>
          <Text style={styles.bullet}>
            • Use <Text style={styles.bold}>B and C</Text> to add variety and fill gaps.
          </Text>
          <Text style={styles.bullet}>
            • Keep <Text style={styles.bold}>D–F</Text> foods for smaller portions or less frequent
            occasions.
          </Text>
          <Text style={styles.bullet}>
            • Tap <Text style={styles.bold}>“Why is this tier?”</Text> on a food to see the exact
            positives and negatives used to rate it.
          </Text>
        </View>
      </View>
    </List.Accordion>
  );
}

function makeStyles(theme: MD3Theme, _bp: { isXL: boolean; isLG: boolean; isMD: boolean }) {
  return StyleSheet.create({
    accordion: {
      backgroundColor: theme.colors.surface,
      borderRadius: s(10),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outlineVariant,
      overflow: 'hidden',
    },
    accordionTitle: {
      fontSize: ms(14, 0.2),
      fontWeight: '700',
    },
    accordionDescription: {
      fontSize: ms(11.5, 0.2),
      color: theme.colors.onSurfaceVariant,
    },
    accordionBody: {
      paddingHorizontal: s(16),
      paddingBottom: vs(14),
      paddingTop: vs(6),
      gap: vs(10),
    },

    section: {
      gap: vs(4),
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.outlineVariant,
      marginVertical: vs(4),
      opacity: 0.6,
    },

    sectionTitle: {
      fontSize: ms(13, 0.2),
      fontWeight: '700',
      marginBottom: vs(2),
    },

    paragraph: {
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurface,
    },
    paragraphSmall: {
      fontSize: ms(11.5, 0.2),
      color: theme.colors.onSurfaceVariant,
      marginTop: vs(2),
    },

    bold: {
      fontWeight: '700',
    },

    // steps
    stepsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(10),
      marginTop: vs(4),
    },
    step: {
      flex: 1,
      minWidth: s(120),
      gap: vs(1),
    },
    stepNumber: {
      fontSize: ms(11, 0.2),
      color: theme.colors.onSurfaceVariant,
      fontWeight: '600',
    },
    stepLabel: {
      fontSize: ms(12, 0.2),
      fontWeight: '600',
    },
    stepText: {
      fontSize: ms(11, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    // tier badges (badge-style circles like in meal rows)
    tierRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      marginTop: vs(6),
    },
    tierBadge: {
      width: s(26),
      height: s(26),
      borderRadius: s(13),
      borderWidth: StyleSheet.hairlineWidth,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tierBadgeText: {
      fontWeight: '700',
      fontSize: ms(12, 0.2),
    },

    // two-column lists
    twoColumn: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(12),
      marginTop: vs(4),
    },
    column: {
      flex: 1,
      minWidth: s(150),
      gap: vs(2),
    },
    columnHeader: {
      fontSize: ms(12, 0.2),
      fontWeight: '600',
      marginBottom: vs(2),
    },
    bullet: {
      fontSize: ms(11.5, 0.2),
      color: theme.colors.onSurface,
    },

    // food type chips
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6),
      marginTop: vs(4),
      marginBottom: vs(2),
    },
    typeChip: {
      paddingHorizontal: s(8),
      paddingVertical: vs(3),
      borderRadius: s(999),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outlineVariant,
      fontSize: ms(11, 0.2),
    },
  });
}
