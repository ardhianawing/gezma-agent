'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  Plane,
  FileText,
  BarChart3,
  Building2,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  X,
  LucideIcon,
  ShoppingBag,
  MessageSquare,
  Newspaper,
  GraduationCap,
  HeadphonesIcon,
  Globe,
  Clock,
  Trophy,
  Shield,
  CheckSquare,
  Bell,
  Wallet,
  Banknote,
  CreditCard,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { useBranding } from '@/lib/contexts/branding-context';

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Menu items are defined inside the component to access translations

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isOverlay?: boolean;
}

export function Sidebar({ isOpen, onClose, isOverlay = false }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { theme, c } = useTheme();
  const { user, logout } = useAuth();
  const { branding } = useBranding();

  // === OPERASIONAL ===
  const menuItems: MenuItem[] = [
    { label: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { label: t.nav.pilgrims, href: '/pilgrims', icon: Users },
    { label: t.nav.packages, href: '/packages', icon: Package },
    { label: t.nav.trips, href: '/trips', icon: Plane },
    { label: t.nav.tasks, href: '/tasks', icon: CheckSquare },
    { label: t.nav.notifications, href: '/notifications', icon: Bell },
    { label: t.nav.documents, href: '/documents', icon: FileText },
    { label: t.nav.reports, href: '/reports', icon: BarChart3 },
    { label: t.nav.activities, href: '/activities', icon: Clock },
    { label: t.nav.gamification, href: '/gamification', icon: Trophy },
    { label: t.nav.blockchain, href: '/blockchain', icon: Shield },
    { label: t.nav.agency, href: '/agency', icon: Building2 },
  ];

  // === PLATFORM ===
  const platformItems: MenuItem[] = [
    { label: t.nav.marketplace, href: '/marketplace', icon: ShoppingBag },
    { label: t.nav.tradeCentre, href: '/trade', icon: Globe },
    { label: t.nav.forum, href: '/forum', icon: MessageSquare },
    { label: t.nav.news, href: '/news', icon: Newspaper },
    { label: t.nav.academy, href: '/academy', icon: GraduationCap },
    { label: t.nav.services, href: '/services', icon: HeadphonesIcon },
    { label: t.nav.gezmaPay, href: '/gezmapay', icon: Wallet },
    { label: t.nav.tabungan, href: '/tabungan', icon: Banknote },
    { label: t.nav.payLater, href: '/paylater', icon: CreditCard },
  ];

  // === LAINNYA ===
  const settingsItems: MenuItem[] = [
    { label: t.nav.settings, href: '/settings', icon: Settings },
    { label: t.nav.helpCenter, href: '/help', icon: HelpCircle },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={onClose}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor: active ? c.sidebarActiveItem : 'transparent',
            borderLeft: active ? `3px solid ${c.primary}` : '3px solid transparent',
          }}
        >
          <Icon
            style={{
              width: '20px',
              height: '20px',
              color: active ? c.primary : c.textMuted,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '14px',
              fontWeight: active ? '600' : '500',
              color: active ? c.primary : c.textSecondary,
              flex: 1,
            }}
          >
            {item.label}
          </span>
          {active && (
            <ChevronRight
              style={{
                width: '16px',
                height: '16px',
                color: c.primary,
              }}
            />
          )}
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {isOverlay && isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        data-tour="sidebar"
        style={{
          width: '260px',
          height: '100vh',
          backgroundColor: c.sidebarBg,
          borderRight: `1px solid ${c.sidebarBorder}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: isOverlay && !isOpen ? '-260px' : 0,
          top: 0,
          zIndex: 50,
          transition: 'left 0.3s ease, background-color 0.3s ease',
          boxShadow: isOverlay && isOpen ? '4px 0 20px rgba(0, 0, 0, 0.15)' : 'none',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: `1px solid ${c.borderLight}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }} onClick={onClose}>
            <Image
              src={
                theme === 'dark'
                  ? (branding.logoDarkUrl || '/logo-dark.png')
                  : (branding.logoLightUrl || '/logo-light.png')
              }
              alt={`${branding.appTitle || 'Gezma'} Logo`}
              width={40}
              height={40}
              style={{
                objectFit: 'contain',
                borderRadius: '10px',
              }}
              priority
            />
            <span style={{ fontSize: '20px', fontWeight: '700', color: theme === 'dark' ? 'white' : c.primary }}>
              {branding.appTitle || 'GEZMA'}
            </span>
          </Link>

          {/* Close button for mobile/tablet */}
          {isOverlay && (
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X style={{ width: '20px', height: '20px', color: c.textMuted }} />
            </button>
          )}
        </div>

        {/* Main Menu */}
        <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {/* Section 1: PLATFORM */}
          <div>
            <p
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: c.textLight,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0 12px',
                marginBottom: '8px',
              }}
            >
              {t.nav.platform}
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {platformItems.map(renderMenuItem)}
            </nav>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: c.borderLight, margin: '12px 0' }} />

          {/* Section 2: OPERASIONAL */}
          <div>
            <p
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: c.textLight,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0 12px',
                marginBottom: '8px',
              }}
            >
              {t.nav.operational}
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {menuItems.map(renderMenuItem)}
            </nav>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: c.borderLight, margin: '12px 0' }} />

          {/* Section 3: LAINNYA */}
          <div>
            <p
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: c.textLight,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0 12px',
                marginBottom: '8px',
              }}
            >
              {t.nav.other}
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {settingsItems.map(renderMenuItem)}
            </nav>
          </div>
        </div>

        {/* User Profile & Sign Out */}
        <div
          style={{
            padding: '16px',
            borderTop: `1px solid ${c.borderLight}`,
            backgroundColor: c.cardBgHover,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: c.cardBg,
              borderRadius: '12px',
              border: `1px solid ${c.border}`,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                flexShrink: 0,
              }}
            >
              {user?.agency?.name ? user.agency.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: c.textPrimary,
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.agency?.name || 'Memuat...'}
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: c.textMuted,
                  margin: '2px 0 0 0',
                }}
              >
                {user?.name || '-'}
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px',
              marginTop: '12px',
              backgroundColor: 'transparent',
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              color: c.textMuted,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut style={{ width: '18px', height: '18px' }} />
            {t.common.signOut}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
