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
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// === OPERASIONAL ===
const menuItems: MenuItem[] = [
  { label: 'Dasbor', href: '/', icon: LayoutDashboard },
  { label: 'Jamaah', href: '/pilgrims', icon: Users },
  { label: 'Paket', href: '/packages', icon: Package },
  { label: 'Perjalanan', href: '/trips', icon: Plane },
  { label: 'Dokumen', href: '/documents', icon: FileText },
  { label: 'Agensi', href: '/agency', icon: Building2 },
];

// === PLATFORM ===
const platformItems: MenuItem[] = [
  { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { label: 'Forum', href: '/forum', icon: MessageSquare },
  { label: 'Berita', href: '/news', icon: Newspaper },
  { label: 'Akademi', href: '/academy', icon: GraduationCap },
  { label: 'Layanan', href: '/services', icon: HeadphonesIcon },
];

// === LAINNYA ===
const settingsItems: MenuItem[] = [
  { label: 'Pengaturan', href: '/settings', icon: Settings },
  { label: 'Pusat Bantuan', href: '/help', icon: HelpCircle },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isOverlay?: boolean;
}

export function Sidebar({ isOpen, onClose, isOverlay = false }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { theme, c } = useTheme();

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
              src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
              alt="Gezma Logo"
              width={40}
              height={40}
              style={{
                objectFit: 'contain',
                borderRadius: '10px',
              }}
              priority
            />
            <span style={{ fontSize: '20px', fontWeight: '700', color: theme === 'dark' ? 'white' : c.primary }}>
              GEZMA
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
          {/* Section 1: OPERASIONAL */}
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
              Operasional
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {menuItems.map(renderMenuItem)}
            </nav>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: c.borderLight, margin: '12px 0' }} />

          {/* Section 2: PLATFORM */}
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
              Platform
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {platformItems.map(renderMenuItem)}
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
              Lainnya
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
              BT
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
                Barokah Travel
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: c.textMuted,
                  margin: '2px 0 0 0',
                }}
              >
                PPIU/123/2023
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
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
