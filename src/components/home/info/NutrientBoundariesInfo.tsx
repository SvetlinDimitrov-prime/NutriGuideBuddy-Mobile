// src/components/home/info/NutrientBoundariesInfo.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, List, Text, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';

export default function NutrientBoundariesInfo() {
  const theme = useTheme() as MD3Theme;
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  return (
    <List.Accordion
      title="How nutrient ranges are set"
      description="What your daily targets mean and why they change."
      style={styles.accordion}
      titleStyle={styles.accordionTitle}
      descriptionStyle={styles.accordionDescription}
    >
      <View style={styles.accordionBody}>
        {/* IMPORTANT DISCLAIMER */}
        <View style={styles.importantBox}>
          <Text style={styles.importantLabel}>Important</Text>
          <Text style={styles.importantText}>
            The nutrient ranges in this app are generated with the help of AI using public nutrition
            references and tuned to be practical for everyday use. They are approximations, not
            medical advice or official clinical guidelines. If a doctor or dietitian has given you
            specific targets, always follow those first.
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* OVERVIEW */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What the ranges mean</Text>
          <Text style={styles.paragraph}>
            Each nutrient in the app has a daily “guide range”. It’s a reasonable window that should
            be helpful for most people with a similar body, activity level and goal. Some nutrients
            mostly care about hitting a minimum (like fibre or vitamin C), others also have an upper
            side we try not to push too hard (like sodium, sugar, saturated fat).
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* HOW TARGETS ADAPT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What the app looks at</Text>
          <Text style={styles.paragraph}>
            Your nutrient ranges are not one-size-fits-all. The app quietly adjusts them based on:
          </Text>
          <Text style={styles.bullet}>
            • <Text style={styles.bold}>Age &amp; sex</Text> – kids, adults and different sexes can
            have different needs.
          </Text>
          <Text style={styles.bullet}>
            • <Text style={styles.bold}>Body size</Text> – your weight (and sometimes height) change
            how much protein and some amino acids you’re guided toward.
          </Text>
          <Text style={styles.bullet}>
            • <Text style={styles.bold}>Daily calories</Text> – carbs, fats and sugar are set as a
            share of your calorie budget, so they scale up or down with it.
          </Text>
          <Text style={styles.bullet}>
            • <Text style={styles.bold}>Your diet settings</Text> – when you define a diet in the
            app, it can nudge certain ranges up or down (for example higher protein or lower carbs).
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* CALORIES / BMR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calorie target &amp; BMR</Text>
          <Text style={styles.paragraph}>
            Many nutrients are based on how many calories you burn in a day. To estimate that, the
            app:
          </Text>
          <Text style={styles.bullet}>
            1. Calculates your <Text style={styles.bold}>BMR</Text> (Basal Metabolic Rate) from your
            weight, height, age and sex. This is roughly what you’d burn doing nothing all day.
          </Text>
          <Text style={styles.bullet}>
            2. Multiplies it by a factor for your <Text style={styles.bold}>workout level</Text>{' '}
            (from sedentary to very active), then nudges it up or down depending on your goal
            (maintain, lose or gain weight).
          </Text>
          <Text style={styles.paragraph}>
            That becomes your daily calorie guide. Carbs, fats and a few other nutrients are built
            as a slice of that calorie “pie”.
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* ENERGY-LINKED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrients tied to calories</Text>
          <Text style={styles.paragraph}>
            Some nutrients are easier to think of as a percentage of calories instead of a fixed
            gram number:
          </Text>
          <Text style={styles.bullet}>
            • <Text style={styles.bold}>Carbs</Text> – usually a moderate share of calories.
          </Text>
          <Text style={styles.bullet}>
            • <Text style={styles.bold}>Fats</Text> – kept in a range that balances energy and heart
            health.
          </Text>
          <Text style={styles.bullet}>
            • <Text style={styles.bold}>Sugar &amp; saturated fat</Text> – mainly upper limits, so
            they don’t crowd out everything else.
          </Text>
          <Text style={styles.paragraph}>
            If your calorie target changes, these numbers move with it.
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* BODY-WEIGHT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrients tied to body weight</Text>
          <Text style={styles.paragraph}>
            Other nutrients scale mostly with how much you weigh. The app uses “per-kg” rules and
            then multiplies them by your body weight:
          </Text>
          <Text style={styles.bullet}>
            • <Text style={styles.bold}>Protein</Text> – set as grams per kilogram of body weight,
            so bigger bodies get a higher absolute target.
          </Text>
          <Text style={styles.bullet}>
            • <Text style={styles.bold}>Essential amino acids</Text> – like leucine or lysine, which
            also follow a per-kg pattern.
          </Text>
          <Text style={styles.paragraph}>
            Update your weight in the app and these targets quietly adapt.
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* DIET / OVERRIDES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How your diet changes things</Text>
          <Text style={styles.paragraph}>
            If you follow a specific approach (for example higher protein, lower carbs, or a
            performance-focused plan), you can influence these ranges by defining your{' '}
            <Text style={styles.bold}>diet</Text> in the app. Your diet settings act like a layer on
            top of the base numbers, nudging certain nutrients up or down while still taking your
            age, sex, calories and body weight into account.
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
      paddingTop: vs(4),
      gap: vs(8),
    },

    importantBox: {
      gap: vs(3),
    },
    importantLabel: {
      fontSize: ms(11.5, 0.2),
      fontWeight: '700',
      color: theme.colors.error,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    importantText: {
      fontSize: ms(11.5, 0.2),
      color: theme.colors.onSurface,
    },

    divider: {
      marginTop: vs(6),
      marginBottom: vs(2),
      opacity: 0.6,
    },

    section: {
      gap: vs(4),
    },
    sectionTitle: {
      fontSize: ms(12.5, 0.2),
      fontWeight: '700',
    },
    paragraph: {
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurface,
    },
    bullet: {
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurface,
      marginTop: vs(1),
    },
    bold: {
      fontWeight: '700',
    },
  });
}
