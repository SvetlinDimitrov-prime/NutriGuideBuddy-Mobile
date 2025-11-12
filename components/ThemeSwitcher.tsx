import { useThemeMode } from '@/theme/ThemeProvider';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { IconButton, Menu } from 'react-native-paper';

type ModeKey = 'system' | 'light' | 'dark';

export default function ThemeSwitcher() {
  const { mode, setMode } = useThemeMode();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const openMenu = useCallback(() => setOpen(true), []);
  const onPick = useCallback(
    (key: ModeKey) => {
      setMode(key);
      close();
    },
    [setMode, close],
  );

  const items = useMemo(
    () => [
      { key: 'system' as const, title: 'System', icon: 'theme-light-dark' },
      { key: 'light' as const, title: 'Light', icon: 'white-balance-sunny' },
      { key: 'dark' as const, title: 'Dark', icon: 'weather-night' },
    ],
    [],
  );

  return (
    <Menu
      visible={open}
      onDismiss={close}
      anchor={
        <View>
          <IconButton
            icon="theme-light-dark"
            onPress={openMenu}
            accessibilityRole="button"
            accessibilityLabel="Change theme"
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          />
        </View>
      }
    >
      {items.map(({ key, title, icon }) => (
        <Menu.Item
          key={key}
          leadingIcon={icon}
          title={title}
          trailingIcon={mode === key ? 'check' : undefined}
          onPress={() => onPick(key)}
        />
      ))}
    </Menu>
  );
}
