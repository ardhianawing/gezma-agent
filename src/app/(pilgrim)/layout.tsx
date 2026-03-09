'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { PilgrimProvider, usePilgrim } from '@/lib/contexts/pilgrim-context';
import { PilgrimErrorBoundary } from '@/components/pilgrim-error-boundary';
import SOSButton from '@/components/pilgrim/sos-button';

const PILGRIM_GREEN = '#059669';
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

const MOBILE_NAV_ITEMS = [
  NAV_ITEMS[0],  // Beranda
  NAV_ITEMS[1],  // Perjalanan
  NAV_ITEMS[3],  // Manasik
  NAV_ITEMS[4],  // Doa
  NAV_ITEMS[12], // Profil
];

function PilgrimLayoutInner({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { data, isLoading } = usePilgrim();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/pilgrim/login';
  const isDesktop = !isMobile && !isTablet;

  useEffect(() => {
    if (!isLoading && !data && !isLoginPage) {
      router.replace('/pilgrim/login');
    }
  }, [isLoading, data, isLoginPage, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: c.pageBg, color: c.textMuted, fontSize: '16px',
      }}>
        Memuat...
      </div>
    );
  }

  if (isLoginPage) {
    return <div style={{ minHeight: '100vh', backgroundColor: c.pageBg }}>{children}</div>;
  }

  if (!data) return null;

  // Desktop: sidebar layout
  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: c.pageBg }}>
        {/* Sidebar */}
        <aside style={{
          width: '240px',
          flexShrink: 0,
          backgroundColor: c.cardBg,
          borderRight: '1px solid ' + c.border,
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          overflowY: 'auto',
        }}>
          {/* Logo */}
          <div style={{
            padding: '20px 20px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderBottom: '1px solid ' + c.border,
          }}>
            <Image src="/logo-light.png" alt="GEZMA" width={32} height={32} style={{ objectFit: 'contain' }} />
            <span style={{ fontWeight: 700, fontSize: '16px', color: PILGRIM_GREEN, letterSpacing: '-0.02em' }}>
              GEZMA Pilgrim
            </span>
          </div>

          {/* User info */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid ' + c.border,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: PILGRIM_GREEN_LIGHT, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', fontWeight: 700, color: PILGRIM_GREEN,
            }}>
              {data.pilgrim.name.charAt(0)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {data.pilgrim.name}
              </div>
              <div style={{ fontSize: '11px', color: c.textMuted }}>Jemaah Umrah</div>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '10px', textDecoration: 'none',
                    fontSize: '14px', fontWeight: isActive ? 600 : 400,
                    color: isActive ? PILGRIM_GREEN : c.textSecondary,
                    backgroundColor: isActive ? PILGRIM_GREEN_LIGHT : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{item.emoji}</span>
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid ' + c.border, fontSize: '11px', color: c.textLight }}>
            &copy; 2026 GEZMA Technology
          </div>
        </aside>

        {/* Main content area */}
        <div style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column' }}>
          <main style={{
            flex: 1, padding: '28px 32px',
            maxWidth: '1100px', width: '100%',
            margin: '0 auto', boxSizing: 'border-box',
          }}>
            <PilgrimErrorBoundary>{children}</PilgrimErrorBoundary>
          </main>
        </div>

        <SOSButton />
      </div>
    );
  }

  // Tablet: top header with scrollable nav
  if (isTablet) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: c.pageBg, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          backgroundColor: c.cardBg, borderBottom: '1px solid ' + c.border,
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          {/* Top bar */}
          <div style={{
            padding: '0 20px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Image src="/logo-light.png" alt="GEZMA" width={28} height={28} style={{ objectFit: 'contain' }} />
              <span style={{ fontWeight: 700, fontSize: '16px', color: PILGRIM_GREEN }}>GEZMA Pilgrim</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                backgroundColor: PILGRIM_GREEN_LIGHT, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700, color: PILGRIM_GREEN,
              }}>
                {data.pilgrim.name.charAt(0)}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: c.textSecondary }}>
                {data.pilgrim.name.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Scrollable nav */}
          <nav style={{
            display: 'flex', overflowX: 'auto', padding: '0 16px 10px',
            gap: '4px', scrollbarWidth: 'none',
          }}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '7px 14px', borderRadius: '20px', textDecoration: 'none',
                    fontSize: '13px', fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap', flexShrink: 0,
                    color: isActive ? PILGRIM_GREEN : c.textMuted,
                    backgroundColor: isActive ? PILGRIM_GREEN_LIGHT : c.pageBg,
                    border: `1px solid ${isActive ? PILGRIM_GREEN : c.border}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '15px' }}>{item.emoji}</span>
                  {item.label}
                </a>
              );
            })}
          </nav>
        </header>

        <main style={{
          flex: 1, padding: '20px 24px',
          maxWidth: '900px', width: '100%',
          margin: '0 auto', boxSizing: 'border-box',
        }}>
          <PilgrimErrorBoundary>{children}</PilgrimErrorBoundary>
        </main>

        <SOSButton />
      </div>
    );
  }

  // Mobile
  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.pageBg, display: 'flex', flexDirection: 'column' }}>
      {/* Mobile header */}
      <header style={{
        backgroundColor: c.cardBg, borderBottom: '1px solid ' + c.border,
        padding: '0 16px', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Image src="/logo-light.png" alt="GEZMA" width={24} height={24} style={{ objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: '15px', color: PILGRIM_GREEN }}>GEZMA Pilgrim</span>
        </div>
        <span style={{ fontSize: '13px', color: c.textMuted, fontWeight: 500 }}>
          {data.pilgrim.name.split(' ')[0]}
        </span>
      </header>

      {/* Main content */}
      <main style={{
        flex: 1, padding: '16px',
        paddingBottom: '120px',
        maxWidth: '800px', width: '100%',
        margin: '0 auto', boxSizing: 'border-box',
      }}>
        <PilgrimErrorBoundary>{children}</PilgrimErrorBoundary>
      </main>

      <SOSButton />

      {/* Mobile bottom nav — 5 primary items */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px',
        backgroundColor: c.cardBg, borderTop: '1px solid ' + c.border,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '2px', textDecoration: 'none', padding: '6px 0',
                borderRadius: '8px', minWidth: '60px', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '22px', filter: isActive ? 'none' : 'grayscale(0.5)' }}>
                {item.emoji}
              </span>
              <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400, color: isActive ? PILGRIM_GREEN : c.textMuted }}>
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Mobile secondary nav — scrollable strip */}
      <div style={{
        position: 'fixed',
        bottom: `calc(60px + env(safe-area-inset-bottom, 0px))`,
        left: 0, right: 0, height: '44px',
        backgroundColor: c.cardBg, borderTop: '1px solid ' + c.border,
        display: 'flex', alignItems: 'center', overflowX: 'auto',
        zIndex: 49, paddingLeft: '8px', paddingRight: '8px',
        gap: '4px', scrollbarWidth: 'none',
      }}>
        {NAV_ITEMS.filter(item => !MOBILE_NAV_ITEMS.includes(item)).map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                textDecoration: 'none', padding: '6px 12px', borderRadius: '20px',
                whiteSpace: 'nowrap', flexShrink: 0, fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? PILGRIM_GREEN : c.textMuted,
                backgroundColor: isActive ? PILGRIM_GREEN_LIGHT : c.pageBg,
                border: `1px solid ${isActive ? PILGRIM_GREEN : c.border}`,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '14px' }}>{item.emoji}</span>
              {item.label}
            </a>
          );
        })}
      </div>
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
