'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { c } = useTheme();

  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px',
        minHeight: '60vh',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: c.errorLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <AlertTriangle style={{ width: '32px', height: '32px', color: c.error }} />
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: c.textPrimary, margin: '0 0 8px 0' }}>
        Terjadi Kesalahan
      </h2>
      <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 24px 0', maxWidth: '400px', lineHeight: '1.6' }}>
        Halaman ini mengalami error. Silakan coba muat ulang atau kembali ke dashboard.
      </p>
      <button
        onClick={reset}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: c.primary,
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
        }}
      >
        <RefreshCw style={{ width: '16px', height: '16px' }} />
        Coba Lagi
      </button>
    </div>
  );
}
