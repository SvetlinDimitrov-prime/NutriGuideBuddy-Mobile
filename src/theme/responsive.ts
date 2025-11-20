import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import type { MD3Theme } from 'react-native-paper';

export const BREAKPOINTS = {
  sm: 0,
  md: 600,
  lg: 900,
  xl: 1200,
} as const;

export type BreakpointKey = 'sm' | 'md' | 'lg' | 'xl';

export type Breakpoints = {
  width: number;
  isSM: boolean;
  isMD: boolean;
  isLG: boolean;
  isXL: boolean;
};

export function useBreakpoints(): Breakpoints {
  const { width } = useWindowDimensions();
  return useMemo(() => {
    const isXL = width >= BREAKPOINTS.xl;
    const isLG = width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl;
    const isMD = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
    const isSM = width < BREAKPOINTS.md;
    return { width, isSM, isMD, isLG, isXL };
  }, [width]);
}

export function useResponsiveValue<T>(values: { base: T; md?: T; lg?: T; xl?: T }): T {
  const { width } = useWindowDimensions();
  if (width >= BREAKPOINTS.xl && values.xl !== undefined) return values.xl;
  if (width >= BREAKPOINTS.lg && values.lg !== undefined) return values.lg;
  if (width >= BREAKPOINTS.md && values.md !== undefined) return values.md;
  return values.base;
}

export function useResponsiveStyles<T extends object>(
  theme: MD3Theme,
  bp: Breakpoints,
  factory: (theme: MD3Theme, bp: Breakpoints) => T,
): T {
  return useMemo(() => factory(theme, bp), [theme, bp, factory]);
}
