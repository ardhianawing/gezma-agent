'use client';

import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  label?: string;
  itemLabel?: string;
}

export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  label = 'Menampilkan',
  itemLabel = 'data',
}: PaginationProps) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const buttonStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    fontSize: '14px',
    color: disabled ? c.textLight : c.textSecondary,
    backgroundColor: c.cardBg,
    border: `1px solid ${c.border}`,
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '12px 16px' : '16px 24px',
        borderTop: `1px solid ${c.border}`,
        backgroundColor: c.cardBgHover,
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', color: c.textSecondary }}>
        {label} <span style={{ fontWeight: '500' }}>{total}</span> {itemLabel}
      </p>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            style={buttonStyle(page <= 1)}
          >
            Sebelumnya
          </button>

          <span style={{ fontSize: '13px', color: c.textMuted, padding: '0 4px' }}>
            {page} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            style={buttonStyle(page >= totalPages)}
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
