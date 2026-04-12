'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  GraduationCap,
  ShoppingBag,
  Package,
  Landmark,
  Trophy,
  Receipt,
  Plug,
  LucideIcon,
  Bell,
} from 'lucide-react';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { CCErrorBoundary } from '@/components/cc-error-boundary';

// ─── Command Center Color Constants ──────────────────────────────────────────
// Export these so child pages can import and use them directly.
export const cc = {
  bg: '#0F172A',
  cardBg: '#1E293B',
  cardBorder: 'rgba(255,255,255,0.06)',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  accent: '#F59E0B',
  accentLight: 'rgba(245,158,11,0.1)',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  sidebarBg: '#0F172A',
  headerBg: '#1E293B',
  tableHover: 'rgba(245,158,11,0.05)',
  tableAltRow: 'rgba(255,255,255,0.02)',
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
  { label: 'Packages', href: '/command-center/packages', icon: Package },
  { label: 'Certificates', href: '/command-center/blockchain', icon: Shield },
  { label: 'Marketplace', href: '/command-center/marketplace', icon: ShoppingBag },
  { label: 'Academy', href: '/command-center/academy', icon: GraduationCap },
  { label: 'Tabungan', href: '/command-center/tabungan', icon: Landmark },
  { label: 'Gamification', href: '/command-center/gamification', icon: Trophy },
  { label: 'Billing', href: '/command-center/billing', icon: Receipt },
  { label: 'Integrations', href: '/command-center/integrations', icon: Plug },
  { label: 'Kepatuhan', href: '/command-center/compliance', icon: ShieldCheck },
  { label: 'Audit Log', href: '/command-center/audit-log', icon: ScrollText },
];

// ─── CSS injected once for animations & geometric pattern ────────────────────
const GLOBAL_STYLES = `
  @keyframes cc-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
  }

  .cc-main-content {
    animation: cc-fade-in 0.35s ease forwards;
  }

  /* Sidebar nav item hover glow */
  .cc-nav-item {
    transition: background-color 0.2s ease, border-left-color 0.2s ease, color 0.2s ease;
    position: relative;
  }
  .cc-nav-item:hover {
    background-color: rgba(245,158,11,0.07) !important;
    border-left-color: rgba(245,158,11,0.5) !important;
  }
  .cc-nav-item:hover .cc-nav-label {
    color: #ffffff !important;
  }
  .cc-nav-item:hover .cc-nav-icon {
    color: #F59E0B !important;
  }
  .cc-nav-item.active:hover {
    background-color: rgba(245,158,11,0.15) !important;
  }

  /* Mobile header hamburger button */
  .cc-hamburger:hover {
    background-color: rgba(245,158,11,0.12) !important;
  }

  /* Admin card in sidebar */
  .cc-admin-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 12px;
  }

  /* Logout button hover */
  .cc-logout-btn {
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  }
  .cc-logout-btn:hover {
    background-color: rgba(239,68,68,0.08) !important;
    border-color: rgba(239,68,68,0.4) !important;
    color: #EF4444 !important;
  }
`;

