'use client';

import { ReactNode } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { TableSkeleton } from './loading-skeleton';
import { EmptyState } from './empty-state';
import { Pagination } from './pagination';
import { LucideIcon } from 'lucide-react';

// Column definition
export interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => ReactNode;
  width?: string;
  minWidth?: string;
  hideOnMobile?: boolean;
  sortable?: boolean;
}

// Table props
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  keyExtractor: (row: T) => string;

  // Pagination
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
    itemLabel?: string;
  };

  // Empty state
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; href?: string; onClick?: () => void };

  // Row click
  onRowClick?: (row: T) => void;

  // Skeleton config
  skeletonRows?: number;

  // Header slot (above the table, inside the card)
  headerSlot?: ReactNode;

  // Custom row style (e.g. for selection highlight)
  rowStyle?: (row: T) => React.CSSProperties | undefined;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  keyExtractor,
  pagination,
  emptyIcon,
  emptyTitle = 'Tidak ada data',
  emptyDescription,
  emptyAction,
  onRowClick,
  skeletonRows = 5,
  headerSlot,
  rowStyle,
}: DataTableProps<T>) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const visibleColumns = isMobile
    ? columns.filter((col) => !col.hideOnMobile)
    : columns;

  return (
    <div
      style={{
        backgroundColor: c.cardBg,
        border: `1px solid ${c.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {headerSlot}

      {loading ? (
        <TableSkeleton rows={skeletonRows} columns={visibleColumns.length} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : isMobile ? (
        /* Mobile: Card layout */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: c.borderLight }}>
          {data.map((row, index) => {
            const customRowStyle = rowStyle ? rowStyle(row) : undefined;
            return (
              <div
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{
                  backgroundColor: customRowStyle?.backgroundColor || c.cardBg,
                  padding: '16px',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background 150ms ease',
                  position: 'relative',
                  ...customRowStyle,
                }}
              >
                {columns.map((col) => {
                  if (col.key === 'select') {
                    return (
                      <div
                        key={col.key}
                        style={{ position: 'absolute', top: '16px', right: '16px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {col.render(row, index)}
                      </div>
                    );
                  }
                  return null;
                })}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                  {columns.filter((col) => col.key !== 'select' && col.key !== 'actions').map((col) => (
                    <div key={col.key} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {col.header && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: c.textMuted,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          {col.header}
                        </span>
                      )}
                      <div style={{ fontSize: '14px', color: c.textSecondary }}>
                        {col.render(row, index)}
                      </div>
                    </div>
                  ))}
                  {/* Actions row */}
                  {columns.filter((col) => col.key === 'actions').map((col) => (
                    <div
                      key={col.key}
                      style={{
                        display: 'flex',
                        gap: '8px',
                        paddingTop: '8px',
                        borderTop: `1px solid ${c.borderLight}`,
                        marginTop: '4px',
                      }}
                    >
                      {col.render(row, index)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tablet/Desktop: Table layout */
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: c.cardBgHover, borderBottom: `1px solid ${c.border}` }}>
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      textAlign: 'left',
                      padding: '16px 24px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: c.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                      width: col.width,
                      minWidth: col.minWidth,
                    }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const customRowStyle = rowStyle ? rowStyle(row) : undefined;
                return (
                <tr
                  key={keyExtractor(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={{
                    borderBottom: index < data.length - 1 ? `1px solid ${c.borderLight}` : 'none',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background 150ms ease',
                    ...customRowStyle,
                  }}
                  onMouseEnter={(e) => {
                    if (onRowClick) e.currentTarget.style.background = c.cardBgHover;
                  }}
                  onMouseLeave={(e) => {
                    if (onRowClick) e.currentTarget.style.background = customRowStyle?.backgroundColor as string || '';
                  }}
                >
                  {visibleColumns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: '16px 24px',
                        fontSize: '14px',
                        color: c.textSecondary,
                        width: col.width,
                        minWidth: col.minWidth,
                      }}
                    >
                      {col.render(row, index)}
                    </td>
                  ))}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && !loading && data.length > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={pagination.onPageChange}
          itemLabel={pagination.itemLabel}
        />
      )}
    </div>
  );
}
