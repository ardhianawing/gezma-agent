'use client';

import { Search } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export function SearchInput({ value, onChange, placeholder = 'Cari...', style }: SearchInputProps) {
  const { c } = useTheme();

  return (
    <div style={{ position: 'relative', flex: 1, ...style }}>
      <div
        style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: c.textLight,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search style={{ width: '20px', height: '20px' }} />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          height: '44px',
          paddingLeft: '52px',
          paddingRight: '16px',
          fontSize: '14px',
          border: `1px solid ${c.border}`,
          borderRadius: '8px',
          outline: 'none',
          backgroundColor: c.cardBg,
          color: c.textPrimary,
        }}
      />
    </div>
  );
}
