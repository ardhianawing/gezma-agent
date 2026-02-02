'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export function ThemeToggle() {
  const { theme, toggleTheme, c } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        border: `1px solid ${c.border}`,
        backgroundColor: c.cardBg,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? (
        <Moon style={{ width: '20px', height: '20px', color: c.textMuted }} />
      ) : (
        <Sun style={{ width: '20px', height: '20px', color: '#FBBF24' }} />
      )}
    </button>
  );
}
