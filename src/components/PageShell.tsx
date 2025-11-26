import { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { s, vs } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';

type Props = {
  children: ReactNode;
  contentStyle?: object;
  pageStyle?: object;
  scrollable?: boolean;
  bottomExtra?: number;
};

export default function PageShell({
  children,
  contentStyle,
  pageStyle,
  scrollable = true,
  bottomExtra = 0,
}: Props) {
  const theme = useTheme() as MD3Theme;
  const bp = useBreakpoints();
  const insets = useSafeAreaInsets();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const bottomPad = insets.bottom + bottomExtra;

  if (scrollable) {
    return (
      <Surface style={[styles.page, pageStyle]} elevation={0}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }, contentStyle]}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={Platform.OS !== 'web'}
        >
          {children}
        </ScrollView>
      </Surface>
    );
  }

  return (
    <Surface style={[styles.page, pageStyle]} elevation={0}>
      <View style={[styles.container, { paddingBottom: bottomPad }, contentStyle]}>{children}</View>
    </Surface>
  );
}

function makeStyles(
  theme: MD3Theme,
  bp: { isXL: boolean; isLG: boolean; isMD: boolean; isSM: boolean },
) {
  const isWeb = Platform.OS === 'web';

  const padX = isWeb ? s(20) : bp.isXL ? s(32) : bp.isLG ? s(28) : bp.isMD ? s(22) : s(16);
  const padTop = isWeb ? 24 : bp.isXL ? vs(24) : bp.isLG ? vs(20) : bp.isMD ? vs(18) : vs(12);

  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.colors.background,
      width: '100%',
      alignItems: 'stretch',
    },

    container: {
      flex: 1,
      width: '100%',
      paddingHorizontal: padX,
      paddingTop: padTop,
      backgroundColor: theme.colors.background,
    },

    scroll: {
      flex: 1,
      width: '100%',
    },

    scrollContent: {
      width: '100%',
      alignItems: 'stretch',
      paddingHorizontal: padX,
      paddingTop: padTop,
      backgroundColor: theme.colors.background,
    },
  });
}
