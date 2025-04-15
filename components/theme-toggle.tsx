'use client';

import { useTheme } from '@/lib/theme-provider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-1.5">
      <Sun className="h-3.5 w-3.5 text-muted-foreground" />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        className="data-[state=checked]:bg-primary"
        aria-label="Toggle theme"
      />
      <Moon className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
} 