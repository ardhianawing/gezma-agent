'use client';

import { useTheme } from '@/lib/theme';

interface SkeletonBoxProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export function SkeletonBox({ width = '100%', height = '14px', borderRadius = '6px', style }: SkeletonBoxProps) {
  const { c } = useTheme();

  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: c.cardBgHover,
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  const { c } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        borderBottom: `1px solid ${c.borderLight}`,
      }}
    >
      <SkeletonBox width="40px" height="40px" borderRadius="50%" />
      <div style={{ flex: 1, display: 'flex', gap: '24px' }}>
        {Array.from({ length: columns - 1 }).map((_, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <SkeletonBox width={i === 0 ? '70%' : '50%'} height="14px" />
            <SkeletonBox width={i === 0 ? '45%' : '30%'} height="10px" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Multiple table rows
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  );
}

// Card skeleton
export function CardSkeleton() {
  const { c } = useTheme();

  return (
    <div
      style={{
        backgroundColor: c.cardBg,
        borderRadius: '12px',
        border: `1px solid ${c.border}`,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <SkeletonBox width="40%" height="12px" />
          <SkeletonBox width="60%" height="24px" />
        </div>
        <SkeletonBox width="40px" height="40px" borderRadius="50%" />
      </div>
      <SkeletonBox width="50%" height="14px" />
    </div>
  );
}

// Stats cards skeleton (grid of 4)
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Detail page skeleton
export function DetailSkeleton() {
  const { c } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonBox width="200px" height="28px" />
          <SkeletonBox width="300px" height="14px" />
        </div>
        <SkeletonBox width="120px" height="40px" borderRadius="8px" />
      </div>

      {/* Info cards */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <SkeletonBox width="120px" height="14px" />
            <SkeletonBox width="200px" height="14px" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Form skeleton
export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  const { c } = useTheme();

  return (
    <div
      style={{
        backgroundColor: c.cardBg,
        borderRadius: '12px',
        border: `1px solid ${c.border}`,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <SkeletonBox width="100px" height="12px" />
          <SkeletonBox width="100%" height="44px" borderRadius="8px" />
        </div>
      ))}
      <SkeletonBox width="120px" height="44px" borderRadius="8px" />
    </div>
  );
}
