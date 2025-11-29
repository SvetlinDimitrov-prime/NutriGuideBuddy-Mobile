import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Text, useTheme } from 'react-native-paper';
import { ms, vs } from 'react-native-size-matters';

type Props = {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
};

export default function PageHeader({ title, subtitle, style }: Props) {
  const theme = useTheme() as MD3Theme;
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function makeStyles(theme: MD3Theme, _bp: { isXL: boolean; isLG: boolean; isMD: boolean }) {
  return StyleSheet.create({
    container: {
      width: '100%',
      gap: vs(2),
      marginBottom: vs(6),
    },
    title: {
      fontSize: ms(20, 0.2),
      fontWeight: '800',
      color: theme.colors.onBackground,
    },
    subtitle: {
      fontSize: ms(12.5, 0.2),
      color: theme.colors.onSurfaceVariant,
    },
  });
}
