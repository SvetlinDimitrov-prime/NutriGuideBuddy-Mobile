import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
  type MD3Theme,
} from 'react-native-paper';

type Mode = 'system' | 'light' | 'dark';

const fontConfig = {
  displayLarge: { fontFamily: 'PoppinsSemiBold' },
  displayMedium: { fontFamily: 'PoppinsSemiBold' },
  displaySmall: { fontFamily: 'PoppinsSemiBold' },
  headlineLarge: { fontFamily: 'PoppinsSemiBold' },
  headlineMedium: { fontFamily: 'PoppinsSemiBold' },
  headlineSmall: { fontFamily: 'PoppinsSemiBold' },
  titleLarge: { fontFamily: 'PoppinsSemiBold' },
  titleMedium: { fontFamily: 'PoppinsSemiBold' },
  titleSmall: { fontFamily: 'PoppinsSemiBold' },
  labelLarge: { fontFamily: 'Inter' },
  labelMedium: { fontFamily: 'Inter' },
  labelSmall: { fontFamily: 'Inter' },
  bodyLarge: { fontFamily: 'Inter' },
  bodyMedium: { fontFamily: 'Inter' },
  bodySmall: { fontFamily: 'Inter' },
};

const STORAGE_KEY = '@theme-mode';

type Ctx = {
  mode: Mode;
  setMode: (m: Mode) => void;
  toggleMode: () => void;
  theme: MD3Theme;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<Mode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setMode(v);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  }, [mode]);

  const resolved = mode === 'system' ? (system ?? 'light') : mode;
  const base = resolved === 'dark' ? MD3DarkTheme : MD3LightTheme;

  const theme = useMemo<MD3Theme>(
    () => ({
      ...base,
      fonts: configureFonts({ config: fontConfig }),
    }),
    [base],
  );

  const value = useMemo<Ctx>(
    () => ({
      mode,
      setMode,
      toggleMode: () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark')),
      theme,
    }),
    [mode, theme],
  );

  return (
    <ThemeCtx.Provider value={value}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeCtx.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useThemeMode must be used inside ThemeProvider');
  return ctx;
}
