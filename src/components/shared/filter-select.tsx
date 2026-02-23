'use client';

import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  style?: React.CSSProperties;
}

export function FilterSelect({ value, onChange, options, placeholder = 'Semua', style }: FilterSelectProps) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: '44px',
        padding: '0 16px',
        fontSize: '14px',
        fontWeight: '500',
        color: c.textSecondary,
        backgroundColor: c.cardBg,
        border: `1px solid ${c.border}`,
        borderRadius: '8px',
        cursor: 'pointer',
        width: isMobile ? '100%' : 'auto',
        ...style,
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