function CCStyleInjector() {
  useEffect(() => {
    const id = 'cc-global-styles';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = GLOBAL_STYLES;
      document.head.appendChild(el);
    }
    return () => {
      // Leave styles in DOM — they are shared across all CC pages
    };
  }, []);
  return null;
}

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

  // ── Login page — no sidebar ──────────────────────────────────────────────
  if (isLoginPage) {
    return (
      <CCAuthContext.Provider value={{ admin, loading, logout }}>
        <CCStyleInjector />
        <div style={{ minHeight: '100vh', backgroundColor: cc.bg }}>
          {children}
        </div>
      </CCAuthContext.Provider>
    );
  }

  if (loading) {
    return (
      <>
        <CCStyleInjector />
        <div style={{
          minHeight: '100vh',
          backgroundColor: cc.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: `3px solid ${cc.cardBorder}`,
            borderTopColor: cc.accent,
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: cc.textMuted, fontSize: '14px' }}>Memuat Command Center…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  const isActive = (href: string) => {
    if (href === '/command-center') return pathname === '/command-center';
    return pathname.startsWith(href);
  };

  // ── Sidebar CSS background: dark gradient + subtle Islamic geometric pattern
  const sidebarBgStyle: React.CSSProperties = {
    backgroundImage: [
      'linear-gradient(180deg, #0F172A 0%, #0B1120 100%)',
      'linear-gradient(30deg, rgba(245,158,11,0.04) 12%, transparent 12.5%, transparent 87%, rgba(245,158,11,0.04) 87.5%)',
      'linear-gradient(150deg, rgba(245,158,11,0.04) 12%, transparent 12.5%, transparent 87%, rgba(245,158,11,0.04) 87.5%)',
      'linear-gradient(30deg, rgba(245,158,11,0.04) 12%, transparent 12.5%, transparent 87%, rgba(245,158,11,0.04) 87.5%)',
      'linear-gradient(150deg, rgba(245,158,11,0.04) 12%, transparent 12.5%, transparent 87%, rgba(245,158,11,0.04) 87.5%)',
    ].join(', '),
    backgroundSize: 'cover, 80px 140px, 80px 140px, 80px 140px, 80px 140px',
    backgroundPosition: '0 0, 0 0, 0 0, 40px 70px, 40px 70px',
  };

  // ── Sidebar content ───────────────────────────────────────────────────────
  const sidebarContent = (
    <>
      {/* Logo / Brand */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/command-center" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '6px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 100%)',
            border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Image
              src="/images/gezma-logo.png"
              alt="Gezma Logo"
              width={32}
              height={32}
              style={{ objectFit: 'contain', borderRadius: '6px' }}
              priority
            />
          </div>
          <div>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', display: 'block', letterSpacing: '0.04em' }}>
              GEZMA
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: '600',
              color: cc.accent,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              display: 'block',
            }}>
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
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              color: cc.textSecondary,
            }}
          >
            <X style={{ width: '22px', height: '22px' }} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '16px 10px', overflowY: 'auto' }}>
        {/* Section label */}
        <p style={{
          fontSize: '10px',
          fontWeight: '600',
          color: cc.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '0 10px',
          marginBottom: '8px',
          marginTop: '4px',
        }}>
          Menu Utama
        </p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            // Add a thin divider before certain sections
            const showDivider = index === 3 || index === 7 || index === 12 || index === 14;

            return (
              <div key={item.href}>
                {showDivider && (
                  <div style={{
                    height: '1px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    margin: '8px 6px',
                  }} />
                )}
                <Link href={item.href} style={{ textDecoration: 'none' }}>
                  <div
                    className={`cc-nav-item${active ? ' active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '11px',
                      padding: '9px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: active ? cc.accentLight : 'transparent',
                      borderLeft: active ? `3px solid ${cc.accent}` : '3px solid transparent',
                      paddingLeft: '11px',
                    }}
                  >
                    <Icon
                      className="cc-nav-icon"
                      style={{
                        width: '18px',
                        height: '18px',
                        color: active ? cc.accent : cc.textMuted,
                        flexShrink: 0,
                        transition: 'color 0.2s ease',
                      }}
                    />
                    <span
                      className="cc-nav-label"
                      style={{
                        fontSize: '13.5px',
                        fontWeight: active ? '600' : '400',
                        color: active ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                        flex: 1,
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {item.label}
                    </span>
                    {active && (
                      <ChevronRight style={{ width: '14px', height: '14px', color: cc.accent, flexShrink: 0 }} />
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Admin info + sign out */}
      <div style={{
        padding: '14px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Glassmorphism admin card */}
        <div className="cc-admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${cc.accent} 0%, #D97706 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '14px',
              fontWeight: '700',
              color: '#0F172A',
            }}>
              {(admin?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '13px',
                fontWeight: '600',
                color: cc.textPrimary,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {admin?.name || '-'}
              </p>
              <p style={{
                fontSize: '11px',
                color: cc.textMuted,
                margin: '1px 0 0 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {admin?.role || 'Admin'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="cc-logout-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '9px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: cc.textSecondary,
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
          Sign Out
        </button>
      </div>
    </>
  );

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <CCAuthContext.Provider value={{ admin, loading, logout }}>
      <CCStyleInjector />
      <div style={{ minHeight: '100vh', backgroundColor: cc.bg, display: 'flex' }}>

        {/* Mobile backdrop */}
        {isMobileOrTablet && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.65)',
              zIndex: 40,
              backdropFilter: 'blur(2px)',
            }}
          />
        )}

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside
          style={{
            width: '252px',
            height: '100vh',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: isMobileOrTablet ? (sidebarOpen ? 0 : -260) : 0,
            top: 0,
            zIndex: 50,
            transition: 'left 0.3s ease',
            ...sidebarBgStyle,
          }}
        >
          {sidebarContent}
        </aside>

        {/* ── Right content column ─────────────────────────────────────── */}
        <div
          style={{
            marginLeft: isDesktop ? '252px' : 0,
            flex: 1,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            transition: 'margin-left 0.3s ease',
          }}
        >
          {/* ── Top header bar (always visible) ──────────────────────── */}
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 30,
              backgroundColor: cc.headerBg,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              height: '60px',
              flexShrink: 0,
            }}
          >
            {/* Left: hamburger (mobile) + breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isMobileOrTablet && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="cc-hamburger"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    padding: '7px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <Menu style={{ width: '20px', height: '20px', color: cc.textSecondary }} />
                </button>
              )}
              {isMobileOrTablet && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Image
                    src="/images/gezma-logo.png"
                    alt="Gezma Logo"
                    width={22}
                    height={22}
                    style={{ objectFit: 'contain', borderRadius: '5px' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '700', color: cc.textPrimary }}>
                    GEZMA
                  </span>
                  <span style={{ fontSize: '11px', color: cc.accent, fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Command Center
                  </span>
                </div>
              )}
              {isDesktop && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: cc.accent,
                    boxShadow: `0 0 6px ${cc.accent}`,
                  }} />
                  <span style={{
                    fontSize: '12px',
                    color: cc.textMuted,
                    fontWeight: '500',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    Admin Panel
                  </span>
                </div>
              )}
            </div>

            {/* Right: notifications + admin info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Notification bell */}
              <button style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                padding: '7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                position: 'relative',
              }}>
                <Bell style={{ width: '18px', height: '18px', color: cc.textSecondary }} />
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: cc.accent,
                  border: `1.5px solid ${cc.headerBg}`,
                }} />
              </button>

              {/* Admin avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${cc.accent} 0%, #D97706 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#0F172A',
                  flexShrink: 0,
                }}>
                  {(admin?.name || 'A').charAt(0).toUpperCase()}
                </div>
                {isDesktop && (
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: cc.textPrimary, margin: 0, lineHeight: 1.2 }}>
                      {admin?.name || '-'}
                    </p>
                    <p style={{ fontSize: '11px', color: cc.textMuted, margin: 0, lineHeight: 1.2 }}>
                      {admin?.role || 'Admin'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── Page content ────────────────────────────────────────── */}
          <main
            className="cc-main-content"
            style={{
              flex: 1,
              padding: isMobileOrTablet ? '20px 16px' : '28px 32px',
              backgroundColor: cc.bg,
            }}
          >
            <CCErrorBoundary>
              {children}
            </CCErrorBoundary>
          </main>
        </div>
      </div>
    </CCAuthContext.Provider>
  );
}
