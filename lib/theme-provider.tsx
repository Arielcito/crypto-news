'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useDomain } from './use-domain';

interface ThemeContextType {
  domain: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  site: {
    title: string;
    description: string;
    name: string;
  };
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { domain, colors, site } = useDomain();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Get initial theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
    }

    // Apply initial theme
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(savedTheme || (systemPrefersDark ? 'dark' : 'light'));

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ domain, colors, site, theme, setTheme, mounted }}>
      <style jsx global>{`
        :root {
          --primary: ${colors.primary};
          --secondary: ${colors.secondary};
          --tertiary: ${colors.tertiary};
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 