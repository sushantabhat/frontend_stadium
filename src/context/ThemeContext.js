import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { colors, glass } from '../constants/theme';
import { loadBackgroundMode, saveBackgroundMode } from '../utils/storage';

const MODES = {
  default: { background: '#07080B', label: 'Default Dark' },
  midnight: { background: '#0A0E1A', label: 'Midnight Blue' },
  obsidian: { background: '#0F0F1A', label: 'Obsidian' },
  light: { background: '#F2F2F7', label: 'Light Gray' },
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

  const value = useMemo(() => ({
    backgroundMode: mode,
    setBackgroundMode,
    backgroundColor: MODES[mode].background,
    modes: MODES,
  }), [mode, setBackgroundMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useBackgroundColor() {
  const ctx = useContext(ThemeContext);
  return ctx?.backgroundColor || colors.background;
}

export function useTheme() {
  return useContext(ThemeContext);
}
