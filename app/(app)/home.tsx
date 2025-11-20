import { useCurrentUserWithDetails } from '@/api/hooks/useUsers';
import { useBreakpoints, useResponsiveStyles, useResponsiveValue } from '@/theme/responsive';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Surface, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ms, s, vs } from 'react-native-size-matters';

export default function Home() {
  const theme = useTheme();
  const bp = useBreakpoints();
  const insets = useSafeAreaInsets();

  const headlineVariant = useResponsiveValue({
    base: 'headlineSmall',
    lg: 'headlineMedium',
    xl: 'headlineLarge',
  }) as 'headlineSmall' | 'headlineMedium' | 'headlineLarge';

  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const { data: userDetails, isLoading, isError, error } = useCurrentUserWithDetails();

  return (
    <Surface mode="flat" elevation={0} style={styles.page}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: styles.scrollContent.paddingBottom + insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Text
            variant={headlineVariant}
            style={styles.title}
            accessibilityRole="header"
            {...(Platform.OS === 'web' ? { accessibilityLevel: 1 as any } : {})}
          >
            Home
          </Text>
          <Text style={styles.subtitle}>Debug view – current user JSON</Text>
        </View>

        {/* DEBUG: raw JSON from /user/me/with-details */}
        <Surface style={styles.section} elevation={1}>
          <Text style={styles.sectionTitle}>Your details (raw JSON)</Text>

          {isLoading && <Text>Loading your details…</Text>}

          {isError && (
            <Text style={styles.errorText}>
              Couldn&apos;t load your details: {error?.message ?? 'Unknown error'}
            </Text>
          )}

          {userDetails && (
            <Text selectable style={styles.jsonText}>
              {JSON.stringify(userDetails, null, 2)}
            </Text>
          )}
        </Surface>
      </ScrollView>
    </Surface>
  );
}

function makeStyles(
  theme: MD3Theme,
  bp: { isXL: boolean; isLG: boolean; isMD: boolean; isSM: boolean },
) {
  const padX = bp.isXL ? s(32) : bp.isLG ? s(28) : bp.isMD ? s(20) : s(16);
  const padY = bp.isXL ? vs(28) : bp.isLG ? vs(24) : bp.isMD ? vs(20) : vs(16);

  return StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: {
      paddingHorizontal: padX,
      paddingTop: padY,
      paddingBottom: padY,
      alignItems: 'stretch',
    },

    header: { alignItems: 'center' },
    title: { textAlign: 'center', marginTop: vs(4) },
    subtitle: {
      marginTop: vs(6),
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.9,
      fontSize: ms(15, 0.2),
    },

    section: {
      marginTop: vs(12),
      backgroundColor: theme.colors.surface,
      borderRadius: s(12),
      paddingHorizontal: padX,
      paddingVertical: padY,
      alignSelf: 'center',
      width: '100%',
      maxWidth: bp.isXL ? s(1024) : bp.isLG ? s(864) : bp.isMD ? s(720) : '100%',
    },
    sectionTitle: {
      fontSize: ms(18, 0.2),
      fontWeight: Platform.OS === 'ios' ? '600' : '700',
      marginBottom: vs(8),
    },

    jsonText: {
      marginTop: vs(8),
      fontFamily:
        Platform.OS === 'ios' ? 'Menlo' : Platform.OS === 'android' ? 'monospace' : 'monospace',
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurface,
    },
    errorText: {
      color: theme.colors.error,
      marginTop: vs(4),
    },
  });
}
