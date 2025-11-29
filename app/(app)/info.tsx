import FoodRankingInfo from '@/components/home/info/FoodRankingInfo';
import NutrientBoundariesInfo from '@/components/home/info/NutrientBoundariesInfo';
import NutrientInfo from '@/components/home/info/NutrientInfo';
import PageHeader from '@/components/PageHeader';
import PageShell from '@/components/PageShell';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { StyleSheet, View } from 'react-native';
import { List, useTheme, type MD3Theme } from 'react-native-paper';
import { vs } from 'react-native-size-matters';

export default function InfoScreen() {
  const theme = useTheme() as MD3Theme;
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  return (
    <PageShell contentStyle={styles.content}>
      <PageHeader
        title="Nutrition guide"
        subtitle="Short, big-picture notes about food, nutrition and how this guide thinks about what you eat."
      />

      <List.Section style={styles.section}>
        <FoodRankingInfo />
        <View style={styles.tabSpacer} />
        <NutrientInfo />
        <View style={styles.tabSpacer} />
        <NutrientBoundariesInfo />
      </List.Section>
    </PageShell>
  );
}

function makeStyles(_theme: MD3Theme, _bp: { isXL: boolean; isLG: boolean; isMD: boolean }) {
  return StyleSheet.create({
    content: {
      width: '100%',
      alignItems: 'stretch',
      gap: vs(10),
    },
    section: {
      width: '100%',
      marginTop: vs(10),
    },
    tabSpacer: {
      height: vs(8),
    },
  });
}
