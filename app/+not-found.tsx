import PageShell from '@/components/PageShell';
import { useBreakpoints, useResponsiveStyles, useResponsiveValue } from '@/theme/responsive';
import { useRouter } from 'expo-router';
import { StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Button, Icon, Surface, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

export default function NotFoundScreen() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);
  const router = useRouter();

  const headlineVariant = useResponsiveValue({
    base: 'headlineSmall',
    lg: 'headlineMedium',
    xl: 'headlineLarge',
  }) as 'headlineSmall' | 'headlineMedium' | 'headlineLarge';

  const descriptionVariant = useResponsiveValue({
    base: 'bodyMedium',
    lg: 'bodyLarge',
    xl: 'titleMedium',
  }) as 'bodyMedium' | 'bodyLarge' | 'titleMedium';

  const iconSize = useResponsiveValue({ base: 56, md: 72, lg: 84 });

  const goHome = () => router.replace('/(app)/home');
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else goHome();
  };

  return (
    <PageShell bottomExtra={vs(24)} contentStyle={styles.content}>
      <Surface style={styles.card} elevation={1}>
        <View style={styles.iconWrap}>
          <Icon source="map-search-outline" size={iconSize} color={theme.colors.primary} />
        </View>

        <Text variant={headlineVariant} style={styles.title} accessibilityRole="header">
          Page not found
        </Text>

        <Text variant={descriptionVariant} style={styles.subtitle} numberOfLines={3}>
          We couldn&apos;t find the page you were looking for. It might have been moved, or the link
          could be incorrect.
        </Text>

        <View style={styles.actions}>
          <Button mode="contained" onPress={goHome} style={styles.primaryButton}>
            Go to Home
          </Button>
          <Button mode="outlined" onPress={goBack}>
            Go back
          </Button>
        </View>
      </Surface>
    </PageShell>
  );
}

function makeStyles(theme: MD3Theme, _bp: any) {
  const padX = s(16);
  const padY = vs(24);

  type Styles = {
    content: ViewStyle;
    card: ViewStyle;
    iconWrap: ViewStyle;
    title: TextStyle;
    subtitle: TextStyle;
    actions: ViewStyle;
    primaryButton: ViewStyle;
  };

  return StyleSheet.create<Styles>({
    // used as PageShell contentStyle
    content: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: padY,
      paddingHorizontal: padX,
    },

    card: {
      width: '100%',
      maxWidth: 520,
      borderRadius: s(16),
      paddingHorizontal: padX,
      paddingVertical: padY,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      alignSelf: 'center',
    },

    iconWrap: {
      marginBottom: vs(16),
    },

    title: {
      textAlign: 'center',
      marginBottom: vs(8),
    },

    subtitle: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.9,
      marginBottom: vs(24),
      fontSize: ms(15, 0.2),
    },

    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      justifyContent: 'center',
    },

    primaryButton: {
      minWidth: 140,
    },
  });
}
