import { useResponsiveValue } from '@/theme/responsive';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Button, Icon, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ms, s, vs } from 'react-native-size-matters';

export default function NotFoundScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = makeStyles(theme);
  const insets = useSafeAreaInsets();

  const bottomSpacerStyle = useMemo(() => ({ height: insets.bottom }), [insets.bottom]);

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

  const goHome = () => router.replace('/(app)/home');
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else goHome();
  };

  return (
    <SafeAreaView style={styles.page} edges={['right', 'bottom', 'left']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Surface style={styles.card} elevation={1}>
          <View style={styles.iconWrap}>
            <Icon
              source="map-search-outline"
              size={useResponsiveValue({ base: 56, md: 72, lg: 84 })}
              color={theme.colors.primary}
            />
          </View>

          <Text variant={headlineVariant} style={styles.title} accessibilityRole="header">
            Page not found
          </Text>

          <Text variant={descriptionVariant} style={styles.subtitle} numberOfLines={3}>
            We couldn&apos;t find the page you were looking for. It might have been moved, or the
            link could be incorrect.
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

        <View style={bottomSpacerStyle} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: MD3Theme) {
  const padX = s(16);
  const padY = vs(24);

  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: padX,
      paddingVertical: padY,
      alignItems: 'center',
      justifyContent: 'center',
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
