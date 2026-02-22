import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const THEMES = {
  light: {
    '--bg': '#ffffff',
    '--text': '#111111',
    '--accent': '#2563eb',
  },
  'dark-gold': {
    '--bg': '#0a0a0a',
    '--text': '#d4af37',
    '--accent': '#d4af37',
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const vars = THEMES[theme] || THEMES.light;
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark-gold' : 'light'));

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
