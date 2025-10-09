import { useEffect, useState } from 'react';
import { useSettingsStore } from '../store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((state) => state.settings.theme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
  }, [theme, systemTheme]);

  return <>{children}</>;
}
