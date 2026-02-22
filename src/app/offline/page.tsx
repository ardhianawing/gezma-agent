'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export default function OfflinePage() {
  const { c } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: c.pageBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '448px',
        backgroundColor: c.cardBg,
        borderRadius: '16px',
        border: `1px solid ${c.border}`,
        padding: '32px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: c.cardBgHover,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <WifiOff style={{ width: '40px', height: '40px', color: c.textMuted }} />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: '700', color: c.textPrimary, margin: '0 0 8px 0' }}>
          You&apos;re Offline
        </h1>
        <p style={{ color: c.textMuted, margin: '0 0 24px 0', fontSize: '14px' }}>
          It looks like you&apos;ve lost your internet connection. Please check your connection and try again.
        </p>

        <button
          onClick={() => window.location.reload()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: c.primary,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          <RefreshCw style={{ width: '16px', height: '16px' }} />
          Try Again
        </button>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${c.border}` }}>
          <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>
            Some features may still work offline. Your data will sync when you&apos;re back online.
          </p>
        </div>
      </div>
    </div>
  );
}
