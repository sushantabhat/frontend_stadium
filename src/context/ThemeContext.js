import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { colors as darkColors } from '../constants/theme';
import { loadBackgroundMode, saveBackgroundMode } from '../utils/storage';

/* ─── Booking.com-inspired light palette ─── */
const lightColors = {
  background: '#F5F5F5',
  backgroundDeep: '#EBEBEB',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceHighlight: '#F0F0F0',
  border: '#E5E7EB',
  borderLight: '#D1D5DB',
  borderSubtle: '#F3F4F6',

  textPrimary: '#1A1A2E',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  primary: '#003580',
  primaryLight: '#0071C2',
  primaryDark: '#00224F',
  primaryGlow: 'rgba(0, 53, 128, 0.15)',
  primarySurface: 'rgba(0, 53, 128, 0.08)',

  accent: '#FEBB02',
  accentLight: '#FFD24D',
  accentDark: '#E6A800',
  accentSurface: 'rgba(254, 187, 2, 0.12)',

  danger: '#CC0000',
  dangerLight: '#FF4444',
  dangerSurface: 'rgba(204, 0, 0, 0.08)',

  success: '#008009',
  successLight: '#34A853',
  successSurface: 'rgba(0, 128, 9, 0.08)',

  warning: '#FEBB02',
  warningLight: '#FFD24D',
  warningSurface: 'rgba(254, 187, 2, 0.12)',

  info: '#0071C2',
  infoLight: '#4DA3FF',
  infoSurface: 'rgba(0, 113, 194, 0.08)',

  gradientStart: '#003580',
  gradientEnd: '#0071C2',
  gradientAccent: '#FEBB02',
  gradientHero: ['#003580', '#0071C2'],
  gradientCard: ['#FFFFFF', '#F5F5F5'],
  gradientPurple: ['#003580', '#0071C2'],
  gradientGold: ['#FEBB02', '#E6A800'],
  gradientLive: ['#CC0000', '#FF4444'],
};

const MODES = {
  default: { background: '#07080B', label: 'Default Dark', isLight: false },
  midnight: { background: '#0A0E1A', label: 'Midnight Blue', isLight: false },
  obsidian: { background: '#0F0F1A', label: 'Obsidian', isLight: false },
  light: { background: '#F5F5F5', label: 'Light (Booking.com)', isLight: true },
};

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('default');

  useEffect(() => {
    loadBackgroundMode().then((saved) => {
      if (saved && MODES[saved]) setMode(saved);
    });
  }, []);

  const setBackgroundMode = useCallback(async (newMode) => {
    setMode(newMode);
    await saveBackgroundMode(newMode);
  }, []);

  const value = useMemo(() => {
    const isLight = MODES[mode]?.isLight || false;
    const themeColors = isLight ? { ...darkColors, ...lightColors } : darkColors;
    return {
      backgroundMode: mode,
      setBackgroundMode,
      backgroundColor: MODES[mode].background,
      modes: MODES,
      isLight,
      themeColors,
    };
  }, [mode, setBackgroundMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useBackgroundColor() {
  const ctx = useContext(ThemeContext);
  return ctx?.backgroundColor || darkColors.background;
}

export function useColors() {
  const ctx = useContext(ThemeContext);
  return ctx?.themeColors || darkColors;
}

export function useTheme() {
  return useContext(ThemeContext);
}