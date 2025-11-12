import { BrandLogo } from '@/components/BrandLogo';
import { useBreakpoints, useResponsiveStyles, useResponsiveValue } from '@/theme/responsive';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
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

  return (
    <Surface mode="flat" elevation={0} style={styles.page}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: styles.scrollContent.paddingBottom + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.center}>
          <View style={styles.logoWrap}>
            <BrandLogo />
          </View>

          <Text
            variant={headlineVariant}
            style={styles.title}
            accessibilityRole="header"
            {...(Platform.OS === 'web' ? { accessibilityLevel: 1 as any } : {})}
          >
            Home
          </Text>

          <Text style={styles.subtitle}>This is your main screen.</Text>

          <View style={styles.actions}>
            <Button mode="contained" onPress={() => {}} accessibilityLabel="Primary action">
              Primary
            </Button>
            <Button mode="outlined" onPress={() => {}} accessibilityLabel="Secondary action">
              Secondary
            </Button>
          </View>
        </View>
      </ScrollView>
    </Surface>
  );
}

function makeStyles(
  theme: MD3Theme,
  bp: { isXL: boolean; isLG: boolean; isMD: boolean; isSM: boolean },
) {
  const horizontal = bp.isXL ? s(32) : bp.isLG ? s(28) : bp.isMD ? s(20) : s(16);
  const vertical = bp.isXL ? vs(28) : bp.isLG ? vs(24) : bp.isMD ? vs(20) : vs(16);
  const maxWidth = bp.isXL ? s(1024) : bp.isLG ? s(864) : bp.isMD ? s(720) : '100%';
  const logoSize = bp.isXL ? s(144) : bp.isLG ? s(128) : bp.isMD ? s(120) : s(112);

  return StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: {
      paddingHorizontal: horizontal,
      paddingTop: vertical,
      paddingBottom: vertical,
      alignItems: 'stretch',
    },
    center: { alignSelf: 'center', alignItems: 'center', gap: s(8), width: '100%', maxWidth },
    logoWrap: { width: logoSize, height: logoSize, alignItems: 'center', justifyContent: 'center' },
    title: { marginTop: vs(8), textAlign: 'center' },
    subtitle: {
      opacity: 0.8,
      fontSize: ms(16, 0.2),
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
    actions: {
      marginTop: vs(16),
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      columnGap: s(12),
      rowGap: vs(8),
    },
  });
}
