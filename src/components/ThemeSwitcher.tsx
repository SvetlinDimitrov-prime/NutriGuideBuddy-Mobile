import React from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useThemeMode } from '@/theme/ThemeProvider';

function ThemeSwitcherImpl() {
  const { toggleMode, mode } = useThemeMode();
  const theme = useTheme();

  const isDark = mode === 'dark';
  const icon = isDark ? 'white-balance-sunny' : 'weather-night';

  return (
    <IconButton
      icon={icon}
      onPress={toggleMode}
      accessibilityLabel="Toggle theme"
      accessibilityState={{ selected: isDark }}
      size={22}
      style={styles.btn}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      iconColor={isDark ? theme.colors.primary : undefined}
    />
  );
}

export default React.memo(ThemeSwitcherImpl);

const styles = StyleSheet.create({
  btn: { margin: 0 },
});
