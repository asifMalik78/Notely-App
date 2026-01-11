import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Mode = 'light' | 'dark';
type ColorTheme = 'zinc' | 'rose' | 'blue' | 'green' | 'orange' | 'violet' | 'yellow' | 'cyan' | 'pink' | 'slate';

interface ThemeContextType {
  mode: Mode;
  colorTheme: ColorTheme;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
  setColorTheme: (theme: ColorTheme) => void;
  // Legacy support
  theme: Mode;
  toggleTheme: () => void;
}

export const colorThemes: { value: ColorTheme; label: string; color: string }[] = [
  { value: 'zinc', label: 'Zinc', color: '#71717a' },
  { value: 'rose', label: 'Rose', color: '#e11d48' },
  { value: 'blue', label: 'Blue', color: '#3b82f6' },
  { value: 'green', label: 'Green', color: '#22c55e' },
  { value: 'orange', label: 'Orange', color: '#f97316' },
  { value: 'violet', label: 'Violet', color: '#8b5cf6' },
  { value: 'yellow', label: 'Yellow', color: '#eab308' },
  { value: 'cyan', label: 'Cyan', color: '#06b6d4' },
  { value: 'pink', label: 'Pink', color: '#ec4899' },
  { value: 'slate', label: 'Slate', color: '#64748b' },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(() => {
    const saved = localStorage.getItem('mode') as Mode;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem('colorTheme') as ColorTheme;
    return saved || 'zinc';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mode', mode);
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', colorTheme);
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);

  const toggleMode = () => {
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
  };

  const setColorTheme = (newTheme: ColorTheme) => {
    setColorThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{
      mode,
      colorTheme,
      toggleMode,
      setMode,
      setColorTheme,
      // Legacy support
      theme: mode,
      toggleTheme: toggleMode,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
