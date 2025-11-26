import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { List, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

type Props = {
  info?: string | null;
  largeInfo?: string | null;
};

export function AboutSection({ info, largeInfo }: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const hasAbout = !!info || !!largeInfo;
  if (!hasAbout) return null;

  return (
    <List.Accordion
      title="About this food"
      style={styles.aboutAccordion}
      titleStyle={styles.aboutTitle}
    >
      <View style={styles.aboutBody}>
        {!!info && <Text style={styles.bodyText}>{info}</Text>}
        {!!largeInfo && <Text style={styles.bodyText}>{largeInfo}</Text>}
      </View>
    </List.Accordion>
  );
}

function makeStyles(theme: MD3Theme) {
  type Styles = {
    aboutAccordion: ViewStyle;
    aboutBody: ViewStyle;
    aboutTitle: TextStyle;
    bodyText: TextStyle;
  };

  return StyleSheet.create<Styles>({
    aboutAccordion: {
      backgroundColor: theme.colors.surface,
      borderRadius: s(10),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outlineVariant,
      overflow: 'hidden',
    },
    aboutBody: {
      paddingHorizontal: s(14),
      paddingTop: vs(10),
      paddingBottom: vs(12),
      gap: vs(8),
    },
    aboutTitle: {
      fontWeight: '600',
      fontSize: ms(14, 0.2),
    },
    bodyText: {
      fontSize: ms(13, 0.2),
      color: theme.colors.onSurface,
      lineHeight: ms(18, 0.2),
    },
  });
}
