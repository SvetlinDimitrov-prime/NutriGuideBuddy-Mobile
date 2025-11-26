import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import {
  Image,
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
  type ImageStyle,
} from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { List, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

type Props = {
  info?: string | null;
  largeInfo?: string | null;
  picture?: string | null;
};

export function AboutSection({ info, largeInfo, picture }: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const hasAbout = !!info || !!largeInfo || !!picture;
  if (!hasAbout) return null;

  return (
    <List.Accordion
      title="About this food"
      style={styles.aboutAccordion}
      titleStyle={styles.aboutTitle}
    >
      <View style={styles.aboutBody}>
        {picture && (
          <View style={styles.imageWrap}>
            <Image
              source={{ uri: picture }}
              style={styles.image}
              resizeMode="cover"
              accessibilityLabel={info || largeInfo || 'Food image'}
            />
          </View>
        )}

        <View style={styles.textWrap}>
          {!!info && <Text style={styles.bodyText}>{info}</Text>}
          {!!largeInfo && <Text style={styles.bodyText}>{largeInfo}</Text>}
        </View>
      </View>
    </List.Accordion>
  );
}

function makeStyles(theme: MD3Theme, bp: any) {
  const isWide = bp.isMD || bp.isLG || bp.isXL;

  const imgMaxWidth = isWide ? s(200) : s(260);

  type Styles = {
    aboutAccordion: ViewStyle;
    aboutBody: ViewStyle;
    aboutTitle: TextStyle;
    imageWrap: ViewStyle;
    image: ImageStyle;
    textWrap: ViewStyle;
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

    // Row on wide screens, stacked on small
    aboutBody: {
      flexDirection: isWide ? 'row' : 'column',
      alignItems: isWide ? 'flex-start' : 'center',
      paddingHorizontal: s(14),
      paddingTop: vs(10),
      paddingBottom: vs(12),
      gap: vs(10),
    },

    aboutTitle: {
      fontWeight: '600',
      fontSize: ms(14, 0.2),
    },

    imageWrap: {
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },

    image: {
      width: imgMaxWidth, // <- explicit width so it actually shows
      aspectRatio: 4 / 3,
      borderRadius: s(8),
    },

    textWrap: {
      flex: 1,
      alignSelf: 'stretch',
    },

    bodyText: {
      fontSize: ms(13, 0.2),
      color: theme.colors.onSurface,
      lineHeight: ms(18, 0.2),
      textAlign: 'left',
    },
  });
}
