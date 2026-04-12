'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  ScrollText,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Shield,
  Menu,
  X,
  CreditCard,
  MessageSquare,
  Wallet,
  Users,
  LucideIcon,
} from 'lucide-react';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { CCErrorBoundary } from '@/components/cc-error-boundary';

// Blue theme for Command Center
const cc = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryHover: '#1D4ED8',
  pageBg: '#F8FAFC',
  cardBg: '#FFFFFF',
  cardBgHover: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  sidebarBg: '#0F172A',
  sidebarBorder: '#1E293B',
  sidebarActiveItem: '#1E3A8A',
  headerBg: 'rgba(255, 255, 255, 0.95)',
};

interface CCAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CCAuthContextType {
  admin: CCAdmin | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const CCAuthContext = createContext<CCAuthContextType>({
  admin: null,
  loading: true,
  logout: async () => {},
});

export function useCCAuth() {
  return useContext(CCAuthContext);
}

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', href: '/command-center', icon: LayoutDashboard },
  { label: 'Agencies', href: '/command-center/agencies', icon: Building2 },
  { label: 'Pilgrims', href: '/command-center/pilgrims', icon: Users },
  { label: 'PayLater', href: '/command-center/paylater', icon: CreditCard },
  { label: 'GezmaPay', href: '/command-center/gezmapay', icon: Wallet },
  { label: 'Forum', href: '/command-center/forum', icon: MessageSquare },
  { label: 'Kepatuhan', href: '/command-center/compliance', icon: ShieldCheck },
  { label: 'Audit Log', href: '/command-center/audit-log', icon: ScrollText },
];

export default function CommandCenterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<CCAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const isMobileOrTablet = isMobile || isTablet;
  const isLoginPage = pathname === '/command-center/login';

  useEffect(() => {
    if (isLoginPage) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }
    fetch('/api/command-center/auth/me')
      .then(r => {
        if (!r.ok) throw new Error('Not authenticated');
        return r.json();
      })
      .then(data => setAdmin(data.admin))
      .catch(() => router.push('/command-center/login'))
      .finally(() => setLoading(false));
  }, [isLoginPage, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    Promise.resolve().then(() => setSidebarOpen(false));
  }, [pathname]);

  const logout = useCallback(async () => {
    await fetch('/api/command-center/auth/logout', { method: 'POST' });
    setAdmin(null);
    router.push('/command-center/login');
  }, [router]);

  // Login page — no sidebar
  if (isLoginPage) {
    return (
      <CCAuthContext.Provider value={{ admin, loading, logout }}>
        <div style={{ minHeight: '100vh', backgroundColor: cc.pageBg }}>
          {children}
        </div>
      </CCAuthContext.Provider>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: cc.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: cc.textMuted }}>Memuat...</p>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === '/command-center') return pathname === '/command-center';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: `1px solid ${cc.sidebarBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/command-center" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Shield style={{ width: '22px', height: '22px', color: 'white' }} />
          </div>
          <div>
            <span style={{ fontSize: '16px', fontWeight: '700', color: 'white', display: 'block' }}>
              GEZMA
            </span>
            <span style={{ fontSize: '10px', fontWeight: '500', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Command Center
            </span>
          </div>
        </Link>
        {isMobileOrTablet && (
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X style={{ width: '24px', height: '24px', color: '#94A3B8' }} />
          </button>
        )}
      </div>

      {/* Menu */}
      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    backgroundColor: active ? cc.sidebarActiveItem : 'transparent',
                    borderLeft: active ? `3px solid ${cc.primary}` : '3px solid transparent',
                  }}
                >
                  <Icon style={{ width: '20px', height: '20px', color: active ? '#93C5FD' : '#64748B', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', fontWeight: active ? '600' : '500', color: active ? 'white' : '#94A3B8', flex: 1 }}>
                    {item.label}
                  </span>
                  {active && <ChevronRight style={{ width: '16px', height: '16px', color: '#93C5FD' }} />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile */}
      <div style={{ padding: '16px', borderTop: `1px solid ${cc.sidebarBorder}` }}>
        <div style={{ padding: '12px', backgroundColor: '#1E293B', borderRadius: '12px', marginBottom: '12px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: 0 }}>{admin?.name || '-'}</p>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>{admin?.email || '-'}</p>
        </div>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            backgroundColor: 'transparent',
            border: `1px solid #334155`,
            borderRadius: '8px',
            color: '#94A3B8',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          <LogOut style={{ width: '18px', height: '18px' }} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <CCAuthContext.Provider value={{ admin, loading, logout }}>
      <div style={{ minHeight: '100vh', backgroundColor: cc.pageBg, display: 'flex' }}>
        {/* Backdrop overlay for mobile/tablet */}
        {isMobileOrTablet && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 40,
            }}
          />
        )}

        {/* Sidebar */}
        <aside
          style={{
            width: '260px',
            height: '100vh',
            backgroundColor: cc.sidebarBg,
            borderRight: `1px solid ${cc.sidebarBorder}`,
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: isMobileOrTablet ? (sidebarOpen ? 0 : -260) : 0,
            top: 0,
            zIndex: 50,
            transition: 'left 0.3s ease',
          }}
        >
          {sidebarContent}
        </aside>

        {/* Content */}
        <div
          style={{
            marginLeft: isDesktop ? '260px' : 0,
            flex: 1,
            minHeight: '100vh',
            transition: 'margin-left 0.3s ease',
          }}
        >
          {/* Mobile/Tablet top header bar */}
          {isMobileOrTablet && (
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 30,
                backgroundColor: cc.headerBg,
                backdropFilter: 'blur(10px)',
                borderBottom: `1px solid ${cc.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
              }}
            >
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  backgroundColor: cc.primaryLight,
                }}
              >
                <Menu style={{ width: '22px', height: '22px', color: cc.primary }} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield style={{ width: '20px', height: '20px', color: cc.primary }} />
                <span style={{ fontSize: '15px', fontWeight: '700', color: cc.textPrimary }}>
                  GEZMA Command Center
                </span>
              </div>
            </div>
          )}

          <main style={{ padding: isMobileOrTablet ? '20px 16px' : '32px' }}>
            <CCErrorBoundary>
              {children}
            </CCErrorBoundary>
          </main>
        </div>
      </div>
    </CCAuthContext.Provider>
  );
}
