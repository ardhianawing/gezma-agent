'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { PilgrimProvider, usePilgrim } from '@/lib/contexts/pilgrim-context';
import { PilgrimErrorBoundary } from '@/components/pilgrim-error-boundary';
import SOSButton from '@/components/pilgrim/sos-button';

const PILGRIM_GREEN = '#059669';
const PILGRIM_GREEN_HOVER = '#047857';
const PILGRIM_GREEN_LIGHT = '#ECFDF5';

const NAV_ITEMS = [
  { label: 'Beranda', emoji: '\u{1F3E0}', href: '/pilgrim' },
  { label: 'Perjalanan', emoji: '\u{2708}\u{FE0F}', href: '/pilgrim/trip' },
  { label: 'Tracking', emoji: '\u{1F4CD}', href: '/pilgrim/tracking' },
  { label: 'Manasik', emoji: '\u{1F4D6}', href: '/pilgrim/manasik' },
  { label: 'Doa', emoji: '\u{1F932}', href: '/pilgrim/doa' },
  { label: 'Packing', emoji: '\u{1F9F3}', href: '/pilgrim/packing' },
  { label: 'Darurat', emoji: '\u{1F6A8}', href: '/pilgrim/emergency' },
  { label: 'Galeri', emoji: '\u{1F4F8}', href: '/pilgrim/gallery' },
  { label: 'Kurs', emoji: '\u{1F4B1}', href: '/pilgrim/currency' },
  { label: 'Toko', emoji: '\u{1F6CD}\u{FE0F}', href: '/pilgrim/shop' },
  { label: 'Pencapaian', emoji: '\u{1F3C6}', href: '/pilgrim/achievements' },
  { label: 'Dokumen', emoji: '\u{1F4CB}', href: '/pilgrim/documents' },
  { label: 'Profil', emoji: '\u{1F464}', href: '/pilgrim/profile' },
];

function PilgrimLayoutInner({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { data, isLoading } = usePilgrim();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/pilgrim/login';

  useEffect(() => {
    if (!isLoading && !data && !isLoginPage) {
      router.replace('/pilgrim/login');
    }
  }, [isLoading, data, isLoginPage, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: c.pageBg,
        color: c.textMuted,
        fontSize: '16px',
      }}>
        Memuat...
      </div>
    );
  }

  if (isLoginPage) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: c.pageBg,
      }}>
        {children}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: c.pageBg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      {!isMobile && (
        <header style={{
          backgroundColor: c.cardBg,
          borderBottom: '1px solid ' + c.border,
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px' }}>{'\u{1F54B}'}</span>
            <span style={{
              fontWeight: 700,
              fontSize: '18px',
              color: PILGRIM_GREEN,
              letterSpacing: '-0.02em',
            }}>
              GEZMA Pilgrim
            </span>
          </div>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? PILGRIM_GREEN : c.textMuted,
                    backgroundColor: isActive ? PILGRIM_GREEN_LIGHT : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{item.emoji}</span>
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: c.textSecondary,
            fontSize: '14px',
          }}>
            <span style={{ fontSize: '20px' }}>{'\u{1F464}'}</span>
            <span style={{ fontWeight: 500 }}>{data.pilgrim.name.split(' ')[0]}</span>
          </div>
        </header>
      )}

      {/* Mobile header */}
      {isMobile && (
        <header style={{
          backgroundColor: c.cardBg,
          borderBottom: '1px solid ' + c.border,
          padding: '0 16px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{'\u{1F54B}'}</span>
            <span style={{
              fontWeight: 700,
              fontSize: '15px',
              color: PILGRIM_GREEN,
            }}>
              GEZMA Pilgrim
            </span>
          </div>
          <span style={{
            fontSize: '13px',
            color: c.textMuted,
            fontWeight: 500,
          }}>
            {data.pilgrim.name.split(' ')[0]}
          </span>
        </header>
      )}

      {/* Main content */}
      <main style={{
        flex: 1,
        padding: isMobile ? '16px' : '24px',
        paddingBottom: isMobile ? '80px' : '24px',
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        <PilgrimErrorBoundary>
          {children}
        </PilgrimErrorBoundary>
      </main>

      {/* SOS Button */}
      <SOSButton />

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '64px',
          backgroundColor: c.cardBg,
          borderTop: '1px solid ' + c.border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 50,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  minWidth: '56px',
                  backgroundColor: isActive ? PILGRIM_GREEN_LIGHT : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  fontSize: '20px',
                  filter: isActive ? 'none' : 'grayscale(0.5)',
                }}>
                  {item.emoji}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? PILGRIM_GREEN : c.textMuted,
                }}>
                  {item.label}
                </span>
              </a>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export default function PilgrimLayout({ children }: { children: React.ReactNode }) {
  return (
    <PilgrimProvider>
      <PilgrimLayoutInner>{children}</PilgrimLayoutInner>
    </PilgrimProvider>
  );
}
