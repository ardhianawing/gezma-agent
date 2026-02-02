'use client';

import { Bell, Search, Menu, ChevronDown } from 'lucide-react';
import { LanguageToggle } from '@/components/shared/language-toggle';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const { t } = useLanguage();
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        width: '100%',
        backgroundColor: c.headerBg,
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${c.borderLight}`,
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          height: isMobile ? '64px' : '72px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 16px' : '0 32px',
          gap: '12px',
        }}
      >
        {/* Left side - Menu button + Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          {/* Mobile menu button */}
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              style={{
                padding: '10px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: c.cardBgHover,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Menu style={{ width: '20px', height: '20px', color: c.textMuted }} />
            </button>
          )}

          {/* Search - hide on mobile */}
          {!isMobile && (
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <Search
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: c.textLight,
                  pointerEvents: 'none',
                }}
              />
              <input
                type="search"
                placeholder={t.header.searchPlaceholder}
                style={{
                  width: '100%',
                  height: '48px',
                  paddingLeft: '48px',
                  paddingRight: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${c.border}`,
                  backgroundColor: c.inputBg,
                  fontSize: '14px',
                  color: c.textPrimary,
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            </div>
          )}

          {/* Mobile search icon */}
          {isMobile && (
            <button
              style={{
                padding: '10px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Search style={{ width: '20px', height: '20px', color: c.textMuted }} />
            </button>
          )}
        </div>

        {/* Right side - Theme Toggle + Language Toggle + Notifications + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', flexShrink: 0 }}>
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Toggle - compact on mobile */}
          {!isMobile && <LanguageToggle />}

          {/* Notifications */}
          <button
            style={{
              position: 'relative',
              padding: '10px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <Bell style={{ width: '20px', height: '20px', color: c.textMuted }} />
            {/* Notification dot */}
            <span
              style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: c.primary,
              }}
            />
          </button>

          {/* Divider - hide on mobile */}
          {!isMobile && (
            <div
              style={{
                height: '32px',
                width: '1px',
                backgroundColor: c.border,
                margin: '0 8px',
              }}
            />
          )}

          {/* User Menu - simplified on mobile */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0' : '12px',
              padding: isMobile ? '4px' : '8px 12px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <div
              style={{
                width: isMobile ? '36px' : '40px',
                height: isMobile ? '36px' : '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '700', color: 'white' }}>AD</span>
            </div>
            {!isMobile && (
              <>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                    Admin
                  </p>
                  <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>
                    Barokah Travel
                  </p>
                </div>
                <ChevronDown style={{ width: '16px', height: '16px', color: c.textLight }} />
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
